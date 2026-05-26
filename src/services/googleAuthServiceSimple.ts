import * as WebBrowser from 'expo-web-browser';
import API_CONFIG from '../config/api.config';

export interface GoogleAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

/**
 * 🎯 SERVICE GOOGLE AUTH SIMPLIFIÉ
 * Utilise le même backend OAuth que le web
 * 
 * FLUX:
 * 1. Génère un sessionId unique
 * 2. Ouvre le navigateur vers /auth/google?sessionId=xxx
 * 3. Backend gère OAuth avec Passport.js et stocke le token avec sessionId
 * 4. App mobile récupère le token via polling sur /auth/session/:sessionId
 * 5. Authentification avec le token JWT
 * 
 * ✅ Avantages:
 * - Même config que le web (zéro config mobile supplémentaire)
 * - Pas besoin de Client IDs iOS/Android séparés
 * - Pas besoin de SHA-1 ou de configuration Google Play
 * - Fonctionne sur iOS et Android sans modification
 */
export class GoogleAuthService {
  /**
   * Lance l'authentification Google (comme le web)
   */
  static async signIn(): Promise<GoogleAuthResult> {
    try {
      const randomBytes = new Uint8Array(16);
      crypto.getRandomValues(randomBytes);
      const sessionId = `mobile_${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;
      const authUrl = `${API_CONFIG.BASE_URL}/auth/google?mobile=true&sessionId=${sessionId}`;
      
      // Ouvrir le navigateur (non-bloquant)
      WebBrowser.openBrowserAsync(authUrl);
      
      // Récupérer le token via polling
      const pollResult = await this.pollForToken(sessionId);
      
      if (pollResult.success && pollResult.accessToken) {
        // Fermer automatiquement le navigateur
        WebBrowser.dismissBrowser();
        return pollResult;
      }

      return { success: false, error: 'Aucun token reçu' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Vérifie périodiquement si le token est disponible (30 tentatives = 30s max)
   */
  private static async pollForToken(sessionId: string, maxAttempts = 30): Promise<GoogleAuthResult> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/auth/session/${sessionId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            return { 
              success: true, 
              accessToken: data.token,
              refreshToken: data.refreshToken
            };
          }
        }
      } catch {}
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return { success: false, error: 'Timeout - aucun token reçu' };
  }

}
