import { debounce } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';

import core from 'core';

import useFinishRendering from '../../hooks/useFinishRendering';

const UPDATE_SCROLLVIEW_DEBOUNCED_TIME = 600;

const DocumentResizeListener = ({ containerElement, isLoadingDocument, children }) => {
  const documentResizeObserver = useRef(null);
  const { renderFinished } = useFinishRendering();

  const updateDebounced = useCallback(debounce(() => {
    if (!core.getDocument()) {
      return;
    }
    core.scrollViewUpdated();
    core.updateView();
  }, UPDATE_SCROLLVIEW_DEBOUNCED_TIME), []);

  const documentResizeObserverHandler = (entries) => {
    entries.forEach((entry) => {
      if (entry.contentBoxSize || entry.contentRect) {
        updateDebounced();
      }
    });
  };

  useEffect(() => {
    if (!containerElement) {
      return () => {};
    }
    const rootDocument = window.document.getElementById('app');

    documentResizeObserver.current = new ResizeObserver(documentResizeObserverHandler);
    documentResizeObserver.current.observe(containerElement);
    documentResizeObserver.current.observe(rootDocument);
    return () => {
      if (documentResizeObserver.current) {
        documentResizeObserver.current.unobserve(containerElement);
        documentResizeObserver.current.unobserve(rootDocument);
      }
    };
  }, [containerElement]);

  useEffect(() => {
    if (!isLoadingDocument && renderFinished) {
      updateDebounced();
    }
    return () => {
      updateDebounced.cancel();
    };
  }, [isLoadingDocument, renderFinished]);

  return children;
};

DocumentResizeListener.propTypes = {

};

export default DocumentResizeListener;
