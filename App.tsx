import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store, persistor } from './src/store';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/Navigation/RootNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';


// Composant interne qui a accès au store
function AppContent() {
  useEffect(() => {
    // Nettoyer les anciennes clés AsyncStorage obsolètes
    const cleanupOldKeys = async () => {
      try {
        await AsyncStorage.multiRemove([
          '@buyAndSale:authUser',
          '@buyAndSale:accessToken',
          '@buyAndSale:refreshToken',
        ]);
        console.log('✅ Anciennes clés AsyncStorage nettoyées');
      } catch (error) {
        console.error('Erreur nettoyage:', error);
      }
    };

    cleanupOldKeys();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
