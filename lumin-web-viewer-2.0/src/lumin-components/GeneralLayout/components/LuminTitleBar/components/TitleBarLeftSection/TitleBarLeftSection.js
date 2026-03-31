import { Badge } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import ViewerContext from 'screens/Viewer/Context';

import { LEFT_SIDE_BAR_VALUES } from 'lumin-components/GeneralLayout/components/LuminLeftSideBar/constants';
import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';
import useGetParentListUrl from 'lumin-components/HeaderLumin/hooks/useGetParentListUrl';

import fileUtil from 'utils/file';

import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';
import { useEnableViewerNavigation } from 'features/ViewerNavigation';
import NavigationHeader from 'features/ViewerNavigation/components/NavigationHeader';

import { Routers } from 'constants/Routers';

import DocumentName from './components/DocumentName';
import FileStatus from './components/FileStatus';
import Logo from './components/Logo';

import * as Styled from './TitleBarLeftSection.styled';

const TitleBarLeftSection = ({
  isPreviewOriginalVersionMode,
  currentDocument,
  isLoadingDocument,
  isOffline,
  currentUser,
  closePreviewOriginalVersionMode,
  setToolbarValue,
}) => {
  const navigate = useNavigate();
  const backUrl = useGetParentListUrl();
  const filenameWithoutExtension = fileUtil.getFilenameWithoutExtension(currentDocument?.name);
  const { reloadDocument } = useContext(ViewerContext);
  const { enabledViewerNavigation } = useEnableViewerNavigation();
  const { isTemplateViewer } = useTemplateViewerMatch();

  const onBackButtonClick = async () => {
    if (!currentUser) {
      navigate(Routers.SIGNIN);
      return;
    }
    navigate(backUrl || '/documents');
  };

  const handleClick = () => {
    if (isOffline) {
      onBackButtonClick();
      return;
    }
    closePreviewOriginalVersionMode();
    setToolbarValue(LEFT_SIDE_BAR_VALUES.POPULAR.value);
    core.disableReadOnlyMode();
    reloadDocument();
  };

  const renderLeftContent = () => {
    if (isPreviewOriginalVersionMode) {
      return (
        <>
          <IconButton
            size="large"
            iconSize={24}
            icon="md_arrow_back"
            disabled={isLoadingDocument}
            onClick={handleClick}
          />
          <Styled.OriginalDocumentName>{filenameWithoutExtension}</Styled.OriginalDocumentName>
        </>
      );
    }
    return (
      <>
        {enabledViewerNavigation && <NavigationHeader />}
        {!enabledViewerNavigation && <Logo />}
        <DocumentName />
        {isTemplateViewer && (
          <Badge
            size="sm"
            styles={{
              root: {
                background: 'var(--kiwi-colors-support-pink-foreground-medium)',
                flexShrink: 0,
                color: 'var(--kiwi-colors-support-pink-foreground-lowest)',
              },
            }}
          >
            TEMPLATE
          </Badge>
        )}
        <FileStatus />
      </>
    );
  };
  return <Styled.LeftSection>{renderLeftContent()}</Styled.LeftSection>;
};

TitleBarLeftSection.propTypes = {
  isPreviewOriginalVersionMode: PropTypes.bool,
  currentDocument: PropTypes.object,
  isLoadingDocument: PropTypes.bool,
  isOffline: PropTypes.bool,
  currentUser: PropTypes.object,
  closePreviewOriginalVersionMode: PropTypes.func,
  setToolbarValue: PropTypes.func,
};

TitleBarLeftSection.defaultProps = {
  isPreviewOriginalVersionMode: false,
  currentDocument: {},
  isLoadingDocument: false,
  isOffline: false,
  currentUser: {},
  closePreviewOriginalVersionMode: () => {},
  setToolbarValue: () => {},
};

const mapStateToProps = (state) => ({
  isPreviewOriginalVersionMode: selectors.isPreviewOriginalVersionMode(state),
  currentDocument: selectors.getCurrentDocument(state),
  isLoadingDocument: selectors.isLoadingDocument(state),
  isOffline: selectors.isOffline(state),
  currentUser: selectors.getCurrentUser(state),
});
const mapDispatchToProps = (dispatch) => ({
  closePreviewOriginalVersionMode: () => dispatch(actions.closePreviewOriginalVersionMode()),
  setToolbarValue: (value) => dispatch(actions.setToolbarValue(value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TitleBarLeftSection);
