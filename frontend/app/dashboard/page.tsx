/**
 * Unified dashboard entry point.
 * Redirects user to role-specific dashboard.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function resolveRole() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
        { credentials: "include" }
      );

      if (!res.ok) {
        router.replace("/login");
        return;
      }

      const { role } = await res.json();

      router.replace(
        role === "admin"
          ? "/admin/dashboard"
          : "/student/dashboard"
      );
    }

    resolveRole();
  }, [router]);

  return null;
}
