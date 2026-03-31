import React, { useState, useRef, useCallback, useEffect } from 'react';

import LinearProgress from 'lumin-components/GeneralLayout/general-components/LinearProgress';

const CEIL = 95;
const INTERVAL = 10;

const DummyProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  const onTimerRun = useCallback(() => {
    setProgress((prevProgress) => {
      if (prevProgress === CEIL) {
        clearInterval(timerRef.current);
      }
      return prevProgress + 1;
    });
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(onTimerRun, INTERVAL);
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);
  return <LinearProgress variant="determinate" value={progress} className="merge-loading-progress-bar" />;
};

export default DummyProgressBar;
