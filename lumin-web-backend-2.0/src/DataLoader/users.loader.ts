import * as DataLoader from 'dataloader';

import { Utils } from 'Common/utils/Utils';

import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

export class UsersLoader {
  public static create(userService: UserService): DataLoader<string, User> {
    return new DataLoader<string, User>(async (ids: string[]) => {
      const users = await userService.findUserByIds(ids, {}, true);
      const usersMap = Utils.createKeyedMap(users, (user) => user._id);
      return ids.map((id) => usersMap[id]);
    });
  }
}
