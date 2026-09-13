import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AddCase() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  if ((session.user as any)?.role === "ADMIN") redirect("/dashboard")
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-3">
            Register New Property
          </h1>
          <p className="text-gray-600 text-lg">
            Select the type of property you want to register in the Malkhana system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Claimed Property Card */}
          <Link
            href="/cases/new"
            className="group relative bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:border-[#1e3a8a] transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#1e3a8a] mb-2 group-hover:text-[#1e40af] transition-colors">
                  Case Related Property
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Register property linked to an FIR or active case with full crime details and legal information
                </p>
              </div>

              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#1e3a8a] bg-blue-50 px-4 py-2 rounded-full group-hover:bg-[#1e3a8a] group-hover:text-white transition-all duration-300">
                Create Case & Add Property
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

          {/* Unclaimed Property Card */}
          <Link
            href="/properties/new"
            className="group relative bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:border-[#7c3aed] transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#7c3aed] mb-2 group-hover:text-[#6d28d9] transition-colors">
                  Unclaimed Property
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Register standalone property not linked to any case — unclaimed items, Kurki, or independent seizures
                </p>
              </div>

              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#7c3aed] bg-purple-50 px-4 py-2 rounded-full group-hover:bg-[#7c3aed] group-hover:text-white transition-all duration-300">
                Add Unclaimed Property
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1e3a8a] font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}