/* eslint-disable no-use-before-define */
import { t } from 'i18next';
import get from 'lodash/get';
import isArrayBuffer from 'lodash/isArrayBuffer';

import { store } from 'src/redux/store';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import documentGraphServices from 'services/graphServices/documentGraphServices';

import getHashParams from 'helpers/getHashParams';
import logger from 'helpers/logger';
import { passwordHandlers } from 'helpers/passwordHandlers';

import { file as fileUtils, getFileService, toastUtils } from 'utils';

import { documentCacheBase, getCacheKey } from 'features/DocumentCaching';

import { ModalTypes, LOGGER, STORAGE_TYPE, STATUS_CODE } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';
import { START_DOWNLOAD_DOCUMENT } from 'constants/timeTracking';

import { ToolSwitchableChecker } from './toolSwitchableChecker';
import timeTracking from '../screens/Viewer/time-tracking';

const LOADING_IMAGE_ERROR_MESSAGE = 'Failed to load image';
const FAIL_TO_CONVERT_OFFICE_MESSAGE =
  'Unable to convert this document from binary to OOXML form. File is not a valid zip archive.';
let forceReload = true;

export default ({ dispatch, src, navigate, options = {}, document = {} }) => {
  const state = store.getState();
  options = { ...getDefaultOptions(), ...options };
  options.docId = options.documentId || null;
  options.onLoadingProgress = (percent) => dispatch(actions.setLoadingProgress(percent));
  options.password = transformPasswordOption({ password: options.password, dispatch, navigate });
  options.xodOptions = extractXodOptions(options);
  options.loadAsPDF = true;
  options.onError = async (error) => {
    if (error.message.includes(FAIL_TO_CONVERT_OFFICE_MESSAGE) && src instanceof Blob) {
      documentCacheBase.delete(getCacheKey(document._id));
      const { src: url } = await getFileService.getFileOptions(document, options);
      core.loadDocument(url, options);
      return;
    }
    if (
      [STORAGE_TYPE.GOOGLE, STORAGE_TYPE.ONEDRIVE].includes(document.service) &&
      get(error, 'serverResponse.status') === STATUS_CODE.NOT_FOUND
    ) {
      dispatch(actions.setDocumentNotFound());
      return;
    }
    const rawResponse = get(error, 'serverResponse.rawResponse');
    if (isArrayBuffer(rawResponse)) {
      const file = new File([new Blob([rawResponse])], document.name, { type: document.mimeType });
      core.loadDocument(file, options);
      return;
    }
    logger.logError({
      message: JSON.stringify(error),
      reason: error?.type || LOGGER.Service.PDFTRON,
    });
    if ((error.type === 'InvalidPDF' || error.message === LOADING_IMAGE_ERROR_MESSAGE) && forceReload) {
      forceReload = false;
      options.extension = fileUtils.getExtension(document.name);
      core.loadDocument(src, options);
      window.addEventListener(
        'documentLoaded',
        async () => {
          forceReload = true;
          if (!document.isAnonymousDocument) {
            const {
              data: { mimeType },
            } = await documentGraphServices.updateMimeType(document._id);
            dispatch(
              actions.updateCurrentDocument({
                ...document,
                mimeType,
              })
            );
          }
        },
        { once: true }
      );
      return;
    }
    if (document.service === STORAGE_TYPE.DROPBOX) {
      getFileService.handleErrorGetFileDropbox({ response: error.serverResponse });
      return;
    }
    dispatch(
      actions.openViewerModal({
        type: ModalTypes.ERROR,
        title: t('modalCannotOpenFile.title'),
        message: t('modalCannotOpenFile.message'),
        cancelButtonTitle: t('common.openAnotherFile'),
        confirmButtonTitle: t('common.reload'),
        footerVariant: 'variant4',
        onCancel: () => {
          if (!selectors.getCurrentUser(state)) {
            navigate(Routers.SIGNIN);
            return;
          }
          const documentListFallbackUrl =
            sessionStorage.getItem(SESSION_STORAGE_KEY.DOCUMENT_LIST_FALLBACK_URL) || Routers.DOCUMENTS;
          navigate(documentListFallbackUrl);
        },
        onConfirm: () => window.location.reload(),
      })
    );
    dispatch(actions.closeElement('loadingModal'));
  };
  dispatch(actions.closeElement('passwordModal'));
  ToolSwitchableChecker.setIsAnnotationLoaded(false);
  core.loadDocument(src, options);
  timeTracking.finishTracking(START_DOWNLOAD_DOCUMENT);
  dispatch(actions.openElement('progressModal'));
};

/**
 * Default options are some of the options used to initialize WebViewer, and will be preserved on loadDocument calls.
 * We do this so that users don't need to pass these options every time they call instance.loadDocument
 * For example, if WebViewer is initialized with WebViewer Server, subsequent calls to instance.loadDocument will assume WebViewer Server is used.
 * @ignore
 */
const getDefaultOptions = () => ({
  startOffline: getHashParams('startOffline', false),
  azureWorkaround: getHashParams('azureWorkaround', false),
  pdftronServer: getHashParams('pdftronServer', ''),
  singleServerMode: getHashParams('singleServerMode', false),
  forceClientSideInit: getHashParams('forceClientSideInit', false),
  disableWebsockets: getHashParams('disableWebsockets', false),
  cacheKey: JSON.parse(getHashParams('cacheKey', null)),
  streaming: getHashParams('streaming', false),
  useDownloader: getHashParams('useDownloader', true),
  backendType: getHashParams('pdf', null),
  loadAsPDF: getHashParams('loadAsPDF', null),
});

/**
 * transform the password argument from a string to a function to hook up UI logic
 * @ignore
 */
let attempt = 0;

const transformPasswordOption = ({ password, dispatch, navigate }) => {
  const state = store.getState();
  // a boolean that is used to prevent infinite loop when wrong password is passed as an argument
  let passwordChecked = false;

  return (checkPassword) => {
    passwordHandlers.setCancelFn(() => {
      toastUtils.error({
        message: t('toast.canceledPasswordEntry'),
        useReskinToast: true,
      });
      if (!selectors.getCurrentUser(state)) {
        navigate(Routers.SIGNIN);
        return;
      }
      const documentListFallbackUrl =
        sessionStorage.getItem(SESSION_STORAGE_KEY.DOCUMENT_LIST_FALLBACK_URL) || Routers.DOCUMENTS;
      navigate(documentListFallbackUrl);
    });
    if (!passwordChecked && typeof password === 'string') {
      checkPassword(password);
      passwordChecked = true;
    } else {
      if (passwordChecked) {
        console.error('Wrong password has been passed as an argument. WebViewer will open password modal.');
      }

      passwordHandlers.setCheckFn(checkPassword);
      dispatch(actions.setPasswordAttempts(attempt++));
      dispatch(actions.openElement('passwordModal'));
    }
  };
};

const extractXodOptions = (options) => {
  const xodOptions = {};

  if (options.decryptOptions) {
    xodOptions.decrypt = core.CoreControls.Encryption.decrypt;
    xodOptions.decryptOptions = options.decryptOptions;
  }

  if (options.decrypt) {
    xodOptions.decrypt = options.decrypt;
  }

  if (options.streaming) {
    xodOptions.streaming = options.streaming;
  }

  if (options.azureWorkaround) {
    xodOptions.azureWorkaround = options.azureWorkaround;
  }

  if (options.startOffline) {
    xodOptions.startOffline = options.startOffline;
  }

  return xodOptions;
};
