"use client";

import { useState } from "react";
import Link from "next/link";
import PoliceStationSelect from "@/components/PoliceStationSelect";

type SearchType = "CASE" | "CASE_PROPERTY" | "UNCLAIMED";

export default function ManageCasesClient() {
  const [searchType, setSearchType] = useState<SearchType>("CASE");
  const [cases, setCases] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [crimeNumber, setCrimeNumber] = useState("");
  const [policeStation, setPoliceStation] = useState("");
  const [seizureDateFrom, setSeizureDateFrom] = useState("");
  const [seizureDateTo, setSeizureDateTo] = useState("");
  const [actAndLaw, setActAndLaw] = useState("");
  const [section, setSection] = useState("");
  // Property-specific search fields
  const [propertyTag, setPropertyTag] = useState("");
  const [category, setCategory] = useState("");
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  const [caseProperties, setCaseProperties] = useState<{
    [key: string]: any[];
  }>({});
  const [loadingProperties, setLoadingProperties] = useState<{
    [key: string]: boolean;
  }>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (searchType === "CASE") {
        // Search cases
        const params = new URLSearchParams();
        if (searchQuery) params.append("q", searchQuery);
        if (statusFilter !== "ALL") params.append("status", statusFilter);
        if (crimeNumber) params.append("crimeNumber", crimeNumber);
        if (policeStation) params.append("policeStation", policeStation);
        if (seizureDateFrom) params.append("seizureDateFrom", seizureDateFrom);
        if (seizureDateTo) params.append("seizureDateTo", seizureDateTo);
        if (actAndLaw) params.append("actAndLaw", actAndLaw);
        if (section) params.append("section", section);

        const res = await fetch(`/api/cases?${params.toString()}`);
        const data = await res.json();
        setCases(data || []);
        setProperties([]);
      } else {
        // Search properties (case-related or unclaimed)
        const params = new URLSearchParams();
        if (searchType === "UNCLAIMED") {
          // unclaimed = caseId is null
          params.append("standalone", "true");
        } else {
          // case-related = caseId is not null
          params.append("caseRelated", "true");
        }
        if (searchQuery) params.append("q", searchQuery);
        if (propertyTag) params.append("propertyTag", propertyTag);
        if (category) params.append("category", category);
        if (seizureDateFrom) params.append("seizureDateFrom", seizureDateFrom);
        if (seizureDateTo) params.append("seizureDateTo", seizureDateTo);
        if (statusFilter !== "ALL") params.append("status", statusFilter);

        const res = await fetch(`/api/properties/search?${params.toString()}`);
        const data = await res.json();
        setProperties(Array.isArray(data) ? data : []);
        setCases([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setCrimeNumber("");
    setPoliceStation("");
    setSeizureDateFrom("");
    setSeizureDateTo("");
    setActAndLaw("");
    setSection("");
    setPropertyTag("");
    setCategory("");
    setCases([]);
    setProperties([]);
  };

  const handleExpandCase = async (caseId: string) => {
    if (expandedCaseId === caseId) {
      setExpandedCaseId(null);
      return;
    }

    setExpandedCaseId(caseId);

    if (!caseProperties[caseId]) {
      setLoadingProperties((p) => ({ ...p, [caseId]: true }));
      try {
        const res = await fetch(`/api/properties?caseId=${caseId}`);
        const data = await res.json();
        setCaseProperties((p) => ({ ...p, [caseId]: data || [] }));
      } finally {
        setLoadingProperties((p) => ({ ...p, [caseId]: false }));
      }
    }
  };

  const handleDownloadPDF = (caseId: string) => {
    window.open(`/api/case-pdf?caseId=${caseId}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Search Type Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Search Type
          </label>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "CASE" as SearchType, label: "Case" },
              { value: "CASE_PROPERTY" as SearchType, label: "Case Related Property" },
              { value: "UNCLAIMED" as SearchType, label: "Unclaimed Property" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setSearchType(opt.value);
                  setCases([]);
                  setProperties([]);
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  searchType === opt.value
                    ? "bg-[#1e3a8a] text-white"
                    : "bg-white text-[#1e3a8a] border-2 border-[#1e3a8a] hover:bg-blue-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Case-specific search fields */}
        {searchType === "CASE" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Crime Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., 183/2021"
                  value={crimeNumber}
                  onChange={(e) => setCrimeNumber(e.target.value)}
                  className=" text-black w-full border-2  border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Police Station
                </label>
                <PoliceStationSelect
                  value={policeStation}
                  onChange={setPoliceStation}
                  placeholder="Select police station"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] text-black"
                >
                  <option value="ALL">All Cases</option>
                  <option value="PENDING">Pending</option>
                  <option value="UNDER_INVESTIGATION">Under Investigation</option>
                  <option value="IN_COURT">In Court</option>
                  <option value="DISPOSED">Disposed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Section of Act
                </label>
                <input
                  type="text"
                  placeholder="e.g., Indian Penal Code"
                  value={actAndLaw}
                  onChange={(e) => setActAndLaw(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Section of Law
                </label>
                <input
                  type="text"
                  placeholder="e.g., 394, 326"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date of Seizure
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={seizureDateFrom}
                    onChange={(e) => setSeizureDateFrom(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1e3a8a] text-sm text-black"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={seizureDateTo}
                    onChange={(e) => setSeizureDateTo(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1e3a8a] text-sm text-black"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Property-specific search fields */}
        {(searchType === "CASE_PROPERTY" || searchType === "UNCLAIMED") && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Property Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g., PROP-ABC123"
                  value={propertyTag}
                  onChange={(e) => setPropertyTag(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g., Electronics, Jewellery"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] text-black"
                >
                  <option value="ALL">All</option>
                  <option value="SEIZED">Seized</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="IN_LAB">In Lab</option>
                  <option value="IN_COURT">In Court</option>
                  <option value="DISPOSED">Disposed</option>
                  <option value="RELEASED">Released</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date of Seizure
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={seizureDateFrom}
                    onChange={(e) => setSeizureDateFrom(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1e3a8a] text-sm text-black"
                  />
                  <input
                    type="date"
                    value={seizureDateTo}
                    onChange={(e) => setSeizureDateTo(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1e3a8a] text-sm text-black"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* General keyword search */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            General Search
          </label>
          <input
            type="text"
            placeholder={
              searchType === "CASE"
                ? "Search by crime number, year, station, officer name, or ID"
                : "Search by property tag, description, nature, or storage location"
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] text-black"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-[#1e3a8a] text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-[#1e40af] transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="w-full sm:w-auto bg-gray-200 text-gray-700 px-8 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Case Results */}
      {searchType === "CASE" && cases.length > 0 && (
        <>
          <p className="text-sm text-gray-600 font-semibold">
            Showing 1-{cases.length} (out of {cases.length})
          </p>

          {cases.map((c) => (
            <div
              key={c._id}
              className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden"
            >
              <div
                onClick={() => handleExpandCase(c._id)}
                className="cursor-pointer flex justify-between items-start p-4 hover:bg-blue-50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-[#1e3a8a]">
                    Crime {c.crimeNumber}/{c.crimeYear}
                  </h4>
                  <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
                    <span>
                      {typeof c.policeStation === "object"
                        ? c.policeStation?.name || "N/A"
                        : c.policeStation}
                    </span>
                    {c.actAndLaw && c.actAndLaw.length > 0 && <span>{Array.isArray(c.actAndLaw) ? c.actAndLaw.join(', ') : c.actAndLaw}</span>}
                  </div>
                </div>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full ${
                    c.status === "PENDING"
                      ? "bg-[#ffc107] text-[#856404]"
                      : c.status === "DISPOSED"
                        ? "bg-[#28a745] text-white"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {c.status}
                </span>
              </div>

              {expandedCaseId === c._id && (
                <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 font-semibold">IO Name</p>
                      <p className="font-bold">{c.investigatingOfficerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-semibold">Officer ID</p>
                      <p className="font-bold">{c.investigatingOfficerId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-semibold">FIR Date</p>
                      <p className="font-bold">
                        {c.firDate
                          ? new Date(c.firDate).toLocaleDateString("en-IN")
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-semibold">Section</p>
                      <p className="font-bold">{c.section && c.section.length > 0 ? (Array.isArray(c.section) ? c.section.join(', ') : c.section) : 'N/A'}</p>
                    </div>
                  </div>

                  {loadingProperties[c._id] ? (
                    <p className="text-sm text-gray-500">Loading properties...</p>
                  ) : caseProperties[c._id]?.length > 0 ? (
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-2">
                        Properties ({caseProperties[c._id].length})
                      </p>
                      <div className="space-y-2">
                        {caseProperties[c._id].map((p: any) => (
                          <Link
                            key={p._id}
                            href={`/properties/${p._id}`}
                            className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center hover:bg-blue-50 transition-colors block"
                          >
                            <div>
                              <p className="font-semibold text-sm">{p.category}</p>
                              <p className="text-xs text-gray-500">
                                {p.natureOfProperty} | {p.storageLocation}
                              </p>
                            </div>
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded ${
                                p.status === "DISPOSED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {p.status}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/cases/${c._id}`}
                      className="w-full sm:w-auto text-center bg-[#1e3a8a] text-white px-5 py-2.5 text-sm font-semibold rounded-lg hover:bg-[#1e40af] transition-colors"
                    >
                      View Full Details
                    </Link>

                    <button
                      onClick={() => handleDownloadPDF(c._id)}
                      className="w-full sm:w-auto bg-[#28a745] text-white px-5 py-2.5 text-sm font-semibold rounded-lg hover:bg-[#218838] transition-colors"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Property Results */}
      {(searchType === "CASE_PROPERTY" || searchType === "UNCLAIMED") &&
        properties.length > 0 && (
          <>
            <p className="text-sm text-gray-600 font-semibold">
              Showing 1-{properties.length} (out of {properties.length})
            </p>

            <div className="space-y-3">
              {properties.map((p: any) => (
                <Link
                  key={p._id}
                  href={`/properties/${p._id}`}
                  className="block bg-white border-2 border-gray-300 rounded-xl p-4 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold text-[#1e3a8a]">
                          {p.propertyTag}
                        </h4>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            p.propertyType === "UNCLAIMED"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {p.propertyType === "UNCLAIMED"
                            ? "Unclaimed"
                            : p.propertyType === "KURKI"
                              ? "Kurki"
                              : "Case Related"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium">
                        {p.category} — {p.natureOfProperty}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {p.description?.slice(0, 80)}
                        {p.description?.length > 80 ? "..." : ""}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Storage: {p.storageLocation} | Seizure:{" "}
                        {p.seizureDate
                          ? new Date(p.seizureDate).toLocaleDateString("en-IN")
                          : "N/A"}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold px-3 py-1 rounded-full ${
                        p.status === "DISPOSED"
                          ? "bg-[#28a745] text-white"
                          : p.status === "SEIZED"
                            ? "bg-[#ffc107] text-[#856404]"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
    </div>
  );
}
