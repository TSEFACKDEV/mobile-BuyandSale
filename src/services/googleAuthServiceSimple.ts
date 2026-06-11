import * as WebBrowser from 'expo-web-browser';
import API_CONFIG from '../config/api.config';

export interface GoogleAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

/**
 * Google OAuth via deep link — zéro polling, zéro état serveur.
 *
 * Flux :
 * 1. openAuthSessionAsync ouvre le navigateur et attend un redirect vers buyandsale://
 * 2. Le backend redirige vers buyandsale://auth-callback?token=xxx&refreshToken=yyy
 * 3. Le système ferme le navigateur et retourne l'URL à l'app
 */
export class GoogleAuthService {
  static async signIn(): Promise<GoogleAuthResult> {
    try {
      const authUrl = `${API_CONFIG.BASE_URL}/auth/google?mobile=true`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, 'buyandsale://');

      if (result.type !== 'success') {
        return { success: false, error: 'Authentification annulée' };
      }

      const params = new URL(result.url).searchParams;
      const token = params.get('token');
      const refreshToken = params.get('refreshToken');

      if (!token) {
        return { success: false, error: 'Aucun token reçu' };
      }

      return { success: true, accessToken: token, refreshToken: refreshToken ?? undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }
}

