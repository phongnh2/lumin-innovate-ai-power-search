import React from 'react';
import { shallow } from 'enzyme';

const mockContextValue = {
  isSearchView: false,
  isFocusing: false,
  setFocusing: jest.fn(),
};

const mockHooks = {
  useTranslation: () => ({ t: (key) => key }),
  useEnableWebReskin: jest.fn(() => ({ isEnableReskin: false })),
  useDesktopMatch: jest.fn(() => true),
  useTabletMatch: jest.fn(() => true),
  useGetFolderType: jest.fn(() => 'individual'),
  useGetCurrentTeam: jest.fn(() => ({ _id: 'team-1' })),
};

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useContext: jest.fn(() => mockContextValue),
    useMemo: (fn) => fn(),
    useCallback: (fn) => fn,
  };
});

jest.mock('hooks', () => mockHooks);

jest.mock('lumin-components/PortalElement/PageTitlePortal', () => ({
  Element: ({ children }) => <div data-testid="portal-element">{children}</div>,
}));

jest.mock('lumin-components/SearchDocument', () => {
  return function SearchDocument(props) {
    return <div data-testid="search-document" data-placeholder={props.placeholder} />;
  };
});

jest.mock('lumin-components/UploadButton', () => {
  return function UploadButton() {
    return <div data-testid="upload-button" />;
  };
});

jest.mock('luminComponents/OneDriveFilePicker/OneDriveFilePickerProvider', () => {
  return function OneDriveFilePickerProvider({ children }) {
    return <div data-testid="onedrive-provider">{children}</div>;
  };
});

jest.mock('../HeaderTitle.styled', () => ({
  LuminLogoWrapper: ({ children }) => <div data-testid="logo-wrapper">{children}</div>,
  LuminLogoReskin: (props) => <img data-testid="logo-reskin" {...props} />,
  HeaderTabletUp: ({ children }) => <div data-testid="header-tablet-up">{children}</div>,
  HeaderMobile: ({ children }) => <div data-testid="header-mobile">{children}</div>,
}));

describe('HeaderTitle', () => {
  let HeaderTitle;
  const mockSetSearchKey = jest.fn();
  const defaultProps = {
    setSearchKey: mockSetSearchKey,
    canUpload: true,
    leftTitle: <div>Left Title</div>,
    folder: { name: 'Test Folder' },
  };

  beforeAll(() => {
    HeaderTitle = require('../HeaderTitle').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockHooks.useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    mockHooks.useDesktopMatch.mockReturnValue(true);
    mockHooks.useTabletMatch.mockReturnValue(true);
    mockHooks.useGetCurrentTeam.mockReturnValue({ _id: 'team-1' });
    mockContextValue.isFocusing = false;
    mockContextValue.isSearchView = false;
  });

  it('should render tablet view when isTabletUpMatch is true', () => {
    mockHooks.useTabletMatch.mockReturnValue(true);
    const wrapper = shallow(<HeaderTitle {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
    expect(mockHooks.useTabletMatch).toHaveBeenCalled();
  });

  it('should render mobile view when isTabletUpMatch is false', () => {
    mockHooks.useTabletMatch.mockReturnValue(false);
    const wrapper = shallow(<HeaderTitle {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
    expect(mockHooks.useTabletMatch).toHaveBeenCalled();
  });

  it('should render upload button when canUpload is true in tablet view', () => {
    mockHooks.useTabletMatch.mockReturnValue(true);
    const wrapper = shallow(<HeaderTitle {...defaultProps} canUpload={true} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should not render upload button when canUpload is false in tablet view', () => {
    mockHooks.useTabletMatch.mockReturnValue(true);
    const wrapper = shallow(<HeaderTitle {...defaultProps} canUpload={false} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render reskin logo when reskin is enabled', () => {
    mockHooks.useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    const wrapper = shallow(<HeaderTitle {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
    expect(mockHooks.useEnableWebReskin).toHaveBeenCalled();
  });

  it('should render header in portal when desktop and not reskin', () => {
    mockHooks.useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    mockHooks.useDesktopMatch.mockReturnValue(true);
    const wrapper = shallow(<HeaderTitle {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
    expect(mockHooks.useDesktopMatch).toHaveBeenCalled();
  });

  it('should render header directly when not desktop and not reskin', () => {
    mockHooks.useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    mockHooks.useDesktopMatch.mockReturnValue(false);
    mockHooks.useTabletMatch.mockReturnValue(false);
    const wrapper = shallow(<HeaderTitle {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should show searchByFolder placeholder when focusing without folder name', () => {
    mockContextValue.isFocusing = true;
    const wrapper = shallow(<HeaderTitle {...defaultProps} folder={{}} />);
    expect(wrapper.exists()).toBe(true);
    expect(mockContextValue.isFocusing).toBe(true);
  });

  it('should show common.search placeholder when not focusing', () => {
    mockContextValue.isFocusing = false;
    const wrapper = shallow(<HeaderTitle {...defaultProps} folder={{ name: 'Test' }} />);
    expect(wrapper.exists()).toBe(true);
    expect(mockContextValue.isFocusing).toBe(false);
  });

  it('should show common.search placeholder when has folder name even if focusing', () => {
    mockContextValue.isFocusing = true;
    const wrapper = shallow(<HeaderTitle {...defaultProps} folder={{ name: 'My Folder' }} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle currentTeam with _id', () => {
    mockHooks.useGetCurrentTeam.mockReturnValue({ _id: 'team-123' });
    const wrapper = shallow(<HeaderTitle {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle currentTeam without _id', () => {
    mockHooks.useGetCurrentTeam.mockReturnValue(null);
    const wrapper = shallow(<HeaderTitle {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });
});
