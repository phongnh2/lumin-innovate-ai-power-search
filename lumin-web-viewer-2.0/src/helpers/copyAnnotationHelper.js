import core from 'core';

import { MAX_ANNOTATIONS_COPY_SIZE, MAX_ANNOTATIONS_COPY_QUANTITY } from 'constants/documentConstants';

export const getStringSize = (str) => (new TextEncoder().encode(str)).length;
export const validateAnnotationsToBeCopied = async () => {
  const annotList = core.getSelectedAnnotations();
  const isInFormFieldCreationMode = core.getFormFieldCreationManager().isInFormFieldCreationMode();
  const isQuantityConditionVerified = annotList.length <= MAX_ANNOTATIONS_COPY_QUANTITY;

  if (isInFormFieldCreationMode) {
    return isQuantityConditionVerified;
  }

  const exportedAnnotationXFDF = await core.exportAnnotations({ annotList });
  const isSizeConditionVerified = getStringSize(exportedAnnotationXFDF) <= MAX_ANNOTATIONS_COPY_SIZE;
  return isSizeConditionVerified && isQuantityConditionVerified;
};
