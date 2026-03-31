import { convertToImages } from 'helpers/convertToImages';
import convertToOfficeFile from 'helpers/convertToOfficeFile';

import { getLinearizedDocumentFile } from 'utils/getFileService';

import { office } from 'constants/documentType';
import { DownloadType } from 'constants/downloadPdf';

const IMAGE_DOWNLOAD_TYPES = [DownloadType.PNG, DownloadType.JPG];
const getFile = async (data: {
  name: string;
  downloadType: string;
  file?: File;
  signal?: AbortSignal;
  flattenPdf?: boolean;
}): Promise<Blob> => {
  const { name, downloadType = DownloadType.PDF, file, signal, flattenPdf } = data;
  if (file) {
    return file;
  }

  if (!downloadType || downloadType === DownloadType.PDF) {
    return getLinearizedDocumentFile(name, { flattenPdf }, { signal });
  }
  if (IMAGE_DOWNLOAD_TYPES.includes(downloadType)) {
    return convertToImages(downloadType);
  }
  const fileBuffer = await convertToOfficeFile(downloadType);
  switch (downloadType) {
    case DownloadType.DOCX:
      return new File([fileBuffer], name, { type: office.DOCX });
    case DownloadType.XLSX:
      return new File([fileBuffer], name, { type: office.XLSX });
    case DownloadType.PPTX:
      return new File([fileBuffer], name, { type: office.PPTX });
    default:
      throw new Error('Invalid download type');
  }
};

export default getFile;
