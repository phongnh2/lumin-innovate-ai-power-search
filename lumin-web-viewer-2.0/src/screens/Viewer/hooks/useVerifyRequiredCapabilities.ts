/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import get from 'lodash/get';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { googleServices } from 'services';

import logger from 'helpers/logger';

import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { documentStorage } from 'constants/documentConstants';
import { ModalTypes, LOGGER } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';
import { STATIC_PAGE_URL } from 'constants/urls';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IUser } from 'interfaces/user/user.interface';

export default (): {
  hasDownloadPermission: (document: IDocumentBase) => Promise<boolean>;
  showRequiredPermissionModal: () => void;
} => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);

  const hasDownloadPermission = async (document: IDocumentBase): Promise<boolean> => {
    switch (document.service) {
      case documentStorage.google:
        const result = await googleServices.getFileInfo(document.remoteId, 'capabilities', 'verifyCapabilities');
        return get(result, 'capabilities.canDownload', false);
      case documentStorage.dropbox:
      case documentStorage.onedrive:
      case documentStorage.s3:
      default:
        return true;
    }
  };

  const onCancel = () => {
    if (!currentUser) {
      navigate(Routers.SIGNIN);
      return;
    }
    const documentListFallbackUrl =
      sessionStorage.getItem(SESSION_STORAGE_KEY.DOCUMENT_LIST_FALLBACK_URL) || Routers.DOCUMENTS;
    navigate(documentListFallbackUrl);
  };

  const showRequiredPermissionModal = (): void => {
    dispatch(
      actions.openViewerModal({
        type: ModalTypes.WARNING,
        title: t('viewer.canNotOpenDocument'),
        message: t('viewer.lackOfDownloadPermission'),
        cancelButtonTitle: t('common.tryAnotherFile'),
        confirmButtonTitle: t('common.sendFeedback'),
        isFullWidthButton: true,
        onCancel,
        onConfirm: () => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          window.location.href = STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSupport'));
        },
      })
    );
    logger.logError({
      reason: LOGGER.EVENT.GOOGLE_DRIVE_DOWNLOAD_REQUIRED,
    });
  };

  return {
    hasDownloadPermission,
    showRequiredPermissionModal,
  };
};
