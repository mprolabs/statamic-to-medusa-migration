import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ApolloClient, 
  InMemoryCache, 
  HttpLink, 
  ApolloProvider,
  NormalizedCacheObject
} from '@apollo/client';
import { useChannel } from './ChannelContext';

// Types
interface ApiEndpoints {
  graphqlUrl: string;
  checkoutApiUrl: string;
}

interface GraphQLClientContextType {
  client: ApolloClient<NormalizedCacheObject> | null;
  apiEndpoints: ApiEndpoints;
}

// Create a context with default values
const GraphQLClientContext = createContext<GraphQLClientContextType>({
  client: null,
  apiEndpoints: {
    graphqlUrl: '',
    checkoutApiUrl: ''
  }
});

interface GraphQLClientProviderProps {
  children: ReactNode;
  apiUrl?: string;
}

export const GraphQLClientProvider: React.FC<GraphQLClientProviderProps> = ({
  children,
  apiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL || 'https://demo.saleor.io/graphql/'
}) => {
  const { currentChannel } = useChannel();
  
  // Initialize API endpoints
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoints>({
    graphqlUrl: apiUrl,
    checkoutApiUrl: process.env.NEXT_PUBLIC_CHECKOUT_API_URL || 'https://demo.saleor.io/checkout-api/'
  });
  
  // Initialize Apollo Client
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject> | null>(() => {
    return createApolloClient(apiEndpoints.graphqlUrl, currentChannel?.slug);
  });
  
  // Create a new Apollo Client instance
  function createApolloClient(url: string, channelSlug?: string) {
    const httpLink = new HttpLink({ 
      uri: url,
      headers: channelSlug ? {
        'x-saleor-channel': channelSlug
      } : {}
    });
    
    return new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
          errorPolicy: 'all',
        },
        query: {
          fetchPolicy: 'network-only',
          errorPolicy: 'all',
        },
        mutate: {
          errorPolicy: 'all',
        },
      },
    });
  }
  
  // Effect to update client when channel changes
  useEffect(() => {
    if (currentChannel?.slug) {
      setClient(createApolloClient(apiEndpoints.graphqlUrl, currentChannel.slug));
    }
  }, [currentChannel, apiEndpoints.graphqlUrl]);
  
  // The context value
  const contextValue: GraphQLClientContextType = {
    client,
    apiEndpoints
  };
  
  return (
    <GraphQLClientContext.Provider value={contextValue}>
      {client && (
        <ApolloProvider client={client}>
          {children}
        </ApolloProvider>
      )}
      {!client && (
        <div>Loading GraphQL client...</div>
      )}
    </GraphQLClientContext.Provider>
  );
};

// Custom hook for using the GraphQL client context
export const useGraphQLClient = () => useContext(GraphQLClientContext);

export default GraphQLClientContext; 