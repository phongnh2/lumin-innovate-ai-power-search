import { useSelector } from 'react-redux';

import { useChatbotStore } from 'features/EditorChatBot/hooks/useChatbotStore';
import { selectors } from 'features/EditorChatBot/slices';

const useGetResponseAction = () => {
  const hasGeneratedOutlines = useChatbotStore((state) => state.hasGeneratedOutlines);
  const hasSplitExtractPages = useSelector(selectors.getSplitExtractPages).length > 0;
  const splitExtractPages = useSelector(selectors.getSplitExtractPages);
  const toolCalling = useSelector(selectors.getLatestToolCalling);

  return {
    isShowButtonAction: hasGeneratedOutlines || hasSplitExtractPages,
    pagesToExtract: splitExtractPages,
    toolCalling,
  };
};

export default useGetResponseAction;
