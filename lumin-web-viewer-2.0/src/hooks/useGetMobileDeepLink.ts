import {
  MOBILE_DEEP_LINK_DEEPLINK_PATH_DATA,
  MOBILE_DEEP_LINK_DESKTOP_URL_DATA,
  MOBILE_DEEP_LINK_VIEWER_OPEN_PATH,
} from 'constants/mobileDeepLinkConstant';
import { MOBILE_DEEP_LINK_URL } from 'constants/urls';

const useGetMobileDeepLink = () => {
  const desktopUrl = window.location.href;
  const encodeDesktopUrl = encodeURIComponent(desktopUrl);
  return `${MOBILE_DEEP_LINK_URL}${MOBILE_DEEP_LINK_VIEWER_OPEN_PATH}?${MOBILE_DEEP_LINK_DEEPLINK_PATH_DATA}=${encodeDesktopUrl}&${MOBILE_DEEP_LINK_DESKTOP_URL_DATA}=${encodeDesktopUrl}`;
};

export default useGetMobileDeepLink;
