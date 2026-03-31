/* eslint-disable */
import React from 'react';
import * as ReactRedux from 'react-redux';
import { MemoryRouter } from 'react-router';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import core from 'core';
import { PLAN_TYPE } from 'constants/plan';
import merge from 'lodash/merge';
import ButtonEditMode from '../ButtonEditMode';
import MaterialPopper from 'lumin-components/MaterialPopper';
import * as toggleFormFieldCreationMode from 'helpers/toggleFormFieldCreationMode';

import ViewerContext from '../../../screens/Viewer/Context';

const mockStore = configureMockStore();
const state = {
  viewer: {
    themeMode: 'light',
  },
  auth: {
    currentDocument: {},
    currentUser: {},
  },
  organization: {
    organizations: {
      loading: true,
      error: null,
      data: undefined,
    },
  },
};
const store = mockStore(state);
jest.mock("src/hooks/useAutoSavePageTools.ts", () => ({
  useAutoSavePageTools: () => true,
}));

const mockDispatch = jest.fn();
const spyOnUseDispatch = jest.spyOn(ReactRedux, 'useDispatch');
jest.spyOn(toggleFormFieldCreationMode, "toggleFormFieldCreationMode").mockReturnValue(false);
core.getToolMode = jest.fn(() => ({
  name: ''
}));
spyOnUseDispatch.mockReturnValue(mockDispatch);

function wrapperComponent({ children }) {
  return (
    <MemoryRouter>
      <ReactRedux.Provider store={store}>
        <ViewerContext.Provider
          value={{
            bookmarkIns: {
              bookmarksUser: {},
              prevBookmarks: {},
            },
          }}
        >
          {children}
        </ViewerContext.Provider>
      </ReactRedux.Provider>
    </MemoryRouter>
  );
}

function setup(props, options) {
  const defaultProps = {
    changePageEditDisplayMode: jest.fn(),
    openPageEditMode: jest.fn(),
    isPageEditMode: true,
    isActiveEditMode: false,
    currentDocument: {
      services: 's3',
    },
    currentUser: {
      payment: {
        userPayment: PLAN_TYPE.FREE,
      },
    },
    hidden: [],
    setActiveEditMode: jest.fn(),
    setDeactiveEditMode: jest.fn(),
    closePageEditMode: jest.fn(),
    match: {
      params: {
        documentId: 'tour',
      },
    },
  };
  const newProps = merge(defaultProps, props);
  const instance = mount(
      <ButtonEditMode {...newProps} />
  , {
    wrappingComponent: wrapperComponent,
    ...options,
  });
  return {
    instance,
  };
}

global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

describe('<ButtonEditMode />', () => {
  beforeAll(() => {
    MaterialPopper.preload();
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
  describe('default render', () => {
    it('snapshot render', () => {
      const { instance } = setup();
      expect(instance).toMatchSnapshot();
    });
  });

  describe('isPageEditMode is false', () => {
    it('snapshot render', () => {
      const { instance } = setup({ isPageEditMode: false });
      expect(instance).toMatchSnapshot();
    });
  });

  describe('isPageEditMode is false, isActiveEditMode is true', () => {
    it('snapshot render', () => {
      const { instance } = setup({
        isPageEditMode: false,
        isActiveEditMode: true,
      });
      expect(instance).toMatchSnapshot();
    });
  });

  describe('hidden on mobile', () => {
    it('snapshot render', () => {
      const { instance } = setup({
        hidden: ['mobile'],
      });
      expect(instance).toMatchSnapshot();
    });
  });

  describe('isPageEditMode is false, isActiveEditMode is true and document is overtime', () => {
    it('snapshot render', () => {
      const { instance } = setup({
        isPageEditMode: false,
        isActiveEditMode: true,
        currentDocument: { isOverTimeLimit: true },
      });
      expect(instance).toMatchSnapshot();
    });
  });

  describe('test event', () => {
    describe('onClick second menu item', () => {
      it('openPageEditMode should be called', () => {
        const { instance } = setup();
        instance.find('button.ChangeEditMode__btn').last().simulate('click');
        expect(instance.props().openPageEditMode).toBeCalled();
      });
    });
  });
});