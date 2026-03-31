import { IUser } from 'interfaces/user/user.interface';

declare class UserUtilities {
  constructor({ user }: { user: IUser });

  isFree(): boolean;

  isPremium(): boolean;
}
