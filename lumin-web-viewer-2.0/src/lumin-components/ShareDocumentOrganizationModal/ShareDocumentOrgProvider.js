import PropTypes from 'prop-types';
import React from 'react';
import { ThemeProvider } from 'styled-components';

import { LazyContentDialog } from 'lumin-components/Dialog';
import * as ShareModalStyled from 'lumin-components/ShareModal/ShareModal.styled';

import { useThemeMode, useDiscardModal, useEnableWebReskin } from 'hooks';

import { ModalSize } from 'constants/styles/Modal';

import ShareDocumentOrganizationModal from './ShareDocumentOrganizationModal';

import * as Styled from './ShareDocumentOrganizationModal.styled';

const ShareDocumentOrgProvider = (props) => {
  const { onClose: onCloseProp, ...otherProps } = props;
  const themeMode = useThemeMode();
  const customClasses = Styled.useModalStyles();
  const themeModeProvider = ShareModalStyled.theme[themeMode];
  const { onClose, setShowDiscardModal, setDiscardModalType } = useDiscardModal({ onConfirm: onCloseProp });
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    return (
      <LazyContentDialog
        opened
        onClose={onClose}
        centered
        size="md"
        backgroundColor="none"
        shadow="none"
        padding="none"
        style={{ color: 'var(--kiwi-colors-surface-on-surface)' }}
        fallback={null}
        isReskin
      >
        <ShareDocumentOrganizationModal
          {...otherProps}
          setShowDiscardModal={setShowDiscardModal}
          onClose={onClose}
          setDiscardModalType={setDiscardModalType}
        />
      </LazyContentDialog>
    );
  }

  return (
    <ThemeProvider theme={themeModeProvider}>
      <LazyContentDialog
        onClose={onClose}
        open
        classes={customClasses}
        scroll="body"
        /*
          [LP-8479]
          Add "notranslate" class to this modal to prevent google translate
          To get more details about this issue, please follow these:
          - The issue: https://github.com/facebook/react/issues/11538
          - The solution: https://stackoverflow.com/questions/12238396/how-to-disable-google-translate-from-html-in-chrome/12238414#12238414
        */
        className={`theme-${themeMode} notranslate`}
        fallback={null}
        width={ModalSize.MDX}
      >
        <ShareDocumentOrganizationModal
          {...otherProps}
          setShowDiscardModal={setShowDiscardModal}
          onClose={onClose}
          setDiscardModalType={setDiscardModalType}
        />
      </LazyContentDialog>
    </ThemeProvider>
  );
};

ShareDocumentOrgProvider.propTypes = {
  onClose: PropTypes.func.isRequired,
};

ShareDocumentOrgProvider.defaultProps = {};

export default ShareDocumentOrgProvider;
