import { useEffect, useState } from 'react';

import core from 'core';

const useFinishRendering = () => {
  const [rendered, setRendered] = useState(false);
  useEffect(() => {
    const onFinishRendering = () => {
      setRendered(true);
    };
    core.docViewer.addEventListener('finishedRendering', onFinishRendering);
    return () => {
      core.docViewer.removeEventListener('finishedRendering', onFinishRendering);
    };
  }, []);
  return { renderFinished: rendered };
};

export default useFinishRendering;
