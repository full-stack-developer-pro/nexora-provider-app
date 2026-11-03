import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import providerAuthService, { ProviderProfile } from '../services/providerAuthService';

interface AuthContextType {
  provider: ProviderProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnline: boolean;
  status: 'unauthenticated' | 'pending_approval' | 'approved' | 'rejected' | 'suspended';
  login: (email: string, password: string) => Promise<ProviderProfile>;
  register: (payload: any) => Promise<ProviderProfile>;
  uploadKYC: (docs: Array<{ type: string; fileName: string; fileUri: string }>) => Promise<void>;
  refreshStatus: () => Promise<ProviderProfile | null>;
  toggleOnlineStatus: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await providerAuthService.getToken();
        const cached = await providerAuthService.getCachedProfile();
        if (token && cached) {
          setProvider(cached);
          // Load online status
          const onlineVal = await AsyncStorage.getItem('nexora_provider_is_online');
          setIsOnline(onlineVal === 'true');
        }

        // Immediately sync fresh profile from server so permissions & partnerType are never stale
        if (token) {
          providerAuthService
            .checkVerificationStatus()
            .then((fresh) => {
              if (fresh) {
                setProvider(fresh);
              }
            })
            .catch((err) => {
              console.warn('Silent profile sync warning:', err?.message);
            });
        }
      } catch (err) {
        console.warn('Failed to load cached provider session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<ProviderProfile> => {
    setIsLoading(true);
    try {
      const res = await providerAuthService.login(email, password);
      setProvider(res.provider);
      return res.provider;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const newProv = await providerAuthService.register(payload);
      setProvider(newProv);
      return newProv;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadKYC = async (docs: Array<{ type: string; fileName: string; fileUri: string }>) => {
    if (!provider?._id) return;
    setIsLoading(true);
    try {
      const updated = await providerAuthService.uploadKYCDocuments(provider._id, docs);
      setProvider(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStatus = async (): Promise<ProviderProfile | null> => {
    const latest = await providerAuthService.checkVerificationStatus();
    if (latest) {
      setProvider(latest);
    }
    return latest;
  };

  const toggleOnlineStatus = async (): Promise<boolean> => {
    const nextVal = !isOnline;
    setIsOnline(nextVal);
    await AsyncStorage.setItem('nexora_provider_is_online', String(nextVal));
    return nextVal;
  };

  const logout = async () => {
    await providerAuthService.logout();
    setProvider(null);
    setIsOnline(false);
  };

  const status = !provider
    ? 'unauthenticated'
    : provider.status || 'pending_approval';

  const value: AuthContextType = {
    provider,
    isLoading,
    isAuthenticated: Boolean(provider),
    isOnline,
    status,
    login,
    register,
    uploadKYC,
    refreshStatus,
    toggleOnlineStatus,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
