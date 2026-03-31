import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('lumin-ui/kiwi-ui', () => {
  const R = require('react');
  return {
    Tabs: Object.assign(
      ({ children, value, onChange, mb }: any) => R.createElement('div', { 'data-testid': 'tabs', 'data-value': value, 'data-mb': mb }, children),
      {
        List: ({ children, pl, className }: any) => R.createElement('div', { 'data-testid': 'tabs-list', 'data-pl': pl, className }, children),
        Tab: ({ children, value, rightSection }: any) => R.createElement('button', { 'data-testid': `tab-${value}`, type: 'button' }, children, rightSection),
      }
    ),
    NotiBadge: ({ label, labelColor, backgroundColor, size }: any) => R.createElement('span', {
      'data-testid': 'noti-badge',
      'data-label': label,
      'data-label-color': labelColor,
      'data-bg-color': backgroundColor,
      'data-size': size,
    }, label),
    Text: ({ children, type, size }: any) => R.createElement('span', { 'data-testid': 'text', 'data-type': type, 'data-size': size }, children),
  };
});

jest.mock('luminComponents/TransferDocument/constants/moveDocumentConstant', () => ({
  ResultTabs: { TEAMS: 'TEAMS', FOLDERS: 'FOLDERS' },
}));

jest.mock('luminComponents/TransferDocument/components/SearchResultHeader/SearchResultHeader.module.scss', () => ({
  tabsList: 'tabsList',
}));

import { SearchResultHeader } from 'luminComponents/TransferDocument/components/SearchResultHeader';

describe('SearchResultHeader', () => {
  const defaultProps = {
    tab: 'TEAMS' as const,
    onTabChange: jest.fn(),
    teamResults: [{ _id: 't1', name: 'Team 1' }, { _id: 't2', name: 'Team 2' }] as any[],
    folderResults: [{ _id: 'f1', name: 'Folder 1' }] as any[],
    orgResults: [{ _id: 'o1', name: 'Org 1' }] as any[],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders tabs container', () => {
      render(<SearchResultHeader {...defaultProps} />);
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });

    it('renders tabs list', () => {
      render(<SearchResultHeader {...defaultProps} />);
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
    });

    it('renders teams tab', () => {
      render(<SearchResultHeader {...defaultProps} />);
      expect(screen.getByTestId('tab-TEAMS')).toBeInTheDocument();
    });

    it('renders folders tab', () => {
      render(<SearchResultHeader {...defaultProps} />);
      expect(screen.getByTestId('tab-FOLDERS')).toBeInTheDocument();
    });

    it('renders sidebar.spaces text for teams', () => {
      render(<SearchResultHeader {...defaultProps} />);
      expect(screen.getByText('sidebar.spaces')).toBeInTheDocument();
    });

    it('renders common.folders text', () => {
      render(<SearchResultHeader {...defaultProps} />);
      expect(screen.getByText('common.folders')).toBeInTheDocument();
    });
  });

  describe('Badges', () => {
    it('shows combined team and org count in teams badge', () => {
      render(<SearchResultHeader {...defaultProps} />);
      const badges = screen.getAllByTestId('noti-badge');
      // teamResults.length + orgResults.length = 2 + 1 = 3
      expect(badges[0]).toHaveAttribute('data-label', '3');
    });

    it('shows folder count in folders badge', () => {
      render(<SearchResultHeader {...defaultProps} />);
      const badges = screen.getAllByTestId('noti-badge');
      expect(badges[1]).toHaveAttribute('data-label', '1');
    });

    it('shows 0 when no teams or orgs', () => {
      render(<SearchResultHeader {...defaultProps} teamResults={[]} orgResults={[]} />);
      const badges = screen.getAllByTestId('noti-badge');
      expect(badges[0]).toHaveAttribute('data-label', '0');
    });

    it('shows 0 when no folders', () => {
      render(<SearchResultHeader {...defaultProps} folderResults={[]} />);
      const badges = screen.getAllByTestId('noti-badge');
      expect(badges[1]).toHaveAttribute('data-label', '0');
    });
  });

  describe('Badge Colors', () => {
    it('uses primary color for active tab badge', () => {
      render(<SearchResultHeader {...defaultProps} tab="TEAMS" />);
      const badges = screen.getAllByTestId('noti-badge');
      expect(badges[0]).toHaveAttribute('data-bg-color', 'var(--kiwi-colors-core-primary)');
    });

    it('uses variant color for inactive tab badge', () => {
      render(<SearchResultHeader {...defaultProps} tab="TEAMS" />);
      const badges = screen.getAllByTestId('noti-badge');
      expect(badges[1]).toHaveAttribute('data-bg-color', 'var(--kiwi-colors-surface-on-surface-variant)');
    });

    it('uses primary color for folders when active', () => {
      render(<SearchResultHeader {...defaultProps} tab="FOLDERS" />);
      const badges = screen.getAllByTestId('noti-badge');
      expect(badges[1]).toHaveAttribute('data-bg-color', 'var(--kiwi-colors-core-primary)');
    });

    it('uses variant color for teams when folders active', () => {
      render(<SearchResultHeader {...defaultProps} tab="FOLDERS" />);
      const badges = screen.getAllByTestId('noti-badge');
      expect(badges[0]).toHaveAttribute('data-bg-color', 'var(--kiwi-colors-surface-on-surface-variant)');
    });
  });

  describe('Current Tab', () => {
    it('passes TEAMS value to tabs', () => {
      render(<SearchResultHeader {...defaultProps} tab="TEAMS" />);
      expect(screen.getByTestId('tabs')).toHaveAttribute('data-value', 'TEAMS');
    });

    it('passes FOLDERS value to tabs', () => {
      render(<SearchResultHeader {...defaultProps} tab="FOLDERS" />);
      expect(screen.getByTestId('tabs')).toHaveAttribute('data-value', 'FOLDERS');
    });
  });

  describe('Spacing', () => {
    it('sets margin bottom on tabs', () => {
      render(<SearchResultHeader {...defaultProps} />);
      expect(screen.getByTestId('tabs')).toHaveAttribute('data-mb', 'var(--kiwi-spacing-1)');
    });

    it('sets padding left on tabs list', () => {
      render(<SearchResultHeader {...defaultProps} />);
      expect(screen.getByTestId('tabs-list')).toHaveAttribute('data-pl', 'var(--kiwi-spacing-2)');
    });
  });

  describe('Text Labels', () => {
    it('renders label md type for spaces', () => {
      render(<SearchResultHeader {...defaultProps} />);
      const texts = screen.getAllByTestId('text');
      expect(texts[0]).toHaveAttribute('data-type', 'label');
      expect(texts[0]).toHaveAttribute('data-size', 'md');
    });

    it('renders label md type for folders', () => {
      render(<SearchResultHeader {...defaultProps} />);
      const texts = screen.getAllByTestId('text');
      expect(texts[1]).toHaveAttribute('data-type', 'label');
      expect(texts[1]).toHaveAttribute('data-size', 'md');
    });
  });

  describe('Badge Size', () => {
    it('uses lg size for badges', () => {
      render(<SearchResultHeader {...defaultProps} />);
      const badges = screen.getAllByTestId('noti-badge');
      expect(badges[0]).toHaveAttribute('data-size', 'lg');
      expect(badges[1]).toHaveAttribute('data-size', 'lg');
    });
  });
});

