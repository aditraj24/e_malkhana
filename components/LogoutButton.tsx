"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // ensure the button isn't stuck in loading mode if the component is reused
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await fetch("/api/auth/logout", { method: "POST" });
      // Clear NextAuth session cookie client-side
      document.cookie = "next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "__Secure-next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
      // no need to call router.refresh here, redirect will unmount this component
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="bg-[#dc3545] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#c82333] transition-all duration-200 disabled:opacity-50 text-sm"
    >
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
}
