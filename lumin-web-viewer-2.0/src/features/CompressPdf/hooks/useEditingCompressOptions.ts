import { isEqual } from 'lodash';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { compressPdfActions, compressPdfSelectors } from '../slices';

export const useEditingCompressOptions = () => {
  const dispatch = useDispatch();
  const compressOptions = useSelector(compressPdfSelectors.getCompressOptions);
  const previousCompressOptions = useRef(compressOptions);

  const [isDownSample, setIsDownSample] = useState<boolean>(compressOptions.isDownSample);
  const [dpiImage, setDpiImage] = useState<number>(compressOptions.dpiImage);
  const [isEmbedFont, setIsEmbedFont] = useState<boolean>(compressOptions.isEmbedFont);
  const [isSubsetFont, setIsSubsetFont] = useState<boolean>(compressOptions.isSubsetFont);
  const [removeAnnotation, setRemoveAnnotation] = useState<boolean>(compressOptions.removeAnnotation);
  const [removeDocInfo, setRemoveDocInfo] = useState<boolean>(compressOptions.removeDocInfo);

  const onSaveCompressOptions = () => {
    dispatch(
      compressPdfActions.setCompressOptions({
        isDownSample,
        dpiImage: isDownSample ? dpiImage : 96,
        isEmbedFont,
        isSubsetFont: isEmbedFont ? isSubsetFont : false,
        removeAnnotation,
        removeDocInfo,
      })
    );
    dispatch(compressPdfActions.setIsEditingCompressOptions(false));
  };

  const onCancelEditingCompressOptions = () => {
    dispatch(compressPdfActions.setIsEditingCompressOptions(false));
  };

  const isDisabledSaveButton = isEqual(previousCompressOptions.current, {
    isDownSample,
    dpiImage,
    isEmbedFont,
    isSubsetFont,
    removeAnnotation,
    removeDocInfo,
  });

  return {
    isDownSample,
    dpiImage,
    isEmbedFont,
    isSubsetFont,
    removeAnnotation,
    removeDocInfo,
    isDisabledSaveButton,
    setIsDownSample,
    setDpiImage,
    setIsEmbedFont,
    setIsSubsetFont,
    setRemoveAnnotation,
    setRemoveDocInfo,
    onSaveCompressOptions,
    onCancelEditingCompressOptions,
  };
};
