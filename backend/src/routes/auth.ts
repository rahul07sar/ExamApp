/**
 * Auth routes
 * - POST /auth/register
 * - POST /auth/login
 * - POST /auth/logout
 * - GET  /auth/me
 */
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";
import { randomUUID } from "crypto";

const router = Router();

/**
 * POST /auth/register
 * Registers a student with selected subjects.
 */
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
  } catch {
    await client.query("ROLLBACK");
    res.status(409).json({ message: "User already exists or invalid subjects" });
  } finally {
    client.release();
  }
});

/**
 * POST /auth/login
 * Authenticates user and sets JWT cookie.
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const { rows } = await pool.query(
    `SELECT id, password_hash, role
     FROM users
     WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  res.cookie("auth", token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax"
  });

  res.json({ role: user.role });
});

/**
 * POST /auth/logout
 * Clears auth cookie.
 */
router.post("/logout", (_req, res) => {
  res.clearCookie("auth", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax"
  });

  res.json({ success: true });
});

/**
 * GET /auth/me
 * Verifies auth cookie and returns user role.
 */
router.get("/me", (req, res) => {
  const token = req.cookies?.auth;
  if (!token) return res.sendStatus(401);

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { sub: string; role: string };

    res.json({ role: payload.role });
  } catch {
    res.sendStatus(401);
  }
});

export default router;
