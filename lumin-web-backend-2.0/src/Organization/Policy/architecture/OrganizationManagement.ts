import { JwtService } from '@nestjs/jwt';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { EMAIL_TYPE, SUBJECT } from 'Common/constants/EmailConstant';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { NotiOrg } from 'Common/constants/NotificationConstants';
import {
  SUBSCRIPTION_TRANSFER_ORG_ADMIN,
  SUBSCRIPTION_UPDATE_ORG,
  SUBSCRIPTION_UPDATE_ORG_MEMBER_ROLE,
} from 'Common/constants/SubscriptionConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { notiOrgFactory } from 'Common/factory/NotiFactory';
import { notiFirebaseOrganizationFactory } from 'Common/factory/NotiFirebaseFactory';
import { Utils } from 'Common/utils/Utils';

import { DocumentService } from 'Document/document.service';
import { EmailService } from 'Email/email.service';
import { EnvironmentService } from 'Environment/environment.service';
import { HubspotWorkspaceService } from 'Hubspot/hubspot-workspace.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { NotificationService } from 'Notication/notification.service';
import { OrganizationRoleEnums } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { UserService } from 'User/user.service';

export class OrganizationManagement {
  private orgId: string;

  private actorId: string;

  private email: string;

  constructor(
    private readonly organizationService: OrganizationService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly environmentService: EnvironmentService,
    private readonly documentService: DocumentService,
    private readonly notificationService: NotificationService,
    private readonly hubspotWorkspaceService: HubspotWorkspaceService,
  ) {}

  from(orgId: string) : OrganizationManagement {
    this.orgId = orgId;
    return this;
  }

  actor(userId: string): OrganizationManagement {
    this.actorId = userId;
    return this;
  }

  set(email: string) : OrganizationManagement {
    this.email = email;
    return this;
  }

  async role(role: string) : Promise<void> {
    if (!(this.orgId && this.email && this.actorId)) {
      throw GraphErrorException.InternalServerError('Missing orgId or userId or email');
    }

    switch (role) {
      case OrganizationRoleEnums.ORGANIZATION_ADMIN:
        await this.grantOrgAdmin();
        break;
      case OrganizationRoleEnums.BILLING_MODERATOR:
      case OrganizationRoleEnums.MEMBER:
        await this.grantOrgMemberRole(role);
        break;
      default:
        throw GraphErrorException.BadRequest('Role is not existed');
    }
  }

  private async grantOrgAdmin() {
    const organization = await this.organizationService.getOrgById(this.orgId);
    if (organization.ownerId.toHexString() !== this.actorId) {
      throw GraphErrorException.BadRequest("Don't have permission to transfer organization admin");
    }
    const transferKey = `${RedisConstants.TRANSFER_ORG_ADMIN}:${this.orgId}`;

    const transferUserEmail = await this.redisService.getRedisValueWithKey(transferKey);
    if (transferUserEmail) {
      throw GraphErrorException.Forbidden('Organization owner transfer is processing');
    }
    const orgOwner = await this.userService.findUserById(this.actorId);
    if (orgOwner.email === this.email) {
      throw GraphErrorException.NotAcceptable("Can't set role for yourself");
    }

    this.redisService.setTransferOrgAdmin(this.orgId, this.email);

    const tokenPayload = {
      orgId: this.orgId,
      grantedEmail: this.email,
    };
    const expireTransferOrgTime = this.environmentService.getByKey(EnvConstants.EXPIRE_TRANSFER_ORG_OWNERSHIP);
    const expiredToken = this.jwtService.sign(tokenPayload, {
      expiresIn: +expireTransferOrgTime,
    });
    const orgName = organization.name;

    const subject = SUBJECT[EMAIL_TYPE.GRANT_ORG_ADMIN_CONFIRMATION.description]
      .replace('#{ownerOrgName}', orgOwner.name)
      .replace('#{orgName}', orgName);

    const emailData = {
      orgName,
      orgId: organization._id,
      token: expiredToken,
      ownerOrgName: orgOwner.name,
      subject,
    };

    // send out-app noti for mobile
    const [actorUser, targetUser] = await Promise.all([
      this.userService.findUserById(this.actorId),
      this.userService.findUserByEmail(this.email),
    ]);
    const roleUpdated = this.organizationService.getOrgRoleText(OrganizationRoleEnums.ORGANIZATION_ADMIN);
    const {
      notificationContent: firebaseNotificationContent,
      notificationData: firebaseNotificationData,
      notificationContentForTargetUser: firebaseNotificationContentExtra,
    } = notiFirebaseOrganizationFactory.create(NotiOrg.TRANSFER_OWNER, {
      organization,
      actor: actorUser,
      role: roleUpdated,
      targetUser,
    });
    this.organizationService.publishFirebaseNotiToAllOrgMember({
      orgId: this.orgId,
      firebaseNotificationContent,
      firebaseNotificationData,
      excludedIds: [targetUser._id],
      extraMembers: [targetUser._id],
      firebaseNotificationContentExtra,
    });

    this.emailService.sendEmailHOF(EMAIL_TYPE.GRANT_ORG_ADMIN_CONFIRMATION, [this.email], emailData);
  }

  private async grantOrgMemberRole(role: string) {
    const actorMembership = await this.organizationService.getMembershipByOrgAndUser(this.orgId, this.actorId);
    if (!Utils.isHigherOrEqualRoleInOrg(actorMembership.role, role) || role === OrganizationRoleEnums.ORGANIZATION_ADMIN) {
      throw GraphErrorException.Forbidden("You don't have permission to set this role");
    }
    const [actorUser, targetUser] = await Promise.all([
      this.userService.findUserById(this.actorId),
      this.userService.findUserByEmail(this.email),
    ]);
    if (!targetUser) {
      throw GraphErrorException.NotFound('User not found');
    }
    if (actorUser.email === targetUser.email) {
      throw GraphErrorException.NotAcceptable("Can't set role for yourself");
    }
    const organization = await this.organizationService.getOrgById(this.orgId);
    if (!organization) {
      throw GraphErrorException.BadRequest('Not found organization');
    }
    const targetMembership = await this.organizationService.getMembershipByOrgAndUser(this.orgId, targetUser._id);
    if (!Utils.isHigherRoleInOrg(actorMembership.role, targetMembership.role)) {
      throw GraphErrorException.Forbidden('Not have permission to set role');
    }

    if (role === OrganizationRoleEnums.BILLING_MODERATOR) {
      await this.documentService.updateAllDocumentPermissionInOrg(
        this.orgId,
        {
          $unset: {
            [`groupPermissions.${targetUser._id}`]: '',
          },
        },
      );
    }

    await this.organizationService.updateMemberRoleInOrg({
      orgId: this.orgId,
      targetId: targetUser._id,
      newRole: role,
      oldRole: targetMembership.role,
    });

    const notification = notiOrgFactory.create(NotiOrg.UPDATE_ORGANIZATION_ROLE, {
      actor: { user: actorUser },
      target: { user: targetUser, targetData: { role } },
      entity: {
        organization,
      },
    });
    this.organizationService.publishNotiToAllOrgMember({
      orgId: this.orgId,
      notification,
      excludedIds: [actorUser._id],
    });
    // send out-app noti for mobile
    const roleUpdated = this.organizationService.getOrgRoleText(role.toLowerCase());
    const {
      notificationContent: firebaseNotificationContent,
      notificationData: firebaseNotificationData,
      notificationContentForTargetUser: firebaseNotificationContentExtra,
    } = notiFirebaseOrganizationFactory.create(NotiOrg.UPDATE_ORGANIZATION_ROLE, {
      organization,
      actor: actorUser,
      role: roleUpdated,
      targetUser,
    });
    this.organizationService.publishFirebaseNotiToAllOrgMember({
      orgId: this.orgId,
      firebaseNotificationContent,
      firebaseNotificationData,
      excludedIds: [targetUser._id],
      extraMembers: [targetUser._id],
      firebaseNotificationContentExtra,
    });

    // [Hubspot] update Hubspot workspace contact association label
    this.hubspotWorkspaceService.updateWorkspaceContactAssociationLabel({
      orgId: this.orgId,
      contactEmail: targetUser.email,
      newRole: role as OrganizationRoleEnums,
    });
  }

  public async setAdmin() :Promise<void> {
    if (!(this.orgId && this.actorId)) {
      throw GraphErrorException.InternalServerError('Missing params in setAdmin');
    }

    const organization = await this.organizationService.getOrgById(this.orgId);
    if (!organization) {
      throw GraphErrorException.NotFound('Organization not found');
    }

    const transferOrgAdminKey = `${RedisConstants.TRANSFER_ORG_ADMIN}:${this.orgId}`;
    const grantedEmail = await this.redisService.getRedisValueWithKey(transferOrgAdminKey);
    if (!grantedEmail) {
      throw GraphErrorException.BadRequest('The transfer is already confirmed', ErrorCode.Org.TRANSFER_ALREADY_CONFIRM);
    }
    const [actorUser, actorMembership] = await Promise.all([
      this.userService.findUserById(this.actorId),
      this.organizationService.getMembershipByOrgAndUser(this.orgId, this.actorId),
    ]);
    if (!actorUser || actorUser.email !== grantedEmail) {
      throw GraphErrorException.Forbidden('You are not the granted user');
    }
    this.redisService.deleteRedisByKey(transferOrgAdminKey);

    const oldOwnerId: string = organization.ownerId.toHexString();
    await Promise.all([
      this.organizationService.updateMemberRoleInOrg({
        orgId: this.orgId,
        targetId: this.actorId,
        newRole: OrganizationRoleEnums.ORGANIZATION_ADMIN,
        oldRole: actorMembership.role,
      }),
      this.organizationService.updateOrganizationOwner(organization, actorUser),
      this.organizationService.updateMemberRoleInOrg({
        orgId: this.orgId,
        targetId: oldOwnerId,
        newRole: OrganizationRoleEnums.MEMBER,
        oldRole: OrganizationRoleEnums.ORGANIZATION_ADMIN,
      }),
    ]);

    const newOrganization = await this.organizationService.getOrgById(this.orgId);

    const [oldOwner, newOwner] = await Promise.all([
      this.userService.findUserById(oldOwnerId),
      this.userService.findUserById(this.actorId),
    ]);

    this.organizationService.publishUpdateOrganization(
      [oldOwnerId],
      {
        orgId: newOrganization._id,
        organization: newOrganization,
        type: SUBSCRIPTION_TRANSFER_ORG_ADMIN,
      },
      SUBSCRIPTION_UPDATE_ORG,
    );
    this.organizationService.publishUpdateOrganization(
      [this.actorId],
      {
        actorName: oldOwner.name,
        role: OrganizationRoleEnums.ORGANIZATION_ADMIN,
        orgId: newOrganization._id,
      },
      SUBSCRIPTION_UPDATE_ORG_MEMBER_ROLE,
    );
    const subject = SUBJECT[EMAIL_TYPE.ACCEPTED_ORG_OWNER_TRANSFER.description]
      .replace('#{ownerOrgName}', newOwner.name);

    const orgName = organization.name;
    this.emailService.sendEmailHOF(EMAIL_TYPE.ACCEPTED_ORG_OWNER_TRANSFER, [oldOwner.email], {
      orgName,
      orgId: organization._id,
      ownerOrgName: newOwner.name,
      subject,
    });

    const notification = notiOrgFactory.create(NotiOrg.TRANSFER_OWNER, {
      actor: { user: oldOwner },
      target: { user: newOwner },
      entity: { organization },
    });

    this.organizationService.publishNotiToAllOrgMember({
      orgId: this.orgId,
      notification,
      excludedIds: [oldOwner._id],
    });

    // [Hubspot] update Hubspot workspace contact association label
    this.hubspotWorkspaceService.updateWorkspaceContactAssociationLabel({
      orgId: this.orgId,
      contactEmail: newOwner.email,
      newRole: OrganizationRoleEnums.ORGANIZATION_ADMIN,
    });
    this.hubspotWorkspaceService.updateWorkspaceContactAssociationLabel({
      orgId: this.orgId,
      contactEmail: oldOwner.email,
      newRole: OrganizationRoleEnums.MEMBER,
    });
  }
}
