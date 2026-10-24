import { Department, Exam, ExamFaculty, ExamRoom, Faculty, Mark, Notification, Result, Student, Subject, User } from '../types/database';

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: '11111111-1111-1111-1111-111111111101', name: 'Computer Science and Engineering', code: 'CSE', created_at: '2026-01-01T00:00:00Z' },
  { id: '11111111-1111-1111-1111-111111111102', name: 'Information Technology', code: 'IT', created_at: '2026-01-01T00:00:00Z' },
  { id: '11111111-1111-1111-1111-111111111103', name: 'Mechanical Engineering', code: 'ME', created_at: '2026-01-01T00:00:00Z' },
  { id: '11111111-1111-1111-1111-111111111104', name: 'Civil Engineering', code: 'CE', created_at: '2026-01-01T00:00:00Z' },
  { id: '11111111-1111-1111-1111-111111111105', name: 'Electronics & Communication', code: 'ECE', created_at: '2026-01-01T00:00:00Z' }
];

export const INITIAL_USERS: User[] = [
  // Admin demo
  {
    id: '22222222-2222-2222-2222-222222222201',
    username: 'admin',
    password_hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // admin123
    full_name: 'Dr. Alistair Vance',
    email: 'admin@apexuniversity.edu',
    role: 'admin',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    username: 'admin2',
    password_hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    full_name: 'Prof. Sarah Jenkins',
    email: 'sjenkins@apexuniversity.edu',
    role: 'admin',
    created_at: '2026-01-01T00:00:00Z'
  },
  // Faculty demo
  {
    id: '22222222-2222-2222-2222-222222222211',
    username: 'faculty1',
    password_hash: '9d863f829da4f3b584d5df61ff5ef42617f16a0fb4be237a3c3062325cfa7975', // faculty123
    full_name: 'Dr. Evelyn Reed',
    email: 'ereed@apexuniversity.edu',
    role: 'faculty',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222212',
    username: 'faculty2',
    password_hash: '9d863f829da4f3b584d5df61ff5ef42617f16a0fb4be237a3c3062325cfa7975',
    full_name: 'Prof. Marcus Chen',
    email: 'mchen@apexuniversity.edu',
    role: 'faculty',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222213',
    username: 'faculty3',
    password_hash: '9d863f829da4f3b584d5df61ff5ef42617f16a0fb4be237a3c3062325cfa7975',
    full_name: 'Dr. Ananya Sharma',
    email: 'asharma@apexuniversity.edu',
    role: 'faculty',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222214',
    username: 'faculty4',
    password_hash: '9d863f829da4f3b584d5df61ff5ef42617f16a0fb4be237a3c3062325cfa7975',
    full_name: 'Prof. Robert Thorne',
    email: 'rthorne@apexuniversity.edu',
    role: 'faculty',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222215',
    username: 'faculty5',
    password_hash: '9d863f829da4f3b584d5df61ff5ef42617f16a0fb4be237a3c3062325cfa7975',
    full_name: 'Dr. Liam OConnor',
    email: 'loconnor@apexuniversity.edu',
    role: 'faculty',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222216',
    username: 'faculty6',
    password_hash: '9d863f829da4f3b584d5df61ff5ef42617f16a0fb4be237a3c3062325cfa7975',
    full_name: 'Prof. Maya Patil',
    email: 'mpatil@apexuniversity.edu',
    role: 'faculty',
    created_at: '2026-01-01T00:00:00Z'
  },
  // Student demo
  {
    id: '22222222-2222-2222-2222-222222222221',
    username: 'student1',
    password_hash: '5526368d4f40f28dc071295fc4422e1b1d7d6f5fb8435d2ee7f8a7e0cfa52bf6', // student123
    full_name: 'Aria Sterling',
    email: 'aria.sterling@apex.edu',
    role: 'student',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    username: 'student2',
    password_hash: '5526368d4f40f28dc071295fc4422e1b1d7d6f5fb8435d2ee7f8a7e0cfa52bf6',
    full_name: 'Devon Vance',
    email: 'devon.v@apex.edu',
    role: 'student',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222223',
    username: 'student3',
    password_hash: '5526368d4f40f28dc071295fc4422e1b1d7d6f5fb8435d2ee7f8a7e0cfa52bf6',
    full_name: 'Rohan Verma',
    email: 'rverma@apex.edu',
    role: 'student',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222224',
    username: 'student4',
    password_hash: '5526368d4f40f28dc071295fc4422e1b1d7d6f5fb8435d2ee7f8a7e0cfa52bf6',
    full_name: 'Maya Lin',
    email: 'mlin@apex.edu',
    role: 'student',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222225',
    username: 'student5',
    password_hash: '5526368d4f40f28dc071295fc4422e1b1d7d6f5fb8435d2ee7f8a7e0cfa52bf6',
    full_name: 'Lucas Meyer',
    email: 'lmeyer@apex.edu',
    role: 'student',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222226',
    username: 'student6',
    password_hash: '5526368d4f40f28dc071295fc4422e1b1d7d6f5fb8435d2ee7f8a7e0cfa52bf6',
    full_name: 'Priya Kulkarni',
    email: 'pkulkarni@apex.edu',
    role: 'student',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222227',
    username: 'student7',
    password_hash: '5526368d4f40f28dc071295fc4422e1b1d7d6f5fb8435d2ee7f8a7e0cfa52bf6',
    full_name: 'Ethan Walker',
    email: 'ewalker@apex.edu',
    role: 'student',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222228',
    username: 'student8',
    password_hash: '5526368d4f40f28dc071295fc4422e1b1d7d6f5fb8435d2ee7f8a7e0cfa52bf6',
    full_name: 'Sophia Clark',
    email: 'sclark@apex.edu',
    role: 'student',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222229',
    username: 'student9',
    password_hash: '5526368d4f40f28dc071295fc4422e1b1d7d6f5fb8435d2ee7f8a7e0cfa52bf6',
    full_name: 'James Wilson',
    email: 'jwilson@apex.edu',
    role: 'student',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222230',
    username: 'student10',
    password_hash: '5526368d4f40f28dc071295fc4422e1b1d7d6f5fb8435d2ee7f8a7e0cfa52bf6',
    full_name: 'Zoe Martinez',
    email: 'zmartinez@apex.edu',
    role: 'student',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222231',
    username: 'student11',
    password_hash: '5526368d4f40f28dc071295fc4422e1b1d7d6f5fb8435d2ee7f8a7e0cfa52bf6',
    full_name: 'Tariq Al-Mansoor',
    email: 'talmansoor@apex.edu',
    role: 'student',
    created_at: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_FACULTY: Faculty[] = [
  {
    id: '33333333-3333-3333-3333-333333333301',
    user_id: '22222222-2222-2222-2222-222222222211',
    employee_id: 'EMP-CSE-001',
    department_id: '11111111-1111-1111-1111-111111111101',
    designation: 'Associate Professor & Chief Examiner',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    user_id: '22222222-2222-2222-2222-222222222212',
    employee_id: 'EMP-CSE-002',
    department_id: '11111111-1111-1111-1111-111111111101',
    designation: 'Assistant Professor',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '33333333-3333-3333-3333-333333333303',
    user_id: '22222222-2222-2222-2222-222222222213',
    employee_id: 'EMP-IT-001',
    department_id: '11111111-1111-1111-1111-111111111102',
    designation: 'Professor & HOD',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '33333333-3333-3333-3333-333333333304',
    user_id: '22222222-2222-2222-2222-222222222214',
    employee_id: 'EMP-ME-001',
    department_id: '11111111-1111-1111-1111-111111111103',
    designation: 'Associate Professor',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '33333333-3333-3333-3333-333333333305',
    user_id: '22222222-2222-2222-2222-222222222215',
    employee_id: 'EMP-CE-001',
    department_id: '11111111-1111-1111-1111-111111111104',
    designation: 'Senior Lecturer',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '33333333-3333-3333-3333-333333333306',
    user_id: '22222222-2222-2222-2222-222222222216',
    employee_id: 'EMP-ECE-001',
    department_id: '11111111-1111-1111-1111-111111111105',
    designation: 'Associate Professor',
    created_at: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: '44444444-4444-4444-4444-444444444401',
    user_id: '22222222-2222-2222-2222-222222222221',
    roll_number: 'CS2023-001',
    enrollment_number: 'ENR-2023-8891',
    department_id: '11111111-1111-1111-1111-111111111101',
    semester: 5,
    academic_year: '2025-2026',
    phone: '+1-555-0192',
    date_of_birth: '2004-03-14',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '44444444-4444-4444-4444-444444444402',
    user_id: '22222222-2222-2222-2222-222222222222',
    roll_number: 'CS2023-002',
    enrollment_number: 'ENR-2023-8892',
    department_id: '11111111-1111-1111-1111-111111111101',
    semester: 5,
    academic_year: '2025-2026',
    phone: '+1-555-0193',
    date_of_birth: '2004-07-22',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '44444444-4444-4444-4444-444444444403',
    user_id: '22222222-2222-2222-2222-222222222223',
    roll_number: 'CS2023-003',
    enrollment_number: 'ENR-2023-8893',
    department_id: '11111111-1111-1111-1111-111111111101',
    semester: 5,
    academic_year: '2025-2026',
    phone: '+1-555-0194',
    date_of_birth: '2003-11-09',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '44444444-4444-4444-4444-444444444404',
    user_id: '22222222-2222-2222-2222-222222222224',
    roll_number: 'IT2023-001',
    enrollment_number: 'ENR-2023-8894',
    department_id: '11111111-1111-1111-1111-111111111102',
    semester: 5,
    academic_year: '2025-2026',
    phone: '+1-555-0195',
    date_of_birth: '2004-01-30',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '44444444-4444-4444-4444-444444444405',
    user_id: '22222222-2222-2222-2222-222222222225',
    roll_number: 'IT2023-002',
    enrollment_number: 'ENR-2023-8895',
    department_id: '11111111-1111-1111-1111-111111111102',
    semester: 5,
    academic_year: '2025-2026',
    phone: '+1-555-0196',
    date_of_birth: '2004-09-17',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '44444444-4444-4444-4444-444444444406',
    user_id: '22222222-2222-2222-2222-222222222226',
    roll_number: 'ME2023-001',
    enrollment_number: 'ENR-2023-8896',
    department_id: '11111111-1111-1111-1111-111111111103',
    semester: 5,
    academic_year: '2025-2026',
    phone: '+1-555-0197',
    date_of_birth: '2003-05-12',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '44444444-4444-4444-4444-444444444407',
    user_id: '22222222-2222-2222-2222-222222222227',
    roll_number: 'CE2023-001',
    enrollment_number: 'ENR-2023-8897',
    department_id: '11111111-1111-1111-1111-111111111104',
    semester: 5,
    academic_year: '2025-2026',
    phone: '+1-555-0198',
    date_of_birth: '2004-12-05',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '44444444-4444-4444-4444-444444444408',
    user_id: '22222222-2222-2222-2222-222222222228',
    roll_number: 'ECE2023-001',
    enrollment_number: 'ENR-2023-8898',
    department_id: '11111111-1111-1111-1111-111111111105',
    semester: 5,
    academic_year: '2025-2026',
    phone: '+1-555-0199',
    date_of_birth: '2004-06-25',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '44444444-4444-4444-4444-444444444409',
    user_id: '22222222-2222-2222-2222-222222222229',
    roll_number: 'CS2023-004',
    enrollment_number: 'ENR-2023-8899',
    department_id: '11111111-1111-1111-1111-111111111101',
    semester: 5,
    academic_year: '2025-2026',
    phone: '+1-555-0200',
    date_of_birth: '2003-08-19',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '44444444-4444-4444-4444-444444444410',
    user_id: '22222222-2222-2222-2222-222222222230',
    roll_number: 'CS2022-015',
    enrollment_number: 'ENR-2022-7710',
    department_id: '11111111-1111-1111-1111-111111111101',
    semester: 6,
    academic_year: '2025-2026',
    phone: '+1-555-0201',
    date_of_birth: '2003-02-11',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '44444444-4444-4444-4444-444444444411',
    user_id: '22222222-2222-2222-2222-222222222231',
    roll_number: 'IT2022-008',
    enrollment_number: 'ENR-2022-7711',
    department_id: '11111111-1111-1111-1111-111111111102',
    semester: 6,
    academic_year: '2025-2026',
    phone: '+1-555-0202',
    date_of_birth: '2003-10-04',
    created_at: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: '55555555-5555-5555-5555-555555555501', subject_code: 'CS501', subject_name: 'Database Management Systems', department_id: '11111111-1111-1111-1111-111111111101', semester: 5, credits: 4, max_marks: 100, passing_marks: 40, created_at: '2026-01-01T00:00:00Z' },
  { id: '55555555-5555-5555-5555-555555555502', subject_code: 'CS502', subject_name: 'Design & Analysis of Algorithms', department_id: '11111111-1111-1111-1111-111111111101', semester: 5, credits: 4, max_marks: 100, passing_marks: 40, created_at: '2026-01-01T00:00:00Z' },
  { id: '55555555-5555-5555-5555-555555555503', subject_code: 'CS503', subject_name: 'Operating Systems & Architecture', department_id: '11111111-1111-1111-1111-111111111101', semester: 5, credits: 4, max_marks: 100, passing_marks: 40, created_at: '2026-01-01T00:00:00Z' },
  { id: '55555555-5555-5555-5555-555555555504', subject_code: 'CS504', subject_name: 'Formal Language & Automata', department_id: '11111111-1111-1111-1111-111111111101', semester: 5, credits: 3, max_marks: 100, passing_marks: 40, created_at: '2026-01-01T00:00:00Z' },
  { id: '55555555-5555-5555-5555-555555555505', subject_code: 'IT501', subject_name: 'Web Technologies & Cloud Computing', department_id: '11111111-1111-1111-1111-111111111102', semester: 5, credits: 4, max_marks: 100, passing_marks: 40, created_at: '2026-01-01T00:00:00Z' },
  { id: '55555555-5555-5555-5555-555555555506', subject_code: 'IT502', subject_name: 'Information & Network Security', department_id: '11111111-1111-1111-1111-111111111102', semester: 5, credits: 4, max_marks: 100, passing_marks: 40, created_at: '2026-01-01T00:00:00Z' },
  { id: '55555555-5555-5555-5555-555555555507', subject_code: 'ME501', subject_name: 'Thermodynamics & Heat Transfer', department_id: '11111111-1111-1111-1111-111111111103', semester: 5, credits: 4, max_marks: 100, passing_marks: 40, created_at: '2026-01-01T00:00:00Z' },
  { id: '55555555-5555-5555-5555-555555555508', subject_code: 'ME502', subject_name: 'Fluid Mechanics and Machinery', department_id: '11111111-1111-1111-1111-111111111103', semester: 5, credits: 4, max_marks: 100, passing_marks: 40, created_at: '2026-01-01T00:00:00Z' },
  { id: '55555555-5555-5555-5555-555555555509', subject_code: 'CE501', subject_name: 'Structural Analysis & Design', department_id: '11111111-1111-1111-1111-111111111104', semester: 5, credits: 4, max_marks: 100, passing_marks: 40, created_at: '2026-01-01T00:00:00Z' },
  { id: '55555555-5555-5555-5555-555555555510', subject_code: 'ECE501', subject_name: 'Digital Signal Processing', department_id: '11111111-1111-1111-1111-111111111105', semester: 5, credits: 4, max_marks: 100, passing_marks: 40, created_at: '2026-01-01T00:00:00Z' },
  { id: '55555555-5555-5555-5555-555555555511', subject_code: 'CS601', subject_name: 'Compiler Design', department_id: '11111111-1111-1111-1111-111111111101', semester: 6, credits: 4, max_marks: 100, passing_marks: 40, created_at: '2026-01-01T00:00:00Z' },
  { id: '55555555-5555-5555-5555-555555555512', subject_code: 'CS602', subject_name: 'Machine Learning & Neural Nets', department_id: '11111111-1111-1111-1111-111111111101', semester: 6, credits: 4, max_marks: 100, passing_marks: 40, created_at: '2026-01-01T00:00:00Z' }
];

export const INITIAL_ROOMS: ExamRoom[] = [
  { id: '66666666-6666-6666-6666-666666666601', room_number: 'LH-101', building: 'Turing Academic Block', floor: 1, capacity: 60, created_at: '2026-01-01T00:00:00Z' },
  { id: '66666666-6666-6666-6666-666666666602', room_number: 'LH-204', building: 'Turing Academic Block', floor: 2, capacity: 60, created_at: '2026-01-01T00:00:00Z' },
  { id: '66666666-6666-6666-6666-666666666603', room_number: 'AUD-1', building: 'Central Examination Complex', floor: 1, capacity: 150, created_at: '2026-01-01T00:00:00Z' },
  { id: '66666666-6666-6666-6666-666666666604', room_number: 'LAB-302', building: 'Shannon Computing Wing', floor: 3, capacity: 45, created_at: '2026-01-01T00:00:00Z' },
  { id: '66666666-6666-6666-6666-666666666605', room_number: 'CR-405', building: 'Von Neumann Hall', floor: 4, capacity: 40, created_at: '2026-01-01T00:00:00Z' },
  { id: '66666666-6666-6666-6666-666666666606', room_number: 'CR-501', building: 'Tesla Engineering Tower', floor: 5, capacity: 50, created_at: '2026-01-01T00:00:00Z' }
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: '77777777-7777-7777-7777-777777777701',
    subject_id: '55555555-5555-5555-5555-555555555501',
    department_id: '11111111-1111-1111-1111-111111111101',
    semester: 5,
    exam_date: '2026-10-15',
    start_time: '09:30:00',
    end_time: '12:30:00',
    room_id: '66666666-6666-6666-6666-666666666601',
    exam_type: 'End Semester',
    status: 'Scheduled',
    created_by: '22222222-2222-2222-2222-222222222201',
    created_at: '2026-08-01T00:00:00Z',
    faculty_ids: ['33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333302']
  },
  {
    id: '77777777-7777-7777-7777-777777777702',
    subject_id: '55555555-5555-5555-5555-555555555502',
    department_id: '11111111-1111-1111-1111-111111111101',
    semester: 5,
    exam_date: '2026-10-18',
    start_time: '09:30:00',
    end_time: '12:30:00',
    room_id: '66666666-6666-6666-6666-666666666602',
    exam_type: 'End Semester',
    status: 'Scheduled',
    created_by: '22222222-2222-2222-2222-222222222201',
    created_at: '2026-08-01T00:00:00Z',
    faculty_ids: ['33333333-3333-3333-3333-333333333301']
  },
  {
    id: '77777777-7777-7777-7777-777777777703',
    subject_id: '55555555-5555-5555-5555-555555555503',
    department_id: '11111111-1111-1111-1111-111111111101',
    semester: 5,
    exam_date: '2026-10-21',
    start_time: '09:30:00',
    end_time: '12:30:00',
    room_id: '66666666-6666-6666-6666-666666666603',
    exam_type: 'End Semester',
    status: 'Scheduled',
    created_by: '22222222-2222-2222-2222-222222222201',
    created_at: '2026-08-01T00:00:00Z',
    faculty_ids: ['33333333-3333-3333-3333-333333333302']
  },
  {
    id: '77777777-7777-7777-7777-777777777704',
    subject_id: '55555555-5555-5555-5555-555555555504',
    department_id: '11111111-1111-1111-1111-111111111101',
    semester: 5,
    exam_date: '2026-10-24',
    start_time: '09:30:00',
    end_time: '12:30:00',
    room_id: '66666666-6666-6666-6666-666666666601',
    exam_type: 'End Semester',
    status: 'Scheduled',
    created_by: '22222222-2222-2222-2222-222222222201',
    created_at: '2026-08-01T00:00:00Z',
    faculty_ids: ['33333333-3333-3333-3333-333333333301']
  },
  {
    id: '77777777-7777-7777-7777-777777777705',
    subject_id: '55555555-5555-5555-5555-555555555505',
    department_id: '11111111-1111-1111-1111-111111111102',
    semester: 5,
    exam_date: '2026-10-16',
    start_time: '14:00:00',
    end_time: '17:00:00',
    room_id: '66666666-6666-6666-6666-666666666602',
    exam_type: 'End Semester',
    status: 'Scheduled',
    created_by: '22222222-2222-2222-2222-222222222201',
    created_at: '2026-08-01T00:00:00Z',
    faculty_ids: ['33333333-3333-3333-3333-333333333303']
  },
  {
    id: '77777777-7777-7777-7777-777777777706',
    subject_id: '55555555-5555-5555-5555-555555555506',
    department_id: '11111111-1111-1111-1111-111111111102',
    semester: 5,
    exam_date: '2026-10-19',
    start_time: '14:00:00',
    end_time: '17:00:00',
    room_id: '66666666-6666-6666-6666-666666666604',
    exam_type: 'End Semester',
    status: 'Scheduled',
    created_by: '22222222-2222-2222-2222-222222222201',
    created_at: '2026-08-01T00:00:00Z',
    faculty_ids: ['33333333-3333-3333-3333-333333333303']
  },
  {
    id: '77777777-7777-7777-7777-777777777707',
    subject_id: '55555555-5555-5555-5555-555555555507',
    department_id: '11111111-1111-1111-1111-111111111103',
    semester: 5,
    exam_date: '2026-10-20',
    start_time: '09:30:00',
    end_time: '12:30:00',
    room_id: '66666666-6666-6666-6666-666666666605',
    exam_type: 'End Semester',
    status: 'Scheduled',
    created_by: '22222222-2222-2222-2222-222222222201',
    created_at: '2026-08-01T00:00:00Z',
    faculty_ids: ['33333333-3333-3333-3333-333333333304']
  },
  {
    id: '77777777-7777-7777-7777-777777777708',
    subject_id: '55555555-5555-5555-5555-555555555509',
    department_id: '11111111-1111-1111-1111-111111111104',
    semester: 5,
    exam_date: '2026-10-22',
    start_time: '09:30:00',
    end_time: '12:30:00',
    room_id: '66666666-6666-6666-6666-666666666606',
    exam_type: 'End Semester',
    status: 'Scheduled',
    created_by: '22222222-2222-2222-2222-222222222201',
    created_at: '2026-08-01T00:00:00Z',
    faculty_ids: ['33333333-3333-3333-3333-333333333305']
  },
  {
    id: '77777777-7777-7777-7777-777777777709',
    subject_id: '55555555-5555-5555-5555-555555555510',
    department_id: '11111111-1111-1111-1111-111111111105',
    semester: 5,
    exam_date: '2026-10-25',
    start_time: '09:30:00',
    end_time: '12:30:00',
    room_id: '66666666-6666-6666-6666-666666666603',
    exam_type: 'End Semester',
    status: 'Scheduled',
    created_by: '22222222-2222-2222-2222-222222222201',
    created_at: '2026-08-01T00:00:00Z',
    faculty_ids: ['33333333-3333-3333-3333-333333333306']
  },
  // Completed Midterm Exams
  {
    id: '77777777-7777-7777-7777-777777777710',
    subject_id: '55555555-5555-5555-5555-555555555501',
    department_id: '11111111-1111-1111-1111-111111111101',
    semester: 5,
    exam_date: '2026-09-10',
    start_time: '09:30:00',
    end_time: '11:00:00',
    room_id: '66666666-6666-6666-6666-666666666601',
    exam_type: 'Midterm',
    status: 'Completed',
    created_by: '22222222-2222-2222-2222-222222222201',
    created_at: '2026-08-01T00:00:00Z',
    faculty_ids: ['33333333-3333-3333-3333-333333333301']
  },
  {
    id: '77777777-7777-7777-7777-777777777711',
    subject_id: '55555555-5555-5555-5555-555555555502',
    department_id: '11111111-1111-1111-1111-111111111101',
    semester: 5,
    exam_date: '2026-09-12',
    start_time: '09:30:00',
    end_time: '11:00:00',
    room_id: '66666666-6666-6666-6666-666666666601',
    exam_type: 'Midterm',
    status: 'Completed',
    created_by: '22222222-2222-2222-2222-222222222201',
    created_at: '2026-08-01T00:00:00Z',
    faculty_ids: ['33333333-3333-3333-3333-333333333301']
  }
];

export const INITIAL_EXAM_FACULTY: ExamFaculty[] = [
  { id: '88888888-8888-8888-8888-888888888801', exam_id: '77777777-7777-7777-7777-777777777701', faculty_id: '33333333-3333-3333-3333-333333333301', created_at: '2026-08-01T00:00:00Z' },
  { id: '88888888-8888-8888-8888-888888888802', exam_id: '77777777-7777-7777-7777-777777777701', faculty_id: '33333333-3333-3333-3333-333333333302', created_at: '2026-08-01T00:00:00Z' },
  { id: '88888888-8888-8888-8888-888888888803', exam_id: '77777777-7777-7777-7777-777777777702', faculty_id: '33333333-3333-3333-3333-333333333301', created_at: '2026-08-01T00:00:00Z' },
  { id: '88888888-8888-8888-8888-888888888804', exam_id: '77777777-7777-7777-7777-777777777705', faculty_id: '33333333-3333-3333-3333-333333333303', created_at: '2026-08-01T00:00:00Z' },
  { id: '88888888-8888-8888-8888-888888888805', exam_id: '77777777-7777-7777-7777-777777777707', faculty_id: '33333333-3333-3333-3333-333333333304', created_at: '2026-08-01T00:00:00Z' },
  { id: '88888888-8888-8888-8888-888888888806', exam_id: '77777777-7777-7777-7777-777777777710', faculty_id: '33333333-3333-3333-3333-333333333301', created_at: '2026-08-01T00:00:00Z' }
];

export const INITIAL_MARKS: Mark[] = [
  {
    id: '99999999-9999-9999-9999-999999999901',
    exam_id: '77777777-7777-7777-7777-777777777710',
    student_id: '44444444-4444-4444-4444-444444444401',
    internal_marks: 28,
    external_marks: 64,
    total_marks: 92,
    percentage: 92,
    grade: 'A+',
    result_status: 'Pass',
    entered_by: '22222222-2222-2222-2222-222222222211',
    status: 'Published',
    created_at: '2026-09-15T00:00:00Z'
  },
  {
    id: '99999999-9999-9999-9999-999999999902',
    exam_id: '77777777-7777-7777-7777-777777777710',
    student_id: '44444444-4444-4444-4444-444444444402',
    internal_marks: 25,
    external_marks: 58,
    total_marks: 83,
    percentage: 83,
    grade: 'A',
    result_status: 'Pass',
    entered_by: '22222222-2222-2222-2222-222222222211',
    status: 'Published',
    created_at: '2026-09-15T00:00:00Z'
  },
  {
    id: '99999999-9999-9999-9999-999999999903',
    exam_id: '77777777-7777-7777-7777-777777777710',
    student_id: '44444444-4444-4444-4444-444444444403',
    internal_marks: 21,
    external_marks: 47,
    total_marks: 68,
    percentage: 68,
    grade: 'B',
    result_status: 'Pass',
    entered_by: '22222222-2222-2222-2222-222222222211',
    status: 'Published',
    created_at: '2026-09-15T00:00:00Z'
  },
  {
    id: '99999999-9999-9999-9999-999999999904',
    exam_id: '77777777-7777-7777-7777-777777777710',
    student_id: '44444444-4444-4444-4444-444444444409',
    internal_marks: 15,
    external_marks: 20,
    total_marks: 35,
    percentage: 35,
    grade: 'F',
    result_status: 'Fail',
    entered_by: '22222222-2222-2222-2222-222222222211',
    status: 'Published',
    created_at: '2026-09-15T00:00:00Z'
  },
  // Submitted CS502 marks (Awaiting Verification)
  {
    id: '99999999-9999-9999-9999-999999999905',
    exam_id: '77777777-7777-7777-7777-777777777711',
    student_id: '44444444-4444-4444-4444-444444444401',
    internal_marks: 27,
    external_marks: 61,
    total_marks: 88,
    percentage: 88,
    grade: 'A',
    result_status: 'Pass',
    entered_by: '22222222-2222-2222-2222-222222222211',
    status: 'Submitted',
    created_at: '2026-09-18T00:00:00Z'
  },
  {
    id: '99999999-9999-9999-9999-999999999906',
    exam_id: '77777777-7777-7777-7777-777777777711',
    student_id: '44444444-4444-4444-4444-444444444402',
    internal_marks: 26,
    external_marks: 48,
    total_marks: 74,
    percentage: 74,
    grade: 'B+',
    result_status: 'Pass',
    entered_by: '22222222-2222-2222-2222-222222222211',
    status: 'Submitted',
    created_at: '2026-09-18T00:00:00Z'
  }
];

export const INITIAL_RESULTS: Result[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    student_id: '44444444-4444-4444-4444-444444444401',
    semester: 4,
    academic_year: '2024-2025',
    total_marks: 448,
    percentage: 89.6,
    sgpa: 9.2,
    result_status: 'Pass',
    published_at: '2025-06-15T00:00:00Z',
    created_at: '2025-06-15T00:00:00Z'
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    student_id: '44444444-4444-4444-4444-444444444401',
    semester: 3,
    academic_year: '2024-2025',
    total_marks: 432,
    percentage: 86.4,
    sgpa: 8.85,
    result_status: 'Pass',
    published_at: '2024-12-20T00:00:00Z',
    created_at: '2024-12-20T00:00:00Z'
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    student_id: '44444444-4444-4444-4444-444444444402',
    semester: 4,
    academic_year: '2024-2025',
    total_marks: 412,
    percentage: 82.4,
    sgpa: 8.4,
    result_status: 'Pass',
    published_at: '2025-06-15T00:00:00Z',
    created_at: '2025-06-15T00:00:00Z'
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    student_id: '44444444-4444-4444-4444-444444444403',
    semester: 4,
    academic_year: '2024-2025',
    total_marks: 360,
    percentage: 72.0,
    sgpa: 7.3,
    result_status: 'Pass',
    published_at: '2025-06-15T00:00:00Z',
    created_at: '2025-06-15T00:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    user_id: '22222222-2222-2222-2222-222222222221', // student1
    title: 'End Semester Timetable Released',
    message: 'The Autumn 2026 End-Semester examination schedule for Computer Science (Semester 5) has been officially scheduled.',
    type: 'exam',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    user_id: '22222222-2222-2222-2222-222222222221', // student1
    title: 'Midterm DBMS Results Published',
    message: 'Your Midterm score for Database Management Systems (CS501) is published: 92/100 (Grade A+).',
    type: 'result',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
    user_id: '22222222-2222-2222-2222-222222222211', // faculty1
    title: 'Exam Duty Assigned',
    message: 'You have been appointed as Invigilator for CS501: Database Management Systems on 2026-10-15 in LH-101.',
    type: 'exam',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString()
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4',
    user_id: '22222222-2222-2222-2222-222222222201', // admin
    title: 'Pending Marks Submission',
    message: 'Midterm marks for CS502 (Design & Analysis of Algorithms) submitted by Dr. Evelyn Reed and awaiting verification.',
    type: 'marks',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  }
];
