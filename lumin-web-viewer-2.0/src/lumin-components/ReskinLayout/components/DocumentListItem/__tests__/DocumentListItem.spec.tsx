import React from 'react';
import { mount } from 'enzyme';
import { STORAGE_TYPE } from 'constants/lumin-common';

jest.mock('lumin-ui/kiwi-ui', () => ({
  Checkbox: ({
    checked,
    onChange,
    disabled,
    size,
    borderColor,
  }: {
    checked: boolean;
    onChange: () => void;
    disabled: boolean;
    size: string;
    borderColor: string;
  }) => (
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
  Chip: ({ label, variant, size, colorType }: { label: string; variant: string; size: string; colorType: string }) => (
    <div data-testid="chip" data-label={label} data-variant={variant} data-size={size} data-color-type={colorType} />
  ),
  PlainTooltip: ({
    children,
    content,
    disabled,
  }: {
    children: React.ReactNode;
    content: string;
    disabled: boolean;
  }) => (
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
    useContext: jest.fn(() => ({
      selectDocMode: false,
      folderDraggingOver: false,
    })),
    useState: jest.fn((initial) => [initial, jest.fn()]),
    useMemo: jest.fn((fn) => fn()),
  };
});

jest.mock('luminComponents/DocumentList/Context', () => ({
  DocumentListRendererContext: {},
}));

jest.mock('luminComponents/SvgElement', () => {
  return function SvgElement({
    content,
    height,
    maxWidth,
    isReskin,
  }: {
    content: string;
    height: number;
    maxWidth: number;
    isReskin: boolean;
  }) {
    return (
      <div
        data-testid="svg-element"
        data-content={content}
        data-height={height}
        data-max-width={maxWidth}
        data-reskin={isReskin}
      />
    );
  };
});

jest.mock('HOC/withDropDocPopup', () => ({
  __esModule: true,
  default: {
    DropDocumentPopupContext: {},
  },
}));

jest.mock('hooks', () => ({
  useDoubleTap: jest.fn((callback) => callback),
  useTranslation: () => ({ t: (key: string) => key }),
  usePersonalDocPathMatch: jest.fn(() => false),
}));

jest.mock('hooks/useKeyboardAccessibility', () => ({
  __esModule: true,
  default: () => ({ onKeyDown: jest.fn() }),
}));

jest.mock('utils', () => ({
  getFileService: {
    getThumbnailUrl: jest.fn((thumbnail) => `thumbnail-${thumbnail}`),
  },
}));

jest.mock('features/WebChatBot/hooks/useChatbotStore', () => ({
  useChatbotStore: () => ({ isVisible: false }),
}));

jest.mock('../components', () => ({
  TextField: ({
    value,
    disabled,
    type,
    size,
    tooltip,
    color,
    component,
  }: {
    value: string;
    disabled: boolean;
    type: string;
    size: string;
    tooltip: boolean;
    color: string;
    component: string;
  }) => (
    <div
      data-testid="text-field"
      data-value={value}
      data-disabled={disabled}
      data-type={type}
      data-size={size}
      data-tooltip={tooltip}
      data-color={color}
      data-component={component}
    />
  ),
  DocumentThumbnail: ({ src, altText, isNewUpload }: { src: string; altText: string; isNewUpload: boolean }) => (
    <div data-testid="document-thumbnail" data-src={src} data-alt={altText} data-new-upload={isNewUpload} />
  ),
}));

jest.mock('../components/DocumentName', () => ({
  DocumentName: ({ name, disabled }: { name: string; disabled: boolean }) => (
    <div data-testid="document-name" data-name={name} data-disabled={disabled} />
  ),
}));

jest.mock('../../DocumentItemStar', () => ({
  DocumentItemStar: ({
    document,
    isStarred,
    disabled,
    size,
  }: {
    document: any;
    isStarred: boolean;
    disabled: boolean;
    size: string;
  }) => (
    <div
      data-testid="document-star"
      data-document-id={document._id}
      data-starred={isStarred}
      data-disabled={disabled}
      data-size={size}
    />
  ),
}));

import DocumentListItem from '../DocumentListItem';

describe('DocumentListItem', () => {
  const mockDocument = {
    _id: 'doc-123',
    name: 'Test Document.pdf',
    service: STORAGE_TYPE.SYSTEM,
    thumbnail: 'thumb.jpg',
    ownerName: 'John Doe',
    lastAccess: '2024-01-01',
    isOverTimeLimit: false,
    newUpload: false,
    highlightFoundDocument: false,
  };

  const mockRenderMenuActions = jest.fn(({ openMenu, setOpenMenu }) => (
    <div data-testid="menu-actions" data-open={openMenu} />
  ));

  const mockRenderQuickActions = jest.fn(() => <div data-testid="quick-actions" />);

  const defaultProps = {
    document: mockDocument,
    isSelected: false,
    isDisabled: {
      selection: false,
      actions: false,
      open: false,
      drag: false,
    },
    storageLogo: 'logo.svg',
    isStarred: false,
    dragRef: { current: null as any },
    onCheckboxChange: jest.fn(),
    onOpenDocument: jest.fn(),
    renderMenuActions: mockRenderMenuActions,
    onShareItemClick: jest.fn(),
    onCopyShareLink: jest.fn(),
    renderQuickActions: mockRenderQuickActions,
    foundDocumentScrolling: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} />);
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should render checkbox', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} />);
    const checkbox = wrapper.find('[data-testid="checkbox"]');
    expect(checkbox.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should check checkbox when selected', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} isSelected={true} />);
    const checkbox = wrapper.find('[data-testid="checkbox"]');
    expect(checkbox.prop('checked')).toBe(true);
    wrapper.unmount();
  });

  it('should uncheck checkbox when not selected', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} isSelected={false} />);
    const checkbox = wrapper.find('[data-testid="checkbox"]');
    expect(checkbox.prop('checked')).toBe(false);
    wrapper.unmount();
  });

  it('should disable checkbox when selection is disabled', () => {
    const disabledProps = {
      ...defaultProps,
      isDisabled: { ...defaultProps.isDisabled, selection: true },
    };
    const wrapper = mount(<DocumentListItem {...(disabledProps as any)} />);
    const checkbox = wrapper.find('[data-testid="checkbox"]');
    expect(checkbox.prop('disabled')).toBe(true);
    wrapper.unmount();
  });

  it('should call onCheckboxChange when checkbox is clicked', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} />);
    const checkbox = wrapper.find('[data-testid="checkbox"]');
    checkbox.simulate('change');
    expect(defaultProps.onCheckboxChange).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('should render document thumbnail', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} />);
    const thumbnail = wrapper.find('[data-testid="document-thumbnail"]');
    expect(thumbnail.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should pass newUpload to thumbnail', () => {
    const newDocument = { ...mockDocument, newUpload: true };
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} document={newDocument as any} />);
    const thumbnail = wrapper.find('[data-testid="document-thumbnail"]');
    expect(thumbnail.prop('data-new-upload')).toBe(true);
    wrapper.unmount();
  });

  it('should render document name', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} />);
    const name = wrapper.find('[data-testid="document-name"]');
    expect(name.exists()).toBe(true);
    expect(name.prop('data-name')).toBe('Test Document');
    wrapper.unmount();
  });

  it('should render owner name when not personal documents route', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} />);
    const ownerFields = wrapper.find('[data-testid="text-field"]');
    const ownerField = ownerFields.findWhere((field) => field.prop('data-value') === 'John Doe');
    expect(ownerField.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should not render owner name when personal documents route', () => {
    const { usePersonalDocPathMatch } = require('hooks');
    usePersonalDocPathMatch.mockReturnValue(true);
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} />);
    const ownerFields = wrapper.find('[data-testid="text-field"]');
    const ownerField = ownerFields.findWhere((field) => field.prop('data-value') === 'John Doe');
    expect(ownerField.exists()).toBe(false);
    wrapper.unmount();
  });

  it('should render storage logo when provided', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} storageLogo="test-logo.svg" />);
    const svgElement = wrapper.find('[data-testid="svg-element"]');
    expect(svgElement.exists()).toBe(true);
    expect(svgElement.prop('data-content')).toBe('test-logo.svg');
    wrapper.unmount();
  });

  it('should not render storage logo when not provided', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} storageLogo="" />);
    const svgElement = wrapper.find('[data-testid="svg-element"]');
    expect(svgElement.exists()).toBe(false);
    wrapper.unmount();
  });

  it('should render expired chip when isOverTimeLimit is true', () => {
    const expiredDocument = { ...mockDocument, isOverTimeLimit: true };
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} document={expiredDocument as any} />);
    const chip = wrapper.find('[data-testid="chip"]');
    expect(chip.exists()).toBe(true);
    expect(chip.prop('data-label')).toBe('documentPage.expired');
    wrapper.unmount();
  });

  it('should not render expired chip when isOverTimeLimit is false', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} />);
    const chip = wrapper.find('[data-testid="chip"]');
    expect(chip.exists()).toBe(false);
    wrapper.unmount();
  });

  it('should render star component', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} />);
    const star = wrapper.find('[data-testid="document-star"]');
    expect(star.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should pass isStarred to star component', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} isStarred={true} />);
    const star = wrapper.find('[data-testid="document-star"]');
    expect(star.prop('data-starred')).toBe(true);
    wrapper.unmount();
  });

  it('should render last access date', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} />);
    const textFields = wrapper.find('[data-testid="text-field"]');
    const lastAccessField = textFields.findWhere((field) => field.prop('data-value') === '2024-01-01');
    expect(lastAccessField.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should render quick actions', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} />);
    const quickActions = wrapper.find('[data-testid="quick-actions"]');
    expect(quickActions.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should render menu actions', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} />);
    const menuActions = wrapper.find('[data-testid="menu-actions"]');
    expect(menuActions.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should call onOpenDocument on double click', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} />);
    const container = wrapper.find('[data-cy="document_item"]');
    container.simulate('doubleClick', { target: document.createElement('div') });
    expect(defaultProps.onOpenDocument).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('should not call onOpenDocument when clicking on star button', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} />);
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
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} />);
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

  it('should not call onOpenDocument when clicking on share button', () => {
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} />);
    const container = wrapper.find('[data-cy="document_item"]');
    const mockElement = document.createElement('div');
    mockElement.setAttribute('data-button-share-id', 'doc-123');
    const mockEvent = {
      target: mockElement,
    };
    mockElement.closest = jest.fn((selector) => {
      if (selector.includes('data-button-share-id')) return mockElement;
      return null;
    });
    container.simulate('doubleClick', mockEvent);
    expect(defaultProps.onOpenDocument).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('should disable document name when selection is disabled', () => {
    const disabledProps = {
      ...defaultProps,
      isDisabled: { ...defaultProps.isDisabled, selection: true },
    };
    const wrapper = mount(<DocumentListItem {...(disabledProps as any)} />);
    const name = wrapper.find('[data-testid="document-name"]');
    expect(name.prop('data-disabled')).toBe(true);
    wrapper.unmount();
  });

  it('should disable document name when drag is disabled', () => {
    const disabledProps = {
      ...defaultProps,
      isDisabled: { ...defaultProps.isDisabled, drag: true },
    };
    const wrapper = mount(<DocumentListItem {...(disabledProps as any)} />);
    const name = wrapper.find('[data-testid="document-name"]');
    expect(name.prop('data-disabled')).toBe(true);
    wrapper.unmount();
  });

  it('should disable star when actions are disabled', () => {
    const disabledProps = {
      ...defaultProps,
      isDisabled: { ...defaultProps.isDisabled, actions: true },
    };
    const wrapper = mount(<DocumentListItem {...(disabledProps as any)} />);
    const star = wrapper.find('[data-testid="document-star"]');
    expect(star.prop('data-disabled')).toBe(true);
    wrapper.unmount();
  });

  it('should handle highlightFoundDocument', () => {
    const highlightDocument = { ...mockDocument, highlightFoundDocument: true };
    const wrapper = mount(<DocumentListItem {...(defaultProps as any)} document={highlightDocument as any} />);
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });
});
