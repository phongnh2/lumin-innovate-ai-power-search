import React from 'react';
import { mount } from 'enzyme';
import { STORAGE_TYPE } from 'constants/lumin-common';

jest.mock('lumin-ui/kiwi-ui', () => ({
  Checkbox: ({ checked, onChange, disabled, size, borderColor }) => (
    <input
      type="checkbox"
      data-testid="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      data-size={size}
      data-border-color={borderColor}
    />
  ),
  Chip: ({ label, variant, size, colorType }) => (
    <div data-testid="chip" data-label={label} data-variant={variant} data-size={size} data-color-type={colorType} />
  ),
  PlainTooltip: ({ children, content, disabled }) => (
    <div data-testid="tooltip" data-content={content} data-disabled={disabled}>
      {children}
    </div>
  ),
  ButtonSize: {
    md: 'md',
    sm: 'sm',
  },
  TextSize: { md: 'md', sm: 'sm' },
  TextType: { body: 'body', title: 'title' },
}));

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useContext: jest.fn((context) => {
      // Return appropriate mock data based on context
      return { selectDocMode: false, folderDraggingOver: false };
    }),
    useState: jest.fn((initial) => [initial, jest.fn()]),
    useMemo: jest.fn((fn) => fn()),
  };
});

jest.mock('luminComponents/DocumentList/Context', () => ({
  DocumentListRendererContext: {},
}));

jest.mock('HOC/withDropDocPopup', () => ({
  __esModule: true,
  default: {
    DropDocumentPopupContext: {},
  },
}));

jest.mock('hooks', () => ({
  useDoubleTap: jest.fn((callback) => callback),
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('hooks/useKeyboardAccessibility', () => ({
  __esModule: true,
  default: () => ({ onKeyDown: jest.fn() }),
}));

jest.mock('utils', () => ({
  file: {
    getFilenameWithoutExtension: jest.fn((name) => name.replace(/\.[^/.]+$/, '')),
  },
  getFileService: {
    getThumbnailUrl: jest.fn((thumbnail) => `thumbnail-${thumbnail}`),
  },
}));

jest.mock('../components', () => ({
  DocumentThumbnail: ({ src, altText }) => (
    <div data-testid="document-thumbnail" data-src={src} data-alt={altText} />
  ),
}));

jest.mock('../../DocumentItemStar', () => ({
  DocumentItemStar: ({ document, isStarred, disabled, size }) => (
    <div
      data-testid="document-star"
      data-document-id={document._id}
      data-starred={isStarred}
      data-disabled={disabled}
      data-size={size}
    />
  ),
}));

jest.mock('../../DocumentListItem/components', () => ({
  TextField: ({ value, disabled, type, size, tooltip, color }) => (
    <div
      data-testid="text-field"
      data-value={value}
      data-disabled={disabled}
      data-type={type}
      data-size={size}
      data-tooltip={tooltip}
      data-color={color}
    />
  ),
}));

import DocumentGridItem from '../DocumentGridItem';

describe('DocumentGridItem', () => {
  const mockDocument = {
    _id: 'doc-123',
    name: 'Test Document.pdf',
    service: STORAGE_TYPE.LUMIN,
    thumbnail: 'thumb.jpg',
    isOverTimeLimit: false,
    newUpload: false,
  };

  const mockRenderMenuActions = jest.fn(({ openMenu, setOpenMenu }) => (
    <div data-testid="menu-actions" data-open={openMenu} />
  ));

  const defaultProps = {
    document: mockDocument,
    isSelected: false,
    isDisabled: {
      selection: false,
      actions: false,
      open: false,
      drag: false,
    },
    dragRef: { current: null },
    storageLogo: 'logo.svg',
    isStarred: false,
    onOpenDocument: jest.fn(),
    onCheckboxChange: jest.fn(),
    renderMenuActions: mockRenderMenuActions,
    onShareItemClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component', () => {
    const wrapper = mount(<DocumentGridItem {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should render checkbox', () => {
    const wrapper = mount(<DocumentGridItem {...defaultProps} />);
    const checkbox = wrapper.find('[data-testid="checkbox"]');
    expect(checkbox.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should check checkbox when selected', () => {
    const wrapper = mount(<DocumentGridItem {...defaultProps} isSelected={true} />);
    const checkbox = wrapper.find('[data-testid="checkbox"]');
    expect(checkbox.prop('checked')).toBe(true);
    wrapper.unmount();
  });

  it('should uncheck checkbox when not selected', () => {
    const wrapper = mount(<DocumentGridItem {...defaultProps} isSelected={false} />);
    const checkbox = wrapper.find('[data-testid="checkbox"]');
    expect(checkbox.prop('checked')).toBe(false);
    wrapper.unmount();
  });

  it('should disable checkbox when selection is disabled', () => {
    const disabledProps = {
      ...defaultProps,
      isDisabled: { ...defaultProps.isDisabled, selection: true },
    };
    const wrapper = mount(<DocumentGridItem {...disabledProps} />);
    const checkbox = wrapper.find('[data-testid="checkbox"]');
    expect(checkbox.prop('disabled')).toBe(true);
    wrapper.unmount();
  });

  it('should call onCheckboxChange when checkbox is clicked', () => {
    const wrapper = mount(<DocumentGridItem {...defaultProps} />);
    const checkbox = wrapper.find('[data-testid="checkbox"]');
    checkbox.simulate('change');
    expect(defaultProps.onCheckboxChange).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('should render document thumbnail', () => {
    const wrapper = mount(<DocumentGridItem {...defaultProps} />);
    const thumbnail = wrapper.find('[data-testid="document-thumbnail"]');
    expect(thumbnail.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should render expired chip when isOverTimeLimit is true', () => {
    const expiredDocument = { ...mockDocument, isOverTimeLimit: true };
    const wrapper = mount(<DocumentGridItem {...defaultProps} document={expiredDocument} />);
    const chip = wrapper.find('[data-testid="chip"]');
    expect(chip.exists()).toBe(true);
    expect(chip.prop('data-label')).toBe('documentPage.expired');
    wrapper.unmount();
  });

  it('should not render expired chip when isOverTimeLimit is false', () => {
    const wrapper = mount(<DocumentGridItem {...defaultProps} />);
    const chip = wrapper.find('[data-testid="chip"]');
    expect(chip.exists()).toBe(false);
    wrapper.unmount();
  });

  it('should render document name without extension', () => {
    const wrapper = mount(<DocumentGridItem {...defaultProps} />);
    const textField = wrapper.find('[data-testid="text-field"]');
    expect(textField.prop('data-value')).toBe('Test Document');
    wrapper.unmount();
  });

  it('should render star component', () => {
    const wrapper = mount(<DocumentGridItem {...defaultProps} />);
    const star = wrapper.find('[data-testid="document-star"]');
    expect(star.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should pass isStarred to star component', () => {
    const wrapper = mount(<DocumentGridItem {...defaultProps} isStarred={true} />);
    const star = wrapper.find('[data-testid="document-star"]');
    expect(star.prop('data-starred')).toBe(true);
    wrapper.unmount();
  });

  it('should render menu actions', () => {
    const wrapper = mount(<DocumentGridItem {...defaultProps} />);
    const menuActions = wrapper.find('[data-testid="menu-actions"]');
    expect(menuActions.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should call onOpenDocument on double click', () => {
    const wrapper = mount(<DocumentGridItem {...defaultProps} />);
    const container = wrapper.find('[data-cy="document_item"]');
    container.simulate('doubleClick', { target: document.createElement('div') });
    expect(defaultProps.onOpenDocument).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('should not call onOpenDocument when clicking on star button', () => {
    const wrapper = mount(<DocumentGridItem {...defaultProps} />);
    const container = wrapper.find('[data-cy="document_item"]');
    const mockElement = document.createElement('div');
    mockElement.setAttribute('data-button-star-id', 'doc-123');
    const mockEvent = {
      target: mockElement,
    };
    mockElement.closest = jest.fn((selector) => {
      if (selector.includes('data-button-star-id')) return mockElement;
      return null;
    });
    container.simulate('doubleClick', mockEvent);
    expect(defaultProps.onOpenDocument).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('should not call onOpenDocument when clicking on more button', () => {
    const wrapper = mount(<DocumentGridItem {...defaultProps} />);
    const container = wrapper.find('[data-cy="document_item"]');
    const mockElement = document.createElement('div');
    mockElement.setAttribute('data-button-more-id', 'doc-123');
    const mockEvent = {
      target: mockElement,
    };
    mockElement.closest = jest.fn((selector) => {
      if (selector.includes('data-button-more-id')) return mockElement;
      return null;
    });
    container.simulate('doubleClick', mockEvent);
    expect(defaultProps.onOpenDocument).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('should show new upload indicator when newUpload is true', () => {
    const newDocument = { ...mockDocument, newUpload: true };
    const wrapper = mount(<DocumentGridItem {...defaultProps} document={newDocument} />);
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should disable text field when selection is disabled', () => {
    const disabledProps = {
      ...defaultProps,
      isDisabled: { ...defaultProps.isDisabled, selection: true },
    };
    const wrapper = mount(<DocumentGridItem {...disabledProps} />);
    const textField = wrapper.find('[data-testid="text-field"]');
    expect(textField.prop('data-disabled')).toBe(true);
    wrapper.unmount();
  });

  it('should disable text field when drag is disabled', () => {
    const disabledProps = {
      ...defaultProps,
      isDisabled: { ...defaultProps.isDisabled, drag: true },
    };
    const wrapper = mount(<DocumentGridItem {...disabledProps} />);
    const textField = wrapper.find('[data-testid="text-field"]');
    expect(textField.prop('data-disabled')).toBe(true);
    wrapper.unmount();
  });

  it('should disable star when actions are disabled', () => {
    const disabledProps = {
      ...defaultProps,
      isDisabled: { ...defaultProps.isDisabled, actions: true },
    };
    const wrapper = mount(<DocumentGridItem {...disabledProps} />);
    const star = wrapper.find('[data-testid="document-star"]');
    expect(star.prop('data-disabled')).toBe(true);
    wrapper.unmount();
  });
});

