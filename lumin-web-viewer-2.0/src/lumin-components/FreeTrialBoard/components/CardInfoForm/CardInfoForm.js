import PropTypes from 'prop-types';
import React from 'react';

import Input from 'lumin-components/Shared/Input';

import { useTranslation } from 'hooks';

import { Routers } from 'constants/Routers';

import * as Styled from './CardInfoForm.styled';

const CardInfoForm = ({ card, orgUrl }) => {
  const { t } = useTranslation();
  const getCardValue = () => ['**** **** ****', card].join(' ');

  const getPathName = () => [Routers.ORGANIZATION, orgUrl, 'dashboard/billing'].join('/');

  const getHashParam = () => '#billing-info';

  return (
    <div>
      <Styled.LabelContainer>
        <Styled.Label htmlFor="stripe-card">{t('payment.cardNumber')}</Styled.Label>
        {orgUrl && (
          <Styled.ChangeCardLink to={[getPathName(), getHashParam()].join('/')}>
            {t('payment.changeCard')}
          </Styled.ChangeCardLink>
        )}
      </Styled.LabelContainer>
      <Input id="stripe-card" name="stripe-card" value={getCardValue()} readOnly />
    </div>
  );
};

CardInfoForm.propTypes = {
  card: PropTypes.string.isRequired,
  orgUrl: PropTypes.string,
};

CardInfoForm.defaultProps = {
  orgUrl: undefined,
};

export default CardInfoForm;
