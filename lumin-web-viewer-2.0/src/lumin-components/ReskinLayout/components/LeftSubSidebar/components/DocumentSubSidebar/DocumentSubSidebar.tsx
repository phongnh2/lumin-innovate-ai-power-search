import React from 'react';
import { useLocation } from 'react-router';

import { matchPaths } from 'helpers/matchPaths';

import { ORGANIZATION_ROUTERS } from 'constants/organizationConstants';

import { OrganizationSubSidebar } from '../OrganizationSubSidebar';
import { PersonalSubSidebar } from '../PersonalSubSidebar';

const DocumentSubSidebar = (): JSX.Element => {
  const location = useLocation();
  const orgRouteMatch = matchPaths(
    ORGANIZATION_ROUTERS.map((path) => ({ path, end: false })),
    location.pathname
  );
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{orgRouteMatch ? <OrganizationSubSidebar /> : <PersonalSubSidebar />}</>;
};

export default DocumentSubSidebar;
