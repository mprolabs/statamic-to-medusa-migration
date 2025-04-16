# Adapting Nimara's Multi-Region Support for Our Requirements

This document outlines the steps needed to adapt Nimara's built-in multi-region and multi-language capabilities to support our specific regions: Netherlands, Belgium, and Germany.

## Current Implementation

Nimara comes with built-in support for multiple regions and languages, but it's currently configured for:
- United Kingdom (GB) using English (en-GB)
- United States (US) using English (en-US)

We need to adapt this architecture to support:
- Netherlands (NL) using Dutch (nl-NL)
- Belgium (BE) using Dutch (nl-BE) and French (fr-BE)
- Germany (DE) using German (de-DE)

## Required Changes

### 1. Update Region Types and Configuration

First, we need to modify the region types and configuration files:

#### Update `src/regions/types.ts`:

```typescript
// Current
export const SUPPORTED_LANGUAGES = ["us", "gb"] as const;
export const SUPPORTED_LOCALES = ["en-GB", "en-US"] as const;
export const SUPPORTED_MARKETS = ["gb", "us"] as const;
export const SUPPORTED_CURRENCIES = ["USD", "GBP"] as const;

// Modified for our regions
export const SUPPORTED_LANGUAGES = ["nl", "de", "fr"] as const;
export const SUPPORTED_LOCALES = ["nl-NL", "nl-BE", "fr-BE", "de-DE"] as const;
export const DEFAULT_LOCALE = "nl-NL" as const;
export const SUPPORTED_MARKETS = ["nl", "be", "de"] as const;
export const SUPPORTED_CURRENCIES = ["EUR"] as const;
```

#### Update `src/regions/config.ts`:

```typescript
// Add our regions mapping
export const LOCALE_CHANNEL_MAP: Record<Locale, MarketId> = {
  "nl-NL": "nl",
  "nl-BE": "be",
  "fr-BE": "be",
  "de-DE": "de",
};

export const LANGUAGES = {
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
};

export const MARKETS = {
  NL: {
    id: "nl",
    name: "Netherlands",
    channel: "netherlands", // Must match Saleor channel ID
    currency: "EUR",
    countryCode: "NL",
    defaultLanguage: LANGUAGES.NL,
    supportedLanguages: [LANGUAGES.NL],
  },
  BE: {
    id: "be",
    name: "Belgium",
    channel: "belgium", // Must match Saleor channel ID
    currency: "EUR",
    countryCode: "BE",
    defaultLanguage: LANGUAGES.NL_BE,
    supportedLanguages: [LANGUAGES.NL_BE, LANGUAGES.FR],
  },
  DE: {
    id: "de",
    name: "Germany",
    channel: "germany", // Must match Saleor channel ID
    currency: "EUR",
    countryCode: "DE",
    defaultLanguage: LANGUAGES.DE,
    supportedLanguages: [LANGUAGES.DE],
  },
};
```

### 2. Update i18n Configuration

Configure Next.js internationalization and routing:

#### Update i18n configuration:

```typescript
// Modify the Next.js i18n configuration
const i18nConfig = {
  locales: ["nl-NL", "nl-BE", "fr-BE", "de-DE"],
  defaultLocale: "nl-NL",
  localeDetection: true,
  domains: [
    {
      domain: "nl.example.com",
      defaultLocale: "nl-NL",
    },
    {
      domain: "be.example.com",
      defaultLocale: "nl-BE",
    },
    {
      domain: "de.example.com",
      defaultLocale: "de-DE",
    },
  ],
};
```

### 3. Update Middleware for Domain-Based Detection

Modify the middleware to handle domain-based region detection:

```typescript
// Add domain to region mapping
const DOMAIN_TO_LOCALE = {
  "nl.example.com": "nl-NL",
  "be.example.com": "nl-BE", // Default for Belgium is Dutch
  "de.example.com": "de-DE",
};

// Adjust the middleware to detect region from domain
function getLocaleFromDomain(request: NextRequest) {
  const host = request.headers.get("host") || "";
  return DOMAIN_TO_LOCALE[host] || DEFAULT_LOCALE;
}
```

### 4. Update GraphQL Client Configuration

Configure the GraphQL client to use the correct channel based on the region:

```typescript
// src/lib/apollo.ts or similar
import { getCurrentRegion } from "@/regions/utils";

// Middleware or Apollo Link to add channel to each request
const channelMiddleware = new ApolloLink((operation, forward) => {
  const region = getCurrentRegion();
  const channel = region.market.channel;
  
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      'x-channel': channel,
    }
  }));
  
  return forward(operation);
});
```

### 5. Configure and Update Translation Files

Set up translation files for each language:

```
/messages
  /nl.json
  /fr.json
  /de.json
```

Example translation file (nl.json):
```json
{
  "common": {
    "home": "Startpagina",
    "products": "Producten",
    "cart": "Winkelwagen",
    "checkout": "Afrekenen"
  }
}
```

### 6. Saleor Channel Configuration

Ensure that the following channels are configured in Saleor:

1. `netherlands` - Channel for the Netherlands market
2. `belgium` - Channel for the Belgium market
3. `germany` - Channel for the German market

Each channel should have:
- Appropriate shipping zones
- Tax configurations
- Language-specific product information

## Implementation Plan

1. **Phase 1: Basic Configuration**
   - Update type definitions and configuration files
   - Configure Next.js i18n settings
   - Update middleware for domain detection

2. **Phase 2: GraphQL Integration**
   - Configure Apollo Client with region context
   - Update queries to include channel and language parameters
   - Test data fetching with region context

3. **Phase 3: Language Implementation**
   - Create translation files for all languages
   - Implement language switcher component
   - Test language switching functionality

4. **Phase 4: Testing**
   - Test region detection and switching
   - Verify correct content loading per region
   - Test language-specific URL structures
   - Validate SEO optimization for each language

5. **Phase 5: Deployment**
   - Configure domain-specific environments
   - Set up region-aware monitoring
   - Deploy with region-specific analytics

## Conclusion

By adapting Nimara's built-in multi-region capabilities, we can efficiently support our targeted regions and languages. The changes outlined above leverage Nimara's existing architecture while customizing it to our specific business requirements. 