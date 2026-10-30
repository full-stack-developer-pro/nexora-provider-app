import apiClient from './api';

export interface ServiceCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  iconName?: string;
  iconColor?: string;
  status: 'active' | 'inactive';
  subcategories: Array<{
    id?: string;
    _id?: string;
    name: string;
    slug: string;
    status: string;
  }>;
}

export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  iconName?: string;
  iconColor?: string;
  commissionRate?: number;
  status: 'active' | 'inactive';
  subcategories?: Array<{
    id?: string;
    _id?: string;
    name: string;
    slug: string;
    status: string;
  }>;
}

export const categoryService = {
  getServiceCategories: async (): Promise<ServiceCategory[]> => {
    try {
      const res: any = await apiClient.get('/admin/service-categories?status=active&limit=100');
      const list = res?.data || res;
      if (Array.isArray(list)) {
        return list;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch service categories from backend:', err);
      return [];
    }
  },

  getProductCategories: async (): Promise<ProductCategory[]> => {
    try {
      const res: any = await apiClient.get('/admin/product-categories?status=active&limit=100');
      const list = res?.data || res;
      if (Array.isArray(list)) {
        return list;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch product categories from backend:', err);
      return [];
    }
  }
};

export default categoryService;
