import { CacheExpiration } from 'workbox-expiration';

const DEFAULT_DOCUMENT_CACHE_EXPIRED_TIME = 24 * 60 * 60; // 24 hours in seconds

export class CacheStore {
  private cacheName: string;

  private expirationManager: CacheExpiration;

  constructor(cacheName: string, maxAgeSeconds?: number) {
    this.cacheName = cacheName;

    this.expirationManager = new CacheExpiration(this.cacheName, {
      maxAgeSeconds: maxAgeSeconds || DEFAULT_DOCUMENT_CACHE_EXPIRED_TIME,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  open = (): Promise<Cache> => caches.open(this.cacheName);

  add = async (request: RequestInfo | URL | string): Promise<void> => {
    const filesCache = await this.open();
    await filesCache.add(request);
    await this.expirationManager.updateTimestamp(request as string);
  };

  put = async (request: RequestInfo | URL, response: Response): Promise<void> => {
    const filesCache = await this.open();
    await filesCache.put(request, response);
    await this.expirationManager.updateTimestamp(request as string);
  };

  delete = async (request: RequestInfo): Promise<boolean | void> => {
    const filesCache = await this.open();
    await filesCache.delete(request);
  };

  match = async (request: RequestInfo | URL): Promise<Response | undefined> => {
    const filesCache = await this.open();
    return filesCache.match(request);
  };

  keys = async (): Promise<readonly Request[]> => {
    const filesCache = await this.open();
    return filesCache.keys();
  };

  expireEntries = async (): Promise<void> => {
    await this.expirationManager.expireEntries();
  };
}
