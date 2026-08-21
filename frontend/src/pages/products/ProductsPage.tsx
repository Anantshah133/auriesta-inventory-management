import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Package,
  Eye,
  Pencil,
  Trash2,
  Filter,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Modal } from '../../components/ui/Modal';
import { TypeBadge } from '../../components/ui/Badge';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import type { Product, ProductType, Category } from '../../types';
import { PRODUCT_TYPES } from '../../types';

const LIMIT = 10;

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(price));

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ProductType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  });
  const [viewModal, setViewModal] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  });

  // ── Fetch categories for the filter dropdown ──
  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => {});
  }, []);

  // ── Fetch products from API ──
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.getAll({
        page: currentPage,
        limit: LIMIT,
        search: search || undefined,
        categoryId: categoryFilter || undefined,
      });
      // Apply type filter client-side (backend doesn't support it as a query param)
      const filtered = typeFilter
        ? res.data.filter((p) => p.type === typeFilter)
        : res.data;
      setProducts(filtered);
      setTotal(typeFilter ? filtered.length : res.meta.total);
      setTotalPages(typeFilter ? Math.ceil(filtered.length / LIMIT) : res.meta.totalPages);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, typeFilter, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };
  const handleTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value as ProductType | '');
    setCurrentPage(1);
  };
  const handleCategoryFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value ? Number(e.target.value) : '');
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    try {
      await productsApi.delete(deleteModal.product.id);
      toast.success('Product deleted');
      setDeleteModal({ open: false, product: null });
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
      setDeleteModal({ open: false, product: null });
    }
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setCategoryFilter('');
    setCurrentPage(1);
  };

  const hasFilters = search || typeFilter || categoryFilter;

  return (
    <div className="page-container">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{total} product{total !== 1 ? 's' : ''} found</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/products/add')}
          id="add-product-btn"
        >
          Add Product
        </Button>
      </div>

      {/* ── Search & Filters ── */}
      <div className="card-padded mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or product code..."
            className="flex-1"
            id="products-search"
          />
          <div className="flex gap-3 flex-shrink-0">
            {/* Type filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={typeFilter}
                onChange={handleTypeFilter}
                className="form-select pl-9 w-44"
                id="type-filter"
              >
                <option value="">All Types</option>
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={handleCategoryFilter}
              className="form-select w-44"
              id="category-filter"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Active filters:</span>
            {search && (
              <span className="badge badge-active">Search: "{search}"</span>
            )}
            {typeFilter && (
              <span className="badge badge-active">Type: {typeFilter}</span>
            )}
            {categoryFilter && (
              <span className="badge badge-active">
                Category: {categories.find((c) => c.id === categoryFilter)?.name}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Products Table ── */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Loading products…</span>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-gray-700 font-semibold mb-1">No products found</h3>
            <p className="text-sm text-gray-400 mb-4">
              {hasFilters
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding your first product.'}
            </p>
            {!hasFilters && (
              <Button
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/products/add')}
              >
                Add Product
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Manufacturer</th>
                    <th>Price</th>
                    <th>Added</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-[180px]">
                              {product.name}
                            </p>
                            {product.description && (
                              <p className="text-xs text-gray-400 truncate max-w-[180px]">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-700">
                          {product.product_code}
                        </code>
                      </td>
                      <td><TypeBadge type={product.type} /></td>
                      <td className="text-gray-600">{product.category.name}</td>
                      <td className="text-gray-600 max-w-[120px] truncate">
                        {product.manufacturer.name}
                      </td>
                      <td className="font-semibold text-gray-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(product.created_at)}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <button
                            onClick={() => setViewModal({ open: true, product })}
                            className="btn-icon text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                            title="View product"
                            id={`view-product-${product.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => navigate(`/products/${product.id}/edit`)}
                            className="btn-icon text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                            title="Edit product"
                            id={`edit-product-${product.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteModal({ open: true, product })}
                            className="btn-icon text-gray-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete product"
                            id={`delete-product-${product.id}`}
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

            {/* Pagination */}
            <div className="px-4 border-t border-gray-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
                limit={LIMIT}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, product: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.product?.name}
      />

      {/* ── Product View Modal ── */}
      {viewModal.product && (
        <Modal
          isOpen={viewModal.open}
          onClose={() => setViewModal({ open: false, product: null })}
          title="Product Details"
          size="lg"
          footer={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewModal({ open: false, product: null })}
              >
                Close
              </Button>
              <Button
                size="sm"
                leftIcon={<Pencil className="w-3.5 h-3.5" />}
                onClick={() => {
                  navigate(`/products/${viewModal.product!.id}/edit`);
                  setViewModal({ open: false, product: null });
                }}
              >
                Edit Product
              </Button>
            </div>
          }
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image */}
            <div className="w-full md:w-48 h-48 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {viewModal.product.image_url ? (
                <img
                  src={viewModal.product.image_url}
                  alt={viewModal.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Package className="w-10 h-10 text-gray-300" />
                  <span className="text-xs text-gray-400">No image</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewModal.product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-600">
                    {viewModal.product.product_code}
                  </code>
                  <TypeBadge type={viewModal.product.type} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Category</p>
                  <p className="text-sm font-semibold text-gray-800">{viewModal.product.category.name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Manufacturer</p>
                  <p className="text-sm font-semibold text-gray-800">{viewModal.product.manufacturer.name}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-0.5">Price</p>
                  <p className="text-lg font-bold text-emerald-700">{formatPrice(viewModal.product.price)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Added</p>
                  <p className="text-sm font-semibold text-gray-800">{formatDate(viewModal.product.created_at)}</p>
                </div>
              </div>

              {viewModal.product.description && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{viewModal.product.description}</p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
