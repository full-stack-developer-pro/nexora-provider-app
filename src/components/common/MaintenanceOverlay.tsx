import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { AlertTriangle, RefreshCw, Mail, ShieldCheck } from 'lucide-react-native';
import { NexoraColors, Typography, Radius, Shadows } from '@/constants/theme';
import { useSystemSettings } from '@/context/SystemSettingsContext';

export const MaintenanceOverlay: React.FC = () => {
  const { isMaintenance, maintenanceNotice, settings, refreshSettings } = useSystemSettings();
  const [checking, setChecking] = useState(false);

  if (!isMaintenance) return null;

  const handleRetry = async () => {
    setChecking(true);
    try {
      await refreshSettings();
    } finally {
      setChecking(false);
    }
  };

  const handleEmailSupport = () => {
    if (settings.supportEmail) {
      Linking.openURL(`mailto:${settings.supportEmail}?subject=Platform%20Maintenance%20Inquiry`).catch(() => {});
    }
  };

  return (
    <Modal visible={isMaintenance} animationType="fade" transparent={false} statusBarTranslucent>
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Top Brand Tag */}
          <View style={styles.brandRow}>
            <ShieldCheck size={18} color="#f59e0b" />
            <Text style={styles.brandText}>{settings.platformName || 'Nexora Marketplace'}</Text>
          </View>

          {/* Warning Icon Graphic */}
          <View style={styles.iconCircle}>
            <AlertTriangle size={36} color="#d97706" />
          </View>

          <Text style={styles.title}>System Maintenance</Text>

          <Text style={styles.noticeBody}>
            {maintenanceNotice ||
              'Nexora is currently undergoing scheduled platform upgrades. We will be back online shortly.'}
          </Text>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.refreshBtn, checking && styles.btnDisabled]}
            onPress={handleRetry}
            disabled={checking}
            activeOpacity={0.85}
          >
            {checking ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <RefreshCw size={16} color="#ffffff" />
                <Text style={styles.refreshBtnText}>Check Live Status</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Contact Support Link */}
          {settings.supportEmail ? (
            <TouchableOpacity
              style={styles.supportLink}
              onPress={handleEmailSupport}
              activeOpacity={0.7}
            >
              <Mail size={13} color="#64748b" />
              <Text style={styles.supportText}>Contact {settings.supportEmail}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1626',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: Radius.xl,
    padding: 24,
    alignItems: 'center',
    ...Shadows.card,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fef3c7',
    borderRadius: Radius.full,
    marginBottom: 20,
  },
  brandText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fffbeb',
    borderWidth: 1.5,
    borderColor: '#fde68a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 10,
  },
  noticeBody: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 46,
    backgroundColor: NexoraColors.primary,
    borderRadius: Radius.md,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  refreshBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  supportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 6,
  },
  supportText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
});

export default MaintenanceOverlay;
