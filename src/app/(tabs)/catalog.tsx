import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Wrench,
  Package,
  Plus,
  Tag,
  Boxes,
  Check,
  CheckCircle2,
  DollarSign,
  X,
  Search,
  AlertTriangle,
  Trash2,
  Truck,
  Building2,
  Layers,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  Barcode,
  Camera,
  Image as ImageIcon,
  Minus
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { NexoraInput } from '@/components/common/NexoraInput';
import { NexoraButton } from '@/components/common/NexoraButton';
import productService, { Product, CreateProductInput } from '@/services/productService';
import categoryService, { ProductCategory } from '@/services/categoryService';
import { ProductCardSkeleton } from '@/components/common/NexoraShimmer';
import { useAuth } from '@/context/AuthContext';
import { useSystemSettings } from '@/context/SystemSettingsContext';
import { ServiceCatalogSection } from '@/components/services/ServiceCatalogSection';
import { ProductDetailsModal } from '@/components/products/ProductDetailsModal';

export default function CatalogScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { provider } = useAuth();
  const { settings } = useSystemSettings();

  // Partner Capabilities & Profile-type checks
  const partnerType = provider?.partnerType || 'both';
  const isServiceProvider = partnerType === 'service_provider' || partnerType === 'both';
  const isProductSeller = partnerType === 'product_seller' || partnerType === 'both';
  const isHybrid = partnerType === 'both';

  const [activeCatalogTab, setActiveCatalogTab] = useState<'services' | 'products'>(() => {
    if (!isProductSeller) return 'services';
    if (!isServiceProvider) return 'products';
    if (params.tab === 'services' || params.action === 'new_service') return 'services';
    if (params.tab === 'products' || params.action === 'new') return 'products';
    return 'services';
  });

  useEffect(() => {
    if (!isProductSeller) {
      setActiveCatalogTab('services');
    } else if (!isServiceProvider) {
      setActiveCatalogTab('products');
    } else if (params.tab === 'services' || params.action === 'new_service') {
      setActiveCatalogTab('services');
    } else if (params.tab === 'products' || params.action === 'new') {
      setActiveCatalogTab('products');
    }
  }, [params.tab, params.action, isProductSeller, isServiceProvider]);

  const [postServiceTrigger, setPostServiceTrigger] = useState(false);

  // Trade Services States
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [selectedServiceCatId, setSelectedServiceCatId] = useState<string>('all');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [serviceStats, setServiceStats] = useState({ total: 0, active: 0, inReview: 0, inactive: 0 });

  // Load Service Categories on mount (Only if provider has service capability)
  useEffect(() => {
    if (isServiceProvider) {
      categoryService
        .getServiceCategories()
        .then((sc) => setServiceCategories(sc || []))
        .catch((err) => console.warn('Failed to load service categories:', err?.message));
    }
  }, [isServiceProvider]);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stockUpdatingId, setStockUpdatingId] = useState<string | null>(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);

  // Screen Filters & Debouncing
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Server-level inventory aggregation KPIs
  const [sellerStats, setSellerStats] = useState({
    total: 0,
    totalUnits: 0,
    inStock: 0,
    lowStock: 0,
  });

  // Debounce search query to search across entire database on server
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formComparePrice, setFormComparePrice] = useState('');
  const [formStock, setFormStock] = useState('20');
  const [formLowStock, setFormLowStock] = useState(String(settings.lowStockThreshold || 5));
  const [formFeaturedImage, setFormFeaturedImage] = useState<string | null>(null);
  const [formGalleryImages, setFormGalleryImages] = useState<string[]>([]);
  const [formPickup, setFormPickup] = useState(true);
  const [formDelivery, setFormDelivery] = useState(false);
  const [formDeliveryFee, setFormDeliveryFee] = useState('10');
  const [formShipping, setFormShipping] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Autocomplete Category Dropdown in Modal
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [catSearchQuery, setCatSearchQuery] = useState('');

  // Auto-open modal if triggered via Quick Action (?action=new)
  useEffect(() => {
    if (params.action === 'new') {
      setModalVisible(true);
    }
  }, [params.action]);

  // Load Store Categories on mount (Only if provider has product seller capability)
  useEffect(() => {
    if (isProductSeller) {
      categoryService
        .getProductCategories()
        .then((cats) => {
          setCategories(cats || []);
          setFormCategoryId((prev) => {
            if (!prev && cats && cats.length > 0) {
              const sub = cats[0].subcategories?.[0]?.name || '';
              setFormSubcategory(sub);
              return cats[0]._id;
            }
            return prev;
          });
        })
        .catch((err) => console.warn('Failed to load categories:', err?.message));
    }
  }, [isProductSeller]);

  // Fetch Products & Aggregation Stats directly from Server with server-level filters
  const fetchProducts = useCallback(async (search: string, catId: string) => {
    try {
      const prodRes = await productService.getMyProducts({
        search: search.trim() || undefined,
        category: catId !== 'all' ? catId : undefined,
        limit: 50,
      });

      setProducts(prodRes?.products || []);
      if (prodRes?.stats) {
        setSellerStats(prodRes.stats);
      }
    } catch (err: any) {
      console.warn('Failed to load seller products from server:', err?.message);
    }
  }, []);

  useEffect(() => {
    if (isProductSeller) {
      setLoading(true);
      fetchProducts(debouncedSearch, selectedCategoryId).finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
    }
  }, [debouncedSearch, selectedCategoryId, fetchProducts, isProductSeller]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(debouncedSearch, selectedCategoryId).finally(() => {
      setRefreshing(false);
    });
  };

  // Pick Featured Cover Photo (Required)
  const handlePickFeaturedImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Camera roll access is needed to attach photos to your product listings.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormFeaturedImage(result.assets[0].uri);
        if (formErrors.featuredImage) {
          setFormErrors((prev) => ({ ...prev, featuredImage: '' }));
        }
      }
    } catch (err: any) {
      Alert.alert('Image Error', err?.message || 'Could not pick featured photo.');
    }
  };

  const handleRemoveFeaturedImage = () => {
    setFormFeaturedImage(null);
  };

  // Pick Optional Gallery Photos (Up to 5)
  const handlePickGalleryImage = async () => {
    if (formGalleryImages.length >= 5) {
      Alert.alert('Maximum Limit', 'You can upload up to 5 optional gallery photos.');
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Camera roll access is needed to attach photos to your product listings.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setFormGalleryImages((prev) => [...prev, uri]);
      }
    } catch (err: any) {
      Alert.alert('Image Error', err?.message || 'Could not pick gallery photo.');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Quick Stock Step (+1 or -1)
  const handleStockDelta = async (product: Product, delta: number) => {
    setStockUpdatingId(product._id);
    try {
      const updated = await productService.updateStock(product._id, { delta });
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, stock: updated.stock, status: updated.status } : p))
      );
      setSelectedDetailProduct((prev) =>
        prev && prev._id === product._id ? { ...prev, stock: updated.stock, status: updated.status } : prev
      );
      fetchProducts(debouncedSearch, selectedCategoryId);
    } catch (err: any) {
      Alert.alert('Update Failed', err?.response?.data?.message || err?.message || 'Could not update stock.');
    } finally {
      setStockUpdatingId(null);
    }
  };

  // Delete Product Listing
  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to remove "${product.name}" from your storefront?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.deleteProduct(product._id);
              setProducts((prev) => prev.filter((p) => p._id !== product._id));
              if (selectedDetailProduct?._id === product._id) {
                setSelectedDetailProduct(null);
              }
              fetchProducts(debouncedSearch, selectedCategoryId);
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to delete product.');
            }
          },
        },
      ]
    );
  };

  // Create Product Handler with Strict Missing Field Alerts
  const handleCreateProduct = async () => {
    const errors: Record<string, string> = {};
    const missing: string[] = [];

    // 1. Featured Cover Image (Required)
    if (!formFeaturedImage) {
      errors.featuredImage = 'Product featured cover image is required';
      missing.push('Product Featured Image');
    }

    // 2. Product Title (Required)
    if (!formName.trim()) {
      errors.name = 'Product title is required';
      missing.push('Product Title');
    }

    // 3. Store Category (Required)
    if (!formCategoryId) {
      errors.category = 'Store category selection is required';
      missing.push('Store Category');
    }

    // 4. Retail Price (Required)
    if (!formPrice.trim() || isNaN(Number(formPrice)) || Number(formPrice) <= 0) {
      errors.price = 'Valid retail price greater than $0 is required';
      missing.push('Retail Price ($)');
    }

    // 5. Initial Stock (Required)
    if (!formStock.trim() || isNaN(Number(formStock)) || Number(formStock) < 0) {
      errors.stock = 'Valid stock quantity (0 or higher) is required';
      missing.push('Initial Stock Quantity');
    }

    // Trigger clear alert if any required field was omitted
    if (missing.length > 0) {
      setFormErrors(errors);
      Alert.alert(
        'Required Fields Missing',
        `Please complete the following required fields before publishing:\n\n• ${missing.join('\n• ')}`,
        [{ text: 'OK' }]
      );
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      // 1. Upload Featured Cover Image (Cloudinary via backend if local file URI)
      let primaryUrl = formFeaturedImage!;
      let primaryPublicId: string | undefined = undefined;
      if (
        formFeaturedImage &&
        (formFeaturedImage.startsWith('file:') ||
          formFeaturedImage.startsWith('content:') ||
          formFeaturedImage.startsWith('ph:'))
      ) {
        const uploadRes = await productService.uploadProductImage(formFeaturedImage);
        primaryUrl = uploadRes.url;
        primaryPublicId = uploadRes.publicId;
      }

      // 2. Upload Optional Gallery Images (Cloudinary via backend if local file URI)
      const galleryUploaded = await Promise.all(
        formGalleryImages.map(async (uri) => {
          if (uri.startsWith('file:') || uri.startsWith('content:') || uri.startsWith('ph:')) {
            const uploadRes = await productService.uploadProductImage(uri);
            return { url: uploadRes.url, publicId: uploadRes.publicId, isPrimary: false };
          }
          return { url: uri, isPrimary: false };
        })
      );

      const imagesPayload = [
        { url: primaryUrl, publicId: primaryPublicId, isPrimary: true },
        ...galleryUploaded,
      ];

      const payload: CreateProductInput = {
        name: formName.trim(),
        description: formDescription.trim(),
        categoryId: formCategoryId,
        subcategory: formSubcategory.trim(),
        price: parseFloat(formPrice),
        compareAtPrice: formComparePrice.trim() ? parseFloat(formComparePrice) : null,
        stock: parseInt(formStock, 10) || 0,
        lowStockThreshold: parseInt(formLowStock, 10) || settings.lowStockThreshold || 5,
        images: imagesPayload,
        fulfillment: {
          pickup: formPickup,
          localDelivery: formDelivery,
          shipping: formShipping,
          deliveryFee: formDelivery ? parseFloat(formDeliveryFee) || 0 : 0,
        },
      };

      const created = await productService.createProduct(payload);
      fetchProducts(debouncedSearch, selectedCategoryId);

      // Reset form
      setFormName('');
      setFormDescription('');
      setFormSku('');
      setFormPrice('');
      setFormComparePrice('');
      setFormStock('20');
      setFormLowStock(String(settings.lowStockThreshold || 5));
      setFormFeaturedImage(null);
      setFormGalleryImages([]);
      setCatDropdownOpen(false);
      setCatSearchQuery('');
      setModalVisible(false);

      Alert.alert('Product Published', `"${created.name}" is now live in your Nexora storefront!`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to publish product SKU.';
      Alert.alert('Error Publishing SKU', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered categories for autocomplete dropdown in modal
  const filteredModalCategories = useMemo(() => {
    if (!catSearchQuery.trim()) return categories;
    const q = catSearchQuery.toLowerCase().trim();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, catSearchQuery]);

  // Selected Category Object
  const selectedCategoryObj = categories.find((c) => c._id === formCategoryId);

  // Server-level aggregated KPIs across all seller listings
  const totalUnits = sellerStats.totalUnits;
  const lowStockCount = sellerStats.lowStock;
  const totalSkus = sellerStats.total || products.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 16 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>
              {activeCatalogTab === 'services' ? 'Services & Offerings' : 'Physical Storefront'}
            </Text>
            <Text style={styles.subtitle}>
              {activeCatalogTab === 'services'
                ? 'Manage trade offerings, hourly rates & service radius'
                : 'Manage inventory, live retail pricing & order fulfillment'}
            </Text>
          </View>

          {activeCatalogTab === 'products' ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#ffffff" strokeWidth={2.5} />
              <Text style={styles.addBtnText}>Add SKU</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setPostServiceTrigger(true)}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#ffffff" strokeWidth={2.5} />
              <Text style={styles.addBtnText}>Post Service</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Segmented Switcher for Services vs Products (Only for Hybrid Providers) */}
        {isHybrid && (
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                activeCatalogTab === 'services' && styles.segmentBtnActive,
              ]}
              onPress={() => setActiveCatalogTab('services')}
              activeOpacity={0.8}
            >
              <Wrench
                size={15}
                color={activeCatalogTab === 'services' ? '#ffffff' : '#94a3b8'}
              />
              <Text
                style={[
                  styles.segmentBtnText,
                  activeCatalogTab === 'services' && styles.segmentBtnTextActive,
                ]}
              >
                Trade Services
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentBtn,
                activeCatalogTab === 'products' && styles.segmentBtnActive,
              ]}
              onPress={() => setActiveCatalogTab('products')}
              activeOpacity={0.8}
            >
              <Package
                size={15}
                color={activeCatalogTab === 'products' ? '#ffffff' : '#94a3b8'}
              />
              <Text
                style={[
                  styles.segmentBtnText,
                  activeCatalogTab === 'products' && styles.segmentBtnTextActive,
                ]}
              >
                Physical Goods
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Bar (Both Tabs) */}
        <View style={styles.searchBar}>
          <Search size={16} color={NexoraColors.textMuted} />
          {activeCatalogTab === 'services' ? (
            <>
              <TextInput
                style={styles.searchInput}
                placeholder="Search trade services, offerings..."
                placeholderTextColor={NexoraColors.textMuted}
                value={serviceSearchQuery}
                onChangeText={setServiceSearchQuery}
              />
              {serviceSearchQuery ? (
                <TouchableOpacity onPress={() => setServiceSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={16} color={NexoraColors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </>
          ) : (
            <>
              <TextInput
                style={styles.searchInput}
                placeholder="Search products, SKU or parts..."
                placeholderTextColor={NexoraColors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={16} color={NexoraColors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </>
          )}
        </View>

        {/* Category Filter Pills (Both Tabs) */}
        {activeCatalogTab === 'services' ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPillRow}
          >
            <TouchableOpacity
              style={[styles.catPill, selectedServiceCatId === 'all' && styles.catPillActive]}
              onPress={() => setSelectedServiceCatId('all')}
            >
              <Text style={[styles.catPillText, selectedServiceCatId === 'all' && styles.catPillTextActive]}>
                All ({serviceStats.total})
              </Text>
            </TouchableOpacity>

            {serviceCategories.map((cat) => {
              const isSelected = selectedServiceCatId === cat._id;
              return (
                <TouchableOpacity
                  key={cat._id}
                  style={[styles.catPill, isSelected && styles.catPillActive]}
                  onPress={() => setSelectedServiceCatId(cat._id)}
                >
                  <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPillRow}
          >
            <TouchableOpacity
              style={[styles.catPill, selectedCategoryId === 'all' && styles.catPillActive]}
              onPress={() => setSelectedCategoryId('all')}
            >
              <Text style={[styles.catPillText, selectedCategoryId === 'all' && styles.catPillTextActive]}>
                All ({totalSkus})
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat._id;
              return (
                <TouchableOpacity
                  key={cat._id}
                  style={[styles.catPill, isSelected && styles.catPillActive]}
                  onPress={() => setSelectedCategoryId(cat._id)}
                >
                  <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Render Active Section */}
      {activeCatalogTab === 'services' ? (
        <ServiceCatalogSection
          searchQuery={serviceSearchQuery}
          selectedCategoryId={selectedServiceCatId}
          onStatsChange={setServiceStats}
          initialOpenModal={params.action === 'new_service' || postServiceTrigger}
          onModalClose={() => setPostServiceTrigger(false)}
          defaultLocation={provider?.serviceArea}
        />
      ) : (
        <>
        <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 95 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NexoraColors.primary} />}
      >
        {/* Catalog Summary KPIs (Aggregated across whole database on server) */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{totalSkus}</Text>
            <Text style={styles.summaryLabel}>Active SKUs</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{totalUnits}</Text>
            <Text style={styles.summaryLabel}>Units in Stock</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, lowStockCount > 0 && { color: '#d97706' }]}>
              {lowStockCount}
            </Text>
            <Text style={styles.summaryLabel}>Low Stock</Text>
          </View>
        </View>

        {/* Product Cards List */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeading}>Storefront Listings ({products.length})</Text>
        </View>

        {loading ? (
          <View>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyBox}>
            <Package size={44} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedCategoryId !== 'all'
                ? 'Try adjusting your search or category filters.'
                : 'Start listing hardware, supplies, and tools to sell in the Nexora marketplace.'}
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalVisible(true)}>
              <Plus size={16} color="#ffffff" />
              <Text style={styles.emptyBtnText}>Add Your First SKU</Text>
            </TouchableOpacity>
          </View>
        ) : (
          products.map((item) => {
            const isOutOfStock = (item.stock || 0) <= 0;
            const threshold = item.lowStockThreshold || settings.lowStockThreshold || 5;
            const isLowStock = !isOutOfStock && (item.stock || 0) <= threshold;
            const isUpdating = stockUpdatingId === item._id;
            const catName =
              typeof item.category === 'object' && item.category?.name
                ? item.category.name
                : categories.find((c) => c._id === (typeof item.category === 'string' ? item.category : item.category?._id))?.name ||
                  item.categoryName ||
                  'General Product';
            const primaryImageUrl = item.images && item.images.length > 0 ? item.images[0]?.url : null;

            return (
              <TouchableOpacity
                key={item._id || item.id}
                style={styles.productCardContainer}
                activeOpacity={0.88}
                onPress={() => setSelectedDetailProduct(item)}
              >
                {/* 1. Card Top Row: Category Tag & Delete Action */}
                <View style={styles.cardTopRow}>
                  <View style={styles.tradeTagWrap}>
                    <Package size={12} color={NexoraColors.primary} />
                    <Text style={styles.cardCategoryText} numberOfLines={1}>
                      {catName}
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
                    onPress={() => handleDeleteProduct(item)}
                    style={styles.deleteBtnRed}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={15} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {/* 2. Card Main: 74x74 Thumbnail + Title + Meta Chips */}
                <View style={styles.cardMainRow}>
                  {primaryImageUrl ? (
                    <Image source={{ uri: primaryImageUrl }} style={styles.cardThumb} resizeMode="cover" />
                  ) : (
                    <View style={styles.cardThumbFallback}>
                      <Package size={26} color={NexoraColors.primary} />
                    </View>
                  )}

                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.name}
                    </Text>

                    {/* Meta Chips: Price, SKU, Stock */}
                    <View style={styles.cardMetaRow}>
                      <View style={styles.pricePill}>
                        <Text style={styles.priceVal}>${Number(item.price).toFixed(2)}</Text>
                        {item.compareAtPrice && Number(item.compareAtPrice) > Number(item.price) ? (
                          <Text style={styles.comparePriceInline}>
                            ${Number(item.compareAtPrice).toFixed(2)}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.metaChip}>
                        <Tag size={10} color="#64748b" />
                        <Text style={styles.metaChipText} numberOfLines={1}>
                          {item.sku || 'NX-SKU'}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.metaChip,
                          isOutOfStock
                            ? { backgroundColor: '#fee2e2' }
                            : isLowStock
                            ? { backgroundColor: '#fef3c7' }
                            : { backgroundColor: '#ecfdf5' }
                        ]}
                      >
                        <Text
                          style={[
                            styles.metaChipText,
                            isOutOfStock
                              ? { color: '#b91c1c' }
                              : isLowStock
                              ? { color: '#b45309' }
                              : { color: '#047857' }
                          ]}
                        >
                          {isOutOfStock ? '0 in stock' : `${item.stock} in stock`}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* 3. Card Footer: Stock Stepper & View Details Prompt */}
                <View style={styles.cardFooterRow}>
                  {/* Stock Stepper */}
                  <View style={styles.stepperWrap}>
                    <Text style={styles.stepperLabel}>Stock:</Text>
                    <TouchableOpacity
                      style={[styles.stepperBtn, (item.stock <= 0 || isUpdating) && styles.stepperBtnDisabled]}
                      onPress={() => handleStockDelta(item, -1)}
                      disabled={item.stock <= 0 || isUpdating}
                    >
                      <Minus size={13} color={item.stock <= 0 || isUpdating ? '#cbd5e1' : '#0f172a'} />
                    </TouchableOpacity>

                    <View style={styles.stockCountBox}>
                      {isUpdating ? (
                        <ActivityIndicator size="small" color={NexoraColors.primary} />
                      ) : (
                        <Text style={[styles.stockCountText, isOutOfStock && { color: NexoraColors.statusRejected }]}>
                          {item.stock}
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[styles.stepperBtn, isUpdating && styles.stepperBtnDisabled]}
                      onPress={() => handleStockDelta(item, 1)}
                      disabled={isUpdating}
                    >
                      <Plus size={13} color={isUpdating ? '#cbd5e1' : '#0f172a'} />
                    </TouchableOpacity>
                  </View>

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

      {/* Add Product Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>List Physical Product</Text>
                <Text style={styles.modalSubtitle}>Publish new trade supplies or hardware to the store</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setFormErrors({});
                  setCatDropdownOpen(false);
                }}
              >
                <X size={20} color={NexoraColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
              showsVerticalScrollIndicator={false}
            >
              {/* 1. Featured Cover Image (Required) */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputGroupLabel}>Featured Cover Image</Text>
                  <Text style={styles.requiredAsterisk}> *</Text>
                </View>
                <Text style={styles.fieldHint}>
                  Primary image displayed to buyers in catalog search and product cards.
                </Text>

                {formFeaturedImage ? (
                  <View style={styles.featuredPreviewContainer}>
                    <Image source={{ uri: formFeaturedImage }} style={styles.featuredPreviewImg} resizeMode="cover" />
                    <View style={styles.featuredBadgeOverlay}>
                      <CheckCircle2 size={13} color="#ffffff" />
                      <Text style={styles.featuredBadgeText}>Featured Cover</Text>
                    </View>
                    <View style={styles.featuredActionOverlay}>
                      <TouchableOpacity
                        style={styles.featuredChangeBtn}
                        onPress={handlePickFeaturedImage}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.featuredChangeBtnText}>Change Photo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.featuredRemoveBtn}
                        onPress={handleRemoveFeaturedImage}
                        activeOpacity={0.8}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.featuredUploadBox,
                      Boolean(formErrors.featuredImage) && styles.featuredUploadBoxError,
                    ]}
                    onPress={handlePickFeaturedImage}
                    activeOpacity={0.8}
                  >
                    <View style={styles.featuredIconCircle}>
                      <Camera size={22} color={formErrors.featuredImage ? '#ef4444' : NexoraColors.primary} />
                    </View>
                    <Text
                      style={[
                        styles.featuredUploadTitle,
                        Boolean(formErrors.featuredImage) && styles.featuredUploadTitleError,
                      ]}
                    >
                      Choose Featured Cover Photo *
                    </Text>
                    <Text style={styles.featuredUploadSubtitle}>
                      Required • JPG, PNG or WEBP (1:1 Square recommended)
                    </Text>
                  </TouchableOpacity>
                )}
                {formErrors.featuredImage ? (
                  <Text style={styles.fieldErrorText}>{formErrors.featuredImage}</Text>
                ) : null}
              </View>

              {/* 2. Gallery Images (Optional) */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputGroupLabel}>Gallery Images</Text>
                  <Text style={styles.optionalTag}> (Optional - Up to 5 additional photos)</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                  {formGalleryImages.length < 5 ? (
                    <TouchableOpacity
                      style={styles.uploadPhotoBtn}
                      onPress={handlePickGalleryImage}
                      activeOpacity={0.8}
                    >
                      <Plus size={18} color={NexoraColors.primary} />
                      <Text style={styles.uploadPhotoText}>Add Photo</Text>
                    </TouchableOpacity>
                  ) : null}

                  {formGalleryImages.map((uri, idx) => (
                    <View key={uri + idx} style={styles.photoPreviewCard}>
                      <Image source={{ uri }} style={styles.photoPreviewImg} />
                      <TouchableOpacity
                        style={styles.removePhotoBtn}
                        onPress={() => handleRemoveGalleryImage(idx)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <X size={12} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>

              {/* Product Title (Required) */}
              <NexoraInput
                label="Product Title"
                required
                placeholder="e.g. Commercial Grade PEX-A Pipe Coil (100ft)"
                value={formName}
                onChangeText={(t) => {
                  setFormName(t);
                  if (formErrors.name) setFormErrors((p) => ({ ...p, name: '' }));
                }}
                error={formErrors.name}
              />

              {/* Autocomplete Category Search Dropdown (Required) */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputGroupLabel}>Store Category</Text>
                  <Text style={styles.requiredAsterisk}> *</Text>
                </View>

                {/* Dropdown Toggle Trigger Button */}
                <TouchableOpacity
                  style={[
                    styles.categorySelectBtn,
                    Boolean(formErrors.category) && styles.categorySelectBtnError,
                    catDropdownOpen && styles.categorySelectBtnOpen,
                  ]}
                  onPress={() => setCatDropdownOpen(!catDropdownOpen)}
                  activeOpacity={0.8}
                >
                  <View style={styles.categorySelectLeft}>
                    <Tag size={16} color={selectedCategoryObj ? NexoraColors.primary : NexoraColors.textMuted} />
                    <Text
                      style={[
                        styles.categorySelectText,
                        !selectedCategoryObj && { color: NexoraColors.textMuted },
                      ]}
                      numberOfLines={1}
                    >
                      {selectedCategoryObj ? selectedCategoryObj.name : 'Select or search store category...'}
                    </Text>
                  </View>
                  <ChevronDown
                    size={18}
                    color={NexoraColors.textSecondary}
                    style={{ transform: [{ rotate: catDropdownOpen ? '180deg' : '0deg' }] }}
                  />
                </TouchableOpacity>

                {formErrors.category ? (
                  <Text style={styles.fieldErrorText}>{formErrors.category}</Text>
                ) : null}

                {/* Expandable Autocomplete Dropdown List */}
                {catDropdownOpen ? (
                  <View style={styles.dropdownCard}>
                    <View style={styles.dropdownSearchWrap}>
                      <Search size={15} color={NexoraColors.textMuted} />
                      <TextInput
                        style={styles.dropdownSearchInput}
                        placeholder="Search categories (e.g. Plumbing, Wiring, Tools)..."
                        placeholderTextColor={NexoraColors.textMuted}
                        value={catSearchQuery}
                        onChangeText={setCatSearchQuery}
                        autoFocus
                      />
                      {catSearchQuery ? (
                        <TouchableOpacity onPress={() => setCatSearchQuery('')}>
                          <X size={15} color={NexoraColors.textMuted} />
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    <ScrollView
                      style={styles.dropdownList}
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                    >
                      {filteredModalCategories.length === 0 ? (
                        <View style={styles.dropdownEmpty}>
                          <Text style={styles.dropdownEmptyText}>No matching categories found</Text>
                        </View>
                      ) : (
                        filteredModalCategories.map((c) => {
                          const isSelected = formCategoryId === c._id;
                          return (
                            <TouchableOpacity
                              key={c._id}
                              style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                              onPress={() => {
                                setFormCategoryId(c._id);
                                setCatDropdownOpen(false);
                                setCatSearchQuery('');
                                if (c.subcategories && c.subcategories.length > 0) {
                                  setFormSubcategory(c.subcategories[0].name);
                                } else {
                                  setFormSubcategory('');
                                }
                                if (formErrors.category) {
                                  setFormErrors((prev) => ({ ...prev, category: '' }));
                                }
                              }}
                            >
                              <Text
                                style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}
                              >
                                {c.name}
                              </Text>
                              {isSelected ? <Check size={16} color={NexoraColors.primary} /> : null}
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </ScrollView>
                  </View>
                ) : null}
              </View>

              {/* Subcategories (if available under chosen category) */}
              {selectedCategoryObj?.subcategories && selectedCategoryObj.subcategories.length > 0 ? (
                <View style={styles.formGroup}>
                  <Text style={styles.inputGroupLabel}>Specialty / Subcategory</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalCatScroll}>
                    {selectedCategoryObj.subcategories.map((sub: any) => {
                      const isSelected = formSubcategory === sub.name;
                      return (
                        <TouchableOpacity
                          key={sub.name}
                          style={[styles.modalSubChip, isSelected && styles.modalSubChipActive]}
                          onPress={() => setFormSubcategory(sub.name)}
                        >
                          <Text style={[styles.modalSubChipText, isSelected && styles.modalSubChipTextActive]}>
                            {sub.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}

              {/* Price & MSRP (Price is Required) */}
              <View style={styles.modalRow}>
                <View style={{ flex: 1 }}>
                  <NexoraInput
                    label="Retail Price ($)"
                    required
                    placeholder="89.00"
                    value={formPrice}
                    onChangeText={(t) => {
                      setFormPrice(t);
                      if (formErrors.price) setFormErrors((p) => ({ ...p, price: '' }));
                    }}
                    keyboardType="decimal-pad"
                    error={formErrors.price}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <NexoraInput
                    label="MSRP / Original ($)"
                    placeholder="105.00"
                    value={formComparePrice}
                    onChangeText={setFormComparePrice}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Stock (Required) & Low Stock Alert */}
              <View style={styles.modalRow}>
                <View style={{ flex: 1 }}>
                  <NexoraInput
                    label="Initial Stock"
                    required
                    placeholder="25"
                    value={formStock}
                    onChangeText={(t) => {
                      setFormStock(t);
                      if (formErrors.stock) setFormErrors((p) => ({ ...p, stock: '' }));
                    }}
                    keyboardType="number-pad"
                    error={formErrors.stock}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <NexoraInput
                    label="Low Stock Alert"
                    placeholder={String(settings.lowStockThreshold || 5)}
                    value={formLowStock}
                    onChangeText={setFormLowStock}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <NexoraInput
                label="Product Details / Specifications"
                placeholder="Include dimensions, materials, and warranty information..."
                value={formDescription}
                onChangeText={setFormDescription}
                multiline
                numberOfLines={3}
              />

              {/* Fulfillment Checkboxes */}
              <Text style={styles.inputGroupLabel}>Fulfillment Options</Text>
              <View style={styles.fulfillmentWrap}>
                <TouchableOpacity
                  style={[styles.fulfillmentOption, formPickup && styles.fulfillmentOptionActive]}
                  onPress={() => setFormPickup(!formPickup)}
                >
                  <Building2 size={16} color={formPickup ? NexoraColors.primary : NexoraColors.textSecondary} />
                  <Text style={[styles.fulfillmentText, formPickup && styles.fulfillmentTextActive]}>
                    Store / Yard Pickup
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.fulfillmentOption, formDelivery && styles.fulfillmentOptionActive]}
                  onPress={() => setFormDelivery(!formDelivery)}
                >
                  <Truck size={16} color={formDelivery ? NexoraColors.primary : NexoraColors.textSecondary} />
                  <Text style={[styles.fulfillmentText, formDelivery && styles.fulfillmentTextActive]}>
                    Seller Delivery
                  </Text>
                </TouchableOpacity>
              </View>

              {formDelivery ? (
                <NexoraInput
                  label="Local Delivery Fee ($)"
                  placeholder="15.00"
                  value={formDeliveryFee}
                  onChangeText={setFormDeliveryFee}
                  keyboardType="decimal-pad"
                />
              ) : null}

              <NexoraButton
                title={submitting ? 'Publishing SKU...' : 'Publish Product to Storefront'}
                onPress={handleCreateProduct}
                loading={submitting}
                style={{ marginTop: 14 }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      </>
      )}
      {/* Single Product Details Modal */}
      <ProductDetailsModal
        visible={Boolean(selectedDetailProduct)}
        product={selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        onDelete={handleDeleteProduct}
        onStockChange={handleStockDelta}
        isUpdatingStock={Boolean(stockUpdatingId)}
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
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
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
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: Radius.md - 2,
  },
  segmentBtnActive: {
    backgroundColor: NexoraColors.primary,
    ...Shadows.sm,
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  segmentBtnTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: NexoraColors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    flexShrink: 0,
    ...Shadows.sm,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    height: 38,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#ffffff',
    fontSize: 13,
  },
  categoryPillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  catPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: Radius.full,
  },
  catPillActive: {
    backgroundColor: '#ffffff',
  },
  catPillText: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  catPillTextActive: {
    color: NexoraColors.midnightDark,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    marginBottom: 18,
    ...Shadows.card,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryVal: {
    fontSize: 20,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  summaryLabel: {
    fontSize: 11,
    color: NexoraColors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: NexoraColors.border,
    height: '80%',
    alignSelf: 'center',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12.5,
    color: NexoraColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: NexoraColors.primary,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
  },
  emptyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  productCardContainer: {
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
  deleteBtnRed: {
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
    gap: 4
  },
  priceVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  comparePriceInline: {
    fontSize: 12,
    color: '#94a3b8',
    textDecorationLine: 'line-through'
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
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    marginBottom: 12,
    ...Shadows.sm,
  },
  productTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  productThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    backgroundColor: '#f1f5f9',
    flexShrink: 0,
  },
  productIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: NexoraColors.primaryLight,
    borderWidth: 1,
    borderColor: NexoraColors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  productMeta: {
    flex: 1,
  },
  skuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  skuBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369a1',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subcategoryTag: {
    fontSize: 10,
    fontWeight: '600',
    color: NexoraColors.textSecondary,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  productCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  productCategoryText: {
    fontSize: 11,
    color: NexoraColors.textSecondary,
    fontWeight: '500',
  },
  priceWrap: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: NexoraColors.primary,
  },
  comparePrice: {
    fontSize: 11,
    color: NexoraColors.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  productBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: NexoraColors.textSecondary,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: NexoraColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stepperBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    lineHeight: 16,
  },
  stockCountBox: {
    minWidth: 28,
    alignItems: 'center',
  },
  stockCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  stockStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  stockStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalDialog: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: NexoraColors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
    marginTop: 2,
  },
  modalBody: {
    padding: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputGroupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: NexoraColors.textPrimary,
  },
  optionalTag: {
    fontSize: 12,
    color: NexoraColors.textMuted,
  },
  requiredAsterisk: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.statusRejected,
  },
  photoScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  uploadPhotoBtn: {
    width: 72,
    height: 72,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: NexoraColors.primary,
    borderStyle: 'dashed',
    backgroundColor: NexoraColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    gap: 4,
  },
  uploadPhotoText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  photoPreviewCard: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    position: 'relative',
    borderWidth: 1,
    borderColor: NexoraColors.border,
  },
  photoPreviewImg: {
    width: '100%',
    height: '100%',
  },
  primaryPhotoBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(8, 78, 138, 0.85)',
    paddingVertical: 2,
    alignItems: 'center',
  },
  primaryPhotoText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categorySelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: NexoraColors.border,
    borderRadius: Radius.md,
    height: 48,
    paddingHorizontal: 14,
  },
  categorySelectBtnOpen: {
    borderColor: NexoraColors.primary,
    borderWidth: 1.5,
  },
  categorySelectBtnError: {
    borderColor: NexoraColors.statusRejected,
  },
  categorySelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  categorySelectText: {
    fontSize: 14,
    fontWeight: '600',
    color: NexoraColors.textPrimary,
  },
  dropdownCard: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: NexoraColors.primary,
    padding: 10,
    ...Shadows.card,
  },
  dropdownSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 8,
  },
  dropdownSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: NexoraColors.textPrimary,
  },
  dropdownList: {
    maxHeight: 180,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
  },
  dropdownItemActive: {
    backgroundColor: NexoraColors.primaryLight,
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: NexoraColors.textPrimary,
  },
  dropdownItemTextActive: {
    color: NexoraColors.primary,
    fontWeight: '700',
  },
  dropdownEmpty: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  dropdownEmptyText: {
    fontSize: 12.5,
    color: NexoraColors.textMuted,
  },
  fieldErrorText: {
    fontSize: 12,
    color: NexoraColors.statusRejected,
    marginTop: 4,
    fontWeight: '500',
  },
  modalCatScroll: {
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 4,
  },
  modalSubChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    marginRight: 8,
  },
  modalSubChipActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0284c7',
  },
  modalSubChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: NexoraColors.textSecondary,
  },
  modalSubChipTextActive: {
    color: '#0369a1',
    fontWeight: '700',
  },
  modalRow: {
    flexDirection: 'row',
  },
  fulfillmentWrap: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  fulfillmentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: NexoraColors.border,
    backgroundColor: '#f8fafc',
  },
  fulfillmentOptionActive: {
    borderColor: NexoraColors.primary,
    backgroundColor: NexoraColors.primaryLight,
  },
  fulfillmentText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: NexoraColors.textSecondary,
  },
  fulfillmentTextActive: {
    color: NexoraColors.primary,
    fontWeight: '700',
  },
  fieldHint: {
    fontSize: 11.5,
    color: NexoraColors.textMuted,
    marginBottom: 8,
    lineHeight: 16,
  },
  featuredUploadBox: {
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    backgroundColor: '#f8fafc',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredUploadBoxError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  featuredIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...Shadows.sm,
  },
  featuredUploadTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.primaryDark,
    marginBottom: 3,
  },
  featuredUploadTitleError: {
    color: '#ef4444',
  },
  featuredUploadSubtitle: {
    fontSize: 11,
    color: NexoraColors.textMuted,
  },
  featuredPreviewContainer: {
    width: '100%',
    height: 160,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: NexoraColors.border,
    backgroundColor: '#0f172a',
  },
  featuredPreviewImg: {
    width: '100%',
    height: '100%',
  },
  featuredBadgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(8, 78, 138, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  featuredActionOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredChangeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    ...Shadows.sm,
  },
  featuredChangeBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  featuredRemoveBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
});
