import core from 'core';

import { FIELD_VALUE_MAX_LENGTH } from 'constants/formBuildTool';

export default () => () => {
  const selectedAnnots = core.getSelectedAnnotations();
  const freetext = selectedAnnots.find(
    (annot) => annot instanceof window.Core.Annotations.FreeTextAnnotation
  ) as Core.Annotations.FreeTextAnnotation;
  if (!freetext) {
    return;
  }
  const editor = freetext.getEditor();
  if (editor && editor.getContents().length > FIELD_VALUE_MAX_LENGTH) {
    editor.deleteText(FIELD_VALUE_MAX_LENGTH, editor.getContents().length);
  }
};
