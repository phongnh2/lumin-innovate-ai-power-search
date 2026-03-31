import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import selectors from 'selectors';
import actions from 'actions';
import Icomoon from 'lumin-components/Icomoon';
import { Colors } from 'constants/styles';
import { ModalTypes } from 'constants/lumin-common';
import { useTranslation } from 'hooks';
import * as Styled from './UploadingBoxHeader.styled';

const propTypes = {
  isCollapse: PropTypes.bool.isRequired,
  setCollapse: PropTypes.func.isRequired,
  numOfRemaining: PropTypes.number.isRequired,
  numOfFailed: PropTypes.number.isRequired,
  numOfCompleted: PropTypes.number.isRequired,
  openModal: PropTypes.func.isRequired,
  resetUploadingState: PropTypes.func.isRequired,
  cancelAllUploadingFiles: PropTypes.func.isRequired,
};

function UploadingBoxHeader({
  isCollapse,
  setCollapse,
  numOfRemaining,
  numOfFailed,
  numOfCompleted,
  openModal,
  resetUploadingState,
  cancelAllUploadingFiles,
}) {
  const { t } = useTranslation();

  const formatStatus = (number, postfix) => (number ? `${number}${postfix}` : '');
  const getHeader = () => {
    if (numOfRemaining > 0) {
      return t('uploadPopup.uploadingFile', { numOfRemaining });
    }

    const bothStatusValid = numOfFailed > 0 && numOfCompleted > 0;
    const middleText = !bothStatusValid ? t('uploadPopup.upload') : '';
    const successStatus = formatStatus(numOfCompleted, t('uploadPopup.textCompleted', { text: middleText }));
    const failStatus = formatStatus(numOfFailed, t('uploadPopup.textFailed', { text: middleText }));

    return [successStatus, failStatus].filter(Boolean).join(', ');
  };

  const cancelAll = () => {
    cancelAllUploadingFiles();
    resetUploadingState();
  };

  const onClose = () => {
    if (numOfRemaining > 0) {
      openModal({
        type: ModalTypes.WARNING,
        title: t('uploadPopup.cancelAllUploads'),
        message: t('uploadPopup.messageCancelAllUploads'),
        color: 'accent',
        confirmButtonTitle: t('uploadPopup.cancelUpload'),
        cancelButtonTitle: t('uploadPopup.continueUpload'),
        onConfirm: cancelAll,
        onCancel: () => {},
      });
    } else {
      cancelAll();
    }
  };

  return (
    <Styled.Header>
      <Styled.HeaderText>{getHeader()}</Styled.HeaderText>
      <Styled.CollapseButton
        isCollapse={isCollapse}
        onClick={() => setCollapse((prev) => !prev)}
      >
        <Icomoon className="arrow-up" size={14} color={Colors.WHITE} />
      </Styled.CollapseButton>
      <Styled.HeaderButton onClick={onClose}>
        <Icomoon className="cancel" size={14} color={Colors.WHITE} />
      </Styled.HeaderButton>
    </Styled.Header>
  );
}

UploadingBoxHeader.propTypes = propTypes;

const mapStateToProps = (state) => {
  const { completed, failed, uploading } = selectors.getUploadingDocumentsStat(state);
  return {
    numOfCompleted: completed,
    numOfFailed: failed,
    numOfRemaining: uploading,
  };
};

const mapDispatchToProps = (dispatch) => ({
  openModal: (settings) => dispatch(actions.openModal(settings)),
  resetUploadingState: () => dispatch(actions.resetUploadingState()),
  cancelAllUploadingFiles: () => dispatch(actions.cancelAllUploadingFiles()),
});

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(UploadingBoxHeader));
