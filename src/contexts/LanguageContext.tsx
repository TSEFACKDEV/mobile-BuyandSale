import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

export type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  toggleLanguage: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Détecte la langue du système (sans expo-localization).
 * Retourne 'fr' ou 'en', avec 'fr' comme fallback (app ciblée Cameroun).
 */
const getDeviceLanguage = (): Language => {
  try {
    const locale: string =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager?.settings?.AppleLocale ||
          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
          'fr'
        : NativeModules.I18nManager?.localeIdentifier || 'fr';

    const lang = locale.substring(0, 2).toLowerCase();
    return lang === 'en' ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('appLanguage');
        if (savedLanguage === 'en' || savedLanguage === 'fr') {
          // L'utilisateur a déjà fait un choix explicite → on le respecte
          setLanguageState(savedLanguage);
        } else {
          // Première ouverture → détecter la langue du système
          const deviceLang = getDeviceLanguage();
          setLanguageState(deviceLang);
        }
      } catch (error) {
        // Erreur silencieuse
      }
    };

    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem('appLanguage', lang);
    } catch (error) {
      // Erreur silencieuse
    }
  };

  const toggleLanguage = async () => {
    const newLang: Language = language === 'fr' ? 'en' : 'fr';
    await setLanguage(newLang);
  };

  // Toujours fournir le Provider, même pendant l'initialisation
  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage doit être utilisé au sein d\'un LanguageProvider');
  }
  return context;
};
