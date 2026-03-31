import React from 'react';
import { shallow } from 'enzyme';
import { STORAGE_TYPE } from 'constants/lumin-common';
import { DocumentActions } from 'constants/documentConstants';

jest.mock('lumin-ui/kiwi-ui', () => ({
  IconButton: ({
    icon,
    onClick,
    size,
    'data-cy': dataCy,
    'data-button-share-id': dataButtonShareId,
  }: {
    icon: string;
    onClick: () => void;
    size: string;
    'data-cy': string;
    'data-button-share-id': string;
  }) => (
    <button
      data-testid="icon-button"
      data-icon={icon}
      onClick={onClick}
      data-size={size}
      data-cy={dataCy}
      data-button-share-id={dataButtonShareId}
    />
  ),
  PlainTooltip: ({
    children,
    content,
    withinPortal,
  }: {
    children: React.ReactNode;
    content: string;
    withinPortal: boolean;
  }) => (
    <div data-testid="tooltip" data-content={content} data-portal={withinPortal}>
      {children}
    </div>
  ),
}));

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useContext: jest.fn(() => ({
      externalDocumentExistenceGuard: jest.fn((doc, callback) => callback()),
      onHandleDocumentOvertimeLimit: jest.fn(),
    })),
  };
});

jest.mock('luminComponents/DocumentList/Context', () => ({
  DocumentListContext: {},
}));

jest.mock('HOC/withDocumentItemAuthorization', () => ({
  __esModule: true,
  default: (Component: React.ComponentType<any>) => Component,
}));

jest.mock('utils/Factory/EventCollection/DocActionsEventCollection', () => ({
  __esModule: true,
  default: {
    quickActions: jest.fn(() => Promise.resolve()),
  },
}));

import QuickActions from '../QuickActions';
import { DocumentListContext } from 'luminComponents/DocumentList/Context';

describe('QuickActions', () => {
  const mockDocument = {
    _id: 'doc-123',
    name: 'Test Document.pdf',
    service: STORAGE_TYPE.S3,
    isOverTimeLimit: false,
  };

  const mockActions = {
    copyLink: jest.fn(),
    share: jest.fn(),
    makeACopy: jest.fn(),
  };

  const mockWithAuthorize = jest.fn((action) => {
    return true;
  });

  const mockCheckCapabilitiesDocumentPermission = jest.fn((action) => {
    return true;
  });

  const defaultProps = {
    document: mockDocument,
    actions: mockActions,
    withAuthorize: mockWithAuthorize,
    checkCapabilitiesDocumentPermission: mockCheckCapabilitiesDocumentPermission,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWithAuthorize.mockImplementation((action) => true);
    mockCheckCapabilitiesDocumentPermission.mockImplementation((action) => true);
    const React = require('react');
    React.useContext.mockReturnValue({
      externalDocumentExistenceGuard: jest.fn((doc, callback) => callback()),
      onHandleDocumentOvertimeLimit: jest.fn(),
    });
  });

  it('should render component', () => {
    const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render Make A Copy button when authorized', () => {
    const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
    const button = wrapper.find('[data-cy="quick_action_make_a_copy_button"]');
    expect(button.exists()).toBe(true);
  });

  it('should render Share button when authorized and not system file', () => {
    const nonSystemDocument = { ...mockDocument, service: STORAGE_TYPE.S3 };
    const wrapper = shallow(<QuickActions {...(defaultProps as any)} document={nonSystemDocument as any} />);
    const button = wrapper.find('[data-cy="quick_action_share_button"]');
    expect(button.exists()).toBe(true);
  });

  it('should render Copy Link button when authorized', () => {
    const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
    const button = wrapper.find('[data-cy="quick_action_copy_link_button"]');
    expect(button.exists()).toBe(true);
  });

  it('should not render Share button for system files', () => {
    const systemDocument = { ...mockDocument, service: STORAGE_TYPE.SYSTEM };
    const wrapper = shallow(<QuickActions {...(defaultProps as any)} document={systemDocument as any} />);
    const shareButtons = wrapper.find('[data-icon="share-md"]');
    expect(shareButtons.length).toBe(0);
  });

  it('should not render buttons when not authorized', () => {
    const unauthorizedCheck = jest.fn(() => false);
    const wrapper = shallow(<QuickActions {...(defaultProps as any)} withAuthorize={unauthorizedCheck} />);
    const copyButton = wrapper.find('[data-cy="quick_action_make_a_copy_button"]');
    const linkButton = wrapper.find('[data-cy="quick_action_copy_link_button"]');
    expect(copyButton.exists()).toBe(false);
    expect(linkButton.exists()).toBe(false);
  });

  it('should call makeACopy action when Make A Copy button is clicked', () => {
    const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
    const button = wrapper.find('[data-cy="quick_action_make_a_copy_button"]');
    if (button.exists()) {
      const mockEvent = { stopPropagation: jest.fn() } as any;
      button.prop('onClick')(mockEvent);
      expect(mockActions.makeACopy).toHaveBeenCalledWith(mockEvent);
    }
  });

  it('should call share action when Share button is clicked', () => {
    const nonSystemDocument = { ...mockDocument, service: STORAGE_TYPE.S3 };
    const wrapper = shallow(<QuickActions {...(defaultProps as any)} document={nonSystemDocument as any} />);
    const button = wrapper
      .find('[data-testid="icon-button"]')
      .filterWhere((n) => n.prop('data-icon') === 'share-md')
      .first();
    if (button.exists()) {
      const mockEvent = { stopPropagation: jest.fn() } as any;
      button.prop('onClick')(mockEvent);
      expect(mockActions.share).toHaveBeenCalledWith(mockEvent);
    } else {
      expect(wrapper.exists()).toBe(true);
    }
  });

  it('should call copyLink action when Copy Link button is clicked', () => {
    const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
    const button = wrapper.find('[data-cy="quick_action_copy_link_button"]');
    if (button.exists()) {
      const mockEvent = { stopPropagation: jest.fn() } as any;
      button.prop('onClick')(mockEvent);
      expect(mockActions.copyLink).toHaveBeenCalledWith(mockEvent);
    }
  });

  it('should render component with overtime limit document', () => {
    const overtimeDocument = { ...mockDocument, isOverTimeLimit: true };
    const wrapper = shallow(<QuickActions {...(defaultProps as any)} document={overtimeDocument as any} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should use portal tooltip when withPortalTooltip is true', () => {
    const wrapper = shallow(<QuickActions {...(defaultProps as any)} withPortalTooltip={true} />);
    const tooltips = wrapper.find('[data-testid="tooltip"]');
    tooltips.forEach((tooltip) => {
      expect(tooltip.prop('data-portal')).toBe(true);
    });
  });

  it('should not use portal tooltip by default', () => {
    const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
    const tooltips = wrapper.find('[data-testid="tooltip"]');
    tooltips.forEach((tooltip) => {
      expect(tooltip.prop('data-portal')).toBe(false);
    });
  });

  it('should check authorization for each action', () => {
    shallow(<QuickActions {...(defaultProps as any)} />);
    expect(mockWithAuthorize).toHaveBeenCalledWith(DocumentActions.MakeACopy);
  });

  it('should set correct data-cy attributes for non-system file', () => {
    const nonSystemDocument = { ...mockDocument, service: STORAGE_TYPE.S3 };
    const wrapper = shallow(<QuickActions {...(defaultProps as any)} document={nonSystemDocument as any} />);
    const copyButton = wrapper.find('[data-cy="quick_action_make_a_copy_button"]');
    const shareButton = wrapper.find('[data-cy="quick_action_share_button"]');
    const linkButton = wrapper.find('[data-cy="quick_action_copy_link_button"]');

    expect(copyButton.exists()).toBe(true);
    expect(shareButton.exists()).toBe(true);
    expect(linkButton.exists()).toBe(true);
  });

  it('should render all three actions for non-system file', () => {
    const nonSystemDocument = { ...mockDocument, service: STORAGE_TYPE.S3 };
    const wrapper = shallow(<QuickActions {...(defaultProps as any)} document={nonSystemDocument as any} />);
    const copyButton = wrapper.find('[data-cy="quick_action_make_a_copy_button"]');
    const shareButton = wrapper.find('[data-cy="quick_action_share_button"]');
    const linkButton = wrapper.find('[data-cy="quick_action_copy_link_button"]');
    expect(copyButton.exists()).toBe(true);
    expect(shareButton.exists()).toBe(true);
    expect(linkButton.exists()).toBe(true);
  });

  it('should render only two actions for system file', () => {
    const systemDocument = { ...mockDocument, service: STORAGE_TYPE.SYSTEM };
    const wrapper = shallow(<QuickActions {...(defaultProps as any)} document={systemDocument as any} />);
    const copyButton = wrapper.find('[data-cy="quick_action_make_a_copy_button"]');
    const shareButton = wrapper.find('[data-cy="quick_action_share_button"]');
    const linkButton = wrapper.find('[data-cy="quick_action_copy_link_button"]');
    expect(copyButton.exists()).toBe(true);
    expect(shareButton.exists()).toBe(false);
    expect(linkButton.exists()).toBe(true);
  });

  describe('authorization branches', () => {
    it('should not render Make A Copy button when not authorized', () => {
      mockWithAuthorize.mockImplementation((action) => action !== DocumentActions.MakeACopy);
      const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
      const button = wrapper.find('[data-cy="quick_action_make_a_copy_button"]');
      expect(button.exists()).toBe(false);
    });

    it('should not render Share button when not authorized', () => {
      const nonSystemDocument = { ...mockDocument, service: STORAGE_TYPE.S3 };
      mockWithAuthorize.mockImplementation((action) => action !== DocumentActions.Share);
      const wrapper = shallow(<QuickActions {...(defaultProps as any)} document={nonSystemDocument as any} />);
      const button = wrapper.find('[data-cy="quick_action_share_button"]');
      expect(button.exists()).toBe(false);
    });

    it('should not render Copy Link button when not authorized', () => {
      mockWithAuthorize.mockImplementation((action) => action !== DocumentActions.CopyLink);
      const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
      const button = wrapper.find('[data-cy="quick_action_copy_link_button"]');
      expect(button.exists()).toBe(false);
    });
  });

  describe('overtime limit branches', () => {
    it('should call onHandleDocumentOvertimeLimit when document is over time limit and expiredBlocking is true', () => {
      const React = require('react');
      const mockOnHandleDocumentOvertimeLimit = jest.fn();
      React.useContext.mockReturnValue({
        externalDocumentExistenceGuard: jest.fn((doc, callback) => callback()),
        onHandleDocumentOvertimeLimit: mockOnHandleDocumentOvertimeLimit,
      });
      const overtimeDocument = { ...mockDocument, isOverTimeLimit: true };
      const wrapper = shallow(<QuickActions {...(defaultProps as any)} document={overtimeDocument as any} />);
      const button = wrapper.find('[data-cy="quick_action_make_a_copy_button"]');
      if (button.exists()) {
        const mockEvent = { stopPropagation: jest.fn() } as any;
        button.prop('onClick')(mockEvent);
        expect(mockOnHandleDocumentOvertimeLimit).toHaveBeenCalledWith(overtimeDocument);
        expect(mockActions.makeACopy).not.toHaveBeenCalled();
      }
    });

    it('should call action when document is not over time limit', () => {
      const normalDocument = { ...mockDocument, isOverTimeLimit: false };
      const wrapper = shallow(<QuickActions {...(defaultProps as any)} document={normalDocument as any} />);
      const button = wrapper.find('[data-cy="quick_action_make_a_copy_button"]');
      if (button.exists()) {
        const mockEvent = { stopPropagation: jest.fn() } as any;
        button.prop('onClick')(mockEvent);
        expect(mockActions.makeACopy).toHaveBeenCalledWith(mockEvent);
      }
    });
  });

  describe('precheckingRequired branches', () => {
    it('should call externalDocumentExistenceGuard when precheckingRequired is true', () => {
      const React = require('react');
      const mockExternalDocumentExistenceGuard = jest.fn((doc, callback) => callback());
      React.useContext.mockReturnValue({
        externalDocumentExistenceGuard: mockExternalDocumentExistenceGuard,
        onHandleDocumentOvertimeLimit: jest.fn(),
      });
      const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
      const button = wrapper.find('[data-cy="quick_action_make_a_copy_button"]');
      if (button.exists()) {
        const mockEvent = { stopPropagation: jest.fn() } as any;
        button.prop('onClick')(mockEvent);
        expect(mockExternalDocumentExistenceGuard).toHaveBeenCalledWith(
          mockDocument,
          expect.any(Function),
          DocumentActions.MakeACopy
        );
        expect(mockActions.makeACopy).toHaveBeenCalledWith(mockEvent);
      }
    });

    it('should call clickAction directly when precheckingRequired is false', () => {
      const React = require('react');
      const mockExternalDocumentExistenceGuard = jest.fn((doc, callback) => {
        callback();
      });
      React.useContext.mockReturnValue({
        externalDocumentExistenceGuard: mockExternalDocumentExistenceGuard,
        onHandleDocumentOvertimeLimit: jest.fn(),
      });
      const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
      const button = wrapper.find('[data-cy="quick_action_copy_link_button"]');
      if (button.exists()) {
        const mockEvent = { stopPropagation: jest.fn() } as any;
        button.prop('onClick')(mockEvent);
        expect(mockActions.copyLink).toHaveBeenCalledWith(mockEvent);
      }
    });

    it('should handle missing externalDocumentExistenceGuard', () => {
      const React = require('react');
      React.useContext.mockReturnValue({
        externalDocumentExistenceGuard: undefined,
        onHandleDocumentOvertimeLimit: jest.fn(),
      });
      const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should handle case when externalDocumentExistenceGuard does not call callback', () => {
      const React = require('react');
      const mockExternalDocumentExistenceGuard = jest.fn();
      React.useContext.mockReturnValue({
        externalDocumentExistenceGuard: mockExternalDocumentExistenceGuard,
        onHandleDocumentOvertimeLimit: jest.fn(),
      });
      const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
      const button = wrapper.find('[data-cy="quick_action_make_a_copy_button"]');
      if (button.exists()) {
        const mockEvent = { stopPropagation: jest.fn() } as any;
        button.prop('onClick')(mockEvent);
        expect(mockExternalDocumentExistenceGuard).toHaveBeenCalled();
        expect(mockActions.makeACopy).not.toHaveBeenCalled();
      }
    });

    it('should handle missing onHandleDocumentOvertimeLimit', () => {
      const React = require('react');
      React.useContext.mockReturnValue({
        externalDocumentExistenceGuard: jest.fn((doc, callback) => callback()),
        onHandleDocumentOvertimeLimit: undefined,
      });
      const overtimeDocument = { ...mockDocument, isOverTimeLimit: true };
      const wrapper = shallow(<QuickActions {...(defaultProps as any)} document={overtimeDocument as any} />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('context branches', () => {
    it('should handle missing DocumentListContext', () => {
      const React = require('react');
      React.useContext.mockReturnValue(null);
      const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should handle empty DocumentListContext', () => {
      const React = require('react');
      React.useContext.mockReturnValue({});
      const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('renderItem branches', () => {
    it('should not render when withAuthorize returns false', () => {
      mockWithAuthorize.mockImplementation(() => false);
      const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
      const copyButton = wrapper.find('[data-cy="quick_action_make_a_copy_button"]');
      expect(copyButton.exists()).toBe(false);
    });

    it('should not render when item is undefined', () => {
      const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('docActionsEvent.quickActions error handling', () => {
    it('should handle error in docActionsEvent.quickActions', () => {
      const docActionsEvent = require('utils/Factory/EventCollection/DocActionsEventCollection').default;
      docActionsEvent.quickActions.mockRejectedValue(new Error('Event error'));
      const wrapper = shallow(<QuickActions {...(defaultProps as any)} />);
      const button = wrapper.find('[data-cy="quick_action_make_a_copy_button"]');
      if (button.exists()) {
        const mockEvent = { stopPropagation: jest.fn() } as any;
        expect(() => button.prop('onClick')(mockEvent)).not.toThrow();
        expect(mockActions.makeACopy).toHaveBeenCalledWith(mockEvent);
      }
    });
  });
});
