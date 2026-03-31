import { Text, IconButton, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useTranslation } from 'hooks';

import { UploadUtils } from 'utils';

import styles from './UploadingPopperItem.module.scss';

type UploadingPopperItemActionsProps = {
  groupId: string;
  status: string;
  errorMessage: string;
};

const UploadingPopperItemActions = ({ groupId, status, errorMessage }: UploadingPopperItemActionsProps) => {
  const dispatch = useDispatch();

  const { t } = useTranslation();

  const onCancel = () => dispatch(actions.cancelUploadFile(groupId));

  const onRetry = () => dispatch(actions.retryUploadFile(groupId));

  const renderContent = useCallback(() => {
    switch (status) {
      case UploadUtils.UploadStatus.PROCESSING:
        return (
          <Text size="md" type="body" color="var(--kiwi-colors-custom-role-web-surface-var-subtext)">
            {t('common.compressing')}
          </Text>
        );
      case UploadUtils.UploadStatus.UPLOADING:
        return (
          <IconButton
            aria-description="cancel"
            size="md"
            icon="x-md"
            iconColor="var(--kiwi-colors-surface-on-surface)"
            onClick={onCancel}
          />
        );
      case UploadUtils.UploadStatus.COMPLETED:
        return (
          <Icomoon
            className={styles.icon}
            size="lg"
            type="circle-check-filled-lg"
            color="var(--kiwi-colors-semantic-success)"
          />
        );
      case UploadUtils.UploadStatus.ERROR:
        return (
          <>
            {(!errorMessage || errorMessage === t('errorMessage.makeSureDowloadPerms')) && (
              <IconButton
                aria-description="retry"
                size="md"
                icon="reload-md"
                iconColor="var(--kiwi-colors-surface-on-surface)"
                onClick={onRetry}
              />
            )}
            {errorMessage !== t('errorMessage.makeSureDowloadPerms') && (
              <Icomoon
                className={styles.icon}
                size="lg"
                type="alert-circle-filled-lg"
                color="var(--kiwi-colors-semantic-error)"
              />
            )}
          </>
        );
      default:
        return null;
    }
  }, [errorMessage, status, groupId]);

  return <div className={styles.fileActionsWrapper}>{renderContent()}</div>;
};

export default React.memo(UploadingPopperItemActions);
