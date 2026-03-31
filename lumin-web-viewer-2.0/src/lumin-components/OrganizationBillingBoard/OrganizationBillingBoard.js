import { Divider } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import selectors from 'selectors';

import BillingInvoice from 'lumin-components/BillingInvoice';
import SettingBillingForm from 'lumin-components/SettingBillingForm';

import withRestrictBillingActionsOrg from 'HOC/withRestrictBillingActionsOrg';

import UnifyBillingSubscriptionSection from 'features/UnifyBillingSubscription';
import UnifyBillingSubscriptionSkeleton from 'features/UnifyBillingSubscription/components/UnifyBillingSubscriptionSkeleton';
import { useGetUnifySubscription } from 'features/UnifyBillingSubscription/hooks';

import { PaymentTypes } from 'constants/plan';

import styles from './OrganizationBillingBoard.module.scss';

function OrganizationBillingBoard({ currentOrganization }) {
  const {
    _id,
    name,
    payment: { currency, customerRemoteId, type, stripeAccountId },
  } = currentOrganization;
  const { isFetching } = useGetUnifySubscription({
    clientId: _id,
    type: PaymentTypes.ORGANIZATION,
    organization: currentOrganization,
  });

  const selectedBilling = useMemo(
    () => ({
      _id,
      type: PaymentTypes.ORGANIZATION,
      plan: type,
      name,
      stripeAccountId,
    }),
    [_id, type, name, stripeAccountId]
  );

  return (
    <div className={styles.container}>
      {isFetching ? (
        <UnifyBillingSubscriptionSkeleton />
      ) : (
        <UnifyBillingSubscriptionSection organization={currentOrganization} type={PaymentTypes.ORGANIZATION} />
      )}
      {customerRemoteId && (
        <>
          <SettingBillingForm selectedBilling={selectedBilling} organizationId={_id} />
          <Divider />
          <BillingInvoice clientId={_id} currency={currency} paymentType={PaymentTypes.ORGANIZATION} />
        </>
      )}
    </div>
  );
}

OrganizationBillingBoard.propTypes = {
  currentOrganization: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state).data,
});

export default compose(connect(mapStateToProps), React.memo, withRestrictBillingActionsOrg)(OrganizationBillingBoard);
