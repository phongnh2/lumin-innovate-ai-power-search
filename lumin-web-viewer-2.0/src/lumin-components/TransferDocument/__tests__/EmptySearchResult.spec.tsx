import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('hooks', () => ({
  useThemeMode: () => 'light',
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('assets/reskin/images/no-results-found-dark.png', () => 'no-results-found-dark.png');
jest.mock('assets/reskin/images/no-results-found.png', () => 'no-results-found.png');

jest.mock('lumin-ui/kiwi-ui', () => ({
  Text: ({ children, type, size }: React.PropsWithChildren<{ type: string; size: string }>) =>
    require('react').createElement('span', { 'data-testid': `text-${type}-${size}` }, children),
}));

jest.mock('luminComponents/TransferDocument/components/EmptySearchResult/EmptySearchResult.module.scss', () => ({
  container: 'container',
  image: 'image',
  contentWrapper: 'contentWrapper',
}));

jest.mock('constants/lumin-common', () => ({ THEME_MODE: { DARK: 'dark', LIGHT: 'light' } }));

// Use named import
import { EmptySearchResult } from 'luminComponents/TransferDocument/components/EmptySearchResult';

describe('EmptySearchResult', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should render container', () => {
    const { container } = render(<EmptySearchResult />);
    expect(container.querySelector('.container')).toBeInTheDocument();
  });

  it('should render image', () => {
    render(<EmptySearchResult />);
    expect(screen.getByAltText('No results found')).toBeInTheDocument();
  });

  it('should render no result text', () => {
    render(<EmptySearchResult />);
    expect(screen.getByTestId('text-title-md')).toHaveTextContent('searchDocument.noResult');
  });

  it('should render try again text', () => {
    render(<EmptySearchResult />);
    expect(screen.getByTestId('text-body-md')).toHaveTextContent('searchDocument.tryAgain');
  });
});
