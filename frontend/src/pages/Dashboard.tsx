import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Tag,
  Factory,
  Plus,
  Gem,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { TypeBadge } from '../components/ui/Badge';
import { productsApi } from '../api/products.api';
import { categoriesApi } from '../api/categories.api';
import { manufacturersApi } from '../api/manufacturers.api';
import type { Product } from '../types';

interface DashboardStats {
  totalProducts: number;
  silverPlated: number;
  germanSilver: number;
  goldPlated: number;
  brass: number;
  stainlessSteel: number;
  totalCategories: number;
  totalManufacturers: number;
  recentProducts: Product[];
}

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(price));

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [productStats, cats, mfrs] = await Promise.all([
          productsApi.getDashboardStats(),
          categoriesApi.getAll(),
          manufacturersApi.getAll(),
        ]);
        setStats({
          totalProducts: productStats.totalProducts,
          silverPlated: productStats.silverPlated,
          germanSilver: productStats.germanSilver,
          goldPlated: productStats.goldPlated,
          brass: productStats.brass,
          stainlessSteel: productStats.stainlessSteel,
          totalCategories: cats.length,
          totalManufacturers: mfrs.length,
          recentProducts: productStats.recentProducts,
        });
      } catch {
        // Silently fail — dashboard is non-critical
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  return (
    <div className="page-container">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl mb-6 p-6"
        style={{ background: 'linear-gradient(135deg, #07393b 0%, #0a5457 60%, #0e7077 100%)' }}>
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">Good morning 👋</p>
          <h1 className="text-white text-2xl font-bold mb-1">Welcome back, Admin</h1>
          <p className="text-white/60 text-sm">
            Here's an overview of your inventory today.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-12 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute right-32 -bottom-4 w-20 h-20 rounded-full bg-white/8" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm">Loading dashboard…</span>
        </div>
      ) : (
        <>
          {/* ── Stats Grid ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Products"
              value={stats?.totalProducts ?? 0}
              icon={<Package className="w-6 h-6" />}
              iconBgColor="#f0fafa"
              iconColor="#07393b"
              trend={{ value: 12, label: 'this month' }}
            />
            <StatCard
              label="Silver Plated"
              value={stats?.silverPlated ?? 0}
              icon={<Gem className="w-6 h-6" />}
              iconBgColor="#f1f5f9"
              iconColor="#475569"
            />
            <StatCard
              label="German Silver"
              value={stats?.germanSilver ?? 0}
              icon={<Gem className="w-6 h-6" />}
              iconBgColor="#eff6ff"
              iconColor="#3b82f6"
            />
            <StatCard
              label="Gold Plated"
              value={stats?.goldPlated ?? 0}
              icon={<Gem className="w-6 h-6" />}
              iconBgColor="#fffbeb"
              iconColor="#d97706"
            />
            <StatCard
              label="Brass"
              value={stats?.brass ?? 0}
              icon={<Gem className="w-6 h-6" />}
              iconBgColor="#fff7ed"
              iconColor="#ea580c"
            />
            <StatCard
              label="Stainless Steel"
              value={stats?.stainlessSteel ?? 0}
              icon={<Gem className="w-6 h-6" />}
              iconBgColor="#faf5ff"
              iconColor="#9333ea"
            />
            <StatCard
              label="Categories"
              value={stats?.totalCategories ?? 0}
              icon={<Tag className="w-6 h-6" />}
              iconBgColor="#ecfdf5"
              iconColor="#10b981"
              trend={{ value: 3, label: 'new' }}
            />
            <StatCard
              label="Manufacturers"
              value={stats?.totalManufacturers ?? 0}
              icon={<Factory className="w-6 h-6" />}
              iconBgColor="#fdf2f8"
              iconColor="#a21caf"
            />
          </div>

          {/* ── Quick Actions + Recent Products ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Quick Actions */}
            <div className="card-padded">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => navigate('/products/add')}
                >
                  Add New Product
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => navigate('/categories/add')}
                >
                  Add Category
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => navigate('/manufacturers/add')}
                >
                  Add Manufacturer
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600"
                  leftIcon={<Package className="w-4 h-4" />}
                  onClick={() => navigate('/products')}
                >
                  View All Products
                </Button>
              </div>
            </div>

            {/* Recent Products */}
            <div className="card xl:col-span-2">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Recent Products</h3>
                <button
                  onClick={() => navigate('/products')}
                  className="text-sm text-[#07393b] font-medium hover:underline"
                >
                  View All
                </button>
              </div>
              {!stats?.recentProducts?.length ? (
                <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
                  <Package className="w-8 h-8 text-gray-200" />
                  <p className="text-sm">No products yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Added</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentProducts.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate max-w-[160px]">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {product.category.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">
                              {product.product_code}
                            </code>
                          </td>
                          <td><TypeBadge type={product.type} /></td>
                          <td className="font-semibold text-gray-900">
                            {formatPrice(product.price)}
                          </td>
                          <td className="text-gray-400 text-xs">{formatDate(product.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
