import apiClient from './apiClient';
import type { Category } from '../types';

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await apiClient.get('/categories');
    return res.data;
  },

  create: async (data: { name: string; description?: string; is_active?: boolean }): Promise<Category> => {
    const res = await apiClient.post('/categories', data);
    return res.data;
  },

  update: async (
    id: number,
    data: { name?: string; description?: string; is_active?: boolean }
  ): Promise<Category> => {
    const res = await apiClient.patch(`/categories/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
