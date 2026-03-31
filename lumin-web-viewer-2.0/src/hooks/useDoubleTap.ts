import { useState } from 'react';

export const useDoubleTap = (onDoubleTap: () => void): (() => void) => {
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const doubleTapDelay = 300;

  return () => {
    const currentTime = new Date().getTime();
    const timeSinceLastTouch = currentTime - lastTouchTime;

    if (timeSinceLastTouch <= doubleTapDelay) {
      onDoubleTap();
    }
    setLastTouchTime(currentTime);
  };
};
