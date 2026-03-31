import { ArrowsClockwiseIcon } from '@luminpdf/icons/dist/csr/ArrowsClockwise';
import { CloudSlashIcon } from '@luminpdf/icons/dist/csr/CloudSlash';
import { GlobeSimpleXIcon } from '@luminpdf/icons/dist/csr/GlobeSimpleX';
import { PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import Icomoon from 'lumin-components/Icomoon';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useSocketStatus } from 'hooks/useSocketStatus';
import { useTranslation } from 'hooks/useTranslation';

import dateUtil from 'utils/date';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { documentSyncSelectors } from 'features/Document/slices';
import { useOpenRevisionMode } from 'features/DocumentRevision/hooks/useOpenRevisionMode';

import { TRANSLATED_DOCUMENT_STATUS } from 'constants/documentConstants';
import { SAVE_OPERATION_STATUS } from 'constants/saveOperationConstants';

import styles from './FileStatus.module.scss';

const FileStatus = () => {
  const { t } = useTranslation();
  const primaryOperation = useShallowSelector(documentSyncSelectors.getPrimarySaveOperation);
  const { isDisconnected } = useSocketStatus();

  const {
    isOffline,
    isTempEditMode,
    currentDocument,
    enabledRevision,
    shouldShowPreviewRevisionLink,
    onOpenDocumentRevisionMode,
  } = useOpenRevisionMode();

  const getSaveStatusIcon = () => {
    switch (primaryOperation?.status) {
      case SAVE_OPERATION_STATUS.SAVING:
        return 'sm_loading';
      case SAVE_OPERATION_STATUS.SUCCESS:
        return 'sm_status-success';
      case SAVE_OPERATION_STATUS.ERROR:
        return 'sm_status-error';
      default:
        return 'sm_time';
    }
  };

  const getSaveStatus = (): string => {
    if (Object.values(SAVE_OPERATION_STATUS).includes(primaryOperation?.status)) {
      return t(TRANSLATED_DOCUMENT_STATUS[primaryOperation?.status]);
    }
    if (!primaryOperation?.status) {
      const lastModifyTimestamp = Number(currentDocument.lastModify);
      const isValidTimestamp = lastModifyTimestamp > 0;

      const timeToUse = isValidTimestamp ? lastModifyTimestamp : Date.now();
      const lastModify = dateUtil.convertToRelativeTime(timeToUse, t);

      return t('generalLayout.status.edited', { lastModify });
    }
    return primaryOperation?.message || '';
  };

  const renderSaveStatus = () => {
    if (primaryOperation?.status === SAVE_OPERATION_STATUS.SAVING) {
      return <ArrowsClockwiseIcon size={16} className={styles.rotateIcon} />;
    }
    return <Icomoon className={getSaveStatusIcon()} size={16} />;
  };

  if (isOffline || isDisconnected) {
    return (
      <PlainTooltip
        disabled={!isDisconnected}
        content={t('viewer.disconnected.message', "Your work will be saved to Lumin as soon as you're back online.")}
      >
        <div className={styles.fileStatus} data-cy="file_status" data-allow-hover-state={isDisconnected}>
          {isOffline && (
            <>
              <GlobeSimpleXIcon size={16} />
              <span>{t('viewer.header.workingOffline', 'Working offline')}</span>
            </>
          )}
          {isDisconnected && (
            <>
              <CloudSlashIcon size={16} />
              <span>{t('viewer.header.unsavedChanges', 'Unsaved changes')}</span>
            </>
          )}
        </div>
      </PlainTooltip>
    );
  }

  if (isTempEditMode) {
    return null;
  }

  return (
    <div className={styles.fileStatus} data-allow-hover-state={shouldShowPreviewRevisionLink} data-cy="file_status">
      {renderSaveStatus()}
      {shouldShowPreviewRevisionLink ? (
        <PlainTooltip content={t(enabledRevision ? 'viewer.viewRevisionTooltip' : 'viewer.viewOriginalVersionTooltip')}>
          <div
            role="button"
            tabIndex={0}
            className={styles.restoreOriginalLink}
            onClick={onOpenDocumentRevisionMode}
            data-lumin-btn-name={ButtonName.VIEW_ORIGINAL_VERSION}
          >
            {getSaveStatus()}
          </div>
        </PlainTooltip>
      ) : (
        <span>{getSaveStatus()}</span>
      )}
    </div>
  );
};

export default FileStatus;
