import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';
import { RootState } from 'store';

export const useCheckHotjarAttributesLoaded = () => {
  const { isCurrentOrgLoading, currentOrganization, isFetchingCurrentDocument, currentDocument } = useSelector(
    (state: RootState) => {
      const currentOrgData = selectors.getCurrentOrganization(state);
      return {
        isCurrentOrgLoading: currentOrgData.loading,
        currentOrganization: currentOrgData.data,
        isFetchingCurrentDocument: selectors.getIsFetchingCurrentDocument(state),
        currentDocument: selectors.getCurrentDocument(state),
      };
    },
    shallowEqual
  );

  const hasOrganization = !!currentOrganization || !!currentDocument?.documentReference?.data;
  const hasDocument = !!currentDocument;

  return (!isCurrentOrgLoading && hasOrganization) || (!isFetchingCurrentDocument && hasDocument);
};
