import { AuthUser } from '../types/auth';
import {
  Department,
  Exam,
  ExamFaculty,
  ExamRoom,
  Faculty,
  Mark,
  MarkStatus,
  Notification,
  Result,
  Student,
  Subject,
  User,
  UserRole
} from '../types/database';
import { sha256 } from './crypto';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_EXAM_FACULTY,
  INITIAL_EXAMS,
  INITIAL_FACULTY,
  INITIAL_MARKS,
  INITIAL_NOTIFICATIONS,
  INITIAL_RESULTS,
  INITIAL_ROOMS,
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  INITIAL_USERS
} from './initialData';
import { getSupabase } from './supabase';

const LS_PREFIX = 'exam_cell_db_v1_';

function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(val));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

class DatabaseService {
  private users: User[];
  private departments: Department[];
  private students: Student[];
  private faculty: Faculty[];
  private subjects: Subject[];
  private rooms: ExamRoom[];
  private exams: Exam[];
  private examFaculty: ExamFaculty[];
  private marks: Mark[];
  private results: Result[];
  private notifications: Notification[];

  constructor() {
    this.users = getLocal('users', INITIAL_USERS);
    this.departments = getLocal('departments', INITIAL_DEPARTMENTS);
    this.students = getLocal('students', INITIAL_STUDENTS);
    this.faculty = getLocal('faculty', INITIAL_FACULTY);
    this.subjects = getLocal('subjects', INITIAL_SUBJECTS);
    this.rooms = getLocal('rooms', INITIAL_ROOMS);
    this.exams = getLocal('exams', INITIAL_EXAMS);
    this.examFaculty = getLocal('exam_faculty', INITIAL_EXAM_FACULTY);
    this.marks = getLocal('marks', INITIAL_MARKS);
    this.results = getLocal('results', INITIAL_RESULTS);
    this.notifications = getLocal('notifications', INITIAL_NOTIFICATIONS);
  }

  public resetToDefault() {
    this.users = INITIAL_USERS;
    this.departments = INITIAL_DEPARTMENTS;
    this.students = INITIAL_STUDENTS;
    this.faculty = INITIAL_FACULTY;
    this.subjects = INITIAL_SUBJECTS;
    this.rooms = INITIAL_ROOMS;
    this.exams = INITIAL_EXAMS;
    this.examFaculty = INITIAL_EXAM_FACULTY;
    this.marks = INITIAL_MARKS;
    this.results = INITIAL_RESULTS;
    this.notifications = INITIAL_NOTIFICATIONS;

    setLocal('users', this.users);
    setLocal('departments', this.departments);
    setLocal('students', this.students);
    setLocal('faculty', this.faculty);
    setLocal('subjects', this.subjects);
    setLocal('rooms', this.rooms);
    setLocal('exams', this.exams);
    setLocal('exam_faculty', this.examFaculty);
    setLocal('marks', this.marks);
    setLocal('results', this.results);
    setLocal('notifications', this.notifications);
  }

  public async checkSupabaseConnection(): Promise<boolean> {
    const client = getSupabase();
    if (!client) return false;
    try {
      const { data, error } = await client.from('departments').select('id').limit(1);
      return !error && Array.isArray(data);
    } catch {
      return false;
    }
  }

  // =========================================================================
  // AUTHENTICATION (Never exposes password_hash to the frontend)
  // =========================================================================
  public async authenticate(username: string, passwordPlain: string): Promise<AuthUser | null> {
    const passwordHash = await sha256(passwordPlain);
    const client = getSupabase();

    if (client) {
      try {
        // Attempt using secure RPC function authenticate_user
        const { data: rpcData, error: rpcError } = await client.rpc('authenticate_user', {
          p_username: username,
          p_password_hash: passwordHash
        });

        if (!rpcError && rpcData && rpcData.length > 0) {
          const row = rpcData[0];
          return {
            id: row.id,
            username: row.username,
            full_name: row.full_name,
            email: row.email,
            role: row.role as UserRole,
            student_id: row.student_id || undefined,
            faculty_id: row.faculty_id || undefined
          };
        }

        // Direct select fallback on Supabase if RPC not configured yet
        const { data: userRow } = await client
          .from('users')
          .select('id, username, full_name, email, role')
          .eq('username', username)
          .eq('password_hash', passwordHash)
          .single();

        if (userRow) {
          let studentId: string | undefined;
          let facultyId: string | undefined;

          if (userRow.role === 'student') {
            const { data: s } = await client.from('students').select('id').eq('user_id', userRow.id).single();
            studentId = s?.id;
          } else if (userRow.role === 'faculty') {
            const { data: f } = await client.from('faculty').select('id').eq('user_id', userRow.id).single();
            facultyId = f?.id;
          }

          return {
            id: userRow.id,
            username: userRow.username,
            full_name: userRow.full_name,
            email: userRow.email,
            role: userRow.role as UserRole,
            student_id: studentId,
            faculty_id: facultyId
          };
        }
      } catch (err) {
        console.warn('Supabase auth attempt returned error, falling back to local store:', err);
      }
    }

    // Local / Prototype Fallback
    const localUser = this.users.find(u => u.username === username && u.password_hash === passwordHash);
    if (!localUser) return null;

    let studentId: string | undefined;
    let facultyId: string | undefined;

    if (localUser.role === 'student') {
      studentId = this.students.find(s => s.user_id === localUser.id)?.id;
    } else if (localUser.role === 'faculty') {
      facultyId = this.faculty.find(f => f.user_id === localUser.id)?.id;
    }

    return {
      id: localUser.id,
      username: localUser.username,
      full_name: localUser.full_name,
      email: localUser.email,
      role: localUser.role,
      student_id: studentId,
      faculty_id: facultyId
    };
  }

  // =========================================================================
  // DEPARTMENTS
  // =========================================================================
  public async getDepartments(): Promise<Department[]> {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('departments').select('*').order('name');
        if (!error && data) return data;
      } catch (e) {
        console.warn(e);
      }
    }
    return [...this.departments].sort((a, b) => a.name.localeCompare(b.name));
  }

  public async createDepartment(data: Omit<Department, 'id' | 'created_at'>): Promise<Department> {
    const newDept: Department = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      created_at: new Date().toISOString()
    };

    const client = getSupabase();
    if (client) {
      try {
        const { data: inserted, error } = await client.from('departments').insert([newDept]).select().single();
        if (!error && inserted) {
          this.departments.push(inserted);
          setLocal('departments', this.departments);
          return inserted;
        }
      } catch (e) {
        console.warn(e);
      }
    }

    this.departments.push(newDept);
    setLocal('departments', this.departments);
    return newDept;
  }

  public async updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    const client = getSupabase();
    if (client) {
      try {
        await client.from('departments').update(data).eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }
    this.departments = this.departments.map(d => (d.id === id ? { ...d, ...data } : d));
    setLocal('departments', this.departments);
    return this.departments.find(d => d.id === id)!;
  }

  public async deleteDepartment(id: string): Promise<boolean> {
    // Check constraints
    const hasStudents = this.students.some(s => s.department_id === id);
    const hasSubjects = this.subjects.some(sub => sub.department_id === id);
    if (hasStudents || hasSubjects) {
      throw new Error('Cannot delete department with active students or subjects.');
    }

    const client = getSupabase();
    if (client) {
      try {
        await client.from('departments').delete().eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }
    this.departments = this.departments.filter(d => d.id !== id);
    setLocal('departments', this.departments);
    return true;
  }

  // =========================================================================
  // STUDENTS
  // =========================================================================
  public async getStudents(): Promise<Student[]> {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('students')
          .select('*, user:users(id, username, full_name, email, role), department:departments(*)')
          .order('roll_number');
        if (!error && data) return data;
      } catch (e) {
        console.warn(e);
      }
    }

    return this.students.map(s => {
      const user = this.users.find(u => u.id === s.user_id);
      const department = this.departments.find(d => d.id === s.department_id);
      return { ...s, user, department };
    });
  }

  public async createStudent(input: {
    full_name: string;
    email: string;
    username: string;
    passwordPlain?: string;
    roll_number: string;
    enrollment_number: string;
    department_id: string;
    semester: number;
    academic_year: string;
    phone?: string;
    date_of_birth?: string;
  }): Promise<Student> {
    const passwordHash = await sha256(input.passwordPlain || 'student123');
    const userId = crypto.randomUUID();
    const studentId = crypto.randomUUID();

    const newUser: User = {
      id: userId,
      username: input.username.trim(),
      password_hash: passwordHash,
      full_name: input.full_name.trim(),
      email: input.email.trim(),
      role: 'student',
      created_at: new Date().toISOString()
    };

    const newStudent: Student = {
      id: studentId,
      user_id: userId,
      roll_number: input.roll_number.trim().toUpperCase(),
      enrollment_number: input.enrollment_number.trim().toUpperCase(),
      department_id: input.department_id,
      semester: Number(input.semester),
      academic_year: input.academic_year.trim(),
      phone: input.phone?.trim() || '',
      date_of_birth: input.date_of_birth || '',
      created_at: new Date().toISOString()
    };

    const client = getSupabase();
    if (client) {
      try {
        await client.from('users').insert([newUser]);
        await client.from('students').insert([newStudent]);
      } catch (e) {
        console.warn('Supabase insertion fallback:', e);
      }
    }

    this.users.push(newUser);
    this.students.push(newStudent);
    setLocal('users', this.users);
    setLocal('students', this.students);

    const dept = this.departments.find(d => d.id === newStudent.department_id);
    return { ...newStudent, user: newUser, department: dept };
  }

  public async updateStudent(id: string, input: Partial<Student & { full_name?: string; email?: string }>): Promise<Student> {
    const student = this.students.find(s => s.id === id);
    if (!student) throw new Error('Student not found');

    if (input.full_name || input.email) {
      this.users = this.users.map(u => {
        if (u.id === student.user_id) {
          return {
            ...u,
            ...(input.full_name ? { full_name: input.full_name } : {}),
            ...(input.email ? { email: input.email } : {})
          };
        }
        return u;
      });
      setLocal('users', this.users);
    }

    const updated = {
      ...student,
      ...(input.roll_number ? { roll_number: input.roll_number.toUpperCase() } : {}),
      ...(input.enrollment_number ? { enrollment_number: input.enrollment_number.toUpperCase() } : {}),
      ...(input.department_id ? { department_id: input.department_id } : {}),
      ...(input.semester ? { semester: Number(input.semester) } : {}),
      ...(input.academic_year ? { academic_year: input.academic_year } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.date_of_birth !== undefined ? { date_of_birth: input.date_of_birth } : {}),
      updated_at: new Date().toISOString()
    };

    this.students = this.students.map(s => (s.id === id ? updated : s));
    setLocal('students', this.students);

    const client = getSupabase();
    if (client) {
      try {
        if (input.full_name || input.email) {
          await client.from('users').update({
            ...(input.full_name ? { full_name: input.full_name } : {}),
            ...(input.email ? { email: input.email } : {})
          }).eq('id', student.user_id);
        }
        await client.from('students').update(updated).eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }

    return {
      ...updated,
      user: this.users.find(u => u.id === updated.user_id),
      department: this.departments.find(d => d.id === updated.department_id)
    };
  }

  public async deleteStudent(id: string): Promise<boolean> {
    const student = this.students.find(s => s.id === id);
    if (!student) return false;

    const client = getSupabase();
    if (client) {
      try {
        await client.from('students').delete().eq('id', id);
        await client.from('users').delete().eq('id', student.user_id);
      } catch (e) {
        console.warn(e);
      }
    }

    this.students = this.students.filter(s => s.id !== id);
    this.users = this.users.filter(u => u.id !== student.user_id);
    this.marks = this.marks.filter(m => m.student_id !== id);
    this.results = this.results.filter(r => r.student_id !== id);

    setLocal('students', this.students);
    setLocal('users', this.users);
    setLocal('marks', this.marks);
    setLocal('results', this.results);
    return true;
  }

  // =========================================================================
  // FACULTY
  // =========================================================================
  public async getFaculty(): Promise<Faculty[]> {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('faculty')
          .select('*, user:users(id, username, full_name, email, role), department:departments(*)')
          .order('employee_id');
        if (!error && data) return data;
      } catch (e) {
        console.warn(e);
      }
    }

    return this.faculty.map(f => {
      const user = this.users.find(u => u.id === f.user_id);
      const department = this.departments.find(d => d.id === f.department_id);
      return { ...f, user, department };
    });
  }

  public async createFaculty(input: {
    full_name: string;
    email: string;
    username: string;
    employee_id: string;
    department_id: string;
    designation: string;
    passwordPlain?: string;
  }): Promise<Faculty> {
    const passwordHash = await sha256(input.passwordPlain || 'faculty123');
    const userId = crypto.randomUUID();
    const facultyId = crypto.randomUUID();

    const newUser: User = {
      id: userId,
      username: input.username.trim(),
      password_hash: passwordHash,
      full_name: input.full_name.trim(),
      email: input.email.trim(),
      role: 'faculty',
      created_at: new Date().toISOString()
    };

    const newFaculty: Faculty = {
      id: facultyId,
      user_id: userId,
      employee_id: input.employee_id.trim().toUpperCase(),
      department_id: input.department_id,
      designation: input.designation.trim(),
      created_at: new Date().toISOString()
    };

    const client = getSupabase();
    if (client) {
      try {
        await client.from('users').insert([newUser]);
        await client.from('faculty').insert([newFaculty]);
      } catch (e) {
        console.warn(e);
      }
    }

    this.users.push(newUser);
    this.faculty.push(newFaculty);
    setLocal('users', this.users);
    setLocal('faculty', this.faculty);

    const dept = this.departments.find(d => d.id === newFaculty.department_id);
    return { ...newFaculty, user: newUser, department: dept };
  }

  public async updateFaculty(id: string, input: Partial<Faculty & { full_name?: string; email?: string }>): Promise<Faculty> {
    const fac = this.faculty.find(f => f.id === id);
    if (!fac) throw new Error('Faculty member not found');

    if (input.full_name || input.email) {
      this.users = this.users.map(u => {
        if (u.id === fac.user_id) {
          return {
            ...u,
            ...(input.full_name ? { full_name: input.full_name } : {}),
            ...(input.email ? { email: input.email } : {})
          };
        }
        return u;
      });
      setLocal('users', this.users);
    }

    const updated = {
      ...fac,
      ...(input.employee_id ? { employee_id: input.employee_id.toUpperCase() } : {}),
      ...(input.department_id ? { department_id: input.department_id } : {}),
      ...(input.designation ? { designation: input.designation } : {}),
      updated_at: new Date().toISOString()
    };

    this.faculty = this.faculty.map(f => (f.id === id ? updated : f));
    setLocal('faculty', this.faculty);

    const client = getSupabase();
    if (client) {
      try {
        if (input.full_name || input.email) {
          await client.from('users').update({
            ...(input.full_name ? { full_name: input.full_name } : {}),
            ...(input.email ? { email: input.email } : {})
          }).eq('id', fac.user_id);
        }
        await client.from('faculty').update(updated).eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }

    return {
      ...updated,
      user: this.users.find(u => u.id === updated.user_id),
      department: this.departments.find(d => d.id === updated.department_id)
    };
  }

  public async deleteFaculty(id: string): Promise<boolean> {
    const fac = this.faculty.find(f => f.id === id);
    if (!fac) return false;

    const client = getSupabase();
    if (client) {
      try {
        await client.from('faculty').delete().eq('id', id);
        await client.from('users').delete().eq('id', fac.user_id);
      } catch (e) {
        console.warn(e);
      }
    }

    this.faculty = this.faculty.filter(f => f.id !== id);
    this.users = this.users.filter(u => u.id !== fac.user_id);
    this.examFaculty = this.examFaculty.filter(ef => ef.faculty_id !== id);

    setLocal('faculty', this.faculty);
    setLocal('users', this.users);
    setLocal('exam_faculty', this.examFaculty);
    return true;
  }

  // =========================================================================
  // SUBJECTS
  // =========================================================================
  public async getSubjects(): Promise<Subject[]> {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('subjects')
          .select('*, department:departments(*)')
          .order('subject_code');
        if (!error && data) return data;
      } catch (e) {
        console.warn(e);
      }
    }

    return this.subjects.map(s => ({
      ...s,
      department: this.departments.find(d => d.id === s.department_id)
    }));
  }

  public async createSubject(data: Omit<Subject, 'id' | 'created_at'>): Promise<Subject> {
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      subject_code: data.subject_code.trim().toUpperCase(),
      subject_name: data.subject_name.trim(),
      department_id: data.department_id,
      semester: Number(data.semester),
      credits: Number(data.credits) || 4,
      max_marks: Number(data.max_marks) || 100,
      passing_marks: Number(data.passing_marks) || 40,
      created_at: new Date().toISOString()
    };

    const client = getSupabase();
    if (client) {
      try {
        await client.from('subjects').insert([newSubject]);
      } catch (e) {
        console.warn(e);
      }
    }

    this.subjects.push(newSubject);
    setLocal('subjects', this.subjects);
    return {
      ...newSubject,
      department: this.departments.find(d => d.id === newSubject.department_id)
    };
  }

  public async updateSubject(id: string, data: Partial<Subject>): Promise<Subject> {
    const client = getSupabase();
    if (client) {
      try {
        await client.from('subjects').update(data).eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }

    this.subjects = this.subjects.map(s => (s.id === id ? { ...s, ...data, updated_at: new Date().toISOString() } : s));
    setLocal('subjects', this.subjects);

    const updated = this.subjects.find(s => s.id === id)!;
    return {
      ...updated,
      department: this.departments.find(d => d.id === updated.department_id)
    };
  }

  public async deleteSubject(id: string): Promise<boolean> {
    const hasExams = this.exams.some(e => e.subject_id === id);
    if (hasExams) throw new Error('Cannot delete subject that is assigned to scheduled exams.');

    const client = getSupabase();
    if (client) {
      try {
        await client.from('subjects').delete().eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }

    this.subjects = this.subjects.filter(s => s.id !== id);
    setLocal('subjects', this.subjects);
    return true;
  }

  // =========================================================================
  // ROOMS
  // =========================================================================
  public async getExamRooms(): Promise<ExamRoom[]> {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('exam_rooms').select('*').order('room_number');
        if (!error && data) return data;
      } catch (e) {
        console.warn(e);
      }
    }
    return [...this.rooms].sort((a, b) => a.room_number.localeCompare(b.room_number));
  }

  public async createExamRoom(data: Omit<ExamRoom, 'id' | 'created_at'>): Promise<ExamRoom> {
    const newRoom: ExamRoom = {
      id: crypto.randomUUID(),
      room_number: data.room_number.trim().toUpperCase(),
      building: data.building.trim(),
      floor: Number(data.floor),
      capacity: Number(data.capacity),
      created_at: new Date().toISOString()
    };

    const client = getSupabase();
    if (client) {
      try {
        await client.from('exam_rooms').insert([newRoom]);
      } catch (e) {
        console.warn(e);
      }
    }

    this.rooms.push(newRoom);
    setLocal('rooms', this.rooms);
    return newRoom;
  }

  public async updateExamRoom(id: string, data: Partial<ExamRoom>): Promise<ExamRoom> {
    const client = getSupabase();
    if (client) {
      try {
        await client.from('exam_rooms').update(data).eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }

    this.rooms = this.rooms.map(r => (r.id === id ? { ...r, ...data } : r));
    setLocal('rooms', this.rooms);
    return this.rooms.find(r => r.id === id)!;
  }

  public async deleteExamRoom(id: string): Promise<boolean> {
    const hasScheduledExams = this.exams.some(e => e.room_id === id && e.status === 'Scheduled');
    if (hasScheduledExams) {
      throw new Error('Cannot delete room currently allocated to scheduled examinations.');
    }

    const client = getSupabase();
    if (client) {
      try {
        await client.from('exam_rooms').delete().eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }

    this.rooms = this.rooms.filter(r => r.id !== id);
    setLocal('rooms', this.rooms);
    return true;
  }

  // =========================================================================
  // EXAMS & CONFLICT DETECTION
  // =========================================================================
  private checkTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + (m || 0);
    };
    return toMinutes(start1) < toMinutes(end2) && toMinutes(end1) > toMinutes(start2);
  }

  public async getExams(): Promise<Exam[]> {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('exams')
          .select('*, subject:subjects(*), department:departments(*), room:exam_rooms(*), exam_faculty(faculty_id)')
          .order('exam_date');
        if (!error && data) {
          return data.map((e: any) => ({
            ...e,
            faculty_ids: e.exam_faculty?.map((ef: any) => ef.faculty_id) || []
          }));
        }
      } catch (e) {
        console.warn(e);
      }
    }

    return this.exams.map(e => {
      const subject = this.subjects.find(s => s.id === e.subject_id);
      const department = this.departments.find(d => d.id === e.department_id);
      const room = this.rooms.find(r => r.id === e.room_id);
      const assignedFacultyIds = this.examFaculty.filter(ef => ef.exam_id === e.id).map(ef => ef.faculty_id);
      const faculty = this.faculty
        .filter(f => assignedFacultyIds.includes(f.id))
        .map(f => ({
          ...f,
          user: this.users.find(u => u.id === f.user_id)
        }));

      return {
        ...e,
        subject,
        department,
        room,
        faculty_ids: assignedFacultyIds,
        faculty
      };
    });
  }

  public async createExam(input: Omit<Exam, 'id' | 'created_at'> & { faculty_ids?: string[] }): Promise<Exam> {
    // 1. Conflict Prevention: Check room double booking
    if (input.room_id) {
      const roomConflict = this.exams.find(
        e =>
          e.status !== 'Cancelled' &&
          e.room_id === input.room_id &&
          e.exam_date === input.exam_date &&
          this.checkTimeOverlap(e.start_time, e.end_time, input.start_time, input.end_time)
      );

      if (roomConflict) {
        const room = this.rooms.find(r => r.id === input.room_id);
        throw new Error(
          `Scheduling Conflict: Room ${room?.room_number || 'selected'} is already booked for another exam on ${input.exam_date} between ${roomConflict.start_time} and ${roomConflict.end_time}.`
        );
      }
    }

    // 2. Conflict Prevention: Faculty invigilator overlap
    if (input.faculty_ids && input.faculty_ids.length > 0) {
      for (const facId of input.faculty_ids) {
        const overlappingDuty = this.exams.find(e => {
          if (e.status === 'Cancelled' || e.exam_date !== input.exam_date) return false;
          const isOverlapping = this.checkTimeOverlap(e.start_time, e.end_time, input.start_time, input.end_time);
          const hasDuty = this.examFaculty.some(ef => ef.exam_id === e.id && ef.faculty_id === facId);
          return isOverlapping && hasDuty;
        });

        if (overlappingDuty) {
          const facMember = this.faculty.find(f => f.id === facId);
          const user = this.users.find(u => u.id === facMember?.user_id);
          throw new Error(
            `Faculty Conflict: ${user?.full_name || 'Assigned faculty'} is already invigilating an exam during this time slot on ${input.exam_date}.`
          );
        }
      }
    }

    const examId = crypto.randomUUID();
    const newExam: Exam = {
      id: examId,
      subject_id: input.subject_id,
      department_id: input.department_id,
      semester: Number(input.semester),
      exam_date: input.exam_date,
      start_time: input.start_time,
      end_time: input.end_time,
      room_id: input.room_id || null,
      exam_type: input.exam_type,
      status: input.status || 'Scheduled',
      created_by: input.created_by,
      created_at: new Date().toISOString()
    };

    const newFacultyRelations: ExamFaculty[] = (input.faculty_ids || []).map(facId => ({
      id: crypto.randomUUID(),
      exam_id: examId,
      faculty_id: facId,
      created_at: new Date().toISOString()
    }));

    const client = getSupabase();
    if (client) {
      try {
        await client.from('exams').insert([newExam]);
        if (newFacultyRelations.length > 0) {
          await client.from('exam_faculty').insert(newFacultyRelations);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    this.exams.push(newExam);
    this.examFaculty.push(...newFacultyRelations);
    setLocal('exams', this.exams);
    setLocal('exam_faculty', this.examFaculty);

    // Create notifications for assigned faculty
    const subject = this.subjects.find(s => s.id === input.subject_id);
    const room = this.rooms.find(r => r.id === input.room_id);
    if (input.faculty_ids) {
      for (const facId of input.faculty_ids) {
        const fac = this.faculty.find(f => f.id === facId);
        if (fac) {
          await this.createNotification({
            user_id: fac.user_id,
            title: `Invigilation Assigned: ${subject?.subject_code || 'Exam'}`,
            message: `You are assigned to invigilate ${subject?.subject_name} on ${input.exam_date} at ${room?.room_number || 'Exam Hall'}.`,
            type: 'exam'
          });
        }
      }
    }

    return {
      ...newExam,
      subject,
      department: this.departments.find(d => d.id === newExam.department_id),
      room,
      faculty_ids: input.faculty_ids
    };
  }

  public async updateExam(id: string, input: Partial<Exam & { faculty_ids?: string[] }>): Promise<Exam> {
    const exam = this.exams.find(e => e.id === id);
    if (!exam) throw new Error('Exam not found');

    const updatedExam: Exam = {
      ...exam,
      ...input,
      updated_at: new Date().toISOString()
    };

    if (input.faculty_ids) {
      this.examFaculty = this.examFaculty.filter(ef => ef.exam_id !== id);
      const newRelations: ExamFaculty[] = input.faculty_ids.map(facId => ({
        id: crypto.randomUUID(),
        exam_id: id,
        faculty_id: facId,
        created_at: new Date().toISOString()
      }));
      this.examFaculty.push(...newRelations);
      setLocal('exam_faculty', this.examFaculty);
    }

    this.exams = this.exams.map(e => (e.id === id ? updatedExam : e));
    setLocal('exams', this.exams);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('exams').update(updatedExam).eq('id', id);
        if (input.faculty_ids) {
          await client.from('exam_faculty').delete().eq('exam_id', id);
          const rels = input.faculty_ids.map(facId => ({
            exam_id: id,
            faculty_id: facId
          }));
          await client.from('exam_faculty').insert(rels);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    return {
      ...updatedExam,
      subject: this.subjects.find(s => s.id === updatedExam.subject_id),
      department: this.departments.find(d => d.id === updatedExam.department_id),
      room: this.rooms.find(r => r.id === updatedExam.room_id)
    };
  }

  public async cancelExam(id: string): Promise<boolean> {
    return !!(await this.updateExam(id, { status: 'Cancelled' }));
  }

  // =========================================================================
  // MARKS
  // =========================================================================
  public async getMarks(filters?: { exam_id?: string; student_id?: string; status?: MarkStatus }): Promise<Mark[]> {
    const client = getSupabase();
    if (client) {
      try {
        let q = client
          .from('marks')
          .select('*, student:students(*, user:users(*), department:departments(*)), exam:exams(*, subject:subjects(*))');

        if (filters?.exam_id) q = q.eq('exam_id', filters.exam_id);
        if (filters?.student_id) q = q.eq('student_id', filters.student_id);
        if (filters?.status) q = q.eq('status', filters.status);

        const { data, error } = await q;
        if (!error && data) return data;
      } catch (e) {
        console.warn(e);
      }
    }

    let result = [...this.marks];
    if (filters?.exam_id) result = result.filter(m => m.exam_id === filters.exam_id);
    if (filters?.student_id) result = result.filter(m => m.student_id === filters.student_id);
    if (filters?.status) result = result.filter(m => m.status === filters.status);

    return result.map(m => {
      const student = this.students.find(s => s.id === m.student_id);
      const exam = this.exams.find(e => e.id === m.exam_id);
      return {
        ...m,
        student: student
          ? {
              ...student,
              user: this.users.find(u => u.id === student.user_id),
              department: this.departments.find(d => d.id === student.department_id)
            }
          : undefined,
        exam: exam
          ? {
              ...exam,
              subject: this.subjects.find(s => s.id === exam.subject_id)
            }
          : undefined
      };
    });
  }

  public async saveMark(entry: {
    exam_id: string;
    student_id: string;
    internal_marks: number;
    external_marks: number;
    entered_by?: string;
    status: MarkStatus;
  }): Promise<Mark> {
    const exam = this.exams.find(e => e.id === entry.exam_id);
    const subject = this.subjects.find(s => s.id === exam?.subject_id);
    const maxMarks = subject?.max_marks || 100;
    const passingMarks = subject?.passing_marks || 40;

    const total = Number(entry.internal_marks) + Number(entry.external_marks);
    const percentage = Number(((total / maxMarks) * 100).toFixed(2));

    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    const resultStatus = total >= passingMarks ? 'Pass' : 'Fail';

    const existingIndex = this.marks.findIndex(m => m.exam_id === entry.exam_id && m.student_id === entry.student_id);
    let updatedMark: Mark;

    if (existingIndex >= 0) {
      const existing = this.marks[existingIndex];
      // Prevent modification if already Submitted / Verified / Published by unauthorized
      if (existing.status === 'Published' && entry.status === 'Draft') {
        throw new Error('Cannot downgrade published marks to draft status.');
      }

      updatedMark = {
        ...existing,
        internal_marks: entry.internal_marks,
        external_marks: entry.external_marks,
        total_marks: total,
        percentage,
        grade,
        result_status: resultStatus,
        status: entry.status,
        entered_by: entry.entered_by || existing.entered_by,
        updated_at: new Date().toISOString()
      };
      this.marks[existingIndex] = updatedMark;
    } else {
      updatedMark = {
        id: crypto.randomUUID(),
        exam_id: entry.exam_id,
        student_id: entry.student_id,
        internal_marks: entry.internal_marks,
        external_marks: entry.external_marks,
        total_marks: total,
        percentage,
        grade,
        result_status: resultStatus,
        status: entry.status,
        entered_by: entry.entered_by,
        created_at: new Date().toISOString()
      };
      this.marks.push(updatedMark);
    }

    setLocal('marks', this.marks);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('marks').upsert([updatedMark], { onConflict: 'exam_id,student_id' });
      } catch (e) {
        console.warn(e);
      }
    }

    return updatedMark;
  }

  public async updateMarkStatus(id: string, status: MarkStatus): Promise<Mark> {
    const mark = this.marks.find(m => m.id === id);
    if (!mark) throw new Error('Mark entry not found');

    mark.status = status;
    mark.updated_at = new Date().toISOString();
    setLocal('marks', this.marks);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('marks').update({ status, updated_at: mark.updated_at }).eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }

    // If published, notify student
    if (status === 'Published') {
      const student = this.students.find(s => s.id === mark.student_id);
      const exam = this.exams.find(e => e.id === mark.exam_id);
      const subject = this.subjects.find(s => s.id === exam?.subject_id);
      if (student) {
        await this.createNotification({
          user_id: student.user_id,
          title: `Result Published: ${subject?.subject_code || 'Course'}`,
          message: `Your final score for ${subject?.subject_name} has been published: ${mark.total_marks} marks (Grade ${mark.grade}, ${mark.result_status}).`,
          type: 'result'
        });
      }
    }

    return mark;
  }

  // =========================================================================
  // RESULTS
  // =========================================================================
  public async getResults(studentId?: string): Promise<Result[]> {
    const client = getSupabase();
    if (client) {
      try {
        let q = client.from('results').select('*, student:students(*, user:users(*), department:departments(*))').order('published_at', { ascending: false });
        if (studentId) q = q.eq('student_id', studentId);
        const { data, error } = await q;
        if (!error && data) return data;
      } catch (e) {
        console.warn(e);
      }
    }

    let res = [...this.results];
    if (studentId) res = res.filter(r => r.student_id === studentId);
    return res.map(r => {
      const student = this.students.find(s => s.id === r.student_id);
      return {
        ...r,
        student: student
          ? {
              ...student,
              user: this.users.find(u => u.id === student.user_id),
              department: this.departments.find(d => d.id === student.department_id)
            }
          : undefined
      };
    });
  }

  public async publishSemesterResult(studentId: string, semester: number, academicYear: string): Promise<Result> {
    // Collect published marks for this student and semester
    const studentMarks = this.marks.filter(m => {
      if (m.student_id !== studentId) return false;
      const exam = this.exams.find(e => e.id === m.exam_id);
      return exam?.semester === semester && m.status === 'Published';
    });

    if (studentMarks.length === 0) {
      throw new Error('No published course marks found for this semester to calculate GPA.');
    }

    const totalMarks = studentMarks.reduce((sum, m) => sum + Number(m.total_marks), 0);
    const maxMarksPossible = studentMarks.length * 100;
    const percentage = Number(((totalMarks / maxMarksPossible) * 100).toFixed(2));

    const gradePoints: Record<string, number> = {
      'A+': 10,
      'A': 9,
      'B+': 8,
      'B': 7,
      'C': 6,
      'D': 5,
      'F': 0
    };
    const totalPoints = studentMarks.reduce((sum, m) => sum + (gradePoints[m.grade] ?? 0), 0);
    const sgpa = Number((totalPoints / studentMarks.length).toFixed(2));
    const resultStatus = studentMarks.some(m => m.result_status === 'Fail') ? 'Fail' : 'Pass';

    const existingIndex = this.results.findIndex(
      r => r.student_id === studentId && r.semester === semester && r.academic_year === academicYear
    );

    const newResult: Result = {
      id: existingIndex >= 0 ? this.results[existingIndex].id : crypto.randomUUID(),
      student_id: studentId,
      semester,
      academic_year: academicYear,
      total_marks: totalMarks,
      percentage,
      sgpa,
      result_status: resultStatus,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      this.results[existingIndex] = newResult;
    } else {
      this.results.push(newResult);
    }
    setLocal('results', this.results);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('results').upsert([newResult]);
      } catch (e) {
        console.warn(e);
      }
    }

    const student = this.students.find(s => s.id === studentId);
    if (student) {
      await this.createNotification({
        user_id: student.user_id,
        title: `Semester ${semester} SGPA Published!`,
        message: `Your final semester result has been published: SGPA ${sgpa} (${resultStatus}).`,
        type: 'result'
      });
    }

    return newResult;
  }

  // =========================================================================
  // NOTIFICATIONS
  // =========================================================================
  public async getNotifications(userId: string): Promise<Notification[]> {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn(e);
      }
    }

    return this.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async markNotificationAsRead(id: string): Promise<void> {
    this.notifications = this.notifications.map(n => (n.id === id ? { ...n, is_read: true } : n));
    setLocal('notifications', this.notifications);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('notifications').update({ is_read: true }).eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }
  }

  public async markAllNotificationsAsRead(userId: string): Promise<void> {
    this.notifications = this.notifications.map(n => (n.user_id === userId ? { ...n, is_read: true } : n));
    setLocal('notifications', this.notifications);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('notifications').update({ is_read: true }).eq('user_id', userId);
      } catch (e) {
        console.warn(e);
      }
    }
  }

  public async createNotification(item: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<Notification> {
    const newNotif: Notification = {
      id: crypto.randomUUID(),
      user_id: item.user_id,
      title: item.title,
      message: item.message,
      type: item.type,
      is_read: false,
      created_at: new Date().toISOString()
    };

    this.notifications.unshift(newNotif);
    setLocal('notifications', this.notifications);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('notifications').insert([newNotif]);
      } catch (e) {
        console.warn(e);
      }
    }

    return newNotif;
  }
}

export const db = new DatabaseService();
