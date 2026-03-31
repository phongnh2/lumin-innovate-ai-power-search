import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import core from 'core';
import selectors from 'selectors';

import { commandHandler } from 'HOC/OfflineStorageHOC';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import documentServices from 'services/documentServices';
import { socketService } from 'services/socketServices';

import { completeSaveOperation, startSaveOperation } from 'utils/saveOperationUtils';

import { Manipulation } from 'features/DocumentFormBuild';
import { CropPageAction } from 'features/DocumentFormBuild/manipulation/crop';

import { ANNOTATION_ACTION } from 'constants/documentConstants';
import { SAVE_OPERATION_STATUS, SAVE_OPERATION_TYPES } from 'constants/saveOperationConstants';

import { useUndoCropHandlers } from './useUndoCropHandlers';
import { useUpdateCroppedThumbs } from './useUpdateCroppedThumbs';
import { CropDimensionType, CropTypeOption } from '../types';
import { deleteCroppedAnnotations } from '../utils/deleteCroppedAnnotations';
import { getCroppedAnnotations } from '../utils/getCroppedAnnotations';

interface UseCropManipulationParams {
  cropType: CropTypeOption;
  cropDimension: CropDimensionType;
}

interface PageWillBeCropped {
  top: number;
  bottom: number;
  left: number;
  right: number;
  pageNumbers: number[];
}

export const useCropManipulation = ({ cropDimension, cropType }: UseCropManipulationParams) => {
  const dispatch = useDispatch();
  const currentDocument = useSelector(selectors.getCurrentDocument);
  const currentUser = useGetCurrentUser();
  const { updateCroppedThumbs } = useUpdateCroppedThumbs();

  const croppedXfdfRef = useRef<string>('');
  const cropActionRef = useRef<CropPageAction | null>(null);
  const pageWillBeCroppedRef = useRef<Partial<PageWillBeCropped>>({});
  const croppedAnnotationsRef = useRef<Core.Annotations.Annotation[]>([]);

  const resetPageWillBeCropped = useCallback(() => {
    pageWillBeCroppedRef.current = {};
  }, []);

  const emitCroppedAnnotation = useCallback(async () => {
    if (!croppedXfdfRef.current || !croppedAnnotationsRef.current.length) {
      return;
    }

    if (!currentDocument.isSystemFile) {
      await Promise.all(
        croppedAnnotationsRef.current.map((annotation) =>
          socketService.annotationChange({
            roomId: currentDocument._id,
            xfdf: croppedXfdfRef.current,
            annotationId: annotation.Id,
            userId: currentUser._id,
            email: currentUser.email,
            pageIndex: annotation.PageNumber,
            annotationType: annotation.Subject,
            annotationAction: ANNOTATION_ACTION.DELETE,
          })
        )
      );
    }

    commandHandler.insertTempAction(currentDocument._id, [
      {
        type: 'annotation',
        xfdf: croppedXfdfRef.current,
      },
    ]);

    croppedAnnotationsRef.current = [];
    croppedXfdfRef.current = '';
    core.scrollViewUpdated();
  }, [currentDocument, currentUser]);

  const { undoCropPageAction } = useUndoCropHandlers({
    cropType,
    cropActionRef,
    pageWillBeCroppedRef,
    croppedAnnotationsRef,
    emitCroppedAnnotation,
    resetPageWillBeCropped,
  });

  const onAnnotationChanged = useCallback(async () => {
    const xfdf = await core.getAnnotationManager().exportAnnotationCommand();
    croppedXfdfRef.current = xfdf;
  }, []);

  const cropPagesCore = useCallback(
    async ({ pageNumbers }: { pageNumbers: number[] }) => {
      const dimensions = {
        top: cropDimension.top,
        left: cropDimension.left,
        right: cropDimension.right,
        bottom: cropDimension.bottom,
      };

      const operationId = startSaveOperation(dispatch as Dispatch, SAVE_OPERATION_TYPES.PAGE_TOOLS, {
        action: 'crop',
        documentId: currentDocument._id,
      });

      pageWillBeCroppedRef.current = { ...dimensions, pageNumbers };

      croppedAnnotationsRef.current = getCroppedAnnotations({ ...dimensions, pageNumbers });

      const widgetAnnotations = croppedAnnotationsRef.current.filter(
        (annot) => annot instanceof window.Core.Annotations.WidgetAnnotation
      );
      if (widgetAnnotations.length > 0) {
        cropActionRef.current = Manipulation.createCropPageAction(widgetAnnotations);
      }

      deleteCroppedAnnotations(croppedAnnotationsRef.current);

      core.addEventListener('annotationChanged', onAnnotationChanged);

      try {
        await documentServices.cropPages({
          ...dimensions,
          isUndo: false,
          currentDocument,
          pageCrops: pageNumbers,
          croppedAnnotations: [],
        });

        await updateCroppedThumbs({ pageNumbers });

        undoCropPageAction(pageNumbers);

        completeSaveOperation(dispatch as Dispatch, operationId, {
          status: SAVE_OPERATION_STATUS.SUCCESS,
        });
      } catch (error) {
        completeSaveOperation(dispatch as Dispatch, operationId, {
          status: SAVE_OPERATION_STATUS.ERROR,
        });
        throw error;
      } finally {
        core.removeEventListener('annotationChanged', onAnnotationChanged);
      }
    },
    [cropDimension, currentDocument, dispatch, onAnnotationChanged, undoCropPageAction, updateCroppedThumbs]
  );

  const applyCrop = useCallback((pageNumbers: number[]) => cropPagesCore({ pageNumbers }), [cropPagesCore]);

  return {
    applyCrop,
  };
};
