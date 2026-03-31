import { saveAs } from 'file-saver';
import { t } from 'i18next';

import actions from 'actions';
import core from 'core';

import { isIE } from 'helpers/device';
import exportAnnotations from 'helpers/exportAnnotations';
import fireEvent from 'helpers/fireEvent';
import warningPDFTronErrors from 'helpers/warningPDFTronErrors';

import { file as fileUtils, getFileService } from 'utils';
import documentEvent from 'utils/Factory/EventCollection/DocumentEventCollection';

import { COMPRESS_RESOLUTION, COMPRESS_TIMEOUT_ERROR } from 'features/CompressPdf/constants';
import { createCompressedSuffix } from 'features/CompressPdf/utils';

import { AnimationBanner } from 'constants/banner';
import { CUSTOM_EVENT } from 'constants/customEvent';
import dataElements from 'constants/dataElement';
import { general, images, office } from 'constants/documentType';
import { DownloadType } from 'constants/downloadPdf';
import { ConversionError } from 'constants/errorCode';
import { LOGGER, ModalTypes } from 'constants/lumin-common';
import { ERROR_TIMEOUT_MESSAGE } from 'constants/messages';

import { convertToImages } from './convertToImages';
import convertToOfficeFile from './convertToOfficeFile';

const getFileBufferAndType = async (downloadType, xfdfString, options = {}) => {
  const { flattenPdf } = options;
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (downloadType) {
    case DownloadType.DOCX:
      return { fileBuffer: await convertToOfficeFile(), mimeType: office.DOCX };
    case DownloadType.PNG:
      return { fileBuffer: await convertToImages(downloadType), mimeType: images.PNG };
    case DownloadType.JPG:
      return { fileBuffer: await convertToImages(downloadType), mimeType: images.JPG };
    case DownloadType.XLSX:
      return { fileBuffer: await convertToOfficeFile(downloadType), mimeType: office.XLSX };
    case DownloadType.PPTX:
      return { fileBuffer: await convertToOfficeFile(downloadType), mimeType: office.PPTX };
    default:
      return {
        fileBuffer: await getFileService.getFileDataByPDFNet({ xfdf: xfdfString, flattenPdf }),
        mimeType: general.PDF,
      };
  }
};

const createFileForDownload = ({ fileBuffer, fileName, mimeType }) =>
  isIE ? new Blob([fileBuffer], { type: mimeType }) : new File([fileBuffer], fileName, { type: mimeType });

const isDownloadImageType = (type) => [DownloadType.JPG, DownloadType.PNG].includes(type);

const handleDownloadImages = async ({ downloadName, downloadType, fileType, savedLocation }) => {
  const imageConverted = await convertToImages(downloadType);
  const convertedDownloadName = imageConverted.type === general.ZIP ? `${downloadName}.zip` : downloadName;
  saveAs(imageConverted, convertedDownloadName);
  fireEvent('finishedSavingPDF');
  documentEvent.downloadDocumentSuccess({ fileType, savedLocation });
};

const handleDownloadPdf = async ({ file, downloadName, currentFileSize, compressLevel, compressPdfCallback }) => {
  if (compressLevel === COMPRESS_RESOLUTION.NONE) {
    saveAs(file, downloadName);
    return;
  }

  const fileUrl = URL.createObjectURL(file);
  const compressedFile = await compressPdfCallback({ fileUrl });
  const isCompressedSmaller = compressedFile.size < currentFileSize;
  const fileToDownload = isCompressedSmaller ? compressedFile : file;
  saveAs(fileToDownload, createCompressedSuffix(downloadName));
};

const downloadFile = async ({
  downloadName,
  downloadType,
  xfdfString,
  fileType,
  savedLocation,
  compressLevel,
  compressPdfCallback,
  currentFileSize,
  flattenPdf,
}) => {
  if (isDownloadImageType(downloadType)) {
    await handleDownloadImages({ downloadName, downloadType, fileType, savedLocation });
    return;
  }

  const { fileBuffer, mimeType } = await getFileBufferAndType(downloadType, xfdfString, { flattenPdf });
  if (!fileBuffer) {
    throw new Error('No file buffer');
  }

  const file = createFileForDownload({ fileBuffer, downloadName, mimeType });
  await handleDownloadPdf({ file, downloadName, currentFileSize, compressLevel, compressPdfCallback });

  fireEvent('finishedSavingPDF');
  documentEvent.downloadDocumentSuccess({ fileType, savedLocation, flattenPdf });
};

export default async (dispatch, options = {}) => {
  const {
    filename = core.getDocument()?.getFilename() || 'document',
    includeAnnotations = true,
    externalURL,
    downloadType = DownloadType.PDF,
    compressLevel = COMPRESS_RESOLUTION.NONE,
    compressPdfCallback = () => {},
    currentFileSize,
    flattenPdf,
  } = options;

  const annotationsPromise =
    includeAnnotations && !options.xfdfString ? exportAnnotations() : Promise.resolve('<xfdf></xfdf>');

  return annotationsPromise
    .then(async (xfdfString) => {
      const downloadName = fileUtils.convertFileNameToDownload(filename, downloadType);

      if (externalURL) {
        const downloadIframe = document.getElementById('download-iframe') || document.createElement('iframe');
        downloadIframe.width = 0;
        downloadIframe.height = 0;
        downloadIframe.id = 'download-iframe';
        downloadIframe.src = null;
        document.body.appendChild(downloadIframe);
        downloadIframe.src = externalURL;
        fireEvent(CUSTOM_EVENT.FINISHED_SAVING_PDF);
      } else {
        await downloadFile({
          downloadName,
          downloadType,
          xfdfString: options.xfdfString || xfdfString,
          fileType: downloadType,
          savedLocation: 'device',
          compressLevel,
          compressPdfCallback,
          currentFileSize,
          flattenPdf,
        });
      }
    })
    .catch((error) => {
      if (error?.name === ConversionError.TIMEOUT_ERROR || error?.message === COMPRESS_TIMEOUT_ERROR) {
        dispatch(
          actions.openViewerModal({
            type: ModalTypes.ERROR,
            title: t(ERROR_TIMEOUT_MESSAGE.REQUEST_TIMEOUT),
            message: t(ERROR_TIMEOUT_MESSAGE.CHECK_CONNECTION),
            confirmButtonTitle: t('common.gotIt'),
            isFullWidthButton: true,
            disableBackdropClick: true,
            cancelButtonTitle: '',
            onConfirm: () => {
              dispatch(actions.closeModal());
            },
          })
        );
      } else {
        warningPDFTronErrors({ error, service: LOGGER.Service.DOWNLOAD_DOCUMENT_ERROR });
      }
    })
    .finally(() => {
      dispatch(actions.closeElement(dataElements.VIEWER_LOADING_MODAL));
      dispatch(actions.resetViewerLoadingModal());
      dispatch(actions.setShouldShowRating(AnimationBanner.SHOW));
      dispatch(actions.setShouldShowInviteCollaboratorsModal(true));
    });
};
