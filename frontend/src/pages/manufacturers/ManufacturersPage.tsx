import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Factory, Pencil, Trash2, Save, X, Package, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { manufacturersApi } from '../../api/manufacturers.api';
import type { Manufacturer } from '../../types';

const manufacturerSchema = z.object({
  name: z.string().min(1, 'Manufacturer name is required'),
  is_active: z.boolean().optional(),
});
type ManufacturerFormValues = z.infer<typeof manufacturerSchema>;

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const ManufacturersPage: React.FC = () => {
  const navigate = useNavigate();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; manufacturer: Manufacturer | null }>({
    open: false, manufacturer: null,
  });
  const [editModal, setEditModal] = useState<{ open: boolean; manufacturer: Manufacturer | null }>({
    open: false, manufacturer: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ManufacturerFormValues>({
    resolver: zodResolver(manufacturerSchema),
  });

  // ── Fetch all manufacturers on mount ──
  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const data = await manufacturersApi.getAll();
        setManufacturers(data);
      } catch {
        toast.error('Failed to load manufacturers');
      } finally {
        setLoading(false);
      }
    };
    fetchManufacturers();
  }, []);

  const filtered = useMemo(
    () =>
      manufacturers.filter((m) =>
        !search || m.name.toLowerCase().includes(search.toLowerCase())
      ),
    [manufacturers, search]
  );

  const handleDelete = async () => {
    if (!deleteModal.manufacturer) return;
    try {
      await manufacturersApi.delete(deleteModal.manufacturer.id);
      setManufacturers((prev) => prev.filter((m) => m.id !== deleteModal.manufacturer!.id));
      toast.success('Manufacturer deleted');
    } catch {
      toast.error('Failed to delete manufacturer');
    } finally {
      setDeleteModal({ open: false, manufacturer: null });
    }
  };

  const openEditModal = (manufacturer: Manufacturer) => {
    reset({ name: manufacturer.name, is_active: manufacturer.is_active });
    setEditModal({ open: true, manufacturer });
  };

  const handleEditSubmit = async (data: ManufacturerFormValues) => {
    if (!editModal.manufacturer) return;
    setIsSubmitting(true);
    try {
      const updated = await manufacturersApi.update(editModal.manufacturer.id, {
        name: data.name,
        is_active: data.is_active ?? true,
      });
      setManufacturers((prev) =>
        prev.map((m) => (m.id === editModal.manufacturer!.id ? updated : m))
      );
      toast.success('Manufacturer updated');
      setEditModal({ open: false, manufacturer: null });
    } catch {
      toast.error('Failed to update manufacturer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manufacturers</h1>
          <p className="page-subtitle">{manufacturers.length} manufacturers total</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/manufacturers/add')}
          id="add-manufacturer-btn"
        >
          Add Manufacturer
        </Button>
      </div>

      {/* Search */}
      <div className="card-padded mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search manufacturers..."
          className="max-w-sm"
          id="manufacturer-search"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Loading manufacturers…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Factory className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-gray-700 font-semibold mb-1">No manufacturers found</h3>
            <p className="text-sm text-gray-400">
              {search ? 'Try a different search term.' : 'Add your first manufacturer.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((mfr, idx) => (
                  <tr key={mfr.id}>
                    <td className="text-gray-400 font-mono text-xs">{idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <Factory className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-900">{mfr.name}</span>
                      </div>
                    </td>
                    <td><StatusBadge isActive={mfr.is_active} /></td>
                    <td className="text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(mfr.created_at)}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(mfr)}
                          className="btn-icon text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                          title="Edit manufacturer"
                          id={`edit-manufacturer-${mfr.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, manufacturer: mfr })}
                          className="btn-icon text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete manufacturer"
                          id={`delete-manufacturer-${mfr.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirm Modal ── */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, manufacturer: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.manufacturer?.name}
      />

      {/* ── Edit Modal ── */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, manufacturer: null })}
        title={`Edit Manufacturer`}
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditModal({ open: false, manufacturer: null })} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" isLoading={isSubmitting} form="edit-manufacturer-form" type="submit">
              <Save className="w-4 h-4 mr-1" /> Save Changes
            </Button>
          </div>
        }
      >
        <form id="edit-manufacturer-form" onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
          <Input
            label="Manufacturer Name"
            placeholder="e.g. Rajasthan Craft Works"
            error={errors.name?.message}
            required
            {...register('name')}
            id="edit-manufacturer-name"
          />
          <div className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              id="edit-manufacturer-active"
              className="w-4 h-4 accent-[#07393b] cursor-pointer rounded"
              {...register('is_active')}
            />
            <label htmlFor="edit-manufacturer-active" className="form-label cursor-pointer mb-0">
              Active
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};
