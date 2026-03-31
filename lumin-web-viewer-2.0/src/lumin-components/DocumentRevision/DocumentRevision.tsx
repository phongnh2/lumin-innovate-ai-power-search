import { Divider, ScrollArea } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import Modal from 'lumin-components/GeneralLayout/general-components/Modal';
import AppCircularLoading from 'luminComponents/AppCircularLoading';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import exportAnnotations from 'helpers/exportAnnotations';

import { useDocumentVersioningContext } from 'features/DocumentRevision/hooks/useDocumentVersioningContext';
import { useRestoreRevision } from 'features/DocumentRevision/hooks/useRestoreRevision';
import { IDocumentRevision } from 'features/DocumentRevision/interface';

import RestoreModal from './RestoreModal';
import RevisionItem from './RevisionItem';
import RevisionPlans from './RevisionPlans';

import styles from './DocumentRevision.module.scss';

const DocumentRevision = () => {
  const { t } = useTranslation();
  const {
    activeVersion,
    currentAnnotsRef,
    shouldShowRevisionPlans,
    canUseEnhancedFeatures,
    isFetchingList,
    documentRevisions,
  } = useDocumentVersioningContext();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const isAnnotationsLoaded = useSelector(selectors.getAnnotationsLoaded);
  const isLoadingDocument = useSelector(selectors.isLoadingDocument);
  const isOffline = useSelector(selectors.isOffline);

  useEffect(() => {
    const initCurrentAnnotations = async () => {
      currentAnnotsRef.current = await exportAnnotations();
    };

    initCurrentAnnotations().catch(() => {});
  }, []);

  const { restoringRevision, isModalOpen, isLoadingRestore, onClickRestore, onConfirmRestore, handleCloseModal } =
    useRestoreRevision({
      documentRevisions,
    });

  const renderVersionItems = () => {
    if (!documentRevisions || documentRevisions.length === 0) {
      return <RevisionItem isActive isCurrentVersion onlyCurrent />;
    }

    return documentRevisions.map((revision: IDocumentRevision, index: number) => (
      <RevisionItem
        key={revision._id}
        isActive={activeVersion === revision._id}
        revision={revision}
        isCurrentVersion={index === 0}
        onlyCurrent={documentRevisions.length === 1}
        disabled={isLoadingDocument || !isAnnotationsLoaded || isOffline}
        onRestore={({ event, revisionId }) => {
          event.stopPropagation();
          onClickRestore({ revisionId });
        }}
      />
    ));
  };

  return (
    <div className={styles.versionHistoryWrapper}>
      <div className={styles.versionHistoryHeader}>{t('viewer.revision.historyTitle')}</div>
      <Divider />

      <ScrollArea.AutoSize className={styles.versionHistoryList}>
        {isFetchingList ? (
          <AppCircularLoading />
        ) : (
          <>
            {renderVersionItems()}
            {shouldShowRevisionPlans && (
              <RevisionPlans currentDocument={currentDocument} canUseEnhancedFeatures={canUseEnhancedFeatures} />
            )}
          </>
        )}
      </ScrollArea.AutoSize>
      <Modal
        open={isModalOpen}
        onPrimaryClick={onConfirmRestore}
        onClose={handleCloseModal}
        onSecondaryClick={handleCloseModal}
        primaryText={t('viewer.restoreOriginalVersionModal.confirm')}
        secondaryText={t('action.cancel')}
        footerVariant={isLoadingRestore ? null : 'variant3'}
        size={isLoadingRestore ? 'small' : 'medium'}
      >
        <RestoreModal
          loading={isLoadingRestore}
          revisionModifiedTime={new Date(restoringRevision.modifiedTime).getTime()}
        />
      </Modal>
    </div>
  );
};

export default DocumentRevision;
