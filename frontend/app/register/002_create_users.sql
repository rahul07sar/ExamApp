/**
 * Table: users
 * Purpose: Stores admins and students with role-based access.
 */
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/**
 * Table: user_subjects
 * Purpose: Maps students to allowed subjects.
 */
CREATE TABLE user_subjects (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  PRIMARY KEY (user_id, subject_id)
);
