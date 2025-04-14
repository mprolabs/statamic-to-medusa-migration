# Component Inventory

This document provides a detailed inventory of components in the system architecture for the Statamic to Saleor migration project.

## Saleor Core Components

| Component | Description | Key Features | Dependencies | API Exposure | 
|---|---|---|---|---|
| **Product Module** | Manages the product catalog | • Product CRUD<br>• Variant management<br>• Channel-specific pricing/availability<br>• Attributes, Collections | • PostgreSQL<br>• Media storage<br>• Search (optional) | GraphQL API | 
| **Checkout Module** | Handles shopping cart & checkout | • Cart creation/updates<br>• Multi-step checkout<br>• Address validation<br>• Shipping method selection | • Product Module<br>• Channel Module<br>• Shipping Module<br>• Payment Module | GraphQL API | 
| **Order Module** | Processes and manages orders | • Order creation & lifecycle<br>• Order history<br>• Fulfillment management<br>• Returns & refunds | • Checkout Module<br>• Customer Module<br>• Payment Module<br>• Shipping Module | GraphQL API | 
| **Payment Module** | Integrates with payment providers | • Multiple payment methods<br>• Channel-specific providers<br>• Payment processing<br>• Refund handling | • Order Module<br>• External gateways | GraphQL API / Webhooks | 
| **Shipping Module** | Manages shipping options | • Shipping method CRUD<br>• Channel-specific methods<br>• Shipping calculations<br>• Fulfillment integration | • Order Module<br>• Channel Module | GraphQL API | 
| **Customer Module** | Handles customer data | • Customer profiles<br>• Address management<br>• Order history<br>• Authentication (JWT) | • PostgreSQL<br>• Order Module | GraphQL API | 
| **Channel Module** | Manages region configurations | • Channel CRUD<br>• Region-specific settings<br>• Currency handling<br>• Tax configuration | • PostgreSQL<br>• Product Module | GraphQL API | 
| **Discount Module** | Manages promotions and discounts | • Discount/Voucher CRUD<br>• Promotion rules<br>• Channel-specific discounts<br>• Discount calculations | • Product Module<br>• Checkout Module | GraphQL API | 
| **Content Module** | Manages built-in content | • Product descriptions<br>• Category descriptions<br>• Page management<br>• Attribute translations | • PostgreSQL<br>• Translation Module | GraphQL API | 
| **Translation Module** | Handles multi-language content | • Translation storage<br>• Language management<br>• Fallback logic | • PostgreSQL<br>• All translatable models | GraphQL API | 
| **Permission Module** | Manages user roles & permissions | • Staff user CRUD<br>• Permission groups<br>• Fine-grained access control | • PostgreSQL<br>• Customer Module | GraphQL API | 
| **Webhook Module** | Handles event subscriptions | • Webhook CRUD<br>• Event delivery<br>• Retry mechanisms<br>• Security (HMAC) | • All event-emitting modules | GraphQL API | 

## Frontend Components (Next.js)

| Component | Description | Key Features | Dependencies | User Interface | 
|---|---|---|---|---| 
| **Routing System** | Handles URL patterns | • Region/language routing<br>• Dynamic routes<br>• SEO-friendly URLs<br>• Redirect handling | • Next.js Router<br>• i18n support | URL structure | 
| **Product Browser** | Displays product listings | • Product grid/list views<br>• Filtering (GraphQL)<br>• Sorting (GraphQL)<br>• Pagination | • Saleor GraphQL Client<br>• UI Components | `/products/*` routes | 
| **Product Detail** | Shows product information | • Variant selection<br>• Image gallery<br>• Add to cart<br>• Channel-specific info<br>• Translated content | • Saleor GraphQL Client<br>• UI Components | `/products/[slug]` route | 
| **Cart/Checkout Components** | Manages shopping experience | • Cart display<br>• Add/remove items<br>• Multi-step checkout<br>• Shipping/Payment selection | • Saleor GraphQL Client<br>• UI Components<br>• State Management | Cart sidebar & /checkout/* routes | 
| **CMS Components** | Renders Saleor content | • Page templates<br>• Product descriptions<br>• Category pages<br>• Language variants | • Saleor GraphQL Client<br>• UI Components | Various content routes | 
| **Authentication UI** | Handles user login | • Login form<br>• Registration<br>• Password reset<br>• Account management | • Saleor GraphQL Client<br>• Form Handling | `/account/*` routes | 
| **Region/Language Selector** | Switches between stores/languages | • Channel selection<br>• Language selection<br>• Currency display<br>• Preferences storage | • Local Storage<br>• Cookies<br>• UI Components | Header component | 
| **Search Interface** | Enables product search | • Search input<br>• Results display<br>• Filtering options<br>• Suggestions | • Saleor GraphQL Client<br>• Optional Search App | Search modal & page | 

## Data Migration Components

| Component | Description | Key Features | Dependencies | CLI Commands / API | 
|---|---|---|---|---| 
| **Extraction Scripts** | Extract data from Statamic | • Collection extractors<br>• Asset extractors<br>• User extractors<br>• Order extractors | • Statamic files<br>• Node.js / Python | `extract-*` | 
| **Transformation Logic** | Convert data to Saleor schema | • Schema mapping<br>• Data normalization<br>• Channel assignment<br>• i18n formatting | • Extracted data<br>• Saleor Schema | Custom scripts | 
| **Loading Scripts** | Import data to Saleor | • Saleor API importers (GraphQL)<br>• Media importers<br>• Relation rebuilders | • Transformed data<br>• Saleor GraphQL API | `import-*` (using GraphQL) | 
| **Validation Tools** | Ensure data integrity | • Data validators<br>• Consistency checks<br>• Error reporting<br>• Reconciliation tools | • Source data<br>• Imported data | `validate-*` | 

## Infrastructure Components

| Component | Description | Key Features | Dependencies | Management | 
|---|---|---|---|---| 
| **PostgreSQL (Saleor)** | Database for Saleor | • Data storage<br>• Transaction support<br>• Indexing<br>• Backup/restore | • Cloud infrastructure | Docker container / Managed Service | 
| **Redis** | Caching & Task Queue | • Session storage<br>• API caching<br>• Background tasks | • Cloud infrastructure | Docker container / Managed Service | 
| **Search Engine (Optional)** | External search | • Fast text search<br>• Faceted search<br>• Multi-language support | • Saleor Search App | Docker container or SaaS | 
| **CDN** | Content delivery network | • Asset caching<br>• Edge distribution<br>• Performance optimization<br>• Region-specific routing | • Static assets<br>• Media files | Cloud service | 
| **Media Storage** | Stores media assets | • Image storage<br>• Video storage<br>• Document storage<br>• Access control | • Cloud infrastructure | Cloud service (e.g., S3) | 
| **Monitoring & Logging** | System observability | • Performance metrics<br>• Error tracking<br>• Log aggregation<br>• Alerting | • Application metrics<br>• Log streams | ELK Stack, Prometheus/Grafana, Sentry | 

## API Gateway (Optional - often handled by K8s Ingress/Cloud LB)

| Component | Description | Key Features | Dependencies | Configuration | 
|---|---|---|---|---| 
| **Routing** | Direct API requests | • Path-based routing<br>• Service discovery<br>• Load balancing<br>• Health checks | • Backend services | Route definitions | 
| **Authentication** | Verify user identity | • JWT validation (passthrough)<br>• API key validation | • Saleor Auth | Middleware / Ingress rules | 
| **Rate Limiting** | Prevent API abuse | • Request quotas<br>• Throttling | • Redis/cache | Rate limit rules | 
| **Caching** | Improve performance | • Response caching | • Redis/cache | Cache policies | 

## Integration Points

| Integration | Connected Components | Interface Type | Data Flow | Authentication | 
|---|---|---|---|---| 
| **Frontend → Saleor API** | Next.js → Saleor | GraphQL API | Product data, cart/checkout operations, content | JWT / Public | 
| **External Service → Saleor** | Payment/Shipping/etc. → Saleor | Webhooks | Event notifications (e.g., payment confirmed) | HMAC Signature / Secrets | 
| **Saleor → External Service** | Saleor → Payment/Shipping/Fulfillment | API / Webhooks | Payment requests, fulfillment orders | API Key / Secrets | 
| **Search Indexing** | Saleor → Search Engine | API / Saleor App | Product data indexing | API Key | 

This component inventory reflects the Saleor-based architecture for the migration project. 