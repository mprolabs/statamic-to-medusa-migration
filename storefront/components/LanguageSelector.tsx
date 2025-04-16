'use client';

import { Fragment, useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { LanguageIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
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
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <LanguageIcon className="w-5 h-5 mr-2 text-gray-400" aria-hidden="true" />
          <span>{currentLanguageObj.name}</span>
          <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((language) => (
              <Menu.Item key={language.code}>
                {({ active }: { active: boolean }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } ${
                      currentLanguage === language.code ? 'bg-gray-50' : ''
                    } group flex items-center px-4 py-2 text-sm w-full text-left`}
                    onClick={() => handleLanguageChange(language.code)}
                  >
                    <span className="flex-grow">{language.name}</span>
                    {currentLanguage === language.code && (
                      <CheckIcon className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
