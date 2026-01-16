/**
 * Utilitaires de sécurité pour la validation et la sanitization des entrées utilisateur
 * Protection contre XSS, injections et autres attaques courantes
 */

// Patterns de sécurité minimaux essentiels
const DANGEROUS_PATTERNS = {
  script: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  html: /<[^>]*>/g,
  javascript: /javascript:/gi,
};

/**
 * Filtre les caractères spéciaux pour les champs quartier/adresse
 * Garde uniquement : lettres, chiffres, espaces, tirets, points, virgules, accents français
 */
export const filterQuartierChars = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[^\w\s\-.,àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ]/g, '');
};

/**
 * Nettoie une chaîne de caractères des balises HTML et scripts dangereux
 * @internal
 */
const sanitizeHTML = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(DANGEROUS_PATTERNS.script, '')
    .replace(DANGEROUS_PATTERNS.html, '')
    .replace(DANGEROUS_PATTERNS.javascript, '');
};

/**
 * Nettoie le texte en gardant uniquement les caractères alphanumériques et espaces
 * @internal
 */
const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  const noHtml = sanitizeHTML(input);
  return noHtml.replace(/[^\w\s\-.,!?'àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ]/g, '').trim();
};

/**
 * Valide et nettoie un nom (produit, utilisateur, etc.)
 * @internal
 */
const sanitizeName = (name: string, options: { minLength?: number; maxLength?: number } = {}): { 
  isValid: boolean; 
  sanitized: string; 
  error?: string;
} => {
  const { minLength = 3, maxLength = 100 } = options;
  
  if (!name || typeof name !== 'string') {
    return { isValid: false, sanitized: '', error: 'Le nom est requis' };
  }
  
  const sanitized = sanitizeText(name).substring(0, maxLength);
  
  if (sanitized.length < minLength) {
    return { 
      isValid: false, 
      sanitized, 
      error: `Le nom doit contenir au moins ${minLength} caractères` 
    };
  }
  
  return { isValid: true, sanitized };
};

/**
 * Valide et nettoie une description
 * @internal
 */
const sanitizeDescription = (description: string, options: { minLength?: number; maxLength?: number } = {}): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} => {
  const { minLength = 10, maxLength = 1000 } = options;
  
  if (!description || typeof description !== 'string') {
    return { isValid: false, sanitized: '', error: 'La description est requise' };
  }
  
  const sanitized = sanitizeHTML(description)
    .replace(/[<>]/g, '')
    .substring(0, maxLength)
    .trim();
  
  if (sanitized.length < minLength) {
    return { 
      isValid: false, 
      sanitized, 
      error: `La description doit contenir au moins ${minLength} caractères` 
    };
  }
  
  return { isValid: true, sanitized };
};

/**
 * Valide et nettoie un prix
 * @internal
 */
const sanitizePrice = (price: string | number): {
  isValid: boolean;
  sanitized: string;
  numericValue: number;
  error?: string;
} => {
  const priceStr = String(price).replace(/[^0-9]/g, '');
  const numericValue = parseInt(priceStr, 10);
  
  if (isNaN(numericValue) || numericValue <= 0) {
    return { 
      isValid: false, 
      sanitized: '', 
      numericValue: 0,
      error: 'Le prix doit être un nombre positif' 
    };
  }
  
  if (numericValue > 999999999) {
    return { 
      isValid: false, 
      sanitized: priceStr, 
      numericValue,
      error: 'Le prix est trop élevé' 
    };
  }
  
  return { isValid: true, sanitized: priceStr, numericValue };
};

/**
 * Valide et nettoie une quantité
 * @internal
 */
const sanitizeQuantity = (quantity: string | number): {
  isValid: boolean;
  sanitized: string;
  numericValue: number;
  error?: string;
} => {
  const quantityStr = String(quantity).replace(/[^0-9]/g, '');
  const numericValue = parseInt(quantityStr, 10);
  
  if (isNaN(numericValue) || numericValue <= 0) {
    return { 
      isValid: false, 
      sanitized: '', 
      numericValue: 0,
      error: 'La quantité doit être un nombre positif' 
    };
  }
  
  if (numericValue > 999999) {
    return { 
      isValid: false, 
      sanitized: quantityStr, 
      numericValue,
      error: 'La quantité est trop élevée' 
    };
  }
  
  return { isValid: true, sanitized: quantityStr, numericValue };
};

/**
 * Valide et nettoie un quartier/adresse
 * @internal
 */
const sanitizeAddress = (address: string, options: { minLength?: number; maxLength?: number } = {}): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} => {
  const { minLength = 2, maxLength = 100 } = options;
  
  if (!address || typeof address !== 'string') {
    return { isValid: false, sanitized: '', error: 'L\'adresse est requise' };
  }
  
  const sanitized = sanitizeText(address).substring(0, maxLength);
  
  if (sanitized.length < minLength) {
    return { 
      isValid: false, 
      sanitized, 
      error: `L'adresse doit contenir au moins ${minLength} caractères` 
    };
  }
  
  return { isValid: true, sanitized };
};

/**
 * Valide un ID (UUID ou nombre)
 * @internal
 */
const validateId = (id: string | number): boolean => {
  if (!id) return false;
  
  const idStr = String(id);
  
  // UUID v4 format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  // Ou nombre positif
  const numericRegex = /^\d+$/;
  
  return uuidRegex.test(idStr) || numericRegex.test(idStr);
};

/**
 * Valide et sanitize toutes les données d'un formulaire produit
 * Applique la validation et la sanitization sur tous les champs requis
 */
export const validateProductForm = (data: {
  name: string;
  description: string;
  price: string | number;
  quantity: string | number;
  quartier: string;
  categoryId: string | number;
  cityId: string | number;
}): {
  isValid: boolean;
  sanitized: {
    name: string;
    description: string;
    price: string;
    quantity: string;
    quartier: string;
    categoryId: string | number;
    cityId: string | number;
  };
  errors: string[];
} => {
  const errors: string[] = [];
  const sanitized: any = {};

  // Valider le nom
  const nameResult = sanitizeName(data.name);
  if (!nameResult.isValid) {
    errors.push(nameResult.error || 'Nom invalide');
  } else {
    sanitized.name = nameResult.sanitized;
  }
  
  // Valider la description
  const descResult = sanitizeDescription(data.description);
  if (!descResult.isValid) {
    errors.push(descResult.error || 'Description invalide');
  } else {
    sanitized.description = descResult.sanitized;
  }
  
  // Valider le prix
  const priceResult = sanitizePrice(data.price);
  if (!priceResult.isValid) {
    errors.push(priceResult.error || 'Prix invalide');
  } else {
    sanitized.price = priceResult.sanitized;
  }
  
  // Valider la quantité
  const quantityResult = sanitizeQuantity(data.quantity);
  if (!quantityResult.isValid) {
    errors.push(quantityResult.error || 'Quantité invalide');
  } else {
    sanitized.quantity = quantityResult.sanitized;
  }
  
  // Valider le quartier
  const addressResult = sanitizeAddress(data.quartier);
  if (!addressResult.isValid) {
    errors.push(addressResult.error || 'Adresse invalide');
  } else {
    sanitized.quartier = addressResult.sanitized;
  }
  
  // Valider les IDs
  if (!validateId(data.categoryId)) {
    errors.push('Catégorie invalide');
  } else {
    sanitized.categoryId = data.categoryId;
  }
  
  if (!validateId(data.cityId)) {
    errors.push('Ville invalide');
  } else {
    sanitized.cityId = data.cityId;
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors,
  };
};
