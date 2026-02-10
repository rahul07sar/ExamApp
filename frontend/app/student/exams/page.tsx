/**
 * This is the frontend page for students to view and attempt available exams.
 * It fetches the list of exams from the backend and displays them in a table.
 * Each exam has an "Attempt Exam" button that navigates to the exam page.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Exam = {
  exam_id: string;
  title: string;
  subject: string;
  max_attempts: number;
  remaining_attempts?: number;
  cooldown_minutes: number;
  cooldown_remaining_seconds?: number;
};

export default function StudentExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadedAt, setLoadedAt] = useState<number>(Date.now());
  const [now, setNow] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

useEffect(() => {
  async function load() {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
    const apiBase = baseUrl.replace(/\/$/, "");
    const res = await fetch(
      `${apiBase}/student/exams`,
      { credentials: "include", cache: "no-store" }
    );

      if (res.status === 401 || res.status === 403) {
        router.replace("/login");
        return;
      }

    const data = await res.json();
    setExams(Array.isArray(data) ? data : []);
    setLoadedAt(Date.now());
  }

  const safeLoad = () => load().catch(() => setError("Failed to load exams"));

  safeLoad();

  const handleFocus = () => safeLoad();
  const handleVisibility = () => {
    if (!document.hidden) {
      safeLoad();
    }
  };

  window.addEventListener("focus", handleFocus);
  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    window.removeEventListener("focus", handleFocus);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}, [router]);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-semibold mb-6">Available Exams</h1>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="overflow-hidden rounded-xl border shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100">
            <tr>
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Attempts Left</th>
              <th className="px-4 py-3 text-left">Cooldown (min)</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((e) => {
              const baseRemaining =
                typeof e.remaining_attempts === "number"
                  ? e.remaining_attempts
                  : e.max_attempts;
              const baseCooldown =
                typeof e.cooldown_remaining_seconds === "number"
                  ? e.cooldown_remaining_seconds
                  : 0;
              const elapsedSeconds = Math.floor((now - loadedAt) / 1000);
              const cooldownRemaining = Math.max(
                0,
                baseCooldown - elapsedSeconds
              );
              const exhausted = baseRemaining <= 0;
              const onCooldown = cooldownRemaining > 0;
              const disabled = exhausted || onCooldown;
              const minutes = Math.floor(cooldownRemaining / 60);
              const seconds = cooldownRemaining % 60;

              return (
                <tr key={e.exam_id} className="border-t hover:bg-zinc-50">
                  <td className="px-4 py-3">{e.subject}</td>
                  <td className="px-4 py-3">{e.title}</td>
                  <td className="px-4 py-3">{baseRemaining}</td>
                  <td className="px-4 py-3">{e.cooldown_minutes}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        router.push(`/student/exams/${e.exam_id}`)
                      }
                      disabled={disabled}
                      aria-disabled={disabled}
                      className={`rounded px-3 py-1 text-white ${
                        disabled
                          ? "cursor-not-allowed bg-indigo-300"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      Attempt Exam
                    </button>
                    {exhausted && (
                      <div className="mt-2 text-xs text-red-600">
                        Maximum attempts reached
                      </div>
                    )}
                    {!exhausted && onCooldown && (
                      <div className="mt-2 text-xs text-zinc-600">
                        Cooldown: {minutes}m {seconds}s
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {exams.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                  No exams available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
