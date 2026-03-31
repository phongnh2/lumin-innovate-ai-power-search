import core from 'core';

import { ORIGINAL_URL_KEY, ORIGINAL_URL_CUSTOM_KEY } from 'luminComponents/RubberStampOverlay/constants';

import defaultTool from 'constants/defaultTool';
import toolsName from 'constants/toolsName';

export default (store) => (rubberStampAnnotation) => {
  const { viewer } = store.getState();
  const rubberStampTool = core.getTool(toolsName.RUBBER_STAMP);

  core.setToolMode(defaultTool);
  rubberStampTool.hidePreview();
  core.updateToolMode(toolsName.RUBBER_STAMP);

  const onSingleSignatureMode = async () => {
    core.setToolMode(defaultTool);
    core.selectAnnotation(rubberStampAnnotation);
    rubberStampTool.annot = null;
    rubberStampTool.hidePreview();
  };

  const onMultipleRubberStampMode = async () => {
    const dataForInit = await rubberStampAnnotation.getCustomData('trn-custom-stamp');
    if (dataForInit) {
      const _dataForInit = JSON.parse(dataForInit);
      const annot = await rubberStampTool.createCustomStampAnnotation(_dataForInit);
      await rubberStampTool.setRubberStamp(annot);
    } else {
      const originalUrl = rubberStampAnnotation.getCustomData(ORIGINAL_URL_CUSTOM_KEY);
      rubberStampAnnotation.setCustomData(ORIGINAL_URL_KEY, originalUrl);
      await rubberStampTool.setRubberStamp(rubberStampAnnotation);
    }
    rubberStampTool.showPreview();
    if (!dataForInit) {
      const previewElement = rubberStampTool.getPreviewElement();
      previewElement.dataset.isStandardStamp = true;
    }
  };

  if (viewer.isPlacingMultipleRubberStamp) {
    onMultipleRubberStampMode();
  } else {
    onSingleSignatureMode();
  }
};
