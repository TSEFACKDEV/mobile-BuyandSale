/**
 * 🧪 Script de test pour vérifier la configuration Google Auth
 * 
 * Ce fichier vérifie que:
 * 1. Les variables d'environnement sont configurées
 * 2. L'endpoint backend est accessible
 * 3. La configuration est valide
 * 
 * Usage: Importer ce fichier temporairement dans App.tsx pour tester
 */

import API_CONFIG from './src/config/api.config';

export const testGoogleAuthConfig = async () => {
  console.log('\n🧪 ===== TEST CONFIGURATION GOOGLE AUTH =====\n');

  // 1. Vérifier les variables d'environnement
  console.log('📋 1. Vérification des variables d\'environnement:');
  
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;

  console.log(`   iOS Client ID: ${iosClientId ? '✅ Configuré' : '❌ MANQUANT'}`);
  console.log(`   Android Client ID: ${androidClientId ? '✅ Configuré' : '❌ MANQUANT'}`);
  console.log(`   Web Client ID: ${webClientId ? '✅ Configuré' : '❌ MANQUANT'}`);

  if (iosClientId) {
    console.log(`   → iOS: ${iosClientId.substring(0, 20)}...`);
  }
  if (androidClientId) {
    console.log(`   → Android: ${androidClientId.substring(0, 20)}...`);
  }

  // 2. Vérifier que les Client IDs ont le bon format
  console.log('\n🔍 2. Vérification du format des Client IDs:');
  
  const isValidFormat = (clientId: string | undefined) => {
    if (!clientId) return false;
    return clientId.endsWith('.apps.googleusercontent.com');
  };

  console.log(`   iOS format valide: ${isValidFormat(iosClientId) ? '✅' : '❌'}`);
  console.log(`   Android format valide: ${isValidFormat(androidClientId) ? '✅' : '❌'}`);
  console.log(`   Web format valide: ${isValidFormat(webClientId) ? '✅' : '❌'}`);

  // 3. Vérifier l'accessibilité du backend
  console.log('\n🌐 3. Vérification de l\'accessibilité du backend:');
  console.log(`   URL: ${API_CONFIG.BASE_URL}`);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/google/mobile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Test avec des données vides pour vérifier que l'endpoint existe
        googleId: '',
        email: '',
      }),
    });

    const data = await response.json();

    if (response.status === 400) {
      console.log('   ✅ Endpoint accessible (erreur 400 attendue)');
      console.log(`   Message: ${data.meta?.message || data.message}`);
    } else {
      console.log(`   ⚠️ Status inattendu: ${response.status}`);
    }
  } catch (error) {
    console.log('   ❌ Backend inaccessible');
    console.log(`   Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`);
    console.log('   💡 Vérifiez que le backend est démarré (npm run dev)');
  }

  // 4. Vérifier la configuration app.json
  console.log('\n📱 4. Configuration app.json:');
  console.log('   Vérifiez manuellement que app.json contient:');
  console.log('   - scheme: "buyandsale"');
  console.log('   - ios.bundleIdentifier: "com.buyandsale.app"');
  console.log('   - android.package: "com.buyandsale.app"');

  // 5. Résumé
  console.log('\n📊 5. Résumé:');
  
  const allConfigured = iosClientId && androidClientId && webClientId;
  const allValidFormat = 
    isValidFormat(iosClientId) && 
    isValidFormat(androidClientId) && 
    isValidFormat(webClientId);

  if (allConfigured && allValidFormat) {
    console.log('   ✅ Configuration complète !');
    console.log('   🚀 Vous pouvez tester l\'authentification Google');
  } else {
    console.log('   ⚠️ Configuration incomplète');
    console.log('   📖 Consultez GOOGLE_CONSOLE_QUICKSTART.md pour l\'aide');
  }

  console.log('\n🧪 ===== FIN DU TEST =====\n');
};

// Pour utiliser ce test, ajouter dans App.tsx:
// import { testGoogleAuthConfig } from './testGoogleAuth';
// useEffect(() => { testGoogleAuthConfig(); }, []);
