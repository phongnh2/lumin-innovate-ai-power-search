import React from 'react';

import { LayoutSecondary } from 'luminComponents/Layout';

import { useEnableWebReskin } from 'hooks';

import OneDriveAddInsAuthorization from 'features/OneDriveAddInsAuthorization';

const OneDriveAddInsAuthorizationPage = () => {
  const { isEnableReskin } = useEnableWebReskin();

  return (
    <LayoutSecondary isReskin={isEnableReskin} footer={false} staticPage withCenterFrame>
      <OneDriveAddInsAuthorization />
    </LayoutSecondary>
  );
};

export default OneDriveAddInsAuthorizationPage;
