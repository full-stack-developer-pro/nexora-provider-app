import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import {
  MapPin,
  Clock,
  Phone,
  Check,
  X,
  Radio,
  Star,
  DollarSign,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { NexoraLogo } from '@/components/common/NexoraLogo';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { JobCardSkeleton } from '@/components/common/NexoraShimmer';

export default function DispatchesScreen() {
  const insets = useSafeAreaInsets();
  const { provider, isOnline, toggleOnlineStatus } = useAuth();
  const [loading, setLoading] = useState(true);

  const [activeJobs, setActiveJobs] = useState([
    {
      id: 'job_4091',
      customerName: 'Sarah Jenkins',
      customerAddress: '1420 South Congress Ave, Austin, TX',
      distance: '2.8 miles away',
      serviceName: 'Main Line Leak Detection & Valve Replacement',
      trade: provider?.primaryCategory || 'Plumbing & Water Systems',
      priceEstimate: '$195.00',
      timeSlot: 'Today, 2:30 PM - 4:00 PM',
      urgency: 'high',
      status: 'pending_acceptance',
    },
    {
      id: 'job_4092',
      customerName: 'Robert Vance',
      customerAddress: '780 Barton Springs Rd, Austin, TX',
      distance: '4.5 miles away',
      serviceName: 'Tankless Water Heater Inspection & Flush',
      trade: provider?.primaryCategory || 'Plumbing & Water Systems',
      priceEstimate: '$240.00',
      timeSlot: 'Tomorrow, 10:00 AM',
      urgency: 'standard',
      status: 'pending_acceptance',
    },
  ]);

  const [completedToday, setCompletedToday] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleAcceptJob = (jobId: string) => {
    setActiveJobs((prev) => prev.filter((j) => j.id !== jobId));
    setCompletedToday((c) => c + 1);
    Alert.alert(
      'Dispatch Accepted!',
      'Customer has been notified. Navigation route is prepared.'
    );
  };

  const handleDeclineJob = (jobId: string) => {
    setActiveJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 20 }]}>
        <View style={styles.headerTop}>
          <NexoraLogo size="sm" showText={false} />
          <View style={styles.providerMeta}>
            <Text style={styles.businessName} numberOfLines={1}>
              {provider?.businessName || 'Vance Precision Plumbing LLC'}
            </Text>
            <View style={styles.tradeBadgeRow}>
              <StatusBadge status={provider?.status || 'approved'} showIcon={false} />
              <Text style={styles.cityText}>• {provider?.serviceArea?.city || 'Austin'}</Text>
            </View>
          </View>
        </View>

        {/* Online / Offline Availability Switch */}
        <View
          style={[
            styles.availabilityCard,
            isOnline ? styles.availabilityCardOnline : styles.availabilityCardOffline,
          ]}
        >
          <View style={styles.availabilityLeft}>
            <View
              style={[
                styles.pulseIndicator,
                isOnline ? styles.pulseOnline : styles.pulseOffline,
              ]}
            >
              <Radio size={16} color={isOnline ? '#ffffff' : NexoraColors.textMuted} />
            </View>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text
                style={[
                  styles.availabilityTitle,
                  isOnline && { color: NexoraColors.statusApproved },
                ]}
                numberOfLines={1}
              >
                {isOnline ? 'Online • Accepting Dispatches' : 'Offline • Invisible in Catalog'}
              </Text>
              <Text style={styles.availabilitySub} numberOfLines={2}>
                {isOnline
                  ? 'Ready for incoming customer trade requests within 25 mi'
                  : 'Toggle ON to appear in live local marketplace searches'}
              </Text>
            </View>
          </View>

          <Switch
            value={isOnline}
            onValueChange={() => {
              toggleOnlineStatus();
            }}
            trackColor={{ false: '#cbd5e1', true: NexoraColors.statusApproved }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 95 }]}
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
        {/* KPI Summary Cards */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: NexoraColors.primaryLight }]}>
              <DollarSign size={18} color={NexoraColors.primary} />
            </View>
            <Text style={styles.kpiValue}>$380.00</Text>
            <Text style={styles.kpiLabel}>Today's Payout</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#ecfdf5' }]}>
              <CalendarCheck size={18} color="#10b981" />
            </View>
            <Text style={styles.kpiValue}>{activeJobs.length + completedToday}</Text>
            <Text style={styles.kpiLabel}>Total Bookings</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#fffbeb' }]}>
              <Star size={18} color="#f59e0b" fill="#f59e0b" />
            </View>
            <Text style={styles.kpiValue}>{provider?.rating || '4.95'}</Text>
            <Text style={styles.kpiLabel}>Quality Score</Text>
          </View>
        </View>

        {/* Live Incoming Dispatch Radar */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Incoming Dispatch Requests</Text>
            <View style={styles.requestCountBadge}>
              <Text style={styles.requestCountText}>{activeJobs.length}</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>
            Matched with your verified trade specialties
          </Text>
        </View>

        {loading ? (
          <View>
            <JobCardSkeleton />
            <JobCardSkeleton />
          </View>
        ) : activeJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Briefcase size={36} color={NexoraColors.textMuted} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySubtitle}>
              Keep your availability toggle ON to receive automated customer dispatches.
            </Text>
          </View>
        ) : (
          activeJobs.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobTop}>
                <View style={styles.jobTradeBox}>
                  <CategoryIcon name="Droplet" size={16} color={NexoraColors.primary} />
                </View>
                <View style={styles.jobHeaderMeta}>
                  <Text style={styles.jobCustomer}>{job.customerName}</Text>
                  <Text style={styles.jobTradeTag}>{job.trade}</Text>
                </View>
                <Text style={styles.jobPrice}>{job.priceEstimate}</Text>
              </View>

              <Text style={styles.jobServiceName}>{job.serviceName}</Text>

              <View style={styles.jobDetails}>
                <View style={styles.detailRow}>
                  <MapPin size={14} color={NexoraColors.textSecondary} />
                  <Text style={styles.detailText}>{job.customerAddress}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={14} color={NexoraColors.textSecondary} />
                  <Text style={styles.detailText}>{job.timeSlot} • {job.distance}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.jobActions}>
                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={() => handleDeclineJob(job.id)}
                  activeOpacity={0.7}
                >
                  <X size={16} color={NexoraColors.textSecondary} />
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAcceptJob(job.id)}
                  activeOpacity={0.8}
                >
                  <Check size={16} color="#ffffff" />
                  <Text style={styles.acceptBtnText}>Accept Dispatch</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
    paddingBottom: 26,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  providerMeta: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  tradeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  cityText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  availabilityCardOnline: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  availabilityCardOffline: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  availabilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  pulseIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseOnline: {
    backgroundColor: NexoraColors.statusApproved,
  },
  pulseOffline: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  availabilityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  availabilitySub: {
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 14,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    ...Shadows.sm,
  },
  kpiIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  kpiLabel: {
    fontSize: 11,
    color: NexoraColors.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
    letterSpacing: -0.3,
  },
  requestCountBadge: {
    backgroundColor: NexoraColors.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  requestCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: NexoraColors.textMuted,
    marginTop: 2,
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    marginBottom: 14,
    ...Shadows.card,
  },
  jobTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  jobTradeBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: NexoraColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  jobHeaderMeta: {
    flex: 1,
  },
  jobCustomer: {
    fontSize: 14,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  jobTradeTag: {
    fontSize: 11,
    color: NexoraColors.textMuted,
    marginTop: 1,
  },
  jobPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: NexoraColors.primary,
  },
  jobServiceName: {
    fontSize: 14,
    fontWeight: '600',
    color: NexoraColors.textPrimary,
    lineHeight: 18,
    marginBottom: 10,
  },
  jobDetails: {
    gap: 6,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: Radius.sm,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
    flex: 1,
  },
  jobActions: {
    flexDirection: 'row',
    gap: 10,
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: Radius.md,
  },
  declineBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: NexoraColors.textSecondary,
  },
  acceptBtn: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: NexoraColors.primary,
    borderRadius: Radius.md,
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptyState: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NexoraColors.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: NexoraColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
