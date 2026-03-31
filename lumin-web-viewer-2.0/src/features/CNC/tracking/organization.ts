import { EventCollection } from 'utils/Factory/EventCollection/EventCollection';

import { IOrganization, JoinOrganizationStatus } from 'interfaces/organization/organization.interface';

import { CNCOrganizationEvent } from '../constants/events/organization';

export interface IEventCollectionProps {
  selectedOrganization: IOrganization;
  selectedOrganizationJoinType: JoinOrganizationStatus;
}

class OrganizationTracking extends EventCollection {
  selectSuggestedPremiumOrganization({ selectedOrganization, selectedOrganizationJoinType }: IEventCollectionProps) {
    return this.record({
      name: CNCOrganizationEvent.SELECT_SUGGESTED_PREMIUM_ORGANIZATION,
      attributes: {
        selectedOrganizationId: selectedOrganization._id,
        selectedOrganizationJoinType,
        selectedOrganizationPaymentPlan: selectedOrganization.payment.type,
        selectedOrganizationPlanStatus: selectedOrganization.payment.status,
      },
    });
  }
}

export default new OrganizationTracking();
