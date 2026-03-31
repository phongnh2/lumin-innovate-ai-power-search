import { useMatch } from 'react-router';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { ROUTE_MATCH } from 'constants/Routers';

type TrackingBillingEventName = {
  getTrackStartTrialEventName: () => string;
  getTrackGoPremiumEventName: () => string;
};

export function useTrackingBillingEventName(): TrackingBillingEventName {
  const isDashboard = Boolean(useMatch({ path: ROUTE_MATCH.DASHBOARD, end: false }));

  const getTrackStartTrialEventName = (): string => {
    if (isDashboard) {
      return ButtonName.START_TRIAL_ON_DASHBOARD_BILLING;
    }
    return ButtonName.START_TRIAL_ON_BILLING_SETTINGS;
  };

  const getTrackGoPremiumEventName = (): string => {
    if (isDashboard) {
      return ButtonName.GO_PREMIUM_ON_DASHBOARD_BILLLING;
    }
    return ButtonName.GO_PREMIUM_ON_BILLING_SETTINGS;
  };

  return {
    getTrackStartTrialEventName,
    getTrackGoPremiumEventName,
  };
}

export default useTrackingBillingEventName;
