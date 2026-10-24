import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  Layers,
  MapPin,
  Calendar
} from 'lucide-react';
import { db } from '../../lib/databaseService';
import { Exam, ExamRoom } from '../../types/database';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Badge } from '../../components/common/Badge';

export const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<ExamRoom[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<ExamRoom | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    room_number: '',
    building: 'Aryabhata Block',
    floor: 2,
    capacity: 40
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rList, eList] = await Promise.all([db.getExamRooms(), db.getExams()]);
      setRooms(rList);
      setExams(eList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormError(null);
    setFormData({
      room_number: '',
      building: 'Aryabhata Block',
      floor: 2,
      capacity: 40
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (room: ExamRoom) => {
    setFormError(null);
    setActiveRoom(room);
    setFormData({
      room_number: room.room_number,
      building: room.building,
      floor: room.floor,
      capacity: room.capacity
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, roomNum: string) => {
    const hasScheduled = exams.some(e => e.room_id === id && e.status === 'Scheduled');
    if (hasScheduled) {
      alert(`Cannot delete ${roomNum}: Examination sessions are scheduled in this venue.`);
      return;
    }

    if (confirm(`Remove examination room ${roomNum}?`)) {
      try {
        await db.deleteExamRoom(id);
        setRooms(prev => prev.filter(r => r.id !== id));
      } catch (err: any) {
        alert(err.message || 'Error deleting room.');
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (!formData.room_number || !formData.building) throw new Error('Please fill all fields.');
      const created = await db.createExamRoom(formData);
      setRooms(prev => [...prev, created]);
      setIsAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoom) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      const updated = await db.updateExamRoom(activeRoom.id, formData);
      setRooms(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      setIsEditModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<ExamRoom>[] = [
    {
      key: 'room_number',
      header: 'Room Number',
      render: r => (
        <span className="font-mono font-bold text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/40">
          {r.room_number}
        </span>
      )
    },
    {
      key: 'building',
      header: 'Building / Complex',
      render: r => (
        <div className="flex items-center gap-1.5 text-slate-200">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{r.building}</span>
        </div>
      )
    },
    {
      key: 'floor',
      header: 'Floor',
      render: r => <span className="font-mono text-slate-300">Level {r.floor}</span>
    },
    {
      key: 'capacity',
      header: 'Desk Capacity',
      render: r => (
        <div className="flex items-center gap-1.5 text-slate-300">
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono font-semibold text-white">{r.capacity} seats</span>
        </div>
      )
    },
    {
      key: 'allocated_exams',
      header: 'Allocated Exams',
      render: r => {
        const count = exams.filter(e => e.room_id === r.id && e.status === 'Scheduled').length;
        return (
          <Badge variant={count > 0 ? 'cyan' : 'default'} size="sm">
            {count} Scheduled
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: r => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(r)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-cyan-400 transition"
            title="Edit Room"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(r.id, r.room_number)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-rose-950/50 hover:border-rose-900/50 text-rose-400 transition"
            title="Delete Room"
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
            Examination Halls & Room Logistics
          </h2>
          <p className="text-xs text-slate-400">
            Configure examination venues, physical seating capacities, and room availability.
          </p>
        </div>
        <Button variant="cyan" size="sm" icon={Plus} onClick={handleOpenAdd}>
          Add Room
        </Button>
      </div>

      <DataTable
        data={rooms}
        columns={columns}
        keyExtractor={r => r.id}
        searchPlaceholder="Search rooms by number or building..."
        isLoading={isLoading}
      />

      {/* Add Room Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Examination Room"
        subtitle="Registers hall desk capacity and campus location"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl border border-rose-800 bg-rose-950/40 text-rose-300 text-xs">
              {formError}
            </div>
          )}
          <FormInput
            label="Room / Hall Number"
            value={formData.room_number}
            onChange={e => setFormData({ ...formData, room_number: e.target.value.toUpperCase() })}
            placeholder="e.g. Hall-301"
            required
          />
          <FormInput
            label="Building / Academic Block"
            value={formData.building}
            onChange={e => setFormData({ ...formData, building: e.target.value })}
            placeholder="e.g. Ramanujan Complex"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Floor Level"
              type="number"
              value={formData.floor}
              onChange={e => setFormData({ ...formData, floor: Number(e.target.value) })}
              required
            />
            <FormInput
              label="Desk Capacity"
              type="number"
              value={formData.capacity}
              onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cyan" size="sm" isLoading={isSubmitting}>
              Create Hall
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Room Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Examination Room"
        subtitle={`Updating venue ${activeRoom?.room_number}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl border border-rose-800 bg-rose-950/40 text-rose-300 text-xs">
              {formError}
            </div>
          )}
          <FormInput
            label="Room / Hall Number"
            value={formData.room_number}
            onChange={e => setFormData({ ...formData, room_number: e.target.value.toUpperCase() })}
            required
          />
          <FormInput
            label="Building / Academic Block"
            value={formData.building}
            onChange={e => setFormData({ ...formData, building: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Floor Level"
              type="number"
              value={formData.floor}
              onChange={e => setFormData({ ...formData, floor: Number(e.target.value) })}
              required
            />
            <FormInput
              label="Desk Capacity"
              type="number"
              value={formData.capacity}
              onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cyan" size="sm" isLoading={isSubmitting}>
              Update Room
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
