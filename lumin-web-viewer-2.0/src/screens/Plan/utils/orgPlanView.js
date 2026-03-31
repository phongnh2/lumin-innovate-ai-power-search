import {
  PlanOrganizationMonthlyData,
  PlanOrganizationMonthlyDataEnterprise,
  PlanOrganizationYearlyData,
  PlanOrganizationYearlyDataEnterprise,
  PlanOrganizationFromTeamYearlyData,
  PlanOrganizationFromTeamMonthlyData,
} from 'constants/pricingConstant';
import { OrganizationUtilities } from 'utils/Factory/Organization';
import { PERIOD } from 'constants/plan';

class OrgPlanView {
  init({ organization, isAnnualSelecting }) {
    this.organization = organization || {};
    this.isAnnualSelecting = isAnnualSelecting;
    this.payment = this.organization.payment || {};
    this.orgUtilities = new OrganizationUtilities({ organization: this.organization });
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  newPriceInterceptor(planData) {
    return planData.map((plan) => plan);
  }

  getPlans() {
    if (this.orgUtilities.payment.isEnterprise() && this.isAnnualSelecting) {
      return {
        planList: this.newPriceInterceptor(
          PlanOrganizationYearlyDataEnterprise,
        ),
        period: PERIOD.ANNUAL.toLowerCase(),
      };
    }

    if (this.orgUtilities.payment.isEnterprise()) {
      return {
        planList: this.newPriceInterceptor(
          PlanOrganizationMonthlyDataEnterprise,
        ),
        period: PERIOD.ANNUAL.toLowerCase(),
      };
    }

    if (this.isAnnualSelecting) {
      return {
        planList: this.orgUtilities.isConvertedFromTeam()
          ? this.newPriceInterceptor(PlanOrganizationFromTeamYearlyData)
          : this.newPriceInterceptor(PlanOrganizationYearlyData),
        period: PERIOD.ANNUAL.toLowerCase(),
      };
    }

    return {
      planList: this.orgUtilities.isConvertedFromTeam()
        ? this.newPriceInterceptor(PlanOrganizationFromTeamMonthlyData)
        : this.newPriceInterceptor(PlanOrganizationMonthlyData),
      period: PERIOD.MONTHLY.toLowerCase(),
    };
  }
}

export default new OrgPlanView();
