/**
 * 🖼️ UTILITAIRES IMAGES - VERSION MOBILE (React Native)
 * 
 * Gestion complète des images :
 * - URLs et affichage
 * - Validation (taille, format)
 * - Constantes et configuration
 */

import API_CONFIG from '../config/api.config';

// ================================
// 📋 CONSTANTES DE CONFIGURATION
// ================================

export const IMAGE_CONFIG = {
  // Tailles limites (en bytes)
  MAX_FILE_SIZE_AVATAR: 5 * 1024 * 1024,    // 5MB
  MAX_FILE_SIZE_PRODUCT: 10 * 1024 * 1024,  // 10MB
  
  // Quantités - ⚠️ LIMITE BACKEND: 1-5 images maximum
  MAX_IMAGES: 10,
  MIN_IMAGES: 1,
  
  // Formats supportés (MIME types)
  ACCEPTED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // URLs
  PLACEHOLDER_IMAGE: 'https://via.placeholder.com/400x300?text=No+Image',
  BASE_URL: API_CONFIG.BASE_URL.replace(/\/api\/[^/]+$/, ''),
  
  // Messages d'erreur
  MESSAGES: {
    INVALID_FORMAT: 'Format non supporté. Utilisez JPG, PNG ou WebP uniquement.',
    TOO_LARGE_AVATAR: "L'image ne doit pas dépasser 5MB",
    TOO_LARGE_PRODUCT: "L'image ne doit pas dépasser 10MB",
    VALIDATION_ERROR: 'Erreur lors de la validation du fichier',
  }
} as const;

// Export direct de PLACEHOLDER_IMAGE pour compatibilité
export const PLACEHOLDER_IMAGE = IMAGE_CONFIG.PLACEHOLDER_IMAGE;

// ================================
// 🌐 GESTION DES URLS
// ================================

/**
 * Génère l'URL complète pour une image
 */
export const getImageUrl = (
  imagePath?: string | null,
  type: 'product' | 'avatar' = 'product'
): string => {
  // Validation de base
  if (!imagePath || imagePath === 'undefined' || imagePath === 'null' || imagePath.trim() === '') {
    return IMAGE_CONFIG.PLACEHOLDER_IMAGE;
  }

  // URLs externes déjà complètes
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Déterminer le dossier
  const folder = type === 'product' ? '/uploads/products' : '/uploads/users';

  // URL déjà avec le bon dossier
  if (imagePath.startsWith(folder)) {
    return `${IMAGE_CONFIG.BASE_URL}/public${imagePath}`;
  }

  // Construire l'URL complète
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${IMAGE_CONFIG.BASE_URL}/public${folder}${cleanPath}`;
};

// ================================
// 🛠️ UTILITAIRES
// ================================

/**
 * Formate la taille d'un fichier en MB
 */
const formatFileSize = (bytes: number): string => {
  return (bytes / 1024 / 1024).toFixed(1);
};

/**
 * Détecte le type MIME à partir de l'extension (fallback uniquement)
 */
const getMimeTypeFromUri = (uri: string): string => {
  const extension = uri.split('.').pop()?.toLowerCase();
  
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  
  // Fallback par défaut (jpg/jpeg)
  return 'image/jpeg';
};

/**
 * Valide la taille d'un fichier
 */
export const validateImageSize = (
  size: number,
  type: 'avatar' | 'product' = 'product'
): { isValid: boolean; error?: string } => {
  const maxSize = type === 'avatar' 
    ? IMAGE_CONFIG.MAX_FILE_SIZE_AVATAR 
    : IMAGE_CONFIG.MAX_FILE_SIZE_PRODUCT;
  
  const message = type === 'avatar' 
    ? IMAGE_CONFIG.MESSAGES.TOO_LARGE_AVATAR 
    : IMAGE_CONFIG.MESSAGES.TOO_LARGE_PRODUCT;

  if (size > maxSize) {
    return {
      isValid: false,
      error: `${message} (${formatFileSize(size)}MB)`
    };
  }

  return { isValid: true };
};

/**
 * 🔥 VALIDATION COMPLÈTE D'UNE IMAGE (Mobile)
 * Valide format + taille
 * 
 * Compatible avec expo-image-picker assets
 */
export const validateImageComplete = async (
  imageAsset: { uri: string; fileSize?: number; type?: string; mimeType?: string },
  type: 'avatar' | 'product' = 'product'
): Promise<{
  isValid: boolean;
  error?: string;
}> => {
  try {
    // 1. Déterminer le type MIME
    const mimeType = imageAsset.mimeType || imageAsset.type || getMimeTypeFromUri(imageAsset.uri);

    // 2. Validation du type MIME
    if (!IMAGE_CONFIG.ACCEPTED_MIME_TYPES.includes(mimeType as any)) {
      return { 
        isValid: false, 
        error: IMAGE_CONFIG.MESSAGES.INVALID_FORMAT 
      };
    }

    // 3. Validation de la taille (si disponible)
    if (imageAsset.fileSize) {
      const sizeValidation = validateImageSize(imageAsset.fileSize, type);
      if (!sizeValidation.isValid) {
        return sizeValidation;
      }
    }

    return { isValid: true };
  } catch (error) {
    console.error('Erreur validation complète:', error);
    return { 
      isValid: false, 
      error: IMAGE_CONFIG.MESSAGES.VALIDATION_ERROR 
    };
  }
};

/**
 * Valide un tableau d'images
 */
export const validateImagesArray = async (
  images: Array<{ uri: string; fileSize?: number; type?: string }>,
  type: 'avatar' | 'product' = 'product'
): Promise<{
  isValid: boolean;
  errors: string[];
}> => {
  const errors: string[] = [];

  // Vérifier la quantité
  if (images.length < IMAGE_CONFIG.MIN_IMAGES) {
    errors.push(`Au moins ${IMAGE_CONFIG.MIN_IMAGES} image requise`);
  }

  if (images.length > IMAGE_CONFIG.MAX_IMAGES) {
    errors.push(`Maximum ${IMAGE_CONFIG.MAX_IMAGES} images autorisées`);
  }

  // Valider chaque image
  for (let i = 0; i < images.length; i++) {
    const validation = await validateImageComplete(images[i], type);
    if (!validation.isValid) {
      errors.push(`Image ${i + 1}: ${validation.error}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
