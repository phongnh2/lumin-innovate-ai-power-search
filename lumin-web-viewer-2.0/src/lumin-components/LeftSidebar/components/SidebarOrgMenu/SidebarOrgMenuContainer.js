import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import selectors from 'selectors';

import SidebarOrgMenu from './SidebarOrgMenu';
import SidebarMenuLoading from '../SidebarMenuLoading';

function SidebarOrgMenuContainer(props) {
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual);
  if (currentOrganization.loading) {
    return <SidebarMenuLoading />;
  }
  return <SidebarOrgMenu currentOrganization={currentOrganization} {...props} />;
}

export default SidebarOrgMenuContainer;
