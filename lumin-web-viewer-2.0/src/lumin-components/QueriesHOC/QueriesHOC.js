import { useQuery, NetworkStatus } from '@apollo/client';
import merge from 'lodash/merge';
import React, { useState, useEffect, useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

import { useRefetch } from 'hooks';

import { ORG_PATH } from 'constants/organizationConstants';

const QueriesHOC = (query, {
  variables = () => ({}),
  fetchPolicy = 'cache-first',
  onLoadingChange = () => {},
  abortOptions = { loading: false },
}) => (WrappedComponent) => {
  const QueryComponent = (props) => {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [prevNetworkStatus, setPrevNetworkStatus] = useState(1);
    const isInOrgPage = Boolean(matchPath({ path: ORG_PATH }, location.pathname));

    const queryVariables = variables(props);
    const abortDeps = abortOptions.deps?.(props) || [];

    const documentQuery = typeof query === 'function' ? query(props, { isInOrgPage }) : query;

    const queryFetchPolicy = typeof fetchPolicy === 'function' ? fetchPolicy(props) : fetchPolicy;

    const updateLoading = (loadingState) => {
      onLoadingChange(loadingState, props);
      setLoading(loadingState);
    };

    const controller = useMemo(() => new AbortController(), abortDeps);

    const {
      error, loading: apolloLoading, data, fetchMore, refetch: apolloRefetch,
    } = useQuery(documentQuery, {
      fetchPolicy: queryFetchPolicy,
      variables: queryVariables,
      context: { fetchOptions: { signal: controller.signal } },
    });

    const [refetch, isRefetching] = useRefetch(apolloRefetch);

    useEffect(() => {
      if (isRefetching) {
        setPrevNetworkStatus(NetworkStatus.refetch);
      }
      updateLoading(isRefetching);
    }, [isRefetching]);

    useEffect(() => {
      updateLoading(apolloLoading);
    }, [apolloLoading]);

    const fetchMoreData = (callback, extraVariables = {}) => {
      setPrevNetworkStatus(NetworkStatus.fetchMore);
      return fetchMore({
        variables: {
          ...merge({}, extraVariables, queryVariables),
        },
        updateQuery: (prev, result) => {
          callback(prev, result);
        },
      });
    };

    const refetchData = () => {
      refetch();
    };

    return (
      <WrappedComponent
        {...props}
        data={data}
        loading={loading}
        error={error}
        fetchMore={fetchMoreData}
        refetch={refetchData}
        lastStatus={prevNetworkStatus}
        controller={controller}
      />
    );
  };

  QueryComponent.propTypes = {
  };

  return QueryComponent;
};

export default QueriesHOC;
