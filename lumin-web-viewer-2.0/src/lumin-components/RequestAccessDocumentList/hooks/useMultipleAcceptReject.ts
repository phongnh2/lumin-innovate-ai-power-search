import { useState } from 'react';

import { useTranslation } from 'hooks';

import documentServices from 'services/documentServices';

import { errorUtils } from 'utils';
import toastUtils from 'utils/toastUtils';

import { ErrorCode } from 'constants/errorCode';
import { SUCCESS_MESSAGE } from 'constants/messages';

type UseMultipleAcceptRejectPayload = {
  accept: () => unknown;
  reject: () => unknown;
  isAccepting: boolean;
  isRejecting: boolean;
};

enum LoadingState {
  Accept,
  Reject,
}

const useMultipleAcceptReject = ({
  selected,
  documentId,
  refetch,
  openHitDocStackModal,
}: {
  selected: string[];
  documentId: string;
  refetch: () => void | Promise<void>;
  openHitDocStackModal: (action: string) => void;
}): UseMultipleAcceptRejectPayload => {
  const params = {
    documentId,
    requesterIds: selected,
  };
  const { t } = useTranslation();
  const [loadingState, setLoadingState] = useState<LoadingState>(null);

  const accept = async (): Promise<void> => {
    try {
      setLoadingState(LoadingState.Accept);
      await documentServices.acceptRequestAccessDocument(params);
      await refetch();
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      toastUtils.success({
        message: t(SUCCESS_MESSAGE.APPROVE_REQUESTS),
        useReskinToast: true,
      });
    } catch (error) {
      const { code: errorCode } = errorUtils.extractGqlError(error) as { code: string };
      if (errorCode === ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT) {
        openHitDocStackModal('accept requests of');
      } else {
        toastUtils.openUnknownErrorToast();
      }
    } finally {
      setLoadingState(null);
    }
  };

  const reject = async (): Promise<void> => {
    try {
      setLoadingState(LoadingState.Reject);
      await documentServices.rejectRequestAccessDocument(params);
      await refetch();
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      toastUtils.success({ message: t(SUCCESS_MESSAGE.REJECT_REQUESTS), useReskinToast: true });
    } catch (error) {
      toastUtils.openUnknownErrorToast();
    } finally {
      setLoadingState(null);
    }
  };

  return {
    accept,
    reject,
    isAccepting: loadingState === LoadingState.Accept,
    isRejecting: loadingState === LoadingState.Reject,
  };
};

export default useMultipleAcceptReject;
