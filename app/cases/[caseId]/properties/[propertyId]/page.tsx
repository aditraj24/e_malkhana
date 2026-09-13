import { connectDB } from "@/lib/db"
import { Property } from "@/models/Property"
import { Case } from "@/models/Case"
import { Disposal } from "@/models/Disposal"
import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

type Props = {
  params: Promise<{
    caseId: string
    propertyId: string
  }>
}

export default async function PropertyDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const { caseId, propertyId } = await params

  await connectDB()

  const property = await Property.findById(propertyId)
  if (!property) {
    notFound()
  }

  const caseData = await Case.findById(caseId)
  if (!caseData) {
    notFound()
  }

  // Fetch disposal record if property is disposed
  let disposal = null;
  if (property.status === "DISPOSED") {
    disposal = await Disposal.findOne({ propertyId: property._id }).lean();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#1e3a8a]">Property Details</h2>
            <p className="text-gray-600 mt-1">
              Case {caseData.crimeNumber}/{caseData.crimeYear} - {typeof caseData.policeStation === 'object' ? caseData.policeStation?.name : caseData.policeStation}
            </p>
            <div className="mt-2">
              <span className={`px-3 py-1 text-sm font-semibold ${property.status === "DISPOSED"
                ? "bg-[#28a745] text-white"
                : "bg-[#ffc107] text-[#856404]"
                }`}>
                {property.status}
              </span>
            </div>
          </div>

          <Link
            href={`/cases/${caseId}`}
            className="bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] px-6 py-2 font-semibold hover:bg-[#f8f9fa] transition-colors"
          >
            ← Back to Case
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white border-2 border-gray-300">
            <div className="bg-[#1e3a8a] text-white px-6 py-4">
              <h3 className="text-xl font-bold">Property Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#f8f9fa] border-l-4 border-[#1e3a8a] p-4">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Category</p>
                  <p className="text-lg font-bold text-[#1e3a8a]">{property.category}</p>
                </div>

                <div className="bg-[#f8f9fa] border-l-4 border-[#1e3a8a] p-4">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Belonging To</p>
                  <p className="text-lg font-bold text-[#1e3a8a]">{property.belongingTo}</p>
                </div>

                <div className="bg-[#f8f9fa] border-l-4 border-[#1e3a8a] p-4">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Nature of Property</p>
                  <p className="text-lg font-bold text-[#1e3a8a]">{property.natureOfProperty}</p>
                </div>

                <div className="bg-[#f8f9fa] border-l-4 border-[#1e3a8a] p-4">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Quantity</p>
                  <p className="text-lg font-bold text-[#1e3a8a]">
                    {property.quantity} {property.units || 'units'}
                  </p>
                </div>

                <div className="bg-[#f8f9fa] border-l-4 border-[#1e3a8a] p-4">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Storage Location</p>
                  <p className="text-lg font-bold text-[#1e3a8a]">{property.storageLocation}</p>
                </div>

                <div className="bg-[#f8f9fa] border-l-4 border-[#1e3a8a] p-4">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Current Status</p>
                  <p className={`text-lg font-bold ${property.status === "DISPOSED" ? "text-[#28a745]" : "text-[#ffc107]"
                    }`}>
                    {property.status}
                  </p>
                </div>
              </div>

              {property.description && (
                <div className="bg-[#f8f9fa] border-l-4 border-[#1e3a8a] p-4">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Description</p>
                  <p className="text-gray-900">{property.description}</p>
                </div>
              )}

              {property.lastMovementAt && (
                <div className="bg-[#f8f9fa] border-l-4 border-[#1e3a8a] p-4">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Last Movement</p>
                  <p className="text-gray-900">
                    {new Date(property.lastMovementAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {property.itemImage && property.itemImage.length > 0 && (
              <div className="bg-white border-2 border-gray-300">
                <div className="bg-[#1e3a8a] text-white px-6 py-4">
                  <h3 className="text-xl font-bold">
                    Property Images ({Array.isArray(property.itemImage) ? property.itemImage.length : 1})
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {(Array.isArray(property.itemImage)
                    ? property.itemImage
                    : [property.itemImage]
                  ).map((img: string, idx: number) => (
                    <div key={idx} className="relative">
                      <img
                        src={img}
                        alt={`Property image ${idx + 1}`}
                        className="w-full border-2 border-gray-300 object-cover max-h-64 rounded"
                      />
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {idx + 1} / {Array.isArray(property.itemImage) ? property.itemImage.length : 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {property.qrCode && (
              <div className="bg-white border-2 border-gray-300">
                <div className="bg-[#1e3a8a] text-white px-6 py-4">
                  <h3 className="text-xl font-bold">QR Code</h3>
                </div>
                <div className="p-6 text-center space-y-4">
                  <img
                    src={property.qrCode}
                    alt="QR Code"
                    className="mx-auto border-2 border-gray-300 p-2 bg-white"
                  />
                  <Link
                    href={`/properties/${property._id}/qr`}
                    className="inline-block bg-[#1e3a8a] text-white px-4 py-2 font-semibold hover:bg-[#1e40af] transition-colors"
                  >
                    Print QR Code
                  </Link>
                  <p className="text-xs text-gray-500">
                    Scan to view property details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" data-no-print="true">
          <Link
            href={`/cases/${caseId}/properties/${propertyId}/custody`}
            className="bg-white border-2 border-[#1e3a8a] p-6 hover:bg-[#f8f9fa] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1e3a8a] rounded-full flex items-center justify-center group-hover:bg-[#1e40af] transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1e3a8a]">Chain of Custody</h3>
                  <p className="text-sm text-gray-600">View movement history</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {property.status !== "DISPOSED" && session.user?.role !== "ADMIN" && (
            <Link
              href={`/cases/${caseId}/properties/${propertyId}/disposal`}
              className="bg-white border-2 border-[#dc3545] p-6 hover:bg-[#fff5f5] transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#dc3545] rounded-full flex items-center justify-center group-hover:bg-[#c82333] transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#dc3545]">Property Disposal</h3>
                    <p className="text-sm text-gray-600">Mark as disposed</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          )}
        </div>

        {property.status === "DISPOSED" && (
          <div className="space-y-6">
            <div className="bg-[#d4edda] border-l-4 border-[#28a745] p-4">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-[#155724] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-bold text-[#155724] mb-1">Property Disposed</h4>
                  <p className="text-sm text-[#155724]">
                    This property has been disposed as per court orders or department procedures.
                  </p>
                </div>
              </div>
            </div>

            {disposal && (
              <div className="bg-white border-2 border-gray-300">
                <div className="bg-[#28a745] text-white px-6 py-4">
                  <h3 className="text-xl font-bold">Disposal Details</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#f8f9fa] border-l-4 border-[#28a745] p-4">
                      <p className="text-sm font-semibold text-gray-600 mb-1">Disposal Type</p>
                      <p className="text-lg font-bold text-[#28a745]">{(disposal as any).disposalType}</p>
                    </div>
                    <div className="bg-[#f8f9fa] border-l-4 border-[#28a745] p-4">
                      <p className="text-sm font-semibold text-gray-600 mb-1">Court Order Reference</p>
                      <p className="text-lg font-bold text-[#28a745]">{(disposal as any).courtOrderReference}</p>
                    </div>
                    <div className="bg-[#f8f9fa] border-l-4 border-[#28a745] p-4">
                      <p className="text-sm font-semibold text-gray-600 mb-1">Disposal Date</p>
                      <p className="text-lg font-bold text-[#28a745]">{new Date((disposal as any).disposalDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="bg-[#f8f9fa] border-l-4 border-[#28a745] p-4">
                      <p className="text-sm font-semibold text-gray-600 mb-1">Disposal Authority</p>
                      <p className="text-lg font-bold text-[#28a745]">{(disposal as any).disposalAuthority}</p>
                    </div>
                  </div>
                  {(disposal as any).remarks && (
                    <div className="bg-[#f8f9fa] border-l-4 border-[#28a745] p-4">
                      <p className="text-sm font-semibold text-gray-600 mb-2">Remarks</p>
                      <p className="text-gray-900">{(disposal as any).remarks}</p>
                    </div>
                  )}

                  {/* Disposal Photos & Documents */}
                  {((disposal as any).disposalPhoto || (disposal as any).courtOrderPdf) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {(disposal as any).disposalPhoto && (
                        <div className="bg-[#f8f9fa] border-2 border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-[#28a745] text-white px-4 py-2">
                            <p className="text-sm font-bold">Disposal Photo</p>
                          </div>
                          <div className="p-3">
                            <a href={(disposal as any).disposalPhoto} target="_blank" rel="noopener noreferrer">
                              <img
                                src={(disposal as any).disposalPhoto}
                                alt="Disposal photo"
                                className="w-full object-cover max-h-64 border border-gray-300 rounded hover:opacity-90 transition-opacity cursor-pointer"
                              />
                            </a>
                          </div>
                        </div>
                      )}
                      {(disposal as any).courtOrderPdf && (
                        <div className="bg-[#f8f9fa] border-2 border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-[#1e3a8a] text-white px-4 py-2">
                            <p className="text-sm font-bold">Court Order (PDF)</p>
                          </div>
                          <div className="p-3 flex flex-col items-center justify-center py-6">
                            <svg className="w-12 h-12 text-[#dc3545] mb-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                            <a
                              href={(disposal as any).courtOrderPdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[#1e3a8a] text-white px-4 py-2 rounded font-semibold hover:bg-[#1e40af] transition-colors text-sm"
                            >
                              View Court Order PDF ↗
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {property.status !== "DISPOSED" && (
          <div className="bg-[#fff3cd] border-l-4 border-[#ffc107] p-4">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-[#856404] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-bold text-[#856404] mb-1">Under Custody</h4>
                <p className="text-sm text-[#856404]">
                  This property is currently under police custody. Ensure proper chain of custody is maintained for all movements.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}