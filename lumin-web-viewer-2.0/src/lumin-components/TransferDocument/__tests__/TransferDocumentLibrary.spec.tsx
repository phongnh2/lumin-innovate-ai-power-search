import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useAvailablePersonalWorkspace: () => true,
}));

jest.mock('lumin-components/MoveDocumentContainer/hooks/useThemeMode', () => ({
  useThemeMode: () => ({ theme: { isLightMode: true } }),
}));

// Comprehensive mock for lumin-ui/kiwi-ui
jest.mock('lumin-ui/kiwi-ui', () => {
  const React = require('react');
  const createElement = React.createElement;
  return {
    Dialog: ({ children, opened, ...rest }: any) =>
      opened ? createElement('div', { 'data-testid': 'dialog', ...rest }, children) : null,
    PlainTooltip: ({ children, content, position }: any) =>
      createElement('span', { 'data-testid': 'plain-tooltip', 'data-content': content }, children),
    TextInput: ({ error, clearable, leftSection, onClear, onChange, value, placeholder, ...rest }: any) =>
      createElement('div', { 'data-testid': 'text-input' },
        leftSection && createElement('span', { 'data-testid': 'left-section' }, leftSection),
        createElement('input', { 'data-testid': 'input', 'data-error': error || '', value: value || '', placeholder, onChange }),
        clearable && createElement('button', { 'data-testid': 'clear-btn', onClick: onClear, type: 'button' }, 'Clear')
      ),
    Select: ({ data, value, onChange, renderOption }: any) =>
      createElement('div', { 'data-testid': 'select' },
        createElement('select', { value: value || '', onChange: (e: any) => onChange?.(e.target.value), 'data-testid': 'select-input' },
          data?.map((opt: any) => createElement('option', { key: opt.value, value: opt.value }, opt.label))
        )
      ),
    Avatar: ({ src, size, variant, children }: any) =>
      createElement('div', { 'data-testid': 'kiwi-avatar', 'data-src': src || '', 'data-size': size }, children),
    IconButton: ({ children, onClick, ...rest }: any) =>
      createElement('button', { 'data-testid': 'icon-button', onClick, type: 'button', ...rest }, children),
    MenuItemBase: ({ children, onClick, disabled, selected, activated }: any) =>
      createElement('div', {
        'data-testid': 'menu-item',
        onClick: disabled ? undefined : onClick,
        'data-disabled': String(!!disabled),
        'data-selected': String(!!selected),
        'data-activated': String(!!activated),
      }, children),
    Checkbox: ({ label, checked, onChange }: any) =>
      createElement('label', { 'data-testid': 'checkbox-wrapper' },
        createElement('input', { type: 'checkbox', checked: !!checked, onChange, 'data-testid': 'checkbox' }), label
      ),
    ScrollArea: { AutoSize: ({ children }: any) => createElement('div', { 'data-testid': 'scroll-area' }, children) },
    Tabs: Object.assign(
      ({ children, value, onChange }: any) => createElement('div', { 'data-testid': 'tabs', 'data-value': value }, children),
      {
        List: ({ children }: any) => createElement('div', { 'data-testid': 'tabs-list' }, children),
        Tab: ({ children, value, disabled }: any) => createElement('button', { 'data-testid': `tab-${value}`, disabled, type: 'button' }, children),
      }
    ),
  };
});

// Mock icons - using complete factory pattern
jest.mock('@luminpdf/icons/dist/csr/ArrowRight', () => {
  const R = require('react');
  return { ArrowRightIcon: (props: any) => R.createElement('span', { ...props, 'data-testid': 'icon-arrow' }) };
});
jest.mock('@luminpdf/icons/dist/csr/CaretRight', () => {
  const R = require('react');
  return { CaretRightIcon: (props: any) => R.createElement('span', { ...props, 'data-testid': 'icon-caret' }) };
});
jest.mock('@luminpdf/icons/dist/csr/FolderOpen', () => {
  const R = require('react');
  return { FolderOpenIcon: (props: any) => R.createElement('span', { ...props, 'data-testid': 'icon-folder' }) };
});
jest.mock('@luminpdf/icons/dist/csr/Info', () => {
  const R = require('react');
  return { InfoIcon: (props: any) => R.createElement('span', { ...props, 'data-testid': 'icon-info' }) };
});
jest.mock('@luminpdf/icons/dist/csr/MagnifyingGlass', () => {
  const R = require('react');
  return { MagnifyingGlassIcon: (props: any) => R.createElement('span', { ...props, 'data-testid': 'icon-search' }) };
});
jest.mock('@luminpdf/icons/dist/csr/User', () => {
  const R = require('react');
  return { UserIcon: (props: any) => R.createElement('span', { ...props, 'data-testid': 'icon-user' }) };
});
jest.mock('@luminpdf/icons/dist/csr/UsersThree', () => {
  const R = require('react');
  return { UsersThreeIcon: (props: any) => R.createElement('span', { ...props, 'data-testid': 'icon-users' }) };
});

jest.mock('styled-components', () => ({
  ThemeProvider: ({ children }: any) => require('react').createElement('div', { 'data-testid': 'theme-provider' }, children),
}));

jest.mock('lumin-components/Icomoon', () => ({ __esModule: true, default: ({ className }: any) => require('react').createElement('span', { 'data-testid': `icomoon-${className}` }) }));
jest.mock('lumin-components/Loading', () => ({ __esModule: true, default: () => require('react').createElement('div', { 'data-testid': 'loading' }) }));

jest.mock('lumin-components/ModalFooter', () => ({
  __esModule: true,
  default: ({ onSubmit, onCancel, disabled, loading, label }: any) =>
    require('react').createElement('div', { 'data-testid': 'modal-footer' },
      require('react').createElement('button', { 'data-testid': 'submit-btn', onClick: onSubmit, disabled: disabled || loading, type: 'button' }, label || 'Submit'),
      require('react').createElement('button', { 'data-testid': 'cancel-btn', onClick: onCancel, type: 'button' }, 'Cancel')
    ),
}));

jest.mock('constants/documentConstants', () => ({ folderType: { INDIVIDUAL: 'INDIVIDUAL', ORGANIZATION: 'ORGANIZATION' } }));
jest.mock('constants/locationConstant', () => ({ LocationType: { ORGANIZATION: 'ORGANIZATION', ORGANIZATION_TEAM: 'ORGANIZATION_TEAM' } }));
jest.mock('constants/styles', () => ({ Colors: { NEUTRAL_100: '#000' } }));

jest.mock('../TransferDocumentStyled', () => {
  const React = require('react');
  return {
    ExpandedItem: ({ children, onClick, $isLastItem, selected }: any) => React.createElement('div', { 'data-testid': 'styled-expanded-item', onClick, 'data-is-last': String(!!$isLastItem), 'data-selected': String(!!selected) }, children),
    ExpandedItemContainer: ({ children, fullWidth, $selected }: any) => React.createElement('div', { 'data-testid': 'styled-item-container', 'data-full-width': String(!!fullWidth), 'data-selected': String(!!$selected) }, children),
    ExpandedItemMainContent: ({ children }: any) => React.createElement('div', { 'data-testid': 'styled-item-main' }, children),
    ExpandedTitle: ({ children }: any) => React.createElement('h3', { 'data-testid': 'styled-expanded-title' }, children),
    ErrorStyled: ({ children }: any) => React.createElement('div', { 'data-testid': 'error-styled' }, children),
    ButtonGroup: ({ children }: any) => React.createElement('div', { 'data-testid': 'button-group' }, children),
    SearchWrapper: ({ children }: any) => React.createElement('div', { 'data-testid': 'search-wrapper' }, children),
    OrgTextNotificationContainer: ({ children }: any) => React.createElement('div', { 'data-testid': 'org-notification' }, children),
    TextNotification: ({ children }: any) => React.createElement('span', { 'data-testid': 'text-notification' }, children),
  };
});

jest.mock('../TransferDocument.module.scss', () => ({
  rootModal: 'rootModal', header: 'header', modalTitle: 'modalTitle', nameInput: 'nameInput',
  sourceWrapper: 'sourceWrapper', label: 'label', destinationOption: 'destinationOption',
  breadcrumbWrapper: 'breadcrumbWrapper', breadcrumbContainer: 'breadcrumbContainer',
  breadcrumbMainItem: 'breadcrumbMainItem', breadcrumbItemContainer: 'breadcrumbItemContainer',
  breadcrumbItem: 'breadcrumbItem', iconSearch: 'iconSearch', divider: 'divider',
  loadingWrapper: 'loadingWrapper', folderIconContainer: 'folderIconContainer',
  defaultAvatar: 'defaultAvatar', expandedListContainer: 'expandedListContainer',
  expandedTitleContainer: 'expandedTitleContainer', expandedTitle: 'expandedTitle',
  expandedItemContainer: 'expandedItemContainer', expandedItemMainContent: 'expandedItemMainContent',
  text: 'text', tabContainer: 'tabContainer', checkboxWrapper: 'checkboxWrapper',
}));

import TransferDocument from 'luminComponents/TransferDocument/TransferDocumentLibrary';

describe('TransferDocumentLibrary', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('Module exports', () => {
    it.each([
      'Container', 'Header', 'NameInput', 'DropdownSources', 'ExpandedList',
      'CustomDivider', 'GroupButton', 'BreadCrumbs', 'SearchBar', 'Error',
      'Checkbox', 'OrgTextNotification', 'CustomLoading', 'ExpandedListTemplate', 'TransferDocumentContext',
    ])('should export %s', (exportName) => {
      expect(TransferDocument[exportName as keyof typeof TransferDocument]).toBeDefined();
    });
  });

  describe('Container', () => {
    it('should render dialog when open is true', () => {
      render(<TransferDocument.Container open={true} initialSource="INDIVIDUAL"><div>Content</div></TransferDocument.Container>);
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('should not render dialog when open is false', () => {
      render(<TransferDocument.Container open={false} initialSource="INDIVIDUAL"><div>Content</div></TransferDocument.Container>);
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('should wrap with ThemeProvider', () => {
      render(<TransferDocument.Container open={true} initialSource="INDIVIDUAL"><div>Content</div></TransferDocument.Container>);
      expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    });

    it('should pass children', () => {
      render(<TransferDocument.Container open={true} initialSource="INDIVIDUAL"><div data-testid="child">Child</div></TransferDocument.Container>);
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('Header', () => {
    it('should render title', () => {
      render(<TransferDocument.Header>Test Title</TransferDocument.Header>);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render h2 element', () => {
      const { container } = render(<TransferDocument.Header>Title</TransferDocument.Header>);
      expect(container.querySelector('h2')).toBeInTheDocument();
    });

    it('should have correct propTypes', () => {
      expect(TransferDocument.Header.propTypes.children).toBeDefined();
      expect(TransferDocument.Header.propTypes.toolTipProps).toBeDefined();
    });

    it('should have null as default toolTipProps', () => {
      expect(TransferDocument.Header.defaultProps.toolTipProps).toBeNull();
    });
  });

  describe('NameInput', () => {
    it('should render input element', () => {
      render(<TransferDocument.NameInput />);
      expect(screen.getByTestId('text-input')).toBeInTheDocument();
    });

    it('should pass error message to input', () => {
      render(<TransferDocument.NameInput errorMessage="Required" />);
      expect(screen.getByTestId('input')).toHaveAttribute('data-error', 'Required');
    });

    it('should have empty string as default errorMessage', () => {
      expect(TransferDocument.NameInput.defaultProps.errorMessage).toBe('');
    });
  });

  describe('CustomDivider', () => {
    it('should render horizontal divider by default', () => {
      const { container } = render(<TransferDocument.CustomDivider />);
      expect(container.querySelector('hr')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should render vertical divider', () => {
      const { container } = render(<TransferDocument.CustomDivider orientation="vertical" />);
      expect(container.querySelector('hr')).toHaveAttribute('data-orientation', 'vertical');
    });
  });

  describe('CustomLoading', () => {
    it('should render loading component', () => {
      render(<TransferDocument.CustomLoading />);
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  describe('Error', () => {
    it('should render error message', () => {
      render(<TransferDocument.Error error="Something went wrong" />);
      expect(screen.getByTestId('error-styled')).toHaveTextContent('Something went wrong');
    });

    it('should render JSX error', () => {
      render(<TransferDocument.Error error={<span>Error JSX</span>} />);
      expect(screen.getByText('Error JSX')).toBeInTheDocument();
    });

    it('should not render when error is null', () => {
      const { container } = render(<TransferDocument.Error error={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('should have null as default error', () => {
      expect(TransferDocument.Error.defaultProps.error).toBeNull();
    });
  });

  describe('Checkbox', () => {
    it('should render checkbox', () => {
      render(<TransferDocument.Checkbox value={false} onChange={jest.fn()}>Label</TransferDocument.Checkbox>);
      expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    });

    it('should render label', () => {
      render(<TransferDocument.Checkbox value={false} onChange={jest.fn()}>Check me</TransferDocument.Checkbox>);
      expect(screen.getByText('Check me')).toBeInTheDocument();
    });

    it('should be checked when value is true', () => {
      render(<TransferDocument.Checkbox value={true} onChange={jest.fn()}>Label</TransferDocument.Checkbox>);
      expect(screen.getByTestId('checkbox')).toBeChecked();
    });

    it('should call onChange', () => {
      const onChange = jest.fn();
      render(<TransferDocument.Checkbox value={false} onChange={onChange}>Label</TransferDocument.Checkbox>);
      fireEvent.click(screen.getByTestId('checkbox'));
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('GroupButton', () => {
    const defaultProps = { submitStatus: { isSubmitting: false, title: 'Submit' }, onSubmit: jest.fn(), onClose: jest.fn(), hasError: false };

    it('should render submit button', () => {
      render(<TransferDocument.GroupButton {...defaultProps} />);
      expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      render(<TransferDocument.GroupButton {...defaultProps} />);
      expect(screen.getByTestId('cancel-btn')).toBeInTheDocument();
    });

    it('should disable submit when hasError is truthy', () => {
      render(<TransferDocument.GroupButton {...defaultProps} hasError="error" />);
      expect(screen.getByTestId('submit-btn')).toBeDisabled();
    });

    it('should not disable submit when hasError is falsy', () => {
      render(<TransferDocument.GroupButton {...defaultProps} hasError={false} />);
      expect(screen.getByTestId('submit-btn')).not.toBeDisabled();
    });

    it('should call onSubmit', () => {
      const onSubmit = jest.fn();
      render(<TransferDocument.GroupButton {...defaultProps} onSubmit={onSubmit} />);
      fireEvent.click(screen.getByTestId('submit-btn'));
      expect(onSubmit).toHaveBeenCalled();
    });

    it('should call onClose', () => {
      const onClose = jest.fn();
      render(<TransferDocument.GroupButton {...defaultProps} onClose={onClose} />);
      fireEvent.click(screen.getByTestId('cancel-btn'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should use custom label', () => {
      render(<TransferDocument.GroupButton {...defaultProps} label="Custom" />);
      expect(screen.getByTestId('submit-btn')).toHaveTextContent('Custom');
    });

    it('should use submitStatus.title when no label', () => {
      render(<TransferDocument.GroupButton {...defaultProps} />);
      expect(screen.getByTestId('submit-btn')).toHaveTextContent('Submit');
    });
  });

  describe('OrgTextNotification', () => {
    it('should render container', () => {
      render(<TransferDocument.OrgTextNotification />);
      expect(screen.getByTestId('org-notification')).toBeInTheDocument();
    });

    it('should render info icon', () => {
      render(<TransferDocument.OrgTextNotification />);
      expect(screen.getByTestId('icomoon-info')).toBeInTheDocument();
    });

    it('should render translation key', () => {
      render(<TransferDocument.OrgTextNotification />);
      expect(screen.getByTestId('text-notification')).toHaveTextContent('modalMakeACopy.orgTextNotification');
    });
  });

  describe('SearchBar propTypes and defaultProps', () => {
    it('should have propTypes defined', () => {
      expect(TransferDocument.SearchBar.propTypes.placeholder).toBeDefined();
      expect(TransferDocument.SearchBar.propTypes.value).toBeDefined();
      expect(TransferDocument.SearchBar.propTypes.onChange).toBeDefined();
    });

    it('should have autoFocus true by default', () => {
      expect(TransferDocument.SearchBar.defaultProps.autoFocus).toBe(true);
    });

    it('should have onClear as function by default', () => {
      expect(typeof TransferDocument.SearchBar.defaultProps.onClear).toBe('function');
    });
  });

  describe('BreadCrumbs propTypes and defaultProps', () => {
    it('should have propTypes defined', () => {
      expect(TransferDocument.BreadCrumbs.propTypes.breadcrumb).toBeDefined();
      expect(TransferDocument.BreadCrumbs.propTypes.onNavigate).toBeDefined();
    });

    it('should have hideSearch false by default', () => {
      expect(TransferDocument.BreadCrumbs.defaultProps.hideSearch).toBe(false);
    });
  });

  describe('ExpandedList propTypes and defaultProps', () => {
    it('should have propTypes defined', () => {
      expect(TransferDocument.ExpandedList.propTypes.onChange).toBeDefined();
      expect(TransferDocument.ExpandedList.propTypes.onNavigate).toBeDefined();
      expect(TransferDocument.ExpandedList.propTypes.expandedList).toBeDefined();
    });

    it('should have correct defaultProps', () => {
      expect(TransferDocument.ExpandedList.defaultProps.disabledValue).toBe('');
      expect(TransferDocument.ExpandedList.defaultProps.isMultipleFile).toBe(false);
    });
  });

  describe('ExpandedListTemplate propTypes and defaultProps', () => {
    it('should have propTypes defined', () => {
      expect(TransferDocument.ExpandedListTemplate.propTypes.user).toBeDefined();
      expect(TransferDocument.ExpandedListTemplate.propTypes.expandedList).toBeDefined();
      expect(TransferDocument.ExpandedListTemplate.propTypes.onChange).toBeDefined();
    });

    it('should have correct defaultProps', () => {
      expect(TransferDocument.ExpandedListTemplate.defaultProps.value).toBe('');
      expect(TransferDocument.ExpandedListTemplate.defaultProps.hideSearch).toBe(false);
    });
  });

  describe('DropdownSources', () => {
    it('should have propTypes', () => {
      expect(TransferDocument.DropdownSources.propTypes.children).toBeDefined();
      expect(TransferDocument.DropdownSources.propTypes.onChange).toBeDefined();
    });
  });

  describe('TransferDocumentContext', () => {
    it('should be a React context', () => {
      expect(TransferDocument.TransferDocumentContext).toBeDefined();
      expect(TransferDocument.TransferDocumentContext.Provider).toBeDefined();
      expect(TransferDocument.TransferDocumentContext.Consumer).toBeDefined();
    });
  });

});
