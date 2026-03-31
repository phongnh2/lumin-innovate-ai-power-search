import { useLocalStorage } from 'react-use';

import { LocalStorageKey } from 'constants/localStorageKey';

const useGetHasShownDismissFreeTrialSurvey = () => {
  const [storage, setStorage] = useLocalStorage<boolean>(LocalStorageKey.HAS_SHOWN_DISMISS_FREE_TRIAL_SURVEY, false);

  const setOrgHasShownDismissFreeTrialSurvey = () => {
    setStorage(true);
  };

  return {
    hasShownDismissFreeTrialSurvey: storage,
    setOrgHasShownDismissFreeTrialSurvey,
  };
};

export default useGetHasShownDismissFreeTrialSurvey;
