/* eslint-disable no-magic-numbers */
/* eslint-disable sonarjs/no-duplicate-string */

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-env'],
    },
  },
  env: {
    node: true,
    browser: false,
    jest: false,
  },
  plugins: ['@babel', 'sonarjs', 'unused-imports', 'prettier', 'import'],
  extends: ['eslint:recommended', 'plugin:sonarjs/recommended', 'prettier', 'plugin:import/recommended'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js'],
      },
    },
  },
  rules: {
    // Electron-specific rules
    'no-console': 'off', // Allow console in Electron main process
    'no-restricted-globals': 'off', // Allow Electron globals
    'import/no-extraneous-dependencies': [
      'warn',
      {
        devDependencies: false,
        optionalDependencies: false,
        peerDependencies: false,
      },
    ],

    // CommonJS specific rules
    'import/no-commonjs': 'off',
    'import/no-amd': 'off',

    // Node.js specific rules
    'no-process-env': 'off', // Allow process.env in Electron
    'no-process-exit': 'off', // Allow process.exit in Electron

    // Relaxed rules for Electron
    'class-methods-use-this': 'off',
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'consistent-return': 'off',
    'no-plusplus': 'off',
    radix: 'off',
    'no-async-promise-executor': 'off',
    'no-mixed-operators': 'off',
    'no-magic-numbers': [
      'warn',
      {
        ignore: [0, -1, 1, 2],
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true,
        enforceConst: true,
        ignoreClassFieldInitialValues: true,
      },
    ],

    // Code quality rules
    'sonarjs/no-duplicate-string': 'warn',
    'sonarjs/cognitive-complexity': ['error', 36],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],

    // Import organization
    'import/order': [
      'error',
      {
        groups: [['external', 'builtin'], 'internal', ['parent', 'sibling'], 'index'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-cycle': [1, { maxDepth: 10 }],
    'import/no-self-import': 1,
    'import/prefer-default-export': 0,
    'import/no-unresolved': 'error',
    'import/extensions': 'off',

    // Formatting rules
    'max-len': [
      'error',
      {
        code: 120,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    semi: ['error', 'always'],
    'no-multiple-empty-lines': 'error',
    'object-curly-spacing': ['error', 'always'],
    'no-multi-spaces': 'error',
    'no-trailing-spaces': 'error',
    'arrow-parens': 'error',
    'prettier/prettier': 'warn',

    // General code quality
    'no-dupe-keys': 'error',
    'array-callback-return': 1,
    'no-return-assign': 'warn',
    'no-unused-expressions': 'off',
    camelcase: [
      1,
      {
        properties: 'never',
        ignoreDestructuring: true,
      },
    ],
    'no-use-before-define': [
      'error',
      {
        functions: false,
        classes: true,
        variables: true,
      },
    ],
    'no-shadow': 0,
    'no-restricted-properties': 0,
  },
  ignorePatterns: ['node_modules', 'build', 'dist'],
};
