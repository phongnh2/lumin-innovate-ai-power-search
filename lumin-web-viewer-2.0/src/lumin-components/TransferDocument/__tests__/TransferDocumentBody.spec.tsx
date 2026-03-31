import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mutable state
const mockState = {
  isEnableReskin: false,
  isEnableNestedFolder: false,
  isTabletMatch: true,
  error: null as string | null,
  errorName: '',
  isDocumentNameOpen: false,
  newDocumentName: 'test.pdf',
  isShowNotify: false,
  isNotify: false,
  isCopyModal: false,
  isOldProfessional: false,
  totalActiveMember: 5,
  selectedTargetId: 'org-123',
};

const mockSetNewDocumentName = jest.fn();
const mockSetErrorName = jest.fn();
const mockSetIsNotify = jest.fn();

jest.mock('lumin-components/TransferDocument/hooks', () => ({
  useTransferDocumentContext: () => ({
    getter: {
      error: mockState.error,
      errorName: mockState.errorName,
      isDocumentNameOpen: mockState.isDocumentNameOpen,
      newDocumentName: mockState.newDocumentName,
      selectedTarget: { _id: mockState.selectedTargetId, name: 'Test Org', totalActiveMember: mockState.totalActiveMember },
      isShowNotify: mockState.isShowNotify,
      isNotify: mockState.isNotify,
      personalData: { isOldProfessional: mockState.isOldProfessional },
      context: { isCopyModal: mockState.isCopyModal, selectAPlace: 'modalMove.selectAPlace' },
    },
    setter: { setNewDocumentName: mockSetNewDocumentName, setErrorName: mockSetErrorName, setIsNotify: mockSetIsNotify },
  }),
}));

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string, opts?: any) => opts ? `${key} ${JSON.stringify(opts)}` : key }),
  useTabletMatch: () => mockState.isTabletMatch,
  useEnableWebReskin: () => ({ isEnableReskin: mockState.isEnableReskin }),
}));
jest.mock('hooks/useEnableNestedFolder', () => ({ useEnableNestedFolder: () => ({ isEnableNestedFolder: mockState.isEnableNestedFolder }) }));
jest.mock('utils/validator', () => ({
  validateDocumentName: (value: string) => {
    if (!value.trim()) return { isValidated: false, error: 'errorMessage.fieldRequired' };
    if (value.length > 255) return { isValidated: false, error: 'maxLength' };
    return { isValidated: true, error: '' };
  },
}));
jest.mock('react-i18next', () => ({ Trans: ({ i18nKey }: any) => require('react').createElement('span', { 'data-testid': 'trans' }, i18nKey) }));

jest.mock('lumin-ui/kiwi-ui', () => ({
  Checkbox: ({ onChange, checked }: any) => require('react').createElement('input', { type: 'checkbox', 'data-testid': 'checkbox', onChange, checked }),
  TextInput: ({ onBlur, onChange, error, value, autoFocus }: any) => require('react').createElement('input', { 'data-testid': 'text-input', onBlur, onChange, 'data-error': error, value, autoFocus }),
  Text: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'text' }, children),
  Divider: () => require('react').createElement('hr', { 'data-testid': 'divider' }),
  InlineMessage: ({ message }: any) => require('react').createElement('div', { 'data-testid': 'inline-message' }, message),
}));

jest.mock('lumin-components/Shared/Input', () => ({
  __esModule: true,
  default: ({ onBlur, onChange, errorMessage, value, label }: any) => require('react').createElement('div', null,
    label && require('react').createElement('label', { 'data-testid': 'input-label' }, label),
    require('react').createElement('input', { 'data-testid': 'input', onBlur, onChange, 'data-error': errorMessage, value }),
  ),
}));
jest.mock('../components/LeftSideBar', () => ({
  __esModule: true,
  default: ({ collapsed, setDisplayToggleButton }: any) => {
    const R = require('react');
    R.useEffect(() => { setDisplayToggleButton?.(true); }, []);
    return R.createElement('div', { 'data-testid': 'left-sidebar', 'data-collapsed': String(!!collapsed) });
  },
}));
jest.mock('../components/RightPanel', () => ({ __esModule: true, default: ({ fullWidth }: any) => require('react').createElement('div', { 'data-testid': 'right-panel', 'data-full-width': String(!!fullWidth) }) }));
jest.mock('features/NestedFolders/components/NestedFoldersPanel/components', () => ({
  TogglePanelButton: ({ collapsed, display, toggle }: any) => require('react').createElement('button', { 'data-testid': 'toggle-panel-button', 'data-collapsed': String(!!collapsed), 'data-display': String(!!display), onClick: toggle, type: 'button' }, 'Toggle'),
}));
jest.mock('../components/TransferDocumentBody/TransferDocumentBody.styled', () => ({
  TransferDocumentBodyContainer: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'body-container' }, children),
  TransferDocumentBodyContainerReskin: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'body-container-reskin' }, children),
  ErrorMessage: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'error-message' }, children),
  ErrorReskin: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'error-reskin' }, children),
  FormControl: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'form-control' }, children),
  FormControlReskin: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'form-control-reskin' }, children),
  Label: ({ children }: any) => require('react').createElement('label', { 'data-testid': 'label' }, children),
  SelectText: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'select-text' }, children),
  SideBarContainer: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'sidebar-container' }, children),
  SideBarContainerReskin: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'sidebar-container-reskin' }, children),
  NotifyWrapper: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'notify-wrapper' }, children),
  NotifyWrapperReskin: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'notify-wrapper-reskin' }, children),
  FormControlLabel: ({ label, control, checked }: any) => require('react').createElement('label', { 'data-testid': 'form-control-label', 'data-checked': String(!!checked) }, control, label),
  CheckBox: ({ onChange }: any) => require('react').createElement('input', { type: 'checkbox', 'data-testid': 'checkbox-old', onChange }),
  Notify: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'notify' }, children),
  Bold: () => require('react').createElement('b'),
  CheckBoxWrapper: ({ children }: any) => children,
}));
jest.mock('../components/TransferDocumentBody/TransferDocumentBody.module.scss', () => ({ documentNameInput: 'documentNameInput' }));
jest.mock('constants/documentConstants', () => ({ MAX_LENGTH_DOCUMENT_NAME: 255 }));
jest.mock('constants/messages', () => ({ ERROR_MESSAGE_DOCUMENT: { MAX_LENGTH: { key: 'maxLength', interpolation: { max: 255 } } } }));
jest.mock('constants/organizationConstants', () => ({ MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION: 100 }));

import TransferDocumentBody from 'luminComponents/TransferDocument/components/TransferDocumentBody';

describe('TransferDocumentBody', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState.isEnableReskin = false;
    mockState.isEnableNestedFolder = false;
    mockState.isTabletMatch = true;
    mockState.error = null;
    mockState.errorName = '';
    mockState.isDocumentNameOpen = false;
    mockState.newDocumentName = 'test.pdf';
    mockState.isShowNotify = false;
    mockState.isNotify = false;
    mockState.isCopyModal = false;
    mockState.isOldProfessional = false;
    mockState.totalActiveMember = 5;
    mockState.selectedTargetId = 'org-123';
  });

  describe('Non-reskin mode', () => {
    it('renders body container', () => {
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('body-container')).toBeInTheDocument();
    });

    it('renders right panel', () => {
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('right-panel')).toBeInTheDocument();
    });

    it('renders sidebar container', () => {
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('sidebar-container')).toBeInTheDocument();
    });

    it('shows error message when error exists', () => {
      mockState.error = 'Test error';
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('error-message')).toHaveTextContent('Test error');
    });

    it('shows document name input when open', () => {
      mockState.isDocumentNameOpen = true;
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('form-control')).toBeInTheDocument();
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('calls setNewDocumentName on input change', () => {
      mockState.isDocumentNameOpen = true;
      render(<TransferDocumentBody />);
      fireEvent.change(screen.getByTestId('input'), { target: { value: 'new-name.pdf' } });
      expect(mockSetErrorName).toHaveBeenCalledWith('');
      expect(mockSetNewDocumentName).toHaveBeenCalledWith('new-name.pdf');
    });

    it('shows error on blur with empty name', () => {
      mockState.isDocumentNameOpen = true;
      mockState.newDocumentName = '   ';
      render(<TransferDocumentBody />);
      fireEvent.blur(screen.getByTestId('input'));
      expect(mockSetErrorName).toHaveBeenCalledWith('errorMessage.fieldRequired');
    });

    it('shows error on blur with long name', () => {
      mockState.isDocumentNameOpen = true;
      mockState.newDocumentName = 'a'.repeat(300);
      render(<TransferDocumentBody />);
      fireEvent.blur(screen.getByTestId('input'));
      expect(mockSetErrorName).toHaveBeenCalled();
    });

    it('shows left sidebar for old professional', () => {
      mockState.isOldProfessional = true;
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
    });

    it('shows left sidebar for copy modal', () => {
      mockState.isCopyModal = true;
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
    });

    it('hides left sidebar when not copy modal and not old professional', () => {
      mockState.selectedTargetId = '';
      render(<TransferDocumentBody />);
      expect(screen.queryByTestId('left-sidebar')).not.toBeInTheDocument();
    });

    it('shows notify wrapper when conditions met', () => {
      mockState.isShowNotify = true;
      mockState.isCopyModal = true;
      mockState.totalActiveMember = 5;
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('notify-wrapper')).toBeInTheDocument();
    });

    it('renders notify checkbox', () => {
      mockState.isShowNotify = true;
      mockState.isCopyModal = true;
      mockState.totalActiveMember = 5;
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('checkbox-old')).toBeInTheDocument();
    });

    it('shows notifyEveryone when member count low', () => {
      mockState.isShowNotify = true;
      mockState.isCopyModal = true;
      mockState.totalActiveMember = 5;
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('trans')).toHaveTextContent('modalMove.notifyEveryone');
    });

    it('shows notifyAdministrators when member count high', () => {
      mockState.isShowNotify = true;
      mockState.isCopyModal = true;
      mockState.totalActiveMember = 150;
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('trans')).toHaveTextContent('modalMove.notifyAdministrators');
    });
  });

  describe('Reskin mode', () => {
    beforeEach(() => { mockState.isEnableReskin = true; });

    it('renders reskin container', () => {
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('body-container-reskin')).toBeInTheDocument();
    });

    it('shows select text', () => {
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('select-text')).toHaveTextContent('modalMove.selectAPlace');
    });

    it('shows error with InlineMessage', () => {
      mockState.error = 'Reskin error';
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('inline-message')).toHaveTextContent('Reskin error');
    });

    it('shows document name input reskin', () => {
      mockState.isDocumentNameOpen = true;
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('form-control-reskin')).toBeInTheDocument();
      expect(screen.getByTestId('text-input')).toBeInTheDocument();
    });

    it('validates input on change in reskin mode', () => {
      mockState.isDocumentNameOpen = true;
      render(<TransferDocumentBody />);
      fireEvent.change(screen.getByTestId('text-input'), { target: { value: '' } });
      expect(mockSetErrorName).toHaveBeenCalledWith('errorMessage.fieldRequired');
    });

    it('shows notify wrapper reskin when conditions met', () => {
      mockState.isShowNotify = true;
      mockState.isCopyModal = true;
      mockState.totalActiveMember = 5;
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('notify-wrapper-reskin')).toBeInTheDocument();
    });

    it('shows divider with notify', () => {
      mockState.isShowNotify = true;
      mockState.isCopyModal = true;
      mockState.totalActiveMember = 5;
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('divider')).toBeInTheDocument();
    });

    it('renders checkbox in reskin mode', () => {
      mockState.isShowNotify = true;
      mockState.isCopyModal = true;
      mockState.totalActiveMember = 5;
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    });
  });

  describe('Nested folder mode', () => {
    beforeEach(() => {
      mockState.isEnableReskin = true;
      mockState.isEnableNestedFolder = true;
      mockState.isCopyModal = true;
    });

    it('shows toggle panel button', () => {
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('toggle-panel-button')).toBeInTheDocument();
    });

    it('toggles left sidebar on button click', () => {
      render(<TransferDocumentBody />);
      const toggleBtn = screen.getByTestId('toggle-panel-button');
      expect(toggleBtn).toHaveAttribute('data-collapsed', 'false');
      fireEvent.click(toggleBtn);
    });
  });

  describe('Tablet/Mobile behavior', () => {
    it('shows left sidebar when tablet and no selected target', () => {
      mockState.selectedTargetId = '';
      mockState.isCopyModal = true;
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
    });

    it('shows right panel when tablet and has selected target', () => {
      mockState.isCopyModal = true;
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('right-panel')).toBeInTheDocument();
    });

    it('renders right panel', () => {
      render(<TransferDocumentBody />);
      expect(screen.getByTestId('right-panel')).toBeInTheDocument();
    });
  });
});

