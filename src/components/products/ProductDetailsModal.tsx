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
  ActivityIndicator
} from 'react-native';
import {
  X,
  Package,
  DollarSign,
  Tag,
  Trash2,
  Boxes,
  Truck,
  Store,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Plus
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Product } from '@/services/productService';
import { useSystemSettings } from '@/context/SystemSettingsContext';

interface ProductDetailsModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onDelete?: (product: Product) => void;
  onStockChange?: (product: Product, delta: number) => void;
  isUpdatingStock?: boolean;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  visible,
  product,
  onClose,
  onDelete,
  onStockChange,
  isUpdatingStock = false
}) => {
  const { settings } = useSystemSettings();
  if (!product) return null;

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url;

  const categoryName =
    typeof product.category === 'object' && product.category?.name
      ? product.category.name
      : product.categoryName || 'General Product';

  const effectiveThreshold = product.lowStockThreshold || settings.lowStockThreshold || 5;
  const isOutOfStock = (product.stock || 0) <= 0;
  const isLowStock = !isOutOfStock && (product.stock || 0) <= effectiveThreshold;

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const fulfillment = product.fulfillment || {};

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.sheetHeaderLabel}>PRODUCT SKU DETAILS</Text>
              <Text style={styles.sheetTitle} numberOfLines={1}>
                {product.name}
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
                  <StatusBadge status={product.status || 'active'} />
                </View>
              </View>
            ) : (
              <View style={styles.bannerFallback}>
                <Package size={42} color={NexoraColors.primary} />
                <View style={styles.statusBadgeOverlay}>
                  <StatusBadge status={product.status || 'active'} />
                </View>
              </View>
            )}

            {/* Core Info Section */}
            <View style={styles.cardSection}>
              <Text style={styles.productTitle}>{product.name}</Text>

              {/* Category, Subcategory & SKU row */}
              <View style={styles.pillsRow}>
                <View style={styles.categoryPill}>
                  <Package size={13} color={NexoraColors.primary} />
                  <Text style={styles.categoryPillText}>{categoryName}</Text>
                </View>

                {product.subcategory ? (
                  <View style={styles.subcatPill}>
                    <Text style={styles.subcatPillText}>{product.subcategory}</Text>
                  </View>
                ) : null}

                <View style={styles.skuPill}>
                  <Tag size={11} color="#64748b" />
                  <Text style={styles.skuPillText}>SKU: {product.sku || 'NX-SKU'}</Text>
                </View>
              </View>

              {/* Product Description */}
              {product.description ? (
                <View style={{ marginTop: 14 }}>
                  <Text style={styles.fieldSectionTitle}>Description & Specifications</Text>
                  <Text style={styles.descriptionText}>{product.description}</Text>
                </View>
              ) : null}
            </View>

            {/* Pricing Section */}
            <View style={styles.cardSection}>
              <Text style={styles.fieldSectionTitle}>Retail Pricing</Text>

              <View style={styles.priceRow}>
                <View style={styles.priceHighlightBox}>
                  <Text style={styles.priceHighlightLabel}>CURRENT RETAIL PRICE</Text>
                  <View style={styles.priceValueRow}>
                    <Text style={styles.priceBigVal}>${Number(product.price).toFixed(2)}</Text>
                    {discountPercent ? (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountBadgeText}>Save {discountPercent}%</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) ? (
                  <View style={styles.compareHighlightBox}>
                    <Text style={styles.compareHighlightLabel}>MSRP / COMPARE AT</Text>
                    <Text style={styles.comparePriceVal}>${Number(product.compareAtPrice).toFixed(2)}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Inventory & Real-Time Stock Management */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Boxes size={16} color={NexoraColors.primary} />
                  <Text style={styles.fieldSectionTitle}>Inventory & Stock</Text>
                </View>

                {/* Stock Status Badge */}
                <View
                  style={[
                    styles.stockStatusBadge,
                    isOutOfStock
                      ? { backgroundColor: '#fee2e2' }
                      : isLowStock
                      ? { backgroundColor: '#fef3c7' }
                      : { backgroundColor: '#ecfdf5' }
                  ]}
                >
                  <Text
                    style={[
                      styles.stockStatusText,
                      isOutOfStock
                        ? { color: '#b91c1c' }
                        : isLowStock
                        ? { color: '#b45309' }
                        : { color: '#047857' }
                    ]}
                  >
                    {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                  </Text>
                </View>
              </View>

              <View style={styles.inventoryControlRow}>
                <View>
                  <Text style={styles.stockQuantityLabel}>Units Available</Text>
                  <Text style={[styles.stockQuantityNumber, isOutOfStock && { color: '#ef4444' }]}>
                    {product.stock}
                  </Text>
                </View>

                {/* Inline Quick Stepper */}
                {onStockChange ? (
                  <View style={styles.stepperWrap}>
                    <TouchableOpacity
                      style={[styles.stepperBtn, (product.stock <= 0 || isUpdatingStock) && styles.stepperBtnDisabled]}
                      onPress={() => onStockChange(product, -1)}
                      disabled={product.stock <= 0 || isUpdatingStock}
                      activeOpacity={0.7}
                    >
                      <Minus size={15} color={product.stock <= 0 || isUpdatingStock ? '#cbd5e1' : '#0f172a'} />
                    </TouchableOpacity>

                    <View style={styles.stepperCountBox}>
                      {isUpdatingStock ? (
                        <ActivityIndicator size="small" color={NexoraColors.primary} />
                      ) : (
                        <Text style={styles.stepperCountVal}>{product.stock}</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[styles.stepperBtn, isUpdatingStock && styles.stepperBtnDisabled]}
                      onPress={() => onStockChange(product, 1)}
                      disabled={isUpdatingStock}
                      activeOpacity={0.7}
                    >
                      <Plus size={15} color={isUpdatingStock ? '#cbd5e1' : '#0f172a'} />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>

              <Text style={styles.stockSubtext}>
                Low stock threshold configured at {effectiveThreshold} units.
              </Text>
            </View>

            {/* Fulfillment & Logistics */}
            <View style={styles.cardSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Truck size={16} color={NexoraColors.primary} />
                <Text style={styles.fieldSectionTitle}>Fulfillment Options</Text>
              </View>

              <View style={styles.fulfillmentList}>
                {/* Store Pickup */}
                <View style={styles.fulfillmentItem}>
                  <View style={[styles.fulfillmentIcon, fulfillment.pickup ? styles.fulfillmentIconActive : null]}>
                    <Store size={16} color={fulfillment.pickup ? '#059669' : '#94a3b8'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fulfillmentTitle}>Customer Store Pickup</Text>
                    <Text style={styles.fulfillmentDesc}>
                      {fulfillment.pickup
                        ? 'Available for on-site counter pickup at your workshop'
                        : 'Store pickup currently disabled'}
                    </Text>
                  </View>
                  <CheckCircle2 size={16} color={fulfillment.pickup ? '#059669' : '#cbd5e1'} />
                </View>

                {/* Local Delivery */}
                <View style={styles.fulfillmentItem}>
                  <View style={[styles.fulfillmentIcon, fulfillment.localDelivery ? styles.fulfillmentIconActive : null]}>
                    <Truck size={16} color={fulfillment.localDelivery ? '#059669' : '#94a3b8'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fulfillmentTitle}>Local Direct Delivery</Text>
                    <Text style={styles.fulfillmentDesc}>
                      {fulfillment.localDelivery
                        ? `Delivery enabled (${fulfillment.deliveryFee ? `$${Number(fulfillment.deliveryFee).toFixed(2)} delivery fee` : 'Free local delivery'})`
                        : 'Local delivery currently disabled'}
                    </Text>
                  </View>
                  <CheckCircle2 size={16} color={fulfillment.localDelivery ? '#059669' : '#cbd5e1'} />
                </View>

                {/* Shipping */}
                <View style={styles.fulfillmentItem}>
                  <View style={[styles.fulfillmentIcon, fulfillment.shipping ? styles.fulfillmentIconActive : null]}>
                    <Package size={16} color={fulfillment.shipping ? '#059669' : '#94a3b8'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fulfillmentTitle}>Nationwide Parcel Shipping</Text>
                    <Text style={styles.fulfillmentDesc}>
                      {fulfillment.shipping
                        ? 'Standard carrier parcel delivery supported'
                        : 'Parcel shipping not offered for this SKU'}
                    </Text>
                  </View>
                  <CheckCircle2 size={16} color={fulfillment.shipping ? '#059669' : '#cbd5e1'} />
                </View>
              </View>
            </View>

            {/* Additional Photos Gallery (if any) */}
            {Array.isArray(product.images) && product.images.length > 1 && (
              <View style={styles.cardSection}>
                <Text style={styles.fieldSectionTitle}>Product Photos ({product.images.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                  <View style={styles.galleryRow}>
                    {product.images.slice(1).map((img, idx) => (
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
                  onDelete(product);
                }}
                activeOpacity={0.8}
              >
                <Trash2 size={16} color="#ef4444" />
                <Text style={styles.deleteButtonText}>Delete SKU</Text>
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
    maxHeight: '92%',
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
    color: NexoraColors.primary,
    letterSpacing: 0.8,
    marginBottom: 2
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a'
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
    width: '100%',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    marginBottom: 14,
    position: 'relative'
  },
  bannerImg: {
    width: '100%',
    height: '100%'
  },
  bannerFallback: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    backgroundColor: '#eef5fc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    position: 'relative'
  },
  statusBadgeOverlay: {
    position: 'absolute',
    top: 12,
    right: 12
  },
  cardSection: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.card
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 24
  },
  pillsRow: {
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
    borderRadius: 8
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
    borderRadius: 8
  },
  subcatPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  skuPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  skuPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b'
  },
  fieldSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#475569'
  },
  descriptionText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 20,
    marginTop: 6
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10
  },
  priceHighlightBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  priceHighlightLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  priceValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  priceBigVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a'
  },
  discountBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0'
  },
  discountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669'
  },
  compareHighlightBox: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center'
  },
  compareHighlightLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  comparePriceVal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94a3b8',
    textDecorationLine: 'line-through'
  },
  stockStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full
  },
  stockStatusText: {
    fontSize: 11,
    fontWeight: '700'
  },
  inventoryControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  stockQuantityLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  stockQuantityNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.sm
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepperBtnDisabled: {
    opacity: 0.4
  },
  stepperCountBox: {
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6
  },
  stepperCountVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  stockSubtext: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 8
  },
  fulfillmentList: {
    gap: 10
  },
  fulfillmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  fulfillmentIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fulfillmentIconActive: {
    backgroundColor: '#ecfdf5'
  },
  fulfillmentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  fulfillmentDesc: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 1
  },
  galleryRow: {
    flexDirection: 'row',
    gap: 10
  },
  galleryImg: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#e2e8f0'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff'
  },
  deleteButton: {
    flex: 1,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2'
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444'
  },
  closeFullBtn: {
    flex: 2,
    height: 42,
    backgroundColor: NexoraColors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeFullBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff'
  }
});

export default ProductDetailsModal;

