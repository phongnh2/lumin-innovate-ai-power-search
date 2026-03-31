import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UseGuards,
  applyDecorators,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { CustomRuleValidator } from 'Common/decorators/customRule.decorator';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { ChangeUserEmailInput, CreateOrgByAdminInput, InviteToOrganizationInput } from 'graphql.schema';
import { User } from 'User/interfaces/user.interface';

import { CustomRuleAction } from './custom-rule.enum';
import { CustomRuleLoader } from './custom-rule.loader';
import { CustomRulesService, RestrictedActionError } from './custom-rule.service';
import { UPLOADABLE_SERVICES } from './domain-rules.constants';
import UserRules from './UserRules';
import { GqlAuthGuard } from '../Auth/guards/graph.auth.guard';

@Injectable()
export class CustomRulesGuard implements CanActivate {
  constructor(
    private readonly customRulesService: CustomRulesService,
    private readonly customRuleLoader: CustomRuleLoader,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = Utils.getGqlRequest(context);
    const { user } = request;
    const userRules = new UserRules(this.customRulesService, this.customRuleLoader, user as User);
    request.userRules = userRules;
    const actions = this.reflector.getAllAndOverride<CustomRuleAction[]>('CustomRuleAction', [context.getHandler(), context.getClass()]);
    if (!actions || !actions.length) { return true; }

    const args = context.getArgByIndex(1);
    const result = await Promise.all(actions.map((action) => this.validateRule(userRules, action, args, context)));
    if (result.includes(false)) { throw RestrictedActionError; }

    return true;
  }

  async validateRule(userRules: UserRules, action: CustomRuleAction, args: any, context: ExecutionContext): Promise<boolean> {
    switch (action) {
      case CustomRuleAction.USE_S3_STORAGE: {
        return !(userRules.onlyUseDriveStorage);
      }
      case CustomRuleAction.REQUEST_ACCESS_DOCUMENT: {
        return userRules.canRequestAccessDocument({ documentId: args.input.documentId });
      }
      case CustomRuleAction.CREATE_ORGANIZATION: {
        return userRules.allowToCreateOrg;
      }
      case CustomRuleAction.UPLOAD_THIRD_PARTY_DOCUMENTS: {
        const { documents, orgId } = args.input;
        return userRules.canUploadThirdPartyDocuments({ documents, orgId });
      }
      case CustomRuleAction.MOVE_DOCUMENTS: {
        const {
          destinationId, destinationType, folderId, documentIds,
        } = args.input;
        return userRules.canMoveDocuments({
          documentIds, destinationId, destinationType, folderId,
        });
      }
      case CustomRuleAction.ACCESS_DOCUMENT: {
        const { documentId } = args as { documentId: string };
        return userRules.canAccessDocument(documentId);
      }
      case CustomRuleAction.SHARE_DOCUMENT: {
        const { emails } = args.input;
        return userRules.canShareDocument({ emails });
      }
      case CustomRuleAction.INVITE_MEMBER_TO_ORGANIZATION: {
        const { members } = args;
        return userRules.canInviteMemberToOrg(members as InviteToOrganizationInput[]);
      }
      case CustomRuleAction.SEND_REQUEST_JOIN_ORG: {
        const { orgId } = args;
        return userRules.canRequestToJoinOrg(orgId as string);
      }
      case CustomRuleAction.CREATE_ORGANIZATION_BY_ADMIN: {
        const { adminEmail, members = [] } = args.organization as CreateOrgByAdminInput;
        if (!userRules.allowToCreateOrg) {
          return false;
        }
        return userRules.canInviteMemberToOrg([...members, { email: adminEmail }]);
      }
      case CustomRuleAction.GET_PROMPT_DRIVE_USERS: {
        const { googleAuthorizationEmail } = args.input;
        if (!googleAuthorizationEmail) return !userRules.hidePromptDriveUsersBanner;
        const emailDomain = Utils.getEmailDomain(googleAuthorizationEmail as string);
        return userRules.canShowPromptDriveUsersBanner(emailDomain);
      }
      case CustomRuleAction.CHANGE_USER_EMAIL: {
        const { currentEmail, newEmail } = args.input as ChangeUserEmailInput;
        const { isRestrictedDomain, allowToChangeEmail } = userRules.getEmailChangeEligibility({ currentEmail, newEmail });
        if (isRestrictedDomain) {
          return allowToChangeEmail;
        }
        return true;
      }
      case CustomRuleAction.ONLY_INTERNAL_INVITE: {
        return !(userRules.onlyInviteInternal);
      }
      case CustomRuleAction.MANAGE_DOCUMENT_TEMPLATE: {
        return userRules.templateManagementEnabled;
      }
      case CustomRuleAction.RESTRICTED_FROM_UPLOADING_DOCUMENT: {
        const services = this.reflector.get<string[]>('StorageService', context.getHandler())
          || [UPLOADABLE_SERVICES.LUMIN];

        const restrictedServices = services.filter((service) => !userRules.uploadableServices.includes(service));

        if (restrictedServices.length > 0) {
          const storageNamesMapping = {
            [UPLOADABLE_SERVICES.LUMIN]: 'Lumin',
            [UPLOADABLE_SERVICES.GOOGLE_DRIVE]: 'Google',
            [UPLOADABLE_SERVICES.ONE_DRIVE]: 'OneDrive',
            [UPLOADABLE_SERVICES.DROPBOX]: 'Dropbox',
          };

          const blockedStorageNames: string[] = restrictedServices.map((service) => storageNamesMapping[service] || service);
          throw GraphErrorException.Forbidden(
            `Domain is restricted from uploading to ${blockedStorageNames.join(', ')}`,
            ErrorCode.Document.DOMAIN_RESTRICTED_FROM_UPLOADING_DOCUMENT,
            { blockedStorageNames },
          );
        }

        return true;
      }
      default: break;
    }
    return true;
  }
}

export function CustomRulesGuards(...args: CustomRuleAction[]) {
  return applyDecorators(
    CustomRuleValidator(...args),
    UseGuards(GqlAuthGuard, CustomRulesGuard),
  );
}
