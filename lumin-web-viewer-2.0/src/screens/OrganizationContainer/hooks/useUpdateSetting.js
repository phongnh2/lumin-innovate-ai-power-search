import { useEffect, useRef } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import useUpdateTeam from 'screens/OrganizationTeam/hooks/useUpdateTeam';

import { useGapiLoaded } from 'hooks';

export function useUpdateSetting({ subscription, onGoogleSigninUpdated, onSamlSsoSigninUpdated }) {
  const gapiLoaded = useGapiLoaded();
  const subscriptionUpdateOrganizationRef = useRef(null);
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual);
  useUpdateTeam();
  useEffect(() => {
    if (currentOrganization.data?._id && gapiLoaded) {
      subscriptionUpdateOrganizationRef.current = subscription({ orgId: currentOrganization.data._id });
      onGoogleSigninUpdated(currentOrganization.data);
      onSamlSsoSigninUpdated(currentOrganization.data);
    }
    return () => {
      if (subscriptionUpdateOrganizationRef.current) {
        subscriptionUpdateOrganizationRef.current.unsubscribe();
        subscriptionUpdateOrganizationRef.current = null;
      }
    };
  }, [currentOrganization, subscription, gapiLoaded]);
}
