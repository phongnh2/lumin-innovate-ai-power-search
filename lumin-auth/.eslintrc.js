module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'sonarjs', 'unused-imports', 'import'],
  extends: [
    'next/core-web-vitals',
    'prettier',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:sonarjs/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  rules: {
    'import/order': [
      'error',
      {
        warnOnUnassignedImports: true,
        'newlines-between': 'always',
        groups: ['external', 'builtin', 'internal', 'parent', 'sibling', 'index'],
        pathGroups: [
          {
            pattern: './*.styled',
            group: 'sibling',
            position: 'after'
          }
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ],
    'react/self-closing-comp': [
      'error',
      {
        component: true,
        html: true
      }
    ],
    'react-hooks/rules-of-hooks': 'error',
    'react/display-name': 'off',
    'react/no-unknown-property': ['error', { ignore: ['css'] }],
    camelcase: 'off',
    'react/destructuring-assignment': ['warn'],
    'react/require-default-props': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        typedefs: false,
        functions: false
      }
    ],
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'max-len': ['error', 160],
    'no-restricted-exports': 'off',
    'import/no-cycle': 'error',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/no-unresolved': 'error',
    'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': ['error', { vars: 'all', varsIgnorePattern: '^_', args: 'all', argsIgnorePattern: '^_' }],
    'react/jsx-props-no-spreading': 'warn',
    'react/no-array-index-key': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'class-methods-use-this': 'off'
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      }
    }
  },
  globals: {
    JSX: 'readonly'
  }
};
