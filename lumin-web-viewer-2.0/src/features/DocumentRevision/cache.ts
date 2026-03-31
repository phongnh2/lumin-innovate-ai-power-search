/* eslint-disable class-methods-use-this */
import logger from 'helpers/logger';

import { CommonCacheStorage } from 'features/DocumentCaching/commonCacheStorage';

import { LOGGER } from 'constants/lumin-common';

export class DocumentVersioningCache extends CommonCacheStorage {
  constructor() {
    super('document-versioning');
  }

  async cacheFileAndUpdateUsageStats({ key, file }: { key: string; file: File }) {
    const response = new Response(file, { status: 200 });
    const isCacheKeyExisted = await this.cache.match(key);

    if (!isCacheKeyExisted) {
      const promises = [this.cache.put(key, response)];
      await Promise.all(promises);
    }
  }

  async set({ key, file }: { key: string; file?: File }): Promise<void> {
    try {
      const isMemoryAvailability = await this.checkMemoryAvailability(file);
      if (!isMemoryAvailability) {
        return;
      }
      await this.cacheFileAndUpdateUsageStats({ key, file });
    } catch (e) {
      logger.logError({
        reason: LOGGER.Service.CACHE_VERSIONING_ERROR,
        error: e as Error,
        attributes: {
          fileSize: `${file.size / 1024 / 1024} MB`,
        },
      });
      await this.flushAllCache();
      this.cacheFileAndUpdateUsageStats({ key, file }).catch((err) => {
        logger.logError({
          reason: LOGGER.Service.CACHE_VERSIONING_ERROR,
          error: err as Error,
        });
      });
    }
  }

  async add({ key, file }: { key: string; file: File }): Promise<void> {
    try {
      if (!this.supported || this.hasOverloadedSize(file.size)) {
        return;
      }
      await this.makeCacheAvailable();
      await this.set({ key, file });
    } catch (e) {
      logger.logError({ reason: LOGGER.Service.CACHE_VERSIONING_ERROR, error: e as Error });
    }
  }

  getFile = async (key: string): Promise<Blob | File> => {
    try {
      if (!this.supported) {
        return null;
      }
      const cachedFile = await this.cache.match(key);
      if (!cachedFile) {
        return null;
      }
      return await cachedFile.clone().blob();
    } catch (e) {
      logger.logError({ reason: LOGGER.Service.CACHE_VERSIONING_ERROR, error: e as Error });
      return null;
    }
  };

  async deleteOldestCache() {
    try {
      const keyList = await this.cache.keys();

      const cacheEntries = await Promise.all(
        keyList.map(async (request) => {
          const cache = await this.cache.open();
          const response = await cache.match(request);
          const timestampHeader = response?.headers.get('X-Creation-Time');
          const timestamp = timestampHeader ? new Date(timestampHeader) : null;
          return {
            request,
            timestamp,
          };
        })
      );

      const oldestEntry = cacheEntries.reduce((oldest, entry) => {
        if (!oldest || (entry.timestamp && entry.timestamp < oldest.timestamp)) {
          return entry;
        }
        return oldest;
      }, null as { request: Request; timestamp: Date | null } | null);

      if (oldestEntry) {
        const cache = await this.cache.open();
        await cache.delete(oldestEntry.request);
      }
    } catch (e) {
      logger.logError({ reason: LOGGER.Service.CACHE_VERSIONING_ERROR, error: e as Error });
    }
  }

  async makeCacheAvailable(): Promise<void> {
    const isTotalRecordAvailability = await this.checkTotalRecordAvailability(this.maximumFilesCacheBrowserSupported);
    if (!isTotalRecordAvailability) {
      await this.deleteOldestCache();
    }
  }
}

export const documentVersioningCache = new DocumentVersioningCache();
