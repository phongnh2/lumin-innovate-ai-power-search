import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import toastUtils from '@new-ui/utils/toastUtils';

import selectors from 'selectors';

import { useTranslation } from 'hooks/useTranslation';

import documentServices from 'services/documentServices';

import { completeSaveOperation, startSaveOperation } from 'utils/saveOperationUtils';

import { CropPageAction } from 'features/DocumentFormBuild/manipulation/crop';

import { SAVE_OPERATION_STATUS, SAVE_OPERATION_TYPES } from 'constants/saveOperationConstants';

import { useUpdateCroppedThumbs } from './useUpdateCroppedThumbs';
import { CropTypeOption } from '../types';

interface PageWillBeCropped {
  top: number;
  left: number;
  right: number;
  bottom: number;
  pageNumbers: number[];
}

interface UseUndoCropHandlersProps {
  cropType: CropTypeOption;
  cropActionRef: React.MutableRefObject<CropPageAction>;
  pageWillBeCroppedRef: React.MutableRefObject<Partial<PageWillBeCropped>>;
  croppedAnnotationsRef: React.MutableRefObject<Core.Annotations.Annotation[]>;
  emitCroppedAnnotation: () => Promise<void>;
  resetPageWillBeCropped: () => void;
}

export const useUndoCropHandlers = (props: UseUndoCropHandlersProps) => {
  const {
    cropType,
    cropActionRef,
    pageWillBeCroppedRef,
    croppedAnnotationsRef,
    emitCroppedAnnotation,
    resetPageWillBeCropped,
  } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const currentDocument = useSelector(selectors.getCurrentDocument);

  const { updateCroppedThumbs } = useUpdateCroppedThumbs();

  const onClickUndoToast = useCallback(async () => {
    const { pageNumbers, top, bottom, left, right } = pageWillBeCroppedRef.current;

    if (!pageNumbers.length) {
      return;
    }

    const operationId = startSaveOperation(dispatch as Dispatch, SAVE_OPERATION_TYPES.PAGE_TOOLS, {
      action: 'undo_crop',
      documentId: currentDocument._id,
    });

    await documentServices.cropPages({
      top: -top,
      left: -left,
      right: -right,
      bottom: -bottom,
      isUndo: true,
      currentDocument,
      pageCrops: pageNumbers,
      croppedAnnotations: croppedAnnotationsRef.current,
    });

    await updateCroppedThumbs({ pageNumbers });

    completeSaveOperation(dispatch as Dispatch, operationId, {
      status: SAVE_OPERATION_STATUS.SUCCESS,
    });

    toastUtils.success({
      top: 130,
      title: t('viewer.cropPanel.croppedToast.undo'),
    });

    resetPageWillBeCropped();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDocument, dispatch, t, pageWillBeCroppedRef, croppedAnnotationsRef, resetPageWillBeCropped]);

  const onToastClose = useCallback(
    async (removedBy: string) => {
      const { top, bottom, left, right, pageNumbers } = pageWillBeCroppedRef.current;

      if (removedBy === toastUtils.REMOVED_BY.MANUAL || !pageNumbers?.length || !top || !bottom || !left || !right) {
        return;
      }

      await emitCroppedAnnotation();
      await documentServices.emitSocketCropPage({
        currentDocument,
        pageCrops: pageNumbers,
        cropType,
        top,
        bottom,
        left,
        right,
      });

      if (cropActionRef.current && currentDocument?._id) {
        await cropActionRef.current.updateFormFieldChanged(currentDocument._id);
      }

      resetPageWillBeCropped();
    },
    [currentDocument, cropActionRef, pageWillBeCroppedRef, emitCroppedAnnotation, resetPageWillBeCropped]
  );

  const onUndoButtonClick = useCallback(() => {
    onClickUndoToast().catch(() => {});
    resetPageWillBeCropped();
  }, [onClickUndoToast, resetPageWillBeCropped]);

  const undoCropPageAction = useCallback(
    (pageNumbers: number[]) => {
      toastUtils.success({
        onRemoval: (removedBy: string) => {
          onToastClose(removedBy).catch(() => {});
        },
        top: 130,
        action: {
          callback: onUndoButtonClick,
          label: t('viewer.leftPanelEditMode.undo'),
        },
        message:
          pageNumbers.length > 1
            ? t('viewer.cropPanel.croppedToast.multiple')
            : t('viewer.cropPanel.croppedToast.single', { page: pageNumbers[0].toString() }),
      });
    },
    [t, onToastClose, onUndoButtonClick]
  );

  return {
    undoCropPageAction,
  };
};
