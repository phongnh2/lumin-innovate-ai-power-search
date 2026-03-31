import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';
import { useShallowSelector } from 'hooks/useShallowSelector';

import { general } from 'constants/documentType';
import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export function useEnabledChatBot() {
  const isOffline = useSelector(selectors.isOffline);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const isPdfFile = currentDocument?.mimeType === general.PDF;
  const isLocalFile = currentDocument?.isSystemFile;

  const { isOn: isEnabledChatBot, loading: isLoading } = useGetFeatureIsOn({
    key: FeatureFlags.AI_CHATBOT,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    enabled: isEnabledChatBot && !isOffline && !isLocalFile && isPdfFile && !!currentUser,
    isLoading,
  };
}
