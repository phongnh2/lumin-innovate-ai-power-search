import { useGetCurrentUser } from 'hooks';

import { isHideAiChatbot } from 'utils/restrictedUserUtil';

export const useRestrictAgreementGenFeatures = () => {
  const currentUser = useGetCurrentUser();
  const isAgreementGenFeaturesRestricted = isHideAiChatbot(currentUser.email);

  return {
    isAgreementGenFeaturesRestricted,
  };
};