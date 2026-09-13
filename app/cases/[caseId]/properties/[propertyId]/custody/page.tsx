"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import CustodyForm from "@/components/CustodyForm";
import CustodyLogsList from "@/components/CustodyLogsList";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function CustodyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.propertyId as string;
  const caseId = params.caseId as string;
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLogs() {
    setLoading(true);
    const res = await fetch(`/api/custody?propertyId=${propertyId}`, {
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      setLogs(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (propertyId) {
      fetchLogs();
    }
  }, [propertyId]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Link
              href="/dashboard"
              className="hover:text-[#1e3a8a] transition-colors"
            >
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/cases/${caseId}`}
              className="hover:text-[#1e3a8a] transition-colors"
            >
              Case Details
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/cases/${caseId}/properties/${propertyId}`}
              className="hover:text-[#1e3a8a] transition-colors"
            >
              Property
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#1e3a8a] font-semibold">
              Chain of Custody
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#1e3a8a] mb-2 flex items-center gap-3">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Chain of Custody
            </h1>
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              Track property movements and custody transfers
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e3a8a] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {!isAdmin && (
            <div className="lg:col-span-1">
              <div className="bg-white border-2 border-gray-300 rounded-xl shadow-lg overflow-hidden sticky top-4">
                <div className="bg-[#1e3a8a] text-white px-6 py-5">
                  <h3 className="text-xl font-bold flex items-center gap-2">
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Custody Entry
                  </h3>
                  <p className="text-sm text-blue-200 mt-1">
                    Record property movement
                  </p>
                </div>
                <div className="p-6">
                  <CustodyForm propertyId={propertyId} onSuccess={fetchLogs} />
                </div>
              </div>
            </div>
          )}

          <div className={isAdmin ? "lg:col-span-3" : "lg:col-span-2"}>
            <div className="bg-white border-2 border-gray-300 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-[#1e3a8a] text-white px-6 py-5">
                <h3 className="text-xl font-bold flex items-center gap-2">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Custody History
                </h3>
                <p className="text-sm text-blue-200 mt-1">
                  {logs.length} {logs.length === 1 ? "entry" : "entries"}{" "}
                  recorded
                </p>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#1e3a8a]"></div>
                    <p className="text-gray-600 mt-4">
                      Loading custody logs...
                    </p>
                  </div>
                ) : (
                  <CustodyLogsList logs={logs} />
                )}
              </div>
            </div>

            <div className="mt-6 bg-[#e7f3ff] border-l-4 border-[#1e3a8a] p-5 rounded-lg shadow-md">
              <div className="flex items-start">
                <svg
                  className="w-7 h-7 text-[#1e3a8a] mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h4 className="font-bold text-[#1e3a8a] mb-2 text-lg">
                    Chain of Custody Guidelines
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-[#1e3a8a] font-bold">•</span>
                      <span>
                        Record every movement of the property immediately
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#1e3a8a] font-bold">•</span>
                      <span>
                        Ensure both transferring and receiving officers are
                        documented
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#1e3a8a] font-bold">•</span>
                      <span>Clearly state the purpose of each transfer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#1e3a8a] font-bold">•</span>
                      <span>
                        Maintain accurate timestamps for all movements
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#1e3a8a] font-bold">•</span>
                      <span>
                        Add detailed remarks for any unusual circumstances
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
