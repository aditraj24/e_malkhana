"use client";

import Link from "next/link";
import UserForm from "@/components/UserForm";

export default function NewUserPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#f8f9fa] border-b border-gray-300">
        <div className="px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-[#1e3a8a]">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/dashboard" className="hover:text-[#1e3a8a]">
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#1e3a8a] font-semibold">Create User</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-8">
        <div className="mx-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-[#1e3a8a]">
              Create New User
            </h2>
            <p className="text-gray-600 mt-2">
              Add a new officer or admin to the system
            </p>
          </div>

          <div className="bg-[#fff3cd] border-l-4 border-[#ffc107] p-4 mb-6">
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
                <h4 className="font-bold text-[#856404] mb-1">
                  Admin Access Required
                </h4>
                <p className="text-sm text-[#856404]">
                  This action requires administrator privileges. Only authorized
                  admins can create new user accounts.
                </p>
              </div>
            </div>
          </div>

          <UserForm />

          <div className="mt-6 bg-[#e7f3ff] border-l-4 border-[#1e3a8a] p-4">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-[#1e3a8a] mr-3 flex-shrink-0"
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
                <h4 className="font-bold text-[#1e3a8a] mb-1">Security Note</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• User credentials should be kept confidential</li>
                  <li>
                    • Users will be able to change their password after first
                    login
                  </li>
                  <li>• Admin privileges should be granted cautiously</li>
                  <li>• All user activities are logged for audit purposes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
