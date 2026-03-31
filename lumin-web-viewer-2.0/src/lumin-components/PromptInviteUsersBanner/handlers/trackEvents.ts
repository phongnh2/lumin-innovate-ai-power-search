import bannerEvent, { BannerName, BannerPurpose } from 'utils/Factory/EventCollection/BannerEventCollection';

import { InviteBannerType } from 'constants/organizationConstants';

type BannerEventParams = {
  bannerName: string;
  bannerPurpose: string;
};

class TrackBannerEventHandlers {
  private readonly bannerEventParams: BannerEventParams;

  constructor(bannerType: string) {
    this.bannerEventParams = {
      [InviteBannerType.GOOGLE_CONTACT]: {
        bannerName: BannerName.PROMPT_TO_INVITE,
        bannerPurpose: BannerPurpose[BannerName.PROMPT_TO_INVITE],
      },
      [InviteBannerType.INVITE_MEMBER]: {
        bannerName: BannerName.GENERAL_INVITE_MEMBERS,
        bannerPurpose: BannerPurpose[BannerName.GENERAL_INVITE_MEMBERS],
      },
      [InviteBannerType.PENDING_REQUEST]: {
        bannerName: BannerName.ACCEPT_PENDING_REQUEST,
        bannerPurpose: BannerPurpose[BannerName.ACCEPT_PENDING_REQUEST],
      },
    }[bannerType];
  }

  public async view(): Promise<void> {
    await bannerEvent.bannerViewed(this.bannerEventParams);
  }

  public async dismiss(): Promise<void> {
    await bannerEvent.bannerDismiss(this.bannerEventParams);
  }

  public async confirm(): Promise<void> {
    await bannerEvent.bannerConfirmation(this.bannerEventParams);
  }
}

export default TrackBannerEventHandlers;
