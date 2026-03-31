/* eslint-disable class-methods-use-this */
import indexedDBService from 'services/indexedDBService';

import { MAX_DOCUMENT_SIZE } from 'constants/lumin-common';

import { BaseCacheStorage, SupportCacheBrowser } from './baseCacheStorage';
import { CacheStore } from './cacheStore';

export const MAXIMUM_FILES: Record<SupportCacheBrowser, number> = {
  Edge: 10,
  Chrome: 10,
  Firefox: 5,
};

export abstract class CommonCacheStorage extends BaseCacheStorage {
  protected supported: boolean;

  protected userBrowser: SupportCacheBrowser;

  protected cache: CacheStore;

  protected maximumFilesCacheBrowserSupported: number;

  constructor(protected readonly cacheName: string) {
    super(cacheName);
    this.maximumFilesCacheBrowserSupported = MAXIMUM_FILES[this.userBrowser];
    this.supported = this.supported && indexedDBService.canUseIndexedDB();
  }

  abstract cacheFileAndUpdateUsageStats({
    key,
    file,
    etag,
    shouldCount,
  }: {
    key: string;
    file: File;
    etag?: string;
    shouldCount?: boolean;
  }): Promise<void>;

  abstract getFile(key: string, etag?: string): Promise<Blob | File>;

  abstract makeCacheAvailable(file?: File): Promise<void>;

  public hasOverloadedSize(size: number): boolean {
    return size > MAX_DOCUMENT_SIZE * 1024 * 1024;
  }

  abstract set({
    key,
    file,
    etag,
    shouldCount,
  }: {
    key: string;
    etag?: string;
    file?: File;
    shouldCount?: boolean;
  }): Promise<void>;

  abstract add({ key, etag, file }: { key: string; etag?: string; file: File }): Promise<void>;
}
