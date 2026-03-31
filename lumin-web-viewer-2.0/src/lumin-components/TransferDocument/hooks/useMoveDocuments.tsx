/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { differenceBy, get } from 'lodash';
import React, { Dispatch, ReactElement } from 'react';
import { Trans } from 'react-i18next';

import { useEnableWebReskin, usePaymentUrlDestination, useStrictDownloadGooglePerms, useTranslation } from 'hooks';

import { documentServices, uploadServices } from 'services';

import { toastUtils, getFile, eventTracking } from 'utils';
import errorExtract from 'utils/error';
import errorInterceptor from 'utils/errorInterceptor';

import { documentStorage, DOCUMENT_TYPE, DocumentStorage } from 'constants/documentConstants';
import { ErrorCode, GoogleErrorCode } from 'constants/errorCode';
import UserEventConstants from 'constants/eventConstants';
import { MAXIMUM_FILE_SIZE } from 'constants/lumin-common';
import {
  ERROR_MESSAGE_DOCUMENT,
  ERROR_MESSAGE_RESTRICTED_ACTION,
  ERROR_MESSAGE_TYPE,
  ERROR_MESSAGE_UNKNOWN_ERROR,
  getUploadOverFileSizeError,
} from 'constants/messages';
import { Plans } from 'constants/plan';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { IUser } from 'interfaces/user/user.interface';

import { Destination } from '../interfaces/TransferDocument.interface';
import { CustomLink } from '../TransferDocument.styled';

type TPayLoadGetPropsForTrans = {
  i18nKey: string;
  components: Record<string, ReactElement>;
  values: Record<string, unknown>;
};

type MoveDocumentsProps = {
  destination: Destination;
  setOpenConfirmModal: Dispatch<{ isOpen: boolean; target?: IOrganization | IUser }>;
  setError: Dispatch<string | JSX.Element>;
  selectedTarget: IOrganization;
};

type MoveDocumentsParams = {
  documents: IDocumentBase[];
  isNotify: boolean;
  onClose: () => void;
  setIsMoving: Dispatch<boolean>;
};

export const useMoveDocuments = ({
  destination,
  setOpenConfirmModal,
  setError = () => {},
  selectedTarget,
}: MoveDocumentsProps): {
  moveDocuments: ({ documents, isNotify, onClose }: MoveDocumentsParams) => Promise<void>;
} => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const { showModal } = useStrictDownloadGooglePerms();
  const { _id: destinationId, type, belongsTo, name } = destination;
  const destinationType = type?.toUpperCase();
  const isMovetoFolder = type === DOCUMENT_TYPE.FOLDER;
  const isFolderInPersonal = isMovetoFolder && belongsTo.type.toUpperCase() === DOCUMENT_TYPE.PERSONAL;
  const isMoveToPersonal = destinationType === DOCUMENT_TYPE.PERSONAL;

  const { paymentUrl, isManager, contentUrl, orgDestination } = usePaymentUrlDestination({ selectedTarget });

  const getPropsForTrans = (documentIds: string[], perDocErrors: string[]): TPayLoadGetPropsForTrans => {
    const totalDocumentsMovedSuccessful = documentIds.length - perDocErrors.length;
    const isMultipleDocuments = totalDocumentsMovedSuccessful > 1;

    const props = { components: { b: <b className="bold" /> } };

    switch (destinationType) {
      case DOCUMENT_TYPE.ORGANIZATION_TEAM:
      case DOCUMENT_TYPE.FOLDER:
        return {
          ...props,
          i18nKey: isMultipleDocuments ? 'modalMove.moveDocsToSpaceOrFolder' : 'modalMove.moveDocToSpaceOrFolder',
          values: { name, total: totalDocumentsMovedSuccessful },
        };
      case DOCUMENT_TYPE.ORGANIZATION:
        return {
          ...props,
          i18nKey: isMultipleDocuments ? 'modalMove.moveDocsToWorkspace' : 'modalMove.moveDocToWorkspace',
          values: { name, total: totalDocumentsMovedSuccessful },
        };
      case DOCUMENT_TYPE.PERSONAL: {
        return {
          ...props,
          i18nKey: isMultipleDocuments
            ? 'modalMove.moveDocsToPersonalWorkspace'
            : 'modalMove.moveDocToPersonalWorkspace',
          values: { total: totalDocumentsMovedSuccessful, name },
        };
      }
      default:
        return null;
    }
  };

  const getMessageSuccessToast = (documentIds: string[], perDocErrors: string[]): JSX.Element => {
    const props = getPropsForTrans(documentIds, perDocErrors);
    return <Trans {...props} />;
  };

  const moveThirdPartyDocument = ({
    docIds,
    isNotify,
    file = null,
  }: {
    docIds: string[];
    isNotify: boolean;
    file?: File;
  }): Promise<any> => {
    if (isMovetoFolder) {
      return documentServices.moveDocumentsToFolder({
        documentIds: docIds,
        folderId: destinationId,
        isNotify,
        file,
        documentName: file?.name,
      });
    }
    return documentServices.moveDocuments({
      documentIds: docIds,
      destinationType,
      destinationId,
      isNotify,
      file,
      documentName: file?.name,
    });
  };

  const moveDocumentNotLuminService = async ({
    document,
    isNotify,
  }: {
    document: IDocumentBase;
    isNotify: boolean;
  }): Promise<any> => {
    const file = await getFile(document);
    let linearizedFile = null;
    if (file) {
      const fileData = await uploadServices.linearPdfFromFiles(file);
      linearizedFile = fileData.linearizedFile;
    }
    await moveThirdPartyDocument({ docIds: [document._id], isNotify, file: linearizedFile }).then(() => {
      if (document.service === documentStorage.google) {
        eventTracking(UserEventConstants.EventType.CONVERT_FILE_TO_LUMIN, {
          LuminFileId: document._id,
          originalStorage: DocumentStorage.GOOGLE,
          action: 'move',
        }).finally(() => {});
      }
    });
  };

  const handleMoveDocumentsError = (err: any, documentsNeedToConvert: IDocumentBase[]): void => {
    const { code } = errorExtract.extractGqlError(err);
    const message = errorInterceptor.getDocumentErrorMessage(err);
    if (code === ErrorCode.Common.RESTRICTED_ACTION) {
      setError(ERROR_MESSAGE_RESTRICTED_ACTION);
      return;
    }
    if (code === ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT) {
      setError(
        <>
          {t('errorMessage.hitDocStack')}{' '}
          {isManager ? (
            <CustomLink to={paymentUrl} data-reskin={isEnableReskin}>
              {contentUrl}
            </CustomLink>
          ) : (
            contentUrl
          )}
        </>
      );
      return;
    }
    if (documentsNeedToConvert.length) {
      const errorMessage =
        message !== ERROR_MESSAGE_UNKNOWN_ERROR ? message : t(ERROR_MESSAGE_DOCUMENT.MOVE_DOCUMENT_FAILED);
      toastUtils.error({
        message: errorMessage,
      });
      return;
    }
    if (message === ERROR_MESSAGE_UNKNOWN_ERROR) {
      toastUtils.error({
        message: t(ERROR_MESSAGE_DOCUMENT.MOVE_DOCUMENT_FAILED),
      });
      return;
    }
    setError(message);
  };

  const handleMoveDocument = async ({
    documentIds,
    documentsNeedToConvert,
    documentCanMove,
    isNotify,
    onClose,
    setIsMoving,
  }: {
    documentIds: string[];
    documentsNeedToConvert: IDocumentBase[];
    documentCanMove: IDocumentBase[];
    isNotify: boolean;
    onClose: () => void;
    setIsMoving: Dispatch<boolean>;
  }): Promise<void> => {
    setIsMoving(true);
    if (documentsNeedToConvert.length) {
      toastUtils.info({
        message: t('modalMove.toastThirdPartyDocumentMoving'),
        duration: 10000,
      });
    }

    const perDocErrors = [] as string[];
    try {
      if (documentCanMove.length) {
        const docIds = documentCanMove.map((doc) => doc._id);
        await moveThirdPartyDocument({ docIds, isNotify });
      }
      if (documentsNeedToConvert.length) {
        // eslint-disable-next-line no-restricted-syntax
        for (const document of documentsNeedToConvert) {
          try {
            // eslint-disable-next-line no-await-in-loop
            await moveDocumentNotLuminService({ document, isNotify });
          } catch (errorPerDocument) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            handleErrors({
              documentIds,
              documentsNeedToConvert,
              documentCanMove,
              isNotify,
              onClose,
              setIsMoving,
              err: errorPerDocument,
              perDocErrors,
              document,
            });
          }
        }
      }
      if (documentIds.length > perDocErrors.length) {
        toastUtils.success({
          message: getMessageSuccessToast(documentIds, perDocErrors),
          useReskinToast: true,
        });
      }

      if (!perDocErrors.length) {
        onClose();
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      handleErrors({
        documentIds,
        documentsNeedToConvert,
        documentCanMove,
        isNotify,
        onClose,
        setIsMoving,
        err,
        perDocErrors,
      });
    } finally {
      setIsMoving(false);
      setOpenConfirmModal({ isOpen: false, target: null });
    }
  };

  const handleErrors = ({
    documentIds,
    documentsNeedToConvert,
    documentCanMove,
    isNotify,
    onClose,
    setIsMoving,
    err,
    perDocErrors,
    document,
  }: {
    documentIds: string[];
    documentsNeedToConvert: IDocumentBase[];
    documentCanMove: IDocumentBase[];
    isNotify: boolean;
    onClose: () => void;
    setIsMoving: Dispatch<boolean>;
    err: any;
    perDocErrors: string[];
    document?: IDocumentBase;
  }): void => {
    perDocErrors.push(err.message);
    if (errorExtract.isGraphError(err)) {
      handleMoveDocumentsError(err, documentsNeedToConvert);
    } else {
      if (get(err, 'result.error.errors[0].reason') === GoogleErrorCode.CANNOT_DOWNLOAD_FILE) {
        showModal(
          () =>
            handleMoveDocument({
              documentIds,
              documentsNeedToConvert,
              documentCanMove,
              isNotify,
              onClose,
              setIsMoving,
            }),
          () => {}
        );
        return;
      }

      if (perDocErrors.length > 1) {
        setError(t('modalMove.movingDocumentsFailed', { total: perDocErrors.length }));
        return;
      }
      setError(
        (err.message === ERROR_MESSAGE_TYPE.PDF_CANCEL_PASSWORD
          ? t('modalMove.cancelPassword', { fileName: document?.name })
          : err.message) as string
      );
    }
  };

  const getMaxSizeCanMove = (): number => {
    // if orgDestination is empty then moving to professional user
    if (!orgDestination) {
      return MAXIMUM_FILE_SIZE.PREMIUM_PLAN;
    }

    const { payment } = orgDestination;
    const { type: paymentType } = payment || {};
    const isFreeOrg = paymentType === Plans.FREE;

    return isFreeOrg ? MAXIMUM_FILE_SIZE.FREE_PLAN : MAXIMUM_FILE_SIZE.PREMIUM_PLAN;
  };

  const hasReachedFileSizeLimit = (document: IDocumentBase, maxSizeCanMove: number) => {
    const hasUploadedFromThirdPartyStorage = [
      documentStorage.dropbox,
      documentStorage.google,
      documentStorage.onedrive,
    ].includes(document.service);
    if (hasUploadedFromThirdPartyStorage && (isMoveToPersonal || isFolderInPersonal)) {
      return false;
    }
    return document.size / 1024 / 1024 > maxSizeCanMove;
  };

  const checkFileSizeBeforeSubmit = (
    documents: IDocumentBase[]
  ): { documentHasSizeRestricted: IDocumentBase; maxSizeCanMove: number } => {
    const maxSizeCanMove = getMaxSizeCanMove();
    const documentHasSizeRestricted = documents.find((_doc) => hasReachedFileSizeLimit(_doc, maxSizeCanMove));

    return { documentHasSizeRestricted, maxSizeCanMove };
  };

  const moveDocuments = async ({ documents, isNotify, onClose, setIsMoving }: MoveDocumentsParams): Promise<void> => {
    const documentsNeedToConvert = documents.filter(
      (doc) => !isFolderInPersonal && !isMoveToPersonal && doc.service !== documentStorage.s3
    );
    const documentCanMove = differenceBy(documents, documentsNeedToConvert, '_id');
    const documentIds = documents.map((doc) => doc._id);

    const { documentHasSizeRestricted, maxSizeCanMove } = checkFileSizeBeforeSubmit(documents);

    if (documentHasSizeRestricted) {
      setIsMoving(false);
      setOpenConfirmModal({ isOpen: false, target: null });
      setError(getUploadOverFileSizeError(maxSizeCanMove));
      return;
    }

    await handleMoveDocument({
      documentIds,
      documentsNeedToConvert,
      documentCanMove,
      isNotify,
      onClose,
      setIsMoving,
    });
  };

  return {
    moveDocuments,
  };
};
