// API URLs
export const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL || 'https://api.saleor.io/graphql/';

// Available regions with their configurations
export const REGIONS = {
  UK: {
    name: 'United Kingdom',
    code: 'UK',
    domain: 'uk.domain.com',
    currency: 'GBP',
    languageCode: 'EN',
    isDefault: true
  },
  NL: {
    name: 'Netherlands',
    code: 'NL',
    domain: 'nl.domain.com',
    currency: 'EUR',
    languageCode: 'NL',
    isDefault: false
  },
  BE: {
    name: 'Belgium',
    code: 'BE',
    domain: 'be.domain.com',
    currency: 'EUR',
    languageCode: 'NL',
    isDefault: false
  },
  DE: {
    name: 'Germany',
    code: 'DE',
    domain: 'de.domain.com',
    currency: 'EUR',
    languageCode: 'DE',
    isDefault: false
  },
  FR: {
    name: 'France',
    code: 'FR',
    domain: 'fr.domain.com',
    currency: 'EUR',
    languageCode: 'FR',
    isDefault: false
  }
};

// Available languages
export const LANGUAGES = {
  EN: {
    name: 'English',
    code: 'EN',
    locale: 'en-GB',
    isDefault: true
  },
  NL: {
    name: 'Dutch',
    code: 'NL',
    locale: 'nl-NL',
    isDefault: false
  },
  DE: {
    name: 'German',
    code: 'DE',
    locale: 'de-DE',
    isDefault: false
  },
  FR: {
    name: 'French',
    code: 'FR',
    locale: 'fr-FR',
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
export const DEFAULT_REGION_CODE = 'UK'; 