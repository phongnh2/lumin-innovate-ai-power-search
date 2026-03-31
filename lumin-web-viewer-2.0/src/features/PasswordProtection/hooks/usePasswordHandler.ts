import { useState } from 'react';
import { useDispatch } from 'react-redux';

import core from 'core';

import { useTranslation } from 'hooks/useTranslation';

import exportAnnotations from 'helpers/exportAnnotations';

import modalEvent from 'utils/Factory/EventCollection/ModalEventCollection';

import annotationLoadObserver from 'features/Annotation/utils/annotationLoadObserver';
import { ExploredFeatures } from 'features/EnableToolFromQueryParams/constants';
import { useHandleManipulateDateGuestMode } from 'features/GuestModeManipulateCache/useHandleManipuldateGuestMode';

import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';

import { usePasswordManagerPermission } from './usePasswordManagerPermission';
import { useSyncFileAfterUpdatePassword } from './useSyncFileAfterUpdatePassword';
import { PasswordModalType } from '../constants';
import { closePasswordModal, openPasswordModal } from '../slices';

type UsePasswordHandlerProps = {
  modalName?: string;
  onChangeNavigationTab?: () => boolean;
};

export const usePasswordHandler = (props?: UsePasswordHandlerProps) => {
  const { modalName, onChangeNavigationTab } = props || {};
  const { canChange, canSet, canDelete, refetchPasswordPermissionCheck, canEnable, isPersonalDoc } =
    usePasswordManagerPermission();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [syncFile] = useSyncFileAfterUpdatePassword();
  const { t } = useTranslation();
  const { isManipulateInGuestMode, handleAddCache, handleStoreExploreFeatureGuestMode } =
    useHandleManipulateDateGuestMode();

  const openPasswordModalByType = (modalType: keyof typeof PasswordModalType) => {
    onChangeNavigationTab?.();
    dispatch(openPasswordModal({ type: modalType }));
  };

  const openSetPasswordModal = () => openPasswordModalByType(PasswordModalType.SetPassword);

  const openChangePasswordModal = () => openPasswordModalByType(PasswordModalType.ChangePassword);

  const openRemovePasswordModal = () => openPasswordModalByType(PasswordModalType.RemovePassword);

  const closePasswordProtectionModal = () => {
    if (modalName) {
      modalEvent
        .modalDismiss({
          modalName,
        })
        .catch(() => {});
    }
    dispatch(closePasswordModal());
  };

  const errorHandler = (err: unknown) => {
    let errorMessage = 'An unknown error occurred';
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }

    return errorMessage;
  };

  const setPasswordToPdfDoc = (password: string): Promise<Core.PDFNet.PDFDoc> =>
    new Promise((resolve, reject) => {
      core
        .runWithCleanup(async () => {
          try {
            if (!core.getDocument()) {
              resolve(null);
            }
            const pdfDoc = await core.getDocument().getPDFDoc();
            await pdfDoc.lock();
            const newHandler = await window.Core.PDFNet.SecurityHandler.createDefault();
            await newHandler.changeUserPasswordUString(password);
            await newHandler.setPermission(window.Core.PDFNet.SecurityHandler.Permission.e_doc_open, true);
            await pdfDoc.setSecurityHandler(newHandler);
            await pdfDoc.unlock();
            resolve(pdfDoc);
          } catch (e) {
            reject(e);
          }
        })
        .catch((e) => reject(e));
    });

  const getReloadPdfDoc = async (password?: string) => {
    let securityHandler = null;
    const docInstance = core.getDocument();
    const currentPdfDoc = await docInstance.getPDFDoc();
    if (password) {
      securityHandler = await currentPdfDoc.getSecurityHandler();
    }

    const rawDocument = await docInstance.getFileData({ flags: window.Core.SaveOptions.INCREMENTAL });
    const pdfDoc = await core.createPDFDocFromBuffer(rawDocument);
    const xfdfString = await exportAnnotations();
    const fdfDoc = await core.createFdfDocFromXfdf(xfdfString);
    if (securityHandler) {
      await pdfDoc.initStdSecurityHandler(password);
      await pdfDoc.removeSecurity();
    }

    await pdfDoc.fdfUpdate(fdfDoc);
    if (securityHandler) {
      await pdfDoc.setSecurityHandler(securityHandler);
    }

    return pdfDoc;
  };

  const reloadDocument = async (password?: string) => {
    const pdfDoc = await getReloadPdfDoc(password);
    const securedDoc = await pdfDoc.saveMemoryBuffer(window.Core.PDFNet.SDFDoc.SaveOptions.e_linearized);
    await refetchPasswordPermissionCheck();
    annotationLoadObserver.setAnnotations([]);
    await core.loadDocument(securedDoc, {
      password,
    });
    if (!isManipulateInGuestMode) {
      await syncFile();
    }
  };

  const setPassword = async (password: string) => {
    try {
      const pdfDoc = await setPasswordToPdfDoc(password);
      if (!pdfDoc) {
        return;
      }
      setLoading(true);
      sessionStorage.setItem(SESSION_STORAGE_KEY.PDF_PASSWORD, password);
      await reloadDocument(password);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
    const pdfDoc = await core.getDocument().getPDFDoc();
    const validPassword = await pdfDoc.initStdSecurityHandlerUString(currentPassword);
    if (!validPassword) {
      throw new Error(t('errorMessage.wrongPassword'));
    }
    await setPassword(newPassword);
  };

  const removePassword = async (currentPassword: string) => {
    try {
      const pdfDoc = await core.getDocument().getPDFDoc();
      const validPassword = await pdfDoc.initStdSecurityHandlerUString(currentPassword);
      const handler = await pdfDoc.getSecurityHandler();
      if (!(handler && (await handler.isUserPasswordRequired()))) {
        throw new Error('This document is not password protected');
      }
      if (!validPassword) {
        throw new Error(t('errorMessage.wrongPassword'));
      }
      await pdfDoc.removeSecurity();
      setLoading(true);
      await reloadDocument();
      if (isManipulateInGuestMode) {
        await handleAddCache();
        handleStoreExploreFeatureGuestMode(ExploredFeatures.PROTECT_PDF);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    openSetPasswordModal,
    openChangePasswordModal,
    openRemovePasswordModal,
    setPassword,
    changePassword,
    removePassword,
    closePasswordProtectionModal,
    errorHandler,
    canChange,
    canSet,
    canDelete,
    canEnable,
    loading,
    refetchPasswordPermissionCheck,
    isPersonalDoc,
  };
};
