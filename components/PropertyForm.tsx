"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProperty } from "@/app/cases/[caseId]/properties/new/actions";
import { createStandaloneProperty } from "@/app/properties/new/actions";

export default function PropertyForm({ caseId }: { caseId?: string }) {
  const router = useRouter();

  const [form, setForm] = useState({
    propertyType: "",
    category: "",
    customCategory: "",
    belongingTo: "UNKNOWN",
    natureOfProperty: "",
    gdNumber: "",
    gdDate: "",
    seizureDate: "",
    quantity: "",
    units: "",
    storageLocation: "",
    description: "",
  });

  const isGdDisabled = form.propertyType === "CASE_RELATED" || form.propertyType === "KURKI";

  const PROPERTY_CATEGORIES = [
    "Electronics",
    "Weapons/Arms",
    "Narcotics/Drugs",
    "Vehicles",
    "Jewelry/Valuables",
    "Documents",
    "Cash/Currency",
    "Clothing",
    "Explosive Materials",
    "Stolen Property",
    "Counterfeit Items",
    "Digital Evidence",
    "Biological Evidence",
    "Tools/Instruments",
    "Alcohol",
    "Chemical",
    "Other",
  ];

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target;
    if (name === "propertyType" && (value === "CASE_RELATED" || value === "KURKI")) {
      setForm({ ...form, [name]: value, gdNumber: "", gdDate: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError("");

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await res.json();
        return data.url as string;
      });

      const urls = await Promise.all(uploadPromises);
      setImageUrls((prev) => [...prev, ...urls]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Image upload failed. Please try again."
      );
    } finally {
      setIsUploading(false);
      // Reset the input so the same files can be selected again
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (imageUrls.length === 0) {
      setError("Please upload at least one property image before submitting");
      setIsLoading(false);
      return;
    }

    try {
      const propertyData = {
        caseId,
        propertyType: form.propertyType,
        category: form.category === "Other" ? form.customCategory : form.category,
        belongingTo: form.belongingTo,
        natureOfProperty: form.natureOfProperty,
        gdNumber: isGdDisabled ? "" : form.gdNumber,
        gdDate: isGdDisabled ? "" : form.gdDate,
        seizureDate: form.seizureDate,
        quantity: form.quantity,
        units: form.units,
        storageLocation: form.storageLocation,
        description: form.description,
        itemImages: imageUrls,
      };

      const result = caseId
        ? await createProperty({ ...propertyData, caseId })
        : await createStandaloneProperty(propertyData);

      if (!result.success) {
        setError(result.error || "Failed to add property. Please try again.");
        setIsLoading(false);
        return;
      }

      const redirectUrl = caseId
        ? `/cases/${caseId}/properties/${result.data!.propertyId}`
        : `/properties/${result.data!.propertyId}`;

      router.replace(redirectUrl);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white border-2 border-gray-300 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-[#1e3a8a] text-white px-6 py-5">
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
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Property Registration Form
          </h3>
          <p className="text-sm text-blue-200 mt-1">
            All fields marked with * are mandatory
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Image Upload Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#1e3a8a] p-5 rounded-r-lg shadow-sm">
            <h4 className="font-bold text-[#1e3a8a] mb-4 text-lg flex items-center gap-2">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Property Image Upload
            </h4>

            <div className="space-y-4">
              {/* Uploaded Images Gallery */}
              {imageUrls.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Uploaded Images ({imageUrls.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={url} className="relative group">
                        <img
                          src={url}
                          alt={`Property image ${index + 1}`}
                          className="w-full h-32 object-cover border-2 border-gray-300 rounded-lg shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700"
                        >
                          ✕
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button - always visible to add more */}
              <div className="border-2 border-dashed border-gray-300 p-8 text-center bg-white rounded-lg hover:border-[#1e3a8a] transition-colors">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-700 font-bold mb-1">
                  {imageUrls.length === 0
                    ? "Upload Property Images *"
                    : "Add More Images"}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Select one or multiple images (JPEG, PNG, WebP — max 10MB each)
                </p>
                <label className="inline-block cursor-pointer bg-[#1e3a8a] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e40af] transition-colors">
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    "Choose Images"
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Property Type Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#1e3a8a] p-5 rounded-r-lg shadow-sm">
            <h4 className="font-bold text-[#1e3a8a] mb-4 text-lg flex items-center gap-2">
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Property Type & Classification
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="propertyType"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Property Type *
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={form.propertyType}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a] focus:ring-opacity-20 transition-all duration-200 text-black"
                  required
                  disabled={isLoading}
                >
                  <option value="">-- Select Property Type --</option>
                  <option value="CASE_RELATED">Case Related</option>
                  <option value="KURKI">Kurki</option>
                  <option value="UNCLAIMED">Unclaimed</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Category of Property *
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a] focus:ring-opacity-20 transition-all duration-200 text-black"
                  required
                  disabled={isLoading}
                >
                  <option value="">-- Select Category --</option>
                  {PROPERTY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {form.category === "Other" && (
                <div>
                  <label
                    htmlFor="customCategory"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Specify Category *
                  </label>
                  <input
                    id="customCategory"
                    name="customCategory"
                    type="text"
                    placeholder="Enter custom category"
                    value={form.customCategory}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a] focus:ring-opacity-20 transition-all duration-200 text-black"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="belongingTo"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Belonging To *
                </label>
                <select
                  id="belongingTo"
                  name="belongingTo"
                  value={form.belongingTo}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a] focus:ring-opacity-20 transition-all duration-200 text-black"
                  disabled={isLoading}
                >
                  <option value="ACCUSED">Accused</option>
                  <option value="COMPLAINANT">Complainant</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="natureOfProperty"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Nature of Property *
                </label>
                <input
                  id="natureOfProperty"
                  name="natureOfProperty"
                  type="text"
                  placeholder="e.g., Mobile Phone, Gold Chain, Motorcycle"
                  value={form.natureOfProperty}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a] focus:ring-opacity-20 transition-all duration-200 text-black"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* GD & Seizure Details Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#1e3a8a] p-5 rounded-r-lg shadow-sm">
            <h4 className="font-bold text-[#1e3a8a] mb-4 text-lg flex items-center gap-2">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              GD & Seizure Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="gdNumber"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  GD Number {!isGdDisabled && "*"}
                </label>
                <input
                  id="gdNumber"
                  name="gdNumber"
                  type="text"
                  placeholder={isGdDisabled ? "N/A" : "Enter GD number"}
                  value={isGdDisabled ? "" : form.gdNumber}
                  onChange={handleChange}
                  className={`w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a] focus:ring-opacity-20 transition-all duration-200 text-black ${isGdDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  required={!isGdDisabled}
                  disabled={isLoading || isGdDisabled}
                />
                {isGdDisabled && (
                  <p className="text-xs text-gray-500 mt-1">Not applicable for {form.propertyType === "CASE_RELATED" ? "Case Related" : "Kurki"} properties</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="gdDate"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  GD Date {!isGdDisabled && "*"}
                </label>
                <input
                  id="gdDate"
                  name="gdDate"
                  type="date"
                  value={isGdDisabled ? "" : form.gdDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  className={`w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a] focus:ring-opacity-20 transition-all duration-200 text-black ${isGdDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  required={!isGdDisabled}
                  disabled={isLoading || isGdDisabled}
                />
                {isGdDisabled && (
                  <p className="text-xs text-gray-500 mt-1">Not applicable for {form.propertyType === "CASE_RELATED" ? "Case Related" : "Kurki"} properties</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="seizureDate"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Date of Seizure *
                </label>
                <input
                  id="seizureDate"
                  name="seizureDate"
                  type="date"
                  value={form.seizureDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a] focus:ring-opacity-20 transition-all duration-200 text-black"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Quantity & Storage Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#1e3a8a] p-5 rounded-r-lg shadow-sm">
            <h4 className="font-bold text-[#1e3a8a] mb-4 text-lg flex items-center gap-2">
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              Quantity & Storage
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Quantity *
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="text"
                  placeholder="Enter quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a] focus:ring-opacity-20 transition-all duration-200 text-black"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="units"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Units *
                </label>
                <input
                  id="units"
                  name="units"
                  type="text"
                  placeholder="e.g., pieces, grams, liters"
                  value={form.units}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a] focus:ring-opacity-20 transition-all duration-200 text-black"
                  disabled={isLoading}
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="storageLocation"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Storage Location *
                </label>
                <input
                  id="storageLocation"
                  name="storageLocation"
                  type="text"
                  placeholder="e.g., Rack A-12, Room 3, Locker 45"
                  value={form.storageLocation}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a] focus:ring-opacity-20 transition-all duration-200 text-black"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#1e3a8a] p-5 rounded-r-lg shadow-sm">
            <h4 className="font-bold text-[#1e3a8a] mb-4 text-lg flex items-center gap-2">
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
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
              Property Description
            </h4>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Detailed Description *
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter detailed description including brand, model, color, serial number, unique identifiers, condition, etc."
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a] focus:ring-opacity-20 resize-none transition-all duration-200 text-black"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-2">
                Provide as much detail as possible for identification purposes
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-[#f8d7da] border-l-4 border-[#dc3545] p-4 rounded-r-lg shadow-md animate-shake">
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

          <div className="bg-[#fff3cd] border-l-4 border-[#ffc107] p-4 rounded-r-lg shadow-sm">
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
                  After saving, a unique QR code will be generated for this
                  property. You can print it and attach it to the physical
                  property for easy tracking.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading || imageUrls.length === 0}
              className="flex-1 bg-[#1e3a8a] text-white py-3 rounded-lg font-bold hover:bg-[#1e40af] transition-all duration-300 border-2 border-[#1e3a8a] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
                  Saving Property...
                </span>
              ) : (
                "SAVE PROPERTY & GENERATE QR CODE"
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
