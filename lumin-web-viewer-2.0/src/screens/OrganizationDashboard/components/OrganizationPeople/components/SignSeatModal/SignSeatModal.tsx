import { createRemoteAppComponent } from '@module-federation/bridge-react';
import React from 'react';

import { loadRemote } from 'services/moduleFederation';

const SignSeatModalComponent = createRemoteAppComponent<any, any>({
  loader: () => loadRemote('luminpayment/SignSeatModal'),
  fallback: () => <div>error</div>,
  loading: null,
});

export default SignSeatModalComponent;
