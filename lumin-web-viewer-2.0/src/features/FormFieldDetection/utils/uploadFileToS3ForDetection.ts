import documentServices from 'services/documentServices';

import { general } from 'constants/documentType';

export const uploadFileToS3ForDetection = async ({
  presignedUrl,
  documentName,
  fileBuffer,
  headers,
  options,
}: {
  presignedUrl: string;
  documentName: string;
  fileBuffer: Uint8Array;
  headers?: Record<string, string>;
  options: { signal: AbortSignal };
}) =>
  documentServices.uploadFileToS3({
    file: new File([fileBuffer], documentName, { type: general.PDF }),
    presignedUrl,
    headers,
    options,
  });
