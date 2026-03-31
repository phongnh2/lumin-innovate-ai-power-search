import { Text, Button } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';

import RequestSuccess from 'assets/images/request-success.png';
import KiteAndCloud from 'assets/reskin/images/kite-and-cloud.png';

import actions from 'actions';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import { LayoutSecondary } from 'lumin-components/Layout';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import baseStyles from 'luminComponents/JoinOrganizationSuccessfully/JoinOrganizationSuccessfully.module.scss';

import { useEnableWebReskin, useTranslation, useGetReturnToUrl } from 'hooks';

import { getDefaultOrgUrl } from 'utils/orgUrlUtils';

import * as Styled from './SubmitRequestSuccessfully.styled';

import styles from './SubmitRequestSuccessfully.module.scss';

const SubmitRequestSuccessfully = () => {
  const { t } = useTranslation();
  const { state, search } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orgUrl } = state || {};
  const { isEnableReskin } = useEnableWebReskin();
  const { isLuminSign, luminSignDashboardUrl, isAgreementGen, agreementGenUrl } = useGetReturnToUrl();

  const handleOnClick = () => {
    if (isAgreementGen) {
      window.location.href = agreementGenUrl(orgUrl);
      return;
    }
    if (isLuminSign) {
      window.location.href = luminSignDashboardUrl(orgUrl);
      return;
    }
    navigate(getDefaultOrgUrl({ orgUrl, search }));
    dispatch(actions.fetchOrganizations());
  };

  useEffect(() => {
    if (orgUrl) {
      dispatch(actions.updateCurrentUser({ hasJoinedOrg: true }));
    }
  }, []);

  if (isEnableReskin) {
    return (
      <LayoutSecondary
        footer={false}
        canClickLogo={false}
        hasBackButton={false}
        isReskin={isEnableReskin}
        backgroundColor={isEnableReskin ? 'var(--kiwi-colors-surface-surface-container-low)' : 'transparent'}
      >
        <div className={baseStyles.container}>
          <div className={baseStyles.wrapper}>
            <img className={styles.img} src={KiteAndCloud} alt="successfully" />
            <div className={baseStyles.contentWrapper}>
              <Text type="headline" size="xl" color="var(--kiwi-colors-surface-on-surface)">
                {t('setUpOrg.titleSubmitRequestSuccessfully')}
              </Text>
              <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface)">
                {t(
                  isAgreementGen
                    ? 'setUpOrg.descriptionSubmitRequestSuccessfullyAgreementGen'
                    : 'setUpOrg.descriptionSubmitRequestSuccessfully'
                )}
              </Text>
            </div>
            <div className={baseStyles.actions}>
              <Button variant="filled" size="lg" onClick={handleOnClick}>
                {t('common.getStarted')}
              </Button>
            </div>
          </div>
        </div>
      </LayoutSecondary>
    );
  }

  return (
    <LayoutSecondary footer={false} canClickLogo={false} hasBackButton={false}>
      <Styled.Wrapper>
        <Styled.Container>
          <Styled.Title>{t('setUpOrg.titleSubmitRequestSuccessfully')}</Styled.Title>
          <Styled.Description>{t('setUpOrg.descriptionSubmitRequestSuccessfully')}</Styled.Description>
          <ButtonMaterial size={ButtonSize.XL} fullWidth onClick={handleOnClick}>
            {t('common.getStarted')}
          </ButtonMaterial>
          <Styled.Img src={RequestSuccess} alt="Submit request successful" />
        </Styled.Container>
      </Styled.Wrapper>
    </LayoutSecondary>
  );
};

export default SubmitRequestSuccessfully;
