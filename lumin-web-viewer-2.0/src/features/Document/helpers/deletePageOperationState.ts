class DeletePageOperationState {
  private _toastId: string | null = null;

  private _operationIds: Map<string, string> = new Map();

  private _preventToastCloseCallbacks: Map<string, boolean> = new Map();

  public set toastId(id: string) {
    this._toastId = id;
  }

  public get toastId() {
    return this._toastId;
  }

  public set operationId(id: string) {
    if (this._toastId) {
      this._operationIds.set(this._toastId, id);
    }
  }

  public get operationId(): string | null {
    return this._toastId ? this._operationIds.get(this._toastId) : null;
  }

  public setOperationId(toastId: string, operationId: string): void {
    this._operationIds.set(toastId, operationId);
  }

  public getOperationId(toastId: string): string | null {
    return this._operationIds.get(toastId) || null;
  }

  public removeOperationId(toastId: string): void {
    this._operationIds.delete(toastId);
  }

  public get shouldPreventToastCloseCallback(): boolean {
    return this._toastId ? this._preventToastCloseCallbacks.get(this._toastId) : false;
  }

  public set shouldPreventToastCloseCallback(value: boolean) {
    if (this._toastId) {
      this._preventToastCloseCallbacks.set(this._toastId, value);
    }
  }

  public setShouldPreventToastCloseCallback(toastId: string, value: boolean): void {
    this._preventToastCloseCallbacks.set(toastId, value);
  }

  public getShouldPreventToastCloseCallback(toastId: string): boolean {
    return this._preventToastCloseCallbacks.get(toastId) === true;
  }
}

export const deletePageOperationState = new DeletePageOperationState();
