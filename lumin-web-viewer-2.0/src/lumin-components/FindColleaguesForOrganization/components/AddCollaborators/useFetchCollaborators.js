import { useEffect, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import { userServices } from 'services';

import logger from 'helpers/logger';

import { CONTACT_LIST_CONNECT, ORGANIZATION_ROLES, GetGoogleContactsContext } from 'constants/organizationConstants';

const useFetchCollaborators = ({
  type, accessToken, setUserList, setSelectedUsers, googleAuthorizationEmail,
}) => {
  const { isPopularDomain } = useSelector(selectors.getCurrentUser, shallowEqual);
  const isConnect = type === CONTACT_LIST_CONNECT.CONNECT;
  const isNotConnect = type === CONTACT_LIST_CONNECT.NOT_CONNECT;
  const [isLoading, setIsLoading] = useState(isConnect || !isPopularDomain);

  const getMemberList = (data) => data.map((item) => (
    {
      email: item.email,
      role: ORGANIZATION_ROLES.MEMBER,
    }
  ));

  const setUsers = (users) => {
    const members = getMemberList(users);
    unstable_batchedUpdates(() => {
      setUserList(users);
      setSelectedUsers(members);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (isConnect) {
          const userList = await userServices.getGoogleContacts(accessToken, {
            googleAuthorizationEmail,
            action: GetGoogleContactsContext.ONBOARDING_FLOW,
          });
          const users = userList.map((_user) => ({ ..._user, isCustomAvatar: true }));
          setUsers(users);
        }
        if (isNotConnect && !isPopularDomain) {
          const users = await userServices.getUsersSameDomain();
          setUsers(users);
        }
      } catch (error) {
        logger.logError({ error });
      }
    };

    fetchUser();
  }, []);

  return { isLoading };
};

export { useFetchCollaborators };
