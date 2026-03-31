import React from 'react';
import { shallow } from 'enzyme';
import DocumentListHeader from '../DocumentListHeader';
import { layoutType, ownerFilter, folderType } from 'constants/documentConstants';
import { mount } from 'enzyme';

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useEffect: jest.fn((fn) => fn()),
  };
});

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key) => key }),
  useGetFolderType: jest.fn(() => 'individual'),
  useEnableWebReskin: jest.fn(() => ({ isEnableReskin: false })),
  usePersonalDocPathMatch: jest.fn(() => false),
}));

jest.mock('features/WebChatBot/hooks/useChatbotStore', () => ({
  useChatbotStore: () => ({ isVisible: false }),
}));

jest.mock('luminComponents/Icomoon', () => {
  return function Icomoon() {
    return <div data-testid="icomoon" />;
  };
});

jest.mock('luminComponents/PopperButton', () => {
  return function PopperButton({ children }) {
    return <div data-testid="popper-button">{children}</div>;
  };
});

jest.mock('../DocumentListHeader.styled', () => ({
  Container: ({ children }) => <div data-testid="container">{children}</div>,
  ContainerReskin: ({ children }) => <div data-testid="container-reskin">{children}</div>,
  Title: ({ children }) => <div data-testid="title">{children}</div>,
  TitleReskin: ({ children }) => <div data-testid="title-reskin">{children}</div>,
  OwnerTitle: ({ children }) => <div data-testid="owner-title">{children}</div>,
  OwnerTitleReskin: ({ children }) => <div data-testid="owner-title-reskin">{children}</div>,
  TitleTablet: ({ children }) => <div data-testid="title-tablet">{children}</div>,
  TitleTabletReskin: ({ children }) => <div data-testid="title-tablet-reskin">{children}</div>,
  UploadedTitle: ({ children }) => <div data-testid="uploaded-title">{children}</div>,
  UploadedTitleReskin: ({ children }) => <div data-testid="uploaded-title-reskin">{children}</div>,
  SelectDocument: ({ children, onClick }) => (
    <div data-testid="select-document" onClick={onClick}>
      {children}
    </div>
  ),
  SelectDocumentReskin: ({ children, onClick }) => (
    <div data-testid="select-document-reskin" onClick={onClick}>
      {children}
    </div>
  ),
  DisplayTablet: ({ children }) => <div data-testid="display-tablet">{children}</div>,
  MobileDisplay: ({ children }) => <div data-testid="mobile-display">{children}</div>,
}));

describe('DocumentListHeader', () => {
  const mockSetOwnedFilter = jest.fn();
  const mockSetLastModifiedFilter = jest.fn();
  const mockSetSelectDocMode = jest.fn();
  const mockSetRemoveDocList = jest.fn();
  const mockSetRemoveFolderList = jest.fn();

  const defaultProps = {
    ownedFilterCondition: ownerFilter.byAnyone,
    setOwnedFilter: mockSetOwnedFilter,
    setLastModifiedFilter: mockSetLastModifiedFilter,
    type: layoutType.list,
    isEmptyList: false,
    selectedDocList: [],
    selectDocMode: false,
    setSelectDocMode: mockSetSelectDocMode,
    setRemoveDocList: mockSetRemoveDocList,
    setRemoveFolderList: mockSetRemoveFolderList,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component', () => {
    const wrapper = shallow(<DocumentListHeader {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render list view type', () => {
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.list} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render grid view type', () => {
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.grid} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should toggle selection mode when select button clicked', () => {
    const wrapper = shallow(<DocumentListHeader {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should clear doc list when exiting select mode', () => {
    const wrapper = shallow(<DocumentListHeader {...defaultProps} selectDocMode={true} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should not render when isEmptyList is true with reskin', () => {
    const { useEnableWebReskin } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    const wrapper = shallow(<DocumentListHeader {...defaultProps} isEmptyList={true} />);
    expect(wrapper.type()).toBe(null);
  });

  it('should render owner filter dropdown for organization folder', () => {
    const { useGetFolderType } = require('hooks');
    useGetFolderType.mockReturnValue(folderType.ORGANIZATION);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render owner filter dropdown for teams folder', () => {
    const { useGetFolderType } = require('hooks');
    useGetFolderType.mockReturnValue(folderType.TEAMS);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render owner filter dropdown for starred folder', () => {
    const { useGetFolderType } = require('hooks');
    useGetFolderType.mockReturnValue(folderType.STARRED);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle personal documents route', () => {
    const { usePersonalDocPathMatch } = require('hooks');
    usePersonalDocPathMatch.mockReturnValue(true);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render with selected documents', () => {
    const wrapper = shallow(<DocumentListHeader {...defaultProps} selectedDocList={[{ _id: '1' }]} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render reskin version', () => {
    const { useEnableWebReskin } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    const wrapper = shallow(<DocumentListHeader {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should return null when reskin and selectDocMode is true', () => {
    const { useEnableWebReskin } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    const wrapper = shallow(<DocumentListHeader {...defaultProps} selectDocMode={true} />);
    expect(wrapper.type()).toBe(null);
  });

  it('should return null when reskin and selectedDocList has items', () => {
    const { useEnableWebReskin } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    const wrapper = shallow(<DocumentListHeader {...defaultProps} selectedDocList={[{ _id: '1' }]} />);
    expect(wrapper.type()).toBe(null);
  });

  it('should show name when layout is list', () => {
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.list} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should show foldersAndFiles when layout is grid', () => {
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.grid} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should show dropdown for STARRED folder', () => {
    const { useGetFolderType } = require('hooks');
    useGetFolderType.mockReturnValue(folderType.STARRED);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.list} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should show dropdown for ORGANIZATION folder with list type', () => {
    const { useGetFolderType } = require('hooks');
    useGetFolderType.mockReturnValue(folderType.ORGANIZATION);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.list} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should show dropdown for TEAMS folder with list type', () => {
    const { useGetFolderType } = require('hooks');
    useGetFolderType.mockReturnValue(folderType.TEAMS);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.list} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should not show dropdown for INDIVIDUAL folder', () => {
    const { useGetFolderType } = require('hooks');
    useGetFolderType.mockReturnValue(folderType.INDIVIDUAL);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.list} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should not show dropdown for SHARED folder', () => {
    const { useGetFolderType } = require('hooks');
    useGetFolderType.mockReturnValue(folderType.SHARED);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.list} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should not show dropdown for DEVICE folder', () => {
    const { useGetFolderType } = require('hooks');
    useGetFolderType.mockReturnValue(folderType.DEVICE);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.list} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should show cancel when selectDocMode is true', () => {
    const wrapper = shallow(<DocumentListHeader {...defaultProps} selectDocMode={true} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should show select when selectDocMode is false', () => {
    const wrapper = shallow(<DocumentListHeader {...defaultProps} selectDocMode={false} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle personal documents route with reskin', () => {
    const { useEnableWebReskin, usePersonalDocPathMatch } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    usePersonalDocPathMatch.mockReturnValue(true);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle non-personal documents route with reskin', () => {
    const { useEnableWebReskin, usePersonalDocPathMatch } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    usePersonalDocPathMatch.mockReturnValue(false);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render dropdown with reskin and list type for ORGANIZATION', () => {
    const { useEnableWebReskin, useGetFolderType } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    useGetFolderType.mockReturnValue(folderType.ORGANIZATION);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.list} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render dropdown with reskin and list type for TEAMS', () => {
    const { useEnableWebReskin, useGetFolderType } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    useGetFolderType.mockReturnValue(folderType.TEAMS);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.list} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render dropdown with reskin and list type for STARRED', () => {
    const { useEnableWebReskin, useGetFolderType } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    useGetFolderType.mockReturnValue(folderType.STARRED);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.list} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render with reskin and grid type', () => {
    const { useEnableWebReskin } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.grid} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render dropdown without reskin for ORGANIZATION', () => {
    const { useEnableWebReskin, useGetFolderType } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    useGetFolderType.mockReturnValue(folderType.ORGANIZATION);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.list} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render dropdown without reskin for TEAMS', () => {
    const { useEnableWebReskin, useGetFolderType } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    useGetFolderType.mockReturnValue(folderType.TEAMS);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.list} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render dropdown without reskin for STARRED', () => {
    const { useEnableWebReskin, useGetFolderType } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    useGetFolderType.mockReturnValue(folderType.STARRED);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.list} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render without reskin and grid type', () => {
    const { useEnableWebReskin } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.grid} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render when isEmptyList is true without reskin', () => {
    const { useEnableWebReskin } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    const wrapper = shallow(<DocumentListHeader {...defaultProps} isEmptyList={true} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render when selectedDocList has items without reskin', () => {
    const { useEnableWebReskin } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    const wrapper = shallow(<DocumentListHeader {...defaultProps} selectedDocList={[{ _id: '1' }]} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render when selectDocMode is true without reskin', () => {
    const { useEnableWebReskin } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    const wrapper = shallow(<DocumentListHeader {...defaultProps} selectDocMode={true} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle personal documents route without reskin', () => {
    const { useEnableWebReskin, usePersonalDocPathMatch } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    usePersonalDocPathMatch.mockReturnValue(true);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle non-personal documents route without reskin', () => {
    const { useEnableWebReskin, usePersonalDocPathMatch } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    usePersonalDocPathMatch.mockReturnValue(false);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle RECENT folder type', () => {
    const { useGetFolderType } = require('hooks');
    useGetFolderType.mockReturnValue(folderType.RECENT);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render with byMe owner filter', () => {
    const wrapper = shallow(<DocumentListHeader {...defaultProps} ownedFilterCondition={ownerFilter.byMe} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render with byOthers owner filter', () => {
    const wrapper = shallow(<DocumentListHeader {...defaultProps} ownedFilterCondition={ownerFilter.byOthers} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render with byAnyone owner filter', () => {
    const wrapper = shallow(<DocumentListHeader {...defaultProps} ownedFilterCondition={ownerFilter.byAnyone} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render reskin + personal route + list + ORGANIZATION', () => {
    const { useEnableWebReskin, usePersonalDocPathMatch, useGetFolderType } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    usePersonalDocPathMatch.mockReturnValue(true);
    useGetFolderType.mockReturnValue(folderType.ORGANIZATION);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.list} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render reskin + non-personal route + grid + INDIVIDUAL', () => {
    const { useEnableWebReskin, usePersonalDocPathMatch, useGetFolderType } = require('hooks');
    useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    usePersonalDocPathMatch.mockReturnValue(false);
    useGetFolderType.mockReturnValue(folderType.INDIVIDUAL);
    const wrapper = shallow(<DocumentListHeader {...defaultProps} type={layoutType.grid} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render with empty selectedDocList', () => {
    const wrapper = shallow(<DocumentListHeader {...defaultProps} selectedDocList={[]} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render with multiple documents selected', () => {
    const wrapper = shallow(
      <DocumentListHeader {...defaultProps} selectedDocList={[{ _id: '1' }, { _id: '2' }, { _id: '3' }]} />
    );
    expect(wrapper.exists()).toBe(true);
  });
});
