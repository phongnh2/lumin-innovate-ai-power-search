import classNames from 'classnames';
import { PlainTooltip, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import PdfLogo from 'assets/reskin/lumin-svgs/logo-pdf-line.svg';
import SignLogo from 'assets/reskin/lumin-svgs/logo-sign-line.svg';

import useGetSubscriptionInfo from 'luminComponents/ProfileButton/hooks/useGetSubscriptionInfo';

import { useTranslation } from 'hooks';
import { useCheckNewPriceModel } from 'hooks/useCheckNewPriceModel';

import { TOOLTIP_OPEN_DELAY } from 'constants/lumin-common';
import { Plans } from 'constants/plan';

import { IOrganization } from 'interfaces/organization/organization.interface';

import styles from '../PopperContent/PopperContent.module.scss';

type Props = {
  currentOrganization: IOrganization;
  handleClosePopper: () => void;
};

const OrganizationProfile = ({ currentOrganization, handleClosePopper }: Props): JSX.Element => {
  const { payment } = currentOrganization;
  const { t } = useTranslation();
  const { isHideDocStackBar } = useCheckNewPriceModel();
  const {
    docstackDescription,
    pdfPlanLabel,
    signPlanLabel,
    signDocstackDescription,
    renderPdfAction,
    renderViewAndManageAction,
    renderSignAction,
  } = useGetSubscriptionInfo({
    organization: currentOrganization,
    handleClosePopper,
  });

  // TODO: handle old plan
  const isOldPlan = [Plans.BUSINESS, Plans.ENTERPRISE].includes(payment?.type);

  return (
    <div className={classNames(styles.section, styles.orgInfo)}>
      <PlainTooltip
        content={t('profileButton.quotaTooltip', { orgName: currentOrganization.name })}
        position="top-start"
        openDelay={TOOLTIP_OPEN_DELAY}
      >
        <Text type="title" size="sm" component="div" className={styles.quota}>
          <Trans
            i18nKey="profileButton.quota"
            values={{ orgName: currentOrganization.name }}
            components={{
              div: <Text ellipsis />,
              span: <span className={styles.quotaText} />,
              spanLeft: <span className={styles.quotaTextLeft} />,
              spanRight: <span className={styles.quotaTextRight} />,
            }}
          />
        </Text>
      </PlainTooltip>
      <div className={styles.subscriptionItemContainer}>
        <div className={styles.logoWrapper}>
          <img src={PdfLogo} alt="PDF" />
        </div>
        <div className={styles.planInfoWrapper}>
          <div>
            <span className={styles.planLabel}>{pdfPlanLabel}</span>
            {renderPdfAction()}
          </div>
          <div className={styles.description}>
            {isHideDocStackBar || isOldPlan ? t('profileButton.unlimitedDocs') : docstackDescription}
          </div>
        </div>
      </div>
      <div className={styles.subscriptionItemContainer}>
        <div className={classNames(styles.logoWrapper, styles.signLogoWrapper)}>
          <img src={SignLogo} alt="Sign" />
        </div>
        <div className={styles.planInfoWrapper}>
          <div className={styles.planInfo}>
            <span className={styles.planLabel}>{signPlanLabel}</span>
            {renderSignAction()}
          </div>
          <div className={styles.description}>{signDocstackDescription}</div>
        </div>
      </div>
      {renderViewAndManageAction()}
    </div>
  );
};

export default OrganizationProfile;
