import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export const useEnabledWebChatbot = () => {
  const isOffline = useSelector(selectors.isOffline);
  const { isOn: enabledWebChatbot, loading } = useGetFeatureIsOn({
    key: FeatureFlags.WEB_AI_CHATBOT,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    enabledWebChatbot: enabledWebChatbot && !isOffline,
    loading,
  };
};
