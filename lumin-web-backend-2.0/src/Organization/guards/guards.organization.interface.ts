import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { OrganizationPlans } from 'Payment/payment.enum';

export type IActorRequestData = {
    _id: string;
    email: string;
    isLoginWithGoogle: boolean;
}

export type ITargetRequestData = {
    _id?: string;
    email?: string;
}

export type IResourceRequestData = {
    orgId: string;
    orgUrl: string;
    orgTeamId: string;
    operation: string;
    resourceAccess: string;
    extraInfo: {
        isPremiumOrganization: boolean,
        isInternalMember: boolean,
        securitySetting: any,
        orgDomain: string,
        inScheduledDelete: boolean,
        orgPlan: OrganizationPlans,
        associatedDomains: string[],
        premiumProducts: string[],
    };
}

export interface IRequestData {
    actor: IActorRequestData
    target: ITargetRequestData
    resource: IResourceRequestData
}

export interface IVerifyData {
    organizationService: OrganizationService;
    organizationTeamService: OrganizationTeamService;
    data: IRequestData;
}
export interface IPreprocessData extends IVerifyData {
    injectCallback: ({ organization, team }) => void,
}
