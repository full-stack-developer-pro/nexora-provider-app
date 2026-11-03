import apiClient from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SystemSettings {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  defaultCurrency: string;
  timezone: string;
  maintenanceMode: boolean;
  maintenanceNotice: string;
  serviceCommissionRate: number;
  productCommissionRate: number;
  minPayoutAmount: number;
  instantPayoutFeePercent: number;
  escrowHoldDays: number;
  onboardingMode: string;
  maxConcurrentJobs: number;
  defaultDispatchRadiusMiles: number;
  lowStockThreshold: number;
  autoArchiveOutOfStock: boolean;
  returnWindowDays: number;
  allowMerchantSelfFulfillment: boolean;
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  platformName: 'Nexora Marketplace',
  supportEmail: 'support@nexora.io',
  supportPhone: '+1 (555) 890-4421',
  defaultCurrency: 'USD',
  timezone: 'America/Chicago',
  maintenanceMode: false,
  maintenanceNotice:
    'Nexora is currently undergoing scheduled platform upgrades. We will be back online shortly.',
  serviceCommissionRate: 10,
  productCommissionRate: 8,
  minPayoutAmount: 50,
  instantPayoutFeePercent: 1.5,
  escrowHoldDays: 3,
  onboardingMode: 'manual_approval',
  maxConcurrentJobs: 3,
  defaultDispatchRadiusMiles: 25,
  lowStockThreshold: 5,
  autoArchiveOutOfStock: false,
  returnWindowDays: 14,
  allowMerchantSelfFulfillment: true,
};

const SETTINGS_STORAGE_KEY = 'nexora_platform_public_settings';

export const systemSettingsService = {
  /**
   * Fetch latest system settings with local storage fallback
   */
  async getPublicSettings(): Promise<SystemSettings> {
    try {
      const response: any = await apiClient.get('/settings/public');
      const data = response?.data || response;
      if (data && typeof data === 'object') {
        const merged: SystemSettings = {
          ...DEFAULT_SYSTEM_SETTINGS,
          ...data,
        };
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err: any) {
      console.warn('Could not fetch remote system settings, falling back to cache:', err?.message);
    }

    try {
      const cached = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (cached) {
        return { ...DEFAULT_SYSTEM_SETTINGS, ...JSON.parse(cached) };
      }
    } catch {
      // Ignore cache parse error
    }

    return DEFAULT_SYSTEM_SETTINGS;
  },
};

export default systemSettingsService;

