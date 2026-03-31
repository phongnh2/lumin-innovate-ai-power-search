import { Menu, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';

import { AvailabilityToolCheckProvider } from '@new-ui/HOCs/withValidUserCheck';

import actions from 'actions';
import selectors from 'selectors';

import Loading from 'luminComponents/Loading';
import { useGetRightSectionTools } from 'luminComponents/ToolbarRightSection/hooks/useGetRightSectionTools';
import NavigationButton from 'luminComponents/ViewerCommonV2/NavigationButton';
import {
  DELAY_TIME_BY_HOVERING_NAVIGATION_TAB,
  MENU_FADE_IN_RIGHT_DURATION,
} from 'luminComponents/ViewerCommonV2/NavigationButton/constants';

import { useCleanup } from 'hooks/useCleanup';
import { useTranslation } from 'hooks/useTranslation';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';
import QuickSearchNavigationButton from 'features/QuickSearch/components/QuickSearchNavigationButton';
import { quickSearchSelectors } from 'features/QuickSearch/slices';
import UploadContainer from 'features/UploadDocument/UploadContainer';
import { useIsOpenViewerNavigation } from 'features/ViewerNavigation';

import { DataElements } from 'constants/dataElement';
import { office } from 'constants/documentType';

import { LEFT_SIDE_BAR, LEFT_SIDE_BAR_VALUES } from './constants';
import { useLeftSideBarFeatureValidation } from './hooks/useLeftSideBarFeatureValidation';
import { ILeftSideBarContentProps, ILeftSideBarElementProps } from './interfaces';
import { leftSideBarActions, leftSideBarSelectors } from './slices';
import { useConvertPdfStore } from '../LuminTitleBar/components/TitleBarRightSection/components/ConvertPdf/hooks/useConvertPdfStore';
import ToolbarItem from '../LuminToolbar/components/ToolbarItem';
import { ToolType } from '../LuminToolbar/components/ToolbarList';
import { toolbarSelectors } from '../LuminToolbar/slices';

import * as Styled from './LuminLeftSideBar.styled';

const DocumentHistoryList = lazyWithRetry(() => import('features/ViewerNavigation/components/DocumentHistoryList'), {
  fallback: <Loading normal useReskinCircularProgress />,
});

const LeftSideBarContent = (props: ILeftSideBarContentProps) => {
  const dispatch = useDispatch();
  const isViewerNavigationExpanded = useIsOpenViewerNavigation();
  const { t } = useTranslation();
  const { onClick } = props;
  const toolbarValue = useSelector(selectors.toolbarValue);
  const isOffline = useSelector(selectors.isOffline);
  const isInFocusMode = useSelector(selectors.isInFocusMode);
  const isLeftSidebarPopoverOpened = useSelector(leftSideBarSelectors.isLeftSidebarPopoverOpened);
  const isToolbarPopoverVisible = useSelector(toolbarSelectors.isToolbarPopoverVisible);
  const isOpenQuickSearch = useSelector(quickSearchSelectors.isOpenQuickSearch);
  const currentDocument = useSelector(selectors.getCurrentDocument);
  const showConvertModal = [LEFT_SIDE_BAR_VALUES.EDIT_PDF.value, LEFT_SIDE_BAR_VALUES.SECURITY.value];
  const { setShowModalConvertPdf } = useConvertPdfStore();

  const { isTemplateViewer } = useTemplateViewerMatch();

  const isReadyHovering = useRef(true);
  const navigationItemsRef = useRef<Map<string, HTMLElement>>(null);
  const getNavigationItemsMap = () => {
    if (!navigationItemsRef.current) {
      navigationItemsRef.current = new Map();
    }
    return navigationItemsRef.current;
  };

  const [hoveredToolbarValue, setHoveredToolbarValue] = useState<string>(null);
  const { tools, menuTools, requestAccessModalElement } = useGetRightSectionTools(hoveredToolbarValue);
  const { getTooltipContent } = useLeftSideBarFeatureValidation();

  const onHoveringNavigationTab = useDebouncedCallback((value: string) => {
    if (value === LEFT_SIDE_BAR.EDIT_PDF || isInFocusMode || !isReadyHovering.current || isOpenQuickSearch) {
      return;
    }

    dispatch(leftSideBarActions.setHoveredNavigationTabs(value));
    setHoveredToolbarValue(value);
    dispatch(leftSideBarActions.setIsLeftSidebarPopoverOpened(true));
    dispatch(actions.closeElement(DataElements.TOOLBAR_POPOVER));
  }, DELAY_TIME_BY_HOVERING_NAVIGATION_TAB);

  const debounceResetHoveredToolbarValue = useDebouncedCallback(() => {
    setHoveredToolbarValue(null);
  }, MENU_FADE_IN_RIGHT_DURATION);

  const onClickNavigationButton = (toolValue: string) => {
    if (!isToolbarPopoverVisible) {
      isReadyHovering.current = false;
      debounceResetHoveredToolbarValue();
      if (isLeftSidebarPopoverOpened) {
        dispatch(leftSideBarActions.setIsLeftSidebarPopoverOpened(false));
      }
    }
    if (showConvertModal.includes(toolValue) && Object.values(office).includes(currentDocument.mimeType)) {
      setShowModalConvertPdf(true);
      return;
    }

    return onClick(toolValue);
  };

  const onCloseMenu = () => {
    debounceResetHoveredToolbarValue();
    dispatch(leftSideBarActions.setIsLeftSidebarPopoverOpened(false));
  };

  const renderMenuItems = (): React.ReactElement[] => {
    const listTools = hoveredToolbarValue === LEFT_SIDE_BAR.SECURITY ? tools : menuTools;
    return listTools.map((tool: ToolType) => (
      <ToolbarItem
        key={tool.key}
        renderAsMenuItem
        showOptionButton={false}
        onChangeNavigationTab={() => {
          if (toolbarValue !== hoveredToolbarValue) {
            return onClick(hoveredToolbarValue);
          }
          return true;
        }}
      >
        {tool.element}
      </ToolbarItem>
    ));
  };

  const onMouseLeave = () => {
    isReadyHovering.current = true;
    onHoveringNavigationTab.cancel();
  };
  const handleNavigationButtonRef = (value: string) => (node: HTMLElement | null) => {
    const navigationItemsMap = getNavigationItemsMap();
    if (node) {
      navigationItemsMap.set(value, node);
    } else {
      navigationItemsMap.delete(value);
    }
  };

  useCleanup(() => {
    dispatch(leftSideBarActions.setHoveredNavigationTabs(null));
  }, []);

  return (
    <Styled.LeftSideBarContent data-navigation-expanded={isViewerNavigationExpanded}>
      {isViewerNavigationExpanded ? (
        <>
          {!isTemplateViewer && <UploadContainer />}
          <DocumentHistoryList />
        </>
      ) : (
        <>
          {Object.values(LEFT_SIDE_BAR_VALUES).map(
            ({
              value,
              label,
              icon,
              dataElement,
              toolName,
              eventName,
              validateMimeType,
              allowInTempEditMode,
              isColorIcon,
            }: ILeftSideBarElementProps) => {
              const isDisabled =
                isOffline && [LEFT_SIDE_BAR_VALUES.EDIT_PDF.value, LEFT_SIDE_BAR_VALUES.SECURITY.value].includes(value);

              const renderNavigationButton = (shouldShowPremiumIcon: boolean, toggleCheckPopper: () => void) => (
                <NavigationButton
                  isActive={toolbarValue === value}
                  isHovered={hoveredToolbarValue === value}
                  onClick={() => (shouldShowPremiumIcon ? toggleCheckPopper() : onClickNavigationButton(value))}
                  label={t(label)}
                  icon={icon}
                  iconSize={24}
                  isColorIcon={isColorIcon}
                  shouldShowPremiumIcon={shouldShowPremiumIcon}
                  disabled={isDisabled}
                  dataElement={dataElement}
                  data-lumin-btn-name={dataElement}
                  onMouseEnter={() => onHoveringNavigationTab(value)}
                  onMouseLeave={onMouseLeave}
                  ref={handleNavigationButtonRef(value)}
                />
              );

              return (
                <AvailabilityToolCheckProvider
                  key={value}
                  toolName={toolName}
                  eventName={eventName}
                  useModal
                  render={({
                    isToolAvailable,
                    shouldShowPremiumIcon,
                    toggleCheckPopper,
                  }: {
                    isToolAvailable: boolean;
                    shouldShowPremiumIcon: boolean;
                    toggleCheckPopper: () => void;
                  }) => (
                    <Menu
                      disabled={value === LEFT_SIDE_BAR.EDIT_PDF}
                      width={280}
                      trigger="hover"
                      position="left-start"
                      offset={{ mainAxis: 5, crossAxis: -24 }}
                      closeOnItemClick={isToolAvailable}
                      opened={isLeftSidebarPopoverOpened && hoveredToolbarValue === value}
                      openDelay={DELAY_TIME_BY_HOVERING_NAVIGATION_TAB}
                      onClose={onCloseMenu}
                      ComponentTarget={
                        <div>
                          <PlainTooltip
                            content={getTooltipContent({ validateMimeType, allowInTempEditMode })}
                            position="right"
                          >
                            {renderNavigationButton(shouldShowPremiumIcon, toggleCheckPopper)}
                          </PlainTooltip>
                        </div>
                      }
                      transitionProps={{
                        transition: 'fade-right',
                        duration: MENU_FADE_IN_RIGHT_DURATION,
                      }}
                    >
                      {renderMenuItems()}
                    </Menu>
                  )}
                />
              );
            }
          )}
          <QuickSearchNavigationButton hoveredToolbarValue={hoveredToolbarValue} onClickNavigationButton={onClick} />
          {requestAccessModalElement}
        </>
      )}
    </Styled.LeftSideBarContent>
  );
};

export default LeftSideBarContent;
