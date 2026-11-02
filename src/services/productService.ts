import apiClient from './api';

export interface ProductImage {
  url: string;
  publicId?: string;
  isPrimary?: boolean;
}

export interface ProductFulfillment {
  pickup?: boolean;
  localDelivery?: boolean;
  shipping?: boolean;
  deliveryFee?: number;
}

export interface Product {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  sku: string;
  seller: string | { _id: string; name?: string; businessName?: string };
  sellerName?: string;
  category: string | { _id: string; name: string };
  categoryName?: string;
  subcategory?: string;
  price: number;
  compareAtPrice?: number | null;
  costPerItem?: number | null;
  stock: number;
  lowStockThreshold?: number;
  images: ProductImage[];
  status: 'active' | 'in_review' | 'draft' | 'out_of_stock' | 'archived';
  fulfillment?: ProductFulfillment;
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  categoryId: string;
  subcategory?: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  lowStockThreshold?: number;
  images?: ProductImage[];
  fulfillment?: ProductFulfillment;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  categoryId?: string;
  subcategory?: string;
  price?: number;
  compareAtPrice?: number | null;
  stock?: number;
  lowStockThreshold?: number;
  images?: ProductImage[];
  status?: 'active' | 'in_review' | 'draft' | 'out_of_stock' | 'archived';
  fulfillment?: ProductFulfillment;
}

export interface SellerProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: 'all' | 'active' | 'out_of_stock';
}

export interface SellerProductStats {
  total: number;
  totalUnits: number;
  inStock: number;
  lowStock: number;
}

export const productService = {
  /**
   * Get products owned by the authenticated seller
   */
  getMyProducts: async (
    params: SellerProductQuery = {}
  ): Promise<{ products: Product[]; pagination: any; stats?: SellerProductStats }> => {
    try {
      const queryParts: string[] = [];
      if (params.page) queryParts.push(`page=${params.page}`);
      if (params.limit) queryParts.push(`limit=${params.limit}`);
      if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
      if (params.category) queryParts.push(`category=${params.category}`);
      if (params.status && params.status !== 'all') queryParts.push(`status=${params.status}`);

      const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
      const res: any = await apiClient.get(`/products/seller/my-products${qs}`);

      const list = res?.data || (Array.isArray(res) ? res : []);
      const pagination = res?.pagination || {
        total: list.length,
        page: params.page || 1,
        limit: params.limit || 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      };

      const stats: SellerProductStats = res?.stats || {
        total: pagination.total || list.length,
        totalUnits: list.reduce((acc: number, p: any) => acc + (p.stock || 0), 0),
        inStock: list.filter((p: any) => (p.stock || 0) > 0).length,
        lowStock: list.filter((p: any) => (p.stock || 0) <= (p.lowStockThreshold || 5)).length
      };

      return { products: list, pagination, stats };
    } catch (err: any) {
      console.error('Failed to fetch seller products:', err);
      throw err;
    }
  },

  /**
   * Get server-level aggregated inventory statistics for authenticated seller
   */
  getSellerStats: async (): Promise<SellerProductStats> => {
    try {
      const res: any = await apiClient.get('/products/seller/stats');
      return res?.data || { total: 0, totalUnits: 0, inStock: 0, lowStock: 0 };
    } catch {
      return { total: 0, totalUnits: 0, inStock: 0, lowStock: 0 };
    }
  },

  /**
   * Create a new product SKU
   */
  createProduct: async (input: CreateProductInput): Promise<Product> => {
    const payload = {
      name: input.name.trim(),
      description: input.description?.trim() || '',
      categoryId: input.categoryId,
      subcategory: input.subcategory?.trim() || '',
      price: Number(input.price),
      ...(input.compareAtPrice !== undefined && { compareAtPrice: input.compareAtPrice }),
      stock: Number(input.stock) || 0,
      lowStockThreshold: input.lowStockThreshold ?? 5,
      images: input.images || [],
      fulfillment: input.fulfillment || {
        pickup: true,
        localDelivery: false,
        shipping: false,
        deliveryFee: 0
      }
    };

    const res: any = await apiClient.post('/products', payload);
    return res?.data || res;
  },

  /**
   * Update an existing product
   */
  updateProduct: async (id: string, input: UpdateProductInput): Promise<Product> => {
    const res: any = await apiClient.put(`/products/${id}`, input);
    return res?.data || res;
  },

  /**
   * Quick update product stock (absolute stock or delta)
   */
  updateStock: async (id: string, stockOrDelta: { stock?: number; delta?: number }): Promise<Product> => {
    const res: any = await apiClient.patch(`/products/${id}/stock`, stockOrDelta);
    return res?.data || res;
  },

  /**
   * Upload a product image to Cloudinary via backend
   */
  uploadProductImage: async (fileUri: string): Promise<{ url: string; publicId?: string }> => {
    try {
      const formData = new FormData();
      const filename = fileUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: fileUri,
        name: filename,
        type,
      } as any);

      const res: any = await apiClient.post('/products/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return res?.data || res;
    } catch (err: any) {
      console.warn('Image upload fallback to uri:', err?.message);
      return { url: fileUri };
    }
  },

  /**
   * Delete a product listing
   */
  deleteProduct: async (id: string): Promise<boolean> => {
    await apiClient.delete(`/products/${id}`);
    return true;
  }
};

export default productService;
