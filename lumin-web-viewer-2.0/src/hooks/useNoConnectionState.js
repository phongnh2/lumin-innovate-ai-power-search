import { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

const TIME_TO_SHOW_PERMANENT = 5000;

function useNoConnectionState() {
  const [showPermanent, setShowPermanent] = useState(false);
  const isOffline = useSelector(selectors.isOffline);

  useEffect(() => {
    let cancelFn = () => {};
    if (isOffline) {
      const db = debounce(() => {
        setShowPermanent(true);
      }, TIME_TO_SHOW_PERMANENT);
      db();
      cancelFn = db.cancel;
    } else {
      setShowPermanent(false);
    }

    return () => {
      cancelFn();
    };
  }, [isOffline]);

  return {
    showPopup: isOffline && !showPermanent,
    showPermanent: isOffline && showPermanent,
  };
}

export { useNoConnectionState };
