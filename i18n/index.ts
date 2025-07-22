import { en } from './translations/en';
import { gu } from './translations/gu';

export type Language = 'en' | 'gu';

export type TranslationKeys = typeof en;

const translations = {
  en,
  gu,
};

export const getTranslations = (language: Language): TranslationKeys => {
  return translations[language] || translations.en;
};

export const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
] as const;

export const defaultLanguage: Language = 'en';

export { en, gu };