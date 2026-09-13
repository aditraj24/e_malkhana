import { connectDB } from "@/lib/db"
import { Property } from "@/models/Property"
import { notFound } from "next/navigation"
import QRPrintClient from "./qr-print-client"
import Link from "next/link"

type Props = {
  params: Promise<{
    propertyId: string
  }>
}

export default async function PropertyQRPage({ params }: Props) {
  await connectDB()

  const { propertyId } = await params

  const property = await Property.findById(propertyId)
  if (!property) {
    notFound()
  }

  const caseId = property.caseId?.toString() || ""
  
  // Determine redirect URL based on whether property is linked to a case
  const redirectUrl = caseId
    ? `/cases/${caseId}/properties/${propertyId}`
    : `/properties/${propertyId}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Print-friendly version */}
      <div className="print:block hidden">
        <div className="flex flex-col items-center justify-center p-8 bg-white">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-[#1e3a8a] mb-2">e-Malkhana</h1>
            <p className="text-gray-600">Digital Evidence Management System</p>
          </div>

          <div className="border-4 border-[#1e3a8a] p-6 rounded-xl">
            <img
              src={property.qrCode ?? undefined}
              alt="QR Code"
              className="w-64 h-64"
            />
          </div>

          <div className="mt-6 space-y-2 text-center">
            <h2 className="text-2xl font-bold text-[#1e3a8a]">Property Details</h2>
            <div className="space-y-1 text-lg">
              <p><strong>Category:</strong> {property.category}</p>
              <p><strong>Nature:</strong> {property.natureOfProperty}</p>
              <p><strong>Location:</strong> {property.storageLocation}</p>
              <p><strong>Status:</strong> {property.status}</p>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500 text-center">
            <p>Generated on: {new Date().toLocaleString('en-IN')}</p>
            <p>© 2025 Government of India</p>
          </div>
        </div>
      </div>

      {/* Screen version */}
      <div className="print:hidden">
        <div className="bg-white border-b-2 border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Link href="/dashboard" className="hover:text-[#1e3a8a] transition-colors">Dashboard</Link>
                <span className="mx-2">/</span>
                {caseId ? (
                  <>
                    <Link href={`/cases/${caseId}`} className="hover:text-[#1e3a8a] transition-colors">Case Details</Link>
                    <span className="mx-2">/</span>
                  </>
                ) : (
                  <>
                    <Link href="/properties" className="hover:text-[#1e3a8a] transition-colors">Properties</Link>
                    <span className="mx-2">/</span>
                  </>
                )}
                <span className="text-[#1e3a8a] font-semibold">QR Code</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-8 p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#1e3a8a] mb-2 flex items-center justify-center gap-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Property QR Code
            </h1>
            <p className="text-gray-600">Scan to view property details</p>
          </div>

          <div className="bg-white border-4 border-[#1e3a8a] p-8 rounded-xl shadow-2xl">
            <img
              src={property.qrCode ?? undefined}
              alt="QR Code"
              className="w-80 h-80"
            />
          </div>

          <div className="bg-white border-2 border-gray-300 p-6 rounded-xl shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-[#1e3a8a] mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Property Details
            </h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-600 min-w-24">Category:</span>
                <span className="font-medium">{property.category}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-600 min-w-24">Nature:</span>
                <span className="font-medium">{property.natureOfProperty}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-600 min-w-24">Location:</span>
                <span className="font-medium">{property.storageLocation}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-600 min-w-24">Status:</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${property.status === "DISPOSED"
                    ? "bg-[#28a745] text-white"
                    : "bg-[#ffc107] text-[#856404]"
                  }`}>
                  {property.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <QRPrintClient />
            <Link
              href={redirectUrl}
              className="bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e3a8a] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
            >
              ← Back to Property
            </Link>
          </div>

          <div className="mt-4 bg-[#e7f3ff] border-l-4 border-[#1e3a8a] p-5 rounded-lg shadow-md max-w-2xl">
            <div className="flex items-start">
              <svg className="w-7 h-7 text-[#1e3a8a] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-bold text-[#1e3a8a] mb-2 text-lg">QR Code Usage</h4>
                <ul className="text-sm text-gray-700 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-[#1e3a8a] font-bold">•</span>
                    <span>Print this QR code and attach it to the physical evidence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1e3a8a] font-bold">•</span>
                    <span>Scan the code to quickly access property details and custody logs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1e3a8a] font-bold">•</span>
                    <span>Ensure the QR code remains intact and legible throughout custody</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}