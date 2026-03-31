import { useEffect } from 'react';

import useGetOrganizationData from 'hooks/useGetOrganizationData';

import type { UsePromptInviteUsersBannerHandlerData } from './usePromptInviteUsersHandler';
import { localStorageHandlers, TrackBannerEventHandlers } from '../handlers';

type UseTrackBannerViewEventProps = Pick<
  UsePromptInviteUsersBannerHandlerData,
  'isShowBanner' | 'canShowBanner' | 'promptUsersData'
>;

const useTrackBannerViewEvent = ({
  isShowBanner,
  canShowBanner,
  promptUsersData,
}: UseTrackBannerViewEventProps): void => {
  const currentOrganization = useGetOrganizationData();

  useEffect(() => {
    const currentOrgId = currentOrganization?._id;
    const bannerType = promptUsersData?.bannerType;
    const orgId = promptUsersData?.orgId;
    if (!currentOrgId || !canShowBanner || !isShowBanner || !bannerType || currentOrgId !== orgId) return;

    const isShowByOrg = localStorageHandlers.getDisplayStatus(currentOrgId);
    if (!isShowByOrg) return;

    const trackBannerEventHandlers = new TrackBannerEventHandlers(bannerType);

    trackBannerEventHandlers.view().finally(() => {});
  }, [currentOrganization?._id, promptUsersData, isShowBanner, canShowBanner]);
};

export default useTrackBannerViewEvent;
