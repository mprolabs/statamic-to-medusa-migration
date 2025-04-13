---
layout: default
title: Strapi Content Models
description: Design of Strapi content models for the migration with multi-region and multi-language support
---

# Strapi Content Models

This document defines the content models for Strapi CMS to support the migration from Statamic with multi-region and multi-language capabilities. Strapi will primarily handle content-focused aspects of the site, while Medusa.js will manage commerce functionality.

## Multi-Site and Localization Configuration

Strapi provides built-in support for internationalization. We'll configure Strapi to support our required languages:

```javascript
// config/plugins.js
module.exports = {
  i18n: {
    enabled: true,
    defaultLocale: 'nl',
    locales: ['nl', 'de'],
  },
};
```

## Content Type: Page

General-purpose page content that will be accessible across regions:

```javascript
// api/page/content-types/page/schema.json
{
  "kind": "collectionType",
  "collectionName": "pages",
  "info": {
    "singularName": "page",
    "pluralName": "pages",
    "displayName": "Page",
    "description": "Create general static pages"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "content": {
      "type": "richtext",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "seo": {
      "type": "component",
      "repeatable": false,
      "component": "shared.seo",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "regions": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::region.region",
      "inversedBy": "pages"
    }
  }
}
```

## Content Type: Region

Region configuration to map to Medusa.js regions:

```javascript
// api/region/content-types/region/schema.json
{
  "kind": "collectionType",
  "collectionName": "regions",
  "info": {
    "singularName": "region",
    "pluralName": "regions",
    "displayName": "Region"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "code": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "domain": {
      "type": "string",
      "required": true
    },
    "defaultLocale": {
      "type": "string",
      "required": true
    },
    "pages": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::page.page",
      "mappedBy": "regions"
    },
    "blog_posts": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::blog-post.blog-post",
      "mappedBy": "regions"
    },
    "medusa_region_id": {
      "type": "string",
      "required": true,
      "unique": true
    }
  }
}
```

## Content Type: Blog Post

Blog content with multi-language and region-specific support:

```javascript
// api/blog-post/content-types/blog-post/schema.json
{
  "kind": "collectionType",
  "collectionName": "blog_posts",
  "info": {
    "singularName": "blog-post",
    "pluralName": "blog-posts",
    "displayName": "Blog Post"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "content": {
      "type": "richtext",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "excerpt": {
      "type": "text",
      "maxLength": 160,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "cover_image": {
      "type": "media",
      "multiple": false,
      "required": false,
      "allowedTypes": ["images"],
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "categories": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::category.category",
      "inversedBy": "blog_posts"
    },
    "seo": {
      "type": "component",
      "repeatable": false,
      "component": "shared.seo",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "regions": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::region.region",
      "inversedBy": "blog_posts"
    }
  }
}
```

## Content Type: Category

Categories for blog posts with multi-language support:

```javascript
// api/category/content-types/category/schema.json
{
  "kind": "collectionType",
  "collectionName": "categories",
  "info": {
    "singularName": "category",
    "pluralName": "categories",
    "displayName": "Category"
  },
  "options": {
    "draftAndPublish": false
  },
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "slug": {
      "type": "uid",
      "targetField": "name",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "description": {
      "type": "text",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "blog_posts": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::blog-post.blog-post",
      "mappedBy": "categories"
    }
  }
}
```

## Content Type: Product Content

Extended product content that complements Medusa.js product data:

```javascript
// api/product-content/content-types/product-content/schema.json
{
  "kind": "collectionType",
  "collectionName": "product_contents",
  "info": {
    "singularName": "product-content",
    "pluralName": "product-contents",
    "displayName": "Product Content"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  },
  "attributes": {
    "medusa_id": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "extended_description": {
      "type": "richtext",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "specifications": {
      "type": "component",
      "repeatable": true,
      "component": "product.specification",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "features": {
      "type": "component",
      "repeatable": true,
      "component": "product.feature",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "content_blocks": {
      "type": "dynamiczone",
      "components": [
        "blocks.text-block",
        "blocks.image-block",
        "blocks.quote-block",
        "blocks.video-block",
        "blocks.faq-block"
      ],
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "related_content": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::blog-post.blog-post"
    },
    "documents": {
      "type": "media",
      "multiple": true,
      "allowedTypes": ["files"],
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "seo": {
      "type": "component",
      "repeatable": false,
      "component": "shared.seo",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    }
  }
}
```

## Component: SEO

Reusable SEO component for all content types:

```javascript
// components/shared/seo.json
{
  "collectionName": "components_shared_seos",
  "info": {
    "displayName": "SEO",
    "description": "SEO metadata for content"
  },
  "options": {},
  "attributes": {
    "metaTitle": {
      "type": "string",
      "required": true,
      "maxLength": 60
    },
    "metaDescription": {
      "type": "text",
      "required": true,
      "maxLength": 160
    },
    "metaImage": {
      "allowedTypes": ["images"],
      "type": "media",
      "multiple": false
    },
    "keywords": {
      "type": "text"
    },
    "canonicalURL": {
      "type": "string"
    }
  }
}
```

## Component: Product Specification

Reusable component for product specifications:

```javascript
// components/product/specification.json
{
  "collectionName": "components_product_specifications",
  "info": {
    "displayName": "Specification",
    "description": "Product specification item"
  },
  "options": {},
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "value": {
      "type": "string",
      "required": true
    }
  }
}
```

## Component: Product Feature

Reusable component for product features:

```javascript
// components/product/feature.json
{
  "collectionName": "components_product_features",
  "info": {
    "displayName": "Feature",
    "description": "Product feature highlight"
  },
  "options": {},
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "description": {
      "type": "text"
    },
    "icon": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    }
  }
}
```

## Content Type: Navigation

Multi-region and multi-language navigation structure:

```javascript
// api/navigation/content-types/navigation/schema.json
{
  "kind": "collectionType",
  "collectionName": "navigations",
  "info": {
    "singularName": "navigation",
    "pluralName": "navigations",
    "displayName": "Navigation"
  },
  "options": {
    "draftAndPublish": false
  },
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "required": true
    },
    "items": {
      "type": "component",
      "repeatable": true,
      "component": "navigation.navigation-item",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "region": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::region.region"
    }
  }
}
```

## Component: Navigation Item

Nested navigation item structure:

```javascript
// components/navigation/navigation-item.json
{
  "collectionName": "components_navigation_items",
  "info": {
    "displayName": "Navigation Item",
    "description": "Navigation menu item"
  },
  "options": {},
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "url": {
      "type": "string"
    },
    "target": {
      "type": "enumeration",
      "enum": ["_self", "_blank"]
    },
    "children": {
      "type": "component",
      "repeatable": true,
      "component": "navigation.navigation-item"
    },
    "type": {
      "type": "enumeration",
      "enum": ["internal", "external", "product-category", "blog-category"]
    },
    "contentType": {
      "type": "string"
    },
    "contentId": {
      "type": "string"
    }
  }
}
```

## Next Steps

These Strapi content models will work in conjunction with the Medusa.js data models, with appropriate integration points to maintain consistency across both systems. The next step is to create the data mapping specifications to guide the migration from Statamic to this new architecture. 