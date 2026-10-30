import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Clock,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Sparkles,
  ArrowRight,
  FileText
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { NexoraLogo } from '@/components/common/NexoraLogo';
import { NexoraButton } from '@/components/common/NexoraButton';
import { useAuth } from '@/context/AuthContext';

export default function PendingVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { provider, refreshStatus, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState('');

  const currentStatus = provider?.status || 'pending_approval';

  const handleCheckStatus = async () => {
    setChecking(true);
    setFeedback('');
    try {
      const latest = await refreshStatus();
      if (latest?.status === 'approved') {
        router.replace('/(tabs)');
      } else {
        setFeedback(
          latest?.status === 'rejected'
            ? 'Your application was rejected by compliance. Please contact support.'
            : latest?.status === 'suspended'
            ? 'Your account has been suspended. Please contact support.'
            : 'Your application is still under review by the Nexora Compliance team.'
        );
      }
    } catch {
      setFeedback('Unable to reach verification servers. Please retry.');
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const docCount = provider?.documents?.length || 0;

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: Math.max(insets.bottom, 24) + 60 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 24 }]}>
        <NexoraLogo size="md" subtitle="PARTNER VERIFICATION CONSOLE" />
      </View>

      {/* Main Review Card */}
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Clock
            size={36}
            color={
              currentStatus === 'rejected'
                ? NexoraColors.statusRejected
                : currentStatus === 'suspended'
                ? NexoraColors.statusSuspended
                : NexoraColors.statusPending
            }
          />
        </View>

        <Text style={styles.title}>
          {currentStatus === 'rejected'
            ? 'Application Rejected'
            : currentStatus === 'suspended'
            ? 'Account Suspended'
            : 'Application Under Review'}
        </Text>
        <Text style={styles.subtitle}>
          {currentStatus === 'rejected'
            ? 'Your partner application was audited by compliance and rejected. Please reach out to Nexora support for remediation.'
            : currentStatus === 'suspended'
            ? 'Your partner account has been suspended by an administrator. Please contact support to resolve account flags.'
            : 'Thank you for applying to the Nexora Marketplace. Our compliance team is auditing your trade credentials.'}
        </Text>

        {/* Live Admin Queue Notice */}
        <View style={styles.queueNotice}>
          <ShieldCheck size={18} color={NexoraColors.primary} style={{ flexShrink: 0 }} />
          <Text style={styles.queueText}>
            Visible in <Text style={{ fontWeight: '700' }}>Nexora Admin Panel → Provider Management</Text> for vetting and document review.
          </Text>
        </View>

        {/* Verification Progress Timeline */}
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotDone]}>
              <CheckCircle2 size={16} color="#ffffff" />
            </View>
            <View style={styles.timelineBody}>
              <Text style={styles.timelineTitle}>Partner Profile Created</Text>
              <Text style={styles.timelineDesc}>
                {provider?.businessName || 'Business entity registered'}
              </Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotDone]}>
              <CheckCircle2 size={16} color="#ffffff" />
            </View>
            <View style={styles.timelineBody}>
              <Text style={styles.timelineTitle}>Trade & Specialties Assigned</Text>
              <Text style={styles.timelineDesc}>
                {provider?.primaryCategory || 'Plumbing & Water Systems'}
              </Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotDone]}>
              <FileText size={16} color="#ffffff" />
            </View>
            <View style={styles.timelineBody}>
              <Text style={styles.timelineTitle}>KYC Documents Uploaded</Text>
              <Text style={styles.timelineDesc}>
                {docCount} official verification files attached
              </Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotActive]}>
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
            <View style={styles.timelineBody}>
              <Text style={[styles.timelineTitle, { color: NexoraColors.statusPending }]}>
                Compliance Audit by Nexora Admin
              </Text>
              <Text style={styles.timelineDesc}>
                Verification in progress (Est. 2-4 hours)
              </Text>
            </View>
          </View>
        </View>

        {feedback ? (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        ) : null}

        {/* Check Status Button */}
        <NexoraButton
          title={checking ? 'Checking Status...' : 'Check Approval Status'}
          onPress={handleCheckStatus}
          loading={checking}
          variant="primary"
          leftIcon={<RefreshCw size={18} color="#ffffff" />}
          style={styles.actionBtn}
        />

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <LogOut size={16} color={NexoraColors.textMuted} />
          <Text style={styles.logoutText}>Sign Out from this Device</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: NexoraColors.midnightDark,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.xl,
    padding: 24,
    ...Shadows.floating,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: NexoraColors.statusPendingBg,
    borderWidth: 2,
    borderColor: NexoraColors.statusPendingBorder,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: NexoraColors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  queueNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: NexoraColors.primaryLight,
    borderWidth: 1,
    borderColor: NexoraColors.primaryBorder,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 24,
  },
  queueText: {
    fontSize: 12,
    color: NexoraColors.primary,
    flex: 1,
    lineHeight: 16,
  },
  timeline: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone: {
    backgroundColor: NexoraColors.statusApproved,
  },
  timelineDotActive: {
    backgroundColor: NexoraColors.statusPending,
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: NexoraColors.border,
    marginLeft: 13,
    marginVertical: 4,
  },
  timelineBody: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  timelineDesc: {
    fontSize: 12,
    color: NexoraColors.textMuted,
    marginTop: 2,
  },
  feedbackBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: NexoraColors.border,
    padding: 10,
    borderRadius: Radius.sm,
    marginBottom: 16,
  },
  feedbackText: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
    textAlign: 'center',
  },
  actionBtn: {
    marginBottom: 12,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: NexoraColors.primaryLight,
    borderWidth: 1,
    borderColor: NexoraColors.primaryBorder,
    borderRadius: Radius.md,
    marginBottom: 16,
  },
  simulateText: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: NexoraColors.textMuted,
  },
});
