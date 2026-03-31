import dayjs from 'dayjs';

import { Routers } from 'constants/Routers';
import { ENABLE_NEW_AUTHEN_DATE } from 'constants/urls';

import { UserUtilities } from './Factory/User';
import { getLanguageFromUrl } from './getLanguage';

const redirectList = [Routers.JOIN_YOUR_ORGANIZATIONS, Routers.INVITE_LINK];

const isExceptPage = () => {
  const languageFromUrl = getLanguageFromUrl();
  return redirectList.some((route) => {
    const joinOrgsPathWithLanguage = languageFromUrl ? `/${languageFromUrl + route}` : route;
    return window.location.pathname.startsWith(joinOrgsPathWithLanguage);
  });
};

export const hasUserCreatedAfterLaunchNewAuthen = (user) => {
  const { createdAt } = user;
  const userCreatedDate = dayjs(createdAt);
  const enabledFeatureDate = dayjs(ENABLE_NEW_AUTHEN_DATE);

  return enabledFeatureDate.isBefore(userCreatedDate);
};

export const isUserNeedToJoinOrg = (user) => {
  const { hasJoinedOrg } = user;
  const userUtilities = new UserUtilities({ user });

  return hasUserCreatedAfterLaunchNewAuthen(user) && !hasJoinedOrg && userUtilities.isFree();
};

export const isUserInNewAuthenTestingScope = (user) => isUserNeedToJoinOrg(user) && !isExceptPage();
