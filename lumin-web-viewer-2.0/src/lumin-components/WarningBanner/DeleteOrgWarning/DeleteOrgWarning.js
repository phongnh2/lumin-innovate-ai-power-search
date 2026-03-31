import classNames from 'classnames';
import { Button, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import { enqueueSnackbar } from '@libs/snackbar';

import { WarningBannerContext } from 'HOC/withWarningBanner';

import { useTranslation } from 'hooks';
import { useTrackingBannerEvent } from 'hooks/useTrackingBannerEvent';

import organizationServices from 'services/organizationServices';

import dateUtil from 'utils/date';
import { BannerName, BannerPurpose } from 'utils/Factory/EventCollection/BannerEventCollection';

import { WarningBannerType } from 'constants/banner';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { PaymentTypes } from 'constants/plan';

import styles from '../WarningBanner.module.scss';

const propTypes = {
  deletedAt: PropTypes.string.isRequired,
  orgId: PropTypes.string.isRequired,
  userRole: PropTypes.string.isRequired,
};

const DeleteOrgWarning = ({ deletedAt, orgId, userRole = '' }) => {
  const { t } = useTranslation();
  const bannerContextValue = useContext(WarningBannerContext);
  const { refetch: refetchBillingWarning } = bannerContextValue[WarningBannerType.BILLING_WARNING.value];
  const { trackBannerConfirmation } = useTrackingBannerEvent({
    bannerName: BannerName.DELETE_CIRCLE_WARNING_IN_TOP_BANNER,
    bannerPurpose: BannerPurpose[BannerName.DELETE_CIRCLE_WARNING_IN_TOP_BANNER],
  });

  const getBannerData = () => {
    if (userRole.toUpperCase() === ORGANIZATION_ROLES.ORGANIZATION_ADMIN) {
      return {
        value: t('viewer.deleteOrgWarning.messageAdminDeleteOrgWarning', {
          deletedAt: dateUtil.formatMDYTime(deletedAt),
        }),
        allowReactive: true,
      };
    }

    return {
      value: t('viewer.deleteOrgWarning.messagDeleteOrgWarning', {
        deletedAt: dateUtil.formatMDYTime(deletedAt),
      }),
      allowReactive: false,
    };
  };

  const banner = getBannerData();

  const handleReactivateOrg = async () => {
    trackBannerConfirmation();
    await organizationServices.reactiveOrganization(orgId);
    refetchBillingWarning(orgId, PaymentTypes.ORGANIZATION);
    enqueueSnackbar({
      message: t('viewer.deleteOrgWarning.orgReactivated'),
    });
  };

  return (
    <div className={classNames(styles.container, styles.lumin)} data-cy="warning_banner_container">
      <div className={styles.contentWrapper}>
        <Text type="body" size="md" color="var(--kiwi-colors-semantic-error)">
          {banner.value}
        </Text>
        {banner.allowReactive && (
          <Button onClick={handleReactivateOrg} colorType="error">
            {t('common.reactivate')}
          </Button>
        )}
      </div>
    </div>
  );
};

DeleteOrgWarning.propTypes = propTypes;

export default DeleteOrgWarning;
