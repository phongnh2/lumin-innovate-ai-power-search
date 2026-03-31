import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { CUSTOM_EVENT } from 'constants/customEvent';

export const useRefetchThumbnailsListener = (refetchCallback: () => void) => {
  const dispatch = useDispatch();
  useEffect(() => {
    window.addEventListener(CUSTOM_EVENT.REFETCH_THUMBNAILS, refetchCallback);

    return () => {
      window.removeEventListener(CUSTOM_EVENT.REFETCH_THUMBNAILS, refetchCallback);
    };
  }, [dispatch, refetchCallback]);
};
