import { Button, Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Icomoon from 'lumin-components/Icomoon';

import { useEnableWebReskin, useTranslation, usePaymentFreeTrialPageReskin, useMobileMatch } from 'hooks';

import { Routers } from 'constants/Routers';
import { Colors } from 'constants/styles';

import * as Styled from './PaymentLayout.styled';

import styles from './PaymentLayout.module.scss';

function PaymentLayout({ children }) {
  const { t } = useTranslation();
  const { isEnableReskinUI } = usePaymentFreeTrialPageReskin();
  const { isEnableReskin } = useEnableWebReskin();
  const isMobileMatch = useMobileMatch();

  const StyledComponents = isEnableReskinUI
    ? {
        Wrapper: Styled.WrapperReskin,
        Header: Styled.HeaderReskin,
        BackButton: Styled.BackButtonReskin,
      }
    : {
        Wrapper: Styled.Wrapper,
        Header: Styled.Header,
        BackButton: Styled.BackButton,
      };

  if (isEnableReskin) {
    return (
      <section className={styles.wrapper}>
        <div className={styles.header}>
          <Button
            variant="text"
            size={isMobileMatch ? 'md' : 'lg'}
            startIcon={<KiwiIcomoon type="chevron-left-lg" color="var(--kiwi-colors-core-secondary)" size="lg" />}
            component={Link}
            to={Routers.ROOT}
            {...(!isMobileMatch && { style: { '--button-padding': 'var(--kiwi-spacing-1) var(--kiwi-spacing-1-5)' } })}
          >
            {t('payment.backToDocuments')}
          </Button>
        </div>
        <div className={styles.container}>{children}</div>
      </section>
    );
  }

  return (
    <StyledComponents.Wrapper>
      <StyledComponents.Header>
        <StyledComponents.BackButton component={Link} color={ButtonColor.GHOST} size={ButtonSize.SM} to="/">
          <Icomoon
            className={isEnableReskinUI ? 'arrow-up' : 'prev-page'}
            size={12}
            color={isEnableReskinUI ? Colors.LUMIN_SIGN_PRIMARY : Colors.NEUTRAL_80}
            style={
              isEnableReskinUI
                ? {
                    transform: 'rotate(-90deg)',
                  }
                : {}
            }
          />
          <span style={{ display: 'inline-block', marginLeft: isEnableReskinUI ? 16 : 12 }}>
            {t('payment.backToDocuments')}
          </span>
        </StyledComponents.BackButton>
      </StyledComponents.Header>
      <Styled.Container>{children}</Styled.Container>
    </StyledComponents.Wrapper>
  );
}

PaymentLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PaymentLayout;
