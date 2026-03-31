import isEmpty from 'lodash/isEmpty';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import actions from 'actions';
import core from 'core';

import { pageNavigationKeyDownHandler } from 'event-listeners/pageNavigationKeyDownHandler';

import { passwordHandlers } from 'helpers/passwordHandlers';

import { manipulation, toastUtils } from 'utils';
import fileUtils from 'utils/file';
import { getFileOptions } from 'utils/getFileService';
import { makeCancelable } from 'utils/makeCancelable';
import mime from 'utils/mime-types';

import viewerHelper from 'features/Document/helpers';
import { GetRemoteDocumentDataPayload } from 'features/MultipleMerge/types';

import fitMode from 'constants/fitMode';
import { supportedOfficeExtensions } from 'constants/supportedFiles';
import { TOOLS_NAME } from 'constants/toolsName';

import { IUser } from 'interfaces/user/user.interface';

import useZoomPage from './useZoomPage';

type Props = {
  documentData: GetRemoteDocumentDataPayload;
  documentElement: React.RefObject<HTMLDivElement>;
  currentUser: IUser;
  scrollViewElement: React.RefObject<HTMLDivElement>;
  isSuccessDocumentData: boolean;
  onClose: () => void;
};

const usePreviewTemplate = ({
  documentData,
  documentElement,
  currentUser,
  scrollViewElement,
  isSuccessDocumentData,
  onClose,
}: Props) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [isLoadingDocument, setIsLoadingDocument] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { zoomLevel, setZoomLevel, onZoomAction } = useZoomPage(documentElement.current);

  const onPageNumberUpdated = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const onDocumentLoaded = async () => {
    setTotalPages(core.getTotalPages());
    setZoomLevel(Math.round(core.getZoom() * 100));
    // Apply annotations and form fields to the document after it's loaded
    const newAnnotations = documentData?.annotations;
    if (newAnnotations && newAnnotations.length > 0) {
      const { promise: importAnnotPromise } = makeCancelable(() =>
        Promise.all(
          newAnnotations.map((annotation) => {
            if (annotation && annotation.xfdf) {
              return viewerHelper.updateImportedAnnot({
                row: annotation,
                currentDocument: documentData?.document,
                currentUser,
                callback: () => { },
              });
            }
            return Promise.resolve(); // Return a resolved Promise for non-matching annoÍtations
          })
        )
      );
      await importAnnotPromise();
    }

    const newFields = documentData?.fields;
    if (newFields && newFields.length > 0) {
      const { promise: promiseImportFormFields } = makeCancelable(() =>
        Promise.allSettled(newFields.map((field) => viewerHelper.importFieldData(field)))
      );
      await promiseImportFormFields();
    }

    const dbManipulations = documentData?.document?.manipulationStep;
    if (dbManipulations && dbManipulations.length > 0) {
      // eslint-disable-next-line no-restricted-syntax
      for (const manipStep of dbManipulations) {
        // eslint-disable-next-line no-await-in-loop
        await manipulation.executeManipulationFromData({
          data: manipStep,
          thumbs: [],
          needUpdateThumbnail: false,
        });
      }
    }

    setIsLoadingDocument(false);
  };

  const onBeforeDocumentLoaded = () => {
    // if we are opening an password-protected pdf,
    // this event will only be trigger after we enter the correct password, so it's safe to close this modal here
    dispatch(actions.closeElement('passwordModal'));
  };

  const getDocumentInstance = async () => {
    let loadAsPDF = false;
    setIsLoadingDocument(true);

    const extensionByName = (fileUtils as { getExtension(name: string): string }).getExtension(
      documentData?.document?.name ?? ''
    );
    const extensionByMime = (mime as { extension(mimeType: string): string }).extension(
      documentData?.document?.mimeType ?? ''
    );
    const fileType = extensionByMime || extensionByName;
    if (supportedOfficeExtensions.includes(fileType)) {
      loadAsPDF = true;
    }

    await core.setUpWorker();
    core.setScrollViewElement(scrollViewElement.current);
    core.setViewerElement(documentElement.current);
    core.enableAnnotations();
    core.enableReadOnlyMode();
    core.setFitMode(fitMode.FitWidth);
    const { src } = await getFileOptions(documentData?.document, {});

    let attempt = 0;
    const transformPasswordOption = ({ password }: { password: string }) => {
      // a boolean that is used to prevent infinite loop when wrong password is passed as an argument
      let passwordChecked = false;

      return (checkPassword: (password: string) => void) => {
        passwordHandlers.setCancelFn(() => {
          toastUtils.error({
            message: t('toast.canceledPasswordEntry'),
          });
          onClose();
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
    core.loadDocument(src, {
      password: transformPasswordOption({ password: '' }),
      loadAsPDF,
    });
    core.addEventListener('pageNumberUpdated', onPageNumberUpdated);
    core.addEventListener('documentLoaded', onDocumentLoaded);
    core.docViewer.addEventListener('beforeDocumentLoaded', onBeforeDocumentLoaded);
    core.setToolMode(TOOLS_NAME.PAN);
  };

  useEffect(() => {
    if (!isSuccessDocumentData) {
      return;
    }

    getDocumentInstance().catch((error) => console.error('Error getting document instance', error));
    // eslint-disable-next-line consistent-return
    return () => {
      if (!isEmpty(core.docViewer)) {
        core.docViewer.dispose();
        core.getDocument()?.unloadResources();
        core.closeDocument();
        core.removeEventListener('pageNumberUpdated', onPageNumberUpdated);
        core.removeEventListener('documentLoaded', onDocumentLoaded);
        core.docViewer.removeEventListener('beforeDocumentLoaded', onBeforeDocumentLoaded);
        setIsLoadingDocument(true);
      }
    };
  }, [isSuccessDocumentData, documentData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      pageNavigationKeyDownHandler(e);
    };
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  return {
    isLoadingDocument,
    currentPage,
    totalPages,
    zoomLevel,
    onZoomAction,
  };
};

export default usePreviewTemplate;