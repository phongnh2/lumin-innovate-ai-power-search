import classNames from 'classnames';
import { isEmpty } from 'lodash';
import { PlainTooltip, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import PdfLogo from 'assets/reskin/lumin-svgs/logo-pdf-square-sm.svg';
import SignLogo from 'assets/reskin/lumin-svgs/logo-sign-square-sm.svg';

import { useTranslation } from 'hooks';

import { PaymentUtilities } from 'utils/Factory/Payment';
import { getSignPlanLabel, getPdfPlanLabel } from 'utils/multilingual';

import { PaymentPlans } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';

import styles from './OrgNameAndPlanInfo.module.scss';

interface Props {
  organization: IOrganization;
  displayOrgInfo?: boolean;
  containerProps?: React.JSX.IntrinsicElements['div'];
  orgNameProps?: React.JSX.IntrinsicElements['p'];
  planProps?: React.JSX.IntrinsicElements['p'];
}

const OrgNameAndPlanInfo = ({
  organization,
  containerProps,
  orgNameProps,
  planProps,
  displayOrgInfo = true,
}: Props) => {
  const { t } = useTranslation();

  if (isEmpty(organization)) {
    return null;
  }

  const paymentUtilities = new PaymentUtilities(organization.payment);
  const pdfPlan = paymentUtilities.getPdfPaymentType();
  const signPlan = paymentUtilities.getSignPlan() as unknown as PaymentPlans;
  const isPdfTrial = paymentUtilities.isPdfTrial();
  const isUnifyFree = paymentUtilities.isUnifyFree();
  const getShortDescription = () => {
    if (isUnifyFree) {
      return t('common.freePlan');
    }
    return t('common.premiumPlan');
  };

  const getPlanList = () => [
    {
      logo: PdfLogo,
      label: `PDF - ${getPdfPlanLabel({ t, type: pdfPlan, isTrial: isPdfTrial })}`,
    },
    {
      logo: SignLogo,
      label: `Sign - ${getSignPlanLabel({ type: signPlan })}`,
    },
  ];

  const renderTooltipContent = () => (
    <div className={styles.planInfoTooltipContent}>
      <Text type="title" size="sm">
        {organization.name}
      </Text>
      <div className={styles.planListWrapper}>
        {getPlanList().map(({ logo, label }) => (
          <div key={label} className={styles.planInfoTooltipItem}>
            <img src={logo} alt={label} className={styles.logo} />
            <Text type="body" size="sm">
              {label}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <PlainTooltip
      content={renderTooltipContent()}
      className={styles.planInfoTooltip}
      style={{ backgroundColor: 'unset', padding: 0, borderRadius: 0 }}
    >
      <div className={classNames(styles.wrapper, containerProps?.className)}>
        {displayOrgInfo && <p className={classNames(styles.orgName, orgNameProps?.className)}>{organization.name}</p>}
        <p className={classNames(styles.planDescription, planProps?.className)}>{getShortDescription()}</p>
      </div>
    </PlainTooltip>
  );
};

export default OrgNameAndPlanInfo;
