# Nimara E-commerce Implementation Guide

This guide outlines the steps for migrating to the Nimara e-commerce framework and configuring it to support our specific multi-region requirements for the Netherlands, Belgium, and Germany.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up the Nimara Repository](#setting-up-the-nimara-repository)
3. [Configuring the Environment](#configuring-the-environment)
4. [Adapting Multi-Region Support](#adapting-multi-region-support)
5. [Testing and Verification](#testing-and-verification)
6. [Deployment](#deployment)

## Prerequisites

Before starting the migration, ensure you have the following:

- Node.js version 18 or higher
- PNPM installed globally
- Access to the Saleor API with properly configured channels
- Permissions to the project repository

## Setting Up the Nimara Repository

We've already completed the initial step of setting up the Nimara repository:

1. The original storefront code has been renamed to `storefront-old`
2. The Nimara e-commerce repository has been cloned into the `storefront` directory
3. The repository structure has been documented in [`nimara-structure.md`](/Users/yasinboelhouwer/bolen-ana-pro/docs/nimara-structure.md)

## Configuring the Environment

To configure the environment:

1. The `.env.example` file has been copied to `.env` with the following configurations:
   - `NEXT_PUBLIC_DEFAULT_CHANNEL=netherlands`
   - `NEXT_PUBLIC_SALEOR_API_URL=https://demo.saleor.io/graphql/`
   - `NEXT_PUBLIC_DEFAULT_LOCALE=nl-NL`
   - Other required variables have been set with placeholder values

2. Dependencies have been installed using PNPM:
   ```bash
   cd /Users/yasinboelhouwer/bolen-ana-pro/storefront
   pnpm install
   ```

## Adapting Multi-Region Support

Nimara comes with built-in multi-region and multi-language support, but it's configured for the UK and US markets. We need to adapt it for our specific regions:

### Using the Update Script

We've created a script to automate the region configuration updates:

1. Execute the update script:
   ```bash
   cd /Users/yasinboelhouwer/bolen-ana-pro/storefront
   ./scripts/update-regions.js
   ```

2. The script performs the following changes:
   - Updates `src/regions/types.ts` with our supported languages, locales, markets, and currencies
   - Updates `src/regions/config.ts` with our market and language configurations
   - Creates translation files for Dutch, French, and German

### Manual Verification and Adjustment

After running the script, verify and adjust the following:

1. Check `src/regions/types.ts` to ensure it contains:
   - `SUPPORTED_LANGUAGES = ["nl", "de", "fr"]`
   - `SUPPORTED_LOCALES = ["nl-NL", "nl-BE", "fr-BE", "de-DE"]`
   - `DEFAULT_LOCALE = "nl-NL"`
   - `SUPPORTED_MARKETS = ["nl", "be", "de"]`
   - `SUPPORTED_CURRENCIES = ["EUR"]`

2. Examine `src/regions/config.ts` to confirm:
   - The `LOCALE_CHANNEL_MAP` maps locales to market IDs
   - The `LANGUAGES` object includes Dutch, French, and German
   - The `MARKETS` object includes Netherlands, Belgium, and Germany with correct channel mappings

3. Verify that translation files exist in the `messages` directory

### Updating the i18n Configuration

Update the Next.js i18n configuration in `next.config.js`:

```javascript
// Relevant portion of next.config.js
i18n: {
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
}
```

## Testing and Verification

After configuring Nimara for our multi-region requirements, perform the following tests:

1. **Basic Functionality Test**:
   ```bash
   pnpm run dev:storefront
   ```
   Access the site at `http://localhost:3000` and verify that the default language is Dutch.

2. **Region Detection Test**:
   - Add entries to your hosts file for testing domains:
     ```
     127.0.0.1 nl.example.com
     127.0.0.1 be.example.com
     127.0.0.1 de.example.com
     ```
   - Access the site via each of these domains and verify proper region and language detection

3. **Language Switching Test**:
   - Verify that the language switcher correctly displays available languages for each region
   - Test switching between languages and confirm that content updates accordingly

4. **GraphQL Query Test**:
   - Use the browser developer tools to inspect network requests
   - Verify that GraphQL queries include the correct channel parameter based on the region
   - Confirm that language-specific content is being loaded

## Deployment

To deploy the Nimara-based implementation:

1. Configure production environment variables:
   - Set appropriate API endpoints
   - Configure domain mappings
   - Set up authentication settings

2. Build the application:
   ```bash
   pnpm run build
   ```

3. Deploy to your hosting environment:
   - Configure domain routing for region-specific domains
   - Set up SSL certificates for all domains
   - Configure CDN settings for region-specific caching

4. Monitor post-deployment:
   - Verify region detection functionality
   - Test language switching in production
   - Check GraphQL query performance

## Conclusion

By following this guide, you should have successfully migrated to Nimara and configured it to support our multi-region requirements for the Netherlands, Belgium, and Germany. The implementation leverages Nimara's built-in capabilities while customizing them for our specific business needs.

Refer to the [`nimara-multi-region-adaptation.md`](/Users/yasinboelhouwer/bolen-ana-pro/docs/nimara-multi-region-adaptation.md) document for additional details on the adaptation of Nimara's multi-region support. 