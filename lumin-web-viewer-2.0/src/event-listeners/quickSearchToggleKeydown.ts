import selectors from 'selectors';
import { AppDispatch, RootState } from 'store';

import { quickSearchSelectors, setIsOpenQuickSearch } from 'features/QuickSearch/slices';
import { viewerNavigationSelectors } from 'features/ViewerNavigation';

export const quickSearchToggleKeydown = ({
  e,
  state,
  dispatch,
}: {
  e: KeyboardEvent;
  state: RootState;
  dispatch: AppDispatch;
}) => {
  const isInFocusMode = selectors.isInFocusMode(state);
  const isOpenQuickSearch = quickSearchSelectors.isOpenQuickSearch(state);
  const isViewerNavigationExpanded = viewerNavigationSelectors.isExpanded(state);
  const isPreviewOriginalVersionMode = selectors.isPreviewOriginalVersionMode(state);

  if (!e.altKey || isInFocusMode || isViewerNavigationExpanded || isPreviewOriginalVersionMode) {
    return;
  }

  if (e.key === '/' || e.which === 191) {
    dispatch(setIsOpenQuickSearch(!isOpenQuickSearch));
  }
};
