import { useEffect, useRef } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import ApolloErrorObservable from '../../../apollo/ApolloErrorObservable';
import OrganizationErrorSubscriber from '../ OrganizationErrorSubscriber';

export function useErrorSubscriber() {
  const organizationErrorSubscriber = useRef(null);
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual);

  useEffect(() => {
    if (!currentOrganization.loading && currentOrganization.data) {
      organizationErrorSubscriber.current = new OrganizationErrorSubscriber(currentOrganization.data);
      ApolloErrorObservable.subscribe(organizationErrorSubscriber.current);
    }
    return () => {
      if (organizationErrorSubscriber.current) {
        organizationErrorSubscriber.current.destructor();
        ApolloErrorObservable.unsubscribe(organizationErrorSubscriber.current);
      }
    };
  }, [currentOrganization]);
}
