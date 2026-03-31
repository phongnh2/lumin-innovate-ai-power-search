import loadable from '@loadable/component';
import { isEmpty } from 'lodash';
import React, { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router';
import { useLatest } from 'react-use';

import actions from 'actions';
import selectors from 'selectors';

import AppCircularLoading from 'luminComponents/AppCircularLoading';

import { indexedDBService } from 'services';

import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { ErrorCode } from 'constants/errorCode';
import { MARKETING_SLUG_VALUES } from 'constants/Routers';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IOrganizationData } from 'interfaces/redux/organization.redux.interface';

const NoPermissionOrganizationComponent = loadable(() => import('lumin-components/NoPermissionOrganization'));

function withOrganizationFetching<T>(Component: React.ComponentType<T>): (props: T) => JSX.Element {
  function HOC(props: T): JSX.Element {
    const dispatch = useDispatch();
    const { orgName: url } = useParams<{ orgName: string }>();
    const isOffline = useSelector<unknown, boolean>(selectors.isOffline);
    const currentOrganization = useSelector<unknown, IOrganizationData>(selectors.getCurrentOrganization, shallowEqual);
    const isOfflineRef = useLatest(isOffline);
    const { setIsVisible } = useChatbotStore();
    const hasMarketingSlug = MARKETING_SLUG_VALUES.includes(url);

    const handleNoPermissionError = (): JSX.Element => {
      dispatch(actions.removeOrganizationInListByUrl(url));
      return <NoPermissionOrganizationComponent />;
    };

    const handleFetchOrgFailed = (): JSX.Element => {
      switch (currentOrganization.error.code) {
        case ErrorCode.Common.NO_PERMISSION:
          return handleNoPermissionError();
        case ErrorCode.Common.INVALID_IP_ADDRESS:
          // eslint-disable-next-line react/jsx-no-useless-fragment
          return <></>;
        default:
          return <Navigate to="/not-found" />;
      }
    };

    useEffect(() => {
      const getOrganizationField = ({ organization }: { organization: IOrganization }): IOrganization => organization;

      const isMatchedUrl = ({ url: orgUrl }: IOrganization): boolean => orgUrl === url;
      const fetchOrganization = async (): Promise<void> => {
        if (!isOfflineRef.current) {
          dispatch(actions.fetchCurrentOrganization(url));
        } else {
          const { organizations } = await indexedDBService.getOfflineInfo();
          const org = organizations.map(getOrganizationField).find(isMatchedUrl);
          if (!isEmpty(org)) {
            dispatch(actions.setCurrentOrganization(org));
          }
        }
      };
      if (!hasMarketingSlug) {
        fetchOrganization().catch(() => {});
      }
      return () => {
        if (!isOfflineRef.current) {
          dispatch(actions.resetOrganization());
          setIsVisible(false);
        }
      };
    }, [url, dispatch]);

    if (currentOrganization.loading || hasMarketingSlug) {
      return <AppCircularLoading />;
    }

    if (currentOrganization.error) {
      return handleFetchOrgFailed();
    }

    return <Component {...props} />;
  }

  return HOC;
}

export default withOrganizationFetching;
