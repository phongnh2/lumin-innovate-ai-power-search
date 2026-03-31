import { IOrganization } from 'interfaces/organization/organization.interface';

export interface UseClaimFreeTrialProps {
  newOrganization?: IOrganization;
  onOpenExtendFreeTrialModal?: () => void;
  from?: string;
  refetchNewSecret?: () => void;
}

export interface UseClaimFreeTrialReturn {
  disabled: boolean;
  loading: boolean;
  onClaim: (e: React.FormEvent) => Promise<void>;
  canClaimTrial: boolean;
  claimCtaTooltip: string;
  trackUserFillPaymentForm: ({ fieldName, action }: { fieldName: string; action: string }) => void;
}

/**
 * @param props - The props for the hook
 * @returns Functions and state for managing the free trial claim process
 */
export function useClaimFreeTrial(props: UseClaimFreeTrialProps): UseClaimFreeTrialReturn;
