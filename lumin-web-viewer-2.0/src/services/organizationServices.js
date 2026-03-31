/// <reference path="./organizationServices.d.ts" />

import React from 'react';
import { Trans } from 'react-i18next';
import { batch } from 'react-redux';
import { matchPath } from 'react-router';

import { store } from 'src/redux/store';

import actions from 'actions';
import selectors from 'selectors';

import * as organizationGraph from 'services/graphServices/organization';

import { eventTracking } from 'utils';
import { OrganizationUtilities } from 'utils/Factory/Organization';

import { isEnabledReskin } from 'features/Reskin';

import UserEventConstants from 'constants/eventConstants';
import { ModalTypes } from 'constants/lumin-common';
import { NotiOrg } from 'constants/notificationConstant';
import { ORGANIZATION_MAX_MEMBERS, ORGANIZATION_ROLES, ORG_TEXT, ORG_TEAM_ROLE } from 'constants/organizationConstants';
import { Plans } from 'constants/plan';

import orgTracking from './awsTracking/organizationTracking';
import teamTracking from './awsTracking/teamTracking';

const { getState, dispatch } = store;

function hasManagerRole() {
  const organizations = selectors.getOrganizationList(getState()).data;
  return organizations && organizations.some((item) => isManager(item.role));
}

function getOrgByUrl({ url }) {
  return organizationGraph.getOrgByUrl({ url });
}

function getOrgById({ orgId }) {
  return organizationGraph.getOrgById({ orgId });
}

function getOrgList() {
  return organizationGraph.getOrgList();
}

async function updateGoogleSignInSecurity(orgId, isActive) {
  const organization = await organizationGraph.updateGoogleSignInSecurity(orgId, isActive);
  orgTracking.trackSettingChanged({
    name: orgTracking.GOOGLE_SIGN_IN,
    previousValue: !isActive,
    newValue: isActive,
  });
  dispatch(actions.updateCurrentOrganization(organization));
}

async function getTotalMembers({ orgId }) {
  const { member, guest, pending, request } = await organizationGraph.getTotalMembers({ orgId });
  const currentOrganization = selectors.getCurrentOrganization(getState());
  const totalMember = member + guest + pending;
  dispatch(
    actions.updateCurrentOrganization({
      ...currentOrganization.data,
      totalMember,
    })
  );
  return {
    member,
    guest,
    pending,
    request,
  };
}

function getUserRoleInOrg({ orgId }) {
  return organizationGraph.getUserRoleInOrg({ orgId });
}

async function inviteMemberToOrg({ orgId, members, invitedFrom = '', extraTrial }) {
  const res = await organizationGraph.inviteMemberToOrg({ orgId, members, extraTrial });
  const { invitations } = res;
  if (invitations) {
    eventTracking(UserEventConstants.EventType.INVITE_MEMBER_TO_WORKSPACE, {
      numOfPeopleInvited: members.length,
      invitedFrom,
    });
    orgTracking.trackAddUser({ members, invitations, invitedFrom });
  }
  return res;
}

function inviteOrgVerification(token) {
  return organizationGraph.inviteOrgVerification(token);
}

async function deletePendingInvite({ orgId, email }) {
  const res = await organizationGraph.deletePendingInvite({ orgId, email });
  orgTracking.trackRemoveUser();
  return res;
}

async function deleteMemberInOrganization({ orgId, userId }) {
  const res = await organizationGraph.deleteMemberInOrganization({ orgId, userId });
  orgTracking.trackRemoveUser(userId);
  return res;
}

function isPremium(currentOrganization) {
  return currentOrganization.payment.type !== Plans.FREE;
}

function isEnterprise(currentOrganization) {
  return currentOrganization?.payment?.type === Plans.ENTERPRISE;
}

async function changeAvatarOrganization({ orgId, file }) {
  const { avatarRemoteId } = await organizationGraph.changeAvatarOrganization({ orgId, file });
  batch(() => {
    dispatch(actions.updateCurrentOrganization({ avatarRemoteId }));
    dispatch(actions.updateOrganizationInList(orgId, { avatarRemoteId }));
  });
  return avatarRemoteId;
}

async function setAvatarOrganizationSuggestion({ orgId }) {
  const { avatarRemoteId } = await organizationGraph.setAvatarOrganizationSuggestion({ orgId });
  batch(() => {
    dispatch(
      actions.updateCurrentOrganization({
        metadata: { avatarSuggestion: { suggestionAvatarRemoteId: avatarRemoteId } },
      })
    );
    dispatch(
      actions.updateOrganizationInList(orgId, {
        metadata: { avatarSuggestion: { suggestionAvatarRemoteId: avatarRemoteId } },
      })
    );
  });
}

async function setAvatarFromSuggestion({ orgId }) {
  const { avatarRemoteId } = await organizationGraph.setAvatarFromSuggestion({ orgId });
  batch(() => {
    dispatch(actions.updateCurrentOrganization({ avatarRemoteId }));
    dispatch(actions.updateOrganizationInList(orgId, { avatarRemoteId }));
  });
}

function getOrgInfo({ orgId }) {
  return organizationGraph.getOrgInfo({ orgId });
}

async function changeProfileOrganization({ orgId, profile }) {
  const { data } = await organizationGraph.changeProfileOrganization({ orgId, profile });
  batch(() => {
    dispatch(actions.updateCurrentOrganization(data));
    dispatch(actions.updateOrganizationInList(orgId, data));
  });
  return data;
}

async function removeAvatarOrganization({ orgId }) {
  await organizationGraph.removeAvatarOrganization({ orgId });
  batch(() => {
    dispatch(actions.updateCurrentOrganization({ avatarRemoteId: '' }));
    dispatch(actions.updateOrganizationInList(orgId, { avatarRemoteId: '' }));
  });
}
/**
 *
 * @param {Array} roles
 */
function checkPermission(roles, userRole) {
  return roles.includes((userRole || '').toUpperCase());
}

function isManager(userRole = '') {
  return checkPermission(
    [ORGANIZATION_ROLES.ORGANIZATION_ADMIN, ORGANIZATION_ROLES.BILLING_MODERATOR],
    userRole.toUpperCase()
  );
}

function isOrgTeamAdmin(userRole = '') {
  return checkPermission([ORG_TEAM_ROLE.ADMIN], userRole.toUpperCase());
}

function isOrgAdmin(userRole) {
  return checkPermission([ORGANIZATION_ROLES.ORGANIZATION_ADMIN], userRole);
}

function leaveOrganization({ orgId }) {
  return organizationGraph.leaveOrganization({ orgId });
}

function getMembersInOrgByRole(orgId, sortKey) {
  return organizationGraph.getMembersInOrgByRole(orgId, sortKey);
}

function setOrganizationMembersRole(orgId, members) {
  return organizationGraph.setOrganizationMembersRole(orgId, members);
}

function confirmOrganizationAdminTransfer({ token }) {
  return organizationGraph.confirmOrganizationAdminTransfer({ token });
}

function checkOrganizationTransfering({ orgId }) {
  return organizationGraph.checkOrganizationTransfering({ orgId });
}

function renderProcessingTransferModal({ t, isEnableReskin = false }) {
  const modalSetting = {
    type: !isEnableReskin ? ModalTypes.SUCCESS : '',
    title: t('processingTransferModal.title'),
    message: t('processingTransferModal.message'),
    confirmButtonTitle: t('common.gotIt'),
    isFullWidthButton: !isEnableReskin,
    className: 'NotedModal',
    onConfirm: () => {},
    useReskinModal: true,
  };
  dispatch(actions.openModal(modalSetting));
}

function updateCurrentRoleInOrg(targetOrgId, targetRole) {
  const currentOrganization = selectors.getCurrentOrganization(getState()).data;

  batch(() => {
    if (currentOrganization?._id === targetOrgId) {
      dispatch(actions.updateCurrentOrganization({ userRole: targetRole }));
    }
    dispatch(actions.updateCurrentRoleInOrganizationList(targetOrgId, targetRole));
  });
}

function handleShouldUpdateInnerMembersListInOrganization(targetDataChanged, actionType, navigate, location) {
  const isStandInOrganizationRoute = matchPath(
    {
      path: `/${ORG_TEXT}/:orgName`,
      end: false,
    },
    location.pathname
  );

  if (isStandInOrganizationRoute) {
    const manipulateNewData = {
      userId: targetDataChanged.targetId || targetDataChanged.id,
      data: targetDataChanged.targetData || {},
      actionType,
    };
    navigate(location.pathname, {
      state: { shouldUpdateInnerMembersList: manipulateNewData },
      replace: true,
    });
  }
}

function handleUpdateInnerMemberListWhenReceivedNewNotification(membersList, newMemberState) {
  const findUser = (item) => item._id === newMemberState.userId;
  const isNotExistMemberList = !membersList || membersList.length === 0;
  switch (newMemberState.actionType) {
    case NotiOrg.UPDATE_USER_ROLE: {
      if (isNotExistMemberList) {
        return;
      }
      const member = membersList.find(findUser);
      if (member) {
        member.role = newMemberState.data.role;
      }
      break;
    }
    case NotiOrg.LEAVE_ORG:
    case NotiOrg.REMOVE_MEMBER: {
      if (isNotExistMemberList) {
        return;
      }
      const removedMemberIndex = membersList.findIndex(findUser);
      membersList.splice(removedMemberIndex, 1);
      break;
    }
    default:
      break;
  }
}

function uploadDocumentToOrganization({ orgId, fileName, isNotify, folderId, encodedUploadData }) {
  return organizationGraph.uploadDocumentToOrganization({
    orgId,
    fileName,
    isNotify,
    folderId,
    encodedUploadData,
  });
}

function uploadDocumentToOrgTeam(params) {
  return organizationGraph.uploadDocumentToOrgTeam(params);
}

function getMembersByDocumentId({ documentId, cursor, minQuantity }) {
  return organizationGraph.getMembersByDocumentId(documentId, cursor, minQuantity);
}

function updateDocumentPermissionInOrganization({ documentId, userId, permission }) {
  return organizationGraph.updateDocumentPermissionInOrganization(documentId, userId, permission);
}

async function acceptRequestingAccess({ orgId, userId }) {
  const res = await organizationGraph.acceptRequestingAccessOrganization({ orgId, userId });
  orgTracking.trackApproveRequest({ userId, organizationId: orgId });
  return res;
}

async function rejectRequestingAccess({ orgId, userId }) {
  const res = await organizationGraph.rejectRequestingAccessOrganization({ orgId, userId });
  orgTracking.trackRejectRequest({ userId, organizationId: orgId });
  return res;
}

async function createTeam({ orgId, team, members, file }) {
  const res = await organizationGraph.createOrganizationTeam({
    orgId,
    team,
    members,
    file,
  });
  const { organizationTeam } = res;
  teamTracking.trackCreate(organizationTeam);
  return res;
}

function editOrganizationTeam({ teamId, team, file }) {
  return organizationGraph.editOrganizationTeam({
    teamId,
    team,
    file,
  });
}

async function removeOrganizationTeamMember({ teamId, userId }) {
  const res = await organizationGraph.removeOrganizationTeamMember({
    teamId,
    userId,
  });
  teamTracking.trackRemoveMember({ teamId, removedMemberUserId: userId });
  return res;
}

async function deleteOrganizationTeam(teamId) {
  const res = await organizationGraph.deleteOrganizationTeam(teamId);
  const { team } = res;
  teamTracking.trackDelete(team);
  return res;
}

function checkUserAddToTeam({ email, teamId }) {
  return organizationGraph.checkUserAddToTeam({ email, teamId });
}

async function inviteMemberToTeam({ members, teamId }) {
  const res = await organizationGraph.inviteMemberToTeam({ members, teamId });
  teamTracking.trackInviteMember({ teamId, members: members.luminUsers });
  return res;
}

function getExportDomainDownloadUrl(orgId) {
  return organizationGraph.getExportDomainDownloadUrl(orgId);
}

async function createOrganization({ file, organizationData }) {
  const { type } = organizationData;
  const createdData = await organizationGraph.createOrganization({ file, organizationData });
  const createdOrg = createdData.organization;
  orgTracking.trackCreate({ type, organization: createdOrg });
  if (organizationData.members?.length > 0 && createdData.invitations) {
    orgTracking.trackAddUser({ members: organizationData.members, invitations: createdData.invitations });
  }
  return createdData;
}

function getOrganizationInsights(orgId) {
  return organizationGraph.getOrganizationInsights(orgId);
}

function getReachLimitedOrgMembers(currentOrganization) {
  const orgUtilities = new OrganizationUtilities({ organization: currentOrganization });
  return (
    !isEnterprise(currentOrganization) &&
    !orgUtilities.hasUnlimitedMember() &&
    currentOrganization?.totalMember >= ORGANIZATION_MAX_MEMBERS
  );
}

function forceMemberLoginWithGoogle({ orgName, onConfirm, onCancel, t }) {
  const setting = {
    title: t('orgDashboardSecurity.modalGoogleSignIn.requestMemberEnableGoogleSignIn.title'),
    message: (
      <Trans
        i18nKey="orgDashboardSecurity.modalGoogleSignIn.requestMemberEnableGoogleSignIn.message"
        values={{ orgName }}
        components={{
          b: <span className={isEnabledReskin() ? 'kiwi-message--primary' : 'Container__Content--message-primary'} />,
        }}
      />
    ),
    type: ModalTypes.WARNING,
    confirmButtonTitle: t('common.continue'),
    cancelButtonTitle: t('orgDashboardSecurity.exitOrg'),
    closeOnConfirm: false,
    disableBackdropClick: true,
    disableEscapeKeyDown: true,
    onConfirm,
    onCancel,
    useReskinModal: true,
  };
  dispatch(actions.openModal(setting));
}

function forceMemberLoginWithSamlSso({ orgName, onConfirm, onCancel, t }) {
  const setting = {
    title: t('samlSso.forceMemberLoginWithSamlSso.title'),
    message: (
      <Trans
        i18nKey="samlSso.forceMemberLoginWithSamlSso.message"
        values={{ orgName }}
        components={{
          b: <span className="kiwi-message--primary" />,
        }}
      />
    ),
    type: ModalTypes.WARNING,
    confirmButtonTitle: t('common.reSignIn'),
    cancelButtonTitle: t('orgDashboardSecurity.exitOrg'),
    closeOnConfirm: false,
    disableBackdropClick: true,
    disableEscapeKeyDown: true,
    onConfirm,
    onCancel,
    useReskinModal: true,
  };
  dispatch(actions.openModal(setting));
}

async function deleteOrganization(orgId) {
  const { organization: deletedOrganization } = await organizationGraph.deleteOrganization(orgId);
  orgTracking.trackDelete();
  dispatch(actions.updateOrganizationInList(orgId, deletedOrganization));
  return deletedOrganization;
}

async function reactiveOrganization(orgId, shouldUpdateCurrentOrg = true) {
  const { organization } = await organizationGraph.reactiveOrganization(orgId);
  if (shouldUpdateCurrentOrg) {
    batch(() => {
      dispatch(actions.updateCurrentOrganization(organization));
      dispatch(actions.updateOrganizationInList(orgId, organization));
    });
  } else {
    dispatch(actions.updateOrganizationInList(orgId, organization));
  }
}

async function reactivateSubscription(orgId) {
  const result = await organizationGraph.reactivateSubscription(orgId);
  const {
    data: { planRemoteId: planId, type: planName },
  } = result;
  eventTracking(UserEventConstants.EventType.USER_REACTIVATED_PAID, {
    stripePlanOrPriceId: planId,
    planName,
  });
  return result;
}

async function reactivateUnifyOrganizationSubscription({ orgId, productsToReactivate }) {
  const result = await organizationGraph.reactivateUnifyOrganizationSubscription({
    orgId,
    productsToReactivate,
  });
  const {
    data: { planRemoteId: planId, type: planName },
  } = result;
  eventTracking(UserEventConstants.EventType.USER_REACTIVATED_PAID, {
    stripePlanOrPriceId: planId,
    planName,
  });
  return result;
}

function getOrganizationPrice(orgId) {
  return organizationGraph.getOrganizationPrice(orgId);
}

async function createOrganizationSubscription(orgId, input) {
  const { data } = await organizationGraph.createOrganizationSubscription(orgId, input);

  if (!data.subscriptionRemoteId) {
    throw new Error('No subscription');
  }
  return data;
}

async function upgradeOrganizationSubcription(orgId, input) {
  const res = await organizationGraph.upgradeOrganizationSubcription(orgId, input);
  return res.data;
}

function checkMainOrgCreationAbility() {
  return organizationGraph.checkMainOrgCreationAbility();
}

async function requestJoinOrganization() {
  return organizationGraph.requestJoinOrganization();
}

async function joinOrganization({ orgId }) {
  return organizationGraph.joinOrganization({ orgId });
}

async function updatePasswordStrengthSecurity(orgId, passwordStrength) {
  return organizationGraph.updatePasswordStrengthSecurity(orgId, passwordStrength);
}

function subscriptionConvertOrganization(orgIds, callback) {
  return organizationGraph.subscriptionConvertOrganization(orgIds, callback);
}

function getAllOrganizationWithTeams(isGetTeamDetail = false) {
  return organizationGraph.getAllOrganizationWithTeams(isGetTeamDetail);
}
function getCopyDocumentOrgData() {
  return organizationGraph.getCopyDocumentOrgData();
}

function updateOrgTemplateWorkspace(orgId, templateWorkspace) {
  return organizationGraph.updateOrgTemplateWorkspace(orgId, templateWorkspace);
}

function addAssociateDomain({ orgId, associateDomain }) {
  return organizationGraph.addAssociateDomain({ orgId, associateDomain });
}

function editAssociateDomain({ orgId, newAssociateDomain, oldAssociateDomain }) {
  return organizationGraph.editAssociateDomain({ orgId, newAssociateDomain, oldAssociateDomain });
}

function removeAssociateDomain({ orgId, associateDomain }) {
  return organizationGraph.removeAssociateDomain({ orgId, associateDomain });
}

function sendRequestJoinOrg({ orgId }) {
  return organizationGraph.sendRequestJoinOrg({ orgId });
}

function updateDomainVisibilitySetting({ orgId, visibilitySetting }) {
  return organizationGraph.updateDomainVisibilitySetting({ orgId, visibilitySetting });
}

function resendOrganizationInvitation(orgId, invitationId) {
  return organizationGraph.resendOrganizationInvitation(orgId, invitationId);
}

function removeOrganizationInvitation(orgId, invitationId) {
  return organizationGraph.removeOrganizationInvitation(orgId, invitationId);
}

function acceptOrganizationInvitation({ orgId }) {
  return organizationGraph.acceptOrganizationInvitation({ orgId });
}

function uploadDocumentToPersonal(params) {
  return organizationGraph.uploadDocumentToPersonal(params);
}

function uploadThirdPartyDocuments({ orgId, folderId, documents }) {
  return organizationGraph.uploadThirdPartyDocuments({ orgId, folderId, documents });
}

function changeAutoUpgradeSetting(orgId, enabled) {
  return organizationGraph.changeAutoUpgradeSetting(orgId, enabled);
}

function changedDocumentStackSubscription({ orgId, onNext, onError }) {
  return organizationGraph.changedDocumentStackSubscription({ orgId, onNext, onError });
}

function hideInformMyDocumentModal(orgId) {
  return organizationGraph.hideInformMyDocumentModal(orgId);
}

function extraTrialDaysOrganization({ orgId, days, action }) {
  return organizationGraph.extraTrialDaysOrganization({ orgId, days, action });
}

function updateInviteUsersSetting({ orgId, inviteUsersSetting }) {
  return organizationGraph.updateInviteUsersSetting({ orgId, inviteUsersSetting });
}

function isOrgMember(userRole = '') {
  return checkPermission([ORGANIZATION_ROLES.MEMBER], userRole.toUpperCase());
}

function getRepresentativeMembers({ teamId, orgId }) {
  return organizationGraph.getRepresentativeMembers({ teamId, orgId });
}

function getUsersInvitableToOrg(input) {
  return organizationGraph.getUsersInvitableToOrg(input);
}

function checkOrganizationDocStack(orgId, { signal } = {}) {
  return organizationGraph.checkOrganizationDocStack(orgId, { signal });
}

async function getSuggestedUsersToInvite({ accessToken, forceUpdate, googleAuthorizationEmail, orgId }) {
  const res = await organizationGraph.getSuggestedUsersToInvite({
    accessToken,
    forceUpdate,
    googleAuthorizationEmail,
    orgId,
  });

  return res.data.getSuggestedUsersToInvite;
}

async function inviteMemberToAddDocStack({ orgId, members }) {
  const res = await organizationGraph.inviteMemberToAddDocStack({
    orgId,
    members,
  });
  return res.data.inviteMemberToOrganizationAddDocStack;
}

async function getOrganizationWithJoinStatus(orgId) {
  const res = await organizationGraph.getOrganizationWithJoinStatus(orgId);

  return res.data.getOrganizationWithJoinStatus;
}

async function getOrganizationFolderTree(orgId) {
  const res = await organizationGraph.getOrganizationFolderTree(orgId);

  return res.data.getOrganizationFolderTree;
}

async function getPersonalFolderTreeInOrg(orgId) {
  const res = await organizationGraph.getPersonalFolderTreeInOrg(orgId);

  return res.data.getPersonalFolderTreeInOrg;
}

async function getOrganizationTeamsFolderTree({ orgId, teamIds }) {
  const res = await organizationGraph.getOrganizationTeamsFolderTree({ orgId, teamIds });

  return res.data.getOrganizationTeamsFolderTree;
}

async function getPersonalFolderTree() {
  const res = await organizationGraph.getPersonalFolderTree();

  return res.data.getPersonalFolderTree;
}
export function assignSignSeats(input) {
  return organizationGraph.assignSignSeats(input);
}

export function unassignSignSeats(input) {
  return organizationGraph.unassignSignSeats(input);
}

export function rejectSignSeatRequests(input) {
  return organizationGraph.rejectSignSeatRequests(input);
}

export function requestSignSeat(input) {
  return organizationGraph.requestSignSeat(input);
}

async function upsertSamlSsoConfiguration({ orgId, domains, rawIdpMetadataXml }) {
  const res = await organizationGraph.upsertSamlSsoConfiguration({ orgId, domains, rawIdpMetadataXml });
  return res.data.upsertSamlSsoConfiguration;
}

async function deleteSamlSsoConfiguration(orgId) {
  const res = await organizationGraph.deleteSamlSsoConfiguration(orgId);
  return res.data.deleteSamlSsoConfiguration;
}

async function getSamlSsoConfiguration(orgId) {
  const res = await organizationGraph.getSamlSsoConfiguration(orgId);
  return res.data.getSamlSsoConfiguration;
}

async function enableScimSsoProvision(orgId) {
  const res = await organizationGraph.enableScimSsoProvision(orgId);
  return res.data.enableScimSsoProvision;
}

async function disableScimSsoProvision(orgId) {
  const res = await organizationGraph.disableScimSsoProvision(orgId);
  return res.data.disableScimSsoProvision;
}

async function getScimSsoConfiguration(orgId) {
  const res = await organizationGraph.getScimSsoConfiguration(orgId);
  return res.data.getScimSsoConfiguration;
}

export default {
  getOrgByUrl,
  getOrgById,
  getOrgList,
  updateGoogleSignInSecurity,
  getTotalMembers,
  getUserRoleInOrg,
  inviteMemberToOrg,
  inviteOrgVerification,
  deletePendingInvite,
  deleteMemberInOrganization,
  changeAvatarOrganization,
  setAvatarOrganizationSuggestion,
  setAvatarFromSuggestion,
  getOrgInfo,
  changeProfileOrganization,
  removeAvatarOrganization,
  isManager,
  getMembersInOrgByRole,
  setOrganizationMembersRole,
  leaveOrganization,
  isOrgAdmin,
  checkPermission,
  confirmOrganizationAdminTransfer,
  checkOrganizationTransfering,
  renderProcessingTransferModal,
  updateCurrentRoleInOrg,
  handleShouldUpdateInnerMembersListInOrganization,
  handleUpdateInnerMemberListWhenReceivedNewNotification,
  uploadDocumentToOrganization,
  uploadDocumentToOrgTeam,
  getMembersByDocumentId,
  updateDocumentPermissionInOrganization,
  acceptRequestingAccess,
  rejectRequestingAccess,
  createTeam,
  editOrganizationTeam,
  removeOrganizationTeamMember,
  deleteOrganizationTeam,
  checkUserAddToTeam,
  inviteMemberToTeam,
  getExportDomainDownloadUrl,
  createOrganization,
  isPremium,
  getOrganizationInsights,
  hasManagerRole,
  isEnterprise,
  getReachLimitedOrgMembers,
  forceMemberLoginWithGoogle,
  deleteOrganization,
  getOrganizationPrice,
  createOrganizationSubscription,
  upgradeOrganizationSubcription,
  reactiveOrganization,
  reactivateSubscription,
  checkMainOrgCreationAbility,
  requestJoinOrganization,
  updatePasswordStrengthSecurity,
  subscriptionConvertOrganization,
  getAllOrganizationWithTeams,
  getCopyDocumentOrgData,
  updateOrgTemplateWorkspace,
  addAssociateDomain,
  editAssociateDomain,
  removeAssociateDomain,
  sendRequestJoinOrg,
  updateDomainVisibilitySetting,
  joinOrganization,
  resendOrganizationInvitation,
  isOrgTeamAdmin,
  removeOrganizationInvitation,
  acceptOrganizationInvitation,
  uploadDocumentToPersonal,
  uploadThirdPartyDocuments,
  changeAutoUpgradeSetting,
  changedDocumentStackSubscription,
  hideInformMyDocumentModal,
  extraTrialDaysOrganization,
  updateInviteUsersSetting,
  isOrgMember,
  getRepresentativeMembers,
  getUsersInvitableToOrg,
  checkOrganizationDocStack,
  getSuggestedUsersToInvite,
  inviteMemberToAddDocStack,
  getOrganizationWithJoinStatus,
  getOrganizationFolderTree,
  getPersonalFolderTreeInOrg,
  getOrganizationTeamsFolderTree,
  getPersonalFolderTree,
  assignSignSeats,
  unassignSignSeats,
  rejectSignSeatRequests,
  reactivateUnifyOrganizationSubscription,
  requestSignSeat,
  upsertSamlSsoConfiguration,
  deleteSamlSsoConfiguration,
  getSamlSsoConfiguration,
  enableScimSsoProvision,
  disableScimSsoProvision,
  getScimSsoConfiguration,
  forceMemberLoginWithSamlSso,
};
