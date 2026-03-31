import { TConstructEvent, PinpointEvent } from 'Pinpoint/pinpoint-event';

export type SyncAvatarEventAttributes = {
  LuminUserId: string;
  status: string;
  source: string;
  avatarSize: number
};

export type SyncAvatarEventMetrics = {
  elapsedTimeMS: number;
}

export const SyncAvatarEventType = {
  AVATAR_SYNCED: 'avatarSynced',
};

export class SyncAvatarEvent extends PinpointEvent<SyncAvatarEventAttributes> {
  protected construct(attributes: SyncAvatarEventAttributes, eventType: string, metrics: SyncAvatarEventMetrics): TConstructEvent {
    return {
      EventType: eventType,
      Attributes: this.standardize(attributes),
      Metrics: metrics,
    };
  }
}
