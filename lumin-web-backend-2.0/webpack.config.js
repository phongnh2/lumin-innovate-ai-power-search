const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

// ***************** Webpack Config Variables ************************

const OUTPUT_FOLDER = 'dist';
const PROJECT_NAME = 'lumin-web-backend-2.0';
const EMAIL_PATH = './src/Email';

// ******************** Development Plugins **************************

const devPlugins = [
  new ForkTsCheckerWebpackPlugin(),
  new webpack.WatchIgnorePlugin({
    paths: [
      /node_modules/,
      /.*\.d\.ts$/,
      /.*\.(test|spec).ts$/,
      /graphql.schema.ts$/,
    ],
  }),
  /**
   * Set the signal to be true for sending system signal `SIGUSR2`.
   * Purpose: call `app.close()` to kill all running processes/ports (websocket, gRPC,...).
   */
  new RunScriptWebpackPlugin({ name: 'main.js', autoRestart: true, signal: true }),
];

// *********************** Webpack Configuration *****************************

module.exports = (_, argv) => {
  const mode = argv.mode || 'development';
  const isDevelopment = mode === 'development';
  if (isDevelopment) {
    Dotenv.config();
  }
  return {
    mode,
    devtool: isDevelopment ? 'inline-source-map' : 'source-map',
    name: PROJECT_NAME,
    target: 'node',
    cache: isDevelopment ? {
      type: 'memory',
    } : {
      type: 'filesystem',
      allowCollectingMemory: true,
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: path.join(process.cwd(), '.cache'),
      maxAge: 86400000, // a day
      profile: true,
    },
    entry: './src/main.ts',
    output: {
      path: path.join(process.cwd(), OUTPUT_FOLDER),
      filename: 'main.js',
      clean: true,
    },
    externalsPresets: { node: true },
    externals: [nodeExternals()],
    module: {
      rules: [{
        test: /.ts$/,
        use: [{
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        }],
      }],
    },
    node: {
      global: false,
      __filename: false,
      __dirname: false,
    },
    resolve: {
      plugins: [
        new TsconfigPathsPlugin(),
      ],
      extensions: ['.ts', '.js'],
    },
    plugins: [
      ...(isDevelopment ? devPlugins : []),
      new CopyWebpackPlugin({
        patterns: [
          { from: `${EMAIL_PATH}/mjml/html`, to: 'mjml/html' },
        ],
        options: {
          concurrency: 50,
        },
      }),
      new webpack.BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true,
        entryOnly: false,
      }),
    ],
    stats: {
      modulesSpace: 9999,
      modules: !isDevelopment,
      groupModulesByPath: true,
      nestedModules: false,
      cached: true,
      colors: isDevelopment,
      errorDetails: true,
      logging: !isDevelopment,
      timings: true,
      builtAt: true,
    },
    optimization: {
      minimize: false,
    },
  };
};
