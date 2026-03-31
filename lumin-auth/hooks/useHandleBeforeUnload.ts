import { useEffect } from 'react';

import { SESSION_STORAGE_KEY } from '@/constants/sessionStorageKey';

const useHandleBeforeUnload = () => {
  const handleBeforeUnload = () => {
    /**
     * Remove prevUrl pinpoint key in session storage
     * to avoid missing pageView events after refresh page
     * Source: https://github.com/aws-amplify/amplify-js/blob/d8f695a6697046de8ee8633916156a1b72421d39/packages/analytics/src/trackers/PageViewTracker.ts#L62
     */
    sessionStorage.removeItem(SESSION_STORAGE_KEY.AWS_PREV_URL_KEY);
  };

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return function cleanup() {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};

export default useHandleBeforeUnload;
