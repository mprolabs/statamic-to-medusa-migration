---
title: Multi-Language Strategy
parent: Multi-Region & Language
nav_order: 1
---

# Multi-Language Strategy

This page describes how multi-language support will be implemented across Saleor and the frontend for the different regions (NL, BE, DE).

## Saleor Configuration

*   **Languages:** Configure supported languages in Saleor settings (e.g., `en`, `nl`, `fr`, `de`).
*   **Attribute Translation:** Utilize Saleor's built-in attribute translation capabilities for product names, descriptions, category names, etc. Define which attributes are translatable.
*   **Content Translation:** If using an external Headless CMS, leverage its localization features. If using Saleor's Page Types or Attributes for content, ensure these are set up for translation.
*   **Metadata Translation:** Ensure SEO metadata (meta titles, descriptions) can be translated.

## Frontend Implementation (Next.js)

*   **Routing:** Implement locale-based routing. Options include:
    *   **Subpath Routing:** `example.com/nl/product`, `example.com/de/product` (Recommended by Next.js i18n routing).
    *   **Domain Routing:** (Handled at the domain/channel level, but frontend still needs locale awareness).
*   **Locale Detection:** Implement logic to detect the user's preferred language (browser settings, user selection, geo-IP) and potentially redirect.
*   **Translation Library:** Use a library like `next-intl` or `react-i18next` to manage UI string translations (buttons, labels, messages). Store translation files (e.g., JSON) appropriately.
*   **Fetching Translated Data:** Modify GraphQL queries to Saleor to request data in the currently active locale. Pass the appropriate `languageCode` enum (e.g., `NL`, `DE`, `FR`, `EN`).
*   **Language Switcher:** Implement a UI component allowing users to switch languages manually.
*   **CMS Integration:** Fetch translated content from the Headless CMS based on the active locale.

## Workflow

1.  **Define Translatable Fields:** Identify all product attributes, content elements, and UI strings requiring translation.
2.  **Setup Saleor Languages & Translations:** Configure languages and input initial translations via the Saleor Dashboard or API.
3.  **Setup CMS Localization:** Configure languages and content localization in the external CMS (if used).
4.  **Implement Frontend i18n:** Set up Next.js i18n routing, install/configure a translation library, create translation files.
5.  **Adapt Data Fetching:** Update API calls to fetch locale-specific data.
6.  **Build Language Switcher:** Create the UI component.
7.  **Testing:** Thoroughly test language switching, content display, and data fetching for all supported languages.

*(Add specific library choices, routing implementation details, and translation management processes)* 