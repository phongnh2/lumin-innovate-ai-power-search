import { lazyWithRetry } from 'utils/lazyWithRetry';

const VariantPopover = lazyWithRetry(() => import('./VariantPopover'));

export default VariantPopover;
