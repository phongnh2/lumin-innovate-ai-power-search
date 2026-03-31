import { isEmpty } from 'lodash';

import { LocalStorageKey } from 'constants/localStorageKey';

type SkipTrialType = Record<string, string[]>;

type Params = {
  userId: string;
  orgUrl: string;
};

const getDontShowFreeTrialModalAgainClicked = ({ userId, orgUrl }: Params) => {
  const storage = localStorage.getItem(LocalStorageKey.SKIP_ORG_PROMOTION_TRIAL_MODAL);
  const skipTrial = storage ? (JSON.parse(storage) as SkipTrialType) : {};

  if (!userId || !orgUrl || isEmpty(skipTrial) || !skipTrial[userId]) {
    return false;
  }

  return skipTrial[userId].some((_orgUrl) => _orgUrl === orgUrl);
};

export default getDontShowFreeTrialModalAgainClicked;
