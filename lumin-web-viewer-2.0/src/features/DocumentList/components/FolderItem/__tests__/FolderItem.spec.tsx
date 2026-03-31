import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock classnames
jest.mock('classnames', () => (...args: any[]) => {
  const result: string[] = [];
  args.forEach(arg => {
    if (typeof arg === 'string' && arg) result.push(arg);
    else if (typeof arg === 'object' && arg !== null) {
      Object.entries(arg).forEach(([key, val]) => { if (val) result.push(key); });
    }
  });
  return result.join(' ');
});

// Mock hooks
jest.mock('hooks', () => ({
  useGetCurrentUser: () => ({ _id: 'user-123' }),
}));

jest.mock('hooks/useKeyboardAccessibility', () => ({
  __esModule: true,
  default: () => ({ onKeyDown: jest.fn() }),
}));

// Mock useFolderActions
const mockFolderActions = {
  open: jest.fn(),
  viewInfo: jest.fn(),
  rename: jest.fn(),
  markFavorite: jest.fn(),
  remove: jest.fn(),
};

jest.mock('features/DocumentList/hooks/useFolderActions', () => ({
  __esModule: true,
  default: () => ({ actions: mockFolderActions }),
}));

// Mock useChatbotStore
jest.mock('features/WebChatBot/hooks/useChatbotStore', () => ({
  useChatbotStore: () => ({ isVisible: false }),
}));

// Mock styles
jest.mock('../FolderItem.module.scss', () => ({
  container: 'container',
  selected: 'selected',
  quickActionsWrapper: 'quickActionsWrapper',
  visibleWrapper: 'visibleWrapper',
  hiddenWrapper: 'hiddenWrapper',
  moreActionsWrapper: 'moreActionsWrapper',
  activated: 'activated',
}));

import FolderItem from '../FolderItem';

describe('FolderItem', () => {
  const mockFolder = {
    _id: 'folder-123',
    name: 'Test Folder',
    listUserStar: ['user-123'],
    belongsTo: { type: 'personal', location: { _id: 'loc-1' } },
  };

  const mockChildren = jest.fn(({ renderHiddenElement, renderMoreActionsElement, actions, isStarred }) => (
    <div data-testid="children-content">
      <span data-testid="is-starred">{String(isStarred)}</span>
      {renderHiddenElement(
        <span data-testid="visible-element">Visible</span>,
        <span data-testid="hidden-element">Hidden</span>
      )}
      {renderMoreActionsElement(
        <button data-testid="more-actions-btn">More</button>
      )}
      <button data-testid="action-open" onClick={actions.open}>Open</button>
    </div>
  ));

  const defaultProps = {
    folder: mockFolder as any,
    children: mockChildren,
    openFolderModal: jest.fn(),
    containerScrollRef: { current: document.createElement('div') } as any,
    isActivatedMoreActions: false,
    classNames: { container: 'custom-container' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders container', () => {
      const { container } = render(<FolderItem {...defaultProps} />);
      expect(container.querySelector('.container')).toBeInTheDocument();
    });

    it('applies custom container class', () => {
      const { container } = render(<FolderItem {...defaultProps} />);
      expect(container.querySelector('.custom-container')).toBeInTheDocument();
    });

    it('renders children', () => {
      render(<FolderItem {...defaultProps} />);
      expect(screen.getByTestId('children-content')).toBeInTheDocument();
    });

    it('applies selected class when more actions activated', () => {
      const { container } = render(<FolderItem {...defaultProps} isActivatedMoreActions={true} />);
      expect(container.querySelector('.selected')).toBeInTheDocument();
    });
  });

  describe('isStarred', () => {
    it('passes isStarred true when user is in listUserStar', () => {
      render(<FolderItem {...defaultProps} />);
      expect(screen.getByTestId('is-starred')).toHaveTextContent('true');
    });

    it('passes isStarred false when user is not in listUserStar', () => {
      const folder = { ...mockFolder, listUserStar: ['other-user'] };
      render(<FolderItem {...defaultProps} folder={folder as any} />);
      expect(screen.getByTestId('is-starred')).toHaveTextContent('false');
    });
  });

  describe('renderHiddenElement', () => {
    it('renders visible element', () => {
      render(<FolderItem {...defaultProps} />);
      expect(screen.getByTestId('visible-element')).toBeInTheDocument();
    });

    it('renders hidden element', () => {
      render(<FolderItem {...defaultProps} />);
      expect(screen.getByTestId('hidden-element')).toBeInTheDocument();
    });
  });

  describe('renderMoreActionsElement', () => {
    it('renders more actions button', () => {
      render(<FolderItem {...defaultProps} />);
      expect(screen.getByTestId('more-actions-btn')).toBeInTheDocument();
    });

    it('adds data-button-more-id attribute', () => {
      const { container } = render(<FolderItem {...defaultProps} />);
      const moreActionsWrapper = container.querySelector('[data-button-more-id="folder-123"]');
      expect(moreActionsWrapper).toBeInTheDocument();
    });
  });

  describe('Click handlers', () => {
    it('calls actions.open on container click', () => {
      const { container } = render(<FolderItem {...defaultProps} />);
      fireEvent.click(container.querySelector('.container') as Element);
      expect(mockFolderActions.open).toHaveBeenCalled();
    });
  });

  describe('Chatbot state', () => {
    it('sets data-chatbot-opened attribute', () => {
      const { container } = render(<FolderItem {...defaultProps} />);
      expect(container.querySelector('[data-chatbot-opened="false"]')).toBeInTheDocument();
    });
  });

  describe('Keyboard accessibility', () => {
    it('has role button', () => {
      const { container } = render(<FolderItem {...defaultProps} />);
      expect(container.querySelector('[role="button"]')).toBeInTheDocument();
    });

    it('has tabIndex 0', () => {
      const { container } = render(<FolderItem {...defaultProps} />);
      expect(container.querySelector('[tabindex="0"]')).toBeInTheDocument();
    });
  });
});

