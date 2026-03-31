import { Text, Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';
import { useLocation } from 'react-router';
import { useNavigate } from 'react-router-dom';

import FinishCreateOrg from 'assets/images/finish-create-org.png';
import HappyWorking from 'assets/reskin/images/happy-working.png';

import { ButtonSize } from 'lumin-components/ButtonMaterial';

import { useEnableWebReskin, useTranslation, useGetReturnToUrl } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { getTrendingUrl } from 'utils/orgUrlUtils';

import * as Styled from './Finish.styled';

import styles from './Finish.module.scss';

const Finish = ({ orgName, orgUrl }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { search } = useLocation();
  const { isEnableReskin } = useEnableWebReskin();
  const { isLuminSign, luminSignDashboardUrl, isAgreementGen, agreementGenUrl } = useGetReturnToUrl();

  const onClick = () => {
    if (isAgreementGen) {
      window.location.href = agreementGenUrl(orgUrl);
      return;
    }
    if (isLuminSign) {
      window.location.href = luminSignDashboardUrl(orgUrl);
      return;
    }
    navigate(getTrendingUrl({ orgUrl, search }));
  };

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        <img src={HappyWorking} alt="Complete" />
        <div className={styles.contentWrapper}>
          <Text size="xl" type="headline" color="var(--kiwi-colors-surface-on-surface)">
            {t('setUpOrg.weAreInAction')}
          </Text>
          <Text size="md" type="body" color="var(--kiwi-colors-surface-on-surface)">
            <Trans
              shouldUnescape
              i18nKey="setUpOrg.descriptionWeAreInAction"
              components={{ b: <b style={{ fontWeight: 700 }} /> }}
              values={{ orgName }}
            />
          </Text>
        </div>
        <div className={styles.actions}>
          <Button
            size="lg"
            variant="filled"
            data-lumin-btn-name={ButtonName.ONBOARDING_ORGANIZATION_GET_STARTED}
            onClick={onClick}
          >
            {t('common.getStarted')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Styled.Title>{t('setUpOrg.weAreInAction')}</Styled.Title>
      <Styled.Description>
        <Trans
          shouldUnescape
          i18nKey="setUpOrg.descriptionWeAreInAction"
          components={{ b: <b /> }}
          values={{ orgName }}
        />
      </Styled.Description>
      <Styled.ButtonWrapper>
        <Styled.Button
          onClick={onClick}
          size={ButtonSize.XL}
          data-lumin-btn-name={ButtonName.ONBOARDING_ORGANIZATION_GET_STARTED}
        >
          {t('common.getStarted')}
        </Styled.Button>
      </Styled.ButtonWrapper>
      <Styled.ImgWrapper>
        <Styled.Img src={FinishCreateOrg} />
      </Styled.ImgWrapper>
    </>
  );
};

Finish.propTypes = {
  orgName: PropTypes.string.isRequired,
  orgUrl: PropTypes.string.isRequired,
};

Finish.defaultProps = {};

export default Finish;
