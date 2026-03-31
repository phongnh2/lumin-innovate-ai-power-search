import { shallowEqual, useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router';

import selectors from 'selectors';

import { Routers, ROUTE_MATCH } from 'constants/Routers';

function useForwardOfflineDocuments() {
  const location = useLocation();
  const lastDocumentListUrl = useSelector(selectors.getOfflineDocumentListUrl, shallowEqual);
  const isPersonalDocumentsInOrg =
    lastDocumentListUrl &&
    matchPath(
    {
      path: `${ROUTE_MATCH.ORG_DOCUMENT}/personal`,
      end: false,
    },
    lastDocumentListUrl
  );
  return (
    lastDocumentListUrl === location.pathname ||
    (isPersonalDocumentsInOrg && location.pathname === Routers.PERSONAL_DOCUMENT)
  );
}

export { useForwardOfflineDocuments };
