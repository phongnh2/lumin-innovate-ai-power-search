import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import CircularLoading from 'luminComponents/CircularLoading';
import Dialog from 'luminComponents/Dialog';
import SvgElement from 'luminComponents/SvgElement';

import { useTranslation } from 'hooks';

import convertFileToLuminStorage from 'helpers/convertFileToLuminStorage';

import { googleDriveError } from 'utils';

import { ModalTypes } from 'constants/lumin-common';
import { ModalSize } from 'constants/styles/Modal';

const ConvertFileModal = (props) => {
  const [isFileConverting, setIsFileConverting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isOpen, onClose, themeMode } = props;

  const handleConvertFileError = (error) => {
    const { openViewerModal, setDocumentNotFound } = props;
    if (googleDriveError.isFileNotFound(error)) {
      setDocumentNotFound();
    } else {
      openViewerModal({
        title: t('viewer.buttonEditMode.titleConvertDoc'),
        message: error.message,
        type: ModalTypes.ERROR,
        confirmButtonTitle: t('common.gotIt'),
        onConfirm: () => {},
      });
    }
  };

  const handleConvertFile = async () => {
    try {
      setIsFileConverting(true);
      const { currentDocument } = props;
      await convertFileToLuminStorage({
        document: currentDocument,
        history: navigate,
        forceReload: true,
        t
      });
    } catch (error) {
      handleConvertFileError(error);
    } finally {
      setIsFileConverting(false);
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      width={ModalSize.SM}
      className={`theme-${themeMode}`}
    >
      <div className="Container__Icon">
        <SvgElement content="new-warning" width="48px" height="48px" />
      </div>
      <div className="Container__Content">
        <div className="Container__Content--title">{t('viewer.buttonEditMode.pageToolsAreNotAvailable')}</div>
        <div className="Container__Content--message">
          <p>{t('viewer.buttonEditMode.messagePageToolsAreNotAvailable')}</p>
        </div>
        <div className="Container__Content--button">
          <ButtonMaterial
            color={ButtonColor.TERTIARY}
            disabled={isFileConverting}
            onClick={onClose}
            fullWidth
          >
            <span>{t('common.cancel')}</span>
          </ButtonMaterial>
          <ButtonMaterial
            disabled={isFileConverting}
            className="primary"
            onClick={handleConvertFile}
            fullWidth
          >
            {isFileConverting && (
            <CircularLoading
              color="inherit"
              size={20}
              style={{ marginRight: 10, minWidth: 'unset' }}
            />
            )}
            <span>{t('common.convert')}</span>
          </ButtonMaterial>
        </div>
      </div>
    </Dialog>
  );
};

ConvertFileModal.defaultProps = {
  isOpen: false,
};

ConvertFileModal.propTypes = {
  isOpen: PropTypes.bool,
  themeMode: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  openViewerModal: PropTypes.func.isRequired,
  currentDocument: PropTypes.object.isRequired,

  setDocumentNotFound: PropTypes.func.isRequired,
};

export default ConvertFileModal;
