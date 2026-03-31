interface BannerData {
  shouldShowBanner: boolean;
  selectedBanner: {
    position: string;
    title: string;
    btnData: { btnContent: string; btnDirectTo: string; btnDirectToNewTab?: boolean };
    bannerEvent: { bannerName: string; bannerPurpose: string };
    startIcon?: React.ReactNode;
  };
  onClickBannerLink: () => void;
  onClickCloseBanner: () => void;
}

declare const useBannerData: () => BannerData;

export default useBannerData;