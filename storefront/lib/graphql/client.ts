import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useCurrentLocale } from '../i18n/config';

// Get the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL || 'https://demo.saleor.io/graphql/';

// Create the HTTP link for GraphQL requests
const httpLink = createHttpLink({
  uri: API_URL,
});

// Add auth headers to requests when token is available
const authLink = setContext((_, { headers }) => {
  // Get the auth token from localStorage if available
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('saleorAuthToken')
    : null;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Create region/language context link to add channel and language parameters
const channelLink = new ApolloLink((operation, forward) => {
  // Get channel and language from context or defaults
  const region = typeof window !== 'undefined'
    ? localStorage.getItem('region') || process.env.NEXT_PUBLIC_DEFAULT_REGION || 'nl'
    : process.env.NEXT_PUBLIC_DEFAULT_REGION || 'nl';

  const language = typeof window !== 'undefined'
    ? localStorage.getItem('language') || process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en'
    : process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en';

  // Map region to channel (in this example, they match)
  const channel = region.toUpperCase();

  // Add variables to the operation
  operation.variables = {
    ...operation.variables,
    channel,
    languageCode: language.toUpperCase(),
  };

  return forward(operation);
});

// Initialize Apollo Client
export const client = new ApolloClient({
  link: ApolloLink.from([authLink, channelLink, httpLink]),
  cache: new InMemoryCache(),
  ssrMode: typeof window === 'undefined', // Enable SSR mode when running on server
});

// Helper to get current region/language
export const getCurrentLocale = () => {
  if (typeof window === 'undefined') {
    return {
      region: process.env.NEXT_PUBLIC_DEFAULT_REGION || 'nl',
      language: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
    };
  }

  return {
    region: localStorage.getItem('region') || process.env.NEXT_PUBLIC_DEFAULT_REGION || 'nl',
    language: localStorage.getItem('language') || process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
  };
};

// Helper to set region/language
export const setLocale = (region: string, language: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('region', region);
    localStorage.setItem('language', language);

    // Reload page to apply new locale
    window.location.reload();
  }
};
