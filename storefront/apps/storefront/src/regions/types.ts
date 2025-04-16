import {
  type CountryCode,
  type LanguageCodeEnum,
} from "@nimara/codegen/schema";

/**
 * Defines available languages in the App.
 */
export const SUPPORTED_LANGUAGES = ["nl", "de", "fr"] as const;
export type LanguageId = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Defines supported locales in the App.
 */
export const SUPPORTED_LOCALES = ["nl-NL", "nl-BE", "fr-BE", "de-DE"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE = "nl-NL" as const;

/**
 * Defines available markets in the App.
 */
export const SUPPORTED_MARKETS = ["nl", "be", "de"] as const;
export type MarketId = (typeof SUPPORTED_MARKETS)[number];

/**
 * Defines supported currencies in the App.
 */
export const SUPPORTED_CURRENCIES = ["EUR"] as const;
export type CurrencyId = (typeof SUPPORTED_CURRENCIES)[number];

export type Market = {
  channel: string;
  countryCode: CountryCode;
  currency: CurrencyId;
  defaultLanguage: Language;
  id: MarketId;
  name: string;
  supportedLanguages: Language[];
};

export type Language = {
  code: LanguageCodeEnum;
  id: LanguageId;
  locale: Locale;
  name: string;
};

export type Region = {
  language: Language;
  market: Market;
};
