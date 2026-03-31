import activeToolsByHotkey from '../activeToolsByHotkey';

import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';
import actions from 'actions';
import core from 'core';
import selectors from 'selectors';
import { getToolChecker } from 'helpers/getToolPopper';
import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';
import DataElements from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';
import { TOOLS_NAME } from 'constants/toolsName';
import { store } from '../../redux/store';

jest.mock('selectors');
jest.mock('core');
jest.mock('actions');
jest.mock('helpers/getToolPopper');
jest.mock('helpers/promptUserChangeToolMode');
jest.mock('i18next', () => ({
  t: jest.fn((key) => key),
}));
jest.mock('../../redux/store', () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
  },
}));

describe('activeToolsByHotkey', () => {
  let mockGetState;
  let mockDispatch;
  let mockToolButton;
  let mockTabButton;
  let mockToolbarInner;
  let mockQuerySelector;
  let mockGetElementById;
  let mockMutationObserver;
  let mockObserverInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetState = jest.fn();
    mockDispatch = jest.fn();
    store.getState = mockGetState;
    store.dispatch = mockDispatch;

    mockToolButton = {
      click: jest.fn(),
    };
    mockTabButton = {
      click: jest.fn(),
    };
    mockToolbarInner = {
      id: 'ToolbarInner',
    };

    mockObserverInstance = {
      observe: jest.fn(),
      disconnect: jest.fn(),
    };
    mockMutationObserver = jest.fn(() => mockObserverInstance);
    global.MutationObserver = mockMutationObserver;

    mockQuerySelector = jest.fn((selector) => {
      if (selector.includes('data-element=')) {
        const dataElement = selector.match(/data-element=(\w+)/)?.[1];
        if (dataElement === 'testToolElement') {
          return mockToolButton;
        }
        if (dataElement === LEFT_SIDE_BAR_VALUES.ANNOTATION.dataElement) {
          return mockTabButton;
        }
        if (dataElement === LEFT_SIDE_BAR_VALUES.POPULAR.dataElement) {
          return mockTabButton;
        }
      }
      return null;
    });

    mockGetElementById = jest.fn((id) => {
      if (id === 'ToolbarInner') {
        return mockToolbarInner;
      }
      return null;
    });

    document.querySelector = mockQuerySelector;
    document.getElementById = mockGetElementById;

    core.getToolMode = jest.fn(() => ({ name: 'AnnotationEdit' }));
    core.setToolMode = jest.fn();

    selectors.toolbarValue = jest.fn();
    selectors.getCurrentDocument = jest.fn();
    selectors.getCurrentUser = jest.fn();
    selectors.getToolButtonObjects = jest.fn();

    getToolChecker.mockReturnValue({
      isToolAvailable: true,
      shouldShowPremiumIcon: false,
    });

    promptUserChangeToolMode.mockReturnValue(false);
  });

  describe('tab switching logic', () => {
    it('should switch to annotation tab when text tool is selected and not on annotation tab', async () => {
      const mockState = {
        viewer: {
          disabledElements: {},
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.POPULAR.value);

      await activeToolsByHotkey({
        toolElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
        subToolElement: null,
        subTool: null,
      });

      expect(mockTabButton.click).toHaveBeenCalled();
      expect(mockObserverInstance.observe).toHaveBeenCalledWith(
        mockToolbarInner,
        expect.objectContaining({
          childList: true,
          subtree: true,
        })
      );
    });

    it('should switch to annotation tab when stamp tool is selected and not on annotation tab', async () => {
      const mockState = {
        viewer: {
          disabledElements: {},
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.POPULAR.value);

      await activeToolsByHotkey({
        toolElement: DataElements.STAMP_TOOL_BUTTON,
        subToolElement: null,
        subTool: null,
      });

      expect(mockTabButton.click).toHaveBeenCalled();
    });

    it('should switch to popular tab when signature tool is selected and not on sign or popular tab', async () => {
      const mockState = {
        viewer: {
          disabledElements: {},
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.ANNOTATION.value);

      await activeToolsByHotkey({
        toolElement: DataElements.SIGNATURE_TOOL_BUTTON,
        subToolElement: null,
        subTool: TOOLS_NAME.SIGNATURE,
      });

      expect(mockTabButton.click).toHaveBeenCalled();
    });

    it('should switch to popular tab for other tools when not on popular or annotation tab', async () => {
      const mockState = {
        viewer: {
          disabledElements: {},
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.EDIT_PDF.value);

      await activeToolsByHotkey({
        toolElement: 'otherTool',
        subToolElement: null,
        subTool: null,
      });

      expect(mockTabButton.click).toHaveBeenCalled();
    });

    it('should not switch tab when already on correct tab', async () => {
      const mockState = {
        viewer: {
          disabledElements: {},
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.ANNOTATION.value);

      await activeToolsByHotkey({
        toolElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
        subToolElement: null,
        subTool: null,
      });

      expect(mockTabButton.click).not.toHaveBeenCalled();
    });
  });

  describe('tool activation', () => {
    it('should click tool button when element exists', async () => {
      const mockState = {
        viewer: {
          disabledElements: {},
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.ANNOTATION.value);
      mockQuerySelector.mockImplementation((selector) => {
        if (selector === `[data-element=${DataElements.TEXT_TOOL_GROUP_BUTTON}]`) {
          return mockToolButton;
        }
        return null;
      });

      await activeToolsByHotkey({
        toolElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
        subToolElement: null,
        subTool: null,
      });

      expect(mockToolButton.click).toHaveBeenCalled();
    });

    it('should not throw error when tool button does not exist', async () => {
      const mockState = {
        viewer: {
          disabledElements: {},
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.ANNOTATION.value);
      mockQuerySelector.mockReturnValue(null);

      await expect(
        activeToolsByHotkey({
          toolElement: 'nonExistentTool',
          subToolElement: null,
          subTool: null,
        })
      ).resolves.not.toThrow();
    });
  });

  describe('disabled elements', () => {
    it('should return early if tool element is disabled', async () => {
      const mockState = {
        viewer: {
          disabledElements: {
            [DataElements.TEXT_TOOL_GROUP_BUTTON]: {
              disabled: true,
            },
          },
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.ANNOTATION.value);
      mockQuerySelector.mockReturnValue(mockToolButton);

      await activeToolsByHotkey({
        toolElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
        subToolElement: null,
        subTool: null,
      });

      expect(core.setToolMode).not.toHaveBeenCalled();
    });

    it('should return early if subTool element is disabled', async () => {
      const mockState = {
        viewer: {
          disabledElements: {
            [DataElements.TEXT_TOOL_GROUP_BUTTON]: {
              disabled: false,
            },
            [DataElements.SQUIGGLY_TOOL_BUTTON]: {
              disabled: true,
            },
          },
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.ANNOTATION.value);
      mockQuerySelector.mockReturnValue(mockToolButton);

      await activeToolsByHotkey({
        toolElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
        subToolElement: DataElements.SQUIGGLY_TOOL_BUTTON,
        subTool: TOOLS_NAME.SQUIGGLY,
      });

      expect(core.setToolMode).not.toHaveBeenCalled();
    });

    it('should continue if subTool element is not disabled', async () => {
      const mockState = {
        viewer: {
          disabledElements: {
            [DataElements.TEXT_TOOL_GROUP_BUTTON]: {
              disabled: false,
            },
            [DataElements.SQUIGGLY_TOOL_BUTTON]: {
              disabled: false,
            },
          },
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.ANNOTATION.value);
      mockQuerySelector.mockReturnValue(mockToolButton);
      selectors.getCurrentDocument.mockReturnValue({ _id: 'doc-1' });
      selectors.getCurrentUser.mockReturnValue({ _id: 'user-1' });
      selectors.getToolButtonObjects.mockReturnValue({
        [TOOLS_NAME.SQUIGGLY]: { group: 'textTools' },
      });

      await activeToolsByHotkey({
        toolElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
        subToolElement: DataElements.SQUIGGLY_TOOL_BUTTON,
        subTool: TOOLS_NAME.SQUIGGLY,
      });

      expect(getToolChecker).toHaveBeenCalled();
    });
  });

  describe('subTool handling', () => {
    it('should not process subTool if subTool is SIGNATURE', async () => {
      const mockState = {
        viewer: {
          disabledElements: {},
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.POPULAR.value);
      mockQuerySelector.mockReturnValue(mockToolButton);

      await activeToolsByHotkey({
        toolElement: DataElements.SIGNATURE_TOOL_BUTTON,
        subToolElement: null,
        subTool: TOOLS_NAME.SIGNATURE,
      });

      expect(getToolChecker).not.toHaveBeenCalled();
      expect(core.setToolMode).not.toHaveBeenCalled();
    });

    it('should toggle subTool off if already enabled', async () => {
      const mockState = {
        viewer: {
          disabledElements: {},
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.ANNOTATION.value);
      mockQuerySelector.mockReturnValue(mockToolButton);
      core.getToolMode.mockReturnValue({ name: TOOLS_NAME.SQUIGGLY });
      selectors.getCurrentDocument.mockReturnValue({ _id: 'doc-1' });
      selectors.getCurrentUser.mockReturnValue({ _id: 'user-1' });

      await activeToolsByHotkey({
        toolElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
        subToolElement: DataElements.SQUIGGLY_TOOL_BUTTON,
        subTool: TOOLS_NAME.SQUIGGLY,
      });

      expect(core.setToolMode).toHaveBeenCalledWith(defaultTool);
      expect(promptUserChangeToolMode).toHaveBeenCalled();
    });

    it('should enable subTool if not enabled and tool is available', async () => {
      const mockState = {
        viewer: {
          disabledElements: {},
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.ANNOTATION.value);
      mockQuerySelector.mockReturnValue(mockToolButton);
      core.getToolMode.mockReturnValue({ name: 'AnnotationEdit' });
      selectors.getCurrentDocument.mockReturnValue({ _id: 'doc-1' });
      selectors.getCurrentUser.mockReturnValue({ _id: 'user-1' });
      selectors.getToolButtonObjects.mockReturnValue({
        [TOOLS_NAME.SQUIGGLY]: { group: 'textTools' },
      });
      getToolChecker.mockReturnValue({
        isToolAvailable: true,
      });

      await activeToolsByHotkey({
        toolElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
        subToolElement: DataElements.SQUIGGLY_TOOL_BUTTON,
        subTool: TOOLS_NAME.SQUIGGLY,
      });

      expect(getToolChecker).toHaveBeenCalledWith({
        toolName: TOOLS_NAME.SQUIGGLY,
        currentDocument: { _id: 'doc-1' },
        currentUser: { _id: 'user-1' },
        translator: expect.any(Function),
      });
      expect(mockDispatch).toHaveBeenCalledWith(actions.setActiveToolGroup('textTools'));
      expect(core.setToolMode).toHaveBeenCalledWith(TOOLS_NAME.SQUIGGLY);
    });

    it('should not enable subTool if tool is not available', async () => {
      const mockState = {
        viewer: {
          disabledElements: {},
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.ANNOTATION.value);
      mockQuerySelector.mockReturnValue(mockToolButton);
      core.getToolMode.mockReturnValue({ name: 'AnnotationEdit' });
      selectors.getCurrentDocument.mockReturnValue({ _id: 'doc-1' });
      selectors.getCurrentUser.mockReturnValue({ _id: 'user-1' });
      selectors.getToolButtonObjects.mockReturnValue({
        [TOOLS_NAME.SQUIGGLY]: { group: 'textTools' },
      });
      getToolChecker.mockReturnValue({
        isToolAvailable: false,
      });

      await activeToolsByHotkey({
        toolElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
        subToolElement: DataElements.SQUIGGLY_TOOL_BUTTON,
        subTool: TOOLS_NAME.SQUIGGLY,
      });

      expect(mockDispatch).not.toHaveBeenCalled();
      expect(core.setToolMode).not.toHaveBeenCalledWith(TOOLS_NAME.SQUIGGLY);
    });

    it('should call promptUserChangeToolMode before toggling subTool', async () => {
      const mockState = {
        viewer: {
          disabledElements: {},
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.ANNOTATION.value);
      mockQuerySelector.mockReturnValue(mockToolButton);
      core.getToolMode.mockReturnValue({ name: 'AnnotationEdit' });
      selectors.getCurrentDocument.mockReturnValue({ _id: 'doc-1' });
      selectors.getCurrentUser.mockReturnValue({ _id: 'user-1' });
      selectors.getToolButtonObjects.mockReturnValue({
        [TOOLS_NAME.SQUIGGLY]: { group: 'textTools' },
      });
      getToolChecker.mockReturnValue({
        isToolAvailable: true,
      });
      promptUserChangeToolMode.mockReturnValue(false);

      await activeToolsByHotkey({
        toolElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
        subToolElement: DataElements.SQUIGGLY_TOOL_BUTTON,
        subTool: TOOLS_NAME.SQUIGGLY,
      });

      expect(promptUserChangeToolMode).toHaveBeenCalledWith({
        callback: expect.any(Function),
      });
      expect(core.setToolMode).toHaveBeenCalledWith(TOOLS_NAME.SQUIGGLY);
    });

    it('should not toggle subTool if promptUserChangeToolMode prevents event', async () => {
      const mockState = {
        viewer: {
          disabledElements: {},
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.ANNOTATION.value);
      mockQuerySelector.mockReturnValue(mockToolButton);
      core.getToolMode.mockReturnValue({ name: 'AnnotationEdit' });
      selectors.getCurrentDocument.mockReturnValue({ _id: 'doc-1' });
      selectors.getCurrentUser.mockReturnValue({ _id: 'user-1' });
      selectors.getToolButtonObjects.mockReturnValue({
        [TOOLS_NAME.SQUIGGLY]: { group: 'textTools' },
      });
      getToolChecker.mockReturnValue({
        isToolAvailable: true,
      });
      promptUserChangeToolMode.mockReturnValue(true);

      await activeToolsByHotkey({
        toolElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
        subToolElement: DataElements.SQUIGGLY_TOOL_BUTTON,
        subTool: TOOLS_NAME.SQUIGGLY,
      });

      expect(promptUserChangeToolMode).toHaveBeenCalled();
      expect(core.setToolMode).not.toHaveBeenCalledWith(TOOLS_NAME.SQUIGGLY);
    });
  });

  describe('waitingForSwitchToolbar', () => {
    it('should set up MutationObserver when switching toolbar', async () => {
      const mockState = {
        viewer: {
          disabledElements: {},
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.POPULAR.value);

      await activeToolsByHotkey({
        toolElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
        subToolElement: null,
        subTool: null,
      });

      expect(mockMutationObserver).toHaveBeenCalled();
      expect(mockObserverInstance.observe).toHaveBeenCalledWith(
        mockToolbarInner,
        expect.objectContaining({
          childList: true,
          subtree: true,
        })
      );
    });

    it('should disconnect observer when tool element appears', async () => {
      const mockState = {
        viewer: {
          disabledElements: {},
        },
      };
      mockGetState.mockReturnValue(mockState);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR_VALUES.POPULAR.value);

      let callCount = 0;
      mockQuerySelector.mockImplementation((selector) => {
        callCount++;
        if (selector.includes(LEFT_SIDE_BAR_VALUES.ANNOTATION.dataElement)) {
          return mockTabButton;
        }
        if (selector.includes(DataElements.TEXT_TOOL_GROUP_BUTTON)) {
          return callCount > 1 ? mockToolButton : null;
        }
        return null;
      });

      await activeToolsByHotkey({
        toolElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
        subToolElement: null,
        subTool: null,
      });

      const callback = mockMutationObserver.mock.calls[0][0];
      callback([], mockObserverInstance);

      expect(mockObserverInstance.disconnect).toHaveBeenCalled();
    });
  });
});
