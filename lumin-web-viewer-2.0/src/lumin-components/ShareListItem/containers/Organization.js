import { useState } from 'react';

import { useTranslation } from 'hooks';

import { documentServices } from 'services';

import logger from 'helpers/logger';

import { errorUtils, toastUtils } from 'utils';

import { ErrorCode } from 'constants/errorCode';
import { SUCCESS_MESSAGE } from 'constants/messages';

const Organization = ({ currentDocument, member, children, reloadRequestList, openHitDocStackModal }) => {
  const { t } = useTranslation();
  const [requestLoading, setRequestLoading] = useState(false);
  const { _id: memberId } = member;

  const params = {
    documentId: currentDocument._id,
    requesterIds: [memberId],
  };

  const acceptRejectBase = async ({ callback, message }) => {
    try {
      setRequestLoading(true);
      await callback();
      await reloadRequestList();
      toastUtils.success({ message, useReskinToast: true });
    } catch (error) {
      const { code: errorCode } = errorUtils.extractGqlError(error);
      if (errorCode === ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT) {
        openHitDocStackModal('accept requests of');
      } else {
        toastUtils.openUnknownErrorToast();
      }
      setRequestLoading(false);
      logger.logError({ error });
    }
  };

  const handleAccept = () =>
    acceptRejectBase({
      callback: () => documentServices.acceptRequestAccessDocument(params),
      message: t(SUCCESS_MESSAGE.APPROVE_REQUEST),
    });

  const handleReject = () =>
    acceptRejectBase({
      callback: () => documentServices.rejectRequestAccessDocument(params),
      message: t(SUCCESS_MESSAGE.REJECT_REQUEST),
    });

  return children({
    handleAccept,
    handleReject,
    requestLoading,
  });
};

export default Organization;
