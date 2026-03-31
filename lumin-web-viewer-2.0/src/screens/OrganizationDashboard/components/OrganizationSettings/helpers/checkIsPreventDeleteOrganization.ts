import { IOrganization } from 'interfaces/organization/organization.interface';

export const checkIsPreventDeleteOrganization = (organization: IOrganization): boolean =>
  Boolean(organization.deletedAt) || Boolean(organization.hasPendingInvoice);
