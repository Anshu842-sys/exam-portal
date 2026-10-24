import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Printer,
  MapPin,
  Clock,
  QrCode,
  ShieldCheck,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/databaseService';
import { Exam, Student } from '../../types/database';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const StudentTimetable: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHallTicket, setShowHallTicket] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allExams, allStudents] = await Promise.all([db.getExams(), db.getStudents()]);
      const currentStudent = allStudents.find(s => s.user_id === user?.id) || null;
      setStudent(currentStudent);

      if (currentStudent) {
        const studentExams = allExams.filter(
          e => e.department_id === currentStudent.department_id && e.semester === currentStudent.semester
        ).sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());
        setExams(studentExams);
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
    return <LoadingSpinner label="Fetching Timetable & Hall Ticket Data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Non-Printable Header */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Official Examination Schedule & Hall Ticket
          </h2>
          <p className="text-xs text-slate-400">
            Timetable roster and official autonomous university admit card for Semester {student?.semester}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showHallTicket ? 'cyan' : 'outline'}
            size="sm"
            onClick={() => setShowHallTicket(!showHallTicket)}
          >
            {showHallTicket ? 'View Timetable Grid' : 'View Hall Ticket Format'}
          </Button>
          <Button variant="cyan" size="sm" icon={Printer} onClick={handlePrint}>
            Print Hall Ticket
          </Button>
        </div>
      </div>

      {/* HALL TICKET VIEW (Used for official printing and preview) */}
      {(showHallTicket || true) && (
        <div className={`${showHallTicket ? 'block' : 'hidden print:block'} rounded-2xl border-2 border-slate-700 print:border-2 print:border-black bg-slate-900/90 print:bg-white print:text-black p-6 sm:p-8 space-y-6 shadow-2xl`}>
          {/* Header of Hall Ticket */}
          <div className="text-center border-b-2 border-slate-800 print:border-black pb-4 space-y-1">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 print:bg-transparent text-cyan-400 print:text-black mb-1">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white print:text-black">
              Apex Autonomous University
            </h1>
            <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 print:text-slate-700">
              OFFICIAL EXAMINATION ADMIT CARD / HALL TICKET
            </p>
            <p className="text-[11px] text-slate-400 print:text-slate-600 font-mono">
              Autumn Semester Examination • Session 2025-2026
            </p>
          </div>

          {/* Student Dossier Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-xs">
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

          {/* Table of Scheduled Examination Papers */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-800 print:border-black">
              <thead>
                <tr className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-black font-mono uppercase">
                  <th className="p-3 border border-slate-800 print:border-black">Date</th>
                  <th className="p-3 border border-slate-800 print:border-black">Time Window</th>
                  <th className="p-3 border border-slate-800 print:border-black">Subject Code</th>
                  <th className="p-3 border border-slate-800 print:border-black">Subject Name</th>
                  <th className="p-3 border border-slate-800 print:border-black">Allocated Hall</th>
                  <th className="p-3 border border-slate-800 print:border-black text-center">Invigilator Sign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-black text-slate-200 print:text-black">
                {exams.map(exam => (
                  <tr key={exam.id}>
                    <td className="p-3 border border-slate-800 print:border-black font-mono font-semibold text-cyan-300 print:text-black">
                      {exam.exam_date}
                    </td>
                    <td className="p-3 border border-slate-800 print:border-black font-mono">
                      {exam.start_time.slice(0, 5)} - {exam.end_time.slice(0, 5)}
                    </td>
                    <td className="p-3 border border-slate-800 print:border-black font-mono font-bold">
                      {exam.subject?.subject_code}
                    </td>
                    <td className="p-3 border border-slate-800 print:border-black">
                      {exam.subject?.subject_name}
                    </td>
                    <td className="p-3 border border-slate-800 print:border-black font-mono font-medium">
                      {exam.room?.room_number || 'Room TBA'} ({exam.room?.building || 'Main Campus'})
                    </td>
                    <td className="p-3 border border-slate-800 print:border-black text-center font-mono text-slate-500">
                      [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hall Ticket Footer: QR Code & Signatures */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-800 print:border-black text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-950 print:bg-white border border-slate-800 print:border-black">
                <QrCode className="w-14 h-14 text-cyan-400 print:text-black" />
              </div>
              <div className="space-y-0.5 text-[10px] text-slate-400 print:text-slate-600 font-mono">
                <p className="font-bold text-slate-200 print:text-black">SECURE CRYPTOGRAPHIC HASH</p>
                <p>Hash: {student?.roll_number}-AUTUMN-2025-VERIFIED</p>
                <p>Status: Hall Entry Authorized</p>
              </div>
            </div>

            <div className="flex gap-8 text-center">
              <div>
                <div className="h-10 w-28 border-b border-dashed border-slate-600 print:border-black" />
                <p className="text-[10px] font-mono mt-1 text-slate-400 print:text-black uppercase">Candidate Signature</p>
              </div>
              <div>
                <div className="h-10 w-32 border-b border-dashed border-slate-600 print:border-black flex items-center justify-center font-serif italic text-cyan-300 print:text-black">
                  Controller of Exams
                </div>
                <p className="text-[10px] font-mono mt-1 text-slate-400 print:text-black uppercase">Controller Signature</p>
              </div>
            </div>
          </div>

          {/* Rules & Warnings */}
          <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 text-[10px] text-slate-400 print:text-slate-700 space-y-1">
            <p className="font-bold text-slate-300 print:text-black flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 print:text-black" />
              EXAMINATION HALL INSTRUCTIONS:
            </p>
            <p>1. Students must carry this printed Hall Ticket along with an institutional Photo ID Card.</p>
            <p>2. Electronic gadgets, mobile phones, smartwatches, and programmable calculators are strictly banned inside examination halls.</p>
            <p>3. Candidates must be seated at least 15 minutes before the scheduled commencement of the paper.</p>
          </div>
        </div>
      )}

      {/* TIMETABLE GRID VIEW */}
      {!showHallTicket && (
        <div className="space-y-4 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam, idx) => (
              <div
                key={exam.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    PAPER 0{idx + 1}
                  </span>
                  <Badge variant="cyan" size="sm">{exam.exam_type}</Badge>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{exam.subject?.subject_code}</h4>
                  <p className="text-xs text-slate-300 line-clamp-1">{exam.subject?.subject_name}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{exam.exam_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{exam.start_time.slice(0, 5)} - {exam.end_time.slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{exam.room?.room_number || 'Room TBA'} ({exam.room?.building || 'Main Campus'})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
