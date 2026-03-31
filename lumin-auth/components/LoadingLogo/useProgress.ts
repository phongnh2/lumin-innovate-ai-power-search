import { useState, useRef, useEffect } from 'react';

const INIT_STEP = 1;

const MAX_PROGRESS = 100;

const useProgress = () => {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(0);
  const progressRef = useRef(progress);
  const stepRef = useRef(INIT_STEP);
  const end = () => {
    cancelAnimationFrame(intervalRef.current);
  };
  const start = () => {
    const count = () => {
      setProgress(progressRef.current + stepRef.current);
      if (progressRef.current >= MAX_PROGRESS) {
        end();
      } else if (progressRef.current >= 90) {
        stepRef.current = 0;
      } else if (progressRef.current >= 80) {
        stepRef.current = 0.01;
      } else if (progressRef.current >= 60) {
        stepRef.current = 0.1;
      }
      intervalRef.current = requestAnimationFrame(count);
    };
    intervalRef.current = requestAnimationFrame(count);
  };

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(
    () => () => {
      end();
    },
    []
  );

  return { progress, start, end };
};

export default useProgress;
