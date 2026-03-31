import Script from 'next/script';
import { ReactNode } from 'react';
import { shallowEqual, useDispatch } from 'react-redux';

import { ElementName } from '@/constants/common';
import { setGsiLoaded } from '@/features/account/account-slice';
import { useTrackingOidcAuth, useTrackingOidcButton } from '@/hooks';
import { useAppSelector } from '@/lib/hooks';
import { getIdentity } from '@/selectors';
import { isElementOpen } from '@/selectors/custom-selectors';

import ForceReloadModal from './ForceReloadModal';
import LoadingLogo from './LoadingLogo/LoadingLogo';

interface IProps {
  children: ReactNode;
}

const AppProvider = (props: IProps) => {
  const { children } = props;
  const identity = useAppSelector(getIdentity, shallowEqual);
  const isLuminLoadingOpen = useAppSelector(state => isElementOpen(state, ElementName.LUMIN_LOADING));
  const dispatch = useDispatch();

  useTrackingOidcButton();
  useTrackingOidcAuth({ identity });

  return (
    <>
      {children}
      {isLuminLoadingOpen && <LoadingLogo />}
      <Script
        src='https://accounts.google.com/gsi/client'
        strategy='afterInteractive'
        onLoad={() => {
          dispatch(setGsiLoaded(true));
        }}
        onError={() => {
          dispatch(setGsiLoaded(false));
        }}
        async
      />
      <ForceReloadModal />
    </>
  );
};

export default AppProvider;
