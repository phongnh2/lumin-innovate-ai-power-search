import { ApolloProvider } from '@apollo/client';
import { InMemoryCache } from '@apollo/client/cache';
import { ApolloClient } from '@apollo/client/core';
import { SchemaLink } from '@apollo/client/link/schema';
import { addMocksToSchema } from '@graphql-tools/mock';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { printSchema, buildClientSchema } from 'graphql/utilities';
import React from 'react';

import introspectionResult from './schema.json';

// eslint-disable-next-line react/prop-types
export default function AutoMockedApollo({ children, mockResolvers }) {
  const schemaSDL = printSchema(buildClientSchema({ __schema: introspectionResult.__schema }));

  const schema = makeExecutableSchema({
    typeDefs: schemaSDL,
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
  });

  addMocksToSchema({ schema, mocks: mockResolvers });

  const client = new ApolloClient({
    link: new SchemaLink({ schema }),
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
