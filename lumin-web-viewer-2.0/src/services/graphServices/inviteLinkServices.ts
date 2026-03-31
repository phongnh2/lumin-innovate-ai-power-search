import { FetchPolicy } from '@apollo/client';

import { InviteLinkGraph } from 'graphQL/InviteLinkGraph';

import { IOrganizationInviteLink } from 'features/InviteLink/interfaces/inviteLink.interface';

import { FETCH_POLICY } from 'constants/graphConstant';

import { IBasicResponse } from 'interfaces/common';

import { client } from '../../apollo';

export const getOrganizationInviteLink = async ({ orgId }: { orgId: string }) => {
  const res = await client.query<{
    getOrganizationInviteLink: IOrganizationInviteLink;
  }>({
    query: InviteLinkGraph.GET_ORGANIZATION_INVITE_LINK,
    variables: {
      orgId,
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE as FetchPolicy,
  });
  return res.data.getOrganizationInviteLink;
};

export const createOrganizationInviteLink = async ({ orgId }: { orgId: string }) => {
  const res = await client.mutate<{
    createOrganizationInviteLink: IOrganizationInviteLink;
  }>({
    mutation: InviteLinkGraph.CREATE_ORGANIZATION_INVITE_LINK,
    variables: {
      input: {
        orgId,
      },
    },
  });
  return res.data.createOrganizationInviteLink;
};

export const regenerateOrganizationInviteLink = async ({ orgId, role }: { orgId: string; role: string }) => {
  const res = await client.mutate<{
    regenerateOrganizationInviteLink: IOrganizationInviteLink;
  }>({
    mutation: InviteLinkGraph.REGENERATE_ORGANIZATION_INVITE_LINK,
    variables: {
      input: {
        orgId,
        role: role.toUpperCase(),
      },
    },
  });
  return res.data.regenerateOrganizationInviteLink;
};

export const deleteOrganizationInviteLink = async (orgId: string) => {
  const res = await client.mutate<{
    deleteOrganizationInviteLink: IBasicResponse;
  }>({
    mutation: InviteLinkGraph.DELETE_ORGANIZATION_INVITE_LINK,
    variables: {
      orgId,
    },
  });
  return res.data.deleteOrganizationInviteLink;
};

export const verifyOrganizationInviteLink = async (inviteLinkId: string) => {
  const res = await client.mutate<{
    verifyOrganizationInviteLink: {
      _id: string;
      orgId: string;
      role: string;
      isAlreadyMember: boolean;
      orgUrl: string;
      isExpired: boolean;
    };
  }>({
    mutation: InviteLinkGraph.VERIFY_ORGANIZATION_INVITE_LINK,
    variables: {
      inviteLinkId,
    },
  });
  return res.data.verifyOrganizationInviteLink;
};
