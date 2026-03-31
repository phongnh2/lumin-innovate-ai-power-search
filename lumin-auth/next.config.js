/* eslint-disable @typescript-eslint/no-var-requires */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

const { environmentLoader } = require('./configs/environment-loader');
const { i18n } = require('./next-i18next.config.js');

const isDevelopment = process.env.NODE_ENV === 'development';

/** @type {import('next').NextConfig} */
const conf = {
  /**
   * @reference https://react-svgr.com/docs/next/
   */
  webpack(config, { isServer, webpack }) {
    // Load env from configs/environment-loader
    const envs = environmentLoader.getJson();
    if (!isDevelopment && envs) {
      config.plugins.unshift(new webpack.EnvironmentPlugin(envs));
    }
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find(rule => rule.test?.test?.('.svg'));

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/ // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: /url/ }, // exclude if *.svg?url
        use: ['@svgr/webpack']
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    if (!isServer) {
      // Force CSS order by manipulating chunk splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            // Put library styles in a separate chunk that loads first
            'lumin-ui-styles': {
              name: 'lumin-ui-styles',
              test: /[\\/]node_modules[\\/]lumin-ui[\\/].*\.css$/,
              chunks: 'all',
              priority: 40,
              enforce: true
            },
            // App styles load after
            'app-styles': {
              name: 'app-styles',
              test: /[\\/]components[\\/].*\.(css|scss)$/,
              chunks: 'all',
              priority: 30,
              enforce: true
            }
          }
        }
      };
    }

    return config;
  },
  transpilePackages: ['lumin-ui'],
  i18n,
  reactStrictMode: false,
  compiler: {
    emotion: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com'
      }
    ]
  },
  eslint: {
    /**
     * https://github.com/vercel/next.js/discussions/26257
     */
    ignoreDuringBuilds: true
  },
  modularizeImports: {
    lodash: {
      transform: 'lodash/{{member}}',
      preventFullImport: true
    }
  },
  async headers() {
    return [
      isDevelopment
        ? {
            source: '/api/(.*)',
            headers: [
              { key: 'Access-Control-Allow-Credentials', value: 'true' },
              { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL },
              { key: 'Access-Control-Allow-Methods', value: 'OPTIONS,PATCH,DELETE,POST,PUT' },
              {
                key: 'Access-Control-Allow-Headers',
                value: 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
              }
            ]
          }
        : null,
      {
        source: '/((?!api/).*)',
        headers: [{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' }]
      }
    ].filter(Boolean);
  },
  experimental: {
    optimizePackageImports: ['@lumin-pdf/lumin-icons']
  },
  sassOptions: {
    additionalData: `
      @import "./node_modules/lumin-ui/dist/design-tokens/kiwi/scss/index.scss";
    `,
    sourceMap: true
  }
};
module.exports = withBundleAnalyzer(conf);
