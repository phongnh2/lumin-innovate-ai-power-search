import { useSelector } from 'react-redux';

import { COMPRESS_RESOLUTION } from '../constants';
import { compressPdfSelectors } from '../slices';
import { CompressOptionsType } from '../types';

export const useGetCompressOptions = (): CompressOptionsType => {
  const compressLevel = useSelector(compressPdfSelectors.getCompressLevel);
  const { isDownSample, dpiImage, isEmbedFont, isSubsetFont, removeAnnotation, removeDocInfo } = useSelector(
    compressPdfSelectors.getCompressOptions
  );

  switch (compressLevel) {
    case COMPRESS_RESOLUTION.MAXIMUM:
      return {
        isDownSample,
        dpiImage,
        isEmbedFont,
        isSubsetFont,
        removeAnnotation,
        removeDocInfo,
      };
    case COMPRESS_RESOLUTION.STANDARD:
      return {
        isDownSample: true,
        dpiImage: 150,
        isEmbedFont: true,
        isSubsetFont: true,
        removeAnnotation: false,
        removeDocInfo: false,
      };
    default:
      return null;
  }
};
