import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';

import warningIcon from 'assets/lumin-svgs/warning.svg';

import actions from 'actions';

import { ButtonColor } from 'luminComponents/ButtonMaterial';

import { useMatchPaymentRoute, useTranslation } from 'hooks';

import { PaymentUrlSerializer } from 'utils/payment';

import { getPlanRadioButtons } from 'features/CNC/CncComponents/CheckoutBoard/helpers/getRadioButtons';
import { PNBButtonName, PNBButtonPurpose } from 'features/PNB/constants/events/button';
import { CardInfo } from 'features/PNB/types';

import { ModalTypes } from 'constants/lumin-common';
import { PaymentPeriod, PaymentPlans } from 'constants/plan.enum';
import { Routers } from 'constants/Routers';
import { ISSUE_BANK_CANNOT_START_TRIAL, ENV, STRIPE_US_ACCOUNT_ID } from 'constants/urls';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { useGetPreventPrepaidCardFlag } from './useGetPreventPrepaidCardFlag';
import useTrackPageView from './useTrackPageView';
import { useTrackPreventPrepaidCardModal } from './useTrackPreventPrepaidCardModal';

type Params = {
  organization: IOrganization;
  resetPaymentElement: () => void;
  stripeAccountId: string;
  from?: string;
  isFromCheckoutModal?: boolean;
};

const isSuttonBankRerouting = (params: {
  cardInfo: CardInfo;
  stripeAccountId: string;
  isPreventUsingPrepaidCardFlag: boolean;
}): boolean => {
  const { cardInfo, stripeAccountId, isPreventUsingPrepaidCardFlag } = params;

  if (!isPreventUsingPrepaidCardFlag) {
    return false;
  }
  const enforcedBanks = ISSUE_BANK_CANNOT_START_TRIAL.split(',');
  const isStripeUSAccount = stripeAccountId === STRIPE_US_ACCOUNT_ID;

  if (['production', 'staging'].includes(ENV)) {
    return isStripeUSAccount && enforcedBanks.includes(cardInfo.cardIssuer);
  }
  // Because we don't have Sutton Bank in test mode, so we use amex instead
  return cardInfo.cardBrand === 'amex';
};
const useHandlePreventUsingPrepaidCard = ({
  organization,
  stripeAccountId,
  from,
  resetPaymentElement,
  isFromCheckoutModal = false,
}: Params) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { trackModalViewed, trackModalConfirmation } = useTrackPreventPrepaidCardModal();
  const { trackPageView } = useTrackPageView();
  const { getPreventPrepaidCardFlag } = useGetPreventPrepaidCardFlag();
  const { t } = useTranslation();
  const returnUrl = searchParams.get(UrlSearchParam.RETURN_URL);
  const { plan, trial } = useMatchPaymentRoute();

  let urlSerializer;
  if (from === Routers.CHECKOUT) {
    const planList = getPlanRadioButtons({ t, _plan: plan, _trial: trial });
    urlSerializer = new PaymentUrlSerializer()
      .of(organization?._id)
      .plan(planList[0].value)
      .period(PaymentPeriod.ANNUAL)
      .checkout(Routers.CHECKOUT)
      .trialParam(false)
      .returnUrlParam()
      .fromParam('prepaid_card');
  } else {
    urlSerializer = new PaymentUrlSerializer()
      .trial(false)
      .of(organization?._id)
      .period(PaymentPeriod.ANNUAL)
      .plan(PaymentPlans.ORG_PRO)
      // tracking payment flow after using prepaid card
      .fromParam('prepaid_card');
  }

  const onConfirm = () => {
    if (returnUrl) {
      urlSerializer.returnUrlParam(returnUrl);
    } else if (isFromCheckoutModal) {
      urlSerializer.returnUrlParam();
    }
    const paymentUrl = urlSerializer.get();
    trackModalConfirmation().catch(() => {});
    navigate(paymentUrl);
  };

  const onConfirmUsingCashAppPay = () => {
    trackModalConfirmation().catch(() => {});
    setSearchParams(
      (prev) => {
        prev.set(UrlSearchParam.FROM, 'sutton_bank_rerouting');
        return prev.toString();
      },
      { replace: true }
    );
    window.location.reload();
  };

  const onCancel = () => {
    trackModalConfirmation().catch(() => {});
    setSearchParams(
      (prev) => {
        prev.delete(UrlSearchParam.FROM);
        prev.set(UrlSearchParam.FROM, 'prepaid_card');
        return prev.toString();
      },
      { replace: true }
    );
    resetPaymentElement();
    trackPageView();
  };

  const openPreventUsingPrepaidCardModal = (cardInfo: CardInfo) => {
    trackModalViewed().catch(() => {});
    const isPreventUsingPrepaidCardFlag = getPreventPrepaidCardFlag();
    const isForceUsingCashAppPay = isSuttonBankRerouting({ cardInfo, stripeAccountId, isPreventUsingPrepaidCardFlag });

    if (isForceUsingCashAppPay) {
      dispatch(
        actions.openModal({
          type: ModalTypes.WARNING,
          title: t('preventUsingPrepaidCard.unableToStartFreeTrial'),
          message: t('preventUsingPrepaidCard.suttonBankNotSupported'),
          confirmButtonTitle: t('preventUsingPrepaidCard.useCashAppPay'),
          onConfirm: onConfirmUsingCashAppPay,
          confirmDataLumin: {
            'data-lumin-btn-name': PNBButtonName.USE_CASH_APP_PAY,
            'data-lumin-btn-purpose': PNBButtonPurpose[PNBButtonName.USE_CASH_APP_PAY],
          },
          color: ButtonColor.PRIMARY_BLACK,
          cancelButtonTitle: t('preventUsingPrepaidCard.cancel'),
          onCancel,
          cancelDataLumin: {
            'data-lumin-btn-name': PNBButtonName.CANCEL_SUTTON_BANK_WARNING,
            'data-lumin-btn-purpose': PNBButtonPurpose[PNBButtonName.CANCEL_SUTTON_BANK_WARNING],
          },
          disableBackdropClick: true,
          disableEscapeKeyDown: true,
        })
      );
      return;
    }
    dispatch(
      actions.openModal({
        type: ModalTypes.WARNING,
        title: t('preventUsingPrepaidCard.unableToStartFreeTrial'),
        message: t('preventUsingPrepaidCard.prepaidCardsNotSupported'),
        confirmButtonTitle: t('preventUsingPrepaidCard.purchasePlan'),
        onConfirm,
        confirmDataLumin: {
          'data-lumin-btn-name': PNBButtonName.REDIRECT_TO_PAYMENT_PAGE_WITH_PREPAID_CARD,
          'data-lumin-btn-purpose': PNBButtonPurpose[PNBButtonName.REDIRECT_TO_PAYMENT_PAGE_WITH_PREPAID_CARD],
        },
        color: ButtonColor.PRIMARY_BLACK,
        cancelButtonTitle: t('preventUsingPrepaidCard.useAnotherCard'),
        onCancel,
        cancelDataLumin: {
          'data-lumin-btn-name': PNBButtonName.USE_ANOTHER_CARD,
          'data-lumin-btn-purpose': PNBButtonPurpose[PNBButtonName.USE_ANOTHER_CARD],
        },
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        closeOnRouteChange: true,
        icon: isFromCheckoutModal ? warningIcon : null,
        useReskinModal: isFromCheckoutModal,
      })
    );
  };

  return { openPreventUsingPrepaidCardModal };
};

export { useHandlePreventUsingPrepaidCard };
