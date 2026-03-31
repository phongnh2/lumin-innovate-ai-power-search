import { Observable } from 'rxjs';

import { MergeAccountOptions, NotificationTab, Payment } from 'graphql.schema';
import { INotification, NotificationProduct } from 'Notication/interfaces/notification.interface';

export interface ExtraData {
  loginService: string;
}

export interface SyncUpAccountSettingRequest {
  identityId: string;
  type: string;
  extraData?: ExtraData;
}

export interface DeleteAccountRequest {
  userId: string;
}

export interface PublishNewNotification extends INotification {
  isRead: boolean,
  tab: NotificationTab,
  product: NotificationProduct,
}
export interface PublishNewNotificationRequest {
  notification: PublishNewNotification;
  receiverIds: string[];
}

export interface ChangeUserEmailRequest {
  currentEmail: string;
  newEmail: string;
  mergeOption: MergeAccountOptions;
  mergeDestination?: string;
}

export interface GetSignUserPaymentRequest {
  userId: string;
}
export interface GetSignUserPaymentResponse {
  payment: Payment;
}

export interface LuminContractAuthService {
  syncUpAccountSetting(req: SyncUpAccountSettingRequest): Observable<void>;
  deleteAccount(req: DeleteAccountRequest): Observable<void>;
}

export interface LuminContractNotificationService {
  publishNewNotification(req: PublishNewNotificationRequest): Observable<void>;
}

export interface LuminContractUserService {
  changeUserEmail(req: ChangeUserEmailRequest): Observable<void>;
  getSignUserPayment(req: GetSignUserPaymentRequest): Observable<GetSignUserPaymentResponse>;
}
