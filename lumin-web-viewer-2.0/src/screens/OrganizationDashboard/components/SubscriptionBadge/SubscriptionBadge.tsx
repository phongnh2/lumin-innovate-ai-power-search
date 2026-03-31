import { Chip, PlainTooltip, Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import BusinessLabel from 'assets/reskin/lumin-svgs/business-label.svg';

import selectors from 'selectors';

import Icomoon from 'luminComponents/Icomoon';
import Tooltip from 'luminComponents/Shared/Tooltip';

import { useEnableWebReskin, useTranslation } from 'hooks';

import organizationTracking from 'services/awsTracking/organizationTracking';

import { PaymentUrlSerializer } from 'utils/payment';

import { PERIOD, Plans } from 'constants/plan';

import { IOrganizationData } from 'interfaces/redux/organization.redux.interface';

import styles from './SubscriptionBadge.module.scss';

const SubscriptionBadge = ({ elementName }: { elementName: string }) => {
  const { isEnableReskin } = useEnableWebReskin();
  const { data: currentOrganization } = useSelector<unknown, IOrganizationData>(
    selectors.getCurrentOrganization,
    shallowEqual
  );
  const { _id: orgId } = currentOrganization || {};

  const { t } = useTranslation();
  const paymentUrlSerializer = new PaymentUrlSerializer();
  const businessUrl = paymentUrlSerializer
    .of(orgId)
    .trial(false)
    .period(PERIOD.ANNUAL)
    .plan(Plans.ORG_BUSINESS)
    .returnUrlParam()
    .get();

  const onClick = () => {
    organizationTracking.trackUpgradeIntent({ elementName });
  };

  if (isEnableReskin) {
    return (
      <PlainTooltip content={t('orgDashboardSecurity.upgradeToUseThisFeature')} offset={12}>
        <Link to={businessUrl} onClick={onClick} target="_blank">
          <Chip
            variant="light"
            label={
              <div className={styles.businessLabelWrapper}>
                <img src={BusinessLabel} alt="BUSINESS" />
              </div>
            }
            rightIcon={<KiwiIcomoon size="sm" type="external-link-sm" />}
            rounded
            className={styles.chip}
            enablePointerEvents
          />
        </Link>
      </PlainTooltip>
    );
  }

  return (
    <Tooltip
      title={t('orgDashboardSecurity.upgradeToUseThisFeature')}
      placement="top"
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -10],
              },
            },
          ],
        },
      }}
    >
      <button className={styles.container} onClick={onClick}>
        <p className={styles.text}>BUSINESS</p>
        <Icomoon className="arrow-up-right" />
      </button>
    </Tooltip>
  );
};
export default SubscriptionBadge;
