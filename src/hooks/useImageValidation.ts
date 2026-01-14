/**
 * 🪝 Hook personnalisé pour la validation d'images
 * Simplifie l'utilisation de la validation dans les composants
 */

import { useState, useCallback } from 'react';
import { 
  validateImageComplete, 
  validateImagesArray,
  IMAGE_CONFIG 
} from '../utils/imageUtils';

interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

interface UseImageValidationReturn {
  // État
  isValidating: boolean;
  validationResults: Map<string, ImageValidationResult>;
  
  // Méthodes
  validateSingleImage: (
    imageAsset: { uri: string; fileSize?: number; type?: string },
    type?: 'avatar' | 'product'
  ) => Promise<ImageValidationResult>;
  
  validateMultipleImages: (
    images: Array<{ uri: string; fileSize?: number; type?: string }>,
    type?: 'avatar' | 'product'
  ) => Promise<{
    isValid: boolean;
    errors: string[];
  }>;
  
  clearValidation: () => void;
  getValidationStatus: (uri: string) => ImageValidationResult | undefined;
}

/**
 * Hook pour valider les images avec gestion d'état
 */
export const useImageValidation = (): UseImageValidationReturn => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<Map<string, ImageValidationResult>>(
    new Map()
  );

  /**
   * Valide une seule image
   */
  const validateSingleImage = useCallback(async (
    imageAsset: { uri: string; fileSize?: number; type?: string },
    type: 'avatar' | 'product' = 'product'
  ): Promise<ImageValidationResult> => {
    setIsValidating(true);

    try {
      const result = await validateImageComplete(imageAsset, type);

      // Stocker le résultat
      setValidationResults((prev) => {
        const newMap = new Map(prev);
        newMap.set(imageAsset.uri, result);
        return newMap;
      });

      return result;
    } catch (error) {
      const errorResult = {
        isValid: false,
        error: IMAGE_CONFIG.MESSAGES.VALIDATION_ERROR,
      };

      setValidationResults((prev) => {
        const newMap = new Map(prev);
        newMap.set(imageAsset.uri, errorResult);
        return newMap;
      });

      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Valide plusieurs images en parallèle
   */
  const validateMultipleImages = useCallback(async (
    images: Array<{ uri: string; fileSize?: number; type?: string }>,
    type: 'avatar' | 'product' = 'product'
  ): Promise<{
    isValid: boolean;
    errors: string[];
  }> => {
    setIsValidating(true);

    try {
      const result = await validateImagesArray(images, type);

      // Stocker les résultats individuels
      const newResults = new Map(validationResults);
      images.forEach((img, index) => {
        const imageError = result.errors.find((err) => err.startsWith(`Image ${index + 1}:`));
        newResults.set(img.uri, {
          isValid: !imageError,
          error: imageError,
        });
      });
      setValidationResults(newResults);

      return result;
    } catch (error) {
      return {
        isValid: false,
        errors: [IMAGE_CONFIG.MESSAGES.VALIDATION_ERROR],
      };
    } finally {
      setIsValidating(false);
    }
  }, [validationResults]);

  /**
   * Efface tous les résultats de validation
   */
  const clearValidation = useCallback(() => {
    setValidationResults(new Map());
  }, []);

  /**
   * Récupère le statut de validation d'une image spécifique
   */
  const getValidationStatus = useCallback((uri: string): ImageValidationResult | undefined => {
    return validationResults.get(uri);
  }, [validationResults]);

  return {
    isValidating,
    validationResults,
    validateSingleImage,
    validateMultipleImages,
    clearValidation,
    getValidationStatus,
  };
};

export default useImageValidation;
