import { lazyWithRetry } from 'utils/lazyWithRetry';

const AddDomain = lazyWithRetry(() => import('./AddDomain'));
const EditDomain = lazyWithRetry(() => import('./EditDomain'));

export default {
  Add: AddDomain,
  Edit: EditDomain,
};
