"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CaseItem {
  _id: string;
  caseNumber: string;
  crimeNumber: string;
  crimeYear: number;
  policeStation: string | { _id: string; name: string; sarkariId: string; district: string };
}

interface PropertyItem {
  _id: string;
  propertyTag: string;
  description: string;
  category: string;
  propertyType: string;
}

interface Officer {
  _id: string;
  fullName: string;
  officerId: string;
  policeStation: string | { _id: string; name: string; sarkariId: string; district: string };
}

export default function TransferPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [toOfficerId, setToOfficerId] = useState("");
  const [transferDate, setTransferDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (role === "ADMIN") {
        router.push("/dashboard");
        return;
      }
      fetchData();
    }
  }, [status]);

  async function fetchData() {
    setLoading(true);
    try {
      const [casesRes, propsRes, officersRes] = await Promise.all([
        fetch("/api/cases?status=ALL"),
        fetch("/api/properties?type=unclaimed"),
        fetch("/api/officers"),
      ]);
      const casesData = await casesRes.json();
      const propsData = await propsRes.json();
      const officersData = await officersRes.json();

      setCases(Array.isArray(casesData) ? casesData : []);
      setProperties(
        Array.isArray(propsData?.properties)
          ? propsData.properties
          : Array.isArray(propsData)
          ? propsData
          : []
      );
      setOfficers(Array.isArray(officersData) ? officersData : []);
    } catch {
      setError("Failed to load data");
    }
    setLoading(false);
  }

  function toggleCase(id: string) {
    setSelectedCases((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleProperty(id: string) {
    setSelectedProperties((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!toOfficerId) {
      setError("Please select a target officer");
      return;
    }
    if (selectedCases.size === 0 && selectedProperties.size === 0) {
      setError("Please select at least one case or property to transfer");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/trasferProperty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toOfficerId,
          transferDate,
          cases: Array.from(selectedCases),
          properties: Array.from(selectedProperties),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transfer failed");
      setSuccess("Transfer request sent successfully!");
      setSelectedCases(new Set());
      setSelectedProperties(new Set());
      setToOfficerId("");
    } catch (err: any) {
      setError(err.message);
    }
    setSubmitting(false);
  }

  if (status === "loading" || loading) {
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
          Transfer Property / Cases
        </h1>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Transfer details */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6 shadow-md">
            <h2 className="text-lg font-semibold text-[#1e3a8a] mb-4">
              Transfer Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Officer
                </label>
                <input
                  type="text"
                  value={(session?.user as any)?.name || ""}
                  disabled
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Officer <span className="text-red-500">*</span>
                </label>
                <select
                  value={toOfficerId}
                  onChange={(e) => setToOfficerId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-black"
                  required
                >
                  <option value="">-- Select Officer --</option>
                  {officers.map((o) => (
                    <option key={o._id} value={o.officerId}>
                      {o.fullName} ({o.officerId}) - {typeof o.policeStation === 'object' ? o.policeStation?.name : o.policeStation}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Transfer
                </label>
                <input
                  type="date"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-black"
                  required
                />
              </div>
            </div>
          </div>

          {/* Cases section */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6 shadow-md">
            <h2 className="text-lg font-semibold text-[#1e3a8a] mb-4">
              Cases ({cases.length})
            </h2>
            {cases.length === 0 ? (
              <p className="text-gray-500">No cases found under your name.</p>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2">
                {cases.map((c) => (
                  <label
                    key={c._id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      selectedCases.has(c._id)
                        ? "border-[#1e3a8a] bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCases.has(c._id)}
                      onChange={() => toggleCase(c._id)}
                      className="w-4 h-4 accent-[#1e3a8a]"
                    />
                    <div>
                      <a
                        href={`/cases/${c._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#1e3a8a] underline hover:text-[#1e40af]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.caseNumber || `${c.crimeNumber}/${c.crimeYear}`}
                      </a>
                      <span className="text-gray-500 text-sm ml-2">
                        — {typeof c.policeStation === 'object' ? c.policeStation?.name : c.policeStation}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Unclaimed properties section */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6 shadow-md">
            <h2 className="text-lg font-semibold text-[#1e3a8a] mb-4">
              Unclaimed Properties ({properties.length})
            </h2>
            {properties.length === 0 ? (
              <p className="text-gray-500">
                No unclaimed properties found under your name.
              </p>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2">
                {properties.map((p) => (
                  <label
                    key={p._id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      selectedProperties.has(p._id)
                        ? "border-[#1e3a8a] bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProperties.has(p._id)}
                      onChange={() => toggleProperty(p._id)}
                      className="w-4 h-4 accent-[#1e3a8a]"
                    />
                    <div>
                      <a
                        href={`/properties/${p._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#1e3a8a] underline hover:text-[#1e40af]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {p.propertyTag}
                      </a>
                      <span className="text-gray-500 text-sm ml-2">
                        — {p.category} — {p.description?.slice(0, 60)}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1e3a8a] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1e40af] transition disabled:opacity-50 shadow-md"
            >
              {submitting ? "Sending..." : "Send Transfer Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
