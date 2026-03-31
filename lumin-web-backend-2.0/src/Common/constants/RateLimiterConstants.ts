export const RateLimiterType = {
  FREE: 'FREE',
  PAID: 'PAID',
};

export const RateLimiterStrategy = {
  IP_ADDRESS: 'IP_ADDRESS',
  USER_ID: 'USER_ID',
  EMAIL: 'EMAIL',
  INGRESS_COOKIE: 'INGRESS_COOKIE',
  ANONYMOUS_USER_ID: 'ANONYMOUS_USER_ID',
};

export const RateLimiterFileSize = {
  FREE: 20 * 1024 * 1024,
  PAID: 200 * 1024 * 1024,
};

export const RateLimiterFileSizeForMobile = {
  FREE: 20 * 1024 * 1024,
  PAID: 50 * 1024 * 1024,
};

export const RateLimiterFileSizeInMB = {
  FREE: 20,
  PAID: 200,
};
