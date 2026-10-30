import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Package,
  Plus,
  Tag,
  Boxes,
  CheckCircle2,
  DollarSign,
  X,
  ShoppingBag,
  Layers,
  ArrowRight
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexoraInput } from '@/components/common/NexoraInput';
import { NexoraButton } from '@/components/common/NexoraButton';

interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  commission: string;
  status: 'active' | 'in_review';
}

export default function CatalogScreen() {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: 'prod_1',
      name: 'Commercial Grade PEX-A Pipe Coil (100ft)',
      category: 'Plumbing Fixtures & Supplies',
      price: '$89.00',
      stock: 42,
      commission: '10%',
      status: 'active',
    },
    {
      id: 'prod_2',
      name: 'Brass Ball Valve 3/4" Full Port (Pack of 5)',
      category: 'Plumbing Fixtures & Supplies',
      price: '$45.50',
      stock: 18,
      commission: '10%',
      status: 'active',
    },
    {
      id: 'prod_3',
      name: 'Digital Water Pressure Gauge (0-160 PSI)',
      category: 'Power Tools & Equipment',
      price: '$34.00',
      stock: 9,
      commission: '10%',
      status: 'in_review',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Plumbing Fixtures & Supplies');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('20');

  const handleAddProduct = () => {
    if (!newName.trim() || !newPrice.trim()) {
      Alert.alert('Required Fields', 'Please enter product name and retail price.');
      return;
    }

    const newItem: ProductItem = {
      id: 'prod_' + Date.now().toString(36),
      name: newName.trim(),
      category: newCategory,
      price: `$${parseFloat(newPrice).toFixed(2)}`,
      stock: parseInt(newStock, 10) || 1,
      commission: '10%',
      status: 'active',
    };

    setProducts((prev) => [newItem, ...prev]);
    setNewName('');
    setNewPrice('');
    setNewStock('20');
    setModalVisible(false);
    Alert.alert('Product Published', 'Item is now live in the Nexora physical goods marketplace catalog!');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 26 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Physical Goods Storefront</Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              Manage multi-vendor catalog inventory & seller fulfillment
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Plus size={15} color="#ffffff" strokeWidth={2.5} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 95 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Catalog Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{products.length}</Text>
            <Text style={styles.summaryLabel}>Active SKUs</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>
              {products.reduce((acc, p) => acc + p.stock, 0)}
            </Text>
            <Text style={styles.summaryLabel}>Units in Stock</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>10%</Text>
            <Text style={styles.summaryLabel}>Platform Fee</Text>
          </View>
        </View>

        {/* Product Cards List */}
        <Text style={styles.listHeading}>Inventory Catalog ({products.length})</Text>

        {products.map((item) => (
          <View key={item.id} style={styles.productCard}>
            <View style={styles.productTop}>
              <View style={styles.productIconBox}>
                <Package size={20} color={NexoraColors.primary} />
              </View>

              <View style={styles.productMeta}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.productCategoryRow}>
                  <Tag size={12} color={NexoraColors.textMuted} />
                  <Text style={styles.productCategoryText}>{item.category}</Text>
                </View>
              </View>

              <Text style={styles.productPrice}>{item.price}</Text>
            </View>

            <View style={styles.productBottom}>
              <View style={styles.stockBadge}>
                <Boxes size={12} color={NexoraColors.textSecondary} />
                <Text style={styles.stockText}>{item.stock} in stock</Text>
              </View>

              <View style={styles.commissionTag}>
                <Text style={styles.commissionText}>Fee: {item.commission}</Text>
              </View>

              <View
                style={[
                  styles.statusTag,
                  item.status === 'active'
                    ? { backgroundColor: NexoraColors.statusApprovedBg }
                    : { backgroundColor: NexoraColors.statusPendingBg },
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    item.status === 'active'
                      ? { color: NexoraColors.statusApproved }
                      : { color: NexoraColors.statusPending },
                  ]}
                >
                  {item.status === 'active' ? 'Live in Store' : 'Pending Audit'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Product Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>List Physical Product</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={NexoraColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
              showsVerticalScrollIndicator={false}
            >
              <NexoraInput
                label="Product Title"
                placeholder="e.g. Copper Pipe Fitting Kit (1/2 in)"
                value={newName}
                onChangeText={setNewName}
              />

              <NexoraInput
                label="Product Category"
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="Plumbing Fixtures & Supplies"
              />

              <View style={styles.modalRow}>
                <View style={{ flex: 1 }}>
                  <NexoraInput
                    label="Retail Price ($)"
                    placeholder="49.99"
                    value={newPrice}
                    onChangeText={setNewPrice}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <NexoraInput
                    label="Stock Quantity"
                    placeholder="25"
                    value={newStock}
                    onChangeText={setNewStock}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <NexoraButton
                title="Publish Product to Storefront"
                onPress={handleAddProduct}
                style={{ marginTop: 12 }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
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
    lineHeight: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: NexoraColors.primary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    flexShrink: 0,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    marginBottom: 20,
    ...Shadows.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryVal: {
    fontSize: 18,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  summaryLabel: {
    fontSize: 11,
    color: NexoraColors.textMuted,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: '80%',
    backgroundColor: NexoraColors.border,
    alignSelf: 'center',
  },
  listHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    marginBottom: 12,
    ...Shadows.sm,
  },
  productTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: NexoraColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  productMeta: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    lineHeight: 18,
  },
  productCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  productCategoryText: {
    fontSize: 11,
    color: NexoraColors.textMuted,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: NexoraColors.primary,
    marginLeft: 8,
  },
  productBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
    fontWeight: '500',
  },
  commissionTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  commissionText: {
    fontSize: 11,
    color: NexoraColors.textMuted,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalDialog: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: NexoraColors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  modalBody: {
    paddingBottom: 24,
  },
  modalRow: {
    flexDirection: 'row',
  },
});
