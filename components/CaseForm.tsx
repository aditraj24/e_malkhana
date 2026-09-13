"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCase } from "@/app/cases/new/actions";
import { useSession } from "next-auth/react";
import PoliceStationSelect from "@/components/PoliceStationSelect";

export default function CaseForm() {
  const router = useRouter();
  const { data: session } = useSession();

  const [form, setForm] = useState({
    policeStation: "",
    investigatingOfficerName: "",
    investigatingOfficerId: "",
    crimeNumber: "",
    crimeYear: new Date().getFullYear().toString(),
    crimeType: "",
    firDate: "",
    actAndLaw: [] as string[],
    section: [] as string[],
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const actAndLawOptions = [
    { value: "IPC", label: "Indian Penal Code (IPC)" },
    { value: "CRPC", label: "Code of Criminal Procedure (CrPC)" },
    { value: "IEA", label: "Indian Evidence Act (IEA)" },
    { value: "NDPS_ACT", label: "NDPS Act" },
    { value: "ARMS_ACT", label: "Arms Act" },
    { value: "EXPLOSIVE_ACT", label: "Explosive Substances Act" },
    { value: "IT_ACT", label: "Information Technology Act" },
    { value: "POCSO_ACT", label: "POCSO Act" },
    { value: "SC_ST_ACT", label: "SC/ST (Prevention of Atrocities) Act" },
    { value: "EXCISE_ACT", label: "Excise Act" },
    { value: "WILDLIFE_ACT", label: "Wildlife Protection Act" },
    { value: "MVA", label: "Motor Vehicles Act" },
    { value: "DV_ACT", label: "Domestic Violence Act" },
    { value: "OTHER", label: "Other" },
  ];

  const sectionOptions = [
    { value: "SEC_302", label: "Section 302 - Murder" },
    { value: "SEC_307", label: "Section 307 - Attempt to Murder" },
    { value: "SEC_376", label: "Section 376 - Rape" },
    { value: "SEC_420", label: "Section 420 - Cheating" },
    { value: "SEC_354", label: "Section 354 - Assault on Woman" },
    { value: "SEC_379", label: "Section 379 - Theft" },
    { value: "SEC_392", label: "Section 392 - Robbery" },
    { value: "SEC_395", label: "Section 395 - Dacoity" },
    { value: "SEC_304", label: "Section 304 - Culpable Homicide" },
    { value: "SEC_323", label: "Section 323 - Voluntarily Causing Hurt" },
    { value: "SEC_498A", label: "Section 498A - Cruelty by Husband" },
    { value: "SEC_506", label: "Section 506 - Criminal Intimidation" },
    { value: "SEC_34", label: "Section 34 - Common Intention" },
    { value: "SEC_120B", label: "Section 120B - Criminal Conspiracy" },
    { value: "OTHER", label: "Other" },
  ];

  // Auto-fill police station for officers
  useEffect(() => {
    if (session?.user?.role === "OFFICER" && session.user.policeStation) {
      setForm(prev => ({ ...prev, policeStation: session.user.policeStation! }));
    }
  }, [session]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const target = e.target;
    if (target.type === 'checkbox') {
      const { name, value, checked } = target as HTMLInputElement;
      if (checked) {
        setForm(prev => ({ ...prev, [name]: [...(prev[name as keyof typeof prev] as string[]), value] }));
      } else {
        setForm(prev => ({ ...prev, [name]: (prev[name as keyof typeof prev] as string[]).filter(v => v !== value) }));
      }
    } else {
      setForm({ ...form, [target.name]: target.value });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const newFieldErrors: Record<string, string> = {};
    const requiredFields = ['policeStation', 'investigatingOfficerName', 'investigatingOfficerId', 'crimeNumber', 'crimeYear', 'crimeType', 'firDate', 'actAndLaw', 'section'];
    requiredFields.forEach(field => {
      const value = form[field as keyof typeof form];
      if (Array.isArray(value)) {
        if (value.length === 0) {
          newFieldErrors[field] = "Select at least one option";
        }
      } else if (!value.toString().trim()) {
        newFieldErrors[field] = "Fill this field";
      }
    });
    setFieldErrors(newFieldErrors);
    if (Object.keys(newFieldErrors).length > 0) {
      setIsLoading(false);
      return;
    }

    if (new Date(form.firDate) > new Date()) {
      setError("Date of FIR cannot be in the future");
      setIsLoading(false);
      return;
    }



    try {
      const result = await createCase(form);
      if (!result.success) {
        setError(result.error || "Failed to create case");
        setIsLoading(false);
        return;
      }
      router.replace(`/cases/${result.data!.caseId}`);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-300">
      <div className="bg-[#1e3a8a] text-white px-6 py-4">
        <h3 className="text-xl font-bold">Case Information Form</h3>
        <p className="text-sm text-blue-200 mt-1">
          All fields marked with * are mandatory
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-[#f8f9fa] border-l-4 border-[#1e3a8a] p-4">
          <h4 className="font-bold text-[#1e3a8a] mb-4">
            Station & Officer Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="policeStation"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Police Station Name *
              </label>
              <PoliceStationSelect
                value={form.policeStation}
                onChange={(value) => setForm({ ...form, policeStation: value })}
                disabled={isLoading || session?.user?.role === "OFFICER"}
                required
                error={fieldErrors.policeStation}
                placeholder={session?.user?.role === "OFFICER" ? "Auto-filled from your assignment" : "Select police station"}
              />
            </div>



            <div>
              <label
                htmlFor="investigatingOfficerName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Investigating Officer Name *
              </label>
              <input
                id="investigatingOfficerName"
                name="investigatingOfficerName"
                type="text"
                placeholder="Enter officer name"
                value={form.investigatingOfficerName}
                onChange={handleChange}
                className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${fieldErrors.investigatingOfficerName ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'}`}
                required
                disabled={isLoading}
              />
              {fieldErrors.investigatingOfficerName && <p className="text-red-500 text-sm mt-1">{fieldErrors.investigatingOfficerName}</p>}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="investigatingOfficerId"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Investigating Officer ID *
              </label>
              <input
                id="investigatingOfficerId"
                name="investigatingOfficerId"
                type="text"
                placeholder="Enter officer ID number"
                value={form.investigatingOfficerId}
                onChange={handleChange}
                className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${fieldErrors.investigatingOfficerId ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'}`}
                required
                disabled={isLoading}
              />
              {fieldErrors.investigatingOfficerId && <p className="text-red-500 text-sm mt-1">{fieldErrors.investigatingOfficerId}</p>}
            </div>
          </div>
        </div>

        <div className="bg-[#f8f9fa] border-l-4 border-[#1e3a8a] p-4">
          <h4 className="font-bold text-[#1e3a8a] mb-4">Crime Details</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="crimeNumber"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Crime Number *
              </label>
              <input
                id="crimeNumber"
                name="crimeNumber"
                type="text"
                placeholder="Enter crime number"
                value={form.crimeNumber}
                onChange={handleChange}
                className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${fieldErrors.crimeNumber ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'}`}
                required
                disabled={isLoading}
              />
              {fieldErrors.crimeNumber && <p className="text-red-500 text-sm mt-1">{fieldErrors.crimeNumber}</p>}
            </div>

            <div>
              <label
                htmlFor="crimeYear"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Crime Year *
              </label>
              <select
                id="crimeYear"
                name="crimeYear"
                value={form.crimeYear}
                onChange={handleChange}
                className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${fieldErrors.crimeYear ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'}`}
                required
                disabled={isLoading}
              >
                {Array.from(
                  { length: 10 },
                  (_, i) => new Date().getFullYear() - i,
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {fieldErrors.crimeYear && <p className="text-red-500 text-sm mt-1">{fieldErrors.crimeYear}</p>}
            </div>

            <div>
              <label
                htmlFor="crimeType"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Crime Type *
              </label>
              <select
                id="crimeType"
                name="crimeType"
                value={form.crimeType}
                onChange={handleChange}
                className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${fieldErrors.crimeType ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'}`}
                required
                disabled={isLoading}
              >
                <option value="">-- Select Crime Type --</option>
                <option value="THEFT">Theft</option>
                <option value="ROBBERY">Robbery</option>
                <option value="BURGLARY">Burglary</option>
                <option value="MURDER">Murder</option>
                <option value="ASSAULT">Assault</option>
                <option value="FRAUD">Fraud</option>
                <option value="KIDNAPPING">Kidnapping</option>
                <option value="DACOITY">Dacoity</option>
                <option value="CYBER_CRIME">Cyber Crime</option>
                <option value="DRUG_OFFENCE">Drug Offence</option>
                <option value="ARMS_ACT">Arms Act</option>
                <option value="DOMESTIC_VIOLENCE">Domestic Violence</option>
                <option value="SEXUAL_OFFENCE">Sexual Offence</option>
                <option value="CHEATING">Cheating</option>
                <option value="OTHER">Other</option>
              </select>
              {fieldErrors.crimeType && <p className="text-red-500 text-sm mt-1">{fieldErrors.crimeType}</p>}
            </div>

            <div>
              <label
                htmlFor="firDate"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Date of FIR *
              </label>
              <input
                id="firDate"
                name="firDate"
                type="date"
                value={form.firDate}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
                className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${fieldErrors.firDate ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'}`}
                required
                disabled={isLoading}
              />
              {fieldErrors.firDate && <p className="text-red-500 text-sm mt-1">{fieldErrors.firDate}</p>}
            </div>
          </div>
        </div>

        <div className="bg-[#f8f9fa] border-l-4 border-[#1e3a8a] p-4">
          <h4 className="font-bold text-[#1e3a8a] mb-4">Legal Information</h4>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Act & Law *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border-2 px-4 py-2 focus:outline-none text-black border-gray-300 focus-within:border-[#1e3a8a]">
                {actAndLawOptions.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`actAndLaw-${option.value}`}
                      name="actAndLaw"
                      value={option.value}
                      checked={form.actAndLaw.includes(option.value)}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="mr-2"
                    />
                    <label
                      htmlFor={`actAndLaw-${option.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              {fieldErrors.actAndLaw && <p className="text-red-500 text-sm mt-1">{fieldErrors.actAndLaw}</p>}
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Sections of Law *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border-2 px-4 py-2 focus:outline-none text-black border-gray-300 focus-within:border-[#1e3a8a]">
                {sectionOptions.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`section-${option.value}`}
                      name="section"
                      value={option.value}
                      checked={form.section.includes(option.value)}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="mr-2"
                    />
                    <label
                      htmlFor={`section-${option.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              {fieldErrors.section && <p className="text-red-500 text-sm mt-1">{fieldErrors.section}</p>}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-[#f8d7da] border-l-4 border-[#dc3545] p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-[#721c24] mr-2 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-[#721c24] font-semibold">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-[#fff3cd] border-l-4 border-[#ffc107] p-4">
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
              <h4 className="font-bold text-[#856404] mb-1">Next Steps</h4>
              <p className="text-sm text-[#856404]">
                After creating the case, you will be able to add seized
                properties, track chain of custody, and manage case disposal.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-[#1e3a8a] text-white py-3 font-bold hover:bg-[#1e40af] transition-colors border-2 border-[#1e3a8a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Case...
              </span>
            ) : (
              "CREATE CASE"
            )}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-700 px-8 py-3 font-bold hover:bg-gray-300 transition-colors"
          >
            CANCEL
          </button>
        </div>
      </div>
    </form>
  );
}
