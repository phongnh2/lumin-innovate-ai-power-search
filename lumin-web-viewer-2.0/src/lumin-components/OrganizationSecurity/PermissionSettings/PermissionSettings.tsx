/* eslint-disable @typescript-eslint/unbound-method */
import { RadioGroup } from '@mui/material';
import classNames from 'classnames';
import { RadioGroup as KiwiRadioGroup, Radio as KiwiRadio, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';
import { TFunction, Trans } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { SubscriptionBadge } from 'screens/OrganizationDashboard/components/SubscriptionBadge';

import Highlight, { useHighlight } from 'luminComponents/Highlight';
import Radio from 'luminComponents/Shared/Radio';

import { useEnableWebReskin, useGetCurrentOrganization, useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { useGetScimEnabled } from 'features/SamlSso/hooks';

import { InviteUsersSetting } from 'constants/organization.enum';
import { SettingSections } from 'constants/organizationConstants';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import useChangeInvitePermission from './hooks/useChangeInvitePermission';
import styles from '../OrganizationSecurity.module.scss';
import * as Styled from '../OrganizationSecurity.styled';
import { useGetPermission } from '../VisibilitySettings/hooks/useGetPermission';

const getRadioList = ({ t }: { t: TFunction }) => [
  {
    value: InviteUsersSetting.ADMIN_BILLING_CAN_INVITE,
    label: t('orgDashboardSecurity.orgAdministrators'),
    subscriptionRequired: true,
  },
  {
    value: InviteUsersSetting.ANYONE_CAN_INVITE,
    label: t('orgDashboardSecurity.allMembers'),
    subscriptionRequired: false,
  },
];

const PermissionSettings = () => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const [searchParams] = useSearchParams();
  const currentOrganization = useGetCurrentOrganization();
  const { settings } = currentOrganization;
  const { changeInvitePermission } = useChangeInvitePermission();
  const { inviteUsersSetting } = settings || {};
  const { toggleHighlight, isHighlight } = useHighlight();
  const { canModifySecurity } = useGetPermission();

  const renderList = (label: string, requiredUpgrade: boolean) => (
    <Styled.ListWrapper>
      <Styled.BadgeWrapper>
        <Styled.Label>{label}</Styled.Label>
        {requiredUpgrade && <SubscriptionBadge elementName={ButtonName.SECURITY_INVITE_PERMISSION_ADMIN } />}
      </Styled.BadgeWrapper>
    </Styled.ListWrapper>
  );

  useEffect(() => {
    const sectionHighlight = searchParams.get(UrlSearchParam.SECTION);
    toggleHighlight(sectionHighlight === SettingSections.INVITE_PERMISSION);
  }, []);

  const isScimEnabled = useGetScimEnabled();

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        <h3 className={styles.heading}>{t('orgDashboardSecurity.permission')}</h3>
        <Highlight scrollOptions={{ block: 'center' }} isHighlight={isHighlight}>
          <PlainTooltip
            floating
            content={t('scimProvision.featureDisabledWhileSCIMEnabledMessage')}
            position="right-end"
            disabled={!isScimEnabled}
          >
            <div className={classNames(styles.content, { [styles.disabledContent]: isScimEnabled })}>
              <div className={styles.permissionDescriptionWrapper}>
                <p className={styles.title}>{t('orgDashboardSecurity.inviteSettings')}</p>
                <p className={styles.description}>
                  {t('orgDashboardSecurity.inviteSettingsDescription')}
                </p>
              </div>
              <KiwiRadioGroup onChange={changeInvitePermission} value={inviteUsersSetting}>
                <div className={styles.radioGroup}>
                  {getRadioList({ t }).map((item) => {
                    const isChecked = inviteUsersSetting === item.value;
                    const requiredUpgrade = !isChecked && item.subscriptionRequired && !canModifySecurity;

                    return (
                      <KiwiRadio
                        key={item.value}
                        value={item.value}
                        name={item.value}
                        label={
                          <div className={styles.radioLabelWrapper}>
                            <div className={styles.titleWrapper}>
                              <p className={styles.title} data-disabled={requiredUpgrade}>
                                {item.label}
                              </p>
                              {requiredUpgrade && (
                                <SubscriptionBadge elementName={ButtonName.SECURITY_INVITE_PERMISSION_ADMIN} />
                              )}
                            </div>
                          </div>
                        }
                        disabled={requiredUpgrade}
                        classNames={{
                          label: styles.radioLabel,
                        }}
                      />
                    );
                  })}
                </div>
              </KiwiRadioGroup>
              </div>
          </PlainTooltip>
        </Highlight>
      </div>
    );
  }

  return (
    <>
      <Styled.Title>{t('orgDashboardSecurity.permission')}</Styled.Title>
      <Highlight isHighlight={isHighlight}>
        <Styled.Container>
          <Styled.DescriptionWrapper>
            <Styled.Label>{t('orgDashboardSecurity.inviteSettings')}</Styled.Label>
            <Styled.Description>
              <Trans
                i18nKey="orgDashboardSecurity.inviteSettingsDescription"
              />
            </Styled.Description>
          </Styled.DescriptionWrapper>
          <RadioGroup onChange={changeInvitePermission}>
            {getRadioList({ t }).map((item, index) => {
              const isChecked = inviteUsersSetting === item.value;
              const requiredUpgrade = !isChecked && item.subscriptionRequired && !canModifySecurity;

              return (
                <Styled.FormControlLabel
                  key={index}
                  checked={isChecked}
                  value={item.value}
                  control={<Radio size={20} />}
                  label={renderList(item.label, requiredUpgrade)}
                  disabled={requiredUpgrade}
                />
              );
            })}
          </RadioGroup>
        </Styled.Container>
      </Highlight>
    </>
  );
};

export default PermissionSettings;
