import { connectDB } from "@/lib/db"
import { Case } from "@/models/Case";
import { Property } from "@/models/Property";
import { TransferRequest } from "@/models/TransferRequest";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ManageCasesClient from "@/app/cases/manage/manage-cases-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await connectDB();

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  let caseFilter: any = {};
  if (userRole !== "ADMIN") {
    const ownedCases = await Case.find({
      $or: [{ reportingOfficer: userId }, { reportedOfficer: userId }],
    }).select("_id").lean();
    const transferredProps = await Property.find({ currentOfficer: userId }).select("caseId").lean();
    const caseIdSet = new Set([
      ...ownedCases.map((c: any) => c._id.toString()),
      ...transferredProps
        .filter((p: any) => p.caseId !== null)
        .map((p: any) => p.caseId.toString()),
    ]);
    caseFilter = { _id: { $in: Array.from(caseIdSet) } };
  }

  const totalCases = await Case.countDocuments(caseFilter);
  const pendingCases = await Case.countDocuments({ ...caseFilter, status: "PENDING" });
  const disposedCases = await Case.countDocuments({ ...caseFilter, status: "DISPOSED" });



  // Count properties for the user
  let propertyFilter: any = {};
  if (userRole !== "ADMIN") {
    propertyFilter.currentOfficer = userId;
  }

  const independentProperties = await Property.countDocuments({ ...propertyFilter, caseId: null });

  // Count pending transfer requests for this officer
  let pendingTransfers = 0;
  if (userRole !== "ADMIN") {
    pendingTransfers = await TransferRequest.countDocuments({
      toOfficer: userId,
      status: "PENDING",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-2">
              Dashboard Overview
            </h2>
            <p className="text-gray-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Evidence and Case Management
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {(session.user as any)?.role === "ADMIN" && (
              <>
                <Link
                  href="/police-stations"
                  className="w-full sm:w-auto text-center bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e3a8a] hover:text-white transition shadow-md"
                >
                  Police Stations
                </Link>
                <Link
                  href="/users"
                  className="w-full sm:w-auto text-center bg-white border-2 border-[#7c3aed] text-[#7c3aed] px-6 py-2.5 rounded-lg font-semibold hover:bg-[#7c3aed] hover:text-white transition shadow-md"
                >
                  Manage Users
                </Link>
                <Link
                  href="/users/new"
                  className="w-full sm:w-auto text-center bg-[#1e3a8a] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e40af] transition border-2 border-[#1e3a8a] shadow-md"
                >
                  + Add User
                </Link>
              </>
            )}

            {userRole !== "ADMIN" && (
              <Link
                href="/addcase"
                className="w-full sm:w-auto text-center bg-[#1e3a8a] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e40af] transition border-2 border-[#1e3a8a] shadow-md"
              >
                + New Case
              </Link>
            )
            }

            {userRole !== "ADMIN" && (
              <>
                <Link
                  href="/transferProperty"
                  className="w-full sm:w-auto text-center bg-white border-2 border-[#7c3aed] text-[#7c3aed] px-6 py-2.5 rounded-lg font-semibold hover:bg-[#7c3aed] hover:text-white transition shadow-md"
                >
                  Transfer Property
                </Link>
                <Link
                  href="/transferPropertyLog"
                  className="w-full sm:w-auto text-center bg-white border-2 border-[#059669] text-[#059669] px-6 py-2.5 rounded-lg font-semibold hover:bg-[#059669] hover:text-white transition shadow-md relative"
                >
                  Transfer Requests
                  {pendingTransfers > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {pendingTransfers}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border-2 border-[#1e3a8a] p-6 rounded-xl shadow-lg">
            <p className="text-5xl font-bold text-[#1e3a8a] mb-2">{totalCases}</p>
            <p className="text-sm text-gray-500">Total Cases</p>
          </div>

          <div className="bg-white border-2 border-[#ffc107] p-6 rounded-xl shadow-lg">
            <p className="text-5xl font-bold text-[#ffc107] mb-2">{pendingCases}</p>
            <p className="text-sm text-gray-500">Pending Cases</p>
          </div>

          <div className="bg-white border-2 border-[#28a745] p-6 rounded-xl shadow-lg">
            <p className="text-5xl font-bold text-[#28a745] mb-2">{disposedCases}</p>
            <p className="text-sm text-gray-500">Disposed</p>
          </div>

          <Link
            href="/properties"
            className="bg-white border-2 border-[#17a2b8] p-6 rounded-xl shadow-lg hover:border-[#138496] transition"
          >
            <p className="text-5xl font-bold text-[#17a2b8] mb-2">{independentProperties}</p>
            <p className="text-sm text-gray-500">Independent Properties (Click here)</p>
          </Link>
        </div>

        <div className="bg-white border-2 border-gray-300 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-[#1e3a8a] mb-4">
            Manage Entries
          </h3>
          <ManageCasesClient />
        </div>
      </div>
    </div>
  );
}
