import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import API_CONFIG from '../config/api.config';

// Important: Configure WebBrowser pour compléter la session d'authentification
WebBrowser.maybeCompleteAuthSession();

/**
 * Configuration des Client IDs Google pour chaque plateforme
 * Ces IDs doivent être configurés dans Google Cloud Console
 * et ajoutés dans le fichier .env
 */
const GOOGLE_CONFIG = {
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '',
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '',
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '',
};

export interface GoogleAuthResult {
  success: boolean;
  accessToken?: string;
  user?: any;
  error?: string;
}

export class GoogleAuthService {
  /**
   * Hook pour configurer la requête d'authentification Google
   * Utilise expo-auth-session pour gérer le flux OAuth2
   * 
   * @returns [request, response, promptAsync] - Tuple pour gérer l'auth
   */
  static useGoogleAuth() {
    return Google.useAuthRequest({
      iosClientId: GOOGLE_CONFIG.iosClientId,
      androidClientId: GOOGLE_CONFIG.androidClientId,
      webClientId: GOOGLE_CONFIG.webClientId,
      scopes: ['profile', 'email'],
    });
  }

  /**
   * Authentifie l'utilisateur via Google et échange le token avec le backend
   * 
   * Flux:
   * 1. Récupère les informations utilisateur depuis Google avec l'access token
   * 2. Envoie ces informations à notre backend pour créer/récupérer l'utilisateur
   * 3. Retourne le token JWT de notre backend pour les requêtes futures
   * 
   * @param googleAccessToken - Token d'accès obtenu depuis Google OAuth
   * @returns GoogleAuthResult avec le token et les données utilisateur
   */
  static async authenticateWithBackend(
    googleAccessToken: string
  ): Promise<GoogleAuthResult> {
    try {
      // Étape 1: Récupérer les informations utilisateur depuis Google
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${googleAccessToken}` },
        }
      );

      if (!userInfoResponse.ok) {
        throw new Error('Échec de récupération des informations Google');
      }

      const googleUserInfo = await userInfoResponse.json();

      // Étape 2: Envoyer à notre backend pour créer/récupérer l'utilisateur
      const backendResponse = await fetch(
        `${API_CONFIG.BASE_URL}/auth/google/mobile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            googleId: googleUserInfo.sub,
            email: googleUserInfo.email,
            firstName: googleUserInfo.given_name || '',
            lastName: googleUserInfo.family_name || '',
            avatar: googleUserInfo.picture,
            isVerified: googleUserInfo.email_verified || true,
          }),
        }
      );

      const backendData = await backendResponse.json();

      if (!backendResponse.ok) {
        const errorMessage =
          backendData.meta?.message ||
          backendData.message ||
          'Erreur d\'authentification backend';
        throw new Error(errorMessage);
      }

      return {
        success: true,
        accessToken: backendData.data.token.AccessToken,
        user: backendData.data.user,
      };
    } catch (error) {
      // TODO: Implémenter système de logging
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  /**
   * Valide que les Client IDs Google sont configurés
   * @returns true si au moins un Client ID est configuré
   */
  static isConfigured(): boolean {
    const hasAtLeastOneId =
      !!GOOGLE_CONFIG.iosClientId ||
      !!GOOGLE_CONFIG.androidClientId ||
      !!GOOGLE_CONFIG.webClientId;

    return hasAtLeastOneId;
  }
}
