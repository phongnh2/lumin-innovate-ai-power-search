import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock useChatbotStore
jest.mock('features/WebChatBot/hooks/useChatbotStore', () => ({
  useChatbotStore: () => ({ isVisible: false }),
}));

// Mock classnames
jest.mock('classnames', () => (...args: any[]) => args.filter(Boolean).join(' '));

// Mock styles
jest.mock('../components/DocumentListHeader/DocumentListHeader.module.scss', () => ({
  container: 'container',
  column: 'column',
  ownerCol: 'ownerCol',
  storageCol: 'storageCol',
  lastUpdated: 'lastUpdated',
}));

// Import after mocks
import { DocumentListHeader } from '../components/DocumentListHeader';

describe('DocumentListHeader', () => {
  describe('Rendering', () => {
    it('renders container', () => {
      const { container } = render(<DocumentListHeader />);
      expect(container.firstChild).toHaveClass('container');
    });

    it('renders name column', () => {
      render(<DocumentListHeader />);
      expect(screen.getByText('common.name')).toBeInTheDocument();
    });

    it('renders owner column', () => {
      render(<DocumentListHeader />);
      expect(screen.getByText('common.owner')).toBeInTheDocument();
    });

    it('renders storage column', () => {
      render(<DocumentListHeader />);
      expect(screen.getByText('common.storage')).toBeInTheDocument();
    });

    it('renders last opened column', () => {
      render(<DocumentListHeader />);
      expect(screen.getByText('documentPage.lastOpened')).toBeInTheDocument();
    });
  });

  describe('Chatbot state', () => {
    it('sets data-chatbot-opened attribute', () => {
      const { container } = render(<DocumentListHeader />);
      expect(container.firstChild).toHaveAttribute('data-chatbot-opened', 'false');
    });
  });
});

