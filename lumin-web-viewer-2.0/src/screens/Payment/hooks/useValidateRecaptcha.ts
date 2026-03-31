import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';

import { useGoogleReCaptchaV3 } from 'luminComponents/GoogleReCaptchaV3';
import { useSettingBillingFormContext } from 'luminComponents/SettingBillingForm/context/SettingBillingFormContext';

import { useTranslation, useUrlSearchParams } from 'hooks';

import paymentService from 'services/paymentService';

import logger from 'helpers/logger';

import { toastUtils } from 'utils';
import errorExtract from 'utils/error';
import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { ErrorCode } from 'constants/errorCode';
import { ModalTypes } from 'constants/lumin-common';
import { STATIC_PAGE_URL } from 'constants/urls';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { IPaymentMethod, IRetrieveSetupIntentResponse } from 'interfaces/payment/payment.interface';

type Params = {
  skipRecaptcha?: boolean;
  action?: string;
  organizationId?: string;
  isFetchedCard?: boolean;
  currentPaymentMethod?: IPaymentMethod;
  isPurchasing?: boolean;
};

type ReturnType = {
  secretData: IRetrieveSetupIntentResponse;
  refetchSecret: () => void;
  loading: boolean;
};

const useValidateRecaptcha = ({
  skipRecaptcha = false,
  action,
  organizationId,
  isFetchedCard,
  currentPaymentMethod,
  isPurchasing,
}: Params = {}): ReturnType => {
  const { executeV3: executeRecaptcha, isLoading: isRecaptchaLoading } = useGoogleReCaptchaV3();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [secretData, setSecretData] = useState<IRetrieveSetupIntentResponse>();
  const [loading, setLoading] = useState(true);
  const searchParams = useUrlSearchParams();
  const orgIdOnUrl = searchParams.get(UrlSearchParam.PAYMENT_ORG_TARGET);
  const fromParam = searchParams.get(UrlSearchParam.FROM);
  const isSuttonBankRerouting = fromParam === 'sutton_bank_rerouting';
  const settingBillingFormContextValue = useSettingBillingFormContext();

  const handleError = useCallback(
    (error: unknown): void => {
      const { code: errorCode } = errorExtract.extractGqlError(error) as { code: string };
      if (errorCode === ErrorCode.Common.RECAPTCHA_V3_VALIDATION_FAILED) {
        let modalSettings = {
          type: ModalTypes.ERROR,
          title: t('payment.pageIsNotAvailable'),
          message: t('payment.messagePageIsNotAvailable'),
          cancelButtonTitle: t('common.goBack'),
          confirmButtonTitle: t('common.contactNow'),
          disableBackdropClick: true,
          closeOnConfirm: false,
          onCancel: () => navigate(-1),
          onConfirm: () =>
            window.open(STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSupport')), '_blank'),
          useReskinModal: true,
        };
        if (action === 'change_card') {
          modalSettings = {
            type: ModalTypes.ERROR,
            title: t('payment.actionIsNotAvailable'),
            message: t('payment.messagePageIsNotAvailable'),
            cancelButtonTitle: t('common.cancel'),
            confirmButtonTitle: t('common.contactNow'),
            disableBackdropClick: true,
            closeOnConfirm: false,
            onCancel: () => {
              dispatch(actions.closeModal());
              settingBillingFormContextValue?.setIsChangingCard(false);
            },
            onConfirm: () =>
              window.open(STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSupport')), '_blank'),
            useReskinModal: true,
          };
        }
        dispatch(actions.openModal(modalSettings));
      } else {
        toastUtils
          .error({
            message: t('common.somethingWentWrong'),
          })
          .catch(() => {});
        logger.logError({
          message: 'Payment validation failed',
          error: error as Error,
        });
      }
    },
    [action]
  );

  const getSetupIntentToken = useCallback(async (): Promise<IRetrieveSetupIntentResponse | undefined> => {
    let recaptchaToken = null;
    if (!skipRecaptcha) {
      recaptchaToken = await executeRecaptcha(action);
      if (!recaptchaToken) {
        throw new Error('Cannot get recaptcha token');
      }
    }
    if (organizationId) {
      return paymentService.retrieveOrganizationSetupIntent({
        orgId: organizationId,
        reCaptchaTokenV3: recaptchaToken,
        reCaptchaAction: action,
        ...(isSuttonBankRerouting && { type: 'SUTTON_BANK_REROUTING' }),
      });
    }
    return paymentService.retrieveSetupIntent({ reCaptchaTokenV3: recaptchaToken, reCaptchaAction: action });
  }, [action, skipRecaptcha, organizationId]);

  const validateRecaptcha = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const secretResponse = await getSetupIntentToken();
      setSecretData(secretResponse);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [getSetupIntentToken, handleError]);

  useEffect(() => {
    if (isPurchasing || isRecaptchaLoading) {
      return;
    }
    if (action === 'change_card' || (!orgIdOnUrl && !organizationId)) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      validateRecaptcha();
      return;
    }
    if (isFetchedCard) {
      if (currentPaymentMethod) {
        setLoading(false);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        validateRecaptcha();
      }
    }
  }, [validateRecaptcha, isFetchedCard, currentPaymentMethod, isRecaptchaLoading]);

  return {
    secretData,
    refetchSecret: validateRecaptcha,
    loading,
  };
};

export default useValidateRecaptcha;
