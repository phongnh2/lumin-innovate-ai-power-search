import { useState, useRef, useEffect } from 'react';

const INIT_STEP = 1;

const MAX_PROGRESS = 100;

const useProgress = (data) => {
  const { speedFactor = 1 } = data || {};
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef();
  const progressRef = useRef(progress);
  const stepRef = useRef(INIT_STEP * speedFactor);

  const reset = () => {
    setProgress(0);
    stepRef.current = INIT_STEP * speedFactor;
  };

  const end = () => {
    cancelAnimationFrame(intervalRef.current);
  };
  const start = () => {
    const count = () => {
      setProgress(progressRef.current + stepRef.current);
      if (progressRef.current >= MAX_PROGRESS) {
        end();
        return;
      }
      if (progressRef.current >= 90) {
        stepRef.current = 0;
        end();
        return;
      }
      if (progressRef.current >= 80) {
        stepRef.current = speedFactor * 0.01;
      } else if (progressRef.current >= 60) {
        stepRef.current = speedFactor * 0.1;
      }
      intervalRef.current = requestAnimationFrame(count);
    };
    intervalRef.current = requestAnimationFrame(count);
  };

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => () => {
    end();
  }, []);

  return { progress, start, end, reset };
};

useProgress.propTypes = {};

export default useProgress;
