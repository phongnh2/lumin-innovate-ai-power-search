/* eslint-disable no-await-in-loop */
import { useMutation } from '@tanstack/react-query';
import range from 'lodash/range';
import { useCallback, useContext, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { enqueueSnackbar } from '@libs/snackbar';
import {
  MERGE_MODAL_EVENT_PARAMS,
  SELECT_VALUE,
} from '@new-ui/components/ToolProperties/components/MergePanel/constants';
import { MergePanelContext } from '@new-ui/components/ToolProperties/components/MergePanel/MergePanel';
import { isAllPageAvailable } from '@new-ui/components/ToolProperties/components/MergePanel/utils/utils';
import useToolProperties from '@new-ui/hooks/useToolProperties';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import documentServices from 'services/documentServices';
import { socketService } from 'services/socketServices';

import fireEvent from 'helpers/fireEvent';
import warningPDFTronErrors from 'helpers/warningPDFTronErrors';

import modalEvent from 'utils/Factory/EventCollection/ModalEventCollection';
import { getDocumentSize } from 'utils/getDocumentSize';
import manipulationUtils from 'utils/manipulation';
import { eventTracking } from 'utils/recordUtil';

import useSyncThirdParty from 'features/Annotation/hooks/useSyncThirdParty';
import { Manipulation } from 'features/DocumentFormBuild';
import { InsertPageAction } from 'features/DocumentFormBuild/manipulation/insert';
import { ExploredFeatures } from 'features/EnableToolFromQueryParams/constants';
import { useHandleManipulateDateGuestMode } from 'features/GuestModeManipulateCache/useHandleManipuldateGuestMode';
import { TreeNode } from 'features/Outline/types';
import { OutlineCoreUtils } from 'features/Outline/utils/outlineCore.utils';
import { OutlinePageManipulationUtils } from 'features/Outline/utils/outlinePageManipulation.utils';
import { PageTracker } from 'features/PageTracker/utils/pageTracker';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { PageToolViewMode } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { STORAGE_TYPE, MANIPULATION_TYPE, LOGGER } from 'constants/lumin-common';
import { SAVE_OPERATION_TYPES } from 'constants/saveOperationConstants';

export interface FileInfo {
  docInstance: {
    getBookmarks: () => Promise<Core.Bookmark[]>;
    getPDFDoc: () => Promise<Core.PDFNet.PDFDoc>;
  };
  rangeAllPages: number[];
  totalPages: number;
  file: {
    name: string;
  };
  fileSource: string;
}

interface BookmarkInstance {
  updatePositionOfBookmark: (params: {
    type: string;
    option: {
      numberOfPageToMerge: number;
      positionToMerge: number;
    };
  }) => void;
}

interface MergeParams {
  filesInfo: FileInfo[];
  pagePosition: number;
  insertBeforeOrAfter: string;
  allPages: boolean;
  calculateRange: () => number[];
  shouldCancelMerge: React.MutableRefObject<boolean>;
  bookmarkIns: BookmarkInstance;
}

const VIEWER_MERGE_SOURCE = 'viewer';

export const useMergeDocumentMutation = () => {
  const { t } = useTranslation();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const pageEditDisplayMode = useShallowSelector(selectors.pageEditDisplayMode);
  const thumbs = useShallowSelector(selectors.getThumbs);
  const dispatch = useDispatch();
  const { resetMergePanelState } = useContext(MergePanelContext) as { resetMergePanelState: () => void };
  const { closeToolPropertiesPanel } = useToolProperties();
  const mergedFilesInfo = useRef<FileInfo[]>([]);
  const { handleSyncThirdParty } = useSyncThirdParty();
  const { isManipulateInGuestMode, handleAddCache, handleStoreExploreFeatureGuestMode } =
    useHandleManipulateDateGuestMode();

  const getRangesArray = useCallback(
    ({
      allPages,
      filesInfo,
      pagesInsertArray,
      positionToMerge,
    }: {
      allPages: boolean;
      filesInfo: FileInfo[];
      pagesInsertArray: number[];
      positionToMerge: number;
    }) => {
      if (filesInfo.length === 1) {
        const ranges = allPages ? filesInfo[0].rangeAllPages : pagesInsertArray;
        return ranges.map((_, index: number) => positionToMerge + index);
      }

      const totalPagesCount = filesInfo.reduce((acc, file) => file.totalPages + acc, 0);
      const ranges = [];
      for (let i = positionToMerge; i < totalPagesCount + positionToMerge; i++) {
        ranges.push(i);
      }
      return ranges;
    },
    []
  );

  const deleteMergedPages = useCallback(
    async (
      mergedFiles: FileInfo[],
      filesInfo: FileInfo[],
      insertBeforeOrAfter: string,
      pagePosition: number,
      calculateRange: () => number[],
      allPages: boolean
    ) => {
      const _filesInfo = mergedFiles || filesInfo;
      const positionToMerge =
        insertBeforeOrAfter === SELECT_VALUE.BEFORE ? Number(pagePosition) : Number(pagePosition) + 1;
      const pagesInsertArray = calculateRange();
      const pagesRemove = getRangesArray({ allPages, filesInfo: _filesInfo, pagesInsertArray, positionToMerge });

      await manipulationUtils.executeRemovePage({
        option: { pagesRemove },
        needUpdateThumbnail: true,
        thumbs,
        removeMultiPages: pagesRemove.length > 1,
      });

      dispatch(actions.setTotalPages(core.getTotalPages()));
      dispatch(actions.setPageLabels(core.getTotalPages()));
    },
    [getRangesArray, thumbs, dispatch]
  );

  const saveToS3 = useCallback(async () => {
    await documentServices.syncFileToS3Exclusive(currentDocument, {
      increaseVersion: true,
      action: SAVE_OPERATION_TYPES.CONTENT_EDIT,
    });
  }, [currentDocument]);

  const emitSocket = useCallback(
    async ({
      totalPagesMerged,
      positionToMerge,
      totalPagesBeforeMerge,
      bookmarkIns,
    }: {
      totalPagesMerged: number;
      positionToMerge: number;
      totalPagesBeforeMerge: number;
      bookmarkIns: BookmarkInstance;
    }) => {
      const param = {
        currentDocument,
        totalPages: core.getTotalPages(),
        numberOfPageToMerge: totalPagesMerged,
        positionToMerge,
        totalPagesBeforeMerge,
      };

      await documentServices.emitSocketMergePages(param);

      bookmarkIns.updatePositionOfBookmark({
        type: MANIPULATION_TYPE.MERGE_PAGE,
        option: {
          numberOfPageToMerge: totalPagesMerged,
          positionToMerge,
        },
      });
    },
    [currentDocument]
  );

  const saveNewFileToRemoteStorage = useCallback(
    async ({
      totalPagesMerged,
      positionToMerge,
      totalPagesBeforeMerge,
      bookmarkIns,
      action,
    }: {
      totalPagesMerged: number;
      positionToMerge: number;
      totalPagesBeforeMerge: number;
      bookmarkIns: BookmarkInstance;
      action: InsertPageAction;
    }) => {
      try {
        switch (currentDocument.service) {
          case STORAGE_TYPE.S3: {
            await saveToS3();
            break;
          }
          case STORAGE_TYPE.DROPBOX:
          case STORAGE_TYPE.ONEDRIVE: {
            await handleSyncThirdParty();
            break;
          }
          default:
            break;
        }
        await Promise.all([
          emitSocket({
            totalPagesMerged,
            positionToMerge,
            totalPagesBeforeMerge,
            bookmarkIns,
          }),
          action.updateFormFieldChanged(currentDocument._id),
        ]);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') {
          return;
        }
        warningPDFTronErrors({ error, service: LOGGER.Service.MERGE_DOCUMENT_ERROR });
      }
    },
    [saveToS3, emitSocket, currentDocument?._id, currentDocument?.service, handleSyncThirdParty]
  );

  const getPositionToMerge = useCallback((insertBeforeOrAfter: string, pagePosition: number) => {
    switch (insertBeforeOrAfter) {
      case SELECT_VALUE.AFTER:
        return core.getTotalPages() + 1;
      case SELECT_VALUE.SPECIFIC:
        return Number(pagePosition) + 1;
      case SELECT_VALUE.BEFORE:
        return Number(pagePosition);
      default:
        return Number(pagePosition);
    }
  }, []);

  const executeMerge = useCallback(
    async (params: MergeParams) => {
      const { filesInfo, pagePosition, insertBeforeOrAfter, allPages, calculateRange, shouldCancelMerge, bookmarkIns } =
        params;
      dispatch(actions.openElement('loadingModal'));
      modalEvent.modalConfirmation(MERGE_MODAL_EVENT_PARAMS).catch(() => {});

      const pagesInsertArray = calculateRange();
      const { _id: documentId, service, remoteId } = currentDocument;

      const positionToMerge = getPositionToMerge(insertBeforeOrAfter, pagePosition);
      const totalPagesBeforeMerge = core.getTotalPages();
      const shouldEmitSocket = !!remoteId && !isManipulateInGuestMode;

      try {
        if (shouldEmitSocket) {
          socketService.startMergingDocument({ userId: currentUser._id, documentId });
        }

        if (service === STORAGE_TYPE.S3) {
          socketService.modifyDocumentContent(documentId, { status: 'preparing', increaseVersion: true });
        }

        const _isAllPageAvailable = isAllPageAvailable(filesInfo, allPages);

        const totalInsertedPages = filesInfo.reduce((total, file) => {
          const pagesArr = _isAllPageAvailable ? file.rangeAllPages : pagesInsertArray;
          return total + pagesArr.length;
        }, 0);

        const action = Manipulation.createInsertPageAction(
          range(positionToMerge, positionToMerge + totalInsertedPages)
        );

        const pdfDoc = await core.getDocument().getPDFDoc();
        const mergedOutlineList: TreeNode[] = [];
        let currentPositionToMerge = positionToMerge;

        for (let index = 0; index < filesInfo.length; index++) {
          const fileInfo = filesInfo[index];

          const mergedBookmarks = await fileInfo.docInstance.getBookmarks();
          if (mergedBookmarks.length) {
            const mergedPDFDoc = await fileInfo.docInstance.getPDFDoc();
            await OutlineCoreUtils.resetDocOutlines({ pdfDoc: mergedPDFDoc });
          }

          const rangesArray = _isAllPageAvailable ? fileInfo.rangeAllPages : pagesInsertArray;

          await manipulationUtils.executeMergePage({
            docInstance: fileInfo.docInstance,
            rangesArray,
            positionToMerge: currentPositionToMerge,
          });

          const node = OutlinePageManipulationUtils.createDocumentOutlineNode({
            bookmarks: mergedBookmarks,
            isAllPageAvailable: _isAllPageAvailable,
            mergedPageList: rangesArray,
            pageDelta: currentPositionToMerge - 1,
            fileName: fileInfo.file.name,
          });

          currentPositionToMerge += rangesArray.length;
          mergedFilesInfo.current = [...mergedFilesInfo.current, fileInfo];
          mergedOutlineList.push(...node.children);
        }

        if (shouldCancelMerge.current) {
          await deleteMergedPages(
            mergedFilesInfo.current,
            filesInfo,
            insertBeforeOrAfter,
            pagePosition,
            calculateRange,
            allPages
          );
          mergedFilesInfo.current = [];
          shouldCancelMerge.current = false;
          return;
        }

        await OutlinePageManipulationUtils.updateOnManipulationChanged({
          type: MANIPULATION_TYPE.MERGE_PAGE,
          mergedPagesCount: totalInsertedPages,
          manipulationPages: [positionToMerge],
          mergedOutlines: mergedOutlineList,
        });

        PageTracker.updateOnManipulationChanged({
          type: MANIPULATION_TYPE.MERGE_PAGE,
          mergedPagesCount: totalInsertedPages,
          manipulationPages: [positionToMerge],
        });

        await OutlineCoreUtils.importOutlinesToDoc({ pdfDoc });
        mergedFilesInfo.current = [];

        const totalPagesAfterMerged = core.getTotalPages();
        dispatch(actions.setTotalPages(totalPagesAfterMerged));
        dispatch(actions.setPageLabels(totalPagesAfterMerged));

        await core.getDocument().getDocumentCompletePromise();
        if (currentDocument.isSystemFile) {
          const size = await getDocumentSize();
          dispatch(actions.setCurrentDocument({ ...currentDocument, size, unsaved: true }));
        } else if (
          ([STORAGE_TYPE.S3, STORAGE_TYPE.DROPBOX, STORAGE_TYPE.ONEDRIVE] as Array<string>).includes(service)
        ) {
          const totalPagesMerged = totalPagesAfterMerged - totalPagesBeforeMerge;

          if (!isManipulateInGuestMode) {
            await saveNewFileToRemoteStorage({
              totalPagesMerged,
              positionToMerge,
              totalPagesBeforeMerge,
              bookmarkIns,
              action,
            });
          }
        }
        fireEvent(CUSTOM_EVENT.REFETCH_THUMBNAILS);
        if (pageEditDisplayMode === PageToolViewMode.GRID) {
          dispatch(actions.scrollToPageInGridViewMode({ isScroll: true, pageToScroll: positionToMerge }));
        } else {
          core.setCurrentPage(positionToMerge);
        }

        enqueueSnackbar({
          variant: 'success',
          message: t('viewer.leftPanelEditMode.mergeDocumentsSuccessfully'),
        });
        resetMergePanelState();
        closeToolPropertiesPanel();
        core.refreshAll();
        core.updateView();
        core.getDocument().refreshTextData();

        if (isManipulateInGuestMode) {
          await handleAddCache();
          handleStoreExploreFeatureGuestMode(ExploredFeatures.MERGE);
        }
      } catch (error: unknown) {
        if (core.getTotalPages() > totalPagesBeforeMerge) {
          await deleteMergedPages([], filesInfo, insertBeforeOrAfter, pagePosition, calculateRange, allPages);
        }
        warningPDFTronErrors({ error, service: LOGGER.Service.MERGE_DOCUMENT_ERROR });
        socketService.modifyDocumentContent(documentId, { status: 'failed', increaseVersion: true });
        throw error;
      } finally {
        dispatch(actions.closeElement('loadingModal'));
        if (shouldEmitSocket) {
          socketService.finishMergingDocument({
            userId: currentUser._id,
            documentId,
            totalPages: core.getTotalPages(),
          });
        }

        const filesSource = filesInfo.map(({ fileSource }) => fileSource);
        eventTracking(UserEventConstants.EventType.DOCUMENT_MERGED, {
          LuminFileId: currentDocument._id || currentDocument.remoteId,
          otherFileSource: filesSource,
          mergedFrom: VIEWER_MERGE_SOURCE,
        }).catch(() => {});
      }
    },
    [
      currentDocument,
      getPositionToMerge,
      dispatch,
      pageEditDisplayMode,
      t,
      resetMergePanelState,
      closeToolPropertiesPanel,
      currentUser?._id,
      deleteMergedPages,
      saveNewFileToRemoteStorage,
    ]
  );

  const {
    mutateAsync,
    isLoading: isMerging,
    isSuccess: isMerged,
    error,
  } = useMutation({
    mutationKey: ['mergeDocument', currentDocument?._id || currentDocument.remoteId],
    mutationFn: executeMerge,
  });

  return {
    mutateAsync,
    isMerging,
    isMerged,
    error,
  };
};
