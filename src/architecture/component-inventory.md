# Component Inventory

This document provides a detailed inventory of all components in the system architecture for the Statamic to Medusa.js migration project.

## Commerce Components (Medusa.js)

| Component | Description | Key Features | Dependencies | API Endpoints |
|-----------|-------------|--------------|--------------|---------------|
| **Product Service** | Manages the product catalog | • Product CRUD<br>• Variant management<br>• Region-specific pricing<br>• Inventory tracking | • PostgreSQL<br>• Media storage<br>• Search engine | `/products/*`<br>`/admin/products/*` |
| **Cart Service** | Handles shopping cart operations | • Cart creation/updates<br>• Region detection<br>• Price calculations<br>• Line item management | • Product Service<br>• Region Service<br>• Discount Service | `/carts/*` |
| **Order Service** | Processes and manages orders | • Order creation<br>• Order lifecycle<br>• Order history<br>• Region-specific flows | • Cart Service<br>• Customer Service<br>• Payment Service<br>• Shipping Service | `/orders/*`<br>`/admin/orders/*` |
| **Payment Service** | Integrates with payment providers | • Multiple payment methods<br>• Region-specific providers<br>• Payment processing<br>• Refund handling | • Order Service<br>• External payment gateways | `/payments/*` |
| **Shipping Service** | Manages shipping options | • Shipping method CRUD<br>• Region-specific methods<br>• Shipping calculations<br>• Fulfillment tracking | • Order Service<br>• Region Service | `/shipping/*`<br>`/admin/shipping/*` |
| **Customer Service** | Handles customer data | • Customer profiles<br>• Address management<br>• Order history<br>• Region-specific preferences | • PostgreSQL<br>• Auth Service | `/customers/*`<br>`/admin/customers/*` |
| **Region Service** | Manages region configurations | • Region CRUD<br>• Region-specific settings<br>• Currency handling<br>• Tax configuration | • PostgreSQL | `/regions/*`<br>`/admin/regions/*` |
| **Discount Service** | Manages promotions and discounts | • Discount CRUD<br>• Promotion rules<br>• Region-specific discounts<br>• Discount calculations | • Product Service<br>• Cart Service | `/discounts/*`<br>`/admin/discounts/*` |
| **Search Service** | Provides product search capabilities | • Text search<br>• Filtering<br>• Faceted search<br>• Multi-language support | • Product Service<br>• MeiliSearch/Algolia | `/products/search` |

## Content Management Components (Strapi)

| Component | Description | Key Features | Dependencies | API Endpoints |
|-----------|-------------|--------------|--------------|---------------|
| **Content Types Service** | Defines content structures | • Content type CRUD<br>• Field configuration<br>• Relations management<br>• Multi-language support | • PostgreSQL | `/content-types/*` |
| **Content API** | Provides content access | • Content CRUD<br>• Filtering<br>• Pagination<br>• Language variants | • Content Types Service<br>• Authentication | `/api/*` (REST)<br>`/graphql` |
| **Media Library** | Manages media assets | • Media upload/retrieval<br>• Image transformations<br>• Metadata management<br>• CDN integration | • S3/File storage<br>• Image processing | `/upload/*` |
| **i18n System** | Handles multi-language content | • Language configuration<br>• Translation management<br>• Default fallbacks<br>• Language detection | • Content Types Service | Integrated in Content API |
| **User Management** | Manages CMS users and permissions | • User CRUD<br>• Role-based access<br>• Permission management<br>• Authentication | • PostgreSQL<br>• Authentication | `/admin/users/*`<br>`/admin/roles/*` |
| **Workflows** | Manages content lifecycle | • Draft/publish workflows<br>• Review processes<br>• Scheduling<br>• Version history | • Content API<br>• User Management | `/admin/workflows/*` |

## Frontend Components (Next.js)

| Component | Description | Key Features | Dependencies | User Interface |
|-----------|-------------|--------------|--------------|---------------|
| **Routing System** | Handles URL patterns | • Region/language routing<br>• Dynamic routes<br>• SEO-friendly URLs<br>• Redirect handling | • Next.js Router<br>• i18n support | URL structure |
| **Product Browser** | Displays product listings | • Product grid/list views<br>• Filtering<br>• Sorting<br>• Pagination | • Medusa.js API Client<br>• UI Components | `/products/*` routes |
| **Product Detail** | Shows product information | • Variant selection<br>• Image gallery<br>• Add to cart<br>• Region-specific info | • Medusa.js API Client<br>• UI Components | `/products/[slug]` route |
| **Cart Components** | Manages shopping experience | • Cart display<br>• Add/remove items<br>• Update quantities<br>• Apply discounts | • Medusa.js API Client<br>• UI Components<br>• State Management | Cart sidebar & page |
| **Checkout Flow** | Guides purchase process | • Multi-step checkout<br>• Address collection<br>• Shipping selection<br>• Payment processing | • Medusa.js API Client<br>• UI Components<br>• Form Handling | `/checkout/*` routes |
| **CMS Components** | Renders content | • Page templates<br>• Blog posts<br>• Marketing content<br>• Language variants | • Strapi API Client<br>• UI Components | Various content routes |
| **Authentication UI** | Handles user login | • Login form<br>• Registration<br>• Password reset<br>• Account management | • Medusa.js API Client<br>• Form Handling | `/account/*` routes |
| **Region Selector** | Switches between stores | • Region selection<br>• Language selection<br>• Currency display<br>• Preferences storage | • Local Storage<br>• Cookies<br>• UI Components | Header component |
| **Search Interface** | Enables product search | • Search input<br>• Results display<br>• Filtering options<br>• Suggestions | • Medusa.js API Client<br>• UI Components | Search modal & page |

## Data Migration Components

| Component | Description | Key Features | Dependencies | CLI Commands |
|-----------|-------------|--------------|--------------|--------------|
| **Extraction Scripts** | Extract data from Statamic | • Collection extractors<br>• Asset extractors<br>• User extractors<br>• Order extractors | • Statamic files<br>• Node.js | `extract-collections`<br>`extract-assets`<br>`extract-users`<br>`extract-orders` |
| **Transformation Logic** | Convert data to target schema | • Schema mapping<br>• Data normalization<br>• Multi-region adaptation<br>• i18n formatting | • Extracted data<br>• Target schemas | `transform-products`<br>`transform-content`<br>`transform-users` |
| **Loading Scripts** | Import data to new systems | • Medusa.js importers<br>• Strapi importers<br>• Media importers<br>• Relation rebuilders | • Transformed data<br>• API clients | `import-products`<br>`import-content`<br>`import-users`<br>`import-media` |
| **Validation Tools** | Ensure data integrity | • Data validators<br>• Consistency checks<br>• Error reporting<br>• Reconciliation tools | • Source data<br>• Imported data | `validate-migration`<br>`verify-counts`<br>`check-relations` |

## Infrastructure Components

| Component | Description | Key Features | Dependencies | Management |
|-----------|-------------|--------------|--------------|------------|
| **PostgreSQL (Commerce)** | Database for Medusa.js | • Data storage<br>• Transaction support<br>• Indexing<br>• Backup/restore | • Cloud infrastructure | Docker container |
| **PostgreSQL (Content)** | Database for Strapi | • Content storage<br>• Relation management<br>• Full-text search<br>• Backup/restore | • Cloud infrastructure | Docker container |
| **MeiliSearch/Algolia** | Search engine | • Fast text search<br>• Faceted search<br>• Multi-language support<br>• Typo tolerance | • Product data feed | Docker container or SaaS |
| **CDN** | Content delivery network | • Asset caching<br>• Edge distribution<br>• Performance optimization<br>• Region-specific routing | • Static assets<br>• Media files | Cloud service |
| **S3/Media Storage** | Stores media assets | • Image storage<br>• Video storage<br>• Document storage<br>• Access control | • Cloud infrastructure | Cloud service |
| **Monitoring & Logging** | System observability | • Performance metrics<br>• Error tracking<br>• Log aggregation<br>• Alerting | • Application metrics<br>• Log streams | ELK Stack or similar |

## API Gateway

| Component | Description | Key Features | Dependencies | Configuration |
|-----------|-------------|--------------|--------------|---------------|
| **Routing** | Direct API requests | • Path-based routing<br>• Service discovery<br>• Load balancing<br>• Health checks | • Backend services | Route definitions |
| **Authentication** | Verify user identity | • JWT validation<br>• API key validation<br>• Session management<br>• Token refresh | • User database | Auth middleware |
| **Rate Limiting** | Prevent API abuse | • Request quotas<br>• Throttling<br>• IP-based limits<br>• User-based limits | • Redis/cache | Rate limit rules |
| **Caching** | Improve performance | • Response caching<br>• Cache invalidation<br>• TTL management<br>• Cache headers | • Redis/cache | Cache policies |
| **Transformation** | Adapt API formats | • Request transformation<br>• Response transformation<br>• Error normalization<br>• Version handling | • Transformation rules | Mapping definitions |

## Integration Points

| Integration | Connected Components | Interface Type | Data Flow | Authentication |
|-------------|----------------------|---------------|-----------|---------------|
| **Frontend → Commerce API** | Next.js → Medusa.js | REST API | Product data, cart operations, order processing | JWT / Session |
| **Frontend → Content API** | Next.js → Strapi | GraphQL / REST | Page content, marketing content, blog posts | JWT / Public API |
| **Content → Commerce** | Strapi → Medusa.js | REST API | Product-related content, promotions | API Key |
| **Commerce → Content** | Medusa.js → Strapi | REST API | Order notifications, customer events | API Key |
| **Search Indexing** | Medusa.js → Search Engine | API / Webhook | Product data indexing, content indexing | API Key |
| **Payment Processing** | Medusa.js → Payment Providers | API | Payment authorization, captures, refunds | API Key |
| **Shipping Integration** | Medusa.js → Shipping Providers | API | Shipping rates, tracking information | API Key |

## Environment-Specific Components

| Environment | Components | Purpose | Scale | Data |
|-------------|------------|---------|-------|------|
| **Development** | All components | Active development and testing | Minimal | Sample data |
| **Staging** | All components | Pre-production validation | Production-like | Production clone |
| **Production** | All components | Live customer traffic | Full scale | Production data |

This component inventory provides a comprehensive view of all the pieces that make up the system architecture for the Statamic to Medusa.js migration project, with a focus on multi-region and multi-language support. 