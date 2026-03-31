/* eslint-disable no-magic-numbers */
/* eslint-disable sonarjs/no-duplicate-string */

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  plugins: ['@babel', 'react', 'react-hooks', 'sonarjs', 'unused-imports', 'prettier', 'import', 'json'],
  settings: {
    'json/sort-package-json': false,
    react: {
      version: 'detect',
    },
    'import/resolver': {
      webpack: {
        config: 'rspack.config.dev.js',
      },
    },
  },
  rules: {
    'max-classes-per-file': 'off',
    'sonarjs/no-duplicate-string': 'warn',
    'no-console': [
      'warn',
      {
        allow: ['warn', 'error'],
      },
    ],
    'class-methods-use-this': 'off',
    'no-dupe-keys': 'error',
    'react/require-default-props': 'off',
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
    'json/*': ['error', 'allowComments'],
    'react/no-unknown-property': ['error', { ignore: ['css'] }],
    'no-restricted-exports': 0,
    'react/function-component-definition': 0,
    'react/jsx-uses-react': 1,
    'react/jsx-uses-vars': 1,
    'react/jsx-no-duplicate-props': 1,
    'react/react-in-jsx-scope': 'error',
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.js', '.jsx', 'ts', '.tsx'],
      },
    ],
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
    'no-restricted-properties': 0,
    'no-use-before-define': [
      'error',
      {
        functions: false,
        classes: true,
        variables: true,
      },
    ],
    'react/forbid-prop-types': 0,
    'react/destructuring-assignment': 0,
    'no-underscore-dangle': 0,
    'react/jsx-props-no-spreading': 0,
    'react/no-array-index-key': 0,
    'react/jsx-wrap-multilines': 0,
    'operator-linebreak': 0,
    'react/jsx-one-expression-per-line': 0,
    'no-shadow': 0,
    'array-callback-return': 1,
    'consistent-return': 1,
    'no-return-assign': 'warn',
    'no-plusplus': 0,
    'react/state-in-constructor': 0,
    radix: 0,
    'no-async-promise-executor': 0,
    'import/no-cycle': [1, { maxDepth: 10 }],
    'import/no-self-import': 1,
    'import/prefer-default-export': 0,
    'react/no-unescaped-entities': 0,
    'react/button-has-type': 0,
    'no-param-reassign': 0,
    'no-mixed-operators': 0,
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'value-no-vendor-prefix': 'off',
    'selector-pseudo-element-colon-notation': 'off',
    'alpha-value-notation': 'off',
    'rule-empty-line-before': 'off',
    'shorthand-property-no-redundant-values': 'off',
    'length-zero-no-unit': 'off',
    'declaration-block-no-redundant-longhand-properties': 'off',
    camelcase: [
      1,
      {
        properties: 'never',
        ignoreDestructuring: true,
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
      },
    ],
    'sonarjs/cognitive-complexity': ['error', 36],
    'import/no-unresolved': 'error',
    'no-unused-vars': 'off',
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
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/no-autofocus': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': [
      'error',
      {
        handlers: ['onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
      },
    ],

    'import/extensions': 'off',
    semi: ['error', 'always'],
    'no-multiple-empty-lines': 'error',
    'object-curly-spacing': ['error', 'always'],
    'no-multi-spaces': 'error',
    'no-trailing-spaces': 'error',
    'arrow-parens': 'error',
    'react/jsx-max-props-per-line': ['error', { maximum: 4, when: 'multiline' }],
    'prettier/prettier': 'warn',
    'no-restricted-globals': [
      'error',
      {
        name: 'requestIdleCallback',
        message:
          'Use the requestIdleCallback utility function from "helpers/requestIdleCallback" instead of the global requestIdleCallback. This ensures cross-browser compatibility.',
      },
      {
        name: 'cancelIdleCallback',
        message:
          'Use the cancelIdleCallback utility function from "helpers/requestIdleCallback" instead of the global cancelIdleCallback. This ensures cross-browser compatibility.',
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@luminpdf/icons',
            message:
              'Please import icons from specific paths like "@luminpdf/icons/dist/csr/IconName" instead of the barrel export.',
          },
        ],
      },
    ],
    'import/order': [
      'error',
      {
        groups: [['external', 'builtin'], 'internal', ['parent', 'sibling'], 'index'],
        pathGroups: [
          { pattern: 'assets/**', group: 'internal', position: 'after' },
          { pattern: 'graphQL/**', group: 'internal', position: 'after' },
          { pattern: '{actions,selectors,reducers/**,store,core}', group: 'internal', position: 'after' },
          { pattern: '{screens/**,layouts/**,navigation/**}', group: 'internal', position: 'after' },
          { pattern: '{luminComponents/**,lumin-components/**}', group: 'internal', position: 'after' },
          { pattern: 'event-listeners/**', group: 'internal', position: 'after' },
          { pattern: '{HOC/**,src/HOC/**}', group: 'internal', position: 'after' },
          { pattern: '{hooks,hooks/**}', group: 'internal', position: 'after' },
          { pattern: '{services,services/**}', group: 'internal', position: 'after' },
          { pattern: '{helpers,helpers/**}', group: 'internal', position: 'after' },
          { pattern: '{utils,utils/**}', group: 'internal', position: 'after' },
          { pattern: '{@socket,@socket/**}', group: 'internal', position: 'after' },
          { pattern: '{features,features/**}', group: 'internal', position: 'after' },
          { pattern: '{constants,constants/**}', group: 'internal', position: 'after' },
          { pattern: 'interfaces/**', group: 'internal', position: 'after' },
          { pattern: '{theme-providers,theme-providers/**}', group: 'internal', position: 'after' },
          { pattern: './*.styled', group: 'sibling', position: 'after' },
          { pattern: './*.module.scss', group: 'sibling', position: 'after' },
          { pattern: './*.scss', group: 'sibling', position: 'after' },
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
  extends: [
    'eslint:recommended',
    'airbnb',
    'plugin:sonarjs/recommended',
    'prettier',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:json/recommended',
  ],
  ignorePatterns: ['node_modules', 'build', 'core/core.d.ts'],
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      settings: {
        'import/parsers': {
          '@typescript-eslint/parser': ['.js', '.ts', '.tsx'],
        },
        'import/resolver': {
          typescript: {
            project: './tsconfig.json',
            alwaysTryTypes: true,
          },
        },
      },
      rules: {
        'max-classes-per-file': 'off',
        'sonarjs/no-duplicate-string': 'warn',
        'no-console': [
          'warn',
          {
            allow: ['warn', 'error'],
          },
        ],
        'class-methods-use-this': 'off',
        'no-dupe-keys': 'error',
        'react/require-default-props': 'off',
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            checksVoidReturn: false,
          },
        ],
        '@typescript-eslint/no-unsafe-argument': 'warn',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error'],
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
        'react/forbid-prop-types': 0,
        'react/prop-types': 'off',
        'import/extensions': [
          'error',
          'ignorePackages',
          {
            js: 'never',
            jsx: 'never',
            ts: 'never',
            tsx: 'never',
          },
        ],
        '@typescript-eslint/naming-convention': 'off',
        semi: 'off',
        '@typescript-eslint/semi': ['error'],
        '@typescript-eslint/type-annotation-spacing': 'error',
        'no-multiple-empty-lines': 'error',
        'object-curly-spacing': ['error', 'always'],
        'no-multi-spaces': 'error',
        'no-trailing-spaces': 'error',
        'arrow-parens': 'error',
        'comma-dangle': [
          'error',
          {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'always-multiline',
            exports: 'never',
            functions: 'never',
          },
        ],
        'react/jsx-max-props-per-line': ['error', { maximum: 4, when: 'multiline' }],
        'prettier/prettier': 'warn',
        'react/no-unused-prop-types': 0,
        '@typescript-eslint/no-floating-promises': 'warn',
        'no-restricted-globals': [
          'error',
          {
            name: 'requestIdleCallback',
            message:
              'Use the requestIdleCallback utility function from "helpers/requestIdleCallback" instead of the global requestIdleCallback. This ensures cross-browser compatibility.',
          },
          {
            name: 'cancelIdleCallback',
            message:
              'Use the cancelIdleCallback utility function from "helpers/requestIdleCallback" instead of the global cancelIdleCallback. This ensures cross-browser compatibility.',
          },
        ],
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@luminpdf/icons',
                message:
                  'Please import icons from specific paths like "@luminpdf/icons/dist/csr/IconName" instead of the barrel export.',
              },
            ],
          },
        ],
      },
      plugins: [
        '@typescript-eslint',
        'react',
        'react-hooks',
        'sonarjs',
        'unused-imports',
        'import',
        'json',
        'prettier',
      ],
      extends: [
        'eslint:recommended',
        'plugin:sonarjs/recommended',
        'airbnb-typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'prettier',
      ],
      env: {
        jest: true,
        browser: true,
        node: true,
      },
    },
  ],
};
