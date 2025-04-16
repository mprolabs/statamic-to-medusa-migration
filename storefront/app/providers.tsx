'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from '../lib/graphql/client';

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
};

export default Providers; 