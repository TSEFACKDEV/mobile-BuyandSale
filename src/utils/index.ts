import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '../models/user';

const STORAGE_KEYS = {
  AUTH_USER: '@buyAndSale:authUser',
  ACCESS_TOKEN: '@buyAndSale:accessToken',
  REFRESH_TOKEN: '@buyAndSale:refreshToken',
};

class Utils {
  // Sauvegarder l'utilisateur dans le storage
  static async saveInLocalStorage(user: AuthUser): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      if (user.token) {
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, user.token.AccessToken);
        if (user.token.refreshToken) {
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, user.token.refreshToken);
        }
      }
    } catch (error) {
      // Erreur silencieuse
    }
  }

  // Récupérer l'utilisateur du storage
  static async getLocalUser(): Promise<AuthUser | null> {
    try {
      const userString = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      // Erreur silencieuse
      return null;
    }
  }

  // Nettoyer les tokens
  static async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_USER,
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
    } catch (error) {
      // Erreur silencieuse
    }
  }

  // Récupérer le token d'accès
  static async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      // Erreur silencieuse
      return null;
    }
  }

  // Mettre à jour le token d'accès (comme React setJWT)
  static async setAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      // Erreur silencieuse
    }
  }

  // Récupérer le refresh token
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      // Erreur silencieuse
      return null;
    }
  }

  // Mettre à jour le refresh token
  static async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      // Erreur silencieuse
    }
  }
}

export default Utils;
