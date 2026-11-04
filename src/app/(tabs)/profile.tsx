import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  ShieldCheck,
  Award,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Building,
  Star,
  Pencil
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { ProfileSkeleton } from '@/components/common/NexoraShimmer';
import { EditProfileModal } from '@/components/profile/EditProfileModal';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { provider, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your partner account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 26 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Partner Profile & Credentials</Text>
          <TouchableOpacity
            style={styles.editHeaderBtn}
            onPress={() => setEditModalOpen(true)}
            activeOpacity={0.8}
          >
            <Pencil size={14} color="#ffffff" />
            <Text style={styles.editHeaderBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={NexoraColors.primary}
            colors={[NexoraColors.primary]}
          />
        }
      >
        {loading ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/* Profile Card */}
            <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarInitials}>
                {provider?.name
                  ? provider.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()
                  : 'VP'}
              </Text>
              <View style={styles.verifiedCheckBadge}>
                <CheckCircle2 size={12} color="#ffffff" />
              </View>
            </View>

            <View style={styles.nameBlock}>
              <Text style={styles.businessName} numberOfLines={1}>
                {provider?.businessName || 'Vance Precision Plumbing LLC'}
              </Text>
              <Text style={styles.ownerName}>Contact: {provider?.name || 'Marcus Vance'}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={provider?.status || 'approved'} />
              </View>
            </View>
          </View>

          {provider?.bio ? (
            <Text style={styles.bioText} numberOfLines={3}>
              "{provider.bio}"
            </Text>
          ) : null}

          {/* Quick Metrics */}
          <View style={styles.metricsStrip}>
            <View style={styles.metricItem}>
              <View style={styles.starRow}>
                <Star size={13} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.metricVal}>{provider?.rating || '4.95'}</Text>
              </View>
              <Text style={styles.metricLabel}>Rating</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{provider?.completedJobs || '142'}</Text>
              <Text style={styles.metricLabel}>Jobs Done</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{provider?.experienceYears || '8'} yrs</Text>
              <Text style={styles.metricLabel}>Experience</Text>
            </View>
          </View>
        </View>

        {/* Trade & Specialty Classification */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trade Classification</Text>
          <View style={styles.tradeRow}>
            <View style={styles.tradeIconWrap}>
              <CategoryIcon name="Droplet" size={20} color={NexoraColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tradeTitle}>
                {provider?.primaryCategory || 'Plumbing & Water Systems'}
              </Text>
              <Text style={styles.tradeSub}>Licensed Primary Trade Vertical</Text>
            </View>
          </View>

          <Text style={styles.specialtiesLabel}>Approved Specialties ({provider?.specialties?.length || 2}):</Text>
          <View style={styles.chipsWrap}>
            {(provider?.specialties && provider.specialties.length > 0
              ? provider.specialties
              : ['Pipe Repair & Leak Detection', 'Water Heater Installation']
            ).map((s) => (
              <View key={s} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Compliance & Audit Credentials */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <ShieldCheck size={18} color={NexoraColors.statusApproved} />
            <Text style={styles.cardTitle}>KYC & License Vetting</Text>
          </View>

          <View style={styles.credentialItem}>
            <View style={styles.credLeft}>
              <FileText size={16} color={NexoraColors.primary} />
              <View>
                <Text style={styles.credName}>State Contractor License</Text>
                <Text style={styles.credMeta}>
                  {provider?.licenseNumber ? `ID: ${provider.licenseNumber}` : 'TX-MP-84920'} • Verified by Admin
                </Text>
              </View>
            </View>
            <CheckCircle2 size={16} color={NexoraColors.statusApproved} />
          </View>

          <View style={styles.credentialItem}>
            <View style={styles.credLeft}>
              <FileText size={16} color={NexoraColors.primary} />
              <View>
                <Text style={styles.credName}>General Liability Insurance</Text>
                <Text style={styles.credMeta}>
                  {provider?.insurancePolicyNumber ? `Policy: ${provider.insurancePolicyNumber}` : 'POL-LIB-99120 ($1M)'}
                </Text>
              </View>
            </View>
            <CheckCircle2 size={16} color={NexoraColors.statusApproved} />
          </View>
        </View>

        {/* Service Area */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dispatch Service Territory</Text>
          <View style={styles.infoRow}>
            <MapPin size={16} color={NexoraColors.textSecondary} />
            <Text style={styles.infoText}>
              Primary City: <Text style={{ fontWeight: '700' }}>{provider?.serviceArea?.city || 'Austin, TX'}</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Award size={16} color={NexoraColors.textSecondary} />
            <Text style={styles.infoText}>
              Coverage Radius: <Text style={{ fontWeight: '700' }}>{provider?.serviceArea?.radiusMiles || 25} miles</Text>
            </Text>
          </View>
        </View>

        {/* Contact info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Registered Contact</Text>
          <View style={styles.infoRow}>
            <Mail size={16} color={NexoraColors.textSecondary} />
            <Text style={styles.infoText}>{provider?.email || 'marcus.plumbing@austinpro.com'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Phone size={16} color={NexoraColors.textSecondary} />
            <Text style={styles.infoText}>{provider?.phone || '+1 (555) 342-9810'}</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={18} color={NexoraColors.statusRejected} />
          <Text style={styles.logoutText}>Sign Out from Partner Portal</Text>
        </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NexoraColors.canvas,
  },
  header: {
    backgroundColor: NexoraColors.midnightDark,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
    flex: 1,
  },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    marginLeft: 8,
  },
  editHeaderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    marginBottom: 16,
    ...Shadows.card,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 12.5,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 14,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: NexoraColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Shadows.sm,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: NexoraColors.statusApproved,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  nameBlock: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  ownerName: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    marginTop: 6,
  },
  metricsStrip: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: NexoraColors.border,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
    color: NexoraColors.textMuted,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    backgroundColor: NexoraColors.border,
    marginHorizontal: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    marginBottom: 14,
    ...Shadows.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: NexoraColors.primaryLight,
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 14,
  },
  tradeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  tradeSub: {
    fontSize: 11,
    color: NexoraColors.textSecondary,
    marginTop: 2,
  },
  specialtiesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: NexoraColors.textSecondary,
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: NexoraColors.border,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: NexoraColors.textPrimary,
  },
  credentialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  credLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  credName: {
    fontSize: 13,
    fontWeight: '600',
    color: NexoraColors.textPrimary,
  },
  credMeta: {
    fontSize: 11,
    color: NexoraColors.textMuted,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: NexoraColors.textSecondary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: NexoraColors.statusRejectedBg,
    borderColor: NexoraColors.statusRejectedBorder,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: NexoraColors.statusRejected,
  },
});
