/**
 * 🖼️ UTILITAIRES IMAGES - VERSION MOBILE
 * 
 * Gestion des URLs d'images pour React Native
 */

import API_CONFIG from '../config/api.config';

// Base URL du serveur backend (extrait de API_CONFIG et retirant /api/buyandsale)
const BASE_URL = API_CONFIG.BASE_URL.replace(/\/api\/[^/]+$/, '');

// Image placeholder par défaut
export const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150';

/**
 * Génère l'URL complète pour une image
 */
export const getImageUrl = (
  imagePath?: string | null,
  type: 'product' | 'avatar' = 'product'
): string => {
  // Validation de base
  if (!imagePath || imagePath === 'undefined' || imagePath === 'null' || imagePath.trim() === '') {
    return PLACEHOLDER_IMAGE;
  }

  // URLs externes déjà complètes
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Déterminer le dossier
  const folder = type === 'product' ? '/uploads/products' : '/uploads/users';

  // URL déjà avec le bon dossier
  if (imagePath.startsWith(folder)) {
    return `${BASE_URL}/public${imagePath}`;
  }

  // Construire l'URL complète
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${BASE_URL}/public${folder}${cleanPath}`;
};

/**
 * Formate le prix en format compact (K/M)
 */
export const formatCompactPrice = (price: number): string => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `${Math.floor(price / 1000)}K`;
  }
  return price.toString();
};
