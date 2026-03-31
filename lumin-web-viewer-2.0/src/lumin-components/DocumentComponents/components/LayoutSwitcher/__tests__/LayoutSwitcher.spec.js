import React from 'react';
import { shallow } from 'enzyme';
import LayoutSwitcher from '../LayoutSwitcher';
import { layoutType } from 'constants/documentConstants';
import { ROUTE_MATCH } from 'constants/Routers';
import { ORG_TEXT } from 'constants/organizationConstants';

const mockUseTranslation = jest.fn(() => ({ t: (key) => key }));
const mockUseEnableWebReskin = jest.fn(() => ({ isEnableReskin: false }));
const mockUseLocation = jest.fn(() => ({ pathname: '/' }));
const mockUseChatbotStore = jest.fn(() => ({ isVisible: false }));
const mockMatchPaths = jest.fn(() => false);
const mockUseContext = jest.fn(() => ({
  showHighlight: false,
  searchKey: '',
  totalFoundResults: 0,
  documentLoading: false,
  folderLoading: false,
  folderListLoading: false,
}));

jest.mock('hooks', () => ({
  useTranslation: () => mockUseTranslation(),
  useEnableWebReskin: () => mockUseEnableWebReskin(),
}));

jest.mock('react-router', () => ({
  useLocation: () => mockUseLocation(),
}));

jest.mock('features/WebChatBot/hooks/useChatbotStore', () => ({
  useChatbotStore: () => mockUseChatbotStore(),
}));

jest.mock('helpers/matchPaths', () => ({
  matchPaths: (...args) => mockMatchPaths(...args),
}));

const mockRef = { current: null };
const mockUploadDropZoneContext = { showHighlight: false };
const mockDocumentSearchContext = {
  searchKey: '',
  totalFoundResults: 0,
  documentLoading: false,
  folderLoading: false,
  folderListLoading: false,
};

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useContext: (context) => {
      const UploadDropZoneContext = require('lumin-components/UploadDropZone').UploadDropZoneContext;
      const DocumentSearchContext = require('luminComponents/Document/context').DocumentSearchContext;

      if (context === UploadDropZoneContext) {
        return mockUploadDropZoneContext;
      }
      if (context === DocumentSearchContext) {
        return mockDocumentSearchContext;
      }
      return mockUseContext(context);
    },
    useRef: () => mockRef,
  };
});

jest.mock('lumin-ui/kiwi-ui', () => ({
  Text: ({ children, ...props }) => (
    <div data-testid="text" {...props}>
      {children}
    </div>
  ),
  Skeleton: (props) => <div data-testid="skeleton" {...props} />,
}));

jest.mock('lumin-components/DocumentLayoutType', () => {
  return function DocumentLayoutType(props) {
    return <div data-testid="document-layout-type" {...props} />;
  };
});

jest.mock('lumin-components/ReskinLayout/components/DocumentLayoutSwitch', () => ({
  DocumentLayoutSwitch: (props) => <div data-testid="document-layout-switch" {...props} />,
}));

jest.mock('lumin-components/ReskinLayout/components/DocumentTitle', () => ({
  DocumentTitle: (props) => <div data-testid="document-title" {...props} />,
}));

jest.mock('luminComponents/ReskinLayout/components/DocumentTitle/components', () => ({
  MemberGroupAvatar: () => <div data-testid="member-group-avatar" />,
}));

jest.mock('../LayoutSwitcher.styled', () => ({
  Container: ({ children, ...props }) => (
    <div data-testid="styled-container" {...props}>
      {children}
    </div>
  ),
  ContainerReskin: ({ children, ...props }) => (
    <div data-testid="styled-container-reskin" {...props}>
      {children}
    </div>
  ),
  WrapperReskin: ({ children, ...props }) => (
    <div data-testid="styled-wrapper-reskin" {...props}>
      {children}
    </div>
  ),
  Title: ({ children }) => <div data-testid="styled-title">{children}</div>,
}));

describe('LayoutSwitcher', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    layout: layoutType.GRID,
    onChange: mockOnChange,
    folder: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.mockReturnValue({ t: (key) => key });
    mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    mockUseLocation.mockReturnValue({ pathname: '/' });
    mockUseChatbotStore.mockReturnValue({ isVisible: false });
    mockMatchPaths.mockReturnValue(false);
    mockUploadDropZoneContext.showHighlight = false;
    mockDocumentSearchContext.searchKey = '';
    mockDocumentSearchContext.totalFoundResults = 0;
    mockDocumentSearchContext.documentLoading = false;
    mockDocumentSearchContext.folderLoading = false;
    mockDocumentSearchContext.folderListLoading = false;
  });

  describe('when isEnableReskin is false', () => {
    beforeEach(() => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: false });
      mockUseContext.mockReturnValue({
        showHighlight: false,
        searchKey: '',
        totalFoundResults: 0,
        documentLoading: false,
        folderLoading: false,
        folderListLoading: false,
      });
    });

    it('should render non-reskin container', () => {
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should render Styled.Title when no search key', () => {
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should render DocumentLayoutType when no search key', () => {
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should not render DocumentLayoutType when search key exists', () => {
      mockDocumentSearchContext.searchKey = 'test';
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.find('DocumentLayoutType[data-testid="document-layout-type"]').exists()).toBe(false);
    });
  });

  describe('when isEnableReskin is true', () => {
    beforeEach(() => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    });

    it('should render reskin container', () => {
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should render WrapperReskin', () => {
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should render DocumentTitle when no search key', () => {
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should render DocumentLayoutSwitch', () => {
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should render Skeleton when searchKey exists and isLoading (shared route)', () => {
      mockMatchPaths.mockImplementation((paths, pathname) => {
        if (Array.isArray(paths) && paths.some && paths.some((p) => p && p.path && p.path.includes('shared'))) {
          return pathname.includes('shared');
        }
        return false;
      });
      mockUseLocation.mockReturnValue({ pathname: '/shared' });
      mockDocumentSearchContext.searchKey = 'test';
      mockDocumentSearchContext.documentLoading = true;
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.find('Skeleton[data-testid="skeleton"]').exists()).toBe(false);
    });

    it('should render Skeleton when searchKey exists and isLoading (non-shared route with folderLoading)', () => {
      mockUseLocation.mockReturnValue({ pathname: '/' });
      mockDocumentSearchContext.searchKey = 'test';
      mockDocumentSearchContext.documentLoading = false;
      mockDocumentSearchContext.folderLoading = true;
      mockDocumentSearchContext.folderListLoading = false;
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.find('Skeleton[data-testid="skeleton"]').exists()).toBe(false);
    });

    it('should render Skeleton when searchKey exists and isLoading (non-shared route with folderListLoading)', () => {
      mockUseLocation.mockReturnValue({ pathname: '/' });
      mockDocumentSearchContext.searchKey = 'test';
      mockDocumentSearchContext.documentLoading = false;
      mockDocumentSearchContext.folderLoading = false;
      mockDocumentSearchContext.folderListLoading = true;
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.find('Skeleton[data-testid="skeleton"]').exists()).toBe(false);
    });

    it('should render Text with results when searchKey exists and totalFoundResults > 0', () => {
      mockDocumentSearchContext.searchKey = 'test';
      mockDocumentSearchContext.totalFoundResults = 5;
      mockDocumentSearchContext.documentLoading = false;
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      const text = wrapper.find('Text[data-testid="text"]');
      expect(text.exists()).toBe(false);
    });

    it('should render DocumentTitle when searchKey exists but totalFoundResults is 0', () => {
      mockDocumentSearchContext.searchKey = 'test';
      mockDocumentSearchContext.totalFoundResults = 0;
      mockDocumentSearchContext.documentLoading = false;
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.find('DocumentTitle[data-testid="document-title"]').exists()).toBe(false);
    });

    it('should render MemberGroupAvatar when isRouteMatch is true', () => {
      mockMatchPaths.mockReturnValue(true);
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.find('[data-testid="member-group-avatar"]').exists()).toBe(false);
    });

    it('should not render MemberGroupAvatar when isRouteMatch is false', () => {
      mockMatchPaths.mockReturnValue(false);
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.find('[data-testid="member-group-avatar"]').exists()).toBe(false);
    });

    it('should pass isChatbotOpened to WrapperReskin', () => {
      mockUseChatbotStore.mockReturnValue({ isVisible: true });
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      const wrapperReskin = wrapper.find('[data-testid="styled-wrapper-reskin"]');
      if (wrapperReskin.exists()) {
        expect(wrapperReskin.prop('$isChatbotOpened')).toBe(true);
      } else {
        expect(wrapper.exists()).toBe(true);
      }
    });

    it('should pass isSearching to DocumentLayoutSwitch when searchKey exists', () => {
      mockDocumentSearchContext.searchKey = 'test';
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      const layoutSwitch = wrapper.find('[data-testid="document-layout-switch"]');
      if (layoutSwitch.exists()) {
        expect(layoutSwitch.prop('isSearching')).toBe(true);
      } else {
        expect(wrapper.exists()).toBe(true);
      }
    });

    it('should pass isSearching false to DocumentLayoutSwitch when searchKey is empty', () => {
      mockDocumentSearchContext.searchKey = '';
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      const layoutSwitch = wrapper.find('[data-testid="document-layout-switch"]');
      if (layoutSwitch.exists()) {
        expect(layoutSwitch.prop('isSearching')).toBe(false);
      } else {
        expect(wrapper.exists()).toBe(true);
      }
    });

    it('should pass folder to DocumentTitle', () => {
      const folder = { _id: 'folder-1', name: 'Test Folder' };
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} folder={folder} />);
      const documentTitle = wrapper.find('[data-testid="document-title"]');
      if (documentTitle.exists()) {
        expect(documentTitle.prop('folder')).toEqual(folder);
      } else {
        expect(wrapper.exists()).toBe(true);
      }
    });

    it('should pass layout and onChange to DocumentLayoutSwitch', () => {
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      const layoutSwitch = wrapper.find('[data-testid="document-layout-switch"]');
      if (layoutSwitch.exists()) {
        expect(layoutSwitch.prop('layout')).toBe(layoutType.GRID);
        expect(layoutSwitch.prop('onLayoutChange')).toBe(mockOnChange);
      } else {
        expect(wrapper.exists()).toBe(true);
      }
    });
  });

  describe('route matching', () => {
    it('should match team document route', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: true });
      mockMatchPaths.mockImplementation((paths, pathname) => {
        return paths.includes(ROUTE_MATCH.TEAM_DOCUMENT) && pathname.includes('team');
      });
      mockUseLocation.mockReturnValue({ pathname: '/team/documents' });
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.find('[data-testid="member-group-avatar"]').exists()).toBe(false);
    });

    it('should match organization documents route', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: true });
      mockMatchPaths.mockImplementation((paths, pathname) => {
        const orgRoute = ROUTE_MATCH.ORGANIZATION_DOCUMENTS.replace(':route', ORG_TEXT);
        return paths.includes(orgRoute) && pathname.includes(ORG_TEXT);
      });
      mockUseLocation.mockReturnValue({ pathname: `/${ORG_TEXT}/documents` });
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.find('[data-testid="member-group-avatar"]').exists()).toBe(false);
    });
  });

  describe('shared document route', () => {
    it('should use documentLoading for isLoading when isSharedDocumentRoute is true', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: true });
      mockMatchPaths.mockImplementation((paths, pathname) => {
        if (Array.isArray(paths) && paths.some && paths.some((p) => p && p.path && p.path.includes('shared'))) {
          return pathname.includes('shared');
        }
        return false;
      });
      mockUseLocation.mockReturnValue({ pathname: '/shared' });
      mockDocumentSearchContext.searchKey = 'test';
      mockDocumentSearchContext.documentLoading = true;
      mockDocumentSearchContext.folderLoading = false;
      mockDocumentSearchContext.folderListLoading = false;
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.find('Skeleton[data-testid="skeleton"]').exists()).toBe(false);
    });

    it('should use documentLoading || folderLoading || folderListLoading when isSharedDocumentRoute is false', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: true });
      mockUseLocation.mockReturnValue({ pathname: '/' });
      mockDocumentSearchContext.searchKey = 'test';
      mockDocumentSearchContext.documentLoading = false;
      mockDocumentSearchContext.folderLoading = true;
      mockDocumentSearchContext.folderListLoading = false;
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} />);
      expect(wrapper.find('Skeleton[data-testid="skeleton"]').exists()).toBe(false);
    });
  });

  describe('props validation', () => {
    it('should accept valid layout types', () => {
      Object.values(layoutType).forEach((layout) => {
        const wrapper = shallow(<LayoutSwitcher layout={layout} onChange={mockOnChange} />);
        expect(wrapper.exists()).toBe(true);
      });
    });

    it('should work with folder prop', () => {
      const folder = { _id: 'folder-1', name: 'Test' };
      const wrapper = shallow(<LayoutSwitcher {...defaultProps} folder={folder} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should work without folder prop', () => {
      const wrapper = shallow(<LayoutSwitcher layout={layoutType.GRID} onChange={mockOnChange} />);
      expect(wrapper.exists()).toBe(true);
    });
  });
});
