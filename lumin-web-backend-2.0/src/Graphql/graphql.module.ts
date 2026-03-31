/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line import/extensions
import { ApolloServerPluginSchemaReporting } from '@apollo/server/plugin/schemaReporting';
import { ApolloServerPluginUsageReporting } from '@apollo/server/plugin/usageReporting';
import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLSchema } from 'graphql';
import { GraphQLIncludeDirective } from 'graphql/type/directives';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { directiveTransformers } from 'Common/directives/GraphqlDirective/Directives';

import { AuthModule } from 'Auth/auth.module';
import { AuthService } from 'Auth/auth.service';
import { DataLoaderService } from 'DataLoader/dataLoader.service';
import { EnvironmentService } from 'Environment/environment.service';
import { LoggerService } from 'Logger/Logger.service';

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [AuthModule],
      useFactory: (
        authService: AuthService,
        environmentService: EnvironmentService,
        loggerService: LoggerService,
        dataLoaderService: DataLoaderService,
      ) => {
        const isDevelopment = environmentService.getByKey(EnvConstants.ENV) === 'development';
        const factoryOptions: any = {
          path: CommonConstants.APOLLO_SERVER_PATH,
          typePaths: ['./**/*.graphql'],
          subscriptions: {
            'graphql-ws': {
              keepAlive: 10000,
              onConnect: async (context) => {
                const { connectionParams, extra } = context;
                if (!connectionParams.authorizeToken) {
                  if (connectionParams[CommonConstants.MOBILE_REQUEST_HEADER]) {
                    return true;
                  }
                  return false;
                }
                try {
                  const session = await authService.getSession(connectionParams.authorizeToken.split(' ')[1] as string);
                  extra.socketAuth = session;
                  return true;
                } catch (error) {
                  return false;
                }
              },
            },
            'subscriptions-transport-ws': true,
          },
          uploads: false,
          playground: isDevelopment,
          introspection: isDevelopment,
          ...(isDevelopment && { cors: { origin: CommonConstants.DEVELOPMENT_ORIGIN } }),
          transformSchema: (_schema: GraphQLSchema) => directiveTransformers.reduce((curSchema, transformer) => transformer(curSchema), _schema),
          buildSchemaOptions: {
            directives: [GraphQLIncludeDirective],
          },
          context: (context) => {
            const {
              connectionParams,
            } = context;
            if (context?.extra) {
              return {
                req: {
                  ...context.extra.request,
                  headers: {
                    ...context.extra.request.headers,
                    ...(connectionParams?.authToken && {
                      [CommonConstants.AUTHORIZATION_HTTP_REQUEST_HEADER]: connectionParams.authToken,
                      [CommonConstants.REFRESH_TOKEN_HTTP_REQUEST_HEADER]: connectionParams.refreshtoken,
                      [CommonConstants.MOBILE_REQUEST_HEADER]: connectionParams[CommonConstants.MOBILE_REQUEST_HEADER],
                    }),
                    ...(context.extra.socketAuth && {
                      [CommonConstants.GRAPHQL_SOCKET_AUTH]: context.extra.socketAuth,
                    }),
                  },
                },
                loaders: dataLoaderService.DataLoaderRegistry,
              };
            }
            return {
              req: context.req,
              res: context.res,
              loaders: dataLoaderService.DataLoaderRegistry,
            };
          },
          formatError: (err) => {
            const {
              statusCode = 520, code = 'UNKNOWN_ERROR', metadata,
            } = err.extensions || {};
            const { message } = err;
            loggerService.error({
              context: 'GraphqlError',
              message: err?.message || 'Unknown error',
              stack: err?.extensions?.stack,
              extraInfo: {
                path: err?.path,
                locations: err?.locations,
              },
            });
            return {
              message,
              extensions: {
                code,
                statusCode,
                metadata,
              },
            };
          },
          cors: {
            origin: environmentService.luminOrigins,
            credentials: true,
          },
          csrfPrevention: false,
        };

        if (!isDevelopment) {
          factoryOptions.apollo = {
            key: environmentService.getByKey(EnvConstants.ENGINE_API_KEY),
            graphRef: environmentService.getByKey(EnvConstants.APOLLO_GRAPH_REF),
          };
          factoryOptions.plugins = [
            ApolloServerPluginUsageReporting({
              sendHeaders: isDevelopment ? { exceptNames: ['refreshtoken'] } : { none: true },
              sendVariableValues: isDevelopment
                ? { exceptNames: ['password'] }
                : { onlyNames: ['orgId', 'userId', 'documentId', 'teamId'] },
              reportErrorFunction: (err) => {
                if (err.message && err.message.startsWith('You have no document')) {
                  return null;
                }
                return `Error: name - ${err.name}, message - ${err.message}, stack - ${err.stack}`;
              },
              // rewriteError: (err) => new GraphQLError(`${err.message}` || 'Something went wrong'),
            }),
            ApolloServerPluginSchemaReporting(),
          ];
        }
        return factoryOptions;
      },
      inject: [AuthService, EnvironmentService, LoggerService, DataLoaderService],
    }),
  ],
})
export class GraphqlModule { }
