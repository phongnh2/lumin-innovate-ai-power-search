import { isNil, omitBy } from 'lodash';
import queryString from 'query-string';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import actions from 'actions';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import { documentGraphServices } from 'services/graphServices';
import indexedDBService from 'services/indexedDBService';
import { kratosService } from 'services/oryServices';

import logger from 'helpers/logger';

import errorUtils from 'utils/error';
import fileUtil from 'utils/file';

import { guestModeManipulateIndexedDb } from 'features/GuestModeManipulateCache/guestModeManipulateIndexedDb';

import { acceptedActionsFromFLP } from 'constants/actionFromFLP';
import { ErrorCode } from 'constants/errorCode';
import { LOGGER, STORAGE_TYPE } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';
import { BASEURL } from 'constants/urls';
import { UrlSearchParam } from 'constants/UrlSearchParam';

export const useFetchExternalPdf = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const encodeData = params.get('encodeData');
  const dispatch = useDispatch();
  const currentUser = useGetCurrentUser();
  const navigate = useNavigate();
  const action = params.get('action');
  const from = params.get('from');

  const handleGuestUser = async () => {
    const url = queryString.stringifyUrl({
      url: [Routers.CREATE_EXTERNAL_PDF].join('/'),
      query: {
        action,
        from,
        encodeData,
      },
    });
    try {
      if (!acceptedActionsFromFLP.includes(action)) {
        kratosService.signIn({ url: `${BASEURL}${url}` });
        return;
      }
      const { signedUrl, documentName, remoteId, fileSize } =
        await documentGraphServices.getSignedUrlForExternalPdfByEncodeData(encodeData);
      if (!signedUrl) {
        logger.logError({
          reason: LOGGER.Service.EXTERNAL_PDF,
          error: new Error('Failed to get signed URL for external PDF'),
        });
        kratosService.signIn(true);
        return;
      }
      const mimeType = fileUtil.getMimeTypeFromSignedUrl(signedUrl);
      dispatch(
        actions.fetchingCurrentDocumentComplete({
          name: documentName,
          fileUrl: signedUrl,
          mimeType,
          isAnonymousDocument: true,
          premiumToolsInfo: {},
          temporaryEdit: true,
          remoteId,
          size: fileSize,
          service: STORAGE_TYPE.S3,
        })
      );
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.EXTERNAL_PDF,
        error: error as Error,
      });
      kratosService.signIn({ url: `${BASEURL}${url}` });
    }
  };

  const handleLoggedInUser = async () => {
    try {
      const res = await documentGraphServices.createPdfFromStaticToolUpload({
        encodeData,
      });
      if (res?.documentId) {
        const { documentId, temporaryRemoteId } = res as { documentId: string; temporaryRemoteId: string };
        await indexedDBService.markDeleteTempEditModeFileChanged({
          id: temporaryRemoteId,
          documentRemoteId: documentId,
        });
        await guestModeManipulateIndexedDb.update(temporaryRemoteId, { documentId });
        const searchParam = new URLSearchParams(
          omitBy(
            {
              [UrlSearchParam.ACTION]: action,
              [UrlSearchParam.FROM]: from,
            },
            isNil
          )
        );
        navigate(`/viewer/${documentId}?${searchParam.toString()}`, { replace: true });
        return;
      }
      navigate('/');
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.EXTERNAL_PDF,
        error: error as Error,
      });
      const gqlError = errorUtils.extractGqlError(error);
      if (gqlError.code === ErrorCode.Document.DOMAIN_RESTRICTED_FROM_UPLOADING_DOCUMENT) {
        const { blockedStorageNames } = gqlError.metadata as { blockedStorageNames: string[] };

        const url = queryString.stringifyUrl({
          url: '/',
          query: {
            action,
            from,
            encodeData,
            storage: blockedStorageNames.join(', '),
            errorCode: ErrorCode.Document.DOMAIN_RESTRICTED_FROM_UPLOADING_DOCUMENT ,
          },
        });
        navigate(url, { replace: true });
        return;
      }
      navigate('/');
    }
  };

  const handleFetchExternalPdf = async (): Promise<void> => {
    try {
      const isLoggedIn = !!currentUser;
      if (!isLoggedIn) {
        await handleGuestUser();
      } else {
        await handleLoggedInUser();
      }
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.EXTERNAL_PDF,
        error: error as Error,
      });
      return null;
    }
  };
  return { handleFetchExternalPdf };
};
