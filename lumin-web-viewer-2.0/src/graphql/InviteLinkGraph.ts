import { gql } from '@apollo/client';

import Fragments from './Fragment';

const GET_ORGANIZATION_INVITE_LINK = gql`
  query getOrganizationInviteLink($orgId: ID!) {
    getOrganizationInviteLink(orgId: $orgId) {
      ...OrganizationInviteLinkData
    }
  }
  ${Fragments.OrganizationInviteLinkData}
`;

const CREATE_ORGANIZATION_INVITE_LINK = gql`
  mutation createOrganizationInviteLink($input: OrganizationInviteLinkInput!) {
    createOrganizationInviteLink(input: $input) {
      ...OrganizationInviteLinkData
    }
  }
  ${Fragments.OrganizationInviteLinkData}
`;

const REGENERATE_ORGANIZATION_INVITE_LINK = gql`
  mutation regenerateOrganizationInviteLink($input: OrganizationInviteLinkInput!) {
    regenerateOrganizationInviteLink(input: $input) {
      ...OrganizationInviteLinkData
    }
  }
  ${Fragments.OrganizationInviteLinkData}
`;

const DELETE_ORGANIZATION_INVITE_LINK = gql`
  mutation deleteOrganizationInviteLink($orgId: ID!) {
    deleteOrganizationInviteLink(orgId: $orgId) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const VERIFY_ORGANIZATION_INVITE_LINK = gql`
  mutation verifyOrganizationInviteLink($inviteLinkId: String!) {
    verifyOrganizationInviteLink(inviteLinkId: $inviteLinkId) {
      _id
      orgId
      role
      isAlreadyMember
      orgUrl
      isExpired
    }
  }
`;

export const SUB_UPDATE_ORGANIZATION_INVITE_LINK = gql`
  subscription updateOrganizationInviteLink($orgId: ID!) {
    updateOrganizationInviteLink(orgId: $orgId) {
      inviteLink {
        ...OrganizationInviteLinkData
      }
      orgId
    }
  }
  ${Fragments.OrganizationInviteLinkData}
`;

export const InviteLinkGraph = {
  GET_ORGANIZATION_INVITE_LINK,
  CREATE_ORGANIZATION_INVITE_LINK,
  REGENERATE_ORGANIZATION_INVITE_LINK,
  DELETE_ORGANIZATION_INVITE_LINK,
  VERIFY_ORGANIZATION_INVITE_LINK,
  SUB_UPDATE_ORGANIZATION_INVITE_LINK,
};
