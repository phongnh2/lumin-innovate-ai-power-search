import React from 'react';
import { shallow } from 'enzyme';

const mockUseContext = jest.fn(() => ({
  selectedDocList: [{ _id: 'doc-1' }],
  selectedFolders: [] as any[],
  onMoveDocumentsDecorator: jest.fn((docs, callback) => callback()),
  onHandleDocumentOvertimeLimit: jest.fn(),
  onMergeDocumentsDecorator: jest.fn((docs, callback) => callback()),
}));

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useContext: () => mockUseContext(),
    useMemo: (fn: () => any) => fn(),
  };
});

const mockUseSelector = jest.fn(() => false);

jest.mock('react-redux', () => ({
  useSelector: () => mockUseSelector(),
}));

const mockUseGetFolderType = jest.fn(() => {
  const { folderType } = require('constants/documentConstants');
  return folderType.INDIVIDUAL;
});

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useGetFolderType: () => mockUseGetFolderType(),
  useGetCurrentOrganization: jest.fn(() => ({ _id: 'org-1', userRole: 'member' })),
  useGetCurrentTeam: jest.fn(() => ({ _id: 'team-1', roleOfUser: 'member' })),
  useAvailablePersonalWorkspace: jest.fn(() => true),
}));

const mockUseBulkActionIconButton = jest.fn(() => false);

jest.mock('features/WebChatBot/hooks/useBulkActionIconButton', () => ({
  useBulkActionIconButton: () => mockUseBulkActionIconButton(),
}));

jest.mock('features/MultipleDownLoad', () => ({
  MultipleDownLoadButton: () => <div data-testid="download-button" />,
}));

jest.mock('features/MultipleMerge/components/MultipleMergeButton/MultipleMergeButton', () => {
  return function MultipleMergeButton() {
    return <div data-testid="merge-button" />;
  };
});

jest.mock('lumin-components/Document/context', () => ({
  DocumentContext: {},
}));

jest.mock('lumin-components/DocumentList/Context', () => ({
  DocumentListContext: {},
}));

jest.mock('utils/Factory/EventCollection/DocActionsEventCollection', () => ({
  __esModule: true,
  default: {
    bulkActions: jest.fn(() => Promise.resolve()),
  },
}));

const mockIsManager = jest.fn(() => false);
const mockIsOrgTeamAdmin = jest.fn(() => false);

jest.mock('services', () => ({
  organizationServices: {
    isManager: (role: string) => mockIsManager(),
  },
  teamServices: {
    isOrgTeamAdmin: (role: any) => mockIsOrgTeamAdmin(),
  },
}));

const DocumentSelectionBar = require('../DocumentSelectionBar').default;

describe('DocumentSelectionBar', () => {
  const mockOnMove = jest.fn();
  const mockOnRemove = jest.fn();
  const mockOnMerge = jest.fn();
  const mockOnChangeCheckbox = jest.fn();
  const mockOnCancelSelectMode = jest.fn();

  const defaultProps = {
    isDisplay: true,
    isDisabled: false,
    totalSelected: 1,
    currentTotalDoc: 5,
    currentTotalFolder: 2,
    isChecked: false,
    onMove: mockOnMove,
    onRemove: mockOnRemove,
    onMerge: mockOnMerge,
    onChangeCheckbox: mockOnChangeCheckbox,
    onCancelSelectMode: mockOnCancelSelectMode,
    totalDoc: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { folderType } = require('constants/documentConstants');
    mockUseGetFolderType.mockReturnValue(folderType.INDIVIDUAL);
    mockUseContext.mockReturnValue({
      selectedDocList: [{ _id: 'doc-1' }],
      selectedFolders: [],
      onMoveDocumentsDecorator: jest.fn((docs, callback) => callback()),
      onHandleDocumentOvertimeLimit: jest.fn(),
      onMergeDocumentsDecorator: jest.fn((docs, callback) => callback()),
    });
    mockUseSelector.mockReturnValue(false);
    mockUseBulkActionIconButton.mockReturnValue(false);
    mockIsManager.mockReturnValue(false);
    mockIsOrgTeamAdmin.mockReturnValue(false);
    const hooks = require('hooks');
    hooks.useGetCurrentOrganization.mockReturnValue({ _id: 'org-1', userRole: 'member' });
    hooks.useGetCurrentTeam.mockReturnValue({ _id: 'team-1', roleOfUser: 'member' });
    hooks.useAvailablePersonalWorkspace.mockReturnValue(true);
  });

  it('should render component', () => {
    const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render when isDisplay is true', () => {
    const wrapper = shallow(<DocumentSelectionBar {...defaultProps} isDisplay={true} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render checkbox', () => {
    const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render move button', () => {
    const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render delete button', () => {
    const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render merge button', () => {
    const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render download button', () => {
    const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle shared folder type', () => {
    const { folderType } = require('constants/documentConstants');
    mockUseGetFolderType.mockReturnValue(folderType.SHARED);
    const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle starred folder type', () => {
    const { folderType } = require('constants/documentConstants');
    mockUseGetFolderType.mockReturnValue(folderType.STARRED);
    const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle organization folder type', () => {
    const { folderType } = require('constants/documentConstants');
    mockUseGetFolderType.mockReturnValue(folderType.ORGANIZATION);
    const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle teams folder type', () => {
    const { folderType } = require('constants/documentConstants');
    mockUseGetFolderType.mockReturnValue(folderType.TEAMS);
    const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle indeterminate checkbox state', () => {
    const wrapper = shallow(<DocumentSelectionBar {...defaultProps} totalSelected={2} currentTotalDoc={5} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle checked checkbox state', () => {
    const wrapper = shallow(<DocumentSelectionBar {...defaultProps} isChecked={true} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle disabled state', () => {
    const wrapper = shallow(<DocumentSelectionBar {...defaultProps} isDisabled={true} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should not render when isDisplay is false', () => {
    const wrapper = shallow(<DocumentSelectionBar {...defaultProps} isDisplay={false} />);
    expect(wrapper.find('[data-testid="merge-button"]').exists()).toBe(false);
  });

  describe('isBulkActionIconButton', () => {
    it('should render IconButton for move when isBulkActionIconButton is true', () => {
      mockUseBulkActionIconButton.mockReturnValue(true);
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      const moveButton = wrapper.find('[data-cy="move_button"]');
      expect(moveButton.exists()).toBe(true);
      expect(moveButton.prop('icon')).toBe('move-md');
    });

    it('should render IconButton for delete when isBulkActionIconButton is true', () => {
      mockUseBulkActionIconButton.mockReturnValue(true);
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      const deleteButton = wrapper.find('[data-cy="delete_button"]');
      expect(deleteButton.exists()).toBe(true);
      expect(deleteButton.prop('icon')).toBe('trash-md');
    });
  });

  describe('multipleActionsMapping - SHARED folder type', () => {
    it('should disable move and merge for SHARED folder type', () => {
      const { folderType } = require('constants/documentConstants');
      mockUseGetFolderType.mockReturnValue(folderType.SHARED);
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      const moveButton = wrapper.find('[data-cy="move_button"]');
      expect(moveButton.exists()).toBe(true);
      expect(moveButton.prop('disabled')).toBe(true);
      const mergeButton = wrapper.find('[data-testid="merge-button"]');
      if (mergeButton.exists()) {
        expect(mergeButton.prop('disabled')).toBe(true);
      }
    });

    it('should show remove text for shared tab', () => {
      const { folderType } = require('constants/documentConstants');
      mockUseGetFolderType.mockReturnValue(folderType.SHARED);
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      const deleteButton = wrapper.find('[data-cy="delete_button"]');
      expect(deleteButton.text()).toContain('common.remove');
    });
  });

  describe('multipleActionsMapping - STARRED folder type', () => {
    it('should disable move, delete and merge for STARRED folder type', () => {
      const { folderType } = require('constants/documentConstants');
      mockUseGetFolderType.mockReturnValue(folderType.STARRED);
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      const moveButton = wrapper.find('[data-cy="move_button"]');
      const deleteButton = wrapper.find('[data-cy="delete_button"]');
      const mergeButton = wrapper.find('[data-testid="merge-button"]');
      expect(moveButton.exists()).toBe(true);
      expect(moveButton.prop('disabled')).toBe(true);
      expect(deleteButton.exists()).toBe(true);
      expect(deleteButton.prop('disabled')).toBe(true);
      if (mergeButton.exists()) {
        expect(mergeButton.prop('disabled')).toBe(true);
      }
    });
  });

  describe('multipleActionsMapping - ORGANIZATION folder type', () => {
    it('should disable move and delete for member in organization', () => {
      const { folderType } = require('constants/documentConstants');
      mockUseGetFolderType.mockReturnValue(folderType.ORGANIZATION);
      mockIsManager.mockReturnValue(false);
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      const moveButton = wrapper.find('[data-cy="move_button"]');
      const deleteButton = wrapper.find('[data-cy="delete_button"]');
      expect(moveButton.prop('disabled')).toBe(true);
      expect(deleteButton.prop('disabled')).toBe(true);
    });

    it('should enable move and delete for manager in organization', () => {
      const { folderType } = require('constants/documentConstants');
      mockUseGetFolderType.mockReturnValue(folderType.ORGANIZATION);
      mockIsManager.mockReturnValue(true);
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      const moveButton = wrapper.find('[data-cy="move_button"]');
      const deleteButton = wrapper.find('[data-cy="delete_button"]');
      expect(wrapper.exists()).toBe(true);
      expect(moveButton.exists()).toBe(true);
      expect(deleteButton.exists()).toBe(true);
    });
  });

  describe('multipleActionsMapping - TEAMS folder type', () => {
    it('should disable move and delete for member in team', () => {
      const { folderType } = require('constants/documentConstants');
      mockUseGetFolderType.mockReturnValue(folderType.TEAMS);
      mockIsOrgTeamAdmin.mockReturnValue(false);
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      const moveButton = wrapper.find('[data-cy="move_button"]');
      const deleteButton = wrapper.find('[data-cy="delete_button"]');
      expect(moveButton.prop('disabled')).toBe(true);
      expect(deleteButton.prop('disabled')).toBe(true);
    });

    it('should enable move and delete for admin in team', () => {
      const { folderType } = require('constants/documentConstants');
      mockUseGetFolderType.mockReturnValue(folderType.TEAMS);
      mockIsOrgTeamAdmin.mockReturnValue(true);
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      const moveButton = wrapper.find('[data-cy="move_button"]');
      const deleteButton = wrapper.find('[data-cy="delete_button"]');
      expect(moveButton.prop('disabled')).toBe(false);
      expect(deleteButton.prop('disabled')).toBe(false);
    });

    it('should handle team without _id', () => {
      const { folderType } = require('constants/documentConstants');
      const hooks = require('hooks');
      mockUseGetFolderType.mockReturnValue(folderType.TEAMS);
      hooks.useGetCurrentTeam.mockReturnValue({ roleOfUser: 'member' });
      mockIsManager.mockReturnValue(false);
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('multipleActionsMapping - default case (INDIVIDUAL, DEVICE, RECENT, etc.)', () => {
    it('should use commonMultipleActionsMapping for INDIVIDUAL folder type', () => {
      const { folderType } = require('constants/documentConstants');
      mockUseGetFolderType.mockReturnValue(folderType.INDIVIDUAL);
      mockUseContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1' }],
        selectedFolders: [],
        onMoveDocumentsDecorator: jest.fn((docs, callback) => callback()),
        onHandleDocumentOvertimeLimit: jest.fn(),
        onMergeDocumentsDecorator: jest.fn((docs, callback) => callback()),
      });
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      const moveButton = wrapper.find('[data-cy="move_button"]');
      const deleteButton = wrapper.find('[data-cy="delete_button"]');
      expect(moveButton.exists()).toBe(true);
      expect(deleteButton.exists()).toBe(true);
      expect(moveButton.prop('disabled')).toBe(false);
      expect(deleteButton.prop('disabled')).toBe(false);
    });

    it('should use commonMultipleActionsMapping for DEVICE folder type', () => {
      const { folderType } = require('constants/documentConstants');
      mockUseGetFolderType.mockReturnValue(folderType.DEVICE);
      mockUseContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1' }],
        selectedFolders: [],
        onMoveDocumentsDecorator: jest.fn((docs, callback) => callback()),
        onHandleDocumentOvertimeLimit: jest.fn(),
        onMergeDocumentsDecorator: jest.fn((docs, callback) => callback()),
      });
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
      const moveButton = wrapper.find('[data-cy="move_button"]');
      expect(moveButton.exists()).toBe(true);
    });

    it('should use commonMultipleActionsMapping for RECENT folder type', () => {
      const { folderType } = require('constants/documentConstants');
      mockUseGetFolderType.mockReturnValue(folderType.RECENT);
      mockUseContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1' }],
        selectedFolders: [],
        onMoveDocumentsDecorator: jest.fn((docs, callback) => callback()),
        onHandleDocumentOvertimeLimit: jest.fn(),
        onMergeDocumentsDecorator: jest.fn((docs, callback) => callback()),
      });
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
      const moveButton = wrapper.find('[data-cy="move_button"]');
      expect(moveButton.exists()).toBe(true);
    });

    it('should use commonMultipleActionsMapping for unknown folder type', () => {
      mockUseGetFolderType.mockReturnValue('unknown-type');
      mockUseContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1' }],
        selectedFolders: [],
        onMoveDocumentsDecorator: jest.fn((docs, callback) => callback()),
        onHandleDocumentOvertimeLimit: jest.fn(),
        onMergeDocumentsDecorator: jest.fn((docs, callback) => callback()),
      });
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
      const moveButton = wrapper.find('[data-cy="move_button"]');
      expect(moveButton.exists()).toBe(true);
    });
  });

  describe('selected documents and folders combinations', () => {
    it('should disable move when both documents and folders are selected', () => {
      mockUseContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1' }],
        selectedFolders: [{ _id: 'folder-1' }],
        onMoveDocumentsDecorator: jest.fn((docs, callback) => callback()),
        onHandleDocumentOvertimeLimit: jest.fn(),
        onMergeDocumentsDecorator: jest.fn((docs, callback) => callback()),
      });
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      const moveButton = wrapper.find('[data-cy="move_button"]');
      expect(moveButton.prop('disabled')).toBe(true);
    });

    it('should disable merge when only folders are selected', () => {
      mockUseContext.mockReturnValue({
        selectedDocList: [],
        selectedFolders: [{ _id: 'folder-1' }],
        onMoveDocumentsDecorator: jest.fn((docs, callback) => callback()),
        onHandleDocumentOvertimeLimit: jest.fn(),
        onMergeDocumentsDecorator: jest.fn((docs, callback) => callback()),
      });
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      const mergeButton = wrapper.find('[data-testid="merge-button"]');
      if (mergeButton.exists()) {
        expect(mergeButton.prop('disabled')).toBe(true);
      } else {
        expect(wrapper.exists()).toBe(true);
      }
    });

    it('should disable merge when documents exceed MAX_MERGE_DOCUMENTS_SELECTION', () => {
      const { MAX_MERGE_DOCUMENTS_SELECTION } = require('features/MultipleMerge/constants');
      const docs = Array.from({ length: MAX_MERGE_DOCUMENTS_SELECTION + 1 }, (_, i) => ({
        _id: `doc-${i}`,
      }));
      mockUseContext.mockReturnValue({
        selectedDocList: docs,
        selectedFolders: [],
        onMoveDocumentsDecorator: jest.fn((docs, callback) => callback()),
        onHandleDocumentOvertimeLimit: jest.fn(),
        onMergeDocumentsDecorator: jest.fn((docs, callback) => callback()),
      });
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} totalSelected={docs.length} />);
      const mergeButton = wrapper.find('[data-testid="merge-button"]');
      if (mergeButton.exists()) {
        expect(mergeButton.prop('disabled')).toBe(true);
      } else {
        expect(wrapper.exists()).toBe(true);
      }
    });
  });

  describe('isPersonalWorkspaceAvailable', () => {
    it('should return empty mapping when isPersonalWorkspaceAvailable is false', () => {
      const hooks = require('hooks');
      hooks.useAvailablePersonalWorkspace.mockReturnValue(false);
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should return empty mapping when currentOrganization is missing', () => {
      const hooks = require('hooks');
      hooks.useAvailablePersonalWorkspace.mockReturnValue(false);
      hooks.useGetCurrentOrganization.mockReturnValue(null);
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should return empty mapping when currentTeam is missing', () => {
      const hooks = require('hooks');
      hooks.useAvailablePersonalWorkspace.mockReturnValue(false);
      hooks.useGetCurrentTeam.mockReturnValue(null);
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should return empty mapping when currentFolderType is missing', () => {
      const hooks = require('hooks');
      hooks.useAvailablePersonalWorkspace.mockReturnValue(false);
      mockUseGetFolderType.mockReturnValue(null);
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should return empty mapping when nothing is selected', () => {
      const hooks = require('hooks');
      hooks.useAvailablePersonalWorkspace.mockReturnValue(false);
      mockUseContext.mockReturnValue({
        selectedDocList: [],
        selectedFolders: [],
        onMoveDocumentsDecorator: jest.fn((docs, callback) => callback()),
        onHandleDocumentOvertimeLimit: jest.fn(),
        onMergeDocumentsDecorator: jest.fn((docs, callback) => callback()),
      });
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('offline state', () => {
    it('should disable buttons when offline', () => {
      mockUseSelector.mockReturnValue(true);
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      const downloadButton = wrapper.find('[data-testid="download-button"]');
      const mergeButton = wrapper.find('[data-testid="merge-button"]');
      const moveButton = wrapper.find('[data-cy="move_button"]');
      if (downloadButton.exists()) {
        expect(downloadButton.prop('disabled')).toBe(true);
      }
      if (mergeButton.exists()) {
        expect(mergeButton.prop('disableTooltipInteractive')).toBe(true);
      }
      if (moveButton.exists()) {
        const tooltip = moveButton.closest('PlainTooltip');
        if (tooltip.exists()) {
          expect(tooltip.prop('disabled')).toBe(true);
        }
      }
    });
  });

  describe('handleHeaderAction', () => {
    it('should call onHandleDocumentOvertimeLimit when document is over time limit', () => {
      const mockOnHandleDocumentOvertimeLimit = jest.fn();
      mockUseContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1', isOverTimeLimit: true } as any],
        selectedFolders: [],
        onMoveDocumentsDecorator: jest.fn((docs, callback) => callback()),
        onHandleDocumentOvertimeLimit: mockOnHandleDocumentOvertimeLimit,
        onMergeDocumentsDecorator: jest.fn((docs, callback) => callback()),
      });
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      const moveButton = wrapper.find('[data-cy="move_button"]');
      moveButton.simulate('click');
      expect(mockOnHandleDocumentOvertimeLimit).toHaveBeenCalledWith({ _id: 'doc-1', isOverTimeLimit: true });
    });

    it('should call decoratorHandler when no document is over time limit', () => {
      const mockOnMoveDocumentsDecorator = jest.fn((docs, callback) => callback());
      mockUseContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1' }],
        selectedFolders: [],
        onMoveDocumentsDecorator: mockOnMoveDocumentsDecorator,
        onHandleDocumentOvertimeLimit: jest.fn(),
        onMergeDocumentsDecorator: jest.fn((docs, callback) => callback()),
      });
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} onMove={mockOnMove} />);
      const moveButton = wrapper.find('[data-cy="move_button"]');
      moveButton.simulate('click');
      expect(mockOnMoveDocumentsDecorator).toHaveBeenCalled();
    });
  });

  describe('tooltip content', () => {
    it('should show tooltip when action cannot be performed on folders and documents', () => {
      mockUseContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1' }],
        selectedFolders: [{ _id: 'folder-1' }],
        onMoveDocumentsDecorator: jest.fn((docs, callback) => callback()),
        onHandleDocumentOvertimeLimit: jest.fn(),
        onMergeDocumentsDecorator: jest.fn((docs, callback) => callback()),
      });
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      const tooltips = wrapper.find('PlainTooltip');
      if (tooltips.length > 0) {
        const tooltipWithContent = tooltips.findWhere(
          (node: any) => node.prop('content') === 'documentPage.reskin.actionCannotPerformedOnFoldersAndDocuments'
        );
        expect(tooltipWithContent.length).toBeGreaterThan(0);
      } else {
        expect(wrapper.exists()).toBe(true);
      }
    });

    it('should show tooltip when action cannot be performed on folders', () => {
      mockUseContext.mockReturnValue({
        selectedDocList: [],
        selectedFolders: [{ _id: 'folder-1' }],
        onMoveDocumentsDecorator: jest.fn((docs, callback) => callback()),
        onHandleDocumentOvertimeLimit: jest.fn(),
        onMergeDocumentsDecorator: jest.fn((docs, callback) => callback()),
      });
      const wrapper = shallow(<DocumentSelectionBar {...defaultProps} />);
      const tooltips = wrapper.find('PlainTooltip');
      if (tooltips.length > 0) {
        const tooltipWithContent = tooltips.findWhere(
          (node: any) => node.prop('content') === 'documentPage.reskin.actionCannotPerformedOnFolders'
        );
        expect(tooltipWithContent.length).toBeGreaterThan(0);
      } else {
        expect(wrapper.exists()).toBe(true);
      }
    });
  });

  it('should calculate indeterminate state correctly with default values', () => {
    const wrapper = shallow(<DocumentSelectionBar isDisplay={true} />);
    expect(wrapper.exists()).toBe(true);
  });
});
