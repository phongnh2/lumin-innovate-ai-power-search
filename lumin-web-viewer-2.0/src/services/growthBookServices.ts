import { GrowthBook } from '@growthbook/growthbook-react';

import logger from 'helpers/logger';

import { growthBookEvent } from 'utils/Factory/EventCollection/GrowthBookEventCollection';

import { FeatureFlag } from 'constants/featureFlagsConstant';
import { ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';
import { LocalStorageKey } from 'constants/localStorageKey';
import { LOGGER } from 'constants/lumin-common';
import { GROWTHBOOK_CLIENT_KEY } from 'constants/urls';

type GrowthBookInstance = GrowthBook<Record<string, any>>;

class GrowthBookServices {
  private static _instance: GrowthBookServices;

  private _growthBookInstance: GrowthBookInstance | null = null;

  private constructor() {
    this._growthBookInstance = this.growthBookInstance();
  }

  public static instance(): GrowthBookServices {
    if (!this._instance) {
      this._instance = new GrowthBookServices();
    }

    return this._instance;
  }

  private growthBookInstance = (): GrowthBookInstance => {
    if (!GROWTHBOOK_CLIENT_KEY) {
      throw new Error("You are missing 'GROWTHBOOK_CLIENT_KEY' env variable");
    }

    if (this._growthBookInstance) {
      return this._growthBookInstance;
    }

    const isProduction = process.env.ENV === 'production';
    const enableDevMode = Boolean(localStorage.getItem(LocalStorageKey.ENABLED_DEV_MODE_GROWTHBOOK));

    return new GrowthBook({
      apiHost: 'https://cdn.growthbook.io',
      clientKey: GROWTHBOOK_CLIENT_KEY ,
      enableDevMode: !isProduction || enableDevMode,
      subscribeToChanges: true,
      trackingCallback(experiment, result) {
        growthBookEvent
          .trackVariationView({
            experiment,
            result,
          })
          .catch(() => {});
      },
    });
  };

  get getGrowthBookInstance(): GrowthBookInstance {
    return this._growthBookInstance;
  }

  public setAttributes(attributes: ATTRIBUTES_GROWTH_BOOK): void {
    this._growthBookInstance.setAttributes(attributes).catch((err) => {
      logger.logError({
        reason: LOGGER.Service.GROWTHBOOK_ERROR,
        message: 'Failed to set attributes to GrowthBook',
        error: err as Error,
      });
    });
  }

  public getAttributes() {
    return this._growthBookInstance.getAttributes();
  }

  public getFeatureValue(featureFlag: FeatureFlag, defaultValue: unknown = null) {
    return this._growthBookInstance.getFeatureValue(featureFlag, defaultValue);
  }

  public getFeatureIsOn(id: string): boolean {
    return this._growthBookInstance.isOn(id);
  }
}

export { GrowthBookServices };
