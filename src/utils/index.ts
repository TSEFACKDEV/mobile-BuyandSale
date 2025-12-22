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
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }

  // Récupérer l'utilisateur du storage
  static async getLocalUser(): Promise<AuthUser | null> {
    try {
      const userString = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
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
      console.error('Erreur lors du nettoyage:', error);
    }
  }

  // Récupérer le token d'accès
  static async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }
}

export default Utils;
