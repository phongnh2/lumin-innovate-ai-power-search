import React from 'react';
import { Trans } from 'react-i18next';

import FAQItem from 'luminComponents/FAQItem';

import { useTranslation } from 'hooks';

import { FAQPricingConstant } from './FAQContant';

import * as Styled from './FAQContainer.styled';

const FAQContainer = () => {
  const { t } = useTranslation();

  const renderFAQContent = () => (
    <Styled.List>
      {FAQPricingConstant.map((item, index) => (
        <FAQItem key={index} question={t(item.question)} answer={<Trans i18nKey={item.answer} />} />
      ))}
    </Styled.List>
  );

  return (
    <Styled.Container>
      <Styled.Wrapper>
        <Styled.Title>{t('plan.frequentlyAskedQuestions')}</Styled.Title>
        <Styled.Content>{renderFAQContent()}</Styled.Content>
      </Styled.Wrapper>
    </Styled.Container>
  );
};

export default FAQContainer;
