import { useCallback, useState } from 'react';
import { useCounter, useInterval } from 'react-use';

const INTERVAL_TIME = 1000;

const useCountdown = ({
  initialTime,
  intervalTime = INTERVAL_TIME,
}: {
  initialTime: number;
  intervalTime?: number;
}) => {
  const [value, { set, reset }] = useCounter(initialTime);

  const [running, setRunning] = useState(false);

  const startCountdown = useCallback(() => setRunning(true), []);

  const stopCountdown = useCallback(() => setRunning(false), []);

  const resetCountdown = useCallback(() => {
    stopCountdown();
    reset();
  }, [stopCountdown, reset]);

  const countdownCallback = useCallback(() => {
    if (value <= 0) {
      stopCountdown();
      return;
    }

    set((_value) => Math.max(0, _value - intervalTime / 1000));
  }, [value, intervalTime, stopCountdown]);

  useInterval(countdownCallback, running ? intervalTime : null);

  return { value, startCountdown, resetCountdown, stopCountdown };
};

export { useCountdown };
