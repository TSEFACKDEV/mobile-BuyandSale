import { Platform } from 'react-native';

const getApiUrl = (): string => {
  if (__DEV__) {
    const LOCAL_IP = '192.168.1.173';
    const PORT = '3001';
    
    // IMPORTANT: 10.0.2.2 fonctionne UNIQUEMENT pour l'émulateur Android
    // Pour appareil physique (Android ou iOS), utilisez l'IP locale
    
    // Décommentez cette ligne si vous utilisez l'émulateur Android:
    // if (Platform.OS === 'android') {
    //   return 'http://10.0.2.2:3001/api/buyandsale';
    // }
    
    // Pour appareils physiques (par défaut)
    return `http://${LOCAL_IP}:${PORT}/api/buyandsale`;
  }
  
  return 'https://your-production-api.com/api/buyandsale';
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 10000,
};

export default API_CONFIG;