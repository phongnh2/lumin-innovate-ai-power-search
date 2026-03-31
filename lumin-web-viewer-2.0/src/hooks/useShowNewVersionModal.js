import { shallowEqual, useSelector } from 'react-redux';
import { useMatch } from 'react-router';

import selectors from 'selectors';

import { ROUTE_MATCH } from 'constants/Routers';

const useShowNewVersionModal = () => {
  const { hasNewVersion } = useSelector(selectors.getCurrentUser, shallowEqual);
  const { loading } = useSelector(selectors.getOrganizationList, shallowEqual);
  const isPersonalDocument = Boolean(useMatch({ path: ROUTE_MATCH.DOCUMENTS, end: false }));
  const canShowNewVersionModal = hasNewVersion && !isPersonalDocument && !loading;
  return {
    canShowNewVersionModal,
  };
};

export default useShowNewVersionModal;
