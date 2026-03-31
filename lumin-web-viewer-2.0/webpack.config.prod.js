/* eslint-disable */
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const VersionFile = require('webpack-version-file');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssNormalize = require('postcss-normalize');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const JsonMinimizerPlugin = require('json-minimizer-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");
const { ESBuildMinifyPlugin } = require('esbuild-loader');
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackInjectPreload = require('@principalstudio/html-webpack-inject-preload');

const { getEntriesSW, modifyManifest } = require('./settings/swGetter');
const { env, htmlPath, offlineHtmlPath } = require('./settings/getEnv');
const InjectManifest = require('workbox-webpack-plugin').InjectManifest;
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

// statis entries
const SWEntries = getEntriesSW(env.raw['CORE_VERSION']);

/**
 * !!!ATTENTION: Update this value only if we want to force update SW files, while PDFTron core files remain unchanged.
 */
const SELF_REVISION = 'lumin-1.0';

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;

const FAVICON_VERSION = 5;

// common function to get style loaders
const getStyleLoaders = (cssOptions, preProcessor, processorOptions) => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
    },
    {
      loader: require.resolve('css-loader'),
      options: cssOptions,
    },
    {
      loader: 'esbuild-loader',
      options: {
        loader: 'css',
        minify: true,
      },
    },
    {
      // Options for PostCSS as we reference these options twice
      // Adds vendor prefixing based on your specified browser support in
      // package.json
      loader: require.resolve('postcss-loader'),
      options: {
        // Necessary for external CSS imports to work
        // https://github.com/facebook/create-react-app/issues/2677
        postcssOptions: {
          // ident: 'postcss',
          plugins: () => [
            require('postcss-preset-mantine')(),
            require('postcss-focus'),
            require('postcss-flexbugs-fixes'),
            require('postcss-preset-env')({
              autoprefixer: {
                flexbox: 'no-2009',
              },
              features: {
                'cascade-layers': true
              },
              stage: 3,
            }),
            // Adds PostCSS Normalize as the reset css with default options,
            // so that it honors browserslist config in package.json
            // which in turn let's users customize the target behavior as per their needs.
            postcssNormalize(),
          ],
        },
        sourceMap: false,
      },
    },
  ].filter(Boolean);
  if (preProcessor) {
    loaders.push({
      loader: require.resolve(preProcessor),
      options: {
        sourceMap: false,
        ...processorOptions,
      },
    });
  }
  return loaders;
};

const getFileName = ({ id, name, hash, postfix, extension }) => {
  const version = env.raw['VERSION'];
  const [, buildNumber] = version.split('-');
  const fragments = [name || id, hash.slice(0, 8), buildNumber, postfix, extension];
  const filename = fragments.filter(Boolean).join('.');
  return filename;
};

const webpackOutputFileName = ({ prefix, postfix, extension }) => (pathData, assetInfo) => {
  const { contentHash, name, id } = pathData.chunk;
  const hash = contentHash ? contentHash.javascript : null;
  const filename = getFileName({ id, name, hash, postfix, extension });
  return [prefix, filename].filter(Boolean).join('');
}

const getJsFileName = (postfix) => {
  return webpackOutputFileName({ prefix: 'js/', postfix, extension: 'js' })
}

const getCssFileName = (postfix) => {
  return webpackOutputFileName({ prefix: 'css/', postfix, extension: 'css' })
}

const isProduction = env.raw['BRANCH'] === 'production';

module.exports = {
  mode: 'production',
  name: 'lumin',
  devtool: 'source-map',
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
  entry: {
    bundle: path.resolve(__dirname, 'src'),
    offline: path.resolve(__dirname, 'src', 'index.offline.js'),
  },
  output: {
    hashDigestLength: 16,
    path: path.resolve(__dirname, 'build'),
    filename: getJsFileName('bundle.critical'),
    chunkFilename: getJsFileName('chunk'),
    publicPath: '/',
    library: {
      name: 'Lumin',
      type: 'var',
    },
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
          filename: 'vendors/[name].[contenthash].js',
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
          filename: 'common/[name].[contenthash].js',
        },
        // Separate React and related libraries into a separate chunk
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
          name: 'react-vendor',
          chunks: 'all',
          priority: 30,
          filename: 'vendors/react-vendor.[contenthash].js',
          enforce: true,
        },
        // Separate styled-components into its own chunk
        styles: {
          test: /[\\/]node_modules[\\/](styled-components)[\\/]/,
          name: 'styled-components',
          chunks: 'all',
          priority: 20,
          filename: 'vendors/styled-components.[contenthash].js',
        },
        // Separate large libraries for better caching
        apollo: {
          test: /[\\/]node_modules[\\/](@apollo|apollo)[\\/]/,
          name: 'apollo-vendor',
          chunks: 'all',
          priority: 25,
          filename: 'vendors/apollo-vendor.[contenthash].js',
        },
      },
    },
    minimize: true,
    minimizer: [
      new JsonMinimizerPlugin(),
      isProduction
        ? new TerserPlugin({
            exclude: RegExp(`${env.raw['CORE_VERSION']}/core`),
            terserOptions: {
              parse: {
                ecma: 8,
              },
              compress: {
                ecma: 5,
              },
              output: {
                ecma: 5,
                comments: false,
                ascii_only: true,
              },
            },
            parallel: false,
          })
        : new ESBuildMinifyPlugin({
            target: 'es2018',
            minify: true,
            exclude: [RegExp(`${env.raw['CORE_VERSION']}/core`)],
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
              minifyFontValues: { removeQuotes: false },
            },
          ],
        },
        parallel: true,
      }),
      isProduction && new CssMinimizerPlugin(),
    ].filter(Boolean),
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'app_consumer',
      exposes: {
        './tracking': path.resolve(__dirname, 'src/utils/miniAppTrackings'),
      },
      remotes: {
        luminsign: `luminsign@${env.raw['SIGN_MF_URL']}/mf-manifest.json`,
        luminpayment: `luminpayment@${env.raw['PAYMENT_MF_URL']}/mf-manifest.json`,
        appMarketplace: `appMarketplace@${env.raw['APP_MARKETPLACE_MF_URL']}/mf-manifest.json`,
        luminAgreementGen: `luminAgreementGen@${env.raw['AGREEMENT_GEN_MF_URL']}/mf-manifest.json`,
      },
    }),
    process.env.LUMIN_BRANCH === 'production' && new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new webpack.AutomaticPrefetchPlugin(),
    new webpack.DefinePlugin(env.rawString),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    /**
     * Don't remove this line, it uses to analyze bundlers
     */
    // new BundleAnalyzerPlugin({
    //   openAnalyzer: true,
    // }),

    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: getCssFileName(),
      chunkFilename: getCssFileName('chunk'),
      insert: (linkTag) => {
        const preloadLinkTag = document.createElement('link');
        preloadLinkTag.rel = 'preload';
        preloadLinkTag.as = 'style';
        preloadLinkTag.href = linkTag.href;
        document.head.appendChild(preloadLinkTag);
        document.head.appendChild(linkTag);
      },
      experimentalUseImportModule: true,
      ignoreOrder: true,
    }),

    new HtmlWebpackPlugin({
      filename: 'index.app.html',
      template: htmlPath,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
      chunks: ['bundle'],
      custom: `<script src="${SWEntries[0].fullPath}"></script>`,
      customFavicon: `
      <link rel="shortcut icon" href="/assets/favicon.png?v=${FAVICON_VERSION}">
      <link rel="apple-touch-icon" sizes="57x57" href="/assets/apple-icon-57x57.png?v=${FAVICON_VERSION}" />
      <link rel="apple-touch-icon" sizes="60x60" href="/assets/apple-icon-60x60.png?v=${FAVICON_VERSION}" />
      <link rel="apple-touch-icon" sizes="72x72" href="/assets/apple-icon-72x72.png?v=${FAVICON_VERSION}" />
      <link rel="apple-touch-icon" sizes="76x76" href="/assets/apple-icon-76x76.png?v=${FAVICON_VERSION}" />
      <link rel="apple-touch-icon" sizes="114x114" href="/assets/apple-icon-114x114.png?v=${FAVICON_VERSION}" />
      <link rel="apple-touch-icon" sizes="120x120" href="/assets/apple-icon-120x120.png?v=${FAVICON_VERSION}" />
      <link rel="apple-touch-icon" sizes="144x144" href="/assets/apple-icon-144x144.png?v=${FAVICON_VERSION}" />
      <link rel="apple-touch-icon" sizes="152x152" href="/assets/apple-icon-152x152.png?v=${FAVICON_VERSION}" />
      <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-icon-180x180.png?v=${FAVICON_VERSION}" />
      <link rel="icon" type="image/png" sizes="192x192"  href="/assets/android-icon-192x192.png?v=${FAVICON_VERSION}" />
      <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png?v=${FAVICON_VERSION}" />
      <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicon-96x96.png?v=${FAVICON_VERSION}" />
      <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png?v=${FAVICON_VERSION}" />
      <link rel="icon" href="/assets/favicon.png?v=${FAVICON_VERSION}" />
      <link rel='icon' href="/assets/favicon.ico?v=${FAVICON_VERSION}" sizes='48x48' />
      <link rel='icon' href="/assets/favicon/favicon.svg?v=${FAVICON_VERSION}" sizes='any' type='image/svg+xml' />
      <link rel="mask-icon" href="/assets/favicon-16x16.svg?v=${FAVICON_VERSION}" />
      <link rel="manifest" href="/assets/manifest.json?v=${FAVICON_VERSION}" />
      <meta name="msapplication-TileImage" content="/assets/ms-icon-144x144.png?v=${FAVICON_VERSION}" />
      <link rel="preload" href="${SWEntries[0].fullPath}" as="script" />
      `,
      meta: {
        'title': 'PDF Editor - Home | Lumin',
        'description': 'Lumin brings your documents to life with smart editing and markup tools to help you easily annotate PDF documents and images. Add text, images, comments, shapes and signatures. All from your browser.',
        'og:title': 'PDF Editor - Home | Lumin',
        'og:description': 'Lumin brings your documents to life with smart editing and markup tools to help you easily annotate PDF documents and images. Add text, images, comments, shapes and signatures. All from your browser.',
      },
    }),
    new HtmlWebpackPlugin({
      filename: 'offline.html',
      template: offlineHtmlPath,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
      chunks: ['offline'],
      custom: `<script src="${SWEntries[0].fullPath}"></script>`,
      customFavicon: `
      <link rel="apple-touch-icon" href="/assets/favicon/favicon.ico?v=${FAVICON_VERSION}">
      <link rel="icon" href="/assets/favicon/favicon.ico?v=${FAVICON_VERSION}">
      <link rel="shortcut icon" href="/assets/favicon/favicon.ico?v=${FAVICON_VERSION}">
      `,
    }),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
    new HtmlWebpackInjectPreload({
      files: [{
        match: /^(?!.*\.js\.map$).*(react-vendor|apollo-vendor|bundle|common|vendors)/,
        attributes: { as: 'script', type: 'text/javascript' },
      }]
    }),
  new CopyWebpackPlugin({
      patterns: [
        {
          from: './lib/core',
          to: `../build/${env.raw['CORE_VERSION']}/core`,
        },
        {
          from: './lib/core/webviewer-core.min.js',
          to: `../build${SWEntries[0].fullPath}`,
        },
        {
          from: './i18n',
          to: `../build/i18n/[name].[hash].[ext]`,
        },
        {
          from: './assets/favicon',
          to: '../build/assets',
        },
        {
          from: './robots.txt',
          to: '../build/robots.txt',
        },
        {
          from: './ads.txt',
          to: '../build/ads.txt',
        },
        {
          from: './assets/images',
          to: '../build/assets/images',
        },
        {
          from: './assets/media',
          to: '../build/assets/media',
        },
        {
          from: './public/meta.json',
          to: '../build/meta.json',
        },
        // {
        //   from: './unzip',
        //   to: '../build/unzip',
        // },
        {
          from: './manifest.json',
          to: '../build/manifest.json',
          transform(content) {
            return modifyManifest(content);
          },
        },
      ],
    }),
    new VersionFile({
      output: '../build/version.txt',
    }),
    new InjectManifest({
      swSrc: './sw.js',
      swDest: '../build/sw.js',
      maximumFileSizeToCacheInBytes: 10000000,
      // excludeChunks: ['bundle'],
      exclude: [
        /core\/assets\/mime-types\/*/,
        /core\/pdf\/simple_wasm\/*/,
        /core\/pdf\/lean\/*/,
        /fonts\/*/,
        /assets\/images\/*/,
        /assets\/media\/*/,
        /ads.txt/,
        /robots.txt/,
        /version.txt/,
        /.*.map.*/,
      ],
      manifestTransforms: [
        (manifestEntries) => ({
          manifest: manifestEntries.map((entry) => {
            if (entry.url.startsWith('/../build')) {
              entry.url = entry.url.replace('/../build', '');
            }
            if (entry.revision) {
              entry.revision = entry.revision + SELF_REVISION;
            }
            return entry;
          }),
        }),
      ],
    }),
  ].filter(Boolean),
  module: {
    rules: [
      {
        test: /\.m?jsx?$/,
        resolve: {
          fullySpecified: false,
        },
        exclude: [/(node_modules|bower_components)/, /lib/],
        use: [
          {
            loader: 'swc-loader',
            options: {
              jsc: {
                experimental: {
                  plugins: [
                    [
                      '@swc/plugin-styled-components',
                      {
                        displayName: false,
                        cssProp: true,
                        ssr: false,
                        minify: true,
                      },
                    ],
                    [
                      '@swc/plugin-transform-imports',
                      {
                        "lodash": {
                          "transform": "lodash/{{member}}"
                        },
                      },
                    ]
                  ],
                },
                parser: {
                  syntax: 'ecmascript',
                  jsx: true,
                  dynamicImport: true,
                  privateMethod: true,
                  functionBind: true,
                  exportDefaultFrom: true,
                  exportNamespaceFrom: true,
                  decorators: true,
                  decoratorsBeforeExport: true,
                  topLevelAwait: true,
                  importMeta: true,
                  preserveAllComments: false,
                },
                target: 'es2018',
                loose: true,
              },
            },
          },
        ],
        include: [path.resolve(__dirname, 'src')],
      },
      {
        test: /\.tsx?$/,
        exclude: [/(node_modules|bower_components)/, /^lib/],
        use: [
          {
            loader: 'swc-loader',
            options: {
              jsc: {
                experimental: {
                  plugins: [
                    [
                      '@swc/plugin-styled-components',
                      {
                        displayName: true,
                        cssProp: true,
                        ssr: false,
                        minify: true,
                      },
                    ],
                    [
                      '@swc/plugin-transform-imports',
                      {
                        "lodash": {
                          "transform": "lodash/{{member}}"
                        },
                      },
                    ]
                  ],
                },
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                  dynamicImport: true,
                  privateMethod: true,
                  functionBind: true,
                  exportDefaultFrom: true,
                  exportNamespaceFrom: true,
                  decorators: true,
                  decoratorsBeforeExport: true,
                  topLevelAwait: true,
                  importMeta: true,
                  preserveAllComments: false,
                },
                target: 'es2018',
                loose: true,
              },
            },
          },
        ],
        include: [path.resolve(__dirname, 'src')],
      },
      {
        test: /\.(png|jpg|gif|mp4|webm|mov)$/,
        exclude: /loading.gif/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb
          },
        },
        generator: {
          filename: '[path][name][hash][ext]',
        },
      },
      {
        test: /loading.gif/,
        type: 'asset/resource',
        generator: {
          filename: '[path][name][ext]',
        },
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: [{ loader: '@svgr/webpack', options: { ref: true, svgo: true } }],
        resourceQuery: /component/
      },
      {
        test: /\.svg$/,
        type: 'asset',
        generator: {
          filename: '[path][name][hash][ext]',
        },
        resourceQuery: { not: [/component/] },
        use: [
          {
            loader: 'svgo-loader',
            options: {
              multipass: true,
              js2svg: {
                indent: 2,
                pretty: false,
              },
            },
          },
        ],
      },
      {
        test: cssRegex,
        exclude: cssModuleRegex,
        use: getStyleLoaders({
          importLoaders: 1,
          sourceMap: false,
        }),
        sideEffects: true,
      },
      {
        test: sassRegex,
        use: [...getStyleLoaders(
          {
            importLoaders: 3,
            sourceMap: false,
          }
        ),
        {
          loader: 'sass-loader',
          options: {
            implementation: require.resolve("sass"),
            sassOptions: {
              includePaths: [path.resolve(__dirname, 'src/constants/styles/')],
              outputStyle: 'compressed',
              silenceDeprecations: ['legacy-js-api', 'import'],
            },
            additionalData: `
              @import "./node_modules/lumin-ui/dist/design-tokens/kiwi/scss/index.scss";
            `
          }
        }],
        sideEffects: true,
      },
      {
        test: /\icomoon.woff2/,
        type: 'asset/resource',
        generator: {
          filename: './assets/fonts/[name][hash][ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        exclude: /\icomoon.woff2/,
        type: 'asset/resource',
        generator: {
          filename: './assets/fonts/[name][ext]',
        },
      },
      // {
      //   test: /\.svg$/,
      //   use: {
      //     loader: 'svg-url-loader',
      //     options: {
      //       limit: 8192,
      //       noquotes: true,
      //       outputPath: 'assets/',
      //     },
      //   },
      // },
    ],
  },
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
      https: require.resolve('https-browserify'),
      http: require.resolve('stream-http'),
      util: require.resolve('util/'),
      process: require.resolve('process/browser.js'),
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser'),
      fs: require.resolve('fs'),
    },
    extensions: ['.mjs', '.tsx', '.ts', '.js', '.jsx', '.json'],
    alias: {
      src: path.resolve(__dirname, 'src/'),
      luminComponents: path.resolve(__dirname, 'src/lumin-components/'),
      'lumin-components': path.resolve(__dirname, 'src/lumin-components/'),
      hooks: path.resolve(__dirname, 'src/hooks/'),
      constants: path.resolve(__dirname, 'src/constants/'),
      helpers: path.resolve(__dirname, 'src/helpers/'),
      'event-listeners': path.resolve(__dirname, 'src/event-listeners/'),
      actions: path.resolve(__dirname, 'src/redux/actions/'),
      reducers: path.resolve(__dirname, 'src/redux/reducers/'),
      selectors: path.resolve(__dirname, 'src/redux/selectors/'),
      store: path.resolve(__dirname, 'src/redux/store/'),
      core: path.resolve(__dirname, 'src/core/'),
      graphQL: path.resolve(__dirname, 'src/graphql/'),
      utils: path.resolve(__dirname, 'src/utils/'),
      assets: path.resolve(__dirname, 'assets/'),
      services: path.resolve(__dirname, 'src/services/'),
      screens: path.resolve(__dirname, 'src/screens/'),
      layouts: path.resolve(__dirname, 'src/layouts/'),
      HOC: path.resolve(__dirname, 'src/HOC/'),
      'theme-providers': path.resolve(__dirname, 'src/theme-providers/'),
      interfaces: path.resolve(__dirname, 'src/interfaces/'),
      navigation: path.resolve(__dirname, 'src/navigation/'),
      features: path.resolve(__dirname, 'src/features'),
      ui: path.resolve(__dirname, 'src/ui'),
      '@socket': path.resolve(__dirname, 'src/socket'),
      'react-hook-form': path.resolve(__dirname, 'node_modules/react-hook-form/dist/index.cjs.js'),
      '@new-ui': path.resolve(__dirname, 'src/lumin-components/GeneralLayout/'),
      'lumin-ui/core': path.resolve(__dirname, 'node_modules/lumin-ui/dist/core/index.js'),
      'lumin-ui/style.css': path.resolve(__dirname, 'node_modules/lumin-ui/dist/core/lumin.css'),
      'lumin-ui/tokens.css': path.resolve(__dirname, 'node_modules/lumin-ui/dist/design-tokens/kiwi/css/index.css'),
      'lumin-ui/tokens.scss': path.resolve(__dirname, 'node_modules/lumin-ui/dist/design-tokens/kiwi/scss/index.scss'),
      'lumin-ui/tokens': path.resolve(__dirname, 'node_modules/lumin-ui/dist/design-tokens/kiwi/js'),
      '@libs': path.resolve(__dirname, 'src/libs/'),
      '@app-apollo': path.resolve(__dirname, 'src/apollo'),
      'lumin-ui/kiwi-ui': path.resolve(__dirname, 'node_modules/lumin-ui/dist/kiwi-ui'),
      '@web-new-ui': path.resolve(__dirname, 'src/lumin-components/ReskinLayout/'),
      socket: path.resolve(__dirname, 'src/socket/'),
      'lumin-ui/kiwi-style.css': path.resolve(__dirname, 'node_modules/lumin-ui/dist/kiwi-ui/kiwi.css'),
      'lumin-ui/kiwi-icon.css': path.resolve(__dirname, 'node_modules/lumin-ui/dist/kiwi-ui/font-icomoon/styles/icons.css'),
      '@mf': path.resolve(__dirname, '@mf-types/')
    },
  },
};
