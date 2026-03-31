import { Permission } from 'Organization/interfaces/organization.group.permission.interface';
import { OrganizationPlans } from 'Payment/payment.enum';

export interface IPolicyRequestResource {
  operation: string;
  resourceAccess: string;
  extraInfo: {
    isPremiumOrganization: boolean;
    isInternalMember: boolean;
    orgPlan: OrganizationPlans;
    associatedDomains: string[];
    premiumProducts: string[];
  };
}

export type IPolicyActor = {
    role: string;
    permissions: Permission[]
}

export type IPolicyTarget = {
    role?: string;
}

interface IPolicyRequestAttribute {
    actor: IPolicyActor;
    target?: IPolicyTarget;
}

export interface IPolicyRequest {
    resource: IPolicyRequestResource;
    attribute: IPolicyRequestAttribute;
}
