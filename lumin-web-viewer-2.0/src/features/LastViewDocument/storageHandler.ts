import { uniqBy } from 'lodash';

export class StorageHandler<T> {
  private storageKey: string;

  private storageLimit: number;

  constructor({ storageKey, storageLimit }: { storageKey: string; storageLimit?: number }) {
    this.storageKey = storageKey;
    this.storageLimit = storageLimit || 10;
  }

  get limit() {
    return this.storageLimit;
  }

  add(value: T, uniqByParam?: string) {
    const items = this.getAll() || [];
    const deduplicatedData = uniqBy([value, ...items], uniqByParam);
    this.set(deduplicatedData.slice(0, this.storageLimit));
  }

  set(value: T[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(value));
  }

  getAll(): T[] {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) as T[];
    } catch (err) {
      return null;
    }
  }
}
