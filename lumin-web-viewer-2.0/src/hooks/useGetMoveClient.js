import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';
import { DOCUMENT_TYPE } from 'constants/documentConstants';
import { useMemo } from 'react';

export function useGetMoveClient(currentType, selectedClientId, organizations) {
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);

  return useMemo(() => {
    switch (currentType) {
      case DOCUMENT_TYPE.PERSONAL:
        return currentUser;
      case DOCUMENT_TYPE.ORGANIZATION:
        return organizations.find((item) => item._id === selectedClientId);
      case DOCUMENT_TYPE.ORGANIZATION_TEAM:
        return organizations.reduce((acc, org) => acc || org.teams.find((team) => team._id === selectedClientId), undefined);
      default:
        return null;
    }
  },
  [currentType, selectedClientId, organizations]);
}
