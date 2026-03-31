import { IOrganization } from 'interfaces/organization/organization.interface';

interface BillingInfo {
  quantity: number;
  organizationId: string;
  stripeAccountId: string;
  currency: string;
}

interface UsePaymentPermissionsParams {
  currentOrganization: IOrganization | null;
  billingInfo: BillingInfo;
}

interface UsePaymentPermissionsResult {
  isInputDisabled: boolean;
  isCurrencyDisabled: boolean;
  canUpgrade: boolean;
  clientId: string;
  isCreateNewOrg: boolean;
}

export function usePaymentPermissions(params: UsePaymentPermissionsParams): UsePaymentPermissionsResult;
