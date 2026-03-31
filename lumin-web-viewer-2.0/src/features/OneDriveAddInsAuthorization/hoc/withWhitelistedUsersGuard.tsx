import React, { ComponentType } from 'react';

import { useGetCurrentUser } from 'hooks';

import { NonWhitelistedSection } from '../components';

const withWhitelistedUsersGuard =
  <T,>(Component: ComponentType<T>) =>
  (props: T) => {
    const currentUser = useGetCurrentUser();

    if (!currentUser) {
      return null;
    }

    if (!currentUser.isOneDriveAddInsWhitelisted) {
      return <NonWhitelistedSection />;
    }

    return <Component {...props} />;
  };

export default withWhitelistedUsersGuard;
