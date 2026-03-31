import { useSelector, shallowEqual } from 'react-redux';

import { folderType } from 'constants/documentConstants';
import selectors from 'selectors';
import { useGetFolderType } from 'hooks';
import { useParams } from 'react-router';

function useDocumentClientId() {
  const currentFolderType = useGetFolderType();
  const { _id: userId } = useSelector(selectors.getCurrentUser, shallowEqual);
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const { teamId } = useParams();
  const getClientId = () => {
    switch (currentFolderType) {
      case folderType.INDIVIDUAL:
        return userId;
      case folderType.TEAMS:
        return teamId;
      case folderType.ORGANIZATION:
        return currentOrganization.data._id;
      default:
        return null;
    }
  };
  return {
    clientId: getClientId(),
  };
}

export default useDocumentClientId;
