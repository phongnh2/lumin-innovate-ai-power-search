import { dashboard as dashboardGraph } from './graphServices';

export function getPersonalActivities(limit) {
  return dashboardGraph.getPersonalActivities(limit);
}

export function getPersonalInsightsDocuments() {
  return dashboardGraph.getPersonalInsightsDocuments();
}

export function getTeamInsightsDocuments(teamId) {
  return dashboardGraph.getTeamInsightsDocuments(teamId);
}

export function getTeamActivities(teamId, limit) {
  return dashboardGraph.getTeamActivities(teamId, limit);
}

export default {
  getPersonalActivities,
  getPersonalInsightsDocuments,
  getTeamActivities,
  getTeamInsightsDocuments,
};
