import RateLuminImage from 'assets/images/rate-lumin.svg';
import TemplateDiscoveryImage from 'assets/images/template-discovery.svg';
import UploadDocumentImage from 'assets/images/upload-document.svg';

import { BannerType } from 'constants/banner';
import { GOOGLE_RATE_LUMIN_LINK } from 'constants/socialNetwork';
import { STATIC_PAGE_URL } from 'constants/urls';

const getCommonBanner = (t) => ({
  [BannerType.RATE_LUMIN]: {
    id: BannerType.RATE_LUMIN,
    bannerClass: 'rateLumin',
    bannerImage: RateLuminImage,
    mainTitle: '',
    subTitle: t('banner.rateLumin.subTitle'),
    btnData: {
      btnContent: t('common.rateNow'),
      href: GOOGLE_RATE_LUMIN_LINK,
      state: {},
    },
  },
  [BannerType.UPLOAD_DOCUMENT]: {
    id: BannerType.UPLOAD_DOCUMENT,
    bannerClass: 'uploadDocument',
    bannerImage: UploadDocumentImage,
    mainTitle: '',
    subTitle: t('banner.uploadDocument.subTitle'),
    btnData: {
      btnContent: t('common.uploadNow'),
      state: {},
    },
  },
  [BannerType.INTRODUCE_TEMPLATES]: {
    id: BannerType.INTRODUCE_TEMPLATES,
    bannerClass: 'introduceTemplates',
    bannerImage: TemplateDiscoveryImage,
    mainTitle: t('banner.introduceTemplates.mainTitle'),
    subTitle: t('banner.introduceTemplates.subTitle'),
    btnData: {
      btnContent: t('common.discoverNow'),
      href: `${STATIC_PAGE_URL}/form-templates`,
      state: {},
    },
  },
});

export default getCommonBanner;
