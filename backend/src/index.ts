import express from "express";
import cors from "cors";
import { pool } from "./db/pool.js";
import subjectsRouter from "./routes/subjects.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true
  })
);

app.use(express.json());
app.use("/subjects", subjectsRouter);

app.get("/health", async (_req, res) => {
  const result = await pool.query("SELECT 1");
  res.json({ status: "ok", db: result.rowCount === 1 });
});

app.listen(4000, "0.0.0.0", () => {
  console.log("Backend running on port 4000");
});
