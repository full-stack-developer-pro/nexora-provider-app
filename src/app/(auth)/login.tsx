import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { NexoraLogo } from '@/components/common/NexoraLogo';
import { NexoraInput } from '@/components/common/NexoraInput';
import { NexoraButton } from '@/components/common/NexoraButton';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    try {
      const prov = await login(email.trim(), password);
      // Only approved accounts enter the app tabs
      if (prov?.status === 'approved') {
        router.replace('/(tabs)');
      } else {
        // Pending, suspended or rejected accounts are sent to the status review screen
        router.replace('/onboarding/pending');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
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
        {/* Top Hero Brand Header */}
        <View style={[styles.heroHeader, { paddingTop: Math.max(insets.top, 24) + 28 }]}>
          <View style={styles.ambientGlow} />
          <View style={styles.headerContent}>
            <NexoraLogo size="lg" subtitle="PARTNER & SELLER SUITE" inverted={true} />
            <Text style={styles.heroTitle}>Welcome Back</Text>
            <Text style={styles.heroSubtitle}>
              Sign in to manage live dispatches, accept trade jobs, and sell marketplace products.
            </Text>
          </View>
        </View>

        {/* Native Mobile Edge-to-Edge Sheet */}
        <View
          onLayout={(e) => {
            sheetY.current = e.nativeEvent.layout.y;
          }}
          style={[
            styles.mobileSheet,
            { paddingBottom: keyboardHeight > 0 ? 30 : Math.max(insets.bottom, 24) + 24 },
          ]}
        >
          {/* Native Sheet Pull Indicator */}
          <View style={styles.sheetHandleWrap}>
            <View style={styles.sheetHandle} />
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Input Fields */}
          <NexoraInput
            label="Partner Email"
            placeholder="e.g. marcus@austinpro.com"
            value={email}
            onChangeText={setEmail}
            onLayout={(e) => {
              inputPositions.current.email = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={18} color={NexoraColors.primary} />}
          />

          <NexoraInput
            label="Password"
            placeholder="••••••••••••"
            value={password}
            onChangeText={setPassword}
            onLayout={(e) => {
              inputPositions.current.password = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('password')}
            isPassword
            leftIcon={<Lock size={18} color={NexoraColors.primary} />}
          />

          <TouchableOpacity style={styles.forgotPasswordWrap}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <NexoraButton
            title="Sign In to Partner App"
            onPress={handleLogin}
            loading={isLoading}
            rightIcon={<ArrowRight size={18} color="#ffffff" />}
            style={styles.submitBtn}
          />

          {/* Mobile Apply Prompt */}
          <View style={styles.registerPrompt}>
            <Text style={styles.registerPromptText}>Want to offer services or sell products?</Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={styles.applyBtnPill}
            >
              <Text style={styles.registerLink}>Apply to Join Partner Network →</Text>
            </TouchableOpacity>
          </View>

          {/* Security & Verification Footer */}
          <View style={styles.footerNote}>
            <ShieldCheck size={16} color={NexoraColors.statusApproved} />
            <Text style={styles.footerNoteText}>
              Nexora Shield™ Protected & Verified Ecosystem
            </Text>
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
  heroHeader: {
    backgroundColor: NexoraColors.midnightDark,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(8, 78, 138, 0.4)',
  },
  headerContent: {
    position: 'relative',
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.6,
    marginTop: 18,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 19,
  },
  mobileSheet: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 10,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e2e8f0',
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: NexoraColors.primaryLight,
    borderWidth: 1,
    borderColor: NexoraColors.primaryBorder,
    borderRadius: Radius.full,
    paddingVertical: 7,
    paddingLeft: 12,
    paddingRight: 6,
    marginBottom: 18,
  },
  demoChipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  demoChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: NexoraColors.textSecondary,
  },
  demoChipEmail: {
    color: NexoraColors.primary,
    fontWeight: '700',
  },
  demoChipAction: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: NexoraColors.primaryBorder,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
  },
  demoChipActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  forgotPasswordWrap: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 16,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    color: NexoraColors.primary,
  },
  errorBox: {
    backgroundColor: NexoraColors.statusRejectedBg,
    borderColor: NexoraColors.statusRejectedBorder,
    borderWidth: 1,
    padding: 10,
    borderRadius: Radius.md,
    marginBottom: 14,
  },
  errorText: {
    color: NexoraColors.statusRejected,
    fontSize: 12,
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: 4,
  },
  registerPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    gap: 8,
  },
  registerPromptText: {
    fontSize: 13,
    color: NexoraColors.textSecondary,
    textAlign: 'center',
  },
  applyBtnPill: {
    backgroundColor: NexoraColors.surfaceElevated,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radius.full,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 28,
  },
  footerNoteText: {
    fontSize: 11,
    color: NexoraColors.textMuted,
    fontWeight: '500',
  },
});
