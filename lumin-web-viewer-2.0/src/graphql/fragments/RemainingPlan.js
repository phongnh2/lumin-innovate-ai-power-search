import { gql } from '@apollo/client';

export const RemainingPlanData = gql`
  fragment RemainingPlanData on RemainingPlan {
    currency
    remaining
    total
    nextBillingCycle
    nextBillingPrice
    subtotal
    quantity
  }
`;
