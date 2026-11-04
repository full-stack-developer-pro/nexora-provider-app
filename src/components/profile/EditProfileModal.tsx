import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import {
  X,
  Building,
  User,
  Phone,
  MapPin,
  Award,
  Sparkles,
  Plus,
  Trash2,
  Check,
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { NexoraInput } from '@/components/common/NexoraInput';
import { useAuth } from '@/context/AuthContext';
import { ProviderProfile } from '@/services/providerAuthService';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onProfileUpdated?: (updated: ProviderProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  onProfileUpdated,
}) => {
  const { provider, updateProfile } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [radiusMiles, setRadiusMiles] = useState('25');
  const [experienceYears, setExperienceYears] = useState('5');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible && provider) {
      setBusinessName(provider.businessName || '');
      setName(provider.name || '');
      setPhone(provider.phone || '');
      setBio(provider.bio || '');
      setCity(provider.serviceArea?.city || '');
      setState(provider.serviceArea?.state || '');
      setRadiusMiles(String(provider.serviceArea?.radiusMiles || 25));
      setExperienceYears(String(provider.experienceYears || 5));
      setSpecialties(provider.specialties || []);
      setErrors({});
      setNewSpecialty('');
    }
  }, [visible, provider]);

  const handleAddSpecialty = () => {
    const trimmed = newSpecialty.trim();
    if (!trimmed) return;
    if (specialties.includes(trimmed)) {
      setNewSpecialty('');
      return;
    }
    setSpecialties((prev) => [...prev, trimmed]);
    setNewSpecialty('');
  };

  const handleRemoveSpecialty = (index: number) => {
    setSpecialties((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};
    if (!businessName.trim()) nextErrors.businessName = 'Business name is required.';
    if (!name.trim()) nextErrors.name = 'Contact owner name is required.';
    if (!phone.trim()) nextErrors.phone = 'Phone number is required.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updateProfile({
        businessName: businessName.trim(),
        name: name.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        experienceYears: Number(experienceYears) || 0,
        specialties,
        serviceArea: {
          city: city.trim(),
          state: state.trim(),
          radiusMiles: Number(radiusMiles) || 25,
        },
      });

      if (onProfileUpdated) onProfileUpdated(updated);
      Alert.alert('Profile Saved', 'Your partner profile has been successfully updated.');
      onClose();
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Could not update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Edit Partner Profile</Text>
              <Text style={styles.headerSubtitle}>
                Update business identity, contact & coverage radius
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={18} color={NexoraColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Business Identity Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Building size={16} color={NexoraColors.primary} />
                <Text style={styles.sectionTitle}>Business Identity</Text>
              </View>

              <NexoraInput
                label="Registered Business Name"
                required
                placeholder="e.g. Vance Precision Plumbing LLC"
                value={businessName}
                onChangeText={(t) => {
                  setBusinessName(t);
                  if (errors.businessName) setErrors((p) => ({ ...p, businessName: '' }));
                }}
                error={errors.businessName}
              />

              <NexoraInput
                label="Primary Contact / Owner"
                required
                placeholder="e.g. Marcus Vance"
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                }}
                error={errors.name}
              />

              <NexoraInput
                label="Public Bio / Tagline"
                placeholder="e.g. Certified master plumbers with over 15 years experience..."
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Direct Contact Details */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Phone size={16} color={NexoraColors.primary} />
                <Text style={styles.sectionTitle}>Direct Communications</Text>
              </View>

              <NexoraInput
                label="Direct Phone Number"
                required
                placeholder="+1 (555) 342-9810"
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                }}
                keyboardType="phone-pad"
                error={errors.phone}
              />
            </View>

            {/* Service Dispatch Territory */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MapPin size={16} color={NexoraColors.primary} />
                <Text style={styles.sectionTitle}>Service Territory & Coverage</Text>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 2 }}>
                  <NexoraInput
                    label="Base City"
                    placeholder="e.g. Austin"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <NexoraInput
                    label="State"
                    placeholder="TX"
                    value={state}
                    onChangeText={setState}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Dispatch Radius (Miles)</Text>
              <View style={styles.radiusPillsRow}>
                {['10', '25', '50', '75', '100'].map((rad) => (
                  <TouchableOpacity
                    key={rad}
                    style={[styles.radiusPill, radiusMiles === rad && styles.radiusPillActive]}
                    onPress={() => setRadiusMiles(rad)}
                  >
                    <Text
                      style={[
                        styles.radiusPillText,
                        radiusMiles === rad && styles.radiusPillTextActive,
                      ]}
                    >
                      {rad} mi
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Experience & Trade Specialties */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Award size={16} color={NexoraColors.primary} />
                <Text style={styles.sectionTitle}>Experience & Specialties</Text>
              </View>

              <NexoraInput
                label="Years of Trade Experience"
                placeholder="5"
                value={experienceYears}
                onChangeText={setExperienceYears}
                keyboardType="number-pad"
              />

              <Text style={styles.fieldLabel}>Approved Trade Specialties</Text>
              <View style={styles.chipsContainer}>
                {specialties.map((spec, idx) => (
                  <View key={`${spec}-${idx}`} style={styles.chip}>
                    <Text style={styles.chipText}>{spec}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveSpecialty(idx)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <X size={12} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <View style={styles.addSpecialtyRow}>
                <TextInput
                  style={styles.specialtyInput}
                  placeholder="Add specialty e.g. Water Heater Install"
                  placeholderTextColor="#94a3b8"
                  value={newSpecialty}
                  onChangeText={setNewSpecialty}
                  onSubmitEditing={handleAddSpecialty}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={styles.addSpecialtyBtn}
                  onPress={handleAddSpecialty}
                  activeOpacity={0.8}
                >
                  <Plus size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, submitting && styles.btnDisabled]}
              onPress={handleSave}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Check size={16} color="#ffffff" strokeWidth={2.5} />
                  <Text style={styles.saveBtnText}>Save Profile Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
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
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
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
  scrollArea: {
    maxHeight: 520,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginTop: 6,
  },
  radiusPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusPillActive: {
    backgroundColor: '#eef5fc',
    borderColor: NexoraColors.primary,
  },
  radiusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  radiusPillTextActive: {
    color: NexoraColors.primary,
    fontWeight: '700',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  addSpecialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  specialtyInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#f8fafc',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0f172a',
  },
  addSpecialtyBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: NexoraColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: NexoraColors.primary,
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  btnDisabled: {
    opacity: 0.65,
  },
});

export default EditProfileModal;
