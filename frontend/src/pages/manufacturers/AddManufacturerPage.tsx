import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const manufacturerSchema = z.object({
  name: z.string().min(1, 'Manufacturer name is required').max(200, 'Name must be under 200 characters'),
  is_active: z.boolean().optional().default(true),
});

type ManufacturerFormValues = z.infer<typeof manufacturerSchema>;

export const AddManufacturerPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManufacturerFormValues>({
    resolver: zodResolver(manufacturerSchema),
    defaultValues: { is_active: true },
  });

  const onSubmit = async (data: ManufacturerFormValues) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    console.log('New manufacturer:', data);
    setIsSubmitting(false);
    navigate('/manufacturers');
  };

  return (
    <div className="page-container max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/manufacturers')}
          className="btn btn-ghost btn-icon text-gray-500"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">Add Manufacturer</h1>
          <p className="page-subtitle">Register a new product manufacturer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card-padded space-y-5">
          <Input
            label="Manufacturer Name"
            placeholder="e.g. Rajasthan Craft Works"
            error={errors.name?.message}
            required
            {...register('name')}
            id="add-manufacturer-name"
            helperText="Enter the full business or trade name"
          />

          <div className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              id="add-manufacturer-active"
              className="w-4 h-4 accent-[#07393b] cursor-pointer rounded"
              {...register('is_active')}
            />
            <div>
              <label htmlFor="add-manufacturer-active" className="form-label cursor-pointer mb-0">
                Mark as Active
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                Active manufacturers appear in product creation forms
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
              id="save-manufacturer-btn"
            >
              {isSubmitting ? 'Saving…' : 'Save Manufacturer'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/manufacturers')}
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
