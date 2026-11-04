import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert
} from 'react-native';
import {
  X,
  Wrench,
  DollarSign,
  Clock,
  MapPin,
  Trash2,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Pencil
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ServiceOffering } from '@/services/providerServiceService';

interface ServiceDetailsModalProps {
  visible: boolean;
  service: ServiceOffering | null;
  onClose: () => void;
  onDelete?: (service: ServiceOffering) => void;
  onEdit?: (service: ServiceOffering) => void;
}

export const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  visible,
  service,
  onClose,
  onDelete,
  onEdit
}) => {
  if (!service) return null;

  const primaryImage =
    service.images?.find((img) => img.isPrimary)?.url ||
    service.images?.[0]?.url;

  const categoryName =
    typeof service.category === 'object' && service.category
      ? service.category.name
      : 'Trade Service';

  const loc = service.serviceLocation || {};
  const locationString = [loc.address, loc.city, loc.state].filter(Boolean).join(', ') || loc.city || 'Austin Metro Area';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.sheetHeaderLabel}>SERVICE OFFERING DETAILS</Text>
              <Text style={styles.sheetTitle} numberOfLines={1}>
                {service.title}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={NexoraColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Cover Banner */}
            {primaryImage ? (
              <View style={styles.bannerWrap}>
                <Image source={{ uri: primaryImage }} style={styles.bannerImg} resizeMode="cover" />
                <View style={styles.statusBadgeOverlay}>
                  <StatusBadge status={service.status} />
                </View>
              </View>
            ) : (
              <View style={styles.bannerFallback}>
                <Wrench size={38} color={NexoraColors.primary} />
                <View style={styles.statusBadgeOverlay}>
                  <StatusBadge status={service.status} />
                </View>
              </View>
            )}

            {/* Core Info Section */}
            <View style={styles.cardSection}>
              <Text style={styles.serviceTitle}>{service.title}</Text>

              {/* Category & Trade Pill */}
              <View style={styles.tradePillRow}>
                <View style={styles.categoryPill}>
                  <Wrench size={13} color={NexoraColors.primary} />
                  <Text style={styles.categoryPillText}>{categoryName}</Text>
                </View>
                {service.subcategory ? (
                  <View style={styles.subcatPill}>
                    <Text style={styles.subcatPillText}>{service.subcategory}</Text>
                  </View>
                ) : null}
              </View>

              {/* Description */}
              {service.description ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.fieldSectionTitle}>Scope & Description</Text>
                  <Text style={styles.descriptionText}>{service.description}</Text>
                </View>
              ) : null}
            </View>

            {/* Pricing & Duration Card */}
            <View style={styles.cardSection}>
              <Text style={styles.fieldSectionTitle}>Pricing Model & Rate</Text>

              <View style={styles.priceDurationRow}>
                <View style={styles.priceHighlightBox}>
                  <Text style={styles.priceHighlightLabel}>
                    {service.pricingType === 'hourly'
                      ? 'HOURLY BILLING RATE'
                      : service.pricingType === 'custom_quote'
                      ? 'PRICE ESTIMATE'
                      : 'FIXED FLAT RATE'}
                  </Text>
                  <View style={styles.priceValueRow}>
                    <Text style={styles.priceBigVal}>${Number(service.price).toFixed(2)}</Text>
                    {service.pricingType === 'hourly' ? (
                      <Text style={styles.priceSuffix}> / hour</Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.durationHighlightBox}>
                  <Text style={styles.durationHighlightLabel}>EST. DURATION</Text>
                  <View style={styles.durationValueRow}>
                    <Clock size={16} color={NexoraColors.primary} />
                    <Text style={styles.durationBigVal}>
                      {service.duration ? `${service.duration} mins` : 'Flexible'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Tiered Packages (if any) */}
            {Array.isArray(service.packages) && service.packages.length > 0 && (
              <View style={styles.cardSection}>
                <View style={styles.packagesHeaderRow}>
                  <Layers size={16} color={NexoraColors.primary} />
                  <Text style={styles.fieldSectionTitle}>Service Packages ({service.packages.length})</Text>
                </View>

                {service.packages.map((pkg, idx) => (
                  <View key={pkg._id || idx} style={styles.packageCard}>
                    <View style={styles.packageCardHeader}>
                      <Text style={styles.packageName}>{pkg.name}</Text>
                      <Text style={styles.packagePrice}>${Number(pkg.price).toFixed(2)}</Text>
                    </View>
                    {pkg.description ? (
                      <Text style={styles.packageDesc}>{pkg.description}</Text>
                    ) : null}
                    {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                      <View style={styles.featuresList}>
                        {pkg.features.map((feat, fIdx) => (
                          <View key={fIdx} style={styles.featureItemRow}>
                            <Sparkles size={12} color="#059669" />
                            <Text style={styles.featureItemText}>{feat}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Service Location & Coverage */}
            <View style={styles.cardSection}>
              <Text style={styles.fieldSectionTitle}>Coverage Area & Radius</Text>
              <View style={styles.locationInfoRow}>
                <View style={styles.locationIconBox}>
                  <MapPin size={20} color={NexoraColors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.locationCityText}>{locationString}</Text>
                  <Text style={styles.locationRadiusText}>
                    {loc.serviceRadiusMiles || loc.serviceRadiusKm
                      ? `Dispatches within ${loc.serviceRadiusMiles || loc.serviceRadiusKm} miles coverage radius`
                      : 'Metro-wide on-site service'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Additional Photos Gallery (if any) */}
            {Array.isArray(service.images) && service.images.length > 1 && (
              <View style={styles.cardSection}>
                <Text style={styles.fieldSectionTitle}>Work Samples Gallery</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  <View style={styles.galleryRow}>
                    {service.images.slice(1).map((img, idx) => (
                      <Image key={idx} source={{ uri: img.url }} style={styles.galleryImg} />
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            {onDelete ? (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  onClose();
                  onDelete(service);
                }}
                activeOpacity={0.8}
              >
                <Trash2 size={16} color="#ef4444" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            ) : null}

            {onEdit ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  onClose();
                  onEdit(service);
                }}
                activeOpacity={0.8}
              >
                <Pencil size={15} color={NexoraColors.primary} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.closeFullBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.closeFullBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end'
  },
  sheetContainer: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 16 : 8
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: 12
  },
  sheetHeaderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrollBody: {
    padding: 16
  },
  bannerWrap: {
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  bannerImg: {
    width: '100%',
    height: '100%'
  },
  bannerFallback: {
    height: 120,
    borderRadius: 14,
    backgroundColor: '#eef5fc',
    borderWidth: 1,
    borderColor: '#bdd8f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    position: 'relative'
  },
  statusBadgeOverlay: {
    position: 'absolute',
    top: 10,
    right: 10
  },
  cardSection: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.card
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 24
  },
  tradePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap'
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#eef5fc',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bdd8f2'
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: NexoraColors.primary
  },
  subcatPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  subcatPillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600'
  },
  fieldSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#64748b',
    marginBottom: 8
  },
  descriptionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20
  },
  priceDurationRow: {
    flexDirection: 'row',
    gap: 12
  },
  priceHighlightBox: {
    flex: 1.3,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  priceHighlightLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b'
  },
  priceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4
  },
  priceBigVal: {
    fontSize: 22,
    fontWeight: '800',
    color: NexoraColors.primary
  },
  priceSuffix: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600'
  },
  durationHighlightBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  durationHighlightLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b'
  },
  durationValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6
  },
  durationBigVal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a'
  },
  packagesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10
  },
  packageCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8
  },
  packageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  packageName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669'
  },
  packageDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4
  },
  featuresList: {
    marginTop: 6,
    gap: 4
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  featureItemText: {
    fontSize: 12,
    color: '#334155'
  },
  locationInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2
  },
  locationIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eef5fc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bdd8f2'
  },
  locationCityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  locationRadiusText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  galleryRow: {
    flexDirection: 'row',
    gap: 10
  },
  galleryImg: {
    width: 90,
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  deleteButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444'
  },
  editButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.primary
  },
  closeFullBtn: {
    flex: 1.5,
    height: 42,
    borderRadius: 10,
    backgroundColor: NexoraColors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeFullBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff'
  }
});

export default ServiceDetailsModal;

