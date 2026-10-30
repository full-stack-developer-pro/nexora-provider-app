import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { NexoraLogo } from '@/components/common/NexoraLogo';
import { NexoraButton } from '@/components/common/NexoraButton';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import categoryService, { ServiceCategory } from '@/services/categoryService';

export default function TradeSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const partnerType = (params.partnerType as string) || 'service_provider';
  const isSeller = partnerType === 'product_seller';
  const isBoth = partnerType === 'both';

  const [activeTab, setActiveTab] = useState<'service' | 'product'>(isSeller ? 'product' : 'service');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<any | null>(null);
  const [selectedSubcats, setSelectedSubcats] = useState<string[]>([]);
  const [error, setError] = useState('');

  const loadCategoriesForTab = async (tab: 'service' | 'product') => {
    setLoading(true);
    try {
      let list: any[] = [];
      if (tab === 'product') {
        list = await categoryService.getProductCategories();
      } else {
        list = await categoryService.getServiceCategories();
      }
      setCategories(list);
      if (list.length > 0) {
        setSelectedCat(list[0]);
        const initialSubs = (list[0].subcategories || []).slice(0, 2).map((s: any) => s.name);
        setSelectedSubcats(initialSubs);
      } else {
        setSelectedCat(null);
        setSelectedSubcats([]);
      }
    } catch (err) {
      console.warn('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoriesForTab(activeTab);
  }, [activeTab]);

  const handleSelectCategory = (cat: any) => {
    setSelectedCat(cat);
    const defaultSubs = (cat.subcategories || []).slice(0, 2).map((s: any) => s.name);
    setSelectedSubcats(defaultSubs);
    setError('');
  };

  const handleToggleSubcategory = (subName: string) => {
    if (selectedSubcats.includes(subName)) {
      if (selectedSubcats.length === 1) {
        setError('Please select at least 1 specialty item.');
        return;
      }
      setSelectedSubcats((prev) => prev.filter((s) => s !== subName));
    } else {
      setSelectedSubcats((prev) => [...prev, subName]);
      setError('');
    }
  };

  const handleContinue = () => {
    if (!selectedCat) {
      setError(
        activeTab === 'product'
          ? 'Please select your primary product category.'
          : 'Please select your primary trade category.'
      );
      return;
    }
    if (selectedSubcats.length === 0) {
      setError('Please select at least one specialty under this classification.');
      return;
    }

    router.push({
      pathname: '/onboarding/kyc',
      params: {
        ...params,
        primaryCategory: selectedCat.name,
        primaryCategoryId: selectedCat._id,
        specialties: JSON.stringify(selectedSubcats),
      },
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/register');
    }
  };

  const currentTabIsProduct = activeTab === 'product';

  return (
    <View style={styles.container}>
      {/* Header matching Step 1 & Step 3 */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 26 }]}>
        <View style={styles.headerNav}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <NexoraLogo size="sm" showText={false} />
        </View>

        {/* Native Step Progress Pill Indicator (Step 2 of 3) */}
        <View style={styles.stepProgressRow}>
          <View style={[styles.stepBar, styles.stepBarActive]} />
          <View style={[styles.stepBar, styles.stepBarActive]} />
          <View style={styles.stepBar} />
        </View>

        <Text style={styles.stepLabel}>
          STEP 2 OF 3 • {currentTabIsProduct ? 'PRODUCT CATALOG LINE' : 'TRADE CLASSIFICATION'}
        </Text>
        <Text style={styles.title}>
          {currentTabIsProduct ? 'Select Store Category' : 'Select Licensed Trade'}
        </Text>
        <Text style={styles.subtitle}>
          {currentTabIsProduct
            ? 'Choose your primary product line and inventory specialties to list in marketplace store.'
            : 'Choose your primary trade classification and service specialties to receive matching customer dispatches.'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* For 'Both' role: Tab toggle to choose between Service Trades & Products */}
        {isBoth ? (
          <View style={styles.tabToggleRow}>
            <TouchableOpacity
              style={[styles.tabToggleBtn, activeTab === 'service' && styles.tabToggleBtnActive]}
              onPress={() => setActiveTab('service')}
            >
              <Text style={[styles.tabToggleText, activeTab === 'service' && styles.tabToggleTextActive]}>
                Service Trades
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabToggleBtn, activeTab === 'product' && styles.tabToggleBtnActive]}
              onPress={() => setActiveTab('product')}
            >
              <Text style={[styles.tabToggleText, activeTab === 'product' && styles.tabToggleTextActive]}>
                Store Products
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color={NexoraColors.primary} />
            <Text style={styles.loaderText}>
              Loading live marketplace {currentTabIsProduct ? 'product categories' : 'trades'}...
            </Text>
          </View>
        ) : (
          <View style={styles.mainContent}>
            <Text style={styles.sectionTitle}>
              {currentTabIsProduct ? 'Primary Storefront Category' : 'Primary Licensed Trade'}
            </Text>

            {/* Categories Grid */}
            <View style={styles.tradeGrid}>
              {categories.map((cat) => {
                const isSelected = selectedCat?._id === cat._id;
                const catColor = cat.iconColor || NexoraColors.primary;

                return (
                  <TouchableOpacity
                    key={cat._id}
                    style={[
                      styles.tradeCard,
                      isSelected && {
                        borderColor: NexoraColors.primary,
                        backgroundColor: NexoraColors.primaryLight,
                      },
                    ]}
                    onPress={() => handleSelectCategory(cat)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.tradeIconBox,
                        {
                          backgroundColor: `${catColor}15`,
                          borderColor: `${catColor}30`,
                        },
                      ]}
                    >
                      <CategoryIcon name={cat.iconName} size={22} color={catColor} />
                    </View>

                    <Text
                      style={[
                        styles.tradeName,
                        isSelected && { color: NexoraColors.primary, fontWeight: '700' },
                      ]}
                      numberOfLines={2}
                    >
                      {cat.name}
                    </Text>

                    {isSelected ? (
                      <View style={styles.selectedBadge}>
                        <Check size={12} color="#ffffff" />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Specialties Multi-Select Section */}
            {selectedCat ? (
              <View style={styles.specialtiesCard}>
                <View style={styles.specialtiesHeader}>
                  <Sparkles size={16} color={NexoraColors.primary} style={{ marginTop: 2, flexShrink: 0 }} />
                  <Text style={styles.specialtiesTitle}>
                    Specialties in {selectedCat.name}
                  </Text>
                </View>
                <Text style={styles.specialtiesSubtext}>
                  Select specific jobs your team is equipped to fulfill:
                </Text>

                <View style={styles.chipsWrap}>
                  {(selectedCat.subcategories || []).map((sub: any) => {
                    const isChecked = selectedSubcats.includes(sub.name);
                    return (
                      <TouchableOpacity
                        key={sub.id || sub.name}
                        style={[
                          styles.chip,
                          isChecked && styles.chipActive,
                        ]}
                        onPress={() => handleToggleSubcategory(sub.name)}
                        activeOpacity={0.8}
                      >
                        {isChecked ? (
                          <Check size={14} color="#ffffff" style={{ marginRight: 6 }} />
                        ) : null}
                        <Text
                          style={[
                            styles.chipText,
                            isChecked && styles.chipTextActive,
                          ]}
                        >
                          {sub.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <NexoraButton
              title="Continue to Document Upload"
              onPress={handleContinue}
              rightIcon={<ArrowRight size={18} color="#ffffff" />}
              style={styles.continueBtn}
            />
          </View>
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
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 28,
    paddingHorizontal: 22,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepProgressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  stepBar: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  stepBarActive: {
    backgroundColor: NexoraColors.primary,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#93c5fd',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 18,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tabToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabToggleBtnActive: {
    backgroundColor: '#ffffff',
    ...Shadows.sm,
  },
  tabToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: NexoraColors.textSecondary,
  },
  tabToggleTextActive: {
    color: NexoraColors.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loaderBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    fontSize: 13,
    color: NexoraColors.textSecondary,
    marginTop: 12,
  },
  mainContent: {},
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginBottom: 12,
  },
  tradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  tradeCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: NexoraColors.border,
    borderRadius: Radius.md,
    padding: 14,
    minHeight: 110,
    position: 'relative',
    ...Shadows.sm,
  },
  tradeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tradeName: {
    fontSize: 13,
    fontWeight: '600',
    color: NexoraColors.textPrimary,
    lineHeight: 17,
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: NexoraColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialtiesCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    marginBottom: 20,
    ...Shadows.card,
  },
  specialtiesHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  specialtiesTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    lineHeight: 20,
  },
  specialtiesSubtext: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
    marginBottom: 14,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: NexoraColors.border,
  },
  chipActive: {
    backgroundColor: NexoraColors.primary,
    borderColor: NexoraColors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: NexoraColors.textSecondary,
  },
  chipTextActive: {
    color: '#ffffff',
  },
  errorText: {
    color: NexoraColors.statusRejected,
    fontSize: 12,
    marginBottom: 12,
    fontWeight: '600',
  },
  continueBtn: {
    marginTop: 6,
  },
});
