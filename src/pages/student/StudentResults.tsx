import React, { useEffect, useState } from 'react';
import {
  Award,
  Printer,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  FileText,
  TrendingUp,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/databaseService';
import { Mark, Result, Student } from '../../types/database';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const StudentResults: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allStudents, allMarks, allResults] = await Promise.all([
        db.getStudents(),
        db.getMarks(),
        db.getResults()
      ]);

      const currentStudent = allStudents.find(s => s.user_id === user?.id) || null;
      setStudent(currentStudent);

      if (currentStudent) {
        // Filter published marks for this student
        const studentMarks = allMarks.filter(
          m => m.student_id === currentStudent.id && m.status === 'Published'
        );
        setMarks(studentMarks);

        // Filter results published for this student
        const studentResults = allResults.filter(r => r.student_id === currentStudent.id);
        setResults(studentResults);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <LoadingSpinner label="Compiling Official Grade Card..." />;
  }

  const latestResult = results[0];
  const totalCredits = marks.reduce((sum, m) => sum + (m.exam?.subject?.credits || 4), 0);
  const totalScore = marks.reduce((sum, m) => sum + Number(m.total_marks), 0);
  const maxPossible = marks.length * 100;
  const overallPercentage = marks.length > 0 ? Number(((totalScore / maxPossible) * 100).toFixed(2)) : 0;

  const gradePointsMap: Record<string, number> = {
    'A+': 10,
    'A': 9,
    'B+': 8,
    'B': 7,
    'C': 6,
    'D': 5,
    'F': 0
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            Official Academic Grade Card & Semester Results
          </h2>
          <p className="text-xs text-slate-400">
            Validated by the Controller of Examinations. Ready for official university transcript generation.
          </p>
        </div>

        <Button variant="cyan" size="sm" icon={Printer} onClick={handlePrint}>
          Print Official Grade Sheet
        </Button>
      </div>

      {/* Grade Card Container */}
      <div className="rounded-2xl border-2 border-slate-800 print:border-2 print:border-black bg-slate-900/90 print:bg-white print:text-black p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Header with University Seal */}
        <div className="text-center border-b-2 border-slate-800 print:border-black pb-4 space-y-1">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 print:bg-transparent text-cyan-400 print:text-black mb-1">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white print:text-black">
            Apex Autonomous University
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 print:text-slate-800">
            SEMESTER GRADE REPORT & TRANSCRIPT OF MARKS
          </p>
          <p className="text-[11px] text-slate-400 print:text-slate-600 font-mono">
            Autonomous Academic Division • Approved by University Academic Senate
          </p>
        </div>

        {/* Student Information Dossier */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-xs">
          <div>
            <p className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-mono">Student Name</p>
            <p className="font-bold text-white print:text-black text-sm">{user?.full_name}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-mono">Roll Number</p>
            <p className="font-mono font-bold text-cyan-400 print:text-blue-900 text-sm">{student?.roll_number}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-mono">Enrollment Number</p>
            <p className="font-mono font-semibold text-slate-200 print:text-black">{student?.enrollment_number}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-mono">Department & Sem</p>
            <p className="font-semibold text-slate-200 print:text-black">{student?.department?.name} (Sem {student?.semester})</p>
          </div>
        </div>

        {/* Course Grades Table */}
        <div className="overflow-x-auto">
          {marks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
              No course examination marks have been published by the examination cell for this session yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse border border-slate-800 print:border-black">
              <thead>
                <tr className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-black font-mono uppercase">
                  <th className="p-3 border border-slate-800 print:border-black">Course Code</th>
                  <th className="p-3 border border-slate-800 print:border-black">Course Title</th>
                  <th className="p-3 border border-slate-800 print:border-black text-center">Credits</th>
                  <th className="p-3 border border-slate-800 print:border-black text-center">Internal (/30)</th>
                  <th className="p-3 border border-slate-800 print:border-black text-center">External (/70)</th>
                  <th className="p-3 border border-slate-800 print:border-black text-center">Total (/100)</th>
                  <th className="p-3 border border-slate-800 print:border-black text-center">Grade Point</th>
                  <th className="p-3 border border-slate-800 print:border-black text-center">Letter Grade</th>
                  <th className="p-3 border border-slate-800 print:border-black text-center">Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-black text-slate-200 print:text-black">
                {marks.map(m => {
                  const credits = m.exam?.subject?.credits || 4;
                  const point = gradePointsMap[m.grade] ?? 0;

                  return (
                    <tr key={m.id}>
                      <td className="p-3 border border-slate-800 print:border-black font-mono font-bold text-cyan-400 print:text-black">
                        {m.exam?.subject?.subject_code}
                      </td>
                      <td className="p-3 border border-slate-800 print:border-black font-medium">
                        {m.exam?.subject?.subject_name}
                      </td>
                      <td className="p-3 border border-slate-800 print:border-black text-center font-mono">
                        {credits}
                      </td>
                      <td className="p-3 border border-slate-800 print:border-black text-center font-mono">
                        {m.internal_marks}
                      </td>
                      <td className="p-3 border border-slate-800 print:border-black text-center font-mono">
                        {m.external_marks}
                      </td>
                      <td className="p-3 border border-slate-800 print:border-black text-center font-mono font-bold">
                        {m.total_marks}
                      </td>
                      <td className="p-3 border border-slate-800 print:border-black text-center font-mono font-semibold">
                        {point}
                      </td>
                      <td className="p-3 border border-slate-800 print:border-black text-center font-mono font-bold text-cyan-300 print:text-black">
                        {m.grade}
                      </td>
                      <td className="p-3 border border-slate-800 print:border-black text-center font-mono font-semibold">
                        <span className={m.result_status === 'Pass' ? 'text-emerald-400 print:text-emerald-800' : 'text-rose-400 print:text-rose-800'}>
                          {m.result_status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* GPA & Performance Summary Cards */}
        {marks.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-mono">Total Credits Earned</p>
              <p className="font-mono font-bold text-white print:text-black text-base">{totalCredits} Credits</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-mono">Aggregate Marks</p>
              <p className="font-mono font-bold text-white print:text-black text-base">{totalScore} / {maxPossible} ({overallPercentage}%)</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-mono">Semester SGPA</p>
              <p className="font-mono font-bold text-emerald-400 print:text-emerald-800 text-base">
                {latestResult ? latestResult.sgpa : (marks.reduce((a, m) => a + (gradePointsMap[m.grade] ?? 0), 0) / marks.length).toFixed(2)} / 10.0
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-mono">Semester Standing</p>
              <p className="font-mono font-bold text-cyan-400 print:text-black text-base">
                {latestResult ? latestResult.result_status : 'Passed (First Class)'}
              </p>
            </div>
          </div>
        )}

        {/* Official Signatures & Verification Stamp */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-800 print:border-black text-xs">
          <div className="space-y-1 text-[10px] text-slate-400 print:text-slate-700 font-mono">
            <p className="font-bold text-slate-200 print:text-black flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 print:text-black" />
              AUTHENTICATED EXAMINATION RECORD
            </p>
            <p>Verification Code: APEX-{student?.roll_number}-{new Date().getFullYear()}</p>
            <p>Published Date: {latestResult?.published_at ? new Date(latestResult.published_at).toLocaleDateString() : new Date().toLocaleDateString()}</p>
          </div>

          <div className="flex gap-8 text-center">
            <div>
              <div className="h-10 w-28 border-b border-dashed border-slate-600 print:border-black flex items-center justify-center font-serif italic text-cyan-300 print:text-black">
                Dean of Academics
              </div>
              <p className="text-[10px] font-mono mt-1 text-slate-400 print:text-black uppercase">Dean of Academics</p>
            </div>
            <div>
              <div className="h-10 w-32 border-b border-dashed border-slate-600 print:border-black flex items-center justify-center font-serif italic text-cyan-300 print:text-black">
                Dr. R. K. Sharma
              </div>
              <p className="text-[10px] font-mono mt-1 text-slate-400 print:text-black uppercase">Controller of Exams</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
