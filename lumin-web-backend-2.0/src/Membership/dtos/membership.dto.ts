import { UserDto } from 'User/dtos/user.dto';

export class TeamDto {
  _id?: string;
  name?: string;
  avatarRemoteId?: string;
  members?: UserDto[];
  totalMembers?: number;
  roleOfUser: string;
  createdAt?: Date;
  owner?: UserDto;
  plan?: string;
}
export class MembershipDto {
  user?: UserDto;
  role?: string;
}
export class MembershipInputDto {
  userId?: string;
  teamId?: string;
  role?: string;
}