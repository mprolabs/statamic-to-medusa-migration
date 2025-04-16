import { createI18n } from 'next-international'

export type Locale = 'en' | 'nl' | 'de'

export const defaultLocale: Locale = 'en'

export const locales: Locale[] = ['en', 'nl', 'de']

// Create the i18n instance
export const i18n = createI18n({
  en: () => import('./dictionaries/en.json'),
  nl: () => import('./dictionaries/nl.json'),
  de: () => import('./dictionaries/de.json'),
})

// Export the hooks
export const { useI18n, useScopedI18n, useCurrentLocale, useChangeLocale } = i18n

// Helper to get the language code for GraphQL queries
export const getLanguageCodeFromLocale = (locale: Locale): string => {
  switch (locale) {
    case 'en':
      return 'EN'
    case 'nl':
      return 'NL'
    case 'de':
      return 'DE'
    default:
      return 'EN'
  }
}

// Helper to get localized URL paths
export const getLocalizedPath = (path: string, locale: Locale): string => {
  if (locale === defaultLocale) {
    return path
  }

  // Remove leading slash if it exists
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  return `/${locale}${cleanPath ? `/${cleanPath}` : ''}`
}
