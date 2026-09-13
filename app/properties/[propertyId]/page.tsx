import Link from "next/link"
import { connectDB } from "@/lib/db"
import { Property } from "@/models/Property"
import { Case } from "@/models/Case"
import { Disposal } from "@/models/Disposal"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import LinkPropertyForm from "@/components/LinkPropertyForm"

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ propertyId: string }>
}) {
  const { propertyId } = await params

  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  await connectDB()

  const property = await Property.findById(propertyId).lean()

  if (!property) {
    redirect("/properties")
  }

  // Check authorization
  const userId = (session.user as any).id
  const userRole = (session.user as any).role

  if (
    userRole !== "ADMIN" &&
    property.currentOfficer?.toString() !== userId
  ) {
    redirect("/properties")
  }

  // Fetch disposal record if property is disposed
  let disposal = null;
  if (property.status === "DISPOSED") {
    disposal = await Disposal.findOne({ propertyId: property._id }).lean();
  }

  // Get available cases for linking (only if property is independent)
  let availableCases: Array<{ _id: string; caseNumber: string }> = []
  if (!property.caseId) {
    let caseFilter: any = {}
    if (userRole !== "ADMIN") {
      caseFilter.reportingOfficer = userId
    }
    const cases = await Case.find(caseFilter)
      .select("_id caseNumber")
      .lean()

    // Convert ObjectIds to strings for serialization to client component
    availableCases = cases.map((c: any) => ({
      _id: c._id.toString(),
      caseNumber: c.caseNumber,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-[#1e3a8a] transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link
              href="/dashboard"
              className="hover:text-[#1e3a8a] transition-colors"
            >
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <Link
              href="/properties"
              className="hover:text-[#1e3a8a] transition-colors"
            >
              Properties
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#1e3a8a] font-semibold">
              {property.propertyTag}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-2">
              Property Details
            </h2>
            <p className="text-gray-600 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              View and manage property information
            </p>
            <div className="mt-2">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${property.status === "DISPOSED"
                ? "bg-[#28a745] text-white"
                : "bg-[#ffc107] text-[#856404]"
                }`}>
                {property.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Images */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-[#1e3a8a] mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Property Images ({(property.itemImage as string[]).length})
              </h3>

              {(property.itemImage as string[]).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(property.itemImage as string[]).map((imageUrl, index) => (
                    <div key={imageUrl} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-48 object-cover border-2 border-gray-200 rounded-lg shadow-md"
                      />
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-sm px-3 py-1 rounded font-semibold">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No images available</p>
              )}
            </div>

            {/* Property Information */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-[#1e3a8a] mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Property Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Property Tag
                  </label>
                  <p className="text-lg font-bold text-[#1e3a8a]">
                    {property.propertyTag}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${property.status === "DISPOSED"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-[#1e3a8a]"
                    }`}>
                    {property.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Property Type
                  </label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${property.propertyType === "CASE_RELATED"
                    ? "bg-blue-100 text-blue-700"
                    : property.propertyType === "KURKI"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-purple-100 text-purple-700"
                    }`}>
                    {property.propertyType === "CASE_RELATED"
                      ? "Case Related"
                      : property.propertyType === "KURKI"
                        ? "Kurki"
                        : "Unclaimed"}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <p className="text-gray-700">{property.category}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nature of Property
                  </label>
                  <p className="text-gray-700">{property.natureOfProperty}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Belonging To
                  </label>
                  <p className="text-gray-700">
                    {property.belongingTo === "ACCUSED"
                      ? "Accused"
                      : property.belongingTo === "COMPLAINANT"
                        ? "Complainant"
                        : "Unknown"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    GD Number
                  </label>
                  <p className="text-gray-700">
                    {property.gdNumber || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    GD Date
                  </label>
                  <p className="text-gray-700">
                    {property.gdDate
                      ? new Date(property.gdDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Date of Seizure
                  </label>
                  <p className="text-gray-700">
                    {property.seizureDate
                      ? new Date(property.seizureDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Quantity
                  </label>
                  <p className="text-gray-700">
                    {property.quantity} {property.units}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Storage Location
                  </label>
                  <p className="text-gray-700">{property.storageLocation}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {property.description}
                  </p>
                </div>

                {property.createdAt && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Registered Date
                    </label>
                    <p className="text-gray-700">
                      {new Date(property.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chain of Custody & Disposal Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href={`/properties/${property._id}/custody`}
                className="bg-white border-2 border-[#1e3a8a] p-6 rounded-lg hover:bg-[#f8f9fa] transition-colors group shadow-lg"
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

              {property.status !== "DISPOSED" && (session.user as any)?.role !== "ADMIN" && (
                <Link
                  href={`/properties/${property._id}/disposal`}
                  className="bg-white border-2 border-[#dc3545] p-6 rounded-lg hover:bg-[#fff5f5] transition-colors group shadow-lg"
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

            {/* Disposal Details (when disposed) */}
            {property.status === "DISPOSED" && (
              <div className="space-y-6">
                <div className="bg-[#d4edda] border-l-4 border-[#28a745] p-4 rounded-lg">
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
                  <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg">
                    <div className="bg-[#28a745] text-white px-6 py-4 rounded-t-lg">
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

            {/* Under Custody banner */}
            {property.status !== "DISPOSED" && (
              <div className="bg-[#fff3cd] border-l-4 border-[#ffc107] p-4 rounded-lg">
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

          {/* Sidebar - Link to Case */}
          <div className="space-y-6">
            {!property.caseId && availableCases.length > 0 ? (
              <LinkPropertyForm
                propertyId={propertyId}
                availableCases={availableCases}
              />
            ) : property.caseId ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Linked to Case
                </h3>
                <p className="text-green-700 font-semibold">
                  This property is linked to a case
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-bold text-yellow-700 mb-2">
                  No Cases Available
                </h3>
                <p className="text-yellow-700 text-sm">
                  Create a case first before linking this property to one.
                </p>
                <Link
                  href="/cases/new"
                  className="inline-block mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition"
                >
                  Create New Case
                </Link>
              </div>
            )}

            {/* QR Code Section */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-bold text-[#1e3a8a] mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href={`/properties/${property._id}/qr`}
                  className="w-full block text-center bg-[#1e3a8a] text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-[#1e40af] transition"
                >
                  Print QR Code
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
