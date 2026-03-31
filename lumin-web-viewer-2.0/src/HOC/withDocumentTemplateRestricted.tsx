import React, { ComponentType } from 'react';

import FeatureRestricted from 'luminComponents/FeatureRestricted';

import { useRestrictedUser } from 'hooks';
import useDocumentTemplateRouteMatch from 'hooks/useDocumentTemplateRouteMatch';

const withDocumentTemplateRestricted =
  <T,>(Component: ComponentType<T>) =>
  (props: T) => {
    const { templateManagementEnabled } = useRestrictedUser();
    const isDocumentTemplateRouteMatch = useDocumentTemplateRouteMatch();

    if (isDocumentTemplateRouteMatch && !templateManagementEnabled) {
      return <FeatureRestricted />;
    }

    return <Component {...props} />;
  };

export default withDocumentTemplateRestricted;
