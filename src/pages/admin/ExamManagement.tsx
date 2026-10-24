import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Plus,
  Edit2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  UserCheck,
  CheckCircle2,
  Filter,
  Layers
} from 'lucide-react';
import { db } from '../../lib/databaseService';
import { Department, Exam, ExamRoom, Faculty, Subject } from '../../types/database';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';

export const ExamManagement: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [rooms, setRooms] = useState<ExamRoom[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedSem, setSelectedSem] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  // Form
  const [formData, setFormData] = useState({
    subject_id: '',
    department_id: '',
    semester: 5,
    exam_date: '2025-11-15',
    start_time: '10:00:00',
    end_time: '13:00:00',
    room_id: '',
    exam_type: 'End-Term' as any,
    status: 'Scheduled' as any,
    faculty_ids: [] as string[]
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eList, sList, dList, rList, fList] = await Promise.all([
        db.getExams(),
        db.getSubjects(),
        db.getDepartments(),
        db.getExamRooms(),
        db.getFaculty()
      ]);
      setExams(eList);
      setSubjects(sList);
      setDepartments(dList);
      setRooms(rList);
      setFaculty(fList);

      if (sList.length > 0 && !formData.subject_id) {
        setFormData(prev => ({
          ...prev,
          subject_id: sList[0].id,
          department_id: sList[0].department_id,
          semester: sList[0].semester,
          room_id: rList[0]?.id || ''
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormError(null);
    const firstSub = subjects[0];
    setFormData({
      subject_id: firstSub?.id || '',
      department_id: firstSub?.department_id || departments[0]?.id || '',
      semester: firstSub?.semester || 5,
      exam_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      start_time: '10:00:00',
      end_time: '13:00:00',
      room_id: rooms[0]?.id || '',
      exam_type: 'End-Term',
      status: 'Scheduled',
      faculty_ids: faculty[0]?.id ? [faculty[0].id] : []
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setFormError(null);
    setActiveExam(exam);
    setFormData({
      subject_id: exam.subject_id,
      department_id: exam.department_id,
      semester: exam.semester,
      exam_date: exam.exam_date,
      start_time: exam.start_time,
      end_time: exam.end_time,
      room_id: exam.room_id || '',
      exam_type: exam.exam_type,
      status: exam.status,
      faculty_ids: exam.faculty_ids || []
    });
    setIsEditModalOpen(true);
  };

  const handleCancelExam = async (id: string, code: string) => {
    if (confirm(`Cancel scheduled examination session for ${code}?`)) {
      try {
        await db.cancelExam(id);
        setExams(prev => prev.map(e => (e.id === id ? { ...e, status: 'Cancelled' } : e)));
      } catch (err: any) {
        alert(err.message || 'Error cancelling exam.');
      }
    }
  };

  const handleSubjectChange = (subjectId: string) => {
    const sub = subjects.find(s => s.id === subjectId);
    if (sub) {
      setFormData(prev => ({
        ...prev,
        subject_id: subjectId,
        department_id: sub.department_id,
        semester: sub.semester
      }));
    }
  };

  const handleToggleFaculty = (facId: string) => {
    setFormData(prev => {
      const exists = prev.faculty_ids.includes(facId);
      return {
        ...prev,
        faculty_ids: exists ? prev.faculty_ids.filter(id => id !== facId) : [...prev.faculty_ids, facId]
      };
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (!formData.subject_id || !formData.exam_date || !formData.start_time || !formData.end_time) {
        throw new Error('Please fill all mandatory exam schedule parameters.');
      }

      const created = await db.createExam({
        subject_id: formData.subject_id,
        department_id: formData.department_id,
        semester: formData.semester,
        exam_date: formData.exam_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        room_id: formData.room_id || null,
        exam_type: formData.exam_type,
        status: formData.status,
        created_by: 'admin',
        faculty_ids: formData.faculty_ids
      });

      setExams(prev => [created, ...prev]);
      setIsAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to schedule exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExam) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      const updated = await db.updateExam(activeExam.id, {
        subject_id: formData.subject_id,
        department_id: formData.department_id,
        semester: formData.semester,
        exam_date: formData.exam_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        room_id: formData.room_id || null,
        exam_type: formData.exam_type,
        status: formData.status,
        faculty_ids: formData.faculty_ids
      });

      setExams(prev => prev.map(e => (e.id === updated.id ? updated : e)));
      setIsEditModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExams = exams.filter(e => {
    if (selectedDept !== 'all' && e.department_id !== selectedDept) return false;
    if (selectedSem !== 'all' && e.semester !== Number(selectedSem)) return false;
    return true;
  });

  const columns: Column<Exam>[] = [
    {
      key: 'subject',
      header: 'Subject & Code',
      render: e => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white text-xs">{e.subject?.subject_code}</span>
            <Badge variant="cyan" size="sm">{e.exam_type}</Badge>
          </div>
          <p className="text-xs text-slate-300 line-clamp-1">{e.subject?.subject_name}</p>
        </div>
      )
    },
    {
      key: 'department',
      header: 'Dept & Sem',
      render: e => (
        <span className="text-xs text-slate-300">
          {e.department?.code} • Sem {e.semester}
        </span>
      )
    },
    {
      key: 'exam_date',
      header: 'Date & Time',
      render: e => (
        <div>
          <div className="flex items-center gap-1.5 text-slate-200 font-mono text-xs">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>{e.exam_date}</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {e.start_time.slice(0, 5)} - {e.end_time.slice(0, 5)}
          </p>
        </div>
      )
    },
    {
      key: 'room',
      header: 'Venue',
      render: e => (
        <div className="flex items-center gap-1 text-slate-300 text-xs">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono font-medium">{e.room?.room_number || 'TBA'}</span>
        </div>
      )
    },
    {
      key: 'invigilators',
      header: 'Invigilators',
      render: e => {
        const invigilatorNames = e.faculty?.map(f => f.user?.full_name).join(', ') || 'None assigned';
        return <span className="text-xs text-slate-400 line-clamp-1">{invigilatorNames}</span>;
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: e => {
        const variant =
          e.status === 'Scheduled'
            ? 'cyan'
            : e.status === 'Completed'
            ? 'success'
            : e.status === 'Ongoing'
            ? 'warning'
            : 'danger';
        return <Badge variant={variant} size="sm">{e.status}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: e => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(e)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-cyan-400 transition"
            title="Edit Schedule"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {e.status !== 'Cancelled' && (
            <button
              onClick={() => handleCancelExam(e.id, e.subject?.subject_code || 'Exam')}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-rose-950/50 hover:border-rose-900/50 text-rose-400 transition"
              title="Cancel Examination"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
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
            <Calendar className="w-5 h-5 text-cyan-400" />
            Examination Scheduling & Timetable
          </h2>
          <p className="text-xs text-slate-400">
            Publish timetable sessions, detect hall double bookings, and assign faculty invigilators.
          </p>
        </div>
        <Button variant="cyan" size="sm" icon={Plus} onClick={handleOpenAdd}>
          Schedule Examination
        </Button>
      </div>

      {/* Filter Component */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>Filters:</span>
        </div>

        <select
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>
              {d.code} - {d.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSem}
          onChange={e => setSelectedSem(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        data={filteredExams}
        columns={columns}
        keyExtractor={e => e.id}
        searchPlaceholder="Search timetable by course code or subject..."
        isLoading={isLoading}
      />

      {/* Add Exam Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule New Examination"
        subtitle="Automatic room conflict detection & invigilator assignment"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl border border-rose-800 bg-rose-950/40 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Select
                label="Course / Subject"
                value={formData.subject_id}
                onChange={e => handleSubjectChange(e.target.value)}
                options={subjects.map(s => ({
                  value: s.id,
                  label: `${s.subject_code} - ${s.subject_name} (Sem ${s.semester})`
                }))}
                required
              />
            </div>

            <Select
              label="Exam Type"
              value={formData.exam_type}
              onChange={e => setFormData({ ...formData, exam_type: e.target.value as any })}
              options={[
                { value: 'Mid-Term', label: 'Mid-Term Exam' },
                { value: 'End-Term', label: 'End-Term Semester Exam' },
                { value: 'Practical', label: 'Laboratory / Practical Exam' },
                { value: 'Supplementary', label: 'Supplementary / Backlog' }
              ]}
              required
            />

            <Select
              label="Examination Hall / Room"
              value={formData.room_id}
              onChange={e => setFormData({ ...formData, room_id: e.target.value })}
              options={rooms.map(r => ({
                value: r.id,
                label: `${r.room_number} (${r.building}, ${r.capacity} seats)`
              }))}
              required
            />

            <FormInput
              label="Exam Date"
              type="date"
              value={formData.exam_date}
              onChange={e => setFormData({ ...formData, exam_date: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <FormInput
                label="Start Time"
                type="time"
                value={formData.start_time}
                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
              <FormInput
                label="End Time"
                type="time"
                value={formData.end_time}
                onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Invigilators Multiselect */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-medium text-slate-300">
              Assign Faculty Invigilators ({formData.faculty_ids.length} selected)
            </label>
            <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80 p-2 space-y-1">
              {faculty.map(fac => {
                const isSelected = formData.faculty_ids.includes(fac.id);
                return (
                  <button
                    key={fac.id}
                    type="button"
                    onClick={() => handleToggleFaculty(fac.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition ${
                      isSelected
                        ? 'bg-cyan-950/50 border border-cyan-800 text-cyan-200'
                        : 'hover:bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span>{fac.user?.full_name} ({fac.employee_id} - {fac.designation})</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cyan" size="sm" isLoading={isSubmitting}>
              Schedule Session
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Exam Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Examination Schedule"
        subtitle={`Updating session for ${activeExam?.subject?.subject_code}`}
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl border border-rose-800 bg-rose-950/40 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Status"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { value: 'Scheduled', label: 'Scheduled' },
                { value: 'Ongoing', label: 'Ongoing' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' }
              ]}
              required
            />

            <Select
              label="Examination Hall / Room"
              value={formData.room_id}
              onChange={e => setFormData({ ...formData, room_id: e.target.value })}
              options={rooms.map(r => ({
                value: r.id,
                label: `${r.room_number} (${r.building})`
              }))}
              required
            />

            <FormInput
              label="Exam Date"
              type="date"
              value={formData.exam_date}
              onChange={e => setFormData({ ...formData, exam_date: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <FormInput
                label="Start Time"
                type="time"
                value={formData.start_time}
                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
              <FormInput
                label="End Time"
                type="time"
                value={formData.end_time}
                onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-medium text-slate-300">
              Assigned Faculty Invigilators
            </label>
            <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80 p-2 space-y-1">
              {faculty.map(fac => {
                const isSelected = formData.faculty_ids.includes(fac.id);
                return (
                  <button
                    key={fac.id}
                    type="button"
                    onClick={() => handleToggleFaculty(fac.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition ${
                      isSelected
                        ? 'bg-cyan-950/50 border border-cyan-800 text-cyan-200'
                        : 'hover:bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span>{fac.user?.full_name} ({fac.employee_id})</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cyan" size="sm" isLoading={isSubmitting}>
              Update Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
