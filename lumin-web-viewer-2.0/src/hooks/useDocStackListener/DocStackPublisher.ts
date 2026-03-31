import { DocStackChangedPayload } from './DocStack.interface';
import { DocStackSubscriber } from './DocStackSubscriber';

interface IPublisher {
  publish(payload: DocStackChangedPayload): void;
  subscribe(subscriber: DocStackSubscriber): void;
  unsubscribe(subscriber: DocStackSubscriber): void;
}

export class DocStackPublisher implements IPublisher {
  private _subscribers: DocStackSubscriber[] = [];

  private static _instance: DocStackPublisher = null;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static instance(): DocStackPublisher {
    if (!this._instance) {
      this._instance = new DocStackPublisher();
    }

    return this._instance;
  }

  subscribe(subscriber: DocStackSubscriber): void {
    this._subscribers.push(subscriber);
  }

  find(id: string): DocStackSubscriber {
    return this._subscribers.find((s) => s.Id === id);
  }

  unsubscribe(subscriber: DocStackSubscriber): void {
    this._subscribers = this._subscribers.filter((s) => s.Id !== subscriber.Id);
  }

  publish(data: DocStackChangedPayload): void {
    this._subscribers.forEach((s) => {
      s.notify(data);
    });
  }
}
