import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';
import { RootState } from 'store';

import { UploadUtils } from 'utils';

import { DOCUMENT_KIND } from 'constants/documentConstants';

import UploadingPopperItemActions from './UploadingPopperItemActions';
import UploadingPopperItemContent from './UploadingPopperItemContent';
import UploadingPopperItemThumbnail from './UploadingPopperItemThumbnail';

import styles from './UploadingPopperItem.module.scss';

type UploadingPopperItemProps = {
  groupId: string;
};

const UploadingPopperItem = ({ groupId }: UploadingPopperItemProps) => {
  const { thumbnail, status, document, errorMessage } = useSelector((state: RootState) =>
    selectors.getUploadingDocumentByGroupId(state, groupId, ['thumbnail', 'status', 'document', 'errorMessage'])
  );

  const canOpenDocument = useMemo(
    () => Boolean(document?._id) && status === UploadUtils.UploadStatus.COMPLETED,
    [document?._id, status]
  );

  const handleOpenUploadedDocInNewTab = () => {
    if (!canOpenDocument) {
      return;
    }
    if (document.kind === DOCUMENT_KIND.TEMPLATE) {
      window.open(`/template/${document._id}`, '_blank');
      return;
    }
    window.open(`/viewer/${document._id}`, '_blank');
  };

  return (
    <div
      role="presentation"
      className={styles.container}
      data-clickable={canOpenDocument}
      onClick={handleOpenUploadedDocInNewTab}
    >
      <UploadingPopperItemThumbnail thumbnail={thumbnail} />
      <UploadingPopperItemContent groupId={groupId} canOpenDocument={canOpenDocument} />
      <UploadingPopperItemActions groupId={groupId} status={status} errorMessage={errorMessage} />
    </div>
  );
};

export default React.memo(UploadingPopperItem);
