import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import loadScript from 'helpers/loadScript';
import logger from 'helpers/logger';

import brazeAdaptee from 'utils/Factory/BrazeAdapter/BrazeAdaptee';
import loadGTM from 'utils/loadGTM';
import { insertGA4 } from 'utils/loadTrackingScript';

import { CookieConsentEnum } from 'features/cookieConsents/constants';
import { cookieConsents } from 'features/cookieConsents/cookieConsents';

import { LOGGER } from 'constants/lumin-common';
import { HUBSPOT_ID } from 'constants/urls';

export function useLoadTrackingScript() {
  const dispatch = useDispatch();
  const [hubspotLoaded, setHubspotLoaded] = useState(false);
  const acceptedCookies = cookieConsents.isCookieAllowed(CookieConsentEnum.NonEssential);
  const userLocationLoaded = useSelector(selectors.hasUserLocationLoaded);
  const hasGTMLoaded = useSelector(selectors.hasGTMLoaded);

  useEffect(() => {
    loadGTM()
      .then(() => {
        insertGA4();
        dispatch(actions.loadGTMSuccess());
      })
      .catch((error) => {
        logger.logError({ message: error.message, error });
      });
  }, []);

  useEffect(() => {
    if (hasGTMLoaded && acceptedCookies && userLocationLoaded) {
      cookieConsents.grantAllGTagConsents();
    }
  }, [hasGTMLoaded, acceptedCookies, userLocationLoaded]);

  useEffect(() => {
    if (acceptedCookies && userLocationLoaded) {
      brazeAdaptee.createBrazeInstance();
      loadScript(`//js.hs-scripts.com/${HUBSPOT_ID}.js`, '', {
        async: true,
        id: 'hs-script-loader',
      })
        .then(() => {
          setHubspotLoaded(true);
        })
        .catch((error) => {
          logger.logError({
            reason: LOGGER.Service.HUBSPOT_API_ERROR,
            error,
          });
        });
    }
  }, [acceptedCookies, userLocationLoaded]);
  return { hubspotLoaded };
}
