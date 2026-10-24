import { db } from '../lib/databaseService';
import { Exam, Mark, Result, Student } from '../types/database';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sourceContext?: {
    examsCount?: number;
    resultsCount?: number;
    marksCount?: number;
  };
}

export async function askExamAssistant(studentId: string, query: string): Promise<string> {
  // 1. Fetch the student's real database records
  const allStudents = await db.getStudents();
  const currentStudent = allStudents.find(s => s.id === studentId);
  if (!currentStudent) {
    return "I couldn't locate your student profile in the examination database. Please re-login.";
  }

  const allExams = await db.getExams();
  // Filter relevant exams for this student
  const studentExams = allExams.filter(
    e => e.department_id === currentStudent.department_id && e.semester === currentStudent.semester
  ).sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());

  const studentMarks = await db.getMarks({ student_id: studentId });
  const studentResults = await db.getResults(studentId);

  // Normalization for intent matching
  const q = query.toLowerCase().trim();

  // Try checking with Gemini API if key is present
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any)?.env?.GEMINI_API_KEY;
  if (apiKey && !apiKey.includes('MY_GEMINI_API_KEY')) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
You are the official University Exam Cell AI Academic Assistant for student "${currentStudent.user?.full_name || 'Student'}" (Roll Number: ${currentStudent.roll_number}, Dept: ${currentStudent.department?.name}, Semester: ${currentStudent.semester}).

CRITICAL CONSTRAINT: You MUST ONLY answer based on the real student database records provided below. NEVER fabricate, estimate, or hallucinate marks, dates, grades, or exam schedules. If information is not in the records, state clearly that it is not yet registered in the exam cell database.

STUDENT RECORDS:
- Scheduled Exams (${studentExams.length}):
${JSON.stringify(studentExams.map(e => ({
  subjectCode: e.subject?.subject_code,
  subjectName: e.subject?.subject_name,
  date: e.exam_date,
  time: `${e.start_time} - ${e.end_time}`,
  room: e.room?.room_number || 'TBA',
  type: e.exam_type,
  status: e.status
})), null, 2)}

- Recorded Course Marks (${studentMarks.length}):
${JSON.stringify(studentMarks.map(m => ({
  subjectCode: m.exam?.subject?.subject_code,
  subjectName: m.exam?.subject?.subject_name,
  internalMarks: m.internal_marks,
  externalMarks: m.external_marks,
  totalMarks: m.total_marks,
  grade: m.grade,
  status: m.status,
  resultStatus: m.result_status
})), null, 2)}

- Semester Final Results (${studentResults.length}):
${JSON.stringify(studentResults.map(r => ({
  semester: r.semester,
  sgpa: r.sgpa,
  totalMarks: r.total_marks,
  percentage: r.percentage,
  result: r.result_status
})), null, 2)}

STUDENT QUESTION: "${query}"

Provide a clear, respectful, professional, and accurate response based strictly on the data above.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local deterministic academic query engine:', err);
    }
  }

  // Deterministic local grounded query engine (guarantees zero hallucination without API key)
  const now = new Date();
  const upcomingExams = studentExams.filter(e => e.status === 'Scheduled');

  // Next exam query
  if (q.includes('next exam') || q.includes('when is my next') || (q.includes('when') && q.includes('exam'))) {
    if (upcomingExams.length === 0) {
      return `According to your exam cell records, there are currently no upcoming scheduled examinations for Semester ${currentStudent.semester} in ${currentStudent.department?.name || 'your department'}.`;
    }
    const next = upcomingExams[0];
    return `Your next scheduled examination is **${next.subject?.subject_code}: ${next.subject?.subject_name}** (${next.exam_type}).\n\n- **Date:** ${next.exam_date}\n- **Timing:** ${next.start_time} – ${next.end_time}\n- **Venue:** ${next.room?.room_number || 'Room TBA'} (${next.room?.building || 'Main Campus'})\n\nPlease arrive at least 15 minutes before the start time with your official University ID and Hall Ticket.`;
  }

  // Number of exams
  if (q.includes('how many exams') || q.includes('exam count') || q.includes('total exams')) {
    return `You have **${upcomingExams.length} upcoming examination(s)** scheduled for Semester ${currentStudent.semester}:\n\n` +
      upcomingExams.map((e, idx) => `${idx + 1}. **${e.subject?.subject_code} - ${e.subject?.subject_name}** on ${e.exam_date} (${e.start_time.slice(0, 5)} at ${e.room?.room_number || 'TBA'})`).join('\n');
  }

  // Specific subject queries (e.g. DBMS, Algorithms, OS, etc.)
  const foundSubjectMark = studentMarks.find(m => {
    const code = m.exam?.subject?.subject_code?.toLowerCase() || '';
    const name = m.exam?.subject?.subject_name?.toLowerCase() || '';
    return (
      (q.includes('dbms') && (code.includes('501') || name.includes('database'))) ||
      (q.includes('algorithm') && (code.includes('502') || name.includes('algorithm'))) ||
      (q.includes('operating') && (code.includes('503') || name.includes('operating'))) ||
      (code && q.includes(code)) ||
      (name && q.includes(name))
    );
  });

  if (foundSubjectMark) {
    const s = foundSubjectMark.exam?.subject;
    return `Here are your examination marks for **${s?.subject_code}: ${s?.subject_name}**:\n\n- **Internal Assessment:** ${foundSubjectMark.internal_marks}/30\n- **External / Theory:** ${foundSubjectMark.external_marks}/70\n- **Total Score:** ${foundSubjectMark.total_marks} / ${s?.max_marks || 100}\n- **Grade Awarded:** **${foundSubjectMark.grade}** (${foundSubjectMark.result_status})\n- **Status:** ${foundSubjectMark.status}`;
  }

  // Pass / fail inquiry
  if (q.includes('pass') || q.includes('fail') || q.includes('which subjects did i pass')) {
    if (studentMarks.length === 0) {
      return `There are no evaluated course marks registered in your profile for this session yet.`;
    }
    const passed = studentMarks.filter(m => m.result_status === 'Pass');
    const failed = studentMarks.filter(m => m.result_status === 'Fail');

    let text = `Based on verified marks entered into the examination cell:\n\n`;
    if (passed.length > 0) {
      text += `**Passed Courses (${passed.length}):**\n` +
        passed.map(m => `• ${m.exam?.subject?.subject_code} - ${m.exam?.subject?.subject_name}: Total ${m.total_marks} (Grade: ${m.grade})`).join('\n') + `\n\n`;
    }
    if (failed.length > 0) {
      text += `**Needs Re-examination / Supplementary (${failed.length}):**\n` +
        failed.map(m => `• ${m.exam?.subject?.subject_code} - ${m.exam?.subject?.subject_name}: Total ${m.total_marks} (Grade: ${m.grade})`).join('\n');
    } else {
      text += `Congratulations! You have passed all evaluated subjects so far with zero arrears.`;
    }
    return text;
  }

  // Performance / SGPA / CGPA
  if (q.includes('performance') || q.includes('sgpa') || q.includes('gpa') || q.includes('results') || q.includes('score')) {
    if (studentResults.length === 0 && studentMarks.length === 0) {
      return `No formal academic results have been published for your profile yet. Please check back after the evaluation window closes.`;
    }

    let summary = `### Academic Performance Record for ${currentStudent.user?.full_name} (${currentStudent.roll_number})\n\n`;
    if (studentResults.length > 0) {
      summary += `**Published Semester Results:**\n`;
      studentResults.forEach(r => {
        summary += `• **Semester ${r.semester} (${r.academic_year}):** SGPA **${r.sgpa}** | Total Marks: ${r.total_marks} (${r.percentage}%) | Status: **${r.result_status}**\n`;
      });
      const avgSgpa = (studentResults.reduce((acc, r) => acc + Number(r.sgpa), 0) / studentResults.length).toFixed(2);
      summary += `\n**Cumulative Grade Point Average (CGPA estimate):** **${avgSgpa} / 10.0**\n`;
    }

    if (studentMarks.length > 0) {
      summary += `\n**Current Semester Marks Overview:**\n`;
      studentMarks.forEach(m => {
        summary += `• ${m.exam?.subject?.subject_code}: ${m.total_marks}/100 (Grade ${m.grade})\n`;
      });
    }

    return summary;
  }

  // Timetable
  if (q.includes('timetable') || q.includes('schedule') || q.includes('dates')) {
    if (studentExams.length === 0) {
      return `No timetable has been published yet for Semester ${currentStudent.semester}.`;
    }
    return `### Official Examination Timetable (Semester ${currentStudent.semester})\n\n` +
      studentExams.map(e => `• **${e.exam_date}** (${e.start_time.slice(0, 5)} - ${e.end_time.slice(0, 5)}): **${e.subject?.subject_code} - ${e.subject?.subject_name}** | Venue: **${e.room?.room_number || 'Room TBA'}**`).join('\n\n');
  }

  // Default response
  return `Hello ${currentStudent.user?.full_name || 'Student'}! I am your Exam Cell Assistant. Here is what I can assist you with based on your real records:\n\n` +
    `• *"When is my next exam?"*\n` +
    `• *"How many exams do I have scheduled?"*\n` +
    `• *"What is my DBMS score?"*\n` +
    `• *"Show my performance & SGPA"* \n` +
    `• *"Which subjects did I pass?"*\n` +
    `• *"Show my full timetable"*`;
}
