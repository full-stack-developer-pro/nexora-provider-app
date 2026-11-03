import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import {
  Wrench,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  MapPin,
  Briefcase,
  ChevronRight
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ServiceCardSkeleton } from '@/components/common/NexoraShimmer';
import providerServiceService, { ServiceOffering } from '@/services/providerServiceService';
import PostServiceModal from './PostServiceModal';
import ServiceDetailsModal from './ServiceDetailsModal';

interface ServiceCatalogSectionProps {
  searchQuery?: string;
  selectedCategoryId?: string;
  onStatsChange?: (stats: { total: number; active: number; inReview: number; inactive: number }) => void;
  initialOpenModal?: boolean;
  onModalClose?: () => void;
  defaultLocation?: {
    city?: string;
    state?: string;
    address?: string;
    radiusMiles?: number;
  };
}

export const ServiceCatalogSection: React.FC<ServiceCatalogSectionProps> = ({
  searchQuery = '',
  selectedCategoryId = 'all',
  onStatsChange,
  initialOpenModal = false,
  onModalClose,
  defaultLocation
}) => {
  const [services, setServices] = useState<ServiceOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Detail Modal State
  const [selectedDetailService, setSelectedDetailService] = useState<ServiceOffering | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inReview: 0,
    inactive: 0
  });

  // Create Modal
  const [modalVisible, setModalVisible] = useState(initialOpenModal);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Open create modal if prop triggers
  useEffect(() => {
    if (initialOpenModal) {
      setModalVisible(true);
    }
  }, [initialOpenModal]);

  // Sync stats up to parent catalog screen safely
  useEffect(() => {
    if (onStatsChange) {
      onStatsChange(stats);
    }
  }, [stats, onStatsChange]);

  // Fetch Services
  const fetchServices = useCallback(async () => {
    try {
      const res = await providerServiceService.getMyServices({
        search: debouncedSearch.trim() || undefined,
        category: selectedCategoryId !== 'all' ? selectedCategoryId : undefined
      });
      setServices(res.data);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err: any) {
      console.warn('Error fetching provider services:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, selectedCategoryId]);

  useEffect(() => {
    setLoading(true);
    fetchServices();
  }, [fetchServices]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  // Delete Service
  const handleDeleteService = (service: ServiceOffering) => {
    Alert.alert(
      'Delete Service Listing',
      `Are you sure you want to permanently remove "${service.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await providerServiceService.deleteService(service._id);
              setServices((prev) => prev.filter((s) => s._id !== service._id));
              setStats((prev) => ({
                ...prev,
                total: Math.max(0, prev.total - 1),
                active: service.status === 'active' ? Math.max(0, prev.active - 1) : prev.active
              }));
              if (selectedDetailService?._id === service._id) {
                setSelectedDetailService(null);
              }
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not delete service.');
            }
          }
        }
      ]
    );
  };

  const handleServiceCreated = (newService: ServiceOffering) => {
    setServices((prev) => [newService, ...prev]);
    setStats((prev) => ({
      ...prev,
      total: prev.total + 1,
      active: newService.status === 'active' ? prev.active + 1 : prev.active,
      inReview: newService.status === 'in_review' ? prev.inReview + 1 : prev.inReview
    }));
  };

  return (
    <View style={styles.container}>
      {/* Services List Scroll */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NexoraColors.primary} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Unified Summary Card - 100% Matching Physical Goods layout */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{stats.total}</Text>
            <Text style={styles.summaryLabel}>Total Services</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: '#059669' }]}>{stats.active}</Text>
            <Text style={styles.summaryLabel}>Active & Live</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, stats.inReview > 0 ? { color: '#d97706' } : null]}>
              {stats.inReview}
            </Text>
            <Text style={styles.summaryLabel}>In Review</Text>
          </View>
        </View>

        {/* Content Body */}
        {loading ? (
          <View>
            <ServiceCardSkeleton />
            <ServiceCardSkeleton />
            <ServiceCardSkeleton />
            <ServiceCardSkeleton />
          </View>
        ) : services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Briefcase size={36} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>No service offerings found</Text>
            <Text style={styles.emptySub}>
              {searchQuery || selectedCategoryId !== 'all'
                ? 'Try adjusting your search criteria or trade category filter.'
                : 'Publish your trade offerings to start receiving direct client bookings and job quotes.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.85}
            >
              <Plus size={18} color="#ffffff" />
              <Text style={styles.emptyAddBtnText}>Post Your First Service</Text>
            </TouchableOpacity>
          </View>
        ) : (
          services.map((item) => {
            const coverUrl =
              item.images?.find((img) => img.isPrimary)?.url ||
              item.images?.[0]?.url;

            const categoryName =
              typeof item.category === 'object' && item.category
                ? item.category.name
                : 'Trade Service';

            return (
              <TouchableOpacity
                key={item._id}
                style={styles.serviceCard}
                activeOpacity={0.88}
                onPress={() => setSelectedDetailService(item)}
              >
                {/* 1. Card Top Row: Trade & Specialty Tag + Delete Action */}
                <View style={styles.cardTopRow}>
                  <View style={styles.tradeTagWrap}>
                    <Wrench size={12} color={NexoraColors.primary} />
                    <Text style={styles.cardCategoryText} numberOfLines={1}>
                      {categoryName}
                    </Text>
                    {item.subcategory ? (
                      <>
                        <Text style={styles.dotSeparator}>&bull;</Text>
                        <Text style={styles.cardSubcatText} numberOfLines={1}>
                          {item.subcategory}
                        </Text>
                      </>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDeleteService(item)}
                    style={styles.deleteBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={15} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {/* 2. Card Main: Thumbnail + Title + Meta Chips */}
                <View style={styles.cardMainRow}>
                  {coverUrl ? (
                    <Image source={{ uri: coverUrl }} style={styles.cardThumb} resizeMode="cover" />
                  ) : (
                    <View style={styles.cardThumbFallback}>
                      <Wrench size={26} color={NexoraColors.primary} />
                    </View>
                  )}

                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>

                    {/* Meta Chips: Price, Duration, City */}
                    <View style={styles.cardMetaRow}>
                      <View style={styles.pricePill}>
                        <Text style={styles.priceVal}>${Number(item.price).toFixed(2)}</Text>
                        <Text style={styles.priceType}>
                          {item.pricingType === 'hourly'
                            ? '/ hr'
                            : item.pricingType === 'custom_quote'
                            ? '(Quote)'
                            : 'Fixed'}
                        </Text>
                      </View>

                      {item.duration ? (
                        <View style={styles.metaChip}>
                          <Clock size={11} color="#64748b" />
                          <Text style={styles.metaChipText}>{item.duration}m</Text>
                        </View>
                      ) : null}

                      {item.serviceLocation?.city ? (
                        <View style={styles.metaChip}>
                          <MapPin size={11} color="#64748b" />
                          <Text style={styles.metaChipText} numberOfLines={1}>
                            {item.serviceLocation.city}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>

                {/* 3. Card Footer: Status Badge + Tap for Details */}
                <View style={styles.cardFooterRow}>
                  <StatusBadge status={item.status} />

                  <View style={styles.viewDetailsPrompt}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <ChevronRight size={13} color={NexoraColors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Post Service Modal */}
      <PostServiceModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          if (onModalClose) onModalClose();
        }}
        onServiceCreated={handleServiceCreated}
        defaultLocation={defaultLocation}
      />

      {/* Service Details Inspection Modal */}
      <ServiceDetailsModal
        visible={Boolean(selectedDetailService)}
        service={selectedDetailService}
        onClose={() => setSelectedDetailService(null)}
        onDelete={handleDeleteService}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NexoraColors.canvas
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 130
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    marginBottom: 16,
    ...Shadows.card
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center'
  },
  summaryVal: {
    fontSize: 20,
    fontWeight: '800',
    color: NexoraColors.textPrimary
  },
  summaryLabel: {
    fontSize: 11,
    color: NexoraColors.textSecondary,
    marginTop: 2,
    fontWeight: '600'
  },
  summaryDivider: {
    width: 1,
    backgroundColor: NexoraColors.border,
    height: '80%',
    alignSelf: 'center'
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 10
  },
  loadingText: {
    fontSize: 13,
    color: '#64748b'
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: 16
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: NexoraColors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10
  },
  emptyAddBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff'
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 12,
    ...Shadows.card
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  tradeTagWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginRight: 8
  },
  cardCategoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: NexoraColors.primary
  },
  dotSeparator: {
    fontSize: 12,
    color: '#94a3b8'
  },
  cardSubcatText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    flexShrink: 1
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardMainRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center'
  },
  cardThumb: {
    width: 74,
    height: 74,
    borderRadius: 10,
    backgroundColor: '#f1f5f9'
  },
  cardThumbFallback: {
    width: 74,
    height: 74,
    borderRadius: 10,
    backgroundColor: '#eef5fc',
    borderWidth: 1,
    borderColor: '#bdd8f2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 6
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 19
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2
  },
  priceVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  priceType: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600'
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  metaChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600'
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc'
  },
  viewDetailsPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: NexoraColors.primary
  }
});

export default ServiceCatalogSection;
