import { useEffect, useState } from 'react';

import core from 'core';

import { setAnnotationModified } from 'helpers/toggleFormFieldCreationMode';

import { ANNOTATION_ACTION } from 'constants/documentConstants';
import { AI_AUTO_ADDED } from 'constants/formBuildTool';

export function useOnFormFieldAnnotationAddedOrSelected() {
  const [formFieldAnnotation, setFormFieldAnnotation] = useState(null);

  const formFieldCreationManager = core.getFormFieldCreationManager();

  useEffect(() => {
    const onAnnotationChanged = (annotations, action, infoObject) => {
      const annotation = annotations[0];

      if (infoObject?.imported || !formFieldCreationManager.isInFormFieldCreationMode()) {
        return;
      }
      if (annotations.length && annotations[0] instanceof window.Core.Annotations.WidgetAnnotation) {
        switch (action) {
          case ANNOTATION_ACTION.ADD: {
            setFormFieldAnnotation(annotation);
            if (annotations[0].getCustomData(AI_AUTO_ADDED) === 'true') {
              break;
            }

            core.selectAnnotation(annotation);
            break;
          }
          case ANNOTATION_ACTION.MODIFY:
          case ANNOTATION_ACTION.DELETE: {
            setAnnotationModified(true);
            break;
          }
          default: {
            break;
          }
        }
      }
    };

    const onAnnotationSelected = (annotations, action) => {
      if (action === 'selected' && annotations.length && annotations[0] instanceof window.Core.Annotations.WidgetAnnotation) {
        setFormFieldAnnotation(annotations[0]);
      } else {
        setFormFieldAnnotation(null);
      }
    };

    const onFormFieldCreationModeEnded = () => {
      setFormFieldAnnotation(null);
      setAnnotationModified(false);
    };

    core.addEventListener('annotationChanged', onAnnotationChanged);
    core.addEventListener('annotationSelected', onAnnotationSelected);

    formFieldCreationManager.addEventListener('formFieldCreationModeEnded', onFormFieldCreationModeEnded);

    return () => {
      core.removeEventListener('annotationChanged', onAnnotationChanged);
      core.removeEventListener('annotationSelected', onAnnotationSelected);
      formFieldCreationManager.removeEventListener('formFieldCreationModeEnded', onFormFieldCreationModeEnded);
    };
  }, []);

  const resetAnnotation = () => {
    setFormFieldAnnotation(null);
  };

  return { formFieldAnnotation, resetAnnotation };
}
