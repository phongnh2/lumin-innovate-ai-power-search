import { NotificationContext, INotificationIntegration } from './notification.interface';

export interface NotificationMethod {
  exportData: () => INotificationIntegration;
  createMessage: (targetInfo?: Record<string, string>) => string;
}

export class NotificationBase<T extends string, D extends Record<string, string>> implements NotificationMethod {
  sendTo: string[];

  actor: Record<string, string>;

  context: NotificationContext;

  type: T;

  data: D;

  message: string;

  target: Record<string, string>;

  constructor({
    sendTo, actor, target, data, context, type,
  }: INotificationIntegration & { type: T, data: D }) {
    this.sendTo = sendTo;
    this.actor = actor;
    this.context = context;
    this.target = target;
    this.type = type;
    this.data = data;
  }

  exportData(): INotificationIntegration {
    return {
      sendTo: this.sendTo,
      actor: this.actor,
      context: this.context,
      type: this.type,
      data: this.data,
      message: this.target ? this.createMessage(this.target) : '',
    };
  }

  createMessage(targetInfo?: Record<string, string>): string {
    const targetInfoKeys = Object.keys(targetInfo);
    if (targetInfoKeys.length === 0) {
      return '';
    }
    const keys = Object.keys(targetInfo);
    const newObject = {};
    keys.forEach((key) => {
      newObject[`#${key}`] = targetInfo[key];
    });
    return JSON.stringify(newObject);
  }
}
