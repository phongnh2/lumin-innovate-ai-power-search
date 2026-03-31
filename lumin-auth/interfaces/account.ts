import { LoginService } from '@/interfaces/user';

export interface LastAccessAccount {
  name: string;
  email: string;
  avatarRemoteId?: string;
  loginService: Exclude<LoginService, LoginService.XERO>;
}
