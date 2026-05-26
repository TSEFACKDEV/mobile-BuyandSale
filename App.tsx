import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as ExpoSplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import { store, persistor, RootState, AppDispatch } from './src/store';
import { AuthProvider } from './src/contexts/AuthContext';
import { DialogProvider } from './src/contexts/DialogContext';
import RootNavigator from './src/Navigation/RootNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import socketService from './src/services/socketService';
import { addNotification } from './src/store/notification/slice';
import SplashAnimationScreen from './src/components/SplashAnimationScreen';
import OfflineBanner from './src/components/OfflineBanner';
import pushNotificationService from './src/services/pushNotificationService';
import API_CONFIG from './src/config/api.config';
import Utils from './src/utils';

// Initialiser Sentry (disabled en dev ou si DSN absent)
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  enabled: !__DEV__ && !!process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  environment: __DEV__ ? 'development' : 'production',
});

// Empêche le splash natif de se masquer automatiquement
ExpoSplashScreen.preventAutoHideAsync().catch(() => {});


function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.authentification.auth.entities);

  useEffect(() => {
    if (user?.id) {
      socketService.connect(user.id, (notification) => {
        dispatch(addNotification(notification));
      });

      // Enregistrer le token Expo Push pour les notifications hors-ligne
      pushNotificationService.getExpoPushToken().then((token) => {
        if (!token) return;
        const accessToken = Utils.getAccessToken();
        if (!accessToken) return;
        fetch(`${API_CONFIG.BASE_URL}/notification/push-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ token }),
        }).catch(() => {});
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
      } catch {
        // Nettoyage silencieux — ces clés n'existent peut-être plus
      }
    };

    cleanupOldKeys();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          <DialogProvider>
            <ThemeProvider>
              <LanguageProvider>
                <StatusBar style="dark" />
                <RootNavigator />
                <OfflineBanner />
              </LanguageProvider>
            </ThemeProvider>
          </DialogProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    // Masque le splash natif dès que notre animation prend le relais
    ExpoSplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      {/* App montée immédiatement : la rehydratation Redux démarre pendant l'animation */}
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppContent />
        </PersistGate>
      </Provider>

      {/* Overlay : recouvre l'app le temps de l'animation (~2.3s) */}
      {!splashDone && (
        <View style={StyleSheet.absoluteFill}>
          <SplashAnimationScreen onComplete={() => setSplashDone(true)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default Sentry.wrap(App);
