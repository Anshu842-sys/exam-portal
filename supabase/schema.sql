-- ============================================================================
-- EXAM CELL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Target Engine: PostgreSQL 14+ / Supabase PostgreSQL
-- Capstone Project: Examination Management, Marks Verification & Academic Reporting
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if re-running (order handles FK constraints)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS marks CASCADE;
DROP TABLE IF EXISTS exam_faculty CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS exam_rooms CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
-- Application-level custom authentication table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index on username for authentication lookup
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- 2. DEPARTMENTS TABLE
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. STUDENTS TABLE
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(30) UNIQUE NOT NULL,
    enrollment_number VARCHAR(30) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    academic_year VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_students_roll ON students(roll_number);
CREATE INDEX idx_students_dept_sem ON students(department_id, semester);

-- 4. FACULTY TABLE
CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(30) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
    designation VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_faculty_emp ON faculty(employee_id);
CREATE INDEX idx_faculty_dept ON faculty(department_id);

-- 5. SUBJECTS TABLE
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    credits INT NOT NULL DEFAULT 4 CHECK (credits > 0),
    max_marks INT NOT NULL DEFAULT 100 CHECK (max_marks > 0),
    passing_marks INT NOT NULL DEFAULT 40 CHECK (passing_marks > 0 AND passing_marks <= max_marks),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subjects_code ON subjects(subject_code);
CREATE INDEX idx_subjects_dept_sem ON subjects(department_id, semester);

-- 6. EXAM ROOMS TABLE
CREATE TABLE exam_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number VARCHAR(20) UNIQUE NOT NULL,
    building VARCHAR(50) NOT NULL,
    floor INT NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. EXAMS TABLE
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES subjects(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_id UUID REFERENCES exam_rooms(id) ON DELETE SET NULL,
    exam_type VARCHAR(30) NOT NULL CHECK (exam_type IN ('Internal', 'Midterm', 'End Semester', 'Practical', 'Supplementary')),
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Ongoing', 'Completed', 'Cancelled')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_exam_time CHECK (end_time > start_time)
);

CREATE INDEX idx_exams_date ON exams(exam_date);
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exams_dept_sem ON exams(department_id, semester);

-- 8. EXAM FACULTY (MANY-TO-MANY RELATIONSHIP)
CREATE TABLE exam_faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (exam_id, faculty_id)
);

-- 9. MARKS TABLE
CREATE TABLE marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    internal_marks NUMERIC(5, 2) DEFAULT 0 CHECK (internal_marks >= 0),
    external_marks NUMERIC(5, 2) DEFAULT 0 CHECK (external_marks >= 0),
    total_marks NUMERIC(5, 2) GENERATED ALWAYS AS (internal_marks + external_marks) STORED,
    percentage NUMERIC(5, 2),
    grade VARCHAR(5),
    result_status VARCHAR(10) CHECK (result_status IN ('Pass', 'Fail')),
    entered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Verified', 'Published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (exam_id, student_id)
);

CREATE INDEX idx_marks_exam ON marks(exam_id);
CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_marks_status ON marks(status);

-- 10. RESULTS TABLE
CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    academic_year VARCHAR(20) NOT NULL,
    total_marks NUMERIC(6, 2) NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    sgpa NUMERIC(4, 2) NOT NULL,
    result_status VARCHAR(10) NOT NULL CHECK (result_status IN ('Pass', 'Fail')),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (student_id, semester, academic_year)
);

CREATE INDEX idx_results_student ON results(student_id);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('exam', 'result', 'marks', 'room', 'general')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ============================================================================
-- SECURE LOGIN RPC FUNCTION (Never returns password_hash to the client)
-- ============================================================================
CREATE OR REPLACE FUNCTION authenticate_user(
    p_username VARCHAR,
    p_password_hash VARCHAR
)
RETURNS TABLE (
    id UUID,
    username VARCHAR,
    full_name VARCHAR,
    email VARCHAR,
    role VARCHAR,
    student_id UUID,
    faculty_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.full_name,
        u.email,
        u.role,
        s.id AS student_id,
        f.id AS faculty_id
    FROM users u
    LEFT JOIN students s ON s.user_id = u.id
    LEFT JOIN faculty f ON f.user_id = u.id
    WHERE u.username = p_username 
      AND u.password_hash = p_password_hash;
END;
$$;
