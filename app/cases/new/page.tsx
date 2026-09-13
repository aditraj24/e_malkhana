import Link from "next/link"
import CaseForm from "@/components/CaseForm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function NewCasePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  if ((session.user as any)?.role === "ADMIN") redirect("/dashboard")
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-[#1e3a8a] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/dashboard" className="hover:text-[#1e3a8a] transition-colors">Dashboard</Link>
            <span className="mx-2">/</span>
            <span className="text-[#1e3a8a] font-semibold">New Case</span>
          </div>
        </div>
      </div>

      <div className="h-full py-4">
        <div className="w-full">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-[#1e3a8a] mb-2 flex items-center gap-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Register New Case
            </h2>
            <p className="text-gray-600 ml-1 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Fill in the case details to create a new entry in the system
            </p>
          </div>

          <CaseForm />
        </div>
      </div>
    </div>
  )
}