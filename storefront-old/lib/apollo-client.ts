import { ApolloClient, InMemoryCache, createHttpLink, NormalizedCacheObject } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { SALEOR_API_URL } from './constants';

// Channel and language information for multi-region support
export type SaleorConfig = {
  channel: string;
  languageCode: string;
};

// Default configuration
export const defaultSaleorConfig: SaleorConfig = {
  channel: process.env.NEXT_PUBLIC_DEFAULT_CHANNEL || 'default-channel',
  languageCode: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'EN',
};

// Create the HTTP link for the Apollo Client
const httpLink = createHttpLink({
  uri: SALEOR_API_URL,
});

// Add authorization headers
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('saleorAuthToken') : null;
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create and configure the Apollo Client
export function createApolloClient(config: SaleorConfig = defaultSaleorConfig): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only',
      },
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
    // Add config to context for each operation
    connectToDevTools: process.env.NODE_ENV === 'development',
  });
}

// Client-side singleton
let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

// Initialize the Apollo client with caching
export function initializeApollo(
  initialState: any = null,
  config: SaleorConfig = defaultSaleorConfig
): ApolloClient<NormalizedCacheObject> {
  const _apolloClient = apolloClient ?? createApolloClient(config);

  // If your page has Next.js data fetching methods that use Apollo Client,
  // the initial state gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Restore the cache using the data passed from getStaticProps/getServerSideProps
    // combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;
  return _apolloClient;
}

// Use this function to get the Apollo Client instance
export function useApollo(initialState: any, config: SaleorConfig = defaultSaleorConfig) {
  return initializeApollo(initialState, config);
} 