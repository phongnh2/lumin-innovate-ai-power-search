/* eslint-disable */
import React from 'react';
import { mount, } from 'enzyme';
import 'src/__mocks__/ResizeObserverMock';
import DocumentContainer from '../DocumentContainer';
import ViewerContext from '../../../screens/Viewer/Context';

jest.mock('core', () => ({
  setScrollViewElement: jest.fn(),
  setViewerElement: jest.fn(),
  isContinuousDisplayMode: jest.fn().mockReturnValue(false),
  zoomToMouse: jest.fn(),
  scrollViewUpdated: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  getTotalPages: jest.fn(),
  docViewer: {
    addEventListener: jest.fn(),
  },
}));

jest.mock('helpers/loadDocument', () => jest.fn());

describe('<DocumentContainer />', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  const props = {
    document: {},
    advanced: {},
    zoom: 1,
    dispatch: jest.fn(),
    openElement: jest.fn(),
    closeElements: jest.fn(),
    displayMode: '',
    isLeftPanelOpen: false,
    isRightPanelOpen: false,
    isSearchOverlayOpen: false,
    currentPage: 2,
    totalPages: 0,
    isHeaderOpen: true,
    isPageEditMode: false,
    pageEditDisplayMode: 'Single',
    isShowTopBar: true,
    isLoadingDocument: false,
    currentDocument: {},
    currentUser: {},
    allowPageNavigation: true,
  };

  it('snapshot render with isDocumentHasLimitedTime', () => {
    const wrapper = mount(
      <ViewerContext.Provider value={{ isDocumentHasLimitedTime: true }}>
        <DocumentContainer {...props} />
      </ViewerContext.Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('snapshot render', () => {

    const wrapper = mount(
      <ViewerContext.Provider value={{ isDocumentHasLimitedTime: false }}>
        <DocumentContainer {...props} />
      </ViewerContext.Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('pageEditDisplayMode: Grid', () => {
    const newProps = {
      ...props,
      pageEditDisplayMode: 'Grid',
    };
    const wrapper = mount(
      <ViewerContext.Provider value={{ isDocumentHasLimitedTime: true }}>
        <DocumentContainer {...newProps} />
      </ViewerContext.Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('snapshot render loading', () => {
    const newProps = {
      ...props,
      isLoadingDocument: true,
    };
    const wrapper = mount(
      <ViewerContext.Provider value={{ isDocumentHasLimitedTime: false }}>
        <DocumentContainer {...newProps} />
      </ViewerContext.Provider>,
    );

    const instance = wrapper.instance();
    instance.handleScroll()
    expect(wrapper).toMatchSnapshot();
  });

  it('onWheel metaKey', () => {
    const preventDefault = jest.fn()
    const newProps = {
      ...props,
      isLoadingDocument: true,
    };
    const wrapper = mount(
      <ViewerContext.Provider value={{ isDocumentHasLimitedTime: true }}>
        <DocumentContainer {...newProps} />
      </ViewerContext.Provider>,
    );

    const instance = wrapper.instance();
    instance.onWheel({ metaKey: true, preventDefault });
    expect(preventDefault).toBeCalled();
  });

  it('onWheel ctrlKey deltaY > 0', () => {
    const preventDefault = jest.fn()
    const newProps = {
      ...props,
      isLoadingDocument: true,
    };
    const wrapper = mount(
      <ViewerContext.Provider value={{ isDocumentHasLimitedTime: true }}>
        <DocumentContainer {...newProps} />
      </ViewerContext.Provider>,
    );

    const instance = wrapper.instance();
    instance.wheelToZoom({ deltaY: 1 })
    instance.onWheel({ ctrlKey: true, preventDefault })
    expect(preventDefault).toBeCalled();
  });

  it('onWheel deltaY < 0', () => {
    const preventDefault = jest.fn()
    const newProps = {
      ...props,
      isLoadingDocument: true,
    };
    const wrapper = mount(
      <ViewerContext.Provider value={{ isDocumentHasLimitedTime: true }}>
        <DocumentContainer {...newProps} />
      </ViewerContext.Provider>,
    );

    const instance = wrapper.instance();
    instance.wheelToZoom({ deltaY: -1 })
    instance.onWheel({ ctrlKey: true, preventDefault })
    expect(preventDefault).toBeCalled();
  });

  it('onWheel metaKey  and ctrlKey false ', () => {
    const preventDefault = jest.fn()
    const newProps = {
      ...props,
      isLoadingDocument: true,
    };
    const wrapper = mount(
      <ViewerContext.Provider value={{ isDocumentHasLimitedTime: true }}>
        <DocumentContainer {...newProps} />
      </ViewerContext.Provider>,
    );

    const instance = wrapper.instance();
    instance.onWheel({ ctrlKey: false, preventDefault })
    expect(wrapper).toMatchSnapshot();
  });


  it('onWheel with allowPageNavigation false', () => {
    const preventDefault = jest.fn()
    const newProps = {
      ...props,
      isLoadingDocument: true,
      allowPageNavigation: false
    };
    const wrapper = mount(
      <ViewerContext.Provider value={{ isDocumentHasLimitedTime: true }}>
        <DocumentContainer {...newProps} />
      </ViewerContext.Provider>,
    );

    const instance = wrapper.instance();
    instance.onWheel({ ctrlKey: false, preventDefault })
    instance.wheelToZoom({ deltaY: -1 })
    expect(wrapper).toMatchSnapshot();
  });

  it('onTransitionEnd', () => {
    const wrapper = mount(
      <ViewerContext.Provider value={{ isDocumentHasLimitedTime: true }}>
        <DocumentContainer {...props} />
      </ViewerContext.Provider>,
    );
    const instance = wrapper.instance();
    instance.onTransitionEnd({})
    expect(wrapper).toMatchSnapshot();
  });

  it('handleScroll', () => {
    const wrapper = mount(
      <ViewerContext.Provider value={{ isDocumentHasLimitedTime: true }}>
        <DocumentContainer {...props} />
      </ViewerContext.Provider>,
    );
    const instance = wrapper.instance();
    instance.handleScroll()
    expect(props.closeElements).toBeCalled();
  });

  it('wheelToNavigatePages scrollingUp', () => {
    const preventDefault = jest.fn()
    const newProps = {
      ...props,
      isLoadingDocument: true,
    };
    const wrapper = mount(
      <ViewerContext.Provider value={{ isDocumentHasLimitedTime: true }}>
        <DocumentContainer {...newProps} />
      </ViewerContext.Provider>,
    );

    const instance = wrapper.instance();
    instance.onWheel({ deltaY: -1 , deltaX: -10 ,ctrlKey: false, preventDefault })
    expect(wrapper).toMatchSnapshot();
  });

  it('wheelToNavigatePages scrollingDown', () => {
    const useRefSpy = jest.spyOn(React, 'useRef').mockReturnValueOnce({ current: { focus } });
    const preventDefault = jest.fn()
    const newProps = {
      ...props,
      isLoadingDocument: true,
    };
    const wrapper = mount(
      <ViewerContext.Provider value={{ isDocumentHasLimitedTime: true }}>
        <DocumentContainer {...newProps} />
      </ViewerContext.Provider>,
    );

    const instance = wrapper.instance();
    instance.onWheel({ deltaY: 10, deltaX: 1 ,ctrlKey: false, preventDefault })
    expect(wrapper).toMatchSnapshot();
  });

  });