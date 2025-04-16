---
title: Frontend Configuration
parent: Development
nav_order: 4
---

# Frontend Configuration

This document outlines the configuration of the Next.js storefront, including build setup, styling with Tailwind CSS, and multi-region/multi-language support.

## Next.js Configuration

The Next.js application is configured in `storefront/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['demo.saleor.io', 'saleor-media.s3.amazonaws.com'], // Add your media domains here
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

### Key Configuration Options

- **reactStrictMode**: Enabled to highlight potential problems in the application. This helps catch bugs early during development.
- **swcMinify**: Uses SWC for minification instead of Terser for faster builds.
- **images**: Configured with domains allowed for external images, essential for product images from Saleor.
- **serverActions**: Experimental feature enabled to use React Server Actions for form submissions and data mutations.

## Tailwind CSS Configuration

Tailwind CSS is used for styling and is configured in `storefront/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          '50': '#f5f7ff',
          '100': '#ebeefe',
          '200': '#d8defd',
          '300': '#b8c4fb',
          '400': '#9aa5f8',
          '500': '#7c85f3',
          '600': '#6163e8',
          '700': '#5451d1',
          '800': '#4643a9',
          '900': '#3c3d85',
          '950': '#232252',
        },
      },
    },
  },
  plugins: [],
}
```

### Key Configuration Options

- **content**: Specifies which files Tailwind should scan for class usage to generate the CSS.
- **theme.extend.colors**: Custom color palette with a primary color scale for consistent branding.
- **plugins**: No additional plugins are currently used, but this can be extended with plugins like `@tailwindcss/forms` or `@tailwindcss/typography` if needed.

## PostCSS Configuration

PostCSS is configured in `storefront/postcss.config.js`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

This configuration integrates Tailwind CSS and adds vendor prefixes automatically with Autoprefixer.

## Multi-Region Implementation

Our multi-region approach leverages Next.js's built-in internationalization features and Saleor's channel-based architecture.

### Region Handling

1. **Channel Definition**: Each region (NL, BE, DE) has a corresponding channel in Saleor.
2. **Domain or Path Strategy**: Regions are identified either by:
   - Unique domains (`nl.example.com`, `be.example.com`, `de.example.com`)
   - Path prefixes (`example.com/nl`, `example.com/be`, `example.com/de`)

3. **Region Detection**: 
   ```javascript
   // Middleware implementation
   export function middleware(request) {
     const { pathname } = request.nextUrl;
     const hostname = request.headers.get('host');
     
     // Detect region from hostname or path
     let region = detectRegion(hostname, pathname);
     
     // Store in cookies for server components
     const response = NextResponse.next();
     response.cookies.set('region', region);
     
     return response;
   }
   ```

4. **Channel Selection**: The detected region is used to select the appropriate Saleor channel in GraphQL queries.

## Multi-Language Implementation

Our multi-language support is implemented using Next.js internationalization features:

### Language Handling

1. **Supported Languages**: English (en), Dutch (nl), German (de), and French (fr).
2. **Language Detection**:
   - From URL path segments (`example.com/nl/products`, `example.com/de/products`)
   - From user preferences (browser settings, stored preferences)

3. **GraphQL Integration**:
   ```javascript
   // Apollo client wrapper
   const withApollo = (Component) => {
     return (props) => {
       const { locale } = useRouter();
       const languageCode = (locale || 'en').toUpperCase();
       
       return (
         <ApolloProvider client={initializeApollo(languageCode)}>
           <Component {...props} />
         </ApolloProvider>
       );
     };
   };
   ```

4. **Content Translation**: All queries include the language code parameter to retrieve translated content from Saleor.

## Build Process

Our Next.js application build process follows these steps:

1. **Development**: 
   ```bash
   npm run dev
   ```
   Starts the development server with hot-reloading.

2. **Production Build**:
   ```bash
   npm run build
   ```
   Builds the application for production deployment.

3. **Static Output**: The build process generates static HTML and optimized JavaScript files in the `.next` directory.

4. **Deployment**: The built application can be deployed to various platforms as detailed in the [Deployment Strategy](deployment.md) document.

## Environment Variables

Key environment variables for the frontend:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Saleor GraphQL API URL | `https://demo.saleor.io/graphql/` |
| `NEXT_PUBLIC_DEFAULT_CHANNEL` | Default Saleor channel | `default-channel` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default locale | `en` |
| `NEXT_PUBLIC_DOMAIN` | Application domain for URLs | `localhost:3000` |

## Mobile Responsiveness

The application is built with a mobile-first approach using Tailwind CSS:

1. **Responsive Classes**: Tailwind's responsive utilities (`sm:`, `md:`, `lg:`, `xl:`) are used throughout.
2. **Breakpoints**:
   - `sm`: 640px
   - `md`: 768px 
   - `lg`: 1024px
   - `xl`: 1280px
   - `2xl`: 1536px

## Performance Optimizations

The following performance optimizations are configured:

1. **Image Optimization**: Next.js Image component for automatic optimization.
2. **Code Splitting**: Automatic code splitting by page.
3. **SWC Minification**: Faster builds with SWC instead of Terser.
4. **Component-Level Code Splitting**: Using dynamic imports for larger components.
5. **Tailwind JIT**: Just-in-time compiler for Tailwind to reduce CSS size.

## Adding Custom Configuration

When extending the configuration:

1. **Next.js Config**: Extend in `next.config.js`, but be cautious with experimental features.
2. **Tailwind Customization**: Add custom colors, spacing, or plugins in `tailwind.config.js`.
3. **PostCSS Plugins**: Add additional PostCSS plugins in `postcss.config.js` as needed.

Always test configuration changes thoroughly in development before deploying to production. 