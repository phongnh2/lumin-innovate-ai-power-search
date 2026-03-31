import { get } from 'lodash';

import {
  GET_ORG_LISTS,
  GET_ORG_BY_URL,
  GET_ORG_BY_ID,
  UPDATE_GOOGLE_SIGNIN,
  GET_TOTAL_MEMBER_SEGMENTS,
  GET_USER_ROLE_IN_ORG,
  INVITE_MEMBER_TO_ORG,
  INVITE_ORG_VERIFICATION,
  DELETE_PENDING_INVITE,
  DELETE_MEMBER_ORG,
  CHANGE_AVATAR_ORGANIZATION,
  SET_AVATAR_FROM_SUGGESTION,
  SET_AVATAR_ORGANIZATION_SUGGESTION,
  GET_ORG_INFO,
  CHANGE_PROFILE_ORGANIZATION,
  REMOVE_AVATAR_ORGANIZATION,
  GET_MEMBERS_IN_ORG_BY_ROLE,
  SET_ORGANIZATION_MEMBERS_ROLE,
  REMOVE_ORGANIZATION_MEMBER,
  LEAVE_ORGANIZATION,
  CONFIRM_ORGANIZATION_ADMIN_TRANSFER,
  SUB_UPDATE_ORGANIZATION,
  CHECK_ORGANIZATION_TRANSFERING,
  UPLOAD_DOCUMENTS_TO_ORGANIZATION,
  GET_MEMBERS_BY_DOCUMENT_ID,
  UPDATE_DOCUMENT_PERMISSION_IN_ORGANIZATION,
  UPDATE_ORG_MEMBER_ROLE,
  ACCEPT_REQUEST_ACCESS_ORG,
  REJECT_REQUEST_ACCESS_ORG,
  CREATE_ORGANIZATION_TEAM,
  EDIT_ORGANIZATION_TEAM,
  REMOVE_ORGANIZATION_TEAM_MEMBER,
  DELETE_ORGANIZATION_TEAM,
  CHECK_USER_ADD_TO_TEAM,
  INVITE_MEMBER_TO_TEAM,
  UPLOAD_DOCUMENTS_TO_ORG_TEAM,
  GET_EXPORT_DOMAIN_URL,
  CREATE_ORGANIZATION,
  GET_ORGANIZATION_INSIGHTS,
  DELETE_ORGANIZATION,
  DELETE_ORGANIZATION_SUB,
  GET_ORGANIZATION_PRICE,
  CREATE_ORGANIZATION_SUBSCRIPTION,
  UPGRADE_ORGANIZATION_SUBSCRIPTION,
  REACTIVE_ORGANIZATION,
  REACTIVE_ORGANIZATION_SUBSCRIPTION,
  CHECK_MAIN_ORG_CREATION_ABILITY,
  GET_MAIN_ORGANIZATION_CAN_JOIN,
  REQUEST_JOIN_ORGANIZATION,
  JOIN_ORGANIZATION,
  UPDATE_PASSWORD_STRENGTH_SECURITY,
  UPDATE_CONVERTED_ORGANIZATION,
  GET_ALL_ORGANIZATION_WITH_TEAMS,
  COPY_DOCUMENT_GET_ALL_ORGANIZATION_WITH_TEAMS,
  UPDATE_ORG_TEMPLATE_WORKSPACE,
  ADD_ASSOCIATE_DOMAIN,
  EDIT_ASSOCIATE_DOMAIN,
  REMOVE_ASSOCIATE_DOMAIN,
  SEND_REQUEST_JOIN_ORG,
  UPDATE_DOMAIN_VISIBILITY_SETTING,
  RESEND_ORGANIZATION_INVITATION,
  REMOVE_ORGANIZATION_INVITATION,
  ACCEPT_INVITATION,
  UPLOAD_THIRD_PARTY_DOCUMENTS,
  UPLOAD_DOCUMENT_TO_PERSONAL,
  CHANGE_AUTO_UPGRADE_SETTING,
  CHANGED_DOCUMENT_STACK_SUBSCRIPTION,
  HIDE_INFORM_DOCUMENT_MODAL,
  EXTRA_TRIAL_DAYS_ORGANIZATION,
  UPDATE_INVITE_PERMISSION_SETTING,
  GET_REPRESENTATIVE_MEMBERS,
  GET_USERS_INVITABLE_TO_ORG,
  CHECK_ORGANIZATION_DOC_STACK,
  GET_SUGGESTED_USERS_TO_INVITE,
  INVITE_MEMBER_TO_ADD_DOC_STACK,
  GET_ORGANIZATION_WITH_JOIN_STATUS,
  GET_ORGANIZATION_FOLDER_TREE,
  GET_PERSONAL_FOLDER_TREE_IN_ORG,
  GET_ORGANIZATION_TEAMS_FOLDER_TREE,
  GET_PERSONAL_FOLDER_TREE,
  ASSIGN_SIGN_SEATS,
  UNASSIGN_SIGN_SEATS,
  REJECT_SIGN_SEAT_REQUESTS,
  REACTIVATE_UNIFY_ORGANIZATION_SUBSCRIPTION,
  REQUEST_SIGN_SEAT,
  UPSERT_SAML_SSO_CONFIGURATION,
  DELETE_SAML_SSO_CONFIGURATION,
  GET_SAML_SSO_CONFIGURATION,
  ENABLE_SCIM_SSO_PROVISION,
  DISABLE_SCIM_SSO_PROVISION,
  GET_SCIM_SSO_CONFIGURATION,
} from 'graphQL/OrganizationGraph';

import errorUtils from 'utils/error';

import { FETCH_POLICY } from 'constants/graphConstant';

import { client, clientUpload } from '../../apollo';

export async function getOrgList() {
  const res = await client.query({
    query: GET_ORG_LISTS,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.orgsOfUser;
}

export async function getOrgByUrl({ url }) {
  const res = await client.query({
    query: GET_ORG_BY_URL,
    variables: {
      url,
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.getOrganizationByUrl;
}

export async function getOrgById({ orgId }) {
  const res = await client.query({
    query: GET_ORG_BY_ID,
    variables: {
      orgId,
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.getOrganizationById;
}

export async function updateGoogleSignInSecurity(orgId, isActive) {
  const res = await client.mutate({
    mutation: UPDATE_GOOGLE_SIGNIN,
    variables: {
      orgId,
      isActive,
    },
  });
  return res.data.updateGoogleSignInSecurity;
}

export async function getTotalMembers({ orgId }) {
  const res = await client.query({
    query: GET_TOTAL_MEMBER_SEGMENTS,
    variables: {
      orgId,
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.getTotalMembers;
}

export async function getUserRoleInOrg({ orgId }) {
  const res = await client.query({
    query: GET_USER_ROLE_IN_ORG,
    variables: {
      orgId,
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.getUserRoleInOrg;
}

export async function inviteMemberToOrg({ orgId, members, extraTrial }) {
  const res = await client.mutate({
    mutation: INVITE_MEMBER_TO_ORG,
    variables: {
      orgId,
      members: members.map(({ email, role }) => ({ email, role })),
      extraTrial,
    },
  });
  return res.data.inviteMemberToOrganization;
}

export async function inviteOrgVerification(token) {
  const res = await client.query({
    query: INVITE_ORG_VERIFICATION,
    variables: {
      token,
    },
  });
  return res.data.inviteOrgVerification;
}

export async function deletePendingInvite({ orgId, email }) {
  const res = await client.mutate({
    mutation: DELETE_PENDING_INVITE,
    variables: {
      orgId,
      email,
    },
  });
  return res.data.deletePendingInvite;
}

export async function deleteMemberInOrganization({ orgId, userId }) {
  const res = await client.mutate({
    mutation: DELETE_MEMBER_ORG,
    variables: {
      orgId,
      userId,
    },
  });
  return res.data.deleteMemberInOrganization;
}

export async function changeAvatarOrganization({ orgId, file }) {
  const res = await clientUpload({
    mutation: CHANGE_AVATAR_ORGANIZATION,
    variables: {
      orgId,
      file,
    },
  });
  return res.data.data.changeAvatarOrganization;
}

export async function setAvatarOrganizationSuggestion({ orgId }) {
  const res = await client.mutate({
    mutation: SET_AVATAR_ORGANIZATION_SUGGESTION,
    variables: {
      orgId,
    },
  });
  return res.data.setAvatarOrganizationSuggestion;
}

export async function setAvatarFromSuggestion({ orgId }) {
  const res = await client.mutate({
    mutation: SET_AVATAR_FROM_SUGGESTION,
    variables: {
      orgId,
    },
  });
  return res.data.setAvatarFromSuggestion;
}

export async function getOrgInfo({ orgId }) {
  const res = await client.query({
    query: GET_ORG_INFO,
    variables: {
      orgId,
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });

  return res.data.getOrgInfo;
}

export async function changeProfileOrganization({ orgId, profile }) {
  const res = await client.mutate({
    mutation: CHANGE_PROFILE_ORGANIZATION,
    variables: {
      orgId,
      profile,
    },
  });
  return res.data.changeProfileOrganization;
}

export async function removeAvatarOrganization({ orgId }) {
  const res = await client.mutate({
    mutation: REMOVE_AVATAR_ORGANIZATION,
    variables: {
      orgId,
    },
  });
  return res.data.removeAvatarOrganization;
}

export async function getMembersInOrgByRole(orgId, sortKey) {
  const input = {
    orgId,
    limit: 9999,
    offset: 0,
    option: {
      roleSort: sortKey,
    },
  };

  const res = await client.mutate({
    mutation: GET_MEMBERS_IN_ORG_BY_ROLE,
    variables: {
      input,
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });

  return res.data;
}

export async function setOrganizationMembersRole(orgId, members) {
  const res = await client.mutate({
    mutation: SET_ORGANIZATION_MEMBERS_ROLE,
    variables: {
      input: {
        orgId,
        members,
      },
    },
  });
  return res.data.setOrganizationMembersRole;
}

export function removeOrgMemberSubscription({ orgId, callback }) {
  return client
    .subscribe({
      query: REMOVE_ORGANIZATION_MEMBER,
      variables: {
        orgId,
      },
    })
    .subscribe({
      next({ data }) {
        callback(data.removeOrgMember);
      },
      error(err) {
        console.log(err);
      },
    });
}

export async function leaveOrganization({ orgId }) {
  const res = await client.mutate({
    mutation: LEAVE_ORGANIZATION,
    variables: {
      orgId,
    },
  });
  return res.data.leaveOrganization;
}

export async function confirmOrganizationAdminTransfer({ token }) {
  const res = await client.mutate({
    mutation: CONFIRM_ORGANIZATION_ADMIN_TRANSFER,
    variables: {
      token,
    },
  });
  return res.data.confirmOrganizationAdminTransfer;
}

export function updateOrganization({ orgId, callback }) {
  return client
    .subscribe({
      query: SUB_UPDATE_ORGANIZATION,
      variables: {
        orgId,
      },
    })
    .subscribe({
      next({ data }) {
        callback(data.updateOrganization);
      },
      error(err) {
        console.log(err);
      },
    });
}

export async function checkOrganizationTransfering({ orgId }) {
  const res = await client.query({
    query: CHECK_ORGANIZATION_TRANSFERING,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      orgId,
    },
  });
  return res.data.checkOrganizationTransfering;
}

export async function uploadDocumentToOrganization({ orgId, fileName, encodedUploadData, isNotify, folderId }) {
  const res = await clientUpload({
    mutation: UPLOAD_DOCUMENTS_TO_ORGANIZATION,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      input: {
        orgId,
        isNotify,
        folderId,
        encodedUploadData,
        documentName: fileName,
      },
    },
  });
  const { errors } = res.data;
  if (errors && errors.length) {
    throw errorUtils.deriveAxiosGraphToHttpError(errors[0]);
  }
  return res.data.data.uploadDocumentToOrganizationV2;
}

export async function uploadDocumentToOrgTeam({ teamId, fileName, encodedUploadData, folderId }) {
  const res = await clientUpload({
    mutation: UPLOAD_DOCUMENTS_TO_ORG_TEAM,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      input: {
        teamId,
        folderId,
        encodedUploadData,
        documentName: fileName,
      },
    },
  });
  return res.data.data.uploadDocumentToOrgTeamV2;
}

export async function getMembersByDocumentId(documentId, cursor, minQuantity) {
  const res = await client.query({
    query: GET_MEMBERS_BY_DOCUMENT_ID,
    variables: {
      input: {
        minQuantity,
        cursor,
        documentId,
      },
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });
  return res.data.getMembersByDocumentId;
}

export async function updateDocumentPermissionInOrganization(documentId, userId, targetDocumentPermission) {
  const res = await client.mutate({
    mutation: UPDATE_DOCUMENT_PERMISSION_IN_ORGANIZATION,
    variables: {
      input: {
        documentId,
        userId,
        permission: targetDocumentPermission,
      },
    },
  });
  return res.data.updateDocumentOrganizationPermission;
}

export function updateOrgMemberRoleSubscription({ orgId, callback }) {
  return client
    .subscribe({
      query: UPDATE_ORG_MEMBER_ROLE,
      variables: {
        orgId,
      },
    })
    .subscribe({
      next({ data }) {
        callback(data.updateOrgMemberRole);
      },
      error(err) {
        console.log(err);
      },
    });
}

export async function acceptRequestingAccessOrganization({ orgId, userId }) {
  const res = await client.mutate({
    mutation: ACCEPT_REQUEST_ACCESS_ORG,
    variables: {
      orgId,
      userId,
    },
  });
  return res.data.acceptRequestingAccessOrganization;
}

export async function rejectRequestingAccessOrganization({ orgId, userId }) {
  const res = await client.mutate({
    mutation: REJECT_REQUEST_ACCESS_ORG,
    variables: {
      orgId,
      userId,
    },
  });
  return res.data.rejectRequestingAccessOrganization;
}

export async function createOrganizationTeam({ orgId, team, members: { luminUsers }, file }) {
  const payload = {
    mutation: CREATE_ORGANIZATION_TEAM,
    variables: {
      orgId,
      team,
      members: {
        luminUsers,
      },
    },
  };

  let res;

  if (file) {
    payload.variables.file = file;
    res = await clientUpload(payload);
    return res.data.data.createOrganizationTeam;
  }

  res = await client.mutate(payload);
  return res.data.createOrganizationTeam;
}

export async function editOrganizationTeam({ teamId, team, file }) {
  const payload = {
    mutation: EDIT_ORGANIZATION_TEAM,
    variables: {
      teamId,
      team,
    },
  };

  if (file) {
    payload.variables.file = file;
    const res = await clientUpload(payload);
    return res.data.data.editOrgTeamInfo;
  }

  const res = await client.mutate(payload);
  return res.data.editOrgTeamInfo;
}

export async function removeOrganizationTeamMember({ teamId, userId }) {
  const res = await client.mutate({
    mutation: REMOVE_ORGANIZATION_TEAM_MEMBER,
    variables: {
      teamId,
      userId,
    },
  });
  return res.data.removeOrgTeamMember;
}

export async function deleteOrganizationTeam(teamId) {
  const res = await client.mutate({
    mutation: DELETE_ORGANIZATION_TEAM,
    variables: {
      teamId,
    },
  });

  return res.data.deleteOrgTeam;
}

export async function checkUserAddToTeam({ email, teamId }) {
  const res = await client.query({
    query: CHECK_USER_ADD_TO_TEAM,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      email,
      teamId,
    },
  });
  return res.data.checkUserAddToOrgTeam;
}

export async function inviteMemberToTeam({ teamId, members }) {
  const res = await client.mutate({
    mutation: INVITE_MEMBER_TO_TEAM,
    variables: {
      teamId,
      members,
    },
  });
  return res.data.inviteOrgTeamMember;
}

export async function getExportDomainDownloadUrl(orgId) {
  const res = await client.mutate({
    mutation: GET_EXPORT_DOMAIN_URL,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
    variables: {
      orgId,
    },
  });

  return res.data.exportDomainData;
}

export async function createOrganization({ file, organizationData }) {
  const payload = {
    mutation: CREATE_ORGANIZATION,
    variables: {
      organization: organizationData,
      disableEmail: true,
    },
  };

  if (file) {
    payload.variables.file = file;
    const resUpload = await clientUpload(payload);
    return resUpload.data.data.createOrganization;
  }

  const res = await client.mutate(payload);
  return res.data.createOrganization;
}

export async function getOrganizationInsights(orgId) {
  const res = await client.query({
    query: GET_ORGANIZATION_INSIGHTS,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      orgId,
      memberLimit: 5,
    },
  });

  const { getTotalMembers: memberData, getRecentNewOrgMembers, getOrganizationInsight: organizationInsight } = res.data;
  const { lastUpdated } = organizationInsight;
  const totalMembers = memberData.member + memberData.pending + memberData.guest;

  const organizationMembers = {
    memberCount: memberData,
    totalMembers,
    recentAdded: getRecentNewOrgMembers,
    rate: get(organizationInsight, 'nonDocumentStat.derivativeMemberRate', 0),
  };

  const organizationDocuments = {
    totalDocuments: get(organizationInsight, 'documentSummary.ownedDocumentTotal', 0),
    dailyNewDocuments: get(organizationInsight, 'documentStat.dailyNewDocuments', []),
    rate: get(organizationInsight, 'documentStat.derivativeDocumentRate', 0),
  };

  const organizationAnnotations = {
    totalAnnotations: get(organizationInsight, 'documentSummary.annotationTotal', 0),
    dailyNewAnnotations: get(organizationInsight, 'documentStat.dailyNewAnnotations', []),
    rate: get(organizationInsight, 'documentStat.derivativeAnnotationRate', 0),
  };

  const organizationSignatures = {
    totalSignatures: get(organizationInsight, 'documentSummary.signatureTotal', 0),
    dailyNewSignatures: get(organizationInsight, 'documentStat.dailyNewSignatures', []),
    rate: get(organizationInsight, 'documentStat.derivativeSignatureRate', 0),
  };

  return {
    organizationMembers,
    organizationDocuments,
    organizationAnnotations,
    organizationSignatures,
    lastUpdated,
  };
}

export async function deleteOrganization(orgId) {
  const res = await client.mutate({
    mutation: DELETE_ORGANIZATION,
    variables: {
      orgId,
    },
  });

  return res.data.scheduleDeleteOrganization;
}

export async function reactiveOrganization(orgId) {
  const res = await client.mutate({
    mutation: REACTIVE_ORGANIZATION,
    variables: {
      orgId,
    },
  });

  return res.data.reactiveOrganization;
}

export async function reactivateSubscription(orgId) {
  const res = await client.mutate({
    mutation: REACTIVE_ORGANIZATION_SUBSCRIPTION,
    variables: {
      orgId,
    },
  });
  return res.data.reactiveOrganizationSubscription;
}

export async function reactivateUnifyOrganizationSubscription({ orgId, productsToReactivate }) {
  const res = await client.mutate({
    mutation: REACTIVATE_UNIFY_ORGANIZATION_SUBSCRIPTION,
    variables: {
      input: {
        orgId,
        subscriptionItems: productsToReactivate,
      },
    },
  });
  return res.data.reactivateUnifyOrganizationSubscription;
}

export async function deleteOrgSubscription({ orgId, callback }) {
  return client
    .subscribe({
      query: DELETE_ORGANIZATION_SUB,
      variables: {
        orgId,
      },
    })
    .subscribe({
      next({ data }) {
        callback(data.deleteOrganizationSub);
      },
      error(err) {
        console.log(err);
      },
    });
}

export async function getOrganizationPrice(orgId) {
  const res = await client.query({
    query: GET_ORGANIZATION_PRICE,
    variables: {
      orgId,
    },
  });

  return res.data.getOrganizationPrice;
}

export async function createOrganizationSubscription(orgId, input) {
  const res = await client.mutate({
    mutation: CREATE_ORGANIZATION_SUBSCRIPTION,
    variables: {
      orgId,
      input,
    },
  });

  return res.data.createSubscriptionInOrganization;
}

export async function upgradeOrganizationSubcription(orgId, input) {
  const res = await client.mutate({
    mutation: UPGRADE_ORGANIZATION_SUBSCRIPTION,
    variables: {
      orgId,
      input,
    },
  });

  return res.data.upgradeOrganizationSubcription;
}

export async function checkMainOrgCreationAbility() {
  const res = await client.query({
    query: CHECK_MAIN_ORG_CREATION_ABILITY,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.checkMainOrgCreationAbility;
}

export async function getMainOrganizationCanJoin() {
  const res = await client.query({
    query: GET_MAIN_ORGANIZATION_CAN_JOIN,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.getMainOrganizationCanJoin;
}

export async function requestJoinOrganization() {
  const res = await client.mutate({
    mutation: REQUEST_JOIN_ORGANIZATION,
  });
  return res.data.requestJoinOrganization;
}

export async function joinOrganization({ orgId }) {
  const res = await client.mutate({
    mutation: JOIN_ORGANIZATION,
    variables: {
      orgId,
    },
  });
  return res.data.joinOrganization;
}

export async function updatePasswordStrengthSecurity(orgId, passwordStrength) {
  const res = await client.mutate({
    mutation: UPDATE_PASSWORD_STRENGTH_SECURITY,
    variables: {
      orgId,
      passwordStrength,
    },
  });

  return res.data;
}

export function subscriptionConvertOrganization(orgIds = [], callback = () => {}) {
  return client
    .subscribe({
      query: UPDATE_CONVERTED_ORGANIZATION,
      variables: {
        orgIds,
      },
    })
    .subscribe({
      next({ data }) {
        callback(data.updateConvertedOrganization);
      },
      error() {},
    });
}

export async function getAllOrganizationWithTeams(isGetTeamDetail) {
  const res = await client.query({
    query: GET_ALL_ORGANIZATION_WITH_TEAMS,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      options: { detail: isGetTeamDetail },
    },
  });

  return res.data.orgsOfUser;
}
export async function getCopyDocumentOrgData() {
  const res = await client.query({
    query: COPY_DOCUMENT_GET_ALL_ORGANIZATION_WITH_TEAMS,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.orgsOfUser;
}

export async function updateOrgTemplateWorkspace(input) {
  const res = await client.mutate({
    mutation: UPDATE_ORG_TEMPLATE_WORKSPACE,
    variables: {
      input,
    },
  });
  return res.data.updateOrgTemplateWorkspace;
}

export async function addAssociateDomain({ orgId, associateDomain }) {
  const res = await client.mutate({
    mutation: ADD_ASSOCIATE_DOMAIN,
    variables: {
      input: { orgId, associateDomain },
    },
  });
  return res.data.addAssociateDomain;
}

export async function editAssociateDomain({ orgId, newAssociateDomain, oldAssociateDomain }) {
  const res = await client.mutate({
    mutation: EDIT_ASSOCIATE_DOMAIN,
    variables: {
      input: { orgId, newAssociateDomain, oldAssociateDomain },
    },
  });
  return res.data.editAssociateDomain;
}

export async function removeAssociateDomain({ orgId, associateDomain }) {
  const res = await client.mutate({
    mutation: REMOVE_ASSOCIATE_DOMAIN,
    variables: {
      input: { orgId, associateDomain },
    },
  });
  return res.data.removeAssociateDomain;
}

export async function sendRequestJoinOrg({ orgId }) {
  const res = await client.mutate({
    mutation: SEND_REQUEST_JOIN_ORG,
    variables: {
      orgId,
    },
  });
  return res.data.sendRequestJoinOrg;
}

export async function updateDomainVisibilitySetting({ orgId, visibilitySetting }) {
  const res = await client.mutate({
    mutation: UPDATE_DOMAIN_VISIBILITY_SETTING,
    variables: {
      orgId,
      visibilitySetting,
    },
  });
  return res.data.updateDomainVisibilitySetting;
}

export async function resendOrganizationInvitation(orgId, invitationId) {
  const res = await client.mutate({
    mutation: RESEND_ORGANIZATION_INVITATION,
    variables: {
      orgId,
      invitationId,
    },
  });
  return res.data.resendOrganizationInvitation;
}

export async function removeOrganizationInvitation(orgId, invitationId) {
  const res = await client.mutate({
    mutation: REMOVE_ORGANIZATION_INVITATION,
    variables: {
      orgId,
      invitationId,
    },
  });
  return res.data.removeOrganizationInvitation;
}

export async function acceptOrganizationInvitation({ orgId }) {
  const res = await client.mutate({
    mutation: ACCEPT_INVITATION,
    variables: {
      orgId,
    },
  });

  return res.data.acceptInvitationOrganization;
}

export async function uploadDocumentToPersonal({ orgId, folderId, encodedUploadData, fileName, documentId }) {
  const res = await clientUpload({
    mutation: UPLOAD_DOCUMENT_TO_PERSONAL,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      input: {
        orgId,
        folderId,
        documentId,
        fileName,
        encodedUploadData,
      },
    },
  });
  return res.data.data.uploadDocumentToPersonalV2;
}

export async function uploadThirdPartyDocuments({ orgId, folderId, documents }) {
  const res = await client.mutate({
    mutation: UPLOAD_THIRD_PARTY_DOCUMENTS,
    variables: {
      input: {
        orgId,
        folderId,
        documents,
      },
    },
  });
  return res.data.uploadThirdPartyDocuments;
}

export async function changeAutoUpgradeSetting(orgId, enabled) {
  const res = await client.mutate({
    mutation: CHANGE_AUTO_UPGRADE_SETTING,
    variables: {
      orgId,
      enabled,
    },
  });

  return res.data.changeAutoUpgradeSetting;
}

export function changedDocumentStackSubscription({ orgId, onNext, onError }) {
  return client
    .subscribe({
      query: CHANGED_DOCUMENT_STACK_SUBSCRIPTION,
      variables: {
        orgId,
      },
    })
    .subscribe({
      next({ data }) {
        onNext(data.changedDocumentStackSubscription);
      },
      error(e) {
        onError(e);
      },
    });
}

export async function hideInformMyDocumentModal(orgId) {
  const res = await client.mutate({
    mutation: HIDE_INFORM_DOCUMENT_MODAL,
    variables: {
      orgId,
    },
  });
  return res.data.hideInformMyDocumentModal;
}

export async function extraTrialDaysOrganization({ orgId, days, action }) {
  const res = await client.mutate({
    mutation: EXTRA_TRIAL_DAYS_ORGANIZATION,
    variables: {
      input: {
        orgId,
        days,
        action,
      },
    },
  });
  return res.data.extraTrialDaysOrganization;
}

export async function updateInviteUsersSetting({ orgId, inviteUsersSetting }) {
  const res = await client.mutate({
    mutation: UPDATE_INVITE_PERMISSION_SETTING,
    variables: {
      orgId,
      inviteUsersSetting,
    },
  });
  return res.data.updateInviteUsersSetting;
}

export async function getRepresentativeMembers({ orgId, teamId }) {
  const res = await client.query({
    query: GET_REPRESENTATIVE_MEMBERS,
    variables: {
      input: {
        orgId,
        teamId,
      },
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.getRepresentativeMembers;
}

export async function getUsersInvitableToOrg(input) {
  const res = await client.query({
    query: GET_USERS_INVITABLE_TO_ORG,
    variables: {
      input,
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.getUsersInvitableToOrg;
}

export async function checkOrganizationDocStack(orgId, { signal } = {}) {
  const res = await client.query({
    query: CHECK_ORGANIZATION_DOC_STACK,
    variables: {
      orgId,
    },
    context: {
      fetchOptions: { signal },
    },
  });
  return res.data.checkOrganizationDocStack;
}

export async function getSuggestedUsersToInvite({ accessToken, forceUpdate, googleAuthorizationEmail, orgId }) {
  return client.query({
    query: GET_SUGGESTED_USERS_TO_INVITE,
    variables: {
      input: {
        orgId,
        accessToken,
        forceUpdate,
        googleAuthorizationEmail,
      },
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
}

export async function inviteMemberToAddDocStack({ orgId, members }) {
  return client.mutate({
    mutation: INVITE_MEMBER_TO_ADD_DOC_STACK,
    variables: {
      orgId,
      members,
      extraTrial: false,
    },
  });
}

export async function getOrganizationWithJoinStatus(orgId) {
  return client.query({
    query: GET_ORGANIZATION_WITH_JOIN_STATUS,
    variables: {
      orgId,
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
}

export async function getOrganizationFolderTree(orgId) {
  return client.query({
    query: GET_ORGANIZATION_FOLDER_TREE,
    variables: {
      input: {
        orgId,
      },
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
}

export async function getPersonalFolderTreeInOrg(orgId) {
  return client.query({
    query: GET_PERSONAL_FOLDER_TREE_IN_ORG,
    variables: {
      input: {
        orgId,
      },
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
}

export async function getOrganizationTeamsFolderTree({ orgId, teamIds }) {
  return client.query({
    query: GET_ORGANIZATION_TEAMS_FOLDER_TREE,
    variables: {
      input: {
        orgId,
        teamIds,
      },
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
}

export async function getPersonalFolderTree() {
  return client.query({
    query: GET_PERSONAL_FOLDER_TREE,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
}

export async function assignSignSeats(input) {
  const res = await client.mutate({
    mutation: ASSIGN_SIGN_SEATS,
    variables: {
      input,
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.assignSignSeats;
}

export async function unassignSignSeats(input) {
  const res = await client.mutate({
    mutation: UNASSIGN_SIGN_SEATS,
    variables: {
      input,
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.unassignSignSeats;
}

export async function rejectSignSeatRequests(input) {
  const res = await client.mutate({
    mutation: REJECT_SIGN_SEAT_REQUESTS,
    variables: {
      input,
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.rejectSignSeatRequests;
}

export async function requestSignSeat(input) {
  const res = await client.mutate({
    mutation: REQUEST_SIGN_SEAT,
    variables: {
      input,
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.requestSignSeat;
}

export async function deleteSamlSsoConfiguration(orgId) {
  return client.mutate({
    mutation: DELETE_SAML_SSO_CONFIGURATION,
    variables: {
      orgId,
    },
  });
}

export async function getSamlSsoConfiguration(orgId) {
  return client.query({
    query: GET_SAML_SSO_CONFIGURATION,
    variables: {
      orgId,
    },
  });
}

export async function enableScimSsoProvision(orgId) {
  return client.mutate({
    mutation: ENABLE_SCIM_SSO_PROVISION,
    variables: {
      orgId,
    },
  });
}

export async function disableScimSsoProvision(orgId) {
  return client.mutate({
    mutation: DISABLE_SCIM_SSO_PROVISION,
    variables: {
      orgId,
    },
  });
}

export async function getScimSsoConfiguration(orgId) {
  return client.query({
    query: GET_SCIM_SSO_CONFIGURATION,
    variables: {
      orgId,
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });
}

export async function upsertSamlSsoConfiguration(input) {
  return client.mutate({
    mutation: UPSERT_SAML_SSO_CONFIGURATION,
    variables: {
      input,
    },
  });
}
