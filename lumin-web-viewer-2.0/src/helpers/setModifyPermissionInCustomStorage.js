import get from 'lodash/get';

import getCurrentRole from 'helpers/getCurrentRole';

import { CUSTOM_DATA_COMMENT_HIGHLIGHT, CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import { DOCUMENT_ROLES } from 'constants/lumin-common';

const isCommentAnnotation = (annotation) => {
  const isStickyAnnotation = annotation instanceof window.Core.Annotations.StickyAnnotation;
  const isHighlightForComment =
    annotation instanceof window.Core.Annotations.TextHighlightAnnotation &&
    annotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key);
  return isStickyAnnotation || isHighlightForComment;
};

const isReadonlyAssociatedSignature = (annotation, annotManager) => {
  const signatureWidgetId = annotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key);
  const isStampAnnotation = annotation instanceof window.Core.Annotations.StampAnnotation;
  if (isStampAnnotation && signatureWidgetId) {
    const widget = annotManager.getAnnotationById(signatureWidgetId);
    return widget?.fieldFlags.get('ReadOnly');
  }
  return false;
};

function setModifyPermissionInCustomStorage({ currentUser, currentDocument, annotManager }) {
  if (currentDocument.temporaryEdit) {
    return;
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  const { SPECTATOR, VIEWER, ...canEditRole } = DOCUMENT_ROLES;
  const canEditRoleValueList = Object.values(canEditRole);
  if (!currentDocument || !annotManager) return;
  annotManager.setPermissionCheckCallback((author, annot) => {
    if (isReadonlyAssociatedSignature(annot, annotManager)) {
      return false;
    }
    const isOwnerCommentAnnot = isCommentAnnotation(annot) && author === get(currentUser, 'email', '');
    const currentRole = getCurrentRole(currentDocument);
    const canComment = currentRole === VIEWER && isOwnerCommentAnnot;
    const isModifiedByRole = canEditRoleValueList.includes(currentRole);
    return currentUser && (canComment || isModifiedByRole);
  });
}

export { setModifyPermissionInCustomStorage };
