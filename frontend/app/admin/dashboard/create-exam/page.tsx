"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Subject = {
  id: string;
  name: string;
};

export default function CreateExamPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    subjectId: "",
    title: "",
    maxAttempts: "",
    cooldownMinutes: "",
  });
  
  useEffect(() => {
    async function checkAdmin() {
        const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
        { credentials: "include" }
        );

        if (!res.ok) {
        router.replace("/login");
        return;
        }

        const { role } = await res.json();
        if (role !== "admin") {
        router.replace("/dashboard");
        }
    }

    checkAdmin();
    }, [router]);

  useEffect(() => {
    async function loadSubjects() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/subjects`,
        { credentials: "include" }
      );
      const data = await res.json();
      setSubjects(data);
    }
    loadSubjects();
  }, []);

  function updateField(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/exams`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: form.subjectId,
          title: form.title,
          maxAttempts: Number(form.maxAttempts),
          cooldownMinutes: Number(form.cooldownMinutes),
        }),
      }
    );

    if (!res.ok) {
      setMessage("Failed to create exam");
      return;
    }

    setMessage("Exam created successfully");

    setForm({
      subjectId: "",
      title: "",
      maxAttempts: "",
      cooldownMinutes: "",
    });

    setTimeout(() => {
      router.replace("/admin/dashboard");
    }, 800);
  }

  return (
    <div className="p-10 max-w-xl">
      <h1 className="text-xl font-semibold mb-6">Create Exam</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="subjectId"
          value={form.subjectId}
          onChange={updateField}
          required
          className="w-full border p-2"
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

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

        {message && (
          <p className="text-sm text-zinc-700">{message}</p>
        )}
      </form>
    </div>
  );
}
