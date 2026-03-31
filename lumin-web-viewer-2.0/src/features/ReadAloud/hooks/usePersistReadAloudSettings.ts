import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import useShallowSelector from 'hooks/useShallowSelector';

import { LocalStorageUtils } from 'utils';

import { LocalStorageKey } from 'constants/localStorageKey';

import { ReadAloudState } from '../interfaces';
import { readAloudActions, readAloudSelectors } from '../slices';

export const usePersistReadAloudSettings = () => {
  const currentSpeakingSettings = useShallowSelector(readAloudSelectors.speakingSettings);
  const dispatch = useDispatch();

  useEffect(() => {
    const storedSpeakingSettings = JSON.parse(
      LocalStorageUtils.get({
        key: LocalStorageKey.READ_ALOUD_SETTING,
      })
    ) as ReadAloudState['speakingSettings'];

    if (storedSpeakingSettings) {
      dispatch(readAloudActions.setSpeakingSettings(storedSpeakingSettings));
    }
  }, [dispatch]);

  useEffect(() => {
    LocalStorageUtils.set({
      key: LocalStorageKey.READ_ALOUD_SETTING,
      value: JSON.stringify(currentSpeakingSettings),
    });
  }, [currentSpeakingSettings]);
};
