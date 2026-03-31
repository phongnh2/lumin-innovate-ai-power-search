import React from 'react';

import { AuthorizationSection } from './components';
import { withWhitelistedUsersGuard } from './hoc';

const OneDriveAddInsAuthorization = () => <AuthorizationSection />;

export default withWhitelistedUsersGuard(OneDriveAddInsAuthorization);
