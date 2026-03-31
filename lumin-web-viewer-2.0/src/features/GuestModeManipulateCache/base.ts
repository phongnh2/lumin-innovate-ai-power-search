import indexedDBService from 'services/indexedDBService';

import exportAnnotations from 'helpers/exportAnnotations';
import logger from 'helpers/logger';

import { CommonCacheStorage } from 'features/DocumentCaching/commonCacheStorage';

import { LOGGER } from 'constants/lumin-common';

import { GuestModeManipulateIndexedDb } from './guestModeManipulateIndexedDb';

const GUEST_MODE_CACHE_BASE_URL = 'https://lumin-guest-mode-manipulate/';

export const getGuestModeCacheKey = (remoteId: string): string => `${GUEST_MODE_CACHE_BASE_URL}${remoteId}`;
export class GuestModeManipulateCache extends CommonCacheStorage {
  private guestModeManipulateIndexedDb: GuestModeManipulateIndexedDb;

  constructor() {
    super('guest-mode-manipulate');
    if (this.supported) {
      this.guestModeManipulateIndexedDb = new GuestModeManipulateIndexedDb();
    }
  }

  public async cacheFileAndUpdateUsageStats({ key, file }: { key: string; file: File }) {
    const response = new Response(file, { status: 200 });
    const isCacheKeyExisted = await this.cache.match(key);

    if (!isCacheKeyExisted) {
      const promises = [this.cache.put(key, response)];
      await Promise.all(promises);
    }
  }

  public async set({ key, file }: { key: string; file: File }): Promise<void> {
    if (!this.supported) {
      return;
    }
    try {
      const isMemoryAvailability = await this.checkMemoryAvailability(file);
      if (!isMemoryAvailability) {
        return;
      }
      await this.cacheFileAndUpdateUsageStats({ key, file });
    } catch (e) {
      logger.logError({
        reason: LOGGER.Service.GUEST_MODE_MANIPULATE_CACHE_ERROR,
        error: e as Error,
        attributes: {
          fileSize: `${file.size / 1024 / 1024} MB`,
        },
      });
      await this.flushAllCache();
      this.cacheFileAndUpdateUsageStats({ key, file }).catch((err) => {
        logger.logError({
          reason: LOGGER.Service.GUEST_MODE_MANIPULATE_CACHE_ERROR,
          error: err as Error,
        });
      });
    }
  }

  public async deleteOldestCache() {
    if (!this.supported) {
      return;
    }
    try {
      const oldestUsedFile = await this.guestModeManipulateIndexedDb.oldestUsedFile();
      if (!oldestUsedFile) {
        return;
      }
      await Promise.all([this.guestModeManipulateIndexedDb.delete(oldestUsedFile), this.cache.delete(oldestUsedFile)]);
    } catch (e) {
      logger.logError({ reason: LOGGER.Service.GUEST_MODE_MANIPULATE_CACHE_ERROR, error: e as Error });
    }
  }

  public async makeCacheAvailable(file: File): Promise<void> {
    const isTotalRecordAvailability = await this.checkTotalRecordAvailability(this.maximumFilesCacheBrowserSupported);
    if (!isTotalRecordAvailability) {
      await this.deleteOldestCache();
    }
    await this.deleteFilesUntilMemoryAvailable({ file });
  }

  public async add({ key, file }: { key: string; file: File }): Promise<void> {
    try {
      if (!this.supported || this.hasOverloadedSize(file.size)) {
        return;
      }
      const xfdf = await exportAnnotations();
      await Promise.allSettled([
        this.delete(getGuestModeCacheKey(key)),
        this.makeCacheAvailable(file),
        this.guestModeManipulateIndexedDb.insert(key, 1),
        indexedDBService.saveTempEditModeAnnotChangedByRemoteId(key, { xfdf }),
      ]);
      await this.set({ key: getGuestModeCacheKey(key), file });
    } catch (e) {
      logger.logError({ reason: LOGGER.Service.GUEST_MODE_MANIPULATE_CACHE_ERROR, error: e as Error });
    }
  }

  public getFile = async (key: string): Promise<Blob | File | null> => {
    try {
      if (!this.supported) {
        return null;
      }
      const cachedFile = await this.cache.match(getGuestModeCacheKey(key));
      if (!cachedFile) {
        return null;
      }
      return await cachedFile.clone().blob();
    } catch (e) {
      logger.logError({ reason: LOGGER.Service.GUEST_MODE_MANIPULATE_CACHE_ERROR, error: e as Error });
      return null;
    }
  };

  private async deleteFilesUntilMemoryAvailable({ file }: { file: File }): Promise<void> {
    const isMemoryAvailability = await this.checkMemoryAvailability(file);
    if (!isMemoryAvailability) {
      const oldestUsedFile = await this.guestModeManipulateIndexedDb.oldestUsedFile();
      if (!oldestUsedFile) {
        return;
      }
      await Promise.all([
        this.guestModeManipulateIndexedDb.delete(oldestUsedFile),
        this.cache.delete(getGuestModeCacheKey(oldestUsedFile)),
      ]);
      await this.deleteFilesUntilMemoryAvailable({ file });
    }
  }

  public async deleteCache({ id }: { id: string }): Promise<void> {
    if (!this.supported) {
      return;
    }
    try {
      await Promise.all([this.guestModeManipulateIndexedDb.delete(id), this.cache.delete(getGuestModeCacheKey(id))]);
    } catch (e) {
      logger.logError({ reason: LOGGER.Service.GUEST_MODE_MANIPULATE_CACHE_ERROR, error: e as Error });
    }
  }
}

export const guestModeManipulateCache = new GuestModeManipulateCache();
