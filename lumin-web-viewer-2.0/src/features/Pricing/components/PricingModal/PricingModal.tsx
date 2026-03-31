/* eslint-disable @typescript-eslint/ban-ts-comment */
import { isArray } from 'lodash';
import { Button, Checkbox, Dialog, Text } from 'lumin-ui/kiwi-ui';
import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';

import Icomoon from 'luminComponents/Icomoon';

import { useNetworkStatus, useTranslation } from 'hooks';

import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';

import { Plans } from 'constants/plan';
import { Routers } from 'constants/Routers';
import { PRICING_URL } from 'constants/urls';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { PRICING_PLANS } from '../../constants';
import { PricingPlan } from '../../types';

import styles from './PricingModal.module.scss';

const PlanFeature = ({ feature }: { feature: string }) => (
  <li key={feature} className={styles.planFeature}>
    <Icomoon className="checkbox" color="var(--kiwi-colors-semantic-success)" size={24} />
    <p className={styles.planFeatureText}>{feature}</p>
  </li>
);

const PlanBlock = ({
  pricingPlan,
  onClickStartTrial,
  skip,
}: {
  pricingPlan: PricingPlan;
  onClickStartTrial: (params: { skip: boolean; isPricingModal?: boolean; plan?: string }) => void;
  skip: boolean;
}) => {
  const { t } = useTranslation();
  const { buttonVariant, isMostPopular, featuresKey, description, name, numberOfTrialDays, plan } = pricingPlan;
  const features: string[] = t(featuresKey, { returnObjects: true });

  const getBtnEventName = () => {
    if (plan === Plans.ORG_STARTER) {
      return CNCButtonName.PRO_START_FREE_TRIAL;
    }
    return CNCButtonName.BUSINESS_START_FREE_TRIAL;
  };

  return (
    <div className={plan === Plans.ORG_STARTER ? styles.leftBlock : styles.rightBlock}>
      <div className={styles.planInfo}>
        <p className={styles.planText}>{name}</p>
        {isMostPopular && <div className={styles.badge}>{t('plan.planBox.mostPopular')}</div>}
      </div>
      <p className={styles.planDescription}>{t(description)}</p>
      <ul className={styles.planFeatures}>
        {(isArray(features) ? features : []).map((feature) => (
          <PlanFeature key={feature} feature={feature} />
        ))}
      </ul>
      <Button
        size="lg"
        variant={buttonVariant}
        w="fit-content"
        onClick={() => onClickStartTrial({ skip, isPricingModal: true, plan })}
        data-lumin-btn-name={getBtnEventName()}
        data-lumin-btn-purpose={CNCButtonPurpose[getBtnEventName()]}
      >
        {t('pricingModal.startTrial', { numberOfDays: numberOfTrialDays })}
      </Button>
    </div>
  );
};

const PricingModal = ({
  onClickStartTrial,
  onClose,
  trackModalConfirmation,
}: {
  onClickStartTrial: (params: { skip: boolean; isPricingModal?: boolean; plan?: string }) => void;
  onClose: ({ skip }: { skip: boolean }) => void;
  trackModalConfirmation: () => Promise<void>;
}) => {
  const { t } = useTranslation();
  const { isOffline } = useNetworkStatus();
  const url = new URL(PRICING_URL);
  url.searchParams.set(UrlSearchParam.FROM, Routers.CHECKOUT);
  const [skip, setSkip] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkip(e.target.checked);
  };

  return (
    <Dialog
      closeOnClickOutside={false}
      headerTitle={t('pricingModal.title')}
      opened={!isOffline}
      onClose={() => onClose({ skip })}
      size="lg"
      withCloseButton
    >
      <div className={styles.content}>
        {PRICING_PLANS.map((pricingPlan, index) => (
          <Fragment key={pricingPlan.name}>
            <PlanBlock pricingPlan={pricingPlan} onClickStartTrial={onClickStartTrial} skip={skip} />
            {index === 0 && <div className={styles.divider} />}
          </Fragment>
        ))}
      </div>
      <div className={styles.footer}>
        <Checkbox
          label={
            <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface)">
              {t('common.doNotShowAgain')}
            </Text>
          }
          color="var(--kiwi-colors-surface-on-surface)"
          size="md"
          checked={skip}
          onChange={handleCheckboxChange}
        />
        <Button
          size="lg"
          variant="outlined"
          // @ts-ignore
          component={Link}
          to={url.toString()}
          onClick={trackModalConfirmation}
          data-lumin-btn-name={CNCButtonName.VIEW_ALL_PLANS}
          data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.VIEW_ALL_PLANS]}
        >
          {t('pricingModal.viewAllPlans')}
        </Button>
      </div>
    </Dialog>
  );
};

export default PricingModal;
