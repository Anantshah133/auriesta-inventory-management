import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { PRODUCT_TYPES } from '../../types';
import { mockCategories, mockManufacturers } from '../../data/mockData';

// Validation schema (mirrors backend)
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  product_code: z.string().min(1, 'Product code is required'),
  type: z.enum(['Silver Plated', 'German Silver', 'Gold Plated', 'Brass', 'Stainless Steel'], {
    errorMap: () => ({ message: 'Please select a product type' }),
  }),
  category_id: z.coerce.number().int().positive('Please select a category'),
  manufacturer_id: z.coerce.number().int().positive('Please select a manufacturer'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      type: undefined,
      category_id: undefined,
      manufacturer_id: undefined,
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    // Simulate API call — will wire up later
    await new Promise((r) => setTimeout(r, 800));
    console.log('Product data:', data);
    console.log('Image file:', imageFile);
    setIsSubmitting(false);
    navigate('/products');
  };

  return (
    <div className="page-container max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/products')}
          className="btn btn-ghost btn-icon text-gray-500"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">Add Product</h1>
          <p className="page-subtitle">Fill in the details to add a new product</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column: Main Details ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic Info */}
            <div className="card-padded">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Product Name"
                    placeholder="e.g. Classic Silver Necklace Set"
                    error={errors.name?.message}
                    required
                    {...register('name')}
                    id="product-name"
                  />
                </div>
                <Input
                  label="Product Code"
                  placeholder="e.g. AUR-SP-001"
                  error={errors.product_code?.message}
                  required
                  {...register('product_code')}
                  id="product-code"
                  helperText="Must be unique across all products"
                />
                <Input
                  label="Price (₹)"
                  type="number"
                  placeholder="e.g. 1250"
                  error={errors.price?.message}
                  required
                  min={0}
                  step="0.01"
                  {...register('price')}
                  id="product-price"
                />
              </div>
            </div>

            {/* Classification */}
            <div className="card-padded">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Classification
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Product Type"
                      placeholder="Select type"
                      options={PRODUCT_TYPES.map((t) => ({ value: t, label: t }))}
                      error={errors.type?.message}
                      required
                      id="product-type"
                      {...field}
                    />
                  )}
                />
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Category"
                      placeholder="Select category"
                      options={mockCategories.filter(c => c.is_active).map((c) => ({ value: c.id, label: c.name }))}
                      error={errors.category_id?.message}
                      required
                      id="product-category"
                      {...field}
                    />
                  )}
                />
                <Controller
                  name="manufacturer_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Manufacturer"
                      placeholder="Select manufacturer"
                      options={mockManufacturers.filter(m => m.is_active).map((m) => ({ value: m.id, label: m.name }))}
                      error={errors.manufacturer_id?.message}
                      required
                      id="product-manufacturer"
                      {...field}
                    />
                  )}
                />
              </div>
            </div>

            {/* Description */}
            <div className="card-padded">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Description
              </h2>
              <div className="form-group">
                <label htmlFor="product-description" className="form-label">
                  Product Description
                </label>
                <textarea
                  id="product-description"
                  rows={4}
                  placeholder="Describe the product — material, design, usage, etc."
                  className="form-textarea"
                  {...register('description')}
                />
              </div>
            </div>
          </div>

          {/* ── Right Column: Image + Actions ── */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="card-padded">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Product Image
              </h2>
              <ImageUpload
                label=""
                value={imageFile}
                onChange={setImageFile}
              />
            </div>

            {/* Actions */}
            <div className="card-padded">
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full"
                  leftIcon={<Save className="w-4 h-4" />}
                  id="save-product-btn"
                >
                  {isSubmitting ? 'Saving…' : 'Save Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/products')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
