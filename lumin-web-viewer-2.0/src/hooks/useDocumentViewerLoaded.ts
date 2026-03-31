import { useEffect, useState } from 'react';

import core from 'core';

export const useDocumentViewerLoaded = () => {
  const [loaded, setLoaded] = useState(!!core.docViewer && !!core.getDocument());
  useEffect(() => {
    if (!core.docViewer) {
      return undefined;
    }
    const onDocumentViewerLoaded = () => {
      setLoaded(true);
    };
    core.docViewer.addEventListener('documentViewerLoaded', onDocumentViewerLoaded, { once: true });

    return () => {
      core.docViewer.removeEventListener('documentViewerLoaded', onDocumentViewerLoaded);
    };
  }, []);

  return {
    loaded,
  };
};
