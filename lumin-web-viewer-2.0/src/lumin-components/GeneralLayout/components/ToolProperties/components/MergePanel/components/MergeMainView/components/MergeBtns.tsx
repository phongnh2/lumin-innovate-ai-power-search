import { Button, Modal } from 'lumin-ui/kiwi-ui';
import React, { useContext, useState } from 'react';

import {
  FileInfo,
  getTotalMergeSize,
  isThereAFileWithError,
  hasLoadingFile,
} from '@new-ui/components/ToolProperties/components/MergePanel/utils/utils';

import selectors from 'selectors';

import PopperLimitContent from 'luminComponents/PopperLimitContent';

import { useMergeHandler } from 'hooks/useMergeHandler';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { eventTracking } from 'utils';

import { MAX_SIZE_MERGE_DOCUMENT } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';
import { TOOLS_NAME } from 'constants/toolsName';

import { MEGABYTES_TO_BYTES, MERGE_EVENTS, MERGE_EVENTS_PURPOSE } from '../../../constants';
import { MergePanelContext } from '../../../MergePanel';
import { MergeMainViewContext } from '../MergeMainView';
import * as Styled from '../MergeMainView.styled';

type MergeMainViewContextType = {
  pageInsertErrorMessage: string;
  pagePositionErrorMessage: string;
  loading: boolean;
  setPagePositionErrorMessage: (msg: string) => void;
  calculateRange: () => number[];
  insertBeforeOrAfter: string;
  shouldCancelMerge: React.MutableRefObject<boolean>;
  allPages: boolean;
  pagePosition: number;
  filesInfo: FileInfo[];
  isDragActive: boolean;
};

const MergeBtns = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const {
    pageInsertErrorMessage,
    pagePositionErrorMessage,
    setPagePositionErrorMessage,
    calculateRange,
    insertBeforeOrAfter,
    shouldCancelMerge,
    allPages,
    pagePosition,
    filesInfo,
    isDragActive,
  } = useContext(MergeMainViewContext) as MergeMainViewContextType;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featureValidation, setFeatureValidation] = useState<string | null>(null);
  const { resetMergePanelState } = useContext(MergePanelContext) as { resetMergePanelState: () => void };
  const currentMergeSize = getTotalMergeSize(filesInfo, currentDocument);
  const { t } = useTranslation();
  const _isThereAFileWithError = isThereAFileWithError(filesInfo);
  const loading = hasLoadingFile(filesInfo);
  const totalFileSizeOverLimit = currentMergeSize > MAX_SIZE_MERGE_DOCUMENT.PAID * MEGABYTES_TO_BYTES;

  const { handleMerge, isMerging, lockDocumentWhileMerging, unlockDocumentAfterMerging } = useMergeHandler();

  const isDisableMerge =
    Boolean(pageInsertErrorMessage) ||
    Boolean(pagePositionErrorMessage) ||
    _isThereAFileWithError ||
    loading ||
    totalFileSizeOverLimit ||
    isDragActive;

  const fireCancelEvent = () => {
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: MERGE_EVENTS.CANCEL_MERGE,
      elementPurpose: MERGE_EVENTS_PURPOSE[MERGE_EVENTS.CANCEL_MERGE],
    }).catch(() => {});
  };

  const onMergeClick = async () => {
    try {
      lockDocumentWhileMerging();
      const result = await handleMerge({
        filesInfo,
        pagePosition,
        insertBeforeOrAfter,
        allPages,
        calculateRange,
        shouldCancelMerge,
        setPagePositionErrorMessage,
        currentMergeSize,
      });

      if (result.shouldShowModal) {
        setFeatureValidation(result.featureValidation);
        setIsModalOpen(true);
      }
    } finally {
      unlockDocumentAfterMerging();
    }
  };

  const onCancelMerge = () => {
    resetMergePanelState();
    fireCancelEvent();
  };

  return (
    <>
      {!!filesInfo.length && (
        <Styled.MergeBtnsWrapper>
          <Button size="lg" disabled={isDisableMerge} loading={isMerging} onClick={onMergeClick} variant="filled">
            {t('viewer.leftPanelEditMode.merge')}
          </Button>

          <Button size="lg" variant="text" onClick={onCancelMerge} disabled={loading || isMerging || isDragActive}>
            {t('action.cancel')}
          </Button>
        </Styled.MergeBtnsWrapper>
      )}
      <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <PopperLimitContent
          type={featureValidation}
          currentDocument={currentDocument}
          toolName={TOOLS_NAME.MERGE_PAGE}
          eventName={PremiumToolsPopOverEvent.MergePage}
        />
      </Modal>
    </>
  );
};

export default MergeBtns;
