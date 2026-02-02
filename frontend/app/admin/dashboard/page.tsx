import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      <p className="mt-4 text-zinc-600">
        Exam management, subjects, and student controls will appear here.
      </p>

      <Link
        href="/admin/dashboard/create-exam"
        className="inline-block mt-6 rounded bg-black px-4 py-2 text-white"
      >
        Create Exam
      </Link>
    </div>
  );
}
