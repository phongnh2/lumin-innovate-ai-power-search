/* eslint-disable max-classes-per-file */
import { PutEventsRequest } from '@aws-sdk/client-pinpoint';
import {
  chunk, inRange, isInteger, merge,
} from 'lodash';
import { v4 } from 'uuid';

import { AwsPinpointEvent, PinpointEvent } from 'Pinpoint/pinpoint-event';

export interface IPinpointEventQueue {
  add(e: PinpointEvent): this;
  drain(): Promise<void>;
}

type TConfiguration = {
  appId: string;
  appVersion: string;
  flushInterval: number;
  batchSize: number;
  logger?: {
    debug?: (message: string, metadata?: Record<string, unknown>) => void;
    error?: (e: Error, metadata?: Record<string, unknown>) => void;
  }
}

type TSaveEventCallback = (
  params: PutEventsRequest,
) => Promise<number>;

interface IEventQueueConstructor {
  config: Omit<TConfiguration, 'flushInterval' | 'batchSize'> & { flushInterval?: number; batchSize?: number; },
  save: TSaveEventCallback;
}

/**
 * Amazon only allows 100 events per request
 * I only send 90 events per request to be safe
 * Doc: https://docs.aws.amazon.com/pinpoint/latest/developerguide/quotas.html#quotas-events:~:text=Maximum%20number%20of%20events%20in%20a%20request
 */
const MAX_EVENTS_PER_REQUEST = 90;

export class PinpointEventQueue implements IPinpointEventQueue {
  private _queue = new Map<string, PinpointEvent>();

  private _save: TSaveEventCallback;

  private _interval: ReturnType<typeof setInterval>;

  private _configuration: TConfiguration = {
    appId: null,
    appVersion: null,
    flushInterval: 5000,
    batchSize: MAX_EVENTS_PER_REQUEST,
    logger: {
      debug: () => undefined,
      error: () => undefined,
    },
  };

  constructor(params: IEventQueueConstructor) {
    const { config, save } = params;
    this._configuration = merge({}, this._configuration, config);
    this._configuration.batchSize = this.getBatchSize(config.batchSize);
    this._save = save;

    this._interval = setInterval(() => {
      this.flushFirstChunk();
    }, this._configuration.flushInterval);
  }

  async drain(): Promise<void> {
    clearInterval(this._interval);
    const chunks = this.splitChunks();
    await Promise.allSettled(chunks.map((_chunk) => this.flush(_chunk)));
    if (!this._queue.size) {
      return;
    }
    await this.drain();
  }

  add(e: PinpointEvent): this {
    e.version = this._configuration.appVersion;
    if (!this._queue.has(e.id)) {
      this._queue.set(e.id, e);
    }
    return this;
  }

  private getBatchSize(_batch: number = MAX_EVENTS_PER_REQUEST): number {
    if (!isInteger(_batch)) {
      throw new Error('batchSize must be an integer');
    }
    if (!inRange(_batch, 1, MAX_EVENTS_PER_REQUEST + 1)) {
      throw new Error(`batchSize must be in range [1, ${MAX_EVENTS_PER_REQUEST}]`);
    }
    return _batch;
  }

  private removeEvents(ids: string[]): void {
    ids.forEach((id) => {
      this._queue.delete(id);
    });
  }

  private insertEvents(events: PinpointEvent[]): void {
    events.forEach((event) => {
      this.add(event);
    });
  }

  private splitChunks(): [string, PinpointEvent][][] {
    return chunk([...this._queue.entries()], this._configuration.batchSize);
  }

  private flushFirstChunk(): void {
    const chunks = this.splitChunks();
    this.flush(chunks[0] || []);
  }

  private async flush(batchEvents: [string, PinpointEvent][]): Promise<void> {
    if (!batchEvents.length) {
      return;
    }
    const batchId = v4();
    try {
      this._configuration.logger.debug('pinpoint_events.batch.prepare', {
        total: batchEvents.length,
        batchId,
        queuing: this._queue.size,
      });
      const eventMap = batchEvents.reduce((acc, [id, event]) => {
        acc[id] = event.derive();
        return acc;
      }, {} as Record<string, AwsPinpointEvent>);

      this.removeEvents(Object.keys(eventMap));
      const payload = {
        ApplicationId: this._configuration.appId,
        EventsRequest: {
          BatchItem: {
            [batchId]: {
              Endpoint: {},
              Events: eventMap,
            },
          },
        },
      };
      const len = await this._save(payload);
      this._configuration.logger.debug('pinpoint_events.batch.submited', {
        total: Object.keys(eventMap).length,
        batchId,
        queuing: this._queue.size,
        redis: {
          len,
        },
      });
    } catch (error) {
      // If too many request => insert back to queue.
      this._configuration.logger.error(error as Error, {
        total: batchEvents.length,
        batchId,
        queuing: this._queue.size,
      });
      this.insertEvents(batchEvents.map(([_id, event]) => event));
    }
  }
}
