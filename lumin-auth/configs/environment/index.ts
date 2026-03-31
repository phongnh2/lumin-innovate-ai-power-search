/* eslint-disable class-methods-use-this */

type TEnvironmentKey = `LUMIN_${string}` | `NEXT_PUBLIC_${string}`;

interface IInternalEnv {
  host: {
    grpcServerUrl: string;
    authUrl: string;
  };
  ory: {
    adminApiKey: string;
    userSchema: string;
    workspaceApiKey: string;
    projectId: string;
  };
  aws: {
    s3AccessKeyId: string;
    s3SecretAccessKey: string;
  };
  jwt: {
    authenticationJwk: string;
    authorizationJwk: string;
    cannyJwtSecret: string;
  };
  redis: {
    url: string;
  };
  xero: {
    clientSecret: string;
  };
}

interface ContractEnv {
  host: {
    grpcServerUrl: string;
  };
}

interface IPublicEnv {
  common: {
    version: string;
    environment: string;
    orySessionName: string;
    cannyCompanyID: string;
    sessionLifespan: string;
  };
  host: {
    appUrl: string;
    staticUrl: string;
    authUrl: string;
    kratosUrl: string;
    hydraPublicUrl: string;
    contractUrl: string;
    agreementGenUrl: string;
    backendUrl: string;
    cannyUrl: string;
    oryNetworkApiUrl: string;
  };
  aws: {
    region: string;
    s3ProfilesBucket: string;
    s3PublicResourcesBucket: string;
  };
  dropbox: {
    providerId: string;
  };
  datadog: {
    clientToken: string;
  };
  google: {
    reCaptchaV2: string;
    clientId: string;
  };
  awsPinpoint: {
    poolId: string;
    pinpointAppId: string;
  };
  gtag: {
    measurementId: string;
    gtmId: string;
  };
  jwt: {
    authentication: {
      cookieExpiry: number;
    };
    authorization: {
      expiredAt: number;
    };
  };
  microsoft: {
    clientId: string;
    authority: string;
  };
  xero: {
    clientId: string;
  };
  mobile: {
    clientId: string;
  };
}

class AppEnvironment {
  get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  private get<T>(key: TEnvironmentKey): T {
    return process.env[key] as unknown as T;
  }

  private getGrpcUrl(key: TEnvironmentKey): string {
    return this.get(key) || '0.0.0.0:4040';
  }

  get internal(): IInternalEnv {
    return {
      host: {
        // By pass at Nextjs build time. Will load env at runtime.
        grpcServerUrl: this.getGrpcUrl('LUMIN_GRPC_SERVER_URL'),
        authUrl: this.get('LUMIN_AUTH_URL')
      },
      ory: {
        adminApiKey: this.get('LUMIN_ORY_PAT'),
        userSchema: this.get('LUMIN_USER_SCHEMA_ID'),
        workspaceApiKey: this.get('LUMIN_ORY_WORKSPACE_API_KEY'),
        projectId: this.get('LUMIN_ORY_PROJECT_ID')
      },
      aws: {
        s3AccessKeyId: this.get('LUMIN_S3_ACCESS_KEY'),
        s3SecretAccessKey: this.get('LUMIN_S3_SECRET_KEY')
      },
      jwt: {
        authenticationJwk: this.get('LUMIN_AUTHENTICATION_JWK'),
        authorizationJwk: this.get('LUMIN_AUTHORIZATION_JWK'),
        cannyJwtSecret: this.get('LUMIN_CANNY_JWT_SECRET')
      },
      redis: {
        url: this.get('LUMIN_REDIS_URL')
      },
      xero: {
        clientSecret: this.get('LUMIN_OIDC_XERO_CLIENT_SECRET')
      }
    };
  }

  get contractEnv(): ContractEnv {
    return {
      host: {
        grpcServerUrl: this.getGrpcUrl('LUMIN_CONTRACT_SERVICE_GRPC_SERVER_URL')
      }
    };
  }

  get public(): IPublicEnv {
    // The public env which start with `NEXT_PUBLIC` must not be used `this.get` method because it's can be inlined while bundling
    // https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
    return {
      common: {
        version: String(process.env.NEXT_PUBLIC_VERSION),
        environment: String(process.env.NEXT_PUBLIC_ENVIRONMENT_NAME),
        orySessionName: String(process.env.NEXT_PUBLIC_ORY_SESSION_NAME),
        cannyCompanyID: String(process.env.NEXT_PUBLIC_CANNY_COMPANY_ID),
        sessionLifespan: String(process.env.NEXT_PUBLIC_SESSION_LIFESPAN)
      },
      host: {
        appUrl: String(process.env.NEXT_PUBLIC_APP_URL),
        staticUrl: String(process.env.NEXT_PUBLIC_STATIC_URL),
        authUrl: String(process.env.NEXT_PUBLIC_AUTH_URL),
        kratosUrl: String(process.env.NEXT_PUBLIC_KRATOS_URL),
        hydraPublicUrl: String(process.env.NEXT_PUBLIC_HYDRA_PUBLIC_URL),
        contractUrl: String(process.env.NEXT_PUBLIC_LUMIN_SIGN_APP_URL),
        agreementGenUrl: String(process.env.NEXT_PUBLIC_AGREEMENT_GEN_URL),
        backendUrl: String(process.env.NEXT_PUBLIC_BACKEND_URL),
        cannyUrl: String(process.env.NEXT_PUBLIC_CANNY_URL),
        oryNetworkApiUrl: String(process.env.NEXT_PUBLIC_ORY_NETWORK_API_URL)
      },
      aws: {
        region: String(process.env.NEXT_PUBLIC_AWS_REGION),
        s3ProfilesBucket: String(process.env.NEXT_PUBLIC_S3_PROFILES_BUCKET),
        s3PublicResourcesBucket: String(process.env.NEXT_PUBLIC_S3_PUBLIC_RESOURCES_BUCKET)
      },
      dropbox: {
        providerId: String(process.env.NEXT_PUBLIC_DROPBOX_PROVIDER_ID)
      },
      datadog: {
        clientToken: String(process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN)
      },
      google: {
        reCaptchaV2: String(process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY),
        clientId: String(process.env.NEXT_PUBLIC_OIDC_GOOGLE_CLIENT_ID)
      },
      awsPinpoint: {
        poolId: String(process.env.NEXT_PUBLIC_POOL_ID),
        pinpointAppId: String(process.env.NEXT_PUBLIC_PINPOINT_APP_ID)
      },
      gtag: {
        measurementId: String(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID),
        gtmId: String(process.env.NEXT_PUBLIC_GTM_ID)
      },
      jwt: {
        authentication: {
          cookieExpiry: Number(process.env.NEXT_PUBLIC_AUTHEN_JWT_COOKIE_EXPIRY) || 15 // days
        },
        authorization: {
          expiredAt: Number(process.env.NEXT_PUBLIC_AUTHOR_JWT_EXPIRED_AT) || 120000 // miliseconds
        }
      },
      microsoft: {
        clientId: String(process.env.NEXT_PUBLIC_OIDC_MICROSOFT_CLIENT_ID),
        authority: String(process.env.NEXT_PUBLIC_OIDC_MICROSOFT_AUTHORITY)
      },
      xero: {
        clientId: String(process.env.NEXT_PUBLIC_OIDC_XERO_CLIENT_ID)
      },
      mobile: {
        clientId: String(process.env.NEXT_PUBLIC_LUMIN_MOBILE_CLIENT_ID)
      }
    };
  }
}

export { AppEnvironment };

export const environment = new AppEnvironment();
