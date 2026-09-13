import { connectDB } from "@/lib/db";
import { Case } from "@/models/Case";
import { Property } from "@/models/Property";
import { CustodyLog } from "@/models/CustodyLog";
import { User } from "@/models/User";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CasePrintClient from "../manage/case-print-client";

type Props = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function CaseDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { caseId } = await params;

  await connectDB();

  const caseData = await Case.findById(caseId);
  if (!caseData) notFound();

  // Check if user has permission to view this case
  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin) {
    const userId = (session.user as any).id;
    const hasAccess = caseData.reportingOfficer.toString() === userId ||
                     caseData.reportedOfficer?.toString() === userId;
    if (!hasAccess) {
      // Check if user has any properties from this case
      const userProperties = await Property.find({
        caseId: caseId,
        currentOfficer: userId,
      }).limit(1);
      if (userProperties.length === 0) {
        notFound();
      }
    }
  }

  // Filter properties by user visibility for non-ADMIN users
  const propertyFilter: any = { caseId };
  if (!isAdmin) {
    propertyFilter.currentOfficer = session.user.id;
  }
  const properties = await Property.find(propertyFilter);

  const logs = await CustodyLog.find({
    propertyId: { $in: properties.map(p => p._id) }
  }).sort({ movementTimestamp: -1 });

  const lastLogByProperty = logs.reduce((acc: any, log: any) => {
    const key = log.propertyId.toString();
    if (!acc[key]) acc[key] = log;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-2">
            Case {caseData.crimeNumber}/{caseData.crimeYear}
          </h2>
          <p className="text-gray-600">{typeof caseData.policeStation === 'object' ? caseData.policeStation?.name : caseData.policeStation}</p>
          <span
            className={`inline-block mt-3 px-4 py-1.5 text-sm font-bold rounded-full ${caseData.status === "DISPOSED"
              ? "bg-[#28a745] text-white"
              : "bg-[#ffc107] text-[#856404]"
              }`}
          >
            {caseData.status}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <CasePrintClient />
          <Link
            href="/dashboard"
            className="w-full sm:w-auto text-center bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e3a8a] hover:text-white transition shadow-md"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="mb-8 bg-white border-2 border-gray-300 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-[#1e3a8a] mb-4">
          Case Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-600">Investigating Officer</p>
            <p className="text-lg font-bold text-black">{caseData.investigatingOfficerName}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Officer ID</p>
            <p className="text-lg font-bold text-black">{caseData.investigatingOfficerId}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Date of FIR</p>
            <p className="text-lg font-bold text-black">
              {caseData.firDate
                ? new Date(caseData.firDate).toLocaleDateString("en-IN")
                : "N/A"}
            </p>
          </div>


        </div>
      </div>

      <div className="bg-white border-2 border-gray-300 rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#1e3a8a] text-white px-6 py-5">
          <div>
            <h3 className="text-2xl font-bold">Seized Properties</h3>
            <p className="text-sm text-blue-200">{properties.length} properties</p>
          </div>

          {(session.user as any)?.role !== "ADMIN" && (
            <Link
              href={`/cases/${caseId}/properties/new`}
              className="w-full sm:w-auto text-center bg-white text-[#1e3a8a] px-6 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition shadow-md"
            >
              + Add Property
            </Link>
          )}
        </div>

        {properties.map((p: any) => {
          const last = lastLogByProperty[p._id.toString()];

          return (
            <Link
              key={p._id}
              href={`${caseId}/properties/${p._id}`}
              className="block p-6 border-t hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <p className="text-xl font-bold">{p.category}</p>
                  <p className="text-sm text-gray-600">{p.natureOfProperty} | {p.storageLocation}</p>
                  <p className="text-xs text-[#1e3a8a] font-semibold mt-1">{p.propertyTag}</p>

                  {last && (
                    <p className="text-sm text-gray-700 mt-2">
                      {last.fromLocation} → {last.toLocation}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <span
                    className={`text-center px-4 py-2.5 rounded-lg font-semibold text-sm ${p.status === "DISPOSED"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-[#1e3a8a]"
                      }`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
