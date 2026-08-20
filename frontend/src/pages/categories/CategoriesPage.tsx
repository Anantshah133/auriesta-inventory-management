import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Tag, Pencil, Trash2, Save, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { mockCategories as initialCategories } from '../../data/mockData';
import type { Category } from '../../types';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});
type CategoryFormValues = z.infer<typeof categorySchema>;

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [search, setSearch] = useState('');

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; category: Category | null }>({
    open: false, category: null,
  });
  const [editModal, setEditModal] = useState<{ open: boolean; category: Category | null }>({
    open: false, category: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  const filtered = useMemo(
    () =>
      categories.filter((c) =>
        !search || c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [categories, search]
  );

  const handleDelete = () => {
    if (deleteModal.category) {
      setCategories((prev) => prev.filter((c) => c.id !== deleteModal.category!.id));
      setDeleteModal({ open: false, category: null });
    }
  };

  const openEditModal = (category: Category) => {
    reset({ name: category.name, description: category.description ?? '', is_active: category.is_active });
    setEditModal({ open: true, category });
  };

  const handleEditSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setCategories((prev) =>
      prev.map((c) =>
        c.id === editModal.category!.id
          ? { ...c, ...data, description: data.description ?? null, is_active: data.is_active ?? true }
          : c
      )
    );
    setIsSubmitting(false);
    setEditModal({ open: false, category: null });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">{categories.length} categories total</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/categories/add')}
          id="add-category-btn"
        >
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="card-padded mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search categories..."
          className="max-w-sm"
          id="category-search"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Tag className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-gray-700 font-semibold mb-1">No categories found</h3>
            <p className="text-sm text-gray-400 mb-4">
              {search ? 'Try a different search term.' : 'Create your first category to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat, idx) => (
                  <tr key={cat.id}>
                    <td className="text-gray-400 font-mono text-xs">{idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <Tag className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-medium text-gray-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="text-gray-500 max-w-xs truncate">
                      {cat.description || <span className="text-gray-300 italic">No description</span>}
                    </td>
                    <td><StatusBadge isActive={cat.is_active} /></td>
                    <td className="text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(cat.created_at)}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="btn-icon text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                          title="Edit category"
                          id={`edit-category-${cat.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, category: cat })}
                          className="btn-icon text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete category"
                          id={`delete-category-${cat.id}`}
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
        onClose={() => setDeleteModal({ open: false, category: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.category?.name}
      />

      {/* ── Edit Modal ── */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, category: null })}
        title={`Edit Category: ${editModal.category?.name}`}
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditModal({ open: false, category: null })} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" isLoading={isSubmitting} form="edit-category-form" type="submit">
              <Save className="w-4 h-4 mr-1" /> Save Changes
            </Button>
          </div>
        }
      >
        <form id="edit-category-form" onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Necklaces"
            error={errors.name?.message}
            required
            {...register('name')}
            id="edit-category-name"
          />
          <div className="form-group">
            <label htmlFor="edit-category-desc" className="form-label">Description</label>
            <textarea
              id="edit-category-desc"
              rows={3}
              placeholder="Brief description..."
              className="form-textarea"
              {...register('description')}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="edit-category-active"
              className="w-4 h-4 accent-[#07393b] cursor-pointer rounded"
              {...register('is_active')}
            />
            <label htmlFor="edit-category-active" className="form-label cursor-pointer mb-0">
              Active
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};
