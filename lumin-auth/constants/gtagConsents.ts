export const ConsentParams = {
  AD_STORAGE: 'ad_storage',
  AD_USER_DATA: 'ad_user_data',
  ANALYTICS_STORAGE: 'analytics_storage',
  FUNCTIONALITY_STORAGE: 'functionality_storage',
  PERSONALIZATION_STORAGE: 'personalization_storage',
  SECURITY_STORAGE: 'security_storage'
};

export enum ConsentStatus {
  GRANTED = 'granted',
  DENIED = 'denied'
}

export const AllConsentGrantedParams = Object.values(ConsentParams).reduce((acc, param) => {
  acc[param] = ConsentStatus.GRANTED;
  return acc;
}, {} as Record<string, string>);
