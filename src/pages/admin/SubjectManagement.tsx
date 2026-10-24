import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Layers,
  GraduationCap
} from 'lucide-react';
import { db } from '../../lib/databaseService';
import { Department, Subject } from '../../types/database';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';

export const SubjectManagement: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedSem, setSelectedSem] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);

  // Form
  const [formData, setFormData] = useState({
    subject_code: '',
    subject_name: '',
    department_id: '',
    semester: 5,
    credits: 4,
    max_marks: 100,
    passing_marks: 40
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sList, dList] = await Promise.all([db.getSubjects(), db.getDepartments()]);
      setSubjects(sList);
      setDepartments(dList);
      if (dList.length > 0 && !formData.department_id) {
        setFormData(prev => ({ ...prev, department_id: dList[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormError(null);
    setFormData({
      subject_code: '',
      subject_name: '',
      department_id: departments[0]?.id || '',
      semester: 5,
      credits: 4,
      max_marks: 100,
      passing_marks: 40
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setFormError(null);
    setActiveSubject(sub);
    setFormData({
      subject_code: sub.subject_code,
      subject_name: sub.subject_name,
      department_id: sub.department_id,
      semester: sub.semester,
      credits: sub.credits,
      max_marks: sub.max_marks,
      passing_marks: sub.passing_marks
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete subject "${name}"? Only subjects without scheduled exams can be removed.`)) {
      try {
        await db.deleteSubject(id);
        setSubjects(prev => prev.filter(s => s.id !== id));
      } catch (err: any) {
        alert(err.message || 'Error deleting subject.');
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (!formData.subject_code || !formData.subject_name) {
        throw new Error('Please enter subject code and name.');
      }
      const created = await db.createSubject(formData);
      setSubjects(prev => [created, ...prev]);
      setIsAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubject) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      const updated = await db.updateSubject(activeSubject.id, formData);
      setSubjects(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      setIsEditModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSubjects = subjects.filter(s => {
    if (selectedDept !== 'all' && s.department_id !== selectedDept) return false;
    if (selectedSem !== 'all' && s.semester !== Number(selectedSem)) return false;
    return true;
  });

  const columns: Column<Subject>[] = [
    {
      key: 'subject_code',
      header: 'Code',
      render: s => (
        <span className="font-mono font-bold text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
          {s.subject_code}
        </span>
      )
    },
    {
      key: 'subject_name',
      header: 'Subject Name',
      render: s => <span className="font-medium text-slate-100">{s.subject_name}</span>
    },
    {
      key: 'department',
      header: 'Department',
      render: s => <span className="text-slate-300">{s.department?.name || 'CSE'}</span>
    },
    {
      key: 'semester',
      header: 'Semester',
      render: s => <Badge variant="default" size="sm">Sem {s.semester}</Badge>
    },
    {
      key: 'credits',
      header: 'Credits',
      render: s => <span className="font-mono text-slate-300">{s.credits} Credits</span>
    },
    {
      key: 'marks_breakdown',
      header: 'Max / Pass',
      render: s => (
        <span className="font-mono text-xs text-slate-400">
          {s.max_marks} / <span className="text-emerald-400 font-semibold">{s.passing_marks}</span>
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: s => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(s)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-cyan-400 transition"
            title="Edit Subject"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(s.id, s.subject_name)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-rose-950/50 hover:border-rose-900/50 text-rose-400 transition"
            title="Delete Subject"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Curriculum Subjects Registry
          </h2>
          <p className="text-xs text-slate-400">
            Define academic courses, semester associations, credit loads, and passing benchmarks.
          </p>
        </div>
        <Button variant="cyan" size="sm" icon={Plus} onClick={handleOpenAdd}>
          Add Subject
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
        data={filteredSubjects}
        columns={columns}
        keyExtractor={s => s.id}
        searchPlaceholder="Search subjects by name or course code..."
        isLoading={isLoading}
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Curriculum Subject"
        subtitle="Registers course code, semester allocation, and grading constraints"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl border border-rose-800 bg-rose-950/40 text-rose-300 text-xs">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Subject Code"
              value={formData.subject_code}
              onChange={e => setFormData({ ...formData, subject_code: e.target.value.toUpperCase() })}
              placeholder="e.g. CS-504"
              required
            />
            <FormInput
              label="Subject Name"
              value={formData.subject_name}
              onChange={e => setFormData({ ...formData, subject_name: e.target.value })}
              placeholder="e.g. Theory of Computation"
              required
            />
            <Select
              label="Department"
              value={formData.department_id}
              onChange={e => setFormData({ ...formData, department_id: e.target.value })}
              options={departments.map(d => ({ value: d.id, label: `${d.code} - ${d.name}` }))}
              required
            />
            <Select
              label="Semester"
              value={formData.semester}
              onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map(s => ({ value: s, label: `Semester ${s}` }))}
              required
            />
            <FormInput
              label="Credits"
              type="number"
              value={formData.credits}
              onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
              required
            />
            <FormInput
              label="Maximum Marks"
              type="number"
              value={formData.max_marks}
              onChange={e => setFormData({ ...formData, max_marks: Number(e.target.value) })}
              required
            />
            <FormInput
              label="Passing Marks"
              type="number"
              value={formData.passing_marks}
              onChange={e => setFormData({ ...formData, passing_marks: Number(e.target.value) })}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cyan" size="sm" isLoading={isSubmitting}>
              Create Subject
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Subject"
        subtitle={`Updating course ${activeSubject?.subject_code}`}
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl border border-rose-800 bg-rose-950/40 text-rose-300 text-xs">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Subject Code"
              value={formData.subject_code}
              onChange={e => setFormData({ ...formData, subject_code: e.target.value.toUpperCase() })}
              required
            />
            <FormInput
              label="Subject Name"
              value={formData.subject_name}
              onChange={e => setFormData({ ...formData, subject_name: e.target.value })}
              required
            />
            <Select
              label="Department"
              value={formData.department_id}
              onChange={e => setFormData({ ...formData, department_id: e.target.value })}
              options={departments.map(d => ({ value: d.id, label: `${d.code} - ${d.name}` }))}
              required
            />
            <Select
              label="Semester"
              value={formData.semester}
              onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map(s => ({ value: s, label: `Semester ${s}` }))}
              required
            />
            <FormInput
              label="Credits"
              type="number"
              value={formData.credits}
              onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
              required
            />
            <FormInput
              label="Maximum Marks"
              type="number"
              value={formData.max_marks}
              onChange={e => setFormData({ ...formData, max_marks: Number(e.target.value) })}
              required
            />
            <FormInput
              label="Passing Marks"
              type="number"
              value={formData.passing_marks}
              onChange={e => setFormData({ ...formData, passing_marks: Number(e.target.value) })}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cyan" size="sm" isLoading={isSubmitting}>
              Update Subject
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
