/* eslint-disable */
const { env } = require('./settings/getEnv');
const isDevelopment = env.raw.NODE_ENV === 'development';
const isProduction = env.raw.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test';
const isTest = process.env.NODE_ENV === 'test';

const presets = [];
const plugins = [];

if (isDevelopment) {
  presets.push([
    '@babel/preset-env',
    {
      targets: ['defaults', 'not IE 11'],
    },
  ]);
  plugins.push(
    [
      'babel-plugin-styled-components',
      {
        displayName: true,
        minify: false,
        transpileTemplateLiterals: false,
      },
    ],
    ['react-refresh/babel']
  );
}

if (isProduction) {
  presets.push(['@babel/preset-env', {
    targets: ['defaults', 'not IE 11', 'safari >= 14'],
    
  }]);
  plugins.push(
    [
      'import',
      {
        libraryName: 'lodash',
        libraryDirectory: '',
        camel2DashComponentName: false,
      },
      'lodash',
    ],
    [
      'import',
      {
        libraryName: '@mui/material',
        libraryDirectory: 'esm',
        camel2DashComponentName: false,
      },
      'material-core',
    ],
  );
  plugins.push('transform-react-remove-prop-types', '@babel/plugin-transform-private-methods');
}

if (isTest) {
  presets.push(['@babel/preset-env', { modules: 'commonjs' }]);
  plugins.push([
    'import',
    {
      libraryName: '@mui/material',
      libraryDirectory: '',
      camel2DashComponentName: false,
    },
    'material-core',
  ]);
  plugins.push('@babel/plugin-transform-private-methods');
}

presets.push([
  '@babel/preset-react',
  {
    runtime: 'automatic',
  },
]);
presets.push('@babel/preset-typescript');
plugins.push(
  '@babel/plugin-syntax-dynamic-import',
  '@babel/plugin-syntax-import-meta',
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-proposal-json-strings',
  '@babel/plugin-proposal-optional-chaining',
  [
    '@babel/plugin-proposal-decorators',
    {
      legacy: true,
    },
  ],
  '@babel/plugin-proposal-function-sent',
  '@babel/plugin-proposal-export-namespace-from',
  '@babel/plugin-proposal-numeric-separator',
  '@babel/plugin-proposal-throw-expressions',
  '@babel/plugin-proposal-nullish-coalescing-operator',
  [
    '@babel/plugin-transform-runtime',
    {
      regenerator: true,
    },
  ]
);

module.exports = {
  presets,
  plugins,
};
