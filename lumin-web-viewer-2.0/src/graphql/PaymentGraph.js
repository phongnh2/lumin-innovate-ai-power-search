import { gql } from '@apollo/client';

import { OrganizationPaymentData } from 'graphQL/fragments/OrganizationBase';

import Fragments from './Fragment';

const INVOICES = gql`
  query GetInvoices($input: InvoicesInput!) {
    invoices(input: $input) {
      id
      created
      total
      downloadLink
    }
  }
`;

const CARD = gql`
  query GetCard($input: CommonPaymentInput!) {
    card(input: $input) {
      last4
      expMonth
      expYear
    }
    customerInfo(input: $input) {
      email
      currency
    }
  }
`;

const SUBSCRIPTION = gql`
  query GetSubscription($input: CommonPaymentInput!) {
    subscription(input: $input) {
      amount
      currency
      nextInvoice
      billingInterval
      quantity
      creditBalance
    }
  }
`;

const UPCOMING_INVOICE = gql`
  query UpcomingInvoice($input: CommonPaymentInput!) {
    upcomingInvoice(input: $input) {
      amount
      currency
      nextInvoice
      billingInterval
      quantity
    }
  }
`;

const RETRIEVE_BILLING_INFO = gql`
  query RetrieveBillingInfo($input: CommonPaymentInput!) {
    subscription(input: $input) {
      amount
      currency
      nextInvoice
      billingInterval
      quantity
      creditBalance
      payment {
        currency
        quantity
        type
        period
        status
      }
    }
    upcomingInvoice(input: $input) {
      amount
      currency
      nextInvoice
      billingInterval
      quantity
      creditBalance
      payment {
        currency
        quantity
        type
        period
        status
      }
    }
  }
`;

const REACTIVE_SUBSCRIPTION = gql`
  mutation ReactiveSubscription {
    reactiveSubscription {
      message
      statusCode
      data {
        customerRemoteId
        subscriptionRemoteId
        planRemoteId
        type
        period
        status
        quantity
        priceVersion
        productId
        currency
      }
    }
  }
`;

const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription($input: CancelSubscriptionInput!) {
    cancelSubscription(input: $input) {
      message
      statusCode
      data {
        customerRemoteId
        subscriptionRemoteId
        planRemoteId
        type
        period
        status
        quantity
        currency
        priceVersion
      }
    }
  }
`;

const GET_COUPON_VALUE = gql`
  query couponValue($input: GetCouponValueInput!) {
    couponValue(input: $input) {
      type
      value
    }
  }
`;

const CHANGE_CARD_INFO = gql`
  mutation ChangeCardInfo($input: ChangeCardInfoInput!) {
    changeCardInfo(input: $input) {
      last4
      expMonth
      expYear
      email
    }
  }
`;

const CREATE_FREE_TRIAL_SUBCRIPTION = gql`
  mutation createFreeTrialSubscription($input: SubscriptionTrialInput!) {
    createFreeTrialSubscription(input: $input) {
      message
      statusCode
      data {
        customerRemoteId
        subscriptionRemoteId
        planRemoteId
        type
        period
        status
        quantity
        currency
        priceVersion
        trialInfo {
          highestTrial
          endTrial
          canStartTrial
          canUseStarterTrial
          canUseProTrial
          canUseBusinessTrial
        }
      }
    }
  }
`;

const CREATE_FREE_TRIAL_UNIFY_SUBSCRIPTION = gql`
  mutation createFreeTrialUnifySubscription($input: CreateFreeTrialUnifySubscriptionInput!) {
    createFreeTrialUnifySubscription(input: $input) {
      message
      statusCode
      data {
        customerRemoteId
        subscriptionRemoteId
        planRemoteId
        type
        period
        status
        quantity
        currency
        priceVersion
        trialInfo {
          highestTrial
          endTrial
          canStartTrial
          canUseStarterTrial
          canUseProTrial
          canUseBusinessTrial
        }
        subscriptionItems {
          id
          quantity
          planRemoteId
          period
          currency
          paymentType
          paymentStatus
          productName
        }
      }
    }
  }
`;

const GET_BILLING_EMAIL = gql`
  query getBillingEmail($input: GetBillingEmailInput!) {
    getBillingEmail(input: $input)
  }
`;

const GET_REMAINING_PLAN = gql`
  query getRemainingPlan($input: GetRemainingInput) {
    getRemainingPlan(input: $input) {
      currency
      remaining
      total
      nextBillingCycle
      nextBillingPrice
      amountDue
      discount
      creditBalance
    }
  }
`;

const GET_BILLING_WARNING = gql`
  query getBillingWarning($clientId: ID!) {
    getBillingWarning(clientId: $clientId) {
      renewPayload {
        attempt {
          nextPaymentAttempt
          attemptCount
          paymentType
          clientId
          declineCode
          cardLast4
        }
        metadata {
          organization {
            _id
            url
          }
        }
      }
      subCancelPayload {
        remainingDay
        expireDate
        lastSubscriptionEndedAt
        metadata {
          organization {
            _id
            url
          }
        }
      }
      warnings
    }
  }
`;

const CLOSE_BILLING_WARNING_BANNER = gql`
  mutation closeBillingBanner($clientId: ID!, $bannerType: CloseBillingBannerType!) {
    closeBillingBanner(clientId: $clientId, bannerType: $bannerType) {
      statusCode
      message
    }
  }
`;

const RETRY_SUBSCRIPTION_IMMEDIATELY = gql`
  mutation retryFailedSubscription($clientId: ID!) {
    retryFailedSubscription(clientId: $clientId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const GET_NEXT_PAYMENT_INFO = gql`
  query getNextPaymentInfo($input: GetNextPaymentInfoInput!) {
    getNextPaymentInfo(input: $input) {
      nextPlanRemoteId
      nextProductId
    }
  }
`;

const RETRIEVE_SETUP_INTENT = gql`
  mutation retrieveSetupIntentV3($input: RetrieveSetupIntentV3Input!) {
    retrieveSetupIntentV3(input: $input) {
      clientSecret
      accountId
    }
  }
`;

const RETRIEVE_ORGANIZATION_SETUP_INTENT = gql`
  mutation retrieveOrganizationSetupIntentV2($input: RetrieveOrganizationSetupIntentV2Input!) {
    retrieveOrganizationSetupIntentV2(input: $input) {
      clientSecret
      accountId
    }
  }
`;

const DEACTIVATE_SETUP_INTENT = gql`
  mutation deactivateSetupIntent($stripeAccountId: String!) {
    deactivateSetupIntent(stripeAccountId: $stripeAccountId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const DEACTIVATE_ORGANIZATION_SETUP_INTENT = gql`
  mutation deactivateOrganizationSetupIntent($orgId: ID!, $stripeAccountId: String!) {
    deactivateOrganizationSetupIntent(orgId: $orgId, stripeAccountId: $stripeAccountId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const GET_BILLING_CYCLE_OF_PLAN = gql`
  query getBillingCycleOfPlan($input: GetBillingCycleOfPlanInput!) {
    getBillingCycleOfPlan(input: $input) {
      amountDue
      remaining
      total
      discount
      nextBillingPrice
      nextBillingCycle
      quantity
      currency
      creditBalance
      discountDescription
    }
  }
`;

const CANCEL_ORGANIZATION_FREE_TRIAL = gql`
  mutation cancelOrganizationFreeTrial($orgId: ID!) {
    cancelOrganizationFreeTrial(orgId: $orgId) {
      message
      statusCode
      data {
        ...OrganizationPaymentData
      }
    }
  }
  ${OrganizationPaymentData}
`;

const PREVIEW_UPCOMING_DOC_STACK_INVOICE = gql`
  query previewUpcomingDocStackInvoice($input: PreviewUpcomingDocStackInvoiceInput!) {
    previewUpcomingDocStackInvoice(input: $input) {
      amountDue
      remaining
      total
      discount
      nextBillingPrice
      nextBillingCycle
      quantity
      currency
      creditBalance
      discountDescription
      isUpgradeDocStackAnnual
    }
  }
`;

const PREVIEW_UPCOMING_SUBSCRIPTION_INVOICE = gql`
  query previewUpcomingSubscriptionInvoice($input: PreviewUpcomingSubscriptionInvoiceInput!) {
    previewUpcomingSubscriptionInvoice(input: $input) {
      amountDue
      remaining
      total
      discount
      nextBillingPrice
      nextBillingCycle
      currency
      creditBalance
      discountDescription
    }
  }
`;

const REMOVE_PERSONAL_PAYMENT_METHOD = gql`
  mutation removePersonalPaymentMethod {
    removePersonalPaymentMethod {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const REMOVE_ORGANIZATION_PAYMENT_METHOD = gql`
  mutation removeOrganizationPaymentMethod($orgId: ID!) {
    removeOrganizationPaymentMethod(orgId: $orgId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const GET_PAYMENT_METHOD = gql`
  query GetPaymentMethod($clientId: ID!) {
    getPaymentMethod(clientId: $clientId) {
      type
      card {
        last4
        expMonth
        expYear
        wallet
      }
      link {
        email
      }
      cashapp {
        email
      }
    }
  }
`;

const GET_CUSTOMER_INFO = gql`
  query GetCustomerInfo($input: CommonPaymentInput!) {
    customerInfo(input: $input) {
      email
      currency
    }
  }
`;

const UPDATE_PAYMENT_METHOD = gql`
  mutation UpdatePaymentMethod($input: UpdatePaymentMethodInput!) {
    updatePaymentMethod(input: $input) {
      statusCode
      message
      billingEmail
      paymentMethod {
        type
        card {
          last4
          expMonth
          expYear
        }
        link {
          email
        }
      }
    }
  }
`;

const GET_UNIFY_SUBSCRIPTION = gql`
  query getUnifySubscription($input: CommonPaymentInput!) {
    getUnifySubscription(input: $input) {
      subscription {
        payment {
          period
          status
          currency
          remainingPlan {
            currency
            remaining
            total
            nextBillingCycle
            nextBillingPrice
            amountDue
            quantity
            creditBalance
            discount
          }
          subscriptionItems {
            id
            quantity
            planRemoteId
            period
            currency
            paymentType
            paymentStatus
            productName
            amount
          }
        }
        creditBalance
        nextInvoice
        amount
      }
      upcomingInvoice {
        amount
        nextInvoice
        currency
        creditBalance
      }
    }
  }
`;

const CANCEL_UNIFY_SUBSCRIPTION = gql`
  mutation cancelUnifySubscription($input: CancelUnifySubscriptionInput!) {
    cancelUnifySubscription(input: $input) {
      message
      statusCode
      data {
        customerRemoteId
        subscriptionRemoteId
        planRemoteId
        type
        period
        status
        quantity
        currency
        priceVersion
        subscriptionItems {
          id
          quantity
          planRemoteId
          period
          currency
          paymentType
          paymentStatus
          productName
        }
      }
    }
  }
`;

export {
  CANCEL_SUBSCRIPTION,
  CARD,
  CHANGE_CARD_INFO,
  CREATE_FREE_TRIAL_SUBCRIPTION,
  GET_COUPON_VALUE,
  INVOICES,
  REACTIVE_SUBSCRIPTION,
  SUBSCRIPTION,
  UPCOMING_INVOICE,
  GET_BILLING_EMAIL,
  GET_REMAINING_PLAN,
  GET_BILLING_WARNING,
  CLOSE_BILLING_WARNING_BANNER,
  RETRY_SUBSCRIPTION_IMMEDIATELY,
  GET_NEXT_PAYMENT_INFO,
  RETRIEVE_SETUP_INTENT,
  DEACTIVATE_SETUP_INTENT,
  GET_BILLING_CYCLE_OF_PLAN,
  CANCEL_ORGANIZATION_FREE_TRIAL,
  RETRIEVE_BILLING_INFO,
  PREVIEW_UPCOMING_DOC_STACK_INVOICE,
  REMOVE_PERSONAL_PAYMENT_METHOD,
  REMOVE_ORGANIZATION_PAYMENT_METHOD,
  RETRIEVE_ORGANIZATION_SETUP_INTENT,
  DEACTIVATE_ORGANIZATION_SETUP_INTENT,
  GET_PAYMENT_METHOD,
  GET_CUSTOMER_INFO,
  UPDATE_PAYMENT_METHOD,
  PREVIEW_UPCOMING_SUBSCRIPTION_INVOICE,
  CREATE_FREE_TRIAL_UNIFY_SUBSCRIPTION,
  GET_UNIFY_SUBSCRIPTION,
  CANCEL_UNIFY_SUBSCRIPTION,
};
