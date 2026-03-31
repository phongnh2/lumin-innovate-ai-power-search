import { Text, LinearProgress } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';
import { RootState } from 'store';

import { UploadUtils } from 'utils';

import { ErrorCode } from 'constants/errorCode';

import { ReachDocStackLimit } from '../ReachDocStackLimit';

import styles from './UploadingPopperItem.module.scss';

type UploadingPopperItemContentProps = {
  groupId: string;
  canOpenDocument: boolean;
};

const UploadingPopperItemContent = ({ groupId, canOpenDocument }: UploadingPopperItemContentProps) => {
  const { status, fileData, progress, errorMessage, errorCode, organization } = useSelector((state: RootState) =>
    selectors.getUploadingDocumentByGroupId(state, groupId, [
      'status',
      'fileData',
      'progress',
      'errorMessage',
      'errorCode',
      'organization',
    ])
  );

  const contentByErrorCode = useMemo(
    () =>
      ({
        [ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT]: organization && (
          <ReachDocStackLimit content={errorMessage} organization={organization} />
        ),
      }[errorCode]),
    [errorCode, errorMessage, organization]
  );

  const renderContent = useCallback(() => {
    switch (status) {
      case UploadUtils.UploadStatus.UPLOADING: {
        return (
          <LinearProgress
            w="100%"
            value={progress}
            transitionDuration={1000}
            color="var(--kiwi-colors-custom-role-web-surface-var-subtext)"
            backgroundColor="var(--kiwi-colors-surface-surface-container-highest)"
          />
        );
      }
      case UploadUtils.UploadStatus.ERROR: {
        if (!errorMessage) {
          return null;
        }
        return (
          contentByErrorCode || (
            <Text color="var(--kiwi-colors-semantic-error)" size="sm" type="body">
              {errorMessage}
            </Text>
          )
        );
      }
      default:
        return null;
    }
  }, [contentByErrorCode, errorMessage, status, progress]);

  return (
    <div className={styles.fileContentWrapper} data-uploading={status === UploadUtils.UploadStatus.UPLOADING}>
      <Text
        className={styles.fileName}
        data-clickable={canOpenDocument}
        color="var(--kiwi-colors-surface-on-surface)"
        type="label"
        size="md"
      >
        {fileData.file.name}
      </Text>
      {renderContent()}
    </div>
  );
};

export default React.memo(UploadingPopperItemContent);
