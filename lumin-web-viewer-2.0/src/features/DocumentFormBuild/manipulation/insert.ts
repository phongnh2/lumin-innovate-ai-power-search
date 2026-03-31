import { Action, sortFn } from './base';

export class InsertPageAction extends Action {
  constructor(private insertPages: number[]) {
    super();
  }

  getPageNeedSave(): number[] {
    this.insertPages.sort(sortFn);
    const result: number[] = [];
    const firstPageIndex = this.insertPages[0];
    for (let i = firstPageIndex; i <= this.totalPages + this.insertPages.length; i++) {
      if (!this.insertPages.includes(i)) {
        result.push(i);
      }
    }
    return result;
  }

}