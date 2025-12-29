import { Platform } from 'react-native';
import { Platform as RNPlatform } from 'react-native';

/**
 * 🔧 Configuration de l'API avec détection automatique
 * 
 * PRIORITÉS:
 * 1. Variables d'environnement (.env)
 * 2. Détection automatique de l'émulateur
 * 3. IP codée en dur (fallback)
 */
const getApiUrl = (): string => {
  // En développement
  if (__DEV__) {
    // 📌 IP locale du PC (à mettre à jour avec ipconfig sur Windows)
    const LOCAL_IP = '192.168.1.173';
    const PORT = '3001';
    
    console.log('📱 Plateforme détectée:', Platform.OS);
    console.log('🔍 Version:', RNPlatform.Version);
    
    // Émulateur Android : utiliser 10.0.2.2
    const isAndroidEmulator = Platform.OS === 'android' && RNPlatform.Version === 'unknown';
    
    if (isAndroidEmulator) {
      const url = `http://10.0.2.2:${PORT}/api/buyandsale`;
      console.log('🤖 Android Emulator détecté');
      console.log('🌐 API URL:', url);
      return url;
    }
    
    // Simulateur iOS : utiliser localhost
    const isIOSSimulator = Platform.OS === 'ios' && !Platform.isTV;
    if (isIOSSimulator) {
      const url = `http://localhost:${PORT}/api/buyandsale`;
      console.log('🍎 iOS Simulator détecté');
      console.log('🌐 API URL:', url);
      return url;
    }
    
    // Appareils physiques : utiliser l'IP locale
    const url = `http://${LOCAL_IP}:${PORT}/api/buyandsale`;
    console.log('📱 Appareil physique détecté');
    console.log('🌐 API URL:', url);
    console.log('⚠️  Configuration requise:');
    console.log('   1. Serveur actif sur le PC (npm run dev)');
    console.log('   2. PC et téléphone sur le MÊME Wi-Fi');
    console.log('   3. Pare-feu Windows autorisant le port', PORT);
    console.log('   4. IP correcte dans ce fichier:', LOCAL_IP);
    return url;
  }
  
  // En production, utiliser l'URL de production depuis .env ou fallback
  const prodUrl = 'https://your-production-api.com/api/buyandsale';
  console.log('🚀 Mode Production - API URL:', prodUrl);
  return prodUrl;
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 15000, // Augmenté à 15s pour les connexions mobiles lentes
};

// Vérification de connectivité au démarrage
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Test de connectivité API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(API_CONFIG.BASE_URL.replace('/api/buyandsale', '/api/buyandsale'), {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('✅ Connexion API réussie!');
      return true;
    } else {
      console.error('❌ Erreur API:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Échec de connexion API:', error);
    console.error('💡 Vérifiez:');
    console.error('   1. Le serveur est démarré');
    console.error('   2. L\'IP est correcte:', API_CONFIG.BASE_URL);
    console.error('   3. Le pare-feu autorise les connexions');
    console.error('   4. Même réseau Wi-Fi pour PC et mobile');
    return false;
  }
};

export default API_CONFIG;