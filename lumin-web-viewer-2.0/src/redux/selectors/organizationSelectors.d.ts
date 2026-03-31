import { RootState } from 'store';

import { IOrganization, SuggestedOrganization } from 'interfaces/organization/organization.interface';
import {
  AvailablePaidOrganiations,
  IOrganizationData,
  OrganizationList,
} from 'interfaces/redux/organization.redux.interface';
import { ITeam } from 'interfaces/team/team.interface';

export function getCurrentOrganization(state: RootState): IOrganizationData;

export function getOrganizationList(state: RootState): OrganizationList;

export function getOrganizationById(state: RootState, orgId: string): { organization: IOrganization };

export function getOrganizationFromTeam(state: RootState, teamId: string): { organization: IOrganization };

export function isNoPermissionOrg(state: RootState): boolean;

export function isLoadingOrganizationList(state: RootState): boolean;

export function availablePaidOrgs(state: RootState): AvailablePaidOrganiations;

export function getTeams(state: RootState): ITeam[];

export function getMainOrganizationCanJoin(state: RootState): SuggestedOrganization;
