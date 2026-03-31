import { useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

import { useHomeMatch, useGetCurrentUser } from 'hooks';

import { isHideAiChatbot as isHideAiChatbotUtil } from 'utils/restrictedUserUtil';

import { ROUTE_MATCH } from 'constants/Routers';

import { useEnabledWebChatbot } from './useEnabledWebChatbot';

const useShowWebChatbot = () => {
  const location = useLocation();
  const { isHomePage } = useHomeMatch();
  const { enabledWebChatbot } = useEnabledWebChatbot();
  const currentUser = useGetCurrentUser();
  const isHideAiChatbot = isHideAiChatbotUtil(currentUser.email);
  const isOrgDocument = Boolean(matchPath({ path: ROUTE_MATCH.ORG_DOCUMENT, end: false }, location.pathname));

  const isShowWebChatbot = useMemo(
    () => !isHideAiChatbot && enabledWebChatbot && (isHomePage || isOrgDocument),
    [enabledWebChatbot, isHomePage, isOrgDocument]
  );

  return {
    isShowWebChatbot,
  };
};

export default useShowWebChatbot;
