import { createI18n } from 'next-international'

export type Locale = 'en' | 'nl'

export const defaultLocale: Locale = 'en'

export const locales: Locale[] = ['en', 'nl']

export const i18n = createI18n({
  locales,
  defaultLocale,
})

export const getI18n = i18n.getI18n
export const getScopedI18n = i18n.getScopedI18n
export const getCurrentLocale = i18n.getCurrentLocale

// Helper to get the language code for GraphQL queries
export const getLanguageCodeFromLocale = (locale: Locale): string => {
  switch (locale) {
    case 'en':
      return 'EN'
    case 'nl':
      return 'NL'
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
