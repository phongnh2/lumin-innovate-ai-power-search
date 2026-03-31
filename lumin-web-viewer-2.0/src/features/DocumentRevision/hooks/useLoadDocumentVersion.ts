import isBoolean from 'lodash/isBoolean';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { passwordHandlers } from 'helpers/passwordHandlers';

import { general } from 'constants/documentType';
import { ErrorCode } from 'constants/lumin-common';

import { useDocumentVersioningContext } from './useDocumentVersioningContext';
import { useGetRevisionFile } from './useGetRevisionFile';
import { useOpenExpiredVersionModal } from './useOpenExpiredVersionModal';
import { documentVersioningCache } from '../cache';
import { IDocumentRevision } from '../interface';

export enum LoadDocumentResult {
  Success = 'success',
  Failed = 'failed',
}

export const useLoadDocumentVersion = () => {
  const dispatch = useDispatch();
  const { getRevisionData } = useGetRevisionFile();
  const {
    revisionService,
    activeVersion,
    setActiveVersion,
    currentVersionIdRef,
    currentAnnotsRef,
    passwordToRestoreRef,
  } = useDocumentVersioningContext();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { openExpiredVersionModal } = useOpenExpiredVersionModal();
  const attempt = useRef(0);
  const previousVersionIdRef = useRef<string>();

  const cacheLoadedVersion = async ({ versionId, pdfDoc }: { versionId: string; pdfDoc: Core.PDFNet.PDFDoc }) => {
    try {
      if (currentVersionIdRef.current === versionId) {
        return;
      }

      const arrayBuffer = await pdfDoc.saveMemoryBuffer(window.Core.PDFNet.SDFDoc.SaveOptions.e_linearized);
      await documentVersioningCache.add({
        key: versionId,
        file: new File([arrayBuffer], currentDocument.name, {
          type: general.PDF,
        }),
      });
    } catch (error: unknown) {
      revisionService.loggerError({ error });
    }
  };

  const importAnnotations = async ({
    pdfDoc,
    versionItem,
    annotationData,
  }: {
    pdfDoc: Core.PDFNet.PDFDoc;
    versionItem: IDocumentRevision;
    annotationData: string;
  }) => {
    const xfdfString = currentVersionIdRef.current === versionItem._id ? currentAnnotsRef.current : annotationData;
    if (xfdfString) {
      const fdfDoc = await window.Core.PDFNet.FDFDoc.createFromXFDF(xfdfString);
      await pdfDoc.fdfUpdate(fdfDoc);
    }
  };

  const loadDocumentVersion = async (versionItem: IDocumentRevision): Promise<{ status: LoadDocumentResult }> => {
    try {
      dispatch(actions.setAnnotationsLoaded(false));
      const versionData = await getRevisionData(versionItem);
      if ('error' in versionData && versionData.error === ErrorCode.Common.NOT_FOUND) {
        openExpiredVersionModal();
        return { status: LoadDocumentResult.Failed };
      }
      const { file, annotationData } = versionData;
      if (!file) {
        return { status: LoadDocumentResult.Failed };
      }
      const pdfDoc = await window.Core.PDFNet.PDFDoc.createFromBuffer(await file.arrayBuffer());
      await pdfDoc.initSecurityHandler();
      const securityHandler = await pdfDoc.getSecurityHandler();
      const isEncrypted = await pdfDoc.isEncrypted();
      const isRequiredPassword = securityHandler && (await securityHandler.isUserPasswordRequired());

      if (!isEncrypted || (isBoolean(isRequiredPassword) && !isRequiredPassword)) {
        await importAnnotations({
          pdfDoc,
          versionItem,
          annotationData,
        });
        await core.loadDocument(pdfDoc);
        await cacheLoadedVersion({
          versionId: versionItem._id,
          pdfDoc,
        });
        passwordToRestoreRef.current = undefined;
        return { status: LoadDocumentResult.Success };
      }

      return await new Promise<{ status: LoadDocumentResult }>((resolve) => {
        dispatch(actions.openElement('passwordModal'));
        passwordHandlers.setCancelFn(() => {
          if (previousVersionIdRef.current) {
            setActiveVersion(previousVersionIdRef.current);
          }
          dispatch(actions.setIsLoadingDocument(false));
          dispatch(actions.setAnnotationsLoaded(true));
          resolve({ status: LoadDocumentResult.Failed });
        });

        passwordHandlers.setCheckFn(async (password: string) => {
          const isValidPassword = await pdfDoc.initStdSecurityHandlerUString(password);
          if (!isValidPassword) {
            dispatch(actions.setPasswordAttempts(++attempt.current));
            return;
          }
          await importAnnotations({
            pdfDoc,
            versionItem,
            annotationData,
          });
          await core.loadDocument(pdfDoc, { password });
          await cacheLoadedVersion({
            versionId: versionItem._id,
            pdfDoc,
          });
          passwordToRestoreRef.current = password;
          resolve({ status: LoadDocumentResult.Success });
        });
      });
    } catch (error: unknown) {
      revisionService.loggerError({
        error,
      });
      return { status: LoadDocumentResult.Failed };
    }
  };

  const onDocumentVersionClick = async (versionItem: IDocumentRevision) => {
    if (versionItem._id !== activeVersion) {
      dispatch(actions.setIsLoadingDocument(true));
      previousVersionIdRef.current = activeVersion;
      setActiveVersion(versionItem._id);
      await loadDocumentVersion(versionItem);
    }
  };

  return {
    loadDocumentVersion,
    onDocumentVersionClick,
  };
};
