import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';

import { useTranslation, useAvailablePersonalWorkspace, useMobileMatch } from 'hooks';
import { useTrackingBillingEventName } from 'hooks/useTrackingBillingEventName';

import { commonUtils } from 'utils';
import { PaymentHelpers, PaymentUrlSerializer } from 'utils/payment';

import { PERIOD } from 'constants/plan';
import { STATIC_PAGE_PRICING } from 'constants/Routers';

import { IOrganization } from 'interfaces/organization/organization.interface';

import styles from './SubscriptionDetail.module.scss';

type Props = {
  organization: IOrganization;
};

type FreeButtonProps = {
  to: string;
  text: string;
  eventName: string;
};

function FreeSubscription({ organization: { _id, url, payment } }: Props): JSX.Element {
  const dispatch = useDispatch();
  const isProfessionalUser = useAvailablePersonalWorkspace();
  const isMobile = useMobileMatch();

  const { data: currentOrganization } = useSelector<unknown, { data: IOrganization }>(
    selectors.getCurrentOrganization,
    shallowEqual
  );
  const { canStartTrial } = payment.trialInfo;
  const planUrl = STATIC_PAGE_PRICING;
  const { getTrackStartTrialEventName, getTrackGoPremiumEventName } = useTrackingBillingEventName();
  const { t } = useTranslation();

  const getButton = (): FreeButtonProps => {
    const builder = new PaymentUrlSerializer().of(_id).period(PERIOD.ANNUAL).trial(canStartTrial).returnUrlParam();
    if (canStartTrial && !isProfessionalUser) {
      const trialPlan = PaymentHelpers.evaluateTrialPlan(payment.trialInfo);
      return {
        text: t('settingBilling.startFreeTrial'),
        to: builder.plan(trialPlan).get(),
        eventName: getTrackStartTrialEventName(),
      };
    }
    return {
      text: t('settingBilling.goPremium'),
      to: planUrl,
      eventName: getTrackGoPremiumEventName(),
    };
  };

  const props = getButton();

  const handleOnClick = (): void => {
    if (currentOrganization && url !== currentOrganization.url) {
      dispatch(actions.resetOrganization());
    }
  };

  return (
    <>
      <div>
        <p className={styles.description}>
          <Trans
            i18nKey="settingBilling.freePlanDesc1"
            components={{
              span: (
                <span
                  style={{
                    fontWeight: 700,
                  }}
                />
              ),
            }}
          />
        </p>
        <p className={styles.description}>
          <Trans
            i18nKey="settingBilling.freePlanDesc2"
            components={{ Link: <Link className={styles.ourPlansPageLink} to={planUrl} onClick={handleOnClick} /> }}
          />
        </p>
      </div>
      <Link tabIndex={-1} to={props.to}>
        <Button fullWidth={isMobile} size="lg" variant="filled" onClick={handleOnClick}>
          {commonUtils.formatTitleCaseByLocale(props.text)}
        </Button>
      </Link>
    </>
  );
}

export default FreeSubscription;
