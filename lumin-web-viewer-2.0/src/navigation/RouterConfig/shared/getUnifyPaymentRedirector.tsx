import React from 'react';

import Loading from 'lumin-components/Loading';

import { lazyWithRetry } from 'utils/lazyWithRetry';

const UnifyPaymentLoadableComponent = lazyWithRetry(() => import('screens/UnifyPayment'), {
  fallback: <Loading useReskinCircularProgress fullscreen normal />,
});

export const getUnifyNewPaymentRedirector = (props: any) => <UnifyPaymentLoadableComponent {...props} />;
