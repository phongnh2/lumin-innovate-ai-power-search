import core from 'core';

import defaultTool from 'constants/defaultTool';
import toolsName from 'constants/toolsName';

export default (store) => async (signatureAnnotation) => {
  const { viewer } = store.getState();
  core.updateToolMode(toolsName.SIGNATURE);
  const signatureTool = core.getTool(toolsName.SIGNATURE);

  const onSingleSignatureMode = async () => {
    core.setToolMode(defaultTool);
    core.selectAnnotation(signatureAnnotation);
    signatureTool.annot = null;
    signatureTool.hidePreview();
  };

  const onMultipleSignaturesMode = async () => {
    await signatureTool.setSignature(viewer.selectedSignature);
    signatureTool.showPreview();
  };

  if (viewer.isPlacingMultipleSignatures) {
    onMultipleSignaturesMode();
  } else {
    onSingleSignatureMode();
  }
};
