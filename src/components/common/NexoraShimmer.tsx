import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';

interface NexoraShimmerProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * High-performance 60 FPS pulsating Shimmer placeholder using native driver
 */
export const NexoraShimmer: React.FC<NexoraShimmerProps> = ({
  width = '100%',
  height = 16,
  borderRadius = Radius.sm,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [animatedValue]);

  return (
    <Animated.View
      style={[
        styles.shimmerBase,
        {
          width,
          height,
          borderRadius,
          opacity: animatedValue,
        },
        style,
      ]}
    />
  );
};

/**
 * 1. Pixel-accurate Skeleton Card for physical products in Storefront Catalog (catalog.tsx)
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.topRow}>
        <NexoraShimmer width={44} height={44} borderRadius={10} />

        <View style={styles.metaColumn}>
          <View style={styles.badgeRow}>
            <NexoraShimmer width={55} height={14} borderRadius={4} />
            <NexoraShimmer width={70} height={14} borderRadius={4} />
          </View>
          <NexoraShimmer width="85%" height={15} borderRadius={4} style={{ marginTop: 6 }} />
          <NexoraShimmer width="50%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>

        <View style={styles.priceColumn}>
          <NexoraShimmer width={50} height={18} borderRadius={4} />
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.stepperRow}>
          <NexoraShimmer width={45} height={14} borderRadius={4} />
          <NexoraShimmer width={26} height={26} borderRadius={6} />
          <NexoraShimmer width={28} height={20} borderRadius={4} />
          <NexoraShimmer width={26} height={26} borderRadius={6} />
        </View>

        <View style={styles.actionsRow}>
          <NexoraShimmer width={72} height={22} borderRadius={6} />
          <NexoraShimmer width={26} height={26} borderRadius={6} />
        </View>
      </View>
    </View>
  );
};

/**
 * 2. Skeleton Card for Incoming Dispatches & Trade Jobs (index.tsx)
 */
export const JobCardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.topRow}>
        <NexoraShimmer width={38} height={38} borderRadius={10} />
        <View style={{ flex: 1 }}>
          <NexoraShimmer width="60%" height={15} borderRadius={4} />
          <NexoraShimmer width="40%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
        <NexoraShimmer width={65} height={18} borderRadius={6} />
      </View>

      <NexoraShimmer width="85%" height={16} borderRadius={4} style={{ marginTop: 14 }} />

      <View style={{ marginTop: 12, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <NexoraShimmer width={14} height={14} borderRadius={7} />
          <NexoraShimmer width="75%" height={13} borderRadius={4} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <NexoraShimmer width={14} height={14} borderRadius={7} />
          <NexoraShimmer width="55%" height={13} borderRadius={4} />
        </View>
      </View>

      <View style={[styles.bottomRow, { marginTop: 14, paddingTop: 14 }]}>
        <NexoraShimmer width="38%" height={40} borderRadius={10} />
        <NexoraShimmer width="58%" height={40} borderRadius={10} />
      </View>
    </View>
  );
};

/**
 * 3. Skeleton for Earnings & Settlements Screen (earnings.tsx)
 */
export const EarningsSkeleton: React.FC = () => {
  return (
    <View>
      {/* Balance Card Skeleton */}
      <View style={[styles.cardContainer, { padding: 18, marginBottom: 16 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <NexoraShimmer width={120} height={14} borderRadius={4} />
          <NexoraShimmer width={100} height={20} borderRadius={10} />
        </View>
        <NexoraShimmer width={160} height={32} borderRadius={6} style={{ marginTop: 14 }} />

        <View style={{ flexDirection: 'row', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 20 }}>
          <View style={{ flex: 1 }}>
            <NexoraShimmer width={100} height={12} borderRadius={4} />
            <NexoraShimmer width={70} height={16} borderRadius={4} style={{ marginTop: 6 }} />
          </View>
          <View style={{ flex: 1 }}>
            <NexoraShimmer width={100} height={12} borderRadius={4} />
            <NexoraShimmer width={85} height={16} borderRadius={4} style={{ marginTop: 6 }} />
          </View>
        </View>

        <NexoraShimmer width="100%" height={44} borderRadius={10} style={{ marginTop: 16 }} />
      </View>

      {/* Snapshot Card Skeleton */}
      <View style={[styles.cardContainer, { padding: 16, marginBottom: 16 }]}>
        <NexoraShimmer width={140} height={16} borderRadius={4} style={{ marginBottom: 14 }} />
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <NexoraShimmer width="60%" height={13} borderRadius={4} />
            <NexoraShimmer width={60} height={13} borderRadius={4} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <NexoraShimmer width="50%" height={13} borderRadius={4} />
            <NexoraShimmer width={50} height={13} borderRadius={4} />
          </View>
        </View>
      </View>

      {/* Transactions Skeleton Rows */}
      <NexoraShimmer width={150} height={18} borderRadius={4} style={{ marginBottom: 12 }} />
      <View style={[styles.cardContainer, { padding: 14, marginBottom: 10 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <NexoraShimmer width="70%" height={15} borderRadius={4} />
            <NexoraShimmer width="45%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
          </View>
          <NexoraShimmer width={60} height={18} borderRadius={4} />
        </View>
      </View>
      <View style={[styles.cardContainer, { padding: 14, marginBottom: 10 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <NexoraShimmer width="65%" height={15} borderRadius={4} />
            <NexoraShimmer width="40%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
          </View>
          <NexoraShimmer width={60} height={18} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};

/**
 * 4. Skeleton for Partner Profile & Credentials Screen (profile.tsx)
 */
export const ProfileSkeleton: React.FC = () => {
  return (
    <View>
      {/* Top Profile Card Skeleton */}
      <View style={[styles.cardContainer, { padding: 18, marginBottom: 16 }]}>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <NexoraShimmer width={58} height={58} borderRadius={29} />
          <View style={{ flex: 1 }}>
            <NexoraShimmer width="75%" height={17} borderRadius={4} />
            <NexoraShimmer width="50%" height={13} borderRadius={4} style={{ marginTop: 6 }} />
            <NexoraShimmer width={80} height={20} borderRadius={6} style={{ marginTop: 8 }} />
          </View>
        </View>

        {/* 3-Column Metrics Strip */}
        <View style={{ flexDirection: 'row', marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <NexoraShimmer width={40} height={16} borderRadius={4} />
            <NexoraShimmer width={50} height={11} borderRadius={3} style={{ marginTop: 5 }} />
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <NexoraShimmer width={40} height={16} borderRadius={4} />
            <NexoraShimmer width={50} height={11} borderRadius={3} style={{ marginTop: 5 }} />
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <NexoraShimmer width={40} height={16} borderRadius={4} />
            <NexoraShimmer width={50} height={11} borderRadius={3} style={{ marginTop: 5 }} />
          </View>
        </View>
      </View>

      {/* Trade Section Skeleton */}
      <View style={[styles.cardContainer, { padding: 16, marginBottom: 16 }]}>
        <NexoraShimmer width={150} height={16} borderRadius={4} style={{ marginBottom: 14 }} />
        <NexoraShimmer width="80%" height={14} borderRadius={4} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <NexoraShimmer width={90} height={26} borderRadius={6} />
          <NexoraShimmer width={80} height={26} borderRadius={6} />
          <NexoraShimmer width={100} height={26} borderRadius={6} />
        </View>
      </View>

      {/* Credentials Section Skeleton */}
      <View style={[styles.cardContainer, { padding: 16 }]}>
        <NexoraShimmer width={140} height={16} borderRadius={4} style={{ marginBottom: 14 }} />
        <NexoraShimmer width="90%" height={13} borderRadius={4} style={{ marginBottom: 8 }} />
        <NexoraShimmer width="70%" height={13} borderRadius={4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shimmerBase: {
    backgroundColor: '#cbd5e1',
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    ...Shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  metaColumn: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
