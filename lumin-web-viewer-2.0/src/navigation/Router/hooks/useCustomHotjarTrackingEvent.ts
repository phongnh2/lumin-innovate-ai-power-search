/* eslint-disable func-names */
/* eslint-disable prefer-rest-params */
import { useEffect } from 'react';

import { useCheckBusinessDomain } from 'features/CNC/hooks/useCheckBusinessDomain';
import { useGetHotjarRecordingEnabled } from 'features/CNC/hooks/useGetHotjarRecordingEnabled';

import { HOTJAR_EVENT } from 'constants/hotjarEvent';

export const useCustomHotjarTrackingEvent = () => {
  const { isBusinessDomain } = useCheckBusinessDomain();
  const hjRecordingEnabled = useGetHotjarRecordingEnabled();
  useEffect(() => {
    if (isBusinessDomain && hjRecordingEnabled) {
      window.hj =
        window.hj ||
        function () {
          (window.hj.q = window.hj.q || []).push(arguments);
        };
      window.hj('event', HOTJAR_EVENT.START_HOTJAR_RECORDING);
    }
  }, [hjRecordingEnabled, isBusinessDomain]);
};
