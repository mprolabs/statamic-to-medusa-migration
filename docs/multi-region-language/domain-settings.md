---
title: Domain & Channel Settings
parent: Multi-Region & Language
nav_order: 3
---

# Domain & Channel Settings

This page details the configuration of domains and their mapping to Saleor Channels to manage the multi-region storefronts.

## Domain Strategy

*   **Netherlands:** `mprolabs.nl`
*   **Belgium:** `mprolabs.be`
*   **Germany:** `mprolabs.de`

## Saleor Channel Configuration

Three distinct channels will be configured in Saleor:

1.  **`channel-nl`**
    *   **Name:** Netherlands Storefront
    *   **Slug:** `channel-nl`
    *   **Currency:** EUR
    *   **Market Association:** Linked to the "Netherlands" market.
    *   **Active:** True
    *   *(Other settings as needed)*
2.  **`channel-be`**
    *   **Name:** Belgium Storefront
    *   **Slug:** `channel-be`
    *   **Currency:** EUR
    *   **Market Association:** Linked to the "Belgium" market.
    *   **Active:** True
    *   *(Other settings as needed)*
3.  **`channel-de`**
    *   **Name:** Germany Storefront
    *   **Slug:** `channel-de`
    *   **Currency:** EUR
    *   **Market Association:** Linked to the "Germany" market.
    *   **Active:** True
    *   *(Other settings as needed)*

## Frontend (Next.js) Implementation

*   **Domain Detection:** The Next.js application needs to reliably detect the domain from which it's being accessed (e.g., via `request.headers.host` in middleware or server-side rendering).
*   **Channel Mapping:** Implement a mapping (e.g., an environment variable or configuration object) that links each domain to its corresponding Saleor channel slug:
    *   `mprolabs.nl` -> `channel-nl`
    *   `mprolabs.be` -> `channel-be`
    *   `mprolabs.de` -> `channel-de`
*   **API Context:** Use the detected channel slug in all GraphQL requests to Saleor to ensure the correct context (pricing, products, market settings) is applied. This is typically done by passing the `channel` parameter in the API client headers or query variables.

## Deployment & DNS

*   **Hosting:** The Next.js application will be deployed (e.g., on Vercel, Netlify, or self-hosted).
*   **DNS Configuration:**
    *   Configure DNS records (A or CNAME) for `mprolabs.nl`, `mprolabs.be`, and `mprolabs.de` to point to the deployed Next.js application.
    *   Ensure the hosting platform is configured to handle these custom domains.

## Workflow

1.  **Configure Saleor Channels:** Create the three channels in the Saleor dashboard or via API.
2.  **Configure Saleor Markets:** Ensure markets exist and are correctly linked to currencies and the new channels.
3.  **Implement Frontend Domain/Channel Logic:** Add code to Next.js to detect the domain and select the corresponding channel slug.
4.  **Update Frontend API Client:** Ensure the channel slug is passed in all Saleor API requests.
5.  **Configure DNS:** Point the domains to the hosting provider.
6.  **Configure Hosting:** Add custom domains to the hosting platform project settings.
7.  **Testing:** Access each domain and verify that channel-specific content, pricing, and settings are correctly displayed.

*(Add specific implementation details for domain detection and API client configuration)* 