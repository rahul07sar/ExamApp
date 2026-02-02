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

export default router;
