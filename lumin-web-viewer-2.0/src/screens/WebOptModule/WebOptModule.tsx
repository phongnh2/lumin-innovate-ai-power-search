import { createRemoteAppComponent } from '@module-federation/bridge-react';
import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import Loading from 'luminComponents/Loading';

import { loadRemote } from 'services/moduleFederation';

import { IUser } from 'interfaces/user/user.interface';

import styles from './WebOptModule.module.scss';

const WebOptFeatureComponent = createRemoteAppComponent<any, any>({
  loader: () => loadRemote('luminWebOpt/WebOptFeature'),
  fallback: () => <div>Error loading WebOpt module</div>,
  loading: <Loading useReskinCircularProgress fullscreen normal />,
});

const WebOptModule = () => {
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);

  return (
    <WebOptFeatureComponent
      className={styles.container}
      user={{
        id: currentUser?._id,
        name: currentUser?.name,
        email: currentUser?.email,
      }}
    />
  );
};

export default WebOptModule;
