import { useViewerMatch } from 'hooks/useViewerMatch';

import { useGetFreeTrialModalCoolDownFlag } from './useGetFreeTrialModalCoolDownFlag';

const useGetOpenFreeTrialOnlyViewer = (): boolean => {
  const { isOnlyShowInViewer } = useGetFreeTrialModalCoolDownFlag();
  const { isViewer } = useViewerMatch();

  return isOnlyShowInViewer && Boolean(isViewer);
};

export { useGetOpenFreeTrialOnlyViewer };
