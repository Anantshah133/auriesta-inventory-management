import apiClient from './apiClient';
import type { Product, ProductsResponse, ProductType } from '../types';

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number | '';
  manufacturerId?: number | '';
  type?: ProductType | '';
}

export const productsApi = {
  getAll: async (params: ProductsQueryParams = {}): Promise<ProductsResponse> => {
    const query: Record<string, any> = {};
    if (params.page) query.page = params.page;
    if (params.limit) query.limit = params.limit;
    if (params.search) query.search = params.search;
    if (params.categoryId) query.categoryId = params.categoryId;
    if (params.manufacturerId) query.manufacturerId = params.manufacturerId;
    // type filter is client-side since backend doesn't support it as a query param
    const res = await apiClient.get('/products', { params: query });
    return res.data;
  },

  getById: async (id: number): Promise<Product> => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },

  create: async (data: FormData): Promise<Product> => {
    const res = await apiClient.post('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  update: async (id: number, data: FormData): Promise<Product> => {
    const res = await apiClient.patch(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  /** Fetch all products (no pagination) to compute dashboard stats */
  getDashboardStats: async () => {
    const res = await apiClient.get<ProductsResponse>('/products', {
      params: { page: 1, limit: 1000 },
    });
    const products = res.data.data;
    const meta = res.data.meta;
    return {
      totalProducts: meta.total,
      silverPlated: products.filter((p) => p.type === 'Silver Plated').length,
      germanSilver: products.filter((p) => p.type === 'German Silver').length,
      goldPlated: products.filter((p) => p.type === 'Gold Plated').length,
      brass: products.filter((p) => p.type === 'Brass').length,
      stainlessSteel: products.filter((p) => p.type === 'Stainless Steel').length,
      recentProducts: products.slice(0, 5),
    };
  },
};
