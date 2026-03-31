import { shallowEqual, useSelector } from 'react-redux';
import { useQuery } from '@apollo/client';
import { isEmail } from 'validator';

import selectors from 'selectors';
import { FETCH_POLICY } from 'constants/graphConstant';
import { ORGANIZATION_MEMBER_TYPE } from 'constants/organizationConstants';
import { GET_ORG_MEMBER_LIST, GET_LIST_REQUEST_JOIN_ORGANIZATION, GET_LIST_PENDING_USER_ORGANIZATION } from 'graphQL/OrganizationGraph';

const useGetMembers = ({
  type, limit, selectedPage, sortOptions, searchKey,
}) => {
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual) || {};

  const QUERY_TO_SHOW = {
    [ORGANIZATION_MEMBER_TYPE.PEOPLE_MEMBER]: {
      query: GET_ORG_MEMBER_LIST,
      variables: {
        input: {
          orgId: currentOrganization.data._id,
          limit,
          offset: selectedPage * limit,
          option: sortOptions,
          ...isEmail(searchKey) && { searchKey },
        },
        internal: true,
      },
    },
    [ORGANIZATION_MEMBER_TYPE.PEOPLE_GUEST]: {
      query: GET_ORG_MEMBER_LIST,
      variables: {
        input: {
          orgId: currentOrganization.data._id,
          limit,
          offset: selectedPage * limit,
          option: sortOptions,
          ...isEmail(searchKey) && { searchKey },
        },
        internal: false,
      },
    },
    [ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER]: {
      query: GET_LIST_PENDING_USER_ORGANIZATION,
      variables: {
        input: {
          orgId: currentOrganization.data._id,
          limit,
          offset: selectedPage * limit,
          option: sortOptions,
          ...isEmail(searchKey) && { searchKey },
        },
      },
    },
    [ORGANIZATION_MEMBER_TYPE.PEOPLE_REQUEST_ACCESS]: {
      query: GET_LIST_REQUEST_JOIN_ORGANIZATION,
      variables: {
        input: {
          orgId: currentOrganization.data._id,
          limit,
          offset: selectedPage * limit,
          option: sortOptions,
          ...isEmail(searchKey) && { searchKey },
        },
      },
    },
    [ORGANIZATION_MEMBER_TYPE.MEMBER]: {
      query: GET_ORG_MEMBER_LIST,
      variables: {
        input: {
          orgId: currentOrganization.data._id,
          limit,
          offset: selectedPage * limit,
          option: sortOptions,
          ...isEmail(searchKey) && { searchKey },
        },
      },
    },
  };

  const {
    loading, error, data, refetch, networkStatus,
  } = useQuery(
    QUERY_TO_SHOW[type].query,
    {
      variables: QUERY_TO_SHOW[type].variables,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    },
  );

  return {
    loading, error, data, refetch, networkStatus,
  };
};

export default useGetMembers;
