import { useDispatch, useSelector } from 'react-redux';

import core from 'core';

import { useCleanup } from 'hooks/useCleanup';

import { FitMode, fullScreenActions, fullScreenSelectors } from 'features/FullScreen/slice';

import fitMode from 'constants/fitMode';

export const usePresentationHandlers = () => {
  const dispatch = useDispatch();
  const presentationFitMode = useSelector(fullScreenSelectors.presentationFitMode);

  const onZoomUpdated = () => {
    dispatch(fullScreenActions.setDefaultZoom(core.getZoom()));
  };
  const setMode = (mode: FitMode) => {
    core.setFitMode(mode);
    core.addEventListener('zoomUpdated', onZoomUpdated, { once: true });
    dispatch(fullScreenActions.setFitMode(mode));
  };

  const setToFitWidth = () => {
    setMode(fitMode.FitWidth);
  };

  const setToFitPage = () => {
    setMode(fitMode.FitPage);
  };

  const resetZoom = () => {
    core.setFitMode(presentationFitMode);
  };

  useCleanup(() => {
    core.removeEventListener('zoomUpdated', onZoomUpdated);
  }, []);

  return {
    setToFitWidth,
    setToFitPage,
    resetZoom,
  };
};
