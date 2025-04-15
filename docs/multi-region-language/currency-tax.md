---
title: Currency, Pricing & Tax
parent: Multi-Region & Language
nav_order: 2
---

# Currency, Pricing & Tax Strategy

This document outlines how different currencies, pricing strategies, and tax rules will be managed for the various regions (Netherlands, Belgium, Germany) using Saleor's multi-channel and market features.

## Saleor Configuration

*   **Channels:** Define separate channels for each primary region/domain (e.g., `channel-nl`, `channel-be`, `channel-de`).
*   **Markets:**
    *   Create markets corresponding to the target countries (Netherlands, Belgium, Germany).
    *   Assign the appropriate channel(s) to each market.
    *   Configure the currency for each market (e.g., EUR for all).
*   **Price Lists / Channel Pricings:**
    *   Assign product prices per channel using `productChannelListingUpdate`. Prices will likely be in EUR for all channels but could differ if needed.
*   **Tax Configuration:**
    *   **Tax Classes:** Define tax classes in Saleor (e.g., "Standard VAT", "Reduced VAT", "VAT Exempt"). Assign these to products.
    *   **TaxJar/AvaTax Integration (or manual):** Configure Saleor's tax calculation.
        *   **Integration:** Use a tax app like TaxJar or AvaTax, configuring it with credentials and settings for each country. Saleor will delegate tax calculation.
        *   **Manual:** Configure tax rates directly within Saleor per country/region within the defined markets. This requires manually maintaining rates. (Integration is generally preferred for accuracy).
*   **Shipping Zones & Rates:**
    *   Create shipping zones for each country (NL, BE, DE).
    *   Assign the relevant market(s) to each shipping zone.
    *   Configure shipping methods and rates per zone (potentially price-based or weight-based). Rates will be in the market's currency (EUR).

## Frontend Implementation

*   **Channel Identification:** The frontend must identify the correct channel based on the domain (`mprolabs.nl`, `mprolabs.be`, `mprolabs.de`).
*   **API Calls:** All GraphQL queries/mutations must include the `channel` slug identified from the domain. Saleor will automatically filter products, apply channel-specific pricing, and use market context (linked via channel) for currency and tax calculations during checkout.
*   **Display:** Prices will be returned by Saleor in the correct currency (EUR) based on the channel/market context. The frontend simply displays these prices. Tax details (total tax, price breakdown) will be available from the checkout object calculated by Saleor.

## Workflow

1.  **Setup Channels:** Create `channel-nl`, `channel-be`, `channel-de`.
2.  **Setup Markets:** Create NL, BE, DE markets, assign channels, set currency to EUR.
3.  **Assign Prices:** Set product prices per channel via API or dashboard.
4.  **Configure Tax Classes:** Define necessary tax classes and assign them to products.
5.  **Setup Tax Calculation:** Integrate TaxJar/AvaTax or configure manual tax rates per market.
6.  **Setup Shipping Zones:** Create zones for NL, BE, DE, assign markets, define shipping methods/rates.
7.  **Implement Frontend Channel Logic:** Detect channel from domain.
8.  **Update Frontend API Calls:** Ensure all requests include the `channel` slug.
9.  **Testing:** Place test orders for each region, verifying pricing, currency, tax calculation, and shipping costs.

*(Add specific tax integration details and pricing strategies)* 