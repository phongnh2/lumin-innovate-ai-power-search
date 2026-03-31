import { store } from 'store';

import { eventTracking } from 'utils/recordUtil';

import UserEventConstants from 'constants/eventConstants';

import { quickSearchSelectors } from '../slices';

export const trackingQuickSearchValue = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { getState } = store;
  const state = getState();
  const { searchKeyword } = quickSearchSelectors.searchResults(state);
  const isOpenQuickSearch = quickSearchSelectors.isOpenQuickSearch(state);

  if (!isOpenQuickSearch || !searchKeyword) return;

  eventTracking(UserEventConstants.EventType.QUICK_SEARCH_UPDATE, {
    quickSearchValue: searchKeyword,
  }).catch(() => {});
};
