export class WarningBannersController {
  private closedBanners: Record<string, boolean> = {};

  private nextBanner = '';

  getState() {
    return {
      closedBanners: this.closedBanners,
      nextBanner: this.nextBanner,
      isBannerClosed: Object.keys(this.closedBanners).length > 0,
    };
  }

  setBannerClosed(banner: string) {
    this.closedBanners[banner] = true;
  }

  setNextBanner(banner: string) {
    this.nextBanner = banner;
  }

  reset() {
    this.closedBanners = {};
    this.nextBanner = '';
  }
}

const warningBannerController = new WarningBannersController();

const useWarningBannerController = () => warningBannerController;

export default useWarningBannerController;
