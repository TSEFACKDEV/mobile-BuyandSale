import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { validateCameroonPhone } from '../utils/phoneUtils';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { useThemeColors } from '../contexts/ThemeContext';
import { 
  validateProductForm,
  filterQuartierChars 
} from '../utils/securityUtils';
import { getProductByIdAction, updateProductAction } from '../store/product/actions';
import { selectCategories } from '../store/category/slice';
import { selectCities } from '../store/city/slice';
import { getImageUrl, PLACEHOLDER_IMAGE } from '../utils/imageUtils';
import { Loading } from './LoadingVariants';
import PhoneInput from './PhoneInput';
import { useDialog } from '../contexts/DialogContext';

interface EditProductModalProps {
  visible: boolean;
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  quantity: string;
  categoryId: string;
  cityId: string;
  etat: 'NEUF' | 'OCCASION' | 'CORRECT';
  existingImages: string[]; // Images déjà sur le serveur
  newImages: string[]; // Nouvelles images sélectionnées
  quartier: string;
  telephone: string;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  visible,
  productId,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { showWarning, showSuccess } = useDialog();
  const categories = useAppSelector(selectCategories);
  const cities = useAppSelector(selectCities);

  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    quantity: '1',
    categoryId: '',
    cityId: '',
    etat: 'NEUF',
    existingImages: [],
    newImages: [],
    quartier: '',
    telephone: '',
  });

  // Charger les données du produit
  useEffect(() => {
    if (visible && productId) {
      loadProduct();
    }
  }, [visible, productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const result = await dispatch(getProductByIdAction(productId));
      
      if (result.meta.requestStatus === 'fulfilled' && result.payload) {
        const product: any = result.payload;
        // Vérifier que c'est bien un produit et pas un objet erreur
        if (product && typeof product === 'object' && 'name' in product) {
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: String(product.price || ''),
            quantity: String(product.quantity || 1),
            categoryId: product.categoryId || '',
            cityId: product.cityId || '',
            etat: product.etat || 'NEUF',
            existingImages: product.images || [],
            newImages: [],
            quartier: product.quartier || '',
            telephone: product.telephone || '',
          });
        }
      }
    } catch (error) {
      showWarning('Erreur', 'Impossible de charger le produit');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const selectedImages = result.assets.map(asset => asset.uri);
        setFormData(prev => {
          const totalImages = prev.existingImages.length + prev.newImages.length + selectedImages.length;
          if (totalImages > 5) {
            showWarning('Limite atteinte', 'Vous ne pouvez avoir que 5 images maximum');
            return prev;
          }
          return {
            ...prev,
            newImages: [...prev.newImages, ...selectedImages],
          };
        });
      }
    } catch (error) {
      showWarning('Erreur', 'Impossible de sélectionner les images');
    }
  };

  const removeImage = (index: number, isExisting: boolean) => {
    setFormData(prev => {
      if (isExisting) {
        return {
          ...prev,
          existingImages: prev.existingImages.filter((_, i) => i !== index),
        };
      } else {
        const newIndex = index - prev.existingImages.length;
        return {
          ...prev,
          newImages: prev.newImages.filter((_, i) => i !== newIndex),
        };
      }
    });
  };

  const handleSubmit = async () => {
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

    if (!securityValidation.isValid) {
      showWarning('Erreur de validation', securityValidation.errors.join('\n'));
      return;
    }

    // Validation téléphone
    if (!validateCameroonPhone(formData.telephone)) {
      showWarning('Erreur', 'Numéro de téléphone camerounais invalide (format: 6XX XX XX XX)');
      return;
    }

    setIsUpdating(true);
    try {
      // ✅ Utiliser les données sanitizées (sécurisées)
      const updateData: any = {
        name: securityValidation.sanitized.name,
        description: securityValidation.sanitized.description,
        price: Number(securityValidation.sanitized.price),
        quantity: Number(securityValidation.sanitized.quantity),
        categoryId: securityValidation.sanitized.categoryId,
        cityId: securityValidation.sanitized.cityId,
        etat: formData.etat,
        quartier: securityValidation.sanitized.quartier,
        telephone: formData.telephone,
      };

      // Ajouter les images seulement si de nouvelles images ont été sélectionnées
      if (formData.newImages.length > 0) {
        updateData.images = formData.newImages.map((uri, index) => {
          const uriParts = uri.split('.');
          const fileType = uriParts[uriParts.length - 1];
          return {
            uri,
            type: `image/${fileType}`,
            fileName: `image_${index}.${fileType}`,
          };
        });
      }

      const result = await dispatch(
        updateProductAction({
          id: productId,
          ...updateData,
        })
      );

      if (result.meta.requestStatus === 'fulfilled') {
        showSuccess('Succès', 'Produit mis à jour avec succès !');
        onSuccess();
        onClose();
      } else {
        showWarning('Erreur', 'Échec de la mise à jour du produit');
      }
    } catch (error) {
      showWarning('Erreur', 'Une erreur est survenue lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  const getCategoryName = () => {
    const category = categories.find(c => c.id === formData.categoryId);
    return category?.name || 'Sélectionner une catégorie';
  };

  const getCityName = () => {
    const city = cities.find(c => c.id === formData.cityId);
    return city?.name || 'Sélectionner une ville';
  };

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <Loading fullScreen message="Chargement du produit..." />
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" statusBarTranslucent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* Safe Area for Header only */}
        <View style={{
          paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0,
          backgroundColor: colors.surface,
        }}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Icon name="close" size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Modifier le produit
            </Text>
            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.headerButton}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#f97316" />
              ) : (
                <Icon name="checkmark" size={22} color="#f97316" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Section Images */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Images (optionnel)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
                {/* Images existantes */}
                {formData.existingImages.map((image, index) => (
                  <View key={`existing-${index}`} style={styles.imageWrapper}>
                    <Image
                      source={{ uri: getImageUrl(image) }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index, true)}
                    >
                      <Icon name="close-circle" size={26} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                {/* Nouvelles images */}
                {formData.newImages.map((uri, index) => (
                  <View key={`new-${index}`} style={styles.imageWrapper}>
                    <Image
                      source={{ uri }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(formData.existingImages.length + index, false)}
                    >
                      <Icon name="close-circle" size={26} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                {(formData.existingImages.length + formData.newImages.length) < 5 && (
                  <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                    <Icon name="add-circle-outline" size={32} color={colors.textSecondary} />
                    <Text style={[styles.addImageText, { color: colors.textSecondary }]}>
                      Ajouter
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>

            {/* Nom du produit */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Nom du produit *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Ex: iPhone 13 Pro Max"
                placeholderTextColor={colors.textSecondary}
                maxLength={100}
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Décrivez votre produit..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={1000}
              />
            </View>

            {/* Prix et Quantité */}
            <View style={styles.row}>
              <View style={styles.halfSection}>
                <Text style={[styles.label, { color: colors.text }]}>Prix (FCFA) *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  value={formData.price}
                  onChangeText={(value) => handleInputChange('price', value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfSection}>
                <Text style={[styles.label, { color: colors.text }]}>Quantité *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  value={formData.quantity}
                  onChangeText={(value) => handleInputChange('quantity', value.replace(/[^0-9]/g, ''))}
                  placeholder="1"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Catégorie */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Catégorie *</Text>
              <TouchableOpacity
                style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowCategoryPicker(true)}
              >
                <Text style={[styles.pickerText, { color: formData.categoryId ? colors.text : colors.textSecondary }]}>
                  {getCategoryName()}
                </Text>
                <Icon name="chevron-down" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Ville */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Ville *</Text>
              <TouchableOpacity
                style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowCityPicker(true)}
              >
                <Text style={[styles.pickerText, { color: formData.cityId ? colors.text : colors.textSecondary }]}>
                  {getCityName()}
                </Text>
                <Icon name="chevron-down" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* État du produit */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>État du produit *</Text>
              <View style={styles.conditionRow}>
                {[
                  { value: 'NEUF', label: 'Neuf' },
                  { value: 'OCCASION', label: 'Occasion' },
                  { value: 'CORRECT', label: 'Correct' },
                ].map((condition) => (
                  <TouchableOpacity
                    key={condition.value}
                    style={[
                      styles.conditionButton,
                      {
                        backgroundColor: formData.etat === condition.value ? '#f97316' : colors.surface,
                        borderColor: formData.etat === condition.value ? '#f97316' : colors.border,
                      },
                    ]}
                    onPress={() => handleInputChange('etat', condition.value)}
                  >
                    <Text
                      style={[
                        styles.conditionText,
                        { color: formData.etat === condition.value ? '#fff' : colors.text },
                      ]}
                    >
                      {condition.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quartier */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Quartier *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={formData.quartier}
                onChangeText={(value) => handleInputChange('quartier', filterQuartierChars(value).substring(0, 100))}
                placeholder="Ex: Bonamoussadi"
                placeholderTextColor={colors.textSecondary}
                maxLength={100}
              />
            </View>

            {/* Téléphone */}
            <View style={styles.section}>
              <PhoneInput
                label="Téléphone"
                value={formData.telephone}
                onChangeText={(value) => handleInputChange('telephone', value)}
                placeholder="6XX XX XX XX"
                required
              />
            </View>

            {/* Espace en bas */}
            <View style={styles.bottomSpace} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Modal de sélection de catégorie */}
      <Modal visible={showCategoryPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerModal, { backgroundColor: colors.surface }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.pickerHeaderTitle, { color: colors.text }]}>
                Sélectionner une catégorie
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Icon name="close" size={22} color={colors.text} />
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
                    <Icon name="checkmark-circle" size={18} color="#f97316" />
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
                <Icon name="close" size={22} color={colors.text} />
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
                    <Icon name="checkmark-circle" size={18} color="#f97316" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
  },
  section: {
    marginTop: 16,
  },
  halfSection: {
    flex: 1,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
  },
  picker: {
    height: 42,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 14,
  },
  imagesContainer: {
    flexDirection: 'row',
  },
  imageWrapper: {
    marginRight: 10,
    position: 'relative',
  },
  imagePreview: {
    width: 85,
    height: 85,
    borderRadius: 6,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f1f1',
  },
  addImageButton: {
    width: 85,
    height: 85,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 11,
    marginTop: 3,
  },
  conditionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  conditionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  conditionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  bottomSpace: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
  },
  pickerHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pickerItemText: {
    fontSize: 14,
  },
});

export default EditProductModal;
