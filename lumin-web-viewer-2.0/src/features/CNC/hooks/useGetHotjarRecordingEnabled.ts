import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';

import { HOTJAR_PERCENTAGE_RECORDING } from '../constants/customConstant';

const useGetHotjarRecordingEnabled = () => {
  const hjRecordingEnabled = sessionStorage.getItem(SESSION_STORAGE_KEY.HOTJAR_RECORDING_ENABLED);
  if (hjRecordingEnabled !== null) {
    return !!(hjRecordingEnabled.toString() === 'true');
  }
  const value = Math.random() < HOTJAR_PERCENTAGE_RECORDING;
  sessionStorage.setItem(SESSION_STORAGE_KEY.HOTJAR_RECORDING_ENABLED, value.toString());
  return value;
};

export { useGetHotjarRecordingEnabled };
