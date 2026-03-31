import { general, images, office } from 'constants/documentType';
import { DownloadType } from 'constants/downloadPdf';

export const mappingDownloadTypeWithMimeType = (mimeType: string) => {
  switch (mimeType) {
    case office.DOCX:
      return DownloadType.DOCX;
    case office.XLSX:
      return DownloadType.XLSX;
    case office.PPTX:
      return DownloadType.PPTX;
    case images.JPG:
      return DownloadType.JPG;
    case images.PNG:
      return DownloadType.PNG;
    case general.PDF:
    default:
      return DownloadType.PDF;
  }
};
