import { useEffect, useState } from 'react';

import { useTranslation } from 'hooks';

import { documentServices } from 'services';

import { toastUtils } from 'utils';
import errorExtract from 'utils/error';

import { ErrorCode } from 'constants/errorCode';
import { ModalTypes } from 'constants/lumin-common';

export const useGetTargetRequestAccess = (documentId, requesterId) => {
  const [requestData, setRequestData] = useState({});
  const { t } = useTranslation();
  useEffect(() => {
    const getTargetRequest = async (documentId, requesterId) => {
      try {
        const targetRequest = await documentServices.getRequestAccessDocById(documentId, requesterId);
        if (targetRequest) {
          setRequestData(targetRequest);
        }
      } catch (error) {
        const { code: errorCode } = errorExtract.extractGqlError(error);
        if (errorCode === ErrorCode.Document.REQUEST_ACCESS_NOT_FOUND) {
          toastUtils.openToastMulti({
            type: ModalTypes.INFO,
            message: t('modalShare.requestWasProcessed'),
          });
          setRequestData({});
        }
      }
    };
    if (documentId && requesterId) {
      getTargetRequest(documentId, requesterId);
    }
  }, [documentId, requesterId]);
  return requestData;
};
