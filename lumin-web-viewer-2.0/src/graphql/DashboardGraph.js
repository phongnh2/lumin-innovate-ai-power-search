import { gql } from '@apollo/client';

const PERSONAL_ACTIVITIES = gql`
  query GetEventsByUserId($limit: Int) {
    activities: getEventsByUserId(limit: $limit) {
      _id
      eventName
      eventTime
      actor {
        _id
        name
        email
        avatarRemoteId
      }
      target {
        _id
        name
        email
        avatarRemoteId
      }
      document {
        _id
        name
        comment {
          _id
          content
        }
      }
      team {
        _id
        name
      }
      organization {
        _id
        name
      }
    }
  }
`;

const PERSONAL_INSIGHTS_DOCUMENTS = gql`
  query getPersonalDocumentSummary {
    insightsData: getPersonalDocumentSummary {
      documentSummary {
        ownedDocumentTotal
        sharedDocumentTotal
        commentTotal
      }
      documentStat {
        derivativeDocumentRate
        derivativeCommentRate
        dailyNewComments {
          date
          total
        }
      }
    }
  }
`;
const TEAM_INSIGHTS_DOCUMENTS = gql`
  query getTeamDocumentSummary($teamId: ID!) {
    insightsData: getTeamDocumentSummary(teamId: $teamId) {
      documentSummary {
        ownedDocumentTotal
        sharedDocumentTotal
        commentTotal
      }
      documentStat {
        derivativeDocumentRate
        derivativeCommentRate
        dailyNewDocuments {
          date
          total
        }
        dailyNewComments {
          date
          total
        }
      }
    }
  }
`;

const TEAM_ACTIVITIES = gql`
  query GetEventsByTeamId($teamId: ID!, $limit: Int) {
    activities: getEventsByTeamId(teamId: $teamId, limit: $limit) {
      _id
      eventName
      eventTime
      actor {
        _id
        name
        email
        avatarRemoteId
      }
      target {
        _id
        name
        email
        avatarRemoteId
      }
      document {
        _id
        name
        comment {
          _id
          content
        }
      }
      team {
        _id
        name
        modification {
          memberRole
          plan
          planCharge
        }
      }
      organization {
        _id
        name
      }
    }
  }
`;

export {
  PERSONAL_ACTIVITIES,
  PERSONAL_INSIGHTS_DOCUMENTS,
  TEAM_ACTIVITIES,
  TEAM_INSIGHTS_DOCUMENTS,
};
