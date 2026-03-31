import { environment } from '@/configs/environment';

import { isDesktopApp } from './is-desktop-app';

export const openDesktopApp = (path: string) => {
  window.open(path, '_self');
};

const isInternalAppNavigation = (url: string): boolean => {
  const { appUrl, authUrl } = environment.public.host;
  return url.startsWith(appUrl) || url.startsWith(authUrl);
};

export const navigateToUrl = (url: string) => {
  if (isDesktopApp() && isInternalAppNavigation(url)) {
    openDesktopApp(url);
    return;
  }
  window.location.href = url;
};
