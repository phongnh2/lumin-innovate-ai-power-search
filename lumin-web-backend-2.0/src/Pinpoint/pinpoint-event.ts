import { Event } from '@aws-sdk/client-pinpoint';
import { merge } from 'lodash';
import { v4 } from 'uuid';

import { Utils } from 'Common/utils/Utils';

export type AwsPinpointEvent = Event;

type TPinpointEventBase = Pick<
  AwsPinpointEvent,
  'AppPackageName' | 'AppTitle' | 'AppVersionCode' |
  'SdkName' | 'ClientSdkVersion' | 'Timestamp'
>

type TAwsAttributes = AwsPinpointEvent['Attributes'];

export type TConstructEvent = Omit<AwsPinpointEvent, keyof TPinpointEventBase>;

const MAX_PINPOINT_KEY_LENGTH = 50;
const MAX_PINPOINT_VALUE_LENGTH = 200;

// eslint-disable-next-line @typescript-eslint/ban-types
export abstract class PinpointEvent<TEventAttributes extends Record<string, unknown> = {}, TEventMetrics extends Record<string, unknown> = {}> {
  private readonly _id: string = v4();

  private _appVersion: string;

  private _timestamp: Date;

  protected abstract construct(data: TEventAttributes, eventType?: string, metrics?: TEventMetrics): TConstructEvent;

  constructor(
    private readonly payload: TEventAttributes,
    private readonly eventType?: string,
    private readonly metrics?: TEventMetrics,
  ) {
    this._timestamp = new Date();
  }

  get id(): string {
    return this._id;
  }

  set version(version: string) {
    this._appVersion = version;
  }

  derive(): AwsPinpointEvent {
    const base: TPinpointEventBase = {
      AppPackageName: 'lumin-web-backend',
      AppTitle: 'lumin-web-backend',
      AppVersionCode: this._appVersion,
      SdkName: '@aws-sdk/client-pinpoint',
      ClientSdkVersion: '3.993.0',
      Timestamp: this._timestamp.toISOString(),
    };
    const baseAttributes: AwsPinpointEvent['Attributes'] = {
      source: 'lumin-web-backend',
      version: this._appVersion,
    };
    const event = this.construct(this.payload, this.eventType, this.metrics);
    return merge({}, base, { Attributes: baseAttributes }, event);
  }

  protected standardize(attributes: TEventAttributes): TAwsAttributes {
    const flatten = (obj: Record<string, unknown>): TAwsAttributes => Utils.recursiveFlattenObject(obj, '', '__');

    const truncate = (obj: TAwsAttributes): TAwsAttributes => Utils.truncateOjectKeyAndValue(obj, MAX_PINPOINT_KEY_LENGTH, MAX_PINPOINT_VALUE_LENGTH);

    return truncate(flatten(attributes));
  }
}
