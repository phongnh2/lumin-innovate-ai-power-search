import React from 'react';
import { useNavigate, useParams } from 'react-router';

import DocumentNotFound from 'screens/DocumentNotFound';
import DocumentRateLimit from 'screens/DocumentNotFound/DocumentRateLimit';

import FailedToAccessDocument from 'luminComponents/FailedToAccessDocument';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import errorExtract from 'utils/error';

import viewerHelper from 'features/Document/helpers';
import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';

import { DefaultErrorCode, ErrorCode } from 'constants/errorCode';
import { STATUS_CODE } from 'constants/lumin-common';

const getErrorInfo = (
  error: unknown
): {
  code: string | null;
  statusCode: number | null;
} => {
  const graphError = error ? (errorExtract.extractGqlError(error) as { code: string; statusCode: number }) : null;
  return graphError ? { code: graphError.code, statusCode: graphError.statusCode } : { code: null, statusCode: null };
};

type UseHandleErrorUIProps = {
  error: unknown;
};

export const useHandleErrorUI = ({ error }: UseHandleErrorUIProps) => {
  const currentUser = useGetCurrentUser();
  const { documentId: documentIdParam } = useParams();
  const navigate = useNavigate();
  const { code, statusCode } = getErrorInfo(error);
  const isForbidenError = statusCode === STATUS_CODE.FORBIDDEN;
  const isUnauthorizedError = statusCode === STATUS_CODE.UNAUTHORIZED;
  const { isTemplateViewer } = useTemplateViewerMatch();

  const renderForbidenErrorUI = () =>
    viewerHelper.handleRequestAccessCheck({
      match: { params: { documentId: documentIdParam } },
      navigate,
      currentUser,
      isTemplateViewer,
    });

  const renderErrorUI = () => {
    switch (code) {
      case ErrorCode.Common.RESTRICTED_ACTION:
        return <FailedToAccessDocument />;
      case ErrorCode.Document.DOCUMENT_NOT_FOUND: {
        return <DocumentNotFound />;
      }
      case DefaultErrorCode.TOO_MANY_REQUESTS: {
        return <DocumentRateLimit />;
      }
      default:
        if (isForbidenError || (isUnauthorizedError && isTemplateViewer)) {
          return renderForbidenErrorUI();
        }
        return <DocumentNotFound />;
    }
  };

  return {
    renderErrorUI,
  };
};
