import express from "express";
import { pool } from "./db/pool.js";

const app = express();
app.use(express.json());

app.get("/health", async (_, res) => {
  try {
    const result = await pool.query("SELECT 1");
    res.json({
      status: "ok",
      db: result.rowCount === 1
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      db: false
    });
  }
});

app.listen(4000, "0.0.0.0", () => {
  console.log("Backend running on port 4000");
});
