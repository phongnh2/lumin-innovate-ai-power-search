import { useMemo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { matchPath, useParams, useLocation } from 'react-router';

import selectors from 'selectors';

import { DocumentTab, folderType, MINIMUM_DOCUMENT_QUANTITY } from 'constants/documentConstants';
import { ORG_PATH } from 'constants/organizationConstants';

import useGetCurrentTeam from './useGetCurrentTeam';
import useGetFolderType from './useGetFolderType';

export function useBaseQuery({ searchKey }) {
  const { _id: userId } = useSelector(selectors.getCurrentUser, shallowEqual);
  const currentTeam = useGetCurrentTeam();
  const organization = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
  const ownedFilterCondition = useSelector(selectors.getCurrentOwnedFilter);
  const lastModifiedFilterCondition = useSelector(selectors.getCurrentLastModifiedFilter);
  const currentFolderType = useGetFolderType();
  const { folderId } = useParams();
  const location = useLocation();
  const isInOrgPage = Boolean(matchPath({ path: ORG_PATH, end: false }, location.pathname));
  const { _id: orgId = '' } = organization;
  const { _id: teamId = '' } = currentTeam;
  return useMemo(() => {
    const baseQuery = {
      filter: {
        ownedFilterCondition,
        lastModifiedFilterCondition,
      },
      query: {
        minimumQuantity: MINIMUM_DOCUMENT_QUANTITY,
        searchKey,
      },
    };
    if (folderId) {
      return { ...baseQuery, folderId };
    }
    if (isInOrgPage) {
      baseQuery.orgId = orgId;
    }
    switch (currentFolderType) {
      case folderType.STARRED:
        baseQuery.tab = DocumentTab.STARRED;
        break;
      case folderType.SHARED:
        baseQuery.tab = DocumentTab.SHARED_WITH_ME;
        break;
      case folderType.INDIVIDUAL:
        baseQuery.clientId = userId;
        delete baseQuery.ownedFilterCondition;
        baseQuery.tab = DocumentTab.MY_DOCUMENT;
        break;
      case folderType.TEAMS:
        baseQuery.teamId = teamId;
        baseQuery.clientId = teamId;
        baseQuery.tab = DocumentTab.ORGANIZATION;
        break;
      case folderType.ORGANIZATION:
        baseQuery.tab = DocumentTab.ORGANIZATION;
        break;
      default:
        break;
    }
    return baseQuery;
  }, [
    ownedFilterCondition,
    lastModifiedFilterCondition,
    searchKey,
    folderId,
    currentFolderType,
    isInOrgPage,
    teamId,
    orgId,
    userId,
  ]);
}
