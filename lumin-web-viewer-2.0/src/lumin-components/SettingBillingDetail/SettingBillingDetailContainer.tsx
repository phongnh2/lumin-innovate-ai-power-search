/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Divider, Text } from 'lumin-ui/kiwi-ui';
import React, { useMemo, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import BillingInvoice from 'luminComponents/BillingInvoice';
import { SettingDialogContext } from 'luminComponents/MySettings/SettingDialogContext';
import SettingBillingForm from 'luminComponents/SettingBillingForm';

import { useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { PaymentUtilities } from 'utils/Factory/Payment';

import { Plans } from 'constants/plan';
import { PaymentTypes } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IOrganizationData, OrganizationList } from 'interfaces/redux/organization.redux.interface';
import { IUser } from 'interfaces/user/user.interface';

import NoOrganizationAvailable from './components/NoOrganizationAvailable';
import SettingBillingDetail from './SettingBillingDetail';

import styles from './SettingBillingDetailContainer.module.scss';

function SettingBillingDetailContainer(): JSX.Element {
  const { data: orgsData } = useSelector<unknown, OrganizationList>(selectors.getOrganizationList, shallowEqual);
  const { data: currentOrganization } = useSelector<unknown, IOrganizationData>(
    selectors.getCurrentOrganization,
    shallowEqual
  );
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const isIndividualPremium = currentUser.payment.type !== Plans.FREE;
  const { t } = useTranslation();

  const canGetOrganizationSubscription = (org: IOrganization) => {
    const { userRole, payment } = org;
    const paymentUtilities = new PaymentUtilities(payment);
    return (
      organizationServices.isManager(userRole) ||
      (organizationServices.isOrgMember(userRole) && paymentUtilities.isUnifyFree())
    );
  };

  const organizations = useMemo(
    () => (orgsData || []).map(({ organization }) => organization).filter((org) => canGetOrganizationSubscription(org)),
    [orgsData]
  );

  const getDefaultSelectedId = (): string => {
    if (currentOrganization && canGetOrganizationSubscription(currentOrganization)) {
      return currentOrganization._id;
    }
    if (isIndividualPremium) {
      return currentUser._id;
    }
    if (organizations.length) {
      return organizations[0]._id;
    }
    return '';
  };

  const [selectedId, setSelectedId] = useState<string>(getDefaultSelectedId());
  const selected = useMemo(
    () => (selectedId === currentUser._id ? currentUser : organizations.find((_org) => _org._id === selectedId)),
    [organizations, currentUser, selectedId]
  );

  if (!selected) {
    return <NoOrganizationAvailable />;
  }
  const { payment, name } = selected;

  const paymentType = selected._id === currentUser._id ? PaymentTypes.INDIVIDUAL : PaymentTypes.ORGANIZATION;

  const organizationId = paymentType === PaymentTypes.ORGANIZATION ? selected._id : null;
  const canShowInvoice =
    payment.customerRemoteId && (isIndividualPremium || organizationServices.isManager(selected?.userRole));
  const isRestricted = Boolean((selected as IOrganization)?.isRestrictedBillingActions);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface)">
          {t('settingBilling.pleaseChooseWorkSpaceToSeeBillingHistory')}
        </Text>
        <SettingBillingDetail
          individual={isIndividualPremium ? currentUser : null}
          organizations={organizations}
          selected={selected}
          isRestricted={isRestricted}
          onSelectedChange={(_entity) => setSelectedId(_entity._id)}
        />
      </div>
      {!isRestricted && canShowInvoice && (
        <>
          <SettingDialogContext.Consumer>
            {({ setDirty }) => (
              <SettingBillingForm
                setDirty={setDirty}
                selectedBilling={{
                  _id: selected._id,
                  type: paymentType,
                  plan: payment.type,
                  payment,
                  name,
                  stripeAccountId: payment.stripeAccountId,
                }}
                organizationId={organizationId}
              />
            )}
          </SettingDialogContext.Consumer>
          <Divider />
          <BillingInvoice clientId={selected._id} currency={selected.payment.currency} paymentType={paymentType} />
        </>
      )}
    </div>
  );
}

export default React.memo(SettingBillingDetailContainer);
