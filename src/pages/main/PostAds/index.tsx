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
  isNegotiable: boolean;
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
    isNegotiable: false,
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
      isNegotiable: false,
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
    return category?.name || 'Sélectionner une catégorie';
  };

  const getCityName = () => {
    const city = cities.find(c => c.id === formData.cityId);
    return city?.name || 'Sélectionner une ville';
  };

  // Sélection d'images
  const handleImagePick = async () => {
    const availableSlots = MAX_IMAGES - formData.images.length;

    if (availableSlots === 0) {
      Alert.alert('Limite atteinte', `Vous avez déjà ${MAX_IMAGES} images. Supprimez-en une pour en ajouter.`);
      return;
    }

    // Demander la permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder aux photos.');
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

      Alert.alert('Succès', `${newImages.length} image(s) ajoutée(s) !`);
    }
  };

  // Supprimer une image
  const handleImageRemove = (index: number) => {
    Alert.alert(
      'Supprimer l\'image',
      'Voulez-vous vraiment supprimer cette image ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
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
      Alert.alert('Validation', 'Veuillez remplir tous les champs requis.');
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
        validationErrors.push('Le nom doit contenir au moins 2 caractères');
      }

      if (!formData.description || formData.description.trim().length < 10) {
        validationErrors.push('La description doit contenir au moins 10 caractères');
      }

      if (!formData.price || Number(formData.price) <= 0) {
        validationErrors.push('Le prix doit être positif');
      }

      if (!formData.quantity || Number(formData.quantity) <= 0) {
        validationErrors.push('La quantité doit être positive');
      }

      if (!formData.categoryId) {
        validationErrors.push('Veuillez sélectionner une catégorie');
      }

      if (!formData.cityId) {
        validationErrors.push('Veuillez sélectionner une ville');
      }

      if (!formData.quartier || formData.quartier.trim().length === 0) {
        validationErrors.push('Veuillez renseigner le quartier');
      }

if (!validateCameroonPhone(formData.telephone)) {
      validationErrors.push('Numéro de téléphone camerounais invalide (format: 6XX XX XX XX)');
      }

      if (!formData.images || formData.images.length === 0) {
        validationErrors.push('Veuillez ajouter au moins une image');
      }

      if (validationErrors.length > 0) {
        Alert.alert('Erreurs de validation', validationErrors.join('\n'));
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
          Alert.alert('Erreur', 'Impossible de récupérer l\'identifiant du produit créé.');
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
          Alert.alert('Succès', 'Annonce créée avec succès !', [
            {
              text: 'OK',
              onPress: () => navigation.navigate('HomeTab'),
            },
          ]);
        }
      } else {
        const errorMsg = (result.payload as any)?.message || 'Erreur lors de la création du produit';
        Alert.alert('Erreur', errorMsg);
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la création du produit');
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

    Alert.alert('Succès', 'Annonce créée avec succès !', [
      {
        text: 'OK',
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
      Alert.alert('Erreur', error.message);
      setShowForfaitSelector(false);
    }
  };

  const handleSkipForfait = () => {
    if (!isMountedRef.current) return;

    setShowForfaitSelector(false);
    setShowBoostOffer(false);

    Alert.alert('Info', 'Annonce publiée sans forfait. Vous pourrez en ajouter un plus tard.', [
      {
        text: 'OK',
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
          Nom du produit <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Ex: iPhone 13 Pro Max"
          placeholderTextColor={colors.textSecondary}
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
        />
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Description <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Décrivez votre produit en détail..."
          placeholderTextColor={colors.textSecondary}
          value={formData.description}
          onChangeText={(text) => handleInputChange('description', text)}
          multiline
          numberOfLines={5}
        />
        <View style={styles.characterCounter}>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            {formData.description.length}/10 caractères minimum
          </Text>
          {formData.description.length < 10 && formData.description.length > 0 && (
            <Text style={styles.warningText}>
              ⚠️ {10 - formData.description.length} caractères manquants
            </Text>
          )}
          {formData.description.length >= 10 && (
            <Text style={styles.validText}>✅</Text>
          )}
        </View>
      </View>

      {/* Prix */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Prix (FCFA) <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.priceInputContainer}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, paddingRight: 60 }]}
            placeholder="500000"
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
          Catégorie <Text style={styles.required}>*</Text>
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
          État du produit <Text style={styles.required}>*</Text>
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
                {condition.label}
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
          Photos <Text style={styles.required}>*</Text>
        </Text>
        <Text style={[styles.helperText, { color: colors.textSecondary, marginBottom: 10 }]}>
          Ajoutez jusqu'à {MAX_IMAGES} photos de votre produit
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
                Limite atteinte
              </Text>
              <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
                Vous avez ajouté le maximum de {MAX_IMAGES} images
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.uploadTitle, { color: colors.text }]}>
                Cliquez pour ajouter des photos
              </Text>
              <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
                ou glissez-déposez vos images ici
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
          Ville <Text style={styles.required}>*</Text>
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
          Quartier <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Ex: Bonamoussadi"
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
          label="Numéro de téléphone"
          value={formData.telephone}
          onChangeText={(text) => handleInputChange('telephone', text)}
          placeholder="6XX XX XX XX"
          required
        />
      </View>

      {/* Quantité */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Quantité disponible <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="1"
          placeholderTextColor={colors.textSecondary}
          value={formData.quantity}
          onChangeText={(text) => handleInputChange('quantity', text)}
          keyboardType="numeric"
        />
      </View>

      {/* Checkbox prix négociable */}
      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => handleInputChange('isNegotiable', !formData.isNegotiable)}
      >
        <View style={[
          styles.checkbox,
          { borderColor: colors.border },
          formData.isNegotiable && styles.checkboxChecked
        ]}>
          {formData.isNegotiable && (
            <Icon name="checkmark" size={14} color="#FFF" />
          )}
        </View>
        <Text style={[styles.checkboxLabel, { color: colors.text }]}>
          Le prix est négociable
        </Text>
      </TouchableOpacity>

      {/* Résumé */}
      <View style={[styles.summaryCard, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>
          Résumé de votre annonce
        </Text>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Produit</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={1}>
            {formData.name || '-'}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Prix</Text>
          <Text style={[styles.summaryValue, { color: '#FF6B35' }]}>
            {formData.price ? `${formData.price} FCFA` : '-'}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>État</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formData.etat === 'NEUF' ? 'Neuf' : formData.etat === 'OCCASION' ? 'Occasion' : 'Correct'}
          </Text>
        </View>
        
        <View style={[styles.summaryRow, styles.summaryRowLast]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Images</Text>
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
              Publier une annonce
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
              {currentStep === 1 && 'Décrivez votre produit'}
              {currentStep === 2 && 'Ajoutez des photos et localisez'}
              {currentStep === 3 && 'Coordonnées et validation'}
            </Text>
            <Text style={[styles.formStepSubtitle, { color: colors.textSecondary }]}>
              {currentStep === 1 && 'Renseignez les informations principales de votre annonce'}
              {currentStep === 2 && 'Ajoutez des photos et indiquez la localisation'}
              {currentStep === 3 && 'Finalisez avec vos coordonnées et vérifiez les informations'}
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
              Précédent
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
            <Text style={styles.footerButtonTextWhite}>Suivant</Text>
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
                  Publier
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
                Sélectionner une catégorie
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
                Sélectionner une ville
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
