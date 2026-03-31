import selectors from 'selectors';
import { store } from 'store';

import { ORG_TEXT } from 'constants/organizationConstants';

import getDontShowFreeTrialModalAgainClicked from './getDontShowFreeTrialModalAgainClicked';

const getDontShowFreeTrialModalAgainClickedForPageView = () => {
  const state = store.getState();
  const currentUser = selectors.getCurrentUser(state);
  const { pathname } = window.location;
  const paths = pathname.split('/');
  const isOrgPage = paths[1] === ORG_TEXT;
  const orgUrl = isOrgPage ? paths[2] : '';

  if (!isOrgPage) {
    return undefined;
  }

  return getDontShowFreeTrialModalAgainClicked({
    userId: currentUser?._id,
    orgUrl,
  });
};

export default getDontShowFreeTrialModalAgainClickedForPageView;
