import { Modal, Text, Skeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useGetFieldModal } from 'luminComponents/InfoModal/hooks/useGetFieldModal';

import { useTranslation } from 'hooks';

import { IDocumentBase } from 'interfaces/document/document.interface';

import styles from './DocumentInfoModal.module.scss';

interface DocumentInfoModalProps {
  open: boolean;
  onClose: () => void;
  modalType: string;
  currentTarget: IDocumentBase;
  onErrorCallback: (error: string) => void;
}

const DocumentInfoModal = ({ open, onClose, modalType, currentTarget, onErrorCallback }: DocumentInfoModalProps) => {
  const { t } = useTranslation();
  const { modalFields, isLoading } = useGetFieldModal({
    modalType,
    currentTarget,
    onErrorCallback,
  }) as { modalFields: { title: string; data: { field: string; value: string }[][] }; isLoading: boolean };

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          {[Array.from(Array(3)), Array.from(Array(5))].map((section, index) => (
            <div className={styles.blockWrapper} key={index}>
              {section.map((_, i) => (
                <div key={i} className={styles.itemWrapper}>
                  <Skeleton width="100px" height="20px" />
                  <Skeleton width="120px" height="20px" />
                </div>
              ))}
            </div>
          ))}
        </>
      );
    }
    return modalFields.data?.map((section, index) => (
      <div className={styles.blockWrapper} key={index}>
        {section.map((item, i) => (
          <div key={i} className={styles.itemWrapper}>
            <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
              {item.field}
            </Text>
            <Text
              type="body"
              size="md"
              color="var(--kiwi-colors-surface-on-surface)"
              component="div"
              className={styles.textValue}
              style={{ wordBreak: 'break-word' }}
            >
              {item.value}
            </Text>
          </div>
        ))}
      </div>
    ));
  };

  return (
    <Modal
      title={modalFields.title}
      type="info"
      opened={open}
      onClose={onClose}
      centered
      onConfirm={onClose}
      confirmButtonProps={{ title: t('action.close') }}
    >
      {renderContent()}
    </Modal>
  );
};

export default DocumentInfoModal;
