/**
 * Student exam attempt page. This page is shown to students when they click on an exam to attempt it.
 * It shows instructions and a button to start the exam. Once the exam is started, it cannot be stopped.
 * Closing the page or browser after starting the exam still counts as an attempt.
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ExamAttemptPage() {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [started, setStarted] = useState(false);

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

  async function startExam() {
    setConfirmOpen(false);
    setStarted(true);
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-semibold mb-6">Exam Instructions</h1>

      {!started && (
        <div className="flex gap-4">
          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Start Exam
          </button>

          <button
            onClick={() => router.replace("/student/exams")}
            className="rounded bg-zinc-200 px-4 py-2 text-zinc-800 hover:bg-zinc-300"
          >
            Attempt Later
          </button>
        </div>
      )}

      {started && (
        <div className="mt-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">
          Exam has started. Leaving this page will still count as an attempt.
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
            <p className="mb-6 text-zinc-800">
              Exam once started cannot be stopped.
            </p>

            <div className="flex justify-end">
              <button
                onClick={startExam}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
