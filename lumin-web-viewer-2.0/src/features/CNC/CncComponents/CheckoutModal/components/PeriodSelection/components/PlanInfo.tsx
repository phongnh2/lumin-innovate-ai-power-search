import { ConfettiIcon } from '@luminpdf/icons/dist/csr/Confetti';
import classNames from 'classnames';
import { Divider, Paper, Text, Icomoon, IconButton } from 'lumin-ui/kiwi-ui';
import React, { useContext, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'hooks';

import { PaymentPlans } from 'constants/plan.enum';

import { CheckoutModalContext } from '../../../context/CheckoutModalContext';

import styles from './PlanInfo.module.scss';

const PlanInfo = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const explanationRef = useRef<HTMLDivElement | null>(null);
  const { billingInfo } = useContext(CheckoutModalContext);
  const { plan, period } = billingInfo;
  const planValue = plan?.toLowerCase() || 'org_pro';
  const periodValue = period?.toLowerCase() || 'monthly';

  const renderFeatures = () => {
    const features = t(`checkoutModal.planInfo.${planValue}.features.${periodValue}`, {
      returnObjects: true,
    }) as unknown as string[];

    return features.map((feature: string, index: number) => (
      <div className={styles.gridItem} key={index}>
        <Icomoon type="checkbox-lg" size="lg" color="var(--kiwi-colors-semantic-on-information-container)" />
        <Text type="body" size="md" color="var(--kiwi-colors-semantic-on-information-container)">
          {feature}
        </Text>
      </div>
    ));
  };
  const renderExplanation = () => {
    const description = t('checkoutModal.explanation.description', {
      returnObjects: true,
    }) as unknown as string[];

    return description.map((item: string, index: number) => (
      <div className={styles.gridItem} key={index}>
        <Icomoon type="checks-md" size="md" color="var(--kiwi-colors-core-on-primary-container)" />
        <Text type="body" size="sm" color="var(--kiwi-colors-core-on-primary-container)" className={styles.description}>
          {item}
        </Text>
      </div>
    ));
  };

  const handleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  useEffect(() => {
    if (isExpanded && explanationRef.current) {
      explanationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isExpanded]);

  return (
    <div className={styles.container}>
      <Paper className={styles.paper}>
        <div className={styles.paperContainer}>
          <ConfettiIcon weight="duotone" size={24} />
          <Text type="title" size="sm" color="var(--kiwi-colors-semantic-on-information-container)">
            {t(`checkoutModal.planInfo.${planValue}.title`)}
          </Text>
        </div>
        <Divider />
        <div
          className={classNames([styles.gridContainer, plan === PaymentPlans.ORG_BUSINESS && styles.gridBusinessPlan])}
        >
          {renderFeatures()}
        </div>
      </Paper>
      <div className={styles.explanationContainer} ref={explanationRef}>
        <div className={styles.explanationHeader}>
          <Text type="title" size="xs" color="var(--kiwi-colors-surface-on-surface-variant)">
            {t('checkoutModal.explanation.title')}
          </Text>
          <IconButton
            type="button"
            size="sm"
            icon={<Icomoon type={isExpanded ? 'chevron-up-md' : 'chevron-down-md'} size="md" />}
            onClick={handleExpand}
          />
        </div>
        {isExpanded && <div className={styles.explanationContent}>{renderExplanation()}</div>}
      </div>
    </div>
  );
};

export default PlanInfo;
