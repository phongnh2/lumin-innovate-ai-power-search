import { useSelector } from 'react-redux';

import selectors from 'selectors';

export const useNetworkStatus = () => {
  const isOffline = useSelector(selectors.isOffline);

  return {
    isOffline,
    isOnline: !isOffline,
  };
};
