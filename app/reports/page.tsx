import { connectDB } from "@/lib/db"
import { Case } from "@/models/Case"
import { Property } from "@/models/Property"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import ReportPrintClient from "./report-print-client"

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  await connectDB()

  const cases = await Case.find().sort({ createdAt: -1 })
  const properties = await Property.find()

  const caseStats = cases.map((caseItem: any) => {
    const caseProperties = properties.filter(
      (p: any) => p.caseId && p.caseId.toString() === caseItem._id.toString()
    )
    return {
      ...caseItem.toObject(),
      totalProperties: caseProperties.length,
      pendingProperties: caseProperties.filter((p: any) => p.status !== "DISPOSED").length,
      disposedProperties: caseProperties.filter((p: any) => p.status === "DISPOSED").length
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 print:bg-white">
      <div className="px-4 py-8 print:py-4">
        <div className="mb-8 flex items-start justify-between print:mb-4">
          <div>
            <h2 className="text-4xl font-bold text-[#1e3a8a] mb-2 flex items-center gap-3 print:text-2xl">
              <svg className="w-10 h-10 print:w-6 print:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Case Reports
            </h2>
            <p className="text-gray-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              View and print detailed case reports
            </p>
          </div>

          <div className="flex gap-3 print:hidden">
            <Link
              href="/dashboard"
              className="bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e3a8a] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              ← Dashboard
            </Link>
            <ReportPrintClient />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:mb-4 print:gap-4">
          <div className="bg-white border-2 border-[#1e3a8a] p-6 rounded-xl shadow-lg text-center print:p-3 print:shadow-none print:border">
            <p className="text-gray-600 font-semibold mb-2 text-sm print:text-xs">Total Cases</p>
            <p className="text-5xl font-bold text-[#1e3a8a] print:text-3xl">{cases.length}</p>
          </div>

          <div className="bg-white border-2 border-[#28a745] p-6 rounded-xl shadow-lg text-center print:p-3 print:shadow-none print:border">
            <p className="text-gray-600 font-semibold mb-2 text-sm print:text-xs">Total Properties</p>
            <p className="text-5xl font-bold text-[#28a745] print:text-3xl">{properties.length}</p>
          </div>

          <div className="bg-white border-2 border-[#ffc107] p-6 rounded-xl shadow-lg text-center print:p-3 print:shadow-none print:border">
            <p className="text-gray-600 font-semibold mb-2 text-sm print:text-xs">Disposed Properties</p>
            <p className="text-5xl font-bold text-[#ffc107] print:text-3xl">
              {properties.filter((p: any) => p.status === "DISPOSED").length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border-2 border-gray-300 rounded-xl shadow-lg overflow-hidden print:shadow-none print:border">
          <div className="bg-[#1e3a8a] text-white px-6 py-5 print:py-3">
            <h3 className="text-2xl font-bold flex items-center gap-2 print:text-lg">
              <svg className="w-6 h-6 print:w-5 print:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              All Cases Summary
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="px-6 py-4 text-left font-bold text-gray-700 print:px-3 print:py-2 print:text-xs">Crime Number</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700 print:px-3 print:py-2 print:text-xs">Police Station</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700 print:px-3 print:py-2 print:text-xs">Year</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-700 print:px-3 print:py-2 print:text-xs">Total</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-700 print:px-3 print:py-2 print:text-xs">Pending</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-700 print:px-3 print:py-2 print:text-xs">Disposed</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700 print:px-3 print:py-2 print:text-xs">Status</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700 print:hidden">Action</th>
                </tr>
              </thead>
              <tbody>
                {caseStats.map((caseItem: any, idx: number) => (
                  <tr key={caseItem._id} className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 font-bold text-[#1e3a8a] print:px-3 print:py-2 print:text-xs">
                      {caseItem.crimeNumber}/{caseItem.crimeYear}
                    </td>
                    <td className="px-6 py-4 text-gray-700 print:px-3 print:py-2 print:text-xs">{typeof caseItem.policeStation === 'object' ? caseItem.policeStation?.name : caseItem.policeStation}</td>
                    <td className="px-6 py-4 text-gray-700 print:px-3 print:py-2 print:text-xs">{caseItem.crimeYear}</td>
                    <td className="px-6 py-4 text-center font-bold text-[#1e3a8a] print:px-3 print:py-2 print:text-xs">{caseItem.totalProperties}</td>
                    <td className="px-6 py-4 text-center font-bold text-[#ffc107] print:px-3 print:py-2 print:text-xs">{caseItem.pendingProperties}</td>
                    <td className="px-6 py-4 text-center font-bold text-[#28a745] print:px-3 print:py-2 print:text-xs">{caseItem.disposedProperties}</td>
                    <td className="px-6 py-4 print:px-3 print:py-2">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${caseItem.status === "PENDING"
                          ? "bg-[#ffc107] text-[#856404]"
                          : "bg-[#28a745] text-white"
                        } print:px-2 print:py-1`}>
                        {caseItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 print:hidden">
                      <Link
                        href={`/cases/${caseItem._id}`}
                        className="text-[#1e3a8a] font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        View
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}