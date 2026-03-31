import { IOrganization, SuggestedOrganization } from 'interfaces/organization/organization.interface';

export type AvailablePaidOrganiations = {
  organization: IOrganization;
  role: string;
}[];

export type OrganizationListData = {
  organization: IOrganization;
  role: string;
};

export type OrganizationList = {
  loading: boolean;
  data: OrganizationListData[];
  error?: {
    code: string;
    message: string;
  };
};

export interface IOrganizationData {
  loading: boolean;
  data: IOrganization;
  error?: {
    code: string;
    message: string;
  };
}

export interface IOrganizationSuggestedListData {
  loading: boolean;
  data: SuggestedOrganization[];
  error?: {
    code: string;
    message: string;
  };
}
