// eslint-disable-next-line import/extensions
import { NotiInterface } from './noti.interface';

export abstract class NotiAbstractFactory {
    abstract create(type: number, notificationInterface: unknown): NotiInterface;
}
