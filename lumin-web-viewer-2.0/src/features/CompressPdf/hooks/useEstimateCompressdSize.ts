import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { bytesToSize } from 'utils';

import { COMPRESS_RESOLUTION } from '../constants';

export const useEstimateCompressedSize = (level: string): string => {
  const { t } = useTranslation();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);

  const estimatedContent = (size: number) => {
    if (level === COMPRESS_RESOLUTION.NONE) {
      return bytesToSize(size);
    }
    return `${t('viewer.compressPdf.estimated')} ${bytesToSize(size)}`;
  };

  const estimateSize = () => {
    switch (level) {
      case COMPRESS_RESOLUTION.MAXIMUM:
        return currentDocument.size * 0.4;
      case COMPRESS_RESOLUTION.STANDARD:
        return currentDocument.size * 0.7;
      default:
        return currentDocument.size;
    }
  };

  return estimatedContent(estimateSize());
};
