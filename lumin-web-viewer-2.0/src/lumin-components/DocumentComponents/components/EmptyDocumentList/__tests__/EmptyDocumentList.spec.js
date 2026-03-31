import React from 'react';
import { shallow } from 'enzyme';

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('helpers/isMobileOrTablet', () => jest.fn());

const mockContextValue = {
  isSearchView: false,
  folderLoading: false,
};

jest.mock('lumin-components/Document/context', () => ({
  DocumentSearchContext: {
    Consumer: ({ children }) => children(mockContextValue),
  },
}));

describe('EmptyDocumentList component', () => {
  let EmptyDocumentList;
  let isMobileOrTablet;
  let folderType;
  const originalUseContext = React.useContext;

  beforeAll(() => {
    React.useContext = jest.fn(() => mockContextValue);
    EmptyDocumentList = require('../EmptyDocumentList').default;
    isMobileOrTablet = require('helpers/isMobileOrTablet');
    folderType = require('constants/documentConstants').folderType;
  });

  afterAll(() => {
    React.useContext = originalUseContext;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    isMobileOrTablet.mockReturnValue(false);
    mockContextValue.isSearchView = false;
    mockContextValue.folderLoading = false;
    React.useContext.mockReturnValue(mockContextValue);
  });

  it('should render NoDocumentContainer with SHARED folder message', () => {
    const wrapper = shallow(<EmptyDocumentList currentFolderType={folderType.SHARED} isEmptyList={false} />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('#document-list-root').exists()).toBe(false);
    expect(wrapper.text()).toContain('documentPage.messageNoSharedDocument');
  });

  it('should render NoDocumentContainer with STARRED folder message', () => {
    const wrapper = shallow(<EmptyDocumentList currentFolderType={folderType.STARRED} isEmptyList={false} />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('#document-list-root').exists()).toBe(false);
    expect(wrapper.text()).toContain('documentPage.messageNoStarredDocument');
  });

  it('should render NoDocumentContainer when isEmptyList is false with default folder', () => {
    const wrapper = shallow(<EmptyDocumentList currentFolderType={folderType.INDIVIDUAL} isEmptyList={false} />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('#document-list-root').exists()).toBe(false);
    expect(wrapper.text()).toContain('documentPage.messageNoDocument');
  });

  it('should render drag-drop mode on desktop when isEmptyList is true', () => {
    isMobileOrTablet.mockReturnValue(false);
    const wrapper = shallow(<EmptyDocumentList currentFolderType={folderType.INDIVIDUAL} isEmptyList={true} />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('#document-list-root')).toHaveLength(1);
    expect(wrapper.text()).toContain('documentPage.dragDropMode.mainText1');
    expect(wrapper.text()).toContain('documentPage.dragDropMode.subText1');
    expect(isMobileOrTablet).toHaveBeenCalled();
  });

  it('should render drag-drop mode on mobile when isEmptyList is true', () => {
    isMobileOrTablet.mockReturnValue(true);
    const wrapper = shallow(<EmptyDocumentList currentFolderType={folderType.INDIVIDUAL} isEmptyList={true} />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('#document-list-root')).toHaveLength(1);
    expect(wrapper.text()).toContain('documentPage.dragDropMode.mainText2');
    expect(wrapper.text()).toContain('documentPage.dragDropMode.subText2');
    expect(isMobileOrTablet).toHaveBeenCalled();
  });

  it('should render NoDocumentContainer with TEAMS folder type', () => {
    const wrapper = shallow(<EmptyDocumentList currentFolderType={folderType.TEAMS} isEmptyList={false} />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('#document-list-root').exists()).toBe(false);
    expect(wrapper.text()).toContain('documentPage.messageNoDocument');
  });

  it('should render NoDocumentContainer with ORGANIZATION folder type', () => {
    const wrapper = shallow(<EmptyDocumentList currentFolderType={folderType.ORGANIZATION} isEmptyList={false} />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('#document-list-root').exists()).toBe(false);
    expect(wrapper.text()).toContain('documentPage.messageNoDocument');
  });

  it('should render NoDocumentContainer with RECENT folder type', () => {
    const wrapper = shallow(<EmptyDocumentList currentFolderType={folderType.RECENT} isEmptyList={false} />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('#document-list-root').exists()).toBe(false);
    expect(wrapper.text()).toContain('documentPage.messageNoDocument');
  });

  it('should render NoDocumentContainer even with SHARED folder when isEmptyList is true', () => {
    const wrapper = shallow(<EmptyDocumentList currentFolderType={folderType.SHARED} isEmptyList={true} />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('#document-list-root').exists()).toBe(false);
    expect(wrapper.text()).toContain('documentPage.messageNoSharedDocument');
  });

  it('should render NoDocumentContainer even with STARRED folder when isEmptyList is true', () => {
    const wrapper = shallow(<EmptyDocumentList currentFolderType={folderType.STARRED} isEmptyList={true} />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('#document-list-root').exists()).toBe(false);
    expect(wrapper.text()).toContain('documentPage.messageNoStarredDocument');
  });

  it('should render EmptySearchResult when in search view and not loading', () => {
    mockContextValue.isSearchView = true;
    mockContextValue.folderLoading = false;
    const wrapper = shallow(<EmptyDocumentList currentFolderType={folderType.INDIVIDUAL} isEmptyList={true} />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('EmptySearchResult')).toHaveLength(1);
  });

  it('should render drag-drop mode when in search view but loading', () => {
    mockContextValue.isSearchView = true;
    mockContextValue.folderLoading = true;
    const wrapper = shallow(<EmptyDocumentList currentFolderType={folderType.INDIVIDUAL} isEmptyList={true} />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('#document-list-root')).toHaveLength(1);
  });

  it('should render drag-drop mode when not in search view and loading', () => {
    mockContextValue.isSearchView = false;
    mockContextValue.folderLoading = true;
    const wrapper = shallow(<EmptyDocumentList currentFolderType={folderType.INDIVIDUAL} isEmptyList={true} />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('#document-list-root')).toHaveLength(1);
  });

  it('should render drag-drop mode when not in search view and not loading', () => {
    mockContextValue.isSearchView = false;
    mockContextValue.folderLoading = false;
    const wrapper = shallow(<EmptyDocumentList currentFolderType={folderType.INDIVIDUAL} isEmptyList={true} />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('#document-list-root')).toHaveLength(1);
  });
});
