export const INTERCOM_REDIS_TOKEN_PREFIX = 'intercom-session-token';
export const INTERCOM_REDIS_TOKEN_TTL = 5 * 60; // 5 minutes
export const INTERCOM_REDIS_TOKEN_USED_KEY = 'used';
export const X_INTERCOM_TOKEN_HEADER = 'x-intercom-token';
export const X_INTERCOM_SOLUTION_HEADER = 'x-intercom-solution';
export const INTERCOM_SENSITIVE_FIELDS = {
  USER_ID: 'user_id',
  EMAIL: 'email',
  NAME: 'name',
};

export const INTERCOM_ENDPOINTS = {
  CONTACT: '/contacts',
  MERGE_LEAD_INTO_USER: '/contacts/merge',
  SEARCH_CONTACTS: '/contacts/search',
  CONVERSATION: '/conversations',
};
