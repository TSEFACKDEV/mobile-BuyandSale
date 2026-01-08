import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store, persistor, RootState, AppDispatch } from './src/store';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/Navigation/RootNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import socketService from './src/services/socketService';
import pushNotificationService from './src/services/pushNotificationService';
import { addNotification } from './src/store/notification/slice';


function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.authentification.auth.entities);

  // Note: Les notifications push ne fonctionnent plus dans Expo Go avec SDK 53+
  // Utilisez un development build pour les tester
  // Voir: https://docs.expo.dev/develop/development-builds/introduction/
  useEffect(() => {
    // pushNotificationService.initialize();
    // Décommentez cette ligne quand vous utilisez un development build
  }, []);

  useEffect(() => {
    if (user?.id) {
      socketService.connect(user.id, (notification) => {
        dispatch(addNotification(notification));
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    const cleanupOldKeys = async () => {
      try {
        await AsyncStorage.multiRemove([
          '@buyAndSale:authUser',
          '@buyAndSale:accessToken',
          '@buyAndSale:refreshToken',
        ]);
      } catch (error) {
        console.error('Erreur nettoyage:', error);
      }
    };

    cleanupOldKeys();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <StatusBar style="dark" />
              <RootNavigator />
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
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
