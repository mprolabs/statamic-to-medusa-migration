'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from '../lib/graphql/client';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}
