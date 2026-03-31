import { RadioGroup } from '@mui/material';
import classNames from 'classnames';
import { RadioGroup as KiwiRadioGroup, Radio as KiwiRadio, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import selectors from 'selectors';

import { SubscriptionBadge } from 'screens/OrganizationDashboard/components/SubscriptionBadge';

import ModalAssociateDomain from 'lumin-components/ModalAssociateDomain';
import SettingExpandList from 'lumin-components/SettingExpandList';
import Radio from 'lumin-components/Shared/Radio';
import Highlight, { useHighlight } from 'luminComponents/Highlight';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { OrganizationUtilities } from 'utils/Factory/Organization';

import { useGetScimEnabled } from 'features/SamlSso/hooks';

import { ASSOCIATE_DOMAIN_MODAL_TYPE } from 'constants/lumin-common';
import { DOMAIN_VISIBILITY_SETTING } from 'constants/organizationConstants';
import { Plans } from 'constants/plan';

import { ButtonAddDomain } from './components';
import { useGetPermission } from './hooks/useGetPermission';
import { useHandleOpenModal } from './hooks/useHandleOpenModal';
import { useHandleRadioChange } from './hooks/useHandleRadioChange';
import styles from '../OrganizationSecurity.module.scss';
import * as Styled from '../OrganizationSecurity.styled';

const LIMIT_ASSOCIATE_EMAIL_DOMAIN = 10;

const getRadioList = ({ t }) => [
  {
    value: DOMAIN_VISIBILITY_SETTING.INVITE_ONLY,
    label: t('orgSettings.inviteOnly'),
    description: t('orgSettings.descInviteOnly'),
    elementNameOfBadge: ButtonName.SECURITY_VISIBILITY_INVITE_ONLY,
  },
  {
    value: DOMAIN_VISIBILITY_SETTING.VISIBLE_AUTO_APPROVE,
    label: t('orgSettings.visibleAutoApprove'),
    description: t('orgSettings.descVisibleAutoApprove'),
    elementNameOfBadge: ButtonName.SECURITY_VISIBILITY_ANYONE_CAN_JOIN,
  },
  {
    value: DOMAIN_VISIBILITY_SETTING.VISIBLE_NEED_APPROVE,
    label: t('orgSettings.visibleNeedApprove'),
    description: t('orgSettings.descVisibleNeedApprove'),
    elementNameOfBadge: ButtonName.SECURITY_VISIBILITY_REQUEST_ACCESS,
  },
];

const VisibilitySettings = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
  const { settings } = currentOrganization;
  const { domainVisibility } = settings || {};
  const orgUtilities = new OrganizationUtilities({ organization: currentOrganization });
  const domainList = orgUtilities.domainList();
  const isDisabledAddDomain = domainList.length >= LIMIT_ASSOCIATE_EMAIL_DOMAIN;
  const { isEnableReskin } = useEnableWebReskin();

  const { canEdit, canDelete, canCreate } = useGetPermission();

  const {
    defaultDomain,
    associateDomainModal,
    setAssociateDomainModal,
    handleOpenAddModal,
    handleOpenEditModal,
    handleOpenDeleteModal,
  } = useHandleOpenModal();

  const { isExpandList, handleRadioChange } = useHandleRadioChange();

  const { toggleHighlight, isHighlight } = useHighlight();

  const renderModal = () => {
    switch (associateDomainModal) {
      case ASSOCIATE_DOMAIN_MODAL_TYPE.ADD:
        return (
          <ModalAssociateDomain.Add
            onClose={() => setAssociateDomainModal(null)}
          />
        );
      case ASSOCIATE_DOMAIN_MODAL_TYPE.EDIT:
        return (
          <ModalAssociateDomain.Edit
            defaultDomain={defaultDomain}
            onClose={() => setAssociateDomainModal(null)}
          />
        );

      default:
        return null;
    }
  };

  const renderList = ({ label, description, requiredUpgrade, elementNameOfBadge }) => {
    if (isEnableReskin) {
      return (
        <div className={styles.radioLabelWrapper}>
          <div className={styles.titleWrapper}>
            <p className={styles.title} data-disabled={requiredUpgrade}>
              {label}
            </p>
            {requiredUpgrade && <SubscriptionBadge elementName={elementNameOfBadge} />}
          </div>
          <p className={styles.description} data-disabled={requiredUpgrade}>
            {description}
          </p>
        </div>
      );
    }
    return (
      <Styled.ListWrapper>
        <Styled.TitleWrapper>
          <Styled.Label>{label}</Styled.Label>
          {requiredUpgrade && <SubscriptionBadge elementName={elementNameOfBadge} />}
        </Styled.TitleWrapper>
        <Styled.Description>{description}</Styled.Description>
      </Styled.ListWrapper>
    );
  };

  const checkRequireUpgrade = (item, isChecked, paymentType) => {
    if (isChecked) {
      return false;
    }

    const isNotMatchedPlan = ![Plans.ORG_BUSINESS, Plans.BUSINESS, Plans.ENTERPRISE].includes(paymentType);
    switch (item.value) {
      case DOMAIN_VISIBILITY_SETTING.INVITE_ONLY:
        return Boolean(domainList.length) && isNotMatchedPlan;
      case DOMAIN_VISIBILITY_SETTING.VISIBLE_AUTO_APPROVE:
        return !domainList.length && isNotMatchedPlan;
      default:
        return isNotMatchedPlan;
    }
  };

  useEffect(() => {
    const sectionParam = searchParams.get('section');
    toggleHighlight(sectionParam === 'visibility');
  }, []);

  const isScimEnabled = useGetScimEnabled();

  if (isEnableReskin) {
    return (
      <>
        <div className={styles.container}>
          <h3 className={styles.heading}>{t('orgSettings.visibilitySettings')}</h3>
          <Highlight scrollOptions={{ block: 'center' }} isHighlight={isHighlight}>
            <PlainTooltip
              floating
              content={t('scimProvision.featureDisabledWhileSCIMEnabledMessage')}
              position="right-end"
              disabled={!isScimEnabled}
            >
              <div className={classNames(styles.content, { [styles.disabledContent]: isScimEnabled })}>
                <KiwiRadioGroup required value={domainVisibility} onChange={handleRadioChange}>
                  <div className={styles.radioGroup}>
                    {getRadioList({ t }).map((item) => {
                      const isChecked = domainVisibility === item.value;
                      const requiredUpgrade = checkRequireUpgrade(item, isChecked, currentOrganization.payment.type);
                      return (
                        <KiwiRadio
                          key={item.value}
                          value={item.value}
                          name={item.value}
                          label={renderList({
                            label: item.label,
                            description: item.description,
                            requiredUpgrade,
                            elementNameOfBadge: item.elementNameOfBadge,
                          })}
                          disabled={requiredUpgrade}
                          classNames={{
                            body: styles.radioBody,
                            inner: styles.radioInner,
                            label: styles.radioLabel,
                          }}
                        />
                      );
                    })}
                  </div>
                </KiwiRadioGroup>
                <SettingExpandList
                  title={t('orgSettings.domainList')}
                  list={orgUtilities.domainList()}
                  buttonElement={
                    <ButtonAddDomain
                      handleOpenAddModal={handleOpenAddModal}
                      isDisabledAddDomain={isDisabledAddDomain}
                      canCreate={canCreate}
                    />
                  }
                  textTooltip={t('orgSettings.numberOfDomainsReachesTheLimit')}
                  canEdit={canEdit}
                  onEdit={handleOpenEditModal}
                  canDelete={canDelete}
                  onDelete={handleOpenDeleteModal}
                  isExpandList={isExpandList}
                />
              </div>
            </PlainTooltip>
          </Highlight>
        </div>
        {renderModal()}
      </>
    );
  }

  return (
    <>
      <Styled.Title>{t('orgSettings.visibilitySettings')}</Styled.Title>
      <Highlight scrollOptions={{ block: 'center' }} isHighlight={isHighlight}>
        <Styled.Container>
          <RadioGroup onChange={handleRadioChange}>
            {getRadioList({ t }).map((item, index) => {
              const isChecked = domainVisibility === item.value;
              const requiredUpgrade = checkRequireUpgrade(item, isChecked, currentOrganization.payment.type);
              return (
                <Styled.FormControlLabel
                  key={index}
                  checked={isChecked}
                  value={item.value}
                  control={<Radio size={20} />}
                  label={renderList({
                    label: item.label,
                    description: item.description,
                    requiredUpgrade,
                    elementNameOfBadge: item.elementNameOfBadge,
                  })}
                  disabled={requiredUpgrade}
                />
              );
            })}
          </RadioGroup>
          <Styled.Wrapper>
            <SettingExpandList
              title={t('orgSettings.domainList')}
              list={orgUtilities.domainList()}
              buttonElement={
                <ButtonAddDomain
                  handleOpenAddModal={handleOpenAddModal}
                  isDisabledAddDomain={isDisabledAddDomain}
                  canCreate={canCreate}
                />
              }
              textTooltip={t('orgSettings.numberOfDomainsReachesTheLimit')}
              canEdit={canEdit}
              onEdit={handleOpenEditModal}
              canDelete={canDelete}
              onDelete={handleOpenDeleteModal}
              isExpandList={isExpandList}
            />
          </Styled.Wrapper>
        </Styled.Container>
      </Highlight>
      {renderModal()}
    </>
  );
};

export default VisibilitySettings;
