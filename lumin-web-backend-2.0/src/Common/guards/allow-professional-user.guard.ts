import { PaymentPlanEnums } from 'Payment/payment.enum';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';
import { UserService } from 'User/user.service';
import { HttpErrorException } from 'Common/errors/HttpErrorException';

@Injectable()
export class AllowProfessionalUserGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isGraphReq = context.getType<GqlContextType>() === 'graphql';
    const request = isGraphReq ? Utils.getGqlRequest(context) : context.switchToHttp().getRequest();
    const { user } = request;
    const userInfo = await this.userService.findUserById(user._id as string);
    if (userInfo.payment.type === PaymentPlanEnums.FREE) {
      const msg = "Can't do this action due to not using professional";
      const error = isGraphReq ? GraphErrorException.Forbidden(msg) : HttpErrorException.Forbidden(msg);
      throw error;
    }
    return true;
  }
}
