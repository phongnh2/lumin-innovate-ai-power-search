import { store } from 'src/redux/store';

import core from 'core';

import { hideNonWidgetAnnotations } from 'helpers/hideNonWidgetAnnotations';

import { formBuilderActions } from 'features/DocumentFormBuild/slices';

import { NEW_FORM_FIELD_IN_SESSION } from 'constants/formBuildTool';

const { dispatch } = store;

export default () => {
  dispatch(formBuilderActions.setIsInFormBuildMode(true));
  window.Core.Tools.Tool.disableAutoSwitch();
  core.deselectAllAnnotations();
  const annotations = core.getAnnotationsList();
  annotations.forEach((annot) => {
    if (annot instanceof window.Core.Annotations.WidgetAnnotation) {
      annot.setCustomData(NEW_FORM_FIELD_IN_SESSION, 'false');
    }
  });
  hideNonWidgetAnnotations({ annotations });
};
