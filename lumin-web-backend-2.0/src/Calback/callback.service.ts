import { Injectable, Scope } from '@nestjs/common';

type CallbackEvent = {
  run: (data?: unknown) => unknown,
}

@Injectable({
  scope: Scope.TRANSIENT,
})
export class CallbackService {
  private scope: string;

  private callbacks?: CallbackEvent[];

  public registerCallbacks(callbacks: CallbackEvent[]): void {
    this.callbacks = [...this.callbacks || [], ...callbacks];
  }

  public setScope(scope: string) : void {
    this.scope = scope;
  }

  public run(data: unknown): void {
    if (this.callbacks?.length) {
      this.callbacks.forEach((callback) => callback.run(data));
    }
  }
}
