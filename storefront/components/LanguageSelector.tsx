'use client';

import { useState, useEffect } from 'react';
import { Languages } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../packages/ui/src/components/select';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, STORAGE_KEYS } from '../lib/constants';
import { setLocale } from '../lib/graphql/client';

export default function LanguageSelector() {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    // Check for language in localStorage when component mounts
    const storedLanguage = typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEYS.LANGUAGE)
      : null;

    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
    }
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    // Set the new language in localStorage and update state
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, languageCode);
    setCurrentLanguage(languageCode);

    // Get current region to pass with the language change
    const currentRegion = typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEYS.REGION) || DEFAULT_LANGUAGE
      : DEFAULT_LANGUAGE;

    // Update the locale in the GraphQL client which will trigger a page reload
    setLocale(currentRegion, languageCode);
  };

  // Find the current language object
  const currentLanguageObj = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage)
    || SUPPORTED_LANGUAGES.find(lang => lang.code === DEFAULT_LANGUAGE)
    || SUPPORTED_LANGUAGES[0];

  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[130px] bg-white border border-gray-200">
        <span className="flex items-center">
          <Languages className="w-4 h-4 mr-2 text-gray-500" aria-hidden="true" />
          <SelectValue placeholder={currentLanguageObj.name} />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Select Language</SelectLabel>
          {SUPPORTED_LANGUAGES.map((language) => (
            <SelectItem
              key={language.code}
              value={language.code}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <span>{language.localName || language.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
