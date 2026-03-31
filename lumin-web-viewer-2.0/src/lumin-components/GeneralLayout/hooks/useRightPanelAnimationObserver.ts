import { useEffect } from 'react';

const useRightPanelAnimationObserver = (callback: () => void): void => {
  useEffect(() => {
    const rightPanelContent = document.getElementById('right-panel-content');

    if (!rightPanelContent) {
      return undefined;
    }

    rightPanelContent.addEventListener('transitionend', callback);

    return () => {
      rightPanelContent.removeEventListener('transitionend', callback);
    };
  }, [callback]);
};

export default useRightPanelAnimationObserver;
