/**
 * Table: subjects
 * Purpose: Master table for academic subjects used during student registration.
 */
CREATE TABLE subjects (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_subjects_name_unique
  ON subjects (LOWER(name));
