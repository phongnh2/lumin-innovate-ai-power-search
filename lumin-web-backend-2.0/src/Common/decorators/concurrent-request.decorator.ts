import { SetMetadata } from '@nestjs/common';

export const CONCURRENT_REQUEST_KEY = 'concurrent-request';

export interface ConcurrentRequestOptions { key?: string }

export const ConcurrentRequest = (options: ConcurrentRequestOptions = {}) => SetMetadata(CONCURRENT_REQUEST_KEY, options);
