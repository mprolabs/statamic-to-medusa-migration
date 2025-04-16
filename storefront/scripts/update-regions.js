#!/usr/bin/env node

/**
 * This script updates the region configuration files for our specific requirements
 * for the Netherlands, Belgium, and Germany.
 */

const fs = require('fs');
const path = require('path');

// Paths to the files we need to update
const TYPES_PATH = path.join(process.cwd(), 'apps/storefront/src/regions/types.ts');
const CONFIG_PATH = path.join(process.cwd(), 'apps/storefront/src/regions/config.ts');
const MESSAGES_DIR = path.join(process.cwd(), 'apps/storefront/messages');

// Update types.ts
const updateTypesFile = () => {
  console.log('Updating region types...');

  let content = fs.readFileSync(TYPES_PATH, 'utf8');

  // Update supported languages
  content = content.replace(
    /export const SUPPORTED_LANGUAGES = \["[^"]*"(?:, "[^"]*")*\] as const;/,
    'export const SUPPORTED_LANGUAGES = ["nl", "de", "fr"] as const;'
  );

  // Update supported locales
  content = content.replace(
    /export const SUPPORTED_LOCALES = \["[^"]*"(?:, "[^"]*")*\] as const;/,
    'export const SUPPORTED_LOCALES = ["nl-NL", "nl-BE", "fr-BE", "de-DE"] as const;'
  );

  // Update default locale
  content = content.replace(
    /export const DEFAULT_LOCALE = "[^"]*" as const;/,
    'export const DEFAULT_LOCALE = "nl-NL" as const;'
  );

  // Update supported markets
  content = content.replace(
    /export const SUPPORTED_MARKETS = \["[^"]*"(?:, "[^"]*")*\] as const;/,
    'export const SUPPORTED_MARKETS = ["nl", "be", "de"] as const;'
  );

  // Update supported currencies
  content = content.replace(
    /export const SUPPORTED_CURRENCIES = \["[^"]*"(?:, "[^"]*")*\] as const;/,
    'export const SUPPORTED_CURRENCIES = ["EUR"] as const;'
  );

  fs.writeFileSync(TYPES_PATH, content);
  console.log('Region types updated successfully.');
};

// Update config.ts
const updateConfigFile = () => {
  console.log('Updating region configuration...');

  // Define the new configuration
  const newLocaleChannelMap = `export const LOCALE_CHANNEL_MAP: Record<
  Locale,
  MarketId
> = {
  "nl-NL": "nl",
  "nl-BE": "be",
  "fr-BE": "be",
  "de-DE": "de",
};`;

  const newLanguages = `export const LANGUAGES = {
  NL: {
    id: "nl",
    name: "Dutch",
    code: "NL",
    locale: "nl-NL",
  },
  NL_BE: {
    id: "nl",
    name: "Dutch (Belgium)",
    code: "NL",
    locale: "nl-BE",
  },
  FR: {
    id: "fr",
    name: "French",
    code: "FR",
    locale: "fr-BE",
  },
  DE: {
    id: "de",
    name: "German",
    code: "DE",
    locale: "de-DE",
  },
} satisfies Record<string, Language>;`;

  const newMarkets = `export const MARKETS = {
  NL: {
    id: "nl",
    name: "Netherlands",
    channel: "netherlands",
    currency: "EUR",
    countryCode: "NL",
    defaultLanguage: LANGUAGES.NL,
    supportedLanguages: [LANGUAGES.NL],
  },
  BE: {
    id: "be",
    name: "Belgium",
    channel: "belgium",
    currency: "EUR",
    countryCode: "BE",
    defaultLanguage: LANGUAGES.NL_BE,
    supportedLanguages: [LANGUAGES.NL_BE, LANGUAGES.FR],
  },
  DE: {
    id: "de",
    name: "Germany",
    channel: "germany",
    currency: "EUR",
    countryCode: "DE",
    defaultLanguage: LANGUAGES.DE,
    supportedLanguages: [LANGUAGES.DE],
  },
} satisfies Record<string, Market>;`;

  let content = fs.readFileSync(CONFIG_PATH, 'utf8');

  // Replace the locale channel map
  content = content.replace(
    /export const LOCALE_CHANNEL_MAP[\s\S]*?};/,
    newLocaleChannelMap
  );

  // Replace the languages
  content = content.replace(
    /export const LANGUAGES[\s\S]*?satisfies Record<[^>]*>;/,
    newLanguages
  );

  // Replace the markets
  content = content.replace(
    /export const MARKETS[\s\S]*?satisfies Record<[^>]*>;/,
    newMarkets
  );

  fs.writeFileSync(CONFIG_PATH, content);
  console.log('Region configuration updated successfully.');
};

// Create translation files
const createTranslationFiles = () => {
  console.log('Creating translation files...');

  // Make sure the messages directory exists
  if (!fs.existsSync(MESSAGES_DIR)) {
    fs.mkdirSync(MESSAGES_DIR, { recursive: true });
  }

  // Dutch translations
  const nlTranslations = {
    "common": {
      "home": "Startpagina",
      "products": "Producten",
      "categories": "Categorieën",
      "cart": "Winkelwagen",
      "checkout": "Afrekenen",
      "account": "Account",
      "search": "Zoeken",
      "search_placeholder": "Zoek producten...",
      "menu": "Menu",
      "close": "Sluiten",
      "add_to_cart": "In winkelwagen",
      "view_details": "Bekijk details",
      "loading": "Laden...",
      "error": "Er is een fout opgetreden.",
      "try_again": "Probeer opnieuw",
      "footer": {
        "about": "Over ons",
        "contact": "Contact",
        "terms": "Voorwaarden",
        "privacy": "Privacy",
        "copyright": "© 2023 Onze Shop. Alle rechten voorbehouden."
      }
    }
  };

  // French translations
  const frTranslations = {
    "common": {
      "home": "Accueil",
      "products": "Produits",
      "categories": "Catégories",
      "cart": "Panier",
      "checkout": "Commander",
      "account": "Compte",
      "search": "Rechercher",
      "search_placeholder": "Rechercher des produits...",
      "menu": "Menu",
      "close": "Fermer",
      "add_to_cart": "Ajouter au panier",
      "view_details": "Voir les détails",
      "loading": "Chargement...",
      "error": "Une erreur s'est produite.",
      "try_again": "Réessayer",
      "footer": {
        "about": "À propos",
        "contact": "Contact",
        "terms": "Conditions",
        "privacy": "Confidentialité",
        "copyright": "© 2023 Notre Boutique. Tous droits réservés."
      }
    }
  };

  // German translations
  const deTranslations = {
    "common": {
      "home": "Startseite",
      "products": "Produkte",
      "categories": "Kategorien",
      "cart": "Warenkorb",
      "checkout": "Zur Kasse",
      "account": "Konto",
      "search": "Suchen",
      "search_placeholder": "Produkte suchen...",
      "menu": "Menü",
      "close": "Schließen",
      "add_to_cart": "In den Warenkorb",
      "view_details": "Details anzeigen",
      "loading": "Wird geladen...",
      "error": "Ein Fehler ist aufgetreten.",
      "try_again": "Erneut versuchen",
      "footer": {
        "about": "Über uns",
        "contact": "Kontakt",
        "terms": "AGB",
        "privacy": "Datenschutz",
        "copyright": "© 2023 Unser Shop. Alle Rechte vorbehalten."
      }
    }
  };

  // Write translation files
  fs.writeFileSync(path.join(MESSAGES_DIR, 'nl.json'), JSON.stringify(nlTranslations, null, 2));
  fs.writeFileSync(path.join(MESSAGES_DIR, 'fr.json'), JSON.stringify(frTranslations, null, 2));
  fs.writeFileSync(path.join(MESSAGES_DIR, 'de.json'), JSON.stringify(deTranslations, null, 2));

  console.log('Translation files created successfully.');
};

// Run the script
try {
  updateTypesFile();
  updateConfigFile();
  createTranslationFiles();
  console.log('Region configuration update complete!');
} catch (error) {
  console.error('Error updating region configuration:', error);
  process.exit(1);
}
