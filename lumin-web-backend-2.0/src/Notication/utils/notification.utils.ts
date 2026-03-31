import GrpcStructConverter from 'Common/utils/GrpcStructConverter';

export class NotificationUtils {
  private static serializeStructData(data: any): any {
    return data ? GrpcStructConverter.serialize(data) : undefined;
  }

  public static transformNotificationForGrpc(noti: any) {
    return {
      ...noti,
      actor: noti.actor ? {
        ...noti.actor,
        actorData: this.serializeStructData(noti.actor.actorData),
      } : undefined,
      target: noti.target ? {
        ...noti.target,
        targetData: this.serializeStructData(noti.target.targetData),
      } : undefined,
      entity: noti.entity ? {
        ...noti.entity,
        entityData: this.serializeStructData(noti.entity.entityData),
      } : undefined,
      createdAt: noti.createdAt ? new Date(noti.createdAt as string).getTime() : '',
      isRead: noti.is_read,
    };
  }
}
