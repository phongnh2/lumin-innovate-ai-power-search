import { gql } from '@apollo/client';

import Fragments from 'graphQL/Fragment';
import { OrganizationPaymentData, OrganizationMembers } from 'graphQL/fragments/OrganizationBase';

import { NESTING_DEPTH } from 'features/NestedFolders/constants';
import { buildFolderLevels } from 'features/NestedFolders/utils';

const CREATE_ORGANIZATION_SUBSCRIPTION = gql`
  mutation CreateSubscriptionInOrganization($orgId: ID!, $input: CreateOrganizationSubscriptionInput!) {
    createSubscriptionInOrganization(subcriptionInput: $input, orgId: $orgId) {
      message
      statusCode
      data {
        subscriptionRemoteId
        customerRemoteId
        planRemoteId
        type
        period
        status
        quantity
        currency
        priceVersion
        stripeAccountId
      }
    }
  }
`;

const UPGRADE_ORGANIZATION_SUBSCRIPTION = gql`
  mutation UpgradeSubscription($orgId: ID!, $input: UpgradeOrganizationSubscriptionInput!) {
    upgradeOrganizationSubcription(upgradeSubcriptionInput: $input, orgId: $orgId) {
      message
      statusCode
      data {
        subscriptionRemoteId
        customerRemoteId
        planRemoteId
        type
        period
        status
        quantity
        currency
        priceVersion
      }
    }
  }
`;

const GET_ORG_LISTS = gql`
  query orgsOfUser {
    orgsOfUser {
      organization {
        ...BasicOrganizationData
        docStackStorage {
          totalUsed
          totalStack
        }
        creationType
        isRestrictedBillingActions
      }
      role
    }
  }
  ${Fragments.BasicOrganizationData}
`;

const GET_ORG_INFO = gql`
  query getOrgInfo($orgId: ID!) {
    getOrgInfo: getOrganizationById(orgId: $orgId) {
      orgData {
        _id
        name
        payment {
          type
          period
        }
        owner {
          name
        }
        createdAt
        totalMember
        members(options: { limit: 4 }) {
          _id
          name
          avatarRemoteId
        }
        totalActiveMember
      }
    }
  }
`;

const GET_ORG_BY_URL = gql`
  query getOrganizationByUrl($url: String!) {
    getOrganizationByUrl(url: $url) {
      orgData {
        ...OrganizationData
        isLastActiveOrg
        userPermissions {
          canUseMultipleMerge
        }
        userRole
        totalTeam
        isRestrictedBillingActions
        teams {
          ...TeamData
        }
        ...OrganizationMembers
        totalSignSeats
        availableSignSeats
        isSignProSeat
        signDocStackStorage {
          isOverDocStack
          totalUsed
          totalStack
        }
      }
      documentsAvailable
      actionCountDocStack {
        print
        download
        share
        sync
      }
      aiChatbotDailyLimit
    }
  }
  ${Fragments.OrganizationData}
  ${Fragments.TeamData}
  ${OrganizationMembers}
`;

const GET_ORG_BY_ID = gql`
  query getOrganizationById($orgId: ID!) {
    getOrganizationById(orgId: $orgId) {
      orgData {
        _id
        url
        name
        avatarRemoteId
      }
    }
  }
`;

const UPDATE_GOOGLE_SIGNIN = gql`
  mutation updateGoogleSignInSecurity($orgId: ID!, $isActive: Boolean!) {
    updateGoogleSignInSecurity(orgId: $orgId, isActive: $isActive) {
      ...OrganizationData
    }
  }
  ${Fragments.OrganizationData}
`;

const GET_ORG_MEMBER_LIST = gql`
  query getMemberOfOrganization($input: GetMemberInput!, $internal: Boolean) {
    getMemberOfOrganization(input: $input, internal: $internal) {
      totalRecord
      totalItem
      edges {
        node {
          role
          lastActivity
          joinDate
          user {
            _id
            email
            name
            avatarRemoteId
            isSignProSeat
            isSeatRequest
            createdAt
          }
        }
      }
    }
  }
`;

const GET_LIST_REQUEST_JOIN_ORGANIZATION = gql`
  query getListRequestJoinOrganization($input: GetRequesterInput!) {
    getListRequestJoinOrganization(input: $input) {
      totalRecord
      totalItem
      edges {
        node {
          role
          requestDate
          user {
            _id
            email
            name
            avatarRemoteId
          }
        }
      }
    }
  }
`;

const GET_LIST_PENDING_USER_ORGANIZATION = gql`
  query getListPendingUserOrganization($input: PendingUserOrganizationInput!) {
    getListPendingUserOrganization(input: $input) {
      totalRecord
      totalItem
      edges {
        node {
          _id
          role
          email
          name
        }
      }
    }
  }
`;

const GET_TOTAL_MEMBER_SEGMENTS = gql`
  query getTotalMembers($orgId: ID!) {
    getTotalMembers(orgId: $orgId) {
      member
      guest
      pending
      request
    }
  }
`;

const GET_USER_ROLE_IN_ORG = gql`
  query getUserRoleInOrg($orgId: ID!) {
    getUserRoleInOrg(orgId: $orgId) {
      userId
      role
    }
  }
`;

const INVITE_MEMBER_TO_ORG = gql`
  mutation InviteMemberToOrganization($orgId: ID!, $members: [InviteToOrganizationInput], $extraTrial: Boolean) {
    inviteMemberToOrganization(orgId: $orgId, members: $members, extraTrial: $extraTrial) {
      message
      statusCode
      organization {
        ...OrganizationData
        members(options: { limit: 3 }) {
          _id
          name
          avatarRemoteId
        }
      }
      invitations {
        invitationId
        memberEmail
      }
      sameDomainEmails
      notSameDomainEmails
    }
  }
  ${Fragments.OrganizationData}
`;

const INVITE_ORG_VERIFICATION = gql`
  query inviteOrgVerification($token: String!) {
    inviteOrgVerification(token: $token) {
      isLuminUser
      email
      orgUrl
      isValidToken
      orgName
      notFinishedAuthenFlow
    }
  }
`;

const DELETE_PENDING_INVITE = gql`
  mutation deletePendingInvite($orgId: ID!, $email: String!) {
    deletePendingInvite(orgId: $orgId, email: $email) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const DELETE_MEMBER_ORG = gql`
  mutation deleteMemberInOrganization($orgId: ID!, $userId: ID!) {
    deleteMemberInOrganization(orgId: $orgId, userId: $userId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const CHANGE_AVATAR_ORGANIZATION = gql`
  mutation changeAvatarOrganization($orgId: ID!, $file: Upload!) {
    changeAvatarOrganization(orgId: $orgId, file: $file) {
      avatarRemoteId
    }
  }
`;

const SET_AVATAR_ORGANIZATION_SUGGESTION = gql`
  mutation setAvatarOrganizationSuggestion($orgId: ID!) {
    setAvatarOrganizationSuggestion(orgId: $orgId) {
      avatarRemoteId
    }
  }
`;

const SET_AVATAR_FROM_SUGGESTION = gql`
  mutation setAvatarFromSuggestion($orgId: ID!) {
    setAvatarFromSuggestion(orgId: $orgId) {
      avatarRemoteId
    }
  }
`;

const CHANGE_PROFILE_ORGANIZATION = gql`
  mutation changeProfileOrganization($orgId: ID!, $profile: OrganizationProfileInput!) {
    changeProfileOrganization(orgId: $orgId, profile: $profile) {
      message
      statusCode
      data {
        ...OrganizationData
      }
    }
  }
  ${Fragments.OrganizationData}
`;

const REMOVE_AVATAR_ORGANIZATION = gql`
  mutation removeAvatarOrganization($orgId: ID!) {
    removeAvatarOrganization(orgId: $orgId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const GET_MEMBERS_IN_ORG_BY_ROLE = gql`
  query getMembersInOrgByRole($input: GetMemberInput!) {
    getMemberOfOrganization(input: $input) {
      edges {
        node {
          role
          user {
            _id
            email
            name
            avatarRemoteId
          }
        }
      }
    }
  }
`;

const LEAVE_ORGANIZATION = gql`
  mutation leaveOrganization($orgId: ID!) {
    leaveOrganization(orgId: $orgId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const SET_ORGANIZATION_MEMBERS_ROLE = gql`
  mutation setOrganizationMembersRole($input: SetOrganizationMembersRoleInput!) {
    setOrganizationMembersRole(input: $input) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const CONFIRM_ORGANIZATION_ADMIN_TRANSFER = gql`
  mutation confirmOrganizationAdminTransfer($token: String!) {
    confirmOrganizationAdminTransfer(token: $token) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const REMOVE_ORGANIZATION_MEMBER = gql`
  subscription removeOrgMember($orgId: ID!) {
    removeOrgMember(orgId: $orgId) {
      organization {
        name
        domain
      }
      actor {
        name
      }
    }
  }
`;

const SUB_UPDATE_ORGANIZATION = gql`
  subscription updateOrganization($orgId: ID!) {
    updateOrganization(orgId: $orgId) {
      organization {
        ...OrganizationData
      }
      type
    }
  }
  ${Fragments.OrganizationData}
`;

const CHECK_ORGANIZATION_TRANSFERING = gql`
  query checkOrganizationTransfering($orgId: ID!) {
    checkOrganizationTransfering(orgId: $orgId)
  }
`;

const UPLOAD_DOCUMENTS_TO_ORGANIZATION = gql`
  mutation uploadDocumentToOrganization($input: UploadDocumentToOrgInput!) {
    uploadDocumentToOrganizationV2(input: $input) {
      ...DocumentData
    }
  }
  ${Fragments.DocumentData}
`;

const UPLOAD_DOCUMENTS_TO_ORG_TEAM = gql`
  mutation uploadDocumentToOrgTeam($input: UploadDocumentToTeamInput!) {
    uploadDocumentToOrgTeamV2(input: $input) {
      ...DocumentData
    }
  }
  ${Fragments.DocumentData}
`;

const GET_ORGANIZATION_DOCUMENTS = gql`
  query getOrganizationDocuments($input: GetOrganizationDocumentsInput!) {
    getDocuments: getOrganizationDocuments(input: $input) {
      hasNextPage
      cursor
      documents {
        ...DocumentData
        belongsTo {
          type
          workspaceId
          location {
            ownedOrgId
            _id
            name
            url
          }
        }
      }
      total
    }
  }
  ${Fragments.DocumentData}
`;

const GET_MEMBERS_BY_DOCUMENT_ID = gql`
  query getMembersByDocumentId($input: GetMembersByDocumentIdInput!) {
    getMembersByDocumentId(input: $input) {
      organizationName
      hasNextPage
      cursor
      total
      currentRole
      documentRole
      teamName
      members {
        userId
        name
        avatarRemoteId
        email
        permission
        role
      }
    }
  }
`;

const UPDATE_DOCUMENT_PERMISSION_IN_ORGANIZATION = gql`
  mutation updateDocumentOrganizationPermission($input: UpdateDocumentOrganizationPermissionInput!) {
    updateDocumentOrganizationPermission(input: $input) {
      ...BasicResponseWithEmailData
    }
  }
  ${Fragments.BasicResponseWithEmailData}
`;

const UPDATE_ORG_MEMBER_ROLE = gql`
  subscription updateOrgMemberRole($orgId: ID!) {
    updateOrgMemberRole(orgId: $orgId) {
      userId
      type
      orgId
      actorName
      role
    }
  }
`;

const ACCEPT_REQUEST_ACCESS_ORG = gql`
  mutation acceptRequestingAccessOrganization($orgId: ID!, $userId: ID!) {
    acceptRequestingAccessOrganization(orgId: $orgId, userId: $userId) {
      ...BasicResponseWithEmailData
    }
  }
  ${Fragments.BasicResponseWithEmailData}
`;

const REJECT_REQUEST_ACCESS_ORG = gql`
  mutation rejectRequestingAccessOrganization($orgId: ID!, $userId: ID!) {
    rejectRequestingAccessOrganization(orgId: $orgId, userId: $userId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const CREATE_ORGANIZATION_TEAM = gql`
  mutation createOrganizationTeam($orgId: ID!, $team: TeamInput!, $members: AddMemberOrgTeamInput, $file: Upload) {
    createOrganizationTeam(orgId: $orgId, team: $team, members: $members, file: $file) {
      message
      statusCode
      organizationTeam {
        ...TeamData
      }
    }
  }
  ${Fragments.TeamData}
`;

const EDIT_ORGANIZATION_TEAM = gql`
  mutation editOrgTeamInfo($teamId: ID!, $team: TeamInput!, $file: Upload) {
    editOrgTeamInfo(teamId: $teamId, team: $team, file: $file) {
      ...TeamData
    }
  }
  ${Fragments.TeamData}
`;

const REMOVE_ORGANIZATION_TEAM_MEMBER = gql`
  mutation removeOrgTeamMember($teamId: ID!, $userId: ID!) {
    removeOrgTeamMember(teamId: $teamId, userId: $userId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const DELETE_ORGANIZATION_TEAM = gql`
  mutation deleteOrgTeam($teamId: ID!) {
    deleteOrgTeam(teamId: $teamId) {
      team {
        _id
        name
      }
      documents
      members
    }
  }
`;

const CHECK_USER_ADD_TO_TEAM = gql`
  query checkUserAddToOrgTeam($email: String!, $teamId: ID!) {
    checkUserAddToOrgTeam(email: $email, teamId: $teamId) {
      user {
        _id
        name
        avatarRemoteId
        email
      }
      isAddedInOrg
      isAddedInOrgTeam
    }
  }
`;

const INVITE_MEMBER_TO_TEAM = gql`
  mutation inviteOrgTeamMember($teamId: ID!, $members: AddMemberOrgTeamInput!) {
    inviteOrgTeamMember(teamId: $teamId, members: $members) {
      message
      statusCode
    }
  }
`;

const GET_EXPORT_DOMAIN_URL = gql`
  mutation exportDomainData($orgId: ID!) {
    exportDomainData(orgId: $orgId) {
      url
    }
  }
`;

const CREATE_ORGANIZATION = gql`
  mutation createOrganization($organization: CreateOrganizationInput!, $file: Upload, $disableEmail: Boolean) {
    createOrganization(organization: $organization, file: $file, disableEmail: $disableEmail) {
      statusCode
      invitations {
        invitationId
        memberEmail
      }
      organization {
        members(options: { limit: 3 }) {
          _id
          name
          avatarRemoteId
        }
        userRole
        ...OrganizationData
      }
    }
  }
  ${Fragments.OrganizationData}
`;

const GET_ORGANIZATION_INSIGHTS = gql`
  query getOrganizationInsights($orgId: ID!, $memberLimit: Int) {
    getOrganizationInsight(orgId: $orgId) {
      documentSummary {
        ownedDocumentTotal
        signatureTotal
        annotationTotal
      }
      documentStat {
        derivativeDocumentRate
        dailyNewDocuments {
          date
          total
        }
        derivativeAnnotationRate
        dailyNewAnnotations {
          date
          total
        }
        derivativeSignatureRate
        dailyNewSignatures {
          date
          total
        }
      }
      nonDocumentStat {
        derivativeMemberRate
      }
      lastUpdated
    }
    getTotalMembers(orgId: $orgId) {
      member
      guest
      pending
      request
    }
    getRecentNewOrgMembers(orgId: $orgId, limit: $memberLimit) {
      role
      lastActivity
      joinDate
      user {
        _id
        name
        email
        avatarRemoteId
      }
    }
  }
`;

const DELETE_ORGANIZATION = gql`
  mutation deleteOrganization($orgId: ID!) {
    scheduleDeleteOrganization(orgId: $orgId) {
      statusCode
      message
      organization {
        payment {
          customerRemoteId
          subscriptionRemoteId
          planRemoteId
          type
          period
          status
          quantity
          currency
          stripeAccountId
        }
        settings {
          other {
            guestInvite
          }
          googleSignIn
          passwordStrength
          inviteUsersSetting
        }
        deletedAt
      }
    }
  }
`;

const REACTIVE_ORGANIZATION = gql`
  mutation reactiveOrganization($orgId: ID!) {
    reactiveOrganization(orgId: $orgId) {
      statusCode
      message
      organization {
        payment {
          customerRemoteId
          subscriptionRemoteId
          planRemoteId
          type
          period
          status
          quantity
          currency
          priceVersion
          trialInfo {
            highestTrial
            endTrial
            canStartTrial
            canUseStarterTrial
            canUseProTrial
            canUseBusinessTrial
          }
          stripeAccountId
        }
        deletedAt
      }
    }
  }
`;

const DELETE_ORGANIZATION_SUB = gql`
  subscription deleteOrganizationSub($orgId: ID!) {
    deleteOrganizationSub(orgId: $orgId) {
      organization {
        _id
        name
      }
    }
  }
`;

const GET_ORGANIZATION_PRICE = gql`
  query getOrganizationPrice($orgId: ID!) {
    getOrganizationPrice(orgId: $orgId) {
      pricePerUnit
      interval
    }
  }
`;

const REACTIVE_ORGANIZATION_SUBSCRIPTION = gql`
  mutation ReactiveSubscription($orgId: ID!) {
    reactiveOrganizationSubscription(orgId: $orgId) {
      message
      statusCode
      data {
        customerRemoteId
        subscriptionRemoteId
        planRemoteId
        type
        period
        status
        quantity
      }
    }
  }
`;

const REACTIVATE_UNIFY_ORGANIZATION_SUBSCRIPTION = gql`
  mutation reactivateUnifyOrganizationSubscription($input: ReactivateUnifySubscriptionInput!) {
    reactivateUnifyOrganizationSubscription(input: $input) {
      message
      statusCode
      data {
        customerRemoteId
        subscriptionRemoteId
        planRemoteId
        type
        period
        status
        subscriptionItems {
          id
          quantity
          planRemoteId
          period
          currency
          paymentType
          paymentStatus
          productName
        }
      }
    }
  }
`;

const CHECK_MAIN_ORG_CREATION_ABILITY = gql`
  query checkMainOrgCreationAbility {
    checkMainOrgCreationAbility {
      canCreate
      domainType
    }
  }
`;
const GET_MAIN_ORGANIZATION_CAN_JOIN = gql`
  query getMainOrganizationCanJoin {
    getMainOrganizationCanJoin {
      _id
      name
      avatarRemoteId
      joinStatus
    }
  }
`;

const REQUEST_JOIN_ORGANIZATION = gql`
  mutation requestJoinOrganization {
    requestJoinOrganization {
      message
      statusCode
      orgData {
        _id
      }
    }
  }
`;

const JOIN_ORGANIZATION = gql`
  mutation joinOrganization($orgId: ID!) {
    joinOrganization(orgId: $orgId) {
      organization {
        ...OrganizationData
        ...OrganizationMembers
      }
    }
  }
  ${Fragments.OrganizationData}
  ${OrganizationMembers}
`;

const CONVERT_TO_MAIN_ORGANIZATION_SUB = gql`
  subscription convertOrganization($orgId: ID!) {
    convertOrganization(orgId: $orgId) {
      orgId
      type
      url
    }
  }
`;

const UPDATE_CONVERTED_ORGANIZATION = gql`
  subscription updateConvertedOrganization($orgIds: [String]!) {
    updateConvertedOrganization(orgIds: $orgIds) {
      ...OrganizationData
    }
  }
  ${Fragments.OrganizationData}
`;

const UPDATE_PASSWORD_STRENGTH_SECURITY = gql`
  mutation updatePasswordStrengthSecurity($orgId: ID!, $passwordStrength: OrganizationPasswordStrengthRequired) {
    updatePasswordStrengthSecurity(orgId: $orgId, passwordStrength: $passwordStrength) {
      ...OrganizationData
    }
  }
  ${Fragments.OrganizationData}
`;

export const CREATE_DOCUMENT_FROM_FORM = gql`
  mutation createOrganizationDocumentForm($input: CreateOrganizationDocumentFormInput!) {
    createOrganizationDocumentForm(input: $input) {
      documentId
    }
  }
`;

const GET_ALL_ORGANIZATION_WITH_TEAMS = gql`
  query orgsOfUser($options: GetBelongsToOptions) {
    orgsOfUser {
      organization {
        _id
        name
        avatarRemoteId
        teams {
          _id
          name
          avatarRemoteId
          folders {
            _id
            name
            color
          }
          belongsTo(options: $options) {
            targetId
            detail {
              _id
              name
            }
          }
          roleOfUser
        }
        folders {
          _id
          name
          color
        }
        userRole
        totalMember
        totalActiveMember
        isRestrictedBillingActions
      }
    }
  }
`;
const COPY_DOCUMENT_GET_ALL_ORGANIZATION_WITH_TEAMS = gql`
  query orgsOfUser {
    orgsOfUser {
      organization {
        _id
        name
        avatarRemoteId
        userRole
        url
        teams {
          _id
          name
          avatarRemoteId
          roleOfUser
          folders {
            _id
            name
            color
          }
        }
        folders {
          _id
          name
          color
        }
        totalMember
        totalActiveMember
      }
    }
  }
`;

const UPDATE_ORG_TEMPLATE_WORKSPACE = gql`
  mutation updateOrgTemplateWorkspace($input: UpdateOrgTemplateWorkspaceInput!) {
    updateOrgTemplateWorkspace(input: $input) {
      ...OrganizationData
    }
  }
  ${Fragments.OrganizationData}
`;

const ADD_ASSOCIATE_DOMAIN = gql`
  mutation addAssociateDomain($input: AddAssociateDomainInput!) {
    addAssociateDomain(input: $input) {
      ...OrganizationData
    }
  }
  ${Fragments.OrganizationData}
`;

const EDIT_ASSOCIATE_DOMAIN = gql`
  mutation editAssociateDomain($input: EditAssociateDomainInput!) {
    editAssociateDomain(input: $input) {
      ...OrganizationData
    }
  }
  ${Fragments.OrganizationData}
`;

const REMOVE_ASSOCIATE_DOMAIN = gql`
  mutation removeAssociateDomain($input: RemoveAssociateDomainInput!) {
    removeAssociateDomain(input: $input) {
      ...OrganizationData
    }
  }
  ${Fragments.OrganizationData}
`;

const SEND_REQUEST_JOIN_ORG = gql`
  mutation sendRequestJoinOrg($orgId: ID!) {
    sendRequestJoinOrg(orgId: $orgId) {
      orgData {
        ...OrganizationData
      }
      newOrg {
        ...OrganizationData
      }
    }
  }
  ${Fragments.OrganizationData}
`;

const UPDATE_DOMAIN_VISIBILITY_SETTING = gql`
  mutation updateDomainVisibilitySetting($orgId: ID!, $visibilitySetting: DomainVisibilitySetting!) {
    updateDomainVisibilitySetting(orgId: $orgId, visibilitySetting: $visibilitySetting) {
      other {
        guestInvite
        hideMember
      }
      googleSignIn
      passwordStrength
      templateWorkspace
      domainVisibility
      inviteUsersSetting
    }
  }
`;

const RESEND_ORGANIZATION_INVITATION = gql`
  mutation resendOrganizationInvitation($orgId: ID!, $invitationId: ID!) {
    resendOrganizationInvitation(orgId: $orgId, invitationId: $invitationId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const REMOVE_ORGANIZATION_INVITATION = gql`
  mutation removeOrganizationInvitation($orgId: ID!, $invitationId: ID!) {
    removeOrganizationInvitation(orgId: $orgId, invitationId: $invitationId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const ACCEPT_INVITATION = gql`
  mutation acceptOrganizationInvitation($orgId: ID!) {
    acceptInvitationOrganization(orgId: $orgId) {
      organization {
        ...OrganizationData
        ...OrganizationMembers
      }
    }
  }
  ${Fragments.OrganizationData}
  ${OrganizationMembers}
`;

const GET_ORGANIZATION_FORM = gql`
  query getOrganizationDocumentForms($orgId: ID!) {
    getOrganizationDocumentForms(orgId: $orgId) {
      forms {
        _id
        name
        # size
        thumbnail
        # categories
      }
    }
  }
`;

const UPLOAD_DOCUMENT_TO_PERSONAL = gql`
  mutation uploadDocumentToPersonal($input: UploadPersonalDocumentInputV2!) {
    uploadDocumentToPersonalV2(input: $input) {
      ...DocumentData
      etag
      belongsTo {
        type
        workspaceId
        location {
          _id
          name
          url
        }
      }
    }
  }
  ${Fragments.DocumentData}
`;

const UPLOAD_THIRD_PARTY_DOCUMENTS = gql`
  mutation uploadThirdPartyDocuments($input: UploadThirdPartyDocumentsInput!) {
    uploadThirdPartyDocuments(input: $input) {
      ...DocumentData
    }
  }
  ${Fragments.DocumentData}
`;

const CHANGE_AUTO_UPGRADE_SETTING = gql`
  mutation changeAutoUpgradeSetting($orgId: ID!, $enabled: Boolean!) {
    changeAutoUpgradeSetting(orgId: $orgId, enabled: $enabled) {
      ...OrganizationSettingData
    }
  }
  ${Fragments.OrganizationSettingData}
`;

const CHANGED_DOCUMENT_STACK_SUBSCRIPTION = gql`
  subscription changedDocumentStackSubscription($orgId: ID!) {
    changedDocumentStackSubscription(orgId: $orgId) {
      orgId
      docStackStorage {
        totalUsed
        totalStack
      }
      payment {
        ...OrganizationPaymentData
      }
    }
  }
  ${OrganizationPaymentData}
`;

const HIDE_INFORM_DOCUMENT_MODAL = gql`
  mutation hideInformMyDocumentModal($orgId: ID!) {
    hideInformMyDocumentModal(orgId: $orgId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const EXTRA_TRIAL_DAYS_ORGANIZATION = gql`
  mutation extraTrialDaysOrganization($input: ExtraTrialDaysOrganizationInput!) {
    extraTrialDaysOrganization(input: $input) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const UPDATE_INVITE_PERMISSION_SETTING = gql`
  mutation updateInviteUsersSetting($orgId: ID!, $inviteUsersSetting: InviteUsersSetting!) {
    updateInviteUsersSetting(orgId: $orgId, inviteUsersSetting: $inviteUsersSetting) {
      inviteUsersSetting
    }
  }
`;

const GET_REPRESENTATIVE_MEMBERS = gql`
  query getRepresentativeMembers($input: GetRepresentativeMembersInput!) {
    getRepresentativeMembers(input: $input) {
      representativeMembers {
        _id
        avatarRemoteId
        email
        name
      }
    }
  }
`;

const GET_USERS_INVITABLE_TO_ORG = gql`
  query getUsersInvitableToOrg($input: GetUsersInvitableToOrgInput!) {
    getUsersInvitableToOrg(input: $input)
  }
`;

const CHECK_ORGANIZATION_DOC_STACK = gql`
  query checkOrganizationDocStack($orgId: ID!) {
    checkOrganizationDocStack(orgId: $orgId) {
      isOverDocStack
    }
  }
`;

const GET_ORGANIZATION_RESOURCES = gql`
  query getOrganizationResources($input: GetOrganizationResourcesInput!) {
    getOrganizationResources(input: $input) {
      cursor
      total
      folders {
        ...FolderData
      }
      documents {
        ...DocumentData
        belongsTo {
          type
          workspaceId
          location {
            _id
            name
            url
          }
        }
      }
    }
  }
  ${Fragments.DocumentData}
  ${Fragments.FolderData}
`;

const GET_SUGGESTED_USERS_TO_INVITE = gql`
  query getSuggestedUsersToInvite($input: GetSuggestedUserToInviteInput!) {
    getSuggestedUsersToInvite(input: $input) {
      suggestedUsers {
        _id
        name
        email
        remoteName
        avatarRemoteId
      }
    }
  }
`;

const INVITE_MEMBER_TO_ADD_DOC_STACK = gql`
  mutation inviteMemberToOrganizationAddDocStack(
    $orgId: ID!
    $members: [InviteToOrganizationInput]
    $extraTrial: Boolean
  ) {
    inviteMemberToOrganizationAddDocStack(orgId: $orgId, members: $members, extraTrial: $extraTrial) {
      message
      statusCode
      organization {
        ...OrganizationData
        members(options: { limit: 3 }) {
          _id
          name
          avatarRemoteId
        }
      }
      invitations {
        invitationId
        memberEmail
      }
    }
  }
  ${Fragments.OrganizationData}
`;

const GET_ORGANIZATION_WITH_JOIN_STATUS = gql`
  query getOrganizationWithJoinStatus($orgId: ID!) {
    getOrganizationWithJoinStatus(orgId: $orgId) {
      joinStatus
      members {
        _id
        name
        avatarRemoteId
      }
      paymentType
      paymentStatus
      paymentPeriod
      totalMember
    }
  }
`;

const GET_ORGANIZATION_FOLDER_TREE = gql`
  query getOrganizationFolderTree($input: GetOrganizationFolderTreeInput!) {
    getOrganizationFolderTree(input: $input) {
      children {
        ...FolderTreeData
        ${buildFolderLevels(NESTING_DEPTH - 1)}
      }
    }
  }
  ${Fragments.FolderTreeData}
`;

const GET_PERSONAL_FOLDER_TREE_IN_ORG = gql`
  query getPersonalFolderTreeInOrg($input: GetOrganizationFolderTreeInput!) {
    getPersonalFolderTreeInOrg(input: $input) {
      children {
        ...FolderTreeData
        ${buildFolderLevels(NESTING_DEPTH - 1)}
      }
    }
  }
  ${Fragments.FolderTreeData}
`;

const GET_ORGANIZATION_TEAMS_FOLDER_TREE = gql`
  query getOrganizationTeamsFolderTree($input: GetOrganizationFolderTreeInput!) {
    getOrganizationTeamsFolderTree(input: $input) {
      teams {
        _id
        name
        children {
          ...FolderTreeData
          ${buildFolderLevels(NESTING_DEPTH - 1)}
        }
      }
    }
  }
  ${Fragments.FolderTreeData}
`;

const GET_PERSONAL_FOLDER_TREE = gql`
  query getPersonalFolderTree {
    getPersonalFolderTree {
      children {
        ...FolderTreeData
        ${buildFolderLevels(NESTING_DEPTH - 1)}
      }
    }
  }
  ${Fragments.FolderTreeData}
`;

const ASSIGN_SIGN_SEATS = gql`
  mutation assignSignSeats($input: AssignSignSeatsInput!) {
    assignSignSeats(input: $input) {
      message
      statusCode
      data {
        availableSignSeats
      }
    }
  }
`;

const UNASSIGN_SIGN_SEATS = gql`
  mutation unassignSignSeats($input: UnassignSignSeatsInput!) {
    unassignSignSeats(input: $input) {
      message
      statusCode
      data {
        availableSignSeats
      }
    }
  }
`;

const REJECT_SIGN_SEAT_REQUESTS = gql`
  mutation rejectSignSeatRequests($input: RejectSignSeatRequestsInput!) {
    rejectSignSeatRequests(input: $input) {
      message
      statusCode
    }
  }
`;

const GET_ORGANIZATION_DOCUMENT_TEMPLATES = gql`
  query getOrganizationDocumentTemplates($input: GetOrganizationDocumentTemplatesInput!) {
    getDocuments: getOrganizationDocumentTemplates(input: $input) {
      hasNextPage
      cursor
      documents {
        ...DocumentTemplateData
        belongsTo {
          type
          workspaceId
          location {
            _id
            name
            url
          }
        }
      }
    }
  }
  ${Fragments.DocumentTemplateData}
`;

const REQUEST_SIGN_SEAT = gql`
  mutation requestSignSeat($input: RequestSignSeatInput!) {
    requestSignSeat(input: $input) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const UPDATE_SIGN_SEAT_SUBSCRIPTION = gql`
  subscription updateSignSeatSubscription($orgId: ID!) {
    updateSignSeatSubscription(orgId: $orgId) {
      action
    }
  }
`;

const UPDATE_CONTRACT_STACK_SUBSCRIPTION = gql`
  subscription updateContractStackSubscription($orgId: ID!) {
    updateContractStackSubscription(orgId: $orgId) {
      isOverDocStack
      totalUsed
      totalStack
    }
  }
`;

const UPSERT_SAML_SSO_CONFIGURATION = gql`
  mutation upsertSamlSsoConfiguration($input: SamlSsoConfigurationInput!) {
    upsertSamlSsoConfiguration(input: $input) {
      id
      createdAt
      domains
      label
      ascUrl
      spEntityId
      rawIdpMetadataXml
    }
  }
`;

const DELETE_SAML_SSO_CONFIGURATION = gql`
  mutation deleteSamlSsoConfiguration($orgId: ID!) {
    deleteSamlSsoConfiguration(orgId: $orgId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const GET_SAML_SSO_CONFIGURATION = gql`
  query getSamlSsoConfiguration($orgId: ID!) {
    getSamlSsoConfiguration(orgId: $orgId) {
      id
      createdAt
      domains
      label
      ascUrl
      spEntityId
      rawIdpMetadataXml
    }
  }
`;

const ENABLE_SCIM_SSO_PROVISION = gql`
  mutation enableScimSsoProvision($orgId: ID!) {
    enableScimSsoProvision(orgId: $orgId) {
      id
      label
      authorizationHeaderSecret
      mapperUrl
    }
  }
`;

const DISABLE_SCIM_SSO_PROVISION = gql`
  mutation disableScimSsoProvision($orgId: ID!) {
    disableScimSsoProvision(orgId: $orgId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const GET_SCIM_SSO_CONFIGURATION = gql`
  query getScimSsoConfiguration($orgId: ID!) {
    getScimSsoConfiguration(orgId: $orgId) {
      id
      label
      authorizationHeaderSecret
      mapperUrl
      scimServerUrl
    }
  }
`;

export {
  GET_ORG_LISTS,
  GET_ORG_BY_ID,
  GET_ORG_BY_URL,
  UPDATE_GOOGLE_SIGNIN,
  GET_ORG_MEMBER_LIST,
  GET_TOTAL_MEMBER_SEGMENTS,
  GET_LIST_REQUEST_JOIN_ORGANIZATION,
  GET_LIST_PENDING_USER_ORGANIZATION,
  GET_USER_ROLE_IN_ORG,
  INVITE_MEMBER_TO_ORG,
  INVITE_ORG_VERIFICATION,
  DELETE_PENDING_INVITE,
  DELETE_MEMBER_ORG,
  CHANGE_AVATAR_ORGANIZATION,
  SET_AVATAR_ORGANIZATION_SUGGESTION,
  SET_AVATAR_FROM_SUGGESTION,
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
  UPLOAD_DOCUMENTS_TO_ORG_TEAM,
  GET_ORGANIZATION_DOCUMENTS,
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
  GET_EXPORT_DOMAIN_URL,
  CREATE_ORGANIZATION,
  GET_ORGANIZATION_INSIGHTS,
  DELETE_ORGANIZATION,
  DELETE_ORGANIZATION_SUB,
  GET_ORGANIZATION_PRICE,
  CREATE_ORGANIZATION_SUBSCRIPTION,
  UPGRADE_ORGANIZATION_SUBSCRIPTION,
  REACTIVE_ORGANIZATION_SUBSCRIPTION,
  REACTIVE_ORGANIZATION,
  CHECK_MAIN_ORG_CREATION_ABILITY,
  GET_MAIN_ORGANIZATION_CAN_JOIN,
  REQUEST_JOIN_ORGANIZATION,
  JOIN_ORGANIZATION,
  CONVERT_TO_MAIN_ORGANIZATION_SUB,
  UPDATE_CONVERTED_ORGANIZATION,
  UPDATE_PASSWORD_STRENGTH_SECURITY,
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
  GET_ORGANIZATION_FORM,
  UPLOAD_DOCUMENT_TO_PERSONAL,
  UPLOAD_THIRD_PARTY_DOCUMENTS,
  CHANGE_AUTO_UPGRADE_SETTING,
  CHANGED_DOCUMENT_STACK_SUBSCRIPTION,
  HIDE_INFORM_DOCUMENT_MODAL,
  EXTRA_TRIAL_DAYS_ORGANIZATION,
  UPDATE_INVITE_PERMISSION_SETTING,
  GET_REPRESENTATIVE_MEMBERS,
  GET_USERS_INVITABLE_TO_ORG,
  CHECK_ORGANIZATION_DOC_STACK,
  GET_ORGANIZATION_RESOURCES,
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
  GET_ORGANIZATION_DOCUMENT_TEMPLATES,
  REQUEST_SIGN_SEAT,
  UPDATE_SIGN_SEAT_SUBSCRIPTION,
  UPDATE_CONTRACT_STACK_SUBSCRIPTION,
  UPSERT_SAML_SSO_CONFIGURATION,
  DELETE_SAML_SSO_CONFIGURATION,
  GET_SAML_SSO_CONFIGURATION,
  ENABLE_SCIM_SSO_PROVISION,
  DISABLE_SCIM_SSO_PROVISION,
  GET_SCIM_SSO_CONFIGURATION,
};
