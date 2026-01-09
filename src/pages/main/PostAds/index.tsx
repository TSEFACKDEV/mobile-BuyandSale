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
  Alert,
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

// Redux Actions
import { getAllCategoriesAction } from '../../../store/category/actions';
import { fetchCitiesAction } from '../../../store/city/actions';
import { createProductAction } from '../../../store/product/actions';
import { getAllForfaitsAction } from '../../../store/forfait/actions';
import { validateCameroonPhone } from '../../../utils/phoneUtils';
import PhoneInput from '../../../components/PhoneInput';

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

  // Réinitialiser le formulaire quand on quitte la page
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Cleanup: réinitialiser le formulaire quand on quitte la page
        resetForm();
      };
    }, [])
  );

  // Recharger les forfaits quand le modal s'ouvre
  useEffect(() => {
    if (showForfaitSelector && (!forfaits || forfaits.length === 0)) {
      dispatch(getAllForfaitsAction());
    }
  }, [showForfaitSelector, dispatch]);

  // Handlers
  const handleInputChange = (field: keyof PostAdFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
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
  };

  const getCategoryName = () => {
    const category = categories.find(c => c.id === formData.categoryId);
    return category?.name || t('postAds.selectCategoryPlaceholder');
  };

  const getCityName = () => {
    const city = cities.find(c => c.id === formData.cityId);
    return city?.name || t('postAds.selectCityPlaceholder');
  };

  // Sélection d'images
  const handleImagePick = async () => {
    const availableSlots = MAX_IMAGES - formData.images.length;

    if (availableSlots === 0) {
      Alert.alert(t('postAds.maxImagesReached'), t('postAds.maxImagesMessage').replace('{max}', MAX_IMAGES.toString()));
      return;
    }

    // Demander la permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('postAds.permissionRequired'), t('postAds.permissionMessage'));
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
      const newImages = result.assets.map((asset, index) => ({
        uri: asset.uri,
        type: 'image/jpeg',
        name: `image_${Date.now()}_${index}.jpg`,
      }));

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));

      Alert.alert(t('postAds.imagesAdded'), t('postAds.imagesAddedMessage').replace('{count}', newImages.length.toString()));
    }
  };

  // Supprimer une image
  const handleImageRemove = (index: number) => {
    Alert.alert(
      t('postAds.deleteImage'),
      t('postAds.deleteImageConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('postAds.delete'),
          style: 'destructive',
          onPress: () => {
            const newImages = formData.images.filter((_, i) => i !== index);
            setFormData((prev) => ({ ...prev, images: newImages }));
          },
        },
      ]
    );
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
      Alert.alert(t('postAds.validationError'), t('postAds.fillRequired'));
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    if (isSubmitting || !isMountedRef.current) return;

    setIsSubmitting(true);

    try {
      // Validation finale
      const validationErrors = [];

      if (!formData.name || formData.name.trim().length < 2) {
        validationErrors.push(t('postAds.validations.nameMinLength'));
      }

      if (!formData.description || formData.description.trim().length < 10) {
        validationErrors.push(t('postAds.validations.descriptionMinLength'));
      }

      if (!formData.price || Number(formData.price) <= 0) {
        validationErrors.push(t('postAds.validations.pricePositive'));
      }

      if (!formData.quantity || Number(formData.quantity) <= 0) {
        validationErrors.push(t('postAds.validations.quantityPositive'));
      }

      if (!formData.categoryId) {
        validationErrors.push(t('postAds.validations.categoryRequired'));
      }

      if (!formData.cityId) {
        validationErrors.push(t('postAds.validations.cityRequired'));
      }

      if (!formData.quartier || formData.quartier.trim().length === 0) {
        validationErrors.push(t('postAds.validations.neighborhoodRequired'));
      }

if (!validateCameroonPhone(formData.telephone)) {
      validationErrors.push(t('postAds.validations.phoneInvalid'));
      }

      if (!formData.images || formData.images.length === 0) {
        validationErrors.push(t('postAds.validations.imagesRequired'));
      }

      if (validationErrors.length > 0) {
        Alert.alert(t('postAds.validationErrors'), validationErrors.join('\n'));
        setIsSubmitting(false);
        return;
      }

      // Créer FormData pour l'upload
      const productData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        quantity: formData.quantity,
        categoryId: formData.categoryId,
        cityId: formData.cityId,
        etat: formData.etat,
        quartier: formData.quartier.trim(),
        telephone: formData.telephone,
        images: formData.images,
      };

      const result = await dispatch(createProductAction(productData));

      if (result.meta.requestStatus === 'fulfilled') {
        // Proposer le boost
        const createdProduct = (result.payload as any)?.product;

        if (!createdProduct?.id) {
          Alert.alert(t('postAds.errorProductId'), t('postAds.errorProductIdMessage'));
          setIsSubmitting(false);
          return;
        }

        setCreatedProductId(createdProduct.id);

        // Proposer le boost si des forfaits sont disponibles
        if (forfaits && Array.isArray(forfaits) && forfaits.length > 0) {
          setTimeout(() => {
            if (isMountedRef.current) {
              setShowBoostOffer(true);
            }
          }, 500);
        } else {
          Alert.alert(t('postAds.successCreated'), t('postAds.successCreatedMessage'), [
            {
              text: 'OK',
              onPress: () => navigation.navigate('HomeTab'),
            },
          ]);
        }
      } else {
        const errorMsg = (result.payload as any)?.message || t('postAds.errorCreating');
        Alert.alert(t('postAds.errorGeneric'), errorMsg);
      }
    } catch (error: any) {
      Alert.alert(t('postAds.errorGeneric'), error.message || t('postAds.errorCreating'));
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

    Alert.alert(t('postAds.successCreated'), t('postAds.successCreatedMessage'), [
      {
        text: t('postAds.ok'),
        onPress: () => navigation.navigate('HomeTab'),
      },
    ]);
  };

  const handleForfaitSelected = (forfaitType: string, forfaitId: string) => {
    try {
      if (!createdProductId) {
        throw new Error('ID du produit non disponible');
      }

      const selectedForfait = Array.isArray(forfaits) ? forfaits.find((f: any) => f.id === forfaitId) : null;
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
      Alert.alert(t('common.error'), error.message);
      setShowForfaitSelector(false);
    }
  };

  const handleSkipForfait = () => {
    if (!isMountedRef.current) return;

    setShowForfaitSelector(false);
    setShowBoostOffer(false);

    Alert.alert(t('notifications.info'), t('postAds.publishedWithoutForfait'), [
      {
        text: t('postAds.ok'),
        onPress: () => navigation.navigate('HomeTab'),
      },
    ]);
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

  const handlePaymentSuccess = () => {
    if (!isMountedRef.current) return;

    setShowPaymentStatusModal(false);
    setShowPaymentModal(false);
    setShowForfaitSelector(false);
    setShowBoostOffer(false);

    // Rediriger vers HomeTab où l'annonce boostée apparaîtra en haut
    navigation.navigate('HomeTab');
  };

  const handlePaymentError = () => {
    if (!isMountedRef.current) return;

    setShowPaymentStatusModal(false);
    setShowPaymentModal(false);
    setShowForfaitSelector(false);
    setShowBoostOffer(false);

    // Rediriger directement sans Alert redondant
    navigation.navigate('HomeTab');
  };

  const handlePaymentCancel = () => {
    if (!isMountedRef.current) return;

    setShowPaymentModal(false);
    setShowPaymentStatusModal(false);
    setShowForfaitSelector(false);
    setShowBoostOffer(false);

    // Rediriger vers Home pour éviter les duplications
    navigation.navigate('HomeTab');
  };

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
            onChangeText={(text) => handleInputChange('price', text)}
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
          onChangeText={(text) => handleInputChange('quartier', text)}
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
          onChangeText={(text) => handleInputChange('quantity', text)}
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
            <Icon name="arrow-back" size={20} color={colors.text} />
            <Text style={[styles.footerButtonText, { color: colors.text }]}>
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
        forfaits={Array.isArray(forfaits) ? forfaits : []}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostAds;
