/* eslint-disable @typescript-eslint/unbound-method */
import { AnyAction } from 'redux';

import { ToolName } from 'core/type';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';
import { store } from 'store';

import { saveLocalFile } from 'lumin-components/ViewerCommon/LocalSave/helper/saveLocalFile';

import documentServices from 'services/documentServices';
import { UploadDocFrom } from 'services/types/documentServices.types';

import fireEvent from 'helpers/fireEvent';
import logger from 'helpers/logger';
import { pageContentUpdatedListener } from 'helpers/pageContentUpdatedListener';

import { syncThirdPartyHandler } from 'features/Annotation/utils/syncThirdPartyService';
import { isResolvedComment, isResolvedHighlightComment } from 'features/Comments/utils/commons';
import formFieldBackup from 'features/EditorChatBot/utils/formfieldBackup';
import { ExploredFeatures } from 'features/EnableToolFromQueryParams/constants';
import { guestModeManipulateCache } from 'features/GuestModeManipulateCache/base';
import { IExploreFeaturesGuestModeFLP } from 'features/GuestModeManipulateCache/useHandleManipuldateGuestMode';

import { CUSTOM_DATA_TEXT_TOOL } from 'constants/customDataConstant';
import { DataElements } from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';
import { STORAGE_TYPE } from 'constants/lumin-common';
import { SAVE_OPERATION_TYPES } from 'constants/saveOperationConstants';

import { getLinearizedDocumentFile } from './getFileService';
import { isLandingPageRequest } from './isLandingPageRequest';

type ConfirmSaveProps = {
  isExitFromViewerWithoutChange?: boolean;
  preventRefetchDocument?: boolean;
  /**
   * @description Allow storage sync to run without awaiting (fire and forget)
   */
  asyncStorageSync?: boolean;
  isManipulateInGuestMode?: boolean;
  handleStoreExploreFeatureGuestMode?: (featureName: keyof IExploreFeaturesGuestModeFLP) => void;
};

export const exitEditPdfMode = () => {
  const { dispatch } = store;

  dispatch(actions.setIsInContentEditMode(false) as AnyAction);
  dispatch(actions.setIsShowToolbarTablet(true) as AnyAction);
  core.setToolMode(defaultTool as ToolName);
  core.refreshAll();
  core.updateView();
  formFieldBackup.clear();
};

export function showAnnotsToDocument() {
  const annotations = core.getAnnotationManager().getAnnotationsList();
  const annotationManager = core.getAnnotationManager();
  const annotChanged = annotations.filter((annotation) => {
    if (isResolvedHighlightComment({ annotation }) || isResolvedComment({ annotation })) {
      return;
    }
    annotation.ReadOnly = false;
    annotation.Hidden = false;
    if (annotation instanceof window.Core.Annotations.TextMarkupAnnotation) {
      const { strokeColor, opacity } = JSON.parse(annotation.getCustomData(CUSTOM_DATA_TEXT_TOOL.PREV_COLOR.key)) as {
        strokeColor: Record<string, number>;
        opacity: number;
      };
      annotation.StrokeColor = new window.Core.Annotations.Color(strokeColor.R, strokeColor.G, strokeColor.B);
      annotation.Opacity = opacity;
      annotation.deleteCustomData(CUSTOM_DATA_TEXT_TOOL.PREV_COLOR.key);
    }
    return annotation;
  });

  if (annotChanged.length > 0) {
    annotationManager.trigger('annotationChanged', [annotChanged, 'modify', { imported: true }]);
  }
}

export async function onConfirmSaveEditedText({
  isExitFromViewerWithoutChange,
  asyncStorageSync = false,
  isManipulateInGuestMode,
  handleStoreExploreFeatureGuestMode,
}: ConfirmSaveProps = {}): Promise<void> {
  const { getState } = store;
  const state = getState();
  const currentDocument = selectors.getCurrentDocument(state);
  if (currentDocument.service === STORAGE_TYPE.GOOGLE && !isExitFromViewerWithoutChange) {
    if (pageContentUpdatedListener.isProcessingUpdateContent()) {
      await pageContentUpdatedListener.waitForUpdateContent();
    }
    core.getContentEditManager().endContentEditMode();
    fireEvent('content_edit_updated');
    return;
  }

  await pageContentUpdatedListener.waitForUpdateContent();
  core.getContentEditManager().endContentEditMode();

  try {
    if (isManipulateInGuestMode) {
      const file = await getLinearizedDocumentFile(currentDocument.name, null);
      await guestModeManipulateCache.add({ key: currentDocument.remoteId, file });
      handleStoreExploreFeatureGuestMode(ExploredFeatures.EDIT_PDF);
      return;
    }
    switch (currentDocument.service) {
      case STORAGE_TYPE.SYSTEM: {
        await saveLocalFile();
        break;
      }
      case STORAGE_TYPE.S3: {
        const syncPromise = documentServices.syncFileToS3Exclusive(currentDocument, {
          increaseVersion: true,
          action: SAVE_OPERATION_TYPES.CONTENT_EDIT,
          ...(isLandingPageRequest() && { uploadDocFrom: UploadDocFrom.EditPdf }),
        });

        if (asyncStorageSync) {
          syncPromise.catch((error: unknown) => {
            logger.logError({
              reason: 'Failed to sync file to S3 (async)',
              error,
            });
          });
        } else {
          await syncPromise;
        }
        break;
      }
      case STORAGE_TYPE.DROPBOX:
      case STORAGE_TYPE.ONEDRIVE: {
        syncThirdPartyHandler.syncThirdParty();
        break;
      }
      default:
        break;
    }
  } catch (error: unknown) {
    logger.logError({
      reason: 'Failed to edit text in pdf',
      error,
    });
  } finally {
    exitEditPdfMode();
  }
}

export const onCancelSaveEditText = async (options = { forceReload: true }) => {
  const { dispatch, getState } = store;
  const state = getState();
  const currentDocument = selectors.getCurrentDocument(state);
  if (pageContentUpdatedListener.isProcessingUpdateContent()) {
    dispatch(actions.openElement(DataElements.LOADING_MODAL) as AnyAction);
    formFieldBackup.restore();
    await pageContentUpdatedListener.waitForUpdateContent();
    dispatch(actions.closeElement(DataElements.LOADING_MODAL) as AnyAction);
  }
  core.getContentEditManager().endContentEditMode();
  if (currentDocument.isSystemFile && currentDocument.unsaved) {
    dispatch(actions.updateCurrentDocument({ unsaved: false }) as AnyAction);
  }
  dispatch(actions.setDiscardContentEdit(true) as AnyAction);
  if (options.forceReload) {
    dispatch(actions.setForceReload(true) as AnyAction);
  }
  dispatch(actions.setIsInContentEditMode(false) as AnyAction);
  dispatch(actions.setIsShowToolbarTablet(true) as AnyAction);
  core.setToolMode(defaultTool as ToolName);
};
