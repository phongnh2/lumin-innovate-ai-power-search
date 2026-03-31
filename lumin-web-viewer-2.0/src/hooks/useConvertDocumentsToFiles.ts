import { useDispatch } from 'react-redux';

import actions from 'actions';

import useAuthenticateService from 'luminComponents/DocumentList/hooks/useAuthenticateService';

import logger from 'helpers/logger';

import fileUtils from 'utils/file';
import { isReAuthorizableError } from 'utils/thirdPartyAuthError';

import useHandleCheckPermission from 'features/MultipleDownLoad/hooks/useHandleCheckPermission';
import { RemoteDocumentItem } from 'features/MultipleMerge/core/documentItem/remote';
import { UploadStatus, UploadDocumentError } from 'features/MultipleMerge/enum';
import { PdfProcessor } from 'features/PdfProcessor/pdfProcessor';

import { DataElements } from 'constants/dataElement';
import { documentStorage } from 'constants/documentConstants';
import { general } from 'constants/documentType';

import { IDocumentBase } from 'interfaces/document/document.interface';

export const useConvertDocumentsToFiles = () => {
  const dispatch = useDispatch();
  const { checkDriveDocument, checkOneDriveDocument, checkDropboxDocument } = useHandleCheckPermission();
  const { handleCheckError } = useAuthenticateService();

  const handleReAuthorization = async ({
    document,
    error,
    callback,
  }: {
    document: IDocumentBase;
    error: Error;
    callback: () => Promise<void>;
  }): Promise<void> => {
    await new Promise((resolve, reject) => {
      handleCheckError(error, {
        documents: [document],
        onSuccess: resolve,
        executer: async (_docs: IDocumentBase[], onSuccessCallback: () => void) => {
          try {
            await callback();
            onSuccessCallback();
          } catch (retryError) {
            reject(retryError);
          }
        },
        setLoading: () => {},
        onCancel: () => reject(new Error('User cancelled re-authorization')),
      });
    });
  };

  const checkPermission = async (document: IDocumentBase): Promise<void> => {
    try {
      const { service } = document;
      switch (service) {
        case documentStorage.google:
          await checkDriveDocument(document);
          break;
        case documentStorage.onedrive:
          await checkOneDriveDocument(document);
          break;
        case documentStorage.dropbox:
          await checkDropboxDocument({ document });
          break;
        default:
          break;
      }
    } catch (error) {
      if (error instanceof Error && isReAuthorizableError(error)) {
        await handleReAuthorization({
          document,
          error,
          callback: async () => {
            await checkPermission(document);
          },
        });
      } else {
        throw new Error(`Permission check failed for document: ${document.name} - ${(error as Error).message}`);
      }
    }
  };

  const getFileFromDocument = async ({
    document,
    abortSignal,
  }: {
    document: IDocumentBase;
    abortSignal?: AbortSignal;
  }): Promise<File> => {
    await checkPermission(document);

    const documentItem = new RemoteDocumentItem({
      _id: document._id,
      abortSignal,
      name: document.name,
      remoteId: document._id,
      onError: () => {},
      onLoadDocumentComplete: () => {
        dispatch(actions.closeElement(DataElements.PASSWORD_MODAL));
        dispatch(actions.setPasswordProtectedDocumentName(''));
      },
      onSetupPasswordHandler: ({ attempt, name }) => {
        dispatch(actions.openElement(DataElements.PASSWORD_MODAL));
        dispatch(actions.setPasswordProtectedDocumentName(name));
        dispatch(actions.setPasswordAttempts(attempt));
      },
      onCancelPassword: () => {
        dispatch(actions.closeElement(DataElements.PASSWORD_MODAL));
        dispatch(actions.setPasswordProtectedDocumentName(''));
      },
    });

    const {
      fields,
      buffer,
      status,
      metadata,
      signedUrls,
      annotations,
      document: doc,
      outlines: arrOutline,
    } = await documentItem.getDocumentData({ loadAsPDF: true });

    if (status === UploadStatus.FAILED && metadata?.errorCode === UploadDocumentError.FILE_ENCRYPTED) {
      throw new Error('Password entry cancelled');
    }

    if (!buffer) {
      throw new Error('Failed to load document');
    }

    const pdfProcessor = new PdfProcessor(doc, annotations, fields, arrOutline, signedUrls, buffer);
    const pdfDoc = await pdfProcessor.process();
    const arr = await pdfDoc.saveMemoryBuffer(window.Core.PDFNet.SDFDoc.SaveOptions.e_linearized);
    const fileName = fileUtils.convertExtensionToPdf(document.name);

    return new File([new Uint8Array(arr)], fileName, {
      type: general.PDF,
    });
  };

  const convertDocumentsToFiles = async ({
    documents,
    abortSignal,
  }: {
    documents: IDocumentBase[];
    abortSignal?: AbortSignal;
  }): Promise<File[]> => {
    try {
      return await documents.reduce(async (promises, document) => {
        const processedFiles = await promises;

        const file = await getFileFromDocument({ document, abortSignal });

        processedFiles.push(file);

        return processedFiles;
      }, Promise.resolve([] as File[]));
    } catch (error) {
      logger.logError({
        error: error as Error,
        message: 'Failed to convert documents to files',
      });
      throw error;
    }
  };

  return { convertDocumentsToFiles };
};
