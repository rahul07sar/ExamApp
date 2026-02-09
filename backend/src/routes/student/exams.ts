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
        s.name AS subject
      FROM exams e
      JOIN subjects s ON s.id = e.subject_id
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

export default router;
