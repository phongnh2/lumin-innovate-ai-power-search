import { useElements, useStripe } from '@stripe/react-stripe-js';
import { PaymentMethod } from '@stripe/stripe-js';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import paymentServices from 'services/paymentService';

import { CustomSetupIntentError } from 'utils/customSetupIntentError';

import { CardInfo } from 'features/PNB/types';

import { PAYMENT_CREDENTIAL_ISSUER } from 'constants/paymentConstant';
import { BASEURL } from 'constants/urls';

import { IUser } from 'interfaces/user/user.interface';

type IssuerInfo = {
  issuedId: string;
  issuer: string;
  cardInfo: CardInfo;
};

type ConfirmSetupIntentResponse = {
  paymentMethodId: string;
  cardInfo: CardInfo;
};

type Response = {
  createCustomerCredentials: ({
    organizationId,
    stripeAccountId,
  }: {
    organizationId: string;
    stripeAccountId: string;
  }) => Promise<IssuerInfo>;
};

const useCreateCredentials = (): Response => {
  const stripe = useStripe();
  const elements = useElements();
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);

  const confirmSetupIntent = async (): Promise<ConfirmSetupIntentResponse> => {
    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
      confirmParams: {
        payment_method_data: {
          billing_details: {
            email: currentUser.email,
          },
        },
        expand: ['payment_method'],
        return_url: BASEURL,
      },
    });
    if (error) {
      // We can re-confirm setup intent if the status is not canceled
      if (error?.setup_intent?.status !== 'canceled') {
        throw new CustomSetupIntentError(error?.message, error?.code);
      }
      throw new Error(error?.message);
    }
    if (setupIntent.status !== 'succeeded') {
      throw new CustomSetupIntentError(
        'We are unable to authenticate your payment method. Please choose a different payment method and try again.',
        'payment_method_authentication_failed'
      );
    }
    const paymentMethod = setupIntent.payment_method as PaymentMethod;
    const { card } = paymentMethod as PaymentMethod & { card: { issuer: string } };
    return {
      paymentMethodId: paymentMethod.id || (setupIntent.payment_method as string),
      cardInfo: card
        ? {
            cardBrand: card.brand,
            cardCountry: card.country,
            cardExpMonth: card.exp_month,
            cardExpYear: card.exp_year,
            cardFunding: card.funding,
            cardLast4: card.last4,
            cardIssuer: card.issuer,
          }
        : null,
    };
  };

  const deactivateSetupIntent = async ({
    stripeAccountId,
    organizationId,
  }: {
    stripeAccountId: string;
    organizationId: string;
  }) => {
    if (organizationId && stripeAccountId) {
      await paymentServices.deactivateOrganizationSetupIntent({ orgId: organizationId, stripeAccountId });
    } else {
      await paymentServices.deactivateSetupIntent({ stripeAccountId });
    }
  };

  const createCustomerCredentials = async ({
    organizationId,
    stripeAccountId,
  }: {
    organizationId: string;
    stripeAccountId: string;
  }): Promise<IssuerInfo> => {
    try {
      const { paymentMethodId, cardInfo } = await confirmSetupIntent();
      await deactivateSetupIntent({ stripeAccountId, organizationId });
      return {
        issuedId: paymentMethodId,
        issuer: PAYMENT_CREDENTIAL_ISSUER.PAYMENT_METHOD,
        cardInfo,
      };
    } catch (error) {
      if (error instanceof CustomSetupIntentError) {
        throw error;
      }
      await deactivateSetupIntent({ stripeAccountId, organizationId });
      throw error;
    }
  };

  return {
    createCustomerCredentials,
  };
};

export default useCreateCredentials;
