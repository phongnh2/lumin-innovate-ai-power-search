import { useRef } from 'react';
import { useParams } from 'react-router';

import core from 'core';

import { cancelIdleCallback, IdleCallbackId, requestIdleCallback } from 'helpers/requestIdleCallback';

import lastViewDocumentHandler from '../base';

export const useLastViewDocumentHandler = () => {
  const { documentId } = useParams();
  const idleCallbackIdRef = useRef<IdleCallbackId | null>(null);
  const scrollToLastView = () => {
    const lastPage = lastViewDocumentHandler.getPageNumber({
      documentId,
      totalPage: core.getTotalPages(),
    });

    if (lastPage > 1) {
      core.setCurrentPage(lastPage);
    }
  };

  const clearIdleCallback = () => {
    if (idleCallbackIdRef.current) {
      cancelIdleCallback(idleCallbackIdRef.current);
    }
  };

  const saveLastView = () => {
    clearIdleCallback();
    idleCallbackIdRef.current = requestIdleCallback(() => {
      const currentPage = core.getCurrentPage();
      lastViewDocumentHandler.add(documentId, currentPage);
    });
  };

  return { scrollToLastView, saveLastView, clearIdleCallback };
};
