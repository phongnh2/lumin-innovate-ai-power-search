import { Button, Link as KiwiLink } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { OrganizationUtilities } from 'utils/Factory/Organization';
import { PaymentUtilities } from 'utils/Factory/Payment';
import { getFullPathWithPresetLang } from 'utils/getLanguage';
import { getPdfPlanLabel, getSignSeatLabel } from 'utils/multilingual';
import { getRedirectOrgUrl } from 'utils/orgUrlUtils';
import { PaymentHelpers, PaymentUrlSerializer } from 'utils/payment';

import { Plans } from 'constants/plan';
import { ORG_ROUTES } from 'constants/Routers';
import { STATIC_PAGE_URL } from 'constants/urls';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { useUpgradeSignSeat } from './useUpgradeSignSeat';
import LinkComponent from '../components/LinkComponent/LinkComponent';

interface Props {
  organization: IOrganization;
  displayOrgInfo?: boolean;
  containerProps?: React.JSX.IntrinsicElements['div'];
  orgNameProps?: React.JSX.IntrinsicElements['p'];
  planProps?: React.JSX.IntrinsicElements['p'];
  handleClosePopper: () => void;
}

const useGetSubscriptionInfo = ({ organization, handleClosePopper }: Props) => {
  const { t } = useTranslation();
  const { payment } = organization || {};
  const paymentUtilities = new PaymentUtilities(payment);
  const organizationUtilities = new OrganizationUtilities({ organization });

  const pdfPlan = paymentUtilities.getPdfPaymentType();

  const isPdfTrial = paymentUtilities.isPdfTrial();
  const isUnifyFree = paymentUtilities.isUnifyFree();
  const isEnterprise = paymentUtilities.isEnterprise();

  const isManager = organizationUtilities.isManager();
  const isSignProSeat = organizationUtilities.isSignProSeat();
  const isRequestUpgradeSignSeat = organizationUtilities.isRequestUpgradeSignSeat();
  const isUpgradeSignSeat = organizationUtilities.isUpgradeSignSeat();

  const { canStartTrial } = payment?.trialInfo || {};
  const { totalUsed, totalStack } = organization.docStackStorage || {};
  const { totalUsed: signTotalUsed, totalStack: signTotalStack } = organization.signDocStackStorage || {};
  const isOldPlan = [Plans.ENTERPRISE].includes(payment?.type);

  const serializer = new PaymentUrlSerializer();

  const { handleSignUpgradeClick } = useUpgradeSignSeat({
    isRequestUpgradeSignSeat,
    isUpgradeSignSeat,
    organization,
  });

  const pdfPlanLabel = `PDF - ${getPdfPlanLabel({ t, type: pdfPlan, isTrial: isPdfTrial })}`;
  const docstackDescription = t('profileButton.docStack', { totalUsed: totalUsed || 0, totalStack: totalStack || 0 });
  const signDocstackDescription = isSignProSeat
    ? t('profileButton.signUnlimitedDocs')
    : t('profileButton.signDocStack', {
        totalUsed: signTotalUsed || 0,
        totalStack: signTotalStack || 0,
      });

  const manageBillingUrl = getRedirectOrgUrl({ orgUrl: organization.url, path: ORG_ROUTES.DASHBOARD_BILLING });

  const signPlanLabel = `Sign - ${getSignSeatLabel({
    t,
    isSignProSeat,
  })}`;

  const handleUpgradeWithClosePopper = async () => {
    handleClosePopper();
    await handleSignUpgradeClick();
  };

  const getUpgradeAction = () => {
    if (isRequestUpgradeSignSeat) {
      return (
        <KiwiLink onClick={handleUpgradeWithClosePopper} size="md">
          {t('profileButton.requestUpgrade.cta')}
        </KiwiLink>
      );
    }

    if (isUpgradeSignSeat) {
      return (
        <KiwiLink onClick={handleUpgradeWithClosePopper} size="md">
          {t('common.upgrade')}
        </KiwiLink>
      );
    }

    if (isUnifyFree) {
      return (
        <KiwiLink onClick={handleUpgradeWithClosePopper} size="md">
          {t('common.upgrade')}
        </KiwiLink>
      );
    }

    return null;
  };

  const LinkComponentWithClosePopper = ({ children, ...props }: React.ComponentProps<typeof LinkComponent>) => (
    <LinkComponent {...props} onClick={handleClosePopper}>
      {children}
    </LinkComponent>
  );

  const renderPdfAction = () => {
    if (isEnterprise || !payment) {
      return null;
    }
    if (isUnifyFree && canStartTrial) {
      const plan = PaymentHelpers.evaluateTrialPlan(payment.trialInfo);
      const url = serializer.of(organization._id).trial(true).plan(plan).returnUrlParam().get();

      return (
        <LinkComponentWithClosePopper data-lumin-btn-name={ButtonName.START_TRIAL_ON_PROFILE_POP_OVER} to={url}>
          <KiwiLink size="md">{t('common.getFreeStack')}</KiwiLink>
        </LinkComponentWithClosePopper>
      );
    }

    const upgradeUrl = PaymentHelpers.getNextPaymentUrl({ payment, orgId: organization._id });
    if (isUnifyFree || isManager) {
      return (
        <LinkComponentWithClosePopper data-lumin-btn-name={ButtonName.GO_PREMIUM_ON_PROFILE_POP_OVER} to={upgradeUrl}>
          <KiwiLink size="md">{t('common.upgrade')}</KiwiLink>
        </LinkComponentWithClosePopper>
      );
    }
    return null;
  };

  const renderSignAction = () => {
    if (isOldPlan) {
      return null;
    }

    if (isEnterprise) {
      return (
        <LinkComponentWithClosePopper
          to={STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSale'))}
          target="_blank"
        >
          <KiwiLink size="md">{t('unifyBillingSettings.contactSales')}</KiwiLink>
        </LinkComponentWithClosePopper>
      );
    }

    const upgradeAction = getUpgradeAction();
    if (upgradeAction) {
      return upgradeAction;
    }

    return null;
  };

  const renderViewAndManageAction = () => {
    if (!isManager) {
      return null;
    }
    return (
      <LinkComponentWithClosePopper to={manageBillingUrl}>
        <Button size="md" variant="elevated" style={{ width: '100%' }}>
          {t('profileButton.viewAndManage')}
        </Button>
      </LinkComponentWithClosePopper>
    );
  };

  return {
    pdfPlanLabel,
    signPlanLabel,
    docstackDescription,
    signDocstackDescription,
    renderPdfAction,
    renderViewAndManageAction,
    renderSignAction,
  };
};

export default useGetSubscriptionInfo;
