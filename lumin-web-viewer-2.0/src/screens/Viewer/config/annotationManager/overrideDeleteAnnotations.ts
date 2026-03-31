import { TFunction } from 'i18next';

import core from 'core';

import { promptDeleteContentBox } from 'features/EditPDF/utils';

import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';

export const overrideDeleteAnnotations = (t: TFunction) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { deleteAnnotations } = window.Core.AnnotationManager.prototype;

  window.Core.AnnotationManager.prototype.deleteAnnotations = function (annotations, options = {}) {
    const { imported } = options;
    const isInContentEditMode = core.getContentEditManager().isInContentEditMode();
    const isContentEditPlaceholder = annotations.every((annot) => annot.isContentEditPlaceholder());
    const shouldWarningBeforeDelete =
      sessionStorage.getItem(SESSION_STORAGE_KEY.SHOULD_NOT_SHOW_DELETE_CONTENT_BOX_WARNING_MODAL) !== 'true';
    if (isInContentEditMode && shouldWarningBeforeDelete && !imported && isContentEditPlaceholder) {
      promptDeleteContentBox({
        t,
        onConfirm: deleteAnnotations.bind(this, annotations, options) as () => void,
      });
      return;
    }
    deleteAnnotations.call(this, annotations, options);
  };

};
