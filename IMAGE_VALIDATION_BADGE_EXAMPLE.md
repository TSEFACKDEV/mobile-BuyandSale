# 🎨 EXEMPLE D'UTILISATION - Badge de Validation d'Images

## Intégration du Badge dans PostAds

Voici comment intégrer visuellement le badge de validation dans l'affichage des images sélectionnées.

### 1. Import du Badge
```typescript
import ImageValidationBadge from '../../../components/ImageValidationBadge';
import { useImageValidation } from '../../../hooks/useImageValidation';
```

### 2. Utilisation du Hook
```typescript
const PostAds = () => {
  const { 
    validateSingleImage, 
    getValidationStatus,
    isValidating 
  } = useImageValidation();
  
  // ... reste du code
};
```

### 3. Validation lors de l'Ajout
```typescript
const handleImagePick = async () => {
  // ... sélection avec ImagePicker
  
  if (!result.canceled && result.assets) {
    for (const asset of result.assets) {
      // Valider chaque image
      const validation = await validateSingleImage({
        uri: asset.uri,
        fileSize: asset.fileSize,
        type: asset.mimeType,
      }, 'product');
      
      if (validation.isValid) {
        // Ajouter à la liste
        validatedImages.push({
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || `image_${Date.now()}.jpg`,
        });
      }
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validatedImages],
    }));
  }
};
```

### 4. Rendu avec Badge (Optionnel)
```typescript
const renderImageGrid = () => (
  <View style={styles.imageGrid}>
    {formData.images.map((image, index) => {
      const validationStatus = getValidationStatus(image.uri);
      
      return (
        <View key={index} style={styles.imageContainer}>
          <Image 
            source={{ uri: image.uri }} 
            style={styles.imagePreview} 
          />
          
          {/* Badge de validation */}
          <ImageValidationBadge
            isValid={validationStatus?.isValid ?? true}
            isValidating={isValidating}
            error={validationStatus?.error}
          />
          
          {/* Bouton de suppression */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleImageRemove(index)}
          >
            <Icon name="close-circle" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      );
    })}
  </View>
);
```

### 5. Styles Associés
```typescript
const styles = StyleSheet.create({
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  imageContainer: {
    position: 'relative',
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 2,
  },
});
```

## Exemple Complet : Page PostAds avec Validation Visuelle

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import ImageValidationBadge from '../../../components/ImageValidationBadge';
import { useImageValidation } from '../../../hooks/useImageValidation';
import { IMAGE_CONFIG } from '../../../utils/imageUtils';

const PostAdsWithValidation = () => {
  const [images, setImages] = useState<Array<{
    uri: string;
    type: string;
    name: string;
  }>>([]);
  
  const {
    validateSingleImage,
    validateMultipleImages,
    getValidationStatus,
    isValidating,
    clearValidation,
  } = useImageValidation();

  const handleImagePick = async () => {
    // Vérifier limite
    const availableSlots = IMAGE_CONFIG.MAX_IMAGES - images.length;
    if (availableSlots === 0) {
      alert('Maximum 5 images');
      return;
    }

    // Demander permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission requise');
      return;
    }

    // Sélectionner images
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: availableSlots,
    });

    if (!result.canceled && result.assets) {
      const validatedImages: typeof images = [];
      const errors: string[] = [];

      // Valider chaque image
      for (let i = 0; i < result.assets.length; i++) {
        const asset = result.assets[i];
        
        const validation = await validateSingleImage({
          uri: asset.uri,
          fileSize: asset.fileSize,
          type: asset.mimeType,
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

      // Ajouter images valides
      if (validatedImages.length > 0) {
        setImages(prev => [...prev, ...validatedImages]);
      }

      // Afficher erreurs
      if (errors.length > 0) {
        alert('Certaines images rejetées:\n' + errors.join('\n'));
      }
    }
  };

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation finale
    const validation = await validateMultipleImages(images, 'product');
    
    if (!validation.isValid) {
      alert('Erreurs de validation:\n' + validation.errors.join('\n'));
      return;
    }

    // Soumettre...
    console.log('✅ Toutes les images sont valides');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Bouton d'ajout */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleImagePick}
        disabled={isValidating || images.length >= IMAGE_CONFIG.MAX_IMAGES}
      >
        <Icon name="camera" size={24} color="#FFF" />
        <Text style={styles.addButtonText}>
          {isValidating 
            ? 'Validation en cours...' 
            : `Ajouter des photos (${images.length}/${IMAGE_CONFIG.MAX_IMAGES})`
          }
        </Text>
      </TouchableOpacity>

      {/* Grille d'images */}
      <View style={styles.imageGrid}>
        {images.map((image, index) => {
          const validationStatus = getValidationStatus(image.uri);
          
          return (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={{ uri: image.uri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />

              {/* Badge de validation */}
              <ImageValidationBadge
                isValid={validationStatus?.isValid ?? true}
                isValidating={false}
                error={validationStatus?.error}
              />

              {/* Numéro */}
              <View style={styles.imageNumber}>
                <Text style={styles.imageNumberText}>{index + 1}</Text>
              </View>

              {/* Bouton suppression */}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleImageRemove(index)}
              >
                <Icon name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Placeholder pour ajouter */}
        {images.length < IMAGE_CONFIG.MAX_IMAGES && (
          <TouchableOpacity
            style={styles.addImagePlaceholder}
            onPress={handleImagePick}
          >
            <Icon name="add" size={40} color="#9CA3AF" />
            <Text style={styles.placeholderText}>Ajouter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bouton soumettre */}
      {images.length > 0 && (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isValidating}
        >
          <Text style={styles.submitButtonText}>
            Publier l'annonce
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageNumber: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  imageNumberText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 2,
  },
  addImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PostAdsWithValidation;
```

## Variantes de Badge

### Minimaliste
```typescript
<View style={styles.badgeMini}>
  {validationStatus?.isValid ? (
    <Icon name="checkmark" size={16} color="#10B981" />
  ) : (
    <Icon name="close" size={16} color="#EF4444" />
  )}
</View>
```

### Avec Animation
```typescript
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring 
} from 'react-native-reanimated';

const BadgeAnimated = ({ isValid }) => {
  const scale = useSharedValue(0);
  
  useEffect(() => {
    scale.value = withSpring(1);
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  return (
    <Animated.View style={[styles.badge, animatedStyle]}>
      {/* contenu */}
    </Animated.View>
  );
};
```

### Avec Tooltip
```typescript
<TouchableOpacity 
  onPress={() => alert(validationStatus?.error)}
>
  <ImageValidationBadge {...props} />
</TouchableOpacity>
```

## Bonnes Pratiques

### 1. Feedback Immédiat
```typescript
// ✅ Bon
const validation = await validateSingleImage(image);
if (!validation.isValid) {
  showError(validation.error); // Immédiat
}

// ❌ Mauvais
// Attendre la soumission pour signaler l'erreur
```

### 2. État de Chargement
```typescript
// ✅ Bon
<ImageValidationBadge 
  isValidating={isValidating}
  isValid={status?.isValid}
/>

// ❌ Mauvais
// Pas d'indicateur de chargement
```

### 3. Nettoyage
```typescript
// ✅ Bon
useEffect(() => {
  return () => {
    clearValidation(); // Nettoyer en démontant
  };
}, []);
```

---

**Conseil** : Le badge est optionnel mais améliore grandement l'UX en donnant un feedback visuel immédiat !
