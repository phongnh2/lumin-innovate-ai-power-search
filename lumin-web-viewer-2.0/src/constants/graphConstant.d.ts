export type FetchPolicyType = 'network-only' | 'no-cache' | 'cache-first' | 'cache-and-network' | 'standby';

export const FETCH_POLICY: {
  readonly NETWORK_ONLY: FetchPolicyType;
  readonly NO_CACHE: FetchPolicyType;
  readonly CACHE_FIRST: FetchPolicyType;
  readonly CACHE_AND_NETWORK: FetchPolicyType;
  readonly STANDBY: FetchPolicyType;
};
