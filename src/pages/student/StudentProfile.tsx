import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Building2,
  ShieldCheck,
  Award,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/databaseService';
import { Student } from '../../types/database';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allStudents = await db.getStudents();
      const s = allStudents.find(std => std.user_id === user?.id) || null;
      setStudent(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Fetching Student Dossier..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-cyan-400" />
          Student Academic Profile
        </h2>
        <p className="text-xs text-slate-400">
          Official enrollment records registered with the Examination Cell.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-xl shadow-cyan-500/20 text-2xl font-mono shrink-0">
            {user?.full_name?.charAt(0) || 'S'}
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white">{user?.full_name}</h3>
              <Badge variant="cyan" size="sm">Regular Candidate</Badge>
            </div>
            <p className="text-xs font-mono text-cyan-400 font-semibold">{student?.roll_number}</p>
            <p className="text-xs text-slate-400">
              Department of {student?.department?.name} • Semester {student?.semester}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono">University Roll Number</span>
            <p className="font-mono font-bold text-white text-sm">{student?.roll_number}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono">State Enrollment Number</span>
            <p className="font-mono font-bold text-white text-sm">{student?.enrollment_number}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Academic Department</span>
            <p className="font-semibold text-slate-200">{student?.department?.name} ({student?.department?.code})</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Current Semester & Session</span>
            <p className="font-mono font-semibold text-slate-200">Semester {student?.semester} • {student?.academic_year}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Institutional Email</span>
            <p className="text-slate-200">{user?.email}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Contact Phone</span>
            <p className="font-mono text-slate-200">{student?.phone || 'Not recorded'}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Verification Notice
          </p>
          <p>
            Any discrepancies in your official university roll number, enrollment record, or registered curriculum subjects must be reported to the Examination Cell within 7 days of semester registration.
          </p>
        </div>
      </div>
    </div>
  );
};
