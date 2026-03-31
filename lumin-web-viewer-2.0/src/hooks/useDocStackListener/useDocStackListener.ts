import { useMemo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useShallowCompareEffect } from 'react-use';
import { isEmpty } from 'lodash';

import selectors from 'selectors';
import { OrganizationList } from 'interfaces/redux/organization.redux.interface';
import { DocStackListener } from './DocStackListener';

function useDocStackListener(): void {
  const { data, loading } = useSelector<unknown, OrganizationList>(selectors.getOrganizationList, shallowEqual);
  const orgIds = useMemo(() => (data || []).map((org) => org.organization._id), [data]);

  useShallowCompareEffect(() => {
    if (!loading && !isEmpty(data)) {
      DocStackListener.instance().watch(orgIds);
    }
  }, [orgIds, loading]);
}

export default useDocStackListener;
