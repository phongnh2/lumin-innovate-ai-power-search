/* eslint-disable react/no-unused-class-component-methods */
/* eslint-disable default-case */
import classNames from 'classnames';
import cloneDeep from 'lodash/cloneDeep';
import { Button, PlainTooltip, enqueueSnackbar, closeSnackbar } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import v4 from 'uuid/v4';

import IconButton from '@new-ui/general-components/IconButton';

import RequestPermissionImage from 'assets/images/permission_required.svg';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import SvgElement from 'luminComponents/SvgElement';

import authServices from 'services/authServices';
import documentServices from 'services/documentServices';

import manipulation from 'utils/manipulation';
import { eventTracking } from 'utils/recordUtil';
import { startSaveOperation, completeSaveOperation } from 'utils/saveOperationUtils';
import validator from 'utils/validator';

import { socket } from '@socket';

import { deletePageOperationState } from 'features/Document/helpers/deletePageOperationState';
import { Manipulation } from 'features/DocumentFormBuild';
import { OutlinePageManipulationUtils } from 'features/Outline/utils/outlinePageManipulation.utils';
import { PageTracker } from 'features/PageTracker/utils/pageTracker';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { documentStorage, POPPER_PERMISSION_TYPE } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { MANIPULATION_TYPE, FEATURE_VALIDATION } from 'constants/lumin-common';
import { KEEP_AT_LEAST_ONE_PAGE } from 'constants/messages';
import { Routers } from 'constants/Routers';
import { SAVE_OPERATION_TYPES, SAVE_OPERATION_STATUS } from 'constants/saveOperationConstants';
import { SOCKET_EMIT } from 'constants/socketConstant';
import toolNames from 'constants/toolsName';

import ThumbnailCanvas from './ThumbnailCanvas';
import ViewerContext from '../../../../../screens/Viewer/Context';

import * as Styled from './GridViewThumbnail.styled';

const PL = 12;
const PR = 12;
const PT = 12;
const PB = 8;
const OFFSET = 44;

const getCanvasStyle = ({ thumb, columnWidth, rowHeight }) => {
  const res = {};
  const containerWidth = columnWidth - PL - PR;
  const containerHeight = rowHeight - OFFSET - PB - PT;
  const thumbRatio = thumb.height / thumb.width;
  const containerRatio = containerHeight / containerWidth;

  switch (true) {
    // NOTE: thumb bigger than container by any axis
    case thumb.height > containerHeight || thumb.width > containerWidth:
      Object.assign(res, { maxWidth: '100%', maxHeight: '100%' });
      break;

    case thumbRatio < containerRatio:
      Object.assign(res, { width: '100%' });
      break;

    case thumbRatio > containerRatio:
      Object.assign(res, { height: '100%' });
      break;
  }
  return res;
};
class GridViewThumbnail extends React.PureComponent {
  static activeSortableIds = new Set();

  constructor(props) {
    super(props);
    this.movingRef = React.createRef();
  }

  componentDidMount() {
    const { thumb, sortableThumbnailId } = this.props;
    if (sortableThumbnailId && thumb.pageIndex === sortableThumbnailId) {
      this.setupDragEndListener();
    }
    core.docViewer.addEventListener('pageComplete', this.onPageComplete);
    this.initThumb();
  }

  componentWillUnmount() {
    clearTimeout(this.sendDeleteTimeout);
    core.docViewer.removeEventListener('pageComplete', this.onPageComplete);
  }

  setupDragEndListener = () => {
    const { sortableThumbnailId } = this.props;
    if (!GridViewThumbnail.activeSortableIds.has(sortableThumbnailId)) {
      GridViewThumbnail.activeSortableIds.add(sortableThumbnailId);
      window.addEventListener(CUSTOM_EVENT.ON_DRAG_END_THUMBNAIL_PAGE_TOOL, this.handleDragEnd(), { once: true });
    }
  };

  handleDragEnd = () => async (e) => {
    const { index, sortableThumbnailId } = this.props;
    const { currentPageIndex, dropPageIndex } = e.detail;
    if (index === currentPageIndex) {
      await this.onDragEndThumbnail({ dropPageIndex });
    }
    GridViewThumbnail.activeSortableIds.delete(sortableThumbnailId);
  };

  checkFeatureLimitation = (toolName) => {
    const { currentUser, currentDocument } = this.props;
    return validator.validateFeature({
      currentUser,
      currentDocument,
      toolName,
    });
  };

  onSubmit = async () => {
    const { navigate, openLoading, closeLoading, t } = this.props;
    openLoading();
    try {
      navigate('/payment/free-trial');
    } catch (err) {
      enqueueSnackbar({
        message: t('errorMessage.unknownError'),
        variant: 'error',
      });
    } finally {
      closeLoading();
    }
  };

  submitRequestPermission = () => {
    const { openRequestPermissionModal, closeViewerModal } = this.props;
    openRequestPermissionModal();
    closeViewerModal();
  };

  submitSignInRequired = (currentDocumentParam) => {
    const { closeViewerModal } = this.props;
    authServices.signInInsideViewer(currentDocumentParam);
    closeViewerModal();
  };

  featureLimitationSettings = () => {
    const { t, currentDocument } = this.props;
    return {
      [FEATURE_VALIDATION.SIGNIN_REQUIRED]: () => ({
        title: 'viewer.makeACopy.signInRequired',
        message: 'viewer.makeACopy.messageSignInRequired',
        confirmButtonTitle: t('authorizeRequest.signInNow'),
        cancelButtonTitle: null,
        confirmDataLumin: {
          fullWidth: true,
          size: 'lg',
        },
        center: true,
        icon: RequestPermissionImage,
        onConfirm: () => this.submitSignInRequired(currentDocument),
      }),
      [FEATURE_VALIDATION.PERMISSION_REQUIRED]: () => ({
        title: 'viewer.requestPermissionUpModal.permissionRequired',
        message: 'viewer.fileWarningModal.havePermissionToUseFeature',
        confirmButtonTitle: (
          <Trans
            i18nKey="pageTitle.requestPermissionAccess"
            values={{ permission: t(POPPER_PERMISSION_TYPE.EDITOR.text).toLowerCase() }}
          />
        ),
        center: true,
        icon: RequestPermissionImage,
        onConfirm: this.submitRequestPermission,
        cancelButtonTitle: null,
        confirmDataLumin: {
          fullWidth: true,
          size: 'lg',
        },
      }),
      [FEATURE_VALIDATION.LIMIT_FEATURE]: () => ({
        title: 'common.featureLimited',
        message: 'viewer.fileWarningModal.featuresNotAvailableOnDocumentTour',
        confirmButtonType: 'link',
        confirmButtonTitle: 'common.tryThisFeature',
        href: Routers.DOCUMENTS,
      }),
    };
  };

  handleShowModalLimitation = (featureLimitType) => {
    const { openViewerModal, t } = this.props;
    const defaultSettings = {
      title: '',
      message: '',
      confirmButtonTitle: t('action.ok'),
      confirmButtonType: undefined,
      href: undefined,
      onConfirm: null,
      onCancel: () => this.onSubmit(),
      icon: null,
      center: false,
    };

    const specificSettings = (this.featureLimitationSettings()[featureLimitType] || (() => ({})))();
    const modalSettings = {
      ...defaultSettings,
      ...specificSettings,
      title: t(specificSettings.title || defaultSettings.title),
      message: t(specificSettings.message),
    };

    openViewerModal(this.getModalSettings(modalSettings));
  };

  // eslint-disable-next-line class-methods-use-this
  getModalSettings = (modalSettings) => {
    const { icon, center, title, message, confirmButtonTitle, onConfirm, newLayoutConfirmButtonType } = modalSettings;

    return {
      title,
      message,
      center,
      icon,
      footer: (
        <Button onClick={onConfirm} variant="filled" size="lg" fullWidth type={newLayoutConfirmButtonType || 'common'}>
          {confirmButtonTitle}
        </Button>
      ),
    };
  };

  onPageComplete = () => {
    const { isPageEditMode } = this.props;
    if (isPageEditMode) {
      core.getAnnotationManager().enableReadOnlyMode();
    }
  };

  initThumb = async () => {
    const { index, thumbs, updateThumbs } = this.props;
    const angles = window.localStorage.getItem(`manipulation-${index + 1}`);
    if (angles) {
      const angleList = JSON.parse(angles);
      angleList.forEach(async (item) => {
        const rotatePage = parseInt(item);
        const rotateThumb = await manipulation.onLoadThumbs(rotatePage - 1);

        const _thumbs = [...thumbs];
        _thumbs[rotatePage - 1] = rotateThumb;
        updateThumbs(_thumbs);
      });
      manipulation.removeDataAfterRotate(index + 1);
    }
  };

  featureLimitWrapper = (action, toolName) => {
    const type = this.checkFeatureLimitation(toolName);
    if (type) {
      return () => this.handleShowModalLimitation(type);
    }
    return action;
  };

  updateThumbAfterRotating = async (index) => {
    const { thumbs, updateThumbs } = this.props;
    const _thumbs = cloneDeep(thumbs);
    const thumbRotate = await manipulation.onLoadThumbs(index);
    _thumbs[index] = thumbRotate;
    _thumbs[index].id = thumbs[index].id;
    updateThumbs(_thumbs);
  };

  handleRotate = async (angle, elementName) => {
    eventTracking(UserEventConstants.EventType.THUMBNAIL_BUTTON, {
      elementName,
    });
    const { index, currentDocument } = this.props;
    await documentServices.rotatePages({ currentDocument, pageIndexes: [index + 1], angle });
    this.updateThumbAfterRotating(index);
    eventTracking(UserEventConstants.EventType.DOCUMENT_ROTATED, {
      pagesToRotate: `${index + 1}`,
      pagesFrom: '',
      pagesTo: '',
    });
  };

  rotateLeft = async (e) => {
    e.stopPropagation();
    this.handleRotate(-1, UserEventConstants.Events.ThumbnailsButtonEvent.ROTATE_LEFT);
  };

  rotateRight = async (e) => {
    e.stopPropagation();
    this.handleRotate(1, UserEventConstants.Events.ThumbnailsButtonEvent.ROTATE_RIGHT);
  };

  removeOriginPage = async (currentDocument, pagesRemove, annotationDeleted, toastId) => {
    const { deleteThumbs, t, dispatch } = this.props;
    const { setPageWillBeDeleted, deletedPageNumberRef, bookmarkIns, setDeletedToastId } = this.context;
    if (deletedPageNumberRef.current === -1 || !core.getDocument()) {
      return;
    }
    const deletedWidget = core
      .getAnnotationManager()
      .getAnnotationsList()
      .filter(
        (annot) => pagesRemove[0] === annot.PageNumber && annot instanceof window.Core.Annotations.WidgetAnnotation
      );

    this.deleteAction = Manipulation.createDeletePageAction(pagesRemove, deletedWidget);
    await documentServices.removePages({ currentDocument, pagesRemove });

    const page = pagesRemove[0];
    bookmarkIns.undoBookmark = page;
    bookmarkIns.updatePositionOfBookmark({ type: MANIPULATION_TYPE.REMOVE_PAGE, option: { pagesRemove } });
    const manipulationId = v4();
    await manipulation.executeSocketRemovePage({
      currentDocument,
      pagesRemove,
      annotationDeleted,
      manipulationId,
    });
    await OutlinePageManipulationUtils.updateOnManipulationChanged({
      type: MANIPULATION_TYPE.REMOVE_PAGE,
      manipulationPages: [page],
    });
    PageTracker.updateOnManipulationChanged({
      type: MANIPULATION_TYPE.REMOVE_PAGE,
      manipulationPages: [page],
      manipulationId,
    });
    this.deleteAction.updateFormFieldChanged(currentDocument._id);
    const toastSuccessDelete = {
      message: t('viewer.deletePagesSuccess'),
      variant: 'success',
    };
    enqueueSnackbar(toastSuccessDelete);
    deleteThumbs(page);
    setPageWillBeDeleted(-1);
    setDeletedToastId(undefined);

    const operationId = deletePageOperationState.getOperationId(toastId);
    if (operationId) {
      completeSaveOperation(dispatch, operationId, {
        status: SAVE_OPERATION_STATUS.SUCCESS,
      });
      deletePageOperationState.removeOperationId(toastId);
    }
  };

  isDeleteDisabled = () => {
    const { isOffline, currentDocument, totalPages } = this.props;
    const { pageWillBeDeleted } = this.context;
    const hasPendingDeletion = pageWillBeDeleted !== -1;
    const isLastRemainingPage = totalPages <= 1 || (totalPages === 2 && hasPendingDeletion);
    return (isOffline && !currentDocument.isSystemFile) || isLastRemainingPage;
  };

  getDeleteTooltip = () => {
    const { totalPages, t } = this.props;
    const { pageWillBeDeleted } = this.context;
    const hasPendingDeletion = pageWillBeDeleted !== -1;
    const isLastRemainingPage = totalPages <= 1 || (totalPages === 2 && hasPendingDeletion);

    if (isLastRemainingPage) {
      return t(KEEP_AT_LEAST_ONE_PAGE);
    }
    return t('viewer.leftPanelEditMode.deletePage');
  };

  deletePage = async () => {
    const { disableThumb, currentDocument, index, t, totalPages, dispatch } = this.props;
    const { listPageDeleted, pageWillBeDeleted, setPageWillBeDeleted } = this.context;
    const deleteOperationId = startSaveOperation(dispatch, SAVE_OPERATION_TYPES.PAGE_TOOLS, {
      action: 'remove_page',
      documentId: currentDocument._id,
    });
    let deletedPage = index + 1;
    const deletedAnnots = core.getAnnotationsList().filter((annot) => deletedPage === annot.PageNumber);

    if (listPageDeleted[index + 1]) {
      const toastSetting = {
        message: t('viewer.modal.blockedPage', { page: index + 1 }),
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
      return;
    }
    const annotManager = core.getAnnotationManager();
    if (pageWillBeDeleted !== -1) {
      const previousToastId = deletePageOperationState.toastId;
      await this.removeOriginPage(currentDocument, [pageWillBeDeleted], deletedAnnots, previousToastId);
      deletePageOperationState.setShouldPreventToastCloseCallback(previousToastId, true);
      closeSnackbar(previousToastId);
      if (deletedPage > pageWillBeDeleted) {
        deletedPage -= 1;
      }
    }
    setPageWillBeDeleted(deletedPage);
    annotManager.disableReadOnlyMode();

    this.updatePageOfManipAfterDelete(deletedPage);
    disableThumb(deletedPage);
    this.openToastUndoDelete(deletedAnnots, deleteOperationId);
  };

  onClickUndoToast = async (currentDocument, toastId) => {
    const { t, dispatch } = this.props;
    const { pageWillBeDeleted } = this.context;
    if (!currentDocument.isSystemFile && currentDocument.service !== documentStorage.google) {
      socket.emit(SOCKET_EMIT.SEND_DELETED_PAGE, {
        roomId: currentDocument._id,
        pageDeleted: pageWillBeDeleted,
        undoSignal: true,
      });
    }
    enqueueSnackbar({
      message: t('modalDeleteDoc.pageUndone', { pageDeleted: pageWillBeDeleted }),
      variant: 'success',
    });
    const { enableThumb } = this.props;
    this.context.setPageWillBeDeleted(-1);
    enableThumb(pageWillBeDeleted);

    const operationId = deletePageOperationState.getOperationId(toastId);
    if (operationId) {
      completeSaveOperation(dispatch, operationId, {
        status: SAVE_OPERATION_STATUS.SUCCESS,
      });
      deletePageOperationState.removeOperationId(toastId);
    }
  };

  onToastClose = (toastId, reason, deletedAnnot) => {
    const { currentDocument } = this.props;
    const { deletedPageNumberRef } = this.context;
    const shouldPrevent = deletePageOperationState.getShouldPreventToastCloseCallback(toastId);
    if (!shouldPrevent) {
      this.removeOriginPage(currentDocument, [deletedPageNumberRef.current], deletedAnnot, toastId);
      core.scrollViewUpdated();
    }
    if (deletePageOperationState.toastId === toastId) {
      deletePageOperationState.toastId = '';
    }
  };

  openToastUndoDelete = (deletedAnnot, operationId) => {
    const { index, currentDocument, t } = this.props;
    this.sendDeleteTimeout = setTimeout(() => {
      if (!currentDocument.isSystemFile && currentDocument.service !== documentStorage.google) {
        socket.emit(SOCKET_EMIT.SEND_DELETED_PAGE, {
          roomId: currentDocument._id,
          pageDeleted: index + 1,
          undoSignal: false,
        });
      }
    }, 500);
    const toastSetting = {
      message: t('viewer.leftPanelEditMode.pagePagesRemoveDeleted', { pages: index + 1 }),
      variant: 'warning',
      actionLabel: t('viewer.leftPanelEditMode.undo'),
      onAction: () => {
        const { toastId } = deletePageOperationState;
        deletePageOperationState.setShouldPreventToastCloseCallback(toastId, true);
        this.onClickUndoToast(currentDocument, toastId);
      },
      onClose: (_event, reason, key) => this.onToastClose(key, reason, deletedAnnot),
    };
    const toastId = enqueueSnackbar(toastSetting);
    deletePageOperationState.toastId = toastId;
    deletePageOperationState.setOperationId(toastId, operationId);
  };

  openConfirmModal = (e) => {
    eventTracking(UserEventConstants.EventType.THUMBNAIL_BUTTON, {
      elementName: UserEventConstants.Events.ThumbnailsButtonEvent.DELETE,
    });
    const { t } = this.props;

    if (this.isDeleteDisabled()) {
      const toastSetting = {
        message: t(KEEP_AT_LEAST_ONE_PAGE),
        variant: 'warning',
      };
      enqueueSnackbar(toastSetting);
      return;
    }

    e.stopPropagation();
    this.deletePage();
  };

  onDragEndThumbnail = async ({ dropPageIndex }) => {
    try {
      const { index, totalPages, thumbs, currentDocument, updateThumbs, t } = this.props;
      const { listPageDeleted, bookmarkIns } = this.context;
      const featureLimitType = this.checkFeatureLimitation(toolNames.MOVE_PAGE);
      if (featureLimitType && !listPageDeleted[index + 1]) {
        this.movingRef.current?.style?.removeProperty('z-index');
        return this.handleShowModalLimitation(featureLimitType);
      }
      const currentPage = index + 1;
      if (listPageDeleted[currentPage]) {
        const toastSetting = {
          message: t('viewer.modal.blockedPage', { page: currentPage }),
          variant: 'warning',
        };
        enqueueSnackbar(toastSetting);
        return;
      }
      if (dropPageIndex >= 1 && dropPageIndex !== currentPage && dropPageIndex <= totalPages) {
        const thumbsUpdate = [...thumbs];
        const action = Manipulation.createMovePageAction(currentPage, dropPageIndex);
        const manipulationId = v4();
        await documentServices.movePages({
          currentDocument,
          pagesToMove: currentPage,
          insertBeforePage: dropPageIndex,
          manipulationId,
        });
        await OutlinePageManipulationUtils.updateOnManipulationChanged({
          type: MANIPULATION_TYPE.MOVE_PAGE,
          movedOriginPage: currentPage,
          manipulationPages: [dropPageIndex],
        });
        PageTracker.updateOnManipulationChanged({
          type: MANIPULATION_TYPE.MOVE_PAGE,
          movedOriginPage: currentPage,
          manipulationPages: [dropPageIndex],
          manipulationId,
        });
        action.updateFormFieldChanged(currentDocument._id);
        this.updatePageOfManipAfterMove(currentPage, dropPageIndex);
        bookmarkIns.updatePositionOfBookmark({
          type: MANIPULATION_TYPE.MOVE_PAGE,
          option: { pagesToMove: currentPage, insertBeforePage: dropPageIndex },
        });
        const thumbMove = thumbsUpdate[currentPage - 1];
        thumbsUpdate.splice(currentPage - 1, 1);
        thumbsUpdate.splice(dropPageIndex - 1, 0, thumbMove);
        updateThumbs(thumbsUpdate);
      }
      this.movingRef.current?.style?.removeProperty('z-index');
    } catch (error) {
      console.log(error.message);
    }
  };

  updatePageOfManipAfterMove = (pagesToMove, insertBeforePage) => {
    const {
      pageWillBeDeleted,
      setListPageDeleted,
      listPageDeleted,
      pageWillBeCropped,
      setPageWillBeCropped,
      setPageWillBeDeleted,
    } = this.context;

    const _listPageDeleted = {};
    Object.keys(listPageDeleted).forEach((key) => {
      const position = listPageDeleted[key];
      if (pagesToMove === position) {
        listPageDeleted[key] = insertBeforePage;
      } else if (insertBeforePage <= position && pagesToMove > position) {
        listPageDeleted[key] += 1;
      } else if (insertBeforePage >= position && pagesToMove < position) {
        listPageDeleted[key] -= 1;
      }
      _listPageDeleted[listPageDeleted[key]] = listPageDeleted[key];
    });
    setListPageDeleted(_listPageDeleted);

    if (pagesToMove === pageWillBeDeleted) {
      setPageWillBeDeleted(insertBeforePage);
    } else if (insertBeforePage <= pageWillBeDeleted && pagesToMove > pageWillBeDeleted) {
      setPageWillBeDeleted(pageWillBeDeleted + 1);
    } else if (insertBeforePage >= pageWillBeDeleted && pagesToMove < pageWillBeDeleted) {
      setPageWillBeDeleted(pageWillBeDeleted - 1);
    }

    if (pagesToMove === pageWillBeCropped.position) {
      setPageWillBeCropped({ ...pageWillBeCropped, position: insertBeforePage });
    } else if (insertBeforePage <= pageWillBeCropped.position && pagesToMove > pageWillBeCropped.position) {
      setPageWillBeCropped({ ...pageWillBeCropped, position: pageWillBeCropped.position + 1 });
    } else if (insertBeforePage >= pageWillBeCropped.position && pagesToMove < pageWillBeCropped.position) {
      setPageWillBeCropped({ ...pageWillBeCropped, position: pageWillBeCropped.position - 1 });
    }
  };

  updatePageOfManipAfterDelete = (page) => {
    const { listPageDeleted, setListPageDeleted } = this.context;

    const newListPageDeleted = {};
    Object.keys(listPageDeleted).forEach((key) => {
      if (listPageDeleted[key] >= page) {
        listPageDeleted[key] -= 1;
      }
      newListPageDeleted[listPageDeleted[key]] = listPageDeleted[key];
    });

    setListPageDeleted(newListPageDeleted);
  };

  renderThumb = () => {
    const { thumb, newlyPagesAdded, columnWidth, rowHeight, isDragging = false } = this.props;

    const canvasStyle = getCanvasStyle({ thumb, columnWidth, rowHeight });

    if (thumb && thumb.src) {
      return (
        <ThumbnailCanvas
          thumb={thumb}
          isDragging={isDragging}
          canvasStyle={canvasStyle}
          newlyPagesAdded={newlyPagesAdded}
        />
      );
    }
    return (
      <div className="EditModeGridViewThumb__skeleton">
        <SvgElement content="lumin-app" width={60} />
      </div>
    );
  };

  render() {
    const { t, index, thumb, newlyPagesAdded, isAnnotationsLoaded, isDragging = false, isOverlay = false } = this.props;
    const { listPageDeleted } = this.context;

    return (
      <Styled.GridViewThumbnail ref={this.movingRef} style={{ pointerEvents: !isAnnotationsLoaded ? 'none' : 'unset' }}>
        <Styled.GridViewThumbnailFrameOuter>
          <Styled.GridViewThumbnailFrameInner>
            <Styled.Container
              className={classNames('container', {
                'blocked-page': listPageDeleted[index + 1] || thumb.willBeDeleted,
                [thumb.className]: true,
                addedByMerged: newlyPagesAdded.includes(thumb.pageIndex) || newlyPagesAdded.includes(thumb.id),
              })}
            >
              {listPageDeleted[index + 1] || thumb.willBeDeleted ? (
                <PlainTooltip
                  floating
                  position="start-end"
                  content={`${t('viewer.leftPanelEditMode.page')} ${index + 1} has been deleted`}
                >
                  <Styled.BlockedOverlay />
                </PlainTooltip>
              ) : (
                <Styled.Overlay>
                  <Styled.BtnsWrapper>
                    <Styled.ButtonPaper>
                      <IconButton
                        icon="md_rotate_counter_clockwise"
                        iconSize={24}
                        onClick={this.featureLimitWrapper(this.rotateLeft, toolNames.ROTATE_PAGE)}
                        tooltipData={{ location: 'bottom', title: t('viewer.leftPanelEditMode.counterClockwise') }}
                      />
                    </Styled.ButtonPaper>
                    <Styled.ButtonPaper>
                      <IconButton
                        icon="md_rotate_clockwise"
                        iconSize={24}
                        onClick={this.featureLimitWrapper(this.rotateRight, toolNames.ROTATE_PAGE)}
                        tooltipData={{ location: 'bottom', title: t('viewer.leftPanelEditMode.clockwise') }}
                      />
                    </Styled.ButtonPaper>
                    <Styled.ButtonPaper>
                      <IconButton
                        icon="md_trash"
                        iconSize={24}
                        onClick={this.featureLimitWrapper(this.openConfirmModal, toolNames.DELETE_PAGE)}
                        tooltipData={{ location: 'bottom', title: this.getDeleteTooltip() }}
                        disabled={this.isDeleteDisabled()}
                      />
                    </Styled.ButtonPaper>
                  </Styled.BtnsWrapper>
                </Styled.Overlay>
              )}
              <Styled.ContainerInner>{this.renderThumb()}</Styled.ContainerInner>
            </Styled.Container>
          </Styled.GridViewThumbnailFrameInner>
        </Styled.GridViewThumbnailFrameOuter>
        <Styled.PageNumber
          className={classNames('page-number', {
            isDragging,
            isOverlay,
          })}
        >
          {t('viewer.leftPanelEditMode.page')} {index + 1}
        </Styled.PageNumber>
      </Styled.GridViewThumbnail>
    );
  }
}

GridViewThumbnail.propTypes = {
  index: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  thumb: PropTypes.object.isRequired,
  updateThumbs: PropTypes.func.isRequired,
  deleteThumbs: PropTypes.func.isRequired,
  currentDocument: PropTypes.object.isRequired,
  isPageEditMode: PropTypes.bool.isRequired,
  thumbs: PropTypes.array.isRequired,
  currentUser: PropTypes.object,
  openViewerModal: PropTypes.func.isRequired,
  openLoading: PropTypes.func.isRequired,
  closeLoading: PropTypes.func.isRequired,
  newlyPagesAdded: PropTypes.array.isRequired,
  isOffline: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  columnWidth: PropTypes.number.isRequired,
  rowHeight: PropTypes.number.isRequired,
  openRequestPermissionModal: PropTypes.func.isRequired,
  closeViewerModal: PropTypes.func.isRequired,
  isAnnotationsLoaded: PropTypes.bool.isRequired,
  enableThumb: PropTypes.func.isRequired,
  disableThumb: PropTypes.func.isRequired,
  sortableThumbnailId: PropTypes.number,
  isDragging: PropTypes.bool,
  isOverlay: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state) || {},
  currentDocument: selectors.getCurrentDocument(state),
  currentPage: selectors.getCurrentPage(state),
  pageLabels: selectors.getPageLabels(state),
  totalPages: selectors.getTotalPages(state),
  thumbs: selectors.getThumbs(state),
  isPageEditMode: selectors.isPageEditMode(state),
  newlyPagesAdded: selectors.getNewlyPagesAdded(state),
  isOffline: selectors.isOffline(state),
  isAnnotationsLoaded: selectors.getAnnotationsLoaded(state),
});

const mapDispatchToProps = (dispatch) => ({
  openLoading: () => dispatch(actions.openElement('loadingModal')),
  closeLoading: () => dispatch(actions.closeElement('loadingModal')),
  closeElement: (element) => dispatch(actions.closeElement(element)),
  updateThumbs: (thumbs) => dispatch(actions.updateThumbs(thumbs)),
  deleteThumbs: (position) => dispatch(actions.deleteThumbs(position)),
  openViewerModal: (modalSettings) => dispatch(actions.openViewerModal(modalSettings)),
  closeViewerModal: () => dispatch(actions.closeModal()),
  enableThumb: (position) => dispatch(actions.enableThumb(position)),
  disableThumb: (position) => dispatch(actions.disableThumb(position)),
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(GridViewThumbnail);

GridViewThumbnail.contextType = ViewerContext;
