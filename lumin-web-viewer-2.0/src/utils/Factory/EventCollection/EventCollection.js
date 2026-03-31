/* eslint-disable class-methods-use-this */
import { merge, omitBy, isNil, omit } from 'lodash';

import logger from 'helpers/logger';

import { getCommonAttributes } from 'utils/getCommonAttributes';
import { filterSensitiveAttributes } from 'utils/sensitiveDataFilter';

import BrazeAdapter from '../BrazeAdapter';
import DatadogAdaptor from '../DatadogAdaptor';
import GaAdapter from '../GaAdapter';

/**
 * Skip `entries` attribute for pinpoint events
 * because it's too large to be sent
 * @see {@link helpers/reportWebVitals.js}
 */
const skippedAttrPinpointEvents = ['browserMode', 'entries', 'codeLocation', 'viewerActiveSideNav'];

export class EventCollection {
  async getInstance() {
    try {
      const instance = await import('services/recordServices');
      this.recordService = instance.default;
      return this.recordService;
    } catch (e) {
      logger.logError({ error: e });
      return null;
    }
  }

  async record(params) {
    const filteredAttributes = filterSensitiveAttributes(omitBy(params.attributes, isNil));

    const mergedParams = omitBy(
      merge({}, params, {
        attributes: await getCommonAttributes(filteredAttributes),
      }),
      isNil
    );

    mergedParams.attributes = filterSensitiveAttributes(mergedParams.attributes);

    DatadogAdaptor.send(mergedParams);
    GaAdapter.send(mergedParams);
    BrazeAdapter.send(mergedParams);

    const pinpointAttributes = omit(mergedParams.attributes, skippedAttrPinpointEvents);
    return this.getInstance()
      .then(() =>
        this.recordService.record({
          ...mergedParams,
          attributes: pinpointAttributes,
        })
      )
      .catch((e) =>
        logger.logError({
          reason: `Failed to record event ${params.name}`,
          error: { ...e, attributes: pinpointAttributes },
        })
      );
  }
}

export default new EventCollection();
