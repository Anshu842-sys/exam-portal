import React, { useEffect, useState } from 'react';
import {
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  UserCheck,
  Building2,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/databaseService';
import { Exam, Mark } from '../../types/database';
import { DashboardCard } from '../../components/common/DashboardCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface FacultyDashboardProps {
  onNavigate: (path: string) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignedExams, setAssignedExams] = useState<Exam[]>([]);
  const [myMarks, setMyMarks] = useState<Mark[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allExams, allMarks, allFaculty] = await Promise.all([
        db.getExams(),
        db.getMarks(),
        db.getFaculty()
      ]);

      // Find faculty record for current user
      const currentFaculty = allFaculty.find(f => f.user_id === user?.id);

      if (currentFaculty) {
        // Filter exams where this faculty is assigned
        const assigned = allExams.filter(e => e.faculty_ids?.includes(currentFaculty.id));
        setAssignedExams(assigned);

        // Filter marks entered by this faculty or matching assigned exams
        const assignedExamIds = assigned.map(e => e.id);
        const relevantMarks = allMarks.filter(
          m => m.entered_by === currentFaculty.id || assignedExamIds.includes(m.exam_id)
        );
        setMyMarks(relevantMarks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading Faculty Examiner Portal..." />;
  }

  const upcomingDuties = assignedExams.filter(e => e.status === 'Scheduled');
  const draftMarksCount = myMarks.filter(m => m.status === 'Draft').length;
  const submittedMarksCount = myMarks.filter(m => m.status === 'Submitted' || m.status === 'Verified' || m.status === 'Published').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">Faculty Examiner Workspace</p>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Welcome, {user?.full_name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Invigilation schedules, student paper evaluation, and marks submission desk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Calendar} onClick={() => onNavigate('/faculty/exams')}>
            My Duty Schedule
          </Button>
          <Button variant="cyan" size="sm" icon={FileSpreadsheet} onClick={() => onNavigate('/faculty/marks')}>
            Enter Course Marks
          </Button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          title="Assigned Invigilations"
          value={assignedExams.length}
          subtitle={`${upcomingDuties.length} upcoming sessions`}
          icon={Calendar}
          color="cyan"
          onClick={() => onNavigate('/faculty/exams')}
        />
        <DashboardCard
          title="Pending Evaluation Drafts"
          value={draftMarksCount}
          subtitle="Unsubmitted marks sheets"
          icon={Clock}
          color="amber"
          onClick={() => onNavigate('/faculty/marks')}
        />
        <DashboardCard
          title="Submitted to Exam Cell"
          value={submittedMarksCount}
          subtitle="Processed / Verified papers"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => onNavigate('/faculty/marks')}
        />
      </div>

      {/* Assigned Exam Sessions List */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              My Invigilation Duties & Examination Schedule
            </h3>
            <p className="text-xs text-slate-400">Official invigilator allocations assigned by the Exam Cell Controller</p>
          </div>
          <button
            onClick={() => onNavigate('/faculty/exams')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
          >
            Full Duty Roster <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {assignedExams.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
            You do not have any invigilation sessions assigned for the upcoming examination cycle.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {assignedExams.map(e => (
              <div key={e.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-1 last:pb-1">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-white">{e.subject?.subject_code}</span>
                    <Badge variant="info" size="sm">{e.exam_type}</Badge>
                    <Badge variant="cyan" size="sm">{e.department?.code} • Sem {e.semester}</Badge>
                  </div>
                  <p className="text-xs font-medium text-slate-200">{e.subject?.subject_name}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {e.exam_date} • {e.start_time.slice(0, 5)} - {e.end_time.slice(0, 5)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-slate-300 text-xs bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-mono">{e.room?.room_number || 'Room TBA'} ({e.room?.building || 'Main Campus'})</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('/faculty/marks')}
                    className="text-xs"
                  >
                    Enter Marks
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
