import { AnnotationSyncQueue } from './baseQueue';

export const annotationSyncQueue = new AnnotationSyncQueue({
  maxQueueSize: 1000,
  maxRetries: 3,
  enableBatching: true,
  batchSize: 20,
  batchTimeoutMs: 1500,
});

export { AnnotationSyncQueue, type IAnnotationSyncQueueOptions } from './baseQueue';

export default annotationSyncQueue;
