import { Icomoon as KiwiIcomoon, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import IconLock from 'assets/images/icon_lock.svg';

import MessageBox from 'lumin-components/Shared/MessageBox';
import Icomoon from 'luminComponents/Icomoon';

import { useTranslation, usePaymentFreeTrialPageReskin, useEnableWebReskin } from 'hooks';

import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { STATIC_PAGE_URL } from 'constants/urls';

import * as Styled from './PaymentEncryptedCert.styled';

import styles from './PaymentEncryptedCert.module.scss';

const PaymentEncryptedCert = () => {
  const { t } = useTranslation();
  const { isEnableReskinUI } = usePaymentFreeTrialPageReskin();
  const { isEnableReskin } = useEnableWebReskin();

  const StyledComponents = isEnableReskinUI
    ? {
        Container: Styled.ContainerReskin,
        Text: Styled.TextReskin,
        Link: Styled.LinkReskin,
      }
    : {
        Container: Styled.Container,
        Text: Styled.Text,
        Link: Styled.Link,
      };

  const message = t('freeTrialPage.messagePaymentFreeTrial');

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        <div className={styles.termsAndConditions}>
          <Text type="body" size="sm">
            <Trans
              i18nKey="freeTrialPage.termsAndConditions"
              components={{
                1: (
                  // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={STATIC_PAGE_URL + getFullPathWithPresetLang('/terms-of-use')}
                  />
                ),
              }}
            />
          </Text>
        </div>
        <div className={styles.encrypted}>
          <KiwiIcomoon type="secure" size="md" />
          <Text type="label" size="sm">
            {message}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <StyledComponents.Container>
      <StyledComponents.Text>
        <Trans i18nKey="freeTrialPage.termsAndConditions">
          By subscribing to Lumin you agree to the
          <StyledComponents.Link
            target="_blank"
            rel="noopener"
            href={STATIC_PAGE_URL + getFullPathWithPresetLang('/terms-of-use')}
          >
            terms and conditions
          </StyledComponents.Link>
          .
        </Trans>
      </StyledComponents.Text>
      {isEnableReskinUI ? (
        <Styled.Message>
          <Icomoon className="secure" />
          <p>{message}</p>
        </Styled.Message>
      ) : (
        <MessageBox expanded img={IconLock}>
          {message}
        </MessageBox>
      )}
    </StyledComponents.Container>
  );
};

export default PaymentEncryptedCert;
