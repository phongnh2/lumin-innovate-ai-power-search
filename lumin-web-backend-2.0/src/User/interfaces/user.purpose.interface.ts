import { User } from 'User/interfaces/user.interface';

export interface UserPurposeModel {
  userId: string;
  purpose: string;
  currentStep: number;
}

export type EditUserPurposeInput = {
  user: Partial<User>,
  purpose?: string,
  currentStep: number,
}

export interface UserPurpose extends UserPurposeModel {
  _id: string
}
