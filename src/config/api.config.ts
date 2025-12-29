import { Platform } from 'react-native';
import { Platform as RNPlatform } from 'react-native';

// Configuration de l'API selon l'environnement
const getApiUrl = (): string => {
  // En développement
  if (__DEV__) {
    // IP locale de votre PC (vérifiée avec ipconfig)
    const LOCAL_IP = '192.168.4.55';
    const PORT = '3001';
    
    console.log('📱 Plateforme détectée:', Platform.OS);
    console.log('🔍 Version:', RNPlatform.Version);
    
    // IMPORTANT: Pour appareil physique, utilisez TOUJOURS l'IP locale
    // 10.0.2.2 ne fonctionne QUE pour l'émulateur Android
    
    // Si vous utilisez l'émulateur Android (rare), décommentez ci-dessous:
    // if (Platform.OS === 'android') {
    //   const url = 'http://10.0.2.2:3001/api/buyandsale';
    //   console.log('🌐 API URL (Android Emulator):', url);
    //   return url;
    // }
    
    // Pour TOUS les appareils physiques (Android ET iOS)
    const url = `http://${LOCAL_IP}:${PORT}/api/buyandsale`;
    console.log('🌐 API URL (Physical Device):', url);
    console.log('⚠️  Assurez-vous que:');
    console.log('   1. Le serveur tourne sur le PC');
    console.log('   2. PC et téléphone sur le MÊME Wi-Fi');
    console.log('   3. Le pare-feu autorise le port', PORT);
    return url;
  }
  
  // En production, utiliser l'URL de production
  return 'https://your-production-api.com/api/buyandsale';
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 10000,
};

export default API_CONFIG;