import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'onboarding_complete';
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export const authService = {
  // ========== ONBOARDING ==========
  async markOnboardingComplete() {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Erreur lors du marquage de onboarding:', error);
    }
  },

  async isOnboardingComplete() {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Erreur lors de la vérification du onboarding:', error);
      return false;
    }
  },

  // ========== AUTHENTICATION ==========
  async login(email: string, password: string) {
    try {
      // TODO: Appeler votre API backend
      // const response = await fetch('https://api.example.com/login', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();
      
      // Pour la démo
      const token = 'fake_token_' + Date.now();
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      
      return {
        success: true,
        token,
        message: 'Connexion réussie',
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return {
        success: false,
        message: 'Erreur de connexion',
      };
    }
  },

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    try {
      // TODO: Appeler votre API backend
      // const response = await fetch('https://api.example.com/register', {
      //   method: 'POST',
      //   body: JSON.stringify(data),
      // });
      
      console.log('Inscription avec:', data);
      
      return {
        success: true,
        message: 'Inscription réussie. Veuillez vérifier votre email.',
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'inscription',
      };
    }
  },

  async logout() {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  },

  async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  },

  async isUserLoggedIn() {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error('Erreur lors de la vérification de connexion:', error);
      return false;
    }
  },

  // ========== USER DATA ==========
  async saveUserData(userData: any) {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données utilisateur:', error);
    }
  },

  async getUserData() {
    try {
      const data = await AsyncStorage.getItem(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  },
};
