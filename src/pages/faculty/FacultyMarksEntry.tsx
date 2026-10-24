import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  GraduationCap,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/databaseService';
import { Exam, Faculty, Mark, MarkStatus, Student, Subject } from '../../types/database';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { calculateGrade } from '../../utils/grades';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface StudentMarkRow {
  student: Student;
  markId?: string;
  internal_marks: number;
  external_marks: number;
  total_marks: number;
  percentage: number;
  grade: string;
  result_status: 'Pass' | 'Fail';
  status: MarkStatus;
}

export const FacultyMarksEntry: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [currentFaculty, setCurrentFaculty] = useState<Faculty | null>(null);

  const [studentRows, setStudentRows] = useState<StudentMarkRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadInitial();
  }, [user]);

  const loadInitial = async () => {
    setLoading(true);
    try {
      const [eList, fList] = await Promise.all([db.getExams(), db.getFaculty()]);
      const fac = fList.find(f => f.user_id === user?.id) || null;
      setCurrentFaculty(fac);
      setExams(eList);

      if (eList.length > 0) {
        setSelectedExamId(eList[0].id);
        await loadMarksForExam(eList[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMarksForExam = async (examId: string) => {
    try {
      const [allStudents, allMarks, allExams] = await Promise.all([
        db.getStudents(),
        db.getMarks({ exam_id: examId }),
        db.getExams()
      ]);

      const exam = allExams.find(e => e.id === examId);
      if (!exam) return;

      // Filter eligible students: enrolled in same department and semester as this exam
      const eligibleStudents = allStudents.filter(
        s => s.department_id === exam.department_id && s.semester === exam.semester
      );

      const rows: StudentMarkRow[] = eligibleStudents.map(student => {
        const existingMark = allMarks.find(m => m.student_id === student.id);
        if (existingMark) {
          return {
            student,
            markId: existingMark.id,
            internal_marks: existingMark.internal_marks,
            external_marks: existingMark.external_marks,
            total_marks: existingMark.total_marks,
            percentage: existingMark.percentage,
            grade: existingMark.grade,
            result_status: existingMark.result_status,
            status: existingMark.status
          };
        }

        // Default empty entry
        const calc = calculateGrade(24, 55, 100, 40);
        return {
          student,
          internal_marks: 24,
          external_marks: 55,
          total_marks: calc.total,
          percentage: calc.percentage,
          grade: calc.grade,
          result_status: calc.resultStatus,
          status: 'Draft'
        };
      });

      setStudentRows(rows);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectExam = async (examId: string) => {
    setSelectedExamId(examId);
    setSaveSuccessMessage(null);
    setErrorMessage(null);
    await loadMarksForExam(examId);
  };

  const handleScoreChange = (studentId: string, field: 'internal' | 'external', valStr: string) => {
    const val = Math.max(0, Number(valStr) || 0);

    setStudentRows(prev =>
      prev.map(row => {
        if (row.student.id !== studentId) return row;

        const internal = field === 'internal' ? Math.min(30, val) : row.internal_marks;
        const external = field === 'external' ? Math.min(70, val) : row.external_marks;

        const calc = calculateGrade(internal, external, 100, 40);

        return {
          ...row,
          internal_marks: internal,
          external_marks: external,
          total_marks: calc.total,
          percentage: calc.percentage,
          grade: calc.grade,
          result_status: calc.resultStatus
        };
      })
    );
  };

  const handleSaveMarks = async (newStatus: 'Draft' | 'Submitted') => {
    setIsSaving(true);
    setSaveSuccessMessage(null);
    setErrorMessage(null);

    try {
      for (const row of studentRows) {
        // Prevent editing already Published/Verified marks unless in Draft
        if (row.status === 'Published') continue;

        await db.saveMark({
          exam_id: selectedExamId,
          student_id: row.student.id,
          internal_marks: row.internal_marks,
          external_marks: row.external_marks,
          entered_by: currentFaculty?.id || user?.id,
          status: newStatus
        });
      }

      setSaveSuccessMessage(
        newStatus === 'Submitted'
          ? 'Marks successfully submitted to the Examination Cell for verification!'
          : 'Marks draft saved successfully.'
      );

      // Refresh marks list
      await loadMarksForExam(selectedExamId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving marks');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading Marks Evaluation Workspace..." />;
  }

  const currentExam = exams.find(e => e.id === selectedExamId);
  const isAllSubmitted = studentRows.every(r => r.status === 'Submitted' || r.status === 'Verified' || r.status === 'Published');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            Course Marks Evaluation Desk
          </h2>
          <p className="text-xs text-slate-400">
            Enter continuous internal assessments (/30) and theory examination scores (/70).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={Save}
            onClick={() => handleSaveMarks('Draft')}
            isLoading={isSaving}
          >
            Save Draft
          </Button>

          <Button
            variant="cyan"
            size="sm"
            icon={Send}
            onClick={() => handleSaveMarks('Submitted')}
            isLoading={isSaving}
          >
            Submit to Exam Cell
          </Button>
        </div>
      </div>

      {/* Messages */}
      {saveSuccessMessage && (
        <div className="p-3 rounded-xl border border-emerald-800 bg-emerald-950/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl border border-rose-800 bg-rose-950/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Select Examination Course */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 flex-1 max-w-xl">
          <label className="block text-xs font-medium text-slate-300">
            Select Course Session for Evaluation:
          </label>
          <select
            value={selectedExamId}
            onChange={e => handleSelectExam(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs p-2.5 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {exams.map(e => (
              <option key={e.id} value={e.id}>
                {e.subject?.subject_code} - {e.subject?.subject_name} ({e.exam_type}, Sem {e.semester})
              </option>
            ))}
          </select>
        </div>

        {currentExam && (
          <div className="flex items-center gap-4 text-xs font-mono text-slate-300 border-l border-slate-800 pl-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Max Score</p>
              <p className="font-bold text-white">30 Internal + 70 External</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Passing Mark</p>
              <p className="font-bold text-emerald-400">40 / 100</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Batch Size</p>
              <p className="font-bold text-cyan-400">{studentRows.length} Students</p>
            </div>
          </div>
        )}
      </div>

      {/* Marks Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        {studentRows.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No enrolled students found matching the department and semester for this examination.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono uppercase tracking-wider">
                <th className="p-3.5">Roll No.</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5 w-32">Internal (Max 30)</th>
                <th className="p-3.5 w-32">External (Max 70)</th>
                <th className="p-3.5">Total (/100)</th>
                <th className="p-3.5">Grade</th>
                <th className="p-3.5">Clearance</th>
                <th className="p-3.5 text-right">Workflow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {studentRows.map(row => {
                const isLocked = row.status === 'Published' || row.status === 'Verified';

                return (
                  <tr key={row.student.id} className="hover:bg-cyan-950/10 transition">
                    <td className="p-3.5 font-mono font-semibold text-cyan-300">
                      {row.student.roll_number}
                    </td>
                    <td className="p-3.5 font-medium text-white">
                      {row.student.user?.full_name}
                    </td>
                    <td className="p-3.5">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={row.internal_marks}
                          disabled={isLocked}
                          onChange={e => handleScoreChange(row.student.id, 'internal', e.target.value)}
                          className="w-24 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white focus:outline-none disabled:opacity-50"
                        />
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="70"
                          value={row.external_marks}
                          disabled={isLocked}
                          onChange={e => handleScoreChange(row.student.id, 'external', e.target.value)}
                          className="w-24 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white focus:outline-none disabled:opacity-50"
                        />
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-white bg-slate-800 px-2 py-1 rounded border border-slate-700">
                        {row.total_marks}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={row.grade === 'A+' || row.grade === 'A' ? 'cyan' : row.grade === 'F' ? 'danger' : 'info'}
                        size="sm"
                      >
                        {row.grade}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <span className={`font-mono text-xs font-semibold ${row.result_status === 'Pass' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {row.result_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {isLocked && <Lock className="w-3 h-3 text-slate-500" />}
                        <Badge
                          variant={
                            row.status === 'Published'
                              ? 'cyan'
                              : row.status === 'Verified'
                              ? 'success'
                              : row.status === 'Submitted'
                              ? 'warning'
                              : 'default'
                          }
                          size="sm"
                        >
                          {row.status}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
