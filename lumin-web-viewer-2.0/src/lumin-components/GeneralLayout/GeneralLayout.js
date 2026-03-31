import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';

import BackDrop from '@new-ui/components/BackDrop';

import selectors from 'selectors';

import AppCircularLoading from 'luminComponents/AppCircularLoading';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useSyncDocumentHandler } from 'hooks/useSyncDocumentHandler';

import { isElectron } from 'utils/corePathHelper';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import { useSyncNumerousAnnotations } from 'features/Annotation/hooks/useSyncNumerousAnnotations';
import FullScreenCanvas from 'features/FullScreen/components/FullScreenCanvas/FullScreenCanvas';

import { PageToolViewMode } from 'constants/documentConstants';

import DocumentContainer from './components/DocumentContainer';
import LuminLeftPanel from './components/LuminLeftPanel';
import { TOOL_PROPERTIES_VALUE } from './components/LuminLeftPanel/constants';
import LuminLeftSideBar from './components/LuminLeftSideBar';
import LuminRightPanel from './components/LuminRightPanel';
import RightSideBar from './components/LuminRightSideBar/RightSideBar';
import LuminTitleBar from './components/LuminTitleBar';
import LuminToolbar from './components/LuminToolbar';
import ToolProperties from './components/ToolProperties';
import useChangeLayoutListener from './hooks/useChangeLayoutListener';
import { useHandleMobileView } from './hooks/useHandleMobileView';

import * as Styled from './GeneralLayout.styled';

const GridEditModeDocumentContainer = lazyWithRetry(
  () => import('lumin-components/GeneralLayout/components/GridEditModeDocumentContainer'),
  {
    fallback: (
      <div
        style={{
          width: '100%',
        }}
      >
        <AppCircularLoading />
      </div>
    ),
  }
);

const FILE_SIZE_FOR_LUMIN_PRESENTATION_MODE = 50 * 1024 * 1024; // 50mb

const GeneralLayout = ({ hasWarningBanner = false }) => {
  const isPageEditMode = useSelector(selectors.isPageEditMode);
  const pageEditDisplayMode = useSelector(selectors.pageEditDisplayMode);
  const toolPropertiesValue = useSelector(selectors.toolPropertiesValue) || TOOL_PROPERTIES_VALUE.DEFAULT;
  const documentSize = useShallowSelector(selectors.getCurrentDocument)?.size;
  const isInPresenterMode = useSelector(selectors.isInPresenterMode);

  useChangeLayoutListener();
  useSyncNumerousAnnotations();
  useSyncDocumentHandler();
  useHandleMobileView();

  const isDocumentRevision = toolPropertiesValue === TOOL_PROPERTIES_VALUE.REVISION;
  const isInFocusMode = useSelector(selectors.isInFocusMode);

  const renderDocumentContainer = useCallback(
    ({ isInPageEditMode, pageToolViewMode, isMobile = false, documentSize }) => {
      const isGridMode = isInPageEditMode && pageToolViewMode === PageToolViewMode.GRID;
      if (isInPresenterMode && documentSize > FILE_SIZE_FOR_LUMIN_PRESENTATION_MODE) {
        return <FullScreenCanvas />;
      }
      if (isGridMode) {
        return <GridEditModeDocumentContainer />;
      }
      return <DocumentContainer isNarrowScreen={isMobile} />;
    },
    [isInPresenterMode]
  );

  const renderDocumentLayout = useCallback(
    ({ isInPageEditMode, pageToolViewMode, isMobile = false, documentSize }) => (
      <Styled.DocumentOuterContainer data-is-in-presenter-mode={isInPresenterMode}>
        <div style={{ position: 'relative' }}>
          <BackDrop />
        </div>
        {renderDocumentContainer({ isInPageEditMode, pageToolViewMode, isMobile, documentSize })}
      </Styled.DocumentOuterContainer>
    ),
    [isInPresenterMode, renderDocumentContainer]
  );

  return (
    <Styled.EditorPage data-is-electron={isElectron()}>
      <LuminTitleBar />
      <Styled.GeneralLayoutBody
        $isInFocusMode={isInFocusMode}
        $isInPresenterMode={isInPresenterMode}
        $hasWarningBanner={hasWarningBanner}
      >
        <LuminLeftSideBar />
        <Styled.GeneralLayoutViewerWrapper
          $isDocumentRevision={isDocumentRevision}
          style={isInPresenterMode ? { backgroundColor: '#000' } : {}}
        >
          <LuminToolbar />
          <Styled.GeneralLayoutInnerWrapper $isInPresenterMode={isInPresenterMode}>
            <LuminLeftPanel />
            {renderDocumentLayout({
              isInPageEditMode: isPageEditMode,
              pageToolViewMode: pageEditDisplayMode,
              isInPresenterMode,
              documentSize,
            })}
            <ToolProperties />
          </Styled.GeneralLayoutInnerWrapper>
        </Styled.GeneralLayoutViewerWrapper>

        <LuminRightPanel />

        <RightSideBar />
      </Styled.GeneralLayoutBody>
    </Styled.EditorPage>
  );
};

GeneralLayout.propTypes = {
  hasWarningBanner: PropTypes.bool,
};

export default GeneralLayout;
