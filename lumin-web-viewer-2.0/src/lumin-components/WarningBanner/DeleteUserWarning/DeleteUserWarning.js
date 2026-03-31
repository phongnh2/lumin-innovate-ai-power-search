import classNames from 'classnames';
import { Button, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { enqueueSnackbar } from '@libs/snackbar';

import { useIsMountedRef } from 'hooks/useIsMountedRef';
import { useTrackingBannerEvent } from 'hooks/useTrackingBannerEvent';
import { useTranslation } from 'hooks/useTranslation';

import userServices from 'services/userServices';

import dateUtils from 'utils/date';
import { BannerName, BannerPurpose } from 'utils/Factory/EventCollection/BannerEventCollection';

import styles from '../WarningBanner.module.scss';

DeleteUserWarning.propTypes = {
  deletedAt: PropTypes.any.isRequired,
};

function DeleteUserWarning({ deletedAt }) {
  const { t } = useTranslation();
  const { trackBannerConfirmation } = useTrackingBannerEvent({
    bannerName: BannerName.DELETE_CIRCLE_WARNING_IN_TOP_BANNER,
    bannerPurpose: BannerPurpose[BannerName.DELETE_CIRCLE_WARNING_IN_TOP_BANNER],
  });
  const [loading, setLoading] = useState(false);
  const isMountedRef = useIsMountedRef();
  const handleReactivateUser = async () => {
    setLoading(true);
    trackBannerConfirmation();
    try {
      await userServices.reactiveAccount();
      enqueueSnackbar({ message: t('settingGeneral.accountHasBeenReactivated') });
    } finally {
      isMountedRef.current && setLoading(false);
    }
  };
  return (
    <div className={classNames(styles.container, styles.lumin)} data-cy="warning_banner_container">
      <div className={styles.contentWrapper}>
        <Text type="body" size="md" color="var(--kiwi-colors-semantic-error)">
          {t('viewer.deleteUserWarning.messageDeleteUserWarning', {
            deletedAt: dateUtils.formatDeleteAccountTime(deletedAt),
          })}
        </Text>
        <Button colorType="error" onClick={handleReactivateUser} loading={loading}>
          {t('common.reactivate')}
        </Button>
      </div>
    </div>
  );
}

export default DeleteUserWarning;
