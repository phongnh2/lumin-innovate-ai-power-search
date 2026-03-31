import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { NotiOrg } from 'Common/constants/NotificationConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import { DocumentRoleEnum } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { IDocumentPermission } from 'Document/interfaces/document.interface';
import { FolderRoleEnum } from 'Folder/folder.enum';
import { FolderService } from 'Folder/folder.service';
import { IFolderPermission } from 'Folder/interfaces/folder.interface';
import { OrganizationRoleInvite, Document } from 'graphql.schema';
import { NotificationService } from 'Notication/notification.service';
import { AccessTypeOrganization } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

export const RestrictedActionError = GraphErrorException.Forbidden('Target domain is restricted to this action', ErrorCode.User.RESTRICTED_ACTION);
@Injectable()
export class CustomRulesService {
  constructor(
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    private readonly folderService: FolderService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) { }

  async verifyOrgMembership({ user, orgId, domain }: { user: User; orgId: string, domain: string }): Promise<void> {
    const userId = user._id;
    if (!userId) {
      throw GraphErrorException.Forbidden(`Membership of ${domain} is require`, ErrorCode.Org.MEMBERSHIP_NOT_FOUND, { email: user.email });
    }
    const [orgMembership, organization] = await Promise.all([
      this.organizationService.getMembershipByOrgAndUser(orgId, userId, { _id: 1 }),
      this.organizationService.findOneOrganization({ _id: orgId }, { unallowedAutoJoin: 1 }),
    ]);
    const notAllowToJoinOrg = organization.unallowedAutoJoin.includes(userId);
    if (!orgMembership && notAllowToJoinOrg) {
      throw GraphErrorException.Forbidden(`Membership of ${domain} is require`, ErrorCode.Org.MEMBERSHIP_NOT_FOUND, { email: user.email });
    }
    if (!orgMembership && !notAllowToJoinOrg) {
      const newUser = await this.userService.findUserByEmail(user.email);
      await this.addSignUpUserToOrg({ orgId, signUpUser: newUser });
    }
  }

  async addSignUpUserToOrg({
    orgId,
    signUpUser,
  }: {
    orgId: string;
    signUpUser: User;
  }): Promise<void> {
    const organization = await this.organizationService.findOneOrganization({
      _id: orgId,
    });
    const invite = await this.organizationService.findMemberInRequestAccessWithType({
      actor: signUpUser.email,
      target: orgId,
      type: AccessTypeOrganization.INVITE_ORGANIZATION,
    });
    if (!invite) {
      await this.organizationService.inviteLuminUser(
        signUpUser,
        organization,
        OrganizationRoleInvite.MEMBER,
      );
      return;
    }
    const membership = await this.organizationService.inviteLuminUser(
      signUpUser,
      organization,
      (invite.entity.role.toUpperCase()) as OrganizationRoleInvite,
    );
    if (membership) {
      const [requestAccess] = await this.organizationService.getRequestAccessByCondition({
        actor: signUpUser.email,
        type: AccessTypeOrganization.INVITE_ORGANIZATION,
        target: membership.orgId,
      });
      await this.organizationService.removeRequestAccess({
        actor: signUpUser.email,
        type: AccessTypeOrganization.INVITE_ORGANIZATION,
        target: membership.orgId,
      });
      const [notification] = await this.notificationService.getNotificationsByConditions({
        actionType: NotiOrg.INVITE_JOIN,
        'entity.entityId': membership.orgId,
        'target.targetData.invitationList._id': requestAccess._id,
      });
      if (notification) {
        this.notificationService.removeNotification(notification, signUpUser._id);
      }
    }
  }

  async verifyDocumentsOrigin({ documentIds, workspaceId }: { documentIds: string[], workspaceId?: string }): Promise<void> {
    const documentPermissions = await this.documentService.getDocumentPermissionByConditions({
      documentId: { $in: documentIds },
      role: DocumentRoleEnum.OWNER,
      ...(workspaceId && { 'workspace.refId': workspaceId }),
    });
    if (documentPermissions.length !== documentIds.length) {
      throw RestrictedActionError;
    }
  }

  async getOwnerDocumentPermission(documentId: string): Promise<IDocumentPermission> {
    const [documentPermission] = await this.documentService.getDocumentPermissionByConditions({
      documentId,
      role: DocumentRoleEnum.OWNER,
    });

    return documentPermission;
  }

  async getDocumentPermissionsByDocId({ documentId, userId }: { documentId: string, userId: string }): Promise<IDocumentPermission> {
    const [documentPermission] = await this.documentService.getDocumentPermissionsByDocId(documentId, { refId: userId });
    return documentPermission;
  }

  async getOwnerFolderPermission({ folderId }: { folderId: string }): Promise<IFolderPermission> {
    const [folderPermission] = await this.folderService.getFolderPermissions({
      folderId,
      role: FolderRoleEnum.OWNER,
    });
    return folderPermission;
  }

  async getDocumentById(documentId: string): Promise<Document> {
    const document = await this.documentService.getDocumentByDocumentId(documentId);
    return document as unknown as Document;
  }
}
