export class UserDto {
  _id?: string;
  email?: string;
  name?: string;
  avatarRemoteId?: string;
  plan?: string;
}
export class UserQueryInputDto {
  notUserId?: string;
  searchText?: string;
}
export class UserInputDto {
  name: string;
  avatarRemoteId?: string;
}
