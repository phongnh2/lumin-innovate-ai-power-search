import {
  PERSONAL_ACTIVITIES,
  PERSONAL_INSIGHTS_DOCUMENTS,
  TEAM_ACTIVITIES,
  TEAM_INSIGHTS_DOCUMENTS,
} from 'graphQL/DashboardGraph';
import { client } from '../../apollo';

export function getPersonalActivities(limit) {
  return client.query({
    query: PERSONAL_ACTIVITIES,
    fetchPolicy: 'no-cache',
    variables: {
      limit,
    },
  });
}

export function getPersonalInsightsDocuments() {
  return client.query({
    query: PERSONAL_INSIGHTS_DOCUMENTS,
    fetchPolicy: 'network-only',
  });
}

export function getTeamInsightsDocuments(teamId) {
  return client.query({
    query: TEAM_INSIGHTS_DOCUMENTS,
    fetchPolicy: 'network-only',
    variables: {
      teamId,
    },
  });
}

export function getTeamActivities(teamId, limit) {
  return client.query({
    query: TEAM_ACTIVITIES,
    fetchPolicy: 'no-cache',
    variables: {
      teamId,
      limit,
    },
  });
}

export default {
  getPersonalActivities,
  getPersonalInsightsDocuments,
  getTeamActivities,
  getTeamInsightsDocuments,
};
