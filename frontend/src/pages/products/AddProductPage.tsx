import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { PRODUCT_TYPES } from '../../types';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import { manufacturersApi } from '../../api/manufacturers.api';
import type { Category, Manufacturer } from '../../types';

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(true);

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

  // ── Load categories & manufacturers for dropdowns ──
  useEffect(() => {
    Promise.all([categoriesApi.getAll(), manufacturersApi.getAll()])
      .then(([cats, mfrs]) => {
        setCategories(cats.filter((c) => c.is_active));
        setManufacturers(mfrs.filter((m) => m.is_active));
      })
      .catch(() => toast.error('Failed to load form options'))
      .finally(() => setDropdownsLoading(false));
  }, []);

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('product_code', data.product_code);
      formData.append('type', data.type);
      formData.append('category_id', String(data.category_id));
      formData.append('manufacturer_id', String(data.manufacturer_id));
      formData.append('price', String(data.price));
      if (data.description) formData.append('description', data.description);
      if (imageFile) formData.append('image', imageFile);

      await productsApi.create(formData);
      toast.success('Product created successfully');
      navigate('/products');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error || 'Failed to create product');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
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

      {dropdownsLoading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm">Loading form…</span>
        </div>
      ) : (
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
                        options={categories.map((c) => ({ value: c.id, label: c.name }))}
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
                        options={manufacturers.map((m) => ({ value: m.id, label: m.name }))}
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
      )}
    </div>
  );
};
