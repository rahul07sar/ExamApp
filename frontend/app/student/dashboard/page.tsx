/**
 * Student dashboard.
 */
export default function StudentDashboard() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-semibold">Student Dashboard</h1>

      <div className="mt-6">
        <a
          href="/student/exams"
          className="inline-block rounded bg-black px-4 py-2 text-white"
        >
          View Available Exams
        </a>
      </div>
    </div>
  );
}
