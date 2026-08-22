import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react';
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
import type { Product, Category, Manufacturer } from '../../types';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  product_code: z.string().min(1, 'Product code is required'),
  type: z.enum(['Silver Plated', 'German Silver', 'Gold Plated', 'Brass', 'Stainless Steel'], {
    invalid_type_error: 'Please select a product type',
    required_error: 'Please select a product type',
    message: 'Please select a product type',
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

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  // ── Fetch product + dropdowns in parallel ──
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prod, cats, mfrs] = await Promise.all([
          productsApi.getById(Number(id)),
          categoriesApi.getAll(),
          manufacturersApi.getAll(),
        ]);
        setProduct(prod);
        setCategories(cats);
        setManufacturers(mfrs);
        reset({
          name: prod.name,
          product_code: prod.product_code,
          type: prod.type,
          category_id: prod.category_id,
          manufacturer_id: prod.manufacturer_id,
          price: Number(prod.price),
          description: prod.description ?? '',
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error('Failed to load product');
          navigate('/products');
        }
      } finally {
        setPageLoading(false);
      }
    };
    loadData();
  }, [id, navigate, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    if (!product) return;
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

      await productsApi.update(product.id, formData);
      toast.success('Product updated successfully');
      navigate('/products');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error || 'Failed to update product');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm">Loading product…</span>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
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
                      options={categories.map((c) => ({ value: c.id, label: c.name }))}
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
                      options={manufacturers.map((m) => ({ value: m.id, label: m.name }))}
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
