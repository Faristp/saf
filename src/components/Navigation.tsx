"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // Don't show navigation on login page
  if (pathname === "/auth/login") {
    return null;
  }

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/invoices" className="text-2xl font-bold text-blue-600">
          SAF - Invoice Manager
        </Link>

        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging out..." : "Logout"}
        </button>
      </div>
    </nav>
  );
}
