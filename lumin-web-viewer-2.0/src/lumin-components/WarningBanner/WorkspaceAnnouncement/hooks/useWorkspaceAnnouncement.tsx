import { useEffect, useState } from 'react';

import { useSignDocListMatch } from 'hooks';
import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import { userServices } from 'services';

import logger from 'helpers/logger';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';
import { LocalStorageKey } from 'constants/localStorageKey';
import { LOGGER } from 'constants/lumin-common';

export const useWorkspaceAnnouncement = (): {
  shouldShowBanner: boolean;
  handleCloseBanner: () => void;
} => {
  const { isOn: signWorkspaceAnnouncementEnabled } = useGetFeatureIsOn({
    key: FeatureFlags.SIGN_WORKSPACE_ANNOUNCEMENT,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  const currentUser = useGetCurrentUser();

  const isClosedWorkspaceAnnouncement = (
    JSON.parse(localStorage.getItem(LocalStorageKey.HAS_CLOSED_WORKSPACE_ANNOUNCEMENT) || '[]') as string[]
  ).includes(currentUser?._id);

  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(isClosedWorkspaceAnnouncement);

  const { isInSignDocListPage } = useSignDocListMatch();

  const shouldShowBanner = Boolean(
    signWorkspaceAnnouncementEnabled && currentUser && !isBannerDismissed && isInSignDocListPage
  );

  const handleCloseBanner = async (): Promise<void> => {
    try {
      setIsBannerDismissed(true);
      const userIds = JSON.parse(
        localStorage.getItem(LocalStorageKey.HAS_CLOSED_WORKSPACE_ANNOUNCEMENT) || '[]'
      ) as string[];
      userIds.push(currentUser?._id);
      localStorage.setItem(LocalStorageKey.HAS_CLOSED_WORKSPACE_ANNOUNCEMENT, JSON.stringify(userIds));
      await userServices.dismissWorkspaceBanner();
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.WORKSPACE_ANNOUNCEMENT,
        message: 'Failed to dismiss workspace announcement banner',
        error: error as Error,
      });
    }
  };

  useEffect(() => {
    if (!signWorkspaceAnnouncementEnabled || !currentUser) {
      const userIds = JSON.parse(
        localStorage.getItem(LocalStorageKey.HAS_CLOSED_WORKSPACE_ANNOUNCEMENT) || '[]'
      ) as string[];
      const filteredUserIds = userIds.filter((id: string) => id !== currentUser?._id);
      localStorage.setItem(LocalStorageKey.HAS_CLOSED_WORKSPACE_ANNOUNCEMENT, JSON.stringify(filteredUserIds));
      setIsBannerDismissed(false);
    }
  }, [signWorkspaceAnnouncementEnabled, currentUser]);

  return {
    shouldShowBanner,
    handleCloseBanner,
  };
};
