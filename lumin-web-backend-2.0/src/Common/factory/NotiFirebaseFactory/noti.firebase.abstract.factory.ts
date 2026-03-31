import { NotiFirebaseInterface } from './noti.firebase.interface';

export abstract class NotiFirebaseAbstractFactory {
  abstract create(
    type: number,
    notificationFirebase: unknown,
  ): NotiFirebaseInterface;
}
