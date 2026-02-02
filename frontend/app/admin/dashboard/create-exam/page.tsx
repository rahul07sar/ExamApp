"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateExamPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    examId: "",
    title: "",
    maxAttempts: "",
    cooldownMinutes: "",
  });

  function updateField(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/exams`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: form.examId,
          title: form.title,
          maxAttempts: Number(form.maxAttempts),
          cooldownMinutes: Number(form.cooldownMinutes),
        }),
      }
    );

    setForm({
      examId: "",
      title: "",
      maxAttempts: "",
      cooldownMinutes: "",
    });

    router.replace("/admin/dashboard");
  }

  return (
    <div className="p-10 max-w-xl">
      <h1 className="text-xl font-semibold mb-6">Create Exam</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="examId"
          placeholder="Exam GUID"
          value={form.examId}
          onChange={updateField}
          required
          className="w-full border p-2"
        />

        <input
          name="title"
          placeholder="Exam Title"
          value={form.title}
          onChange={updateField}
          required
          className="w-full border p-2"
        />

        <input
          name="maxAttempts"
          type="number"
          min={1}
          max={1000}
          placeholder="Max Attempts"
          value={form.maxAttempts}
          onChange={updateField}
          required
          className="w-full border p-2"
        />

        <input
          name="cooldownMinutes"
          type="number"
          min={0}
          max={525600}
          placeholder="Cooldown (minutes)"
          value={form.cooldownMinutes}
          onChange={updateField}
          required
          className="w-full border p-2"
        />

        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Create Exam
        </button>
      </form>
    </div>
  );
}
