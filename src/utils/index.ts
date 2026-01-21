class Utils {
  // Récupérer le token d'accès depuis Redux Store
  static getAccessToken(): string | null {
    try {
      // Import dynamique pour éviter les dépendances circulaires
      const { store } = require('../store');
      const state = store.getState();
      return state.authentification?.auth?.entities?.token?.AccessToken || null;
    } catch (error) {
      return null;
    }
  }
}

export default Utils;
