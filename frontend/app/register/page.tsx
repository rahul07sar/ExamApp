/**
 * Registration page for students.
 * Handles user registration with subject selection.
 */
"use client";

import { useEffect, useState } from "react";

type Subject = {
  id: string;
  name: string;
};

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function RegisterPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/subjects`)
      .then((res) => res.json())
      .then(setSubjects)
      .catch(() => setError("Failed to load subjects"));
  }, []);

  function toggleSubject(id: string) {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  return (
    <div className="mx-auto mt-20 max-w-md rounded-xl bg-white p-8 shadow dark:bg-zinc-950">
      <h1 className="mb-6 text-2xl font-semibold">Student Registration</h1>

      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();

          const form = e.currentTarget;
          const email = (form.elements.namedItem("email") as HTMLInputElement)
            .value;
          const password = (
            form.elements.namedItem("password") as HTMLInputElement
          ).value;
          const confirm = (
            form.elements.namedItem("confirmPassword") as HTMLInputElement
          ).value;

          if (password !== confirm) {
            setError("Passwords do not match");
            return;
          }

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email,
                password,
                subjects: selectedSubjects
              })
            }
          );

          if (!res.ok) {
            setError("Registration failed");
          } else {
            form.reset();
            setSelectedSubjects([]);
            setSubjectsOpen(false);
            setError(null);
            alert("Registration successful");
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
            pattern={PASSWORD_REGEX.source}
            title="Min 8 chars, upper, lower, number & special char"
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

        {/* Confirm Password */}
        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            placeholder="Confirm Password"
            className="w-full rounded border p-3 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-3 text-sm text-zinc-500"
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Subjects Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSubjectsOpen((v) => !v)}
            className="w-full rounded border p-3 text-left text-zinc-500"
          >
            {selectedSubjects.length > 0
              ? `${selectedSubjects.length} subject(s) selected`
              : "Select subjects"}
          </button>

          {subjectsOpen && (
            <div className="absolute z-10 mt-2 max-h-48 w-full overflow-y-auto rounded border bg-white p-3 shadow dark:bg-zinc-900">
              {subjects.map((s) => (
                <label key={s.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(s.id)}
                    onChange={() => toggleSubject(s.id)}
                  />
                  {s.name}
                </label>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full rounded bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}
