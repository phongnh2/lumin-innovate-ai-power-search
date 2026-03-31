import {
  GrowthBook, InitResponse, setPolyfills, FeatureResult,
} from '@growthbook/growthbook';
import * as EventSource from 'eventsource';

import { LogMessage } from 'Logger/Logger.service';

import {
  IFeatureFlagAdaptee,
  IFeatureFlagConfig,
  IFeatureFlagSettings,
  IGetFeatureValueFromAdapteePayload,
} from './FeatureFlag.interface';

const RETRY_INTERVAL = 500;
const MAX_RETRIES = 3;
const RECONNECT_AFTER_REACH_MAX_RETRIES_INTERVAL = 1000 * 60 * 10;

setPolyfills({
  EventSource,
});

export class GrowthBookProvider implements IFeatureFlagAdaptee {
  private readonly errorHandler: (error: LogMessage) => void;

  private readonly infoHandler: (error: LogMessage) => void;

  private readonly config: IFeatureFlagConfig;

  private loaderInstance: GrowthBook<Record<string, any>>;

  constructor(settings: IFeatureFlagSettings) {
    const {
      config: { host, key }, errorHandler: _errorHandler, infoHandler: _infoHandler,
    } = settings;

    this.config = {
      host,
      key,
    };

    this.errorHandler = _errorHandler;
    this.infoHandler = _infoHandler;

    this.initLoaderInstance();
  }

  private sleep = (timer: number): Promise<number> => new Promise((resolve) => {
    let timeoutId: any = null;
    timeoutId = setTimeout(() => {
      resolve(timeoutId as number);
    }, timer);
  });

  private async reconnectAfterMaxRetries(): Promise<void> {
    const id = await this.sleep(RECONNECT_AFTER_REACH_MAX_RETRIES_INTERVAL);
    clearTimeout(id);
    this.initLoaderInstance();
  }

  async retryWithExponentialBackoff(fn: () => Promise<InitResponse>, count: number = 1): Promise<void> {
    try {
      const result = await fn();
      const { success } = result;

      if (success) {
        this.infoHandler({
          context: this.retryWithExponentialBackoff.name,
          extraInfo: {
            message: 'Successfully established connection with GrowthBook',
          },
        });
        return;
      }

      if (count > MAX_RETRIES) {
        this.reconnectAfterMaxRetries();
        throw new Error(
          // eslint-disable-next-line max-len
          `Max retries request to GrowthBook reached - Auto reconnect after ${Math.floor(RECONNECT_AFTER_REACH_MAX_RETRIES_INTERVAL / 60 / 1000)} minutes`,
        );
      }

      const delayMs = RETRY_INTERVAL * 2 ** count;

      this.errorHandler({
        context: this.retryWithExponentialBackoff.name,
        error: new Error(`Retrying request to GrowthBook attempt #${count} after ${Math.floor(delayMs / 1000)} seconds`),
      });
      const id = await this.sleep(delayMs);
      clearTimeout(id);
      this.retryWithExponentialBackoff(fn, count + 1);
    } catch (error) {
      this.errorHandler({
        context: this.retryWithExponentialBackoff.name,
        error,
      });
    }
  }

  private createInstance({ isLoaderInstance } = { isLoaderInstance: false }): GrowthBook<Record<string, any>> {
    return new GrowthBook({
      apiHost: this.config.host,
      clientKey: this.config.key,
      enableDevMode: false,
      ...(isLoaderInstance ? { skipCache: true } : {
        subscribeToChanges: false,
        backgroundSync: false,
      }),
    });
  }

  private initLoaderInstance(): void {
    this.retryWithExponentialBackoff(() => {
      this.loaderInstance = this.createInstance({ isLoaderInstance: true });
      return this.loaderInstance.init({ streaming: true });
    });
  }

  async getFeatureValueFromAdaptee<T = boolean>({ attributes, featureFlagKey }: IGetFeatureValueFromAdapteePayload): Promise<T> {
    const growthBookFeatures = this.loaderInstance.getFeatures();
    const evaluateInstance = this.createInstance();
    evaluateInstance.initSync({ payload: { features: growthBookFeatures } });
    await evaluateInstance.setAttributes(attributes);
    const result = evaluateInstance.getFeatureValue(featureFlagKey, null);
    evaluateInstance.destroy();
    return result;
  }

  async evalFeatureFromAdaptee<T = boolean>({ attributes, featureFlagKey }: IGetFeatureValueFromAdapteePayload): Promise<FeatureResult<T>> {
    const growthBookFeatures = this.loaderInstance.getFeatures();
    const evaluateInstance = this.createInstance();
    evaluateInstance.initSync({ payload: { features: growthBookFeatures } });
    await evaluateInstance.setAttributes(attributes);
    const result = evaluateInstance.evalFeature<T>(featureFlagKey);
    evaluateInstance.destroy();
    return result;
  }
}
