// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line import/no-extraneous-dependencies
import { Types } from 'mongoose';

export type Modify<T, R> = Omit<T, keyof R> & R;

export type NotiActor = {
    actorId: string | Types.ObjectId,
    actorName: string,
    type: string,
    avatarRemoteId: string,
    actorData?: Record<string, unknown>,
}

export type NotiTarget = {
    targetId: string | Types.ObjectId,
    targetName: string,
    type: string,
    targetData?: Record<string, unknown>,
}

export type NotiEntity = {
    entityId: string,
    entityName: string,
    type: string,
    entityData?: Record<string, unknown>,
}

export interface NotiInterface {
    actor: NotiActor,
    target:NotiTarget,
    entity: NotiEntity
    actionType: number,
    notificationType: string,
}
