import { NexoraButton } from '@/components/common/NexoraButton';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import {
  ArrowUpRight,
  CheckCircle2,
  Lock
} from 'lucide-react-native';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const transactions = [
    {
      id: 'tx_101',
      title: 'Main Line Leak Detection & Repair',
      customer: 'Sarah Jenkins',
      date: 'Today, 3:45 PM',
      gross: '$195.00',
      fee: '-$19.50',
      net: '+$175.50',
      status: 'cleared',
    },
    {
      id: 'tx_102',
      title: 'Water Heater Element Flush & Anode Rod',
      customer: 'Mark Henderson',
      date: 'Yesterday, 11:20 AM',
      gross: '$220.00',
      fee: '-$22.00',
      net: '+$198.00',
      status: 'cleared',
    },
    {
      id: 'tx_103',
      title: 'Commercial PEX-A Pipe Sale (Storefront)',
      customer: 'Order #NX-8849',
      date: 'Oct 28, 2026',
      gross: '$89.00',
      fee: '-$8.90',
      net: '+$80.10',
      status: 'cleared',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 26 }]}>
        <Text style={styles.title}>Earnings & Settlements</Text>
        <Text style={styles.subtitle}>Direct deposits, service payouts & marketplace escrow</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 80 }]}>
        {/* Main Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <View style={styles.escrowPill}>
              <Lock size={12} color={NexoraColors.statusApproved} />
              <Text style={styles.escrowPillText}>Escrow Protected</Text>
            </View>
          </View>

          <Text style={styles.balanceAmount}>$1,248.60</Text>

          <View style={styles.balanceStatsRow}>
            <View>
              <Text style={styles.statLabel}>Pending Clearance</Text>
              <Text style={styles.statVal}>$373.50</Text>
            </View>
            <View style={styles.statDivider} />
            <View>
              <Text style={styles.statLabel}>Next Payout Date</Text>
              <Text style={styles.statVal}>Monday, Nov 2</Text>
            </View>
          </View>

          <NexoraButton
            title="Request Instant Payout (1.5% Fee)"
            onPress={() => { }}
            variant="primary"
            leftIcon={<ArrowUpRight size={18} color="#ffffff" />}
            style={styles.payoutBtn}
          />
        </View>

        {/* Breakdown Summary */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>This Month Snapshot</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Completed Service Dispatches (18)</Text>
            <Text style={styles.breakdownValue}>$3,420.00</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Storefront Physical Goods Sales (6)</Text>
            <Text style={styles.breakdownValue}>$534.00</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Nexora Platform Fee (10% standard)</Text>
            <Text style={[styles.breakdownValue, { color: NexoraColors.accent }]}>-$395.40</Text>
          </View>
          <View style={styles.breakdownTotalRow}>
            <Text style={styles.totalLabel}>Net Partner Earnings</Text>
            <Text style={styles.totalValue}>$3,558.60</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <Text style={styles.sectionHeading}>Recent Settlements</Text>

        {transactions.map((tx) => (
          <View key={tx.id} style={styles.txCard}>
            <View style={styles.txLeft}>
              <View style={styles.txIconBox}>
                <CheckCircle2 size={18} color={NexoraColors.statusApproved} />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txTitle} numberOfLines={1} ellipsizeMode="tail">
                  {tx.title}
                </Text>
                <Text style={styles.txMeta} numberOfLines={1}>
                  {tx.customer} • {tx.date}
                </Text>
              </View>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txNet}>{tx.net}</Text>
              <Text style={styles.txGross}>Gross: {tx.gross}</Text>
            </View>
          </View>
        ))}
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
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    marginBottom: 20,
    ...Shadows.card,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: NexoraColors.textSecondary,
  },
  escrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: NexoraColors.statusApprovedBg,
    borderColor: NexoraColors.statusApprovedBorder,
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
  },
  escrowPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: NexoraColors.statusApproved,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: NexoraColors.primary,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  balanceStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 11,
    color: NexoraColors.textMuted,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: NexoraColors.border,
    marginHorizontal: 16,
  },
  payoutBtn: {
    marginTop: 4,
  },
  breakdownCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    marginBottom: 20,
    ...Shadows.sm,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '600',
    color: NexoraColors.textPrimary,
  },
  breakdownTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: NexoraColors.primary,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginBottom: 12,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    marginBottom: 10,
    ...Shadows.sm,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  txIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: NexoraColors.statusApprovedBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  txInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  txMeta: {
    fontSize: 11,
    color: NexoraColors.textMuted,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  txNet: {
    fontSize: 14,
    fontWeight: '800',
    color: NexoraColors.statusApproved,
  },
  txGross: {
    fontSize: 10,
    color: NexoraColors.textMuted,
    marginTop: 1,
  },
});
