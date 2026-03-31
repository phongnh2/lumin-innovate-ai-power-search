import {
  MY_TEAMS,
  GET_REMAINING_MEMBER_QUANTITY,
  TEAM,
  ADD_MEMBERS_TO_TEAM,
  TEAM_INFO,
  EDIT_TEAM,
  TRANSFER_TEAM_ADMIN,
  REMOVE_MEMBER,
  REMOVE_INVITED_MEMBER,
  REMOVE_TEAM,
  LEAVE_ORG_TEAM,
  GET_TEAMS_OF_TEAM_ADMIN,
  GET_MEMBERS_OF_TEAM,
  TRANSFER_LIST_TEAM_OWNERSHIP,
  UPDATE_ORGANIZATION_TEAM_SETTINGS,
  SUB_UPDATE_TEAMS,
} from 'graphQL/TeamGraph';

import logger from 'helpers/logger';

import { FETCH_POLICY } from 'constants/graphConstant';

import { client } from '../../apollo';

/**
 *
 * @param {string} userId
 */
export function myTeams(userId) {
  return client.query({
    fetchPolicy: 'network-only',
    query: MY_TEAMS,
    variables: {
      clientId: userId,
    },
  });
}

export function getRemainingTeamQuantity(teamId) {
  return client.query({
    query: GET_REMAINING_MEMBER_QUANTITY,
    fetchPolicy: 'no-cache',
    variables: {
      teamId,
    },
  });
}

export function getTeamDetail(teamId) {
  return client.query({
    query: TEAM,
    fetchPolicy: 'no-cache',
    variables: {
      teamId,
    },
  });
}

export function getTeamInfo(teamId) {
  return client.query({
    query: TEAM_INFO,
    fetchPolicy: 'no-cache',
    variables: {
      teamId,
    },
  });
}

export function addMemberToTeam({ clientId, teamId, members }) {
  return client.mutate({
    mutation: ADD_MEMBERS_TO_TEAM,
    variables: {
      clientId,
      teamId,
      members,
    },
  });
}

export async function editTeam({ userId, teamId, team }) {
  const res = await client.mutate({
    mutation: EDIT_TEAM,
    variables: {
      clientId: userId,
      teamId,
      team,
    },
  });

  return res.data.editTeam;
}

export async function transferTeamAdmin(teamId, userId) {
  const res = await client.mutate({
    mutation: TRANSFER_TEAM_ADMIN,
    variables: {
      teamId,
      userId,
    },
  });

  return res.data.transferTeamOwnership;
}

export async function removeMember({ clientId, teamId, memberId }) {
  const res = await client.mutate({
    mutation: REMOVE_MEMBER,
    variables: {
      clientId,
      teamId,
      userId: memberId,
    },
  });

  return res.data.removeMember;
}

export async function removeInvitedMember({ teamId, email }) {
  const res = await client.mutate({
    mutation: REMOVE_INVITED_MEMBER,
    variables: {
      teamId,
      email,
    },
  });

  return res.data.delInviteNonLuminToTeam;
}

export function leaveOrgTeam({ teamId }) {
  return client.mutate({
    mutation: LEAVE_ORG_TEAM,
    variables: {
      teamId,
    },
  });
}

export async function deleteTeam(teamId) {
  const res = await client.mutate({
    mutation: REMOVE_TEAM,
    variables: {
      teamId,
    },
  });

  return res.data.removeTeam;
}

export async function getTeamsOfTeamAdmin(orgId, userId) {
  const res = await client.query({
    query: GET_TEAMS_OF_TEAM_ADMIN,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      orgId,
      userId,
    },
  });

  return res.data.getTeamsOfTeamAdmin;
}
export async function getMembersOfTeam(teamId) {
  const res = await client.query({
    query: GET_MEMBERS_OF_TEAM,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      teamId,
    },
  });

  return res.data.getMembersOfTeam;
}

export async function transferListTeamOwnership(orgId, adminId, teams) {
  const res = await client.mutate({
    mutation: TRANSFER_LIST_TEAM_OWNERSHIP,
    variables: {
      input: {
        orgId,
        adminId,
        teams,
      },
    },
  });

  return res.data.transferListTeamOwnership;
}

export async function updateTeamSettings(teamId, settings) {
  const res = await client.mutate({
    mutation: UPDATE_ORGANIZATION_TEAM_SETTINGS,
    variables: {
      teamId,
      settings,
    },
  });

  return res.data.updateTeamSettings;
}

export function updateTeamSubscription({ userId, callback }) {
  return client
    .subscribe({
      query: SUB_UPDATE_TEAMS,
      variables: {
        input: {
          clientId: userId,
        },
      },
    })
    .subscribe({
      next({ data }) {
        callback(data.updateTeams);
      },
      error(err) {
        logger.logError({
          error: err,
        });
      },
    });
}

export default {
  myTeams,
  getTeamDetail,
  getRemainingTeamQuantity,
  getTeamInfo,
  editTeam,
  transferTeamAdmin,
  removeMember,
  removeInvitedMember,
  deleteTeam,
  leaveOrgTeam,
  getTeamsOfTeamAdmin,
  getMembersOfTeam,
  updateTeamSettings,
  updateTeamSubscription,
};
