import queryString from 'query-string';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router';

import axios from '@libs/axios';

import actions from 'actions';
import selectors from 'selectors';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import { useUrlSearchParams } from 'hooks/useUrlSearchParams';

import documentServices from 'services/documentServices';
import indexedDBService from 'services/indexedDBService';

import { cookieManager } from 'helpers/cookieManager';
import logger from 'helpers/logger';

import errorUtils from 'utils/error';
import { TemplatePlatform, TemplateChannel } from 'utils/Factory/EventCollection/constants/TemplateEvent';
import { eventTracking } from 'utils/recordUtil';

import { CookieStorageKey } from 'constants/cookieName';
import { DocumentFromSourceEnum } from 'constants/documentConstants';
import { ErrorCode } from 'constants/errorCode';
import UserEventConstants from 'constants/eventConstants';
import { Routers } from 'constants/Routers';
import { TEMPLATES_API } from 'constants/urls';

import { FormTemplatesResponse } from '../interfaces';
import formCaching from '../utils/formCaching';

export const useFetchFormTemplates = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const dispatch = useDispatch();
  const params = useParams<'formId'>();
  const searchParams = useUrlSearchParams();
  const searchObject = Object.fromEntries(searchParams);
  const currentUser = useGetCurrentUser();
  const isCompletedGettingUserData = useSelector(selectors.getIsCompletedGettingUserData);
  const searchQueryParsed = queryString.parse(search.toString());

  const navigateToRoute = useCallback(
    (path: string, query = searchQueryParsed) => {
      navigate(
        queryString.stringifyUrl({
          url: path,
          query,
        }),
        { replace: true }
      );
    },
    [navigate, searchQueryParsed]
  );

  const handleError = (error: Error, message: string) => {
    logger.logError({
      reason: message,
      error,
    });
    navigateToRoute(Routers.ROOT);
  };

  const fetchFormData = async (formId: string): Promise<FormTemplatesResponse | null> => {
    const cachedFileInfo = await formCaching.get(formId);
    if (cachedFileInfo) {
      await formCaching.extendExpiration(formId);
      const fileUrl = await cachedFileInfo.clone().blob();
      return {
        id: cachedFileInfo.headers.get('x-data-id') || '',
        title: cachedFileInfo.headers.get('x-data-title') || '',
        slug: cachedFileInfo.headers.get('x-data-slug') || '',
        file: {
          url: fileUrl,
          size: Number(cachedFileInfo.headers.get('x-data-size')) || 0,
          mime: cachedFileInfo.headers.get('x-data-mime') || '',
        },
      };
    }

    const { data } = await axios.axios.get<{ template: FormTemplatesResponse }>(
      [TEMPLATES_API, 'api/templates/id', formId].join('/'),
      {
        withCredentials: true,
        params: {
          _: new Date().getTime(),
        },
      }
    );
    await formCaching.save(formId, data.template);
    return data.template;
  };

  const saveFormToUserData = async (
    formId: string,
    {
      source,
      from,
    }: {
      source?: string;
      from?: string;
    }
  ) => {
    const inOpenFormFlow = cookieManager.get(CookieStorageKey.OPEN_FORM);
    if (!inOpenFormFlow) {
      navigate('/');
      return null;
    }
    cookieManager.delete(CookieStorageKey.OPEN_FORM);
    const createPDFFormResult = await documentServices.createPDFForm({
      remoteId: formId,
      formStaticPath: from,
      source,
    });
    if (!createPDFFormResult) {
      throw new Error('createPDFForm returned null or undefined');
    }
    const { documentId, documentName } = createPDFFormResult;
    eventTracking(UserEventConstants.EventType.DOC_CREATE_FROM_TEMPLATE, {
      luminTemplateId: formId,
      luminFileId: documentId,
      fileName: documentName,
      channel: TemplateChannel.TEMPLATE_LIBRARY,
      platform: TemplatePlatform.PDF,
    }).catch(() => {});
    await indexedDBService.markDeleteTempEditModeFileChanged({ id: formId, documentRemoteId: documentId });
    return { documentId };
  };

  const handleGuestUser = async (formId: string) => {
    const formInfo = await fetchFormData(formId);

    if (!formInfo) {
      throw new Error('Failed to fetch form data');
    }

    dispatch(
      actions.fetchingCurrentDocumentComplete({
        _id: formInfo.id,
        name: formInfo.title,
        fileUrl: formInfo.file.url,
        size: formInfo.file.size,
        mimeType: formInfo.file.mime,
        isAnonymousDocument: true,
        premiumToolsInfo: {},
        temporaryEdit: true,
        fromSource: DocumentFromSourceEnum.LUMIN_TEMPLATES_LIBRARY,
      })
    );

    navigateToRoute([Routers.VIEWER_TEMP_EDIT, formId, formInfo.slug].join('/'));
  };

  const handleLoggedInUser = async (formId: string, { source, from }: { source?: string; from?: string }) => {
    const saveResult = await saveFormToUserData(formId, { source, from });
    if (!saveResult) {
      logger.logError({
        context: 'useFetchFormTemplates.handleLoggedInUser',
        reason: 'Failed to save form to user data',
        error: new Error('Failed to save form to user data'),
      });
      return;
    }
    const { documentId } = saveResult;
    if (documentId) {
      navigateToRoute(`${Routers.VIEWER}/${documentId}`);
    }
  };

  const formTemplatesHandler = async () => {
    if (!isCompletedGettingUserData || !params.formId) {
      return;
    }

    const isLoggedIn = !!currentUser;

    try {
      if (isLoggedIn) {
        await handleLoggedInUser(params.formId, {
          source: searchObject.source,
          from: searchObject.from,
        });
      } else {
        await handleGuestUser(params.formId);
      }
    } catch (error) {
      const gqlError = errorUtils.extractGqlError(error);
      if (gqlError.code === ErrorCode.Document.DOMAIN_RESTRICTED_FROM_UPLOADING_DOCUMENT) {
        const { blockedStorageNames } = gqlError.metadata as { blockedStorageNames: string[] };

        navigateToRoute(Routers.ROOT, {
          ...searchQueryParsed,
          storage: blockedStorageNames.join(', '),
          errorCode: ErrorCode.Document.DOMAIN_RESTRICTED_FROM_UPLOADING_DOCUMENT ,
        });
        return;
      }
      handleError(error as Error, 'Failed to process form template');
    }
  };

  return { formTemplatesHandler };
};
