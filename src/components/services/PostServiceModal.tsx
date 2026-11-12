import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  TextInput
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  X,
  Wrench,
  DollarSign,
  Clock,
  MapPin,
  Camera,
  Layers,
  ChevronDown,
  Check,
  Sparkles,
  Info
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { NexoraInput } from '@/components/common/NexoraInput';
import { NexoraButton } from '@/components/common/NexoraButton';
import categoryService, { ServiceCategory } from '@/services/categoryService';
import providerServiceService, { ServiceOffering } from '@/services/providerServiceService';
import { useSystemSettings } from '@/context/SystemSettingsContext';

interface PostServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onServiceCreated: (newService: ServiceOffering) => void;
  onServiceUpdated?: (updated: ServiceOffering) => void;
  initialService?: ServiceOffering | null;
  defaultLocation?: {
    city?: string;
    state?: string;
    address?: string;
    radiusMiles?: number;
  };
}

export const PostServiceModal: React.FC<PostServiceModalProps> = ({
  visible,
  onClose,
  onServiceCreated,
  onServiceUpdated,
  initialService,
  defaultLocation
}) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Form Fields
  const { settings } = useSystemSettings();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [pricingType, setPricingType] = useState<'fixed' | 'hourly' | 'custom_quote'>('fixed');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('60'); // in minutes
  const [city, setCity] = useState(defaultLocation?.city || '');
  const [address, setAddress] = useState(defaultLocation?.address || '');
  const [radiusMiles, setRadiusMiles] = useState(
    String(defaultLocation?.radiusMiles || settings.defaultDispatchRadiusMiles || '25')
  );

  // Media
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // State
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat?: number | null; lng?: number | null } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefill or reset form when modal opens
  useEffect(() => {
    if (visible && initialService) {
      setTitle(initialService.title || '');
      setDescription(initialService.description || '');
      const catId =
        typeof initialService.category === 'object'
          ? initialService.category._id
          : initialService.category;
      if (catId) setSelectedCategoryId(catId);
      setSelectedSubcategory(initialService.subcategory || '');
      setPricingType(initialService.pricingType || 'fixed');
      setPrice(initialService.price !== undefined ? String(initialService.price) : '');
      setDuration(initialService.duration !== undefined ? String(initialService.duration) : '60');
      setCity(initialService.serviceLocation?.city || defaultLocation?.city || '');
      setAddress(initialService.serviceLocation?.address || defaultLocation?.address || '');
      setCoordinates(initialService.serviceLocation?.coordinates || null);
      setRadiusMiles(
        String(
          initialService.serviceLocation?.serviceRadiusMiles ||
            initialService.serviceLocation?.serviceRadiusKm ||
            defaultLocation?.radiusMiles ||
            settings.defaultDispatchRadiusMiles ||
            '25'
        )
      );
      setCoverImage(initialService.images?.[0]?.url || null);
      setGalleryImages(initialService.images?.slice(1).map((i) => i.url) || []);
      setErrors({});
    } else if (visible && !initialService) {
      setTitle('');
      setDescription('');
      setSelectedSubcategory('');
      setPricingType('fixed');
      setPrice('');
      setDuration('60');
      setCity(defaultLocation?.city || '');
      setAddress(defaultLocation?.address || '');
      setCoordinates(null);
      setRadiusMiles(
        String(defaultLocation?.radiusMiles || settings.defaultDispatchRadiusMiles || '25')
      );
      setCoverImage(null);
      setGalleryImages([]);
      setErrors({});
    }
  }, [visible, initialService, defaultLocation, settings.defaultDispatchRadiusMiles]);

  // Load active service categories
  useEffect(() => {
    if (visible) {
      setLoadingCategories(true);
      categoryService
        .getServiceCategories()
        .then((cats) => {
          setCategories(cats || []);
          if (cats && cats.length > 0 && !selectedCategoryId && !initialService) {
            setSelectedCategoryId(cats[0]._id);
            if (cats[0].subcategories && cats[0].subcategories.length > 0) {
              setSelectedSubcategory(cats[0].subcategories[0].name);
            }
          }
        })
        .catch((err) => console.warn('Could not load service categories:', err))
        .finally(() => setLoadingCategories(false));
    }
  }, [visible, initialService]);

  // Set default city if provided
  useEffect(() => {
    if (defaultLocation?.city && !city) {
      setCity(defaultLocation.city);
    }
  }, [defaultLocation]);

  const activeCategory = categories.find((c) => c._id === selectedCategoryId);

  // Pick Cover Photo
  const handlePickCoverImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Camera roll access is needed to upload a cover photo for your service.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCoverImage(result.assets[0].uri);
        if (errors.coverImage) {
          setErrors((prev) => ({ ...prev, coverImage: '' }));
        }
      }
    } catch (err: any) {
      Alert.alert('Image Error', err?.message || 'Could not pick image.');
    }
  };

  // Pick Additional Gallery Images
  const handlePickGalleryImage = async () => {
    if (galleryImages.length >= 4) {
      Alert.alert('Limit Reached', 'You can upload up to 4 additional work sample photos.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setGalleryImages((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (err: any) {
      console.warn('Gallery pick error:', err);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Service title is required';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!selectedCategoryId) {
      newErrors.category = 'Please select a trade category';
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Please enter a valid rate greater than $0';
    }

    if (duration && (isNaN(Number(duration)) || Number(duration) <= 0)) {
      newErrors.duration = 'Duration must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // 1. Cover Image (avoid re-uploading if already on Cloudinary/remote)
      const uploadedImages: Array<{ url: string; publicId?: string; isPrimary: boolean }> = [];
      if (coverImage) {
        if (coverImage.startsWith('http')) {
          uploadedImages.push({
            url: coverImage,
            publicId: initialService?.images?.[0]?.publicId || '',
            isPrimary: true
          });
        } else {
          const coverUpload = await providerServiceService.uploadServiceImage(coverImage);
          uploadedImages.push({
            url: coverUpload.url,
            publicId: coverUpload.publicId,
            isPrimary: true
          });
        }
      }

      // 2. Gallery Images
      for (const uri of galleryImages) {
        if (uri.startsWith('http')) {
          uploadedImages.push({
            url: uri,
            isPrimary: false
          });
        } else {
          const galUpload = await providerServiceService.uploadServiceImage(uri);
          uploadedImages.push({
            url: galUpload.url,
            publicId: galUpload.publicId,
            isPrimary: false
          });
        }
      }

      // 3. Create or Update Service Offering
      const servicePayload = {
        title: title.trim(),
        description: description.trim(),
        category: selectedCategoryId,
        subcategory: selectedSubcategory,
        pricingType,
        price: Number(price),
        duration: Number(duration) || 60,
        images: uploadedImages,
        serviceLocation: {
          city: city.trim(),
          address: address.trim(),
          serviceRadiusMiles: Number(radiusMiles) || 25,
          serviceRadiusKm: Number(radiusMiles) || 25,
          coordinates: {
            lat: coordinates?.lat ?? initialService?.serviceLocation?.coordinates?.lat ?? null,
            lng: coordinates?.lng ?? initialService?.serviceLocation?.coordinates?.lng ?? null
          }
        }
      };

      if (initialService?._id) {
        const updated = await providerServiceService.updateService(initialService._id, servicePayload);
        Alert.alert(
          'Service Updated!',
          'Your service offering details have been updated successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onServiceUpdated) onServiceUpdated(updated);
                else onServiceCreated(updated);
              }
            }
          ]
        );
      } else {
        const created = await providerServiceService.createService(servicePayload);
        Alert.alert(
          'Service Published!',
          'Your service offering is now live in the marketplace catalog and ready for customer bookings.',
          [{ text: 'Great!', onPress: () => onServiceCreated(created) }]
        );
      }

      // Reset
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Failed to create service:', err);
      Alert.alert(
        'Submission Error',
        err?.response?.data?.message || err?.message || 'Could not publish service. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setDuration('60');
    setCoverImage(null);
    setGalleryImages([]);
    setErrors({});
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBadge}>
                <Wrench size={20} color={NexoraColors.primary} />
              </View>
              <View>
                <Text style={styles.modalTitle}>
                  {initialService ? 'Edit Service Offering' : 'Post New Service Offering'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {initialService
                    ? 'Update trade offerings, rates & service area'
                    : 'Publish your trade services to Nexora clients'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} disabled={submitting}>
              <X size={20} color={NexoraColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Section 1: Basic Information */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>Service Details</Text>

              {/* Title */}
              <NexoraInput
                label="Service Title"
                required
                placeholder="e.g. Residential Drain Cleaning & Unclogging"
                value={title}
                onChangeText={(val) => {
                  setTitle(val);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
                error={errors.title}
                leftIcon={<Wrench size={18} color="#94a3b8" />}
              />

              {/* Category Dropdown */}
              <Text style={styles.fieldLabel}>
                Trade Category<Text style={styles.requiredAsterisk}> *</Text>
              </Text>
              <TouchableOpacity
                style={[styles.dropdownTrigger, errors.category ? styles.inputError : null]}
                onPress={() => setCatDropdownOpen(!catDropdownOpen)}
                activeOpacity={0.8}
              >
                <Text style={activeCategory ? styles.dropdownVal : styles.dropdownPlaceholder}>
                  {activeCategory ? activeCategory.name : 'Select Primary Category'}
                </Text>
                <ChevronDown size={18} color="#64748b" />
              </TouchableOpacity>
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

              {/* Expanded Category Selector */}
              {catDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {loadingCategories ? (
                    <ActivityIndicator size="small" color={NexoraColors.primary} style={{ paddingVertical: 12 }} />
                  ) : (
                    categories.map((cat) => (
                      <TouchableOpacity
                        key={cat._id}
                        style={[
                          styles.dropdownItem,
                          selectedCategoryId === cat._id && styles.dropdownItemActive
                        ]}
                        onPress={() => {
                          setSelectedCategoryId(cat._id);
                          if (cat.subcategories && cat.subcategories.length > 0) {
                            setSelectedSubcategory(cat.subcategories[0].name);
                          } else {
                            setSelectedSubcategory('');
                          }
                          setCatDropdownOpen(false);
                          if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            selectedCategoryId === cat._id && styles.dropdownItemTextActive
                          ]}
                        >
                          {cat.name}
                        </Text>
                        {selectedCategoryId === cat._id && (
                          <Check size={16} color={NexoraColors.primary} />
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {/* Subcategory Pills */}
              {activeCategory?.subcategories && activeCategory.subcategories.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.fieldLabel}>Trade Specialty / Subcategory</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                    <View style={styles.pillsRow}>
                      {activeCategory.subcategories.map((sub, sIdx) => {
                        const isSubActive = selectedSubcategory === sub.name;
                        return (
                          <TouchableOpacity
                            key={sub.id || sub._id || sIdx}
                            style={[styles.subPill, isSubActive && styles.subPillActive]}
                            onPress={() => setSelectedSubcategory(sub.name)}
                          >
                            <Text
                              style={[styles.subPillText, isSubActive && styles.subPillTextActive]}
                            >
                              {sub.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Description */}
              <View style={{ marginTop: 12 }}>
                <Text style={styles.fieldLabel}>Scope & Description</Text>
                <TextInput
                  style={styles.textAreaInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Describe what is included, tools supplied, diagnostics, or warranties..."
                  placeholderTextColor="#94a3b8"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            {/* Section 2: Pricing & Duration */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>Pricing Model & Duration</Text>

              {/* Pricing Type Selector */}
              <View style={styles.pricingTypeSwitch}>
                <TouchableOpacity
                  style={[
                    styles.pricingTypeBtn,
                    pricingType === 'fixed' && styles.pricingTypeBtnActive
                  ]}
                  onPress={() => setPricingType('fixed')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pricingTypeBtnText,
                      pricingType === 'fixed' && styles.pricingTypeBtnTextActive
                    ]}
                    numberOfLines={1}
                  >
                    Fixed Rate
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.pricingTypeBtn,
                    pricingType === 'hourly' && styles.pricingTypeBtnActive
                  ]}
                  onPress={() => setPricingType('hourly')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pricingTypeBtnText,
                      pricingType === 'hourly' && styles.pricingTypeBtnTextActive
                    ]}
                    numberOfLines={1}
                  >
                    Hourly Rate
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.pricingTypeBtn,
                    pricingType === 'custom_quote' && styles.pricingTypeBtnActive
                  ]}
                  onPress={() => setPricingType('custom_quote')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pricingTypeBtnText,
                      pricingType === 'custom_quote' && styles.pricingTypeBtnTextActive
                    ]}
                    numberOfLines={1}
                  >
                    Custom Quote
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Price & Duration Row */}
              <View style={styles.rowTwoCols}>
                <View style={{ flex: 1 }}>
                  <NexoraInput
                    label={
                      pricingType === 'hourly'
                        ? 'Rate per Hour ($)'
                        : pricingType === 'custom_quote'
                        ? 'Est. Base Quote ($)'
                        : 'Fixed Base Price ($)'
                    }
                    required
                    placeholder="e.g. 75.00"
                    keyboardType="decimal-pad"
                    value={price}
                    onChangeText={(val) => {
                      setPrice(val);
                      if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
                    }}
                    error={errors.price}
                    leftIcon={<DollarSign size={18} color="#94a3b8" />}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <NexoraInput
                    label="Est. Duration (Mins)"
                    placeholder="60"
                    keyboardType="number-pad"
                    value={duration}
                    onChangeText={setDuration}
                    error={errors.duration}
                    leftIcon={<Clock size={18} color="#94a3b8" />}
                  />
                </View>
              </View>
            </View>

            {/* Section 3: Service Area & Location */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>Service Area Coverage</Text>

              <NexoraInput
                label="Primary City / Base Location"
                placeholder="e.g. Austin, TX"
                value={city}
                onChangeText={setCity}
                leftIcon={<MapPin size={18} color="#94a3b8" />}
              />

              <View style={{ marginTop: 10 }}>
                <Text style={styles.fieldLabel}>Service Radius (Miles)</Text>
                <View style={styles.radiusPillsRow}>
                  {['10', '25', '50', '100'].map((rad) => (
                    <TouchableOpacity
                      key={rad}
                      style={[styles.radiusPill, radiusMiles === rad && styles.radiusPillActive]}
                      onPress={() => setRadiusMiles(rad)}
                    >
                      <Text
                        style={[
                          styles.radiusPillText,
                          radiusMiles === rad && styles.radiusPillTextActive
                        ]}
                      >
                        {rad} mi
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.geoNoteBox}>
                <MapPin size={14} color="#084e8a" />
                <Text style={styles.geoNoteText}>
                  {coordinates?.lat && coordinates?.lng
                    ? `GPS Locked: ${Number(coordinates.lat).toFixed(3)}, ${Number(coordinates.lng).toFixed(3)} • Only customers within ${radiusMiles} mi will see this service.`
                    : `Auto-Geocoded: When you publish, Nexora pinpoints GPS coordinates to match customers within your ${radiusMiles} mi travel zone.`}
                </Text>
              </View>
            </View>

            {/* Section 4: Work Photos & Samples */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>Service Photos</Text>
              <Text style={styles.sectionSub}>
                Upload a cover banner and recent examples of your work.
              </Text>

              {/* Cover Photo */}
              <Text style={styles.fieldLabel}>Cover Photo (Featured)</Text>
              {coverImage ? (
                <View style={styles.coverPreviewContainer}>
                  <Image source={{ uri: coverImage }} style={styles.coverPreviewImg} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setCoverImage(null)}
                  >
                    <X size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadPlaceholderBox}
                  onPress={handlePickCoverImage}
                  activeOpacity={0.8}
                >
                  <Camera size={26} color="#94a3b8" />
                  <Text style={styles.uploadBoxText}>Tap to select cover photo</Text>
                  <Text style={styles.uploadBoxSub}>Recommended: 16:9 banner</Text>
                </TouchableOpacity>
              )}

              {/* Additional Gallery */}
              <View style={{ marginTop: 14 }}>
                <View style={styles.galleryHeaderRow}>
                  <Text style={styles.fieldLabel}>Work Samples ({galleryImages.length}/4)</Text>
                  {galleryImages.length < 4 && (
                    <TouchableOpacity onPress={handlePickGalleryImage}>
                      <Text style={styles.addMorePhotosText}>+ Add Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.galleryThumbGrid}>
                  {galleryImages.map((uri, idx) => (
                    <View key={idx} style={styles.galleryThumbWrap}>
                      <Image source={{ uri }} style={styles.galleryThumb} />
                      <TouchableOpacity
                        style={styles.removeGalleryBtn}
                        onPress={() => handleRemoveGalleryImage(idx)}
                      >
                        <X size={12} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {galleryImages.length < 4 && (
                    <TouchableOpacity
                      style={styles.galleryAddBtn}
                      onPress={handlePickGalleryImage}
                    >
                      <Camera size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            <View style={{ height: 30 }} />
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <View style={styles.submittingRow}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.submitBtnText}>
                    {initialService ? 'Saving...' : 'Publishing...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.submitBtnText}>
                  {initialService ? 'Save Changes' : 'Publish Service'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12
  },
  modalHeader: {
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  headerIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#eef5fc',
    borderWidth: 1,
    borderColor: '#bdd8f2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a'
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b'
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: {
    padding: 16
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.card
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#0f172a',
    marginBottom: 12
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: -8,
    marginBottom: 12
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6
  },
  requiredAsterisk: {
    color: '#ef4444',
    fontWeight: '700'
  },
  dropdownTrigger: {
    height: 48,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dropdownVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a'
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: '#94a3b8'
  },
  dropdownMenu: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    marginTop: 6,
    overflow: 'hidden',
    ...Shadows.floating
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  dropdownItemActive: {
    backgroundColor: '#eef5fc'
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#334155'
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: NexoraColors.primary
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8
  },
  subPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  subPillActive: {
    backgroundColor: NexoraColors.primary,
    borderColor: NexoraColors.primary
  },
  subPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  subPillTextActive: {
    color: '#ffffff'
  },
  textAreaInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
    textAlignVertical: 'top',
    minHeight: 80
  },
  pricingTypeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
    gap: 4
  },
  pricingTypeBtn: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  pricingTypeBtnActive: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    ...Shadows.sm
  },
  pricingTypeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center'
  },
  pricingTypeBtnTextActive: {
    color: NexoraColors.primary,
    fontWeight: '800'
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12
  },
  radiusPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4
  },
  radiusPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  radiusPillActive: {
    borderColor: NexoraColors.primary,
    backgroundColor: '#eef5fc'
  },
  radiusPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569'
  },
  radiusPillTextActive: {
    color: NexoraColors.primary,
    fontWeight: '700'
  },
  geoNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#bae0fd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 14,
  },
  geoNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#084e8a',
    lineHeight: 16,
    fontWeight: '500',
  },
  coverPreviewContainer: {
    position: 'relative',
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  coverPreviewImg: {
    width: '100%',
    height: '100%'
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadPlaceholderBox: {
    height: 110,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  },
  uploadBoxText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 6
  },
  uploadBoxSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2
  },
  galleryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  addMorePhotosText: {
    fontSize: 12,
    fontWeight: '700',
    color: NexoraColors.primary
  },
  galleryThumbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  galleryThumbWrap: {
    width: 64,
    height: 64,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  galleryThumb: {
    width: '100%',
    height: '100%'
  },
  removeGalleryBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  galleryAddBtn: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  },
  inputError: {
    borderColor: NexoraColors.statusRejected
  },
  errorText: {
    fontSize: 11,
    color: NexoraColors.statusRejected,
    marginTop: 4
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#ffffff'
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569'
  },
  submitBtn: {
    flex: 2,
    height: 48,
    borderRadius: 10,
    backgroundColor: NexoraColors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitBtnDisabled: {
    opacity: 0.6
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff'
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  }
});

export default PostServiceModal;
