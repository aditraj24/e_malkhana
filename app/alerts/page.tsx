import { connectDB } from "@/lib/db"
import { Case } from "@/models/Case"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function AlertsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  await connectDB()

  const now = new Date()
  const threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const cases = await Case.find({
    status: "PENDING",
    createdAt: { $lt: threshold }
  }).sort({ createdAt: 1 })

  const daysOld = (date: Date) => {
    const diff = now.getTime() - new Date(date).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50">
      <div className="px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-4xl font-bold text-[#dc3545] mb-2 flex items-center gap-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Long Pending Cases
            </h2>
            <p className="text-gray-600 mt-2 ml-1">Cases pending for more than 7 days require immediate attention</p>
          </div>

          <Link
            href="/dashboard"
            className="bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e3a8a] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border-2 border-[#dc3545] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-[#dc3545] rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Alerts</p>
            </div>
            <p className="text-5xl font-bold text-[#dc3545] mb-2">{cases.length}</p>
            <p className="text-sm text-gray-500">Cases pending over 7 days</p>
          </div>

          <div className="bg-white border-2 border-[#ffc107] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-[#ffc107] rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Oldest Case</p>
            </div>
            <p className="text-5xl font-bold text-[#ffc107] mb-2">
              {cases.length > 0 ? daysOld(cases[0].createdAt) : 0}
            </p>
            <p className="text-sm text-gray-500">Days pending</p>
          </div>

          <div className="bg-white border-2 border-[#ff6b6b] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-[#ff6b6b] rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Critical</p>
            </div>
            <p className="text-5xl font-bold text-[#ff6b6b] mb-2">
              {cases.filter((c: any) => daysOld(c.createdAt) > 30).length}
            </p>
            <p className="text-sm text-gray-500">Over 30 days old</p>
          </div>
        </div>

        {cases.length > 0 && (
          <div className="mb-8 bg-[#f8d7da] border-l-4 border-[#dc3545] p-5 rounded-lg shadow-md">
            <div className="flex items-start">
              <svg className="w-7 h-7 text-[#721c24] mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-bold text-[#721c24] mb-2 text-lg">Urgent Action Required</h4>
                <p className="text-sm text-[#721c24]">
                  These cases have been pending for an extended period. Please review and take necessary action to expedite processing,
                  update chain of custody, or proceed with disposal as per court orders.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border-2 border-gray-300 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#dc3545] text-white px-6 py-5">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Pending Cases
            </h3>
            <p className="text-sm text-red-100 mt-1">{cases.length} cases require attention</p>
          </div>

          {cases.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-20 h-20 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 font-semibold mb-2 text-lg">No alerts at the moment</p>
              <p className="text-sm text-gray-500">All cases are being processed within the expected timeframe</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {cases.map((c: any) => {
                const days = daysOld(c.createdAt)
                const urgency = days > 30 ? "critical" : days > 14 ? "high" : "medium"

                return (
                  <Link
                    key={c._id}
                    href={`/cases/${c._id}`}
                    className="block p-6 hover:bg-red-50 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="text-xl font-bold text-[#1e3a8a] group-hover:text-[#1e40af]">
                            Crime {c.crimeNumber}/{c.crimeYear}
                          </h4>
                          <span className={`px-4 py-1.5 text-xs font-bold rounded-full shadow-sm ${urgency === "critical"
                            ? "bg-[#dc3545] text-white"
                            : urgency === "high"
                              ? "bg-[#ff6b6b] text-white"
                              : "bg-[#ffc107] text-[#856404]"
                            }`}>
                            {urgency === "critical" ? "CRITICAL" : urgency === "high" ? "HIGH PRIORITY" : "MODERATE"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{typeof c.policeStation === 'object' ? c.policeStation?.name : c.policeStation}</span>
                          </div>

                          {c.investigatingOfficerName && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>IO: {c.investigatingOfficerName}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#dc3545]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold text-[#dc3545]">Pending: {days} days</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Created: {new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                          </div>

                          {c.firDate && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>FIR: {new Date(c.firDate).toLocaleDateString('en-IN')}</span>
                            </div>
                          )}

                          {c.section && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <span>Section: {c.section}</span>
                            </div>
                          )}
                        </div>

                        <div className={`p-4 border-l-4 rounded-r-lg ${urgency === "critical"
                          ? "bg-[#fff5f5] border-[#dc3545]"
                          : urgency === "high"
                            ? "bg-[#fff9f9] border-[#ff6b6b]"
                            : "bg-[#fff9e6] border-[#ffc107]"
                          }`}>
                          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            {urgency === "critical" && (
                              <>
                                <svg className="w-5 h-5 text-[#dc3545]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Critical: This case requires immediate attention
                              </>
                            )}
                            {urgency === "high" && (
                              <>
                                <svg className="w-5 h-5 text-[#ff6b6b]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                                High Priority: Action needed soon
                              </>
                            )}
                            {urgency === "medium" && (
                              <>
                                <svg className="w-5 h-5 text-[#ffc107]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                Moderate: Please review this case
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <svg className="w-6 h-6 text-gray-400 shrink-0 ml-4 group-hover:text-[#1e3a8a] group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-6 bg-[#e7f3ff] border-l-4 border-[#1e3a8a] p-5 rounded-lg shadow-md">
          <div className="flex items-start">
            <svg className="w-7 h-7 text-[#1e3a8a] mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-bold text-[#1e3a8a] mb-2 text-lg">Recommended Actions</h4>
              <ul className="text-sm text-gray-700 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>Review case status and update chain of custody records</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>Contact investigating officers for pending cases</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>Check if court orders are available for disposal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>Ensure all property documentation is complete</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>Escalate critical cases to senior officers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}