import { createRemoteAppComponent } from '@module-federation/bridge-react';
import React from 'react';

import Loading from 'luminComponents/Loading';
import UnifyPaymentLayout from 'luminComponents/UnifyPaymentLayout';

import useTrackPaymentPurchaseSuccess from 'hooks/useTrackPaymentPurchaseSuccess';

import { loadRemote } from 'services/moduleFederation';

import styles from './UnifyPayment.module.scss';

const UnifyPaymentComponent = createRemoteAppComponent<any, any>({
  loader: () => loadRemote('luminpayment/UnifyPayment'),
  // eslint-disable-next-line react/no-unstable-nested-components
  fallback: () => <div>error</div>,
  loading: <Loading useReskinCircularProgress fullscreen normal />,
});

const UnifyPayment = () => {
  useTrackPaymentPurchaseSuccess();

  return (
    <UnifyPaymentLayout>
      <UnifyPaymentComponent className={styles.container} />
    </UnifyPaymentLayout>
  );
};

export default UnifyPayment;
