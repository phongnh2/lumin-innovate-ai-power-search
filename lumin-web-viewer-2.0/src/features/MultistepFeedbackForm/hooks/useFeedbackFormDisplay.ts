import { useCallback } from 'react';

import { LocalStorageKey } from 'constants/localStorageKey';

const FEEDBACK_FORM_COOLDOWN_PERIOD = process.env.BRANCH === 'production' ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 1;

export const useFeedbackFormDisplay = () => {
  const setLastFeedbackFormDisplayTime = () => {
    localStorage.setItem(LocalStorageKey.LAST_FEEDBACK_FORM_DISPLAY, Date.now().toString());
  };

  const isFeedbackFormEligibleForDisplay = useCallback(() => {
    const lastDisplayTime = localStorage.getItem(LocalStorageKey.LAST_FEEDBACK_FORM_DISPLAY);
    if (!lastDisplayTime) {
      return true;
    }

    const lastDisplayTimeNumber = Number(lastDisplayTime);
    return Date.now() - lastDisplayTimeNumber > FEEDBACK_FORM_COOLDOWN_PERIOD;
  }, []);

  return { setLastFeedbackFormDisplayTime, isFeedbackFormEligibleForDisplay };
};
