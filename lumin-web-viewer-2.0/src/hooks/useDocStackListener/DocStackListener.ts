/* eslint-disable class-methods-use-this */
import { DocStackPublisher } from 'hooks/useDocStackListener/DocStackPublisher';
import { DocStackSubscriber } from 'hooks/useDocStackListener/DocStackSubscriber';
import { difference } from 'lodash';
import { organizationServices } from 'services';
import { DocStackChangedPayload, Subscription } from './DocStack.interface';

interface IListener {
  watch(orgIds: string[]): void;
}

export class DocStackListener implements IListener {
  private static _instance: DocStackListener;

  private _listeners: Map<string, Subscription> = new Map<string, Subscription>();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static instance(): DocStackListener {
    if (!this._instance) {
      this._instance = new DocStackListener();
    }

    return this._instance;
  }

  private subscribe(orgId: string): Subscription {
    if (this._listeners.has(orgId)) {
      throw new Error('Listener is already existed!');
    }
    const subscription = organizationServices.changedDocumentStackSubscription({
      orgId,
      onNext: (result: DocStackChangedPayload) => {
        DocStackPublisher.instance().publish(result);
      },
      onError: () => {
        this.unsubscribe(orgId);
      },
    });
    this._listeners.set(orgId, subscription);
    return subscription;
  }

  private unsubscribe(orgId: string): boolean {
    if (!this._listeners.has(orgId)) {
      return false;
    }
    this._listeners.get(orgId).unsubscribe();
    this._listeners.delete(orgId);
    return true;
  }

  watch(orgIds: string[]): void {
    const prevIds = Array.from(this._listeners.keys());
    const unsubscribeIds = difference(prevIds, orgIds);
    const upcomingIds = difference(orgIds, prevIds);
    const publisher = DocStackPublisher.instance();
    upcomingIds.forEach((_id) => {
      this.subscribe(_id);
      publisher.subscribe(new DocStackSubscriber(_id));
    });
    unsubscribeIds.forEach((_id) => {
      this.unsubscribe(_id);
      publisher.unsubscribe(publisher.find(_id));
    });
  }
}
