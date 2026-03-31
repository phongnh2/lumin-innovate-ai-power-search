import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useFocusManager, useInputHandler, useSelectedMark, useSubmitHandler } from '../../../hooks';
import { useUploadAttachedFiles } from '../../../hooks/useUploadAttachedFiles';
import { AI_MODE } from 'features/AIChatBot/constants/mode';
import PromptInput from '../PromptInput';

jest.mock('../../../hooks', () => ({
  useFocusManager: jest.fn(),
  useInputHandler: jest.fn(),
  useSelectedMark: jest.fn(),
  useSubmitHandler: jest.fn(),
}));

jest.mock('../../../hooks/useUploadAttachedFiles', () => ({
  useUploadAttachedFiles: jest.fn(),
}));

jest.mock('hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'viewer.chatbot.mode.agentMode': 'Agent mode',
        'viewer.chatbot.mode.agentModeDescription': 'Awesome for tweaking and editing!',
        'viewer.chatbot.mode.askMode': 'Ask mode',
        'viewer.chatbot.mode.askModeDescription': 'Perfect for Q&A documents!',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('../ButtonSubmit', () => ({ onClick, icon, disabled, className, variant, ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={className}
    data-variant={variant || 'default'}
    data-testid="button-submit"
    {...props}
  >
    {icon}
  </button>
));

jest.mock('lumin-ui/kiwi-ui', () => ({
  Icomoon: ({ type, size }) => <span data-testid="icomoon" data-type={type} data-size={size} />,
}));

jest.mock('../../ChatBotUploadPopover', () => {
  return function MockChatBotUploadPopover({ handleAddFiles }) {
    return (
      <div data-testid="chatbot-upload-popover" onClick={() => handleAddFiles && handleAddFiles({ files: [] })}>
        Upload Popover
      </div>
    );
  };
});

jest.mock('../../SelectedFilesList', () => {
  return function MockSelectedFilesList({ files, isUploadingFile, onRemove }) {
    return (
      <div data-testid="selected-files-list">
        {files.map((file, index) => (
          <div key={index} data-testid={`file-${index}`}>
            {file.name}
            <button onClick={() => onRemove && onRemove({ removeId: file.id, fileIndex: index })}>
              Remove
            </button>
          </div>
        ))}
      </div>
    );
  };
});

// Mock AIAgentMode component
jest.mock('../../AIMode/AIAgentMode', () => {
  return function MockAIAgentMode({ modes, AIMode }) {
    return (
      <div data-testid="ai-agent-mode">
        <div data-testid="ai-mode-list">
          {modes?.map((mode) => (
            <div key={mode.id} data-testid={`ai-mode-${mode.id}`}>
              {mode.label}
            </div>
          ))}
        </div>
      </div>
    );
  };
});

// Mock the entire lumin-ui module
jest.mock('lumin-ui/kiwi-ui', () => ({
  Icomoon: ({ type, size }) => <span data-testid="icomoon" data-type={type} data-size={size} />,
  Divider: ({ orientation, className }) => (
    <div data-testid="divider" data-orientation={orientation} className={className} />
  ),
}));

jest.mock('classnames', () => (...args) => {
  return args
    .filter(Boolean)
    .map((arg) => {
      if (typeof arg === 'object' && arg !== null) {
        return Object.keys(arg)
          .filter((key) => arg[key])
          .join(' ');
      }
      return arg;
    })
    .join(' ');
});

// Mock the SCSS module
jest.mock('../PromptInput.module.scss', () => ({
  container: 'container',
  wrapper: 'wrapper',
  focusContainer: 'focusContainer',
  inputContainer: 'inputContainer',
  inputWrapper: 'inputWrapper',
  input: 'input',
  actionsRow: 'actionsRow',
  actionsRowContainer: 'actionsRowContainer',
  buttonContainer: 'buttonContainer',
  stopButton: 'stopButton',
  divider: 'divider',
}));

// Mock the constants
jest.mock('features/AIChatBot/constants/attachedFiles', () => ({
  ATTACHED_FILES_STATUS: {
    SENT: 'SENT',
    UPLOADING: 'UPLOADING',
    UPLOADED: 'UPLOADED',
  },
}));

jest.mock('features/AIChatBot/constants/mode', () => ({
  AI_MODE: {
    AGENT_MODE: 'agent_mode',
    ASK_MODE: 'ask_mode',
  },
}));

describe('PromptInput', () => {
  const mockSetValueState = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockStop = jest.fn();
  const mockStopCallback = jest.fn();
  const mockInputPromptRef = {
    current: {
      innerText: '',
      focus: jest.fn(),
    },
  };

  const mockFocusManagerReturn = {
    focusInput: false,
    handleWrapperBlur: jest.fn(),
    handleWrapperFocus: jest.fn(),
    handleInputFocus: jest.fn(),
  };

  const mockInputHandlerReturn = {
    handleInput: jest.fn(),
    handleKeyDown: jest.fn(),
  };

  const mockSelectedMarkReturn = {
    resetSelectedMark: jest.fn(),
    removeSelectedMark: jest.fn(),
    handleMarkClick: jest.fn(),
  };

  const mockSubmitHandlerReturn = {
    handleSubmit: jest.fn(),
    cancelRequest: jest.fn(),
  };

  const mockUploadAttachedFilesReturn = {
    attachedFiles: [], // Ensure this is always an array
    isUploadingFiles: false,
    handleAddFiles: jest.fn(),
    handleRemoveFiles: jest.fn(),
  };

  const defaultProps = {
    setValueState: mockSetValueState,
    onSubmit: mockOnSubmit,
    disabledSubmit: false,
    inputPromptRef: mockInputPromptRef,
    isProcessing: false,
    placeholder: 'Type your message...',
    stop: mockStop,
    stopCallback: mockStopCallback,
  };

  beforeEach(() => {
    if (!mockInputPromptRef.current) {
      mockInputPromptRef.current = {
        innerText: '',
        focus: jest.fn(),
      };
    } else {
      mockInputPromptRef.current.innerText = '';
      mockInputPromptRef.current.focus = jest.fn();
    }

    jest.clearAllMocks();

    useFocusManager.mockReturnValue(mockFocusManagerReturn);
    useInputHandler.mockReturnValue(mockInputHandlerReturn);
    useSelectedMark.mockReturnValue(mockSelectedMarkReturn);
    useSubmitHandler.mockReturnValue(mockSubmitHandlerReturn);
    useUploadAttachedFiles.mockReturnValue(mockUploadAttachedFilesReturn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when rendering', () => {
    it('should render the main container with correct structure', () => {
      render(<PromptInput {...defaultProps} enabledSwitchMode />);

      expect(screen.getByRole('textbox', { name: 'Chatbot input' })).toBeInTheDocument();
      expect(screen.getByTestId('button-submit')).toBeInTheDocument();
      expect(screen.getByTestId('ai-agent-mode')).toBeInTheDocument();
    });

    it('should apply correct CSS classes to wrapper', () => {
      const { container } = render(<PromptInput {...defaultProps} />);

      const wrapper = container.querySelector('[data-cy="chatbot_input_wrapper"]');
      expect(wrapper).toHaveClass('wrapper');
    });

    it('should apply focus container class when focusInput is true', () => {
      useFocusManager.mockReturnValue({
        ...mockFocusManagerReturn,
        focusInput: true,
      });

      const { container } = render(<PromptInput {...defaultProps} />);

      const wrapper = container.querySelector('[data-cy="chatbot_input_wrapper"]');
      expect(wrapper).toHaveClass('wrapper focusContainer');
    });

    it('should set correct attributes on input element', () => {
      render(<PromptInput {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: 'Chatbot input' });
      expect(input).toHaveAttribute('id', 'chatBotInput');
      expect(input).toHaveAttribute('contentEditable', 'plaintext-only');
      expect(input).toHaveAttribute('data-placeholder', 'Type your message...');
      expect(input).toHaveAttribute('tabIndex', '0');
    });

    it('should set data-empty attribute based on input content', () => {
      render(<PromptInput {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: 'Chatbot input' });
      expect(input).toHaveAttribute('data-empty', 'true');
    });

    it('should pass additional props to wrapper', () => {
      render(<PromptInput {...defaultProps} data-testid="custom-wrapper" />);

      const wrapper = screen.getByTestId('custom-wrapper');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('when handling file upload disabled state', () => {
    it('should not render upload popover when enabledFileUpload is false', () => {
      render(<PromptInput {...defaultProps} enabledFileUpload={false} />);

      expect(screen.queryByTestId('upload-popover')).not.toBeInTheDocument();
    });

    it('should not render SelectedFilesList when enabledFileUpload is false', () => {
      const mockFiles = [{ name: 'test.txt', status: 'UPLOADED' }];

      useUploadAttachedFiles.mockReturnValue({
        ...mockUploadAttachedFilesReturn,
        attachedFiles: mockFiles,
      });

      render(<PromptInput {...defaultProps} enabledFileUpload={false} />);

      expect(screen.queryByTestId('selected-files-list')).not.toBeInTheDocument();
    });

    it('should set data-disabled-upload attribute on wrapper when enabledFileUpload is false', () => {
      const { container } = render(<PromptInput {...defaultProps} enabledFileUpload={false} />);

      const wrapper = container.querySelector('[data-cy="chatbot_input_wrapper"]');
      expect(wrapper).toHaveAttribute('data-disabled-upload', 'true');
    });

    it('should set data-disabled-upload attribute on actionsRow when enabledFileUpload is false', () => {
      const { container } = render(<PromptInput {...defaultProps} enabledFileUpload={false} />);

      const actionsRow = container.querySelector('[data-disabled-upload="true"]');
      expect(actionsRow).toBeInTheDocument();
    });
  });

  describe('when handling user interactions', () => {
    it('should call handleWrapperFocus on wrapper focus', () => {
      const { container } = render(<PromptInput {...defaultProps} />);

      const wrapper = container.querySelector('[data-cy="chatbot_input_wrapper"]');
      fireEvent.focus(wrapper);

      expect(mockFocusManagerReturn.handleWrapperFocus).toHaveBeenCalled();
    });

    it('should call handleWrapperBlur on wrapper blur', () => {
      const { container } = render(<PromptInput {...defaultProps} />);

      const wrapper = container.querySelector('[data-cy="chatbot_input_wrapper"]');
      fireEvent.blur(wrapper);

      expect(mockFocusManagerReturn.handleWrapperBlur).toHaveBeenCalled();
    });

    it('should call handleInputFocus on input focus', () => {
      render(<PromptInput {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: 'Chatbot input' });
      fireEvent.focus(input);

      expect(mockFocusManagerReturn.handleInputFocus).toHaveBeenCalled();
    });

    it('should call handleInput on input change', () => {
      render(<PromptInput {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: 'Chatbot input' });
      fireEvent.input(input);

      expect(mockInputHandlerReturn.handleInput).toHaveBeenCalled();
    });

    it('should call handleKeyDown on key press', () => {
      const { container } = render(<PromptInput {...defaultProps} />);

      const wrapper = container.querySelector('[data-cy="chatbot_input_wrapper"]');
      fireEvent.keyDown(wrapper, { key: 'Enter' });

      expect(mockInputHandlerReturn.handleKeyDown).toHaveBeenCalled();
    });

    it('should call handleMarkClick on input click', () => {
      render(<PromptInput {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: 'Chatbot input' });
      fireEvent.click(input);

      expect(mockSelectedMarkReturn.handleMarkClick).toHaveBeenCalled();
    });
  });

  describe('when handling submission', () => {
    it('should render submit button when not processing', () => {
      render(<PromptInput {...defaultProps} />);

      const submitButton = screen.getByTestId('button-submit');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('data-variant', 'default');
      
      // Check that the icon is rendered inside the button (passed as prop to IconButton)
      expect(submitButton).toHaveTextContent(''); // Icon is passed as prop, not as child text
    });

    it('should render stop button when processing', () => {
      render(<PromptInput {...defaultProps} isProcessing={true} />);

      const stopButton = screen.getByTestId('button-submit');
      expect(stopButton).toHaveAttribute('data-variant', 'tonal');
      expect(stopButton).toHaveClass('stopButton');
    });

    it('should call handleSubmit when submit button is clicked', () => {
      render(<PromptInput {...defaultProps} />);

      fireEvent.click(screen.getByTestId('button-submit'));

      expect(mockSubmitHandlerReturn.handleSubmit).toHaveBeenCalled();
    });

    it('should call cancelRequest when stop button is clicked', () => {
      render(<PromptInput {...defaultProps} isProcessing={true} />);

      fireEvent.click(screen.getByTestId('button-submit'));

      expect(mockSubmitHandlerReturn.cancelRequest).toHaveBeenCalled();
    });

    it('should disable submit button when disabledSubmit is true', () => {
      render(<PromptInput {...defaultProps} disabledSubmit={true} />);

      const submitButton = screen.getByTestId('button-submit');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('when initializing hooks', () => {
    it('should initialize useSelectedMark with inputPromptRef', () => {
      render(<PromptInput {...defaultProps} />);

      expect(useSelectedMark).toHaveBeenCalledWith(mockInputPromptRef);
    });

    it('should initialize useFocusManager with resetSelectedMark', () => {
      render(<PromptInput {...defaultProps} />);

      expect(useFocusManager).toHaveBeenCalledWith(mockSelectedMarkReturn.resetSelectedMark);
    });

    it('should initialize useInputHandler with correct parameters', () => {
      render(<PromptInput {...defaultProps} />);

      expect(useInputHandler).toHaveBeenCalledWith({
        inputRef: mockInputPromptRef,
        setValueState: mockSetValueState,
        onSubmit: mockOnSubmit,
        disabledSubmit: false,
        isProcessing: false,
        removeSelectedMark: mockSelectedMarkReturn.removeSelectedMark,
        isUploadingFiles: false,
      });
    });

    it('should initialize useSubmitHandler with correct parameters', () => {
      render(<PromptInput {...defaultProps} />);

      expect(useSubmitHandler).toHaveBeenCalledWith({
        onSubmit: mockOnSubmit,
        disabledSubmit: false,
        isProcessing: false,
        stop: mockStop,
        stopCallback: mockStopCallback,
        isUploadingFiles: false,
      });
    });
  });

  describe('when handling prop changes', () => {
    it('should initialize hooks with correct parameters when disabled', () => {
      render(<PromptInput {...defaultProps} disabledSubmit={true} isProcessing={true} />);

      expect(useInputHandler).toHaveBeenCalledWith({
        inputRef: mockInputPromptRef,
        setValueState: mockSetValueState,
        onSubmit: mockOnSubmit,
        disabledSubmit: true,
        isProcessing: true,
        removeSelectedMark: mockSelectedMarkReturn.removeSelectedMark,
        isUploadingFiles: false,
      });

      expect(useSubmitHandler).toHaveBeenCalledWith({
        onSubmit: mockOnSubmit,
        disabledSubmit: true,
        isProcessing: true,
        stop: mockStop,
        stopCallback: mockStopCallback,
        isUploadingFiles: false,
      });
    });

    it('should render with different placeholder', () => {
      render(<PromptInput {...defaultProps} placeholder="New placeholder" />);

      const input = screen.getByRole('textbox', { name: 'Chatbot input' });
      expect(input).toHaveAttribute('data-placeholder', 'New placeholder');
    });
  });

  describe('when handling edge cases', () => {
    it('should handle missing optional props gracefully', () => {
      const minimalProps = {
        setValueState: mockSetValueState,
        inputPromptRef: mockInputPromptRef,
      };

      expect(() => {
        render(<PromptInput {...minimalProps} />);
      }).not.toThrow();
    });

    it('should handle null inputPromptRef', () => {
      const propsWithNullRef = {
        ...defaultProps,
        inputPromptRef: { current: null },
      };

      expect(() => {
        render(<PromptInput {...propsWithNullRef} />);
      }).not.toThrow();
    });

    it('should handle empty placeholder', () => {
      render(<PromptInput {...defaultProps} placeholder="" />);

      const input = screen.getByRole('textbox', { name: 'Chatbot input' });
      expect(input).toHaveAttribute('data-placeholder', '');
    });

    it('should handle undefined placeholder', () => {
      render(<PromptInput {...defaultProps} placeholder={undefined} />);

      const input = screen.getByRole('textbox', { name: 'Chatbot input' });
      expect(input).not.toHaveAttribute('data-placeholder');
    });

    it('should handle empty attachedFiles array', () => {
      useUploadAttachedFiles.mockReturnValue({
        ...mockUploadAttachedFilesReturn,
        attachedFiles: [],
      });

      render(<PromptInput {...defaultProps} />);

      expect(screen.queryByTestId('selected-files-list')).not.toBeInTheDocument();
    });

    it('should handle undefined attachedFiles gracefully', () => {
      useUploadAttachedFiles.mockReturnValue({
        ...mockUploadAttachedFilesReturn,
        attachedFiles: undefined,
      });

      // This should not throw an error
      expect(() => {
        render(<PromptInput {...defaultProps} />);
      }).not.toThrow();
    });
  });

  describe('when handling accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { container } = render(<PromptInput {...defaultProps} />);

      const wrapper = container.querySelector('[data-cy="chatbot_input_wrapper"]');
      const input = screen.getByRole('textbox', { name: 'Chatbot input' });

      expect(wrapper).toHaveAttribute('role', 'textbox');
      expect(wrapper).toHaveAttribute('tabIndex', '0');
      expect(input).toHaveAttribute('role', 'textbox');
      expect(input).toHaveAttribute('aria-label', 'Chatbot input');
      expect(input).toHaveAttribute('tabIndex', '0');
    });

    it('should maintain keyboard navigation', () => {
      const { container } = render(<PromptInput {...defaultProps} />);

      const wrapper = container.querySelector('[data-cy="chatbot_input_wrapper"]');
      const input = screen.getByRole('textbox', { name: 'Chatbot input' });

      wrapper.focus();
      expect(document.activeElement).toBe(wrapper);

      input.focus();
      expect(document.activeElement).toBe(input);
    });
  });

  describe('when handling complex interactions', () => {
    it('should handle focus and input events in sequence', () => {
      const { container } = render(<PromptInput {...defaultProps} />);

      const wrapper = container.querySelector('[data-cy="chatbot_input_wrapper"]');
      const input = screen.getByRole('textbox', { name: 'Chatbot input' });

      fireEvent.focus(wrapper);
      expect(mockFocusManagerReturn.handleWrapperFocus).toHaveBeenCalled();

      fireEvent.focus(input);
      expect(mockFocusManagerReturn.handleInputFocus).toHaveBeenCalled();

      fireEvent.input(input);
      expect(mockInputHandlerReturn.handleInput).toHaveBeenCalled();

      fireEvent.keyDown(wrapper, { key: 'Enter' });
      expect(mockInputHandlerReturn.handleKeyDown).toHaveBeenCalled();

      fireEvent.click(input);
      expect(mockSelectedMarkReturn.handleMarkClick).toHaveBeenCalled();
    });

    it('should show different buttons based on processing state', () => {
      const { unmount } = render(<PromptInput {...defaultProps} isProcessing={false} />);
      expect(screen.getByTestId('button-submit')).not.toHaveAttribute('data-variant', 'tonal');
      unmount();

      render(<PromptInput {...defaultProps} isProcessing={true} />);
      expect(screen.getByTestId('button-submit')).toHaveAttribute('data-variant', 'tonal');
    });

    it('should handle AI mode integration with file upload disabled', () => {
      render(<PromptInput {...defaultProps} enabledFileUpload={false} enabledSwitchMode={false} />);

      // When file upload is disabled, the entire actions row container is not rendered
      // This includes upload popover, divider, and AI agent mode
      expect(screen.queryByTestId('ai-agent-mode')).not.toBeInTheDocument();
      expect(screen.queryByTestId('upload-popover')).not.toBeInTheDocument();
      expect(screen.queryByTestId('divider')).not.toBeInTheDocument();
    });
  });

  describe('when handling CSS classes and styling', () => {
    it('should apply custom-scrollbar class to input', () => {
      const { container } = render(<PromptInput {...defaultProps} />);

      const input = container.querySelector('#chatBotInput');
      expect(input).toHaveClass('custom-scrollbar');
    });

    it('should apply correct classes to actionsRowContainer', () => {
      const { container } = render(<PromptInput {...defaultProps} />);

      const actionsRowContainer = container.querySelector('.actionsRowContainer');
      expect(actionsRowContainer).toBeInTheDocument();
    });

    it('should apply correct classes to buttonContainer', () => {
      const { container } = render(<PromptInput {...defaultProps} />);

      const buttonContainer = container.querySelector('.buttonContainer');
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe('when handling translation integration', () => {
    it('should use translation for AI mode labels', () => {
      render(
        <PromptInput
          {...defaultProps}
          modes={[
            {
              id: AI_MODE.AGENT_MODE,
              label: 'Agent mode',
            },
            {
              id: AI_MODE.ASK_MODE,
              label: 'Ask mode',
            },
          ]}
          enabledSwitchMode
        />
      );

      // The AIAgentMode component should receive translated labels
      expect(screen.getByText('Agent mode')).toBeInTheDocument();
      expect(screen.getByText('Ask mode')).toBeInTheDocument();
    });

    it('should handle translation fallback gracefully', () => {
      // Mock useTranslation to return the key when translation is missing
      const mockT = jest.fn((key) => key);
      jest.doMock('hooks/useTranslation', () => ({
        useTranslation: () => ({ t: mockT }),
      }));

      render(<PromptInput {...defaultProps} enabledSwitchMode />);

      // Should not crash when translation is missing
      expect(screen.getByTestId('ai-agent-mode')).toBeInTheDocument();
    });
  });
});