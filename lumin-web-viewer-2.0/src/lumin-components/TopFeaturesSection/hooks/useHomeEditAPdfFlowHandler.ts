import { useLocation, useNavigate } from 'react-router';

import { useTranslation } from 'hooks';

import { toastUtils } from 'utils';

const MAXIMUM_UPLOAD_FILES_ALLOWED = 1;

type UseHomeEditAPdfFlowHandlerData = {
  isOnHomeEditAPdfFlow?: boolean;
};

const useHomeEditAPdfFlowHandler = ({ isOnHomeEditAPdfFlow = false }: UseHomeEditAPdfFlowHandlerData) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigateToEditor = (documentId: string, forceToNavigate?: boolean) => {
    if ((!forceToNavigate && !isOnHomeEditAPdfFlow) || !documentId) {
      return;
    }
    navigate(`/viewer/${documentId}`, {
      state: {
        previousPath: location.pathname,
      },
    });
  };

  const handleVerifyBeforeUploadingFlow = (files: unknown[]) => ({
    allowedUpload: isOnHomeEditAPdfFlow ? files.length === MAXIMUM_UPLOAD_FILES_ALLOWED : true,
    errorHandler: () => toastUtils.error({ message: t('errorMessage.tooManyFiles') }),
  });

  return {
    handleNavigateToEditor,
    handleVerifyBeforeUploadingFlow,
  };
};

export default useHomeEditAPdfFlowHandler;
