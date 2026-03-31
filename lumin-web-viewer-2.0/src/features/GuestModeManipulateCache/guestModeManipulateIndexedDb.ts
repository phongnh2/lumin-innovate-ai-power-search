import { indexedDBService } from 'services';

export interface IGuestModeManipulateDocument {
  remoteId: string;
  lastModified: number;
  count: number;
  documentId?: string;
}
export class GuestModeManipulateIndexedDb {
  public async get(remoteId: string): Promise<IGuestModeManipulateDocument> {
    return indexedDBService.getGuestModeManipulateDocument(remoteId);
  }

  public async insert(remoteId: string, count: number): Promise<void> {
    const lastModified = Date.now();
    return indexedDBService.insertGuestModeManipulateDocument(remoteId, lastModified, count);
  }

  public async getAll(): Promise<IGuestModeManipulateDocument[]> {
    return indexedDBService.getAllGuestModeManipulateDocument();
  }

  public async delete(remoteId: string): Promise<void> {
    return indexedDBService.deleteGuestModeManipulateDocument(remoteId);
  }

  public async oldestUsedFile(): Promise<string> {
    const files = await this.getAll();
    if (files.length === 0) {
      return null;
    }
    const oldestUsedFile = files.sort((a, b) => a.lastModified - b.lastModified)[0];
    return oldestUsedFile.remoteId;
  }

  public async getByDocumentId(documentId: string): Promise<IGuestModeManipulateDocument> {
    return indexedDBService.getGuestModeManipulateByDocumentId(documentId);
  }

  public async update(remoteId: string, updates: Partial<IGuestModeManipulateDocument>): Promise<void> {
    return indexedDBService.updateGuestModeManipulateDocument(remoteId, updates);
  }
}

export const guestModeManipulateIndexedDb = new GuestModeManipulateIndexedDb();