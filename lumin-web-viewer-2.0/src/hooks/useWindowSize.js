import { debounce } from 'lodash';
import { useState, useEffect } from 'react';

export function useWindowSize(delay = 0) {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    // Handler to call on window resize
    const handleResizeDebounced = debounce(handleResize, delay);
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener('resize', handleResizeDebounced);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResizeDebounced);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}
