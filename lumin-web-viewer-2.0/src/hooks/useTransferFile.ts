import { find, get } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { useViewerMatch } from 'hooks/useViewerMatch';

import { googleServices, uploadServices, documentServices } from 'services';
import PersonalDocumentUploadService from 'services/personalDocumentUploadService';

import logger, { LoggerParams } from 'helpers/logger';

import { file as fileUtils, getFileService, toastUtils, validator } from 'utils';

import { documentStorage } from 'constants/documentConstants';
import { GoogleErrorCode } from 'constants/errorCode';
import { TRANSFER_FILE_SIZE_LIMIT } from 'constants/fileSize';
import { ModalTypes, LOGGER } from 'constants/lumin-common';
import { MESSAGE_OVER_FILE_SIZE } from 'constants/messages';
import { Plans } from 'constants/plan';
import { SOCKET_EMIT } from 'constants/socketConstant';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { OrganizationList } from 'interfaces/redux/organization.redux.interface';
import { IUser } from 'interfaces/user/user.interface';

import useRestrictedFileSizeModal from './useRestrictedFileSizeModal';
import useStrictDownloadGooglePerms from './useStrictDownloadGooglePerms';
import { useTranslation } from './useTranslation';
import { socket } from '../socket';

type SetState = Dispatch<
  SetStateAction<{
    isShareLinkOpen?: boolean;
    isInLuminStorage?: boolean;
    isTransfering?: boolean;
  }>
>;

type ParamsHandleConfirmTransferFile = {
  afterTransferCallback: () => Promise<void>;
  setState?: SetState;
  currentDocument: IDocumentBase;
};

type Payloads = {
  handleConfirmTransferFile: ({
    afterTransferCallback,
    setState,
    currentDocument,
  }: ParamsHandleConfirmTransferFile) => Promise<void>;
};

type Props = {
  refetchDocument?: () => void;
  updateDocument?: (IDocumentBase: IDocumentBase) => void;
};

const useTransferFile = ({ refetchDocument = () => {}, updateDocument = () => {} }: Props): Payloads => {
  const dispatch = useDispatch();
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const { showModal } = useStrictDownloadGooglePerms();
  const { data: organizations } = useSelector<unknown, OrganizationList>(selectors.getOrganizationList, shallowEqual);
  const { isViewer } = useViewerMatch();
  const { t } = useTranslation();

  const { openRestrictedFileSizeModal } = useRestrictedFileSizeModal();

  const handleLogger = ({ params, isError = false }: { params: LoggerParams; isError?: boolean }): void => {
    if (isError) {
      logger.logError(params);
    } else {
      logger.logInfo(params);
    }
  };

  const sendRequestUploadFile = async ({
    file,
    currentDocument,
  }: {
    file: File;
    currentDocument: IDocumentBase;
  }): Promise<void> => {
    const {
      _id: documentId,
      belongsTo: { workspaceId },
    } = currentDocument;
    try {
      const { encodedUploadData } = await documentServices.uploadDocumentWithThumbnailToS3({ file });
      const uploader = new PersonalDocumentUploadService();
      const uploadedDocument = await uploader.upload({
        encodedUploadData,
        fileName: file.name,
        documentId,
        orgId: workspaceId,
      });
      updateDocument(uploadedDocument);
      socket.emit(SOCKET_EMIT.UPDATE_DOCUMENT, {
        roomId: documentId,
        type: 'updateService',
        previousDocumentData: {
          service: currentDocument.service,
          remoteId: currentDocument.remoteId,
        },
      });
    } catch (error) {
      const modalSettings = {
        type: ModalTypes.ERROR,
        title: t('modalShare.documentUploadFailed'),
        message: t('modalShare.uploadDocumentAgain'),
        useReskinModal: true,
      };
      dispatch(actions.openModal(modalSettings));
    }
  };

  const handleTransferFail = (error: { message: string }): void => {
    let modalSetting;
    if (error.message === 'fileSize') {
      modalSetting = {
        type: ModalTypes.ERROR,
        title: t('modalShare.errorFileSize.title'),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        message: t('modalShare.errorFileSize.message', { size: fileUtils.getFileSizeLimit(TRANSFER_FILE_SIZE_LIMIT) }),
        useReskinModal: true,
      };
    } else {
      modalSetting = {
        type: ModalTypes.ERROR,
        title: t('modalShare.errorFileSize.error'),
        message: t('modalShare.uploadFileErrorMessage'),
        useReskinModal: true,
      };
    }
    dispatch(actions.openModal(modalSetting));
  };

  const handleTransferFile = async ({
    file,
    currentDocument,
  }: {
    file: File;
    currentDocument: IDocumentBase;
  }): Promise<{ error: boolean }> => {
    try {
      if (!file) {
        return { error: true };
      }
      await sendRequestUploadFile({ file, currentDocument });
      return { error: false };
    } catch (error) {
      handleTransferFail(error);
      return { error: true };
    }
  };

  const hasAnyPremium = (currentOrganization: IOrganization): boolean => {
    if (currentOrganization) {
      return validator.validatePremiumOrganization(currentOrganization);
    }

    return currentUser.payment.type !== Plans.FREE;
  };

  const handleShareDocNotStoreInLumin = (currentDocument: IDocumentBase): { allowedUpload: boolean } => {
    const {
      size,
      belongsTo: { workspaceId },
    } = currentDocument;
    const orgList = organizations.map(({ organization }) => organization);
    const currentOrganization = find(orgList, { _id: workspaceId });
    const { allowedUpload, maxSizeAllow } = uploadServices.checkUploadBySize(size, hasAnyPremium(currentOrganization));

    if (!allowedUpload) {
      openRestrictedFileSizeModal({ organization: currentOrganization, maxSizeAllow });
    }

    return { allowedUpload };
  };

  const checkGooglePermission = async (currentDocument: IDocumentBase): Promise<boolean> => {
    const { service, remoteEmail: documentRemoteEmail } = currentDocument;
    if (service === documentStorage.google) {
      const currentRemoteEmail = await googleServices.getCurrentRemoteEmail();
      return documentRemoteEmail === currentRemoteEmail;
    }
    return false;
  };

  const handleErrorSigninGoogle = (error: { message: string }): void => {
    handleLogger({
      params: {
        reason: LOGGER.Service.GOOGLE_API_ERROR,
        message: error.message,
        error,
      },
      isError: true,
    });
  };

  const signInGoogleForTransferFile = (): Promise<boolean> =>
    new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      googleServices
        .implicitSignIn({
          callback: () => {
            resolve(true);
            handleLogger({ params: { message: 'Sign in Google for transfer file' } });
          },
          onError: (error: { message: string }) => {
            resolve(false);
            handleErrorSigninGoogle(error);
          },
        })
        .catch(() => {});
    });

  const handleConfirmValidGoogle = (): void => {
    handleLogger({
      params: {
        message: LOGGER.EVENT.IS_VALID_GOOGLE_PERMISSION,
        reason: LOGGER.Service.GOOGLE_API_INFO,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    googleServices.removeImplicitAccessToken();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    googleServices.implicitSignIn({ onError: handleErrorSigninGoogle }).catch(() => {});
  };

  const modalValidGooglePermission = async ({
    currentDocument,
    setState,
  }: {
    currentDocument: IDocumentBase;
    setState: SetState;
  }): Promise<void> => {
    const { name, remoteEmail: documentRemoteEmail } = currentDocument;
    const remoteEmail = await googleServices.getCurrentRemoteEmail();
    const modalSetting = {
      type: ModalTypes.ERROR,
      title: t('modalShare.canOpenShareLink'),
      message: t('modalShare.messageLogginIncorectAccount', {
        docName: name,
        currentDocumentRemoteEmail: documentRemoteEmail,
        remoteEmail,
      }),
      onCancel: () => setState({ isTransfering: false }),
      confirmButtonTitle: t('modalShare.reSignIn'),
      onConfirm: handleConfirmValidGoogle,
      useReskinModal: true,
    };
    dispatch(actions.openModal(modalSetting));
  };

  const handleConfirmTransferFile = async ({
    afterTransferCallback = async () => {},
    setState = () => {},
    currentDocument,
  }: ParamsHandleConfirmTransferFile): Promise<void> => {
    const { service } = currentDocument;
    setState({ isTransfering: true });

    if (service === documentStorage.google) {
      if (!googleServices.isSignedIn()) {
        const signIn = await signInGoogleForTransferFile();
        if (!signIn) {
          setState({ isShareLinkOpen: false, isTransfering: false });
          return;
        }
      }
      const isValidGooglePermission = await checkGooglePermission(currentDocument);
      if (!isValidGooglePermission) {
        setState(({ isShareLinkOpen }) => ({ isShareLinkOpen: !isShareLinkOpen }));
        await modalValidGooglePermission({ currentDocument, setState });
      }
    }
    if (service !== documentStorage.s3) {
      const { allowedUpload } = handleShareDocNotStoreInLumin(currentDocument);
      if (!allowedUpload) {
        setState({
          isShareLinkOpen: false,
          isInLuminStorage: false,
          isTransfering: false,
        });
        throw new Error(MESSAGE_OVER_FILE_SIZE);
      }
    }
    try {
      const file = await getFileService.getDocument(currentDocument);
      const initialState = {
        isShareLinkOpen: false,
        isInLuminStorage: false,
        isTransfering: false,
      };
      if (!file) {
        setState(initialState);
        return;
      }
      const { linearizedFile } = (await uploadServices.linearPdfFromFiles(file)) as { linearizedFile: File };
      const { error } = await handleTransferFile({
        file: linearizedFile,
        currentDocument,
      });
      if (error) {
        setState(initialState);
        return;
      }
      setState({ isInLuminStorage: true });
      await afterTransferCallback();
      if (isViewer) {
        refetchDocument();
      }
    } catch (error) {
      if ((error as { message?: string })?.message === 'Cancel enter password') {
        toastUtils.error({ message: (error as { message?: string }).message, useReskinToast: true });
        setState({
          isShareLinkOpen: false,
          isInLuminStorage: false,
          isTransfering: false,
        });
        return;
      }
      if (get(error, 'result.error.errors[0].reason') === GoogleErrorCode.CANNOT_DOWNLOAD_FILE) {
        setState({
          isShareLinkOpen: false,
          isInLuminStorage: false,
          isTransfering: false,
        });
        showModal(
          () =>
            handleConfirmTransferFile({
              afterTransferCallback,
              setState,
              currentDocument,
            }),
          () => {}
        );
      }
    } finally {
      setState({ isTransfering: false });
    }
  };

  return { handleConfirmTransferFile };
};

export { useTransferFile };
