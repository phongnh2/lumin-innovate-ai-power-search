import { useEffect } from 'react';

import timeTracking from 'screens/Viewer/time-tracking';

import { GET_ME, TRACKING_PERFORMANCE_REF } from 'constants/timeTracking';

export const useRegisterGetMeTrackingData = () => {
  useEffect(() => {
    const hasGetMeTrackingData = timeTracking.isExist(GET_ME);

    if (!hasGetMeTrackingData) {
      timeTracking.register(TRACKING_PERFORMANCE_REF);
    }
  }, []);
};
