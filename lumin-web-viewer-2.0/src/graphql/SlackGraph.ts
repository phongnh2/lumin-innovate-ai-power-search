import { gql } from '@apollo/client';

const GET_SLACK_TEAMS = gql`
  query getSlackTeams {
    getSlackTeams {
      id
      domain
      name
      avatar
    }
  }
`;

const INIT_SLACK_OAUTH = gql`
  query initSlackOAuth {
    initSlackOAuth {
      contextJwt
      flowId
    }
  }
`;

const GET_SLACK_CHANNELS = gql`
  query getSlackChannels($teamId: String!) {
    getSlackChannels(teamId: $teamId) {
      id
      name
      isPrivate
      totalMembers
    }
  }
`;

const GET_SLACK_RECIPIENTS = gql`
  query getSlackRecipients($teamId: String!) {
    getSlackRecipients(teamId: $teamId) {
      id
      name
      avatarUrl
      displayName
      email
    }
  }
`;

const REVOKE_SLACK_CONNECTION = gql`
  mutation revokeSlackConnection($teamId: String!) {
    revokeSlackConnection(teamId: $teamId) {
      statusCode
    }
  }
`;

const PRE_CHECK_SHARE_DOCUMENT_IN_SLACK = gql`
  query preCheckShareDocumentInSlack($input: PreCheckShareDocumentInSlackInput!) {
    preCheckShareDocumentInSlack(input: $input) {
      isPermissionUpdateNeeded
    }
  }
`;

const SHARE_DOCUMENT_IN_SLACK = gql`
  mutation shareDocumentInSlack($input: ShareDocumentInSlackInput!) {
    shareDocumentInSlack(input: $input) {
      hasUnshareableEmails
      isQueuedSharing
    }
  }
`;

const COUNT_SLACK_CHANNEL_MEMBERS = gql`
  query countSlackChannelMembers($teamId: String!, $channelId: String!) {
    countSlackChannelMembers(teamId: $teamId, channelId: $channelId)
  }
`;

export default {
  GET_SLACK_TEAMS,
  INIT_SLACK_OAUTH,
  GET_SLACK_CHANNELS,
  GET_SLACK_RECIPIENTS,
  REVOKE_SLACK_CONNECTION,
  PRE_CHECK_SHARE_DOCUMENT_IN_SLACK,
  SHARE_DOCUMENT_IN_SLACK,
  COUNT_SLACK_CHANNEL_MEMBERS,
};
