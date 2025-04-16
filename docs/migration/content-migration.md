---
title: Content Migration
parent: Migration
nav_order: 4
has_toc: true
has_children: true
multilang_export: true
permalink: /migration/content-migration/
---

# Content Migration

This section focuses specifically on migrating non-ecommerce content (like blog posts, informational pages, etc.) from Statamic to the chosen content solution integrated with Saleor (likely a headless CMS like Strapi, Contentful, or potentially Saleor's own page/attribute features if sufficient).

## Key Considerations

*   **CMS Choice:** Confirming the target CMS if different from Saleor's core features.
*   **Content Types:** Mapping Statamic Blueprints/Collections to content models in the target CMS.
*   **Rich Text:** Handling migration of complex content structures (e.g., Statamic Bard fields).
*   **Assets/Media:** Migrating images, videos, and other files associated with content.
*   **Internal Linking:** Updating links within content to reflect the new site structure.

## Process

1.  **Finalize Target CMS & Models:** Define content structures in the target CMS.
2.  **Analyze Statamic Content:** Inventory all content types, fields, and assets.
3.  **Develop ETL Scripts:**
    *   **Extract:** Export content and assets from Statamic.
    *   **Transform:** Convert rich text formats, update asset paths, adjust field mappings.
    *   **Load:** Import content and assets into the target CMS via its API.
4.  **Asset Migration:** Upload media files to the appropriate storage (e.g., S3, target CMS media library) and update references.
5.  **Link Updates:** Implement logic to update internal links post-migration.
6.  **Testing & Validation:** Verify content rendering, asset display, and link integrity.

*(Add specific script details, chosen CMS integration notes, and challenges)* 