/* eslint-disable @typescript-eslint/no-unsafe-call */
import { FolderRoleEnum, OrganizationFolderPermissionEnum, OrganizationTeamFolderPermissionEnum } from 'Folder/folder.enum';
import { FolderService } from 'Folder/folder.service';
import { IRequestData } from 'Folder/guards/request.interface';
import { IFolderPermission } from 'Folder/interfaces/folder.interface';
import { OrganizationRoleEnums, OrganizationTeamRoles } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';

interface InjectService {
  organizationTeamService: OrganizationTeamService;
  organizationService: OrganizationService;
}
interface IVerifyData {
  folderPermission: IFolderPermission;
  acceptancePermissions: string[];
  userId: string;
  injectService?: Partial<InjectService>;
}

export class VerifyFolderPermissionBase {
  private verifyPersonal(verifyData: IVerifyData): boolean {
    const {
      folderPermission, acceptancePermissions: acceptancePermisisons,
    } = verifyData;
    return acceptancePermisisons.includes(folderPermission.role)
     || folderPermission.role === FolderRoleEnum.OWNER;
  }

  private async verifyOrganization(verifyData: IVerifyData): Promise<boolean> {
    const {
      userId,
      folderPermission,
      acceptancePermissions: acceptancePermisisons,
      injectService: { organizationService },
    } = verifyData;
    const membership = await organizationService.getMembershipByOrgAndUser(folderPermission.refId, userId);
    return acceptancePermisisons.includes(OrganizationFolderPermissionEnum.ALL)
      || membership && !acceptancePermisisons.length
      || acceptancePermisisons.includes(membership.role)
      || membership.role === OrganizationRoleEnums.ORGANIZATION_ADMIN;
  }

  private async verifyOrganizationTeam(verifyData: IVerifyData): Promise<boolean> {
    const {
      userId,
      folderPermission,
      acceptancePermissions: acceptancePermisisons,
      injectService: { organizationTeamService },
    } = verifyData;
    const [membership] = await organizationTeamService.findMembershipsByCondition({ teamId: folderPermission.refId, userId });
    if (!membership) {
      return false;
    }
    return acceptancePermisisons.includes(OrganizationTeamFolderPermissionEnum.ALL)
      || membership && !acceptancePermisisons.length
      || acceptancePermisisons.includes(membership.role)
      || membership.role === OrganizationTeamRoles.ADMIN;
  }

  async verify(data: {
    requestData: IRequestData,
    permissions: string[],
    folderService: FolderService,
    organizationTeamService: OrganizationTeamService,
    organizationService: OrganizationService,
  }): Promise<boolean> {
    const {
      requestData, permissions, folderService, organizationTeamService, organizationService,
    } = data;
    const { _id: userId, folderId } = requestData;
    const folderPermissions = await folderService.findFolderPermissionsByCondition({ folderId });
    const [personalFolderPermissions, internalFolderPermissions] = folderPermissions.reduce(([personal, internal], folderpermission) => {
      if ([FolderRoleEnum.ORGANIZATION, FolderRoleEnum.ORGANIZATION_TEAM].includes(folderpermission.role as FolderRoleEnum)) {
        return [personal, folderpermission];
      }
      if (folderpermission.refId.toHexString() === userId) {
        return [folderpermission, internal];
      }
      return [personal, internal];
    }, [null, null]);

    if (personalFolderPermissions) {
      return this.verifyPersonal({
        folderPermission: personalFolderPermissions,
        acceptancePermissions: permissions,
        userId,
      });
    }
    if (internalFolderPermissions) {
      switch (internalFolderPermissions.role) {
        case FolderRoleEnum.ORGANIZATION: {
          return this.verifyOrganization({
            injectService: { organizationService },
            folderPermission: internalFolderPermissions,
            acceptancePermissions: permissions,
            userId,
          });
        }
        case FolderRoleEnum.ORGANIZATION_TEAM: {
          return this.verifyOrganizationTeam({
            injectService: { organizationTeamService },
            folderPermission: internalFolderPermissions,
            acceptancePermissions: permissions,
            userId,
          });
        }
        default: break;
      }
    }
    return false;
  }
}
