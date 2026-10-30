import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NexoraColors, Radius } from '@/constants/theme';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react-native';

export type ProviderVerificationStatus =
  | 'approved'
  | 'pending_approval'
  | 'pending_review'
  | 'rejected'
  | 'suspended'
  | 'active'
  | 'inactive';

interface StatusBadgeProps {
  status: ProviderVerificationStatus | string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
      case 'active':
      case 'verified':
        return {
          label: 'Approved & Active',
          color: NexoraColors.statusApproved,
          bg: NexoraColors.statusApprovedBg,
          border: NexoraColors.statusApprovedBorder,
          Icon: CheckCircle2,
        };
      case 'pending_approval':
      case 'pending_review':
        return {
          label: 'Under Verification',
          color: NexoraColors.statusPending,
          bg: NexoraColors.statusPendingBg,
          border: NexoraColors.statusPendingBorder,
          Icon: Clock,
        };
      case 'rejected':
        return {
          label: 'Documents Rejected',
          color: NexoraColors.statusRejected,
          bg: NexoraColors.statusRejectedBg,
          border: NexoraColors.statusRejectedBorder,
          Icon: XCircle,
        };
      case 'suspended':
      default:
        return {
          label: 'Suspended / Action Needed',
          color: NexoraColors.statusSuspended,
          bg: NexoraColors.statusSuspendedBg,
          border: NexoraColors.statusSuspendedBorder,
          Icon: AlertTriangle,
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.Icon;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      {showIcon && <IconComponent size={12} color={config.color} style={styles.icon} />}
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});

export default StatusBadge;
