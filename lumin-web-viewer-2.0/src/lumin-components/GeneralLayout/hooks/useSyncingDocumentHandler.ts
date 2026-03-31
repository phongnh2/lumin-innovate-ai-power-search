import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { ToolName } from 'core/type';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import useFinishRendering from 'luminComponents/DocumentContainer/hooks/useFinishRendering';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import messageEvent from 'utils/Factory/EventCollection/MessageEventCollection';

import { documentSyncActions } from 'features/Document/slices';

import { TOOLS_NAME } from 'constants/toolsName';

export const useSyncingDocumentHandler = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { renderFinished } = useFinishRendering();
  const dispatch = useDispatch();

  const { t } = useTranslation();
  const previousToolModeRef = useRef<Core.Tools.Tool | null>(null);
  const { status, _id: documentId } = currentDocument || {};

  const documentHasFetched = !!documentId;

  const handleLockDocumentWhileSyncing = useCallback(
    ({ isSyncing }: { isSyncing: boolean }) => {
      previousToolModeRef.current = core.getToolMode();
      core.enableReadOnlyMode();
      core.docViewer.enableReadOnlyMode();
      core.setToolMode(TOOLS_NAME.EDIT as ToolName);
      messageEvent
        .messageViewed({
          messageName: 'waitForChangesToSync',
          messagePurpose: 'Warning toast to restrict editing while syncing changes',
        })
        .catch(() => {
          /* DO NOTHING */
        });

      dispatch(documentSyncActions.setIsSyncing({ isSyncing, increaseVersion: true }));
      if (renderFinished && isSyncing) {
        dispatch(actions.setBackDropMessage(t('viewer.documentIsUpdating')));
      }
    },
    [dispatch, renderFinished, t]
  );

  const handleUnlockDocument = useCallback(() => {
    core.disableReadOnlyMode();
    core.docViewer.disableReadOnlyMode();
    if (previousToolModeRef.current.name) {
      core.setToolMode(previousToolModeRef.current.name as ToolName);
    }
  }, []);

  useEffect(() => {
    if (!documentHasFetched) {
      return;
    }
    if (status?.isSyncing) {
      handleLockDocumentWhileSyncing({
        isSyncing: status?.isSyncing,
      });
      return;
    }
    if (previousToolModeRef.current) {
      handleUnlockDocument();
    }
  }, [documentHasFetched, status?.isSyncing, handleLockDocumentWhileSyncing, handleUnlockDocument]);
};
