import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import selectors from 'selectors';

import { StyledPricingWrapper } from 'screens/Plan/Plan.styled';

import Brand from 'lumin-components/Brand';
import { LayoutSecondary } from 'lumin-components/Layout';
import PlanBox from 'lumin-components/PlanBox';
import PricingValue from 'lumin-components/PricingValue';
import UserStory from 'lumin-components/UserStory';
import FAQContainer from 'luminComponents/FAQContainer';
import FreeStudent from 'luminComponents/FreeStudent';
import PlanEnterprise from 'luminComponents/PlanEnterprise';
import PlanTableCompare from 'luminComponents/PlanTableCompare';

import withOrganizationTitle from 'HOC/withOrganizationTitle';

import { useGetCurrencyBaseOnLocation, useTranslation } from 'hooks';

import { getPlanBoxList } from 'constants/detailPlanConstants';

import {
  StyledOrganizationPlanContainer,
  StyledOrganizationPlanTitle,
  StyledOrganizationPlanSubTitle,
  PlanBoxContainer,
} from './OrganizationPlan.styled';

function OrganizationPlan({ isOrgLoading }) {
  const { t } = useTranslation();
  const { locationCurrency, loading: isFetchingCurrency } = useGetCurrencyBaseOnLocation();

  if (isOrgLoading || isFetchingCurrency) {
    return null;
  }

  const planBoxList = getPlanBoxList({ currency: locationCurrency });
  const PlanBoxValues = Object.values(planBoxList.data);

  return (
    <LayoutSecondary footer={false}>
      <StyledPricingWrapper>
        <StyledOrganizationPlanContainer>
          <StyledOrganizationPlanTitle>{t('plan.title')}</StyledOrganizationPlanTitle>
          <StyledOrganizationPlanSubTitle>{t('plan.subTitle')}</StyledOrganizationPlanSubTitle>
        </StyledOrganizationPlanContainer>
        <PlanBoxContainer>
          {PlanBoxValues.slice(0, PlanBoxValues.length - 1).map((plan, index) => (
            <PlanBox key={index} theme={planBoxList.theme[plan.key]} data={plan} />
          ))}
        </PlanBoxContainer>
        <PlanEnterprise />
        <PlanTableCompare />
        <FreeStudent />
        <Brand />
        <PricingValue />
        <UserStory />
        <FAQContainer />
      </StyledPricingWrapper>
    </LayoutSecondary>
  );
}

OrganizationPlan.propTypes = {
  isOrgLoading: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  isOrgLoading: selectors.getCurrentOrganization(state).loading,
});

export default compose(connect(mapStateToProps), withOrganizationTitle('common.plans'))(OrganizationPlan);
