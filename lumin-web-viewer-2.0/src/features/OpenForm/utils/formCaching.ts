import latinize from 'latinize';

import { BaseCacheStorage } from 'features/DocumentCaching/baseCacheStorage';

import { FormTemplatesResponse } from '../interfaces';

const isProductionBranch = process.env.ENV === 'production';

const FORM_CACHE_TIME = isProductionBranch ? 48 : 10 / 60; // 10 minute in development, 48 hours in production

const calculateCacheTime = () => new Date(Date.now() + FORM_CACHE_TIME * 60 * 60 * 1000).toISOString();

const getCacheKey = (formId: string) => `open-form/${formId}`;

export class FormCaching extends BaseCacheStorage {
  constructor() {
    super('open-form');
  }

  async save(formId: string, fileInfo: FormTemplatesResponse) {
    const { file, id, slug, title } = fileInfo;
    const expirationTime = calculateCacheTime();
    const fileBlob = await fetch(file.url as string).then((res) => res.blob());
    const fileResponse = new Response(fileBlob, {
      status: 200,
      headers: {
        'x-cache-expiration': expirationTime,
        'x-data-id': id,
        'x-data-slug': latinize(slug),
        'x-data-title': latinize(title),
        'x-data-size': file.size.toString(),
        'x-data-mime': file.mime,
      },
    });
    await this.cache.put(getCacheKey(formId), fileResponse);
  }

  async get(formId: string) {
    const cacheMatch = await this.cache.match(getCacheKey(formId));
    if (!cacheMatch) {
      return null;
    }
    const expirationTime = cacheMatch.headers.get('x-cache-expiration');
    if (expirationTime && new Date(expirationTime) < new Date()) {
      await this.clearData(formId);
      return null;
    }
    return cacheMatch;
  }

  async clearData(formId: string) {
    await this.delete(getCacheKey(formId));
  }

  async extendExpiration(formId: string) {
    const cacheMatch = await this.cache.match(getCacheKey(formId));
    if (!cacheMatch) {
      return;
    }
    const expirationTime = calculateCacheTime();
    const fileResponse = cacheMatch.clone();
    fileResponse.headers.set('x-cache-expiration', expirationTime);

    await this.cache.put(getCacheKey(formId), fileResponse);
  }
}

export default new FormCaching();
