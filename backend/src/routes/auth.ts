/**
 * POST /auth/register
 * Registers a student with selected subjects (atomic transaction).
 */
import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import { randomUUID } from "crypto";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password, subjects } = req.body;

  if (!email || !password || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const hash = await bcrypt.hash(password, 12);
    const userId = randomUUID();

    await client.query(
      `INSERT INTO users (id, email, password_hash, role)
       VALUES ($1, $2, $3, 'student')`,
      [userId, email.toLowerCase(), hash]
    );

    for (const subjectId of subjects) {
      await client.query(
        `INSERT INTO user_subjects (user_id, subject_id)
         VALUES ($1, $2)`,
        [userId, subjectId]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(409).json({ message: "User already exists or invalid subjects" });
  } finally {
    client.release();
  }
});

export default router;
