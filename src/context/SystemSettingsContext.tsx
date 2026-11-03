import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import systemSettingsService, {
  SystemSettings,
  DEFAULT_SYSTEM_SETTINGS,
} from '../services/systemSettingsService';

interface SystemSettingsContextType {
  settings: SystemSettings;
  isLoadingSettings: boolean;
  isMaintenance: boolean;
  maintenanceNotice: string;
  refreshSettings: () => Promise<void>;
  triggerMaintenance: (notice?: string) => void;
  clearMaintenance: () => void;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | null>(null);

export const SystemSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true);
  const [manualMaintenance, setManualMaintenance] = useState<{
    active: boolean;
    notice: string;
  } | null>(null);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await systemSettingsService.getPublicSettings();
      setSettings(data);
      if (!data.maintenanceMode && manualMaintenance?.active) {
        setManualMaintenance(null);
      }
    } catch {
      // Use existing fallback
    } finally {
      setIsLoadingSettings(false);
    }
  }, [manualMaintenance]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const triggerMaintenance = useCallback((notice?: string) => {
    setManualMaintenance({
      active: true,
      notice:
        notice ||
        settings.maintenanceNotice ||
        'Nexora is currently undergoing scheduled platform upgrades. We will be back online shortly.',
    });
  }, [settings.maintenanceNotice]);

  const clearMaintenance = useCallback(() => {
    setManualMaintenance(null);
    setSettings((prev) => ({ ...prev, maintenanceMode: false }));
  }, []);

  const isMaintenance = Boolean(manualMaintenance?.active || settings.maintenanceMode);
  const maintenanceNotice =
    manualMaintenance?.notice ||
    settings.maintenanceNotice ||
    'Nexora is currently undergoing scheduled platform upgrades. We will be back online shortly.';

  return (
    <SystemSettingsContext.Provider
      value={{
        settings,
        isLoadingSettings,
        isMaintenance,
        maintenanceNotice,
        refreshSettings,
        triggerMaintenance,
        clearMaintenance,
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  );
};

export const useSystemSettings = (): SystemSettingsContextType => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    return {
      settings: DEFAULT_SYSTEM_SETTINGS,
      isLoadingSettings: false,
      isMaintenance: false,
      maintenanceNotice: DEFAULT_SYSTEM_SETTINGS.maintenanceNotice,
      refreshSettings: async () => {},
      triggerMaintenance: () => {},
      clearMaintenance: () => {},
    };
  }
  return context;
};

export default SystemSettingsContext;

