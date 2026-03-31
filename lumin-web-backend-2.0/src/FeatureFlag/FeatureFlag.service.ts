import { Injectable } from '@nestjs/common';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';
import { LogMessage, LoggerService } from 'Logger/Logger.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { User } from 'User/interfaces/user.interface';

import {
  IFeatureFlagSettings, IGetFeatureIsOnPayload, IInitAttributesPayload, IFeatureEvaluationResult,
} from './FeatureFlag.interface';
import { FeatureFlagAdapter } from './FeatureFlagAdapter';

@Injectable()
export class FeatureFlagService {
  private featureFlagInstance: FeatureFlagAdapter;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly loggerService: LoggerService,
  ) {
    const settings: IFeatureFlagSettings = {
      config: {
        host: this.environmentService.getByKey(EnvConstants.GROWTHBOOK_API_HOST),
        key: this.environmentService.getByKey(EnvConstants.GROWTHBOOK_CLIENT_KEY),
      },
      errorHandler: this.logError.bind(this),
      infoHandler: this.logInfo.bind(this),
    };
    this.featureFlagInstance = new FeatureFlagAdapter(settings);
  }

  private initAttributes(
    user: Partial<User> = {},
    organization: Partial<IOrganization> = {},
    extraInfo: Partial<IInitAttributesPayload> = {},
  ): IInitAttributesPayload {
    const { _id, email, createdAt } = user;
    const {
      _id: orgId, createdAt: orgCreatedAt, payment, associateDomains,
    } = organization;
    const createdAtEpochMilliSeconds = createdAt ? Date.parse(createdAt.toString()) : Date.now();
    const userCreatedAtEpochSeconds = Math.floor(createdAtEpochMilliSeconds / 1000);
    const orgCreatedAtEpochSeconds = Math.floor(Date.parse(orgCreatedAt?.toString()) / 1000);
    const circlePlan = payment?.type;
    const circlePlanStatus = payment?.status;
    const circlePlanPeriod = payment?.period;
    return {
      id: _id,
      email,
      userCreatedAtEpochSeconds,
      driveCollaboratorsNotInCircle: [],
      orgId,
      orgCreatedAtEpochSeconds,
      circlePlan,
      circlePlanStatus,
      circlePlanPeriod,
      orgAssociateDomains: associateDomains || [],
      ...extraInfo,
    };
  }

  private logError(error: LogMessage) {
    this.loggerService.error(error);
  }

  private logInfo(info: LogMessage) {
    this.loggerService.info(info);
  }

  async getFeatureIsOn({
    user, organization, featureFlagKey, extraInfo,
  }: IGetFeatureIsOnPayload): Promise<boolean> {
    const attributes = this.initAttributes(user, organization, extraInfo);

    return Boolean(await this.featureFlagInstance.getFeatureValue({ attributes, featureFlagKey }));
  }

  async getFeatureValue<T>({
    user, organization, featureFlagKey, extraInfo,
  }: IGetFeatureIsOnPayload): Promise<T> {
    const attributes = this.initAttributes(user, organization, extraInfo);
    return this.featureFlagInstance.getFeatureValue({ attributes, featureFlagKey });
  }

  async getFeatureEvaluation<T = boolean>({
    user, organization, featureFlagKey, extraInfo,
  }: IGetFeatureIsOnPayload): Promise<IFeatureEvaluationResult<T>> {
    const attributes = this.initAttributes(user, organization, extraInfo);
    const result = await this.featureFlagInstance.evalFeature<T>({ attributes, featureFlagKey });

    return {
      value: result.value,
      variationId: result.experimentResult?.variationId,
      source: result.source,
    };
  }
}
