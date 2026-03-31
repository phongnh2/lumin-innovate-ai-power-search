import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';
import { UserService } from 'User/user.service';

@Injectable()
export class RejectDeletingUserGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
  ) { }

  async canActivate(context: ExecutionContext) {
    const { user } = Utils.getGqlRequest(context);
    const userInfo = await this.userService.findUserById(user._id as string);
    if (userInfo.deletedAt) throw GraphErrorException.BadRequest('User is being deleting', ErrorCode.User.USER_DELETING);
    return true;
  }
}
