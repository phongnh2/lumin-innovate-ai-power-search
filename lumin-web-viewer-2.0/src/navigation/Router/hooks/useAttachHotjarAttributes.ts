import { useEffect } from 'react';

import { useEnableWebReskin } from 'hooks';

import { attachUserAttributes } from 'utils/hotjarUtils';

import { useGetHotjarAttributes } from 'features/CNC/hooks';
import { useCheckHotjarAttributesLoaded } from 'features/CNC/hooks/useCheckHotjarAttributesLoaded';

export const useAttachHotjarAttributes = () => {
  const { isEnableReskin } = useEnableWebReskin();
  const commonHotjarAttributes = useGetHotjarAttributes();
  const hasLoadedHotjarAttributes = useCheckHotjarAttributesLoaded();
  useEffect(() => {
    if (hasLoadedHotjarAttributes) {
      attachUserAttributes({ isEnableReskin, ...commonHotjarAttributes });
    }
  }, [isEnableReskin, commonHotjarAttributes, hasLoadedHotjarAttributes]);
};
