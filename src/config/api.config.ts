import { Platform } from 'react-native';

// Configuration de l'API selon l'environnement
const getApiUrl = (): string => {
  // En développement
  if (__DEV__) {
    // TEMPORAIRE: Utiliser l'IP locale pour tous les appareils
    // Si ça ne fonctionne pas, essayez 10.0.2.2 pour Android Emulator
    return 'http://192.168.1.28:3001/api/buyandsale';
    
    /* VERSION AVEC DÉTECTION AUTO (à réactiver si besoin)
    if (Platform.OS === 'android') {
      const url = 'http://10.0.2.2:3001/api/buyandsale';
      console.log('🌐 API URL (Android):', url);
      return url;
    }
    
    const url = 'http://192.168.1.173:3001/api/buyandsale';
    console.log('🌐 API URL (iOS/Physical):', url);
    return url;
    */
  }
  
  // En production, utiliser l'URL de production
  return 'https://your-production-api.com/api/buyandsale';
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 15000,
};

export default API_CONFIG;
