/**
 * Global navigation bar.
 * - Shows auth actions based on login state
 * - Provides navigation back to user dashboard
 */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let ignore = false;

    async function checkAuth() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
          {
            credentials: "include",
            cache: "no-store"
          }
        );

        if (!ignore) setLoggedIn(res.ok);
      } catch {
        if (!ignore) setLoggedIn(false);
      }
    }

    checkAuth();

    return () => {
      ignore = true;
    };
  }, [pathname]);

  async function logout() {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include"
    });

    setLoggedIn(false);
    router.replace("/");
  }
  
  if (loggedIn === null) return null;

  return (
    <header className="flex items-center justify-between px-10 py-6">
      <Link href="/" className="text-xl font-semibold">
        ExamApp
      </Link>

      {loggedIn ? (
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="font-medium text-zinc-700 hover:underline"
          >
            Your Profile
          </Link>

          <button
            onClick={logout}
            className="rounded border px-4 py-2 font-medium hover:bg-zinc-100"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </div>
      )}
    </header>
  );
}
