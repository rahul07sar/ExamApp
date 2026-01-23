/**
 * GET /subjects
 * Returns active subjects for registration.
 */
import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

router.get("/", async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name FROM subjects WHERE is_active = true ORDER BY name`
  );
  res.json(rows);
});

export default router;
