/**
 * This is the frontend page for students to view and attempt available exams.
 * It fetches the list of exams from the backend and displays them in a table.
 * Each exam has an "Attempt Exam" button that navigates to the exam page.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Exam = {
  exam_id: string;
  title: string;
  subject: string;
  max_attempts: number;
  cooldown_minutes: number;
};

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function StudentExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(
        "http://localhost:4000/student/exams",
        { credentials: "include", cache: "no-store" }
      );

      if (res.status === 401 || res.status === 403) {
        router.replace("/login");
        return;
      }

      const data = await res.json();
      setExams(Array.isArray(data) ? data : []);
    }

    load().catch(() => setError("Failed to load exams"));
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
              <th className="px-4 py-3 text-left">Attempts</th>
              <th className="px-4 py-3 text-left">Cooldown (min)</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((e) => (
              <tr key={e.exam_id} className="border-t hover:bg-zinc-50">
                <td className="px-4 py-3">{e.subject}</td>
                <td className="px-4 py-3">{e.title}</td>
                <td className="px-4 py-3">{e.max_attempts}</td>
                <td className="px-4 py-3">{e.cooldown_minutes}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      router.push(`/exam/${slugify(e.title)}`)
                    }
                    className="rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700"
                  >
                    Attempt Exam
                  </button>
                </td>
              </tr>
            ))}
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
