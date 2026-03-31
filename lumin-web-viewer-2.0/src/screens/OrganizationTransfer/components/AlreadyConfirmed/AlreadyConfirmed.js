import classNames from 'classnames';
import { Button, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

import ConfirmationImg from 'assets/images/already-confirmed.svg';
import IllustrationMagic from 'assets/reskin/images/illustration-magic.png';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import { LayoutSecondary } from 'lumin-components/Layout';
import {
  LayoutSecondary as LayoutSecondaryReskin,
  styles,
} from 'luminComponents/ReskinLayout/components/LayoutSecondary';

import { useTranslation, useEnableWebReskin } from 'hooks';

import { organizationServices } from 'services';

import { ORG_TEXT } from 'constants/organizationConstants';

import {
  StyledWrapper, StyledImage, StyledTitle, StyledMessage, StyledButton, StyledImageWrapper, StyledImageContainer,
} from './AlreadyConfirmed.styled';

const propTypes = {
  currentOrganization: PropTypes.object,
};

const defaultProps = {
  currentOrganization: {},
};

const AlreadyConfirmed = ({ currentOrganization }) => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const {
    url, name: orgName, userRole,
  } = currentOrganization?.data || {};

  const getRedirectByRole = () => {
    const isManager = organizationServices.isManager(userRole);
    return `/${ORG_TEXT}/${url}/${isManager ? 'dashboard' : 'documents'}`;
  };

  if (isEnableReskin) {
    return (
      <LayoutSecondaryReskin>
        <img
          src={IllustrationMagic}
          alt="already-confirmed"
          className={classNames(styles.image, styles.illustrationMagicImage)}
        />
        <div>
          <Text type="headline" size="xl" className={styles.title}>
            {t('orgTransfer.title')}
          </Text>
          <Text type="body" size="lg">
            <Trans
              i18nKey="orgTransfer.description"
              components={{ b: <b style={{ fontWeight: '700' }} /> }}
              values={{ orgName }}
            />
          </Text>
        </div>
        <div className={styles.buttonWrapper}>
          <Button size="lg" component={Link} to={getRedirectByRole()}>
            {t('orgTransfer.goToOrg')}
          </Button>
        </div>
      </LayoutSecondaryReskin>
    );
  }

  return (
    <LayoutSecondary
      staticPage
      footer={false}
    >
      <StyledWrapper>
        <StyledImageWrapper>
          <StyledImageContainer>
            <StyledImage src={ConfirmationImg} alt="already confirmed" />
          </StyledImageContainer>
        </StyledImageWrapper>
        <StyledTitle>{t('orgTransfer.title')}</StyledTitle>
        <StyledMessage>
          <Trans i18nKey="orgTransfer.description" components={{ b: <b /> }} values={{ orgName }} />
        </StyledMessage>
        <StyledButton size={ButtonSize.XL} component={Link} to={getRedirectByRole()}>
          {t('orgTransfer.goToOrg')}
        </StyledButton>
      </StyledWrapper>
    </LayoutSecondary>
  );
};

AlreadyConfirmed.propTypes = propTypes;
AlreadyConfirmed.defaultProps = defaultProps;
export default AlreadyConfirmed;
