import {connectDB} from "@/lib/db"
import {Case} from "@/models/Case"
import {Property} from "@/models/Property"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import ManageCasesClient from "./manage-cases-client"

export default async function ManageCasesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  await connectDB()

  const userId = (session.user as any).id
  const userRole = (session.user as any).role

  let cases
  let properties
  if (userRole === "ADMIN") {
    cases = await Case.find().sort({ createdAt: -1 })
    properties = await Property.find()
  } else {
    const ownedCases = await Case.find({ reportingOfficer: userId }).select("_id").lean()
    const transferredProps = await Property.find({ currentOfficer: userId }).select("caseId").lean()
    const caseIdSet = new Set([
      ...ownedCases.map((c: any) => c._id.toString()),
      ...transferredProps
        .filter((p: any) => p.caseId !== null)
        .map((p: any) => p.caseId.toString()),
    ])
    const caseIds = Array.from(caseIdSet)
    cases = await Case.find({ _id: { $in: caseIds } }).sort({ createdAt: -1 })
    properties = await Property.find({ caseId: { $in: caseIds } })
  }

  const caseData = cases.map((caseItem: any) => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-4xl font-bold text-[#1e3a8a] mb-2 flex items-center gap-3">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Manage Entries
              </h2>
              <p className="text-gray-600 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Search cases, view details, properties, and print information
              </p>
            </div>

            <Link
              href="/dashboard"
              className="bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e3a8a] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              ← Dashboard
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white border-2 border-[#1e3a8a] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-[#1e3a8a] rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Cases</p>
              </div>
              <p className="text-4xl font-bold text-[#1e3a8a]">{cases.length}</p>
              <p className="text-sm text-gray-500 mt-1">Registered in system</p>
            </div>

            <div className="bg-white border-2 border-[#28a745] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-[#28a745] rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Properties</p>
              </div>
              <p className="text-4xl font-bold text-[#28a745]">{properties.length}</p>
              <p className="text-sm text-gray-500 mt-1">Evidence items</p>
            </div>

            <div className="bg-white border-2 border-[#ffc107] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-[#ffc107] rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active Search</p>
              </div>
              <p className="text-4xl font-bold text-[#ffc107]">Ready</p>
              <p className="text-sm text-gray-500 mt-1">Search system online</p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-300 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-[#1e3a8a] mb-2 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search & Filter
          </h3>
          <p className="text-gray-600 mb-6">Use the form below to search for specific cases</p>

          <ManageCasesClient />
        </div>

        <div className="mt-6 bg-[#e7f3ff] border-l-4 border-[#1e3a8a] p-5 rounded-lg shadow-md">
          <div className="flex items-start">
            <svg className="w-7 h-7 text-[#1e3a8a] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-bold text-[#1e3a8a] mb-2 text-lg">Search Tips</h4>
              <ul className="text-sm text-gray-700 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>Search by crime number, year, police station, or investigating officer name</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>Use the status filter to view only pending or disposed cases</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>Click on any case to expand and view associated properties</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>Download PDF reports directly from the search results</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}