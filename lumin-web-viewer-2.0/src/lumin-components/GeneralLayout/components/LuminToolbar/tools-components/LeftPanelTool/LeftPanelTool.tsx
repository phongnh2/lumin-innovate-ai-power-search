import { Menu } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LEFT_PANEL_VALUES } from '@new-ui/components/LuminLeftPanel/constants';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import ViewerContext from 'screens/Viewer/Context';

import SplitButton from 'lumin-components/ViewerCommonV2/ToolButton/SplitButton';

import { useTranslation } from 'hooks';

import { selectors as editorChatBotSelectors } from 'features/EditorChatBot/slices';

import { LEFT_PANEL_TOOL_MAPPING } from './constans';
import LeftPanelToolMenuItem from './LeftPanelToolMenuItem';
import { StaticShortcutID } from '../../utils';

interface ILeftPanelToolProps {
  renderOptions?: {
    menuItemKey: string;
    renderAsMenuItem: boolean;
  };
}

const LeftPanelTool = ({ renderOptions }: ILeftPanelToolProps) => {
  const { menuItemKey = null, renderAsMenuItem = false } = renderOptions || {};
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [openPopper, setOpenPopper] = useState(false);
  const [isDisableTool, setIsDisableTool] = useState(true);

  const { bookmarkIns } = useContext(ViewerContext);
  const isDefaultMode = useSelector(selectors.isDefaultMode);
  const leftPanelValue = useSelector(selectors.leftPanelValue);
  const isLeftPanelOpen = useSelector(selectors.isLeftPanelOpen);
  const isDocumentReady = useSelector(selectors.getIsDocumentReady);
  const isAiProcessing = useSelector(editorChatBotSelectors.getIsAiProcessing);

  const disableBookmarkFeature = useCallback(() => {
    if (leftPanelValue === LEFT_PANEL_VALUES.BOOKMARK) {
      dispatch(actions.setIsLeftPanelOpen(false));
      dispatch(actions.setLeftPanelValue(LEFT_PANEL_VALUES.THUMBNAIL));
    }
  }, [leftPanelValue, dispatch]);

  useEffect(() => {
    if (isDocumentReady) {
      setIsDisableTool(!isDefaultMode || isAiProcessing);
    }
  }, [isDocumentReady, isDefaultMode, isAiProcessing]);

  useEffect(() => {
    window.addEventListener('removeLastBookmarkFromPageTool', disableBookmarkFeature);
    return () => {
      window.removeEventListener('removeLastBookmarkFromPageTool', disableBookmarkFeature);
    };
  }, [disableBookmarkFeature]);

  useEffect(() => {
    const onManipUpdated = () => {
      const optimisticBookmarks: Core.Bookmark[] = [];
      if (bookmarkIns?.bookmarksUser) {
        Object.keys(bookmarkIns.bookmarksUser).forEach((bookmark) => {
          const optimisticBookmark = new core.CoreControls.Bookmark(
            [],
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            bookmarkIns.bookmarksUser[bookmark].message as string,
            parseInt(bookmark),
            null,
            0,
            0
          );
          optimisticBookmarks.push(optimisticBookmark);
        });
      }
      dispatch(actions.setBookmarks(optimisticBookmarks));
    };
    core.docViewer.addEventListener('native_manipUpdated', onManipUpdated);
    return () => {
      core.docViewer.removeEventListener('native_manipUpdated', onManipUpdated);
    };
  }, []);

  if (renderAsMenuItem) {
    return (
      <LeftPanelToolMenuItem
        value={menuItemKey}
        isDisabled={isDisableTool}
        title={t(LEFT_PANEL_TOOL_MAPPING[menuItemKey].title)}
        icon={LEFT_PANEL_TOOL_MAPPING[menuItemKey].icon}
      />
    );
  }

  return (
    <Menu
      data-cy="left_panel_tool_menu"
      opened={openPopper}
      onClose={() => setOpenPopper(false)}
      closeOnClickOutside
      closeOnEscape
      closeOnItemClick
      styles={{
        dropdown: {
          width: 226,
        },
      }}
      ComponentTarget={
        <SplitButton
          shortcutId={StaticShortcutID.Default}
          onClick={() => {
            setOpenPopper(false);
            dispatch(actions.setIsLeftPanelOpen(!isLeftPanelOpen));
          }}
          disabled={isDisableTool}
          isActive={isLeftPanelOpen}
          icon={LEFT_PANEL_TOOL_MAPPING[leftPanelValue]?.icon}
          singleButtonProps={{
            ...(LEFT_PANEL_TOOL_MAPPING[leftPanelValue] && {
              tooltipData: { placement: 'bottom', title: t(LEFT_PANEL_TOOL_MAPPING[leftPanelValue].title) },
            }),
            isUsingKiwiIcon: true,
          }}
          secondaryOnClick={() => setOpenPopper((prev) => !prev)}
          isSecondaryActive
        />
      }
      position="bottom-start"
      trigger="click"
      itemSize="dense"
    >
      {Object.entries(LEFT_PANEL_TOOL_MAPPING).map(([key, { title, icon }]) => (
        <LeftPanelToolMenuItem key={key} value={key} title={t(title)} icon={icon} isDisabled={isDisableTool} />
      ))}
    </Menu>
  );
};

export default LeftPanelTool;
