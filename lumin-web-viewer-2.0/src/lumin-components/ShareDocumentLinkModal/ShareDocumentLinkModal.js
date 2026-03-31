import PropTypes from 'prop-types';
import React from 'react';
import { useNavigate } from 'react-router';

import ModalSkeleton from 'lumin-components/CommonSkeleton/ShareModal.skeleton';
import { LazyContentDialog } from 'lumin-components/Dialog';
import ShareSettingModal from 'lumin-components/ShareSettingModal';

import { useUrlSearchParams } from 'hooks';

import { ModalSize } from 'constants/styles/Modal';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import * as Styled from './ShareDocumentLinkModal.styled';

const ShareDocumentLinkModal = ({
  currentDocument,
  handleClose: handleCloseProp,
  updateDocument,
  openHitDocStackModal,
  refetchDocument,
  isOpen,
  canUpdateShareSetting,
}) => {
  const customClasses = Styled.useModalStyles();
  const navigate = useNavigate();
  const searchParams = useUrlSearchParams();
  const handleClose = () => {
    handleCloseProp();
    searchParams.delete(UrlSearchParam.OPEN_MODAL_FROM);
    navigate({
      search: searchParams.toString(),
    }, { replace: true });
  };
  return (
    <LazyContentDialog
      classes={customClasses}
      open={isOpen}
      onClose={handleClose}
      width={ModalSize.MD}
      fallback={<ModalSkeleton />}
    >
      <ShareSettingModal
        currentDocument={currentDocument}
        shareSetting={currentDocument.shareSetting}
        handleClose={handleClose}
        refetchDocument={refetchDocument}
        updateDocument={updateDocument}
        openHitDocStackModal={openHitDocStackModal}
        isShareLinkModal
        canUpdateShareSetting={canUpdateShareSetting}
      />
    </LazyContentDialog>
  );
};

ShareDocumentLinkModal.propTypes = {
  currentDocument: PropTypes.object,
  handleClose: PropTypes.func.isRequired,
  updateDocument: PropTypes.func,
  openHitDocStackModal: PropTypes.func,
  refetchDocument: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  canUpdateShareSetting: PropTypes.bool,
};

ShareDocumentLinkModal.defaultProps = {
  currentDocument: {},
  updateDocument: () => {},
  openHitDocStackModal: () => {},
  isOpen: false,
  canUpdateShareSetting: false,
};

export default ShareDocumentLinkModal;
