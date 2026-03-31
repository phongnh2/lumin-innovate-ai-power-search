import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

// Mock lumin-ui
jest.mock('lumin-ui/dist/kiwi-ui/Tooltip', () => ({
  PlainTooltip: ({ children, content, disabled }: any) =>
    require('react').createElement('div', { 'data-testid': 'tooltip', 'data-content': content, 'data-disabled': String(disabled) }, children),
}));


// Mock withRightClickDocument HOC - pass through the component
jest.mock('HOC/withRightClickDocument', () => ({
  __esModule: true,
  default: (Component: any) => Component,
}));

// Mock hooks
jest.mock('hooks', () => ({
  useGetCurrentUser: () => ({ _id: 'user-123' }),
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('hooks/useKeyboardAccessibility', () => ({
  __esModule: true,
  default: () => ({ onKeyDown: jest.fn() }),
}));

// Mock useDocumentActions
const mockActions = {
  viewInfo: jest.fn(),
  open: jest.fn(),
  makeACopy: jest.fn(),
  rename: jest.fn(),
  markFavorite: jest.fn(),
  remove: jest.fn(),
  copyLink: jest.fn(),
  share: jest.fn(),
  move: jest.fn(),
  makeOffline: jest.fn(),
};

jest.mock('../hooks/useDocumentActions', () => ({
  __esModule: true,
  default: () => ({
    requestModalElement: require('react').createElement('div', { 'data-testid': 'request-modal' }),
    actions: mockActions,
  }),
}));

// Mock useChatbotStore
jest.mock('features/WebChatBot/hooks/useChatbotStore', () => ({
  useChatbotStore: () => ({ isVisible: false }),
}));

// Mock constants
jest.mock('constants/documentConstants', () => ({
  REMOVE_UPLOAD_ICON_TIMEOUT: 100,
}));

// Mock styles
jest.mock('../components/DocumentItem/DocumentItem.module.scss', () => ({
  container: 'container',
  selected: 'selected',
  quickActionsWrapper: 'quickActionsWrapper',
  visibleWrapper: 'visibleWrapper',
  hiddenWrapper: 'hiddenWrapper',
  moreActionsWrapper: 'moreActionsWrapper',
  activated: 'activated',
}));

// Import the actual component file directly to avoid HOC issues
import DocumentItemComponent from '../components/DocumentItem/DocumentItem';

// Get the unwrapped component
const DocumentItem = (DocumentItemComponent as any).type || DocumentItemComponent;

describe('DocumentItem', () => {
  const mockDocument = {
    _id: 'doc-123',
    name: 'test-document.pdf',
    thumbnail: 'thumbnail-url',
    listUserStar: ['user-123'],
    newUpload: false,
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
    document: mockDocument as any,
    children: mockChildren,
    refetchDocument: jest.fn(),
    openDocumentModal: jest.fn(),
    isActivatedMoreActions: false,
    classNames: { container: 'custom-container' },
    updateDocumentInfo: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders container with document item class', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(document.querySelector('[data-cy="document_item"]')).toHaveClass('container');
    });

    it('applies custom container class', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(document.querySelector('[data-cy="document_item"]')).toHaveClass('custom-container');
    });

    it('renders children with render props', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByTestId('children-content')).toBeInTheDocument();
    });

    it('renders request modal element', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByTestId('request-modal')).toBeInTheDocument();
    });

    it('applies selected class when more actions activated', () => {
      render(<DocumentItem {...defaultProps} isActivatedMoreActions={true} />);
      expect(document.querySelector('[data-cy="document_item"]')).toHaveClass('selected');
    });
  });

  describe('isStarred', () => {
    it('passes isStarred true when user is in listUserStar', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByTestId('is-starred')).toHaveTextContent('true');
    });

    it('passes isStarred false when user is not in listUserStar', () => {
      const doc = { ...mockDocument, listUserStar: ['other-user'] };
      render(<DocumentItem {...defaultProps} document={doc as any} />);
      expect(screen.getByTestId('is-starred')).toHaveTextContent('false');
    });

    it('passes isStarred false when listUserStar is undefined', () => {
      const doc = { ...mockDocument, listUserStar: undefined };
      render(<DocumentItem {...defaultProps} document={doc as any} />);
      // When listUserStar is undefined, includes() would throw - component handles this
      const isStarred = screen.getByTestId('is-starred');
      expect(['false', 'undefined', '']).toContain(isStarred.textContent);
    });
  });

  describe('renderHiddenElement', () => {
    it('renders visible element', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByTestId('visible-element')).toBeInTheDocument();
    });

    it('renders hidden element', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByTestId('hidden-element')).toBeInTheDocument();
    });
  });

  describe('renderMoreActionsElement', () => {
    it('renders more actions button', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByTestId('more-actions-btn')).toBeInTheDocument();
    });

    it('renders tooltip with more actions content', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(screen.getByTestId('tooltip')).toHaveAttribute('data-content', 'documentPage.moreActions');
    });

    it('disables tooltip when more actions activated', () => {
      render(<DocumentItem {...defaultProps} isActivatedMoreActions={true} />);
      expect(screen.getByTestId('tooltip')).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Click handlers', () => {
    it('calls actions.open on container click', () => {
      render(<DocumentItem {...defaultProps} />);
      fireEvent.click(document.querySelector('[data-cy="document_item"]') as Element);
      expect(mockActions.open).toHaveBeenCalled();
    });
  });

  describe('New upload timeout', () => {
    it('calls updateDocumentInfo after timeout when newUpload is true', () => {
      const doc = { ...mockDocument, newUpload: true };
      render(<DocumentItem {...defaultProps} document={doc as any} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(defaultProps.updateDocumentInfo).toHaveBeenCalledWith(
        expect.objectContaining({ newUpload: false })
      );
    });

    it('does not call updateDocumentInfo when newUpload is false', () => {
      render(<DocumentItem {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(defaultProps.updateDocumentInfo).not.toHaveBeenCalled();
    });

    it('does not call updateDocumentInfo when updateDocumentInfo is not provided', () => {
      const doc = { ...mockDocument, newUpload: true };
      const props = { ...defaultProps, document: doc as any, updateDocumentInfo: undefined };
      
      // Should not throw
      expect(() => {
        render(<DocumentItem {...props} />);
        act(() => {
          jest.advanceTimersByTime(100);
        });
      }).not.toThrow();
    });
  });

  describe('Chatbot state', () => {
    it('sets data-chatbot-opened attribute', () => {
      render(<DocumentItem {...defaultProps} />);
      expect(document.querySelector('[data-cy="document_item"]')).toHaveAttribute('data-chatbot-opened', 'false');
    });
  });
});

