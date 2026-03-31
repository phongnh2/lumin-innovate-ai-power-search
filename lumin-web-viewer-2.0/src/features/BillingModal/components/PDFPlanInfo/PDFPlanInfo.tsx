import { Collapse, Divider, IconButton, Text } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';

import LuminLogo from 'assets/reskin/lumin-svgs/logo-pdf-rounded.svg';

import { useTranslation } from 'hooks';

import { PLAN_TYPE_LABEL } from 'constants/plan';
import { PRICING_URL } from 'constants/urls';

import useGetInfoPlan from '../../hooks/useGetInfoPlan';
import { useTrialModalContext } from '../../hooks/useTrialModalContext';
import PDFFeatures from '../PDFFeatures/PDFFeatures';

import styles from './PDFPlanInfo.module.scss';

const PDFPlanInfo = () => {
  const { t } = useTranslation();
  const { billingInfo } = useTrialModalContext();
  const { plan, period } = billingInfo;
  const { price, documents } = useGetInfoPlan({ currency: billingInfo.currency, plan, period });
  const [collapsed, setCollapsed] = useState(false);
  const isTrial = true;

  return (
    <div className={styles.sectionContainer} data-active={!collapsed}>
      <div className={styles.header}>
        <div className={styles.leftWrapper}>
          <img src={LuminLogo} alt="Lumin Logo" className={styles.logo} />
          <div className={styles.textWrapper}>
            <Text size="sm" type="headline">
              Lumin PDF {PLAN_TYPE_LABEL[plan as keyof typeof PLAN_TYPE_LABEL]} {t('pdfFeatures.trial')}
            </Text>
            {collapsed && (
              <Text size="md" type="body" color="var(--kiwi-colors-surface-on-surface-low)">
                {price} / {documents} / {t('paymentModal.month')}
              </Text>
            )}
          </div>
        </div>
        {!isTrial && (
          <div className={styles.rightWrapper}>
            <IconButton
              size="sm"
              icon={collapsed ? 'ph-caret-down' : 'ph-caret-up'}
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>
        )}
      </div>
      <Collapse in={!collapsed}>
        <div className={styles.collapseContent}>
          <Divider className={styles.divider} />
          <div className={styles.priceWrapper}>
            <Text size="md" type="title" className={styles.price}>
              {price} / {documents} / {t('paymentModal.month')}
            </Text>
            <div className={styles.priceDescription}>
              <Text size="md" type="body" color="var(--kiwi-colors-surface-on-surface-low)">
                <Trans
                  i18nKey="paymentModal.premiumToolsAndDocuments"
                  // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
                  components={{ a: <a href={PRICING_URL} target="_blank" rel="noreferrer" className={styles.link} /> }}
                />
              </Text>
            </div>
          </div>
          <Divider className={styles.divider} />
          <PDFFeatures plan={plan} />
        </div>
      </Collapse>
    </div>
  );
};

export default PDFPlanInfo;
