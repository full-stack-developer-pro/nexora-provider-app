import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Briefcase, Mail, Phone, MapPin, Award, ArrowRight, ArrowLeft, Wrench, ShoppingBag, Layers, Lock } from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { NexoraLogo } from '@/components/common/NexoraLogo';
import { NexoraInput } from '@/components/common/NexoraInput';
import { NexoraButton } from '@/components/common/NexoraButton';
import { GoogleSignInButton } from '@/components/common/GoogleSignInButton';
import { promptGoogleAuth } from '@/services/googleAuthService';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { loginWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const scrollViewRef = useRef<any>(null);
  const inputPositions = useRef<Record<string, number>>({});
  const sheetY = useRef(0);
  const activeFieldRef = useRef<string | null>(null);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const h = e.endCoordinates.height;
      setKeyboardHeight(h);
      if (activeFieldRef.current && inputPositions.current[activeFieldRef.current] !== undefined) {
        const inputY = inputPositions.current[activeFieldRef.current];
        const targetScroll = Math.max(0, sheetY.current + inputY - 80);
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: targetScroll, animated: true });
        }, 80);
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      activeFieldRef.current = null;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToField = (key: string) => {
    activeFieldRef.current = key;
    const inputY = inputPositions.current[key];
    if (typeof inputY === 'number' && scrollViewRef.current) {
      const targetScroll = Math.max(0, sheetY.current + inputY - 80);
      scrollViewRef.current.scrollTo({ y: targetScroll, animated: true });
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: targetScroll, animated: true });
      }, 120);
    }
  };

  const [partnerType, setPartnerType] = useState<'service_provider' | 'product_seller' | 'both'>('service_provider');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!businessName.trim()) newErrors.businessName = 'Business or trade name is required';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Valid email is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!city.trim()) newErrors.city = 'Operating city is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;

    // Navigate to Trade Selection step with registration parameters
    router.push({
      pathname: '/onboarding/trades',
      params: {
        partnerType,
        name: name.trim(),
        businessName: businessName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        city: city.trim(),
        experienceYears: experienceYears || '1',
      },
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleGoogleSignup = async () => {
    const res = await promptGoogleAuth();
    if (res.success && res.idToken) {
      setGoogleLoading(true);
      try {
        const prov = await loginWithGoogle(
          res.idToken,
          partnerType === 'both' ? 'service_provider' : partnerType,
          partnerType,
          businessName.trim() || undefined
        );
        if (prov?.status === 'approved') {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding/pending');
        }
      } catch (err: any) {
        Alert.alert('Sign Up Error', err.message || 'Google sign up failed.');
      } finally {
        setGoogleLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: keyboardHeight > 0 ? keyboardHeight + 40 : 0,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
      >
        {/* Header */}
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

          {/* Native Step Progress Pill Indicator */}
          <View style={styles.stepProgressRow}>
            <View style={[styles.stepBar, styles.stepBarActive]} />
            <View style={styles.stepBar} />
            <View style={styles.stepBar} />
          </View>

          <Text style={styles.stepLabel}>STEP 1 OF 3 • PROFILE SETUP</Text>
          <Text style={styles.title}>Apply as a Partner</Text>
          <Text style={styles.subtitle}>
            Join verified field technicians and product sellers on the Nexora platform.
          </Text>
        </View>

        {/* Native Mobile Sheet */}
        <View
          onLayout={(e) => {
            sheetY.current = e.nativeEvent.layout.y;
          }}
          style={[
            styles.mobileSheet,
            { paddingBottom: keyboardHeight > 0 ? 40 : Math.max(insets.bottom, 24) + 32 },
          ]}
        >
          <View style={styles.sheetHandleWrap}>
            <View style={styles.sheetHandle} />
          </View>

          {/* Partner Role Selector */}
          <Text style={styles.sectionHeading}>Select Partner Model</Text>
          <View style={styles.partnerTypeRow}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                partnerType === 'service_provider' && styles.typeOptionActive,
              ]}
              onPress={() => setPartnerType('service_provider')}
            >
              <View
                style={[
                  styles.typeIconBox,
                  partnerType === 'service_provider' && styles.typeIconBoxActive,
                ]}
              >
                <Wrench
                  size={18}
                  color={
                    partnerType === 'service_provider'
                      ? NexoraColors.primary
                      : NexoraColors.textSecondary
                  }
                />
              </View>
              <Text
                style={[
                  styles.typeTitle,
                  partnerType === 'service_provider' && styles.typeTitleActive,
                ]}
              >
                Service Pro
              </Text>
              <Text style={styles.typeSub}>Trade & Jobs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                partnerType === 'product_seller' && styles.typeOptionActive,
              ]}
              onPress={() => setPartnerType('product_seller')}
            >
              <View
                style={[
                  styles.typeIconBox,
                  partnerType === 'product_seller' && styles.typeIconBoxActive,
                ]}
              >
                <ShoppingBag
                  size={18}
                  color={
                    partnerType === 'product_seller'
                      ? NexoraColors.primary
                      : NexoraColors.textSecondary
                  }
                />
              </View>
              <Text
                style={[
                  styles.typeTitle,
                  partnerType === 'product_seller' && styles.typeTitleActive,
                ]}
              >
                Seller
              </Text>
              <Text style={styles.typeSub}>Store & Parts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                partnerType === 'both' && styles.typeOptionActive,
              ]}
              onPress={() => setPartnerType('both')}
            >
              <View
                style={[
                  styles.typeIconBox,
                  partnerType === 'both' && styles.typeIconBoxActive,
                ]}
              >
                <Layers
                  size={18}
                  color={
                    partnerType === 'both'
                      ? NexoraColors.primary
                      : NexoraColors.textSecondary
                  }
                />
              </View>
              <Text
                style={[
                  styles.typeTitle,
                  partnerType === 'both' && styles.typeTitleActive,
                ]}
              >
                Both
              </Text>
              <Text style={styles.typeSub}>Services + Store</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionHeading, { marginTop: 20 }]}>
            Business & Contact Profile
          </Text>

          <NexoraInput
            label="Full Name / Primary Contact"
            placeholder="e.g. David Miller"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            onLayout={(e) => {
              inputPositions.current.name = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('name')}
            error={errors.name}
            leftIcon={<User size={18} color={NexoraColors.textSecondary} />}
          />

          <NexoraInput
            label="Registered Business / Trade Name"
            placeholder="e.g. Miller Electric & Controls LLC"
            value={businessName}
            onChangeText={(t) => {
              setBusinessName(t);
              if (errors.businessName) setErrors((prev) => ({ ...prev, businessName: '' }));
            }}
            onLayout={(e) => {
              inputPositions.current.businessName = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('businessName')}
            error={errors.businessName}
            leftIcon={<Briefcase size={18} color={NexoraColors.textSecondary} />}
          />

          <NexoraInput
            label="Work Email Address"
            placeholder="david@millerelectric.com"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            onLayout={(e) => {
              inputPositions.current.email = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('email')}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={18} color={NexoraColors.textSecondary} />}
          />

          <NexoraInput
            label="Direct Mobile / Dispatch Phone"
            placeholder="+1 (555) 234-5678"
            value={phone}
            onChangeText={(t) => {
              setPhone(t);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
            }}
            onLayout={(e) => {
              inputPositions.current.phone = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('phone')}
            error={errors.phone}
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={NexoraColors.textSecondary} />}
          />

          <NexoraInput
            label="Create Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            onLayout={(e) => {
              inputPositions.current.password = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('password')}
            error={errors.password}
            isPassword={true}
            leftIcon={<Lock size={18} color={NexoraColors.textSecondary} />}
          />

          <NexoraInput
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            onLayout={(e) => {
              inputPositions.current.confirmPassword = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('confirmPassword')}
            error={errors.confirmPassword}
            isPassword={true}
            leftIcon={<Lock size={18} color={NexoraColors.textSecondary} />}
          />

          <View
            style={styles.row}
            onLayout={(e) => {
              inputPositions.current.cityRow = e.nativeEvent.layout.y;
            }}
          >
            <View style={{ flex: 1.4 }}>
              <NexoraInput
                label="Primary Service City"
                placeholder="e.g. Austin"
                value={city}
                onChangeText={(t) => {
                  setCity(t);
                  if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                }}
                onFocus={() => scrollToField('cityRow')}
                error={errors.city}
                leftIcon={<MapPin size={18} color={NexoraColors.textSecondary} />}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <NexoraInput
                label="Experience (Yrs)"
                placeholder="e.g. 5"
                value={experienceYears}
                onChangeText={setExperienceYears}
                onFocus={() => scrollToField('cityRow')}
                keyboardType="numeric"
                leftIcon={<Award size={18} color={NexoraColors.textSecondary} />}
              />
            </View>
          </View>

          <NexoraButton
            title="Continue to Trade Selection"
            onPress={handleContinue}
            rightIcon={<ArrowRight size={18} color="#ffffff" />}
            style={styles.continueBtn}
          />

          {/* Social Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign Up */}
          <GoogleSignInButton
            title="Sign Up with Google"
            onPress={handleGoogleSignup}
            loading={googleLoading}
          />

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Already an approved partner?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: NexoraColors.midnightDark,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: NexoraColors.midnightDark,
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
  mobileSheet: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e2e8f0',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginBottom: 14,
  },
  partnerTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: Radius.md,
    backgroundColor: NexoraColors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: NexoraColors.border,
    alignItems: 'center',
  },
  typeOptionActive: {
    backgroundColor: NexoraColors.primaryLight,
    borderColor: NexoraColors.primary,
  },
  typeIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  typeIconBoxActive: {
    backgroundColor: '#ffffff',
  },
  typeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    textAlign: 'center',
  },
  typeTitleActive: {
    color: NexoraColors.primary,
  },
  typeSub: {
    fontSize: 10,
    color: NexoraColors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  continueBtn: {
    marginTop: 10,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  loginPromptText: {
    fontSize: 13,
    color: NexoraColors.textSecondary,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
});
