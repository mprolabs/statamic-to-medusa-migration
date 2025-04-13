# Strapi CMS Data Model Schema

This document outlines the core data models for the Strapi CMS implementation, focusing on content management with multi-region and multi-language support to complement our Medusa.js e-commerce system.

## Core Content Types

### Pages

Pages represent static content pages on the website.

```typescript
interface Page {
  id: number;
  title: string;            // Translatable
  slug: string;             // URL slug
  content: string;          // Rich text content (Translatable)
  seo: {
    metaTitle: string;      // Translatable
    metaDescription: string; // Translatable
    metaImage: Media;
  };
  layout: "default" | "wide" | "landing";
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  locale: string;           // Primary locale
  localizations: Page[];    // References to other locale versions
  metadata: {
    statamic_id?: string;   // Original Statamic ID
    region_availability?: string[]; // Regions where this page is available (nl, be, de)
  };
}
```

### Blog Posts

Blog content for marketing and customer engagement.

```typescript
interface BlogPost {
  id: number;
  title: string;            // Translatable
  slug: string;             // URL slug
  summary: string;          // Short summary (Translatable)
  content: string;          // Rich text content (Translatable)
  featuredImage: Media;
  author: Author;
  categories: Category[];
  tags: Tag[];
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  locale: string;           // Primary locale
  localizations: BlogPost[]; // References to other locale versions
  metadata: {
    statamic_id?: string;   // Original Statamic ID
    region_availability?: string[]; // Regions where this post is available (nl, be, de)
  };
}
```

### Navigation

Navigation menu structures for the website.

```typescript
interface Navigation {
  id: number;
  name: string;             // e.g., "Main Menu", "Footer Menu"
  items: NavigationItem[];
  locale: string;           // Primary locale
  localizations: Navigation[]; // References to other locale versions
  metadata: {
    region_key?: string;    // Region this navigation belongs to (nl, be, de)
  };
}

interface NavigationItem {
  id: number;
  title: string;            // Translatable
  url: string | null;       // External URL if applicable
  type: "internal" | "external" | "dropdown";
  page: Page | null;        // Reference to internal page
  parent: NavigationItem | null; // Parent item for nested structures
  order: number;            // Display order
  children: NavigationItem[]; // Child items for dropdowns
  openInNewTab: boolean;    // Whether to open in new tab
  locale: string;           // Primary locale
  localizations: NavigationItem[]; // References to other locale versions
}
```

### Media Library

Media assets for use across content types.

```typescript
interface Media {
  id: number;
  name: string;
  alternativeText: string;  // Translatable
  caption: string;          // Translatable
  width: number;
  height: number;
  formats: {
    thumbnail: MediaFormat;
    small: MediaFormat;
    medium: MediaFormat;
    large: MediaFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    statamic_asset_id?: string; // Original Statamic asset ID
  };
}

interface MediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}
```

### Product Content

Extended product content that complements Medusa.js product data.

```typescript
interface ProductContent {
  id: number;
  productId: string;        // Medusa.js product ID
  extendedDescription: string; // Detailed product description (Translatable)
  specifications: ProductSpecification[];
  faq: FAQ[];
  relatedContent: {
    blogPosts: BlogPost[];
    pages: Page[];
  };
  createdAt: Date;
  updatedAt: Date;
  locale: string;           // Primary locale
  localizations: ProductContent[]; // References to other locale versions
  metadata: {
    statamic_product_id?: string; // Original Statamic product ID
  };
}

interface ProductSpecification {
  id: number;
  name: string;             // Translatable
  value: string;            // Translatable
}

interface FAQ {
  id: number;
  question: string;         // Translatable
  answer: string;           // Translatable
}
```

### Region-Specific Content

Content blocks specific to certain regions.

```typescript
interface RegionContent {
  id: number;
  name: string;
  identifier: string;       // Unique identifier for this content block
  content: string;          // Rich text content (Translatable)
  region: string;           // Region code (nl, be, de)
  createdAt: Date;
  updatedAt: Date;
  locale: string;           // Primary locale
  localizations: RegionContent[]; // References to other locale versions
}
```

## Multi-Region Implementation

### Region Configuration

Strapi will manage region-specific content through:

1. **Content availability flags** - Marking content as available in specific regions
2. **Region-specific content types** - For content that only applies to certain regions
3. **URL structure considerations** - Managing content with region-specific URLs

```typescript
const regionConfig = [
  {
    code: "nl",
    name: "Netherlands",
    domain: "example.nl",
    defaultLocale: "nl"
  },
  {
    code: "be",
    name: "Belgium",
    domain: "example.be",
    defaultLocale: "nl" // Dutch is default for Belgium
  },
  {
    code: "de",
    name: "Germany",
    domain: "example.de",
    defaultLocale: "de"
  }
];
```

## Multi-Language Implementation

Strapi has built-in internationalization capabilities:

### Configured Languages

```typescript
const supportedLocales = [
  {
    code: "nl",
    name: "Dutch",
    isDefault: true
  },
  {
    code: "de",
    name: "German",
    isDefault: false
  }
];
```

### Implementation Details

1. **Locale-specific entries** - Content entries exist in multiple locales
2. **Localization relations** - Content in different locales is linked
3. **Default locale fallback** - When content is missing in a locale, fallback to default
4. **Locale routing** - API can filter content by locale

## Integration with Medusa.js

### Reference Model

To maintain consistency between Strapi and Medusa.js:

```typescript
interface MedusaReference {
  id: number;
  medusaId: string;         // ID of the entity in Medusa.js
  medusaType: "product" | "collection" | "region" | "order";
  strapiId: number;         // ID of the related entity in Strapi
  strapiType: string;       // Content type in Strapi
  createdAt: Date;
  updatedAt: Date;
}
```

### Integration Points

1. **Product content expansion** - Strapi manages additional product content not in Medusa.js
2. **Region-specific content** - Strapi handles content that varies by region
3. **Shared media library** - Strapi manages media used by both content and products
4. **Marketing content** - Strapi manages blog posts and promotional content

## Migration Considerations

When migrating from Statamic to Strapi, consider the following:

1. **Collection mapping** - Map Statamic collections to Strapi content types
2. **Blueprint mapping** - Convert Statamic blueprints to Strapi content type schemas
3. **Asset migration** - Transfer media assets with proper metadata and organization
4. **Multi-language content** - Ensure translated content maintains proper relationships
5. **URL structures** - Maintain SEO by preserving URL structures
6. **Custom fields** - Map Statamic custom fields to Strapi components or custom fields
7. **User permissions** - Recreate appropriate user roles and permissions

## Customizations

The Strapi implementation will include:

1. **Custom plugins** - For specialized functionality like region management
2. **Custom API endpoints** - For integration with Medusa.js and the frontend
3. **Custom components** - For reusable content structures
4. **Webhook integrations** - For real-time synchronization with Medusa.js 