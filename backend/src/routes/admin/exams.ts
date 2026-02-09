import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { pool } from "../../db/pool.js";

const router = Router();

/**
 * POST /admin/exams
 * Create a new exam (Admin only)
 */
router.post(
  "/exams",
  requireAuth,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    const { subjectId, title, maxAttempts, cooldownMinutes } = req.body;

    if (!subjectId || typeof subjectId !== "string") {
      return res.status(400).json({ error: "Invalid subjectId" });
    }

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Invalid title" });
    }

    if (
      typeof maxAttempts !== "number" ||
      maxAttempts < 1 ||
      maxAttempts > 1000
    ) {
      return res.status(400).json({ error: "Invalid maxAttempts" });
    }

    if (
      typeof cooldownMinutes !== "number" ||
      cooldownMinutes < 0 ||
      cooldownMinutes > 525600
    ) {
      return res.status(400).json({ error: "Invalid cooldownMinutes" });
    }

    try {
      const { rows } = await pool.query(
        `
        INSERT INTO exams (
          subject_id,
          title,
          max_attempts,
          cooldown_minutes
        )
        VALUES ($1, $2, $3, $4)
        RETURNING exam_id
        `,
        [subjectId, title, maxAttempts, cooldownMinutes]
      );

      return res.status(201).json({
        success: true,
        examId: rows[0].exam_id
      });
    } catch (err) {
      console.error("Create exam failed:", err);
      return res.status(500).json({ error: "Failed to create exam" });
    }
  }
);

/**
 * GET /admin/exams
 * Returns all exams for admin view.
 */
router.get(
  "/exams",
  requireAuth,
  requireRole("admin"),
  async (_req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(
        `
        SELECT
          e.exam_id,
          e.title,
          e.max_attempts,
          e.cooldown_minutes,
          s.name AS subject_name
        FROM exams e
        JOIN subjects s ON s.id = e.subject_id
        ORDER BY e.created_at DESC
        `
      );

      return res.json(rows);
    } catch (err) {
      console.error("Fetch exams failed:", err);
      return res.status(500).json({ error: "Failed to fetch exams" });
    }
  }
);

export default router;

/**
 * PUT /admin/exams/:examId
 * Update an exam and reset all attempt history (Admin only)
 */
router.put(
  "/exams/:examId",
  requireAuth,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    const { examId } = req.params;
    const { title, maxAttempts, cooldownMinutes } = req.body;

    if (!/^[0-9a-fA-F-]{36}$/.test(examId)) {
      return res.status(400).json({ error: "Invalid examId" });
    }

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Invalid title" });
    }

    if (
      typeof maxAttempts !== "number" ||
      maxAttempts < 1 ||
      maxAttempts > 1000
    ) {
      return res.status(400).json({ error: "Invalid maxAttempts" });
    }

    if (
      typeof cooldownMinutes !== "number" ||
      cooldownMinutes < 0 ||
      cooldownMinutes > 525600
    ) {
      return res.status(400).json({ error: "Invalid cooldownMinutes" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
        UPDATE exams
        SET
          title = $1,
          max_attempts = $2,
          cooldown_minutes = $3
        WHERE exam_id = $4
        `,
        [title, maxAttempts, cooldownMinutes, examId]
      );

      await client.query("COMMIT");
      return res.json({ success: true });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Update exam failed:", err);
      return res.status(500).json({ error: "Failed to update exam" });
    } finally {
      client.release();
    }
  }
);

/**
 * DELETE /admin/exams/:examId
 * Delete an exam (Admin only)
 */
router.delete(
  "/exams/:examId",
  requireAuth,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    const { examId } = req.params;

    if (!/^[0-9a-fA-F-]{36}$/.test(examId)) {
      return res.status(400).json({ error: "Invalid examId" });
    }

    try {
      const result = await pool.query(
        `DELETE FROM exams WHERE exam_id = $1`,
        [examId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Exam not found" });
      }

      return res.json({ success: true });
    } catch (err) {
      console.error("Delete exam failed:", err);
      return res.status(500).json({ error: "Failed to delete exam" });
    }
  }
);
