/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createRemoteAppComponent } from '@module-federation/bridge-react';
import React from 'react';
import { useNavigate } from 'react-router';

import { loadRemote } from 'services/moduleFederation';

import AgreementGenSubSidebarSkeleton from './AgreementGenSubSidebarSkeleton';

interface NavigationBarDrawerProps {
  onClick: (url: string) => void;
}

type Props = {
  onCloseDrawer: () => void;
};

const NavigationBarDrawer = createRemoteAppComponent<NavigationBarDrawerProps>({
  loader: () => loadRemote('luminAgreementGen/NavigationBarDrawer') as Promise<NavigationBarDrawerProps>,
  // TODO: Add fallback component
  fallback: () => <div>error</div>,
  loading: <AgreementGenSubSidebarSkeleton />,
});

const AgreementGenSubSidebar = ({ onCloseDrawer }: Props) => {
  const navigate = useNavigate();

  const onClick = (url: string) => {
    navigate(url);
    onCloseDrawer();
  };

  return <NavigationBarDrawer onClick={onClick} />;
};

export default AgreementGenSubSidebar;
