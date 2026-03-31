/* eslint-disable global-require */
const { ModuleFederationPlugin } = require('@module-federation/rspack');
const { rspack } = require('@rspack/core');
const ReactRefreshRspackPlugin = require('@rspack/plugin-react-refresh');
const bodyParser = require('body-parser');
const path = require('path');
const postcssNormalize = require('postcss-normalize');

const loadLuminEnviroment = require('./settings/env');
const { getNamespaceEnv } = require('./settings/combineEnv');

const branch = process.env.LUMIN_BRANCH || 'develop';
const env = loadLuminEnviroment(getNamespaceEnv(branch));
// Same source as settings/env.js getCoreVersion() — avoids require when lib/ not yet downloaded
const coreVersion =
  process.env.NODE_ENV === 'development' ? env.raw.CORE_VERSION || '' : '';

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;

const getStyleLoaders = (cssOptions, preProcessor, processorOptions) => {
  const loaders = [
    'style-loader',
    {
      loader: 'css-loader',
      options: cssOptions,
    },
    {
      // Options for PostCSS as we reference these options twice
      // Adds vendor prefixing based on your specified browser support in
      // package.json
      loader: 'postcss-loader',
      options: {
        // Necessary for external CSS imports to work
        // https://github.com/facebook/create-react-app/issues/2677
        postcssOptions: {
          ident: 'postcss',
          plugins: [
            // Minimal PostCSS processing in dev for speed
            require('postcss-flexbugs-fixes'),
            require('postcss-preset-env')({
              autoprefixer: {
                flexbox: 'no-2009',
              },
              stage: 3,
            }),
            // Adds PostCSS Normalize as the reset css with default options,
            // so that it honors browserslist config in package.json
            // which in turn let's users customize the target behavior as per their needs.
            postcssNormalize(),
          ],
        },
        sourceMap: true,
      },
    },
  ].filter(Boolean);
  if (preProcessor) {
    loaders.push({
      loader: preProcessor,
      options: {
        sourceMap: true,
        ...processorOptions,
      },
    });
  }
  return loaders;
};

const rspackConfig = {
  mode: 'development',
  /**
   * @link https://rspack.dev/config/devtool
   */
  devtool: process.env.LUMIN_SOURCE_MAP_CONFIG || 'eval-source-map',
  entry: {
    bundle: [
      // Note: HMR client is built-in to Rspack dev server
      path.resolve(__dirname, 'src/index.tsx'),
    ],
    offline: [path.resolve(__dirname, 'src', 'index.offline.js')],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].min.js',
    publicPath: '/',
    pathinfo: false,
    chunkFilename: '[name].min.js',
  },
  cache: true,
  ignoreWarnings: [
    (w) => w.module?.resource?.includes('sass-loader') && /deprecat/i.test(String(w.message)),
    (w) => /Dart Sass|@import|legacy JS API/i.test(String(w.message)),
  ],
  plugins: [
    !process.env.LUMIN_DISABLE_SIGN_MF &&
      new ModuleFederationPlugin({
        name: 'app_consumer',
        remotes: {
          luminsign: 'luminsign@http://localhost:3107/mf-manifest.json',
        },
      }),
    // Source maps handled by devtool option
    new rspack.IgnorePlugin({
      resourceRegExp: /\.d\.ts$/,
    }),
    new ReactRefreshRspackPlugin(),
    // Rspack equivalent of WatchIgnorePlugin - handled via watchOptions.ignored
    // TypeScript checking is built-in to Rspack, no need for ForkTsCheckerWebpackPlugin
    new rspack.HotModuleReplacementPlugin({
      // Rspack HMR is more efficient and doesn't need the same options as Webpack
    }),
    new ModuleFederationPlugin({
      name: 'app_consumer',
      exposes: {
        './tracking': path.resolve(__dirname, 'src/utils/miniAppTrackings'),
      },
      dts: false,
    }),
    new rspack.DefinePlugin(env.rawString),
    // Uncomment for bundle analysis
    // new rspack.BundleAnalyzerPlugin({
    //   openAnalyzer: true,
    // }),
  ].filter(Boolean),
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'webviewer/apis')],
        loader: 'builtin:swc-loader',
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
                  },
                ],
              ],
            },
            parser: {
              syntax: 'ecmascript',
              jsx: true,
            },
            transform: {
              react: {
                refresh: true,
                development: true,
              },
            },
          },
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|bower_components)/,
        include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'webviewer/apis')],
        loader: 'builtin:swc-loader',
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
                  },
                ],
              ],
            },
            parser: {
              syntax: 'typescript',
              tsx: true,
            },
            loose: true,
            transform: {
              react: {
                development: true,
                refresh: true,
              },
            },
          },
        },
      },
      {
        test: /\.(png|jpg|gif|mp4|webm|mov)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name].[contenthash:8][ext]',
        },
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: [{ loader: '@svgr/webpack', options: { ref: true } }],
        resourceQuery: /component/,
      },
      {
        test: /\.(svg)$/,
        type: 'asset',
        resourceQuery: { not: [/component/] },
        // Skip SVGO optimization in dev for speed
      },
      {
        test: cssRegex,
        exclude: cssModuleRegex,
        use: getStyleLoaders({
          importLoaders: 1,
          sourceMap: true,
        }),
        sideEffects: true,
      },
      {
        test: cssModuleRegex,
        use: getStyleLoaders({
          importLoaders: 1,
          sourceMap: true,
          modules: {
            mode: 'local',
            localIdentName: '[name]__[local]--[hash:base64:5]',
          },
        }),
      },
      {
        test: sassRegex,
        use: [
          ...getStyleLoaders({
            importLoaders: 3,
            sourceMap: true,
            modules: {
              auto: true,
              localIdentName: '[name]__[local]--[hash:base64:5]',
            },
          }),
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [path.resolve(__dirname, 'src/constants/styles/')],
                silenceDeprecations: ['legacy-js-api', 'import'],
              },
              implementation: require.resolve('sass'),
              additionalData: `
              @import "./node_modules/lumin-ui/dist/design-tokens/kiwi/scss/index.scss";
            `,
              sourceMap: true,
            },
          },
        ],
        sideEffects: true,
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: './fonts/[name][ext]',
        },
        // Only process essential fonts in dev
        exclude: [
          /NotoSans.*\.(ttf|eot|woff)$/, // Exclude non-woff2 Noto fonts
          /Inter.*\.(ttf|eot|woff)$/, // Exclude non-woff2 Inter fonts
        ],
      },
    ],
  },
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
      https: require.resolve('https-browserify'),
      http: require.resolve('stream-http'),
      util: require.resolve('util/'),
      process: require.resolve('process/browser.js'),
    },
    mainFields: ['module', 'jsnext:main', 'browser', 'main'],
    extensions: ['.mjs', '.tsx', '.ts', '.js', '.jsx', '.json'],
    alias: {
      src: path.resolve(__dirname, 'src/'),
      'event-listeners': path.resolve(__dirname, 'src/event-listeners/'),
      luminComponents: path.resolve(__dirname, 'src/lumin-components/'),
      'lumin-components': path.resolve(__dirname, 'src/lumin-components/'),
      hooks: path.resolve(__dirname, 'src/hooks/'),
      constants: path.resolve(__dirname, 'src/constants/'),
      helpers: path.resolve(__dirname, 'src/helpers/'),
      actions: path.resolve(__dirname, 'src/redux/actions/'),
      reducers: path.resolve(__dirname, 'src/redux/reducers/'),
      selectors: path.resolve(__dirname, 'src/redux/selectors/'),
      store: path.resolve(__dirname, 'src/redux/store/'),
      core: path.resolve(__dirname, 'src/core/'),
      graphQL: path.resolve(__dirname, 'src/graphql/'),
      utils: path.resolve(__dirname, 'src/utils/'),
      assets: path.resolve(__dirname, 'assets/'),
      js: path.resolve(__dirname, 'js/'),
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
      'lumin-ui/kiwi-icon.css': path.resolve(
        __dirname,
        'node_modules/lumin-ui/dist/kiwi-ui/font-icomoon/styles/icons.css'
      ),
      '@mf': path.resolve(__dirname, '@mf-types/'),
    },
  },
  node: false,
  watchOptions: {
    aggregateTimeout: 300,
    poll: false,
    ignored: ['**/node_modules/**', '**/lib/**', '**/build/**', '**/core/**'],
  },
  devServer: {
    client: {
      overlay: {
        runtimeErrors: (error) => !(error instanceof DOMException && error.name === 'AbortError'),
      },
    },
    liveReload: false,
    hot: true,
    port: 3000,
    host: 'localhost',
    open: true,
    compress: true,
    allowedHosts: 'all',
    historyApiFallback: {
      index: '/src/index.app.html',
      rewrites: [
        { from: /^\/offline/, to: '/src/index.offline.html' },
        { from: /.*/, to: '/src/index.app.html' },
      ],
      disableDotRule: true,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    static: [
      {
        directory: path.resolve(__dirname, 'src'),
        publicPath: '/src',
      },
      {
        directory: path.resolve(__dirname, 'i18n'),
        publicPath: '/i18n',
      },
      {
        directory: path.resolve(__dirname, 'assets'),
        publicPath: '/assets',
      },
      {
        directory: path.resolve(__dirname, 'lib/core'),
        publicPath: coreVersion ? `/${coreVersion}/core` : '/core',
      },
      {
        directory: path.resolve(__dirname, 'js'),
        publicPath: '/js',
      },
      {
        directory: path.resolve(__dirname, 'unzip'),
        publicPath: '/unzip',
      },
    ],
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.use(bodyParser.json());
      devServer.app.use(bodyParser.urlencoded({ extended: true }));

      devServer.app.get('/', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'src/index.app.html'));
      });

      devServer.app.get('/core/webviewer-core.min.js', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'lib/core/webviewer-core.min.js'));
      });

      devServer.app.get('/manifest.json', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'manifest.json'));
      });

      devServer.app.get('/source.zip', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'source.zip'));
      });

      devServer.app.get('/sw.js', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'sw.js'));
      });

      devServer.app.get('/sample-url', (req, res) => {
        res.redirect('/#d=https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf&a=1');
      });

      return middlewares;
    },
  },
};

module.exports = rspackConfig;
