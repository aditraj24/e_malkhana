"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const newFieldErrors: Record<string, string> = {};
    if (!username.trim()) {
      newFieldErrors.username = "Fill this field";
    }
    if (!password.trim()) {
      newFieldErrors.password = "Fill this field";
    }
    setFieldErrors(newFieldErrors);
    if (Object.keys(newFieldErrors).length > 0) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
        setIsLoading(false);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="bg-white border-2 border-[#1e3a8a] shadow-xl rounded-lg overflow-hidden">
        <div className="bg-[#1e3a8a] text-white px-6 py-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
              <svg
                className="w-7 h-7 text-[#1e3a8a]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Officer Login</h1>
          </div>
          <p className="text-center text-blue-200 text-sm">
            Authorized Personnel Only
          </p>
        </div>

        <div className="px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Username / Officer ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full border-2 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:ring-opacity-20 text-black transition-all duration-200 ${fieldErrors.username ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'}`}
                  required
                  disabled={isLoading}
                />
                {fieldErrors.username && <p className="text-red-500 text-sm mt-1">{fieldErrors.username}</p>}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border-2 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:ring-opacity-20 text-black transition-all duration-200 ${fieldErrors.password ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'}`}
                  required
                  disabled={isLoading}
                />
                {fieldErrors.password && <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>}
              </div>
            </div>

            {error && (
              <div className="bg-[#f8d7da] border-l-4 border-[#dc3545] p-3 rounded-lg shadow-sm animate-shake">
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
                  <p className="text-sm text-[#721c24] font-semibold">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1e3a8a] text-white py-3 rounded-lg font-bold hover:bg-[#1e40af] transition-all duration-300 border-2 border-[#1e3a8a] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
                  Verifying...
                </span>
              ) : (
                "LOGIN"
              )}
            </button>

            <div className="text-center pt-4">
              <Link
                href="/"
                className="text-sm text-[#1e3a8a] hover:underline font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-6 bg-[#fff3cd] border-l-4 border-[#ffc107] p-4 rounded-lg shadow-md">
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
            <h4 className="font-bold text-[#856404] mb-1">Security Notice</h4>
            <ul className="text-sm text-[#856404] space-y-1">
              <li>• Do not share your login credentials with anyone</li>
              <li>• All login attempts are logged and monitored</li>
              <li>• Unauthorized access will be reported to authorities</li>
              <li>• Contact IT helpdesk for password reset</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="bg-[#f8f9fa] border border-gray-300 p-5 rounded-lg shadow-md">
          <h3 className="font-bold text-gray-700 mb-3 text-lg">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Contact IT Support for login assistance
          </p>
          <div className="text-sm text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
            <p className="mb-2">
              <strong>Email:</strong> support@emalkhana.gov.in
            </p>
            <p className="mb-2">
              <strong>Helpline:</strong> 1800-XXX-XXXX
            </p>
            <p className="text-xs text-gray-500 mt-3">
              (Mon-Fri, 9:00 AM - 6:00 PM)
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
