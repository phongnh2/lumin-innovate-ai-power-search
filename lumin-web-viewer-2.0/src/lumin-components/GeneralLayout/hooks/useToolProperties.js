import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';

import actions from 'actions';
import selectors from 'selectors';

import { useTranslation } from 'hooks/useTranslation';

import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';

import DataElements from 'constants/dataElement';

import { TOOL_PROPERTIES_VALUE } from '../components/LuminLeftPanel/constants';

const pageTools = [
  TOOL_PROPERTIES_VALUE.MERGE,
  TOOL_PROPERTIES_VALUE.ROTATE,
  TOOL_PROPERTIES_VALUE.INSERT,
  TOOL_PROPERTIES_VALUE.SPLIT_EXTRACT,
  TOOL_PROPERTIES_VALUE.MOVE,
  TOOL_PROPERTIES_VALUE.DELETE,
  TOOL_PROPERTIES_VALUE.CROP,
];

const useToolProperties = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const isToolPropertiesOpen = useSelector(selectors.isToolPropertiesOpen, shallowEqual);
  const toolPropertiesValue = useSelector(selectors.toolPropertiesValue, shallowEqual);

  const toggleIsToolPropertiesOpen = () => {
    dispatch(actions.setIsToolPropertiesOpen(!isToolPropertiesOpen));
  };

  const setIsToolPropertiesOpen = (value) => {
    dispatch(actions.setIsToolPropertiesOpen(value));
  };

  const setToolPropertiesValue = (value) => {
    dispatch(actions.setToolPropertiesValue(value));
  };

  const closeToolPropertiesPanel = () => {
    setIsToolPropertiesOpen(false);
    setToolPropertiesValue(TOOL_PROPERTIES_VALUE.DEFAULT);
  };

  const openPageToolWithToolbarValue = (tool) => {
    if (pageTools.includes(tool)) {
      dispatch(actions.setToolbarValue(LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value));
      setIsToolPropertiesOpen(true);
      setToolPropertiesValue(tool);
    }
  };

  const enterTool = (tool) => {
    const shouldBlockNextAction =
      toggleFormFieldCreationMode() ||
      promptUserChangeToolMode({
        callback: () => {
          openPageToolWithToolbarValue(tool);
        },
        cancelCallback: () => {
          openPageToolWithToolbarValue(tool);
        },
        translator: t,
      });
    if (shouldBlockNextAction) {
      return;
    }
    setIsToolPropertiesOpen(true);
    setToolPropertiesValue(tool);
  };

  const enterMergeTool = () => {
    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.MERGE) {
      closeToolPropertiesPanel();
      return;
    }
    enterTool(TOOL_PROPERTIES_VALUE.MERGE);
  };

  const enterRotatePageTool = () => {
    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.ROTATE) {
      closeToolPropertiesPanel();
      return;
    }
    enterTool(TOOL_PROPERTIES_VALUE.ROTATE);
  };

  const enterInserBlankPageTool = () => {
    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.INSERT) {
      closeToolPropertiesPanel();
      return;
    }
    enterTool(TOOL_PROPERTIES_VALUE.INSERT);
  };

  const enterSplitExtractPageTool = () => {
    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.SPLIT_EXTRACT) {
      closeToolPropertiesPanel();
      return;
    }
    enterTool(TOOL_PROPERTIES_VALUE.SPLIT_EXTRACT);
  };

  const enterMovePageTool = () => {
    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.MOVE) {
      closeToolPropertiesPanel();
      return;
    }
    enterTool(TOOL_PROPERTIES_VALUE.MOVE);
  };

  const enterDeletePageTool = () => {
    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.DELETE) {
      closeToolPropertiesPanel();
      return;
    }
    enterTool(TOOL_PROPERTIES_VALUE.DELETE);
  };

  const enterCropPageTool = () => {
    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.CROP) {
      closeToolPropertiesPanel();
      return;
    }
    enterTool(TOOL_PROPERTIES_VALUE.CROP);
  };

  const enterEditPdfTool = () => {
    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.EDIT_PDF) {
      closeToolPropertiesPanel();
      return;
    }
    enterTool(TOOL_PROPERTIES_VALUE.EDIT_PDF);
  };

  const toggleFormBuildTool = () => {
    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.FORM_BUILD) {
      toggleFormFieldCreationMode();
      return;
    }

    toggleFormFieldCreationMode(DataElements.FORM_BUILD_PANEL);
  };

  const closeToolPropertiesFromHeader = () => {
    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.FORM_BUILD) {
      toggleFormFieldCreationMode();
      return;
    }

    closeToolPropertiesPanel();
  };

  return {
    toggleIsToolPropertiesOpen,
    enterMergeTool,
    closeToolPropertiesPanel,
    enterRotatePageTool,
    enterInserBlankPageTool,
    enterSplitExtractPageTool,
    enterMovePageTool,
    enterDeletePageTool,
    enterCropPageTool,
    enterEditPdfTool,
    toggleFormBuildTool,
    closeToolPropertiesFromHeader,
  };
};

export default useToolProperties;
