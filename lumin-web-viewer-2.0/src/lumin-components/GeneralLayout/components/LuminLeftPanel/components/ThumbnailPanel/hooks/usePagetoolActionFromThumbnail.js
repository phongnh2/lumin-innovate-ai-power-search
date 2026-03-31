import cloneDeep from 'lodash/cloneDeep';
import { enqueueSnackbar, closeSnackbar } from 'lumin-ui/kiwi-ui';
import { useContext, useEffect, useRef } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import v4 from 'uuid/v4';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import ViewerContext from 'screens/Viewer/Context';

import { useSaveOperation } from 'hooks/useSaveOperation';
import { useTranslation } from 'hooks/useTranslation';

import documentServices from 'services/documentServices';

import logger from 'helpers/logger';

import manipulation from 'utils/manipulation';
import { eventTracking } from 'utils/recordUtil';

import { deletePageOperationState } from 'features/Document/helpers/deletePageOperationState';
import { Manipulation } from 'features/DocumentFormBuild';
import { OutlinePageManipulationUtils } from 'features/Outline/utils/outlinePageManipulation.utils';
import { PageTracker } from 'features/PageTracker/utils/pageTracker';

import { documentStorage } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { LOGGER, MANIPULATION_TYPE } from 'constants/lumin-common';
import { KEEP_AT_LEAST_ONE_PAGE } from 'constants/messages';
import { SAVE_OPERATION_STATUS } from 'constants/saveOperationConstants';
import { SOCKET_EMIT } from 'constants/socketConstant';

import { socket } from '../../../../../../../socket';

const DELETE_TIMEOUT_DURATION = 500;

const usePagetoolActionFromThumbnail = () => {
  const viewerContext = useContext(ViewerContext);
  const thumbs = useSelector(selectors.getThumbs, shallowEqual);
  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);
  const isOffline = useSelector(selectors.isOffline, shallowEqual);
  const totalPages = useSelector(selectors.getTotalPages);

  const sendDeleteTimeout = useRef(null);
  const formFieldDeleteAction = useRef(null);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { startOperation, completeOperation, OPERATION_TYPES } = useSaveOperation();

  useEffect(
    () => () => {
      clearTimeout(sendDeleteTimeout.current);
    },
    []
  );

  const updatePageOfManipForInsertBlankPage = (page) => {
    const {
      listPageDeleted,
      pageWillBeCropped,
      pageWillBeDeleted,
      setListPageDeleted,
      setPageWillBeDeleted,
      setPageWillBeCropped,
    } = viewerContext;

    const newListPageDeleted = {};
    Object.keys(listPageDeleted).forEach((key) => {
      if (listPageDeleted[key] >= page) {
        listPageDeleted[key] += 1;
      }
      newListPageDeleted[listPageDeleted[key]] = listPageDeleted[key];
    });

    setListPageDeleted(newListPageDeleted);

    if (page <= pageWillBeDeleted) {
      setPageWillBeDeleted(pageWillBeDeleted + 1);
    }

    if (page <= pageWillBeCropped.position) {
      setPageWillBeCropped({
        ...pageWillBeCropped,
        position: pageWillBeCropped.position + 1,
      });
    }
  };

  const inserBlankPage = async ({ insertPosition, callback = (f) => f }) => {
    const { pageWillBeDeleted, bookmarkIns } = viewerContext;

    const totalPages = pageWillBeDeleted === -1 ? core.getTotalPages() : core.getTotalPages() + 1;

    const sizePage = {
      width: 612,
      height: 792,
    };
    const action = Manipulation.createInsertPageAction([insertPosition]);
    const manipulationId = v4();
    await documentServices.insertBlankPages({
      currentDocument,
      insertPages: [insertPosition],
      sizePage,
      totalPages,
      manipulationId,
    });
    await OutlinePageManipulationUtils.updateOnManipulationChanged({
      type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
      manipulationPages: [insertPosition],
    });
    PageTracker.updateOnManipulationChanged({
      type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
      manipulationPages: [insertPosition],
      manipulationId,
    });
    action.updateFormFieldChanged(currentDocument._id);
    bookmarkIns.updatePositionOfBookmark({
      type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
      option: {
        insertPages: [insertPosition],
      },
    });

    updatePageOfManipForInsertBlankPage(insertPosition);

    const blankPageCanvas = await manipulation.onLoadThumbs(insertPosition - 1);
    const tempThumbnail = {
      ...blankPageCanvas,
      id: v4(),
    };
    dispatch(actions.addThumbs(tempThumbnail, insertPosition - 1));
    callback();
  };

  const updatePageOfManipForMovePage = (pagesToMove, insertBeforePage) => {
    const {
      listPageDeleted,
      pageWillBeCropped,
      pageWillBeDeleted,
      setListPageDeleted,
      setPageWillBeDeleted,
      setPageWillBeCropped,
    } = viewerContext;

    const newListPageDeleted = {};
    Object.keys(listPageDeleted).forEach((key) => {
      const position = listPageDeleted[key];
      if (pagesToMove === position) {
        listPageDeleted[key] = insertBeforePage;
      } else if (insertBeforePage <= position && pagesToMove > position) {
        listPageDeleted[key] += 1;
      } else if (insertBeforePage >= position && pagesToMove < position) {
        listPageDeleted[key] -= 1;
      }
      newListPageDeleted[listPageDeleted[key]] = listPageDeleted[key];
    });
    setListPageDeleted(newListPageDeleted);

    if (pagesToMove === pageWillBeDeleted) {
      setPageWillBeDeleted(insertBeforePage);
    } else if (insertBeforePage <= pageWillBeDeleted && pagesToMove > pageWillBeDeleted) {
      setPageWillBeDeleted(pageWillBeDeleted + 1);
    } else if (insertBeforePage >= pageWillBeDeleted && pagesToMove < pageWillBeDeleted) {
      setPageWillBeDeleted(pageWillBeDeleted - 1);
    }

    if (pagesToMove === pageWillBeCropped.position) {
      setPageWillBeCropped({
        ...pageWillBeCropped,
        position: insertBeforePage,
      });
    } else if (insertBeforePage <= pageWillBeCropped.position && pagesToMove > pageWillBeCropped.position) {
      setPageWillBeCropped({
        ...pageWillBeCropped,
        position: pageWillBeCropped.position + 1,
      });
    } else if (insertBeforePage >= pageWillBeCropped.position && pagesToMove < pageWillBeCropped.position) {
      setPageWillBeCropped({
        ...pageWillBeCropped,
        position: pageWillBeCropped.position - 1,
      });
    }
  };

  const movePage = async (target, destination, callback = (f) => f) => {
    const { listPageDeleted, bookmarkIns } = viewerContext;

    if (listPageDeleted[target]) {
      const toastSetting = {
        // eslint-disable-next-line sonarjs/no-duplicate-string
        message: t('viewer.leftPanelEditMode.pagePageLockedIsBlocked', { pageLocked: target }),
        variant: 'warning',
      };
      enqueueSnackbar(toastSetting);
      return;
    }

    const thumbsUpdate = [...thumbs];
    const action = Manipulation.createMovePageAction(target, destination);
    const manipulationId = v4();
    await documentServices.movePages({
      currentDocument,
      pagesToMove: target,
      insertBeforePage: destination,
      manipulationId,
    });
    await OutlinePageManipulationUtils.updateOnManipulationChanged({
      type: MANIPULATION_TYPE.MOVE_PAGE,
      movedOriginPage: target,
      manipulationPages: [destination],
    });
    PageTracker.updateOnManipulationChanged({
      type: MANIPULATION_TYPE.MOVE_PAGE,
      movedOriginPage: target,
      manipulationPages: [destination],
      manipulationId,
    });
    action.updateFormFieldChanged(currentDocument._id);
    updatePageOfManipForMovePage(target, destination);
    bookmarkIns.updatePositionOfBookmark({
      type: MANIPULATION_TYPE.MOVE_PAGE,
      option: { pagesToMove: target, insertBeforePage: destination },
    });
    const thumbMove = await manipulation.onLoadThumbs(destination - 1);
    const thumbTemp = {
      ...thumbMove,
      ...thumbs[target - 1],
    };
    thumbsUpdate.splice(target - 1, 1);
    thumbsUpdate.splice(destination - 1, 0, thumbTemp);
    dispatch(actions.updateThumbs(thumbsUpdate));
    callback();
  };

  const rotatePage = async ({ page, angle }) => {
    const { listPageDeleted } = viewerContext;
    if (!listPageDeleted[page]) {
      try {
        if (currentDocument.isSystemFile) {
          dispatch(actions.setCurrentDocument({ ...currentDocument, unsaved: true }));
        }

        await documentServices.rotatePages({ currentDocument, pageIndexes: [page], angle });
        const thumbsUpdate = cloneDeep(thumbs);

        if (page <= thumbsUpdate.length) {
          const index = page - 1;
          const thumbRotate = await manipulation.onLoadThumbs(index);
          thumbsUpdate[index] = thumbRotate;
          thumbsUpdate[index].id = thumbs[index].id;
        }

        dispatch(actions.updateThumbs(thumbsUpdate));
      } catch (error) {
        logger.logError({
          reason: LOGGER.EVENT.PDFTRON_CORE_DOCUMENT,
          error,
        });
      }
    } else {
      const toastSetting = {
        message: t('viewer.leftPanelEditMode.pagePageLockedIsBlocked', { pageLocked: page }),
        variant: 'warning',
      };
      enqueueSnackbar(toastSetting);
    }
  };

  const rotate = async ({ page, angle, callback = (f) => f }) => {
    await rotatePage({ page, angle });
    callback();
    eventTracking(UserEventConstants.EventType.DOCUMENT_ROTATED, {
      pagesToRotate: [page].toString(),
      pagesFrom: '',
      pagesTo: '',
    });
  };

  const removeOriginPage = async (currentDocument, pagesRemove, annotationDeleted, toastId) => {
    const { setPageWillBeDeleted, deletedPageNumberRef, bookmarkIns } = viewerContext;
    if (deletedPageNumberRef.current === -1 || !core.getDocument()) {
      return;
    }

    const deletedWidget = core
      .getAnnotationManager()
      .getAnnotationsList()
      .filter(
        (annot) => pagesRemove[0] === annot.PageNumber && annot instanceof window.Core.Annotations.WidgetAnnotation
      );
    formFieldDeleteAction.current = Manipulation.createDeletePageAction(pagesRemove, deletedWidget);
    await documentServices.removePages({ currentDocument, pagesRemove });
    bookmarkIns.updatePositionOfBookmark({
      type: MANIPULATION_TYPE.REMOVE_PAGE,
      option: { pagesRemove },
    });
    const manipulationId = v4();
    await manipulation.executeSocketRemovePage({
      currentDocument,
      pagesRemove,
      annotationDeleted,
      manipulationId,
    });
    await OutlinePageManipulationUtils.updateOnManipulationChanged({
      type: MANIPULATION_TYPE.REMOVE_PAGE,
      manipulationPages: pagesRemove,
    });
    PageTracker.updateOnManipulationChanged({
      type: MANIPULATION_TYPE.REMOVE_PAGE,
      manipulationPages: pagesRemove,
      manipulationId,
    });
    formFieldDeleteAction.current.updateFormFieldChanged(currentDocument._id);
    setPageWillBeDeleted(-1);

    const operationId = deletePageOperationState.getOperationId(toastId);
    if (operationId) {
      completeOperation(operationId, {
        status: SAVE_OPERATION_STATUS.SUCCESS,
      });
      deletePageOperationState.removeOperationId(toastId);
    }
  };

  const onToastClose = (toastId, removedBy, deleteAnnotations) => {
    const { deletedPageNumberRef } = viewerContext;
    const shouldPrevent = deletePageOperationState.getShouldPreventToastCloseCallback(toastId);
    if (!shouldPrevent) {
      removeOriginPage(currentDocument, [deletedPageNumberRef.current], deleteAnnotations, toastId);
      core.scrollViewUpdated();
    }
    if (deletePageOperationState.toastId === toastId) {
      deletePageOperationState.toastId = '';
    }
  };

  const updatePageOfManipForRemove = (page) => {
    const { listPageDeleted, setListPageDeleted } = viewerContext;

    const newListPageDeleted = {};
    Object.keys(listPageDeleted).forEach((key) => {
      if (listPageDeleted[key] >= page) {
        listPageDeleted[key] -= 1;
      }
      newListPageDeleted[listPageDeleted[key]] = listPageDeleted[key];
    });

    setListPageDeleted(newListPageDeleted);
  };

  const undoDeletePageCore = async ({ pageRemove }) => {
    const undoSuccessfully = {
      message: t('viewer.leftPanelEditMode.pagePageRemoveUndone', { pageRemove }),
      variant: 'success',
    };
    enqueueSnackbar(undoSuccessfully);
  };

  const onClickUndoToast = async ({ currentDocument, pageRemove, toastId }) => {
    const { setPageWillBeDeleted } = viewerContext;
    if (!currentDocument.isSystemFile && currentDocument.service !== documentStorage.google) {
      socket.emit(SOCKET_EMIT.SEND_DELETED_PAGE, {
        roomId: currentDocument._id,
        pageDeleted: pageRemove,
        undoSignal: true,
      });
    }

    await undoDeletePageCore({ pageRemove });

    dispatch(actions.enableThumb(pageRemove));
    setPageWillBeDeleted(-1);

    const operationId = deletePageOperationState.getOperationId(toastId);
    if (operationId) {
      completeOperation(operationId, {
        status: SAVE_OPERATION_STATUS.SUCCESS,
      });
      deletePageOperationState.removeOperationId(toastId);
    }
  };

  const onUndoClick = (pageRemove, toastId) => {
    onClickUndoToast({
      currentDocument,
      pageRemove,
      toastId,
    });
  };

  const showUndoToast = (deleteAnnotations, pageRemove, operationId) => {
    sendDeleteTimeout.current = setTimeout(() => {
      if (!currentDocument.isSystemFile && currentDocument.service !== documentStorage.google) {
        socket.emit(SOCKET_EMIT.SEND_DELETED_PAGE, {
          roomId: currentDocument._id,
          pageDeleted: pageRemove,
          undoSignal: false,
        });
      }
    }, DELETE_TIMEOUT_DURATION);

    const toastSetting = {
      message: t('viewer.leftPanelEditMode.pagePagesRemoveDeleted', { pages: pageRemove }),
      variant: 'warning',
      actionLabel: t('viewer.leftPanelEditMode.undo'),
      onAction: () => {
        const { toastId } = deletePageOperationState;
        deletePageOperationState.setShouldPreventToastCloseCallback(toastId, true);
        onUndoClick(pageRemove, toastId);
      },
      onClose: (_event, removedBy, key) => onToastClose(key, removedBy, deleteAnnotations),
    };
    const toastId = enqueueSnackbar(toastSetting);
    deletePageOperationState.toastId = toastId;
    deletePageOperationState.setOperationId(toastId, operationId);
  };

  const removePage = async ({ page, callback = (f) => f }) => {
    let deletedPage = page;
    const { listPageDeleted, pageWillBeDeleted, setPageWillBeDeleted } = viewerContext;
    const operationId = startOperation(OPERATION_TYPES.PAGE_TOOLS, {
      action: 'remove_page',
      documentId: currentDocument._id,
      metadata: {
        pageNumber: deletedPage,
      },
    });
    const annotationDeleted = core.getAnnotationsList().filter((annot) => annot.PageNumber === deletedPage);

    if (listPageDeleted[deletedPage]) {
      const toastSetting = {
        message: t('viewer.leftPanelEditMode.pagePageLockedIsBlocked', { pageLocked: deletedPage }),
        variant: 'warning',
      };
      enqueueSnackbar(toastSetting);
      return;
    }

    if (Object.keys(listPageDeleted).length === totalPages - 1 || (totalPages === 2 && pageWillBeDeleted >= 0)) {
      const toastSetting = {
        message: t(KEEP_AT_LEAST_ONE_PAGE),
        variant: 'warning',
      };
      enqueueSnackbar(toastSetting);
      callback();
      return;
    }
    const annotManager = core.getAnnotationManager();
    if (pageWillBeDeleted !== -1) {
      const previousToastId = deletePageOperationState.toastId;
      await removeOriginPage(currentDocument, [pageWillBeDeleted], annotationDeleted, previousToastId);
      deletePageOperationState.setShouldPreventToastCloseCallback(previousToastId, true);
      closeSnackbar(previousToastId);
      if (pageWillBeDeleted < deletedPage) {
        deletedPage -= 1;
      }
    }
    setPageWillBeDeleted(deletedPage);
    annotManager.disableReadOnlyMode();
    updatePageOfManipForRemove([deletedPage]);
    dispatch(actions.disableThumb(deletedPage));

    showUndoToast(annotationDeleted, deletedPage, operationId);
    callback();
  };

  const handleSendClickEvent = ({ elementName, elementPurpose }) => {
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName,
      elementPurpose,
    });
  };

  return { inserBlankPage, rotate, movePage, removePage, handleSendClickEvent, isOffline };
};

export default usePagetoolActionFromThumbnail;
