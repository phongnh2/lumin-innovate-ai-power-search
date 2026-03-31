import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { CONVERT_TO_ANOTHER_TYPE_PAGE_LIMIT } from 'constants/customConstant';
import { general, images, office } from 'constants/documentType';
import { DownloadType } from 'constants/downloadPdf';
import { CONVERT_TO_ANOTHER_TYPE_SIZE_LIMIT } from 'constants/fileSize';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IUser } from 'interfaces/user/user.interface';

import { useShallowSelector } from './useShallowSelector';

export const useConvertToOfficeFile = () => {
  const currentUser = useShallowSelector<IUser>(selectors.getCurrentUser);
  const totalPages = useSelector<unknown, number>(selectors.getTotalPages);
  const officeDownloadTypes = [DownloadType.DOCX, DownloadType.XLSX, DownloadType.PPTX];

  const currentDocument = useShallowSelector<IDocumentBase>(selectors.getCurrentDocument);
  if (!currentDocument) {
    return {
      officeDownloadTypes,
      canConvertToOfficeFile: false,
    };
  }
  const { size, mimeType, isSystemFile, temporaryEdit } = currentDocument;

  const acceptableMimeTypes = [general.PDF, office.DOCX, office.XLSX, office.PPTX, images.JPG, images.PNG];

  const isValidFileType = acceptableMimeTypes.includes(mimeType);
  const isValidFileSize = size < CONVERT_TO_ANOTHER_TYPE_SIZE_LIMIT;
  const isValidPageNumber = totalPages < CONVERT_TO_ANOTHER_TYPE_PAGE_LIMIT;

  const fileValidation = isValidFileSize && isValidFileType && isValidPageNumber && !isSystemFile && !temporaryEdit;

  return {
    officeDownloadTypes,
    canConvertToOfficeFile: Boolean(currentUser && currentDocument && fileValidation),
  };
};
