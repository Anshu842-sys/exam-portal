// Database Entity Types matching Supabase PostgreSQL schema

export type UserRole = 'admin' | 'faculty' | 'student';

export interface User {
  id: string;
  username: string;
  password_hash?: string; // Not sent to client in auth sessions
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  roll_number: string;
  enrollment_number: string;
  department_id: string;
  semester: number;
  academic_year: string;
  phone?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at?: string;
  // Joined fields for display
  user?: User;
  department?: Department;
}

export interface Faculty {
  id: string;
  user_id: string;
  employee_id: string;
  department_id: string;
  designation: string;
  created_at: string;
  updated_at?: string;
  // Joined fields
  user?: User;
  department?: Department;
}

export interface Subject {
  id: string;
  subject_code: string;
  subject_name: string;
  department_id: string;
  semester: number;
  credits: number;
  max_marks: number;
  passing_marks: number;
  created_at: string;
  updated_at?: string;
  department?: Department;
}

export interface ExamRoom {
  id: string;
  room_number: string;
  building: string;
  floor: number;
  capacity: number;
  created_at: string;
}

export type ExamType = 'Internal' | 'Midterm' | 'End Semester' | 'Practical' | 'Supplementary';
export type ExamStatus = 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';

export interface Exam {
  id: string;
  subject_id: string;
  department_id: string;
  semester: number;
  exam_date: string;
  start_time: string;
  end_time: string;
  room_id: string | null;
  exam_type: ExamType;
  status: ExamStatus;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  // Joined relations
  subject?: Subject;
  department?: Department;
  room?: ExamRoom;
  faculty_ids?: string[]; // IDs of assigned invigilators
  faculty?: Faculty[];
}

export interface ExamFaculty {
  id: string;
  exam_id: string;
  faculty_id: string;
  created_at: string;
}

export type MarkStatus = 'Draft' | 'Submitted' | 'Verified' | 'Published';
export type ResultStatus = 'Pass' | 'Fail';

export interface Mark {
  id: string;
  exam_id: string;
  student_id: string;
  internal_marks: number;
  external_marks: number;
  total_marks: number;
  percentage: number;
  grade: string;
  result_status: ResultStatus;
  entered_by?: string;
  status: MarkStatus;
  created_at: string;
  updated_at?: string;
  // Joined relations
  student?: Student;
  exam?: Exam;
}

export interface Result {
  id: string;
  student_id: string;
  semester: number;
  academic_year: string;
  total_marks: number;
  percentage: number;
  sgpa: number;
  result_status: ResultStatus;
  published_at: string;
  created_at: string;
  student?: Student;
}

export type NotificationType = 'exam' | 'result' | 'marks' | 'room' | 'general';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}
