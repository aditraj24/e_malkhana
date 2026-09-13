"use client";

import Link from "next/link";
import DisposalForm from "@/components/DisposalForm";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function DisposalPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const propertyId = params.propertyId as string;
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && (session?.user as any)?.role === "ADMIN") {
      router.replace(`/cases/${caseId}/properties/${propertyId}`);
    }
  }, [status, session, router, caseId, propertyId]);

  if (status === "loading" || (session?.user as any)?.role === "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Breadcrumb */}
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
            <span className="text-[#dc3545] font-semibold">Disposal</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <Link
            href={`/cases/${caseId}/properties/${propertyId}`}
            className="text-[#1e3a8a] hover:underline mb-4 inline-flex items-center gap-1 font-semibold"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Property
          </Link>
          <h1 className="text-4xl font-bold text-[#dc3545] mb-2 flex items-center gap-3">
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Dispose Property
          </h1>
          <p className="text-gray-600 ml-1">
            Mark the property as disposed from custody with proper authorization
          </p>
        </div>

        {/* Warning Box */}
        <div className="mb-8 bg-[#fff3cd] border-l-4 border-[#ffc107] p-5 rounded-lg shadow-md">
          <div className="flex items-start">
            <svg
              className="w-7 h-7 text-[#856404] mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="font-bold text-[#856404] mb-2 text-lg">
                ⚠️ Important Notice
              </h4>
              <ul className="text-sm text-[#856404] space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    This action is <strong>irreversible</strong>. Once disposed,
                    the property cannot be restored to custody.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    Ensure you have proper <strong>court authorization</strong>{" "}
                    before proceeding.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    All disposal records are <strong>permanently logged</strong>{" "}
                    and audited.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-300 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#dc3545] text-white px-6 py-5">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <svg
                className="w-7 h-7"
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
              Property Disposal Form
            </h3>
            <p className="text-sm text-red-100 mt-1">
              Complete all required fields to proceed with disposal
            </p>
          </div>

          <div className="p-6">
            <DisposalForm />
          </div>
        </div>

        {/* Guidelines Box */}
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
                Disposal Guidelines
              </h4>
              <ul className="text-sm text-gray-700 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>
                    Select the appropriate disposal type based on court orders
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>
                    Provide complete court order reference number and date
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>Document the disposal date accurately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1e3a8a] font-bold">•</span>
                  <span>Add detailed remarks about the disposal process</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
