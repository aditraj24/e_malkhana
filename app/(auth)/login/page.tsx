"use client";

import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#f8f9fa] border-b border-gray-300">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-[#1e3a8a]">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#1e3a8a] font-semibold">Officer Login</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}