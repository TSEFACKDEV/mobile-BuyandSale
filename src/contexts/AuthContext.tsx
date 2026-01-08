import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/store';
import { selectUserAuthenticated } from '../store/authentification/slice';
import { logoutAction } from '../store/authentification/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'onboarding_complete';

interface AuthContextType {
  isOnboardingComplete: boolean;
  isUserLoggedIn: boolean;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector(selectUserAuthenticated);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si l'utilisateur est connecté via Redux
  const isUserLoggedIn = authState.entities !== null && authState.entities?.token !== undefined;

  // Initialiser l'état au montage
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY);
        setIsOnboardingComplete(onboardingDone === 'true');
      } catch (error) {
        // TODO: Implémenter système de logging
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setIsOnboardingComplete(true);
    } catch (error) {
      // TODO: Implémenter système de logging
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutAction()).unwrap();
    } catch (error) {
      // TODO: Implémenter système de logging
      throw error;
    }
  }, [dispatch]);

  const value: AuthContextType = {
    isOnboardingComplete,
    isUserLoggedIn,
    isLoading,
    completeOnboarding,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
