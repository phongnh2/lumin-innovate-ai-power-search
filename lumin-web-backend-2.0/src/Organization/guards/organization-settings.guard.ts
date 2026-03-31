import {
  CanActivate, ExecutionContext, Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { DomainVisibilitySetting, InviteUsersSetting } from 'graphql.schema';
import planPoliciesHandler from 'Payment/Policy/planPoliciesHandler';

@Injectable()
export class OrganizationSettingsGuard implements CanActivate {
  constructor(
    protected readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext) {
    const request = Utils.getGqlRequest(context);
    const { organization } = request;
    const operation = context.getArgs()[3].fieldName as string;

    const orgPayment = organization.payment;
    const planRule = planPoliciesHandler.from({
      plan: orgPayment.type,
      period: orgPayment.period,
    });

    let allowExcute = true;
    switch (operation) {
      case 'updateDomainVisibilitySetting': {
        const VISIBILITY_SETTING_MAPPING = {
          [DomainVisibilitySetting.INVITE_ONLY]: 'inviteOnly',
          [DomainVisibilitySetting.VISIBLE_AUTO_APPROVE]: 'visibleAutoApprove',
          [DomainVisibilitySetting.VISIBLE_NEED_APPROVE]: 'visibleNeedApprove',
        };
        const { visibilitySetting }: { visibilitySetting: DomainVisibilitySetting } = Utils.getGqlArgs(context);
        const visibilitySettingPermission = planRule.getVisibilitySettingPermission();
        allowExcute = visibilitySettingPermission[VISIBILITY_SETTING_MAPPING[visibilitySetting] as keyof typeof visibilitySettingPermission];
        break;
      }
      case 'updateInviteUsersSetting': {
        const INVITE_SETTING_MAPPING = {
          [InviteUsersSetting.ADMIN_BILLING_CAN_INVITE]: 'administratorsCanInvite',
          [InviteUsersSetting.ANYONE_CAN_INVITE]: 'allMembersCanInvite',
        };
        const { inviteUsersSetting }: { inviteUsersSetting: InviteUsersSetting } = Utils.getGqlArgs(context);
        const inviteSettingPermission = planRule.getInviteSettingPermission();
        allowExcute = inviteSettingPermission[INVITE_SETTING_MAPPING[inviteUsersSetting] as keyof typeof inviteSettingPermission];
        break;
      }
      default:
        break;
    }

    if (!allowExcute) {
      throw GraphErrorException.NotAcceptable(
        'Can not update this setting with current plan',
        ErrorCode.Org.CANNOT_UPDATE_ORG_SETTING_BASED_ON_PLAN,
      );
    }

    return true;
  }
}
