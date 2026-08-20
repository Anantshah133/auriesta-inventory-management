import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { PRODUCT_TYPES } from '../../types';
import { mockProducts, mockCategories, mockManufacturers } from '../../data/mockData';

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

export const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find mock product by id
  const product = mockProducts.find((p) => p.id === Number(id));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          product_code: product.product_code,
          type: product.type,
          category_id: product.category_id,
          manufacturer_id: product.manufacturer_id,
          price: Number(product.price),
          description: product.description ?? '',
        }
      : {},
  });

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    console.log('Updated product data:', data);
    console.log('New image file:', imageFile);
    setIsSubmitting(false);
    navigate('/products');
  };

  if (!product) {
    return (
      <div className="page-container">
        <div className="card-padded flex flex-col items-center gap-4 py-12">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <h2 className="text-lg font-semibold text-gray-800">Product Not Found</h2>
          <p className="text-gray-500 text-sm">The product with ID #{id} could not be found.</p>
          <Button variant="outline" onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-3xl">
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
          <h1 className="page-title">Edit Product</h1>
          <p className="page-subtitle">
            Editing:{' '}
            <span className="font-semibold text-gray-700">{product.name}</span>
          </p>
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
                    id="edit-product-name"
                  />
                </div>
                <Input
                  label="Product Code"
                  placeholder="e.g. AUR-SP-001"
                  error={errors.product_code?.message}
                  required
                  {...register('product_code')}
                  id="edit-product-code"
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
                  id="edit-product-price"
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
                      id="edit-product-type"
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
                      options={mockCategories.map((c) => ({ value: c.id, label: c.name }))}
                      error={errors.category_id?.message}
                      required
                      id="edit-product-category"
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
                      options={mockManufacturers.map((m) => ({ value: m.id, label: m.name }))}
                      error={errors.manufacturer_id?.message}
                      required
                      id="edit-product-manufacturer"
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
                <label htmlFor="edit-product-description" className="form-label">
                  Product Description
                </label>
                <textarea
                  id="edit-product-description"
                  rows={4}
                  placeholder="Describe the product..."
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
                previewUrl={product.image_url}
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
                  id="update-product-btn"
                >
                  {isSubmitting ? 'Updating…' : 'Update Product'}
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
