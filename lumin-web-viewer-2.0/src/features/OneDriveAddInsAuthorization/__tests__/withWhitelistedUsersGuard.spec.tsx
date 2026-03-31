import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mutable mock user state
const mockUserState = {
  user: null as any,
};

// Mock hooks
jest.mock('hooks', () => ({
  useGetCurrentUser: () => mockUserState.user,
}));

// Mock NonWhitelistedSection
jest.mock('../components', () => ({
  NonWhitelistedSection: () => require('react').createElement('div', { 'data-testid': 'non-whitelisted-section' }),
}));

import withWhitelistedUsersGuard from '../hoc/withWhitelistedUsersGuard';

describe('withWhitelistedUsersGuard', () => {
  const MockComponent = () => <div data-testid="wrapped-component">Wrapped Content</div>;
  const WrappedComponent = withWhitelistedUsersGuard(MockComponent);

  beforeEach(() => {
    mockUserState.user = null;
  });

  it('returns null when currentUser is null', () => {
    mockUserState.user = null;
    const { container } = render(<WrappedComponent />);
    expect(container.innerHTML).toBe('');
  });

  it('renders NonWhitelistedSection when user is not whitelisted', () => {
    mockUserState.user = { _id: 'user-1', isOneDriveAddInsWhitelisted: false };
    render(<WrappedComponent />);
    expect(screen.getByTestId('non-whitelisted-section')).toBeInTheDocument();
  });

  it('renders wrapped component when user is whitelisted', () => {
    mockUserState.user = { _id: 'user-1', isOneDriveAddInsWhitelisted: true };
    render(<WrappedComponent />);
    expect(screen.getByTestId('wrapped-component')).toBeInTheDocument();
  });

  it('does not render wrapped component when not whitelisted', () => {
    mockUserState.user = { _id: 'user-1', isOneDriveAddInsWhitelisted: false };
    render(<WrappedComponent />);
    expect(screen.queryByTestId('wrapped-component')).not.toBeInTheDocument();
  });

  it('passes props to wrapped component', () => {
    mockUserState.user = { _id: 'user-1', isOneDriveAddInsWhitelisted: true };
    const PropsComponent = (props: any) => <div data-testid="props-component" data-custom={props.custom}>Props</div>;
    const Wrapped = withWhitelistedUsersGuard(PropsComponent);
    render(<Wrapped custom="value" />);
    expect(screen.getByTestId('props-component')).toHaveAttribute('data-custom', 'value');
  });
});

