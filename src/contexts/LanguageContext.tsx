import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  toggleLanguage: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('appLanguage');
        if (savedLanguage === 'en' || savedLanguage === 'fr') {
          setLanguageState(savedLanguage);
        }
      } catch (error) {
        // Erreur silencieuse
      } finally {
        setIsInitialized(true);
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

  if (!isInitialized) {
    return <>{children}</>;
  }

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
