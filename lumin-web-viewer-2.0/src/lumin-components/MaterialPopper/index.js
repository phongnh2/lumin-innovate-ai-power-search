import { lazyWithRetry } from 'utils/lazyWithRetry';

export default lazyWithRetry(() => import(/* webpackPrefetch: true */ './MaterialPopper'));
