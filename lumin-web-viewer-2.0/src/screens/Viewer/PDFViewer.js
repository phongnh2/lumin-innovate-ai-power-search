/* eslint-disable react/sort-comp */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable class-methods-use-this */
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import memoize from 'lodash/memoize';
import remove from 'lodash/remove';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import IdleTimer from 'react-idle-timer';
import { connect, batch } from 'react-redux';
import { matchPath } from 'react-router-dom';
import { compose } from 'redux';
import v4 from 'uuid/v4';
import { isEmail } from 'validator';

import { enqueueSnackbar } from '@libs/snackbar';
import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { isComment } from 'lumin-components/CommentPanel/helper';
import App from 'luminComponents/App';
import CustomHeader from 'luminComponents/CustomHeader';

import { Handler, cachingFileHandler, commandHandler, storageHandler, systemFileHandler } from 'HOC/OfflineStorageHOC';

import { isDisconnected } from 'hooks/useSocketStatus';
import { isViewerRouteMatch } from 'hooks/useViewerMatch';

import documentServices from 'services/documentServices';
import googleServices from 'services/googleServices';
import documentGraphServices from 'services/graphServices/documentGraphServices';
import { updateOrgMemberRoleSubscription } from 'services/graphServices/organization';
import { updateTeamSubscription } from 'services/graphServices/team';
import indexedDBService from 'services/indexedDBService';
import { oneDriveServices } from 'services/oneDriveServices';
import PersonalDocumentUploadService from 'services/personalDocumentUploadService';
import { socketService } from 'services/socketServices';
import uploadServices from 'services/uploadServices';
import { confirmUpdateAnnotation } from 'services/userServices';

import { isNewUser, isUserNotShownModal, saveOpenedDocIds } from 'helpers/autoSyncIntroModal';
import convertBase64ToSignedUrl, { convertMultipleBase64ToSignedUrl } from 'helpers/convertBase64ToSignedUrl';
import { setCustomStampDeserializer } from 'helpers/customAnnotationSerializer';
import { isOwnerOfAllAnnotations } from 'helpers/editOtherPersonAnnotations';
import emitUnsavedAnnotations from 'helpers/emitUnsavedAnnotations';
import exportAnnotationCommand from 'helpers/exportAnnotationCommand';
import fireEvent from 'helpers/fireEvent';
import getCurrentRole from 'helpers/getCurrentRole';
import getFormFieldType from 'helpers/getFormFieldType';
import importWidgetAnnotations from 'helpers/importWidgetAnnotations';
import loadDocument from 'helpers/loadDocument';
import logger from 'helpers/logger';
import { pageContentUpdatedListener } from 'helpers/pageContentUpdatedListener';
import pushOfflineTrackingEvents from 'helpers/pushOfflineTrackingEvents';
import { requestIdleCallback, cancelIdleCallback } from 'helpers/requestIdleCallback';
import setAssociatedSignatureAnnotation from 'helpers/setAssociatedSignatureAnnotation';
import setDimensionCustomDataForAnnotation from 'helpers/setDimensionCustomDataForAnnotation';
import { setModifyPermissionInCustomStorage } from 'helpers/setModifyPermissionInCustomStorage';
import showSessionExpiredModal from 'helpers/showSessionExpiredModal';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';
import { disableToolsForOfflineMode, enableDisabledTools } from 'helpers/toggleToolsForOfflineMode';
import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';
import trackAnnotationChanged from 'helpers/trackAnnotationChanged';

import array from 'utils/array';
import checkDocumentType from 'utils/checkDocumentType';
import compressImage from 'utils/compressImage';
import { isElectron } from 'utils/corePathHelper';
import dateUtil from 'utils/date';
import { DocumentPermission } from 'utils/documentPermissionUtils';
import { canUseImageSignedUrl } from 'utils/documentUtil';
import errorExtract from 'utils/error';
import { DocumentCategory } from 'utils/Factory/DocumentCategory';
import { fileUtils } from 'utils/file';
import { getWidgetXfdf, increasePageNumberXfdf } from 'utils/formBuildUtils';
import * as ga from 'utils/ga';
import getFileService from 'utils/getFileService';
import { getFullPathWithPresetLang } from 'utils/getLanguage';
import googleDriveError from 'utils/googleDriveError';
import { makeCancelable } from 'utils/makeCancelable';
import manipulation from 'utils/manipulation';
import mime from 'utils/mime-types';
import OneDriveErrorUtils from 'utils/oneDriveError';
import pageOverlayUtil from 'utils/pageOverlay';
import { queryClient } from 'utils/queryClient';
import { eventTracking, isPWAMode } from 'utils/recordUtil';
import topbarUtils from 'utils/topbarUtils';
import validator from 'utils/validator';

import { closeEditInAgreementGenModal } from 'features/AgreementGen/slices';
import { FetchingAnnotationsContext } from 'features/Annotation/contexts';
import { useCurrentAnnotationsStore } from 'features/Annotation/hooks/useCurrentAnnotationsStore';
import { handlePromptEditAnnotation } from 'features/Annotation/utils';
import annotationLoadObserver from 'features/Annotation/utils/annotationLoadObserver';
import { setInternalAnnotationTransform } from 'features/Annotation/utils/processLoadAnnotation';
import { updateAnnotationAvatarSource } from 'features/Annotation/utils/updateAnnotationAvatarSource';
import { annotationSyncQueue } from 'features/AnnotationSyncQueue';
import { bottomToastActions } from 'features/BottomToast/slice';
import getDontShowFreeTrialModalAgainClicked from 'features/CNC/helpers/getDontShowFreeTrialModalAgainClicked';
import { getDriveCollaborators } from 'features/CNC/helpers/getDriveCollaborator';
import { useCollaborationStore } from 'features/Collaboration/slices';
import { digitalSignatureActions } from 'features/DigitalSignature/slices';
import { onSyncProofingProgress } from 'features/DigitalSignature/utils/socketListener';
import { documentSyncActions } from 'features/Document/document-sync.slice';
import viewerHelper from 'features/Document/helpers';
import { processImportedAnnotations } from 'features/Document/helpers/importAnnotationChangeData';
import { isTemplateViewerRouteMatch } from 'features/Document/hooks/useTemplateViewerMatch';
import { documentCacheBase, getCacheKey } from 'features/DocumentCaching';
import { XfdfExporter, onFormFieldChanged } from 'features/DocumentFormBuild';
import importFieldValue from 'features/DocumentFormBuild/importFieldValue';
import { useChatbotStore } from 'features/EditorChatBot/hooks/useChatbotStore';
import { useEditorChatBotAbortStore } from 'features/EditorChatBot/hooks/useEditorChatBotAbortStore';
import { resetEditorChatBotState, clearMessages } from 'features/EditorChatBot/slices';
import { toolCallingQueue } from 'features/EditorChatBot/utils/toolCallingQueue';
import { AppFeatures, featureStoragePolicy } from 'features/FeatureConfigs';
import { guestModeManipulateCache } from 'features/GuestModeManipulateCache/base';
import { guestModeManipulateIndexedDb } from 'features/GuestModeManipulateCache/guestModeManipulateIndexedDb';
import { isTempEditMode } from 'features/OpenForm/hooks/useIsTempEditMode';
import formCaching from 'features/OpenForm/utils/formCaching';
import { onOutlinesUpdated } from 'features/Outline';
import outlineDrawerUtil from 'features/Outline/utils/outlineDrawer.util';
import { OutlinePageManipulationUtils } from 'features/Outline/utils/outlinePageManipulation.utils';
import { PageTracker } from 'features/PageTracker/utils/pageTracker';
import { resetExternalStorageState } from 'features/QuotaExternalStorage/slices';
import { readAloudSelectors } from 'features/ReadAloud/slices';
import { setIsOpenSaveAsTemplate } from 'features/SaveAsTemplate/slices';
import { convertSignatureToBase64, getAssociatedSignatures } from 'features/Signature/utils';

import { PRIORITY_ONE, PRIORITY_THREE } from 'constants/actionPriority';
import { AUTO_SYNC_STATUS } from 'constants/autoSyncConstant';
import {
  CUSTOM_DATA_COMMENT_HIGHLIGHT,
  CUSTOM_DATA_REORDER_ANNOTATION,
  CUSTOM_DATA_STAMP_ANNOTATION,
  CUSTOM_DATA_WIDGET_ANNOTATION,
  CUSTOM_DATA_COMMENT,
} from 'constants/customDataConstant';
import DataElements from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';
import {
  AnnotationSubjectMapping,
  documentStorage,
  DOCUMENT_TYPE,
  ACCOUNTABLE_BY,
  ANNOTATION_ACTION,
  ANNOTATION_CHANGE_SOURCE,
  COMMENT_PANEL_LAYOUT_STATE,
  ANNOTATION_SUBJECT_MUST_BE_CONVERTED_TO_SIGNED_URL,
  AnnotationSubTypes,
  DocumentFromSourceEnum,
  SHARE_LINK_TYPE,
} from 'constants/documentConstants';
import { DEFAULT_DOMAIN_WHITE_LIST } from 'constants/domainWhitelist';
import { ErrorCode } from 'constants/errorCode';
import UserEventConstants from 'constants/eventConstants';
import fitMode from 'constants/fitMode';
import { FORM_FIELD_TYPE } from 'constants/formBuildTool';
import { LocalStorageKey } from 'constants/localStorageKey';
import {
  ModalTypes,
  MANIPULATION_TYPE,
  STATUS_CODE,
  TIMEOUT,
  LOGGER,
  DOCUMENT_ROLES,
  STORAGE_TYPE,
  MAX_THUMBNAIL_SIZE,
} from 'constants/lumin-common';
import { OrganizationRoles } from 'constants/organization.enum';
import { ROUTE_MATCH, Routers } from 'constants/Routers';
import { SAVE_OPERATION_STATUS, SAVE_OPERATION_TYPES } from 'constants/saveOperationConstants';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';
import { SOCKET_EMIT, SOCKET_EMIT_TYPE, SOCKET_ON } from 'constants/socketConstant';
import { ModalPriority } from 'constants/styles/Modal';
import SubscriptionConstants from 'constants/subscriptionConstant';
import { imageExtensions } from 'constants/supportedFiles';
import {
  RENDER_PDF_DOCUMENT,
  DOWNLOAD_DOCUMENT_COMPLETE,
  FIRST_PAGE_RENDER,
  START_DOWNLOAD_DOCUMENT,
  OPEN_PDF_DOCUMENT,
  OPEN_DEVICE_DOCUMENT,
  TIME_USER_STAY,
  FETCH_DOCUMENT_INFO,
  LOAD_CORE,
  LOAD_GAPI,
} from 'constants/timeTracking';
import { TOOLS_NAME } from 'constants/toolsName';
import { STATIC_PAGE_URL } from 'constants/urls';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import Bookmarks from './bookmarks';
import Config from './config';
import { BACKUP_ANNOTATION_REASON } from './constants/backup-annotation';
import ViewerContext from './Context';
import { onExceptionError, onTokenExpired } from './socketHandlers';
import OfflineStrategy from './Strategy/OfflineStrategy';
import OnlineStrategy from './Strategy/OnlineStrategy';
import timeTracking from './time-tracking';
import { CareTaker } from './undoRedo';
import { drawUnsavedChangeAnnotations } from './utils/drawUnsavedChangeAnnotations';
import { getOpenFromState } from './utils/getOpenFromState';
import { handleUpdateQuotaExternalStorage } from './utils/handleUpdateQuotaExternalStorage';
import { recordTrackingPerformance } from './utils/recordTrackingPerformance';
import { socket } from '../../socket';

const IDLE_TIME = parseInt(process.env.IDLE_TIME);
const TRANSLATION_VIEWER_RELOAD = 'viewer.reload';
const MAXIMUM_MANIPULATION = 35;

class AppContainer extends React.PureComponent {
  getFileInfoPromise = null;

  constructor(props) {
    super(props);
    this.state = {
      onlineMembers: [],
      showAccessUpdateToast: false,
      accessUpdateToastTitle: '',
      pageWillBeDeleted: -1,
      listPageDeleted: {},
      pageWillBeCropped: {},
      isDocumentHasLimitedTime: false,
      loadedAnnot: false,
    };
    this.anonymousId = null;
    this.isDocumentSyncing = false;
    this.isManipulationExec = false;
    this.careTaker = null;
    this.config = null;
    this.editedFreeText = -1;
    this.emptyCommentAnnot = false;
    this.onDocumentLoaded = this.onDocumentLoaded.bind(this);
    this.onAnnotationsLoaded = this.onAnnotationsLoaded.bind(this);
    this.loadAnnotationChange = this.loadAnnotationChange.bind(this);
    this.refetchDocument = this.refetchDocument.bind(this);
    this.sharedPinpointAttributes = null;
    this.allowShowExpiredToast = true;
    this.operationId = null;

    const { currentDocument, t, disableElement, enableElement, saveOperations } = props;
    this.bookmarksInstance = new Bookmarks(t);
    this.isOfflineEnabled = Handler.isOfflineEnabled && currentDocument?.isOfflineValid;
    this.annotationChangedStacks = [];
    this.manipulationChangeStacks = [];
    this.formFieldChangedStacks = [];
    this.usedImageRemoteIds = new Set();
    this.shouldCacheFile = false;
    this.debounceSetSaveStatus = debounce((isOffline) => {
      if (this.operationId) {
        saveOperations.completeOperation(this.operationId, {
          status: isOffline ? SAVE_OPERATION_STATUS.OFFLINE : SAVE_OPERATION_STATUS.SUCCESS,
        });
      }
    }, TIMEOUT.SAVE_ANNOT);
    /**
     * batch action due to optimize performance
     */
    this.debounceSetSavingStatus = debounce((action) => {
      if (this.operationId) {
        saveOperations.removeOperation(this.operationId);
      }
      this.operationId = saveOperations.startOperation(action, {
        documentId: this.currentDocument._id,
      });
    }, TIMEOUT.SAVING_STATUS);
    this.debounceSetCustomTabOrder = debounce(() => {
      this.setCustomTabOrder();
    }, TIMEOUT.CONTENT_CHANGED);
    this.disableElementDebounced = this.memoizeDebounce(disableElement, TIMEOUT.SAVING_STATUS);
    this.enableElementDebounced = this.memoizeDebounce(enableElement, TIMEOUT.SAVING_STATUS);
    this.deletedPageNumberRef = React.createRef(-1);
    this.deletedPageToastId = React.createRef(null);
    this.isReloadDocument = React.createRef(false);

    this.getFileInfoPromise = makeCancelable((remoteId) => googleServices.getFileInfo(remoteId, '*', 'loadDocument'));
  }

  memoizeDebounce(func, wait = 0, options = {}) {
    const mem = memoize(() => debounce(func, wait, options), options.resolver);
    return function (...args) {
      mem.apply(this, args).apply(this, args);
    };
  }

  getDocumentContext = () => ({
    listPageDeleted: this.state.listPageDeleted,
    pageWillBeDeleted: this.state.pageWillBeDeleted,
    showAccessUpdateToast: this.state.showAccessUpdateToast,
    accessUpdateToastTitle: this.state.accessUpdateToastTitle,
    pageWillBeCropped: this.state.pageWillBeCropped,
    isLoadingDocument: this.state.isLoadingDocument,
    isDocumentHasLimitedTime: this.state.isDocumentHasLimitedTime,
    bookmarkIns: this.bookmarksInstance,
    allowShowExpiredToast: this.allowShowExpiredToast,
    setListPageDeleted: this.setListPageDeleted,
    setPageWillBeDeleted: this.setPageWillBeDeleted,
    setPageWillBeCropped: this.setPageWillBeCropped,
    refetchDocument: this.refetchDocument,
    reloadDocument: this.reloadDocument,
    reloadDocumentToViewer: this.reloadDocumentToViewer,
    openPreviewOriginalVersion: this.openPreviewOriginalVersion,
    openDocumentRevision: this.openDocumentRevision,
    onlineMembers: this.state.onlineMembers,
    deletedPageNumberRef: this.deletedPageNumberRef,
    setDeletedToastId: this.setDeletedToastId,
    deletedPageToastId: this.deletedPageToastId.current,
  });

  async refetchDocument(callback = () => {}) {
    const { currentUser, currentDocument, dispatch, t } = this.props;
    const { setAnnotations } = this.context;

    if (currentDocument.temporaryEdit) {
      await callback(currentDocument);
      return;
    }

    try {
      if (currentDocument.isSystemFile) {
        const systemFile = await systemFileHandler.get(currentDocument._id);
        if (isFunction(callback)) {
          await callback(systemFile);
        }
        return;
      }
      const isTemplateViewer = this.isTemplateViewerPath();
      const { promise: getDocumentPromise, cancel: cancelGetDocument } = makeCancelable(() =>
        isTemplateViewer
          ? documentGraphServices.getDocumentTemplate({ documentId: currentDocument._id })
          : documentGraphServices.getDocument({ documentId: currentDocument._id, usePwa: isPWAMode() })
      );
      this.cancelGetAnnotations = cancelGetDocument;
      const data = await getDocumentPromise();
      const responseDocument = get(data, isTemplateViewer ? 'data.documentTemplate' : 'data.document', {});
      const responseFormFields = get(data, 'data.getFormField', []);
      if (!isEmpty(responseDocument)) {
        const { promise: getAnnotationPromise, cancel: cancelGetAnnotations } = makeCancelable(() =>
          documentServices.getAnnotations({ documentId: responseDocument._id })
        );
        this.cancelGetAnnotations = cancelGetAnnotations;
        const newAnnotations = await getAnnotationPromise();
        const updatedPermissionOfDocument = { roleOfDocument: responseDocument.roleOfDocument, isGuest: false };
        if (!currentUser || responseDocument.roleOfDocument === 'guest') {
          updatedPermissionOfDocument.roleOfDocument = responseDocument.shareSetting.permission;
          updatedPermissionOfDocument.isGuest = true;
        }
        const updatedDocument = {
          ...currentDocument,
          ...responseDocument,
          ...updatedPermissionOfDocument,
          fields: responseFormFields,
        };
        updatedDocument.newAnnotations = newAnnotations;
        this.props.setCurrentDocument(updatedDocument);
        setAnnotations(newAnnotations);
        if (viewerHelper.isAdminUser(currentUser, updatedDocument)) {
          core.setIsAdminUser(true);
        }
        this.manipulation = updatedDocument.manipulationStep ? JSON.parse(updatedDocument.manipulationStep) : null;
        if (updatedDocument?.lastModify) {
          const lastModify = dateUtil.convertToRelativeTime(Number(updatedDocument.lastModify), t);
          dispatch(
            documentSyncActions.updateSaveOperation({
              id: this.operationId,
              updates: {
                message: t('viewer.lastUpdateWas', { lastModify }),
              },
            })
          );
        }
        if (isFunction(callback)) {
          await callback(updatedDocument);
        }
      }
    } catch (error) {
      if (!error.isCanceled) {
        logger.logError({ error, reason: LOGGER.Service.REFETCH_DOCUMENT_ERROR });
      }
    }
  }

  handleLocalStorageChange = (e) => {
    if (e.key === 'logout' && !localStorage.getItem('token') && localStorage.getItem('logout')) {
      showSessionExpiredModal();
    }
  };

  isCurrentUser = (userId) => {
    const { currentUser } = this.props;
    return currentUser?._id === userId;
  };

  showAccessUpdateToast = (userId) => {
    if (this.isCurrentUser(userId)) {
      this.setState({ showAccessUpdateToast: true });
    }
  };

  shouldNotifyUserAfterRemovedAccess = ({ linkType, currentDocument }) => {
    const currentRole = getCurrentRole(currentDocument);
    const shareSettingRole = get(currentDocument, 'shareSetting.permission', DOCUMENT_ROLES.SPECTATOR).toUpperCase();

    if (linkType === SHARE_LINK_TYPE.INVITED) {
      return true;
    }

    if (linkType === SHARE_LINK_TYPE.ANYONE) {
      return currentRole !== shareSettingRole;
    }

    logger.logError({
      reason: LOGGER.Service.COMMON_ERROR,
      message: `Invalid linkType received from remove user access: ${linkType}`,
    });

    return false;
  };

  handlePopupBlockedError = () => {
    const { currentDocument, t, dispatch } = this.props;
    const documentService = currentDocument.service;

    const modalProps = {
      [STORAGE_TYPE.GOOGLE]: {
        type: ModalTypes.DRIVE,
        message: t('openDrive.popupBrowserBlocked', {
          storageService: 'Drive',
        }),
      },
      [STORAGE_TYPE.ONEDRIVE]: {
        type: ModalTypes.ONE_DRIVE,
        message: t('openDrive.popupBrowserBlocked', {
          storageService: 'OneDrive',
        }),
      },
    }[documentService];

    const popupTriggerFunc = {
      [STORAGE_TYPE.GOOGLE]: () =>
        googleServices.implicitSignIn({
          callback: () => {
            window.location.reload();
          },
          onError: (googleAPIError) => {
            logger.logError({
              reason: LOGGER.Service.GOOGLE_API_ERROR,
              error: googleAPIError,
            });
          },
          loginHint: googleServices.getAccessTokenEmail(),
        }),
      [STORAGE_TYPE.ONEDRIVE]: async () => {
        await oneDriveServices.getToken();
        window.location.reload();
      },
    }[documentService];

    this.props.dispatch(
      actions.openModal({
        ...modalProps,
        title: t('openDrive.permissionRequired'),
        confirmButtonTitle: t('openDrive.givePermission'),
        onConfirm: popupTriggerFunc,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        isFullWidthButton: false,
        priority: ModalPriority.HIGH,
        ...(isElectron() && {
          cancelButtonTitle: t('common.cancel'),
          onCancel: () => dispatch(actions.closeModal()),
        }),
      })
    );
  };

  async componentDidMount() {
    const { setIsShowTopBar, isOffline, currentDocument, currentUser, error, setCurrentDocument, t, navigate, match } =
      this.props;
    try {
      this.config = new Config(t);

      if (error) {
        throw error;
      }
      this.config.addEventListener();
      this.config.overrideHighlightColor();
      this.onlineStrategy = new OnlineStrategy(currentDocument._id);
      this.offlineStrategy = new OfflineStrategy(currentDocument._id);

      this.onlineStrategy.isInitialized = false;
      this.offlineStrategy.isInitialized = false;

      if (process.env.NODE_ENV === 'production') {
        core.enableAllElements = () => {};
        core.enableElement = () => {};
        core.enableElements = () => {};
      }
      window.forceOut = false;

      const eventValue = localStorage.getItem(LocalStorageKey.OPEN_STARTED_DOCUMENT);
      if (eventValue) {
        localStorage.removeItem(LocalStorageKey.OPEN_STARTED_DOCUMENT);
        const data = JSON.parse(eventValue);
        eventTracking(data.eventName, {}, data.metrics);
      }

      this.setState({ loadedAnnot: false });

      const annotManager = core.getAnnotationManager();
      this.careTaker = new CareTaker(annotManager, {
        disableElement: this.disableElementDebounced,
        enableElement: this.enableElementDebounced,
        setCurrentDocument,
      });
      this.props.setCareTaker(this.careTaker);
      core.docViewer.addEventListener('pageComplete', this.onPageComplete);
      core.docViewer.addEventListener('documentLoaded', this.onDocumentLoaded);
      core.docViewer.addEventListener('documentReady', this.onDocumentReady);
      core.docViewer.addEventListener('annotationsLoaded', this.onAnnotationsLoaded);
      core.docViewer.addEventListener('loaderror', this.loaderror);
      this.manipulation = currentDocument.manipulationStep ? JSON.parse(currentDocument.manipulationStep) : null;
      this.attachOnAnnotationChanged();
      cachingFileHandler.subServiceWorkerHandler(this.handleMessage);
      this.checkEmbedJsPossibility();
      pageContentUpdatedListener.addEventListener();
      this.currentDocument = currentDocument;

      const currentTopbarState = topbarUtils.isDocumentTopbarShow(currentDocument._id);
      setIsShowTopBar(currentTopbarState);

      if (isOffline) {
        if (currentDocument.isOverTimeLimit) {
          return;
        }
        this.offlineStrategy.isInitialized = true;
        this.offlineRegisterEvent();
        this.offlineDidmountHandler();
        const extensionByName = fileUtils.getExtension(currentDocument.name);
        const extensionByMime = mime.extension(currentDocument.mimeType);
        const fileType = extensionByMime || extensionByName;

        const documentOptions = {
          filename: currentDocument.name,
          documentId: currentDocument._id,
          extension: fileType || 'pdf',
        };
        documentOptions.loadAsPDF = true;
        loadDocument({
          dispatch: this.props.dispatch,
          src: currentDocument.file,
          options: documentOptions,
          navigate,
        });
      } else {
        this.onlineStrategy.isInitialized = true;
        if (this.isOfflineEnabled && !this.offlineStrategy.isSystemFile) {
          // Update isOverTimeLimit property
          cachingFileHandler.update({
            _id: this.currentDocument._id,
            isOverTimeLimit: this.currentDocument.isOverTimeLimit,
          });
        }
        /* check document has over 1 years with free user */
        if (currentDocument.isOverTimeLimit) {
          throw new Error('document_has_limited_time');
        }
        this.onlineRegisterEvent(currentDocument);
        await this.loadDocumentToViewer(currentDocument);
        this.onlineDidmountHandler(this.currentDocument);
      }

      setModifyPermissionInCustomStorage({
        currentUser,
        currentDocument,
        annotManager,
      });
    } catch (appError) {
      if (appError.isCanceled) {
        return;
      }
      const oneDriveErrorUtils = new OneDriveErrorUtils([{ error: appError }]);
      const { statusCode, code } = errorExtract.extractGqlError(appError);
      if (code === ErrorCode.Common.RESTRICTED_ACTION) {
        this.props.setIsLoadingDocument(false);
        return;
      }
      const logData = {
        error: appError,
        reason: ErrorCode.Document.UNKNOWN_ERROR,
      };
      if (statusCode !== STATUS_CODE.FORBIDDEN) {
        this.props.setIsLoadingDocument(false);
      }

      if (appError.message === 'document_has_limited_time') {
        logger.logInfo({
          reason: LOGGER.EVENT.DOCUMENT_LIMITED_TIME,
        });
        this.setState({ isDocumentHasLimitedTime: true });
        return;
      }
      if (googleDriveError.isBlockPopUpError(appError) || oneDriveErrorUtils.isPopupBlockedError()) {
        this.handlePopupBlockedError();
        return;
      }

      if (googleDriveError.isSigninDriveRequiredError(appError)) {
        logger.logError({
          ...logData,
          reason: LOGGER.EVENT.GOOGLE_DRIVE_SIGNIN_REQUIRED,
        });
        return viewerHelper.handleSignInDriveRequiredError();
      }

      if (googleDriveError.isFileNotFound(appError) || appError.message === 'file_not_found_dropbox') {
        logger.logError({
          ...logData,
          reason: LOGGER.EVENT.GOOGLE_DRIVE_DOCUMENT_NOT_FOUND,
        });
        return this.props.setDocumentNotFound();
      }

      if (appError.message === ErrorCode.Document.SYSTEM_FILE_OPEN_ERROR) {
        this.props.navigate('/documents/personal');
        return;
      }

      if (appError.graphQLErrors || appError.message === 'offline_file_not_found') {
        logger.logError({
          ...logData,
          reason: LOGGER.Service.GRAPHQL_ERROR,
        });
        const isTemplateViewer = this.isTemplateViewerPath();
        viewerHelper.handleRequestAccessCheck({ match, navigate, currentUser, isTemplateViewer });
      } else {
        logger.logError({
          ...logData,
          reason: JSON.stringify(appError.message),
        });
        const modalSetting = {
          type: ModalTypes.ERROR,
          title: t('modalCannotOpenFile.title'),
          message:
            appError.code && appError.type === 'googleDrive'
              ? t('viewer.errorOpenDrive', { errorCode: appError.code })
              : t('modalCannotOpenFile.message'),
          cancelButtonTitle: t('common.openAnotherFile'),
          confirmButtonTitle: t('common.reload'),
          footerVariant: 'variant4',
          onCancel: () => {
            if (!currentUser) {
              navigate(Routers.SIGNIN);
              return;
            }
            const documentListFallbackUrl =
              sessionStorage.getItem(SESSION_STORAGE_KEY.DOCUMENT_LIST_FALLBACK_URL) || Routers.DOCUMENTS;
            navigate(documentListFallbackUrl);
          },
          onConfirm: () => window.location.reload(),
        };
        this.props.openViewerModal(modalSetting);
      }
    }
  }

  loaderror(error) {
    logger.logError({
      reason: LOGGER.Service.PDFTRON,
      error: `loaderror: ${error}`,
    });
  }

  checkEmbedJsPossibility = () => {
    const { currentDocument, setIsEmbeddedJavascript } = this.props;
    /**
     * disable Embedded JavaScript
     */
    const isValidOwnerEmail =
      currentDocument.ownerEmail &&
      validator.validateEmailByDomains(currentDocument.ownerEmail, DEFAULT_DOMAIN_WHITE_LIST);
    if (
      // Need to add optional chaining to cover case offline mode has old data that don't have metadata property
      !currentDocument.metadata?.hasMerged &&
      (currentDocument.fromSource === DocumentFromSourceEnum.LUMIN_TEMPLATES_LIBRARY || isValidOwnerEmail)
    ) {
      setIsEmbeddedJavascript(true);
      window.Core.enableEmbeddedJavaScript();
    } else {
      setIsEmbeddedJavascript(false);
      window.Core.disableEmbeddedJavaScript();
    }
  };

  async componentDidUpdate(prevProps, prevState) {
    const { isInReadAloudMode } = this.props;

    if (prevProps.isPageEditMode !== this.props.isPageEditMode && prevProps.isPageEditMode) {
      this.careTaker.clearUndoRedoStack();
    }
    if (prevProps.organizations.loading && !this.props.organizations.loading) {
      this.setupDocumentStatus();
    }
    if (prevProps.isAnyDialogTypeOpen !== this.props.isAnyDialogTypeOpen && this.props.isAnyDialogTypeOpen) {
      viewerHelper.setHoveringRedactionAnnotation(false);
    }
    if (prevProps.isAnyDialogTypeOpen !== this.props.isAnyDialogTypeOpen && !this.props.isAnyDialogTypeOpen) {
      viewerHelper.setHoveringRedactionAnnotation(true);
    }
    if (!prevProps.isOffline && this.props.isOffline && this.isOfflineEnabled && !this.isAnonymousDocument) {
      this.onOffline();
    }
    if (prevProps.isOffline && !this.props.isOffline && this.isOfflineEnabled && !this.isAnonymousDocument) {
      this.onOnline();
    }
    if (prevState.loadedAnnot && !this.state.loadedAnnot) {
      this.removeAnnotationEvent();
    }
    if (prevState.pageWillBeDeleted !== this.state.pageWillBeDeleted) {
      this.deletedPageNumberRef.current = this.state.pageWillBeDeleted;
    }
    if (prevProps.isInReadAloudMode !== isInReadAloudMode) {
      const annotationManager = core.getAnnotationManager();
      if (isInReadAloudMode) {
        annotationManager.enableReadOnlyMode();
      } else {
        annotationManager.disableReadOnlyMode();
      }
    }
  }

  abortEditorChatbot = () => {
    const { abortController } = useEditorChatBotAbortStore.getState();
    if (abortController) {
      abortController.abort();
    }
  };

  clearEditorChatbot = () => {
    this.abortEditorChatbot();
    this.props.clearChatBotMessage();
    useChatbotStore.getState().resetChatbotStore();
    this.props.dispatch(resetEditorChatBotState());
    toolCallingQueue.clearQueue();
    this.props.setBackDropMessage(null);
  };

  resetAllIdleCallbacks = () => {
    if (this.cachingIdleCallback) {
      cancelIdleCallback(this.cachingIdleCallback);
    }
    if (this.syncFileIdleCallback) {
      cancelIdleCallback(this.syncFileIdleCallback);
    }
  };

  resetAnnotationState = () => {
    annotationLoadObserver.clean();
    useCurrentAnnotationsStore.getState().reset();
  };

  componentWillUnmount() {
    this.careTaker?.clearUndoRedoStack();
    this.resetAnnotationState();
    this.removeTempPdfPassword();
    this.getFileInfoPromise?.cancel();
    this.cancelGetAnnotations?.();
    this.resetAllIdleCallbacks();
    if (core.getToolMode()?.name === TOOLS_NAME.SIGNATURE) {
      core.setToolMode(defaultTool);
    }
    viewerHelper.recordRenderPDFDocument(this.sharedPinpointAttributes);
    viewerHelper.recordGetStartedDocument({ keepAlive: false, fromNewAuthFlow: this.props.fromNewAuthFlow });
    const { match, currentUser, currentDocument } = this.props;
    const { documentId } = match.params;
    this.config.destructor();
    this.bookmarksInstance.destructorBookmark();
    this.removeAnnotationEvent();
    if (currentUser && !currentDocument?.isSystemFile) {
      this.handleEmitDisconnect(currentDocument, currentUser);
    }
    cachingFileHandler.unSubServiceWorkerHandler(this.handleMessage);
    this.removeSocketListener(documentId);
    window.removeEventListener('message', this.handleMessageDropbox);
    core.docViewer.removeEventListener('pageComplete', this.onPageComplete);
    core.docViewer.removeEventListener('documentLoaded', this.onDocumentLoaded);
    core.docViewer.removeEventListener('annotationsLoaded', this.onAnnotationsLoaded);
    core.docViewer.removeEventListener('documentReady', this.onDocumentReady);
    core.docViewer.removeEventListener('beforeDocumentLoaded', this.onBeforeDocumentLoaded);
    core.docViewer.removeEventListener('finishedRendering', this.onFinishRendering);
    core.docViewer.removeEventListener('loaderror', this.loaderror);
    window.removeEventListener('storage', this.handleLocalStorageChange);
    this.resetToDefaultTool();
    this.props.resetPDFViewer();
    this.props.dispatch(closeEditInAgreementGenModal());
    this.props.resetDocumentViewer();
    this.props.resetGeneralLayout();
    this.props.resetCurrentDocument();
    this.props.setIsLoadingDocument(true);
    this.props.setAnnotationsLoaded(false);
    this.props.setIsDocumentReady(false);
    this.setState({ loadedAnnot: false });
    window.removeEventListener('refetchDocument', this.refetchDocument);
    window.removeEventListener('sessionExpired', showSessionExpiredModal);
    delete Bookmarks.instance;
    core.getTool(TOOLS_NAME.SIGNATURE).clearPreviewSignatureElement();
    core.getDocument()?.unloadResources();
    core.docViewer.dispose();
    core.closeDocument();
    core.clearSearchResults();
    this.props.resetSearchResult();
    this.props.resetSearchValue();
    pageContentUpdatedListener.removeEventListener();
    sessionStorage.removeItem(SESSION_STORAGE_KEY.SUMMARIZED_ERROR_CODE);
    queryClient.clear();
    this.clearEditorChatbot();
    this.props.dispatch(resetExternalStorageState());
    this.props.dispatch(bottomToastActions.resetBottomToast());
    this.props.dispatch(digitalSignatureActions.resetDigitalSignature());
    this.props.dispatch(setIsOpenSaveAsTemplate(false));
  }

  resetToDefaultTool = () => {
    core.setToolMode(defaultTool);
  };

  removeTempPdfPassword = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY.PDF_PASSWORD);
  };

  removeSocketListener(documentId) {
    const { currentDocument } = this.props;
    const { remoteId } = currentDocument || {};
    socket.removeListener({ message: `${SOCKET_ON.ADD_TO_SHARE_LIST}-${documentId}` });
    socket.removeListener({ message: SOCKET_ON.NEW_COMER });
    socket.removeListener({ message: SOCKET_ON.MANIPULATION_CHANGE });
    socket.removeListener({ message: SOCKET_ON.ANNOTATION_CHANGE });
    socket.removeListener({ message: SOCKET_ON.ONLINE_MEMBERS });
    socket.removeListener({ message: SOCKET_ON.RECONNECT });
    socket.removeListener({ message: SOCKET_ON.DISCONNECT, listener: this.onSocketDisconnect });
    socket.removeListener({ message: SOCKET_ON.CONNECT, listener: this.onSocketConnect });
    socket.removeListener({ message: `${SOCKET_ON.REMOVE_FROM_SHARE_LIST}-${documentId}` });
    socket.removeListener({ message: `${SOCKET_ON.UPDATE_PERMISSION}-${documentId}` });
    socket.removeListener({ message: `${SOCKET_ON.CHANGE_TEAM_ROLE}` });
    socket.removeListener({ message: `${SOCKET_ON.REMOVE_DOCUMENT}-${documentId}` });
    socket.removeListener({ message: `${SOCKET_ON.REMOVE_TEAMMEMBER}` });
    socket.removeListener({ message: `${SOCKET_ON.CHANGE_SHARE_SETTING}` });
    socket.removeListener({ message: SOCKET_ON.DELETED_PAGE_UPDATED });
    socket.removeListener({ message: SOCKET_ON.REMOVE_ORG_MEMBER });
    socket.removeListener({ message: `${SOCKET_ON.UPDATED_TEXT_CONTENT}-${documentId}` });
    socket.removeListener({ message: `${SOCKET_ON.UPDATE_DOCUMENT_ACTION_PERMISSION_SETTINGS}-${documentId}` });
    socket.removeListener({ message: SOCKET_ON.INVALID_IP_ADDRESS });
    socket.removeListener({ message: SOCKET_ON.TOKEN_EXPIRED });
    socket.removeListener({ message: SOCKET_ON.EXCEPTION, listener: this.onSocketException });
    socket.removeListener({ message: SOCKET_ON.OUTLINES_UPDATE });
    socket.removeListener({ message: SOCKET_ON.SYNC_PROOFING_PROGRESS });
    socket.removeListener({ message: SOCKET_ON.FORM_FIELD_CHANGE });
    if (remoteId) {
      socket.removeListener({ message: `${SOCKET_ON.UPDATED_TEXT_CONTENT}-${remoteId}` });
    }
    this.subscriptionUpdateMemberRoleObserver?.unsubscribe();
  }

  handleEmitDisconnect(currentDocument, currentUser) {
    const { documentId } = this.props.match.params;
    if (currentDocument?._id || documentId) {
      socket.emit(SOCKET_EMIT.DISCONNECTION, {
        roomId: currentDocument?._id || documentId,
        remoteId: currentDocument?.remoteId,
        user: {
          _id: currentUser._id,
          name: currentUser.name,
          avatarRemoteId: currentUser.avatarRemoteId,
        },
      });
    }
  }

  isGuestPath = () => {
    const { location } = this.props;
    return !!matchPath(
      {
        path: '/viewer/guest/:documentId',
        exact: false,
        strict: false,
      },
      location.pathname
    );
  };

  isTemplateViewerPath = () => {
    const { location } = this.props;
    return isTemplateViewerRouteMatch(location.pathname);
  };

  handleEmitConnect(documentId, user) {
    const { location } = this.props;
    const isGuestPath = this.isGuestPath();
    if (!isGuestPath && !isTempEditMode(location.pathname) && documentId) {
      socket.emit(SOCKET_EMIT.CONNECTION, {
        roomId: documentId,
        user,
      });
    }
  }

  onSocketDisconnect = () => {
    const { currentUser, currentDocument } = this.props;
    if (currentUser) {
      this.handleEmitDisconnect(currentDocument, currentUser);
    }
  };

  onSocketConnect = () => {
    const { currentUser, currentDocument } = this.props;
    if (currentUser) {
      this.handleEmitConnect(currentDocument._id, {
        _id: currentUser._id,
        name: currentUser.name,
        avatarRemoteId: currentUser.avatarRemoteId,
      });
    } else {
      this.handleEmitConnect(currentDocument._id, {
        _id: this.anonymousId,
        name: 'Anonymous',
        avatarRemoteId: null,
        isActive: true,
      });
  }
  };

  onUpdatedTextContent = async ({ isSyncing, status, increaseVersion } = {}) => {
    const { t, dispatch, isDefaultMode } = this.props;
    const shouldShowBackDropMessage = increaseVersion || !isDefaultMode;

    dispatch(actions.updateCurrentDocument({ status: { isSyncing } }));
    dispatch(documentSyncActions.setIsSyncing({ isSyncing, increaseVersion }));

    const isSyncingStatus = ['preparing', 'syncing'].includes(status);
    if (isSyncing && isSyncingStatus && shouldShowBackDropMessage) {
      dispatch(actions.setBackDropMessage(t('viewer.documentIsUpdating')));
      return;
    }

    if (!isSyncing) {
      if (shouldShowBackDropMessage) {
        const autoCloseTimeInMs = 3000;
        dispatch(
          actions.setBackDropMessage(t('viewer.documentUpdated'), {
            closeDelay: autoCloseTimeInMs,
            status: 'success',
          })
        );
      }
      if (increaseVersion) {
        await this.reloadDocumentToViewer();
      }
      dispatch(actions.setBackDropMessage(null));
    }
  };

  onUpdatedTextContentByRemoteId = ({ increaseVersion, status, documentId: documentIdParam }) =>
    this.props.conflictVersionHandler.onUpdatedTextContentByRemoteId({
      increaseVersion,
      status,
      documentId: documentIdParam,
      reloadCallback: this.reloadDocument,
    });

  onlineRegisterEvent(doc) {
    const { currentUser, currentDocument, t, dispatch } = this.props;
    const { _id: documentId, isSystemFile, remoteId } = doc;
    const isTemplateViewerPath = this.isTemplateViewerPath();

    core.docViewer.addEventListener('beforeDocumentLoaded', this.onBeforeDocumentLoaded);
    core.docViewer.addEventListener('finishedRendering', this.onFinishRendering, { once: true });
    window.addEventListener('message', this.handleMessageDropbox, false);
    window.addEventListener('storage', this.handleLocalStorageChange);
    window.addEventListener('unload', this.onWindowUnload);
    window.addEventListener('refetchDocument', this.refetchDocument);
    if (currentDocument.documentType === DOCUMENT_TYPE.ORGANIZATION && isTemplateViewerPath) {
      this.subscriptionUpdateMemberRoleObserver = updateOrgMemberRoleSubscription({
        orgId: currentDocument.clientId,
        callback: ({ userId, role }) => {
          if (userId === currentUser._id && role === OrganizationRoles.MEMBER) {
            this.showAccessUpdateToast(userId);
          }
        },
      });
    }

    if (currentDocument.documentType === DOCUMENT_TYPE.ORGANIZATION_TEAM && isTemplateViewerPath) {
      this.subscriptionUpdateMemberRoleObserver = updateTeamSubscription({
        userId: currentUser._id,
        callback: ({ team, type }) => {
          switch (type) {
            case SubscriptionConstants.Subscription.TRANSFER_TEAM_OWNERSHIP:
            case SubscriptionConstants.Subscription.TRANSFER_TEAM_OWNERSHIP_BY_MANAGER:
            case SubscriptionConstants.Subscription.TRANSFER_TEAM_OWNERSHIP_BY_LUMIN_ADMIN:
              if (team._id === currentDocument.clientId) {
                this.showAccessUpdateToast(currentUser._id);
              }
              break;
            default:
              break;
          }
        },
      });
    }
    if (!isSystemFile) {
      socket.on(SOCKET_ON.CONNECT, this.onSocketConnect);
      socket.on(SOCKET_ON.DISCONNECT, this.onSocketDisconnect);

      socket.on(`${SOCKET_ON.ADD_TO_SHARE_LIST}-${documentId}`, (data) => {
        const { totalSharedList: total } = data;
        // totalSharedList should not include the owner
        dispatch(actions.updateCurrentDocument({ sharedPermissionInfo: { total } }));
      });

      socket.on(SOCKET_ON.NEW_COMER, async (data = {}) => {
        this.isDocumentSyncing = !!data.isSyncing;
        dispatch(actions.updateCurrentDocument({ status: { isSyncing: this.isDocumentSyncing } }));
      });

      socket.on(SOCKET_ON.MANIPULATION_CHANGE, async (data) => {
        const { isLoadingDocument } = this.props;
        if (isLoadingDocument) {
          this.manipulationChangeStacks.push(data);
        } else {
          await this.loadManipulationChange(data);
        }
      });

      socket.on(SOCKET_ON.ONLINE_MEMBERS, (data) => {
        this.setState({ onlineMembers: data.members });
      });

      socket.on(`${SOCKET_ON.REMOVE_FROM_SHARE_LIST}-${documentId}`, (data) => {
        const { userId, linkType, totalSharedList } = data;

        const shouldShowAccessUpdateToast =
          this.isCurrentUser(userId) && this.shouldNotifyUserAfterRemovedAccess({ linkType, currentDocument });

        if (shouldShowAccessUpdateToast) {
          this.setState({ showAccessUpdateToast: true });
        }
        // totalSharedList should not include the owner
        dispatch(actions.updateCurrentDocument({ sharedPermissionInfo: { total: totalSharedList } }));
      });

      socket.on(SOCKET_ON.ANNOTATION_CHANGE, async (data) => {
        const { isLoadingDocument } = this.props;
        if (isLoadingDocument) {
          this.annotationChangedStacks.push(data);
        } else {
          await this.loadAnnotationChange(data);
        }
      });

      socket.on(SOCKET_ON.REMOVE_ORG_MEMBER, (data) => {
        const { userId } = data;
        this.showAccessUpdateToast(userId);
      });

      socket.on(`${SOCKET_ON.UPDATE_PERMISSION}-${documentId}`, (data) => {
        const { userId, type } = data;
        if (type === SOCKET_EMIT_TYPE.UPDATED_PERMISSION || this.isCurrentUser(userId)) {
          this.setState({ showAccessUpdateToast: true });
        }
      });

      socket.on(SOCKET_ON.CHANGE_TEAM_ROLE, (data) => {
        const { userId } = data;
        this.showAccessUpdateToast(userId);
      });

      socket.on(`${SOCKET_ON.REMOVE_DOCUMENT}-${documentId}`, (data) => {
        const { userId, type } = data;
        if (type === SOCKET_EMIT_TYPE.DELETE || this.isCurrentUser(userId)) {
          this.setState({ showAccessUpdateToast: true });
        }
      });

      socket.on(`${SOCKET_ON.REMOVE_TEAMMEMBER}`, (data) => {
        const { userId } = data;
        const { currentDocument } = this.props;
        if (this.isCurrentUser(userId) && currentDocument.shareSetting.linkType === 'INVITED') {
          this.setState({ showAccessUpdateToast: true });
        }
      });

      socket.on(`${SOCKET_ON.CHANGE_SHARE_SETTING}`, () => {
        const { currentDocument } = this.props;
        const currentRole = getCurrentRole(currentDocument);
        if (currentUser && ![DOCUMENT_ROLES.SHARER, DOCUMENT_ROLES.OWNER].includes(currentRole)) {
          this.setState({ showAccessUpdateToast: true });
        }
      });

      socket.on(SOCKET_ON.DELETED_PAGE_UPDATED, (data) => {
        const { pageWillBeDeleted, listPageDeleted } = this.state;
        const { updateThumbs, thumbs } = this.props;

        let { pageDeleted } = data;
        const { undoSignal } = data;
        const newListPageDeleted = { ...listPageDeleted };
        const newThumbList = array.removeElementFromArrayByIndex({ array: thumbs, removeIndex: pageDeleted });
        updateThumbs(newThumbList);
        if (pageWillBeDeleted !== -1 && pageDeleted > pageWillBeDeleted) {
          pageDeleted -= 1;
        }
        if (undoSignal) {
          viewerHelper.unLockPage(newListPageDeleted[pageDeleted]);
          delete newListPageDeleted[pageDeleted];
          enqueueSnackbar({
            variant: 'warning',
            message: t('modalDeleteDoc.pageUndone', { pageDeleted }),
          });
        } else {
          newListPageDeleted[pageDeleted] = pageDeleted;
          viewerHelper.lockPage(newListPageDeleted[pageDeleted]);
          enqueueSnackbar({
            variant: 'warning',
            message: t('modalDeleteDoc.pageRemoved', { pageDeleted }),
          });
        }
        this.setState({ listPageDeleted: newListPageDeleted });
      });

      socket.on(`${SOCKET_ON.UPDATED_TEXT_CONTENT}-${remoteId}`, this.onUpdatedTextContentByRemoteId);

      socket.on(`${SOCKET_ON.UPDATED_TEXT_CONTENT}-${documentId}`, this.onUpdatedTextContent);

      socket.on(SOCKET_ON.BULK_UPDATE_DOCUMENT_MEMBER_LIST, (data) => {
        const { currentDocument: { documentReference, documentType } = {}, currentUser } = this.props;
        if (!documentReference || documentReference.accountableBy === ACCOUNTABLE_BY.PERSONAL) {
          return;
        }
        // Skip showing toast for the user who initiated the bulk update for better user experience
        if (data?.actorId && currentUser?._id === data.actorId) {
          return;
        }
        if (documentType === DOCUMENT_TYPE.ORGANIZATION) {
          this.setState({
            showAccessUpdateToast: true,
          });
        }
      });
      socket.on(SOCKET_ON.INVALID_IP_ADDRESS, onExceptionError(this.props.dispatch));
      socket.on(SOCKET_ON.TOKEN_EXPIRED, onTokenExpired(showSessionExpiredModal));
      window.addEventListener('sessionExpired', showSessionExpiredModal);
      this.onSocketException = onExceptionError(this.props.dispatch);
      socket.on(SOCKET_ON.EXCEPTION, this.onSocketException);

      socket.on(SOCKET_ON.FORM_FIELD_CHANGE, (data) => {
        const { isLoadingDocument } = this.props;
        if (isLoadingDocument) {
          this.formFieldChangedStacks.push(data);
        } else {
          onFormFieldChanged(data);
        }
      });

      socket.on(SOCKET_ON.OUTLINES_UPDATE, onOutlinesUpdated);
      socket.on(SOCKET_ON.SYNC_PROOFING_PROGRESS, onSyncProofingProgress);
      socket.on(SOCKET_ON.UPDATE_DOCUMENT, (data) => {
        const { type, service, name, size } = data;
        if (type === 'updateService') {
          dispatch(actions.updateCurrentDocument({ service }));
          this.refetchDocument();
        }
        if (type === 'rename') {
          dispatch(actions.updateCurrentDocument({ name }));
        }
        if (type === 'size') {
          dispatch(actions.updateCurrentDocument({ size }));
        }
      });

      socket.on(`${SOCKET_ON.UPDATE_DOCUMENT_ACTION_PERMISSION_SETTINGS}-${documentId}`, () => {
        if (this.state.showAccessUpdateToast) {
          return;
        }

        this.setState({ showAccessUpdateToast: true });
      });
    }
  }

  onlineDidmountHandler(doc) {
    const { currentUser } = this.props;
    const annotManager = core.getAnnotationManager();
    commandHandler.enabledOfflineTracking = this.isOfflineEnabled;
    this.setupDocumentStatus();
    this.bookmarksInstance.initialBookmarks(doc, currentUser);
    this.bookmarksInstance.isInOfflineMode = false;
    if (currentUser) {
      !doc.isSystemFile &&
        this.handleEmitConnect(doc._id, {
          _id: currentUser._id,
          name: currentUser.name,
          avatarRemoteId: currentUser.avatarRemoteId,
        });
      if ((doc.isPersonal && doc.ownerId === this.props.currentUser._id) || doc.ownerOfTeamDocument) {
        core.setIsAdminUser(true);
      }
      annotManager.setCurrentUser(currentUser.email);
    } else {
      const anonymousId = v4();
      this.anonymousId = anonymousId;
      this.handleEmitConnect(doc._id, {
        _id: anonymousId,
        name: 'Anonymous',
        avatarRemoteId: null,
        isActive: true,
      });
      annotManager.setCurrentUser('Anonymous');
      ga.trackingAnonymous();
    }
    this.careTaker.initialStack = [];

    const userStripeCustomerId = this.props.currentUser?.payment.customerRemoteId || '';
    const orgStripeCustomerIds =
      this.props.organizations.data?.map((org) => org.organization.payment.customerRemoteId).filter(Boolean) || [];
    this.sharedPinpointAttributes = {
      LuminUserId: currentUser?.clientId,
      LuminFileId: doc._id,
      StripeCustomerId: orgStripeCustomerIds[0] || userStripeCustomerId,
      source: doc.service,
    };
  }

  offlineRegisterEvent() {
    // TODO
  }

  offlineDidmountHandler() {
    const { currentUser } = this.props;
    const doc = this.currentDocument;
    this.bookmarksInstance.initialBookmarks(doc, currentUser);
    this.bookmarksInstance.isInOfflineMode = true;
    if (!doc.isSystemFile) {
      disableToolsForOfflineMode();
    }
    this.setupDocumentStatus();
    commandHandler.enabledOfflineTracking = false;

    this.careTaker.initialStack = doc.newAnnotations || [];
    core.setIsAdminUser(doc.isPersonal && doc.ownerId === currentUser._id);
    core.setCurrentUser(currentUser.email);
  }

  // eslint-disable-next-line max-lines-per-function
  onOnline = async () => {
    const { currentUser, currentDocument, thumbs, enableElements, t, dispatch } = this.props;
    try {
      if (!this.isOfflineEnabled || this.offlineStrategy.isSystemFile) {
        return;
      }
      pushOfflineTrackingEvents();
      enableDisabledTools(enableElements);
      commandHandler.enabledOfflineTracking = true;
      const { includedCommentOnly } = await commandHandler.getCommandStatus(currentDocument._id);
      const oldRole = getCurrentRole(currentDocument);
      const newDocument = await this.onlineStrategy.getDocument();
      const currentRole = getCurrentRole(newDocument);
      const roleChanged = oldRole !== currentRole;
      const canComment = DocumentPermission.canComment({ roleOfDocument: currentRole });
      const canEdit = DocumentPermission.canEdit({ roleOfDocument: currentRole });
      const canSyncAnnotations = (canComment && includedCommentOnly) || canEdit;
      dispatch(actions.setCurrentDocument(newDocument));
      if (canSyncAnnotations) {
        enqueueSnackbar({
          variant: 'info',
          message: t('viewer.infoSyncing'),
        });
      } else if (roleChanged) {
        await this.openPermissionChangedModal(currentRole);
        return;
      }

      const annotManager = core.getAnnotationManager();
      setModifyPermissionInCustomStorage({
        currentUser,
        currentDocument: newDocument,
        annotManager,
      });
      if (!this.onlineStrategy.isInitialized) {
        this.onlineStrategy.isInitialized = true;
        this.onlineDidmountHandler(newDocument);
      }
      this.onlineRegisterEvent(newDocument);
      const cachedDocument = await cachingFileHandler.get(newDocument._id);

      // TODO: Need to verify getting annotations
      const [newDocumentAnnotations, newImageSignedUrls, newFormField] = await Promise.all([
        documentServices.getAnnotations({ documentId: newDocument._id }),
        documentGraphServices.refreshDocumentImageSignedUrls(newDocument._id),
        documentGraphServices.getFormFields(newDocument._id),
      ]);
      newDocument.newAnnotations = newDocumentAnnotations;
      newDocument.imageSignedUrls = newImageSignedUrls;
      newDocument.fields = newFormField;
      this.currentDocument = {
        ...this.currentDocument,
        ...newDocument,
      };
      if (cachedDocument.version !== newDocument.version) {
        core.CoreControls.getDefaultBackendType().then(async (backendType) => {
          const workerTransportPromise = core.CoreControls.initPDFWorkerTransports(
            backendType,
            {},
            process.env.PDFTRON_LICENSE_KEY
          );

          const options = {
            workerTransportPromise,
            extension: 'pdf',
          };
          try {
            await core.loadDocument(newDocument.signedUrl, options);
            this.setState({ loadedAnnot: false });
            core.refreshAll();
            core.updateView();
            this.setupDocumentStatus();
            this.onAnnotationsLoaded();
            enqueueSnackbar({
              variant: 'success',
              message: t('viewer.yourChangesAreSyncedSuccessfully'),
            });
          } catch (error) {
            logger.logError({
              message: error.message,
              reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
              error,
            });
          }
        });
        return;
      }
      this.isManipulationExec = true;
      if (newDocument.manipulationStep) {
        const currentManipulation = this.manipulation ? this.manipulation : [];
        const tempActions = (await commandHandler.getAllTempAction(currentDocument._id)).filter(
          (action) => action.type === 'manipulation'
        );
        tempActions.forEach((action) => {
          currentManipulation.push({ type: action.method, option: action.option });
        });
        const oldManipulation = JSON.stringify(currentManipulation);
        const oldManipulationContent = oldManipulation.substring(1, oldManipulation.length - 1);
        const currentManipulationContent = newDocument.manipulationStep.substring(
          1,
          newDocument.manipulationStep.length - 1
        );
        let newManipulationContent = currentManipulationContent.replace(oldManipulationContent, '');
        if (newManipulationContent[0] === ',') {
          newManipulationContent = newManipulationContent.replace(',', '');
        }
        const newManipulation = `[${newManipulationContent}]`;
        if (newManipulation) {
          const revertManipStep = await commandHandler.getRevertManipulationStep(currentDocument._id);
          for (const manipulationStep of [...revertManipStep, ...JSON.parse(newManipulation)]) {
            await manipulation.executeManipulationFromData({
              data: manipulationStep,
              thumbs,
            });
          }
        }
      }

      if (newDocument.newAnnotations.length > 0) {
        newDocument.newAnnotations.forEach((row) => {
          try {
            if (row && row.xfdf) {
              viewerHelper.updateImportedAnnot({ row, currentDocument: newDocument, currentUser });
            }
          } catch (e) {
            // By pass unknow issue of annotations
            logger.logError({
              message: 'Sync annotation error',
              reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
              error: e,
            });
          }
        });
      }
      newDocument.fields.forEach((field) => {
        viewerHelper.importFieldData(field);
      });

      const {
        annotations: dbAnnotations,
        manipulations: dbManipulations,
        fields: dbFields,
      } = await commandHandler.getAllCommandWillBeSynced({
        documentId: currentDocument._id,
        newUnqAnnots: annotManager.getAnnotationsList().filter((annot) => annot.Subject === 'LUnique'),
      });
      core.setIsAdminUser(newDocument.isPersonal && newDocument.ownerId === currentUser._id);

      const newAnnotations = [];
      const newManipulations = [];
      const newFields = [];
      const listOtherAuthor = new Set();

      dbAnnotations.forEach(async (annot) => {
        await viewerHelper.updateImportedAnnot({ row: annot, currentDocument, currentUser });
        documentServices.emitData({ document: currentDocument, type: SOCKET_EMIT.ANNOTATION_CHANGE, data: annot });

        newAnnotations.push({
          xfdf: annot.xfdf,
          annotationId: annot.annotationId,
        });
        if (isEmail(annot.annotationAuthor || '') && currentUser.email !== annot.annotationAuthor) {
          listOtherAuthor.add(annot.annotationAuthor);
        }
      });

      dbFields.forEach(({ name, value }) => {
        const field = annotManager.getFieldManager().getField(name);
        if (field) {
          newFields.push({ name, value });
          importFieldValue(name, value);
          socket.emit(SOCKET_EMIT.FORM_FIELD_CHANGE, {
            roomId: currentDocument._id,
            fieldName: field.name,
            data: {
              type: field.type,
              value,
              name: field.name,
              widgetId: field.widgets[0].Id,
              pageNumber: field.widgets[0].PageNumber,
            },
          });
        }
      });
      if (listOtherAuthor.size > 0) {
        viewerHelper.sendEditOtherAnnotationNotification(listOtherAuthor, currentDocument);
      }

      for (const manipStep of dbManipulations) {
        await manipulation.executeManipulationFromData({
          data: manipStep,
          thumbs,
        });
        await new Promise((resolve) => {
          socket.emit(
            SOCKET_EMIT.SEND_MANIPULATION_CHANGED,
            {
              ...manipStep,
              roomId: currentDocument._id,
            },
            () => {
              newManipulations.push(manipStep);
              resolve(true);
            }
          );
        });
      }

      cachingFileHandler.update(newDocument, {
        newAnnotations,
        newManipulations,
        newFields,
      });
      commandHandler.deleteAllCommands(currentDocument._id);
      commandHandler.deleteTempAction(currentDocument._id);
      viewerHelper.syncDocumentFromOfflineMode(newDocument, this.bookmarksInstance);

      this.isManipulationExec = false;
      this.manipulation = newDocument.manipulationStep
        ? [...JSON.parse(newDocument.manipulationStep), ...newManipulations]
        : newManipulations;
      this.isOfflineEnabled = Handler.isOfflineEnabled && this.currentDocument.isOfflineValid;
      enqueueSnackbar({
        variant: 'success',
        message: t('viewer.yourChangesAreSyncedSuccessfully'),
      });

      const stampAnnotations = core
        .getAnnotationsList()
        .filter(
          (annotation) =>
            ANNOTATION_SUBJECT_MUST_BE_CONVERTED_TO_SIGNED_URL.includes(annotation.Subject) &&
            annotation instanceof window.Core.Annotations.StampAnnotation &&
            !annotation.getCustomData(CUSTOM_DATA_STAMP_ANNOTATION.REMOTE_ID.key)
        );

      const haveEditPermission = ![DOCUMENT_ROLES.VIEWER, DOCUMENT_ROLES.COMMENTER].includes(currentRole);
      if (stampAnnotations.length && !this.offlineStrategy.isSystemFile && haveEditPermission) {
        await Promise.all(stampAnnotations.map((annot) => convertBase64ToSignedUrl(annot)));
      }
    } catch (err) {
      this.handleOnOnlineException(err);
    } finally {
      this.allowShowExpiredToast = true;
    }
  };

  handleOnOnlineException = async (err) => {
    const { navigate, openViewerModal, t, currentDocument } = this.props;
    let modalSetting = {
      type: ModalTypes.INFO,
      title: t('viewer.syncFailed'),
      message: err.message,
      confirmButtonTitle: t(TRANSLATION_VIEWER_RELOAD),
      onConfirm: () => window.location.reload(),
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      isFullWidthButton: true,
    };
    await cachingFileHandler.delete(currentDocument._id);
    const { code: errorCode } = errorExtract.extractGqlError(err);
    logger.logError({
      error: err,
      reason: 'Sync failed after online',
    });
    switch (errorCode) {
      case ErrorCode.Document.DOCUMENT_HAS_BEEN_DELETED:
        modalSetting = {
          ...modalSetting,
          title: t('viewer.documentHasBeenDeleted'),
          message: t('viewer.messageDocumentHasBeenDeleted'),
          confirmButtonTitle: t('common.copy'),
          cancelButtonTitle: t('viewer.goToDocsList'),
          onCancel: () => navigate('/documents'),
          onConfirm: this.handleCopyDocument,
        };
        break;
      case ErrorCode.Document.DOCUMENT_NOT_FOUND:
      case ErrorCode.Common.FORBIDDEN:
      case ErrorCode.Document.NO_DOCUMENT_PERMISSION: {
        modalSetting = {
          ...modalSetting,
          title: t('viewer.canNoLongerViewThisDocument'),
          message: t('viewer.unsavedChangesWillBeLost'),
          onConfirm: () => navigate('/documents'),
          confirmButtonTitle: t('viewer.goToDocsList'),
          cancelButtonTitle: '',
        };
        break;
      }
      default: {
        break;
      }
    }
    openViewerModal(modalSetting);
  };

  openPermissionChangedModal = async (currentRole) => {
    const { openViewerModal, currentDocument, t } = this.props;
    await commandHandler.deleteAllCommands(currentDocument._id, {
      keepCommentAnnot: DocumentPermission.canComment({ roleOfDocument: currentRole }),
    });
    const roleTitle = DocumentPermission.canComment({ roleOfDocument: currentRole })
      ? t('viewer.comment')
      : t('viewer.viewOnly');
    const modalSetting = {
      type: ModalTypes.INFO,
      title: t('viewer.permissionChange', { roleTitle }),
      message: t('viewer.messagePermissionChange'),
      confirmButtonTitle: t(TRANSLATION_VIEWER_RELOAD),
      cancelButtonTitle: '',
      onConfirm: () => window.location.reload(),
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      isFullWidthButton: true,
    };
    openViewerModal(modalSetting);
  };

  handleCopyDocument = async () => {
    const { updateModalProperties, currentDocument } = this.props;
    updateModalProperties({
      isProcessing: true,
    });
    const file = await getFileService.getLinearizedDocumentFile(currentDocument.name);
    const { linearizedFile, documentInstance } = await uploadServices.linearPdfFromFiles(file);

    const thumbnailCanvas = await fileUtils.getThumbnailWithDocument(documentInstance, {});
    const thumbnail = await fileUtils.convertThumnailCanvasToFile(thumbnailCanvas);
    const compressedThumbnail =
      thumbnail &&
      (await compressImage(thumbnail, {
        convertSize: MAX_THUMBNAIL_SIZE,
        maxWidth: 800,
        maxHeight: 400,
      }));
    const { workspaceId } = currentDocument.belongsTo;
    const uploader = new PersonalDocumentUploadService();
    const { encodedUploadData } = await documentServices.uploadDocumentWithThumbnailToS3({
      file: linearizedFile,
      thumbnail: compressedThumbnail,
    });
    const createdDocument = await uploader.upload({
      encodedUploadData,
      orgId: workspaceId,
    });
    logger.logInfo({
      message: LOGGER.EVENT.FILE_UPLOADED,
      reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
    });
    window.location.href = `/viewer/${createdDocument._id}`;
  };

  onOffline = () => {
    if (!this.isOfflineEnabled || this.offlineStrategy.isSystemFile) {
      return;
    }
    this.allowShowExpiredToast = false;
    this.bookmarksInstance.isInOfflineMode = true;
    const { currentDocument } = this.props;
    const formFieldCreationManager = core.getFormFieldCreationManager();
    if (formFieldCreationManager.isInFormFieldCreationMode()) {
      toggleFormFieldCreationMode('', { forceClose: true });
    }
    if (!this.offlineStrategy.isSystemFile) {
      disableToolsForOfflineMode();
    }
    const documentId = currentDocument._id;
    this.setupDocumentStatus();
    this.offlineStrategy.isInitialized = true;
    commandHandler.enabledOfflineTracking = false;
    window.removeEventListener('unload', this.onWindowUnload);
    window.removeEventListener('message', this.handleMessageDropbox);
    core.docViewer.removeEventListener('beforeDocumentLoaded', this.onBeforeDocumentLoaded);
    core.docViewer.removeEventListener('finishedRendering', this.onFinishRendering);
    window.removeEventListener('storage', this.handleLocalStorageChange);
    window.removeEventListener('sessionExpired', showSessionExpiredModal);
    this.removeSocketListener(documentId);
  };

  handleMessage = ({ initiator, action, data }) => {
    const { currentDocument } = this.props;
    if (!initiator) {
      switch (action) {
        case Handler.EVENTS.FINISHED_DOWNLOAD:
          if (data === currentDocument._id) {
            this.setUpOffline(true);
          }
          break;
        case Handler.EVENTS.DELETE_CACHING_FILE:
        case Handler.EVENTS.DOWNLOAD_FAILED:
          if (data === currentDocument._id) {
            this.setUpOffline(false);
          }
          break;
        default:
          break;
      }
    }
  };

  loadAnnotationChange = async (data) => {
    if (!core.getDocument()) {
      return;
    }
    const { annotationType, imageRemoteId, isInternal } = data;
    let { xfdf } = data;
    const annotManager = core.getAnnotationManager();
    const { pageWillBeDeleted } = this.state;
    const { currentDocument, internalAnnotationIds, dispatch } = this.props;

    xfdf = this.adjustXfdfPageIndex(xfdf, annotationType);

    const annotationsFromXfdf = await this.importAnnotationsFromXfdf(xfdf, annotationType, currentDocument._id);
    const annotations = processImportedAnnotations(annotationsFromXfdf, pageWillBeDeleted);

    if (imageRemoteId && this.isOfflineEnabled) {
      const signedUrl = await annotationsFromXfdf[0].getImageData();
      cachingFileHandler.updateDocumentImageUrlById(currentDocument._id, { signedUrl, remoteId: imageRemoteId });
    }
    if (isInternal) {
      const newInternalAnnotationIds = new Set(internalAnnotationIds.concat(annotations.map((annot) => annot.Id)));
      dispatch(actions.setInternalAnnotationIds(Array.from(newInternalAnnotationIds)));
    }

    window.document.fonts.onloadingdone = () => {
      annotManager.drawAnnotationsFromList(annotations);
    };
    annotManager.drawAnnotationsFromList(annotations);

    this.addAnnotationsToCareTakerStack(annotations);
  };

  adjustXfdfPageIndex = (xfdf, annotationType) => {
    const totalPages = core.getTotalPages();
    const pageAttrIndex = xfdf.indexOf('page=') + 6;
    const pageIndex = parseInt(xfdf[pageAttrIndex]);

    const isPageOutOfBounds =
      Number.isInteger(pageIndex) && pageIndex + 1 > totalPages && annotationType !== AnnotationSubjectMapping.widget;

    if (isPageOutOfBounds) {
      return xfdf.replace(`page="${pageIndex}"`, `page="${pageIndex - 1}"`);
    }
    return xfdf;
  };

  importAnnotationsFromXfdf = async (xfdf, annotationType, documentId) => {
    const annotManager = core.getAnnotationManager();
    let annotationsFromXfdf = [];

    if (annotationType === AnnotationSubjectMapping.widget) {
      annotationsFromXfdf = await importWidgetAnnotations(increasePageNumberXfdf(xfdf));
    } else {
      annotationsFromXfdf = await annotManager.importAnnotationCommand(xfdf);
    }

    commandHandler.insertTempAction(documentId, [{ type: 'annotation', xfdf }]);

    return annotationsFromXfdf;
  };

  addAnnotationsToCareTakerStack = (annotations) => {
    const listReplies = annotations
      .filter((annot) => !(annot instanceof window.Core.Annotations.WidgetAnnotation))
      .reduce((res, annot) => [...res, ...annot.getReplies()], []);
    annotations.concat(listReplies).forEach((annot) => {
      if (!(annot instanceof window.Core.Annotations.WidgetAnnotation)) {
        const xfdf = exportAnnotationCommand(annot, ANNOTATION_ACTION.MODIFY);
        const annotationId = annot.Id;
        this.careTaker.initialStack.push({ annotationId, xfdf });
      }
    });
  };

  loadManipulationChange = async (data) => {
    const { pageWillBeDeleted } = this.state;
    const { option, type } = data;
    const { thumbs, currentDocument } = this.props;
    const newDataManip = cloneDeep(data);
    this.isManipulationExec = true;
    if (
      type === MANIPULATION_TYPE.MOVE_PAGE ||
      type === MANIPULATION_TYPE.REMOVE_PAGE ||
      type === MANIPULATION_TYPE.INSERT_BLANK_PAGE
    ) {
      this.careTaker.clearUndoRedoStack();
    }
    commandHandler.insertTempAction(currentDocument._id, [
      {
        type: 'manipulation',
        method: type,
        option,
      },
    ]);
    if (pageWillBeDeleted !== -1) {
      switch (type) {
        case MANIPULATION_TYPE.MOVE_PAGE: {
          const { pagesToMove, insertBeforePage } = newDataManip.option;
          if (pagesToMove > pageWillBeDeleted) {
            newDataManip.option.pagesToMove -= 1;
          }
          if (insertBeforePage > pageWillBeDeleted || insertBeforePage === core.getTotalPages() + 1) {
            newDataManip.option.insertBeforePage -= 1;
          }
          break;
        }
        case MANIPULATION_TYPE.REMOVE_PAGE: {
          const pageRemove = newDataManip.option.pagesRemove[0];
          if (pageWillBeDeleted < pageRemove) {
            newDataManip.option.pagesRemove[0] -= 1;
          }
          break;
        }
        case MANIPULATION_TYPE.INSERT_BLANK_PAGE: {
          const pageInsert = newDataManip.option.insertPages[0];
          if (pageWillBeDeleted < pageInsert) {
            newDataManip.option.insertPages[0] -= 1;
          }
          break;
        }
        default: {
          break;
        }
      }
    }
    await OutlinePageManipulationUtils.updateOnCollabManipChanged(newDataManip);
    PageTracker.updateOnCollabManipChanged(newDataManip);
    await manipulation.executeManipulationFromData({
      data: newDataManip,
      thumbs,
    });
    this.updateListDeletedPage(newDataManip.option, type);
    this.updatePageWillBeCropped(option, type);
    this.updatePageWillBeDeleted(option, type);
  };

  setupDocumentStatus = async () => {
    const { currentUser, currentDocument, organizations, dispatch } = this.props;
    if (!isEmpty(currentDocument) && !currentDocument.statusUpdated && organizations.data) {
      const { _id: documentId } = currentDocument;
      const [documentStatus, documentReference] = await documentServices.getDocumentInfo({
        document: currentDocument,
        userInfo: currentUser,
        organizations: organizations.data,
      });

      const documentData = { ...currentDocument, documentStatus, documentReference, statusUpdated: true };
      this.currentDocument = documentData;

      dispatch(
        actions.updateCurrentDocument({
          documentStatus,
          documentReference,
          statusUpdated: true,
        })
      );

      this.props.subcribeEventOnDocument(documentReference, {
        showAccessUpdateToast: () => this.setState({ showAccessUpdateToast: true }),
      });
      this.props.subcribeEventDeleteDocument(documentId, () => this.setState({ showAccessUpdateToast: true }));
    }
  };

  // eslint-disable-next-line react/no-unused-class-component-methods
  resetOpenFromParamTracking = () => {
    const { navigate, location } = this.props;
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has(UrlSearchParam.OPEN_FROM)) {
      searchParams.delete(UrlSearchParam.OPEN_FROM);
      navigate({ search: searchParams.toString() }, { replace: true });
    }
    if (location.state?.openFrom) {
      window.history.replaceState({}, '');
    }
  };

  onFinishRendering = async () => {
    const { fromNewAuthFlow, currentUser, location, dispatch } = this.props;
    if (timeTracking.isExist(START_DOWNLOAD_DOCUMENT)) {
      const { currentDocument } = this.props;
      timeTracking.finishTracking(FIRST_PAGE_RENDER);
      const timeToFirstPageRenderedMS = timeTracking.trackingTimeOf(FIRST_PAGE_RENDER);
      const { width, height } = core.getPageInfo(1);
      const isLinearized = core.getDocument().isLinearized() ? core.getDocument().isLinearized().toString() : false;
      const fileType = fileUtils.getExtension(currentDocument.name) || mime.extension(currentDocument.mimeType);
      const dontShowFreeTrialModalAgainClicked = getDontShowFreeTrialModalAgainClicked({
        userId: currentUser?._id,
        orgUrl: get(currentDocument, 'documentReference.data.url', ''),
      });
      const metadata = await core.getDocument().getMetadata();

      // Process metadata to add prefix and remove empty values
      const processedMetadata = Object.entries(metadata).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[`metadata_${key}`] = value;
        }
        return acc;
      }, {});

      const documentInfo = {
        isLinearized: isLinearized.toString(),
        source: currentDocument.service,
        documentType: fileType,
        LuminUserIdDocOwner: currentDocument.ownerId,
        dontShowFreeTrialModalAgainClicked,
        pdfFileName: currentDocument.name,
        openFrom: getOpenFromState(location),
        ...processedMetadata,
      };

      let fileSize = this.currentDocument.size;

      const isGuestPath = this.isGuestPath();
      let etagThirdStorage = '';

      if (
        !isGuestPath &&
        currentDocument.remoteId &&
        [documentStorage.onedrive, documentStorage.google, documentStorage.dropbox].includes(currentDocument.service)
      ) {
        const fileInfo = await viewerHelper.getThirdPartyFileInfo(currentDocument);
        fileSize = fileInfo.size;
        if (currentDocument.service === documentStorage.google) {
          documentInfo.md5Checksum = fileInfo.md5Checksum;
          // no share => fileInfo.permissions.length = 1
          // share with Viewer => fileInfo.permissions = undefined
          // share with other => fileInfo.permissions = [...]
          documentInfo.sharedOnDrive = fileInfo.permissions?.length !== 1;
          etagThirdStorage = fileInfo?.content_hash || fileInfo?.eTag;
        }
      }
      dispatch(
        actions.updateCurrentDocument({ size: Number(fileSize), etag: currentDocument?.etag || etagThirdStorage })
      );
      const BYTE_UNIT_AMOUNT = 1024;
      const metrics = {
        timeToFirstPageRenderedMS,
        PDFPageWidth: width,
        PDFPageHeight: height,
        sizeMB: fileSize / (BYTE_UNIT_AMOUNT * BYTE_UNIT_AMOUNT),
      };
      let eventName = OPEN_DEVICE_DOCUMENT;
      let onlineMetrics = {};
      if (!this.offlineStrategy.isSystemFile) {
        const timeToStartDownloadMS = timeTracking.trackingTimeOf(START_DOWNLOAD_DOCUMENT);
        const timeToDownloadCompletedMS = timeTracking.trackingTimeOf(DOWNLOAD_DOCUMENT_COMPLETE);
        eventName = OPEN_PDF_DOCUMENT;
        onlineMetrics = {
          timeToStartDownloadMS,
          timeToDownloadCompletedMS,
        };
      }
      eventTracking(eventName, documentInfo, {
        ...metrics,
        ...onlineMetrics,
      });
      this.resetOpenFromParamTracking();
      timeTracking.unRegister(DOWNLOAD_DOCUMENT_COMPLETE);
      if (!fromNewAuthFlow) {
        timeTracking.unRegister(START_DOWNLOAD_DOCUMENT);
        timeTracking.unRegister(FIRST_PAGE_RENDER);
      } else {
        timeTracking.register(TIME_USER_STAY);
      }
    }
  };

  onBeforeDocumentLoaded = () => {
    const { isInPresenterMode } = this.props;
    if (isInPresenterMode) {
      core.setDisplayMode(core.CoreControls.DisplayModes.Single);
      core.setFitMode(fitMode.FitPage);
    }

    core.getTool(TOOLS_NAME.SIGNATURE).removeEventListener('signatureReady.sigWidget');
    timeTracking.finishTracking(DOWNLOAD_DOCUMENT_COMPLETE);
    core.getAnnotationManager().enableReadOnlyMode();
    ToolSwitchableChecker.setIsAnnotationLoaded(false);
  };

  onWindowUnload = () => {
    const { fromNewAuthFlow } = this.props;
    viewerHelper.recordGetStartedDocument({ keepAlive: true, fromNewAuthFlow });
    viewerHelper.recordRenderPDFDocument(this.sharedPinpointAttributes);
  };

  onPageComplete = (page) => {
    const { isNewLayout, isNarrowScreen, isInPresenterMode } = this.props;
    const pos = this.state.listPageDeleted[page];
    if (pos) {
      viewerHelper.lockPage(pos);
    }
    if (!isNewLayout || isNarrowScreen || isInPresenterMode) {
      return;
    }
    outlineDrawerUtil.drawOutlineShortcut(page);
  };

  updateListDeletedPage = (option, type) => {
    const totalPages = core.getTotalPages();
    const newListPageDeleted = {};
    const { listPageDeleted } = this.state;
    switch (type) {
      case MANIPULATION_TYPE.MOVE_PAGE: {
        const { pagesToMove, insertBeforePage } = option;
        Object.keys(listPageDeleted).forEach((key) => {
          const position = listPageDeleted[key];
          viewerHelper.unLockPage(position);
          if (pagesToMove === position) {
            listPageDeleted[key] = insertBeforePage;
          } else if (insertBeforePage <= position && pagesToMove > position) {
            listPageDeleted[key] += 1;
          } else if (insertBeforePage >= position && pagesToMove < position) {
            listPageDeleted[key] -= 1;
          }
          newListPageDeleted[listPageDeleted[key]] = listPageDeleted[key];
          viewerHelper.lockPage(newListPageDeleted[listPageDeleted[key]]);
        });
        this.setListPageDeleted(newListPageDeleted);
        break;
      }
      case MANIPULATION_TYPE.REMOVE_PAGE: {
        const pageRemove = option.pagesRemove[0];
        if (pageRemove === totalPages + 1) {
          viewerHelper.unLockPage(totalPages);
          delete listPageDeleted[totalPages + 1];
        } else {
          viewerHelper.unLockPage(listPageDeleted[pageRemove]);
          delete listPageDeleted[pageRemove];
        }
        Object.keys(listPageDeleted).forEach((key) => {
          viewerHelper.unLockPage(listPageDeleted[key]);
          if (listPageDeleted[key] >= pageRemove) {
            listPageDeleted[key] -= 1;
          }
          newListPageDeleted[listPageDeleted[key]] = listPageDeleted[key];
          viewerHelper.lockPage(newListPageDeleted[listPageDeleted[key]]);
        });
        this.setListPageDeleted(newListPageDeleted);
        break;
      }
      case MANIPULATION_TYPE.INSERT_BLANK_PAGE: {
        const pageInsert = option.insertPages[0];
        Object.keys(listPageDeleted).forEach((key) => {
          if (listPageDeleted[key] >= pageInsert) {
            viewerHelper.unLockPage(listPageDeleted[key]);
            listPageDeleted[key] += 1;
          }
          newListPageDeleted[listPageDeleted[key]] = listPageDeleted[key];
          viewerHelper.lockPage(newListPageDeleted[listPageDeleted[key]]);
        });
        this.setListPageDeleted(newListPageDeleted);
        break;
      }
      default: {
        break;
      }
    }
  };

  updatePageWillBeDeleted = (option, type) => {
    const { pageWillBeDeleted } = this.state;
    switch (type) {
      case MANIPULATION_TYPE.MOVE_PAGE: {
        const { pagesToMove, insertBeforePage } = option;
        if (pagesToMove === pageWillBeDeleted) {
          this.setState({ pageWillBeDeleted: insertBeforePage });
        } else if (insertBeforePage <= pageWillBeDeleted && pagesToMove > pageWillBeDeleted) {
          this.setState({ pageWillBeDeleted: pageWillBeDeleted + 1 });
        } else if (insertBeforePage >= pageWillBeDeleted && pagesToMove < pageWillBeDeleted) {
          this.setState({ pageWillBeDeleted: pageWillBeDeleted - 1 });
        }
        break;
      }
      case MANIPULATION_TYPE.REMOVE_PAGE: {
        const pageRemove = option.pagesRemove[0];
        if (pageRemove <= pageWillBeDeleted) {
          this.setState({ pageWillBeDeleted: pageWillBeDeleted - 1 });
        }
        break;
      }
      case MANIPULATION_TYPE.INSERT_BLANK_PAGE: {
        const pageInsert = option.insertPages[0];
        if (pageInsert <= pageWillBeDeleted) {
          this.setState({ pageWillBeDeleted: pageWillBeDeleted + 1 });
        }
        break;
      }
      default: {
        break;
      }
    }
  };

  updatePageWillBeCropped = (option, type) => {
    const { pageWillBeCropped } = this.state;
    switch (type) {
      case MANIPULATION_TYPE.MOVE_PAGE: {
        const { pagesToMove, insertBeforePage } = option;
        if (pagesToMove === pageWillBeCropped.position) {
          this.setState({
            pageWillBeCropped: {
              ...pageWillBeCropped,
              position: insertBeforePage,
            },
          });
        } else if (insertBeforePage <= pageWillBeCropped.position && pagesToMove > pageWillBeCropped.position) {
          this.setState({
            pageWillBeCropped: {
              ...pageWillBeCropped,
              position: pageWillBeCropped.position + 1,
            },
          });
        } else if (insertBeforePage >= pageWillBeCropped.position && pagesToMove < pageWillBeCropped.position) {
          this.setState({
            pageWillBeCropped: {
              ...pageWillBeCropped,
              position: pageWillBeCropped.position - 1,
            },
          });
        }
        break;
      }
      case MANIPULATION_TYPE.REMOVE_PAGE: {
        const pageRemove = option.pagesRemove[0];
        if (pageRemove <= pageWillBeCropped.position) {
          this.setState({
            pageWillBeCropped: {
              ...pageWillBeCropped,
              position: pageWillBeCropped.position - 1,
            },
          });
        }
        break;
      }
      case MANIPULATION_TYPE.INSERT_BLANK_PAGE: {
        const pageInsert = option.insertPages[0];
        if (pageInsert <= pageWillBeCropped.position) {
          this.setState({
            pageWillBeCropped: {
              ...pageWillBeCropped,
              position: pageWillBeCropped.position + 1,
            },
          });
        }
        break;
      }
      default: {
        break;
      }
    }
  };

  setListPageDeleted = (listPageDeleted) => {
    this.setState({ listPageDeleted });
  };

  setPageWillBeDeleted = (pageWillBeDeleted) => {
    if (this.state.pageWillBeDeleted !== -1) {
      pageOverlayUtil.removePageOverlay(this.state.pageWillBeDeleted);
    }

    if (pageWillBeDeleted !== -1) {
      pageOverlayUtil.applyPageOverlay(pageWillBeDeleted);
    }

    this.setState({ pageWillBeDeleted });
  };

  setPageWillBeCropped = (pageWillBeCropped) => {
    this.setState({ pageWillBeCropped });
  };

  setDeletedToastId = (deletedToastId) => {
    this.deletedPageToastId.current = deletedToastId;
  };

  handleMessageDropbox = (e) => {
    const { t } = this.props;
    if (e.data.errorMessage || e.data.cancelAuthorize || e.data.token) {
      this.props.dispatch(actions.closeElement('loadingModal'));
      fireEvent('dropboxAuthorized', e.data);
    }

    if (e.data.errorMessage || e.data.cancelAuthorize) {
      enqueueSnackbar({
        variant: 'error',
        message: t('viewer.requestPermissionFailed'),
      });
    } else if (e.data.token) {
      localStorage.setItem('token-dropbox', e.data.token);
      enqueueSnackbar({
        variant: 'success',
        message: t('viewer.requestPermissionSuccessfully'),
      });
    }
  };

  onAnnotationDoubleClicked = (annotation) => {
    if (annotation instanceof window.Core.Annotations.FreeTextAnnotation) {
      this.editedFreeText = annotation.PageNumber;
      const currPage = document.getElementById(`pageWidgetContainer${annotation.PageNumber}`);
      currPage.style.zIndex = 60;
    }
  };

  onFreeTextAdded = (annotation) => {
    this.editedFreeText = annotation.PageNumber;
    const currPage = document.getElementById(`pageWidgetContainer${annotation.PageNumber}`);
    currPage.style.zIndex = 60;
  };

  loadDocument = async (doc) => {
    const { dispatch, navigate, currentDocument, location } = this.props;
    const documentOptions = {
      filename: doc.name,
      documentId: doc._id,
    };
    const extensionByMime = mime.extension(doc.mimeType);
    documentOptions.extension = extensionByMime;
    let { etag, size } = doc;
    if (doc.service === STORAGE_TYPE.GOOGLE && !doc.signedUrl && doc.remoteId) {
      timeTracking.register(FETCH_DOCUMENT_INFO);
      try {
        const fileInfo = await this.getFileInfoPromise.promise(doc.remoteId);
        etag = fileInfo.md5Checksum;
        size = parseInt(fileInfo.size);
        dispatch(actions.updateCurrentDocument({ etag, size }));
        timeTracking.finishTracking(FETCH_DOCUMENT_INFO);
      } catch (err) {
        if (!err.isCanceled) {
          throw err;
        }
      }
    }
    if ((doc.service === STORAGE_TYPE.DROPBOX || doc.service === STORAGE_TYPE.ONEDRIVE) && doc.remoteId) {
      const { etag: etagThirdStorage, size: sizeThirdStorage } = await this.handleGetInfoThirdStorage(doc);
      etag = etagThirdStorage;
      size = parseInt(sizeThirdStorage);
      dispatch(actions.updateCurrentDocument({ etag, size }));
    }
    if (isTempEditMode(location.pathname)) {
      let cacheDoc = null;

      if (this.isCreateExternalPdf() && currentDocument.remoteId) {
        const guestModeManipulateCacheData = await guestModeManipulateIndexedDb.get(currentDocument.remoteId);
        cacheDoc = await guestModeManipulateCache.getFile(guestModeManipulateCacheData?.cachePath);
      }

      loadDocument({
        dispatch,
        src: cacheDoc || currentDocument.fileUrl,
        navigate,
      });
      return;
    }

    if (this.offlineStrategy.isSystemFile) {
      loadDocument({
        dispatch,
        src: doc.file,
        options: documentOptions,
        document: doc,
        navigate,
      });
      return;
    }
    /* TEMP FIX: CANNOT LOAD IMAGE DOCUMENT */
    if (imageExtensions.includes(extensionByMime) && featureStoragePolicy.externalStorages.includes(doc.service)) {
      const key = getCacheKey(doc._id);

      const file = await this.getFileFromCacheOrRemote({ key, etag, document: doc });

      loadDocument({
        dispatch,
        src: file,
        options: documentOptions,
        document: doc,
        navigate,
      });
      return;
    }
    const { src, options } = await getFileService.getFileOptions(doc, documentOptions);

    // FOR LOGIN USER
    const isCreateExternalPdf = this.isCreateExternalPdf();
    const guestModeManipulateCacheData = await guestModeManipulateIndexedDb.getByDocumentId(doc._id);
    if (guestModeManipulateCacheData && isCreateExternalPdf) {
      const cacheDoc = await guestModeManipulateCache.getFile(guestModeManipulateCacheData?.cachePath);
      loadDocument({
        dispatch,
        src: cacheDoc || src,
        options,
        document: doc,
        navigate,
      });
      return;
    }

    if (featureStoragePolicy.storagesSupportCache.includes(doc.service)) {
      const key = getCacheKey(doc._id);
      const cachedFile = await documentCacheBase.getFile(key, etag);
      if (!cachedFile) {
        this.shouldCacheFile = true;
      }

      loadDocument({
        dispatch,
        src: cachedFile || src,
        options,
        document: doc,
        navigate,
      });

      return;
    }
    /* END */
    loadDocument({
      dispatch,
      src,
      options,
      document: doc,
      navigate,
    });
  };

  loadDocumentToViewer = async (doc) => {
    this.abortEditorChatbot();
    const { openViewerModal, t, handleVerifyDocument, navigate, currentUser } = this.props;
    if (!checkDocumentType(doc.mimeType)) {
      const unsupportFileTypeModal = {
        type: ModalTypes.ERROR,
        title: t('viewer.fileTypeIsNotSupported'),
        message: t('viewer.messageFileTypeIsNotSupported'),
        confirmButtonTitle: t('common.sendFeedback'),
        cancelButtonTitle: t('common.tryAnotherFile'),
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        onConfirm: () => {
          window.location.href = STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSupport'));
        },
        onCancel: () => {
          if (!currentUser) {
            navigate(Routers.SIGNIN);
            return;
          }
          const documentListFallbackUrl =
            sessionStorage.getItem(SESSION_STORAGE_KEY.DOCUMENT_LIST_FALLBACK_URL) || Routers.DOCUMENTS;
          navigate(documentListFallbackUrl);
        },
      };
      openViewerModal(unsupportFileTypeModal);
      return;
    }
    await handleVerifyDocument({
      documents: [doc],
      onSuccess: this.loadDocument,
      setLoading: (isLoadingDocument) => this.props.setIsLoadingDocument(isLoadingDocument),
    });
  };

  onDocumentReady = () => {
    const annotManager = core.getAnnotationManager();
    const annots = annotManager.getAnnotationsList();
    /* ERROR ELLIPSE ROTATE WITH CORE VERSION 8.0.1.x  */
    const ellipseAnnotations = annots.filter(
      (annotation) => annotation instanceof window.Core.Annotations.EllipseAnnotation
    );
    ellipseAnnotations.forEach((ellipseAnnotation) => ellipseAnnotation.disableRotationControl());
    /* END */
  };

  onDocumentLoaded = async () => {
    const {
      currentUser,
      currentDocument,
      t,
      isPreviewOriginalVersionMode,
      setAutoSyncStatus,
      isOffline,
      formFields,
      match,
      location,
    } = this.props;
    const isGuestPath = matchPath(
      {
        path: ROUTE_MATCH.GUEST_VIEW,
        exact: false,
        strict: false,
      },
      location.pathname
    );
    if (isPreviewOriginalVersionMode && !this.isReloadDocument.current) {
      core.setPagesUpdatedInternalAnnotationsTransform((xfdfData, _, callback) => callback(xfdfData));
    } else {
      core.setPagesUpdatedInternalAnnotationsTransform(
        setInternalAnnotationTransform({
          currentDocument,
          formFields,
          usedImageRemoteIds: this.usedImageRemoteIds,
          isOffline,
          isRemoteDocument:
            !this.isGuestPath() &&
            !this.offlineStrategy.isSystemFile &&
            match.params.documentId &&
            (isViewerRouteMatch(location.pathname) || isTemplateViewerRouteMatch(location.pathname)) &&
            !isOffline,
          setImageSignedUrlMap: (signedUrlMap) => {
            this.signedUrlMap = signedUrlMap;
          },
        })
      );
    }

    const { status } = useCollaborationStore.getState().socketState;
    const isCloudSyncDisabled = isOffline || isDisconnected(status) || isTempEditMode(location.pathname);

    if (!isCloudSyncDisabled) {
      await this.syncGuestModeCacheDocument();
    }
    try {
      if (!currentDocument.thumbnailRemoteId && !currentDocument.isAnonymousDocument) {
        fileUtils.getThumbnailWithDocument(core.getDocument(), {}).then(async (thumbnailCanvas) => {
          const thumbnail = await fileUtils.convertThumnailCanvasToFile(thumbnailCanvas);
          const compressedThumbnail =
            thumbnail &&
            (await compressImage(thumbnail, {
              convertSize: MAX_THUMBNAIL_SIZE,
              maxWidth: 800,
              maxHeight: 400,
            }));
          if (this.offlineStrategy.isSystemFile) {
            const response = new Response(compressedThumbnail, {
              status: 200,
              headers: {
                'Content-Type': compressedThumbnail.type,
              },
            });
            const thumbnailUrl = `thumbnails/system/${v4()}.jpeg`;
            storageHandler.putCustomFile(
              `${getFileService.getThumbnailUrl(thumbnailUrl)}?v=${currentDocument._id}`,
              response
            );
            systemFileHandler.update(currentDocument._id, {
              thumbnail: thumbnailUrl,
            });
          } else {
            documentServices.uploadThumbnail(currentDocument._id, compressedThumbnail);
          }
        });
      }
      timeTracking.unRegister(RENDER_PDF_DOCUMENT);
      this.props.setIsLoadingDocument(false);
      if (this.manipulationChangeStacks.length > 0) {
        this.manipulationChangeStacks.forEach(async (data) => {
          await this.loadManipulationChange(data);
        });
      }
      if (this.annotationChangedStacks.length > 0) {
        this.annotationChangedStacks.forEach(async (data) => {
          await this.loadAnnotationChange(data);
        });
      }
      if (this.formFieldChangedStacks.length > 0) {
        this.formFieldChangedStacks.forEach(async (data) => {
          await onFormFieldChanged(data);
        });
      }
      // Business of LMV-498
      if (isNewUser(currentUser) && isUserNotShownModal(currentUser)) {
        saveOpenedDocIds(currentDocument._id);
      }
      core.refreshAll();
      if (currentDocument.service === documentStorage.google && currentDocument.signedUrl) {
        setAutoSyncStatus(AUTO_SYNC_STATUS.NOT_SYNCED);
      }
    } catch (error) {
      logger.logError({
        context: this.onDocumentLoaded.name,
        reason: LOGGER.Service.COMMON_ERROR,
        message: error?.message || 'Error loading document',
        error,
      });
      this.props.openViewerModal({
        type: ModalTypes.ERROR,
        title: t('viewer.openDocumentFailed'),
        message: '',
        onConfirm: () => this.props.navigate('/'),
      });
    }
    if (this.isGoogleDriveStorage() && !currentDocument.signedUrl && !isGuestPath) {
      const fileInfo = await googleServices.getFileInfo(currentDocument.remoteId, '*', 'loadDocument');
      getDriveCollaborators({ fileInfo, currentUser, currentDocument });
    }
    await handleUpdateQuotaExternalStorage(currentDocument.service);
    this.isReloadDocument.current = false;
  };

  drawAnnotsOnTempEditMode = async (formId) => {
    const { currentUser, currentDocument, dispatch } = this.props;
    const { isDeleted } = await drawUnsavedChangeAnnotations({
      currentUser,
      documentId: formId,
    });

    if (isDeleted && DocumentCategory.isLuminDocument({ type: currentDocument.service })) {
      socketService.modifyDocumentContent(currentDocument._id, { status: 'preparing', increaseVersion: false });
      this.syncFileIdleCallback = requestIdleCallback(() =>
        documentServices
          .syncFileToS3Exclusive(currentDocument)
          .then(() =>
            Promise.all([indexedDBService.deleteTempEditModeFileChanged(formId), formCaching.clearData(formId)])
          )
          .catch(() => {
            socketService.modifyDocumentContent(currentDocument._id, { status: 'failed', increaseVersion: false });
          })
          .finally(() => {
            dispatch(actions.closeElement(DataElements.LOADING_MODAL));
          })
      );
    }
  };

  syncGuestModeCacheDocument = async () => {
    const { currentDocument, dispatch } = this.props;
    const guestModeManipulateCacheData = await guestModeManipulateIndexedDb.getByDocumentId(currentDocument._id);
    const isFromFLP = this.isCreateExternalPdf();
    if (
      guestModeManipulateCacheData &&
      DocumentCategory.isLuminDocument({ type: currentDocument.service }) &&
      isFromFLP
    ) {
      dispatch(actions.openElement(DataElements.LOADING_MODAL));
      socketService.modifyDocumentContent(currentDocument._id, { status: 'preparing', increaseVersion: false });
      this.syncFileIdleCallback = requestIdleCallback(() =>
        documentServices
          .syncFileToS3Exclusive(currentDocument)
          .then(() =>
            Promise.all([guestModeManipulateCache.deleteCache({ id: guestModeManipulateCacheData?.cachePath })])
          )
          .catch(() => {
            socketService.modifyDocumentContent(currentDocument._id, { status: 'failed', increaseVersion: false });
          })
          .finally(() => {
            dispatch(actions.closeElement(DataElements.LOADING_MODAL));
          })
      );
    }
  };

  drawUnsavedAnnotations = async ({ skipRemoteData = false }) => {
    const { currentUser, currentDocument } = this.props;
    const currentDocNewAnnotations = currentDocument.newAnnotations || [];
    const annotManager = core.getAnnotationManager();

    const [{ annotations: dbAnnotations, manipulations: dbManipulations, fields: dbFields }, tempActions] =
      await Promise.all([
        commandHandler.getAllCommandsWithFormatted(currentDocument._id),
        commandHandler.getAllTempAction(currentDocument._id),
      ]);
    this.isManipulationExec = true;
    if (this.manipulation && !skipRemoteData) {
      for (const manipulationStep of this.manipulation) {
        await manipulation.executeManipulationFromData({
          data: manipulationStep,
          thumbs: [],
          needUpdateThumbnail: false,
        });
      }
    }

    if (currentDocNewAnnotations.length > 0 && !skipRemoteData) {
      currentDocNewAnnotations.forEach((row) => {
        if (row && row.xfdf) {
          viewerHelper.updateImportedAnnot({ row, currentDocument, currentUser });
        }
      });
    }

    if (currentDocument.fields?.length > 0 && !skipRemoteData) {
      currentDocument.fields.forEach((field) => {
        viewerHelper.importFieldData(field);
      });
    }

    for (const action of tempActions) {
      switch (action.type) {
        case 'annotation': {
          const unsavedAnnots = await viewerHelper.updateImportedAnnot({
            row: action,
            currentDocument,
            currentUser,
          });

          if (unsavedAnnots && unsavedAnnots.length > 0) {
            await emitUnsavedAnnotations({
              annotations: unsavedAnnots,
              currentDocument,
              currentUser,
              tempAction: action,
            });
          }
          break;
        }
        case 'manipulation': {
          await manipulation.executeManipulationFromData({
            data: { type: action.method, option: action.option },
            thumbs: [],
            needUpdateThumbnail: false,
          });
          break;
        }
        case 'field': {
          await viewerHelper.importFieldData(action.data);
          break;
        }
        default:
          break;
      }
    }

    for (const manipulationStep of dbManipulations) {
      await manipulation.executeManipulationFromData({
        data: manipulationStep,
        thumbs: [],
        needUpdateThumbnail: false,
      });
    }

    dbAnnotations.forEach((row) => {
      if (row && row.xfdf) {
        viewerHelper.updateImportedAnnot({ row, currentDocument, currentUser });
      }
    });

    dbFields.forEach(({ name, value }) => {
      const field = annotManager.getFieldManager().getField(name);
      if (field) {
        importFieldValue(name, value);
      }
    });

    this.isManipulationExec = false;
  };

  processSignedUrlToStampAnnots = async () => {
    const { currentDocument, internalAnnotationIds } = this.props;
    window.Core.Annotations.restoreDeserialize(window.Core.Annotations.StampAnnotation);
    if (
      featureStoragePolicy.isFeatureEnabledForStorage(AppFeatures.SIGNED_URL_IMAGE, currentDocument.service) &&
      currentDocument.imageSignedUrls
    ) {
      const imageRemoteIdsShouldDelete = Object.keys(currentDocument.imageSignedUrls).filter(
        (remoteId) => !this.usedImageRemoteIds.has(remoteId)
      );

      const isEncrypt = await core.isDocumentEncrypted();
      const signedUrlSignatures = core
        .getAnnotationsList()
        .filter(
          (annotation) =>
            annotation.Subject === AnnotationSubjectMapping.SIGNATURE &&
            annotation.getCustomData(CUSTOM_DATA_STAMP_ANNOTATION.REMOTE_ID.key)
        );
      let shouldConvertSignatureToBase64 = false;
      if (
        isEncrypt &&
        signedUrlSignatures.length &&
        signedUrlSignatures.every((annot) => internalAnnotationIds.has(annot.Id))
      ) {
        const remoteIds = signedUrlSignatures.map((annot) =>
          annot.getCustomData(CUSTOM_DATA_STAMP_ANNOTATION.REMOTE_ID.key)
        );
        imageRemoteIdsShouldDelete.push(...remoteIds);
        shouldConvertSignatureToBase64 = true;
      }
      if (imageRemoteIdsShouldDelete.length) {
        documentServices.deleteSignedUrlImage({ currentDocument, remoteIds: imageRemoteIdsShouldDelete });
      }
      if (shouldConvertSignatureToBase64) {
        signedUrlSignatures.forEach((annotation) => {
          convertSignatureToBase64(annotation);
        });
      }
    }
  };

  async getFileFromCacheOrRemote({ key, etag, document }) {
    const { setDocumentNotFound } = this.props;
    const file = await documentCacheBase.getFile(key, etag);
    if (file) {
      return file;
    }
    try {
      const remoteFile = await getFileService.getDocument(document);
      if (remoteFile) {
        await documentCacheBase.updateCache({ key, etag, file: remoteFile, shouldCount: true });
        return remoteFile;
      }
      return null;
    } catch (err) {
      logger.logError({
        reason: LOGGER.Service.FETCH_DRIVE_FILE_ERROR,
        error: err,
      });
      setDocumentNotFound();
      return null;
    }
  }

  handleGetInfoThirdStorage = async (currentDocument) => {
    const fileInfo = await viewerHelper.getThirdPartyFileInfo(currentDocument);
    switch (currentDocument.service) {
      case STORAGE_TYPE.ONEDRIVE:
        return { etag: fileInfo?.eTag, size: fileInfo?.size };
      case STORAGE_TYPE.DROPBOX:
        return { etag: fileInfo?.content_hash, size: fileInfo?.size };
      default:
        return { etag: null, size: null };
    }
  };

  async cacheDocument() {
    const { currentDocument } = this.props;
    const callback = async () => {
      if (
        this.shouldCacheFile &&
        featureStoragePolicy.storagesSupportCache.includes(currentDocument.service) &&
        documentCacheBase.isBrowserSupported() &&
        !documentCacheBase.hasOverloadedSize(currentDocument.size)
      ) {
        try {
          const { src, options } = await getFileService.getFileOptions(currentDocument, {});
          const { etag: etagThirdStorage } = await this.handleGetInfoThirdStorage(currentDocument);
          const res = await fetch(src, {
            priority: 'low',
            headers: options.customHeaders,
          });
          if (!res?.ok) {
            logger.logError({
              reason: 'Error when fetching info document third party storage',
            });
            return;
          }
          const blob = await res.blob();
          await documentCacheBase.updateCache({
            key: getCacheKey(currentDocument._id),
            etag: currentDocument.etag || etagThirdStorage,
            file: blob,
            shouldCount: true,
          });
        } catch (error) {
          logger.logError({
            reason: 'Error when fetching info document third party storage',
            error,
          });
        }
      }
    };
    this.cachingIdleCallback = requestIdleCallback(callback);
  }

  sendDocumentInfoEvent = () => {
    if (!core.getDocument()) {
      return;
    }
    const timeToCoreLoadedMs = timeTracking.trackingTimeOf(LOAD_CORE);
    const timeToGapiLoadedMs = timeTracking.trackingTimeOf(LOAD_GAPI);
    const timeToFetchDriveFileInfoMs = timeTracking.trackingTimeOf(FETCH_DOCUMENT_INFO);
    const widgetAnnots = core
      .getAnnotationManager()
      .getAnnotationsList()
      .filter((annotation) => annotation instanceof window.Core.Annotations.WidgetAnnotation);
    eventTracking(
      UserEventConstants.EventType.DOCUMENT_INFO,
      {
        numFillableFields: widgetAnnots.length,
        totalPages: core.getTotalPages(),
        isAppliedPageTools: Boolean(this.props.currentDocument.manipulationStep),
      },
      {
        timeToFetchDriveFileInfoMs,
        timeToCoreLoadedMs,
        timeToGapiLoadedMs,
      }
    );
  };

  isCreateExternalPdf = () => {
    const { location } = this.props;
    const acceptedFrom = ['functional-landing-page', 'chrome_extension'];
    const params = new URLSearchParams(location.search);
    const from = params.get('from');
    return acceptedFrom.includes(from);
  };

  async onAnnotationsLoaded() {
    const {
      currentUser,
      setIsDocumentLoaded,
      location,
      dispatch,
      isInPresenterMode,
      isPreviewOriginalVersionMode,
      isNarrowScreen,
    } = this.props;
    const annotManager = core.getAnnotationManager();
    const annots = annotManager.getAnnotationsList();
    viewerHelper.updateAnnotationAppearances();
    const stickyAnnotations = annots.map((annot) => updateAnnotationAvatarSource({ annotation: annot, currentUser }));
    annotManager.drawAnnotationsFromList(stickyAnnotations);
    const internalAnnotationIds = annotManager.getAnnotationsList().map((annot) => annot.Id);
    ToolSwitchableChecker.setIsAnnotationLoaded(true);
    if (!isPreviewOriginalVersionMode && !isNarrowScreen) {
      core.disableReadOnlyMode();
    }
    if (!this.state.loadedAnnot) {
      const fields = annotManager.getFieldManager().getFields();
      XfdfExporter.getInstance().setInternalFields(fields.map((field) => field.name));
      this.setState({ loadedAnnot: true });
      this.props.setInternalAnnotationIds(internalAnnotationIds);
      if (!core.getDocument()) {
        this.setState({ loadedAnnot: false });
        return;
      }
      await core.getDocument().getDocumentCompletePromise();
      const { currentDocument, isOffline, t } = this.props;
      const currentRole = getCurrentRole(currentDocument);

      setCustomStampDeserializer(this.signedUrlMap, this.usedImageRemoteIds);

      try {
        const { status } = useCollaborationStore.getState().socketState;
        if (isOffline || isDisconnected(status)) {
          await this.drawUnsavedAnnotations({ skipRemoteData: false });
        } else if (isTempEditMode(location.pathname)) {
          await this.loadAnnotationsInTempEditMode();
        } else {
          await this.drawAnnotationsInOnlineMode();
        }
        const redactAnnotations = annots.filter(
          (annotation) => annotation instanceof window.Core.Annotations.RedactionAnnotation
        );
        if (redactAnnotations.length) {
          annotManager.deleteAnnotations(redactAnnotations, { force: true });
        }
        this.setAssociateSignatureToWidget();
        this.debounceSetCustomTabOrder();
        this.processSignedUrlToStampAnnots(annots, currentRole);
        if (!this.isDocumentSyncing) {
          const isOverManipulationStepLimit = this.manipulation && this.manipulation.length >= MAXIMUM_MANIPULATION;
          const currentRole = getCurrentRole(currentDocument);
          const hasPermissionToSync = [DOCUMENT_ROLES.EDITOR, DOCUMENT_ROLES.OWNER, DOCUMENT_ROLES.SHARER].includes(
            currentRole
          );
          const shouldMigrateFormFieldXfdf = this.currentDocument.newAnnotations?.some(
            ({ annotationId }) => annotationId === currentDocument._id
          );
          const isLuminStorage = currentDocument.service === STORAGE_TYPE.S3;
          const shouldShowSyncManipulationModal =
            (isOverManipulationStepLimit || shouldMigrateFormFieldXfdf) && hasPermissionToSync && isLuminStorage;
          if (shouldShowSyncManipulationModal) {
            this.showSyncFileModal(t, currentDocument, shouldMigrateFormFieldXfdf);
          } else {
            core.addEventListener('pagesUpdated', this.onLayoutChanged);
            core.addEventListener('annotationDoubleClicked', this.onAnnotationDoubleClicked);
            core.getTool('AnnotationCreateFreeText').addEventListener('annotationAdded', this.onFreeTextAdded);
            core.getAnnotationManager().addEventListener('fieldChanged', this.onFieldChanged);
            core.trigger('native_manipUpdated', []);
          }
        }
        core.refreshAll();
        core.updateView();
        this.sendDocumentInfoEvent();
        const listReplies = [];
        core.getAnnotationsList().forEach((annot) => {
          listReplies.push(...annot.getReplies());
        });
        core
          .getAnnotationsList()
          .concat(listReplies)
          .forEach((annot) => {
            if (!(annot instanceof window.Core.Annotations.WidgetAnnotation)) {
              const xfdf = exportAnnotationCommand(annot, ANNOTATION_ACTION.MODIFY);
              const annotationId = annot.Id;
              this.careTaker.initialStack.push({ annotationId, xfdf });
            }
          });
        viewerHelper.setDefaultFontSizeForTextField();
        this.cacheDocument();
      } catch (error) {
        if (!error.isCanceled) {
          logger.logError({
            reason: LOGGER.EVENT.LOADING_ANNOTATIONS,
            error,
          });
          return;
        }
      }
    }
    if (this.props.isPreviewOriginalVersionMode) {
      this.setAssociateSignatureToWidget(annots);
      annots
        .filter((annot) => annot instanceof window.Core.Annotations.WidgetAnnotation)
        .forEach((annot) => annot.styledInnerElement());
    }
    core.trigger('documentViewerLoaded', []);
    if (isInPresenterMode) {
      core.setDisplayMode(core.CoreControls.DisplayModes.Single);
      core.setFitMode(fitMode.FitPage);
      core.enableReadOnlyMode();
      dispatch(actions.closeElement(DataElements.LOADING_MODAL));
    }
    setIsDocumentLoaded(true);

    setDimensionCustomDataForAnnotation(annots);
  }

  async loadAnnotationsInTempEditMode() {
    const { currentDocument } = this.props;
    const isCreateExternalPdf = this.isCreateExternalPdf();
    let id = currentDocument._id;
    if (isCreateExternalPdf) {
      id = currentDocument.remoteId;
    }
    await this.drawAnnotsOnTempEditMode(id);
  }

  async drawAnnotationsInOnlineMode() {
    const { currentDocument, currentUser, thumbs } = this.props;
    const annotManager = core.getAnnotationManager();
    const currentRole = getCurrentRole(currentDocument);
    const cachedFound = await indexedDBService.getTempEditModeFileChangedByDocumentId(currentDocument._id);
    if (cachedFound?.formId || cachedFound?.remoteId) {
      await this.drawAnnotsOnTempEditMode(cachedFound.formId || cachedFound.remoteId);
    }

    if (!currentDocument.isSystemFile && currentDocument._id === documentServices.getDocumentIdFromPath()) {
      await this.loadAnnotationInOnlineMode();
      await this.drawUnsavedAnnotations({ skipRemoteData: true });
      recordTrackingPerformance({ currentDocument: this.currentDocument });
    }
    const localAnnotations = [];
    const localManipulations = [];
    const localFields = [];

    const { includedOfflineCommands, includedCommentOnly } = await commandHandler.getCommandStatus(currentDocument._id);
    if (
      (includedOfflineCommands && currentRole === DOCUMENT_ROLES.SPECTATOR) ||
      (currentRole === DOCUMENT_ROLES.VIEWER && !includedCommentOnly)
    ) {
      await commandHandler.deleteAllCommands(currentDocument._id, {
        keepCommentAnnot: currentRole === DOCUMENT_ROLES.VIEWER,
      });
      const roleTitle = currentRole === DOCUMENT_ROLES.SPECTATOR ? 'View only' : 'Comment';
      enqueueSnackbar({
        message: `Your permission is changed to ${roleTitle}. Your unsaved changes have been removed`,
        variant: 'info',
      });
    }
    const {
      annotations: dbAnnotations,
      manipulations: dbManipulations,
      fields: dbFields,
    } = await commandHandler.getAllCommandWillBeSynced({
      documentId: currentDocument._id,
      newUnqAnnots: annotManager.getAnnotationsList().filter((annot) => annot.Subject === 'LUnique'),
    });
    const listOtherAuthor = new Set();
    dbAnnotations.forEach((annot) => {
      viewerHelper.updateImportedAnnot({ row: annot, currentDocument, currentUser });
      documentServices.emitData({ document: currentDocument, type: 'annotation', data: annot });

      localAnnotations.push({
        xfdf: annot.xfdf,
        annotationId: annot.annotationId,
      });
      if (isEmail(annot.annotationAuthor || '') && currentUser.email !== annot.annotationAuthor) {
        listOtherAuthor.add(annot.annotationAuthor);
      }
    });
    dbFields.forEach(({ name, value }) => {
      const field = annotManager.getFieldManager().getField(name);
      if (field) {
        localFields.push({
          name,
          value,
        });
        importFieldValue(name, value);
        socket.emit(SOCKET_EMIT.FORM_FIELD_CHANGE, {
          roomId: currentDocument._id,
          fieldName: field.name,
          data: {
            type: field.type,
            value,
            name: field.name,
            widgetId: field.widgets[0].Id,
            pageNumber: field.widgets[0].PageNumber,
          },
        });
      }
    });
    if (listOtherAuthor.size > 0) {
      viewerHelper.sendEditOtherAnnotationNotification(listOtherAuthor, currentDocument);
    }
    this.isManipulationExec = true;
    // eslint-disable-next-line no-restricted-syntax
    for (const manipStep of dbManipulations) {
      // eslint-disable-next-line no-await-in-loop
      await manipulation.executeManipulationFromData({
        data: manipStep,
        thumbs,
        needUpdateThumbnail: false,
      });
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        socket.emit(
          SOCKET_EMIT.SEND_MANIPULATION_CHANGED,
          {
            ...manipStep,
            roomId: currentDocument._id,
          },
          () => {
            localManipulations.push(manipStep);
            resolve(true);
          }
        );
      });
    }
    this.isManipulationExec = false;
    commandHandler.deleteAllCommands(currentDocument._id);
    commandHandler.deleteTempAction(currentDocument._id);
    if (!this.setUpOfflineSuccess && this.isOfflineEnabled && !this.offlineStrategy.isSystemFile) {
      try {
        const totalPage = core.getTotalPages();
        const missingUnqAnnotList = [];
        for (let index = 0; index < totalPage; index++) {
          if (
            !annotManager
              .getAnnotationsList()
              .find((annot) => annot.Subject === 'LUnique' && annot.PageNumber === index + 1)
          ) {
            missingUnqAnnotList.push(index);
          }
        }
        cachingFileHandler.update(
          { ...this.currentDocument, imageSignedUrls: this.signedUrlMap },
          {
            includeUnqPageId: missingUnqAnnotList.length,
            pages: missingUnqAnnotList,
            shouldUpdateCachedFile: true,
            newAnnotations: localAnnotations,
            newManipulations: localManipulations,
            newFields: localFields,
          }
        );
        viewerHelper.syncDocumentFromOfflineMode(
          { ...currentDocument, imageSignedUrls: this.signedUrlMap },
          this.bookmarksInstance
        );
      } catch (e) {
        logger.logError({
          context: this.onAnnotationsLoaded.name,
          reason: LOGGER.Service.COMMON_ERROR,
          message: 'Error updating cached file',
          error: e,
        });
      } finally {
        this.setUpOfflineSuccess = true;
      }
    }
  }

  showSyncFileModal(t, currentDocument, shouldMigrateFormFieldXfdf) {
    const syncModal = {
      type: ModalTypes.WARNING,
      title: t('viewer.documentIsWorkingHard'),
      message: t('viewer.messageDocumentIsWorkingHard'),
      cancelButtonTitle: null,
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      confirmButtonTitle: t(TRANSLATION_VIEWER_RELOAD),
      isFullWidthButton: true,
      onConfirm: async () => {
        await viewerHelper.handleSyncFileLuminStorage(currentDocument, t);
        if (shouldMigrateFormFieldXfdf) {
          socket.emit(SOCKET_EMIT.CLEAR_ANNOTATION_AND_MANIPULATION_OF_DOCUMENT, currentDocument._id);
        }
        core.addEventListener('pagesUpdated', this.onLayoutChanged);
        core.addEventListener('annotationDoubleClicked', this.onAnnotationDoubleClicked);
        core.getTool('AnnotationCreateFreeText').addEventListener('annotationAdded', this.onFreeTextAdded);
        core.getAnnotationManager().addEventListener('fieldChanged', this.onFieldChanged);
        core.trigger('native_manipUpdated', []);
      },
    };
    this.props.openViewerModal(syncModal);
  }

  async loadAnnotationInOnlineMode() {
    const { setCurrentDocument, currentDocument, currentUser } = this.props;
    const { annotations: newAnnotations } = this.context;
    const { promise: importAnnotPromise, cancel: cancelImportAnnot } = makeCancelable(() =>
      Promise.all(
        newAnnotations.map((annotation) => {
          if (annotation && annotation.xfdf) {
            return viewerHelper.updateImportedAnnot({ row: annotation, currentDocument, currentUser });
          }
          return Promise.resolve(); // Return a resolved Promise for non-matching annotations
        })
      )
    );
    this.cancelGetAnnotations = cancelImportAnnot;
    await importAnnotPromise();

    const { promise: promiseImportFormFields, cancel: cancelImportFormField } = makeCancelable(() =>
      Promise.allSettled(currentDocument.fields.map((field) => viewerHelper.importFieldData(field)))
    );
    this.cancelGetAnnotations = cancelImportFormField;
    await promiseImportFormFields();
    const documentWithAnnotData = { ...currentDocument, newAnnotations };
    this.currentDocument = documentWithAnnotData;
    setCurrentDocument(documentWithAnnotData);
  }

  onFieldChanged = async (field, value) => {
    const { currentDocument, isOffline, setCurrentDocument, location, saveFormFieldInTempEditMode } = this.props;
    if (core.getFormFieldCreationManager().isInFormFieldCreationMode()) {
      return;
    }
    if (isTempEditMode(location.pathname)) {
      const id = this.isCreateExternalPdf() ? currentDocument.remoteId : currentDocument._id;
      await saveFormFieldInTempEditMode(
        id,
        {
          name: field.name,
          value,
        },
        this.isCreateExternalPdf()
      );
      return;
    }
    if (currentDocument.isSystemFile) {
      if (!currentDocument.unsaved) {
        const updatedTotalLocalFileAnnotations = (currentDocument.newLocalFileTotalAnnotations || 0) + 1;
        setCurrentDocument({
          ...currentDocument,
          unsaved: true,
          newLocalFileTotalAnnotations: updatedTotalLocalFileAnnotations,
        });
      }
      return;
    }
    this.debounceSetSavingStatus(SAVE_OPERATION_TYPES.FIELD_CHANGE);
    let widget = field.widgets[0];
    if (!widget) {
      const annotList = core.getAnnotationManager().getAnnotationsList();
      const widgets = annotList.filter(
        (annot) => annot instanceof window.Core.Annotations.WidgetAnnotation && annot.fieldName === field.name
      );
      [widget] = widgets;
      field.set({
        widgets,
      });
    }
    if (isOffline) {
      commandHandler.insertField(currentDocument._id, {
        name: field.name,
        value,
        type: field.type,
        widgetId: widget.Id,
        pageNumber: widget.PageNumber,
      });
    } else {
      commandHandler.insertTempAction(currentDocument._id, [
        {
          type: 'field',
          data: {
            name: field.name,
            value,
          },
        },
      ]);
      let widget = field.widgets[0];
      if (!widget) {
        const annotList = core.getAnnotationManager().getAnnotationsList();
        const widgets = annotList.filter(
          (annot) => annot instanceof window.Core.Annotations.WidgetAnnotation && annot.fieldName === field.name
        );
        [widget] = widgets;
        field.set({
          widgets,
        });
      }
      socket.emit(SOCKET_EMIT.FORM_FIELD_CHANGE, {
        roomId: currentDocument._id,
        fieldName: field.name,
        data: {
          type: field.type,
          value,
          name: field.name,
          widgetId: widget.Id,
          pageNumber: widget.PageNumber,
        },
      });
      eventTracking(UserEventConstants.EventType.FORM_BUILDER_ELEMENT_CHANGE, {
        formBuilderName: field.name,
        formBuilderType: getFormFieldType(field),
      });
      this.debounceSetSaveStatus(isOffline);
    }
  };

  setCustomTabOrder() {
    const annots = core.getAnnotationsList();
    const widgets = annots.filter((annotation) => annotation.Subject === AnnotationSubjectMapping.widget);
    widgets.sort((a, b) => {
      if (a.PageNumber !== b.PageNumber) {
        return a.PageNumber - b.PageNumber;
      }
      if (a.Y !== b.Y) {
        return a.Y - b.Y;
      }
      return a.X - b.X;
    });
    widgets.forEach((widget, index) => {
      widget.setCustomData('tabindex', (index + 1).toString());
      widget.refresh();
    });
  }

  setAssociateSignatureToWidget() {
    const annots = core.getAnnotationsList();
    const associatedSignatures = getAssociatedSignatures(annots);
    const signatureWidgets = annots.filter(
      (annot) => annot instanceof window.Core.Annotations.SignatureWidgetAnnotation
    );
    signatureWidgets.forEach((widget) => {
      const noFillColor = new window.Core.Annotations.Color(0, 0, 0, 0);
      widget.backgroundColor = noFillColor;
      widget.hidden = false;
      widget.flags.clear();
      widget.refresh();
    });
    if (associatedSignatures.length) {
      associatedSignatures.map((annot) => setAssociatedSignatureAnnotation({ annotation: annot, signatureWidgets }));
    }
  }

  confirmEditPersonsAnnotation({ updatedAnnotations, action, mapXfdf, authors, listEmitData }) {
    const { currentDocument, currentUser, isOffline } = this.props;
    this.addAnnotToUndoRedoStack({ annotations: updatedAnnotations, action, mapXfdf, currentDocument, currentUser });
    if (!isOffline) {
      confirmUpdateAnnotation({
        authorEmails: authors,
        documentId: currentDocument._id,
        action,
        remoteId: currentDocument.remoteId || '',
      });
      if (listEmitData.length > 0) {
        annotationSyncQueue.addAnnotations(currentDocument._id, listEmitData);
      }
    }
  }

  async handleCancelConfirmEdit(annotations) {
    this.careTaker.undoAnnotation();
    core.selectAnnotations(annotations);
  }

  executeAnnotationEdit = ({
    action,
    annotations,
    annotationsUpdated,
    mapXfdf,
    ownershipOfAnnotations,
    listEmitData,
    savedAnnots,
    annotManager,
    currentDocument,
    isOffline,
    location,
  }) => {
    if (action === ANNOTATION_ACTION.DELETE) {
      core.deleteAnnotations(annotations);
    }
    if (!isOffline && !isTempEditMode(location.pathname)) {
      this.confirmEditPersonsAnnotation({
        updatedAnnotations: annotationsUpdated,
        action,
        mapXfdf,
        authors: ownershipOfAnnotations.otherAuthors,
        listEmitData,
      });
    }

    commandHandler.insertAnnotation(currentDocument._id, {
      manager: annotManager,
      annots: savedAnnots,
    });
  };

  isGoogleDriveStorage = () => this.props.currentDocument.service === STORAGE_TYPE.GOOGLE;

  onAnnotationChanged = async (annotations, action, infoObject) => {
    if (this.isDocumentSyncing || this.props.isInReadAloudMode || this.manipulation?.length >= MAXIMUM_MANIPULATION) {
      return;
    }

    if (this.state.pageWillBeDeleted !== -1 && action === ANNOTATION_ACTION.ADD) {
      const annotationsOnDeletedPage = annotations.filter((annot) => annot.PageNumber === this.state.pageWillBeDeleted);
      if (annotationsOnDeletedPage.length > 0) {
        core.deleteAnnotations(annotationsOnDeletedPage, { imported: true });
        return;
      }
    }

    // if user create annotation when document has not loaded, it will be deleted
    if (!ToolSwitchableChecker.isAnnotationLoaded()) {
      if (action === ANNOTATION_ACTION.DELETE || (action === ANNOTATION_ACTION.ADD && infoObject?.imported)) {
        return;
      }
      core.deleteAnnotations(annotations, { imported: true });
      ToolSwitchableChecker.showWarningMessage();
      return;
    }
    const { listPageDeleted, loadedAnnot } = this.state;
    const {
      isPageEditMode,
      currentDocument,
      currentUser,
      updateCurrentUser,
      isOffline,
      setSignatureWidgetSelected,
      location,
      internalAnnotationIds,
      saveFileChanged,
    } = this.props;
    /* For A/B Testing */
    const firstAnnotation = annotations[0];
    const isSignatureAnnot = firstAnnotation?.Subject === AnnotationSubjectMapping.signature;
    const isRedactionApplied = infoObject?.source === ANNOTATION_CHANGE_SOURCE.REDACTION_APPLIED;
    const isReorderApplied = infoObject?.source === ANNOTATION_CHANGE_SOURCE.REORDER_APPLIED;
    const isAutoResized = infoObject?.source === ANNOTATION_CHANGE_SOURCE.AUTO_RESIZED;
    const annotationManager = core.getAnnotationManager();
    /* ------- End --------- */
    const formFieldCreationManager = core.getFormFieldCreationManager();

    let shouldCacheCommand = true;
    const listReplies = [];
    if (action === ANNOTATION_ACTION.DELETE) {
      annotations.forEach((annotation) => {
        const replies = annotation.getReplies();
        listReplies.push(...replies);
        core.deleteAnnotations(replies, { imported: true });
      });
    }

    const isWidgetAnnot = firstAnnotation?.Subject === AnnotationSubjectMapping.widget;
    /* Improve tab order for fillable fields */
    const isChangePositionFormField =
      (action === ANNOTATION_ACTION.MODIFY && infoObject?.source === ANNOTATION_CHANGE_SOURCE.MOVE) ||
      action === ANNOTATION_ACTION.ADD;

    if (isChangePositionFormField && isWidgetAnnot) {
      this.debounceSetCustomTabOrder();
    }

    const isAnnotationsOfDeletedPage =
      action === ANNOTATION_ACTION.DELETE && infoObject?.source === ANNOTATION_CHANGE_SOURCE.PAGES_UPDATED;
    if (
      /**
       * Need to backup all annotations (including imported annots) changed when user is in form guest mode
       */
      (infoObject?.imported && !isTempEditMode(location.pathname)) ||
      isPageEditMode ||
      this.isManipulationExec ||
      formFieldCreationManager.isInFormFieldCreationMode() ||
      core.getContentEditManager().isInContentEditMode() ||
      isAnnotationsOfDeletedPage
    ) {
      this.isManipulationExec = false;
      return;
    }
    trackAnnotationChanged(annotations, action, currentDocument.service);
    const isDocumentValidToUseSignedUrl = canUseImageSignedUrl();
    const isDocumentEncrypted = await core.isDocumentEncrypted();
    if (action === ANNOTATION_ACTION.ADD && isSignatureAnnot) {
      const widgetId = firstAnnotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key);
      if (widgetId) {
        const widget = annotationManager.getAnnotationById(
          firstAnnotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key)
        );
        widget.styledInnerElement();
        setSignatureWidgetSelected(null);
      }
      if (
        !firstAnnotation.getCustomData(CUSTOM_DATA_STAMP_ANNOTATION.REMOTE_ID.key) &&
        isDocumentValidToUseSignedUrl &&
        !isDocumentEncrypted
      ) {
        if (loadedAnnot) {
          convertBase64ToSignedUrl(firstAnnotation);
        }
        return;
      }
    }
    const base64StampAnnotations = annotations.filter(
      (annotation) =>
        ANNOTATION_SUBJECT_MUST_BE_CONVERTED_TO_SIGNED_URL.includes(annotation.Subject) &&
        annotation instanceof window.Core.Annotations.StampAnnotation &&
        !annotation.getCustomData(CUSTOM_DATA_STAMP_ANNOTATION.REMOTE_ID.key)
    );
    if (
      action === ANNOTATION_ACTION.MODIFY &&
      base64StampAnnotations.length > 0 &&
      isDocumentValidToUseSignedUrl &&
      !firstAnnotation.isConvertingSignedUrl &&
      !isDocumentEncrypted
    ) {
      if (loadedAnnot) {
        convertMultipleBase64ToSignedUrl(base64StampAnnotations);
      }
      return;
    }
    if (this.editedFreeText !== -1) {
      const annotFreeTextUpdated = annotations.find((annot) => this.editedFreeText === annot.PageNumber);
      if (annotFreeTextUpdated) {
        const currPage = document.getElementById(`pageWidgetContainer${annotFreeTextUpdated.PageNumber}`);
        currPage.style.zIndex = 40;
        this.editedFreeText = -1;
      }
    }

    const annotationsUpdated = annotations
      .concat(listReplies)
      .filter(
        (annotation) =>
          !listPageDeleted[annotation.PageNumber] &&
          !annotation.isContentEditPlaceholder() &&
          !annotation.isConvertingSignedUrl &&
          (annotation.Subject !== AnnotationSubjectMapping.widget || isRedactionApplied) &&
          annotation.ToolName !== TOOLS_NAME.CALIBRATION_MEASUREMENT
      );
    if (annotationsUpdated.length === 0) {
      return;
    }
    const annotManager = core.getAnnotationManager();
    /* Quick fix for signature because error in core when create custom annotation stamp */
    const mapXfdf = {};
    annotations.concat(listReplies).forEach((annot) => {
      if (annot.Subject === AnnotationSubjectMapping.widget) {
        return;
      }
      const xfdf = exportAnnotationCommand(annot, action);
      mapXfdf[annot.Id] = xfdf;
    });
    let emitData = null;
    /* ------- End --------- */
    const ownershipOfAnnotations = isOwnerOfAllAnnotations({
      currentUser,
      currentDocument,
      selectedAnnotations: annotations,
    });
    const isEditOtherAnnotation = !ownershipOfAnnotations.isUniqueOwner && ownershipOfAnnotations.isValidDocument;
    if (!isRedactionApplied && !isReorderApplied && !isAutoResized) {
      this.addAnnotToUndoRedoStack({
        annotations: annotationsUpdated,
        action,
        mapXfdf,
        currentDocument,
        currentUser,
        isEditOtherAnnotation,
      });
    }

    if (!this.offlineStrategy.isSystemFile) {
      if (isRedactionApplied) {
        this.careTaker.removeMemento(annotationsUpdated);
      }
      let shouldCreateNonCommentEvent = true;

      this.debounceSetSavingStatus(SAVE_OPERATION_TYPES.ANNOTATION_CHANGE);
      const savedAnnots = [];
      const listEmitData = [];

      annotationsUpdated.forEach(async (annotation) => {
        const annotationContent = annotation.getContents();
        const isNotDeleteRedactAnnot =
          annotation instanceof window.Core.Annotations.RedactionAnnotation &&
          (action !== ANNOTATION_ACTION.DELETE || isRedactionApplied);
        emitData = {
          xfdf: mapXfdf[annotation.Id],
          annotationId: annotation.Id,
          pageIndex: annotation.PageNumber,
        };
        const isInternal = Boolean(internalAnnotationIds.find((element) => element === annotation.Id));
        if (action === ANNOTATION_ACTION.DELETE) {
          emitData = {
            ...emitData,
            isInternal,
          };
        }
        let annotationType = annotation.Subject;

        if (
          annotationType === AnnotationSubjectMapping.signature &&
          [ANNOTATION_ACTION.ADD, ANNOTATION_ACTION.DELETE].includes(action)
        ) {
          const widgetId = annotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key);
          if (widgetId) {
            const widget = annotationManager.getAnnotationById(widgetId);
            if (widget) {
              eventTracking(UserEventConstants.EventType.FORM_BUILDER_ELEMENT_CHANGE, {
                formBuilderName: widget.fieldName,
                formBuilderType: FORM_FIELD_TYPE.SIGNATURE,
              });
            }
          }
        }

        /**
         * Check if action is delete commentAnnotation type and annotation subject is Comment
         * If yes, assign annotationType value as Removal
         */
        if (action === ANNOTATION_ACTION.DELETE && annotation.Subject !== AnnotationSubjectMapping.stickyNote) {
          annotationType = AnnotationSubjectMapping.removal;
          emitData.shouldCreateEvent = shouldCreateNonCommentEvent;
          shouldCreateNonCommentEvent = false;
        }
        if (isNotDeleteRedactAnnot) {
          return;
        }
        // Check if annotation is a comment/reply-to-comment
        if (annotationType === AnnotationSubjectMapping.stickyNote) {
          // annotationChange was triggered because comment was created without custom data that includes styled content
          const isReplyWithoutStyle =
            action === ANNOTATION_ACTION.ADD &&
            annotation.isReply() &&
            !annotation.getCustomData(CUSTOM_DATA_COMMENT.STYLED_COMMENT.key);
          const isInvalidComment = !annotationContent || !annotationContent.trim() || isReplyWithoutStyle;
          if (isInvalidComment) {
            return;
          }
          emitData.comment = viewerHelper.getAnnotCommentData({
            annotation,
            annotationAction: action,
          });
        }

        if (annotation.Subject === AnnotationSubjectMapping.highlight) {
          const isHighLightCommentWithoutContent =
            annotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key) &&
            annotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_HAS_CONTENT.key) ===
              CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_HAS_CONTENT.noValue;

          // skip no content
          if (isHighLightCommentWithoutContent) {
            return;
          }
          emitData = {
            ...emitData,
            annotationSubType: AnnotationSubTypes.HIGHLIGHT_COMMENT,
          };
        }

        if (currentUser) {
          emitData = {
            ...emitData,
            annotationType,
            annotationAction: action,
            userId: currentUser._id,
            email: currentUser.email,
          };
        }
        if (isReorderApplied) {
          const reorderType = annotation.getCustomData(CUSTOM_DATA_REORDER_ANNOTATION.REORDER_TYPE.key);
          emitData = {
            ...emitData,
            reorderType,
          };
        }

        if (annotation.Subject === AnnotationSubjectMapping.widget) {
          const widgetXfdf = await getWidgetXfdf(true);
          emitData = {
            ...emitData,
            xfdf: widgetXfdf,
            annotationId: currentDocument._id,
            annotationType: AnnotationSubjectMapping.widget,
          };
        }

        if (isTempEditMode(location.pathname)) {
          const id = this.isCreateExternalPdf() ? currentDocument.remoteId : currentDocument._id;
          saveFileChanged(id, this.isCreateExternalPdf());
        } else if (isOffline) {
          const unqAnnot =
            annotManager
              .getAnnotationsList()
              .find((annot) => annot.PageNumber === annotation.PageNumber && annot.Subject === 'LUnique') || {};

          savedAnnots.push({
            annotation,
            belongsTo: unqAnnot.Id || '',
            ...emitData,
          });
        } else if (
          infoObject?.force ||
          ownershipOfAnnotations.isUniqueOwner ||
          (!ownershipOfAnnotations.isUniqueOwner && isRedactionApplied)
        ) {
          // This condition is handling case user rotate annotation of another user. Without this statement, the annot will emit data without confirming the modal
          annotationSyncQueue.addAnnotation(currentDocument._id, emitData);
        } else {
          listEmitData.push(emitData);
        }
      });
      Object.values(mapXfdf).forEach((xfdf) => {
        commandHandler.insertTempAction(currentDocument._id, [
          {
            type: 'annotation',
            xfdf,
            action,
            reason: BACKUP_ANNOTATION_REASON.SOCKET_DISCONNECT,
          },
        ]);
      });

      this.debounceSetSaveStatus(isOffline);

      if (action === ANNOTATION_ACTION.DELETE) {
        const deletedCommentAnnots = annotations.filter(isComment);
        const highlightCommentAnnots = annotations.filter(
          (annotation) =>
            annotation.Subject === AnnotationSubjectMapping.highlight &&
            annotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key)
        );
        if (!isOffline && !isTempEditMode(location.pathname) && deletedCommentAnnots.length && core.isUserAdmin()) {
          deletedCommentAnnots.forEach((comment) => {
            if (currentUser.email !== comment.Author && isEmail(comment.Author || '')) {
              socket.emit(SOCKET_EMIT.DELETE_COMMENT_NOTI, [
                {
                  ownerCommentEmail: comment.Author,
                  documentId: currentDocument._id,
                  actorId: currentUser._id,
                },
              ]);
            }
          });
        }
        const noteList = core.getAnnotationsList();
        highlightCommentAnnots.forEach((highlight) => {
          const stickyId = highlight.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.STICKY_ID.key);
          const comment = noteList.find((e) => e.Id === stickyId);
          if (comment) {
            core.deleteAnnotations([comment, highlight]);
          }
        });
      }

      if (!isOffline && !isTempEditMode(location.pathname) && action === ANNOTATION_ACTION.MODIFY && isSignatureAnnot) {
        const updatedCurrentUser = {
          ...currentUser,
          metadata: {
            ...currentUser.metadata,
            hasShownBananaBanner: true,
          },
        };
        updateCurrentUser(updatedCurrentUser);
      }
      const skipShowModal = isRedactionApplied || infoObject?.force;
      const isUndoPagesDeleted = infoObject?.source === ANNOTATION_CHANGE_SOURCE.LUMIN_UNDO_PAGES_DELETED;
      if (isEditOtherAnnotation && !skipShowModal && !isUndoPagesDeleted) {
        core.deselectAllAnnotations();
        if (this.isGoogleDriveStorage()) {
          this.executeAnnotationEdit({
            action,
            annotations,
            annotationsUpdated,
            mapXfdf,
            ownershipOfAnnotations,
            listEmitData,
            savedAnnots,
            annotManager,
            currentDocument,
            isOffline,
            location,
          });
        } else {
          handlePromptEditAnnotation({
            action,
            onConfirm: () => {
              this.executeAnnotationEdit({
                action,
                annotations,
                annotationsUpdated,
                mapXfdf,
                ownershipOfAnnotations,
                listEmitData,
                savedAnnots,
                annotManager,
                currentDocument,
                isOffline,
                location,
              });
            },
            onCancel: async () => {
              shouldCacheCommand = false;
              await this.handleCancelConfirmEdit(annotations);
            },
          });
        }
      }
      if (shouldCacheCommand && savedAnnots.length) {
        commandHandler.insertAnnotation(currentDocument._id, {
          manager: annotManager,
          annots: savedAnnots,
        });
      }
    } else if (!isTempEditMode(location.pathname)) {
      const updatedTotalLocalFileAnnotations = (currentDocument.newLocalFileTotalAnnotations || 0) + 1;
      this.props.dispatch(
        actions.updateCurrentDocument({
          unsaved: true,
          newLocalFileTotalAnnotations: updatedTotalLocalFileAnnotations,
        })
      );
    }

    const annotationEditContents = annotations.filter(
      (annot) => annot.isContentEditPlaceholder() && annot.getContentEditType() === window.Core.ContentEdit.Types.TEXT
    );

    if (annotationEditContents.length > 0) {
      annotationEditContents.forEach((annotEdit) => {
        annotEdit.NoMove = true;
      });
    }
  };

  attachOnAnnotationChanged() {
    core.addEventListener('annotationChanged', this.onAnnotationChanged);
  }

  addAnnotToUndoRedoStack = ({ annotations, action, mapXfdf, currentDocument, currentUser, isEditOtherAnnotation }) => {
    if (annotations[0] instanceof window.Core.Annotations.RedactionAnnotation) {
      return;
    }

    const isEmptyAnnotComment = isComment(annotations[0]) && !annotations[0].getContents();
    if (isEmptyAnnotComment && (action === ANNOTATION_ACTION.ADD || action === ANNOTATION_ACTION.DELETE)) {
      this.emptyCommentAnnot = true;
      return;
    }

    const curAction = this.emptyCommentAnnot && action === ANNOTATION_ACTION.MODIFY ? ANNOTATION_ACTION.ADD : action;

    this.careTaker.backupAnnotation({
      annotations,
      action: curAction,
      mapXfdf,
      currentDocument,
      currentUser,
      isEditOtherAnnotation,
    });
    this.emptyCommentAnnot = false;
  };

  isReadyConnectIdle = () => {
    const { currentUser, currentDocument } = this.props;
    return Boolean(currentDocument && ((currentUser && currentUser._id) || this.anonymousId));
  };

  removeIdle = () => {
    const { currentUser, currentDocument } = this.props;
    if (this.isReadyConnectIdle()) {
      socket.emit(SOCKET_EMIT.IDLE_USER, {
        user: {
          id: currentUser ? currentUser._id : this.anonymousId,
          isActive: true,
        },
        documentId: currentDocument._id,
        remoteId: currentDocument.remoteId,
      });
    }
  };

  addIdle = () => {
    const { currentUser, currentDocument } = this.props;
    if (this.isReadyConnectIdle()) {
      socket.emit(SOCKET_EMIT.IDLE_USER, {
        user: {
          id: currentUser ? currentUser._id : this.anonymousId,
          isActive: false,
        },
        documentId: currentDocument._id,
        remoteId: currentDocument.remoteId,
      });
    }
  };

  setUpOffline = (enabled) => {
    this.isOfflineEnabled = enabled;
    commandHandler.enabledOfflineTracking = enabled;
    this.setUpOfflineSuccess = enabled;
  };

  onLayoutChanged = (changes) => {
    const { setCurrentDocument, currentDocument } = this.props;
    const hasInsertPage = changes.added.length > 0;
    const hasMovePage = Object.keys(changes.moved).length > 0;
    const hasDeletePage = changes.removed.length > 0;

    if (!currentDocument.unsaved && this.offlineStrategy.isSystemFile && (hasInsertPage || hasMovePage)) {
      const updatedTotalLocalFileAnnotations = (currentDocument.newLocalFileTotalAnnotations || 0) + 1;
      setCurrentDocument({
        ...currentDocument,
        unsaved: true,
        newLocalFileTotalAnnotations: updatedTotalLocalFileAnnotations,
      });
    }
    if (hasDeletePage || hasMovePage || hasInsertPage) {
      /*
        Using 'setTimeout' ensures that other 'pagesUpdated' handlers complete first, allowing annotations to update their page numbers before exporting the annotation command.
      */
      setTimeout(() => {
        const listPageUpdated = Object.values(changes.moved);
        this.careTaker.clearUndoRedoStack();
        const annotations = core.getAnnotationsList();
        const listReplies = annotations
          .filter((annot) => !(annot instanceof window.Core.Annotations.WidgetAnnotation))
          .reduce((res, annot) => [...res, ...annot.getReplies()], []);
        annotations
          .concat(listReplies)
          .filter(
            (annot) =>
              listPageUpdated.includes(annot.PageNumber) && !(annot instanceof window.Core.Annotations.WidgetAnnotation)
          )
          .forEach((annot) => {
            const xfdf = exportAnnotationCommand(annot, ANNOTATION_ACTION.MODIFY);
            const annotationId = annot.Id;
            remove(this.careTaker.initialStack, { annotationId });
            this.careTaker.initialStack.push({ annotationId, xfdf });
          });
      });
    }
  };

  removeAnnotationChangedEvent = () => {
    core.removeEventListener('annotationChanged', this.onAnnotationChanged);
  };

  removeAnnotationEvent = () => {
    this.removeAnnotationChangedEvent();
    core.removeEventListener('annotationDoubleClicked', this.onAnnotationDoubleClicked);
    core.removeEventListener('pagesUpdated', this.onLayoutChanged);

    core.getTool('AnnotationCreateFreeText').removeEventListener('annotationAdded', this.onFreeTextAdded);
    core.getAnnotationManager().removeEventListener('fieldChanged', this.onFieldChanged);
  };

  reloadDocument = () => {
    const {
      closePreviewOriginalVersionMode,
      closePageEditMode,
      closeRightSideBar,
      setIsLoadingDocument,
      setAnnotationsLoaded,
      setIsInContentEditMode,
      resetGeneralLayout,
      setIsDocumentReady,
      setIsDocumentLoaded,
    } = this.props;
    closeRightSideBar();
    closePageEditMode();
    closePreviewOriginalVersionMode();
    setIsLoadingDocument(true);
    setAnnotationsLoaded(false);
    setIsDocumentLoaded(false);
    setIsDocumentReady(false);
    ToolSwitchableChecker.setIsAnnotationLoaded(false);

    if (core.getContentEditManager().isInContentEditMode()) {
      core.getContentEditManager().endContentEditMode();
    }
    setIsInContentEditMode(false);

    if (core.getFormFieldCreationManager().isInFormFieldCreationMode()) {
      core.getFormFieldCreationManager().endFormFieldCreationMode();
    }

    if (core.getSelectedAnnotations().length > 0) {
      core.deselectAllAnnotations();
    }

    // New layout
    resetGeneralLayout();

    this.setState({ loadedAnnot: false, showAccessUpdateToast: false });
    core.getScrollViewElement().scrollTop = 0;

    return this.refetchDocument(async (document) => {
      await this.loadDocumentToViewer(document);
      this.removeAnnotationChangedEvent();
      this.attachOnAnnotationChanged();
    });
  };

  reloadDocumentToViewer = async () => {
    const { setIsLoadingDocument, setAnnotationsLoaded, setIsDocumentLoaded } = this.props;
    setIsLoadingDocument(true);
    setAnnotationsLoaded(false);
    setIsDocumentLoaded(false);
    this.setState({ loadedAnnot: false });
    this.isReloadDocument.current = true;
    await this.refetchDocument(async (document) => {
      await this.loadDocumentToViewer(document);
      this.removeAnnotationChangedEvent();
      this.attachOnAnnotationChanged();
    });
  };

  openPreviewOriginalVersion = async () => {
    const {
      currentDocument,
      openPreviewOriginalVersionMode,
      closePageEditMode,
      closeRightPanelComment,
      setCommentPanelLayoutState,
      openViewerModal,
      t,
      setIsLoadingDocument,
      dispatch,
      navigate,
      setIsToolPropertiesOpen,
      setToolPropertiesValue,
    } = this.props;
    batch(() => {
      closePageEditMode();
      openPreviewOriginalVersionMode();
      closeRightPanelComment();
      setCommentPanelLayoutState(COMMENT_PANEL_LAYOUT_STATE.NORMAL);
      setIsToolPropertiesOpen(false);
      setToolPropertiesValue(TOOL_PROPERTIES_VALUE.DEFAULT);
      setIsLoadingDocument(true);
    });
    core.setToolMode(defaultTool);
    this.setState({ showAccessUpdateToast: false });
    const src = await documentGraphServices.getDocumentOriginalFileUrl(currentDocument._id);
    if (src) {
      const modifiedDocument = { ...currentDocument, service: documentStorage.s3 };
      const documentOptions = {
        filename: modifiedDocument.name,
        documentId: modifiedDocument._id,
      };
      const extensionByMime = mime.extension(modifiedDocument.mimeType);
      documentOptions.extension = extensionByMime;

      await loadDocument({ document: modifiedDocument, dispatch, src, navigate, options: documentOptions });
      core.refreshAll();
      core.updateView();
      core.enableReadOnlyMode();
    } else {
      openViewerModal({
        type: ModalTypes.WARNING,
        title: t('errorMessage.unknownError'),
        confirmButtonTitle: t(TRANSLATION_VIEWER_RELOAD),
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        onConfirm: () => {
          window.location.reload();
        },
      });
    }
  };

  openDocumentRevision = async () => {
    const {
      closePageEditMode,
      openPreviewOriginalVersionMode,
      closeRightPanelComment,
      setCommentPanelLayoutState,
      setIsToolPropertiesOpen,
      setToolPropertiesValue,
    } = this.props;

    batch(() => {
      closePageEditMode();
      openPreviewOriginalVersionMode();
      closeRightPanelComment();
      setCommentPanelLayoutState(COMMENT_PANEL_LAYOUT_STATE.NORMAL);
      setIsToolPropertiesOpen(true);
      setToolPropertiesValue(TOOL_PROPERTIES_VALUE.REVISION);
      this.clearEditorChatbot();
    });

    core.setToolMode(defaultTool);
    this.setState({ showAccessUpdateToast: false });
    core.refreshAll();
    core.updateView();
    core.enableReadOnlyMode();
  };

  render() {
    const { currentDocument, t, isLoadingDocument, isNarrowScreen, isInPresenterMode } = this.props;
    const { onlineMembers, showAccessUpdateToast } = this.state;
    return (
      <>
        {!isLoadingDocument && (
          <CustomHeader
            description={t('viewer.viewerMetaDescription')}
            title={currentDocument?.name ? `${currentDocument.name} - Lumin` : 'Lumin'}
            suffix={`Lumin PDF ${t('viewer.titleName')}`}
            noIndex
            sharable
          />
        )}
        <IdleTimer
          element={document}
          onActive={this.removeIdle}
          onIdle={this.addIdle}
          debounce={500}
          events={[
            'mousemove',
            'keydown',
            'wheel',
            'DOMMouseScroll',
            'mouseWheel',
            'mousedown',
            'touchstart',
            'touchmove',
            'MSPointerDown',
            'MSPointerMove',
            'visibilitychange',
            'keypress',
          ]}
          timeout={IDLE_TIME}
        />
        <ViewerContext.Provider value={this.getDocumentContext()}>
          <App
            refetchDocument={this.refetchDocument}
            currentDocument={currentDocument}
            onlineMembers={onlineMembers}
            isLoadingDocument={isLoadingDocument}
            offlineEnabled={this.isOfflineEnabled}
            setUpOffline={this.setUpOffline}
            showAccessUpdateToast={showAccessUpdateToast}
            isNarrowScreen={isNarrowScreen}
            isInPresenterMode={isInPresenterMode}
          />
        </ViewerContext.Provider>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  isPageEditMode: selectors.isPageEditMode(state),
  isPreviewOriginalVersionMode: selectors.isPreviewOriginalVersionMode(state),
  thumbs: selectors.getThumbs(state),
  organizations: selectors.getOrganizationList(state),
  isLoadingDocument: selectors.isLoadingDocument(state),
  internalAnnotationIds: selectors.getInternalAnnotationIds(state),
  isInReadAloudMode: readAloudSelectors.isInReadAloudMode(state),
  isInPresenterMode: selectors.isInPresenterMode(state),
  backDropMessage: selectors.getBackDropMessage(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  openLoading: () => dispatch(actions.openElement('loadingModal')),
  closeLoading: () => dispatch(actions.closeElement('loadingModal')),
  openViewerModal: (modalSettings) => dispatch(actions.openViewerModal(modalSettings)),
  closeModal: () => dispatch(actions.closeModal()),
  closeRightPanelComment: () => dispatch(actions.closeElement('rightPanelComment')),
  setCurrentDocument: (document) => dispatch(actions.setCurrentDocument(document)),
  resetCurrentDocument: () => dispatch(actions.resetCurrentDocument()),
  setCareTaker: (careTaker) => dispatch(actions.setCareTaker(careTaker)),
  disableElement: (element) => dispatch(actions.disableElement(element, PRIORITY_ONE)),
  enableElement: (element) => dispatch(actions.enableElement(element, PRIORITY_ONE)),
  enableElements: (elements) => dispatch(actions.enableElements(elements, PRIORITY_THREE)),
  setIsShowTopBar: (isShowTopBar) => dispatch(actions.setIsShowTopBar(isShowTopBar)),
  resetPDFViewer: () => dispatch(actions.resetViewer()),
  resetDocumentViewer: () => dispatch(actions.resetDocument()),
  resetGeneralLayout: () => dispatch(actions.resetGeneralLayout()),
  updateCurrentUser: (data) => dispatch(actions.updateCurrentUser(data)),
  updateThumbs: (thumbs) => dispatch(actions.updateThumbs(thumbs)),
  setDocumentNotFound: () => dispatch(actions.setDocumentNotFound()),
  updateModalProperties: (data) => dispatch(actions.updateModalProperties(data)),
  setSignatureWidgetSelected: (signatureWidgetSelected) =>
    dispatch(actions.setSignatureWidgetSelected(signatureWidgetSelected)),
  openPreviewOriginalVersionMode: () => dispatch(actions.openPreviewOriginalVersionMode()),
  closePreviewOriginalVersionMode: () => dispatch(actions.closePreviewOriginalVersionMode()),
  closePageEditMode: () => dispatch(actions.closePageEditMode()),
  setCommentPanelLayoutState: (state) => dispatch(actions.setCommentPanelLayoutState(state)),
  closeRightSideBar: () => dispatch(actions.closeElement('rightToolsPanel')),
  setAutoSyncStatus: (status) => dispatch(actions.setAutoSyncStatus(status)),
  setIsLoadingDocument: (isLoading) => dispatch(actions.setIsLoadingDocument(isLoading)),
  setIsDocumentLoaded: (isLoaded) => dispatch(actions.setIsDocumentLoaded(isLoaded)),
  setInternalAnnotationIds: (internalAnnotationIds) =>
    dispatch(actions.setInternalAnnotationIds(internalAnnotationIds)),
  setIsToolPropertiesOpen: (isOpen) => dispatch(actions.setIsToolPropertiesOpen(isOpen)),
  setToolPropertiesValue: (value) => dispatch(actions.setToolPropertiesValue(value)),
  setAnnotationsLoaded: (value) => dispatch(actions.setAnnotationsLoaded(value)),
  setIsInContentEditMode: (value) => dispatch(actions.setIsInContentEditMode(value)),
  setIsDocumentReady: (value) => dispatch(actions.setIsDocumentReady(value)),
  resetSearchResult: () => dispatch(actions.resetSearch()),
  resetSearchValue: () => dispatch(actions.setSearchValue('')),
  setCanModifyDriveContent: (value) => dispatch(actions.setCanModifyDriveContent(value)),
  clearChatBotMessage: () => dispatch(clearMessages()),
  setIsEmbeddedJavascript: (value) => dispatch(actions.setIsEmbeddedJavascript(value)),
  setBackDropMessage: (message) => dispatch(actions.setBackDropMessage(message)),
});

AppContainer.propTypes = {
  currentUser: PropTypes.object,
  thumbs: PropTypes.array,
  organizations: PropTypes.object,
  isPageEditMode: PropTypes.bool,
  isPreviewOriginalVersionMode: PropTypes.bool,
  dispatch: PropTypes.func,
  openViewerModal: PropTypes.func,
  closeRightPanelComment: PropTypes.func,
  setCurrentDocument: PropTypes.func,
  resetCurrentDocument: PropTypes.func,
  setCareTaker: PropTypes.func,
  disableElement: PropTypes.func,
  enableElement: PropTypes.func,
  enableElements: PropTypes.func,
  setIsShowTopBar: PropTypes.func,
  resetPDFViewer: PropTypes.func,
  resetDocumentViewer: PropTypes.func,
  resetGeneralLayout: PropTypes.func,
  updateCurrentUser: PropTypes.func,
  updateThumbs: PropTypes.func,
  setDocumentNotFound: PropTypes.func,
  updateModalProperties: PropTypes.func,
  setSignatureWidgetSelected: PropTypes.func,
  openPreviewOriginalVersionMode: PropTypes.func,
  closePreviewOriginalVersionMode: PropTypes.func,
  closePageEditMode: PropTypes.func,
  setCommentPanelLayoutState: PropTypes.func,
  handleVerifyDocument: PropTypes.func.isRequired,
  subcribeEventOnDocument: PropTypes.func.isRequired,
  subcribeEventDeleteDocument: PropTypes.func.isRequired,
  isAnyDialogTypeOpen: PropTypes.bool.isRequired,
  currentDocument: PropTypes.object,
  t: PropTypes.func,
  isOffline: PropTypes.bool.isRequired,
  navigate: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  error: PropTypes.object,
  fromNewAuthFlow: PropTypes.bool.isRequired,
  closeRightSideBar: PropTypes.func,
  setAutoSyncStatus: PropTypes.func,
  setIsLoadingDocument: PropTypes.func,
  setIsDocumentLoaded: PropTypes.func,
  isLoadingDocument: PropTypes.bool,
  setInternalAnnotationIds: PropTypes.func,
  internalAnnotationIds: PropTypes.array,
  location: PropTypes.object.isRequired,
  setIsToolPropertiesOpen: PropTypes.func,
  setToolPropertiesValue: PropTypes.func,
  setAnnotationsLoaded: PropTypes.func,
  setIsInContentEditMode: PropTypes.func,
  setIsDocumentReady: PropTypes.func,
  resetSearchResult: PropTypes.func,
  resetSearchValue: PropTypes.func,
  formFields: PropTypes.array,
  isNewLayout: PropTypes.bool,
  isNarrowScreen: PropTypes.bool,
  isInReadAloudMode: PropTypes.bool,
  saveFileChanged: PropTypes.func.isRequired,
  saveFormFieldInTempEditMode: PropTypes.func.isRequired,
  isInPresenterMode: PropTypes.bool,
  clearChatBotMessage: PropTypes.func,
  setIsEmbeddedJavascript: PropTypes.func,
  setBackDropMessage: PropTypes.func,
  isDefaultMode: PropTypes.bool.isRequired,
  conflictVersionHandler: PropTypes.object.isRequired,
  saveOperations: PropTypes.shape({
    startOperation: PropTypes.func.isRequired,
    completeOperation: PropTypes.func.isRequired,
    removeOperation: PropTypes.func.isRequired,
  }),
};

AppContainer.defaultProps = {
  currentDocument: null,
  error: null,
  currentUser: {},
  thumbs: [],
  organizations: {},
  isPageEditMode: false,
  isPreviewOriginalVersionMode: false,
  internalAnnotationIds: [],
  dispatch: () => {},
  openViewerModal: () => {},
  closeRightPanelComment: () => {},
  setCurrentDocument: () => {},
  resetCurrentDocument: () => {},
  setCareTaker: () => {},
  disableElement: () => {},
  enableElement: () => {},
  enableElements: () => {},
  setIsShowTopBar: () => {},
  resetPDFViewer: () => {},
  resetDocumentViewer: () => {},
  resetGeneralLayout: () => {},
  updateCurrentUser: () => {},
  updateThumbs: () => {},
  setDocumentNotFound: () => {},
  updateModalProperties: () => {},
  setSignatureWidgetSelected: () => {},
  openPreviewOriginalVersionMode: () => {},
  closePreviewOriginalVersionMode: () => {},
  closePageEditMode: () => {},
  setCommentPanelLayoutState: () => {},
  t: () => {},
  closeRightSideBar: () => {},
  setAutoSyncStatus: () => {},
  setIsLoadingDocument: () => {},
  setIsDocumentLoaded: () => {},
  isLoadingDocument: false,
  setInternalAnnotationIds: () => {},
  setIsToolPropertiesOpen: () => {},
  setToolPropertiesValue: () => {},
  setAnnotationsLoaded: () => {},
  setIsInContentEditMode: () => {},
  setIsDocumentReady: () => {},
  resetSearchResult: () => {},
  resetSearchValue: () => {},
  formFields: [],
  isNewLayout: false,
  isNarrowScreen: false,
  isInReadAloudMode: false,
  isInPresenterMode: false,
  clearChatBotMessage: () => {},
  setIsEmbeddedJavascript: () => {},
};

AppContainer.contextType = FetchingAnnotationsContext;

export default compose(connect(mapStateToProps, mapDispatchToProps), withTranslation())(AppContainer);
