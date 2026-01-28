/**
 * Home page for ExamApp.
 */
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-black">
      {/* Hero Section */}
      <main className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-32 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Secure. Fair. Time-Bound Exams.
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          ExamApp ensures integrity with strict attempt limits, cooldowns, and
          real-time eligibility checks — built for both teachers and students.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700"
          >
            Get Started
          </Link>

          <Link
            href="/learn-more"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Learn More
          </Link>
        </div>
      </main>
    </div>
  );
}
