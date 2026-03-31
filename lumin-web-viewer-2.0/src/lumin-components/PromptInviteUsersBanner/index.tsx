import React from 'react';

import useTrackBannerViewEvent from './hooks/useTrackBannerViewEvent';
import PromptInviteUsersBanner from './PromptInviteUsersBanner';
import { PromptInviteUsersBannerContainerProps } from './PromptInviteUsersBanner.types';

export default function PromptInviteUsersBannerContainer({
  loading,
  content,
  onClose,
  onPreview,
  actionButtonText,
  inviteUserAvatars,
  promptUsersData,
  isShowBanner,
  canShowBanner,
}: PromptInviteUsersBannerContainerProps): JSX.Element {
  useTrackBannerViewEvent({ isShowBanner, canShowBanner, promptUsersData });

  return canShowBanner && isShowBanner ? (
    <PromptInviteUsersBanner
      loading={loading}
      content={content}
      onClose={onClose}
      onPreview={onPreview}
      actionButtonText={actionButtonText}
      inviteUserAvatars={inviteUserAvatars}
    />
  ) : null;
}
