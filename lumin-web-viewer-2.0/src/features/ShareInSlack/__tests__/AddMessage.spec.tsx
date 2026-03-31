import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock lumin-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  Textarea: (props: {
    size?: string;
    placeholder?: string;
    rows?: number;
    maxLength?: number;
    value?: string;
    onChange?: (e: { target: { value: string } }) => void;
    label?: React.ReactNode;
    classNames?: Record<string, string>;
  }) => (
    <div>
      <label data-testid="textarea-label">{props.label}</label>
      <textarea
        data-testid="textarea"
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
        maxLength={props.maxLength}
        rows={props.rows}
        data-size={props.size}
      />
    </div>
  ),
}));

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import AddMessage from '../components/ShareInSlackForm/AddMessage';

describe('AddMessage', () => {
  let mockSetMessage: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetMessage = jest.fn();
  });

  const renderComponent = (message = '') => {
    return render(<AddMessage message={message} setMessage={mockSetMessage} />);
  };

  describe('Rendering', () => {
    it('should render textarea', () => {
      renderComponent();
      expect(screen.getByTestId('textarea')).toBeInTheDocument();
    });

    it('should render label', () => {
      renderComponent();
      expect(screen.getByTestId('textarea-label')).toBeInTheDocument();
    });

    it('should display placeholder text', () => {
      renderComponent();
      expect(screen.getByTestId('textarea')).toHaveAttribute('placeholder', 'shareInSlack.addMessagePlaceholder');
    });

    it('should have correct size', () => {
      renderComponent();
      expect(screen.getByTestId('textarea')).toHaveAttribute('data-size', 'lg');
    });

    it('should have maxLength of 3000', () => {
      renderComponent();
      expect(screen.getByTestId('textarea')).toHaveAttribute('maxLength', '3000');
    });

    it('should have 3 rows', () => {
      renderComponent();
      expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '3');
    });
  });

  describe('Message Display', () => {
    it('should display empty message', () => {
      renderComponent('');
      expect(screen.getByTestId('textarea')).toHaveValue('');
    });

    it('should display provided message', () => {
      renderComponent('Hello world');
      expect(screen.getByTestId('textarea')).toHaveValue('Hello world');
    });

    it('should display message character count in label', () => {
      renderComponent('Hello');
      expect(screen.getByTestId('textarea-label')).toHaveTextContent('5/3000');
    });

    it('should display 0/3000 for empty message', () => {
      renderComponent('');
      expect(screen.getByTestId('textarea-label')).toHaveTextContent('0/3000');
    });
  });

  describe('Message Input', () => {
    it('should call setMessage when typing', () => {
      renderComponent();
      
      fireEvent.change(screen.getByTestId('textarea'), { target: { value: 'New message' } });
      
      expect(mockSetMessage).toHaveBeenCalledWith('New message');
    });

    it('should call setMessage on each keystroke', () => {
      renderComponent();
      
      fireEvent.change(screen.getByTestId('textarea'), { target: { value: 'A' } });
      fireEvent.change(screen.getByTestId('textarea'), { target: { value: 'AB' } });
      
      expect(mockSetMessage).toHaveBeenCalledTimes(2);
    });
  });

  describe('Label Content', () => {
    it('should display add message label text', () => {
      renderComponent();
      expect(screen.getByTestId('textarea-label')).toHaveTextContent('modalShare.addMessage');
    });

    it('should display optional text', () => {
      renderComponent();
      expect(screen.getByTestId('textarea-label')).toHaveTextContent('common.optional');
    });
  });
});

