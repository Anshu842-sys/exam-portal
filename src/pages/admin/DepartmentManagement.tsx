import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Users
} from 'lucide-react';
import { db } from '../../lib/databaseService';
import { Department, Student, Subject } from '../../types/database';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Badge } from '../../components/common/Badge';

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeDept, setActiveDept] = useState<Department | null>(null);

  // Form
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dList, sList, subList] = await Promise.all([
        db.getDepartments(),
        db.getStudents(),
        db.getSubjects()
      ]);
      setDepartments(dList);
      setStudents(sList);
      setSubjects(subList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormError(null);
    setFormData({ name: '', code: '' });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setFormError(null);
    setActiveDept(dept);
    setFormData({ name: dept.name, code: dept.code });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const studentCount = students.filter(s => s.department_id === id).length;
    const subjectCount = subjects.filter(sub => sub.department_id === id).length;

    if (studentCount > 0 || subjectCount > 0) {
      alert(`Cannot delete ${name}: It has ${studentCount} registered students and ${subjectCount} curriculum subjects.`);
      return;
    }

    if (confirm(`Are you sure you want to remove the ${name} department?`)) {
      try {
        await db.deleteDepartment(id);
        setDepartments(prev => prev.filter(d => d.id !== id));
      } catch (err: any) {
        alert(err.message || 'Error deleting department.');
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (!formData.name || !formData.code) throw new Error('Please enter both name and code.');
      const created = await db.createDepartment(formData);
      setDepartments(prev => [...prev, created]);
      setIsAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDept) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      const updated = await db.updateDepartment(activeDept.id, formData);
      setDepartments(prev => prev.map(d => (d.id === updated.id ? updated : d)));
      setIsEditModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Department>[] = [
    {
      key: 'code',
      header: 'Department Code',
      render: d => (
        <span className="font-mono font-bold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
          {d.code}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Department Name',
      render: d => <span className="font-medium text-slate-100">{d.name}</span>
    },
    {
      key: 'students',
      header: 'Registered Students',
      render: d => {
        const count = students.filter(s => s.department_id === d.id).length;
        return (
          <div className="flex items-center gap-1.5 text-slate-300">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono">{count} Students</span>
          </div>
        );
      }
    },
    {
      key: 'subjects',
      header: 'Curriculum Subjects',
      render: d => {
        const count = subjects.filter(s => s.department_id === d.id).length;
        return (
          <div className="flex items-center gap-1.5 text-slate-300">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono">{count} Courses</span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: d => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(d)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-cyan-400 transition"
            title="Edit Department"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(d.id, d.name)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-rose-950/50 hover:border-rose-900/50 text-rose-400 transition"
            title="Delete Department"
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
            <Building2 className="w-5 h-5 text-cyan-400" />
            Academic Departments
          </h2>
          <p className="text-xs text-slate-400">
            Manage academic divisions, affiliated departments, and course curricula.
          </p>
        </div>
        <Button variant="cyan" size="sm" icon={Plus} onClick={handleOpenAdd}>
          Add Department
        </Button>
      </div>

      <DataTable
        data={departments}
        columns={columns}
        keyExtractor={d => d.id}
        searchPlaceholder="Search departments by name or code..."
        isLoading={isLoading}
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Academic Department"
        subtitle="Registers department code and official academic title"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl border border-rose-800 bg-rose-950/40 text-rose-300 text-xs">
              {formError}
            </div>
          )}
          <FormInput
            label="Department Code"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="e.g. AI-DS"
            required
            helperText="Short uppercase department acronym"
          />
          <FormInput
            label="Department Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Artificial Intelligence & Data Science"
            required
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cyan" size="sm" isLoading={isSubmitting}>
              Create Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Department"
        subtitle={`Modifying ${activeDept?.code}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl border border-rose-800 bg-rose-950/40 text-rose-300 text-xs">
              {formError}
            </div>
          )}
          <FormInput
            label="Department Code"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
          />
          <FormInput
            label="Department Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cyan" size="sm" isLoading={isSubmitting}>
              Update Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
