import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { ContextType } from 'constant';
import {
  FindUserByAdminPayload, SearchUserByAdminStatus, FindUserPayload, UserDetailPayload, ChangeEmailAbility,
} from 'graphql.schema';

import { CustomRuleLoader } from './custom-rule.loader';
import { CustomRulesService } from './custom-rule.service';
import { CustomRuleOperation } from './CustomRuleConstants';
import UserRules from './UserRules';

@Injectable()
export class CustomRulesInterceptor implements NestInterceptor {
  constructor(
    private readonly customRulesService: CustomRulesService,
    private readonly customRuleLoader: CustomRuleLoader,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler().name;
    const args = context.getArgByIndex(1);

    return next
      .handle()
      .pipe(map(async (data) => {
        const request = context.getType() === ContextType.GRAPHQL ? Utils.getGqlRequest(context) : context.switchToHttp().getRequest();
        const { user, signUpUser } = request;
        let { userRules } = request as { userRules: UserRules};
        if (!userRules) {
          userRules = new UserRules(this.customRulesService, this.customRuleLoader, user);
        }
        const userDomain = user && Utils.getEmailDomain(user.email as string)
        || signUpUser && Utils.getEmailDomain(signUpUser.email as string) || null;

        switch (handler) {
          case CustomRuleOperation.VALIDATE_IP_WHITELIST:
          case CustomRuleOperation.GET_ME: {
            const { requireOrgMembershipOnSignIn, orgId } = userRules;
            if (user && requireOrgMembershipOnSignIn) {
              await this.customRulesService.verifyOrgMembership({ user, orgId, domain: userDomain });
            }
            break;
          }
          case CustomRuleOperation.FIND_USER: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return userRules.interceptFindUserPayload(data);
          }
          case CustomRuleOperation.ORGS_OF_USER: {
            if (userRules.onlyAccessRestrictedOrg) {
              return [data.find(({ organization }) => organization._id === userRules.orgId)];
            }
            break;
          }
          case CustomRuleOperation.GET_ORGANIZATION_BY_URL: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            if (!userRules.canAccessOrg(data.orgData)) {
              throw GraphErrorException.Forbidden('You do not have permission', ErrorCode.Common.NO_PERMISSION);
            }
            break;
          }
          case CustomRuleOperation.FIND_USER_BY_ADMIN: {
            const foundUser = data as FindUserByAdminPayload;
            const emailDomain = args.email ? Utils.getEmailDomain(args.email as string) : '';
            if (userRules.cannotSearchFor?.includes(emailDomain)) {
              return { user: foundUser.user, status: SearchUserByAdminStatus.USER_RESTRICTED };
            }
            break;
          }
          case CustomRuleOperation.GET_GOOGLE_CONTACTS: {
            return userRules.filterRestrictedDomain(data as FindUserPayload[]);
          }
          case CustomRuleOperation.GET_USER_DETAIL: {
            const { user: targetUser } = data as UserDetailPayload;
            const { isRestrictedDomain, allowToChangeEmail } = userRules.getEmailChangeEligibility({ currentEmail: targetUser.email });
            if (isRestrictedDomain) {
              return { ...data, changeEmailAbility: allowToChangeEmail ? ChangeEmailAbility.ELIGIBLE : ChangeEmailAbility.DOMAIN_RESTRICTED };
            }
            break;
          }
          default: break;
        }

        return data;
      }));
  }
}
