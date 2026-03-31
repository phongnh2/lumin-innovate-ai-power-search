import { lazyWithRetry } from 'utils/lazyWithRetry';

export default lazyWithRetry(() => import('./PieChart'));
