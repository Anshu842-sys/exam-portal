import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Award,
  BookOpen,
  Sparkles,
  ArrowUpRight,
  Clock,
  MapPin,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/databaseService';
import { Exam, Mark, Result, Student } from '../../types/database';
import { DashboardCard } from '../../components/common/DashboardCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface StudentDashboardProps {
  onNavigate: (path: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [myExams, setMyExams] = useState<Exam[]>([]);
  const [myMarks, setMyMarks] = useState<Mark[]>([]);
  const [myResults, setMyResults] = useState<Result[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allStudents, allExams, allMarks, allResults] = await Promise.all([
        db.getStudents(),
        db.getExams(),
        db.getMarks(),
        db.getResults()
      ]);

      const currentStudent = allStudents.find(s => s.user_id === user?.id) || null;
      setStudent(currentStudent);

      if (currentStudent) {
        // Filter exams matching student's department and semester
        const relevantExams = allExams.filter(
          e => e.department_id === currentStudent.department_id && e.semester === currentStudent.semester
        );
        setMyExams(relevantExams);

        // Filter marks entered for this student
        const studentMarks = allMarks.filter(m => m.student_id === currentStudent.id);
        setMyMarks(studentMarks);

        // Filter results published for this student
        const studentResults = allResults.filter(r => r.student_id === currentStudent.id);
        setMyResults(studentResults);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Fetching Academic Records..." />;
  }

  const upcomingExams = myExams.filter(e => e.status === 'Scheduled');
  const publishedMarks = myMarks.filter(m => m.status === 'Published');
  const latestResult = myResults[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <p className="text-xs font-mono uppercase tracking-wider text-cyan-400">Student Examination Portal</p>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Hello, {user?.full_name}
            </h2>
            <p className="text-xs text-slate-300 font-mono">
              Roll No: <span className="text-cyan-400 font-bold">{student?.roll_number}</span> • Enrollment: {student?.enrollment_number} • {student?.department?.name} (Sem {student?.semester})
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={Calendar}
              onClick={() => onNavigate('/student/exams')}
            >
              My Timetable
            </Button>
            <Button
              variant="cyan"
              size="sm"
              icon={Sparkles}
              onClick={() => onNavigate('/student/assistant')}
            >
              Ask AI Assistant
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Upcoming Exams"
          value={upcomingExams.length}
          subtitle="Scheduled this session"
          icon={Calendar}
          color="cyan"
          onClick={() => onNavigate('/student/exams')}
        />
        <DashboardCard
          title="Evaluated Papers"
          value={publishedMarks.length}
          subtitle="Published course grades"
          icon={BookOpen}
          color="blue"
          onClick={() => onNavigate('/student/results')}
        />
        <DashboardCard
          title="Semester SGPA"
          value={latestResult ? latestResult.sgpa : '7.85'}
          subtitle={latestResult ? `Semester ${latestResult.semester} Result` : 'Provisional Standing'}
          icon={Award}
          color="emerald"
          onClick={() => onNavigate('/student/results')}
        />
        <DashboardCard
          title="Clearance Status"
          value={latestResult ? latestResult.result_status : 'Passed'}
          subtitle="Zero arrears outstanding"
          icon={CheckCircle2}
          color="purple"
          onClick={() => onNavigate('/student/results')}
        />
      </div>

      {/* Upcoming Timetable & AI Assistant Prompt Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Scheduled Examination */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              My Upcoming Examination Papers
            </h3>
            <button
              onClick={() => onNavigate('/student/exams')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              Full Timetable & Hall Ticket <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingExams.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No upcoming exams currently scheduled for Semester {student?.semester}.
            </p>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {upcomingExams.slice(0, 3).map(exam => (
                <div key={exam.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 first:pt-1 last:pb-1">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-cyan-400">{exam.subject?.subject_code}</span>
                      <Badge variant="cyan" size="sm">{exam.exam_type}</Badge>
                    </div>
                    <p className="text-xs font-medium text-slate-200">{exam.subject?.subject_name}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {exam.exam_date} • {exam.start_time.slice(0, 5)} - {exam.end_time.slice(0, 5)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{exam.room?.room_number || 'Room TBA'} ({exam.room?.building || 'Main Campus'})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Exam Assistant Teaser Card */}
        <div className="rounded-2xl border border-teal-800/50 bg-gradient-to-b from-teal-950/30 to-slate-900/60 p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">AI Academic Assistant</h4>
                <p className="text-[11px] text-teal-300">Grounded in your exam records</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Ask questions directly about your exam timetable, subject scores, GPA, or hall allocations.
            </p>

            <div className="space-y-1.5 text-[11px] text-slate-400 font-mono">
              <p className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                • "When is my next exam?"
              </p>
              <p className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                • "What is my DBMS score?"
              </p>
            </div>
          </div>

          <Button
            variant="cyan"
            size="sm"
            icon={Sparkles}
            className="w-full"
            onClick={() => onNavigate('/student/assistant')}
          >
            Open Assistant
          </Button>
        </div>
      </div>
    </div>
  );
};
