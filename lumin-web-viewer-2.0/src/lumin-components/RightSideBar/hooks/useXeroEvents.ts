import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import { APP_NAMES, APP_URL_PATH } from 'features/MiniApps/constants';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { MINI_APP_EVENTS } from 'constants/miniApps';
import { ORG_TEXT } from 'constants/organizationConstants';

export const useXeroEvents = () => {
  const organization = useShallowSelector(selectors.getCurrentOrganization);
  const navigate = useNavigate();
  useEffect(() => {
    const handleXeroEvent = (event: CustomEvent<{ type: string; data: Record<string, unknown> }>) => {
      const { type } = event.detail;
      if (type === MINI_APP_EVENTS.XERO_INTEGRATION.OPEN_XERO_SETTINGS) {
        navigate(`/${ORG_TEXT}/${organization?.data?.url}/${APP_URL_PATH}/${APP_NAMES.XERO_INTEGRATION}`);
      }
    };

    window.addEventListener(CUSTOM_EVENT.MINI_APP.XERO_INTEGRATION.NOTIFY_LUMIN_APP, handleXeroEvent as EventListener);

    return () => {
      window.removeEventListener(
        CUSTOM_EVENT.MINI_APP.XERO_INTEGRATION.NOTIFY_LUMIN_APP,
        handleXeroEvent as EventListener
      );
    };
  }, [organization?.data?.url, navigate]);
};
