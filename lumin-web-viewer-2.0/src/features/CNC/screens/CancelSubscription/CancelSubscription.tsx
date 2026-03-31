import {
  Chip,
  Avatar,
  Icomoon as KiwiIcomoon,
  Button,
  ButtonVariant,
  ButtonSize,
  AvatarGroup,
  PlainTooltip,
} from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';

import selectors from 'selectors';

import { useGetRepresentativeMembers } from 'luminComponents/ReskinLayout/components/DocumentTitle/hooks';

import { useTranslation } from 'hooks';

import { avatar } from 'utils';

import BaseCancellationPage from 'features/CNC/CncComponents/BaseCancellationPage';
import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';
import useGetCancelSubProduct from 'features/CNC/hooks/useGetCancelSubProduct';

import { TOOLTIP_OPEN_DELAY } from 'constants/lumin-common';
import { ORG_TEXT } from 'constants/organizationConstants';

import { IOrganization } from 'interfaces/organization/organization.interface';

import useCancelSubscription from './hooks/useCancelSubscription';
import useGetPremiumFeatureList from './hooks/useGetPremiumFeatureList';

import styles from './CancelSubscription.module.scss';

const MAX_MEMBER = 5;

const CancelSubscription = () => {
  const [loading, setLoading] = useState(false);
  const { data: currentOrganization } = useSelector<unknown, { data: IOrganization }>(
    selectors.getCurrentOrganization,
    shallowEqual
  );
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { search } = useLocation();
  const { isPdf } = useGetCancelSubProduct();
  const { avatarRemoteId, name, totalMember, totalActiveMember, url, totalSignSeats, availableSignSeats } = currentOrganization;
  const isManyPeopleInOrg = totalMember > 1;
  const { cancelPlan, isRestrictedOrg } = useCancelSubscription({ organization: currentOrganization });
  const { isFetching, representativeMembers } = useGetRepresentativeMembers();
  const { premiumFeatureList } = useGetPremiumFeatureList();

  const affectedUsersAmount = isPdf ? totalActiveMember : totalSignSeats - availableSignSeats;

  const getTitle = () => {
    if (isManyPeopleInOrg) {
      if (affectedUsersAmount === 0) {
        return t('restrictionList.youWillLoseAccessToTheFollowingFeatures');
      }

      const key =
        affectedUsersAmount === 1
          ? 'restrictionList.personWillLoseAccessToPremiumFeatures'
          : 'restrictionList.peopleWillLoseAccessToPremiumFeatures';

      return t(key, { amount: affectedUsersAmount });
    }

    return t('restrictionList.youWillLoseAccessToTheFollowingFeatures');
  };

  const keepSubscription = () => {
    navigate(`/${ORG_TEXT}/${url}/dashboard/billing`, { replace: true });
  };

  const cancelSubscription = async () => {
    setLoading(!isRestrictedOrg);
    await cancelPlan();
    if (!isRestrictedOrg) {
      navigate(`/${ORG_TEXT}/${url}/subscription/finish${search}`, { replace: true });
    }
  };

  const renderMemberGroupAvatar = () => {
    // TODO SIGN: consider show avatar of assigned seats members
    if (isFetching || !isManyPeopleInOrg) {
      return null;
    }

    if (!isFetching && !representativeMembers.length) return null;

    return (
      <div className={styles.avatarGroup}>
        <AvatarGroup
          size="xs"
          max={totalMember > MAX_MEMBER ? MAX_MEMBER : totalMember}
          // TODO SIGN: total assigned seats
          total={totalMember}
          // TODO SIGN: consider show avatar of assigned seats members
          propsItems={representativeMembers.map((member) => ({
            src: member.avatarRemoteId ? avatar.getAvatar(member.avatarRemoteId) : '',
            name: member.name,
          }))}
          variant="outline"
          renderItem={(props) => <Avatar {...props} />}
        />
      </div>
    );
  };

  return (
    <BaseCancellationPage>
      <div className={styles.container}>
        <div className={styles.paper}>
          <div className={styles.chipWrapper}>
            <Chip
              label={t('surveySubscription.stepper', { step: 2, total: 2 })}
              variant="light"
              size="md"
              colorType="white"
              rounded
            />
          </div>
          <div>
            <div className={styles.title}>{getTitle()}</div>
            <div className={styles.information}>
              <div className={styles.orgInformation}>{t('surveySubscription.orgInformation')}</div>
              <div className={styles.informationWrapper}>
                <Avatar
                  src={avatar.getAvatar(avatarRemoteId) || DefaultOrgAvatar}
                  placeholder={<img src={DefaultOrgAvatar} alt="workspace avatar" />}
                  size="md"
                  variant="outline"
                />
                <div className={styles.info}>
                  <PlainTooltip
                    openDelay={TOOLTIP_OPEN_DELAY}
                    className={styles.tooltipWrapper}
                    content={name}
                    position="top"
                    maw={400}
                  >
                    <div className={styles.circleName}>{name}</div>
                  </PlainTooltip>
                </div>
                {renderMemberGroupAvatar()}
              </div>
            </div>
            <div className={styles.description}>{t('restrictionList.cancelingWill')}</div>
            <div className={styles.body}>
              {premiumFeatureList.map((item) => (
                <div className={styles.itemWrapper} key={item.label}>
                  <div className={styles.iconWrapper}>
                    <KiwiIcomoon type={item.icon} size="md" />
                  </div>
                  <div className={styles.textWrapper}>
                    <div className={styles.header}>{item.label}</div>
                    {item.descriptions.length > 1 ? (
                      <ul className={styles.listWrapper}>
                        {item.descriptions.map((description) => (
                          <li className={styles.itemInfoList} key={description}>
                            {description}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className={styles.itemInfo}>{item.descriptions[0]}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.buttonWrapper}>
              <Button
                variant={ButtonVariant.outlined}
                size={ButtonSize.lg}
                onClick={keepSubscription}
                data-lumin-btn-name={CNCButtonName.KEEP_SUBSCRIPTION}
                data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.KEEP_SUBSCRIPTION]}
                disabled={loading}
              >
                {t('surveySubscription.keepMySubscription')}
              </Button>
              <Button
                variant={ButtonVariant.filled}
                size={ButtonSize.lg}
                data-lumin-btn-name={CNCButtonName.CANCEL_SUBSCRIPTION}
                data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.CANCEL_SUBSCRIPTION]}
                onClick={cancelSubscription}
                loading={loading}
              >
                {t('surveySubscription.cancelMySubscription')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </BaseCancellationPage>
  );
};

export default CancelSubscription;
