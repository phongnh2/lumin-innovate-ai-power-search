import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router';
import { ThemeProvider } from 'styled-components';

import CookieWarningContext from 'luminComponents/CookieWarningModal/Context';

import { useDiscardModal, useThemeMode, useFolderPathMatch, useHitDocStackModalForOrgMembers } from 'hooks';

import getOrgOfDoc from 'helpers/getOrgOfDoc';

import { useEnableInviteSharedUserModal } from 'features/CNC/hooks/useEnableInviteSharedUserModal';

import ShareModalContainer from './ShareModalContainer';

import * as Styled from './ShareModal.styled';

const ShareModalProvider = (props) => {
  const { onClose: onCloseProp, currentDocument, ...otherProps } = props;
  const themeMode = useThemeMode();
  const navigate = useNavigate();
  const { cookiesDisabled, setCookieModalVisible } = useContext(CookieWarningContext);
  const { onClose, setShowDiscardModal, setDiscardModalType, setShowFeedbackModal } = useDiscardModal({
    onConfirm: onCloseProp,
  });
  const isInFolderPage = useFolderPathMatch();
  const themeModeProvider = Styled.theme[themeMode];
  const orgOfDoc = getOrgOfDoc({ organizations: props.organizations, currentDocument });
  const hitDocStackModalSettings = useHitDocStackModalForOrgMembers({ orgOfDoc });
  const { enabled: enabledInviteSharedUserModal } = useEnableInviteSharedUserModal();

  return (
    <ThemeProvider theme={themeModeProvider}>
      <ShareModalContainer
        {...otherProps}
        navigate={navigate}
        currentDocument={currentDocument}
        isInFolderPage={isInFolderPage}
        setShowDiscardModal={setShowDiscardModal}
        onClose={onClose}
        hitDocStackModalSettings={hitDocStackModalSettings}
        cookiesDisabled={cookiesDisabled}
        setCookieModalVisible={setCookieModalVisible}
        orgOfDoc={orgOfDoc}
        enabledInviteSharedUserModal={enabledInviteSharedUserModal}
        setDiscardModalType={setDiscardModalType}
        setShowFeedbackModal={setShowFeedbackModal}
      />
    </ThemeProvider>
  );
};

ShareModalProvider.propTypes = {
  onClose: PropTypes.func.isRequired,
  currentDocument: PropTypes.object,
  organizations: PropTypes.object,
  setCurrentDocument: PropTypes.func,
};

ShareModalProvider.defaultProps = {
  currentDocument: {},
  organizations: {},
  setCurrentDocument: () => {},
};

export default ShareModalProvider;
