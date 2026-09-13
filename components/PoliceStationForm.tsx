"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PoliceStationFormProps {
  initialData?: {
    _id?: string;
    name: string;
    sarkariId: string;
    district: string;
    address: string;
    phone?: string;
    status: string;
  };
  onSuccess?: () => void;
}

export default function PoliceStationForm({ initialData, onSuccess }: PoliceStationFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?._id;

  const [form, setForm] = useState({
    name: initialData?.name || "",
    sarkariId: initialData?.sarkariId || "",
    district: initialData?.district || "",
    address: initialData?.address || "",
    phone: initialData?.phone || "",
    status: initialData?.status || "ACTIVE",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const newFieldErrors: Record<string, string> = {};
    const requiredFields = ['name', 'sarkariId', 'district', 'address'];
    requiredFields.forEach(field => {
      if (!form[field as keyof typeof form].toString().trim()) {
        newFieldErrors[field] = "This field is required";
      }
    });
    setFieldErrors(newFieldErrors);
    if (Object.keys(newFieldErrors).length > 0) {
      setIsLoading(false);
      return;
    }

    try {
      const url = isEditing
        ? `/api/police-stations/${initialData._id}`
        : "/api/police-stations";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/police-stations");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Police Station Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter police station name"
            value={form.name}
            onChange={handleChange}
            className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${
              fieldErrors.name ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'
            }`}
            required
            disabled={isLoading}
          />
          {fieldErrors.name && <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>}
        </div>

        <div>
          <label
            htmlFor="sarkariId"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Sarkari ID *
          </label>
          <input
            id="sarkariId"
            name="sarkariId"
            type="text"
            placeholder="Enter sarkari ID"
            value={form.sarkariId}
            onChange={handleChange}
            className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${
              fieldErrors.sarkariId ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'
            }`}
            required
            disabled={isLoading}
          />
          {fieldErrors.sarkariId && <p className="text-red-500 text-sm mt-1">{fieldErrors.sarkariId}</p>}
        </div>

        <div>
          <label
            htmlFor="district"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            District *
          </label>
          <input
            id="district"
            name="district"
            type="text"
            placeholder="Enter district"
            value={form.district}
            onChange={handleChange}
            className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${
              fieldErrors.district ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'
            }`}
            required
            disabled={isLoading}
          />
          {fieldErrors.district && <p className="text-red-500 text-sm mt-1">{fieldErrors.district}</p>}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={handleChange}
            className="w-full border-2 px-4 py-2 focus:outline-none text-black border-gray-300 focus:border-[#1e3a8a]"
            disabled={isLoading}
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="address"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Address *
          </label>
          <textarea
            id="address"
            name="address"
            placeholder="Enter full address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${
              fieldErrors.address ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'
            }`}
            required
            disabled={isLoading}
          />
          {fieldErrors.address && <p className="text-red-500 text-sm mt-1">{fieldErrors.address}</p>}
        </div>

        {isEditing && (
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border-2 px-4 py-2 focus:outline-none text-black border-gray-300 focus:border-[#1e3a8a]"
              disabled={isLoading}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-[#1e3a8a] text-white rounded hover:bg-[#152a63] disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : isEditing ? "Update Police Station" : "Create Police Station"}
        </button>
      </div>
    </form>
  );
}