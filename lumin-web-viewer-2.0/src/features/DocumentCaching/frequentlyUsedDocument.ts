/* eslint-disable class-methods-use-this */
import indexedDBService from 'services/indexedDBService';

export interface IDocumentInfo {
  _id: string;
  expiration: number;
  count: number;
  lastOpen: number;
  etag: string;
}

export class FrequentlyUsedDocument {
  private expireTime: number;

  constructor(expireTime: number) {
    this.expireTime = expireTime;
  }

  public async get(documentId: string): Promise<IDocumentInfo> {
    return indexedDBService.getFrequentlyUsedDocument(documentId);
  }

  public async insert(document: IDocumentInfo): Promise<void> {
    await indexedDBService.insertFrequentlyUsedDocument(document);
  }

  public async update(documentId: string, updatedProps: any): Promise<IDocumentInfo | null> {
    return indexedDBService.updateFrequentlyUsedDocument(documentId, updatedProps);
  }

  public async getAll(): Promise<IDocumentInfo[]> {
    return indexedDBService.getAllFrequentlyUsedDocuments();
  }

  public async delete(documentId: string): Promise<void> {
    return indexedDBService.deleteFrequentlyUsedDocument(documentId);
  }

  public async deleteAll(): Promise<void> {
    return indexedDBService.deleteAllFrequentlyUsedDocuments();
  }

  public async expireEntries(): Promise<void> {
    const documents = await this.getAll();
    await Promise.all(
      documents.map(async (document) => {
        if (document.expiration < Date.now()) {
          await this.delete(document._id);
        }
      })
    );
  }

  public async detectLeastFrequentlyUsedFileKey(exceptKey?: string): Promise<string> {
    const frequentlyUsedDocumentList = await this.getAll();
    if (!frequentlyUsedDocumentList.length) {
      return '';
    }
    const documents = exceptKey
      ? frequentlyUsedDocumentList.filter(({ _id }) => _id !== exceptKey)
      : frequentlyUsedDocumentList;
    let leastFrequentlyUsedDocument = documents[0];

    for (let i = 1; i < documents.length; i++) {
      if (
        documents[i].count < leastFrequentlyUsedDocument.count ||
        (documents[i].count === leastFrequentlyUsedDocument.count &&
          documents[i].lastOpen < leastFrequentlyUsedDocument.lastOpen)
      ) {
        leastFrequentlyUsedDocument = documents[i];
      }
    }

    return leastFrequentlyUsedDocument._id;
  }

  public async updateExpiration(key: string, etag?: string): Promise<void> {
    const currentCache = await this.get(key);
    const lastOpen = Date.now();
    const expiration = lastOpen + this.expireTime * 1000;
    if (currentCache) {
      await this.update(key, {
        lastOpen,
        expiration,
        ...(etag && { etag }),
      });
    }
  }

  public async count(key: string, etag?: string): Promise<void> {
    const currentCache = await this.get(key);
    const lastOpen = Date.now();
    const expiration = lastOpen + this.expireTime * 1000;
    if (currentCache) {
      await this.update(key, {
        count: currentCache.count + 1,
        lastOpen,
        expiration,
        ...(etag && { etag }),
      });
      return;
    }
    await this.insert({
      _id: key,
      count: 1,
      lastOpen,
      expiration,
      etag,
    });
  }
}
