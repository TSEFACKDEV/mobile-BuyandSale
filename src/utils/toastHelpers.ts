/**
 * Utilitaires pour afficher des toasts avec les bonnes couleurs selon le code HTTP
 * Version React Native avec expo-toast
 */

import { Alert } from 'react-native';

/**
 * Affiche un toast/alert avec le style approprié selon le code de statut HTTP
 * @param message - Le message à afficher
 * @param statusCode - Le code de statut HTTP (200, 300, 400, 500, etc.)
 * @param title - Titre optionnel de l'alerte
 */
export const showToast = (
  message: string,
  statusCode: number,
  title?: string
) => {
  // Déterminer le titre selon le code HTTP
  let alertTitle = title;
  
  if (!alertTitle) {
    if (statusCode >= 200 && statusCode < 300) {
      alertTitle = '✅ Succès';
    } else if (statusCode >= 300 && statusCode < 400) {
      alertTitle = 'ℹ️ Information';
    } else if (statusCode >= 400 && statusCode < 500) {
      alertTitle = '⚠️ Attention';
    } else if (statusCode >= 500) {
      alertTitle = '❌ Erreur';
    } else {
      alertTitle = 'Notification';
    }
  }

  Alert.alert(alertTitle, message);
};

/**
 * Affiche un toast depuis une réponse API
 * @param response - La réponse de l'API contenant meta.status et meta.message
 * @param title - Titre optionnel de l'alerte
 */
export const showToastFromApiResponse = (
  response: { meta?: { status?: number; message?: string } },
  title?: string
) => {
  const status = response?.meta?.status || 200;
  const message = response?.meta?.message || 'Opération effectuée';
  showToast(message, status, title);
};

/**
 * Affiche un toast d'erreur depuis un catch avec extraction du code HTTP
 * @param error - L'erreur capturée
 * @param fallbackMessage - Message par défaut si aucun message dans l'erreur
 * @param title - Titre optionnel de l'alerte
 */
export const showToastFromError = (
  error: any,
  fallbackMessage: string = 'Une erreur est survenue',
  title?: string
) => {
  // Extraire le code de statut de l'erreur
  const statusCode = 
    error?.response?.status || 
    error?.status || 
    error?.meta?.status || 
    500;

  // Extraire le message d'erreur
  const message = 
    error?.response?.data?.meta?.message ||
    error?.meta?.message ||
    error?.message ||
    error?.error ||
    fallbackMessage;

  showToast(message, statusCode, title);
};
