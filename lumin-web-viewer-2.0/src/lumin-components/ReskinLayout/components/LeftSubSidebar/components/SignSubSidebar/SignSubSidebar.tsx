import { createRemoteAppComponent } from '@module-federation/bridge-react';
import React from 'react';
import { useNavigate } from 'react-router';

import { useGetCurrentOrganization, useSignDocListMatch } from 'hooks';
import useOrganizationRouteMatch from 'hooks/useOrganizationRouteMatch';

import { loadRemote } from 'services/moduleFederation';

import { ORG_TEXT } from 'constants/organizationConstants';

import styles from '../../LeftSubSidebar.module.scss';
import SignSubSidebarSkeleton from '../SignSubSidebarSkeleton';

interface NavigationContentProps {
  activated: boolean;
  isTablet: boolean;
  onClickItem: (route: string) => void;
}

const NavigationContent = createRemoteAppComponent<NavigationContentProps>({
  loader: () => loadRemote('luminsign/NavigationContent'),
  // TODO: Add fallback component
  fallback: () => <div>error</div>,
  loading: <SignSubSidebarSkeleton />,
});

const SignSubSidebar = ({ onCloseDrawer }: { onCloseDrawer: () => void }) => {
  const navigate = useNavigate();
  const { orgRouteMatch } = useOrganizationRouteMatch();
  const { isInSignDocListPage } = useSignDocListMatch();
  const currentOrg = useGetCurrentOrganization();
  const { url } = currentOrg || {};
  const signPath = orgRouteMatch ? `/${ORG_TEXT}/${url}/sign` : '/sign';

  const onClick = (route: string) => {
    navigate(`${signPath}/${route}`);
    onCloseDrawer();
  };

  return (
    <div className={styles.itemsContainer}>
      <NavigationContent activated={isInSignDocListPage} isTablet onClickItem={onClick} />
    </div>
  );
};

export default SignSubSidebar;
