"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/app/users/new/actions";
import PoliceStationSelect from "@/components/PoliceStationSelect";

export default function UserForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "OFFICER",
    officerId: "",
    policeStation: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const newFieldErrors: Record<string, string> = {};
    const requiredFields = ['fullName', 'email', 'username', 'password', 'confirmPassword', 'officerId', 'policeStation', 'role'];
    requiredFields.forEach(field => {
      if (!form[field as keyof typeof form].toString().trim()) {
        newFieldErrors[field] = "Fill this field";
      }
    });
    setFieldErrors(newFieldErrors);
    if (Object.keys(newFieldErrors).length > 0) {
      setIsLoading(false);
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      setError(
        "Username must be 3-20 characters and contain only letters, numbers, and underscores",
      );
      setIsLoading(false);
      return;
    }

    try {
      const result = await createUser({
        fullName: form.fullName,
        email: form.email,
        username: form.username,
        password: form.password,
        role: form.role,
        officerId: form.officerId,
        policeStation: form.policeStation,
      });
      if (!result.success) {
        setError(result.error || "Failed to create user");
        setIsLoading(false);
        return;
      }
      router.replace("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-300">
      <div className="bg-[#1e3a8a] text-white px-6 py-4">
        <h3 className="text-xl font-bold">Create New User Account</h3>
        <p className="text-sm text-blue-200 mt-1">
          All fields marked with * are mandatory
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Full Name *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter full name"
              value={form.fullName}
              onChange={handleChange}
              className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${fieldErrors.fullName ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'}`}
              required
              disabled={isLoading}
            />
            {fieldErrors.fullName && <p className="text-red-500 text-sm mt-1">{fieldErrors.fullName}</p>}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={handleChange}
              className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${fieldErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'}`}
              required
              disabled={isLoading}
            />
            {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Username *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter username (3-20 characters)"
              value={form.username}
              onChange={handleChange}
              className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${fieldErrors.username ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'}`}
              required
              disabled={isLoading}
            />
            {fieldErrors.username && <p className="text-red-500 text-sm mt-1">{fieldErrors.username}</p>}
          </div>

          <div>
            <label
              htmlFor="officerId"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Officer ID *
            </label>
            <input
              id="officerId"
              name="officerId"
              type="text"
              placeholder="Enter officer ID"
              value={form.officerId}
              onChange={handleChange}
              className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${fieldErrors.officerId ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'}`}
              required
              disabled={isLoading}
            />
            {fieldErrors.officerId && <p className="text-red-500 text-sm mt-1">{fieldErrors.officerId}</p>}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password (min 8 characters)"
              value={form.password}
              onChange={handleChange}
              className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${fieldErrors.password ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'}`}
              required
              disabled={isLoading}
            />
            {fieldErrors.password && <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'}`}
              required
              disabled={isLoading}
            />
            {fieldErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword}</p>}
          </div>

          <div>
            <label
              htmlFor="policeStation"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Police Station *
            </label>
            <PoliceStationSelect
              value={form.policeStation}
              onChange={(value) => setForm({ ...form, policeStation: value })}
              disabled={isLoading}
              required
              error={fieldErrors.policeStation}
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${fieldErrors.role ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'}`}
              required
              disabled={isLoading}
            >
              <option value="OFFICER">Officer</option>
              <option value="SHO">SHO</option>
              <option value="ADMIN">Admin</option>
            </select>
            {fieldErrors.role && <p className="text-red-500 text-sm mt-1">{fieldErrors.role}</p>}
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
                Creating User...
              </span>
            ) : (
              "CREATE USER"
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
