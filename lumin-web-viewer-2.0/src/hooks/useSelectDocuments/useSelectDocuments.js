import { differenceWith, find } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useEvent } from 'react-use';

import selectors from 'selectors';

import useEnableWebReskin from 'hooks/useEnableWebReskin';

import { DOCUMENT_OFFLINE_STATUS } from 'constants/documentConstants';
import { CHECKBOX_TYPE } from 'constants/lumin-common';

import ArrowDownHandler from './helpers/arrowDownHandler';
import ArrowUpHandler from './helpers/arrowUpHandler';
import getCursorPosition from './helpers/getCursorPosition';
import preventUseShortKey from './helpers/preventUseShortKey';

const isOfflineDocItem = (item) => item.offlineStatus === DOCUMENT_OFFLINE_STATUS.AVAILABLE;

export function useSelectDocuments({
  setRemoveDocList,
  documentList,
  selectedDocList,
}) {
  const lastSelectedDocIdRef = useRef(null);
  const temporarySelectDocsRef = useRef([]);
  const shiftHoldingRef = useRef(false);
  const documentListRef = useRef(documentList);
  const isOffline = useSelector(selectors.isOffline);
  const activeDocumentList = useMemo(
    () => (isOffline ? documentList.filter(isOfflineDocItem) : documentList),
    [documentList, isOffline]
  );
  const activeDocumentListRef = useRef(activeDocumentList);

  const { isEnableReskin } = useEnableWebReskin();

  const handleShiftPress = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      return;
    }

    if (e.type === 'keydown') {
      shiftHoldingRef.current = e.key === 'Shift';
    } else if (e.type === 'keyup' && e.key === 'Shift') {
      shiftHoldingRef.current = false;
    }
  };

  const handlePressEsc = (e) => {
    if (e.key !== 'Escape' || !selectedDocList.length || preventUseShortKey()) {
      return;
    }
    setRemoveDocList({
      type: CHECKBOX_TYPE.DELETE,
    });
  };

  const handleSelectAll = (e) => {
    if (!((e.metaKey || e.ctrlKey) && e.key === 'a') || preventUseShortKey()) {
      return;
    }
    e.preventDefault();
    setRemoveDocList({
      data: activeDocumentListRef.current, type: CHECKBOX_TYPE.ALL,
    });
  };

  const handleSelectDocuments = ({
    currentDocument,
    lastSelectedDocId,
    checkboxType,
  }) => {
    const holdingShift = shiftHoldingRef.current;
    if (holdingShift && lastSelectedDocId) {
      // determined start/end position
      const { start, end } = getCursorPosition({
        documentList: documentListRef.current,
        currentDocumentId: currentDocument._id,
        lastSelectedDocId,
      });

      // there are 2 documentId. we need to find document between them
      const selectedDocuments = activeDocumentListRef.current.slice(start, end + 1);

      // from now: determined checkboxType by
      // If: currentDocument in temporarySelectDocs => Deselect others and keep from lastSelectedDocId to currentDocument
      const temporarySelectDocs = temporarySelectDocsRef.current;
      let computedCheckboxType = checkboxType;
      if (temporarySelectDocs.length) {
        const deselectList = differenceWith(
          temporarySelectDocs,
          selectedDocuments,
          (origin, peer) => origin._id === peer._id
        );
        const isBetween = find(temporarySelectDocs, { _id: currentDocument._id });
        if (isBetween) {
          computedCheckboxType = CHECKBOX_TYPE.SELECT;
        }
        setRemoveDocList({
          data: deselectList,
          type: CHECKBOX_TYPE.DESELECT,
        });
      }
      setRemoveDocList({
        data: selectedDocuments,
        type: computedCheckboxType,
      });
      // Update temporary selected docs
      temporarySelectDocsRef.current = selectedDocuments;
    }
    if (!holdingShift) {
      temporarySelectDocsRef.current = [];
      setRemoveDocList({ data: [currentDocument], type: checkboxType });
    }
  };

  const getArrowHandlerParams = () => ({
    tempSelected: temporarySelectDocsRef.current,
    lastSelectedDocId: lastSelectedDocIdRef.current,
    handleSelectDocuments,
    documentList: documentListRef.current,
  });

  const handlePressArrow = (e) => {
    if (!selectedDocList.length || preventUseShortKey() || !e.shiftKey) {
      return;
    }
    switch (e.key) {
      case 'ArrowDown': {
        const arrowDownHandler = new ArrowDownHandler(getArrowHandlerParams());
        arrowDownHandler.exec();
        break;
      }
      case 'ArrowUp': {
        const arrowUpHandler = new ArrowUpHandler(getArrowHandlerParams());
        arrowUpHandler.exec();
        break;
      }
      default:
        break;
    }
  };

  useEvent(
    'keydown',
    isEnableReskin
      ? undefined
      : (e) => {
          handleShiftPress(e);
          handleSelectAll(e);
          handlePressEsc(e);
          handlePressArrow(e);
        }
  );

  useEvent(
    'keyup',
    isEnableReskin
      ? undefined
      : (e) => {
          handleShiftPress(e);
        }
  );

  useEffect(() => {
    documentListRef.current = documentList;
  }, [documentList]);

  useEffect(() => {
    activeDocumentListRef.current = activeDocumentList;
  }, [activeDocumentList]);

  return {
    lastSelectedDocIdRef,
    handleSelectDocuments,
    shiftHoldingRef,
  };
}
