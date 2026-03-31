import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
} from 'mongoose';
import { v4 as uuid } from 'uuid';

import { EMAIL_TYPE, SUBJECT } from 'Common/constants/EmailConstant';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { NotiOrg } from 'Common/constants/NotificationConstants';
import { SUBSCRIPTION_UPDATE_ORGANIZATION_INVITE_LINK } from 'Common/constants/SubscriptionConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { notiOrgFactory } from 'Common/factory/NotiFactory';
import { Utils } from 'Common/utils/Utils';

import { CustomRuleLoader } from 'CustomRules/custom-rule.loader';
import { CustomRulesService } from 'CustomRules/custom-rule.service';
import UserRules from 'CustomRules/UserRules';

import { APP_USER_TYPE } from 'Auth/auth.enum';
import { EmailService } from 'Email/email.service';
import { EnvironmentService } from 'Environment/environment.service';
import { NotificationTab, VerifyOrganizationInviteLinkPayload } from 'graphql.schema';
import { NotificationService } from 'Notication/notification.service';
import {
  IOrganizationInviteLink,
  IOrganizationInviteLinkModel,
  OrganizationInviteLinkData,
  OrganizationInviteLinkWithStatus,
} from 'Organization/interfaces/organization.inviteLink.interface';
import { AccessTypeOrganization, OrganizationRoleEnums } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { User } from 'User/interfaces/user.interface';

@Injectable()
export class OrganizationInviteLinkService {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    @InjectModel('OrganizationInviteLink')
    private readonly organizationInviteLinkModel: Model<IOrganizationInviteLinkModel>,
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => CustomRulesService))
    private readonly customRulesService: CustomRulesService,
    @Inject(forwardRef(() => CustomRuleLoader))
    private readonly customRuleLoader: CustomRuleLoader,
  ) {}

  private transformInviteLinkWithStatus(inviteLink: IOrganizationInviteLink): OrganizationInviteLinkWithStatus {
    const { expiresAt } = inviteLink;
    const now = new Date();
    const daysUntilExpiration = expiresAt.getTime() - now.getTime();
    const expiringSoonThreshold = Number(this.environmentService.getByKey(EnvConstants.INVITE_LINK_EXPIRING_SOON_DURATION_THRESHOLD));
    return {
      ...inviteLink,
      _id: inviteLink._id.toHexString(),
      inviteId: inviteLink.inviteId,
      isExpiringSoon: daysUntilExpiration < expiringSoonThreshold,
      isExpired: expiresAt < now,
    };
  }

  public publishUpdateInviteLink(
    {
      orgId,
      actorId,
      inviteLink,
    }: {
      orgId: string;
      actorId: string;
      inviteLink: OrganizationInviteLinkWithStatus | null;
    },
  ): void {
    const channelName = `${SUBSCRIPTION_UPDATE_ORGANIZATION_INVITE_LINK}.${orgId}`;
    this.pubSub.publish(channelName, {
      [SUBSCRIPTION_UPDATE_ORGANIZATION_INVITE_LINK]: {
        actorId,
        orgId,
        inviteLink,
      },
    });
  }

  async createInviteLink(inviteLink: OrganizationInviteLinkData): Promise<OrganizationInviteLinkWithStatus> {
    const existingInviteLink = await this.getInviteLinkByOrgId(inviteLink.orgId);
    if (existingInviteLink) {
      throw GraphErrorException.BadRequest('An invite link already exists for this organization');
    }

    const inviteLinkRole = inviteLink.role?.toLowerCase() || OrganizationRoleEnums.MEMBER;
    let expiresAtDate = inviteLink.expiresAt;
    if (!expiresAtDate) {
      const defaultExpirationDuration = Number(this.environmentService.getByKey(EnvConstants.INVITE_LINK_EXPIRATION_DURATION));
      expiresAtDate = new Date(new Date().getTime() + defaultExpirationDuration);
    }
    const createdInviteLink = await this.organizationInviteLinkModel.create({
      ...inviteLink,
      inviteId: uuid(),
      role: inviteLinkRole,
      expiresAt: expiresAtDate,
    });
    const inviteLinkObj = createdInviteLink.toObject<IOrganizationInviteLink>();
    return this.transformInviteLinkWithStatus(inviteLinkObj);
  }

  async getInviteLink(inviteId: string): Promise<OrganizationInviteLinkWithStatus | null> {
    const inviteLink = await this.organizationInviteLinkModel.findOne({ inviteId });
    if (!inviteLink) {
      return null;
    }
    const inviteLinkObj = inviteLink.toObject<IOrganizationInviteLink>();
    return this.transformInviteLinkWithStatus(inviteLinkObj);
  }

  async getInviteLinkByOrgId(orgId: string): Promise<OrganizationInviteLinkWithStatus | null> {
    const inviteLink = await this.organizationInviteLinkModel.findOne({ orgId });
    if (!inviteLink) {
      return null;
    }

    if (!inviteLink.inviteId) {
      const updatedInviteLink = await this.organizationInviteLinkModel.findOneAndUpdate({ _id: inviteLink._id }, [
        { $set: { inviteId: { $ifNull: ['$inviteId', uuid()] } } },
      ], { new: true });
      return this.transformInviteLinkWithStatus(updatedInviteLink.toObject());
    }

    const inviteLinkObj = inviteLink.toObject<IOrganizationInviteLink>();
    return this.transformInviteLinkWithStatus(inviteLinkObj);
  }

  async deleteInviteLink(orgId: string): Promise<void> {
    await this.organizationInviteLinkModel.findOneAndDelete({ orgId });
  }

  async verifyInviteLink(inviteLinkId: string, joiner: User): Promise<VerifyOrganizationInviteLinkPayload> {
    const inviteLink = await this.getInviteLink(inviteLinkId);
    if (!inviteLink) {
      throw GraphErrorException.NotFound('Invite link not found');
    }

    const orgId = inviteLink.orgId.toHexString();

    const userRules = new UserRules(this.customRulesService, this.customRuleLoader, joiner);
    const { cannotJoinOrgsOf } = userRules;
    const preventOrgIds = this.customRuleLoader.getOrgIdsFromDomain(cannotJoinOrgsOf);
    const isOnlyJoinOrg = userRules.onlyJoinOrg && userRules.orgId !== orgId;
    const isPreventJoinOrg = preventOrgIds?.includes(orgId);
    if (isOnlyJoinOrg || isPreventJoinOrg) {
      throw GraphErrorException.BadRequest('You are not allowed to join this organization');
    }

    const orgData = await this.organizationService.getOrgById(orgId);
    if (!orgData) {
      throw GraphErrorException.NotFound('Organization not found', ErrorCode.Org.ORGANIZATION_NOT_FOUND);
    }

    if (orgData.sso?.scimSsoClientId) {
      throw GraphErrorException.Forbidden(
        'Action failed because SCIM provisioning is enabled for this organization',
        ErrorCode.Org.ACTION_BLOCKED_BY_SCIM,
      );
    }

    const memberFound = await this.organizationService.getMembershipByOrgAndUser(orgId, joiner._id);
    if (!memberFound && !inviteLink.isExpired) {
      const isInternalMember = Utils.isInternalOrgMember(joiner.email, orgData);
      const memberData = {
        userId: joiner._id,
        email: joiner.email,
        orgId,
        internal: isInternalMember,
        role: inviteLink.role,
      };
      const membership = await this.organizationService.handleAddMemberToOrg(memberData);
      if (membership) {
        const [requestAccess] = await this.organizationService.getRequestAccessByCondition({
          actor: joiner.email,
          type: AccessTypeOrganization.INVITE_ORGANIZATION,
          target: orgId,
        });
        if (requestAccess) {
          await this.organizationService.removeRequestAccess({
            actor: joiner.email,
            type: AccessTypeOrganization.INVITE_ORGANIZATION,
            target: orgId,
          });
          const [notification] = await this.notificationService.getNotificationsByConditions({
            actionType: NotiOrg.INVITE_JOIN,
            'entity.entityId': orgId,
            'target.targetData.invitationList._id': requestAccess._id,
          });
          if (notification) {
            this.notificationService.removeNotification(notification, joiner._id);
          }
        }
      }

      const orgMemberships = await this.organizationService.getOrganizationMemberByRole(
        orgId,
        [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
      );
      // send notification to Org Owner and Admins
      const managerIds = orgMemberships.map((user) => user._id).filter((id) => id !== joiner._id);
      const notiData = notiOrgFactory.create(NotiOrg.JOIN_ORG_VIA_INVITE_LINK, {
        actor: { user: joiner, actorData: { type: APP_USER_TYPE.LUMIN_USER, email: joiner.email } },
        entity: { organization: orgData },
      });
      this.notificationService.createUsersNotifications(notiData, managerIds, NotificationTab.GENERAL);

      // send email to Org Owner and Admins
      const receiverEmails = orgMemberships.map((user) => user.email).filter((email) => email !== joiner.email);
      const inviteLinkRoleTextMapping = {
        [OrganizationRoleEnums.BILLING_MODERATOR]: 'an Admin',
        [OrganizationRoleEnums.MEMBER]: 'a Member',
      };
      const subject = SUBJECT[EMAIL_TYPE.USER_JOINS_ORGANIZATION_VIA_INVITE_LINK.description]
        .replace('#{actorName}', joiner.name)
        .replace('#{orgName}', orgData.name);
      const emailData = {
        actorName: joiner.name,
        orgId: orgData._id,
        orgName: orgData.name,
        encodedActorEmail: encodeURIComponent(encodeURIComponent(joiner.email)),
        roleText: inviteLinkRoleTextMapping[inviteLink.role],
        subject,
      };
      this.emailService.sendEmail(
        EMAIL_TYPE.USER_JOINS_ORGANIZATION_VIA_INVITE_LINK,
        receiverEmails,
        emailData,
      );
    }

    return {
      _id: inviteLink._id,
      orgId: inviteLink.orgId,
      orgUrl: orgData.url,
      role: inviteLink.role,
      isAlreadyMember: !!memberFound,
      isExpired: inviteLink.isExpired,
    };
  }
}
