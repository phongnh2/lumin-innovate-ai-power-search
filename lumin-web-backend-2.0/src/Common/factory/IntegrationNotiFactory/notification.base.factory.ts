export abstract class NotificationBaseFactory<T, K> {
  public abstract createNotification(type: T, input: K): any;
}
