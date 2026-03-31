import { Action } from './base';

export class MovePageAction extends Action {
  constructor(private from: number, private to: number) {
    super();
  }

  getPageNeedSave(): number[] {
    const result: number[] = [];
    if (this.from < this.to) {
      for (let i = this.from; i <= this.to; i++) {
        if (i === this.from) {
          result.push(this.to);
        } else {
          result.push(i - 1);
        }
      }
    } else {
      for (let i = this.to; i <= this.from; i++) {
        if (i === this.from) {
          result.push(this.to);
        } else {
          result.push(i + 1);
        }
      }
    }
    return result;
  }
}