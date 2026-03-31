import produce from 'immer';
import { get, merge, mergeWith } from 'lodash';
import { batch } from 'react-redux';

import selectors from 'selectors';

import { documentGraphServices } from 'services/graphServices';
import * as organizationGraph from 'services/graphServices/organization';
import indexedDBService from 'services/indexedDBService';

import { requestIdleCallback } from 'helpers/requestIdleCallback';

import errorExtract from 'utils/error';
import lastAccessOrgs from 'utils/lastAccessOrgs';

const customizer = (objValue, srcValue) => {
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    return srcValue; // replace array
  }
};

export const updateTeamById = (teamId, data) => (dispatch) => {
  dispatch({ type: 'UPDATE_TEAM_BY_ID', payload: { teamId, data } });
};

export const setOrganizations = (organizations) => (dispatch) => {
  dispatch({
    type: 'SET_ORGANIZATIONS',
    payload: {
      organizations,
    },
  });
};

export const setFetchOrganizationsSuccess = (organizations) => (dispatch) => {
  dispatch({
    type: 'FETCH_ORGANIZATIONS_SUCCESS',
    payload: {
      organizations,
    },
  });
};

export const fetchOrganizations = (options = { disabledLoading: false }) => async (dispatch) => {
  const { disabledLoading } = options;
  if (!disabledLoading) {
    dispatch({
      type: 'FETCH_ORGANIZATIONS',
    });
  }
  try {
    requestIdleCallback(async () => {
      const premiumToolsInfo = (await documentGraphServices.getPremiumToolInfoAvailableForUser()) || {};
      indexedDBService.setPremiumToolsInfo(premiumToolsInfo);
    });
    const organizations = await organizationGraph.getOrgList() || [];
    indexedDBService.setOrganizations(organizations);
    dispatch({
      type: 'FETCH_ORGANIZATIONS_SUCCESS',
      payload: {
        organizations,
      },
    });
  } catch (error) {
    dispatch({
      type: 'FETCH_ORGANIZATIONS_FAILED',
      payload: {
        error: errorExtract.extractGqlError(error),
      },
    });
  }
};

export const removeOrganizationInListById = (organizationId) => (
  dispatch,
  getState,
) => {
  const state = getState();
  const organizationList = selectors.getOrganizationList(state).data;
  const currentUser = selectors.getCurrentUser(state);
  if (!organizationList?.length) {
    return;
  }

  const { organization } = organizationList.find((item) => item.organization._id === organizationId) || {};
  if (!organization) {
    return;
  }
  lastAccessOrgs.removeByOrgUrl(organization.url);

  const newList = organizationList.filter((item) => item.organization._id !== organizationId);

  const isUpdateDefaultWorkspace = currentUser.setting.defaultWorkspace === organization._id;
  const isUpdateLastAccessOrg = currentUser.lastAccessedOrgUrl === organization.url;

  const newUserPayload = {
    ...(isUpdateDefaultWorkspace && {
      setting: {
        ...currentUser.setting,
        defaultWorkspace: null,
      },
    }),
    ...(isUpdateLastAccessOrg && { lastAccessedOrgUrl: get(organizationList, '[0].organization.url', null) }),
  };

  if (Object.keys(newUserPayload).length) {
    dispatch({
      type: 'UPDATE_CURRENT_USER',
      payload: {
        data: newUserPayload,
      },
    });
  }

  dispatch({
    type: 'UPDATE_ORGANIZATIONS',
    payload: {
      data: newList,
    },
  });
};

export const removeOrganizationInListByUrl = (organizationUrl) => (
  dispatch,
  getState,
) => {
  const organizationList = selectors.getOrganizationList(getState()).data;
  if (!organizationList?.length) {
    return;
  }

  const checkIfOrganizationIsExist = organizationList.filter(
    (item) => item.organization.url === organizationUrl,
  );
  if (!checkIfOrganizationIsExist.length) {
    return;
  }

  const newOrganizationList = organizationList.filter(
    (item) => item.organization.url !== organizationUrl,
  );

  dispatch({
    type: 'UPDATE_ORGANIZATIONS',
    payload: {
      data: newOrganizationList,
    },
  });
};

export const updateOrganizationInList = (organizationId, data) => (dispatch, getState) => {
  const organizationList = selectors.getOrganizationList(getState()).data;
  if (!organizationList?.length) {
    return;
  }
  const newOrganizationList = produce(organizationList, (draftOrganizationList) => {
    draftOrganizationList.forEach(({ organization }, index) => {
      if (organizationId === organization._id) {
        draftOrganizationList[index].organization = mergeWith({}, organization, data, customizer);
        if (data.userRole) {
          draftOrganizationList[index].role = data.userRole;
        }
      }
    });
  });
  dispatch({
    type: 'UPDATE_ORGANIZATIONS',
    payload: {
      organizationId,
      data: newOrganizationList,
    },
  });
};

export const updateCurrentRoleInOrganizationList = (
  organizationId,
  newRole,
) => (dispatch, getState) => {
  const organizationList = selectors.getOrganizationList(getState()).data;
  if (!organizationList?.length) {
    return;
  }
  const newOrganizationList = [...organizationList];
  organizationList.forEach((org, index) => {
    if (organizationId === org.organization._id) {
      newOrganizationList[index].role = newRole;
    }
  });
  dispatch({
    type: 'UPDATE_ORGANIZATIONS',
    payload: {
      organizationId,
      data: newOrganizationList,
    },
  });
};

export const resetOrganization = () => (dispatch) => {
  dispatch({
    type: 'RESET_ORGANIZATION',
  });
};

export const addNewOrganization = (newOrganization) => (dispatch, getState) => {
  const organizationList = selectors.getOrganizationList(getState()).data;

  const newOrganizationObj = {
    organization: newOrganization,
    role: newOrganization.userRole.toLowerCase(),
  };

  const newOrganizationList = [newOrganizationObj, ...organizationList];

  dispatch({
    type: 'UPDATE_ORGANIZATIONS',
    payload: {
      data: newOrganizationList,
    },
  });
};

export const fetchCurrentOrganization =
  (organizationUrl, options = { disabledLoading: false }) =>
  async (dispatch) => {
    const { disabledLoading } = options;
    if (!disabledLoading) {
      dispatch({
        type: 'FETCH_ORGANIZATION',
      });
    }
    try {
      const {
        orgData: organization,
        documentsAvailable,
        actionCountDocStack,
        aiChatbotDailyLimit,
      } = await organizationGraph.getOrgByUrl({
        url: organizationUrl,
      });
      const mergedOrg = { ...organization, documentsAvailable, aiChatbotDailyLimit };
      batch(() => {
        dispatch({
          type: 'UPDATE_CURRENT_USER', payload: {
            data: {
              lastAccessedOrgUrl: organizationUrl
            },
          },
        });
        dispatch({
          type: 'FETCH_ORGANIZATION_SUCCESS',
          payload: {
            organization: mergedOrg,
          },
        });
        dispatch({
          type: 'SET_ACTION_COUNT_DOC_STACK_FOR_ORG',
          payload: {
            ...actionCountDocStack,
          },
        });
        dispatch(updateOrganizationInList(organization._id, organization));
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_ORGANIZATION_FAILED',
        payload: {
          error: errorExtract.extractGqlError(error),
          organizationUrl,
        },
      });
    }
  };

export const updateCurrentOrganization = (data) => (dispatch) => {
  dispatch({
    type: 'UPDATE_ORGANIZATION',
    payload: {
      data,
    },
  });
};

export const setCurrentOrganization = (organization) => (dispatch) => {
  dispatch({
    type: 'FETCH_ORGANIZATION_SUCCESS',
    payload: {
      organization,
    },
  });
};

export const fetchMainOrganization = () => async (dispatch) => {
  const organization = await organizationGraph.getMainOrganizationCanJoin();
  dispatch({
    type: 'FETCH_MAIN_ORGANIZATION',
    payload: {
      organization,
    },
  });
};

export const updateStatusRequestMainOrganization = (joinStatus) => (dispatch) => {
  dispatch({
    type: 'UPDATE_STATUS_REQUEST_MAIN_ORGANIZATION',
    payload: {
      joinStatus,
    },
  });
};

export const removeMainOrganizationCanRequest = () => (dispatch) => {
  dispatch({
    type: 'REMOVE_REQUEST_MAIN_ORGANIZATION',
  });
};

export const removeTeamById = (teamId) => (dispatch, getState) => {
  const teams = selectors.getTeams(getState()).filter((team) => team._id !== teamId);
  dispatch({
    type: 'UPDATE_TEAMS',
    payload: {
      teams,
    },
  });
};

export const updateTeam = (teamId, data) => (dispatch, getState) => {
  const teams = selectors.getTeams(getState());
  const teamIndex = teams.findIndex((team) => team._id === teamId);
  if (teamIndex === -1) {
    return;
  }
  const updatedTeams = produce(teams, (draft) => {
    draft[teamIndex] = merge({}, teams[teamIndex], data);
  });
  dispatch({
    type: 'UPDATE_TEAMS',
    payload: {
      teams: updatedTeams,
    },
  });
};

export const updateTeamList = (teams) => (dispatch) => {
  dispatch({
    type: 'UPDATE_TEAMS',
    payload: {
      teams,
    },
  });
};

export const setSuggestedOrganizations = (organizations) => (dispatch) => {
  dispatch({
    type: 'SET_SUGGESTED_ORGANIZATIONS',
    payload: {
      organizations,
    },
  });
};

export const removeTeamInList = (teamId) => (dispatch) => {
  dispatch({
    type: 'REMOVE_TEAM_IN_LIST',
    payload: {
      id: teamId,
    },
  });
};

export const updateTeamInList = (team) => (dispatch) => {
  dispatch({
    type: 'UPDATE_TEAM_IN_LIST',
    payload: {
      team,
    },
  });
};
