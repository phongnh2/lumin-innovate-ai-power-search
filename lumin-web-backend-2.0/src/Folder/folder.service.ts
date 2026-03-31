/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmpty } from 'lodash';
import { DeleteResult, UpdateResult } from 'mongodb';
import {
  Model, Types, PipelineStage, ClientSession, FilterQuery, ProjectionType, QueryOptions, UpdateQuery,
} from 'mongoose';

import { FolderDocumentFilter } from 'Common/builder/DocumentFilterBuilder';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { DEFAULT_FOLDER_COLORS, MAX_DEPTH_LEVEL, MAX_NUBMER_FOLDER } from 'Common/constants/FolderConstants';
import {
  NotiFolder,
  NotiOrg,
  NotiOrgTeam,
} from 'Common/constants/NotificationConstants';
import {
  SUBSCRIPTION_CREATE_FOLDER,
  SUB_DELETE_FOLDER_EVENT,
  SUBSCRIPTION_UPDATE_FOLDER,
  SUB_UPDATE_FOLDER_INFO_EVENT,
  SUB_UPDATE_STARRED_FOLDER_EVENT,
  SUB_CREATE_FOLDER_EVENT,
  SUBSCRIPTION_FOLDER_EVENT,
} from 'Common/constants/SubscriptionConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { notiFolderFactory, notiOrgFactory } from 'Common/factory/NotiFactory';
import { notiFirebaseFolderFactory, notiFirebaseOrganizationFactory, notiFirebaseTeamFactory } from 'Common/factory/NotiFirebaseFactory';
import { FolderDocumentPremiumMap } from 'Common/template-methods/DocumentPremiumMap';
import { FolderDocumentQuery } from 'Common/template-methods/DocumentQuery/folder-document-query';
import { Utils } from 'Common/utils/Utils';

import { DataLoaderRegistry } from 'DataLoader/dataLoader.registry';
import { DocumentRoleEnum, DocumentWorkspace } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { EnvironmentService } from 'Environment/environment.service';
import { FolderRoleEnum, FolderTypeEnum } from 'Folder/folder.enum';
import {
  GetFoldersInput, IFolder, IFolderModel, IFolderPermission, IFolderPermissionModel,
} from 'Folder/interfaces/folder.interface';
import {
  CreateFolderInput,
  EditFolderInput,
  Folder,
  FolderBelongsTo,
  GetDocumentPayload,
  CreateFolderPayload,
  LocationType,
  GetDocumentsInFolderInput,
  Document,
  GetFoldersInFolderInput,
  Breadcrumb,
  GetFolderTreeInput,
  FolderChildType,
  FolderChildrenTree,
  DestinationType,
} from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { MembershipService } from 'Membership/membership.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { SortStrategy } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { OrganizationResourcesLookupUtils } from 'Organization/utils/organization.resources.utils';
import { ITeam } from 'Team/interfaces/team.interface';
import { TeamService } from 'Team/team.service';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

@Injectable()
export class FolderService {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    @InjectModel('Folder') private readonly folderModel: Model<IFolderModel>,
    @InjectModel('FolderPermission') private readonly folderPermissionModel: Model<IFolderPermissionModel>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => OrganizationTeamService))
    private readonly organizationTeamService: OrganizationTeamService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    @Inject(forwardRef(() => MembershipService))
    private readonly membershipService: MembershipService,
    @Inject(forwardRef(() => TeamService))
    private readonly teamService: TeamService,
    private readonly environmentService: EnvironmentService,
    private readonly loggerService: LoggerService,
  ) {}

  async publishCreateFolderSubscription(payload: CreateFolderPayload, publishType: string): Promise<void> {
    const { folder, clientId } = payload;

    const belongsTo = await this.getBelongsTo(folder._id);
    const resolvedFolder = { ...folder, belongsTo };

    const subscriptionKey = folder.parentId
      ? `${publishType}.${clientId}.${folder.parentId}`
      : `${publishType}.${clientId}`;

    this.pubSub.publish(subscriptionKey, {
      [publishType]: { ...payload, folder: resolvedFolder },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.pubSub.publish(`${SUBSCRIPTION_FOLDER_EVENT}.${clientId}`, {
      folderEventSubscription: {
        workspaceId: resolvedFolder.belongsTo?.workspaceId?.toString() || null,
        eventType: SUB_CREATE_FOLDER_EVENT,
      },
    });
  }

  async findOneFolder(folderId: string, projection?: Record<string, any>): Promise<IFolder> {
    const folder = await this.folderModel.findOne({ _id: folderId }, projection).exec();
    return folder ? { ...folder.toObject(), _id: folder._id.toHexString() } : null;
  }

  async findFolderByIds(folderIds: string[], projection?: Record<string, number>): Promise<IFolder[]> {
    const folders = await this.folderModel.find({ _id: { $in: folderIds } }, projection).exec();
    return folders.map((folder) => ({ ...folder.toObject(), _id: folder._id.toHexString() }));
  }

  async findFoldersByConditions(
    conditions: FilterQuery<IFolderModel>,
    projection?: ProjectionType<IFolderModel>,
    options?: QueryOptions<IFolderModel>,
  ) {
    const folders = await this.folderModel.find(conditions, projection, options);
    return folders.map((folder) => ({ ...folder.toObject(), _id: folder._id.toHexString() }));
  }

  async findOneAndUpdateFolder(folderId: string, updateField: Record<string, any>): Promise<IFolder> {
    const updatedFolder = await this.folderModel.findOneAndUpdate({ _id: folderId }, updateField, { new: true }).exec();
    return updatedFolder ? { ...updatedFolder.toObject(), _id: updatedFolder._id.toHexString() } : null;
  }

  async createFolderDocument(
    folderData: {name: string, ownerId: string, color: string, path: string, depth?: number, parentId?: string},
  ): Promise<IFolder> {
    const createdFolder = await this.folderModel.create({ ...folderData, shareSetting: {} });
    return { ...createdFolder.toObject(), _id: createdFolder._id.toHexString() };
  }

  async createFolderPermissionDocument(folderPermission: {refId: string, folderId: string, role: FolderRoleEnum}): Promise<IFolderPermission> {
    const createdFolderPermission = await this.folderPermissionModel.create(folderPermission as any);
    return { ...createdFolderPermission.toObject(), _id: createdFolderPermission._id.toHexString() };
  }

  async deleteById(id: string, options?: QueryOptions<IFolder>): Promise<IFolder> {
    const deletedFolder = await this.folderModel.findOneAndDelete({ _id: id }, options).exec();
    return deletedFolder ? { ...deletedFolder.toObject(), _id: deletedFolder._id.toHexString() } : null;
  }

  async findFolderDescendants({ folderId }: { folderId: string }): Promise<IFolder[]> {
    const folder = await this.findOneFolder(folderId);
    const prefix = this.getFolderPath({ folder });
    const descendants = await this.folderModel.find({ path: { $regex: `^${prefix}` } }).exec();

    return descendants.map((descendant) => ({ ...descendant.toObject(), _id: descendant._id.toHexString() }));
  }

  async deleteDescendantFolders({ folderId }: { folderId: string }): Promise<IFolder[]> {
    const descendants = await this.findFolderDescendants({ folderId });
    const descendantIds = descendants.map((descendant) => descendant._id);

    await this.folderModel.deleteMany({ _id: { $in: descendantIds } }).exec();
    await this.folderPermissionModel.deleteMany({ folderId: { $in: descendantIds } }).exec();

    return descendants;
  }

  async deletePermissionsByFolderId(id: string, options?: QueryOptions<IFolderPermission>): Promise<IFolderPermission> {
    const deletedFolderPermission = await this.folderPermissionModel.findOneAndDelete({ folderId: id }, options).exec();
    return deletedFolderPermission ? { ...deletedFolderPermission.toObject(), _id: deletedFolderPermission._id.toHexString() } : null;
  }

  deleteManyFolders(conditions: FilterQuery<IFolder>, session: ClientSession = null): Promise<DeleteResult> {
    return this.folderModel.deleteMany(conditions).session(session).exec();
  }

  deleteManyFolderPermissions(conditions: FilterQuery<IFolderPermission>, session: ClientSession = null): Promise<DeleteResult> {
    return this.folderPermissionModel.deleteMany(conditions).session(session).exec();
  }

  async getFolderPermissions(conditions: Record<string, any>, projection?: Record<string, any>): Promise<IFolderPermission[]> {
    const folderPermissions = await this.folderPermissionModel.find(conditions, projection).exec();
    return folderPermissions.map((permission) => ({ ...permission.toObject(), _id: permission._id.toHexString() }));
  }

  async findOneFolderPermission(folderId: string, condition?: Record<string, any>, projection?: Record<string, any>): Promise<IFolderPermission> {
    const folderPermission = await this.folderPermissionModel.findOne(folderId ? { ...condition, folderId } : condition, projection).exec();
    return folderPermission ? { ...folderPermission.toObject(), _id: folderPermission._id.toHexString() } : null;
  }

  async aggregateFolderPermission<T = any>(conditions: PipelineStage[]): Promise<T[]> {
    return this.folderPermissionModel.aggregate<T>(conditions);
  }

  async getTopLevelFolder(params: { refId: string, orgId?: string }): Promise<IFolder[]> {
    const { refId, orgId } = params;
    const match: Record<string, any> = {
      refId: new Types.ObjectId(refId),
    };
    if (orgId) {
      Object.assign(match, {
        'workspace.refId': new Types.ObjectId(orgId),
        'workspace.type': DocumentWorkspace.ORGANIZATION,
      });
    }

    const folders = await this.aggregateFolderPermission<IFolder>([
      {
        $match: match,
      },
      {
        $lookup: {
          from: 'folders',
          localField: 'folderId',
          foreignField: '_id',
          as: 'folder',
        },
      },
      {
        $unwind: '$folder',
      },
      {
        $match: {
          $or: [
            { 'folder.parentId': { $exists: false } },
            { 'folder.parentId': null },
          ],
        },
      },
      {
        $replaceRoot: {
          newRoot: '$folder',
        },
      },
    ]);
    return folders.map((folder) => ({ ...folder, _id: folder._id.toString() }));
  }

  public async getSubscriptionReceiversByFolderId(
    folderId: string,
  ): Promise<{
    allReceiverIds: string[],
    individualReceiverIds: string[],
    teamReceiverIds: string[],
    orgReceiverIds: string[],
  }> {
    const individualReceiverIds: string[] = [];
    const teamReceiverIds: string[] = [];
    const orgReceiverIds: string[] = [];
    const folderPermissions = await this.getFolderPermissions({ folderId });

    await Promise.all(folderPermissions.map(async (permission) => {
      const { role, refId } = permission;
      switch (role) {
        case FolderRoleEnum.ORGANIZATION: {
          const orgMembers = await this.organizationService.getMembersByOrgId(refId, { userId: 1 });
          orgMembers.forEach((member) => {
            orgReceiverIds.push((member.userId as string).toHexString());
          });
          break;
        }
        case FolderRoleEnum.ORGANIZATION_TEAM: {
          const teamMembers = await this.teamService.getAllMembersInTeam(refId, { userId: 1 });
          teamMembers.forEach((member) => {
            teamReceiverIds.push(member.userId.toHexString());
          });
          break;
        }
        default:
          individualReceiverIds.push(permission.refId.toHexString());
          break;
      }
    }));

    return {
      individualReceiverIds,
      teamReceiverIds,
      orgReceiverIds,
      allReceiverIds: [...individualReceiverIds, ...teamReceiverIds, ...orgReceiverIds],
    };
  }

  async createFolder(input: CreateFolderInput & { ownerId: string, orgId?: string }): Promise<IFolder> {
    const {
      ownerId, name, color, parentId, orgId,
    } = input;
    const folderPermissionQuery: Record<string, any> = {
      refId: ownerId,
      role: FolderRoleEnum.OWNER,
      workspace: {
        $exists: false,
      },
    };
    if (orgId) {
      folderPermissionQuery.workspace = {
        refId: new Types.ObjectId(orgId),
        type: DocumentWorkspace.ORGANIZATION,
      };
    }
    const ownedfolderpermission = await this.findFolderPermissionsByCondition(folderPermissionQuery);
    if (ownedfolderpermission.length >= MAX_NUBMER_FOLDER) {
      throw GraphErrorException.NotAcceptable('Number of folders reaches the limit');
    }

    if (parentId) {
      const parentFolderPermissionQuery: Record<string, any> = {
        refId: ownerId,
        folderId: parentId,
        workspace: {
          $exists: false,
        },
      };
      if (orgId) {
        parentFolderPermissionQuery.workspace = {
          refId: new Types.ObjectId(orgId),
          type: DocumentWorkspace.ORGANIZATION,
        };
      }
      const parentFolderPermission = await this.findFolderPermissionsByCondition(parentFolderPermissionQuery);
      if (!parentFolderPermission.length) {
        throw GraphErrorException.NotFound('Parent folder not found');
      }
    }

    const path = await this.findFolderPath(parentId);
    const depth = this.getFolderDepth({ path });
    if (depth > MAX_DEPTH_LEVEL) {
      throw GraphErrorException.NotAcceptable('Folder depth reaches the limit');
    }

    const folder = await this.createFolderDocument({
      ownerId, name, color, path, depth, parentId,
    });
    await Promise.all([
      this.createFolderPermissionDocument({
        refId: ownerId,
        folderId: folder._id,
        role: FolderRoleEnum.OWNER,
        ...(orgId && {
          workspace: {
            refId: new Types.ObjectId(orgId),
            type: DocumentWorkspace.ORGANIZATION,
          },
        }),
      }),
      this.addNewFolderColor(ownerId, color),
    ]);

    this.publishCreateFolderSubscription(
      {
        folder,
        clientId: ownerId,
      },
      SUBSCRIPTION_CREATE_FOLDER,
    );
    return folder;
  }

  addNewFolderColor(userId: string, color: string): Promise<User> {
    if (DEFAULT_FOLDER_COLORS.includes(color)) {
      return null;
    }
    return this.userService.updateFolderColor(userId, color);
  }

  async findFolderPath(parentFolderId: string): Promise<string> {
    const folder = await this.findOneFolder(parentFolderId);
    if (!folder) {
      return '';
    }
    return folder.path ? `${folder.path}${parentFolderId},` : `,${parentFolderId},`;
  }

  getFolderPath({ folder }: { folder: IFolder }): string {
    return folder.path ? `${folder.path}${folder._id},` : `,${folder._id},`;
  }

  getFolderDepth({ path }: Pick<IFolder, 'path'>): number {
    if (!path) {
      return 0;
    }

    return path.split(',').filter(Boolean).length;
  }

  async findFolderPermissionsByCondition(conditions: Record<string, any>, projection?: ProjectionType<IFolderPermission>):
    Promise<IFolderPermission[]> {
    const folderPermissions = await this.folderPermissionModel.find(conditions, projection).exec();
    return folderPermissions.map((permission) => ({ ...permission.toObject(), _id: permission._id.toHexString() }));
  }

  async getBreadCrumbs(folderId: string): Promise<Breadcrumb[]> {
    const folder = await this.findOneFolder(folderId);
    if (!folder) {
      return [];
    }
    const path = folder.path ? folder.path.split(',').filter(Boolean) : [];
    const folders = await this.findFolderByIds(path);
    return folders.map((f) => ({ _id: f._id, name: f.name, listUserStar: f.listUserStar }));
  }

  async getBelongsTo(folderId: string): Promise<FolderBelongsTo & {folderId: string}> {
    const folderPermissions = await this.findFolderPermissionsByCondition({
      folderId,
      role: { $in: [FolderRoleEnum.OWNER, FolderRoleEnum.ORGANIZATION, FolderRoleEnum.ORGANIZATION_TEAM] },
    });

    if (!folderPermissions.length) {
      return null;
    }

    const permission = folderPermissions[0];
    return this.getBelongsToByFolderPermission(permission);
  }

  async getBelongsToByFolderPermission(folderPermission: IFolderPermission): Promise<FolderBelongsTo & {folderId: string}> {
    const {
      refId, role, folderId, workspace,
    } = folderPermission;
    switch (role as FolderRoleEnum) {
      case FolderRoleEnum.OWNER: {
        const user = await this.userService.findUserById(refId);

        return {
          folderId,
          type: LocationType.PERSONAL,
          location: {
            _id: user._id,
            name: user.name,
          },
          workspaceId: workspace?.refId,
        };
      }
      case FolderRoleEnum.ORGANIZATION: {
        const organization = await this.organizationService.getOrgById(refId);
        return {
          folderId,
          type: LocationType.ORGANIZATION,
          location: {
            _id: organization._id,
            name: organization.name,
          },
        };
      }
      case FolderRoleEnum.ORGANIZATION_TEAM: {
        const orgTeam = await this.organizationTeamService.getOrgTeamById(refId);
        return {
          folderId,
          type: LocationType.ORGANIZATION_TEAM,
          location: {
            _id: orgTeam._id,
            name: orgTeam.name,
          },
        };
      }
      default:
        return null;
    }
  }

  async getBelongsToFromLoaders({ folderId, loaders }: { folderId: string; loaders: DataLoaderRegistry }) {
    const folderPermissions = await loaders.folderPermissionsLoader.load(folderId);
    if (!folderPermissions.length) {
      return null;
    }
    const permission = folderPermissions[0];
    switch (permission.role as FolderRoleEnum) {
      case FolderRoleEnum.OWNER: {
        const user = await loaders.usersLoader.load(permission.refId);
        return {
          type: LocationType.PERSONAL,
          location: {
            _id: user._id,
            name: user.name,
          },
          workspaceId: permission.workspace?.refId,
        };
      }
      case FolderRoleEnum.ORGANIZATION: {
        const organization = await loaders.organizationLoader.load(permission.refId);
        return {
          type: LocationType.ORGANIZATION,
          location: {
            _id: organization._id,
            name: organization.name,
          },
        };
      }
      case FolderRoleEnum.ORGANIZATION_TEAM: {
        const team = await loaders.teamLoader.load(permission.refId);
        return {
          type: LocationType.ORGANIZATION_TEAM,
          location: {
            _id: team._id,
            name: team.name,
          },
        };
      }
      default:
        return null;
    }
  }

  async getPersonalFolders(
    params: GetFoldersInput,
  ): Promise<Folder[]> {
    const {
      userId,
      sortOptions,
      isStarredTab,
      searchKey,
    } = params;

    const folderPermissions = await this.findFolderPermissionsByCondition({
      refId: new Types.ObjectId(userId),
      role: FolderRoleEnum.OWNER,
      workspace: {
        $exists: false,
      },
    });
    if (!folderPermissions.length) {
      return [];
    }

    return this.organizationService.getFolderListByPermission({
      folderPermissions,
      findOptions: {
        sortOptions,
        isStarredTab,
        searchKey,
        userId,
      },
    });
  }

  async getPersonalFolderTree({ userId }: { userId: string }) {
    const folderPermissions = await this.findFolderPermissionsByCondition({
      refId: new Types.ObjectId(userId),
      role: FolderRoleEnum.OWNER,
      workspace: {
        $exists: false,
      },
    });
    if (!folderPermissions.length) {
      return { children: [] };
    }

    const folders = await this.findFoldersByConditions({
      _id: { $in: folderPermissions.map((p) => new Types.ObjectId(p.folderId)) },
    });

    const children = this.buildChildrenTree({ folders });

    return { children };
  }

  public countFolders(matchConditions: FilterQuery<IFolderPermission>): Promise<number> {
    return this.folderPermissionModel.countDocuments(matchConditions).exec();
  }

  public publishUpdateFolderSubscription(data: {
    actorId?: string;
    receiverList: string[],
    folder: Folder,
    folders?: Folder[],
    subscriptionEvent: string,
  }): void {
    const {
      receiverList, folder, folders = [], subscriptionEvent, actorId,
    } = data;
    receiverList.forEach((receiverId) => {
      this.pubSub.publish(`${SUBSCRIPTION_UPDATE_FOLDER}.${receiverId}`, {
        [SUBSCRIPTION_UPDATE_FOLDER]: {
          folder,
          folders,
          actorId,
          userId: receiverId,
          subscriptionEvent,
        },
      });
    });
  }

  public publishDeleteFolderSubscription(refId: string, workspaceId: string, totalDeletedFolders: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.pubSub.publish(`${SUBSCRIPTION_FOLDER_EVENT}.${refId}`, {
      folderEventSubscription: {
        workspaceId,
        eventType: SUB_DELETE_FOLDER_EVENT,
        total: totalDeletedFolders,
      },
    });
  }

  public async updateFolderInfo(params: EditFolderInput & {userId: string}): Promise<IFolder> {
    const { userId, folderId, updateProperties } = params;
    if (isEmpty(updateProperties)) {
      throw GraphErrorException.NotAcceptable('Update Properties must not be empty');
    }
    if (updateProperties.color) {
      await this.addNewFolderColor(userId, updateProperties.color);
    }

    const updatedFolder = await this.findOneAndUpdateFolder(folderId, updateProperties);
    this.getSubscriptionReceiversByFolderId(updatedFolder._id)
      .then(({ allReceiverIds }) => {
        this.publishUpdateFolderSubscription({
          receiverList: allReceiverIds,
          folder: updatedFolder,
          subscriptionEvent: SUB_UPDATE_FOLDER_INFO_EVENT,
        });
      });

    return updatedFolder;
  }

  public async starFolder(userId: string, folderId: string): Promise<IFolder> {
    const folder = await this.findOneFolder(folderId, { listUserStar: 1 });
    if (!folder) {
      throw GraphErrorException.NotFound('Folder not found');
    }
    const { listUserStar } = folder;
    const hasStarred = listUserStar.includes(userId);
    let updatedFolder: IFolder;
    if (!hasStarred) {
      updatedFolder = await this.findOneAndUpdateFolder(folderId, { $push: { listUserStar: userId } });
    } else {
      updatedFolder = await this.findOneAndUpdateFolder(folderId, { $pull: { listUserStar: userId } });
    }

    this.publishUpdateFolderSubscription({
      receiverList: [userId],
      folder: updatedFolder,
      subscriptionEvent: SUB_UPDATE_STARRED_FOLDER_EVENT,
    });

    return updatedFolder;
  }

  public async sendNotiForDeleteFolder(data: {
    type: FolderTypeEnum,
    actorId: string,
    clientId: string,
    folder: IFolder,
  }): Promise<void> {
    const {
      type, actorId, clientId, folder,
    } = data;
    const actor = await this.userService.findUserById(actorId);
    const notificationData = {
      actor: {
        user: actor,
      },
      entity: {
        folder,
      },
      target: {},
    };

    switch (type) {
      case FolderTypeEnum.ORGANIZATION: {
        const organization = await this.organizationService.getOrgById(clientId);
        if (!organization) {
          return;
        }
        notificationData.target = { organization };

        const notification = notiFolderFactory.create(NotiFolder.DELETE_ORG_FOLDER, notificationData);
        this.organizationService.publishNotiToAllOrgMember({
          orgId: clientId,
          notification,
          excludedIds: [actorId],
        });
        // send out-app noti for mobile
        const {
          notificationContent: firebaseNotificationContent,
          notificationData: firebaseNotificationData,
        } = notiFirebaseFolderFactory.create(NotiFolder.DELETE_ORG_FOLDER, {
          organization,
          actor,
          folder,
        });
        this.organizationService.publishFirebaseNotiToAllOrgMember({
          orgId: organization._id,
          firebaseNotificationContent,
          firebaseNotificationData,
          excludedIds: [actor._id],
        });
        break;
      }
      case FolderTypeEnum.ORGANIZATION_TEAM: {
        const organizationTeam = await this.organizationTeamService.getOrgTeamById(clientId);
        if (!organizationTeam) {
          return;
        }
        const organization = await this.organizationService.getOrgById(organizationTeam.belongsTo as string);
        notificationData.target = { team: organizationTeam, organization };

        const notification = notiFolderFactory.create(NotiFolder.DELETE_TEAM_FOLDER, notificationData);
        this.membershipService.publishNotiToAllTeamMember(clientId, notification, [actorId]);

        // send out-app noti for mobile
        const {
          notificationContent: firebaseNotificationContent,
          notificationData: firebaseNotificationData,
        } = notiFirebaseFolderFactory.create(NotiFolder.DELETE_TEAM_FOLDER, {
          organization,
          team: organizationTeam,
          actor,
          folder,
        });

        this.organizationService.publishFirebaseNotiToAllTeamMember({
          teamId: organizationTeam._id,
          firebaseNotificationData,
          firebaseNotificationContent,
          excludes: [actor._id],
        });
        break;
      }
      default:
        break;
    }
  }

  public async deleteAllDocumentsInFolder(data: {
    folderId: string,
    clientId: string,
    type: FolderTypeEnum,
    actorId: string,
  }): Promise<void> {
    const {
      folderId, clientId, type, actorId,
    } = data;
    const [removedDocuments, actorInfo] = await Promise.all([
      this.documentService.findDocumentsByFolderId(folderId),
      this.userService.findUserById(actorId),
    ]);

    if (!removedDocuments.length) {
      return;
    }

    const documentIds = removedDocuments.map((document) => document._id);
    switch (type) {
      case FolderTypeEnum.ORGANIZATION: {
        const organizationMemberIds = (await this.organizationService.getMembersByOrgId(clientId, { userId: 1 }))
          .map((member) => member.userId.toHexString());
        if (organizationMemberIds.length) {
          this.documentService.publishEventDeleteDocumentToInternal({
            documents: removedDocuments as unknown as Document[],
            clientId,
            roleOfDocument: DocumentRoleEnum.ORGANIZATION,
            allMember: organizationMemberIds,
          });
        }
        break;
      }

      case FolderTypeEnum.ORGANIZATION_TEAM: {
        const orgTeamMemberIds = (await this.teamService.getAllMembersInTeam(clientId, { userId: 1 })).map((member) => member.userId.toHexString());
        if (orgTeamMemberIds.length) {
          this.documentService.publishEventDeleteDocumentToInternal({
            documents: removedDocuments as unknown as Document[],
            clientId,
            roleOfDocument: DocumentRoleEnum.ORGANIZATION_TEAM,
            allMember: orgTeamMemberIds,
          });
        }
        break;
      }

      case FolderTypeEnum.PERSONAL: {
        const documentPermissionList = await this.documentService.getDocumentPermission(
          clientId,
          { documentId: { $in: documentIds } },
        );
        await this.documentService.deleteDocumentsInPersonal({
          actorInfo,
          documentPermissionList,
          documentList: removedDocuments as unknown as Document[],
          clientId,
        });
        break;
      }

      default:
        break;
    }

    if ([
      FolderTypeEnum.ORGANIZATION,
      FolderTypeEnum.ORGANIZATION_TEAM,
    ].includes(type)) {
      const externalDocumentPermissions = await this.documentService.getSharedIdsOfDocuments(removedDocuments as unknown as Document[]);
      externalDocumentPermissions.forEach((element) => {
        const externalNotification = {
          actor: actorInfo,
          entity: element.document,
        };
        this.documentService.notifyDeleteDocumentToShared(externalNotification, element.userIds as string[]);
        this.documentService.publishEventDeleteDocumentToExternal([element.document] as Document[], element.userIds as string[]);
      });
      await this.documentService.deleteManyOriginalDocument(removedDocuments as unknown as Document[]);
    }
  }

  public async deleteFolder(data: {
    actorId: string,
    folderId: string,
    isNotify?: boolean,
  }): Promise<IFolder> {
    const { actorId, folderId, isNotify } = data;
    const { allReceiverIds } = await this.getSubscriptionReceiversByFolderId(folderId);
    const foundFolderPermission = await this.findOneFolderPermission(folderId);
    const belongsTo = await this.getBelongsTo(folderId);

    const descendants = await this.deleteDescendantFolders({ folderId });

    const totalDeletedFolders = 1 + descendants.length;
    this.publishDeleteFolderSubscription(foundFolderPermission.refId, belongsTo.workspaceId, totalDeletedFolders);

    const [removedFolder, folderPermission] = await Promise.all([
      this.deleteById(folderId),
      this.deletePermissionsByFolderId(folderId),
    ]);

    const { role, refId } = folderPermission;
    const folderType = Utils.mapFolderPermissionToType(role as FolderRoleEnum);

    await Promise.all([
      ...descendants.map((folder) => this.deleteAllDocumentsInFolder({
        folderId: folder._id, clientId: refId, type: folderType, actorId,
      })),
      this.deleteAllDocumentsInFolder({
        folderId,
        clientId: refId,
        type: folderType,
        actorId,
      }),
    ]);

    if (role !== FolderRoleEnum.ORGANIZATION || isNotify) {
      this.sendNotiForDeleteFolder({
        type: folderType,
        actorId,
        clientId: refId,
        folder: removedFolder,
      });
    }
    [removedFolder, ...descendants].forEach((folder) => {
      this.publishUpdateFolderSubscription({
        actorId,
        receiverList: allReceiverIds,
        folder,
        subscriptionEvent: SUB_DELETE_FOLDER_EVENT,
      });
    });

    return removedFolder;
  }

  public async getFoldersInOrgOrTeam(targetId: string): Promise<IFolder[]> {
    return this.aggregateFolderPermission([
      {
        $match: {
          refId: new Types.ObjectId(targetId),
        },
      },
      {
        $lookup: {
          from: 'folders',
          localField: 'folderId',
          foreignField: '_id',
          as: 'folder',
        },
      },
      {
        $unwind: '$folder',
      },
      { $replaceRoot: { newRoot: '$folder' } },
      { $sort: { createdAt: -1 } },
    ]);
  }

  public async getDocuments(
    params: {
      user: any
    } & GetDocumentsInFolderInput,
  ): Promise<GetDocumentPayload> {
    const {
      user, query, filter, folderId,
    } = params;
    const { cursor, searchKey } = query;

    const documentBuilder = new FolderDocumentFilter(this.documentService);

    const folderIds = [folderId];
    if (searchKey) {
      const path = await this.findFolderPath(folderId);
      const descendantFolders = await this.folderModel.find({
        path: { $regex: `^${path}` },
      });
      folderIds.push(...descendantFolders.map((folder) => folder._id.toHexString()));
    }

    const documentFilter = await documentBuilder
      .of(user as User)
      .addCursor(cursor)
      .addSearch(searchKey)
      .addFilter({
        ownedFilterCondition: filter.ownedFilterCondition,
        lastModifiedFilterCondition: filter.lastModifiedFilterCondition,
      })
      .addFolders(folderIds)
      .build();
    const queryManager = new FolderDocumentQuery(this.documentService, this.userService, this, this.environmentService);
    const premiumMap = new FolderDocumentPremiumMap(this, this.userService).atFolder(folderId);

    return queryManager
      .of(user as User)
      .injectPremiumMap(premiumMap)
      .getDocuments({
        query,
        permFilter: null,
        documentFilter,
      });
  }

  public async getFoldersInFolder({
    folderId, searchKey, sortOptions,
  }: GetFoldersInFolderInput): Promise<IFolder[]> {
    const folderPath = await this.findFolderPath(folderId);
    const folderDepth = this.getFolderDepth({ path: folderPath });

    const sortConditions: any = {};
    if (sortOptions?.createdAt) {
      sortConditions.createdAt = SortStrategy[sortOptions.createdAt];
    }
    if (sortOptions?.name) {
      sortConditions.name = SortStrategy[sortOptions.name];
    }

    let matchConditions: FilterQuery<IFolderModel> = {};
    if (searchKey) {
      matchConditions = {
        path: { $regex: `^${folderPath}` },
        depth: searchKey ? { $gte: folderDepth } : { $eq: folderDepth },
        name: searchKey ? { $regex: Utils.transformToSearchRegex(searchKey), $options: 'i' } : { $exists: true },
      };
    } else {
      matchConditions = {
        parentId: new Types.ObjectId(folderId),
      };
    }
    const belongsTo = await this.getBelongsTo(folderId);
    const folderList = await this.findFoldersByConditions(matchConditions, null, { sort: sortConditions });
    return folderList.map((folder) => ({
      ...folder,
      belongsTo: {
        ...belongsTo,
        folderId: folder._id,
      },
    }));
  }

  async getFolderTree({ folderId }: GetFolderTreeInput): Promise<Folder> {
    const folder = await this.findOneFolder(folderId);
    if (!folder) {
      throw GraphErrorException.NotFound('Folder not found');
    }

    const prefix = this.getFolderPath({ folder });
    const descendantFolders = await this.folderModel.find({
      path: { $regex: `^${prefix}` },
    });

    return this.buildFolderTree({
      parentFolder: folder,
      folders: descendantFolders.map((f) => ({ ...f.toObject(), _id: f._id.toHexString() })),
    });
  }

  buildFolderTree({ parentFolder, folders }: { parentFolder: IFolder, folders: IFolder[] }): Folder {
    const parent: Folder = {
      _id: parentFolder._id,
      name: parentFolder.name,
      ownerId: parentFolder.ownerId,
      shareSetting: parentFolder.shareSetting,
      path: parentFolder.path,
      depth: parentFolder.depth,
      parentId: parentFolder.parentId,
      color: parentFolder.color,
      createdAt: parentFolder.createdAt,
      listUserStar: parentFolder.listUserStar,
      folders: [],
    };

    const children = folders.filter((f) => f.parentId?.toString() === parentFolder._id.toString());
    parent.folders = children.map((child) => this.buildFolderTree({ parentFolder: child, folders }));

    return parent;
  }

  buildChildrenTree({ folders }: { folders: IFolder[] }): FolderChildrenTree[] {
    if (!folders.length) return [];

    const map = new Map<string, FolderChildrenTree>(folders.map((f) => [f._id.toString(), {
      _id: f._id,
      name: f.name,
      type: FolderChildType.FOLDER,
      parentId: f.parentId ? f.parentId.toString() : null,
      createdAt: f.createdAt,
      children: [],
    }]));

    const treeRoots: FolderChildrenTree[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const node of map.values()) {
      if (node.parentId) {
        map.get(node.parentId).children.push(node);
      } else {
        treeRoots.push(node);
      }
    }
    treeRoots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return treeRoots;
  }

  async getResourceByFolderPermission(folderPermission: IFolderPermission): Promise<User|IOrganization> {
    switch (folderPermission.role as FolderRoleEnum) {
      case FolderRoleEnum.OWNER: {
        return this.userService.findUserById(folderPermission.refId);
      }
      case FolderRoleEnum.ORGANIZATION: {
        return this.organizationService.getOrgById(folderPermission.refId);
      }
      case FolderRoleEnum.ORGANIZATION_TEAM: {
        const orgTeam = await this.teamService.findOne({ _id: folderPermission.refId });
        return this.organizationService.getOrgById(orgTeam.belongsTo as string);
      }
      default: return null;
    }
  }

  async migrateFoldersToOrgPersonal(userId: string, orgId: string): Promise<number> {
    const permissions = await this.folderPermissionModel.updateMany(
      {
        refId: userId,
        role: FolderRoleEnum.OWNER,
        workspace: {
          $exists: false,
        },
      },
      {
        workspace: {
          refId: orgId,
          type: DocumentWorkspace.ORGANIZATION,
        },
      },
      {
        returnDocument: 'after',
      },
    ).exec();
    return permissions.modifiedCount;
  }

  async removeAllPersonalFolderInOrg({ user, orgId } : { user: User, orgId: string }): Promise<void> {
    const folders = await this.getTopLevelFolder({ refId: user._id, orgId });
    await Promise.all(folders.map((folder) => this.deleteFolder({
      actorId: user._id,
      folderId: folder._id,
    })));
  }

  async deleteAllFoldersInOrgWorkspace(
    data: { orgId: string, orgTeams: ITeam[] },
    session?: ClientSession,
  ): Promise<void> {
    const { orgId, orgTeams } = data;
    const teamIds = orgTeams.map((team) => team._id);
    const folderPermissions = await this.getFolderPermissions(
      {
        $or: [
          {
            refId: { $in: [orgId, ...teamIds] },
            role: {
              $in: [
                DocumentRoleEnum.ORGANIZATION,
                DocumentRoleEnum.ORGANIZATION_TEAM,
              ],
            },
          },
          {
            role: DocumentRoleEnum.OWNER,
            'workspace.refId': orgId,
          },
        ],
      },
    );
    const folderIds = folderPermissions.map((permission) => permission.folderId);
    await Promise.all([
      this.deleteManyFolders({ _id: { $in: folderIds } }, session),
      this.deleteManyFolderPermissions({ _id: { $in: folderPermissions.map(({ _id }) => _id) } }, session),
    ]);
  }

  async transferFolderOwner({
    actorId, targetId, refId, workspace,
  }: { actorId: string; targetId: string | Types.ObjectId, refId: string, workspace: DocumentRoleEnum }): Promise<void> {
    const folders = await this.folderModel.find({ ownerId: actorId });
    if (!folders.length) {
      return;
    }
    const folderPermissions = await this.getFolderPermissions(
      {
        refId,
        role: workspace,
        folderId: { $in: folders.map(({ _id }) => _id) },
      },
    );
    const folderIds = folderPermissions.map((permission) => permission.folderId);
    if (!folderIds.length) {
      return;
    }
    await this.folderModel.updateMany({
      _id: { $in: folderIds },
    }, {
      ownerId: targetId,
    });
  }

  async transferAllFoldersInTeamWorkspace(
    { actorId, teamId, targetId }: {
      actorId: string; teamId: string; targetId: string | Types.ObjectId
    },
  ): Promise<void> {
    return this.transferFolderOwner({
      actorId,
      targetId,
      refId: teamId,
      workspace: DocumentRoleEnum.ORGANIZATION_TEAM,
    });
  }

  async transferAllFoldersInOrgWorkspace(
    { actorId, orgId, targetId }: {
      actorId: string; orgId: string; targetId: string
    },
  ): Promise<void> {
    return this.transferFolderOwner({
      actorId,
      targetId,
      refId: orgId,
      workspace: DocumentRoleEnum.ORGANIZATION,
    });
  }

  async updateManyFolderPermissions(filter: FilterQuery<IFolderPermission>, update: UpdateQuery<IFolderPermission>): Promise<UpdateResult> {
    return this.folderPermissionModel.updateMany(filter, update);
  }

  async deleteFolderResource(folderId: string, actorId: string): Promise<{
    folderPermission: IFolderPermission,
    removedFolder: IFolder,
    descendantFolders: IFolder[],
    totalDeletedFolders: number;
  }> {
    const descendants = await this.deleteDescendantFolders({ folderId });
    const totalDeletedFolders = 1 + descendants.length;

    const [removedFolder, folderPermission] = await Promise.all([
      this.deleteById(folderId),
      this.deletePermissionsByFolderId(folderId),
    ]);

    const { role, refId } = folderPermission;
    const folderType = Utils.mapFolderPermissionToType(role as FolderRoleEnum);

    await Promise.all([
      ...descendants.map((folder) => this.deleteAllDocumentsInFolder({
        folderId: folder._id, clientId: refId, type: folderType, actorId,
      })),
      this.deleteAllDocumentsInFolder({
        folderId,
        clientId: refId,
        type: folderType,
        actorId,
      }),
    ]);

    return {
      folderPermission,
      removedFolder,
      descendantFolders: descendants,
      totalDeletedFolders,
    };
  }

  async deleteMultiFolder({
    actor, folderIds, isNotify,
  }: {
    actor: User, folderIds: string[], isNotify?: boolean
  }): Promise<void> {
    const foundFolderPermission = await this.findOneFolderPermission(folderIds[0]);
    const belongsTo = await this.getBelongsTo(folderIds[0]);
    const receivers = await Promise.all(
      folderIds.map((folderId) => this.getSubscriptionReceiversByFolderId(folderId)),
    );
    const folderPermissions = await Promise.all(
      folderIds.map((folderId) => this.deleteFolderResource(folderId, actor._id)),
    );
    const allReceiverIds = [...new Set(receivers.map((r) => r.allReceiverIds).flat())];

    const totalDeletedFolders = folderPermissions.reduce((total, permission) => total + permission.totalDeletedFolders, 0);
    this.publishDeleteFolderSubscription(foundFolderPermission.refId, belongsTo.workspaceId, totalDeletedFolders);

    const { folderList, descendants } = folderPermissions.reduce((acc, { removedFolder, descendantFolders }) => {
      acc.folderList.push(removedFolder);
      acc.descendants.push(...descendantFolders);
      return acc;
    }, { folderList: [], descendants: [] });

    [...folderList, ...descendants].forEach((folder, index) => {
      this.publishUpdateFolderSubscription({
        actorId: actor._id,
        receiverList: allReceiverIds,
        folder,
        subscriptionEvent: SUB_DELETE_FOLDER_EVENT,
        ...(index === 0 && { folders: folderList }),
      });
    });

    const roleOfFolder = folderPermissions[0]?.folderPermission?.role;
    if (roleOfFolder === FolderRoleEnum.ORGANIZATION && !isNotify) {
      return;
    }
    const notificationToMemberData = {
      actor: { user: actor },
      entity: { totalFolder: folderIds.length, folder: folderPermissions[0].removedFolder },
    };
    switch (roleOfFolder) {
      case FolderRoleEnum.ORGANIZATION: {
        await this.notifyDeleteFoldersToMember(
          FolderRoleEnum.ORGANIZATION,
          folderPermissions[0].folderPermission.refId,
          notificationToMemberData,
          [actor._id],
        );
        break;
      }
      case FolderRoleEnum.ORGANIZATION_TEAM: {
        await this.notifyDeleteFoldersToMember(
          FolderRoleEnum.ORGANIZATION_TEAM,
          folderPermissions[0].folderPermission.refId,
          notificationToMemberData,
          [actor._id],
        );
        break;
      }
      default:
        break;
    }
  }

  async notifyDeleteFoldersToMember(
    type: FolderRoleEnum,
    clientId: string,
    notificationData: Record<string, any>,
    exceptionIds: string[],
  ): Promise<void> {
    switch (type) {
      case FolderRoleEnum.ORGANIZATION: {
        const organization = await this.organizationService.getOrgById(clientId);
        const notification = notiOrgFactory.create(NotiOrg.DELETE_MULTI_FOLDER, {
          ...notificationData,
          target: { organization },
        });
        this.organizationService.publishNotiToAllOrgMember({
          orgId: clientId,
          notification,
          excludedIds: exceptionIds,
        });

        // send out-app noti for mobile
        const {
          notificationContent: firebaseNotificationContent,
          notificationData: firebaseNotificationData,
        } = notiFirebaseOrganizationFactory.create(NotiOrg.DELETE_MULTI_FOLDER, {
          organization,
          actor: notificationData.actor.user,
          totalFolders: notificationData.entity.totalFolder,
        });
        this.organizationService.publishFirebaseNotiToAllOrgMember({
          orgId: clientId,
          firebaseNotificationData,
          firebaseNotificationContent,
          excludedIds: exceptionIds,
        });
        break;
      }
      case FolderRoleEnum.ORGANIZATION_TEAM: {
        const organizationTeam = await this.teamService.findOneById(clientId);
        const organization = await this.organizationService.getOrgById(organizationTeam.belongsTo as string);
        const notification = notiOrgFactory.create(NotiOrgTeam.DELETE_MULTI_FOLDER, {
          ...notificationData,
          target: { organization, team: organizationTeam },
        });
        this.membershipService.publishNotiToAllTeamMember(clientId, notification, exceptionIds);

        // send out-app noti for mobile
        const {
          notificationContent: firebaseNotificationContent,
          notificationData: firebaseNotificationData,
        } = notiFirebaseTeamFactory.create(NotiOrgTeam.DELETE_MULTI_FOLDER, {
          organization,
          actor: notificationData.actor.user,
          totalFolders: notificationData.entity.totalFolder,
          team: organizationTeam,
        });

        this.organizationService.publishFirebaseNotiToAllTeamMember({
          teamId: organizationTeam._id,
          firebaseNotificationData,
          firebaseNotificationContent,
          excludes: exceptionIds,
        });
        break;
      }
      default:
        break;
    }
  }

  async getOrganizationFolder(user, organization, userTeams, input): Promise<{ results: IFolder[]; cursor: string; total: number }> {
    const lookupUtils = new OrganizationResourcesLookupUtils<IFolder>({
      user,
      organization,
      userTeams,
      model: this.folderPermissionModel,
    });
    return lookupUtils.lookup(input);
  }

  public async checkOrgMembership({ targetType, refId, userId }: { targetType: DestinationType, refId: string, userId: string }): Promise<void> {
    let orgMembership = null;
    if (targetType === DestinationType.ORGANIZATION_TEAM) {
      const orgOfTeam = await this.organizationTeamService.getOrgOfTeam(refId);
      refId = orgOfTeam._id;
    }
    orgMembership = await this.organizationService.getMembershipByOrgAndUser(refId, userId);

    if (!orgMembership) {
      throw GraphErrorException.NotFound(
        'You have no permission',
        ErrorCode.Common.NO_PERMISSION,
      );
    }
  }
}
