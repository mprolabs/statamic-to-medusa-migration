# Component Interfaces & Communication Patterns

This document outlines the interfaces and communication patterns between the components of the Statamic to Medusa.js/Strapi migration architecture. It defines how different systems interact with each other and the protocols they use for communication.

## Table of Contents

1. [API Interfaces](#api-interfaces)
2. [Data Synchronization Patterns](#data-synchronization-patterns)
3. [Event-Based Communication](#event-based-communication)
4. [Frontend Integration](#frontend-integration)
5. [Authentication & Authorization](#authentication--authorization)
6. [Error Handling & Resilience](#error-handling--resilience)

## API Interfaces

### Medusa.js API Endpoints

#### Admin API

| Endpoint Pattern | Description | Authentication |
|------------------|-------------|----------------|
| `/admin/products/*` | Product management operations | Admin JWT |
| `/admin/orders/*` | Order management operations | Admin JWT |
| `/admin/customers/*` | Customer management operations | Admin JWT |
| `/admin/regions/*` | Region management operations | Admin JWT |
| `/admin/settings/*` | System settings operations | Admin JWT |

#### Store API

| Endpoint Pattern | Description | Authentication |
|------------------|-------------|----------------|
| `/store/products/*` | Product browsing operations | Optional Customer JWT |
| `/store/carts/*` | Cart management operations | Cookie-based |
| `/store/customers/*` | Customer account operations | Customer JWT |
| `/store/orders/*` | Order history and creation | Customer JWT |
| `/store/regions/*` | Region-specific data | None |
| `/store/shipping/*` | Shipping options | None |

### Strapi API Endpoints

#### Admin API

| Endpoint Pattern | Description | Authentication |
|------------------|-------------|----------------|
| `/admin/content-types/*` | Content type management | Admin JWT |
| `/admin/content-manager/*` | Content management | Admin JWT |
| `/admin/upload/*` | Media uploads | Admin JWT |
| `/admin/users/*` | Admin user management | Admin JWT |

#### Content API

| Endpoint Pattern | Description | Authentication |
|------------------|-------------|----------------|
| `/api/:contentType` | List content entries | API Token |
| `/api/:contentType/:id` | Get single content entry | API Token |
| `/api/upload/files` | Access uploaded files | API Token |
| `/api/:contentType/filters` | Filter content entries | API Token |

### Integration Layer API

| Endpoint Pattern | Description | Authentication |
|------------------|-------------|----------------|
| `/sync/product/:id` | Synchronize product data | Internal API Key |
| `/sync/content/:id` | Synchronize CMS content | Internal API Key |
| `/webhooks/medusa/*` | Receive Medusa.js events | Webhook Secret |
| `/webhooks/strapi/*` | Receive Strapi events | Webhook Secret |
| `/cache/invalidate/*` | Invalidate cache entries | Internal API Key |

## Data Synchronization Patterns

### Product Data Synchronization

The product content will be split between Medusa.js (commercial data) and Strapi (enhanced content). The following diagram illustrates the synchronization pattern:

```
┌────────────────┐                  ┌────────────────┐
│                │                  │                │
│   Medusa.js    │                  │    Strapi      │
│   Product      │◄─────────────────┤    Product     │
│   Commercial   │  1. Reference ID │    Content     │
│   Data         │                  │    Data        │
│                │                  │                │
└───────┬────────┘                  └────────┬───────┘
        │                                    │
        │  2. Product Created/Updated        │  3. Content Created/Updated
        │     Event                          │     Event
        ▼                                    ▼
┌────────────────────────────────────────────────────┐
│                                                    │
│               Integration Layer                    │
│                                                    │
│  - Maps product IDs to content IDs                 │
│  - Synchronizes essential data                     │
│  - Maintains consistency                           │
│  - Triggers cache invalidation                     │
│                                                    │
└────────────────────────────┬───────────────────────┘
                             │
                             │  4. Data Sync Completed
                             │     Event
                             ▼
┌────────────────────────────────────────────────────┐
│                                                    │
│                  Next.js Frontend                  │
│                                                    │
│  - Receives update notification                    │
│  - Invalidates cached data                         │
│  - Re-fetches from both APIs as needed             │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Synchronization Processes

1. **Product Creation Flow**:
   - Product created in Medusa.js Admin
   - Integration layer notified via webhook
   - Integration layer creates placeholder in Strapi
   - Reference IDs stored in both systems

2. **Product Update Flow**:
   - Product updated in Medusa.js Admin
   - Integration layer notified via webhook
   - Essential data synchronized to Strapi (price, stock, etc.)
   - Cached data invalidated

3. **Content Update Flow**:
   - Enhanced content updated in Strapi
   - Integration layer notified via webhook
   - No updates to Medusa.js needed
   - Cached data invalidated

4. **Deletion Handling**:
   - Products marked as deleted in Medusa.js
   - Integration layer notified
   - Content in Strapi marked as unpublished
   - Proper 410 Gone responses configured

## Event-Based Communication

The architecture uses events for asynchronous communication between components:

### Medusa.js Events

| Event Type | Trigger | Consumers |
|------------|---------|-----------|
| `product.created` | New product creation | Integration Layer |
| `product.updated` | Product data changes | Integration Layer |
| `product.deleted` | Product deletion | Integration Layer |
| `order.placed` | New order | Notification Service, Analytics |
| `cart.created` | New shopping cart | Analytics |
| `cart.updated` | Cart modifications | Analytics |

### Strapi Events

| Event Type | Trigger | Consumers |
|------------|---------|-----------|
| `entry.create` | New content creation | Integration Layer, Cache |
| `entry.update` | Content updates | Integration Layer, Cache |
| `entry.publish` | Content publishing | Integration Layer, Cache |
| `entry.unpublish` | Content unpublishing | Integration Layer, Cache |
| `media.create` | Media uploads | Cache, CDN |
| `media.update` | Media changes | Cache, CDN |

### Integration Layer Events

| Event Type | Trigger | Consumers |
|------------|---------|-----------|
| `sync.completed` | Data synchronization complete | Cache, Frontend |
| `sync.failed` | Synchronization failure | Monitoring, Alerts |
| `cache.invalidated` | Cache entry invalidation | CDN, Frontend |

## Frontend Integration

The Next.js frontend integrates with both Medusa.js and Strapi APIs using the following patterns:

### Data Fetching Patterns

```javascript
// Server Component Example
async function ProductPage({ params }) {
  // Fetch commercial data from Medusa.js
  const product = await fetchProductFromMedusa(params.productId);
  
  // Fetch enhanced content from Strapi
  const content = await fetchProductContentFromStrapi(params.productId);
  
  // Combine data for rendering
  return <ProductDisplay product={product} content={content} />;
}
```

### API Client Structure

```typescript
// Medusa.js Store API Client
interface MedusaStoreClient {
  products: {
    retrieve(id: string): Promise<Product>;
    list(params: ProductListParams): Promise<ProductListResponse>;
  };
  carts: {
    create(): Promise<Cart>;
    addItem(cartId: string, item: LineItem): Promise<Cart>;
    // ...other methods
  };
  // ...other resources
}

// Strapi Content API Client
interface StrapiContentClient {
  find<T>(contentType: string, params?: QueryParams): Promise<T[]>;
  findOne<T>(contentType: string, id: string): Promise<T>;
  // ...other methods
}
```

### Multi-Region & Multi-Language Integration

```typescript
// Region & Language aware API client factory
function createApiClients(region: string, language: string) {
  return {
    medusa: createMedusaClient({
      baseUrl: getMedusaUrlForRegion(region),
      language,
    }),
    strapi: createStrapiClient({
      baseUrl: getStrapiUrl(),
      language,
      region,
    }),
  };
}

// Usage in Next.js middleware
export function middleware(request: NextRequest) {
  const { region, language } = parseRequestForRegionAndLanguage(request);
  // Set region and language in request context
}
```

## Authentication & Authorization

### API Authentication Mechanisms

| System | Client Type | Authentication Method |
|--------|-------------|----------------------|
| Medusa.js Admin API | Admin UI | JWT Bearer Token |
| Medusa.js Store API | Customer | JWT Bearer Token |
| Medusa.js Store API | Guest | Cookie-based Cart Session |
| Strapi Admin API | Admin UI | JWT Bearer Token |
| Strapi Content API | Frontend | API Token |
| Integration Layer | Internal Systems | API Key |

### Cross-System Authorization

The Integration Layer manages cross-system permissions using the following patterns:

1. **Service Accounts**:
   - Dedicated service account in Medusa.js for Integration Layer
   - Dedicated API token in Strapi for Integration Layer
   - Limited permissions based on principle of least privilege

2. **Permission Mapping**:
   - Define permission equivalence between systems
   - Coordinate user role changes across systems when needed

3. **Token Management**:
   - Secure storage of service tokens
   - Regular token rotation
   - Monitoring for unauthorized access

## Error Handling & Resilience

### Error Propagation

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│   Frontend     │◄────┤   API Layer    │◄────┤   Backend      │
│                │     │                │     │   Services     │
│                │     │                │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
       ▲                      ▲                      ▲
       │                      │                      │
       ▼                      ▼                      ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  User-friendly │     │  Standardized  │     │  Detailed      │
│  error messages│     │  error format  │     │  error logs    │
│  and recovery  │     │  and status    │     │  with context  │
│  options       │     │  codes         │     │  for debugging │
└────────────────┘     └────────────────┘     └────────────────┘
```

### Error Response Format

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Product with ID p_123 not found",
    "status": 404,
    "details": {
      "resourceType": "product",
      "resourceId": "p_123"
    },
    "traceId": "abc123def456"
  }
}
```

### Resilience Patterns

1. **Circuit Breaker**:
   - Prevent cascading failures
   - Implement in Integration Layer for cross-system calls
   - Automatically degrade functionality when dependent systems fail

2. **Retry with Backoff**:
   - Automatically retry transient failures
   - Exponential backoff to prevent overwhelming systems
   - Maximum retry limits

3. **Fallback Mechanisms**:
   - Cached data as fallback for read operations
   - Queue operations for write failures

4. **Bulkhead Pattern**:
   - Isolate system components
   - Prevent failures in one component from affecting others

### Implementation Example

```typescript
// Circuit Breaker Implementation
const medusaServiceCircuitBreaker = new CircuitBreaker({
  service: 'medusa',
  failureThreshold: 5,
  resetTimeout: 30000,
  fallback: async (productId) => {
    return getCachedProduct(productId);
  }
});

// Usage
async function getProduct(productId) {
  try {
    return await medusaServiceCircuitBreaker.execute(() => 
      medusaClient.products.retrieve(productId)
    );
  } catch (error) {
    logError(error);
    throw new StandardError({
      code: 'PRODUCT_RETRIEVAL_ERROR',
      message: 'Could not retrieve product information',
      status: 503,
      cause: error
    });
  }
}
```

## Conclusion

These interface and communication patterns provide a robust foundation for the Statamic to Medusa.js/Strapi migration architecture. By following these patterns, the system will achieve:

- Clear separation of concerns
- Resilient communication between components
- Consistent error handling
- Secure data access
- Efficient data synchronization

The patterns outlined in this document should be used as a reference during implementation to ensure consistency across the system and adherence to the overall architectural vision. 