"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TransferItem {
  _id: string;
  itemType: "CASE" | "PROPERTY";
  itemId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  details?: {
    caseNumber?: string;
    crimeNumber?: string;
    crimeYear?: number;
    policeStation?: string | { _id: string; name: string; sarkariId: string; district: string };
    propertyTag?: string;
    description?: string;
    category?: string;
    propertyType?: string;
  };
}

interface TransferReq {
  _id: string;
  fromOfficer: { _id: string; fullName: string; officerId: string };
  toOfficer: { _id: string; fullName: string; officerId: string };
  transferDate: string;
  items: TransferItem[];
  status: string;
  createdAt: string;
}

export default function TransferPropertyLogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<"received" | "sent">("received");
  const [requests, setRequests] = useState<TransferReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchTransfers();
  }, [status, tab]);

  async function fetchTransfers() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/trasferProperty?direction=${tab}`
      );
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setMessage({ text: "Failed to load transfers", type: "error" });
    }
    setLoading(false);
  }

  async function handleAction(
    transferRequestId: string,
    itemId: string,
    action: "ACCEPTED" | "REJECTED"
  ) {
    setActionLoading(itemId);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/trasferProperty/accept", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transferRequestId, itemId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({
        text: `Item ${action.toLowerCase()} successfully`,
        type: "success",
      });
      fetchTransfers();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    }
    setActionLoading(null);
  }

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
      ACCEPTED: "bg-green-100 text-green-800 border-green-300",
      REJECTED: "bg-red-100 text-red-800 border-red-300",
      COMPLETED: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return (
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
          colors[s] || "bg-gray-100 text-gray-600"
        }`}
      >
        {s}
      </span>
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="animate-spin h-12 w-12 border-4 border-[#1e3a8a] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold text-[#1e3a8a] mb-6">
          Transfer Requests
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("received")}
            className={`px-5 py-2 rounded-lg font-semibold transition ${
              tab === "received"
                ? "bg-[#1e3a8a] text-white"
                : "bg-white text-[#1e3a8a] border-2 border-[#1e3a8a]"
            }`}
          >
            Received
          </button>
          <button
            onClick={() => setTab("sent")}
            className={`px-5 py-2 rounded-lg font-semibold transition ${
              tab === "sent"
                ? "bg-[#1e3a8a] text-white"
                : "bg-white text-[#1e3a8a] border-2 border-[#1e3a8a]"
            }`}
          >
            Sent
          </button>
        </div>

        {message.text && (
          <div
            className={`mb-4 p-4 rounded border-l-4 ${
              message.type === "error"
                ? "bg-red-50 border-red-500 text-red-700"
                : "bg-green-50 border-green-500 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-[#1e3a8a] border-t-transparent rounded-full" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 text-center shadow-md">
            <p className="text-gray-500 text-lg">
              No {tab} transfer requests found.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-white border-2 border-gray-200 rounded-xl shadow-md overflow-hidden"
              >
                {/* Request header */}
                <div className="bg-gray-50 px-6 py-4 border-b flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-gray-500">
                      {tab === "received" ? "From" : "To"}:{" "}
                      <span className="font-semibold text-black">
                        {tab === "received"
                          ? `${req.fromOfficer?.fullName} (${req.fromOfficer?.officerId})`
                          : `${req.toOfficer?.fullName} (${req.toOfficer?.officerId})`}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Date:{" "}
                      <span className="text-black">
                        {new Date(req.transferDate).toLocaleDateString("en-IN")}
                      </span>
                    </p>
                  </div>
                  {statusBadge(req.status)}
                </div>

                {/* Items */}
                <div className="divide-y">
                  {req.items.map((item) => (
                    <div
                      key={item._id}
                      className="px-6 py-3 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            item.itemType === "CASE"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {item.itemType}
                        </span>
                        <div className="text-black">
                          {item.itemType === "CASE" ? (
                            <span>
                              {item.status === "ACCEPTED" && tab === "sent" ? (
                                <span className="font-medium text-gray-600">
                                  {item.details?.caseNumber ||
                                    `${item.details?.crimeNumber}/${item.details?.crimeYear}`}
                                </span>
                              ) : (
                                <a
                                  href={`/cases/${item.itemId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-[#1e3a8a] underline hover:text-[#1e40af]"
                                >
                                  {item.details?.caseNumber ||
                                    `${item.details?.crimeNumber}/${item.details?.crimeYear}`}
                                </a>
                              )}{" "}
                              <span className="text-gray-500 text-sm">
                                — {typeof item.details?.policeStation === 'object' ? item.details?.policeStation?.name : item.details?.policeStation}
                              </span>
                            </span>
                          ) : (
                            <span>
                              {item.status === "ACCEPTED" && tab === "sent" ? (
                                <span className="font-medium text-gray-600">
                                  {item.details?.propertyTag}
                                </span>
                              ) : (
                                <a
                                  href={`/properties/${item.itemId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-[#1e3a8a] underline hover:text-[#1e40af]"
                                >
                                  {item.details?.propertyTag}
                                </a>
                              )}{" "}
                              <span className="text-gray-500 text-sm">
                                — {item.details?.category} —{" "}
                                {item.details?.description?.slice(0, 50)}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.status === "PENDING" && tab === "received" ? (
                          <>
                            <button
                              onClick={() =>
                                handleAction(req._id, item._id, "ACCEPTED")
                              }
                              disabled={actionLoading === item._id}
                              className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleAction(req._id, item._id, "REJECTED")
                              }
                              disabled={actionLoading === item._id}
                              className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          statusBadge(item.status)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
