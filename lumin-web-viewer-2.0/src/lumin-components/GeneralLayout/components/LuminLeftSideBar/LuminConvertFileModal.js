import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';

import Modal from 'lumin-components/GeneralLayout/general-components/Modal';

import { useTranslation } from 'hooks/useTranslation';

import convertFileToLuminStorageNewUi from 'helpers/convertFileToLuminStorageNewUi';

import googleDriveError from 'utils/googleDriveError';

import { ModalTypes } from 'constants/lumin-common';

import { leftSideBarActions, leftSideBarSelectors } from './slices';

import * as Styled from './LuminLeftSideBar.styled';

const LuminConvertFileModal = (props) => {
  const [isFileConverting, setIsFileConverting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isLeftSidebarPopoverOpened = useSelector(leftSideBarSelectors.isLeftSidebarPopoverOpened);
  const { isOpen, onClose, currentDocument } = props;
  const confirmButtonTitle = t('common.gotIt');
  const handleConvertFileError = (error) => {
    const { openViewerModal, setDocumentNotFound } = props;
    if (googleDriveError.isFileNotFound(error)) {
      setDocumentNotFound();
    } else {
      openViewerModal({
        title: t('viewer.buttonEditMode.titleConvertDoc'),
        message: error.message,
        type: ModalTypes.ERROR,
        confirmButtonTitle,
        onConfirm: () => {},
      });
    }
  };

  const renderContentModalConvert = (sizeLimit, action = '') => (
    <span>
      {!action && <span>{currentDocument.name}</span>}
      {`${t(
        !action
          ? 'convertFileModal.documentOverUploadSizeOfPremiumUser'
          : 'convertFileModal.documentOverUploadSizeOfFreeUser',
        {
          sizeLimit,
        }
      )} ${
        action
          ? t('convertFileModal.upgradeMessage', {
              action,
            })
          : ''
      }`}
    </span>
  );

  const handleConvertFile = async () => {
    try {
      setIsFileConverting(true);
      await convertFileToLuminStorageNewUi({
        document: currentDocument,
        history: navigate,
        forceReload: true,
        t,
        renderContentModalConvert,
      });
    } catch (error) {
      handleConvertFileError(error);
    } finally {
      setIsFileConverting(false);
      onClose();
    }
  };

  const onCloseModal = (_event, reason) => {
    if (isFileConverting && reason === 'backdropClick') {
      return;
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen && isLeftSidebarPopoverOpened) {
      dispatch(leftSideBarActions.setIsLeftSidebarPopoverOpened(false));
    }
  }, [dispatch, isOpen, isLeftSidebarPopoverOpened]);

  return (
    <Modal
      disablePortal
      open={isOpen}
      onPrimaryClick={handleConvertFile}
      onClose={onCloseModal}
      onSecondaryClick={onClose}
      primaryText={t('common.convert')}
      secondaryText={t('action.cancel')}
      footerVariant="variant3"
      size="small"
      footer={
        <Styled.Footer>
          <Styled.SecondaryButton variant="text" size="lg" disabled={isFileConverting} onClick={onClose}>
            {t('action.cancel')}
          </Styled.SecondaryButton>
          <Button
            loading={isFileConverting}
            variant="tonal"
            size="lg"
            disabled={isFileConverting}
            onClick={handleConvertFile}
          >
            {t('common.convert')}
          </Button>
        </Styled.Footer>
      }
      title={t('viewer.buttonEditMode.pageToolsAreNotAvailable')}
    >
      {t('viewer.buttonEditMode.messagePageToolsAreNotAvailable')}
    </Modal>
  );
};

LuminConvertFileModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  openViewerModal: PropTypes.func.isRequired,
  currentDocument: PropTypes.object.isRequired,
  setDocumentNotFound: PropTypes.func.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  openViewerModal: (modalSettings) => dispatch(actions.openViewerModal(modalSettings)),
  setDocumentNotFound: () => dispatch(actions.setDocumentNotFound()),
});

export default connect(mapStateToProps, mapDispatchToProps)(LuminConvertFileModal);
