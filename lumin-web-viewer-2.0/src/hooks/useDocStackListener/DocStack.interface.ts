import { IOrganization } from 'interfaces/organization/organization.interface';

export type DocStackChangedPayload = {
  orgId: string;
  docStackStorage: IOrganization['docStackStorage'];
  payment: IOrganization['payment'];
};

export type Subscription = {
  unsubscribe?(): void;
};
