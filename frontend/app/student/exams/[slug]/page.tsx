/**
 * Student exam attempt page. This page is shown to students when they click on an exam to attempt it.
 * It shows instructions and a button to start the exam. Once the exam is started, it cannot be stopped.
 * The student can also choose to attempt the exam later, which will take them back to the exams list.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ExamAttemptPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const examId = useMemo(() => {
    if (!params?.slug) return "";
    return Array.isArray(params.slug) ? params.slug[0] : params.slug;
  }, [params]);

  const apiBase = useMemo(() => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
    return baseUrl.replace(/\/$/, "");
  }, []);

  useEffect(() => {
    history.pushState(null, "", location.href);

    const blockBack = () => {
      history.pushState(null, "", location.href);
    };

    window.addEventListener("popstate", blockBack);

    return () => {
      window.removeEventListener("popstate", blockBack);
    };
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-semibold mb-6">Exam Instructions</h1>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="flex gap-4">
        <button
          onClick={() => setOpen(true)}
          disabled={started || starting}
          aria-disabled={started || starting}
          className={`rounded px-4 py-2 text-white ${
            started || starting
              ? "cursor-not-allowed bg-indigo-300"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {starting ? "Starting..." : "Start Exam"}
        </button>

        <button
          onClick={() => router.replace("/student/exams")}
          disabled={started || starting}
          aria-disabled={started || starting}
          className={`rounded px-4 py-2 ${
            started || starting
              ? "cursor-not-allowed bg-zinc-200 text-zinc-400"
              : "bg-zinc-200 text-zinc-800 hover:bg-zinc-300"
          }`}
        >
          Attempt Later
        </button>

        <button
          onClick={() => router.replace("/student/dashboard")}
          disabled={!started}
          aria-disabled={!started}
          className={`rounded px-4 py-2 text-white ${
            started
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "cursor-not-allowed bg-emerald-300"
          }`}
        >
          Finish Exam
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
            <p className="mb-6 text-zinc-800">
              Exam once started cannot be stopped
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={async () => {
                  if (!examId) {
                    setError("Missing exam id");
                    setOpen(false);
                    return;
                  }

                  setStarting(true);
                  setError(null);

                  try {
                    const res = await fetch(
                      `${apiBase}/student/exams/${examId}/start`,
                      {
                        method: "POST",
                        credentials: "include"
                      }
                    );

                    if (res.status === 401 || res.status === 403) {
                      router.replace("/login");
                      return;
                    }

                    if (!res.ok) {
                      const data = await res.json().catch(() => null);
                      setError(data?.error ?? "Failed to start exam");
                      setOpen(false);
                      return;
                    }

                    setStarted(true);
                    setOpen(false);
                    alert("Exam started");
                  } catch {
                    setError("Failed to start exam");
                    setOpen(false);
                  } finally {
                    setStarting(false);
                  }
                }}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                OK
              </button>

              <button
                onClick={() => setOpen(false)}
                className="rounded bg-zinc-200 px-4 py-2 text-zinc-800 hover:bg-zinc-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
