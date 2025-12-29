class Utils {
  // Récupérer le token d'accès depuis Redux Store
  static getAccessToken(): string | null {
    try {
      // Import dynamique pour éviter les dépendances circulaires
      const { store } = require('../store');
      const state = store.getState();
      return state.authentification?.auth?.entities?.token?.AccessToken || null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  // Récupérer le refresh token depuis Redux Store
  static getRefreshToken(): string | null {
    try {
      const { store } = require('../store');
      const state = store.getState();
      return state.authentification?.auth?.entities?.token?.refreshToken || null;
    } catch (error) {
      // Erreur silencieuse
      return null;
    }
  }
}

export default Utils;
