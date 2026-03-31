/* eslint-disable class-methods-use-this */
type CheckFunction = (password: string) => void;
type CancelFunction = (() => void) | null;

class PasswordHandlers {
  private checkFn: CheckFunction = () => {};

  private cancelFn: CancelFunction = null;

  public setCheckFn(fn: CheckFunction): void {
    this.checkFn = fn;
  }

  public setCancelFn(fn: CancelFunction): void {
    this.cancelFn = fn;
  }

  public check(password: string): void {
    this.checkFn(password);
  }

  public cancel(): void {
    this.cancelFn?.();
  }

  public canCancel(): boolean {
    return Boolean(this.cancelFn);
  }
}

const passwordHandlers = new PasswordHandlers();

export { passwordHandlers };
