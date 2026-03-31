import { debounce, isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { useEvent } from 'react-use';

import core from 'core';

const ZOOM_DESCREASE_RATIO = 0.8;

const RESIZE_DEBOUNCED_TIME = 300;

const useLoadPdfCore = ({ scrollViewElement, documentElement, loadResource }) => {
  const [loading, setLoading] = useState(true);

  const setZoom = () => {
    core.fitToWidth();
    const zoom = core.getZoom();
    core.zoomTo(zoom * ZOOM_DESCREASE_RATIO);
  };

  const onDocumentLoaded = async () => {
    setZoom();
    setLoading(false);
  };

  const onBeforeDocumentLoaded = () => {
    if (core.getTotalPages() >= 500) {
      core.setDisplayMode(core.CoreControls.DisplayModes.Single);
    }
  };

  useEvent('resize', debounce(setZoom, RESIZE_DEBOUNCED_TIME));

  useEffect(() => {
    const loadCore = async () => {
      if (!documentElement || !scrollViewElement || !loadResource) {
        return;
      }
      await core.setUpWorker();
      core.setViewerElement(documentElement);
      core.setScrollViewElement(scrollViewElement);
      core.disableAnnotations();
      core.enableReadOnlyMode();
      core.loadDocument(loadResource);
      core.addEventListener('beforeDocumentLoaded', onBeforeDocumentLoaded);
      core.addEventListener(
        'documentLoaded',
        onDocumentLoaded,
      );
    };
    loadCore();
    return () => {
      if (!isEmpty(core.docViewer)) {
        core.removeEventListener('beforeDocumentLoaded', onBeforeDocumentLoaded);
        core.removeEventListener(
          'documentLoaded',
          onDocumentLoaded,
        );
        core.docViewer.dispose();
        core.getDocument()?.unloadResources();
        core.closeDocument();
      }
    };
  }, [documentElement, scrollViewElement, loadResource]);
  return {
    loading,
  };
};

export default useLoadPdfCore;
