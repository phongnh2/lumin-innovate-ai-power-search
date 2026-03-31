import { Modal, Table } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from 'hooks';

import modalEvent, { ModalName } from 'utils/Factory/EventCollection/ModalEventCollection';
import fileUtil from 'utils/file';

import { ErrorModalType } from 'features/MultipleDownLoad/constants';
import {
  multipleDownloadSelectors,
  setErrorDocuments,
  setErrorModalOpened,
  setErrorTypes,
} from 'features/MultipleDownLoad/slice';

import styles from './DownloadFailedModal.module.scss';

const DownloadFailedModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const errorModal = useSelector(multipleDownloadSelectors.getErrorModal);
  const errorDocuments = useSelector(multipleDownloadSelectors.getErrorDocuments);
  const { opened: errorModalOpened, type: modalType } = errorModal;

  const onCloseErrorModal = () => {
    dispatch(setErrorModalOpened(false));
    dispatch(setErrorDocuments([]));
    dispatch(setErrorTypes([]));
  };

  useEffect(() => {
    if (errorModalOpened) {
      modalEvent.modalViewed({ modalName: ModalName.BULK_DOWNLOAD_ERRORS }).catch(() => {});
    }
  }, [errorModalOpened]);

  if (!errorModalOpened) return null;

  const modalContent = {
    [ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD]: {
      title: t('multipleDownload.errorModalTitle'),
      description: t('multipleDownload.errorModalDescription'),
    },
    [ErrorModalType.ALL_ITEMS_FAILED_TO_DOWNLOAD]: {
      title: t('multipleDownload.noneOfTheItemsCouldBeDownloaded'),
      description: t('multipleDownload.errorModalDescriptionAllItemsFailed'),
    },
  }[modalType];

  return (
    <Modal
      opened
      onClose={onCloseErrorModal}
      type="error"
      size="lg"
      title={modalContent.title}
      message={modalContent.description}
      onConfirm={onCloseErrorModal}
      confirmButtonProps={{
        title: t('common.ok'),
        className: styles.confirmButton,
      }}
    >
      <div className={styles.tableContainer}>
        <Table
          withTableBorder
          withColumnBorders
          withRowBorders
          stickyHeader
          layout="fixed"
          borderColor="var(--kiwi-colors-surface-outline-variant)"
          borderRadius="md"
          classNames={{
            td: styles.td,
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('common.name')}</Table.Th>
              <Table.Th>{t('multipleDownload.reason')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {errorDocuments.map((errorDoc) => (
              <Table.Tr key={errorDoc._id}>
                <Table.Td className={styles.fileName}>{fileUtil.getFilenameWithoutExtension(errorDoc.name)}</Table.Td>
                <Table.Td>{errorDoc.errorMessage}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </Modal>
  );
};

export default DownloadFailedModal;
