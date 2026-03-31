/* eslint-disable class-methods-use-this */
import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';
import { CACHE_DOCUMENT_EXPIRATION } from 'constants/urls';

import { CommonCacheStorage } from './commonCacheStorage';
import { FrequentlyUsedDocument } from './frequentlyUsedDocument';

export const DOCUMENT_CACHE_EXPIRED_TIME = 24 * 60 * 60; // 24 hours in seconds

const LUMIN_FREQUENTLY_USED_DOCUMENTS_BASEURL = 'https://lumin-frequently-used-documents/';

export const getCacheKey = (documentId: string): string => `${LUMIN_FREQUENTLY_USED_DOCUMENTS_BASEURL}${documentId}`;

export class DocumentCacheBase extends CommonCacheStorage {
  private frequentlyUsedDocument: FrequentlyUsedDocument;

  constructor() {
    super('lumin-frequently-files');

    if (this.supported) {
      this.frequentlyUsedDocument = new FrequentlyUsedDocument(CACHE_DOCUMENT_EXPIRATION);
      this.frequentlyUsedDocument.expireEntries().catch((e) =>
        logger.logError({
          reason: LOGGER.Service.CACHE_DOCUMENT_ERROR,
          message: 'Failed to expire entries for frequently used documents',
          error: e as Error,
        })
      );
    }
  }

  private async update({
    key,
    etag,
    file,
    shouldCount,
  }: {
    key: string;
    etag: string;
    file: File;
    shouldCount: boolean;
  }): Promise<void> {
    await this.deleteFilesUntilMemoryAvailable({ file, exceptKey: key });
    await this.set({ key, etag, file, shouldCount });
  }

  public async updateCache({
    key,
    etag,
    file,
    shouldCount = false,
  }: {
    key: string;
    etag: string;
    file: File;
    shouldCount?: boolean;
  }): Promise<void> {
    try {
      if (!this.supported) {
        return;
      }
      const cachedDocument = await this.frequentlyUsedDocument.get(key);
      if (!cachedDocument) {
        await this.add({ key, etag, file });
        return;
      }
      if (this.hasOverloadedSize(file.size)) {
        await this.delete(key);
        return;
      }
      await this.update({ key, etag, file, shouldCount });
    } catch (e) {
      logger.logError({ reason: LOGGER.Service.CACHE_DOCUMENT_ERROR, error: e as Error });
    }
  }

  private async deleteFilesUntilMemoryAvailable({
    file,
    exceptKey,
  }: {
    file: File;
    exceptKey?: string;
  }): Promise<void> {
    const isMemoryAvailability = await this.checkMemoryAvailability(file);
    if (!isMemoryAvailability) {
      // If memory is unavailability then delete leastUsedFile except currentFile
      const leastFrequentlyUsedFileKey = await this.frequentlyUsedDocument.detectLeastFrequentlyUsedFileKey(exceptKey);
      if (!leastFrequentlyUsedFileKey) {
        return;
      }
      await this.delete(leastFrequentlyUsedFileKey);

      // Recursive call to continue deleting files until memory is available
      await this.deleteFilesUntilMemoryAvailable({ file, exceptKey });
    }
  }

  public async cacheFileAndUpdateUsageStats({
    key,
    file,
    etag,
    shouldCount,
  }: {
    key: string;
    file: File;
    etag: string;
    shouldCount: boolean;
  }) {
    const response = new Response(file, { status: 200 });
    const promises = [this.cache.put(key, response)];
    if (shouldCount) {
      promises.push(this.frequentlyUsedDocument.count(key, etag));
    } else {
      promises.push(this.frequentlyUsedDocument.updateExpiration(key, etag));
    }
    await Promise.all(promises);
  }

  public async set({
    key,
    file,
    etag,
    shouldCount,
  }: {
    key: string;
    etag: string;
    file?: File;
    shouldCount: boolean;
  }): Promise<void> {
    try {
      const isMemoryAvailability = await this.checkMemoryAvailability(file);
      if (!isMemoryAvailability) {
        return;
      }
      await this.cacheFileAndUpdateUsageStats({ key, file, etag, shouldCount });
    } catch (e) {
      logger.logError({
        reason: LOGGER.Service.CACHE_DOCUMENT_ERROR,
        error: e as Error,
        attributes: {
          fileSize: `${file.size / 1024 / 1024} MB`,
        },
      });
      await this.flushAllCache();
      /**
       * If there is an error while caching the file, we need to flush all the cache and try again.
       */
      this.cacheFileAndUpdateUsageStats({ key, file, etag, shouldCount }).catch((err) => {
        logger.logError({
          reason: LOGGER.Service.CACHE_DOCUMENT_ERROR,
          error: err as Error,
        });
      });
    }
  }

  public async delete(key: string): Promise<void> {
    if (!this.supported) {
      return;
    }
    try {
      await Promise.all([super.delete(key), this.frequentlyUsedDocument.delete(key)]);
    } catch (e) {
      logger.logError({ reason: LOGGER.Service.CACHE_DOCUMENT_ERROR, error: e as Error });
    }
  }

  public async flushAllCache(): Promise<void> {
    if (!this.supported) {
      return;
    }
    await super.flushAllCache();
    await this.frequentlyUsedDocument.deleteAll();
  }

  public getFile = async (key: string, etag: string): Promise<Blob | File> => {
    try {
      if (!this.supported) {
        return null;
      }
      const cachedDocument = await this.frequentlyUsedDocument.get(key);
      if (cachedDocument?.etag !== etag) {
        return null;
      }
      await this.frequentlyUsedDocument.count(key);
      const cachedFile = await this.cache.match(key);
      if (!cachedFile) {
        return null;
      }
      return await cachedFile.clone().blob();
    } catch (e) {
      logger.logError({ reason: LOGGER.Service.CACHE_DOCUMENT_ERROR, error: e as Error });
    }
  };

  public deleteMultiple(keys: string[]): void {
    if (!this.supported) {
      return;
    }
    keys.forEach((key) => this.delete(key));
  }

  public async add({ key, etag, file }: { key: string; etag: string; file: File }): Promise<void> {
    try {
      if (!this.supported || this.hasOverloadedSize(file.size)) {
        return;
      }
      await this.makeCacheAvailable(file);
      await this.set({ key, etag, file, shouldCount: true });
    } catch (e) {
      logger.logError({ reason: LOGGER.Service.CACHE_DOCUMENT_ERROR, error: e as Error });
    }
  }

  async makeCacheAvailable(file: File): Promise<void> {
    const isTotalRecordAvailability = await this.checkTotalRecordAvailability(this.maximumFilesCacheBrowserSupported);
    if (!isTotalRecordAvailability) {
      const leastFrequentlyUsedFileKey = await this.frequentlyUsedDocument.detectLeastFrequentlyUsedFileKey();
      await this.delete(leastFrequentlyUsedFileKey);
    }
    await this.deleteFilesUntilMemoryAvailable({ file });
  }

  public isBrowserSupported(): boolean {
    return this.supported;
  }
}

export const documentCacheBase = new DocumentCacheBase();
