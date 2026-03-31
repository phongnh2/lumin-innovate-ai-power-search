import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import LuminRestoreOriginalButton from '@new-ui/components/LuminTitleBar/components/TitleBarRightSection/components/LuminRestoreOriginalButton';

import selectors from 'selectors';

import NotificationGroupQuery from 'lumin-components/NotificationGroupQuery';

import { useEnabledRevision } from 'features/DocumentRevision/hooks/useEnabledRevision';
import { useEnabledSummarization } from 'features/DocumentSummarization';

import { ConvertPdf } from './components/ConvertPdf';
import { useHandleConvertPdf } from './components/ConvertPdf/hooks/useHandleConvertPdf';
import FileMenu from './components/FileMenu';
import LuminAutoSyncStatus from './components/LuminAutoSyncStatus';
import LuminCollaborators from './components/LuminCollaborators';
import LuminHelpCenterButton from './components/LuminHelpCenterButton';
import LuminLocalFileButton from './components/LuminLocalFileButton';
import LuminProfileButton from './components/LuminProfileButton';
import LuminShareButton from './components/LuminShareButton';
import LuminSyncButton from './components/LuminSyncButton';
import OfflineStatusIcon from './components/OfflineStatusIcon';
import SummarizeButton from './components/SummarizeButton';
import UseTemplateButton from './components/UseTemplateButton';

import * as Styled from './TitleBarRightSection.styled';

const TitleBarRightSection = ({ isPreviewOriginalVersionMode, isLoadingDocument, currentDocument }) => {
  const { enabled: enabledRevision } = useEnabledRevision();
  const noRightButton = isLoadingDocument || !currentDocument || (enabledRevision && isPreviewOriginalVersionMode);
  const { showSummarizeHeader } = useEnabledSummarization();
  const { isShowButtonConvertPdf } = useHandleConvertPdf();

  const renderRightButton = () => {
    if (isPreviewOriginalVersionMode && !enabledRevision) {
      return <LuminRestoreOriginalButton isLoadingDocument={isLoadingDocument} />;
    }
    if (noRightButton) {
      return null;
    }

    return (
      <>
        <OfflineStatusIcon />
        <LuminCollaborators />
        <LuminAutoSyncStatus />
        <FileMenu />
        <UseTemplateButton />
        {isShowButtonConvertPdf && <ConvertPdf />}
        {showSummarizeHeader && !isShowButtonConvertPdf && <SummarizeButton />}
        {!isShowButtonConvertPdf && (
          <>
            <LuminShareButton />
            <LuminLocalFileButton />
            <LuminSyncButton />
          </>
        )}
      </>
    );
  };

  return (
    <Styled.RightSection>
      {renderRightButton()}
      <Styled.GroupContainer>
        {!noRightButton ? <Styled.DividerStyled orientation="vertical" /> : null}
        <LuminHelpCenterButton />
        <NotificationGroupQuery />
      </Styled.GroupContainer>
      <LuminProfileButton />
    </Styled.RightSection>
  );
};

TitleBarRightSection.propTypes = {
  isPreviewOriginalVersionMode: PropTypes.bool,
  isLoadingDocument: PropTypes.bool,
  currentDocument: PropTypes.object,
};

TitleBarRightSection.defaultProps = {
  isPreviewOriginalVersionMode: false,
  isLoadingDocument: false,
  currentDocument: null,
};

const mapStateToProps = (state) => ({
  isPreviewOriginalVersionMode: selectors.isPreviewOriginalVersionMode(state),
  isLoadingDocument: selectors.isLoadingDocument(state),
  currentDocument: selectors.getCurrentDocument(state),
});

export default connect(mapStateToProps)(TitleBarRightSection);
