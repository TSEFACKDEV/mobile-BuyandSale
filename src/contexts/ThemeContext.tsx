import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =====================
// Types
// =====================
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Primaire
  primary: string;
  primaryDark: string;
  primaryLight: string;

  // Secondaire
  secondary: string;
  secondaryDark: string;

  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // Texte
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Borders
  border: string;
  borderLight: string;

  // Surface
  surface: string;

  // Status
  success: string;
  warning: string;
  error: string;
  info: string;

  // Autres
  shadow: string;
  disabled: string;
}

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  mode: ThemeMode;
}

interface ThemeContextType {
  theme: Theme;
  toggleDarkMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
}

// =====================
// Palettes de couleurs
// =====================
const LIGHT_THEME: ThemeColors = {
  primary: '#FF6B35',
  primaryDark: '#E55A24',
  primaryLight: '#FF8C5A',

  secondary: '#004E89',
  secondaryDark: '#003A6B',

  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#EFEFEF',

  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',

  border: '#E0E0E0',
  borderLight: '#F0F0F0',

  surface: '#FFFFFF',

  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',

  shadow: '#000000',
  disabled: '#CCCCCC',
};

const DARK_THEME: ThemeColors = {
  primary: '#FF6B35',
  primaryDark: '#FF5A24',
  primaryLight: '#FF8C5A',

  secondary: '#87CEEB',
  secondaryDark: '#4DB8E8',

  background: '#1A1A1A',
  backgroundSecondary: '#2D2D2D',
  backgroundTertiary: '#3A3A3A',

  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',

  border: '#404040',
  borderLight: '#333333',

  surface: '#2D2D2D',

  success: '#2ECC71',
  warning: '#F1C40F',
  error: '#E74C3C',
  info: '#3498DB',

  shadow: '#000000',
  disabled: '#555555',
};

// =====================
// Context
// =====================
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// =====================
// Provider Component
// =====================
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isInitialized, setIsInitialized] = useState(false);

  // Charger le thème sauvegardé au démarrage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('themeMode');
        if (savedMode) {
          setThemeMode(savedMode as ThemeMode);
        }
      } catch (error) {
        console.warn('Erreur lors du chargement de la préférence de thème:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadThemePreference();
  }, []);

  // Déterminer si le mode sombre est actif
  const isDarkMode = () => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  };

  // Créer l'objet de thème
  const theme: Theme = {
    isDark: isDarkMode(),
    colors: isDarkMode() ? DARK_THEME : LIGHT_THEME,
    mode: themeMode,
  };

  // Basculer le darkMode
  const toggleDarkMode = async () => {
    try {
      let newMode: ThemeMode;
      if (themeMode === 'light') {
        newMode = 'dark';
      } else if (themeMode === 'dark') {
        newMode = 'system';
      } else {
        newMode = 'light';
      }
      setThemeMode(newMode);
      await AsyncStorage.setItem('themeMode', newMode);
    } catch (error) {
      console.error('Erreur lors du changement du thème:', error);
    }
  };

  // Changer le mode du thème
  const handleSetThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Erreur lors du changement du mode du thème:', error);
    }
  };

  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleDarkMode,
        setThemeMode: handleSetThemeMode,
        isDarkMode: theme.isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// =====================
// Hook personnalisé
// =====================
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme doit être utilisé au sein d\'un ThemeProvider');
  }
  return context;
};

// Hook pour accéder uniquement aux couleurs
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

// Hook pour vérifier si le mode sombre est actif
export const useDarkMode = () => {
  const { isDarkMode } = useTheme();
  return isDarkMode;
};

// Hook pour accéder au mode du thème
export const useThemeMode = () => {
  const { theme, setThemeMode } = useTheme();
  return {
    mode: theme.mode,
    setMode: setThemeMode,
  };
};
