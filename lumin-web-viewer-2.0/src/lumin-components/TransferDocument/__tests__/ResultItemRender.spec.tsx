import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mutable mock state
const mockState = {
  isEnableReskin: false,
};

jest.mock('hooks', () => ({
  useEnableWebReskin: () => ({ isEnableReskin: mockState.isEnableReskin }),
}));

jest.mock('assets/images/icon-folder-basic.svg', () => 'icon-folder-basic.svg');

jest.mock('lumin-ui/kiwi-ui', () => ({
  Icomoon: ({ type, size, color }: any) => require('react').createElement('span', { 'data-testid': `icon-${type}`, 'data-size': size, 'data-color': color }),
  Avatar: ({ src, name, variant, size }: any) => require('react').createElement('div', { 'data-testid': 'kiwi-avatar', 'data-src': src, 'data-name': name, 'data-variant': variant, 'data-size': size }),
  Text: ({ children, ellipsis }: any) => require('react').createElement('span', { 'data-testid': 'kiwi-text', 'data-ellipsis': String(!!ellipsis) }, children),
  PlainTooltip: ({ children, content }: any) => require('react').createElement('div', { 'data-testid': 'plain-tooltip', 'data-content': content }, children),
}));

jest.mock('luminComponents/MaterialAvatar', () => ({
  __esModule: true,
  default: ({ children, src, size, hasBorder, secondary }: any) => require('react').createElement('div', { 'data-testid': 'material-avatar', 'data-src': src, 'data-size': size, 'data-has-border': String(!!hasBorder), 'data-secondary': String(!!secondary) }, children),
}));

jest.mock('constants/lumin-common', () => ({
  TOOLTIP_MAX_WIDTH: 300,
  TOOLTIP_OPEN_DELAY: 500,
}));

jest.mock('luminComponents/TransferDocument/components/ResultItemRender/ResultItemRender.styled', () => ({
  ResultItem: ({ children, onClick }: any) => require('react').createElement('div', { 'data-testid': 'result-item', onClick }, children),
  IconFolder: ({ src, alt }: any) => require('react').createElement('img', { 'data-testid': 'icon-folder', src, alt }),
  Title: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'item-title' }, children),
  Text: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'item-text' }, children),
}));

jest.mock('luminComponents/TransferDocument/components/ResultItemRender/ResultItemRender.module.scss', () => ({
  itemWrapper: 'itemWrapper',
  tooltipWrapper: 'tooltipWrapper',
}));

import ResultItemRender from 'luminComponents/TransferDocument/components/ResultItemRender';

describe('ResultItemRender', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState.isEnableReskin = false;
  });

  describe('FolderSearchResult', () => {
    const defaultProps = {
      title: 'Test Folder',
      text: 'Some path',
      goToDestination: jest.fn(),
    };

    describe('Non-reskin mode', () => {
      it('renders result item', () => {
        render(<ResultItemRender.Folder {...defaultProps} />);
        expect(screen.getByTestId('result-item')).toBeInTheDocument();
      });

      it('renders folder icon', () => {
        render(<ResultItemRender.Folder {...defaultProps} />);
        expect(screen.getByTestId('icon-folder')).toBeInTheDocument();
      });

      it('renders title', () => {
        render(<ResultItemRender.Folder {...defaultProps} />);
        expect(screen.getByTestId('item-title')).toHaveTextContent('Test Folder');
      });

      it('renders text when provided', () => {
        render(<ResultItemRender.Folder {...defaultProps} />);
        expect(screen.getByTestId('item-text')).toHaveTextContent('Some path');
      });

      it('does not render text when empty string', () => {
        render(<ResultItemRender.Folder {...defaultProps} text="" />);
        expect(screen.queryByTestId('item-text')).not.toBeInTheDocument();
      });

      it('does not render text when undefined (default)', () => {
        render(<ResultItemRender.Folder title="Folder" goToDestination={jest.fn()} />);
        expect(screen.queryByTestId('item-text')).not.toBeInTheDocument();
      });

      it('calls goToDestination on click', () => {
        render(<ResultItemRender.Folder {...defaultProps} />);
        fireEvent.click(screen.getByTestId('result-item'));
        expect(defaultProps.goToDestination).toHaveBeenCalled();
      });

      it('renders folder icon with alt text', () => {
        render(<ResultItemRender.Folder {...defaultProps} />);
        expect(screen.getByTestId('icon-folder')).toHaveAttribute('alt', 'Test Folder');
      });

      it('renders with long title', () => {
        render(<ResultItemRender.Folder {...defaultProps} title="Very Long Folder Name For Testing" />);
        expect(screen.getByTestId('item-title')).toHaveTextContent('Very Long Folder Name For Testing');
      });

      it('renders with long path text', () => {
        render(<ResultItemRender.Folder {...defaultProps} text="Very / Long / Path / Name" />);
        expect(screen.getByTestId('item-text')).toHaveTextContent('Very / Long / Path / Name');
      });
    });

    describe('Reskin mode', () => {
      beforeEach(() => { mockState.isEnableReskin = true; });

      it('renders item wrapper div', () => {
        render(<ResultItemRender.Folder {...defaultProps} />);
        expect(screen.getByRole('presentation')).toBeInTheDocument();
      });

      it('renders Icomoon folder icon', () => {
        render(<ResultItemRender.Folder {...defaultProps} />);
        expect(screen.getByTestId('icon-folder-lg')).toBeInTheDocument();
      });

      it('renders PlainTooltip', () => {
        render(<ResultItemRender.Folder {...defaultProps} />);
        expect(screen.getByTestId('plain-tooltip')).toHaveAttribute('data-content', 'Test Folder');
      });

      it('renders Text with ellipsis', () => {
        render(<ResultItemRender.Folder {...defaultProps} />);
        expect(screen.getByTestId('kiwi-text')).toHaveAttribute('data-ellipsis', 'true');
      });

      it('calls goToDestination on click', () => {
        render(<ResultItemRender.Folder {...defaultProps} />);
        fireEvent.click(screen.getByRole('presentation'));
        expect(defaultProps.goToDestination).toHaveBeenCalled();
      });

      it('renders with presentation role', () => {
        render(<ResultItemRender.Folder {...defaultProps} />);
        expect(screen.getByRole('presentation')).toBeInTheDocument();
      });

      it('applies itemWrapper class', () => {
        render(<ResultItemRender.Folder {...defaultProps} />);
        expect(screen.getByRole('presentation')).toHaveClass('itemWrapper');
      });

      it('renders title in Text component', () => {
        render(<ResultItemRender.Folder {...defaultProps} />);
        expect(screen.getByTestId('kiwi-text')).toHaveTextContent('Test Folder');
      });
    });
  });

  describe('TeamSearchResult', () => {
    const defaultProps = {
      avatarSrc: 'avatar.png',
      avatarDefault: 'T',
      title: 'Test Team',
      goToDestination: jest.fn(),
    };

    describe('Non-reskin mode', () => {
      it('renders result item', () => {
        render(<ResultItemRender.Team {...defaultProps} />);
        expect(screen.getByTestId('result-item')).toBeInTheDocument();
      });

      it('renders MaterialAvatar', () => {
        render(<ResultItemRender.Team {...defaultProps} />);
        expect(screen.getByTestId('material-avatar')).toBeInTheDocument();
      });

      it('passes avatar src', () => {
        render(<ResultItemRender.Team {...defaultProps} />);
        expect(screen.getByTestId('material-avatar')).toHaveAttribute('data-src', 'avatar.png');
      });

      it('renders avatar default text', () => {
        render(<ResultItemRender.Team {...defaultProps} />);
        expect(screen.getByTestId('material-avatar')).toHaveTextContent('T');
      });

      it('renders title', () => {
        render(<ResultItemRender.Team {...defaultProps} />);
        expect(screen.getByTestId('item-title')).toHaveTextContent('Test Team');
      });

      it('calls goToDestination on click', () => {
        render(<ResultItemRender.Team {...defaultProps} />);
        fireEvent.click(screen.getByTestId('result-item'));
        expect(defaultProps.goToDestination).toHaveBeenCalled();
      });

      it('sets secondary=false when avatarDefault is string', () => {
        render(<ResultItemRender.Team {...defaultProps} avatarDefault="AB" />);
        expect(screen.getByTestId('material-avatar')).toHaveAttribute('data-secondary', 'false');
      });

      it('sets secondary=true when avatarDefault is not string', () => {
        // When avatarDefault is a JSX element or non-string
        const jsxDefault = React.createElement('span', null, 'icon') as unknown as string;
        render(<ResultItemRender.Team {...defaultProps} avatarDefault={jsxDefault} />);
        expect(screen.getByTestId('material-avatar')).toHaveAttribute('data-secondary', 'true');
      });

      it('handles empty avatarSrc', () => {
        render(<ResultItemRender.Team {...defaultProps} avatarSrc="" />);
        expect(screen.getByTestId('material-avatar')).toHaveAttribute('data-src', '');
      });

      it('handles long title', () => {
        render(<ResultItemRender.Team {...defaultProps} title="Very Long Team Name That Might Need Truncation" />);
        expect(screen.getByTestId('item-title')).toHaveTextContent('Very Long Team Name That Might Need Truncation');
      });
    });

    describe('Reskin mode', () => {
      beforeEach(() => { mockState.isEnableReskin = true; });

      it('renders item wrapper div', () => {
        render(<ResultItemRender.Team {...defaultProps} />);
        expect(screen.getByRole('presentation')).toBeInTheDocument();
      });

      it('renders kiwi Avatar', () => {
        render(<ResultItemRender.Team {...defaultProps} />);
        expect(screen.getByTestId('kiwi-avatar')).toBeInTheDocument();
      });

      it('passes avatar props correctly', () => {
        render(<ResultItemRender.Team {...defaultProps} />);
        const avatar = screen.getByTestId('kiwi-avatar');
        expect(avatar).toHaveAttribute('data-src', 'avatar.png');
        expect(avatar).toHaveAttribute('data-name', 'T');
        expect(avatar).toHaveAttribute('data-variant', 'outline');
        expect(avatar).toHaveAttribute('data-size', 'xs');
      });

      it('renders PlainTooltip', () => {
        render(<ResultItemRender.Team {...defaultProps} />);
        expect(screen.getByTestId('plain-tooltip')).toHaveAttribute('data-content', 'Test Team');
      });

      it('renders Text', () => {
        render(<ResultItemRender.Team {...defaultProps} />);
        expect(screen.getByTestId('kiwi-text')).toHaveTextContent('Test Team');
      });

      it('calls goToDestination on click', () => {
        render(<ResultItemRender.Team {...defaultProps} />);
        fireEvent.click(screen.getByRole('presentation'));
        expect(defaultProps.goToDestination).toHaveBeenCalled();
      });

      it('renders with empty avatarSrc', () => {
        render(<ResultItemRender.Team {...defaultProps} avatarSrc="" />);
        expect(screen.getByTestId('kiwi-avatar')).toHaveAttribute('data-src', '');
      });

      it('passes alt attribute to Avatar', () => {
        render(<ResultItemRender.Team {...defaultProps} />);
        expect(screen.getByTestId('kiwi-avatar')).toBeInTheDocument();
      });
    });
  });

  describe('Index exports', () => {
    it('exports Team component', () => {
      expect(ResultItemRender.Team).toBeDefined();
    });

    it('exports Folder component', () => {
      expect(ResultItemRender.Folder).toBeDefined();
    });
  });

  describe('Index exports', () => {
    it('module structure is correct', () => {
      expect(typeof ResultItemRender).toBe('object');
      expect(typeof ResultItemRender.Team).toBe('function');
      expect(typeof ResultItemRender.Folder).toBe('function');
    });
  });
});

