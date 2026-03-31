import React from 'react';

import CustomHeader from 'lumin-components/CustomHeader';
import FAQContainer from 'lumin-components/FAQContainer';
import UserStory from 'lumin-components/UserStory';
import { LayoutSecondary } from 'lumin-components/Layout';
import PricingValue from 'luminComponents/PricingValue';
import Brand from 'luminComponents/Brand';
import FreeStudent from 'luminComponents/FreeStudent';
import PlanBox from 'lumin-components/PlanBox';
import PlanEnterprise from 'luminComponents/PlanEnterprise';
import PlanTableCompare from 'luminComponents/PlanTableCompare';

import { getPlanBoxList } from 'constants/detailPlanConstants';
import { useGetCurrencyBaseOnLocation, useTranslation } from 'hooks';

import {
  StyledPricingWrapper,
  StyledPricingTitle,
  StyledPricingSubTitle,
  StyledPricingContainer,
  PlanBoxContainer,
} from './Plan.styled';

function Plan() {
  const { t } = useTranslation();
  const { locationCurrency, loading: isFetchingCurrency } = useGetCurrencyBaseOnLocation();

  if (isFetchingCurrency) {
    return null;
  }

  const planBoxList = getPlanBoxList({ currency: locationCurrency });
  const PlanBoxValues = Object.values(planBoxList.data);

  return (
    <>
      <CustomHeader title={t('plan.metaTitle')} description={t('plan.metaDescription')} />
      <LayoutSecondary footer={false}>
        <StyledPricingWrapper>
          <StyledPricingContainer>
            <StyledPricingTitle>{t('plan.title')}</StyledPricingTitle>
            <StyledPricingSubTitle>{t('plan.subTitle')}</StyledPricingSubTitle>
            <PlanBoxContainer>
              {PlanBoxValues.slice(0, PlanBoxValues.length - 1).map((plan, index) => (
                <PlanBox key={index} theme={planBoxList.theme[plan.key]} data={plan} />
              ))}
            </PlanBoxContainer>
          </StyledPricingContainer>
          <PlanEnterprise />
          <PlanTableCompare />
          <FreeStudent />
          <Brand />
          <PricingValue />
          <UserStory />
          <FAQContainer />
        </StyledPricingWrapper>
      </LayoutSecondary>
    </>
  );
}

export default Plan;
