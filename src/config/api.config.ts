// Configuration de l'API selon l'environnement
const getApiUrl = (): string => {
  // En développement
  if (__DEV__) {
    // IMPORTANT: Utiliser nip.io pour que le sessionId soit préservé avec Google OAuth
    // nip.io est un service DNS wildcard qui résout vers l'IP (nécessaire pour Google OAuth)
    // EXPLICATION: 192.168.1.28.nip.io résout automatiquement vers 192.168.1.28
    // Cela permet à Google OAuth d'accepter l'URL (rejette les IPs brutes)
    return 'http://192.168.1.28.nip.io:3001/api/buyandsale';
    
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
  
  // ====================================
  // 🚀 PRODUCTION - À MODIFIER AVANT DE DÉPLOYER !
  // ====================================
  // Remplace par ton URL de production avec HTTPS
  // Option A: Si l'API est sur un sous-domaine dédié
  return 'https://api.buyandsale.cm/api/buyandsale';
  
  // Option B: Si l'API est sur le même domaine que le frontend
  // return 'https://buyandsale.cm/api/buyandsale';
  
  // ⚠️ IMPORTANT:
  // 1. Utilise HTTPS en production (obligatoire)
  // 2. Mets à jour GOOGLE_CALLBACK_URL dans server/.env.production
  // 3. Ajoute cette URL dans Google OAuth Console
  // 4. Voir PRODUCTION_DEPLOYMENT_GUIDE.md pour plus de détails
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 15000,
};

export default API_CONFIG;
