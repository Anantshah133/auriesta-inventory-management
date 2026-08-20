// TypeScript interfaces matching Prisma schema

export interface Category {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Manufacturer {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

export type ProductType =
  | 'Silver Plated'
  | 'German Silver'
  | 'Gold Plated'
  | 'Brass'
  | 'Stainless Steel';

export interface Product {
  id: number;
  name: string;
  product_code: string;
  type: ProductType;
  category_id: number;
  price: string | number;
  image_url: string | null;
  image_public_id: string | null;
  description: string | null;
  manufacturer_id: number;
  created_at: string;
  updated_at: string;
  category: Category;
  manufacturer: Manufacturer;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductsResponse {
  data: Product[];
  meta: PaginationMeta;
}

export const PRODUCT_TYPES: ProductType[] = [
  'Silver Plated',
  'German Silver',
  'Gold Plated',
  'Brass',
  'Stainless Steel',
];
