import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name must be under 100 characters'),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  is_active: z.boolean().optional().default(true),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export const AddCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { is_active: true },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    console.log('New category:', data);
    setIsSubmitting(false);
    navigate('/categories');
  };

  return (
    <div className="page-container max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/categories')}
          className="btn btn-ghost btn-icon text-gray-500"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">Add Category</h1>
          <p className="page-subtitle">Create a new product category</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card-padded space-y-5">
          <Input
            label="Category Name"
            placeholder="e.g. Necklaces"
            error={errors.name?.message}
            required
            {...register('name')}
            id="add-category-name"
          />

          <div className="form-group">
            <label htmlFor="add-category-desc" className="form-label">
              Description
            </label>
            <textarea
              id="add-category-desc"
              rows={4}
              placeholder="Describe what types of products belong in this category..."
              className={`form-textarea ${errors.description ? 'form-input-error' : ''}`}
              {...register('description')}
            />
            {errors.description && (
              <p className="form-error">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              id="add-category-active"
              className="w-4 h-4 accent-[#07393b] cursor-pointer rounded"
              {...register('is_active')}
            />
            <div>
              <label htmlFor="add-category-active" className="form-label cursor-pointer mb-0">
                Mark as Active
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                Active categories appear in product forms
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
              id="save-category-btn"
            >
              {isSubmitting ? 'Saving…' : 'Save Category'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/categories')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
