/* eslint-disable no-nested-ternary */
import { useSubscription } from '@apollo/client';
import { makeStyles } from '@mui/styles';
import { get } from 'lodash';
import { Text, Avatar } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';

import { SUB_UPDATE_ORGANIZATION } from 'graphQL/OrganizationGraph';

import actions from 'actions';

import BillingDetailLoading from 'luminComponents/BillingDetail/components/BillingDetailLoading';
import PersonalBillingDetail from 'luminComponents/BillingDetail/PersonalBillingDetail';
import DefaultSelect from 'luminComponents/DefaultSelect';
import RestrictedBillingActions from 'luminComponents/RestrictedBillingActions';

import { useTranslation } from 'hooks';

import { avatar } from 'utils';

import UnifyBillingSubscriptionSection from 'features/UnifyBillingSubscription';
import UnifyBillingSubscriptionSkeleton from 'features/UnifyBillingSubscription/components/UnifyBillingSubscriptionSkeleton';
import { useGetUnifySubscription, useUnifyBillingSubscriptionStore } from 'features/UnifyBillingSubscription/hooks';

import { PaymentTypes } from 'constants/plan';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IUser } from 'interfaces/user/user.interface';

import styles from './SettingBillingDetailContainer.module.scss';

export const useStyles = makeStyles({
  root: {
    width: '100%',
    maxWidth: 440,
  },
});

type SelectedType = IUser | IOrganization;

type Props = {
  organizations: IOrganization[];
  individual?: IUser;
  selected: SelectedType;
  onSelectedChange: (item: SelectedType) => void;
  isRestricted?: boolean;
};

type OrgOption = {
  label: string;
  value: string;
  data: SelectedType;
};

function SettingBillingDetail({
  selected,
  individual,
  organizations,
  onSelectedChange,
  isRestricted = false,
}: Props): JSX.Element {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const paymentType = selected._id === individual?._id ? PaymentTypes.INDIVIDUAL : PaymentTypes.ORGANIZATION;

  const { isFetching, setIsFetching } = useGetUnifySubscription({
    clientId: selected._id,
    type: paymentType,
    organization: selected as IOrganization,
  });
  const { subscription, upcomingInvoice, reset } = useUnifyBillingSubscriptionStore();

  useSubscription(SUB_UPDATE_ORGANIZATION, {
    variables: {
      orgId: selected._id,
    },
    skip: isRestricted || paymentType === PaymentTypes.INDIVIDUAL,
    shouldResubscribe: true,
    onSubscriptionData: ({ subscriptionData }) => {
      dispatch(
        actions.updateOrganizationInList(
          selected._id,
          get(subscriptionData, 'data.updateOrganization.organization', {})
        )
      );
    },
  });

  const data = useMemo(() => {
    const orgOptions = organizations.map((org) => ({
      label: org.name,
      value: org._id,
      data: org,
    }));
    if (!individual) {
      return orgOptions;
    }
    const individualOption = [
      {
        label: individual.name,
        value: individual._id,
        data: individual,
      },
    ];
    return [
      {
        group: t('setUpOrg.personal'),
        items: individualOption,
      },
      {
        group: t('common.circles'),
        items: orgOptions,
      },
    ];
  }, [individual, organizations]);

  const renderOption = ({ option }: { option: OrgOption }) => (
    <div className={styles.selectOption}>
      <Avatar size="xs" variant="outline" src={avatar.getAvatar(option.data.avatarRemoteId) || DefaultOrgAvatar} />
      <Text ellipsis>{option.data.name}</Text>
    </div>
  );

  const handleSelect = (option: OrgOption) => {
    if (selected._id !== option.value) {
      setIsFetching(true);
      reset();
      onSelectedChange(option.data);
    }
  };

  const leftSection = useMemo(
    () =>
      selected && (
        <Avatar size="xs" variant="outline" src={avatar.getAvatar(selected.avatarRemoteId) || DefaultOrgAvatar} />
      ),
    [selected]
  );

  const renderContent = () => {
    if (isRestricted) {
      return (
        <div className={styles.restrictedSection}>
          <RestrictedBillingActions />
        </div>
      );
    }
    if (paymentType === PaymentTypes.INDIVIDUAL) {
      return isFetching ? (
        <BillingDetailLoading />
      ) : (
        <PersonalBillingDetail user={selected as IUser} subscription={subscription} upcomingInvoice={upcomingInvoice} />
      );
    }
    return isFetching ? (
      <UnifyBillingSubscriptionSkeleton />
    ) : (
      <UnifyBillingSubscriptionSection organization={selected as IOrganization} type={paymentType} />
    );
  };

  return (
    <div className={styles.billingDetail}>
      <div className={styles.selectorWrapper}>
        <DefaultSelect
          size="lg"
          data={data}
          renderOption={renderOption}
          onChange={(_, option) => handleSelect(option as OrgOption)}
          value={selected?._id}
          allowDeselect={false}
          classNames={{
            groupLabel: styles.groupLabel,
            wrapper: styles.selectWrapper,
            input: leftSection ? styles.selectInput : '',
          }}
          scrollAreaProps={{
            mah: 308,
          }}
          leftSection={leftSection}
        />
      </div>
      {renderContent()}
    </div>
  );
}

SettingBillingDetail.defaultProps = {
  individual: null,
};

export default React.memo(SettingBillingDetail);
