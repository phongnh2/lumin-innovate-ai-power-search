/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const postcssNormalize = require('postcss-normalize');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const InjectManifest = require('workbox-webpack-plugin').InjectManifest;
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

const loadLuminEnviroment = require('./settings/env');
const { getNamespaceEnv } = require('./settings/combineEnv');
const { getEntriesSW } = require('./settings/swGetter');

const branch = process.env.LUMIN_BRANCH || 'develop';
const env = loadLuminEnviroment(getNamespaceEnv(branch));

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;

// common function to get style loaders
const getStyleLoaders = (cssOptions, preProcessor, processorOptions) => {
  const loaders = [
    require.resolve('style-loader'),
    {
      loader: require.resolve('css-loader'),
      options: cssOptions,
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
          ident: 'postcss',
          plugins: () => [
            require('postcss-preset-mantine')(),
            require('postcss-flexbugs-fixes'),
            require('postcss-preset-env')({
              autoprefixer: {
                flexbox: 'no-2009',
              },
              stage: 3,
              features: {
                'custom-properties': false,
              }
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
    loaders.push(
      {
        loader: require.resolve(preProcessor),
        options: {
          sourceMap: true,
          ...processorOptions,
        },
      }
    );
  }
  return loaders;
};

const smp = new SpeedMeasurePlugin();

const webpackConfig = {
  mode: 'development',
  /**
   * @link https://webpack.js.org/configuration/devtool/
   */
  devtool: process.env.LUMIN_SOURCE_MAP_CONFIG || 'eval',
  entry: {
    bundle: [
      'webpack-hot-middleware/client',
      path.resolve(__dirname, 'src'),
    ],
    offline: [
      'webpack-hot-middleware/client',
      path.resolve(__dirname, 'src', 'index.offline.js'),
    ]
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].min.js',
    publicPath: '/',
    pathinfo: false,
  },
  cache: {
    type: 'filesystem',
    maxMemoryGenerations: 1,
    buildDependencies: {
      config: [__filename],
    },
    compression: 'gzip',
    name: 'dev-cache',
    cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack'),
  },
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks:  false,  //
    splitChunks:  false,
    minimize:  false,  //code compression
    concatenateModules:  false,
    usedExports:  false,  // Treeshaking
  },
  ignoreWarnings: [
    (w) => w.module?.resource?.includes('sass-loader') && /deprecat/i.test(String(w.message)),
    (w) => /Dart Sass|@import|legacy JS API/i.test(String(w.message)),
  ],
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      noSources: false,
      filename: '[file].map'
    }),
    !process.env.LUMIN_DISABLE_SIGN_MF && new ModuleFederationPlugin({
      name: 'app_consumer',
      exposes: {
        './tracking': path.resolve(__dirname, 'src/utils/miniAppTrackings'),
      },
      remotes: {
        luminsign: 'luminsign@http://localhost:3107/mf-manifest.json'
      },
    }),
    new webpack.SourceMapDevToolPlugin({
      noSources: false,
      filename: '[file].map'
    }),
    new webpack.WatchIgnorePlugin({
      paths: [
        /\.d\.ts$/,
        '**/node_modules',
        '**/lib'
      ]
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
        memoryLimit: 4000,
      },
      async: true,
    }),
    new webpack.HotModuleReplacementPlugin({
      multiStep: false,
      fullBuildTimeout: 200,
      requestTimeout: 10000,
    }),
    new ReactRefreshWebpackPlugin(),
    new webpack.DefinePlugin(env.rawString),
    // new BundleAnalyzerPlugin({
    //   openAnalyzer: true,
    // }),
    // new InjectManifest({
    //     swSrc: './sw.js',
    //     swDest: 'sw.js',
    //     additionalManifestEntries: getEntriesSW().map(({ cache }) => cache),
    //     exclude: [
    //       /core\/pdf\/simple_wasm\/*/,
    //       /core\/pdf\/full\/*/,
    //       /core\/office\/*/,
    //       /fonts\/*/,
    //       /assets\/images\/*/,
    //     ],
    //     excludeChunks: ['bundle'],
    //     maximumFileSizeToCacheInBytes: 5000000000000,
    //   }),
  ].filter(Boolean),
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'swc-loader',
            options: {
              parseMap: true,
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
                  }
                }
              },
            }
          },
        ],
        exclude: /(node_modules|bower_components)/,
        include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'webviewer/apis')],
      },
      {
        test: /\.tsx?$/,
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
                    refresh: true
                  }
                }
              },
            },
          },
        ],
        exclude: /(node_modules|bower_components)/,
        include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'webviewer/apis')],
      },
      {
        test: /\.(png|jpg|gif|mp4|webm|mov)$/,
        type: 'asset/resource',
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: [{ loader: '@svgr/webpack', options: { ref: true } }],
        resourceQuery: /component/
      },
      {
        test: /\.(svg)$/,
        type: 'asset',
        resourceQuery: { not: [/component/] },
        use: [
          {
            loader: 'svgo-loader',
            options: {
              multipass: true,
              js2svg: {
                indent: 2,
                pretty: true,
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
        use: [...getStyleLoaders(
          {
            importLoaders: 3,
            sourceMap: true,
            modules: {
              auto: true,
              localIdentName: '[name]__[local]--[hash:base64:5]',
            },
          }
        ),
        {
          loader: 'sass-loader',
          options: {
            sassOptions: {
              includePaths: [path.resolve(__dirname, 'src/constants/styles/')],
              silenceDeprecations: ['legacy-js-api', 'import'],
            },
            implementation: require.resolve("sass"),
            additionalData: `
              @import "./node_modules/lumin-ui/dist/design-tokens/kiwi/scss/index.scss";
            `,
            sourceMap: true,
          },
        }],
        sideEffects: true,
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: './fonts/[name][ext]',
        },
      },
    ],
  },
  node: false,
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
      'lumin-ui/kiwi-icon.css': path.resolve(__dirname, 'node_modules/lumin-ui/dist/kiwi-ui/font-icomoon/styles/icons.css'),
      '@mf': path.resolve(__dirname, '@mf-types/'),
    },
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: false,
    ignored: /^(node_modules|lib|build|core)/,
  },
};

/**
 * DON'T REMOVE THIS LINE
 * We use it to test start time performance
 */
// module.exports = smp.wrap(webpackConfig);
module.exports = webpackConfig;
