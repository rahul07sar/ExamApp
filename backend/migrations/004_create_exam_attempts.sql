/**
 * Table: Exam Attempts
 * Purpose: Stores information about student attempts at exams.
 */

CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  exam_id UUID NOT NULL,
  student_id UUID NOT NULL,

  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP NULL,

  CONSTRAINT fk_exam_attempts_exam
    FOREIGN KEY (exam_id)
    REFERENCES exams (exam_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_exam_attempts_student
    FOREIGN KEY (student_id)
    REFERENCES users (id)
    ON DELETE CASCADE
);

-- Prevent two attempts starting at the exact same instant
CREATE INDEX idx_exam_attempts_student_exam
  ON exam_attempts (student_id, exam_id);

-- Fast lookup for remaining attempts & cooldown checks
CREATE INDEX idx_exam_attempts_started_at
  ON exam_attempts (started_at);
