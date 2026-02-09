/**
 * Admin Dashboard Page
 * This page serves as the main dashboard for administrators to manage exams, subjects, and students.
 */

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      <p className="mt-4 text-zinc-600">
        Exam management, subjects, and student controls will appear here.
      </p>

      <div className="mt-6 flex gap-4">
        <Link
          href="/admin/dashboard/create-exam"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Create Exam
        </Link>

        <Link
          href="/admin/dashboard/exams"
          className="rounded bg-zinc-800 px-4 py-2 text-white"
        >
          View Exams
        </Link>
      </div>
    </div>
  );
}
