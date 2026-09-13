import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
    
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#1e3a8a] mb-4">
              Welcome to e-Malkhana
            </h2>
            <p className="text-lg text-gray-700 mb-2">
              Digital Evidence & Property Management System
            </p>
            <p className="text-gray-600">
              A secure platform for managing seized property and evidence in
              police custody
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#f8f9fa] border-2 border-[#1e3a8a] p-6 text-center">
              <div className="w-16 h-16 bg-[#1e3a8a] rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-[#1e3a8a] mb-2">Secure Storage</h3>
              <p className="text-sm text-gray-600">
                Encrypted digital records of all seized property
              </p>
            </div>

            <div className="bg-[#f8f9fa] border-2 border-[#1e3a8a] p-6 text-center">
              <div className="w-16 h-16 bg-[#1e3a8a] rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-[#1e3a8a] mb-2">
                Chain of Custody
              </h3>
              <p className="text-sm text-gray-600">
                Complete tracking of evidence movement
              </p>
            </div>

            <div className="bg-[#f8f9fa] border-2 border-[#1e3a8a] p-6 text-center">
              <div className="w-16 h-16 bg-[#1e3a8a] rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-[#1e3a8a] mb-2">Case Management</h3>
              <p className="text-sm text-gray-600">
                Organized tracking of all cases and property
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-[#f8f9fa] border-2 border-[#1e3a8a] p-8 inline-block">
              <h3 className="text-xl font-bold text-[#1e3a8a] mb-4">
                Officer Login Portal
              </h3>
              <p className="text-gray-600 mb-6">
                Access requires authorized credentials
              </p>
              <Link
                href="/login"
                className="inline-block bg-[#1e3a8a] text-white px-8 py-3 font-bold hover:bg-[#1e40af] transition-colors border-2 border-[#1e3a8a]"
              >
                PROCEED TO LOGIN
              </Link>
            </div>
          </div>

          <div className="mt-12 bg-[#fff3cd] border-l-4 border-[#ffc107] p-4">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-[#856404] mr-3 flex-shrink-0"
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
                <h4 className="font-bold text-[#856404] mb-1">
                  Important Notice
                </h4>
                <p className="text-sm text-[#856404]">
                  This system is for authorized police personnel only.
                  Unauthorized access is strictly prohibited and will be
                  prosecuted under applicable laws. All activities are logged
                  and monitored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}