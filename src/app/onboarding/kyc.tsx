import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  CreditCard,
  Camera
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { NexoraLogo } from '@/components/common/NexoraLogo';
import { NexoraInput } from '@/components/common/NexoraInput';
import { NexoraButton } from '@/components/common/NexoraButton';
import { useAuth } from '@/context/AuthContext';

interface DocSlot {
  type: string;
  label: string;
  description: string;
  fileName: string;
  fileUri: string | null;
  required: boolean;
}

export default function KYCOnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { register, uploadKYC, isLoading } = useAuth();
  const scrollViewRef = useRef<any>(null);
  const inputPositions = useRef<Record<string, number>>({});
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
        const targetScroll = Math.max(0, inputY - 60);
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
      const targetScroll = Math.max(0, inputY - 60);
      scrollViewRef.current.scrollTo({ y: targetScroll, animated: true });
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: targetScroll, animated: true });
      }, 120);
    }
  };

  const partnerType = (params.partnerType as string) || 'service_provider';
  const isSeller = partnerType === 'product_seller';

  const [licenseNumber, setLicenseNumber] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');

  const [docSlots, setDocSlots] = useState<DocSlot[]>(() =>
    isSeller
      ? [
          {
            type: 'Business Registration / Tax License',
            label: 'Business License / Reseller Permit',
            description: 'Official corporate registration or sales tax permit',
            fileName: 'business_license.jpg',
            fileUri: null,
            required: true,
          },
          {
            type: 'Government ID',
            label: 'Government ID / Driving License',
            description: 'Official photo ID of the business owner or manager',
            fileName: 'owner_gov_id.jpg',
            fileUri: null,
            required: true,
          },
          {
            type: 'Commercial / Liability Insurance',
            label: 'Store Liability / Warranty Policy',
            description: 'Commercial liability certificate or product warranty documentation',
            fileName: 'liability_doc.jpg',
            fileUri: null,
            required: false,
          },
        ]
      : [
          {
            type: 'State Contractor License',
            label: 'State Trade / Contractor License',
            description: 'Official master, journeyman, or trade operating license',
            fileName: 'contractor_license.jpg',
            fileUri: null,
            required: true,
          },
          {
            type: 'Government ID',
            label: 'Government ID / Driving License',
            description: 'Official photo ID of the primary business owner',
            fileName: 'owner_gov_id.jpg',
            fileUri: null,
            required: true,
          },
          {
            type: 'General Liability Insurance ($1M)',
            label: 'Proof of Liability Insurance',
            description: 'Certificate of insurance or commercial bonding proof',
            fileName: 'insurance_coi.jpg',
            fileUri: null,
            required: false,
          },
        ]
  );

  const [error, setError] = useState('');

  const pickDocumentImage = async (index: number) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Camera roll access is needed to upload your trade and verification documents.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setDocSlots((prev) => {
          const updated = [...prev];
          updated[index].fileUri = uri;
          return updated;
        });
        setError('');
      }
    } catch (err) {
      console.warn('Image picker error:', err);
    }
  };

  const handleCaptureCamera = async (index: number) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Camera access is required to photograph your license or certification.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setDocSlots((prev) => {
          const updated = [...prev];
          updated[index].fileUri = uri;
          return updated;
        });
        setError('');
      }
    } catch (err) {
      console.warn('Camera error:', err);
    }
  };

  const handleSubmit = async () => {
    // Validate required documents
    const missing = docSlots.filter((d) => d.required && !d.fileUri);
    if (missing.length > 0) {
      setError(`Please upload photo evidence for: ${missing.map((m) => m.label).join(', ')}`);
      return;
    }

    try {
      let parsedSpecialties: string[] = [];
      try {
        parsedSpecialties = params.specialties ? JSON.parse(params.specialties as string) : [];
      } catch {
        parsedSpecialties = ['General Service'];
      }

      // 1. Register Provider Profile
      const provider = await register({
        partnerType: (params.partnerType as any) || 'service_provider',
        name: (params.name as string) || 'Partner Applicant',
        businessName: (params.businessName as string) || 'Registered Services LLC',
        email: (params.email as string) || 'partner@example.com',
        phone: (params.phone as string) || '+1 (555) 000-0000',
        password: (params.password as string) || undefined,
        city: (params.city as string) || 'Austin',
        primaryCategory: (params.primaryCategory as string) || 'Plumbing & Water Systems',
        primaryCategoryId: (params.primaryCategoryId as string) || undefined,
        specialties: parsedSpecialties,
        experienceYears: Number(params.experienceYears) || 3,
        licenseNumber: licenseNumber.trim(),
        insurancePolicyNumber: insurancePolicyNumber.trim(),
      });

      // 2. Upload Document Photos
      const docsToUpload = docSlots
        .filter((d) => Boolean(d.fileUri))
        .map((d) => ({
          type: d.type,
          fileName: d.fileName,
          fileUri: d.fileUri as string,
        }));

      if (docsToUpload.length > 0) {
        await uploadKYC(docsToUpload);
      }

      // 3. Move to Pending Review Console
      router.replace('/onboarding/pending');
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check your network connection.');
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/onboarding/trades');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header matching Step 1 & Step 2 */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 20 }]}>
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

        {/* Native Step Progress Pill Indicator (Step 3 of 3) */}
        <View style={styles.stepProgressRow}>
          <View style={[styles.stepBar, styles.stepBarActive]} />
          <View style={[styles.stepBar, styles.stepBarActive]} />
          <View style={[styles.stepBar, styles.stepBarActive]} />
        </View>

        <Text style={styles.stepLabel}>STEP 3 OF 3 • COMPLIANCE & KYC AUDIT</Text>
        <Text style={styles.title}>KYC & License Verification</Text>
        <Text style={styles.subtitle}>
          Upload your trade licenses and identification to qualify for verified customer bookings.
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              keyboardHeight > 0
                ? keyboardHeight + 60
                : Math.max(insets.bottom, 20) + 30,
          },
        ]}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
      >
        {/* Compliance Notice Banner */}
        <View style={styles.noticeBanner}>
          <ShieldCheck size={20} color={NexoraColors.primary} style={{ flexShrink: 0 }} />
          <Text style={styles.noticeText}>
            All uploaded files are audited by Nexora Compliance Admins before activating dispatch and merchant features.
          </Text>
        </View>

        {/* License Numbers Input */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>License & Bonding Credentials</Text>
          <NexoraInput
            label="Trade License / Registration Number"
            placeholder="e.g. TX-MP-88390"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            onLayout={(e) => {
              inputPositions.current.license = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('license')}
            leftIcon={<CreditCard size={18} color={NexoraColors.textSecondary} />}
          />

          <NexoraInput
            label="Insurance Policy Number (Optional)"
            placeholder="e.g. POL-LIB-102930"
            value={insurancePolicyNumber}
            onChangeText={setInsurancePolicyNumber}
            onLayout={(e) => {
              inputPositions.current.insurance = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('insurance')}
            leftIcon={<Calendar size={18} color={NexoraColors.textSecondary} />}
          />
        </View>

        {/* Document Upload Slots */}
        <Text style={styles.uploadSectionTitle}>Required Document Photos</Text>

        {docSlots.map((doc, idx) => (
          <View key={doc.type} style={styles.docSlotCard}>
            <View style={styles.docHeader}>
              <View style={styles.docTitleWrap}>
                <Text style={styles.docLabel}>
                  {doc.label} {doc.required ? <Text style={styles.requiredStar}>*</Text> : null}
                </Text>
                <Text style={styles.docDesc}>{doc.description}</Text>
              </View>

              {doc.fileUri ? (
                <View style={styles.uploadedBadge}>
                  <CheckCircle2 size={14} color={NexoraColors.statusApproved} />
                  <Text style={styles.uploadedBadgeText}>Attached</Text>
                </View>
              ) : null}
            </View>

            {doc.fileUri ? (
              <View style={styles.previewBox}>
                <Image source={{ uri: doc.fileUri }} style={styles.previewImage} />
                <View style={styles.previewActions}>
                  <TouchableOpacity
                    style={styles.retakeBtn}
                    onPress={() => pickDocumentImage(idx)}
                  >
                    <Text style={styles.retakeBtnText}>Change Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.uploadActionRow}>
                <TouchableOpacity
                  style={[styles.uploadBox, { flex: 1 }]}
                  onPress={() => pickDocumentImage(idx)}
                  activeOpacity={0.7}
                >
                  <UploadCloud size={20} color={NexoraColors.primary} />
                  <Text style={styles.uploadBoxText}>Choose Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.uploadBox, styles.cameraBox, { flex: 1 }]}
                  onPress={() => handleCaptureCamera(idx)}
                  activeOpacity={0.7}
                >
                  <Camera size={20} color={NexoraColors.textSecondary} />
                  <Text style={styles.cameraBoxText}>Take Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {error ? (
          <View style={styles.errorCard}>
            <ShieldAlert size={16} color={NexoraColors.statusRejected} />
            <Text style={styles.errorCardText}>{error}</Text>
          </View>
        ) : null}

        <NexoraButton
          title="Submit Application for Review"
          onPress={handleSubmit}
          loading={isLoading}
          rightIcon={<FileCheck size={18} color="#ffffff" />}
          style={styles.submitBtn}
        />
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: NexoraColors.primaryLight,
    borderWidth: 1,
    borderColor: NexoraColors.primaryBorder,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 12,
    color: NexoraColors.primary,
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    marginBottom: 20,
    ...Shadows.card,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginBottom: 14,
  },
  uploadSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginBottom: 12,
  },
  docSlotCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    marginBottom: 14,
    ...Shadows.sm,
  },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  docTitleWrap: {
    flex: 1,
  },
  docLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginBottom: 2,
  },
  requiredStar: {
    color: NexoraColors.accent,
  },
  docDesc: {
    fontSize: 12,
    color: NexoraColors.textMuted,
  },
  uploadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: NexoraColors.statusApprovedBg,
    borderColor: NexoraColors.statusApprovedBorder,
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.xs,
  },
  uploadedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: NexoraColors.statusApproved,
  },
  uploadActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: NexoraColors.primaryBorder,
    backgroundColor: NexoraColors.primaryLight,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadBoxText: {
    fontSize: 12,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  cameraBox: {
    borderColor: NexoraColors.border,
    backgroundColor: '#f8fafc',
  },
  cameraBoxText: {
    fontSize: 12,
    fontWeight: '600',
    color: NexoraColors.textSecondary,
  },
  previewBox: {
    marginTop: 4,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: NexoraColors.border,
  },
  previewImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#000000',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    backgroundColor: '#ffffff',
  },
  retakeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: NexoraColors.primaryLight,
    borderRadius: 6,
  },
  retakeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: NexoraColors.primary,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: NexoraColors.statusRejectedBg,
    borderColor: NexoraColors.statusRejectedBorder,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorCardText: {
    fontSize: 12,
    color: NexoraColors.statusRejected,
    flex: 1,
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: 8,
  },
});
