import { store } from 'store';

import { selectors, setIsExceedQuotaExternalStorage } from 'features/QuotaExternalStorage/slices';

import { STORAGE_TYPE } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

interface QuotaCheckResult {
  isExceeded: boolean;
}

/**
 * Check if the file size change exceeds the external storage quota
 * @param {File} fileData - The file data to check
 * @param {IDocumentBase} document - The document object
 * @returns {QuotaCheckResult} - Returns quota check result with file size change and remaining quota
 */
export const checkQuotaExternalStorage = (fileData: File, document: IDocumentBase): QuotaCheckResult => {
  const externalQuota = selectors.getExternalQuotaSpace(store.getState());
  const fileSizeChange = fileData.size - (document.size ?? 0);
  const isExceeded = fileSizeChange > externalQuota.remaining;

  return {
    isExceeded,
  };
};

/**
 * Check quota and dispatch exceed quota action if needed
 * @param {File} fileData - The file data to check
 * @param {IDocumentBase} document - The document object
 * @returns {boolean} - Returns true if quota is exceeded, false otherwise
 */
export const checkAndDispatchQuotaExceeded = (fileData: File, document: IDocumentBase): boolean => {
  const quotaCheck = checkQuotaExternalStorage(fileData, document);
  if (document.service === STORAGE_TYPE.ONEDRIVE || document.service === STORAGE_TYPE.GOOGLE) {
    return false;
  }

  if (quotaCheck.isExceeded) {
    store.dispatch(setIsExceedQuotaExternalStorage(true));
  }

  return quotaCheck.isExceeded;
};
