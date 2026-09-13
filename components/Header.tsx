"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // reset the loading indicator any time we navigate or the session updates
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, session]);

  const isDashboard =
    pathname.includes("/dashboard") ||
    pathname.includes("/cases") ||
    pathname.includes("/properties") ||
    pathname.includes("/reports") ||
    pathname.includes("/police-stations") ||
    pathname.includes("/users") ||
    pathname.includes("/transferProperty") ||
    pathname.includes("/transferPropertyLog") ||
    pathname.includes("/alerts");

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await fetch("/api/auth/logout", { method: "POST" });
      // Clear NextAuth session cookies client-side
      document.cookie = "next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "__Secure-next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
      // router.refresh(); // no need to refresh after a hard redirect
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <header className="bg-[#1e3a8a] text-white shadow-lg">
      <div className="px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 hover:opacity-90 transition"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-md">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#1e3a8a] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">
                  EM
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">e-Malkhana</h1>
              <p className="text-xs sm:text-sm text-blue-200">
                Digital Evidence Management System
              </p>
            </div>
          </Link>

          {isDashboard && session && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
              <div className="flex items-center gap-3 bg-[#1e40af] px-4 py-2 rounded-lg shadow-md w-full sm:w-auto">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[#1e3a8a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold block">
                    {session.user?.name}
                  </span>
                  {(session.user as any)?.role === "ADMIN" && (
                    <span className="text-xs bg-[#ffc107] text-[#856404] px-2 py-0.5 rounded font-bold">
                      ADMIN
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full sm:w-auto bg-[#dc3545] hover:bg-[#c82333] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-semibold transition"
              >
                {isLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}