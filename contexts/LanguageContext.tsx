import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, TranslationKeys, getTranslations, defaultLanguage } from '@/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@mocktail_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language preference
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'gu')) {
          setLanguageState(savedLanguage as Language);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  // Save language preference
  const setLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const t = getTranslations(language);

  if (isLoading) {
    // Provide minimal context during loading to prevent crashes
    const fallbackTranslations = new Proxy({}, {
      get: () => new Proxy({}, {
        get: () => ''
      })
    });
    
    const defaultContext = {
      language: 'en' as Language,
      setLanguage: () => {},
      t: fallbackTranslations as any,
    };
    return (
      <LanguageContext.Provider value={defaultContext}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return default values instead of throwing error to prevent crashes
    console.warn('useLanguage must be used within a LanguageProvider. Using default values.');
    
    // Create a fallback translation object that returns empty strings for any access
    const fallbackTranslations = new Proxy({}, {
      get: () => new Proxy({}, {
        get: () => ''
      })
    });
    
    return {
      language: 'en',
      setLanguage: () => {},
      t: fallbackTranslations as any,
    };
  }
  return context;
};