/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createRemoteAppComponent } from '@module-federation/bridge-react';
import React from 'react';

// @ts-expect-error Fix later
import LoadingImage from 'assets/images/loading.gif';

import { loadRemote } from 'services/moduleFederation';

import styles from './AgreementGenListModule.module.scss';

const List = createRemoteAppComponent({
  loader: () => loadRemote('luminAgreementGen/AgreementList'),
  fallback: () => <div>error</div>,
  loading: (
    <div className={styles.imageContainer}>
      <div className={styles.imageWrapper}>
        <img src={LoadingImage as string} height={200} alt="Lumin" />
      </div>
    </div>
  ),
});

const AgreementGenModule = () => <List className={styles.container} />;

export default AgreementGenModule;
