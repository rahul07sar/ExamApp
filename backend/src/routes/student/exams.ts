/**
 * Student exams route.
 */

import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { pool } from "../../db/pool.js";

const router = Router();

/**
 * GET /student/exams
 * Returns all exams for students including subject, title, max attempts, and cooldown.
 */
router.get(
  "/exams",
  requireAuth,
  requireRole("student"),
  async (req: Request, res: Response) => {
    try {
      const studentId = req.user.sub;

      const { rows } = await pool.query(
        `
        SELECT
          e.exam_id,
          e.title,
          e.max_attempts,
          e.cooldown_minutes,
          s.name AS subject,
          GREATEST(
            e.max_attempts - COALESCE(a.used_attempts, 0),
            0
          ) AS remaining_attempts,
          CASE
            WHEN a.last_started_at IS NULL THEN 0
            ELSE GREATEST(
              CEIL(
                EXTRACT(
                  EPOCH FROM (
                    a.last_started_at
                    + (e.cooldown_minutes || ' minutes')::interval
                    - NOW()
                  )
                )
              ),
              0
            )::int
          END AS cooldown_remaining_seconds
        FROM exams e
        JOIN subjects s ON s.id = e.subject_id
        LEFT JOIN (
          SELECT
            exam_id,
            COUNT(*)::int AS used_attempts,
            MAX(started_at) AS last_started_at
          FROM exam_attempts
          WHERE student_id = $1
          GROUP BY exam_id
        ) a ON a.exam_id = e.exam_id
        WHERE EXISTS (
          SELECT 1
          FROM user_subjects us
          WHERE us.user_id = $1
            AND us.subject_id = e.subject_id
        )
        ORDER BY e.created_at DESC
        `,
        [studentId]
      );

      return res.json(rows);
    } catch (err) {
      console.error("Fetch student exams failed:", err);
      return res.status(500).json({ error: "Failed to fetch exams" });
    }
  }
);

/**
 * POST /student/exams/:examId/start
 * Consumes an attempt when a student starts an exam.
 * Attempt is counted immediately and cannot be rolled back.
 */
router.post(
  "/exams/:examId/start",
  requireAuth,
  requireRole("student"),
  async (req: Request, res: Response) => {
    const { examId } = req.params;
    const studentId = req.user.sub;

    if (!/^[0-9a-fA-F-]{36}$/.test(examId)) {
      return res.status(400).json({ error: "Invalid examId" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const examRes = await client.query(
        `
        SELECT max_attempts
        FROM exams
        WHERE exam_id = $1
        `,
        [examId]
      );

      if (examRes.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Exam not found" });
      }

      const maxAttempts = examRes.rows[0].max_attempts;

      const attemptRes = await client.query(
        `
        SELECT COUNT(*)::int AS used
        FROM exam_attempts
        WHERE exam_id = $1
          AND student_id = $2
        `,
        [examId, studentId]
      );

      const usedAttempts = attemptRes.rows[0].used;

      if (usedAttempts >= maxAttempts) {
        await client.query("ROLLBACK");
        return res.status(403).json({ error: "No attempts remaining" });
      }

      await client.query(
        `
        INSERT INTO exam_attempts (exam_id, student_id)
        VALUES ($1, $2)
        `,
        [examId, studentId]
      );

      await client.query("COMMIT");
      return res.json({ success: true });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Start exam failed:", err);
      return res.status(500).json({ error: "Failed to start exam" });
    } finally {
      client.release();
    }
  }
);

export default router;
