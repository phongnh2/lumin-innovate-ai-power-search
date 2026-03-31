import exportAnnotationCommand from 'helpers/exportAnnotationCommand';
import logger from 'helpers/logger';

import { getWidgetXfdf } from 'utils/formBuildUtils';

import { annotationSyncQueue } from 'features/AnnotationSyncQueue';

import { ANNOTATION_ACTION, AnnotationSubjectMapping } from 'constants/documentConstants';
import { LOGGER } from 'constants/lumin-common';

import type { IDocumentBase } from 'interfaces/document/document.interface';
import type { IUser } from 'interfaces/user/user.interface';

interface TempActionForAnnotation {
  action?: string;
  xfdf?: string;
  type?: string;
}

interface EmitUnsavedAnnotationsParams {
  annotations: Core.Annotations.Annotation[];
  currentDocument: IDocumentBase;
  currentUser: IUser;
  tempAction?: TempActionForAnnotation;
}

/**
 * Emits unsaved annotations to server for backup/sync
 * @param params - Parameters object
 * @param params.annotations - Array of annotations to emit
 * @param params.currentDocument - Current document object
 * @param params.currentUser - Current user object
 * @param params.tempAction - Temp action containing XFDF and action information
 * @returns Promise<void>
 */
const emitUnsavedAnnotations = async ({
  annotations,
  currentDocument,
  currentUser,
  tempAction,
}: EmitUnsavedAnnotationsParams): Promise<void> => {
  if (!annotations || !annotations.length || !currentDocument || !currentUser) {
    return;
  }

  try {
    const emitDataList = [];

    // Determine the annotation action from tempAction or XFDF content
    let annotationAction = ANNOTATION_ACTION.ADD; // default

    if (tempAction && tempAction.action) {
      annotationAction = tempAction.action;
    } else if (tempAction && tempAction.xfdf) {
      // Parse XFDF to detect delete operations
      if (tempAction.xfdf.includes('<delete>') && tempAction.xfdf.includes('</delete>')) {
        annotationAction = ANNOTATION_ACTION.DELETE;
      } else if (tempAction.xfdf.includes('<modify>') && tempAction.xfdf.includes('</modify>')) {
        annotationAction = ANNOTATION_ACTION.MODIFY;
      }
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const annotation of annotations) {
      const xfdf = exportAnnotationCommand(annotation, annotationAction);
      let annotationType = annotation.Subject || 'unknown';

      if (annotationAction === ANNOTATION_ACTION.DELETE && annotation.Subject !== AnnotationSubjectMapping.stickyNote) {
        annotationType = AnnotationSubjectMapping.removal;
      }

      const emitData = {
        xfdf,
        annotationId: annotation.Id,
        annotationType,
        annotationAction,
        userId: currentUser._id,
        email: currentUser.email,
        pageIndex: annotation.PageNumber - 1, // Convert to 0-based index
      };

      if (annotation.Subject === AnnotationSubjectMapping.widget) {
        // eslint-disable-next-line no-await-in-loop
        const widgetXfdf = await getWidgetXfdf(true);
        emitData.xfdf = widgetXfdf;
        emitData.annotationId = currentDocument._id;
        emitData.annotationType = AnnotationSubjectMapping.widget;
      }

      emitDataList.push(emitData);
    }

    if (emitDataList.length > 0) {
      annotationSyncQueue.addAnnotations(currentDocument._id, emitDataList).catch((err) => {
        logger.logError({
          reason: LOGGER.Service.PDFTRON,
          error: err,
          message: 'Failed to add annotations to sync queue',
        });
      });
      logger.logInfo({
        reason: LOGGER.Service.PDFTRON,
        message: `Emitted ${emitDataList.length} unsaved annotations (${annotationAction}) to server for document ${currentDocument._id}`,
      });
    }
  } catch (error) {
    logger.logError({
      reason: LOGGER.Service.PDFTRON,
      error: error as Error,
      message: 'Failed to emit unsaved annotations to server',
    });
  }
};

export default emitUnsavedAnnotations;
