'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRegion } from './RegionContext';

export type Language = {
  code: string;
  name: string;
  localName: string;
};

// Available languages
const LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    localName: 'English',
  },
  {
    code: 'nl',
    name: 'Dutch',
    localName: 'Nederlands',
  },
  {
    code: 'fr',
    name: 'French',
    localName: 'Français',
  },
  {
    code: 'de',
    name: 'German',
    localName: 'Deutsch',
  },
];

interface LanguageContextType {
  currentLanguage: Language;
  availableLanguages: Language[];
  setLanguage: (languageCode: string) => void;
  getLanguageByCode: (code: string) => Language;
}

const defaultLanguage = LANGUAGES[0]; // English

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: defaultLanguage,
  availableLanguages: [],
  setLanguage: () => {},
  getLanguageByCode: () => defaultLanguage,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentRegion } = useRegion();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(defaultLanguage);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);

  const getLanguageByCode = (code: string): Language => {
    const foundLanguage = LANGUAGES.find((lang) => lang.code === code);
    return foundLanguage || defaultLanguage;
  };

  // Update available languages when region changes
  useEffect(() => {
    if (currentRegion) {
      // Filter available languages based on region
      const regionLanguages = currentRegion.availableLanguages
        .map(code => getLanguageByCode(code))
        .filter(Boolean);
      
      setAvailableLanguages(regionLanguages);
      
      // Set default language for region
      const regionDefaultLanguage = getLanguageByCode(currentRegion.defaultLanguage);
      setCurrentLanguage(regionDefaultLanguage);
    }
  }, [currentRegion]);

  useEffect(() => {
    // Check for language preference in localStorage or URL
    if (typeof window !== 'undefined') {
      // Check URL for language parameter, e.g. /?lang=nl
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      
      if (langParam && currentRegion.availableLanguages.includes(langParam)) {
        setCurrentLanguage(getLanguageByCode(langParam));
        return;
      }
      
      // Check localStorage
      const storedLang = localStorage.getItem('selectedLanguage');
      if (storedLang && currentRegion.availableLanguages.includes(storedLang)) {
        setCurrentLanguage(getLanguageByCode(storedLang));
        return;
      }
      
      // Check browser language
      const browserLang = navigator.language.split('-')[0];
      if (browserLang && currentRegion.availableLanguages.includes(browserLang)) {
        setCurrentLanguage(getLanguageByCode(browserLang));
      }
    }
  }, [currentRegion]);

  const setLanguage = (languageCode: string) => {
    // Only set if language is available for current region
    if (currentRegion.availableLanguages.includes(languageCode)) {
      const newLanguage = getLanguageByCode(languageCode);
      setCurrentLanguage(newLanguage);
      
      // Store preference in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedLanguage', languageCode);
      }
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        availableLanguages,
        setLanguage,
        getLanguageByCode,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}; 