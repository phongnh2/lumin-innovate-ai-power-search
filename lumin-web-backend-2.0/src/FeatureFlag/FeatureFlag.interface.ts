/* eslint-disable no-use-before-define */

import { FeatureResultSource } from '@growthbook/growthbook';

import { CountryCodeEnums } from 'Auth/countryCode.enum';
import { LogMessage } from 'Logger/Logger.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { User } from 'User/interfaces/user.interface';

export interface IGetFeatureIsOnPayload {
  user?: Partial<User>;
  featureFlagKey: string;
  extraInfo?: Partial<IInitAttributesPayload>;
  organization?: Partial<IOrganization>;
}

export interface IInitAttributesPayload {
  id: string;
  email: string;
  userCreatedAtEpochSeconds: number;
  driveCollaboratorsNotInCircle: string[];
  browserLanguage?: string;
  ipCountryCode?: CountryCodeEnums;
  orgId?: string;
  orgCreatedAtEpochSeconds?: number;
  anonymousUserId?: string;
  circlePlan?: string;
  circlePlanStatus?: string;
  circlePlanPeriod?: string;
  orgAssociateDomains?: string[];
}

export interface IGetFeatureValuePayload {
  attributes: IInitAttributesPayload;
  featureFlagKey: string;
}

export interface IFeatureFlag {
  getFeatureValue<T = string>(payload: IGetFeatureValuePayload): Promise<T>;
}

export interface IGetFeatureValueFromAdapteePayload {
  attributes: IInitAttributesPayload;
  featureFlagKey: string;
}

export interface IFeatureFlagAdaptee {
  getFeatureValueFromAdaptee<T = boolean>(payload: IGetFeatureValueFromAdapteePayload): Promise<T>;
}

export interface IFeatureFlagConfig {
  host: string;
  key: string;
}

export interface IFeatureFlagSettings {
  config: IFeatureFlagConfig;
  errorHandler?: (error: LogMessage) => void;
  infoHandler?: (info: LogMessage) => void;
}

export interface IFeatureEvaluationResult<T = boolean> {
  value: T;
  variationId?: number;
  source: FeatureResultSource;
}
