import { lazyWithRetry } from 'utils/lazyWithRetry';

export default {
  Create: lazyWithRetry(() => import('./CreateTemplateModal')),
  CreateBaseOnDoc: lazyWithRetry(() => import('./CreateTemplateBaseOnDocModal')),
  Edit: lazyWithRetry(() => import('./EditTemplateModal')),
};
