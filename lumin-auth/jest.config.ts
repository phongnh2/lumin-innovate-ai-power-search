/* eslint-disable sonarjs/no-duplicate-string */
/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './'
});

const config: Config = {
  automock: false,
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'services/auth.service.ts',
    'pages/api/auth/[[...params]].ts',
    'lib/grpc/services/auth.ts',
    'lib/grpc/services/kratos.ts',
    'hooks/auth/useSignUp.ts',
    'hooks/auth/useForceLogout.ts',
    'hooks/auth/useResendVerificationMail.ts',
    'lib/use-sign-up-form.ts',
    'features/account/account-api-slice.ts',
    'features/account/account-slice.ts',
    'lib/yup/auth-schema.ts',
    'components/SignUpPage/SignUpPage.tsx',
    'components/SignInPage/SignInPage.tsx',
    'components/SignAuth/SignUpInvitationForm/SignUpInvitationForm.tsx',
    'components/ForgotPasswordPage/ForgotPasswordPage.tsx',
    'components/ForgotPasswordPage/hooks/useForgotPassword.ts',
    'components/VerificationPage/VerificationPage.tsx'
  ],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageReporters: ['json-summary', 'text', 'lcov', 'clover'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(png|jpg|jpeg|gif|webp|svg)(\\?url)?$': '<rootDir>/__mocks__/fileMock.js'
  },
  rootDir: './',
  roots: ['<rootDir>'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: ['/node_modules/', '\\.pnp\\.[^\\/]+$']
};

export default createJestConfig(config);
