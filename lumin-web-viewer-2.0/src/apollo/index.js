/* eslint-disable import/prefer-default-export */
import { ApolloLink, split, from, Observable } from '@apollo/client';
import { InMemoryCache, defaultDataIdFromObject } from '@apollo/client/cache';
import { ApolloClient } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { HttpLink } from '@apollo/client/link/http';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { print } from 'graphql/language/printer';
import { createClient } from 'graphql-ws';

import Axios from '@libs/axios';
import { setWrongIpStatus } from 'actions/authActions';
import { setForceReloadVersion, setError } from 'actions/customActions';
import { store } from 'src/redux/store';

import logger from 'helpers/logger';

import { isElectron } from 'utils/corePathHelper';
import errorUtils from 'utils/error';
import SessionUtils from 'utils/session';

import { AUTHORIZATION_HEADER } from 'constants/authConstant';
import { BuiltInGraphqlErrorCode, ErrorCode } from 'constants/errorCode';
import { LocalStorageKey } from 'constants/localStorageKey';
import { LOGGER } from 'constants/lumin-common';
import { GRAPHQL_API, GRAPHQL_WEBSOCKET_API } from 'constants/urls';

import ApolloErrorObservable from './ApolloErrorObservable';

const isDevelopment = process.env.NODE_ENV === 'development';

const { dispatch } = store;

// Create an http link:
const httpLink = new HttpLink({
  uri: GRAPHQL_API,
  credentials: isDevelopment || isElectron() ? 'include' : 'same-origin',
});

const errorLink = onError(({ graphQLErrors, networkError, response, operation, forward }) => {
  if (graphQLErrors) {
    const { operationName } = operation;

    // DEBUG: Log chi tiết operation và lỗi
    // eslint-disable-next-line no-console
    console.group('🔴 GraphQL Error Details');
    // eslint-disable-next-line no-console
    console.log('Operation Name:', operationName);
    // eslint-disable-next-line no-console
    console.log('Variables:', operation.variables);
    // eslint-disable-next-line no-console
    console.log('Query:', operation.query.loc?.source.body);
    // eslint-disable-next-line no-console
    console.log('Errors:', graphQLErrors);
    // eslint-disable-next-line no-console
    console.groupEnd();

    const notifies = graphQLErrors.map(({ message, extensions: { code: errorCode, statusCode, metadata } = {} }) => {
      logger.logError({
        reason: LOGGER.Service.GRAPHQL_ERROR,
        error: {
          errorCode,
          statusCode,
          metadata,
          operationName,
          message,
          variables: operation.variables,
        },
      });
      if (errorCode === BuiltInGraphqlErrorCode.GRAPHQL_VALIDATION_FAILED) {
        dispatch(
          setError({ operationName, message, reason: LOGGER.Service.GRAPHQL_ERROR, errorCode, statusCode, metadata })
        );
      }
      return ApolloErrorObservable.notify({
        errorCode,
        statusCode,
        data: message,
        metadata,
      });
    });
    const observers = notifies[0].filter(Boolean);
    if (observers.some((notify) => notify.stopped)) {
      response.errors.stopped = true;
    }

    if (networkError) {
      // eslint-disable-next-line no-console
      console.group('🔴 Network Error');
      // eslint-disable-next-line no-console
      console.log('Operation:', operationName);
      // eslint-disable-next-line no-console
      console.log('Network Error:', networkError);
      // eslint-disable-next-line no-console
      console.groupEnd();

      logger.logError({
        reason: LOGGER.Service.NETWORK_ERROR,
        error: networkError,
      });
    }

    if (graphQLErrors[0].extensions?.code === ErrorCode.Common.TOKEN_EXPIRED) {
      localStorage.removeItem(LocalStorageKey.ORY_ACCESS_TOKEN);
      return new Observable((observer) => {
        SessionUtils.getAuthorizedToken()
          .then((token) => {
            const oldHeaders = operation.getContext().headers;
            operation.setContext({
              headers: {
                ...oldHeaders,
                [AUTHORIZATION_HEADER]: `Bearer ${token}`,
              },
            });
          })
          .then(() => {
            const subscriber = {
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            };
            forward(operation).subscribe(subscriber);
          })
          .catch((error) => {
            // No refresh or client token available, we force user to login
            observer.error(error);
          });
      });
    }

    if (graphQLErrors[0].extensions?.code === ErrorCode.Common.INVALID_IP_ADDRESS) {
      const { email } = graphQLErrors[0].extensions.metadata;
      dispatch(setWrongIpStatus({ open: true, email }));
    }

    if (graphQLErrors[0].extensions?.code === ErrorCode.Common.OUTDATED_VERSION) {
      dispatch(setForceReloadVersion(true));
    }
  }
  return undefined;
});

const contextMiddleware = setContext(async () => {
  const token = await SessionUtils.getAuthorizedToken();
  return {
    headers: {
      [AUTHORIZATION_HEADER]: `Bearer ${token}`,
    },
  };
});

const authMiddleware = new ApolloLink((operation, forward) => {
  const { operationName } = operation;
  logger.logInfo({
    message: `${LOGGER.EVENT.GRAPHQL_RESPONSE}_${operationName?.toLocaleUpperCase()}`,
    reason: LOGGER.Service.GRAPHQL_INFO,
    attributes: {
      operationName,
    },
  });
  return forward(operation).map((response) => errorUtils.attachHeaderToError(operation, response));
});

// Create subscriptionClient
export const subscriptionClient = createClient({
  url: GRAPHQL_WEBSOCKET_API,
  connectionParams: async () => {
    const token = await SessionUtils.getAuthorizedToken();
    return {
      authorizeToken: `Bearer ${token}`,
    };
  },
});

// Create a WebSocket link:
const wsLink = new GraphQLWsLink(subscriptionClient);

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  from([contextMiddleware, errorLink, authMiddleware, httpLink])
);

export const cache = new InMemoryCache({
  dataIdFromObject: (object) => {
    switch (object.__typename) {
      case 'Entity':
      case 'Target':
      case 'Actor':
        return object.key;
      default:
        return defaultDataIdFromObject(object); // fall back to default handling
    }
  },
});

export const client = new ApolloClient({
  uri: GRAPHQL_API,
  link,
  cache,
  queryDeduplication: false,
});

export const clientUpload = async ({ mutation, variables, cancelToken, onUploadProgress = () => {} }) => {
  const operations = print(mutation);
  const data = new FormData();
  const { file: singleFile, files: multipleFiles } = variables;
  const file = singleFile || (multipleFiles && Array.from(multipleFiles));
  const isUploadMultiple = Array.isArray(file);
  const assignFile = isUploadMultiple ? file.map((f) => ({ type: f.type, file: null })) : null;
  const assignVariables = isUploadMultiple ? { ...variables, files: assignFile } : { ...variables, file: assignFile };
  data.append(
    'operations',
    JSON.stringify({
      query: operations,
      variables: assignVariables,
    })
  );
  const map = {};
  if (isUploadMultiple) {
    file.forEach((_, index) => {
      map[index] = [`variables.files.${index}.file`];
    });
    data.append('map', JSON.stringify(map));
    file.forEach((value, index) => {
      data.append(index, value.file);
    });
  } else {
    map[0] = ['variables.file'];
    data.append('map', JSON.stringify(map));
    data.append('0', file);
  }

  const axiosConfig = {
    onUploadProgress,
  };

  if (cancelToken) {
    axiosConfig.cancelToken = cancelToken;
  }

  const response = await Axios.axiosInstance.post('/graphql', data, axiosConfig);
  const { errors } = response.data;
  const firstError = errors?.[0];
  if (firstError) {
    const {
      extensions: { code: errorCode, statusCode },
      message,
    } = firstError;
    const notifies = ApolloErrorObservable.notify({ errorCode, statusCode, data: message });
    if (notifies.filter(Boolean).some((notify) => notify.stopped)) {
      response.errors.stopped = true;
    }
    const error = errorUtils.deriveAxiosGraphToHttpError(firstError);
    error.graphQLErrors = errors;
    error.response.data = {
      ...firstError.extensions,
      message: firstError.message,
    };
    throw error;
  }
  return response;
};
