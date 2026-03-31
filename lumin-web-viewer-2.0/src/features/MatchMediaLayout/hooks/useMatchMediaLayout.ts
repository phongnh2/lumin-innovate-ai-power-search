import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useMedia } from 'react-use';
import { AnyAction } from 'redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';
import { store } from 'store';

import { PageToolViewMode } from 'constants/documentConstants';
import fitMode from 'constants/fitMode';

import { Breakpoints } from '../constants';

const useMatchMediaLayout = () => {
  const dispatch = useDispatch();
  const previousDesktopEditDisplayModeRef = useRef(null);

  const isNarrowScreen = useMedia(`screen and (width < ${Breakpoints.MD}px)`);

  useEffect(() => {
    if (isNarrowScreen) {
      core.setFitMode(fitMode.FitWidth);
      const state = store.getState();
      const pageEditDisplayMode = selectors.pageEditDisplayMode(state);
      previousDesktopEditDisplayModeRef.current = pageEditDisplayMode;
      dispatch(actions.changePageEditDisplayMode(PageToolViewMode.LIST) as AnyAction);
      return;
    }

    if (previousDesktopEditDisplayModeRef.current) {
      dispatch(actions.changePageEditDisplayMode(previousDesktopEditDisplayModeRef.current) as AnyAction);
    }
    core.disableReadOnlyMode();
  }, [isNarrowScreen]);

  return { isNarrowScreen };
};

export default useMatchMediaLayout;
