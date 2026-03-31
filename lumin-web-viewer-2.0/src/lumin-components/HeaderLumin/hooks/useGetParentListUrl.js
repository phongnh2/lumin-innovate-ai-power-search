import { useCallback, useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useLocation } from 'react-router';

import selectors from 'selectors';

import documentServices from 'services/documentServices';

import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';

import { ACCOUNTABLE_BY, DOCUMENT_TYPE } from 'constants/documentConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';
import { ORG_TEXT } from 'constants/organizationConstants';
import { Routers } from 'constants/Routers';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';
import { TEAM_TEXT } from 'constants/teamConstant';

const useGetParentListUrl = () => {
  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const { data: organizations } = useSelector(selectors.getOrganizationList, shallowEqual);
  const isOffline = useSelector(selectors.isOffline);
  const { documentReference: documentRef, isShared, folderId, clientId, documentType, service } = currentDocument || {};

  const [documentReference, setDocumentReference] = useState(documentRef);
  const { data: documentReferenceData, accountableBy } = documentReference || {};
  const belongToOrganization = accountableBy === ACCOUNTABLE_BY.ORGANIZATION;
  const isSystemFile = service === STORAGE_TYPE.SYSTEM;
  const { state } = useLocation();
  const { isTemplateViewer } = useTemplateViewerMatch();

  const getUrlInOrgTeam = useCallback(
    (url) => {
      if (folderId) {
        return `/${ORG_TEXT}/${url}/documents/${TEAM_TEXT}/${clientId}/folder/${folderId}`;
      }
      return `/${ORG_TEXT}/${url}/documents/${TEAM_TEXT}/${clientId}`;
    },
    [clientId, folderId]
  );

  const getUrlInOrganizationTab = useCallback(
    (url) => {
      if (folderId) {
        return `/${ORG_TEXT}/${url}/documents/${ORG_TEXT}/folder/${folderId}`;
      }
      return `/${ORG_TEXT}/${url}/documents/${ORG_TEXT}`;
    },
    [folderId]
  );

  const getUrlInOrganizationPage = useCallback(() => {
    const { url } = documentReferenceData || {};
    if (!documentType) {
      return '';
    }

    switch (documentType.toUpperCase()) {
      case DOCUMENT_TYPE.PERSONAL: {
        if (folderId) {
          return `/${ORG_TEXT}/${url}/documents/personal/folder/${folderId}`;
        }
        return `/${ORG_TEXT}/${url}/documents/personal`;
      }

      case DOCUMENT_TYPE.ORGANIZATION:
        return getUrlInOrganizationTab(url);
      case DOCUMENT_TYPE.ORGANIZATION_TEAM:
        return getUrlInOrgTeam(url);

      default:
        throw new Error('Invalid type');
    }
  }, [documentReferenceData, documentType, folderId, getUrlInOrgTeam, getUrlInOrganizationTab]);

  const getUrlInPersonal = () => Routers.PERSONAL_DOCUMENT;

  const getBackUrlInTemplateViewer = useCallback(() => {
    const { url } = documentReferenceData || {};
    if (!documentType) {
      return '';
    }
    if (documentType === DOCUMENT_TYPE.PERSONAL) {
      return `/workspace/${url}/templates/personal`;
    }
    if (documentType === DOCUMENT_TYPE.ORGANIZATION) {
      return `/workspace/${url}/templates/workspace`;
    }
    if (documentType === DOCUMENT_TYPE.ORGANIZATION_TEAM) {
      return `/workspace/${url}/templates/space/${clientId}`;
    }
    return '';
  }, [documentReferenceData, documentType, clientId]);

  useEffect(() => {
    const getDocumentReference = async () => {
      if (!documentRef && organizations && currentDocument && currentUser) {
        const [, docRef] = await documentServices.getDocumentInfo({
          document: currentDocument,
          userInfo: currentUser,
          organizations,
        });
        if (docRef) {
          setDocumentReference(docRef);
        }
      }
    };
    getDocumentReference();
  }, [documentRef, organizations, currentDocument, currentUser]);

  const getBackUrl = useCallback(() => {
    if (state?.previousPath) {
      return state.previousPath;
    }

    if (isTemplateViewer) {
      return getBackUrlInTemplateViewer();
    }

    if (isSystemFile) {
      if (currentUser?.lastAccessedOrgUrl) {
        return `/${ORG_TEXT}/${currentUser.lastAccessedOrgUrl}/documents/on-my-device`;
      }
      return Routers.DOCUMENTS;
    }

    if (isOffline) {
      return Routers.DOCUMENTS;
    }

    if (isShared) {
      if (currentUser?.lastAccessedOrgUrl) {
        return `/${ORG_TEXT}/${currentUser.lastAccessedOrgUrl}${Routers.SHARED_DOCUMENT}`;
      }
      return Routers.SHARED_DOCUMENT;
    }

    return belongToOrganization ? getUrlInOrganizationPage() : getUrlInPersonal();
  }, [
    belongToOrganization,
    currentUser?.lastAccessedOrgUrl,
    getUrlInOrganizationPage,
    isOffline,
    isShared,
    isSystemFile,
    state?.previousPath,
    isTemplateViewer,
    getBackUrlInTemplateViewer
  ]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY.DOCUMENT_LIST_FALLBACK_URL, getBackUrl());
  }, [getBackUrl]);

  return getBackUrl();
};

export default useGetParentListUrl;
