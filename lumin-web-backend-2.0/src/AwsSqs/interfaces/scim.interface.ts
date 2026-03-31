export interface ScimEventAttributes {
  GeoLocationCity: string;
  GeoLocationCountry: string;
  GeoLocationRegion: string;
  IdentityActive: string;
  IdentityID: string;
  ProjectEnvironment: string;
  SCIMClient: string;
  SubscriptionID: string;
}

export interface ScimMessage {
  name: string;
  version: string;
  timestamp: string;
  projectId: string;
  eventAttributes: ScimEventAttributes;
}

export enum ScimMessageName {
  IdentityCreated = 'IdentityCreated',
  IdentityUpdated = 'IdentityUpdated',
}
