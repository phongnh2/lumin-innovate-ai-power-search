import { IconButton, PlainTooltip } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState, createContext, useMemo, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useTheme } from 'styled-components';

import ToolbarEditPdfLeftSection from '@new-ui/components/LuminToolbar/components/ToolbarEditPdfLeftSection';
import ToolbarEditPdfRightSection from '@new-ui/components/LuminToolbar/components/ToolbarEditPdfRightSection';
import ToolbarLeftSection from '@new-ui/components/LuminToolbar/components/ToolbarLeftSection';
import ToolbarPagetoolLeftSection from '@new-ui/components/LuminToolbar/components/ToolbarPagetoolLeftSection';
import ToolbarSecurityLeftSection from '@new-ui/components/LuminToolbar/components/ToolbarSecurityLeftSection';
import SearchOverlay from '@new-ui/components/SearchOverlay';
import { LayoutElements } from '@new-ui/constants';
import Divider from '@new-ui/general-components/Divider';

import selectors from 'selectors';

import ErrorBoundary from 'luminComponents/ErrorBoundary';
import ToolbarRightSection from 'luminComponents/ToolbarRightSection';

import { useCleanup, useWindowSize } from 'hooks';

import NoTextDetectedModal from 'features/ReadAloud/components/NoTextDetectedModal';
import ReadAloudSetting from 'features/ReadAloud/components/ReadAloudSetting/ReadAloudSetting';
import ReadDocumentProvider from 'features/ReadAloud/components/ReadDocumentProvider';
import { useEnabledReadAloud } from 'features/ReadAloud/hooks/useEnabledReadAloud';
import { readAloudActions, readAloudSelectors } from 'features/ReadAloud/slices';
import { viewerNavigationSelectors } from 'features/ViewerNavigation';

import { ToolbarRelatedWidth } from 'constants/toolbar';

import { LEFT_SIDE_BAR } from '../LuminLeftSideBar/constants';

import * as Styled from './LuminToolbar.styled';

export const ToolbarContext = createContext({ maxRightSectionWidth: 0, defaultRightSectionWidth: 0 });

const LuminToolbar = ({
  toolbarValue = '',
  isPreviewOriginalVersionMode = false,
  isOpenSearchOverlay = false,
  rightPanelValue = LayoutElements.DEFAULT,
  isRightPanelOpen = false,
  isInReadAloudMode = false,
  setIsInReadAloudMode = () => {},
  isInPresenterMode = false,
  isViewerNavigationExpanded = false,
}) => {
  const windowSize = useWindowSize();
  const theme = useTheme();
  const { enabled: enabledReadAloud } = useEnabledReadAloud();

  const { t } = useTranslation();

  const [defaultRightSectionWidth, setDefaultRightSectionWidth] = useState(null);

  const [maxRightSectionWidth, setMaxRightSectionWidth] = useState(null);

  const toolbarInnerProvider = useMemo(
    () => ({ maxRightSectionWidth, defaultRightSectionWidth }),
    [maxRightSectionWidth, defaultRightSectionWidth]
  );

  const toolRef = useRef();
  const toolbarValueRef = useRef(null);

  const getToolbarParameters = useCallback(
    (target) => {
      if (!toolbarValue || !windowSize.width || isPreviewOriginalVersionMode) {
        return;
      }

      const toolbarLeftSection = target.children[0];

      // Search Panel or Comment Panel if it's been showed
      const rightPanelWidth = isRightPanelOpen ? ToolbarRelatedWidth.DEFAULT_RIGHT_PANEL : 0;
      const viewerNavigationWidth = isViewerNavigationExpanded ? ToolbarRelatedWidth.VIEWER_NAVIGATION : 0;

      // Width-parameters which were not changed by resizing
      const totalSidebarAndPanelWidth =
        rightPanelWidth +
        viewerNavigationWidth +
        ToolbarRelatedWidth.MINIMUM_GAP_TOOLBAR +
        ToolbarRelatedWidth.DEFAULT_LEFT_SIDE_BAR +
        ToolbarRelatedWidth.DEFAULT_RIGHT_SIDE_BAR;

      setMaxRightSectionWidth(windowSize.width - (toolbarLeftSection?.clientWidth || 0) - totalSidebarAndPanelWidth);
    },
    [toolbarValue, windowSize, isRightPanelOpen, isViewerNavigationExpanded, isPreviewOriginalVersionMode]
  );

  useLayoutEffect(() => {
    if (!toolRef.current || !windowSize.width || toolbarValueRef.current === toolbarValue || isInReadAloudMode) {
      return;
    }
    toolbarValueRef.current = toolbarValue;
    const toolbarRightSection = toolRef.current.children[1];
    setDefaultRightSectionWidth(toolbarRightSection?.clientWidth || 0);
  }, [toolbarValue, windowSize, isInReadAloudMode]);

  useLayoutEffect(() => {
    if (!toolRef.current) {
      return undefined;
    }

    const observer = new ResizeObserver((entries) => getToolbarParameters(entries[0].target));

    observer.observe(toolRef.current);

    return () => {
      observer.disconnect();
    };
  }, [getToolbarParameters]);

  const renderLeftSection = useCallback((_toolbarValue) => {
    if (_toolbarValue === LEFT_SIDE_BAR.PAGE_TOOLS) {
      return <ToolbarPagetoolLeftSection />;
    }
    if (_toolbarValue === LEFT_SIDE_BAR.EDIT_PDF) {
      return <ToolbarEditPdfLeftSection />;
    }
    if (_toolbarValue === LEFT_SIDE_BAR.SECURITY) {
      return <ToolbarSecurityLeftSection />;
    }
    return <ToolbarLeftSection />;
  }, []);

  const handleCloseReadAloudMode = () => {
    setIsInReadAloudMode(false);
  };

  useCleanup(() => {
    if (toolbarValue && isInReadAloudMode) {
      handleCloseReadAloudMode();
    }
  }, [toolbarValue, isInReadAloudMode]);

  const renderReadAloudSection = () => (
    <Styled.ToolbarSectionWrapper>
      <ReadAloudSetting />
      <Divider orientation="vertical" />
      <PlainTooltip content={t('action.close')} position="bottom">
        <IconButton
          icon="x-md"
          iconSize="md"
          iconColor={theme.le_main_on_surface_variant}
          onClick={handleCloseReadAloudMode}
        />
      </PlainTooltip>
    </Styled.ToolbarSectionWrapper>
  );

  const renderRightSection = useCallback(() => {
    if (toolbarValue === LEFT_SIDE_BAR.EDIT_PDF) {
      return <ToolbarEditPdfRightSection />;
    }

    if (toolbarValue === LEFT_SIDE_BAR.LUMIN_AI) {
      return null;
    }

    return <ToolbarRightSection isInReadAloudMode={isInReadAloudMode} readAloudSection={renderReadAloudSection()} />;
  }, [isInReadAloudMode, theme, toolbarValue]);

  const renderSearchOverlay = () => {
    const shouldHideSearchOverlay =
      !isOpenSearchOverlay || (isRightPanelOpen && rightPanelValue === LayoutElements.SEARCH);
    if (shouldHideSearchOverlay) {
      return null;
    }
    return <SearchOverlay />;
  };

  if (enabledReadAloud) {
    return (
      <ErrorBoundary>
        <Styled.Toolbar
          id="toolbar"
          $isInPresenterMode={isInPresenterMode}
          $isPreviewOriginalVersionMode={isPreviewOriginalVersionMode}
        >
          <ReadDocumentProvider>
            <Styled.ToolbarInner data-joyride-new-layout="step-2" id="ToolbarInner" ref={toolRef}>
              {renderLeftSection(toolbarValue)}
              <ToolbarContext.Provider value={toolbarInnerProvider}>{renderRightSection()}</ToolbarContext.Provider>
            </Styled.ToolbarInner>
            {renderSearchOverlay()}
            <NoTextDetectedModal />
          </ReadDocumentProvider>
        </Styled.Toolbar>
      </ErrorBoundary>
    );
  }

  return (
    <Styled.Toolbar
      id="toolbar"
      $isInPresenterMode={isInPresenterMode}
      $isPreviewOriginalVersionMode={isPreviewOriginalVersionMode}
    >
      <Styled.ToolbarInner data-joyride-new-layout="step-2" id="ToolbarInner" ref={toolRef}>
        {renderLeftSection(toolbarValue)}
        <ToolbarContext.Provider value={toolbarInnerProvider}>{renderRightSection()}</ToolbarContext.Provider>
      </Styled.ToolbarInner>
      {renderSearchOverlay()}
      <NoTextDetectedModal />
    </Styled.Toolbar>
  );
};

LuminToolbar.propTypes = {
  toolbarValue: PropTypes.string,
  isPreviewOriginalVersionMode: PropTypes.bool,
  isOpenSearchOverlay: PropTypes.bool,
  rightPanelValue: PropTypes.oneOf(Object.values(LayoutElements)),
  isRightPanelOpen: PropTypes.bool,
  setIsInReadAloudMode: PropTypes.func,
  isInReadAloudMode: PropTypes.bool,
  isInPresenterMode: PropTypes.bool,
  isViewerNavigationExpanded: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  toolbarValue: selectors.toolbarValue(state),
  isPreviewOriginalVersionMode: selectors.isPreviewOriginalVersionMode(state),
  isOpenSearchOverlay: selectors.isOpenSearchOverlay(state),
  rightPanelValue: selectors.rightPanelValue(state),
  isRightPanelOpen: selectors.isRightPanelOpen(state),
  isInReadAloudMode: readAloudSelectors.isInReadAloudMode(state),
  isInPresenterMode: selectors.isInPresenterMode(state),
  isViewerNavigationExpanded: viewerNavigationSelectors.isExpanded(state),
});

const mapDispatchToProps = (dispatch) => ({
  setIsInReadAloudMode: (value) => dispatch(readAloudActions.setIsInReadAloudMode(value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LuminToolbar);
