import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { Query } from '@apollo/client/react/components';
import { NetworkStatus } from '@apollo/client';

import selectors from 'selectors';
import NotificationGroup from 'luminComponents/NotificationGroup';
import NotificationButton from 'luminComponents/NotificationContainer/NotificationButton';
import {
  GET_NOTIFICATIONS,
} from 'graphQL/NotificationGraph';
import { FETCH_POLICY } from 'constants/graphConstant';

function NotificationGroupQuery() {
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const isOffline = useSelector(selectors.isOffline);
  const tab = useSelector(selectors.getCurrentNotificationTab);
  if (!currentUser?._id) {
    return null;
  }

  if (isOffline) {
    return <NotificationButton toggleNotification={() => {}} />;
  }
  return (
    <Query
      query={GET_NOTIFICATIONS}
      fetchPolicy={FETCH_POLICY.CACHE_FIRST}
      variables={{
        input: {
          cursor: '',
          tab,
        },
      }}
      notifyOnNetworkStatusChange
    >
      {({
        error, data = { notifications: {} }, loading, fetchMore, subscribeToMore, refetch, networkStatus,
      }) => (
        <NotificationGroup
          fetchMore={fetchMore}
          error={error}
          loading={loading || networkStatus === NetworkStatus.refetch}
          subscribeToMore={subscribeToMore}
          refetch={refetch}
          notifications={data.notifications.notifications}
          hasNextPage={data.notifications?.hasNextPage}
          cursor={data.notifications.cursor}
        />
      )}
    </Query>
  );
}

export default NotificationGroupQuery;
