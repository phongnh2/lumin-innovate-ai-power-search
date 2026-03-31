import { Chip, CircularProgress, Icomoon, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';

import useGetQuantity from 'src/screens/Payment/hooks/useGetQuantity';

import selectors from 'selectors';

import DefaultSelect from 'luminComponents/DefaultSelect';
import InputNumber from 'luminComponents/Shared/InputNumber';

import { useMatchPaymentRoute, useTranslation } from 'hooks';

import { paymentUtil } from 'utils';
import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { ORGANIZATION_MAX_MEMBERS } from 'constants/organizationConstants';
import { PERIOD, PLAN_CHIP_COLORS, PLAN_TYPE_LABEL, Plans } from 'constants/plan';
import { PaymentStatus } from 'constants/plan.enum';
import { STATIC_PAGE_URL } from 'constants/urls';

import OrganizationName from './OrganizationName';
import * as Styled from '../PaymentForm.styled';

import styles from './OrganizationInfo.module.scss';

function OrganizationInfo({
  currentOrganization,
  onOrganizationSelect,
  onSizeChange,
  newOrganization,
  setNewOrganization,
}) {
  const { period, plan } = useMatchPaymentRoute();
  const isOnOldPaymentPage = plan === Plans.BUSINESS;
  const organizationList = useSelector(selectors.getOrganizationList, shallowEqual);
  const availablePaidOrgs = useSelector(selectors.availablePaidOrgs, shallowEqual);
  const isPurchasing = useSelector(selectors.getPurchaseState);
  const { quantity } = useGetQuantity({ currentOrganization });
  const { t } = useTranslation();

  const { loading: organizationsLoading } = organizationList;

  const isOldPlan = currentOrganization?.payment.type === Plans.BUSINESS;

  const minQuantity =
    availablePaidOrgs.length && isOnOldPaymentPage ? paymentUtil.getQuantityInOrgOldPlan(currentOrganization) : 1;

  const [size, setSize] = useState(minQuantity);

  const [focus, setFocus] = useState(false);

  const isInputDisabled =
    (currentOrganization?.payment.period === PERIOD.ANNUAL && period === PERIOD.MONTHLY) || isPurchasing;

  const renderOrganizationOptionReskin = ({ organization }) => ({
    label: organization.name,
    value: organization._id,
    data: {
      name: organization.name,
      value: organization._id,
      payment: organization.payment,
    },
    paymentType: organization.payment.type,
  });
  const shouldShowQuantityInput = () => isOldPlan && isOnOldPaymentPage && currentOrganization?._id;

  const renderOption = ({ option }) => {
    const paymentType = option.data.payment.type;
    const trialing = option.data.payment.status === PaymentStatus.TRIALING;
    const label = [PLAN_TYPE_LABEL[paymentType], trialing && 'TRIAL'].filter(Boolean).join(' ').toUpperCase();
    return (
      <div className={styles.selectOption}>
        <Text ellipsis>{option.data.name}</Text>
        <Chip label={label} size="sm" style={PLAN_CHIP_COLORS[paymentType]} />
      </div>
    );
  };

  useEffect(() => {
    if (!availablePaidOrgs.length) {
      return;
    }
    setSize(quantity);
  }, [currentOrganization, period]);

  useEffect(() => {
    if (focus) {
      return;
    }
    onSizeChange(size);
  }, [size, focus, onSizeChange]);

  return (
    <div className={styles.container}>
      <Text type="headline" size="md" className={styles.orgInfoTitle}>
        {t('common.orgInfo')}
      </Text>
      <div data-show-quantity={Boolean(shouldShowQuantityInput())} className={styles.inputWrapper}>
        <div>
          {isOnOldPaymentPage && isOldPlan && (
            <Text type="title" size="sm" className={styles.inputLabel}>
              {t('organization', { ns: 'terms' })}
            </Text>
          )}
          {availablePaidOrgs.length ? (
            <DefaultSelect
              placeholder={`- ${t('common.chooseOne')} -`}
              data={availablePaidOrgs.map(renderOrganizationOptionReskin)}
              size="lg"
              rightSection={organizationsLoading ? <CircularProgress size="xs" /> : null}
              rightSectionColor={
                organizationsLoading || isPurchasing ? 'var(--input-disabled-color)' : 'var(--input-color)'
              }
              disabled={organizationsLoading || isPurchasing}
              renderOption={renderOption}
              onChange={(_value, option) => onOrganizationSelect(option.data)}
              value={currentOrganization?._id}
              allowDeselect={false}
              className={styles.selectOrg}
            />
          ) : (
            <>
              <Text type="title" size="sm" className={styles.inputLabel}>
                {t('common.orgName')}
              </Text>
              <OrganizationName
                newOrganization={newOrganization}
                setNewOrganization={setNewOrganization}
                isEnableReskin
              />
            </>
          )}
        </div>
        {shouldShowQuantityInput() && (
          <Styled.InputNumberWrapper>
            <Text type="title" size="sm" className={styles.inputLabel}>
              {t('payment.numberOfMembers')}
            </Text>
            <InputNumber
              onChange={(value) => setSize(value)}
              value={Number(size)}
              max={ORGANIZATION_MAX_MEMBERS}
              min={minQuantity}
              disabled={isInputDisabled}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              isEnableReskin
            />
          </Styled.InputNumberWrapper>
        )}
      </div>
      {shouldShowQuantityInput() && (
        <div className={styles.messageContainer}>
          <Icomoon type="info-circle-md" size="md" />
          <Text type="label" size="sm">
            <Trans
              i18nKey="payment.orgInfoMessage"
              values={{ minQuantity, maxMembers: ORGANIZATION_MAX_MEMBERS }}
              components={{
                a: (
                  // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
                  <a
                    className={styles.contactUs}
                    target="_blank"
                    rel="noreferrer"
                    href={STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSale'))}
                  />
                ),
              }}
            />
          </Text>
        </div>
      )}
    </div>
  );
}

OrganizationInfo.propTypes = {
  onOrganizationSelect: PropTypes.func.isRequired,
  onSizeChange: PropTypes.func,
  currentOrganization: PropTypes.object,
  newOrganization: PropTypes.object,
  setNewOrganization: PropTypes.func,
};

OrganizationInfo.defaultProps = {
  currentOrganization: null,
  onSizeChange: () => {},
  newOrganization: {},
  setNewOrganization: () => {},
};

export default OrganizationInfo;
