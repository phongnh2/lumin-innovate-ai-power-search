import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';
import { TotalDocumentsRetriever } from 'luminComponents/DocumentQuery/DocumentQueryProxy';
import { useGetCurrentTeam, useGetFolderType } from 'hooks';
import { folderType } from 'constants/documentConstants';

export function useTotalDocument() {
  const currentFolderType = useGetFolderType();
  const { _id: userId } = useSelector(selectors.getCurrentUser, shallowEqual);
  const { _id: teamId } = useGetCurrentTeam();
  const { _id: orgId } = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};

  const currentClientMapping = {
    [folderType.INDIVIDUAL]: userId,
    [folderType.SHARED]: userId,
    [folderType.STARRED]: userId,
    [folderType.TEAMS]: teamId,
    [folderType.ORGANIZATION]: orgId,
  };
  const clientId = currentClientMapping[currentFolderType];

  // return redux state for total document outside of folder
  return TotalDocumentsRetriever(currentFolderType, clientId);
}
