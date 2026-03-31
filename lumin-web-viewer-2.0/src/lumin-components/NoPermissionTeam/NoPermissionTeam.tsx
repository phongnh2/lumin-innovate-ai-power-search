import React from 'react';

import UnauthorizedContainer from 'luminComponents/UnauthorizedContainer';
import { LocationType } from 'constants/locationConstant';

function NoPermissionTeam(): JSX.Element {
  return <UnauthorizedContainer type={LocationType.ORGANIZATION_TEAM} />;
}

export default NoPermissionTeam;
