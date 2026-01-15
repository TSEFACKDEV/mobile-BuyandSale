/**
 * 🖼️ UTILITAIRES IMAGES - VERSION MOBILE (React Native)
 * 
 * Tout ce qui concerne les images en un seul endroit :
 * - URLs et affichage
 * - Validation complète (taille, format, magic bytes)
 * - Constantes et configuration
 * - Helpers utilitaires
 */

import API_CONFIG from '../config/api.config';

// ================================
// 📋 CONSTANTES DE CONFIGURATION
// ================================

export const IMAGE_CONFIG = {
  // Tailles limites (en bytes)
  MAX_FILE_SIZE_AVATAR: 5 * 1024 * 1024,    // 5MB
  MAX_FILE_SIZE_PRODUCT: 10 * 1024 * 1024,  // 10MB
  
  // Quantités
  MAX_IMAGES: 5,
  MIN_IMAGES: 1,
  
  // Formats supportés
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ACCEPTED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // URLs
  PLACEHOLDER_IMAGE: 'https://via.placeholder.com/400x300?text=No+Image',
  BASE_URL: API_CONFIG.BASE_URL.replace(/\/api\/[^/]+$/, ''),
  
  // Messages d'erreur
  MESSAGES: {
    INVALID_FORMAT: 'Format non supporté. Utilisez JPG, PNG ou WebP uniquement.',
    TOO_LARGE_AVATAR: "L'image ne doit pas dépasser 5MB",
    TOO_LARGE_PRODUCT: "L'image ne doit pas dépasser 10MB",
    ALREADY_EXISTS: 'Déjà ajoutée',
    LIMIT_REACHED: "Limite d'images atteinte",
    VALIDATION_ERROR: 'Erreur lors de la validation du fichier',
    INVALID_MAGIC_BYTES: 'Le fichier ne correspond pas au format déclaré',
  }
} as const;

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
 * Détecte le type MIME à partir de l'extension
 */
export const getMimeTypeFromUri = (uri: string): string => {
  const extension = uri.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg'; // Fallback
  }
};

/**
 * Valide le type MIME d'une image
 */
export const validateImageType = (mimeType: string): boolean => {
  return IMAGE_CONFIG.ACCEPTED_MIME_TYPES.includes(mimeType);
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
 * Valide les magic bytes d'une image (React Native)
 * Pour React Native, on utilise fetch pour lire les premiers octets
 */
export const validateImageMagicBytes = async (uri: string): Promise<{
  isValid: boolean;
  error?: string;
}> => {
  try {
    // Pour React Native, on lit les premiers octets via fetch avec range
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Convertir le blob en ArrayBuffer
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob.slice(0, 12));
    });

    const bytes = new Uint8Array(arrayBuffer);
    
    // JPEG: FF D8
    if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xD8) {
      return { isValid: true };
    }
    
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      bytes.length >= 8 && 
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
      bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A
    ) {
      return { isValid: true };
    }
    
    // WebP: RIFF + WEBP
    if (
      bytes.length >= 12 && 
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    ) {
      return { isValid: true };
    }
    
    return { 
      isValid: false, 
      error: IMAGE_CONFIG.MESSAGES.INVALID_MAGIC_BYTES 
    };
  } catch (error) {
    console.error('Erreur validation magic bytes:', error);
    return { 
      isValid: false, 
      error: IMAGE_CONFIG.MESSAGES.VALIDATION_ERROR 
    };
  }
};

/**
 * Obtient les informations d'un fichier image (React Native)
 * Compatible avec expo-image-picker
 */
export const getImageInfo = async (uri: string): Promise<{
  size?: number;
  width?: number;
  height?: number;
  type?: string;
}> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return {
      size: blob.size,
      type: blob.type || getMimeTypeFromUri(uri),
    };
  } catch (error) {
    console.error('Erreur récupération info image:', error);
    return {};
  }
};

/**
 * 🔥 VALIDATION COMPLÈTE D'UNE IMAGE (Mobile)
 * Valide format + taille + magic bytes
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
    // 1. Obtenir les informations du fichier si non fournies
    let fileSize = imageAsset.fileSize;
    let mimeType = imageAsset.type || imageAsset.mimeType || getMimeTypeFromUri(imageAsset.uri);

    if (!fileSize) {
      const info = await getImageInfo(imageAsset.uri);
      fileSize = info.size;
      mimeType = info.type || mimeType;
    }

    // 2. Validation du type MIME
    if (!validateImageType(mimeType || '')) {
      return { 
        isValid: false, 
        error: IMAGE_CONFIG.MESSAGES.INVALID_FORMAT 
      };
    }

    // 3. Validation de la taille
    if (fileSize) {
      const sizeValidation = validateImageSize(fileSize, type);
      if (!sizeValidation.isValid) {
        return sizeValidation;
      }
    }

    // 4. Validation des magic bytes (optionnelle mais recommandée)
    const magicBytesValidation = await validateImageMagicBytes(imageAsset.uri);
    if (!magicBytesValidation.isValid) {
      return magicBytesValidation;
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

// ================================
// EXPORTS ESSENTIELS
// ================================

export const PLACEHOLDER_IMAGE = IMAGE_CONFIG.PLACEHOLDER_IMAGE;
export const MAX_IMAGES = IMAGE_CONFIG.MAX_IMAGES;
export const MAX_FILE_SIZE_PRODUCT = IMAGE_CONFIG.MAX_FILE_SIZE_PRODUCT;
export const MAX_FILE_SIZE_AVATAR = IMAGE_CONFIG.MAX_FILE_SIZE_AVATAR;
