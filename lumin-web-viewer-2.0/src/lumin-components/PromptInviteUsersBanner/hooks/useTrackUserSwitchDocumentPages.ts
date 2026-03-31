import { useEffect } from 'react';
import { useLocation, useMatch } from 'react-router-dom';

import useGetOrganizationData from 'hooks/useGetOrganizationData';

import { LocalStorageKey } from 'constants/localStorageKey';
import { ROUTE_MATCH } from 'constants/Routers';

import type { UsePromptInviteUsersBannerHandlerData } from './usePromptInviteUsersHandler';
import { cachingHandlers, localStorageHandlers } from '../handlers';

type UseTrackUserSwitchDocumentPagesProps = Pick<
  UsePromptInviteUsersBannerHandlerData,
  'setCurrentOrgId' | 'getPromptGoogleUsersHandler' | 'setIsShowBanner' | 'setPromptUsersData' | 'setIsFetching'
>;

const useTrackUserSwitchDocumentPages = ({
  setCurrentOrgId,
  getPromptGoogleUsersHandler,
  setIsShowBanner,
  setPromptUsersData,
  setIsFetching,
}: UseTrackUserSwitchDocumentPagesProps): void => {
  const { pathname } = useLocation();
  const currentOrganization = useGetOrganizationData();
  const isDocumentTransitionRoute = Boolean(useMatch({ path: ROUTE_MATCH.ORG_DOCUMENT }));

  // When user switch between Circles
  useEffect(() => {
    if (!isDocumentTransitionRoute) {
      setIsFetching(true);
    }
    const orgId = currentOrganization?._id;
    if (orgId && !isDocumentTransitionRoute) {
      let forceUpdate = false;

      setCurrentOrgId(orgId);

      const cachedData = cachingHandlers.get(orgId);
      const isShow = localStorageHandlers.getDisplayStatus(orgId);

      if (isShow) {
        if (cachedData) {
          setPromptUsersData(cachedData);
        } else {
          localStorageHandlers.removeExpirationTime(orgId);
        }
      }

      const isUserOpenFileFromGoogleDrive = localStorage.getItem(
        LocalStorageKey.FORCE_UPDATE_PROMPT_INVITE_SHARED_USERS
      );
      if (isUserOpenFileFromGoogleDrive) {
        forceUpdate = true;
        localStorage.removeItem(LocalStorageKey.FORCE_UPDATE_PROMPT_INVITE_SHARED_USERS);
      }

      setIsShowBanner(isShow);
      getPromptGoogleUsersHandler({ orgId, forceUpdate }).finally(() => {});
    }

    return () => {
      setCurrentOrgId('');
    };
  }, [currentOrganization?._id, pathname]);
};

export default useTrackUserSwitchDocumentPages;
