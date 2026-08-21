import apiClient from './apiClient';
import type { Manufacturer } from '../types';

export const manufacturersApi = {
  getAll: async (): Promise<Manufacturer[]> => {
    const res = await apiClient.get('/manufacturers');
    return res.data;
  },

  create: async (data: { name: string; is_active?: boolean }): Promise<Manufacturer> => {
    const res = await apiClient.post('/manufacturers', data);
    return res.data;
  },

  update: async (
    id: number,
    data: { name?: string; is_active?: boolean }
  ): Promise<Manufacturer> => {
    const res = await apiClient.patch(`/manufacturers/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/manufacturers/${id}`);
  },
};
