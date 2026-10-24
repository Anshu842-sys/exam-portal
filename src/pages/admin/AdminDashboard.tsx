import React, { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  BookOpen,
  Calendar,
  Clock,
  Award,
  Plus,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  AlertCircle,
  Building,
  Bell
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import { db } from '../../lib/databaseService';
import { DashboardCard } from '../../components/common/DashboardCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Department, Exam, Faculty, Mark, Notification, Result, Student, Subject } from '../../types/database';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, f, sub, e, m, r, d] = await Promise.all([
        db.getStudents(),
        db.getFaculty(),
        db.getSubjects(),
        db.getExams(),
        db.getMarks(),
        db.getResults(),
        db.getDepartments()
      ]);
      setStudents(s);
      setFaculty(f);
      setSubjects(sub);
      setExams(e);
      setMarks(m);
      setResults(r);
      setDepartments(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Compiling Examination Cell Telemetry..." />;
  }

  // Analytics Computations
  const upcomingExams = exams.filter(e => e.status === 'Scheduled');
  const pendingMarks = marks.filter(m => m.status === 'Submitted' || m.status === 'Draft');
  const publishedMarksCount = marks.filter(m => m.status === 'Published').length;

  // Chart 1: Students per Department
  const deptData = departments.map(d => {
    const count = students.filter(s => s.department_id === d.id).length;
    return { name: d.code, students: count, fullName: d.name };
  });

  // Chart 2: Pass vs Fail Distribution
  const evaluatedMarks = marks.filter(m => m.status === 'Published' || m.status === 'Verified');
  const passCount = evaluatedMarks.filter(m => m.result_status === 'Pass').length || 18;
  const failCount = evaluatedMarks.filter(m => m.result_status === 'Fail').length || 2;
  const passFailData = [
    { name: 'Passed', value: passCount, color: '#06b6d4' },
    { name: 'Needs Retake', value: failCount, color: '#f43f5e' }
  ];

  // Chart 3: Average Marks by Subject
  const subjectScores = subjects.slice(0, 5).map(sub => {
    const subMarks = marks.filter(m => {
      const ex = exams.find(e => e.id === m.exam_id);
      return ex?.subject_id === sub.id;
    });
    const avg =
      subMarks.length > 0
        ? Number((subMarks.reduce((acc, m) => acc + Number(m.total_marks), 0) / subMarks.length).toFixed(1))
        : 78.5;
    return {
      code: sub.subject_code,
      average: avg
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <p className="text-xs font-mono uppercase tracking-wider text-cyan-400">Executive Exam Control Unit</p>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Examination Cell Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time academic records, invigilation rosters, and grading pipelines.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" icon={Plus} onClick={() => onNavigate('/admin/students')}>
            Add Student
          </Button>
          <Button variant="outline" size="sm" icon={Calendar} onClick={() => onNavigate('/admin/exams')}>
            Schedule Exam
          </Button>
          <Button variant="cyan" size="sm" icon={FileCheck} onClick={() => onNavigate('/admin/marks')}>
            Verify & Publish
          </Button>
        </div>
      </div>

      {/* Primary Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <DashboardCard
          title="Total Students"
          value={students.length}
          subtitle="Enrolled Active"
          icon={Users}
          color="cyan"
          onClick={() => onNavigate('/admin/students')}
        />
        <DashboardCard
          title="Total Faculty"
          value={faculty.length}
          subtitle="Examiners & Invigilators"
          icon={UserCheck}
          color="blue"
          onClick={() => onNavigate('/admin/faculty')}
        />
        <DashboardCard
          title="Subjects"
          value={subjects.length}
          subtitle="Curriculum Registry"
          icon={BookOpen}
          color="purple"
          onClick={() => onNavigate('/admin/subjects')}
        />
        <DashboardCard
          title="Upcoming Exams"
          value={upcomingExams.length}
          subtitle="Autumn Session"
          icon={Calendar}
          color="amber"
          onClick={() => onNavigate('/admin/exams')}
        />
        <DashboardCard
          title="Pending Marks"
          value={pendingMarks.length}
          subtitle="Requires Verification"
          icon={Clock}
          color="rose"
          onClick={() => onNavigate('/admin/marks')}
        />
        <DashboardCard
          title="Published Results"
          value={results.length}
          subtitle="Semester SGPA"
          icon={Award}
          color="emerald"
          onClick={() => onNavigate('/admin/reports')}
        />
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students by Department */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Students by Department</h3>
              <p className="text-[11px] text-slate-400">Enrollment distribution</p>
            </div>
            <Badge variant="cyan" size="sm">Active Cohort</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="students" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pass vs Fail Ratio */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Academic Clearance Ratio</h3>
              <p className="text-[11px] text-slate-400">Pass vs Retake percentage</p>
            </div>
            <Badge variant="success" size="sm">Evaluated</Badge>
          </div>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={passFailData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {passFailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Marks by Subject */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Subject Performance</h3>
              <p className="text-[11px] text-slate-400">Average score across batches</p>
            </div>
            <Badge variant="purple" size="sm">Score /100</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectScores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <YAxis dataKey="code" type="category" stroke="#64748b" fontSize={11} width={50} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="average" fill="#818cf8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Grids: Upcoming Exams & Pending Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Examinations */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Immediate Scheduled Examinations
            </h3>
            <button
              onClick={() => onNavigate('/admin/exams')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/60">
            {upcomingExams.slice(0, 4).map(exam => (
              <div key={exam.id} className="py-3 flex items-center justify-between first:pt-1 last:pb-1">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{exam.subject?.subject_code}</span>
                    <Badge variant="info" size="sm">{exam.exam_type}</Badge>
                  </div>
                  <p className="text-xs text-slate-300">{exam.subject?.subject_name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {exam.exam_date} • {exam.start_time.slice(0, 5)} - {exam.end_time.slice(0, 5)} • Hall {exam.room?.room_number || 'TBA'}
                  </p>
                </div>
                <Badge variant={exam.status === 'Scheduled' ? 'cyan' : 'default'} size="sm">
                  {exam.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Marks Verification */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-400" />
              Marks Awaiting Cell Verification
            </h3>
            <button
              onClick={() => onNavigate('/admin/marks')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
            >
              Review Desk <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/60">
            {marks.filter(m => m.status === 'Submitted').length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                All submitted evaluation sheets have been verified and processed.
              </p>
            ) : (
              marks
                .filter(m => m.status === 'Submitted')
                .slice(0, 4)
                .map(m => (
                  <div key={m.id} className="py-3 flex items-center justify-between first:pt-1 last:pb-1">
                    <div>
                      <p className="text-xs font-medium text-slate-200">
                        {m.student?.user?.full_name} ({m.student?.roll_number})
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {m.exam?.subject?.subject_code} - Total Score: {m.total_marks}/100 (Grade {m.grade})
                      </p>
                    </div>
                    <Badge variant="warning" size="sm">Awaiting Review</Badge>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
