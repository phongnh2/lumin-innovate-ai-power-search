import { CircularProgress, Select, Avatar, Chip, Text, TextInput, SelectProps } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';

import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { avatar } from 'utils';

import { PLAN_CHIP_COLORS, PLAN_TYPE_LABEL } from 'constants/plan';
import { PaymentStatus } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IOrganizationPayment } from 'interfaces/payment/payment.interface';

import styles from './WorkspaceInfo.module.scss';

type OrganizationData = {
  name: string;
  value: string;
  payment: IOrganizationPayment;
  avatar: string;
};

type ComboboxItem = {
  label: string;
  value: string;
  data: OrganizationData;
  paymentType: string;
};

type WorkspaceInfoProps = {
  onOrganizationSelect: (organization: OrganizationData) => void;
  currentOrganization: IOrganization;
  newOrganization: { name: string; error: string };
  setNewOrganization: (newOrganization: { name: string; error: string }) => void;
  selectProps: SelectProps;
};

const WorkspaceInfo = ({
  onOrganizationSelect,
  currentOrganization,
  newOrganization,
  setNewOrganization,
  selectProps,
}: WorkspaceInfoProps) => {
  const { t } = useTranslation();
  const availablePaidOrgs = useSelector(selectors.availablePaidOrgs, shallowEqual);
  const isPurchasing = useSelector(selectors.getPurchaseState);

  const organizationList = useSelector(selectors.getOrganizationList, shallowEqual);

  const { loading: organizationsLoading } = organizationList;

  const renderOption = ({ option }: { option: ComboboxItem }) => {
    const paymentType = option.data.payment.type as keyof typeof PLAN_TYPE_LABEL;
    const trialing = option.data.payment.status === PaymentStatus.TRIALING;
    const label = [PLAN_TYPE_LABEL[paymentType], trialing && 'TRIAL'].filter(Boolean).join(' ').toUpperCase();
    return (
      <div className={styles.selectOption}>
        <Avatar size="xs" variant="outline" src={option.data.avatar} />
        <Text ellipsis>{option.data.name}</Text>
        <Chip label={label} size="sm" style={PLAN_CHIP_COLORS[paymentType]} />
      </div>
    );
  };

  const renderOrganizationOption = ({ organization }: { organization: IOrganization }): ComboboxItem => ({
    label: organization.name,
    value: organization._id,
    data: {
      name: organization.name,
      value: organization._id,
      payment: organization.payment,
      avatar: avatar.getAvatar(organization.avatarRemoteId) || DefaultOrgAvatar,
    },
    paymentType: organization.payment.type,
  });

  const leftSection = useMemo(
    () =>
      currentOrganization && (
        <Avatar
          size="xs"
          variant="outline"
          src={avatar.getAvatar(currentOrganization.avatarRemoteId) || DefaultOrgAvatar}
        />
      ),
    [currentOrganization]
  );

  const rightSection = useMemo(() => {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    if (selectProps) return <></>;
    if (organizationsLoading || isPurchasing) return <CircularProgress size="xs" />;
    return null;
  }, [selectProps, organizationsLoading, isPurchasing]);

  return (
    <div className={styles.container}>
      {availablePaidOrgs.length ? (
        <Select
          placeholder={`- ${t('paymentModal.chooseOrganization')} -`}
          data={availablePaidOrgs.map(renderOrganizationOption)}
          size="lg"
          rightSection={rightSection}
          rightSectionProps={{
            color: organizationsLoading || isPurchasing ? 'var(--input-disabled-color)' : 'var(--input-color)',
          }}
          disabled={organizationsLoading || isPurchasing}
          renderOption={renderOption}
          onChange={(_value, option: ComboboxItem) => onOrganizationSelect(option.data)}
          value={currentOrganization?._id}
          allowDeselect={false}
          className={styles.selectOrg}
          leftSection={leftSection}
          classNames={{
            wrapper: styles.selectWrapper,
            input: leftSection ? styles.selectInput : '',
          }}
          {...selectProps}
        />
      ) : (
        <>
          <Text type="title" size="sm" className={styles.inputLabel}>
            {t('common.orgName')}
          </Text>
          <TextInput
            value={newOrganization.name}
            onChange={(e) => setNewOrganization({ ...newOrganization, name: e.target.value })}
            error={newOrganization.error}
          />
        </>
      )}
    </div>
  );
};

export default WorkspaceInfo;
