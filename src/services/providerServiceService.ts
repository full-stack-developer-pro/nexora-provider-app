import apiClient from './api';

export interface ServiceImage {
  url: string;
  publicId?: string;
  isPrimary?: boolean;
}

export interface ServiceLocation {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  coordinates?: {
    lat: number | null;
    lng: number | null;
  };
  serviceRadiusMiles?: number;
  serviceRadiusKm?: number;
}

export interface ServicePackage {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  duration?: number;
  features?: string[];
}

export interface ServiceOffering {
  _id: string;
  id?: string;
  title: string;
  slug?: string;
  description?: string;
  category: string | { _id: string; name: string; iconName?: string; iconColor?: string };
  subcategory?: string;
  pricingType: 'fixed' | 'hourly' | 'custom_quote';
  price: number;
  duration: number; // in minutes
  images: ServiceImage[];
  serviceLocation?: ServiceLocation;
  packages?: ServicePackage[];
  status: 'active' | 'in_review' | 'inactive' | 'archived';
  bookingsCount?: number;
  ratings?: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceInput {
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  pricingType: 'fixed' | 'hourly' | 'custom_quote';
  price: number;
  duration?: number;
  images?: ServiceImage[];
  serviceLocation?: ServiceLocation;
  packages?: ServicePackage[];
}

export interface ProviderServiceStats {
  total: number;
  active: number;
  inReview: number;
  inactive: number;
}

export const providerServiceService = {
  /**
   * Get all services belonging to the authenticated provider
   */
  getMyServices: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
  } = {}): Promise<{ data: ServiceOffering[]; total: number; stats: ProviderServiceStats }> => {
    try {
      const res: any = await apiClient.get('/services/provider/my-services', { params });
      return {
        data: res?.data || [],
        total: res?.pagination?.total || (res?.data?.length ?? 0),
        stats: res?.stats || { total: 0, active: 0, inReview: 0, inactive: 0 }
      };
    } catch (err: any) {
      const isRouteMissing =
        err?.message?.includes('Cannot find route') ||
        err?.response?.status === 404;

      if (isRouteMissing) {
        console.warn('Backend services route deploying on server, returning empty state gracefully.');
        return {
          data: [],
          total: 0,
          stats: { total: 0, active: 0, inReview: 0, inactive: 0 }
        };
      }
      console.warn('Failed to fetch provider services:', err?.message || err);
      return {
        data: [],
        total: 0,
        stats: { total: 0, active: 0, inReview: 0, inactive: 0 }
      };
    }
  },

  /**
   * Create a new service offering
   */
  createService: async (input: CreateServiceInput): Promise<ServiceOffering> => {
    const payload = {
      title: input.title.trim(),
      description: input.description?.trim() || '',
      category: input.category,
      subcategory: input.subcategory?.trim() || '',
      pricingType: input.pricingType || 'fixed',
      price: Number(input.price),
      duration: Number(input.duration) || 60,
      images: input.images || [],
      serviceLocation: input.serviceLocation || {},
      packages: input.packages || [],
      status: 'active'
    };

    const res: any = await apiClient.post('/services', payload);
    return res?.data || res;
  },

  /**
   * Update an existing service offering
   */
  updateService: async (id: string, input: Partial<CreateServiceInput>): Promise<ServiceOffering> => {
    const res: any = await apiClient.put(`/services/${id}`, input);
    return res?.data || res;
  },

  /**
   * Delete a service listing
   */
  deleteService: async (id: string): Promise<boolean> => {
    await apiClient.delete(`/services/${id}`);
    return true;
  },

  /**
   * Upload service photo to Cloudinary
   */
  uploadServiceImage: async (fileUri: string): Promise<{ url: string; publicId?: string }> => {
    try {
      const formData = new FormData();
      const filename = fileUri.split('/').pop() || 'service.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: fileUri,
        name: filename,
        type,
      } as any);

      const res: any = await apiClient.post('/services/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return res?.data || res;
    } catch (err: any) {
      console.warn('Image upload fallback to fileUri:', err?.message);
      return { url: fileUri };
    }
  }
};

export default providerServiceService;

