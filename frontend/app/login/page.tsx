/**
 * Login page for Admins & Students.
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
      credentials: "include",
      cache: "no-store"
    }).then((res) => {
      if (res.ok) {
        router.replace("/");
      }
    });
  }, [router]);

  return (
    <div className="mx-auto mt-24 max-w-md rounded-xl bg-white p-8 shadow dark:bg-zinc-950">
      <h1 className="mb-6 text-2xl font-semibold">Login</h1>

      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);

          const form = e.currentTarget;
          const email = (form.elements.namedItem("email") as HTMLInputElement)
            .value;
          const password = (
            form.elements.namedItem("password") as HTMLInputElement
          ).value;

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ email, password })
            }
          );

          if (!res.ok) {
            setError("Invalid email or password");
            return;
          }

          const data = await res.json();

          if (data.role === "admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/student/dashboard");
          }
        }}
      >
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full rounded border p-3"
        />

        {/* Password */}
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Password"
            className="w-full rounded border p-3 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-3 text-sm text-zinc-500"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full rounded bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
