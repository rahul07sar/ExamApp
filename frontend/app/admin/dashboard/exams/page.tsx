/**
 * Admin Exams List Page
 * Displays all exams in a read-only table for administrators.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Exam = {
  exam_id: string;
  title: string;
  max_attempts: number;
  cooldown_minutes: number;
  subject_name: string;
};

export default function AdminExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Exam | null>(null);

  useEffect(() => {
    async function loadExams() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/exams`,
        { credentials: "include" }
      );

      if (!res.ok) {
        router.replace("/dashboard");
        return;
      }

      const data = await res.json();
      setExams(data);
    }

    loadExams().catch(() => setError("Failed to load exams"));
  }, [router]);

  async function saveEdit() {
    if (!draft) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/exams/${draft.exam_id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          maxAttempts: draft.max_attempts,
          cooldownMinutes: draft.cooldown_minutes,
        }),
      }
    );

    if (!res.ok) {
      setError("Failed to update exam");
      return;
    }

    setExams((prev) =>
      prev.map((e) => (e.exam_id === draft.exam_id ? draft : e))
    );
    setEditingId(null);
    setDraft(null);
  }

  async function deleteExam(examId: string) {
    const ok = confirm("Delete this exam? This cannot be undone.");
    if (!ok) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/exams/${examId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!res.ok) {
      setError("Failed to delete exam");
      return;
    }

    setExams((prev) => prev.filter((e) => e.exam_id !== examId));
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-semibold mb-6">Exams</h1>

      {error && (
        <div className="mb-4 rounded bg-red-50 px-4 py-2 text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100 text-zinc-700">
            <tr>
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Max Attempts</th>
              <th className="px-4 py-3 text-left">Cooldown (min)</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {exams.map((exam) => {
              const isEditing = editingId === exam.exam_id;

              return (
                <tr
                  key={exam.exam_id}
                  className="border-t hover:bg-zinc-50"
                >
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                      {exam.subject_name}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        className="w-full rounded border px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                        value={draft?.title ?? ""}
                        onChange={(e) =>
                          setDraft({ ...draft!, title: e.target.value })
                        }
                      />
                    ) : (
                      exam.title
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        className="w-full rounded border px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                        value={draft?.max_attempts ?? 0}
                        onChange={(e) =>
                          setDraft({
                            ...draft!,
                            max_attempts: Number(e.target.value),
                          })
                        }
                      />
                    ) : (
                      exam.max_attempts
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        className="w-full rounded border px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                        value={draft?.cooldown_minutes ?? 0}
                        onChange={(e) =>
                          setDraft({
                            ...draft!,
                            cooldown_minutes: Number(e.target.value),
                          })
                        }
                      />
                    ) : (
                      exam.cooldown_minutes
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="rounded bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setDraft(null);
                          }}
                          className="rounded bg-zinc-200 px-3 py-1 text-zinc-700 hover:bg-zinc-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(exam.exam_id);
                            setDraft({ ...exam });
                          }}
                          className="rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteExam(exam.exam_id)}
                          className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

            {exams.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                  No exams found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
