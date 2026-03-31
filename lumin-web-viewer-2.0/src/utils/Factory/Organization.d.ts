import { PaymentUtilities } from 'utils/Factory/Payment';

import { IOrganization } from 'interfaces/organization/organization.interface';

declare class OrganizationUtilities {
  constructor({ organization }: { organization: IOrganization });

  get payment(): PaymentUtilities;

  isManager(): boolean;

  isConvertedFromTeam(): boolean;

  isLastActiveOrg(): boolean;

  getUrl(): string;

  hasInviteUsersPermission(): boolean;

  canUpgradeSign(): boolean;

  isSignProSeat(): boolean;

  isUpgradeSignSeat(): boolean;

  isRequestUpgradeSignSeat(): boolean;
}
