import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useNavigate } from 'react-router';

import { useTranslation } from 'hooks';

import { OrganizationUtilities } from 'utils/Factory/Organization';
import { PaymentUrlSerializer, PaymentHelpers } from 'utils/payment';

import { PERIOD, Plans } from 'constants/plan';

import { IOrganization } from 'interfaces/organization/organization.interface';

import styles from './ReachDocStackLimit.module.scss';

type ReachDocStackLimitProps = {
  content: string;
  organization: IOrganization;
};

const ReachDocStackLimit = ({ content, organization }: ReachDocStackLimitProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { _id: orgId, payment } = organization;
  const orgUtilities = new OrganizationUtilities({ organization });

  const isFree = orgUtilities.payment.isUnifyFree();
  const isManager = orgUtilities.isManager();
  const canStartTrial = orgUtilities.payment.canStartTrial();
  const canChargeTrial = isFree && canStartTrial;

  const trialPlan = PaymentHelpers.evaluateTrialPlan(payment.trialInfo);
  const nextPlan = PaymentHelpers.isDocStackPlan(payment.type) ? payment.type : Plans.ORG_PRO;
  const targetPlan = canStartTrial ? trialPlan : nextPlan;
  const targetUrl = new PaymentUrlSerializer()
    .of(orgId)
    .period(payment.period || PERIOD.ANNUAL)
    .trial(canChargeTrial)
    .plan(targetPlan)
    .returnUrlParam()
    .get();

  return (
    <Text size="sm" type="body" color="var(--kiwi-colors-semantic-error)">
      {content}&nbsp;
      {(isFree || (!isFree && isManager)) && (
        <Text
          className={styles.actionText}
          component="b"
          size="sm"
          type="body"
          color="var(--kiwi-colors-semantic-error)"
          onClick={() => navigate(targetUrl)}
        >
          {canChargeTrial ? t('common.startFreeTrial') : t('common.upgradeNow')}.
        </Text>
      )}
    </Text>
  );
};

export default ReachDocStackLimit;
