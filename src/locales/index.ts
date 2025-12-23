import fr from './fr.json';

export type TranslationKeys = typeof fr;

export const translations = {
  fr,
};

export type SupportedLanguage = keyof typeof translations;

export const getTranslation = (lang: SupportedLanguage = 'fr') => {
  return translations[lang] || translations.fr;
};
