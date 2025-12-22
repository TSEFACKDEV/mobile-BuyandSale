import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/Navigation/RootNavigator';
import { hydrateAuth } from './src/store/authentification/slice';
import Utils from './src/utils';

// Composant interne qui a accès au store
function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Hydrater Redux avec les données stockées
    const loadStoredUser = async () => {
      const storedUser = await Utils.getLocalUser();
      if (storedUser) {
        dispatch(hydrateAuth(storedUser));
      }
    };

    loadStoredUser();
  }, [dispatch]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
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
