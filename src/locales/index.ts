import fr from './fr.json';
import en from './en.json';

export type TranslationKeys = typeof fr;

export const translations = {
  fr,
  en,
};

export type SupportedLanguage = keyof typeof translations;

export const getTranslation = (lang: SupportedLanguage = 'fr') => {
  return translations[lang] || translations.fr;
};
