import React from 'react';

import * as Styled from 'lumin-components/OrganizationSecurity/OrganizationSecurity.styled';
import { PermissionSettings, OrganizationGoogleSignin, VisibilitySettings } from 'luminComponents/OrganizationSecurity';

import { EnableSamlSsoSection, EnableScimProvisionSection } from 'features/SamlSso/components';

function OrganizationSecurity() {
  return (
    <Styled.OrganizationWrapper>
      <OrganizationGoogleSignin />
      <EnableSamlSsoSection />
      <EnableScimProvisionSection />
      <VisibilitySettings />
      <PermissionSettings />
    </Styled.OrganizationWrapper>
  );
}

export default OrganizationSecurity;
