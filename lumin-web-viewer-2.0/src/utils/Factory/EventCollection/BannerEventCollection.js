import { AWS_EVENTS } from 'constants/awsEvents';

import { EventCollection } from './EventCollection';

export const BannerName = {
  DESKTOP_APP_DOWNLOAD_IN_RIGHT_BANNER: 'desktopAppDownoadInRightBanner',
  BILLING_WARNING_IN_TOP_BANNER: 'billingWarningTopBanner',
  DELETE_ACCOUNT_WARNING_IN_TOP_BANNER: 'deleteAccountWarningTopBanner',
  DELETE_CIRCLE_WARNING_IN_TOP_BANNER: 'deleteCircleWarningTopBanner',
  PROMPT_TO_INVITE: 'promptToInvite',
  ACCEPT_PENDING_REQUEST: 'acceptPendingRequest',
  GENERAL_INVITE_MEMBERS: 'generalInviteMembers',
  INTRODUCE_INVITE_LINK: 'introduceInviteLink',
  SIGN_WORKSPACE_ANNOUNCEMENT: 'signWorkspaceAnnouncement',
  INFORM_LEGACY_SUBSCRIPTION_TRANSITION: 'informLegacySubscriptionTransition',
  BILLING_WARNING_UNPAID: 'billingWarningUnpaidTopBanner',
};

export const BannerPurpose = {
  [BannerName.DESKTOP_APP_DOWNLOAD_IN_RIGHT_BANNER]: 'Prompt user download desktop app in right banner',
  [BannerName.BILLING_WARNING_IN_TOP_BANNER]: 'Prompt users when have warning payment in header banner',
  [BannerName.DELETE_ACCOUNT_WARNING_IN_TOP_BANNER]: 'Prompt users when account will be deleted',
  [BannerName.DELETE_CIRCLE_WARNING_IN_TOP_BANNER]: 'Prompt users when circle will be deleted',
  [BannerName.PROMPT_TO_INVITE]: 'Prompt users to invite more collaborators',
  [BannerName.ACCEPT_PENDING_REQUEST]: 'Prompt users to accept pending Circle requests',
  [BannerName.GENERAL_INVITE_MEMBERS]: 'Prompt users to invite more collaborators',
  [BannerName.INTRODUCE_INVITE_LINK]: 'Top banner introduces the Invite link feature',
  [BannerName.SIGN_WORKSPACE_ANNOUNCEMENT]: 'Announce Workspace in Lumin Sign',
  [BannerName.BILLING_WARNING_UNPAID]: 'Prompt users when they have an Unpaid payment',
};

export class BannerEventCollection extends EventCollection {
  bannerViewed({ bannerName, bannerPurpose }) {
    const attributes = {
      bannerName,
      bannerPurpose,
    };
    return this.record({
      name: AWS_EVENTS.BANNER.VIEWED,
      attributes,
    });
  }

  bannerDismiss({ bannerName, bannerPurpose }) {
    const attributes = {
      bannerName,
      bannerPurpose,
    };
    return this.record({
      name: AWS_EVENTS.BANNER.DISMISS,
      attributes,
    });
  }

  bannerConfirmation({ bannerName, bannerPurpose }) {
    const attributes = {
      bannerName,
      bannerPurpose,
    };
    return this.record({
      name: AWS_EVENTS.BANNER.CONFIRMATION,
      attributes,
    });
  }

  bannerHidden({ bannerName, bannerPurpose }) {
    const attributes = {
      bannerName,
      bannerPurpose,
    };
    return this.record({
      name: AWS_EVENTS.BANNER.HIDDEN,
      attributes,
    });
  }
}

export default new BannerEventCollection();
