import React, { useState } from 'react';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';
import Modal from 'lumin-components/GeneralLayout/general-components/Modal';

import { useTranslation } from 'hooks';

import { lazyWithRetry } from 'utils/lazyWithRetry';

const ModalContent = lazyWithRetry(() => import(/* webpackPrefetch: true */ './ModalContent'));

const PopupLinkBtn = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const onBtnClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton
        dataElement="linkButton"
        icon="md_link"
        iconSize={24}
        onClick={onBtnClick}
        tooltipData={{ location: 'bottom', title: t('viewer.annotationPopup.hyperlink') }}
      />

      <Modal open={open} onClose={handleClose} footer={null} footerVariant={null}>
        <ModalContent closeModal={handleClose} />
      </Modal>
    </>
  );
};

export default PopupLinkBtn;
