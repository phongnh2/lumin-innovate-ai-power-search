import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import v4 from 'uuid/v4';

import core from 'core';
import selectors from 'selectors';

import useLatestRef from 'hooks/useLatestRef';

import { isSyncableFile } from 'helpers/autoSync';

import { AUTO_SYNC_CHANGE_TYPE } from 'constants/autoSyncConstant';
import { TOOLS_NAME } from 'constants/toolsName';

export default function usePagesUpdated({
  currentDocument,
  setQueue,
  isPageEditModeRef,
  handleSyncFile,
  isInContentEditModeRef,
  isUsingPageToolsWithAIRef,
}) {
  const isLeftPanelOpen = useSelector(selectors.isLeftPanelOpen);
  const isLeftPanelOpenRef = useLatestRef(isLeftPanelOpen);
  const getActionId = (id) => {
    if (isInContentEditModeRef.current) {
      return `${AUTO_SYNC_CHANGE_TYPE.EDIT_PDF}:${id}`;
    }
    const toolName = core.getToolMode().name;
    if (toolName === TOOLS_NAME.REDACTION) {
      return `${AUTO_SYNC_CHANGE_TYPE.REDACTION}:${id}`;
    }
    return `${AUTO_SYNC_CHANGE_TYPE.CONTENT_CHANGE}:${id}`;
  };

  const onPagesUpdated = (changes) => {
    const totalPages = core.getTotalPages();
    if (changes.contentChanged.length === totalPages && changes.source === 'refresh') {
      return;
    }
    const toolName = core.getToolMode().name;
    const id = v4();
    const actionId = getActionId(id);
    const hasContentChangedInEditMode =
      core.getContentEditManager().isInContentEditMode() && changes.contentChanged.length;
    const hasContentChangedInRedactionMode = toolName === TOOLS_NAME.REDACTION && changes.contentChanged.length;

    const shouldAddToQueue =
      hasContentChangedInEditMode ||
      isLeftPanelOpenRef.current ||
      isPageEditModeRef.current ||
      isUsingPageToolsWithAIRef.current ||
      hasContentChangedInRedactionMode;

    if (shouldAddToQueue) {
      setQueue((queue) => [...queue, actionId]);
    }

    if (hasContentChangedInRedactionMode) {
      handleSyncFile(actionId);
    }
  };

  const startOnPagesUpdated = () => {
    core.addEventListener('pagesUpdated', onPagesUpdated);
  };

  useEffect(() => {
    if (!isSyncableFile(currentDocument)) {
      return undefined;
    }
    core.docViewer.addEventListener('documentViewerLoaded', startOnPagesUpdated, {
      once: true,
    });
    return () => {
      core.docViewer.removeEventListener('documentViewerLoaded', startOnPagesUpdated);
      core.removeEventListener('pagesUpdated', onPagesUpdated);
    };
  }, [currentDocument.service]);
}
