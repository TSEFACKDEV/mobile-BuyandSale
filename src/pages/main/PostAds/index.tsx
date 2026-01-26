import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useThemeColors } from '../../../contexts/ThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppSelector, useAppDispatch } from '../../../hooks/store';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootNavigationProp } from '../../../types/navigation';
import ConfirmDialog from '../../../components/ConfirmDialog';

// Redux Actions
import { getAllCategoriesAction } from '../../../store/category/actions';
import { fetchCitiesAction } from '../../../store/city/actions';
import { createProductAction } from '../../../store/product/actions';
import { getAllForfaitsAction } from '../../../store/forfait/actions';
import { validateCameroonPhone } from '../../../utils/phoneUtils';
import PhoneInput from '../../../components/PhoneInput';
import { 
  validateImageComplete, 
  validateImagesArray 
} from '../../../utils/imageUtils';
import { 
  validateProductForm,
  filterQuartierChars 
} from '../../../utils/securityUtils';

// Redux Selectors
import {
  selectCategories,
  selectCategoriesStatus,
} from '../../../store/category/slice';
import { selectCities, selectCitiesStatus } from '../../../store/city/slice';
import {
  selectForfaits,
  selectForfaitStatus,
} from '../../../store/forfait/slice';

// Modals (depuis components)
import {
  BoostOfferModal,
  ForfaitSelectorModal,
  PaymentModal,
  PaymentStatusModal,
} from '../../../components/modals';

import { styles, IMAGE_SIZE, MAX_IMAGES } from './styles';

// Interface pour les données du formulaire
interface PostAdFormData {
  name: string;
  description: string;
  price: string;
  quantity: string;
  categoryId: string;
  cityId: string;
  etat: 'NEUF' | 'OCCASION' | 'CORRECT';
  images: { uri: string; type: string; name: string }[];
  quartier: string;
  telephone: string;
}

// Configuration des conditions
const CONDITIONS = [
  { value: 'NEUF', label: 'Neuf' },
  { value: 'OCCASION', label: 'Occasion' },
  { value: 'CORRECT', label: 'Correct' },
] as const;

const PostAds: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { t } = useTranslation();

  // Redux state
  const categories = useAppSelector(selectCategories);
  const categoryStatus = useAppSelector(selectCategoriesStatus);
  const cities = useAppSelector(selectCities);
  const cityStatus = useAppSelector(selectCitiesStatus);
  const forfaits = useAppSelector(selectForfaits);
  const forfaitStatus = useAppSelector(selectForfaitStatus);

  // États locaux
  const [formData, setFormData] = useState<PostAdFormData>({
    name: '',
    description: '',
    price: '',
    quantity: '1',
    categoryId: '',
    cityId: '',
    etat: 'OCCASION',
    images: [],
    quartier: '',
    telephone: '',
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  
  // États pour les forfaits
  const [showBoostOffer, setShowBoostOffer] = useState(false);
  const [showForfaitSelector, setShowForfaitSelector] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [selectedForfaitId, setSelectedForfaitId] = useState<string | null>(null);
  const [selectedForfaitType, setSelectedForfaitType] = useState<string | null>(null);
  const [selectedForfaitPrice, setSelectedForfaitPrice] = useState<number>(0);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);

  // État pour le dialog de confirmation
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'default' | 'destructive' | 'success' | 'warning';
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const isMountedRef = useRef(true);

  // Charger les données au montage
  useEffect(() => {
    isMountedRef.current = true;
    
    if (categoryStatus === 'IDLE') {
      dispatch(getAllCategoriesAction());
    }
    if (cityStatus === 'IDLE') {
      dispatch(fetchCitiesAction());
    }
    if (forfaitStatus === 'idle' && forfaits.length === 0) {
      dispatch(getAllForfaitsAction());
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [dispatch, categoryStatus, cityStatus]);

  // Handlers
  const handleInputChange = (field: keyof PostAdFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      price: '',
      quantity: '1',
      categoryId: '',
      cityId: '',
      etat: 'OCCASION',
      images: [],
      quartier: '',
      telephone: '',
    });
    setCurrentStep(1);
    setCreatedProductId(null);
    setSelectedForfaitId(null);
    setSelectedForfaitType(null);
    setSelectedForfaitPrice(0);
    setCurrentPaymentId(null);
  }, []);

  // Helpers pour dialog
  const closeDialog = useCallback(() => {
    setConfirmDialog({ visible: false, title: '', message: '' });
  }, []);

  const closeAndNavigateHome = useCallback(() => {
    closeDialog();
    navigation.navigate('HomeTab');
  }, [closeDialog, navigation]);

  // Réinitialiser le formulaire quand on quitte la page
  useFocusEffect(
    useCallback(() => {
      return () => {
        resetForm();
      };
    }, [resetForm])
  );

  const getCategoryName = () => {
    const category = categories.find(c => c.id === formData.categoryId);
    return category?.name || t('postAds.selectCategoryPlaceholder');
  };

  const getCityName = () => {
    const city = cities.find(c => c.id === formData.cityId);
    return city?.name || t('postAds.selectCityPlaceholder');
  };

  // Sélection d'images avec validation complète
  const handleImagePick = async () => {
    const availableSlots = MAX_IMAGES - formData.images.length;

    if (availableSlots === 0) {
      setConfirmDialog({
        visible: true,
        title: t('postAds.maxImagesReached'),
        message: t('postAds.maxImagesMessage').replace('{max}', MAX_IMAGES.toString()),
        type: 'warning',
        confirmText: 'OK',
        onConfirm: closeDialog,
      });
      return;
    }

    // Demander la permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setConfirmDialog({
        visible: true,
        title: t('postAds.permissionRequired'),
        message: t('postAds.permissionMessage'),
        type: 'warning',
        confirmText: 'OK',
        onConfirm: closeDialog,
      });
      return;
    }

    // Lancer le sélecteur d'images
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: availableSlots,
    });

    if (!result.canceled && result.assets) {
      // 🔥 VALIDATION COMPLÈTE DE CHAQUE IMAGE
      const validatedImages: Array<{ uri: string; type: string; name: string }> = [];
      const errors: string[] = [];

      for (let i = 0; i < result.assets.length; i++) {
        const asset = result.assets[i];
        
        // Valider l'image
        const validation = await validateImageComplete({
          uri: asset.uri,
          fileSize: asset.fileSize,
          type: asset.mimeType || asset.type || undefined,
        }, 'product');

        if (validation.isValid) {
          validatedImages.push({
            uri: asset.uri,
            type: asset.mimeType || 'image/jpeg',
            name: asset.fileName || `image_${Date.now()}_${i}.jpg`,
          });
        } else {
          errors.push(`Image ${i + 1}: ${validation.error}`);
        }
      }

      // Ajouter les images valides
      if (validatedImages.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...validatedImages],
        }));
      }

      // Afficher les erreurs s'il y en a
      if (errors.length > 0) {
        setConfirmDialog({
          visible: true,
          title: '⚠️ Certaines images ont été rejetées',
          message: errors.join('\n\n'),
          type: 'warning',
          confirmText: 'OK',
          onConfirm: closeDialog,
        });
      } else if (validatedImages.length > 0) {
        // Toutes les images sont valides
        setConfirmDialog({
          visible: true,
          title: '✅ Images validées',
          message: `${validatedImages.length} image(s) ajoutée(s) avec succès`,
          type: 'success',
          confirmText: 'OK',
          onConfirm: closeDialog,
        });
      }
    }
  };

  // Supprimer une image
  const handleImageRemove = (index: number) => {
    setConfirmDialog({
      visible: true,
      title: t('postAds.deleteImage'),
      message: t('postAds.deleteImageConfirm'),
      type: 'warning',
      confirmText: t('postAds.delete'),
      cancelText: t('common.cancel'),
      onConfirm: () => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, images: newImages }));
        closeDialog();
      },
      onCancel: closeDialog,
    });
  };

  // Validation des étapes
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        // Étape 1 : Informations du produit (nom, description, prix, catégorie, état)
        return (
          formData.name.trim().length >= 2 &&
          formData.description.trim().length >= 10 &&
          formData.price.trim().length > 0 &&
          Number(formData.price) > 0 &&
          formData.categoryId !== ''
        );
      case 2:
        // Étape 2 : Photos et localisation (images, ville, quartier)
        return (
          formData.images.length > 0 &&
          formData.cityId !== '' &&
          formData.quartier.trim().length > 0
        );
      case 3:
        // Étape 3 : Contact (téléphone, quantité)
        return (
          validateCameroonPhone(formData.telephone) &&
          Number(formData.quantity) > 0
        );
      default:
        return false;
    }
  };

  // Navigation entre étapes
  const handleNextStep = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      setConfirmDialog({
        visible: true,
        title: t('postAds.validationError'),
        message: t('postAds.fillRequired'),
        type: 'destructive',
        confirmText: 'OK',
      });
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Soumission du formulaire avec validation des images
  const handleSubmit = async () => {
    if (isSubmitting || !isMountedRef.current) return;

    setIsSubmitting(true);

    try {
      // 🔒 VALIDATION DE SÉCURITÉ COMPLÈTE
      const securityValidation = validateProductForm({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        quantity: formData.quantity,
        quartier: formData.quartier,
        categoryId: formData.categoryId,
        cityId: formData.cityId,
      });

      const validationErrors = [...securityValidation.errors];

      // Validation téléphone
      if (!validateCameroonPhone(formData.telephone)) {
        validationErrors.push(t('postAds.validations.phoneInvalid'));
      }

      // Validation images
      if (!formData.images || formData.images.length === 0) {
        validationErrors.push(t('postAds.validations.imagesRequired'));
      }

      // 🔥 VALIDATION FINALE DES IMAGES AVANT SOUMISSION
      if (formData.images.length > 0) {
        const imagesValidation = await validateImagesArray(formData.images, 'product');
        if (!imagesValidation.isValid) {
          validationErrors.push(...imagesValidation.errors);
        }
      }

      if (validationErrors.length > 0) {
        setConfirmDialog({
          visible: true,
          title: t('postAds.validationErrors'),
          message: validationErrors.join('\n'),
          type: 'destructive',
          confirmText: 'OK',
        });
        setIsSubmitting(false);
        return;
      }

      // ✅ Utiliser les données sanitizées (sécurisées)
      const productData: any = {
        name: securityValidation.sanitized.name,
        description: securityValidation.sanitized.description,
        price: securityValidation.sanitized.price,
        quantity: securityValidation.sanitized.quantity,
        categoryId: securityValidation.sanitized.categoryId,
        cityId: securityValidation.sanitized.cityId,
        etat: formData.etat,
        quartier: securityValidation.sanitized.quartier,
        telephone: formData.telephone,
        images: formData.images,
      };

      const result = await dispatch(createProductAction(productData));

      if (result.meta.requestStatus === 'fulfilled') {
        // Proposer le boost
        const createdProduct = (result.payload as any)?.product;

        if (!createdProduct?.id) {
          setConfirmDialog({
            visible: true,
            title: t('postAds.errorProductId'),
            message: t('postAds.errorProductIdMessage'),
            type: 'destructive',
            confirmText: 'OK',
          });
          setIsSubmitting(false);
          return;
        }

        setCreatedProductId(createdProduct.id);

        // Proposer le boost si des forfaits sont disponibles
        if (forfaits && forfaits.length > 0) {
          setTimeout(() => {
            if (isMountedRef.current) {
              setShowBoostOffer(true);
            }
          }, 500);
        } else {
          setConfirmDialog({
            visible: true,
            title: t('postAds.successCreated'),
            message: t('postAds.successCreatedMessage'),
            type: 'success',
            confirmText: 'OK',
            cancelText: '',
            onConfirm: closeAndNavigateHome,
          });
        }
      } else {
        const errorMsg = (result.payload as any)?.message || t('postAds.errorCreating');
        setConfirmDialog({
          visible: true,
          title: t('postAds.errorGeneric'),
          message: errorMsg,
          type: 'destructive',
          confirmText: 'OK',
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || t('postAds.errorCreating');
      
      // 🚦 Gestion du rate limiting
      if (errorMessage.includes('Limite de création de produits atteinte')) {
        setConfirmDialog({
          visible: true,
          title: 'Limite atteinte',
          message: 'Vous créez des annonces trop rapidement. Veuillez patienter 1 minute avant de continuer.',
          type: 'warning',
          confirmText: 'OK',
        });
        return;
      }
      
      setConfirmDialog({
        visible: true,
        title: t('postAds.errorGeneric'),
        message: errorMessage,
        type: 'destructive',
        confirmText: 'OK',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers pour les forfaits
  const handleAcceptBoost = () => {
    if (!isMountedRef.current) return;
    setShowBoostOffer(false);
    setTimeout(() => {
      if (isMountedRef.current) {
        setShowForfaitSelector(true);
      }
    }, 100);
  };

  const handleDeclineBoost = () => {
    if (!isMountedRef.current) return;
    setShowBoostOffer(false);

    setConfirmDialog({
      visible: true,
      title: t('postAds.successCreated'),
      message: t('postAds.successCreatedMessage'),
      type: 'success',
      confirmText: t('postAds.ok'),
      cancelText: '',
      onConfirm: closeAndNavigateHome,
    });
  };

  const handleForfaitSelected = (forfaitType: string, forfaitId: string) => {
    try {
      if (!createdProductId) {
        throw new Error('ID du produit non disponible');
      }

      const selectedForfait = forfaits?.find((f: any) => f.id === forfaitId);
      if (!selectedForfait) {
        throw new Error(`Forfait avec ID ${forfaitId} non trouvé`);
      }

      setSelectedForfaitId(forfaitId);
      setSelectedForfaitType(forfaitType);
      setSelectedForfaitPrice(selectedForfait.price);
      setShowForfaitSelector(false);

      setTimeout(() => {
        if (isMountedRef.current) {
          setShowPaymentModal(true);
        }
      }, 100);
    } catch (error: any) {
      setConfirmDialog({
        visible: true,
        title: t('common.error'),
        message: error.message,
        type: 'destructive',
        confirmText: 'OK',
      });
      setShowForfaitSelector(false);
    }
  };

  const handleSkipForfait = () => {
    if (!isMountedRef.current) return;

    setShowForfaitSelector(false);
    setShowBoostOffer(false);

    setConfirmDialog({
      visible: true,
      title: t('notifications.info'),
      message: t('postAds.publishedWithoutForfait'),
      type: 'default',
      confirmText: t('postAds.ok'),
      cancelText: '',
      onConfirm: closeAndNavigateHome,
    });
  };

  const handlePaymentInitiated = (paymentId: string) => {
    setCurrentPaymentId(paymentId);
    setShowPaymentModal(false);
    setTimeout(() => {
      if (isMountedRef.current) {
        setShowPaymentStatusModal(true);
      }
    }, 300);
  };

  // Helper pour fermer tous les modals et retourner à l'accueil
  const closeAllModalsAndNavigateHome = useCallback(() => {
    if (!isMountedRef.current) return;
    setShowPaymentStatusModal(false);
    setShowPaymentModal(false);
    setShowForfaitSelector(false);
    setShowBoostOffer(false);
    navigation.navigate('HomeTab');
  }, [navigation]);

  const handlePaymentSuccess = () => closeAllModalsAndNavigateHome();
  const handlePaymentError = () => closeAllModalsAndNavigateHome();
  const handlePaymentCancel = () => closeAllModalsAndNavigateHome();

  // Render des étapes
  const renderStep1 = () => (
    <View>
      {/* Nom du produit */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('postAds.productName')} <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder={t('postAds.productNamePlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
          maxLength={100}
        />
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('postAds.description')} <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder={t('postAds.descriptionPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={formData.description}
          onChangeText={(text) => handleInputChange('description', text)}
          multiline
          numberOfLines={5}
          maxLength={1000}
        />
        <View style={styles.characterCounter}>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            {t('postAds.characterCounter').replace('{count}', formData.description.length.toString())}
          </Text>
          {formData.description.length < 10 && formData.description.length > 0 && (
            <Text style={styles.warningText}>
              {t('postAds.charactersMissing').replace('{count}', (10 - formData.description.length).toString())}
            </Text>
          )}
          {formData.description.length >= 10 && (
            <Text style={styles.validText}>{t('postAds.validated')}</Text>
          )}
        </View>
      </View>

      {/* Prix */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('postAds.price')} <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.priceInputContainer}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, paddingRight: 60 }]}
            placeholder={t('postAds.pricePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={formData.price}
            onChangeText={(text) => handleInputChange('price', text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
          />
          <Text style={styles.priceLabel}>FCFA</Text>
        </View>
      </View>

      {/* Catégorie */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('postAds.category')} <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowCategoryPicker(true)}
        >
          <Text style={[styles.pickerText, { color: formData.categoryId ? colors.text : colors.textSecondary }]}>
            {getCategoryName()}
          </Text>
          <Icon name="chevron-down" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* État du produit */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('postAds.productState')} <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.conditionContainer}>
          {CONDITIONS.map((condition) => (
            <TouchableOpacity
              key={condition.value}
              style={[
                styles.conditionButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                formData.etat === condition.value && styles.conditionButtonActive,
              ]}
              onPress={() => handleInputChange('etat', condition.value)}
            >
              <Text
                style={[
                  styles.conditionButtonText,
                  { color: colors.text },
                  formData.etat === condition.value && styles.conditionButtonTextActive,
                ]}
              >
                {condition.value === 'NEUF' ? t('postAds.stateNew') : condition.value === 'OCCASION' ? t('postAds.stateUsed') : t('postAds.stateFair')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      {/* Photos du produit */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('postAds.addPhotos')} <Text style={styles.required}>*</Text>
        </Text>
        <Text style={[styles.helperText, { color: colors.textSecondary, marginBottom: 10 }]}>
          {t('postAds.photosSubtitle').replace('{max}', MAX_IMAGES.toString())}
        </Text>
        
        {/* Zone d'upload */}
        <TouchableOpacity
          style={[
            styles.uploadZone,
            formData.images.length >= MAX_IMAGES ? styles.uploadZoneDisabled : styles.uploadZoneActive,
            { borderColor: formData.images.length >= MAX_IMAGES ? colors.border : '#D1D5DB' }
          ]}
          onPress={handleImagePick}
          disabled={formData.images.length >= MAX_IMAGES}
        >
          <View style={styles.uploadIcon}>
            <Icon 
              name="cloud-upload-outline" 
              size={40} 
              color={formData.images.length >= MAX_IMAGES ? colors.textSecondary : '#FF6B35'} 
            />
          </View>
          {formData.images.length >= MAX_IMAGES ? (
            <>
              <Text style={[styles.uploadTitle, { color: colors.textSecondary }]}>
                {t('postAds.maxImagesReached')}
              </Text>
              <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
                {t('postAds.maxImagesMessage').replace('{max}', MAX_IMAGES.toString())}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.uploadTitle, { color: colors.text }]}>
                {t('postAds.addPhotoButton')}
              </Text>
              <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
                {t('postAds.noPhotos')}
              </Text>
              <Text style={[styles.uploadCount, { color: '#FF6B35' }]}>
                {formData.images.length}/{MAX_IMAGES} images
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Preview des images */}
        {formData.images.length > 0 && (
          <View style={styles.imageGrid}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.imagePreviewContainer}>
                <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleImageRemove(index)}
                >
                  <Icon name="close" size={16} color="#FF3B30" />
                </TouchableOpacity>
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>{index + 1}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Ville */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('postAds.city')} <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowCityPicker(true)}
        >
          <Text style={[styles.pickerText, { color: formData.cityId ? colors.text : colors.textSecondary }]}>
            {getCityName()}
          </Text>
          <Icon name="chevron-down" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Quartier */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('postAds.neighborhood')} <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder={t('postAds.neighborhoodPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={formData.quartier}
          onChangeText={(text) => handleInputChange('quartier', filterQuartierChars(text).substring(0, 100))}
          maxLength={100}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      {/* Téléphone */}
      <View style={styles.inputGroup}>
        <PhoneInput
          label={t('postAds.phone')}
          value={formData.telephone}
          onChangeText={(text) => handleInputChange('telephone', text)}
          placeholder={t('postAds.phonePlaceholder')}
          required
        />
      </View>

      {/* Quantité */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('postAds.quantity')} <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder={t('postAds.quantityPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={formData.quantity}
          onChangeText={(text) => handleInputChange('quantity', text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
        />
      </View>

      {/* Résumé */}
      <View style={[styles.summaryCard, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>
          {t('postAds.summary')}
        </Text>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('postAds.summaryProduct')}</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={1}>
            {formData.name || '-'}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('postAds.summaryPrice')}</Text>
          <Text style={[styles.summaryValue, { color: '#FF6B35' }]}>
            {formData.price ? `${formData.price} FCFA` : '-'}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('postAds.summaryState')}</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formData.etat === 'NEUF' ? t('postAds.stateNew') : formData.etat === 'OCCASION' ? t('postAds.stateUsed') : t('postAds.stateFair')}
          </Text>
        </View>
        
        <View style={[styles.summaryRow, styles.summaryRowLast]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('postAds.summaryImages')}</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formData.images.length}/{MAX_IMAGES}
          </Text>
        </View>
      </View>
    </View>
  );

  // Render principal
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t('postAds.title')}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Étape {currentStep} sur 3
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Step Indicator */}
      <View style={styles.stepIndicatorContainer}>
        <View style={styles.stepsWrapper}>
          {[
            { num: 1, label: 'Infos' },
            { num: 2, label: 'Photos' },
            { num: 3, label: 'Contact' },
          ].map((step, index) => (
            <React.Fragment key={step.num}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    currentStep >= step.num && styles.stepCircleActive,
                    currentStep > step.num && styles.stepCircleCompleted,
                    currentStep < step.num && styles.stepCircleInactive,
                  ]}
                >
                  {currentStep > step.num ? (
                    <Icon name="checkmark" size={16} color="#FFF" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        currentStep >= step.num ? styles.stepNumberActive : styles.stepNumberInactive,
                      ]}
                    >
                      {step.num}
                    </Text>
                  )}
                </View>
                <Text 
                  style={[
                    styles.stepLabel, 
                    { color: currentStep >= step.num ? colors.text : colors.textSecondary }
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>
              {index < 2 && (
                <View
                  style={[
                    styles.stepLine,
                    currentStep > step.num ? styles.stepLineActive : styles.stepLineInactive,
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Content avec Card */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
          {/* Step titles */}
          <View style={styles.stepTitleContainer}>
            <Text style={[styles.formStepTitle, { color: colors.text }]}>
              {currentStep === 1 && t('postAds.step1Title')}
              {currentStep === 2 && t('postAds.step2Title')}
              {currentStep === 3 && t('postAds.step3Title')}
            </Text>
            <Text style={[styles.formStepSubtitle, { color: colors.textSecondary }]}>
              {currentStep === 1 && t('postAds.step1Subtitle')}
              {currentStep === 2 && t('postAds.step2Subtitle')}
              {currentStep === 3 && t('postAds.step3Subtitle')}
            </Text>
          </View>

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </View>
      </ScrollView>

      {/* Footer avec boutons de navigation */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[styles.footerButton, styles.backFooterButton, { borderColor: colors.border }]}
            onPress={handlePreviousStep}
          >
            <Icon name="arrow-back" size={20} color="#FF6B35" />
            <Text style={[styles.footerButtonText, { color: '#FF6B35' }]}>
              {t('postAds.previous')}
            </Text>
          </TouchableOpacity>
        )}

        {currentStep < 3 ? (
          <TouchableOpacity
            style={[
              styles.footerButton,
              styles.nextFooterButton,
              { marginLeft: currentStep === 1 ? 'auto' : 0 },
              !isStepValid(currentStep) && styles.footerButtonDisabled,
            ]}
            onPress={handleNextStep}
            disabled={!isStepValid(currentStep)}
          >
            <Text style={styles.footerButtonTextWhite}>{t('postAds.next')}</Text>
            <Icon name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.footerButton,
              styles.submitButton,
              { marginLeft: 'auto' },
              (!isStepValid(3) || isSubmitting) && styles.footerButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isStepValid(3) || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.footerButtonTextWhite}>
                  {t('postAds.publish')}
                </Text>
                <Icon name="checkmark" size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Modals */}
      {/* Modal de sélection de catégorie */}
      <Modal visible={showCategoryPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerModal, { backgroundColor: colors.surface }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.pickerHeaderTitle, { color: colors.text }]}>
                {t('postAds.selectCategory')}
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.pickerItem,
                    { backgroundColor: formData.categoryId === category.id ? '#f973161a' : 'transparent' },
                  ]}
                  onPress={() => {
                    handleInputChange('categoryId', category.id);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, { color: colors.text }]}>
                    {category.name}
                  </Text>
                  {formData.categoryId === category.id && (
                    <Icon name="checkmark-circle" size={20} color="#f97316" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de sélection de ville */}
      <Modal visible={showCityPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerModal, { backgroundColor: colors.surface }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.pickerHeaderTitle, { color: colors.text }]}>
                {t('postAds.selectCity')}
              </Text>
              <TouchableOpacity onPress={() => setShowCityPicker(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {cities.map((city) => (
                <TouchableOpacity
                  key={city.id}
                  style={[
                    styles.pickerItem,
                    { backgroundColor: formData.cityId === city.id ? '#f973161a' : 'transparent' },
                  ]}
                  onPress={() => {
                    handleInputChange('cityId', city.id);
                    setShowCityPicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, { color: colors.text }]}>
                    {city.name}
                  </Text>
                  {formData.cityId === city.id && (
                    <Icon name="checkmark-circle" size={20} color="#f97316" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BoostOfferModal
        visible={showBoostOffer}
        onAccept={handleAcceptBoost}
        onDecline={handleDeclineBoost}
      />

      <ForfaitSelectorModal
        visible={showForfaitSelector}
        forfaits={forfaits || []}
        onSelect={handleForfaitSelected}
        onSkip={handleSkipForfait}
        onClose={() => setShowForfaitSelector(false)}
        productName={formData.name || 'votre annonce'}
        isLoading={forfaitStatus === 'loading'}
      />

      <PaymentModal
        visible={showPaymentModal}
        productId={createdProductId}
        forfaitId={selectedForfaitId}
        forfaitType={selectedForfaitType}
        forfaitPrice={selectedForfaitPrice}
        onPaymentInitiated={handlePaymentInitiated}
        onClose={handlePaymentCancel}
      />

      <PaymentStatusModal
        visible={showPaymentStatusModal}
        paymentId={currentPaymentId}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onClose={handlePaymentCancel}
      />

      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm || closeDialog}
        onCancel={confirmDialog.onCancel || closeDialog}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
      />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostAds;
