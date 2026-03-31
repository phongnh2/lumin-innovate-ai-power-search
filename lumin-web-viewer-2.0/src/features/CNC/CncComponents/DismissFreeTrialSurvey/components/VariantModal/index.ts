import { lazyWithRetry } from 'utils/lazyWithRetry';

const VariantModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ './VariantModal'));

export default VariantModal;
