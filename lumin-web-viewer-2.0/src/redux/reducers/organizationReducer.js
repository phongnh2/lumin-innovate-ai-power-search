import produce from 'immer';
import { findIndex, isEmpty, merge } from 'lodash';

import { updateSharedKeys } from 'utils/objectUtils';

export default (initialState) => (state, action) => {
  const newState = { ...initialState, ...state };
  const { type, payload } = action;

  switch (type) {
    case 'SET_ORGANIZATIONS': {
      return {
        ...newState,
        organizations: {
          ...newState.organizations,
          data: payload.organizations,
          loading: false,
        },
      };
    }
    case 'FETCH_ORGANIZATIONS':
      return {
        ...newState,
        organizations: {
          loading: true,
          error: null,
          data: null,
        },
      };
    case 'FETCH_ORGANIZATIONS_SUCCESS':
      return {
        ...newState,
        organizations: {
          data: payload.organizations,
          loading: false,
          error: null,
        },
      };

    case 'SET_ACTION_COUNT_DOC_STACK_FOR_ORG':
      return {
        ...newState,
        actionCountDocStack: {
          ...payload,
        },
      };

    case 'FETCH_ORGANIZATIONS_FAILED':
      return {
        ...newState,
        organizations: {
          data: null,
          loading: false,
          error: payload.error,
        },
      };

    case 'UPDATE_ORGANIZATIONS':
      return produce(newState, (draft) => {
        draft.organizations.data = payload.data;
      });

    case 'FETCH_ORGANIZATION':
      return {
        ...newState,
        currentTeam: null,
        currentOrganization: {
          data: undefined,
          loading: true,
          error: null,
        },
      };

    case 'FETCH_ORGANIZATION_SUCCESS':
      return {
        ...newState,
        currentOrganization: {
          data: payload.organization,
          loading: false,
          error: null,
        },
      };

    case 'FETCH_ORGANIZATION_FAILED': {
      const updatedState = {
        ...newState,
        currentTeam: null,
        currentOrganization: {
          data: undefined,
          error: payload.error,
          loading: false,
        },
      };
      const foundOrg = updatedState.organizations.data?.find((org) => org.organization.url === payload.organizationUrl);
      if (foundOrg && payload.error.statusCode === 404) {
        return {
          ...updatedState,
          organizations: {
            ...updatedState.organizations,
            data: updatedState.organizations.data.filter((org) => org.organization._id !== foundOrg.organization._id),
          },
        };
      }
      return updatedState;
    }

    case 'RESET_ORGANIZATION':
      return {
        ...newState,
        currentOrganization: {
          data: undefined,
          error: null,
          loading: true,
        },
      };

    case 'UPDATE_ORGANIZATION': {
      if (isEmpty(newState.currentOrganization.data)) {
        return newState;
      }
      return produce(newState, (draft) => {
        draft.currentOrganization.data = Object.assign(draft.currentOrganization.data || {}, payload.data);
      });
    }

    case 'FETCH_MAIN_ORGANIZATION': {
      return {
        ...newState,
        mainOrganization: payload.organization,
      };
    }

    case 'UPDATE_STATUS_REQUEST_MAIN_ORGANIZATION': {
      return {
        ...newState,
        mainOrganization: {
          ...newState.mainOrganization,
          joinStatus: payload.joinStatus,
        },
      };
    }

    case 'REMOVE_REQUEST_MAIN_ORGANIZATION': {
      return {
        ...newState,
        mainOrganization: null,
      };
    }

    case 'UPDATE_TEAMS': {
      const { currentTeam, currentOrganization } = newState;
      const { teams = [] } = currentOrganization.data || {};
      const updatedTeam = currentTeam && teams.find((team) => team._id === currentTeam._id);
      return produce(newState, (draft) => {
        draft.currentOrganization.data.teams = payload.teams;
        draft.currentTeam = updatedTeam || payload.teams[0];
      });
    }

    case 'UPDATE_TEAM_BY_ID': {
      const { teamId, data } = payload;
      const { teams = [] } = newState.currentOrganization.data || {};
      const updatedTeamIndex = findIndex(teams, { _id: teamId });
      const updatedTeam = teams[updatedTeamIndex];
      return produce(newState, (draft) => {
        draft.currentOrganization.data.teams[updatedTeamIndex] = merge({}, updatedTeam, data);
      });
    }

    case 'SET_SUGGESTED_ORGANIZATIONS': {
      return {
        ...newState,
        suggestedOrganizations: {
          ...newState.organizations,
          data: payload.organizations,
          loading: false,
        },
      };
    }

    case 'REMOVE_TEAM_IN_LIST': {
      return produce(newState, (draft) => {
        const teamId = payload.id;
        const currentOrganizationId = draft.currentOrganization.data._id;
        draft.currentOrganization.data.teams = draft.currentOrganization.data.teams.filter(
          (team) => team._id !== teamId
        );
        const foundOrgIndex = draft.organizations.data.findIndex(
          (org) => org.organization._id === currentOrganizationId
        );
        if (foundOrgIndex !== -1) {
          draft.organizations.data[foundOrgIndex].organization.teams = draft.organizations.data[
            foundOrgIndex
          ].organization.teams.filter((team) => team._id !== teamId);
        }
      });
    }

    case 'UPDATE_TEAM_IN_LIST': {
      return produce(newState, (draft) => {
        const currentOrganizationId = draft.currentOrganization.data._id;
        draft.currentOrganization.data.teams = draft.currentOrganization.data.teams.map((team) =>
          team._id === payload.team._id ? updateSharedKeys(team, payload.team) : team
        );
        const foundOrgIndex = draft.organizations.data.findIndex(
          (org) => org.organization._id === currentOrganizationId
        );
        if (foundOrgIndex !== -1) {
          draft.organizations.data[foundOrgIndex].organization.teams = draft.organizations.data[
            foundOrgIndex
          ].organization.teams.map((team) =>
            team._id === payload.team._id ? updateSharedKeys(team, payload.team) : team
          );
        }
      });
    }

    default:
      return newState;
  }
};
