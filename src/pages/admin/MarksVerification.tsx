import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  UploadCloud,
  Filter,
  Eye,
  Award,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { db } from '../../lib/databaseService';
import { Exam, Mark, MarkStatus, Student, Subject } from '../../types/database';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const MarksVerification: React.FC = () => {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [examFilter, setExamFilter] = useState<string>('all');

  // Semester Publish Modal
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [publishSemester, setPublishSemester] = useState(5);
  const [publishAcademicYear, setPublishAcademicYear] = useState('2025-2026');
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mList, eList, sList] = await Promise.all([
        db.getMarks(),
        db.getExams(),
        db.getStudents()
      ]);
      setMarks(mList);
      setExams(eList);
      setStudents(sList);
      if (sList.length > 0) setSelectedStudentId(sList[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: MarkStatus) => {
    try {
      const updated = await db.updateMarkStatus(id, newStatus);
      setMarks(prev => prev.map(m => (m.id === id ? { ...m, status: updated.status } : m)));
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleBatchVerifyAll = async () => {
    const submittedMarks = marks.filter(m => m.status === 'Submitted');
    if (submittedMarks.length === 0) {
      alert('No marks entries currently in "Submitted" status.');
      return;
    }

    if (confirm(`Verify all ${submittedMarks.length} submitted marks entries?`)) {
      for (const m of submittedMarks) {
        await db.updateMarkStatus(m.id, 'Verified');
      }
      await loadData();
    }
  };

  const handleBatchPublishAllVerified = async () => {
    const verifiedMarks = marks.filter(m => m.status === 'Verified');
    if (verifiedMarks.length === 0) {
      alert('No marks entries currently in "Verified" status. Please verify entries first.');
      return;
    }

    if (confirm(`Publish all ${verifiedMarks.length} verified marks entries to student profiles?`)) {
      for (const m of verifiedMarks) {
        await db.updateMarkStatus(m.id, 'Published');
      }
      await loadData();
    }
  };

  const handlePublishSemesterResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishMessage(null);
    setIsPublishing(true);

    try {
      const result = await db.publishSemesterResult(selectedStudentId, publishSemester, publishAcademicYear);
      setPublishMessage(`Successfully generated & published Semester ${publishSemester} Result! SGPA: ${result.sgpa} (${result.result_status})`);
      setTimeout(() => {
        setIsPublishModalOpen(false);
        setPublishMessage(null);
      }, 1500);
    } catch (err: any) {
      setPublishMessage(`Error: ${err.message || 'Unable to publish result'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const filteredMarks = marks.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (examFilter !== 'all' && m.exam_id !== examFilter) return false;
    return true;
  });

  const columns: Column<Mark>[] = [
    {
      key: 'student',
      header: 'Student & Roll No.',
      render: m => (
        <div>
          <p className="font-semibold text-white">{m.student?.user?.full_name || 'Student'}</p>
          <p className="text-[11px] font-mono text-cyan-400">{m.student?.roll_number}</p>
        </div>
      )
    },
    {
      key: 'subject',
      header: 'Subject & Code',
      render: m => (
        <div>
          <span className="font-mono font-semibold text-slate-200">
            {m.exam?.subject?.subject_code}
          </span>
          <p className="text-xs text-slate-400 line-clamp-1">{m.exam?.subject?.subject_name}</p>
        </div>
      )
    },
    {
      key: 'internal',
      header: 'Internal',
      render: m => <span className="font-mono text-slate-300">{m.internal_marks}/30</span>
    },
    {
      key: 'external',
      header: 'External',
      render: m => <span className="font-mono text-slate-300">{m.external_marks}/70</span>
    },
    {
      key: 'total',
      header: 'Total Score',
      render: m => (
        <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700/80">
          {m.total_marks}/100
        </span>
      )
    },
    {
      key: 'grade',
      header: 'Grade & Status',
      render: m => (
        <div className="flex items-center gap-1.5">
          <Badge
            variant={m.grade === 'A+' || m.grade === 'A' ? 'cyan' : m.grade === 'F' ? 'danger' : 'info'}
            size="sm"
          >
            {m.grade}
          </Badge>
          <span className={`text-[11px] font-mono font-medium ${m.result_status === 'Pass' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {m.result_status}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Review Stage',
      render: m => {
        const variant =
          m.status === 'Published'
            ? 'cyan'
            : m.status === 'Verified'
            ? 'success'
            : m.status === 'Submitted'
            ? 'warning'
            : 'default';
        return <Badge variant={variant} size="sm">{m.status}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: m => (
        <div className="flex items-center justify-end gap-1.5">
          {m.status === 'Submitted' && (
            <>
              <button
                onClick={() => handleUpdateStatus(m.id, 'Verified')}
                className="px-2 py-1 rounded-lg border border-emerald-800 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-[11px] font-medium transition"
                title="Verify Mark Sheet"
              >
                Verify
              </button>
              <button
                onClick={() => handleUpdateStatus(m.id, 'Draft')}
                className="px-2 py-1 rounded-lg border border-rose-800 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-[11px] font-medium transition"
                title="Reject and send back to Faculty Draft"
              >
                Reject
              </button>
            </>
          )}

          {m.status === 'Verified' && (
            <button
              onClick={() => handleUpdateStatus(m.id, 'Published')}
              className="px-2.5 py-1 rounded-lg border border-cyan-800 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 text-[11px] font-medium transition flex items-center gap-1"
              title="Publish mark to student profile"
            >
              <UploadCloud className="w-3 h-3" />
              Publish
            </button>
          )}

          {m.status === 'Published' && (
            <span className="text-[11px] font-mono text-cyan-400 font-semibold px-2 py-0.5">
              Live in Portal
            </span>
          )}

          {m.status === 'Draft' && (
            <span className="text-[11px] font-mono text-slate-500">
              Faculty Draft
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            Marks Verification & Result Publishing Desk
          </h2>
          <p className="text-xs text-slate-400">
            Review marks submitted by examiners, verify score integrity, and publish final grade sheets.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={CheckCircle2}
            onClick={handleBatchVerifyAll}
            className="text-emerald-400 hover:border-emerald-700"
          >
            Verify All Submitted
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={UploadCloud}
            onClick={handleBatchPublishAllVerified}
            className="text-cyan-400 hover:border-cyan-700"
          >
            Publish Verified
          </Button>

          <Button
            variant="cyan"
            size="sm"
            icon={Award}
            onClick={() => setIsPublishModalOpen(true)}
          >
            Publish SGPA Result
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>Filters:</span>
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Statuses</option>
          <option value="Submitted">Submitted (Awaiting Review)</option>
          <option value="Verified">Verified (Ready to Publish)</option>
          <option value="Published">Published (Live to Students)</option>
          <option value="Draft">Draft (Faculty Workspace)</option>
        </select>

        <select
          value={examFilter}
          onChange={e => setExamFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-cyan-500 max-w-xs truncate"
        >
          <option value="all">All Scheduled Exams</option>
          {exams.map(e => (
            <option key={e.id} value={e.id}>
              {e.subject?.subject_code} - {e.subject?.subject_name}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        data={filteredMarks}
        columns={columns}
        keyExtractor={m => m.id}
        searchPlaceholder="Search marks by student name, roll number, or subject..."
        isLoading={isLoading}
      />

      {/* Publish Semester Result Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish Official Semester SGPA Result"
        subtitle="Aggregates published course marks and calculates Semester Grade Point Average"
        maxWidth="md"
      >
        <form onSubmit={handlePublishSemesterResult} className="space-y-4 text-xs">
          {publishMessage && (
            <div
              className={`p-3 rounded-xl border ${
                publishMessage.includes('Successfully')
                  ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300'
                  : 'border-rose-800 bg-rose-950/40 text-rose-300'
              }`}
            >
              {publishMessage}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Select Student Candidate</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                required
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.roll_number} - {s.user?.full_name} ({s.department?.code} Sem {s.semester})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Semester</label>
                <select
                  value={publishSemester}
                  onChange={e => setPublishSemester(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Academic Year</label>
                <input
                  type="text"
                  value={publishAcademicYear}
                  onChange={e => setPublishAcademicYear(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              Only courses with <span className="text-cyan-400 font-semibold">Published</span> status are aggregated into the SGPA formula (10-point scale: A+=10, A=9, B+=8, B=7, C=6, D=5, F=0).
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsPublishModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cyan" size="sm" isLoading={isPublishing}>
              Compute & Publish Result
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
