import React from 'react';
import { Trans } from 'react-i18next';
import { useMatch } from 'react-router';

import HappyWorking from 'assets/reskin/images/happy-working.png';

import { Routers } from 'constants/Routers';

import styles from './RestrictedBillingActions.module.scss';

const RestrictedBillingActions = () => {
  const isSettingBillingTab = Boolean(useMatch({ path: Routers.SETTINGS.BILLING, end: false }));

  return (
    <div className={styles.container} data-setting-billing={isSettingBillingTab}>
      <img src={HappyWorking} alt="restrict-billing-actions" />
      <p>
        <Trans
          i18nKey="orgDashboardBilling.restrictedBillingActions"
          components={{
            br: <br />,
          }}
        />
      </p>
    </div>
  );
};

export default RestrictedBillingActions;
