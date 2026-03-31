import { useEffect } from 'react';

import { buttonEvent } from '@/lib/factory/button.event';

const useTrackingButtonEvent = () => {
  useEffect(() => {
    window.addEventListener('click', buttonEvent.clickListener, true);
    return function cleanup() {
      window.removeEventListener('click', buttonEvent.clickListener);
    };
  }, []);
};

export default useTrackingButtonEvent;
