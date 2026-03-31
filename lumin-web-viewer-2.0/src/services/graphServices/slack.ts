import { FetchPolicy } from '@apollo/client';

import SlackGraph from 'graphQL/SlackGraph';

import {
  SlackChannel,
  SlackConversation,
  SlackRecipient,
  SlackSharingMode,
  SlackTeam,
} from 'features/ShareInSlack/interfaces/slack.interface';

import { FETCH_POLICY } from 'constants/graphConstant';

import { client } from '../../apollo';

export async function getSlackTeams(): Promise<SlackTeam[]> {
  const res = await client.query<{
    getSlackTeams: SlackTeam[];
  }>({
    query: SlackGraph.GET_SLACK_TEAMS,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY as FetchPolicy,
  });
  return res.data.getSlackTeams;
}

export async function initSlackOAuth(): Promise<{ contextJwt: string; flowId: string }> {
  const res = await client.query<{
    initSlackOAuth: { contextJwt: string; flowId: string };
  }>({
    query: SlackGraph.INIT_SLACK_OAUTH,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY as FetchPolicy,
  });
  return res.data.initSlackOAuth;
}

export async function getSlackChannels(teamId: string): Promise<SlackChannel[]> {
  const res = await client.query<{
    getSlackChannels: SlackChannel[];
  }>({
    query: SlackGraph.GET_SLACK_CHANNELS,
    variables: {
      teamId,
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY as FetchPolicy,
  });
  return res.data.getSlackChannels;
}

export async function getSlackRecipients(teamId: string): Promise<SlackRecipient[]> {
  const res = await client.query<{
    getSlackRecipients: SlackRecipient[];
  }>({
    query: SlackGraph.GET_SLACK_RECIPIENTS,
    variables: {
      teamId,
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY as FetchPolicy,
  });
  return res.data.getSlackRecipients;
}

export async function preCheckShareDocumentInSlack({
  documentId,
  slackTeamId,
  conversation,
}: {
  documentId: string;
  slackTeamId: string;
  conversation: SlackConversation;
}): Promise<{ isPermissionUpdateNeeded: boolean }> {
  const res = await client.mutate<{ preCheckShareDocumentInSlack: { isPermissionUpdateNeeded: boolean } }>({
    mutation: SlackGraph.PRE_CHECK_SHARE_DOCUMENT_IN_SLACK,
    variables: { input: { documentId, slackTeamId, conversation } },
  });
  return res.data.preCheckShareDocumentInSlack;
}

export async function shareDocumentInSlack({
  documentId,
  slackTeamId,
  conversation,
  role,
  sharingMode,
  message,
  isOverwritePermission,
}: {
  documentId: string;
  slackTeamId: string;
  conversation: SlackConversation;
  role: string;
  sharingMode: SlackSharingMode;
  message?: string;
  isOverwritePermission?: boolean;
}): Promise<{ hasUnshareableEmails: boolean; isQueuedSharing: boolean }> {
  const res = await client.mutate<{
    shareDocumentInSlack: { hasUnshareableEmails: boolean; isQueuedSharing: boolean };
  }>({
    mutation: SlackGraph.SHARE_DOCUMENT_IN_SLACK,
    variables: { input: { documentId, slackTeamId, conversation, role, sharingMode, message, isOverwritePermission } },
  });
  return res.data.shareDocumentInSlack;
}

export async function countSlackChannelMembers(teamId: string, channelId: string): Promise<number> {
  const res = await client.query<{ countSlackChannelMembers: number }>({
    query: SlackGraph.COUNT_SLACK_CHANNEL_MEMBERS,
    variables: { teamId, channelId },
  });
  return res.data.countSlackChannelMembers;
}

export async function revokeSlackConnection(teamId: string): Promise<void> {
  await client.mutate<{ revokeSlackConnection: void }>({
    mutation: SlackGraph.REVOKE_SLACK_CONNECTION,
    variables: { teamId },
  });
}
