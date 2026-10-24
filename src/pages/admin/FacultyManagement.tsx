import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Mail,
  ShieldCheck,
  Building2,
  Briefcase
} from 'lucide-react';
import { db } from '../../lib/databaseService';
import { Department, Faculty } from '../../types/database';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';

export const FacultyManagement: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeFaculty, setActiveFaculty] = useState<Faculty | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    employee_id: '',
    department_id: '',
    designation: 'Assistant Professor',
    passwordPlain: 'faculty123'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fList, dList] = await Promise.all([db.getFaculty(), db.getDepartments()]);
      setFaculty(fList);
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
      full_name: '',
      email: '',
      username: '',
      employee_id: '',
      department_id: departments[0]?.id || '',
      designation: 'Assistant Professor',
      passwordPlain: 'faculty123'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (fac: Faculty) => {
    setFormError(null);
    setActiveFaculty(fac);
    setFormData({
      full_name: fac.user?.full_name || '',
      email: fac.user?.email || '',
      username: fac.user?.username || '',
      employee_id: fac.employee_id,
      department_id: fac.department_id,
      designation: fac.designation,
      passwordPlain: ''
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remove faculty member ${name}? Any assigned exam invigilations will be unassigned.`)) {
      try {
        await db.deleteFaculty(id);
        setFaculty(prev => prev.filter(f => f.id !== id));
      } catch (err: any) {
        alert(err.message || 'Error deleting faculty member.');
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (!formData.full_name || !formData.email || !formData.employee_id) {
        throw new Error('Please fill in all mandatory fields.');
      }

      const generatedUsername = formData.username || formData.employee_id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const newFaculty = await db.createFaculty({
        ...formData,
        username: generatedUsername
      });

      setFaculty(prev => [newFaculty, ...prev]);
      setIsAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add faculty member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFaculty) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const updated = await db.updateFaculty(activeFaculty.id, formData);
      setFaculty(prev => prev.map(f => (f.id === updated.id ? updated : f)));
      setIsEditModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update faculty');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaculty = faculty.filter(f => {
    if (selectedDept !== 'all' && f.department_id !== selectedDept) return false;
    return true;
  });

  const columns: Column<Faculty>[] = [
    {
      key: 'employee_id',
      header: 'Employee ID',
      render: f => (
        <span className="font-mono font-semibold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
          {f.employee_id}
        </span>
      )
    },
    {
      key: 'full_name',
      header: 'Faculty Name',
      render: f => (
        <div>
          <p className="font-medium text-slate-100">{f.user?.full_name}</p>
          <p className="text-[11px] text-slate-400 font-mono">@{f.user?.username}</p>
        </div>
      )
    },
    {
      key: 'designation',
      header: 'Designation',
      render: f => <Badge variant="info" size="sm">{f.designation}</Badge>
    },
    {
      key: 'department',
      header: 'Department',
      render: f => <span className="text-slate-300">{f.department?.name || 'CSE'}</span>
    },
    {
      key: 'email',
      header: 'Email Address',
      render: f => <span className="text-slate-400 text-xs">{f.user?.email}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: f => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(f)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-cyan-400 transition"
            title="Edit Faculty Member"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(f.id, f.user?.full_name || f.employee_id)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-rose-950/50 hover:border-rose-900/50 text-rose-400 transition"
            title="Delete Faculty Member"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            Faculty & Examiner Registry
          </h2>
          <p className="text-xs text-slate-400">
            Manage faculty profiles, designations, and exam evaluation authorizations.
          </p>
        </div>
        <Button variant="cyan" size="sm" icon={Plus} onClick={handleOpenAdd}>
          Register Faculty
        </Button>
      </div>

      {/* Filter Component */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>Department:</span>
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
      </div>

      {/* Main Table */}
      <DataTable
        data={filteredFaculty}
        columns={columns}
        keyExtractor={f => f.id}
        searchPlaceholder="Search by name, employee ID, or designation..."
        isLoading={isLoading}
      />

      {/* Add Faculty Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Faculty Member"
        subtitle="Generates login credentials and examiner profile"
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
              label="Full Name"
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="e.g. Dr. Jane Smith"
              required
            />
            <FormInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. jsmith@apex.edu"
              required
            />
            <FormInput
              label="Employee ID"
              value={formData.employee_id}
              onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
              placeholder="e.g. FAC-2021-04"
              required
            />
            <FormInput
              label="Designation"
              value={formData.designation}
              onChange={e => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g. Associate Professor"
              required
            />
            <Select
              label="Department"
              value={formData.department_id}
              onChange={e => setFormData({ ...formData, department_id: e.target.value })}
              options={departments.map(d => ({ value: d.id, label: `${d.code} - ${d.name}` }))}
              required
            />
            <FormInput
              label="Default Login Password"
              type="password"
              value={formData.passwordPlain}
              onChange={e => setFormData({ ...formData, passwordPlain: e.target.value })}
              placeholder="Defaults to faculty123"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cyan" size="sm" isLoading={isSubmitting}>
              Save Faculty Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Faculty Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Faculty Profile"
        subtitle={`Updating records for ${activeFaculty?.employee_id}`}
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
              label="Full Name"
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
            <FormInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <FormInput
              label="Employee ID"
              value={formData.employee_id}
              onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
              required
            />
            <FormInput
              label="Designation"
              value={formData.designation}
              onChange={e => setFormData({ ...formData, designation: e.target.value })}
              required
            />
            <Select
              label="Department"
              value={formData.department_id}
              onChange={e => setFormData({ ...formData, department_id: e.target.value })}
              options={departments.map(d => ({ value: d.id, label: `${d.code} - ${d.name}` }))}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cyan" size="sm" isLoading={isSubmitting}>
              Update Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
