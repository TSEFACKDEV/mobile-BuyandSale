import { useMemo } from 'react';
import { getTranslation } from '../locales';
import type { TranslationKeys } from '../locales';
import { useLanguage } from '../contexts/LanguageContext';

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type TranslationPath = NestedKeyOf<TranslationKeys>;

export const useTranslation = () => {
  const { language } = useLanguage();
  const translations = useMemo(() => getTranslation(language), [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, language };
};
