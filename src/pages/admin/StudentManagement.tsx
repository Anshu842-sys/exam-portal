import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Filter,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { db } from '../../lib/databaseService';
import { Department, Student } from '../../types/database';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedSem, setSelectedSem] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    passwordPlain: '',
    roll_number: '',
    enrollment_number: '',
    department_id: '',
    semester: 5,
    academic_year: '2025-2026',
    phone: '',
    date_of_birth: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sList, dList] = await Promise.all([db.getStudents(), db.getDepartments()]);
      setStudents(sList);
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
      passwordPlain: 'student123',
      roll_number: '',
      enrollment_number: '',
      department_id: departments[0]?.id || '',
      semester: 5,
      academic_year: '2025-2026',
      phone: '',
      date_of_birth: '2004-01-01'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setFormError(null);
    setActiveStudent(student);
    setFormData({
      full_name: student.user?.full_name || '',
      email: student.user?.email || '',
      username: student.user?.username || '',
      passwordPlain: '',
      roll_number: student.roll_number,
      enrollment_number: student.enrollment_number,
      department_id: student.department_id,
      semester: student.semester,
      academic_year: student.academic_year,
      phone: student.phone || '',
      date_of_birth: student.date_of_birth || ''
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = (student: Student) => {
    setActiveStudent(student);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Permanently remove student record for ${name}? Associated marks and results will also be deleted.`)) {
      try {
        await db.deleteStudent(id);
        setStudents(prev => prev.filter(s => s.id !== id));
      } catch (err: any) {
        alert(err.message || 'Error deleting student.');
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (!formData.full_name || !formData.email || !formData.roll_number || !formData.enrollment_number) {
        throw new Error('Please fill in all mandatory fields.');
      }

      const generatedUsername = formData.username || formData.roll_number.toLowerCase().replace(/[^a-z0-9]/g, '');
      const newStudent = await db.createStudent({
        ...formData,
        username: generatedUsername
      });

      setStudents(prev => [newStudent, ...prev]);
      setIsAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const updated = await db.updateStudent(activeStudent.id, formData);
      setStudents(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      setIsEditModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update student');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter list
  const filteredStudents = students.filter(s => {
    if (selectedDept !== 'all' && s.department_id !== selectedDept) return false;
    if (selectedSem !== 'all' && s.semester !== Number(selectedSem)) return false;
    return true;
  });

  const columns: Column<Student>[] = [
    {
      key: 'roll_number',
      header: 'Roll Number',
      render: s => (
        <span className="font-mono font-semibold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
          {s.roll_number}
        </span>
      )
    },
    {
      key: 'full_name',
      header: 'Student Name',
      render: s => (
        <div>
          <p className="font-medium text-slate-100">{s.user?.full_name}</p>
          <p className="text-[11px] text-slate-400 font-mono">@{s.user?.username}</p>
        </div>
      )
    },
    {
      key: 'enrollment_number',
      header: 'Enrollment No.',
      render: s => <span className="font-mono text-slate-300 text-xs">{s.enrollment_number}</span>
    },
    {
      key: 'department',
      header: 'Department',
      render: s => <span className="text-slate-300">{s.department?.name || 'CSE'}</span>
    },
    {
      key: 'semester',
      header: 'Sem',
      render: s => <Badge variant="default" size="sm">Sem {s.semester}</Badge>
    },
    {
      key: 'email',
      header: 'Email Address',
      render: s => <span className="text-slate-400 text-xs">{s.user?.email}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: s => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenView(s)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition"
            title="View Academic Record"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenEdit(s)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-cyan-400 transition"
            title="Edit Student"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(s.id, s.user?.full_name || s.roll_number)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-rose-950/50 hover:border-rose-900/50 text-rose-400 transition"
            title="Delete Student"
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
            <Users className="w-5 h-5 text-cyan-400" />
            Student Roster Management
          </h2>
          <p className="text-xs text-slate-400">
            Maintain student credentials, department affiliations, and academic profiles.
          </p>
        </div>
        <Button variant="cyan" size="sm" icon={Plus} onClick={handleOpenAdd}>
          Register Student
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

      {/* Main Table */}
      <DataTable
        data={filteredStudents}
        columns={columns}
        keyExtractor={s => s.id}
        searchPlaceholder="Search by name, roll number, or enrollment..."
        isLoading={isLoading}
      />

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Student"
        subtitle="Creates credentials in users table & academic profile in students table"
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
              placeholder="e.g. John Doe"
              required
            />
            <FormInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. jdoe@apex.edu"
              required
            />
            <FormInput
              label="Roll Number"
              value={formData.roll_number}
              onChange={e => setFormData({ ...formData, roll_number: e.target.value })}
              placeholder="e.g. CS2023-099"
              required
            />
            <FormInput
              label="Enrollment Number"
              value={formData.enrollment_number}
              onChange={e => setFormData({ ...formData, enrollment_number: e.target.value })}
              placeholder="e.g. ENR-2023-9999"
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
              options={[1, 2, 3, 4, 5, 6, 7, 8].map(sem => ({ value: sem, label: `Semester ${sem}` }))}
              required
            />
            <FormInput
              label="Phone Number"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1-555-0100"
            />
            <FormInput
              label="Academic Year"
              value={formData.academic_year}
              onChange={e => setFormData({ ...formData, academic_year: e.target.value })}
              placeholder="2025-2026"
            />
            <FormInput
              label="Default Login Password"
              type="password"
              value={formData.passwordPlain}
              onChange={e => setFormData({ ...formData, passwordPlain: e.target.value })}
              placeholder="Defaults to student123"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cyan" size="sm" isLoading={isSubmitting}>
              Save Student Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Profile"
        subtitle={`Updating academic details for ${activeStudent?.roll_number}`}
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
              label="Roll Number"
              value={formData.roll_number}
              onChange={e => setFormData({ ...formData, roll_number: e.target.value })}
              required
            />
            <FormInput
              label="Enrollment Number"
              value={formData.enrollment_number}
              onChange={e => setFormData({ ...formData, enrollment_number: e.target.value })}
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
              options={[1, 2, 3, 4, 5, 6, 7, 8].map(sem => ({ value: sem, label: `Semester ${sem}` }))}
              required
            />
            <FormInput
              label="Phone"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
            <FormInput
              label="Academic Year"
              value={formData.academic_year}
              onChange={e => setFormData({ ...formData, academic_year: e.target.value })}
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

      {/* View Student Record Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Student Academic Dossier"
        subtitle="Official Examination Cell Registry Record"
        maxWidth="md"
      >
        {activeStudent && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-100">{activeStudent.user?.full_name}</h4>
                <p className="text-cyan-400 font-mono text-xs">{activeStudent.roll_number}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Enrollment No.</p>
                <p className="font-mono text-slate-200">{activeStudent.enrollment_number}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Department</p>
                <p className="font-semibold text-slate-200">{activeStudent.department?.code}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Semester</p>
                <p className="font-mono text-slate-200">Semester {activeStudent.semester}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Academic Year</p>
                <p className="font-mono text-slate-200">{activeStudent.academic_year}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Email</p>
                <p className="text-slate-200 truncate">{activeStudent.user?.email}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Phone</p>
                <p className="font-mono text-slate-200">{activeStudent.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsViewModalOpen(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
