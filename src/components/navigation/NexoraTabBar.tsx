import { NexoraColors, Radius } from '@/constants/theme';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  DollarSign,
  Package,
  Plus,
  Receipt,
  ShieldCheck,
  User,
  Wrench,
  X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface NexoraTabBarProps {
  state: any;
  descriptors: any;
  navigation?: any;
  [key: string]: any;
}

export const NexoraTabBar: React.FC<NexoraTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [actionModalVisible, setActionModalVisible] = useState(false);

  // Group tabs into Left 2, Center Button, Right 2
  // state.routes = ['index', 'catalog', 'earnings', 'profile']
  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2, 4);

  const renderTabItem = (route: { key: string; name: string }, index: number) => {
    const isFocused = state.index === index;

    const onPress = () => {
      if (navigation?.emit) {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (!isFocused && !event?.defaultPrevented) {
          if (navigation?.navigate) {
            navigation.navigate(route.name);
          } else {
            router.push(`/(tabs)/${route.name === 'index' ? '' : route.name}` as any);
          }
        }
      } else if (!isFocused) {
        if (route.name === 'index') {
          router.push('/(tabs)');
        } else {
          router.push(`/(tabs)/${route.name}` as any);
        }
      }
    };

    const getIcon = () => {
      const color = isFocused ? NexoraColors.primary : '#94a3b8';
      const size = 22;

      switch (route.name) {
        case 'index':
          return <Wrench size={size} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
        case 'catalog':
          return <Package size={size} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
        case 'earnings':
          return <DollarSign size={size} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
        case 'profile':
          return <User size={size} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
        default:
          return null;
      }
    };

    const getLabel = () => {
      switch (route.name) {
        case 'index':
          return 'Dispatches';
        case 'catalog':
          return 'Products';
        case 'earnings':
          return 'Earnings';
        case 'profile':
          return 'Profile';
        default:
          return route.name;
      }
    };

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        style={styles.tabItem}
        activeOpacity={0.7}
      >
        <View style={styles.iconWrap}>
          {getIcon()}
        </View>
        <Text
          style={[
            styles.tabLabel,
            isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}
        >
          {getLabel()}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleAction = (type: string) => {
    setActionModalVisible(false);

    if (type === 'dispatch') {
      Alert.alert(
        'Create Custom Dispatch',
        'Direct customer dispatch request created. Ready to dispatch nearest verified technician.',
        [{ text: 'OK' }]
      );
    } else if (type === 'product') {
      router.push({
        pathname: '/(tabs)/catalog',
        params: { action: 'new' }
      });
    } else if (type === 'invoice') {
      Alert.alert(
        'Generate Instant Invoice',
        'Invoice #INV-2026 drafted with platform escrow guarantee.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <>
      {/* Elevated Custom Bottom Bar */}
      <View
        style={[
          styles.barContainer,
          {
            paddingBottom: Math.max(insets.bottom, 10),
            height: 62 + Math.max(insets.bottom, 10),
          },
        ]}
      >
        {/* Left Side: Dispatches & Products */}
        <View style={styles.halfSide}>
          {leftRoutes.map((route: { key: string; name: string }, i: number) => renderTabItem(route, i))}
        </View>

        {/* Center Highlighted Action Button (FAB) */}
        <View style={styles.centerFabWrap}>
          <TouchableOpacity
            style={styles.centerFab}
            onPress={() => setActionModalVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.fabInnerGradient}>
              <Plus size={24} color="#ffffff" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
          <Text style={styles.fabLabel}>Publish</Text>
        </View>

        {/* Right Side: Earnings & Profile */}
        <View style={styles.halfSide}>
          {rightRoutes.map((route: { key: string; name: string }, i: number) => renderTabItem(route, i + 2))}
        </View>
      </View>

      {/* Quick Action Sheet Modal */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setActionModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.sheetContent,
                  { paddingBottom: Math.max(insets.bottom, 20) + 24 },
                ]}
              >
                {/* Pull handle */}
                <View style={styles.sheetHandle} />

                <View style={styles.sheetHeader}>
                  <View>
                    <Text style={styles.sheetTitle}>Partner Quick Actions</Text>
                    <Text style={styles.sheetSubtitle}>
                      Publish offerings, list products or bill clients
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setActionModalVisible(false)}
                  >
                    <X size={18} color={NexoraColors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Actions Grid */}
                <View style={styles.actionsList}>
                  {/* Action 1: Create Dispatch */}
                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => handleAction('dispatch')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.actionIconBox, { backgroundColor: '#eef5fc' }]}>
                      <Wrench size={22} color={NexoraColors.primary} />
                    </View>
                    <View style={styles.actionMeta}>
                      <Text style={styles.actionName}>New Custom Dispatch / Quote</Text>
                      <Text style={styles.actionDesc}>
                        Schedule on-site trade service or submit price proposal
                      </Text>
                    </View>
                    <ArrowRight size={18} color="#94a3b8" />
                  </TouchableOpacity>

                  {/* Action 2: Add Product */}
                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => handleAction('product')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.actionIconBox, { backgroundColor: '#fdf2f8' }]}>
                      <Package size={22} color="#9d174d" />
                    </View>
                    <View style={styles.actionMeta}>
                      <Text style={styles.actionName}>Add Storefront Product SKU</Text>
                      <Text style={styles.actionDesc}>
                        List trade supplies, tools, or spare parts in marketplace
                      </Text>
                    </View>
                    <ArrowRight size={18} color="#94a3b8" />
                  </TouchableOpacity>

                  {/* Action 3: Instant Invoice */}
                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => handleAction('invoice')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.actionIconBox, { backgroundColor: '#ecfdf5' }]}>
                      <Receipt size={22} color="#059669" />
                    </View>
                    <View style={styles.actionMeta}>
                      <Text style={styles.actionName}>Direct Customer Invoice</Text>
                      <Text style={styles.actionDesc}>
                        Request instant payment with Nexora Escrow protection
                      </Text>
                    </View>
                    <ArrowRight size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                {/* Security Tag */}
                <View style={styles.complianceBadge}>
                  <ShieldCheck size={16} color="#15803d" style={{ flexShrink: 0 }} />
                  <Text style={styles.complianceText}>
                    Transactions audited under Nexora Verified Partner Guarantee
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#041427',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  halfSide: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 64,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 28,
  },
  tabLabel: {
    fontSize: 10.5,
    marginTop: 3,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  tabLabelInactive: {
    fontWeight: '500',
    color: '#94a3b8',
  },
  centerFabWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    top: -14,
  },
  centerFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: NexoraColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NexoraColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3.5,
    borderColor: '#ffffff',
  },
  fabInnerGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: NexoraColors.primary,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 20, 39, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsList: {
    gap: 12,
    marginBottom: 18,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionMeta: {
    flex: 1,
  },
  actionName: {
    fontSize: 14,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 11.5,
    color: NexoraColors.textSecondary,
    lineHeight: 15,
  },
  complianceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 10,
    marginTop: 4,
  },
  complianceText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#15803d',
    lineHeight: 16,
  },
});

export default NexoraTabBar;
