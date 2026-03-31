import classNames from 'classnames';
import { Button, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useNavigate } from 'react-router';

import ExpiredImage from 'assets/images/link_expired.svg';
import ExpiredLinkImageReskin from 'assets/reskin/images/expired-link.png';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import { LayoutSecondary } from 'lumin-components/Layout';
import {
  LayoutSecondary as LayoutSecondaryReskin,
  styles,
} from 'luminComponents/ReskinLayout/components/LayoutSecondary';

import { useTranslation, useEnableWebReskin } from 'hooks';

import { Routers } from 'constants/Routers';

import * as Styled from './ExpiredLink.styled';

const ExpiredLink = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    return (
      <LayoutSecondaryReskin>
        <img
          src={ExpiredLinkImageReskin}
          alt="expired-link"
          className={classNames(styles.image, styles.expiredLinkImage)}
        />
        <div>
          <Text type="headline" size="xl" className={styles.title}>
            {t('expiredLink.title')}
          </Text>
          <Text type="body" size="lg">
            {t('expiredLink.subtitle')}
          </Text>
        </div>
        <div className={styles.buttonWrapper}>
          <Button onClick={() => navigate(Routers.ROOT)} size="lg">
            {t('expiredLink.backBtn')}
          </Button>
        </div>
      </LayoutSecondaryReskin>
    );
  }

  return (
    <LayoutSecondary footer={false} staticPage>
      <Styled.Container>
        <Styled.Img src={ExpiredImage} alt="Token expired" />
        <Styled.Title>{t('expiredLink.title')}</Styled.Title>
        <Styled.SubTitle>{t('expiredLink.subtitle')}</Styled.SubTitle>
        <Styled.Button size={ButtonSize.XL} onClick={() => navigate('/')}>
          {t('expiredLink.backBtn')}
        </Styled.Button>
      </Styled.Container>
    </LayoutSecondary>
  );
};

export default ExpiredLink;
