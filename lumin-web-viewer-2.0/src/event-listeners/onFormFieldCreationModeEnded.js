import { store } from 'src/redux/store';

import core from 'core';

import { formBuilderActions } from 'features/DocumentFormBuild/slices';

import { CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import { NEW_FORM_FIELD_IN_SESSION } from 'constants/formBuildTool';

const { dispatch } = store;

export default () => {
  dispatch(formBuilderActions.setIsInFormBuildMode(false));
  window.Core.Tools.Tool.enableAutoSwitch();
  const annotManager = core.getAnnotationManager();
  core.getTool('AnnotationCreateSignature').removeEventListener('signatureReady.sigWidget');
  const formFieldCreationManager = core.getFormFieldCreationManager();
  core.getAnnotationsList().forEach((annot) => {
    if (
      !formFieldCreationManager.isDiscardChange &&
      annot instanceof window.Core.Annotations.SignatureWidgetAnnotation &&
      annot.element &&
      annot.innerElement
    ) {
      annot.element.removeChild(annot.innerElement);
      annot.element.parentElement.removeChild(annot.element);
      annot.innerElement = null;
      annot.set({ element: null });
    }
    if (annot instanceof window.Core.Annotations.WidgetAnnotation) {
      annot.setCustomData(NEW_FORM_FIELD_IN_SESSION, 'false');
      annot.refresh();
      annotManager.redrawAnnotation(annot);
      return;
    }
    if (
      annot instanceof window.Core.Annotations.StampAnnotation &&
      annot.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key)
    ) {
      annot.Listable = true;
      annotManager.redrawAnnotation(annot);
      return;
    }
    if (annot.TemporaryHidden) {
      annot.Hidden = false;
      annot.TemporaryHidden = false;
      annotManager.redrawAnnotation(annot);
    }
  });
  delete formFieldCreationManager.isDiscardChange;
  core.refreshAll();
  core.updateView();
};
