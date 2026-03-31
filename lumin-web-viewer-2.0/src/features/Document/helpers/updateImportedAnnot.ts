import core from 'core';

import logger from 'helpers/logger';
import setRichTextStyle from 'helpers/setRichTextStyle';

import formBuildUtils from 'utils/formBuildUtils';

import { updateAnnotationAvatarSource } from 'features/Annotation/utils/updateAnnotationAvatarSource';

import { CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import { ANNOTATION_ACTION } from 'constants/documentConstants';
import { LOGGER } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IUser } from 'interfaces/user/user.interface';

declare global {
  interface Window {
    Annotations: typeof Core.Annotations;
  }
}
type ImportedAnnotParams = {
  annotationId: string;
  xfdf: string;
  action?: keyof typeof ANNOTATION_ACTION;
};

type FieldFlags = Core.Annotations.WidgetFlags & { clear: () => void };

async function handleLegacyFormField(annotManager: Core.AnnotationManager, xfdf: string) {
  const fieldManager = annotManager.getFieldManager();
  const annots = core.getAnnotationsList();
  const widgetAnnotations = annots.filter((annot) => annot instanceof window.Core.Annotations.WidgetAnnotation);
  fieldManager.getFields().forEach((field: Core.Annotations.Forms.Field) => (field.flags as FieldFlags).clear());
  const associatedSignatures = core
    .getAnnotationsList()
    .filter(
      (annot) =>
        annot instanceof window.Core.Annotations.StampAnnotation &&
        annot.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key)
    );
  /*
    We need to delete associated signatures manually with imported option.
    If we don't do this, when we delete widgets, it will delete signature without imported option.
  */
  annotManager.deleteAnnotation(associatedSignatures, { imported: true });
  annotManager.deleteAnnotations(widgetAnnotations, { imported: true });
  annotManager.addAnnotations(associatedSignatures, { imported: true });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const importedWidgets = await annotManager.importAnnotations(formBuildUtils.increasePageNumberXfdf(xfdf), {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    replace: window.Core.Annotations.WidgetAnnotation,
  });
  await annotManager.drawAnnotationsFromList(importedWidgets as unknown as Core.Annotations.Annotation[]);
  return importedWidgets as Core.Annotations.WidgetAnnotation[];
}

const updateImportedAnnot = async ({
  row,
  currentDocument,
  currentUser,
  callback = () => {},
}: {
  row: ImportedAnnotParams;
  currentDocument: IDocumentBase;
  currentUser: IUser;
  callback: () => void;
}): Promise<Core.Annotations.WidgetAnnotation[] | Core.Annotations.Annotation[]> => {
  const annotManager = core.getAnnotationManager();
  try {
    const { annotationId, xfdf } = row;
    if (annotationId && annotationId === currentDocument._id) {
      /*  Interactive form field */
      return await handleLegacyFormField(annotManager, xfdf);
    }
    /*
        Need to remove \x08 from xfdf string due to issue LMV-3381.
      */
    // eslint-disable-next-line no-control-regex
    const validXfdf = xfdf.replace(/\x08/g, '');
    const annotations = await annotManager.importAnnotationCommand(validXfdf);
    const annotationsUpdated = annotations.map((annot) => {
      updateAnnotationAvatarSource({ annotation: annot, currentUser });
      setRichTextStyle(annot);

      /* ERROR ELLIPSE ROTATE WITH CORE VERSION 8.0.1.x  */
      if (annot instanceof window.Core.Annotations.EllipseAnnotation) {
        annot.disableRotationControl();
      }
      /* END */
      if (annot instanceof window.Core.Annotations.Link) {
        const groupedAnnotations = annotManager.getGroupAnnotations(annot);
        const otherAnnotation = groupedAnnotations.find(
          (groupedAnnot) => groupedAnnot.Id !== annot.Id && !(groupedAnnot instanceof window.Core.Annotations.Link)
        );
        annot.NoResize = true;
        annot.NoMove = otherAnnotation?.NoMove ?? true;
      }
      return annot;
    });
    annotManager.drawAnnotationsFromList(annotationsUpdated) as Promise<unknown>;
    return annotationsUpdated;
  } catch (e) {
    logger.logError({
      reason: LOGGER.Service.PDFTRON,
      error: e as { message: string },
    });
  } finally {
    callback();
  }
};

export default updateImportedAnnot;
