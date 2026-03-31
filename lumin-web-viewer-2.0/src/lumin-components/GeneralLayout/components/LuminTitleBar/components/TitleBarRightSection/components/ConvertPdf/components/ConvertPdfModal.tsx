import { Modal } from 'lumin-ui/kiwi-ui';
import React from 'react';

import UnsupportFeatureImage from 'assets/images/unsupported-feature.png';

import { useTranslation } from 'hooks/useTranslation';

import { useConvertPdfStore } from '../hooks/useConvertPdfStore';
import { useHandleConvertPdf } from '../hooks/useHandleConvertPdf';

import styles from './ConvertPdfModal.module.scss';

export const ConvertPdfModal = () => {
  const { t } = useTranslation();
  const { isLoading, onConvertPdf } = useHandleConvertPdf();
  const { showModalConvertPdf, setShowModalConvertPdf } = useConvertPdfStore();

  const onCloseModal = () => {
    setShowModalConvertPdf(false);
  };

  return (
    <Modal
      data-cy="convert-pdf-modal"
      opened={showModalConvertPdf}
      classNames={{
        body: styles.message,
      }}
      titleCentered
      Image={<img src={UnsupportFeatureImage} alt="unsupported feature" style={{ height: 120 }} />}
      onClose={onCloseModal}
      size="sm"
      title={t('viewer.convertPDF.modal.title')}
      fullWidthButton
      confirmButtonProps={{
        title: t('viewer.convertPDF.modal.button'),
        loading: isLoading,
      }}
      onConfirm={onConvertPdf}
      message={t('viewer.convertPDF.modal.description')}
    />
  );
};
