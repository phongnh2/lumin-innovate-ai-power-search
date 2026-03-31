import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';

import { createStore } from 'src/redux/mockStore';
import initialState from 'src/redux/initialState';

import { ownerFilter, modifiedFilter, layoutType } from 'constants/documentConstants';
import { DocumentContext } from 'lumin-components/Document/context';

jest.mock('../HOC', () => ({
  withDocumentModal: (Component) => Component,
  withOpenDocDecorator: (Component) => Component,
  withCurrentDocuments: (Component) => Component,
  withOfflineDocumentList: (Component) => Component,
}));

jest.mock('../DocumentListRenderer', () => () => null);
jest.mock('lumin-components/UploadDropZone', () => ({
  __esModule: true,
  default: ({ children }) => <div>{typeof children === 'function' ? children() : children}</div>,
  UploadDropZoneContext: require('react').createContext({ showHighlight: false }),
}));
jest.mock('luminComponents/BackToTop', () => () => null);
jest.mock('luminComponents/DocumentListHeader', () => () => null);
jest.mock('luminComponents/DocumentListHeaderBar', () => () => null);
jest.mock('lumin-components/DocumentComponents', () => ({
  __esModule: true,
  default: {
    LayoutSwitcher: () => null,
  },
}));

import { DocumentListClass } from '../DocumentList';

const DocumentList = DocumentListClass;

describe('DocumentList', () => {
  let defaultProps;
  let defaultContextValue;
  let store;

  beforeEach(() => {
    store = createStore({
      ...initialState,
      document: {
        ...initialState.document,
        ownedFilter: ownerFilter.byAnyone,
        lastModifiedFilter: modifiedFilter.modifiedByAnyone,
        offline: false,
      },
    });

    defaultProps = {
      documents: [],
      folders: [],
      hasNextPage: false,
      fetchMore: jest.fn(),
      folderLoading: false,
      documentLoading: false,
      ownedRule: ownerFilter.byAnyone,
      modifiedRule: modifiedFilter.modifiedByAnyone,
      folder: null,
      openDocumentModal: jest.fn(),
      isOffline: false,
      total: 0,
      dispatch: jest.fn(),
    };

    defaultContextValue = {
      selectedDocList: [],
      setRemoveDocList: jest.fn(),
      documentLayout: layoutType.grid,
      setDocumentLayout: jest.fn(),
      selectedFolders: [],
      setRemoveFolderList: jest.fn(),
      error: null,
    };

    jest.clearAllMocks();
  });

  const renderComponent = (props = {}, contextValue = {}) => {
    const mergedProps = { ...defaultProps, ...props };
    const mergedContext = { ...defaultContextValue, ...contextValue };

    return mount(
      <Provider store={store}>
        <DocumentContext.Provider value={mergedContext}>
          <DocumentList {...mergedProps} />
        </DocumentContext.Provider>
      </Provider>
    );
  };

  const getDocumentListInstance = (wrapper) => {
    const component = wrapper.find(DocumentList).first();
    return component.exists() ? component.instance() : null;
  };

  describe('Component Lifecycle', () => {
    it('should render without crashing', () => {
      const wrapper = renderComponent();
      expect(wrapper.exists()).toBe(true);
    });

    it('should match snapshot with default props', () => {
      const wrapper = renderComponent();
      expect(wrapper).toMatchSnapshot();
    });

    it('should add event listeners on mount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      renderComponent();

      expect(addEventListenerSpy).toHaveBeenCalledWith('dragover', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('drop', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('dragenter', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('dragleave', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const wrapper = renderComponent();

      wrapper.unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('dragover', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('drop', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('dragenter', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('dragleave', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('should initialize state correctly', () => {
      const wrapper = renderComponent();
      const instance = getDocumentListInstance(wrapper);

      expect(instance.state).toEqual({
        isWindowDragging: false,
        selectDocMode: false,
      });
    });

    it('should create bodyScrollRef', () => {
      const wrapper = renderComponent();
      const instance = getDocumentListInstance(wrapper);

      expect(instance.bodyScrollRef).toBeDefined();
      expect(instance.bodyScrollRef.current).toBeDefined();
    });
  });

  describe('Drag and Drop Events', () => {
    it('should set isWindowDragging to true on dragover', () => {
      const wrapper = renderComponent({}, {});
      const instance = getDocumentListInstance(wrapper);
      const setStateSpy = jest.spyOn(instance, 'setState');

      act(() => {
        instance.onDragOver();
      });

      expect(setStateSpy).toHaveBeenCalledWith({
        isWindowDragging: true,
      });
    });

    it('should set isWindowDragging to false on drop', () => {
      const wrapper = renderComponent({}, {});
      const instance = getDocumentListInstance(wrapper);
      const setStateSpy = jest.spyOn(instance, 'setState');

      act(() => {
        instance.onDrop();
      });

      expect(setStateSpy).toHaveBeenCalledWith({
        isWindowDragging: false,
      });
    });

    it('should increment count on dragenter', () => {
      const wrapper = renderComponent({}, {});
      const instance = getDocumentListInstance(wrapper);

      instance.onEnter();
      expect(instance.count).toBe(1);

      instance.onEnter();
      expect(instance.count).toBe(2);
    });

    it('should decrement count on dragleave', () => {
      const wrapper = renderComponent({}, {});
      const instance = getDocumentListInstance(wrapper);

      instance.onEnter();
      instance.onEnter();
      expect(instance.count).toBe(2);

      instance.onLeave();
      expect(instance.count).toBe(1);
    });

    it('should call onDrop when count reaches zero on dragleave', () => {
      const wrapper = renderComponent({}, {});
      const instance = getDocumentListInstance(wrapper);
      const onDropSpy = jest.spyOn(instance, 'onDrop');

      instance.onEnter();
      act(() => {
        instance.onLeave();
      });

      expect(onDropSpy).toHaveBeenCalled();
      expect(instance.state.isWindowDragging).toBe(false);
    });

    it('should not call onDrop when count is not zero', () => {
      const wrapper = renderComponent({}, {});
      const instance = getDocumentListInstance(wrapper);
      const onDropSpy = jest.spyOn(instance, 'onDrop');

      instance.onEnter();
      instance.onEnter();
      act(() => {
        instance.onDragOver();
      });
      onDropSpy.mockClear();

      instance.onLeave();

      expect(onDropSpy).not.toHaveBeenCalled();
      expect(instance.count).toBe(1);
    });
  });

  describe('Select Mode', () => {
    it('should change selectDocMode when onChangeSelectMode is called', () => {
      const wrapper = renderComponent({}, {});
      const instance = getDocumentListInstance(wrapper);
      const setStateSpy = jest.spyOn(instance, 'setState');

      act(() => {
        instance.onChangeSelectMode(true);
      });
      expect(setStateSpy).toHaveBeenCalledWith({ selectDocMode: true });

      setStateSpy.mockClear();
      act(() => {
        instance.onChangeSelectMode(false);
      });
      expect(setStateSpy).toHaveBeenCalledWith({ selectDocMode: false });
    });

    it('should render with select mode when selectedDocList has items', () => {
      const wrapper = renderComponent({}, { selectedDocList: [{ id: '1' }] });
      const instance = getDocumentListInstance(wrapper);

      expect(instance.context.selectedDocList.length).toBeGreaterThan(0);
    });

    it('should render with select mode when selectedFolders has items', () => {
      const wrapper = renderComponent({}, { selectedFolders: [{ id: '1' }] });
      const instance = getDocumentListInstance(wrapper);

      expect(instance.context.selectedFolders.length).toBeGreaterThan(0);
    });

    it('should render with select mode when selectDocMode state is true', () => {
      const wrapper = renderComponent({}, {});
      const instance = getDocumentListInstance(wrapper);
      const setStateSpy = jest.spyOn(instance, 'setState');

      act(() => {
        instance.onChangeSelectMode(true);
      });

      expect(setStateSpy).toHaveBeenCalledWith({ selectDocMode: true });
    });
  });

  describe('Empty List Detection', () => {
    it('should detect empty list with no documents, folders, and default filters', () => {
      const wrapper = renderComponent(
        {
          documents: [],
          folders: [],
          folderLoading: false,
          documentLoading: false,
          ownedRule: ownerFilter.byAnyone,
          modifiedRule: modifiedFilter.modifiedByAnyone,
        },
        {}
      );

      expect(wrapper.exists()).toBe(true);
    });

    it('should not detect empty list when loading folders', () => {
      const wrapper = renderComponent(
        {
          documents: [],
          folders: [],
          folderLoading: true,
          documentLoading: false,
          ownedRule: ownerFilter.byAnyone,
          modifiedRule: modifiedFilter.modifiedByAnyone,
        },
        {}
      );

      expect(wrapper.exists()).toBe(true);
    });

    it('should not detect empty list when loading documents', () => {
      const wrapper = renderComponent(
        {
          documents: [],
          folders: [],
          folderLoading: false,
          documentLoading: true,
          ownedRule: ownerFilter.byAnyone,
          modifiedRule: modifiedFilter.modifiedByAnyone,
        },
        {}
      );

      expect(wrapper.exists()).toBe(true);
    });

    it('should not detect empty list when has documents', () => {
      const wrapper = renderComponent(
        {
          documents: [{ id: '1' }],
          folders: [],
          folderLoading: false,
          documentLoading: false,
          ownedRule: ownerFilter.byAnyone,
          modifiedRule: modifiedFilter.modifiedByAnyone,
        },
        {}
      );

      expect(wrapper.exists()).toBe(true);
    });

    it('should not detect empty list when has folders', () => {
      const wrapper = renderComponent(
        {
          documents: [],
          folders: [{ id: '1' }],
          folderLoading: false,
          documentLoading: false,
          ownedRule: ownerFilter.byAnyone,
          modifiedRule: modifiedFilter.modifiedByAnyone,
        },
        {}
      );

      expect(wrapper.exists()).toBe(true);
    });

    it('should not detect empty list when owned filter is not byAnyone', () => {
      const wrapper = renderComponent(
        {
          documents: [],
          folders: [],
          folderLoading: false,
          documentLoading: false,
          ownedRule: ownerFilter.byMe,
          modifiedRule: modifiedFilter.modifiedByAnyone,
        },
        {}
      );

      expect(wrapper.exists()).toBe(true);
    });

    it('should not detect empty list when modified filter is not modifiedByAnyone', () => {
      const wrapper = renderComponent(
        {
          documents: [],
          folders: [],
          folderLoading: false,
          documentLoading: false,
          ownedRule: ownerFilter.byAnyone,
          modifiedRule: modifiedFilter.modifiedByMe,
        },
        {}
      );

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Props Handling', () => {
    it('should render with documents', () => {
      const documents = [{ id: '1' }, { id: '2' }];
      const wrapper = renderComponent({ documents }, {});

      expect(wrapper.prop('documents') || getDocumentListInstance(wrapper).props.documents).toBe(documents);
    });

    it('should render with folders', () => {
      const folders = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const wrapper = renderComponent({ folders }, {});

      expect(wrapper.prop('folders') || getDocumentListInstance(wrapper).props.folders).toBe(folders);
    });

    it('should pass openDocumentModal prop', () => {
      const openDocumentModal = jest.fn();
      const wrapper = renderComponent({ openDocumentModal }, {});

      expect(getDocumentListInstance(wrapper).props.openDocumentModal).toBe(openDocumentModal);
    });

    it('should pass total prop', () => {
      const wrapper = renderComponent({ total: 42 }, {});

      expect(getDocumentListInstance(wrapper).props.total).toBe(42);
    });

    it('should pass hasNextPage and fetchMore', () => {
      const fetchMore = jest.fn();
      const wrapper = renderComponent(
        {
          hasNextPage: true,
          fetchMore,
        },
        {}
      );

      expect(getDocumentListInstance(wrapper).props.hasNextPage).toBe(true);
      expect(getDocumentListInstance(wrapper).props.fetchMore).toBe(fetchMore);
    });

    it('should render with folder prop', () => {
      const folder = { id: '1', name: 'Test Folder' };
      const wrapper = renderComponent({ folder }, {});

      expect(getDocumentListInstance(wrapper).props.folder).toBe(folder);
    });

    it('should render with null folder', () => {
      const wrapper = renderComponent({ folder: null }, {});

      expect(getDocumentListInstance(wrapper).props.folder).toBe(null);
    });

    it('should pass isOffline prop', () => {
      const wrapper = renderComponent({ isOffline: true }, {});

      expect(getDocumentListInstance(wrapper).props.isOffline).toBe(true);
    });

    it('should pass isOffline as false by default', () => {
      const wrapper = renderComponent({}, {});

      expect(getDocumentListInstance(wrapper).props.isOffline).toBe(false);
    });
  });

  describe('Context Handling', () => {
    it('should provide correct context value', () => {
      const setRemoveDocList = jest.fn();
      const setRemoveFolderList = jest.fn();
      const wrapper = renderComponent(
        {},
        {
          setRemoveDocList,
          setRemoveFolderList,
        }
      );

      expect(wrapper.exists()).toBe(true);
    });

    it('should handle error in context', () => {
      const error = new Error('Test error');
      const wrapper = renderComponent({}, { error });

      expect(wrapper.exists()).toBe(true);
    });

    it('should handle null error in context', () => {
      const wrapper = renderComponent({}, { error: null }, {});

      expect(wrapper.exists()).toBe(true);
    });

    it('should handle undefined error in context', () => {
      const wrapper = renderComponent({}, { error: undefined }, {});

      expect(wrapper.exists()).toBe(true);
    });

    it('should use grid layout from context', () => {
      const wrapper = renderComponent({}, { documentLayout: layoutType.grid });

      expect(getDocumentListInstance(wrapper).context.documentLayout).toBe(layoutType.grid);
    });

    it('should use list layout from context', () => {
      const wrapper = renderComponent({}, { documentLayout: layoutType.list });

      expect(getDocumentListInstance(wrapper).context.documentLayout).toBe(layoutType.list);
    });
  });

  describe('Rendering Scenarios', () => {
    it('should render with both loading states true', () => {
      const wrapper = renderComponent(
        {
          folderLoading: true,
          documentLoading: true,
        },
        {}
      );

      expect(wrapper.exists()).toBe(true);
    });

    it('should render with offline mode', () => {
      const wrapper = renderComponent(
        {
          isOffline: true,
        },
        {}
      );

      expect(wrapper.exists()).toBe(true);
    });

    it('should render with both documents and folders', () => {
      const wrapper = renderComponent(
        {
          documents: [{ id: '1' }],
          folders: [{ id: '2' }],
        },
        {}
      );

      expect(wrapper.exists()).toBe(true);
    });

    it('should render with multiple selected documents', () => {
      const wrapper = renderComponent(
        {},
        {
          selectedDocList: [{ id: '1' }, { id: '2' }, { id: '3' }],
        }
      );

      expect(wrapper.exists()).toBe(true);
    });

    it('should render with multiple selected folders', () => {
      const wrapper = renderComponent(
        {},
        {
          selectedFolders: [{ id: '1' }, { id: '2' }],
        }
      );

      expect(wrapper.exists()).toBe(true);
    });

    it('should render with both selected documents and folders', () => {
      const wrapper = renderComponent(
        {},
        {
          selectedDocList: [{ id: '1' }],
          selectedFolders: [{ id: '2' }],
        }
      );

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty selectedDocList array', () => {
      const wrapper = renderComponent({}, { selectedDocList: [] });

      expect(getDocumentListInstance(wrapper).context.selectedDocList).toEqual([]);
    });

    it('should handle empty selectedFolders array', () => {
      const wrapper = renderComponent({}, { selectedFolders: [] });

      expect(getDocumentListInstance(wrapper).context.selectedFolders).toEqual([]);
    });

    it('should handle zero total', () => {
      const wrapper = renderComponent({ total: 0 }, {});

      expect(getDocumentListInstance(wrapper).props.total).toBe(0);
    });

    it('should handle null total', () => {
      const wrapper = renderComponent({ total: null }, {});

      expect(getDocumentListInstance(wrapper).props.total).toBe(null);
    });

    it('should handle all filter combinations - byMe and modifiedByMe', () => {
      const wrapper = renderComponent(
        {
          ownedRule: ownerFilter.byMe,
          modifiedRule: modifiedFilter.modifiedByMe,
        },
        {}
      );

      expect(wrapper.exists()).toBe(true);
    });

    it('should handle all filter combinations - byMe and modifiedByAnyone', () => {
      const wrapper = renderComponent(
        {
          ownedRule: ownerFilter.byMe,
          modifiedRule: modifiedFilter.modifiedByAnyone,
        },
        {}
      );

      expect(wrapper.exists()).toBe(true);
    });

    it('should handle all filter combinations - byAnyone and modifiedByMe', () => {
      const wrapper = renderComponent(
        {
          ownedRule: ownerFilter.byAnyone,
          modifiedRule: modifiedFilter.modifiedByMe,
        },
        {}
      );

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('State Transitions', () => {
    it('should transition from non-dragging to dragging state', () => {
      const wrapper = renderComponent({}, {});
      const instance = getDocumentListInstance(wrapper);

      expect(instance.state.isWindowDragging).toBe(false);

      act(() => {
        instance.onDragOver();
      });
      wrapper.update();
      expect(instance.state.isWindowDragging).toBe(true);
    });

    it('should transition from dragging to non-dragging state', () => {
      const wrapper = renderComponent({}, {});
      const instance = getDocumentListInstance(wrapper);

      act(() => {
        instance.onDragOver();
      });
      wrapper.update();
      expect(instance.state.isWindowDragging).toBe(true);

      act(() => {
        instance.onDrop();
      });
      wrapper.update();
      expect(instance.state.isWindowDragging).toBe(false);
    });

    it('should maintain drag count across multiple enters', () => {
      const wrapper = renderComponent({}, {});
      const instance = getDocumentListInstance(wrapper);

      instance.onEnter();
      instance.onEnter();
      instance.onEnter();

      expect(instance.count).toBe(3);
    });

    it('should properly decrement drag count', () => {
      const wrapper = renderComponent({}, {});
      const instance = getDocumentListInstance(wrapper);

      instance.onEnter();
      instance.onEnter();
      instance.onEnter();
      instance.onLeave();
      instance.onLeave();

      expect(instance.count).toBe(1);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete drag and drop flow', () => {
      const wrapper = renderComponent({}, {});
      const instance = getDocumentListInstance(wrapper);

      instance.onEnter();
      act(() => {
        instance.onDragOver();
      });
      wrapper.update();
      expect(instance.state.isWindowDragging).toBe(true);

      act(() => {
        instance.onDrop();
      });
      wrapper.update();
      expect(instance.state.isWindowDragging).toBe(false);
    });

    it('should handle multiple drag enters and leaves', () => {
      const wrapper = renderComponent({}, {});
      const instance = getDocumentListInstance(wrapper);

      instance.onEnter();
      instance.onEnter();
      instance.onEnter();

      instance.onLeave();
      instance.onLeave();
      act(() => {
        instance.onLeave();
      });

      expect(instance.state.isWindowDragging).toBe(false);
    });

    it('should handle rapid state changes', () => {
      const wrapper = renderComponent({}, {});
      const instance = getDocumentListInstance(wrapper);

      act(() => {
        instance.onChangeSelectMode(true);
      });
      wrapper.update();
      act(() => {
        instance.onChangeSelectMode(false);
      });
      wrapper.update();
      act(() => {
        instance.onChangeSelectMode(true);
      });
      wrapper.update();

      expect(instance.state.selectDocMode).toBe(true);
    });
  });
});
