import { setIsInFocusMode } from 'actions/generalLayoutActions';

import selectors from 'selectors';
import { AppDispatch, RootState } from 'store';

import { useFocusModeToggleStore } from 'features/FocusMode/hook/useFocusModeToggleStore';
import { quickSearchSelectors, setIsOpenQuickSearch } from 'features/QuickSearch/slices';
import { viewerNavigationSelectors } from 'features/ViewerNavigation';

export const focusModeToggleKeyDown = ({
  e,
  state,
  dispatch,
}: {
  e: KeyboardEvent;
  state: RootState;
  dispatch: AppDispatch;
}) => {
  const isInFocusMode = selectors.isInFocusMode(state);
  const isViewerNavigationExpanded = viewerNavigationSelectors.isExpanded(state);
  const isOpenQuickSearch = quickSearchSelectors.isOpenQuickSearch(state);

  if ((!e.metaKey && !e.ctrlKey) || isViewerNavigationExpanded) {
    return;
  }

  if (e.key === '\\' || e.which === 220) {
    if (isOpenQuickSearch) {
      dispatch(setIsOpenQuickSearch(false));
    }
    dispatch(setIsInFocusMode(!isInFocusMode));
    useFocusModeToggleStore.getState().setIsClickFocusModeBtn(!isInFocusMode);
  }
};
