import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Printer,
  MapPin,
  Clock,
  Layers,
  GraduationCap,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/databaseService';
import { Exam } from '../../types/database';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AssignedExams: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [facultyRecord, setFacultyRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allExams, allFaculty] = await Promise.all([db.getExams(), db.getFaculty()]);
      const currentFac = allFaculty.find(f => f.user_id === user?.id);
      setFacultyRecord(currentFac);

      if (currentFac) {
        const assigned = allExams.filter(e => e.faculty_ids?.includes(currentFac.id));
        setExams(assigned);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintDutyPass = () => {
    window.print();
  };

  if (isLoading) {
    return <LoadingSpinner label="Fetching Invigilation Roster..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Official Invigilation Duty Assignment
          </h2>
          <p className="text-xs text-slate-400">
            Designated examination sessions, allocated examination halls, and reporting hours.
          </p>
        </div>
        <Button variant="cyan" size="sm" icon={Printer} onClick={handlePrintDutyPass}>
          Print Duty Pass
        </Button>
      </div>

      {/* Printable Header */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-xl font-bold uppercase tracking-wider text-black">
          Apex Autonomous University — Controller of Examinations
        </h1>
        <h2 className="text-base font-semibold text-slate-800 mt-1">FACULTY INVIGILATION DUTY PASS</h2>
        <p className="text-xs text-slate-600 font-mono mt-1">
          Faculty: {user?.full_name} | Employee ID: {facultyRecord?.employee_id} | Designation: {facultyRecord?.designation}
        </p>
      </div>

      {/* Duty Cards / Table */}
      {exams.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          No invigilation sessions are currently assigned to your faculty profile.
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map(exam => (
            <div
              key={exam.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md print:border print:border-slate-300 print:bg-white print:text-black space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 print:border-slate-300 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-cyan-400 print:text-blue-800">
                    {exam.subject?.subject_code}
                  </span>
                  <span className="text-slate-400 print:text-slate-600">|</span>
                  <span className="text-sm font-semibold text-slate-100 print:text-black">
                    {exam.subject?.subject_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="cyan" size="sm">{exam.exam_type}</Badge>
                  <Badge variant={exam.status === 'Scheduled' ? 'success' : 'default'} size="sm">
                    {exam.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-mono mb-1">Date & Session</p>
                  <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-200 print:text-black">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{exam.exam_date}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-mono mb-1">Timing Window</p>
                  <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-200 print:text-black">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{exam.start_time.slice(0, 5)} - {exam.end_time.slice(0, 5)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-mono mb-1">Hall / Venue</p>
                  <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-200 print:text-black">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{exam.room?.room_number || 'TBA'} ({exam.room?.building || 'Main Campus'})</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-mono mb-1">Cohort Batch</p>
                  <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-200 print:text-black">
                    <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{exam.department?.code} • Sem {exam.semester}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 print:bg-slate-100 border border-slate-800/60 print:border-slate-300 text-[11px] text-slate-400 print:text-slate-700 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Instructions for Invigilators:</strong> Please report to the Controller of Examinations room 30 minutes prior to exam commencement to collect sealed question paper packets and attendance rosters.
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
