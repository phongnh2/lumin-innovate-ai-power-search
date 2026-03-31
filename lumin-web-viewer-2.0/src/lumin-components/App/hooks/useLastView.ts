import { useEffect, useState } from 'react';

import core from 'core';
import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { useLastViewDocumentHandler } from 'features/LastViewDocument';

import { CUSTOM_EVENT } from 'constants/customEvent';

export const useLastView = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const hasManipulationStep = !!currentDocument?.manipulationStep?.length;
  const [documentRendered, setDocumentRendered] = useState(!hasManipulationStep);

  const { saveLastView, scrollToLastView, clearIdleCallback } = useLastViewDocumentHandler();
  useEffect(() => {
    if (!documentRendered) {
      return undefined;
    }

    const updateLastView = () => {
      saveLastView();
    };
    core.addEventListener('pageNumberUpdated', updateLastView);

    return () => {
      clearIdleCallback();
      core.removeEventListener('pageNumberUpdated', updateLastView);
    };
  }, [documentRendered]);

  useEffect(() => {
    if (hasManipulationStep) {
      return undefined;
    }

    const onDocumentLoaded = () => {
      scrollToLastView();
    };

    core.docViewer.addEventListener('documentLoaded', onDocumentLoaded, { once: true });
    return () => {
      core.removeEventListener('documentLoaded', onDocumentLoaded);
    };
  }, [hasManipulationStep]);

  useEffect(() => {
    if (!hasManipulationStep || documentRendered) {
      return undefined;
    }

    const onFinishManipulate = () => {
      setDocumentRendered(true);
    };

    window.addEventListener(CUSTOM_EVENT.FINISHED_MANIPULATE, onFinishManipulate, { once: true });
    return () => {
      window.removeEventListener(CUSTOM_EVENT.FINISHED_MANIPULATE, onFinishManipulate);
    };
  }, [hasManipulationStep, documentRendered]);

  useEffect(() => {
    const onPagesUpdated = () => {
      scrollToLastView();
    };

    if (!documentRendered) {
      return undefined;
    }

    core.docViewer.addEventListener('pagesUpdated', onPagesUpdated, {
      once: true,
    });
    return () => {
      core.removeEventListener('pagesUpdated', onPagesUpdated);
    };
  }, [documentRendered]);
};
