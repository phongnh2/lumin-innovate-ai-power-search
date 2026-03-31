/* eslint-disable class-methods-use-this */
import { getUserBrowserForAllDevices } from 'helpers/device';

import { CacheStore } from './cacheStore';

export const SUPPORT_CACHE_BROWSERS = ['Edge', 'Chrome', 'Firefox'] as const;

export type SupportCacheBrowser = typeof SUPPORT_CACHE_BROWSERS[number];

export class BaseCacheStorage {
  protected supported: boolean;

  protected userBrowser: SupportCacheBrowser;

  protected cache: CacheStore;

  constructor(protected readonly cacheName: string, maxAgeSeconds?: number) {
    this.userBrowser = getUserBrowserForAllDevices() as SupportCacheBrowser;
    this.supported = SUPPORT_CACHE_BROWSERS.includes(this.userBrowser) && 'caches' in window;
    if (this.supported) {
      this.cache = new CacheStore(cacheName, maxAgeSeconds);
      this.cache.expireEntries().catch(console.error);
    }
  }

  protected async delete(key: string): Promise<void> {
    if (!this.supported) {
      return;
    }
    await this.cache.delete(key);
  }

  protected async flushAllCache(): Promise<void> {
    if (!this.supported) {
      return;
    }
    const keys = await this.cache.keys();
    await Promise.all(keys.map((key) => this.cache.delete(key.url)));
  }

  protected async checkTotalRecordAvailability(totalAvailability: number): Promise<boolean> {
    const keys = await this.cache.keys();
    return keys.length < totalAvailability;
  }

  protected async checkMemoryAvailability(file: File): Promise<boolean> {
    if (navigator?.storage?.estimate) {
      const { usage, quota } = await navigator.storage.estimate();
      return quota - usage >= file.size;
    }
    return false;
  }
}
