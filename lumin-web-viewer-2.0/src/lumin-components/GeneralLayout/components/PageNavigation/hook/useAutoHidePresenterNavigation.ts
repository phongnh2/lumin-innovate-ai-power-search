import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

const AUTO_HIDE_TIMEOUT = 1000;

export const useAutoHidePresenterNavigation = () => {
  const [isVisible, setIsVisible] = useState(true);
  const isInPresenterMode = useSelector(selectors.isInPresenterMode);
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isInPresenterMode) {
      setIsVisible(true);
      timeout = setTimeout(() => {
        setIsVisible(false);
      }, AUTO_HIDE_TIMEOUT);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [isInPresenterMode]);

  return {
    isVisible,
  };
};
