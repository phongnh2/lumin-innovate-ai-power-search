import PropTypes from 'prop-types';
import React from 'react';

import { LazyContentDialog } from 'lumin-components/Dialog';
import { DocumentInfoModal } from 'luminComponents/ReskinLayout/components/DocumentInfoModal';

import { useEnableWebReskin } from 'hooks';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { INFO_MODAL_TYPE } from 'constants/lumin-common';
import { ModalSize } from 'constants/styles/Modal';

import InfoModalSkeleton from './components/InfoModalSkeleton';

const InfoModal = lazyWithRetry(() => import('./InfoModal'));

const InfoModalContainer = ({
  open,
  closeDialog,
  modalType,
  currentTarget,
  onErrorCallback,
}) => {
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    return (
      <DocumentInfoModal
        open={open}
        onClose={closeDialog}
        modalType={modalType}
        currentTarget={currentTarget}
        onErrorCallback={onErrorCallback}
      />
    );
  }
  return (
    <LazyContentDialog
      open={open}
      onClose={closeDialog}
      width={ModalSize.SM}
      fallback={<InfoModalSkeleton />}
    >
      <InfoModal
        closeDialog={closeDialog}
        modalType={modalType}
        currentTarget={currentTarget}
        onErrorCallback={onErrorCallback}
      />
    </LazyContentDialog>
  );
};

InfoModalContainer.propTypes = {
  open: PropTypes.bool,
  closeDialog: PropTypes.func,
  onErrorCallback: PropTypes.func,
  modalType: PropTypes.oneOf(Object.values(INFO_MODAL_TYPE)),
  currentTarget: PropTypes.object,
};

InfoModalContainer.defaultProps = {
  open: false,
  closeDialog: () => {},
  onErrorCallback: undefined,
  modalType: INFO_MODAL_TYPE.DOCUMENT,
  currentTarget: {},
};

export default InfoModalContainer;
