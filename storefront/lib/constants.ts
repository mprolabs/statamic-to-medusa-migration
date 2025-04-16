// API URLs
export const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL || 'https://demo.saleor.io/graphql/';

// Available regions with their configurations
export const REGIONS = {
  NL: {
    name: 'Netherlands',
    code: 'NL',
    domain: 'nl.example.com',
    currency: 'EUR',
    languageCode: 'NL',
    isDefault: true
  },
  BE: {
    name: 'Belgium',
    code: 'BE',
    domain: 'be.example.com',
    currency: 'EUR',
    languageCode: 'NL',
    isDefault: false
  },
  DE: {
    name: 'Germany',
    code: 'DE',
    domain: 'de.example.com',
    currency: 'EUR',
    languageCode: 'DE',
    isDefault: false
  }
};

// Available languages
export const LANGUAGES = {
  NL: {
    name: 'Dutch',
    code: 'NL',
    locale: 'nl-NL',
    isDefault: true
  },
  FR: {
    name: 'French',
    code: 'FR',
    locale: 'fr-BE',
    isDefault: false
  },
  DE: {
    name: 'German',
    code: 'DE',
    locale: 'de-DE',
    isDefault: false
  }
};

// Product list pagination
export const PRODUCTS_PER_PAGE = 12;

// Image sizes and quality
export const IMAGE_SIZES = {
  thumbnail: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 },
};

// Default region code
export const DEFAULT_REGION_CODE = 'NL';

// Region definitions
export interface Region {
  code: string;
  name: string;
  flag: string;
  currency: string;
  channelSlug: string;
}

// Language definitions
export interface Language {
  code: string;
  name: string;
  localName?: string;
}

// Supported regions with their display information and channel slugs
export const SUPPORTED_REGIONS: Region[] = [
  {
    code: 'us',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    channelSlug: 'us-channel'
  },
  {
    code: 'eu',
    name: 'Europe',
    flag: '🇪🇺',
    currency: 'EUR',
    channelSlug: 'eu-channel'
  },
  {
    code: 'uk',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    channelSlug: 'uk-channel'
  }
];

// Supported languages with their display information
export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
  },
  {
    code: 'nl',
    name: 'Dutch',
    localName: 'Nederlands'
  },
  {
    code: 'de',
    name: 'German',
    localName: 'Deutsch'
  },
  {
    code: 'fr',
    name: 'French',
    localName: 'Français'
  },
  {
    code: 'es',
    name: 'Spanish',
    localName: 'Español'
  }
];

// Default values
export const DEFAULT_REGION = 'us';
export const DEFAULT_LANGUAGE = 'en';

// API endpoints and configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://demo.saleor.io/graphql/';
export const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';

// Pagination defaults
export const DEFAULT_PRODUCTS_PER_PAGE = 12;
export const MAX_PRODUCTS_PER_PAGE = 24;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'saleor.auth.token',
  REGION: 'saleor.region',
  LANGUAGE: 'saleor.language',
  CART_ID: 'saleor.cart.id'
};

// Nimara specific constants
export const NIMARA_VERSION = '1.0.0';

// Breakpoints for responsive design
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};
