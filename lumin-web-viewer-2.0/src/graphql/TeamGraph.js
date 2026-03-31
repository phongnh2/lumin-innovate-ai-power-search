import { gql } from '@apollo/client';

import Fragments from './Fragment';

const TEAM = gql`
  query MyTeam($teamId: ID!) {
    team(teamId: $teamId) {
      ...TeamData
    }
  }
  ${Fragments.TeamData}
`;

const TEAM_INFO = gql`
  query MyTeam($teamId: ID!) {
    team(teamId: $teamId) {
      _id
      name
      payment {
        type
      }
      createdAt
      totalMembers
      members(options: { limit: 4 }) {
        _id
        name
        avatarRemoteId
      }
      owner {
        name
      }
      orgOwned: belongsTo(options: { detail: true }) {
        detail {
          name
        }
      }
    }
  }
`;

const GET_ORG_TEAMS = gql`
  query getOrgTeams($orgId: ID!) {
    getOrgTeams(orgId: $orgId) {
      teams {
        _id
        name
        avatarRemoteId
        totalMembers
        belongsTo {
          targetId
          type
        }
        roleOfUser
        owner {
          _id
          name
        }
        members(options: { sort: { isOwner: ASC, roleValue: ASC }, limit: 4 }) {
          _id
          name
          avatarRemoteId
          email
        }
        createdAt
      }
    }
  }
`;

const MY_TEAMS = gql`
  query MyTeams($clientId: ID!) {
    teams: teamsOfUser(clientId: $clientId) {
      _id
    }
  }
`;

const REMOVE_TEAM = gql`
  mutation RemoveTeam(, $teamId: ID!) {
    removeTeam(teamId: $teamId) {
      team {
        _id
        name
      }
      documents
      members
    }
  }
`;

const ADD_MEMBERS = gql`
  mutation AddMembers(
    $clientId: ID!
    $teamId: ID!
    $members: [MembershipInput]
  ) {
    addMembers: addMembersToTeam(
      clientId: $clientId
      teamId: $teamId
      members: $members
    ) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const FILTER_MEMBERS = gql`
  query FilterMembers(
    $clientId: ID!
    $offset: Int
    $limit: Int
    $memberShipInput: MembershipInput
    $userQueryInput: UserQueryInput
    $sortOptions: MembershipSortInput
  ) {
    memberships(
      clientId: $clientId
      input: $memberShipInput
      options: {
        sort: $sortOptions
        offset: $offset
        limit: $limit
      }
      userInput: $userQueryInput
    ) {
      role
      user {
        _id
        email
        name
        avatarRemoteId
      }
      isOwner
    }
    membershipsCount(clientId: $clientId, input: $memberShipInput, userInput: $userQueryInput)
  }
`;

const REMOVE_MEMBER = gql`
  mutation RemoveMember($clientId: ID!, $teamId: ID!, $userId: ID!) {
    removeMember(clientId: $clientId, teamId: $teamId, userId: $userId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const REMOVE_INVITED_MEMBER = gql`
  mutation DelInviteNonLuminToTeam($teamId: ID!, $email: String!) {
    delInviteNonLuminToTeam(teamId: $teamId, email: $email) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const SET_ADMIN = gql`
  mutation SetAdmin($clientId: ID!, $teamId: ID!, $userId: ID!, $newRole: inviteTeamRole) {
    editMember(
      clientId: $clientId
      teamId: $teamId
      userId: $userId
      newRole: $newRole
      isTransferOwner: false
    ) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const SET_MODERATOR = gql`
  mutation SetModerator($clientId: ID!, $teamId: ID!, $userId: ID!, $newRole: inviteTeamRole) {
    editMember(
      clientId: $clientId
      teamId: $teamId
      userId: $userId
      newRole: $newRole
      isTransferOwner: false
    ) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const SET_MEMBER = gql`
  mutation SetMember($clientId: ID!, $teamId: ID!, $userId: ID!, $newRole: inviteTeamRole) {
    editMember(
      clientId: $clientId
      teamId: $teamId
      userId: $userId
      newRole: $newRole
      isTransferOwner: false
    ) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const SEARCH_MEMBERS = gql`
  query SearchMembersForTransfer(
    $teamId: ID!
    $cursor: ID
    $userQueryInput: UserQueryInput
  ) {
    team(teamId: $teamId) {
      totalMembers
      members(input: $userQueryInput, options: { cursor: $cursor }) {
        _id
        email
        name
        avatarRemoteId
      }
      owner {
        _id
      }
      membersCount(input: $userQueryInput)
    }
  }
`;

const TRANSFER_OWNERSHIP = gql`
  mutation TransferOwnership(
    $clientId: ID!
    $teamId: ID!
    $newOwnerId: ID!
    $teamInput: TeamInput!
    $newRole: inviteTeamRole!
  ) {
    editMember(
      clientId: $clientId
      teamId: $teamId
      userId: $newOwnerId
      newRole: $newRole
      isTransferOwner: true
    ) {
      ...BasicResponseData
    }
    editTeam(clientId: $clientId, teamId: $teamId, team: $teamInput) {
      _id
      name
      avatarRemoteId
    }
  }
  ${Fragments.BasicResponseData}
`;

const EDIT_TEAM = gql`
  mutation EditMyTeam($clientId: ID!, $teamId: ID!, $team: TeamInput!) {
    editTeam(clientId: $clientId, teamId: $teamId, team: $team) {
      _id
      name
      avatarRemoteId
    }
  }
`;

const ADD_MEMBERS_TO_TEAM = gql`
  mutation AddMembersToTeam(
    $clientId: ID!
    $teamId: ID!
    $members: [MembershipInput]!
  ) {
    addMembersToTeam(clientId: $clientId, teamId: $teamId, members: $members) {
      ...TeamData
    }
  }
  ${Fragments.TeamData}
`;

const SUB_UPDATE_TEAMS = gql`
  subscription updateTeams($input: UpdateTeamsInput!) {
    updateTeams(input: $input) {
      type
      statusCode
      team {
        _id
        avatarRemoteId
        name
        payment {
          type
          period
          status
          quantity
          currency
        }
        createdAt
        settings {
          templateWorkspace
        }
      }
    }
  }
`;

const GET_REMAINING_MEMBER_QUANTITY = gql`
  query GetRemainingQuantityTeam($teamId: ID!) {
    getRemainingQuantity(teamId: $teamId)
  }
`;

const TRANSFER_TEAM_ADMIN = gql`
  mutation transferTeamOwnership($teamId: ID!, $userId: ID!) {
    transferTeamOwnership(teamId: $teamId, userId: $userId) {
      ...TeamData
    }
  }
  ${Fragments.TeamData}
`;

const LEAVE_ORG_TEAM = gql`
  mutation leaveOrgTeam($teamId: ID!) {
    leaveOrgTeam(teamId: $teamId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const GET_TEAMS_OF_TEAM_ADMIN = gql`
  query getTeamsOfTeamAdmin($orgId: ID!, $userId: ID!) {
    getTeamsOfTeamAdmin(orgId: $orgId, userId: $userId) {
      _id
      name
      avatarRemoteId
      totalMembers
    }
  }
`;

const GET_MEMBERS_OF_TEAM = gql`
  query getMembersOfTeam($teamId: ID!) {
    getMembersOfTeam(teamId: $teamId) {
      user {
        _id
        name
        email
        avatarRemoteId
      }
    }
  }
`;

const TRANSFER_LIST_TEAM_OWNERSHIP = gql`
  mutation transferListTeamOwnership($input: TransferTeamsOwnershipInput!) {
    transferListTeamOwnership(input: $input) {
      teamsFailed
    }
  }
`;

const GET_ORGANIZATION_TEAM_DOCUMENTS = gql`
  query getOrganizationTeamDocuments($input: GetOrganizationTeamDocumentsInput!) {
    getDocuments: getOrganizationTeamDocuments(input: $input) {
      hasNextPage
      cursor
      documents {
        ...DocumentData
        belongsTo {
          type
          location {
            _id
            name
            url
            ownedOrgId
          }
        }
      }
      total
    }
  }
  ${Fragments.DocumentData}
`;
const UPDATE_ORGANIZATION_TEAM_SETTINGS = gql`
  mutation updateTeamSettings($teamId: ID!, $settings: UpdateTeamSettingsInput!) {
    updateTeamSettings(teamId: $teamId, settings: $settings) {
      ...TeamData
    }
  }
  ${Fragments.TeamData}
`;

const GET_ORGANIZATION_TEAM_DOCUMENT_TEMPLATES = gql`
  query getOrganizationTeamDocumentTemplates($input: GetOrganizationTeamDocumentTemplatesInput!) {
    getDocuments: getOrganizationTeamDocumentTemplates(input: $input) {
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

export {
  ADD_MEMBERS_TO_TEAM,
  EDIT_TEAM,
  SEARCH_MEMBERS,
  TRANSFER_OWNERSHIP,
  FILTER_MEMBERS,
  MY_TEAMS,
  REMOVE_TEAM,
  TEAM,
  ADD_MEMBERS,
  REMOVE_MEMBER,
  SET_ADMIN,
  SET_MODERATOR,
  SET_MEMBER,
  SUB_UPDATE_TEAMS,
  REMOVE_INVITED_MEMBER,
  GET_REMAINING_MEMBER_QUANTITY,
  TEAM_INFO,
  TRANSFER_TEAM_ADMIN,
  LEAVE_ORG_TEAM,
  GET_TEAMS_OF_TEAM_ADMIN,
  GET_MEMBERS_OF_TEAM,
  TRANSFER_LIST_TEAM_OWNERSHIP,
  GET_ORG_TEAMS,
  GET_ORGANIZATION_TEAM_DOCUMENTS,
  UPDATE_ORGANIZATION_TEAM_SETTINGS,
  GET_ORGANIZATION_TEAM_DOCUMENT_TEMPLATES,
};
