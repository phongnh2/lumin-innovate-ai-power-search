import React from 'react';

import UnauthorizedContainer from 'luminComponents/UnauthorizedContainer';
import { LocationType } from 'constants/locationConstant';

function NoPermissionOrganization(): JSX.Element {
  return <UnauthorizedContainer type={LocationType.ORGANIZATION} />;
}

export default NoPermissionOrganization;
