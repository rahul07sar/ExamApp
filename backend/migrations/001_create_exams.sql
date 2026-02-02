/**
 * Table: exams
 * Purpose: Master table for exam creation.
 */
 CREATE TABLE exams (
  exam_id UUID PRIMARY KEY,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  max_attempts INTEGER NOT NULL CHECK (max_attempts BETWEEN 1 AND 1000),
  cooldown_minutes INTEGER NOT NULL CHECK (cooldown_minutes BETWEEN 0 AND 525600),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
