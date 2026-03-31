import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setIsInFocusMode } from 'actions/generalLayoutActions';

import { useFocusModeToggleStore } from 'features/FocusMode/hook/useFocusModeToggleStore';
import { useMatchMediaLayoutContext } from 'features/MatchMediaLayout/hooks/useMatchMediaLayoutContext';

export const useHandleMobileView = () => {
  const dispatch = useDispatch();
  const { isNarrowScreen } = useMatchMediaLayoutContext();
  const isClickFocusModeBtn = useFocusModeToggleStore((state) => state.isClickFocusModeBtn);
  const handleMobileView = useCallback(
    (isMobileView: boolean, isClickFocusMode: boolean) => {
      if (!isClickFocusMode) {
        dispatch(setIsInFocusMode(isMobileView));
      }
    },
    [dispatch]
  );

  useEffect(() => {
    handleMobileView(isNarrowScreen, isClickFocusModeBtn);
  }, [handleMobileView, isClickFocusModeBtn, isNarrowScreen]);
};
