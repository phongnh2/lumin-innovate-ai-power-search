import { Button, TextInput, enqueueSnackbar, closeSnackbar } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { v4 } from 'uuid';

import { socket } from 'src/socket';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import ViewerContext from 'screens/Viewer/Context';

import documentServices from 'services/documentServices';

import manipulation from 'utils/manipulation';
import { startSaveOperation, completeSaveOperation } from 'utils/saveOperationUtils';

import { deletePageOperationState } from 'features/Document/helpers/deletePageOperationState';
import { Manipulation } from 'features/DocumentFormBuild';
import { OutlinePageManipulationUtils } from 'features/Outline/utils/outlinePageManipulation.utils';
import { PageTracker } from 'features/PageTracker/utils/pageTracker';

import { documentStorage } from 'constants/documentConstants';
import { MANIPULATION_TYPE } from 'constants/lumin-common';
import { ERROR_MESSAGE_INVALID_PAGE, KEEP_AT_LEAST_ONE_PAGE } from 'constants/messages';
import { SAVE_OPERATION_STATUS, SAVE_OPERATION_TYPES } from 'constants/saveOperationConstants';
import { SOCKET_EMIT } from 'constants/socketConstant';

import { checkValidPageRemovedForRange, checkValidPageRemovedForSingle, expandRanges } from './utils';

import * as Styled from './DeletePanel.styled';

class DeletePanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pageRemoved: '',
      errorMsg: '',
    };
  }

  componentDidMount() {
    core.docViewer.addEventListener('pageComplete', this.onPageComplete);
  }

  componentWillUnmount() {
    core.docViewer.removeEventListener('pageComplete', this.onPageComplete);
    clearTimeout(this.sendDeleteTimeout);
  }

  // eslint-disable-next-line class-methods-use-this
  getDeletedWidgets = (pages) =>
    core
      .getAnnotationManager()
      .getAnnotationsList()
      .filter((annot) => pages.includes(annot.PageNumber) && annot instanceof window.Core.Annotations.WidgetAnnotation);

  // eslint-disable-next-line class-methods-use-this
  getAnnotationDeleted = (pages) =>
    core
      .getAnnotationManager()
      .getAnnotationsList()
      .filter((annot) => pages.includes(annot.PageNumber));

  removePages = async ({ pagesToRemove }) => {
    const { currentDocument, t } = this.props;
    const { bookmarkIns } = this.context;
    const annotationDeleted = this.getAnnotationDeleted(pagesToRemove);
    const deletedWidgets = this.getDeletedWidgets(pagesToRemove);
    this.deletePageAction = Manipulation.createDeletePageAction(pagesToRemove, deletedWidgets);

    await documentServices.removePages({ currentDocument, pagesRemove: pagesToRemove });

    bookmarkIns.updatePositionOfBookmark({
      type: MANIPULATION_TYPE.REMOVE_PAGE,
      option: { pagesRemove: pagesToRemove },
    });

    const manipulationId = v4();
    await manipulation.executeSocketRemovePage({
      currentDocument,
      pagesRemove: pagesToRemove,
      annotationDeleted,
      manipulationId,
    });

    await OutlinePageManipulationUtils.updateOnManipulationChanged({
      type: MANIPULATION_TYPE.REMOVE_PAGE,
      manipulationPages: pagesToRemove,
    });
    PageTracker.updateOnManipulationChanged({
      type: MANIPULATION_TYPE.REMOVE_PAGE,
      manipulationPages: pagesToRemove,
      manipulationId,
    });
    const toastSuccessDelete = {
      message: t('viewer.deletePagesSuccess'),
      variant: 'success',
    };
    enqueueSnackbar(toastSuccessDelete);
    this.deletePageAction.updateFormFieldChanged(currentDocument._id);
    this.context.setPageWillBeDeleted(-1);
    this.context.setDeletedToastId(undefined);
    const operationId = startSaveOperation(this.props.dispatch, SAVE_OPERATION_TYPES.PAGE_TOOLS, {
      action: 'remove_pages',
      documentId: currentDocument._id,
    });
    completeSaveOperation(this.props.dispatch, operationId, {
      status: SAVE_OPERATION_STATUS.SUCCESS,
    });
  };

  removeMultiplePages = async () => {
    const { pageRemoved } = this.state;
    const pagesExpanded = expandRanges(pageRemoved);

    await this.removePages({ pagesToRemove: pagesExpanded });
    this.props.deleteMultipleThumbnails(pagesExpanded);
  };

  removeSinglePage = async (currentDocument, pages, toastId) => {
    const { deletedPageNumberRef, bookmarkIns } = this.context;
    const { deleteThumbs } = this.props;

    if (deletedPageNumberRef.current === -1) {
      return;
    }

    [bookmarkIns.undoBookmark] = pages || [];

    await this.removePages({ pagesToRemove: pages });
    deleteThumbs(pages[0]);

    const operationId = deletePageOperationState.getOperationId(toastId);
    if (operationId) {
      completeSaveOperation(this.props.dispatch, operationId, {
        status: SAVE_OPERATION_STATUS.SUCCESS,
      });
      deletePageOperationState.removeOperationId(toastId);
    }
  };

  onPageComplete = () => {
    const { isPageEditMode } = this.props;
    if (isPageEditMode) {
      core.getAnnotationManager().enableReadOnlyMode();
    }
  };

  onChange = (e) => {
    const { value = '' } = e.target;
    this.setState({ pageRemoved: value, errorMsg: '' });
  };

  checkPageWithTotalPage = (page) => {
    const { pageWillBeDeleted } = this.context;
    const totalPages = core.getTotalPages();
    return page >= 0 && page <= totalPages && page !== pageWillBeDeleted;
  };

  confirmRemovePage = async () => {
    const { currentDocument, disableThumb, t } = this.props;
    const { pageRemoved } = this.state;
    const operationId = startSaveOperation(this.props.dispatch, SAVE_OPERATION_TYPES.PAGE_TOOLS, {
      action: 'confirm_remove_page',
      documentId: currentDocument._id,
    });

    const pagesExpanded = expandRanges(pageRemoved);

    const { listPageDeleted } = this.context;
    let [page] = pagesExpanded;

    if (listPageDeleted[page]) {
      const toastSetting = {
        message: t('viewer.leftPanelEditMode.pagePageLockedIsBlocked', { pageLocked: page }),
        variant: 'warning',
      };
      enqueueSnackbar(toastSetting);
      completeSaveOperation(this.props.dispatch, operationId, {
        status: SAVE_OPERATION_STATUS.ERROR,
      });
      return;
    }
    if (Object.keys(listPageDeleted).length === core.getTotalPages() - pagesExpanded.length) {
      const toastSetting = {
        message: t(KEEP_AT_LEAST_ONE_PAGE),
        variant: 'warning',
      };
      enqueueSnackbar(toastSetting);
      completeSaveOperation(this.props.dispatch, operationId, {
        status: SAVE_OPERATION_STATUS.ERROR,
      });
      return;
    }
    if (pagesExpanded.length > 1) {
      await this.removeMultiplePages();
      completeSaveOperation(this.props.dispatch, operationId, {
        status: SAVE_OPERATION_STATUS.SUCCESS,
      });
      return;
    }
    const annotManager = core.getAnnotationManager();
    disableThumb(page);
    if (this.context.pageWillBeDeleted !== -1) {
      const previousToastId = deletePageOperationState.toastId;
      await this.removeSinglePage(currentDocument, [this.context.deletedPageNumberRef.current], previousToastId);
      deletePageOperationState.setShouldPreventToastCloseCallback(previousToastId, true);
      closeSnackbar(previousToastId);
      if (this.context.pageWillBeDeleted < page) {
        page -= 1;
      }
    }
    this.context.setPageWillBeDeleted(page);
    annotManager.disableReadOnlyMode();

    this.updatePageOfManip([page]);
    disableThumb(page);

    this.undoDeletePageAction([page], operationId);
  };

  undoDeletePageCore = async (pageRemove) => {
    const { t } = this.props;

    const undoSuccessfully = {
      message: t('viewer.leftPanelEditMode.pagePageRemoveUndone', { pageRemove }),
      variant: 'success',
    };
    enqueueSnackbar(undoSuccessfully);
  };

  onClickUndoToast = async (currentDocument, pageRemove, toastId) => {
    if (!currentDocument.isSystemFile && currentDocument.service !== documentStorage.google) {
      socket.emit(SOCKET_EMIT.SEND_DELETED_PAGE, {
        roomId: currentDocument._id,
        pageDeleted: this.context.pageWillBeDeleted,
        undoSignal: true,
      });
    }
    await this.undoDeletePageCore(pageRemove);
    const { enableThumb } = this.props;
    this.context.setPageWillBeDeleted(-1);
    enableThumb(pageRemove);

    const operationId = deletePageOperationState.getOperationId(toastId);
    if (operationId) {
      completeSaveOperation(this.props.dispatch, operationId, {
        status: SAVE_OPERATION_STATUS.SUCCESS,
      });
      deletePageOperationState.removeOperationId(toastId);
    }
  };

  onUndoClick = (toastId) => {
    const { currentDocument } = this.props;
    this.onClickUndoToast(currentDocument, this.context.pageWillBeDeleted, toastId);
  };

  onToastClose = (toastId) => {
    const { currentDocument } = this.props;
    const { deletedPageNumberRef } = this.context;
    const shouldPrevent = deletePageOperationState.getShouldPreventToastCloseCallback(toastId);
    if (!shouldPrevent) {
      this.removeSinglePage(currentDocument, [deletedPageNumberRef.current], toastId);
      core.scrollViewUpdated();
    }
    if (deletePageOperationState.toastId === toastId) {
      deletePageOperationState.toastId = '';
    }
  };

  undoDeletePageAction = (pages, operationId) => {
    const { currentDocument, t } = this.props;
    const [page] = pages;

    this.sendDeleteTimeout = setTimeout(() => {
      if (!currentDocument.isSystemFile && currentDocument.service !== documentStorage.google) {
        socket.emit(SOCKET_EMIT.SEND_DELETED_PAGE, {
          roomId: currentDocument._id,
          pageDeleted: page,
          undoSignal: false,
        });
      }
    }, 500);

    const toastSetting = {
      title: t('viewer.leftPanelEditMode.pagePagesRemoveDeleted', { pages: page }),
      variant: 'warning',
      actionLabel: t('viewer.leftPanelEditMode.undo').replace('?', ''),
      onAction: () => {
        const { toastId } = deletePageOperationState;
        deletePageOperationState.setShouldPreventToastCloseCallback(toastId, true);
        this.onUndoClick(toastId);
      },
      onClose: (_event, _removedBy, key) => this.onToastClose(key),
    };
    const toastId = enqueueSnackbar(toastSetting);
    deletePageOperationState.toastId = toastId;
    deletePageOperationState.setOperationId(toastId, operationId);
  };

  handleRemovePages = () => {
    const { t } = this.props;
    const { pageRemoved } = this.state;
    const parts = pageRemoved.split(',');
    const isValidPageRemoved = parts.every((part) => {
      const trimmedPart = part.trim();
      return checkValidPageRemovedForSingle(trimmedPart) || checkValidPageRemovedForRange(trimmedPart);
    });
    const pagesExpanded = expandRanges(pageRemoved);
    const totalPages = core.getTotalPages();

    if (!isValidPageRemoved || !pagesExpanded.length || !pagesExpanded.every(this.checkPageWithTotalPage)) {
      this.setState({
        errorMsg: ERROR_MESSAGE_INVALID_PAGE,
      });
      return;
    }
    if (pagesExpanded.length === totalPages) {
      this.setState({
        errorMsg: KEEP_AT_LEAST_ONE_PAGE,
      });
      return;
    }

    if (!core.getDocument()) {
      enqueueSnackbar({
        message: t('viewer.viewer.documentNotLoaded'),
        variant: 'warning',
      });
      return;
    }
    if (totalPages === 1) {
      this.setState({
        errorMsg: KEEP_AT_LEAST_ONE_PAGE,
      });
      return;
    }
    this.confirmRemovePage();
  };

  updatePageOfManip = (page) => {
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

  render() {
    const { t } = this.props;
    const { pageRemoved, errorMsg } = this.state;
    const isDisabled = !pageRemoved || Boolean(errorMsg);
    const _errorMsg = errorMsg ? t(errorMsg) : errorMsg;
    return (
      <Styled.Wrapper data-cy="delete_panel">
        <Styled.Desc>{t('viewer.leftPanelEditMode.enterPageNumberToDelete')}</Styled.Desc>
        <Styled.MainContent data-cy="delete_panel_input_wrapper">
          <TextInput
            error={_errorMsg}
            onChange={this.onChange}
            placeholder={t('message.EGPages', { pages: '1,2,3-5' })}
            value={pageRemoved}
            label={t('viewer.leftPanelEditMode.page')}
            wrapperProps={{
              'data-cy': 'delete_panel_input',
            }}
          />
        </Styled.MainContent>
        <Button style={{ minWidth: 80 }} size="lg" disabled={isDisabled} onClick={this.handleRemovePages}>
          {t('common.delete')}
        </Button>
      </Styled.Wrapper>
    );
  }
}

DeletePanel.propTypes = {
  dispatch: PropTypes.func.isRequired,
  isPageEditMode: PropTypes.bool.isRequired,
  currentDocument: PropTypes.object.isRequired,
  deleteThumbs: PropTypes.func.isRequired,
  enableThumb: PropTypes.func.isRequired,
  disableThumb: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  deleteMultipleThumbnails: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  currentDocument: selectors.getCurrentDocument(state),
  isPageEditMode: selectors.isPageEditMode(state),
  themeMode: selectors.getThemeMode(state),
});
const mapDispatchToProps = (dispatch) => ({
  dispatch,
  deleteThumbs: (position) => dispatch(actions.deleteThumbs(position)),
  enableThumb: (position) => dispatch(actions.enableThumb(position)),
  disableThumb: (position) => dispatch(actions.disableThumb(position)),
  addThumbs: (thumbs, position) => dispatch(actions.addThumbs(thumbs, position)),
  deleteMultipleThumbnails: (positions) => dispatch(actions.deleteMultipleThumbnails(positions)),
});

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(DeletePanel));
DeletePanel.contextType = ViewerContext;
