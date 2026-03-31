import * as teamGraph from 'services/graphServices/team';
import { ORG_TEAM_ROLE } from 'constants/organizationConstants';

async function getRemainingTeamPaymentQuantity(teamId) {
  const res = await teamGraph.getRemainingTeamQuantity(teamId);
  return res.data.getRemainingQuantity;
}

async function getTeamDetail(teamId) {
  return teamGraph.getTeamDetail(teamId);
}

function getTeamInfo(teamId) {
  return teamGraph.getTeamInfo(teamId);
}

async function addMemberToTeam({ clientId, teamId, members }) {
  const res = await teamGraph.addMemberToTeam({ clientId, teamId, members });
  return res.data.addMembersToTeam;
}

async function transferTeamOwnership(teamId, userId) {
  return teamGraph.transferTeamAdmin(teamId, userId);
}

function removeMember({ clientId, teamId, memberId }) {
  return teamGraph.removeMember({ clientId, teamId, memberId });
}

function removeInvitedMember({ teamId, email }) {
  return teamGraph.removeInvitedMember({ teamId, email });
}

function deleteTeam(teamId) {
  return teamGraph.deleteTeam(teamId);
}

function leaveOrgTeam({ teamId }) {
  return teamGraph.leaveOrgTeam({ teamId });
}

function checkPermission(roles, userRole = '') {
  return roles.includes(userRole.toUpperCase());
}

function isOrgTeamAdmin(userRole) {
  return checkPermission([ORG_TEAM_ROLE.ADMIN], userRole);
}

function getTeamsOfTeamAdmin(orgId, userId) {
  return teamGraph.getTeamsOfTeamAdmin(orgId, userId);
}
function getMembersOfTeam(teamId) {
  return teamGraph.getMembersOfTeam(teamId);
}
function transferListTeamOwnership(orgId, adminId, teams) {
  return teamGraph.transferListTeamOwnership(orgId, adminId, teams);
}
function updateTeamSettings(teamId, settings) {
  return teamGraph.updateTeamSettings(teamId, settings);
}

export default {
  getTeamDetail,
  getRemainingTeamPaymentQuantity,
  addMemberToTeam,
  getTeamInfo,
  transferTeamOwnership,
  removeMember,
  removeInvitedMember,
  deleteTeam,
  leaveOrgTeam,
  isOrgTeamAdmin,
  getTeamsOfTeamAdmin,
  getMembersOfTeam,
  transferListTeamOwnership,
  updateTeamSettings,
};
