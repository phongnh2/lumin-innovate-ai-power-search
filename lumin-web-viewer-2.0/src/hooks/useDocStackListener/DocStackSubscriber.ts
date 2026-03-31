import { batch } from 'react-redux';
import { AnyAction } from 'redux';

import actions from 'actions';
import selectors from 'selectors';
import { store } from 'store';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { DocStackChangedPayload } from './DocStack.interface';

interface ISubscriber {
  notify(payload: DocStackChangedPayload): void;
}

export class DocStackSubscriber implements ISubscriber {
  private _orgId: string;

  constructor(orgId: string) {
    this._orgId = orgId;
  }

  get Id(): string {
    return this._orgId;
  }

  notify(result: DocStackChangedPayload): void {
    if (result.orgId !== this.Id) {
      return;
    }

    const { data: currentOrg } = selectors.getCurrentOrganization(store.getState()) as unknown as {
      data: IOrganization;
    };

    const payload = {
      docStackStorage: result.docStackStorage,
      payment: result.payment,
    };
    batch(() => {
      if (currentOrg?._id === result.orgId) {
        store.dispatch(actions.updateCurrentOrganization(payload) as AnyAction);
      }
      store.dispatch(actions.updateOrganizationInList(result.orgId, payload) as AnyAction);
    });
  }
}
