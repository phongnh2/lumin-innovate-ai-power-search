import { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import { useGetFolderType, usePrevious } from 'hooks';

import { folderType } from 'constants/documentConstants';
import { ORG_PATH } from 'constants/organizationConstants';

import useResetCacheAfterSearching from './useResetCacheAfterSearching';

function useResetListOnSearching({ searchKey, clientId }) {
  const location = useLocation();
  const currentFolderType = useGetFolderType();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const dispatch = useDispatch();
  const isInOrgPage = Boolean(matchPath({ path: ORG_PATH, end: false }, location.pathname));
  const { resetCacheByQuery } = useResetCacheAfterSearching();
  const prevSearchKey = usePrevious(searchKey) || '';
  const { _id: orgId } = currentOrganization.data || {};

  useEffect(() => {
    const getRefId = () => {
      switch (currentFolderType) {
        case folderType.INDIVIDUAL:
        case folderType.TEAMS:
          return clientId;
        case folderType.STARRED:
          return isInOrgPage ? orgId : clientId;
        case folderType.ORGANIZATION:
          return orgId;
        default:
          return null;
      }
    };

    const searchKeyChanged = prevSearchKey !== searchKey;
    if (searchKeyChanged) {
      dispatch(actions.refetchCurrentDocListState({ currentFolderType, refId: getRefId() }));
      resetCacheByQuery();
    }
  }, [
    searchKey,
    prevSearchKey,
    clientId,
    currentFolderType,
    orgId,
    isInOrgPage,
    dispatch,
    resetCacheByQuery,
  ]);
}

export default useResetListOnSearching;
