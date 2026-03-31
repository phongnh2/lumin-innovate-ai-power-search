import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock HOC
jest.mock('../hoc', () => ({
  withWhitelistedUsersGuard: (Component: any) => Component,
}));

// Mock AuthorizationSection
jest.mock('../components', () => ({
  AuthorizationSection: () => require('react').createElement('div', { 'data-testid': 'authorization-section' }),
}));

import OneDriveAddInsAuthorization from '../OneDriveAddInsAuthorization';

describe('OneDriveAddInsAuthorization', () => {
  it('renders AuthorizationSection', () => {
    render(<OneDriveAddInsAuthorization />);
    expect(screen.getByTestId('authorization-section')).toBeInTheDocument();
  });
});

