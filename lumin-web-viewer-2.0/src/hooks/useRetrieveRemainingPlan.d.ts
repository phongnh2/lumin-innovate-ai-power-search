import { BillingInfo } from 'features/CNC/CncComponents/OrganizationCheckout/OrganizationCheckoutContext';

export interface NextBilling {
  time: string | null;
  price: number | null;
  creditBalance: number | null;
  loading: boolean;
  isUpgradeDocStackAnnual?: boolean;
}

export interface UseRetrieveRemainingPlanReturn {
  remaining: number;
  total: number | null;
  nextBilling: NextBilling;
  amountDue: number;
  discount: number;
  discountDescription: string;
}

export function useRetrieveRemainingPlan(options: {
  billingInfo: BillingInfo;
  canUpgrade: boolean;
  clientId?: string;
  isFetchedCard: boolean;
}): UseRetrieveRemainingPlanReturn;
