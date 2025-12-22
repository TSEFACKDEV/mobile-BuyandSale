import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

interface AuthContextType {
  isOnboardingComplete: boolean;
  isUserLoggedIn: boolean;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialiser l'état au montage
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const onboardingDone = await authService.isOnboardingComplete();
        const loggedIn = await authService.isUserLoggedIn();
        
        setIsOnboardingComplete(onboardingDone);
        setIsUserLoggedIn(loggedIn);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await authService.markOnboardingComplete();
      setIsOnboardingComplete(true);
    } catch (error) {
      console.error('Erreur lors de la finalisation du onboarding:', error);
      throw error;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setIsUserLoggedIn(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
  }, []);

  const register = useCallback(async (data: any) => {
    try {
      const result = await authService.register(data);
      if (result.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setIsUserLoggedIn(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    isOnboardingComplete,
    isUserLoggedIn,
    isLoading,
    completeOnboarding,
    login,
    register,
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
