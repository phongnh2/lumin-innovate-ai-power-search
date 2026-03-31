/* eslint-disable import/extensions */
import {
  forwardRef,
  HttpStatus, Inject, UseGuards, UseInterceptors,
} from '@nestjs/common';
import {
  Resolver, Mutation, Args, Context, Query, ResolveField, Parent, Subscription,
} from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

import { DEFAULT_FOLDER_COLORS, FOLDER_MANAGER_ROLES } from 'Common/constants/FolderConstants';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { SUBSCRIPTION_CREATE_FOLDER, SUBSCRIPTION_UPDATE_FOLDER } from 'Common/constants/SubscriptionConstants';
import { CustomRuleValidator } from 'Common/decorators/customRule.decorator';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { AllowProfessionalUserGuard } from 'Common/guards/allow-professional-user.guard';
import { Utils } from 'Common/utils/Utils';
import { DocumentFilePipe } from 'Common/validator/FileValidator/document.validator.pipe';
import { FileData } from 'Common/validator/FileValidator/file.validator.pipe';

import { CustomRuleAction } from 'CustomRules/custom-rule.enum';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { DataLoaderRegistry } from 'DataLoader/dataLoader.registry';
import { DocumentWorkspace } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import { OrganizationDocumentRoles, OrgTeamDocumentRoles } from 'Document/enums/organization.roles.enum';
import {
  DocumentGuestLevelGuard,
} from 'Document/guards/Gql/document.guest.permission.guard';
import { DocumentStatusGuard } from 'Document/guards/Gql/document.status.guard';
import { DocumentPaymentInterceptor, ExtendedDocumentIntercept } from 'Document/interceptor/document.payment.interceptor';
import { FolderRoleEnum } from 'Folder/folder.enum';
import { FolderService } from 'Folder/folder.service';
import { FolderPermissionGuard } from 'Folder/guards/Gql/folder.permission.guard';
import {
  CreateFolderInput,
  Folder,
  GetFolderListInput,
  EditFolderInput,
  GetDocumentPayload,
  GetDocumentsInFolderInput,
  DuplicateDocumentInput,
  DuplicateDocumentToFolderInput,
  Document,
  TypeOfDocument,
  BasicResponse,
  GetTotalFoldersInput,
  GetTotalFoldersPayload,
  DestinationType,
  GetFoldersInFolderInput,
  FolderBelongsTo,
  GetPersonalFolderTreePayload,
} from 'graphql.schema';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { UserService } from 'User/user.service';

import { IFolder } from './interfaces/folder.interface';

@UseGuards(GqlAuthGuard)
@Resolver('Folder')
export class FolderResolver {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    private readonly folderService: FolderService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    private readonly organizationService: OrganizationService,
    private readonly organizationTeamService: OrganizationTeamService,
    private readonly userService: UserService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  @UseGuards(GqlAuthGuard)
  @Subscription(SUBSCRIPTION_CREATE_FOLDER, {
    filter: (_, variables) => !variables.input.isStarredTab,
  })
  createFolderSubscription(@Args('input') input) {
    const { clientId, parentId } = input;
    const subscriptionKey = parentId
      ? `${SUBSCRIPTION_CREATE_FOLDER}.${clientId}.${parentId}`
      : `${SUBSCRIPTION_CREATE_FOLDER}.${clientId}`;

    return this.pubSub.asyncIterator(subscriptionKey);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  @UseGuards(GqlAuthGuard)
  @Subscription(SUBSCRIPTION_UPDATE_FOLDER, {
    filter: (payload, variables) => {
      const { input } = variables;
      const { folder } = payload.updateFolderSubscription;
      if (input.folderId && input.parentId) {
        return folder.parentId === input.parentId && folder._id === input.folderId;
      }

      if (input.folderId) {
        return folder._id === input.folderId;
      }

      if (input.parentId) {
        return folder.parentId === input.parentId;
      }

      return true;
    },
  })
  updateFolderSubscription(@Args('input') input) {
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_UPDATE_FOLDER}.${input.userId}`);
  }

  @UseGuards(GqlAuthGuard)
  @Subscription('folderEventSubscription')
  folderEventSubscription(@Args('input') input) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return this.pubSub.asyncIterator(`folderEventSubscription.${input.clientId}`);
  }

  @UseGuards(AllowProfessionalUserGuard)
  @Mutation()
  createFolder(
    @Context() context,
    @Args('input') input: CreateFolderInput,
  ): Promise<Folder> {
    const { _id: ownerId } = context.req.user;
    return this.folderService.createFolder({ ...input, ownerId });
  }

  @Query()
  getPersonalFolders(
    @Context() context,
    @Args('input') input: GetFolderListInput,
  ): Promise<Folder[]> {
    const { _id: userId } = context.req.user;
    const { sortOptions, isStarredTab, searchKey } = input;
    return this.folderService.getPersonalFolders({
      userId, sortOptions, isStarredTab, searchKey,
    });
  }

  @Query()
  getPersonalFolderTree(
    @Context() context,
  ): Promise<GetPersonalFolderTreePayload> {
    const { _id: userId } = context.req.user;
    return this.folderService.getPersonalFolderTree({ userId });
  }

  @FolderPermissionGuard()
  @Query()
  getFolderDetail(
    @Args('folderId') folderId: string,
  ): Promise<Folder> {
    return this.folderService.findOneFolder(folderId);
  }

  @FolderPermissionGuard(...FOLDER_MANAGER_ROLES)
  @Mutation()
  editFolderInfo(
    @Context() context,
    @Args('input') input: EditFolderInput,
  ): Promise<Folder> {
    const { _id: userId } = context.req.user;
    return this.folderService.updateFolderInfo({ userId, ...input });
  }

  @Mutation()
  async addFolderColor(
    @Context() context,
    @Args('color') color: string,
  ): Promise<string[]> {
    const { _id: userId } = context.req.user;
    const updatedUser = await this.folderService.addNewFolderColor(userId as string, color);
    if (!updatedUser) {
      throw GraphErrorException.BadRequest('This color is already existed');
    }
    return [...updatedUser.metadata.folderColors.reverse(), ...DEFAULT_FOLDER_COLORS];
  }

  @FolderPermissionGuard()
  @Mutation()
  starFolder(
    @Context() context,
    @Args('folderId') folderId: string,
  ): Promise<Folder> {
    const { _id: userId } = context.req.user;
    return this.folderService.starFolder(userId as string, folderId);
  }

  @FolderPermissionGuard(...FOLDER_MANAGER_ROLES)
  @Mutation()
  async deleteFolder(
    @Context() context,
    @Args('folderId') folderId: string,
    @Args('isNotify') isNotify: boolean,
  ): Promise<string> {
    const { _id: actorId } = context.req.user;
    const removedDocument = await this.folderService.deleteFolder({
      actorId,
      folderId,
      isNotify,
    });
    return removedDocument._id;
  }

  @FolderPermissionGuard()
  @Query()
  getDocumentsInFolder(
    @Context() context,
    @Args('input') input: GetDocumentsInFolderInput,
  ): Promise<GetDocumentPayload> {
    const { user } = context.req;
    return this.folderService.getDocuments({
      user,
      ...input,
    });
  }

  @FolderPermissionGuard()
  @Query()
  getFoldersInFolder(
    @Args('input') input: GetFoldersInFolderInput,
  ): Promise<Folder[]> {
    return this.folderService.getFoldersInFolder(input);
  }

  @FolderPermissionGuard()
  @Query()
  getFolderTree(
    @Args('folderId') folderId: string,
  ): Promise<Folder> {
    return this.folderService.getFolderTree({ folderId });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @FolderPermissionGuard()
  @DocumentStatusGuard({ preventIfExpired: true })
  @DocumentGuestLevelGuard(
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
    OrganizationDocumentRoles.ALL,
  )
  @CustomRuleValidator(CustomRuleAction.USE_S3_STORAGE)
  @UseInterceptors(DocumentPaymentInterceptor)
  /**
   * TODO: convert to presigned url to upload
   */
  @Mutation()
  async duplicateDocumentToFolder(
    @Args('input') input: DuplicateDocumentToFolderInput,
    @Args({ name: 'file', type: () => GraphQLUpload }, DocumentFilePipe())
      file: FileData,
    @Context() context,
  ): Promise<Document & ExtendedDocumentIntercept & BasicResponse> {
    const { _id: userId } = context.req.user;
    const {
      folderId,
      documentId,
      documentName,
      notifyUpload,
    } = input;
    const destinationTypeMapping = {
      [FolderRoleEnum.ORGANIZATION]: TypeOfDocument.ORGANIZATION,
      [FolderRoleEnum.ORGANIZATION_TEAM]: TypeOfDocument.ORGANIZATION_TEAM,
      default: TypeOfDocument.PERSONAL,
    };
    const isRequestFromMobile = await Utils.isRequestFromMobile(context.req as IGqlRequest);
    const folderPermission = await this.folderService.findOneFolderPermission(folderId);
    const destinationType = destinationTypeMapping[folderPermission.role] || destinationTypeMapping.default;
    const duplicateDocumentInput: DuplicateDocumentInput & { isRequestFromMobile: boolean } = {
      documentId,
      newDocumentData: {
        documentName,
        destinationType,
        destinationId: folderPermission?.workspace?.refId.toHexString() || folderPermission.refId.toHexString(),
        notifyUpload,
      },
      isRequestFromMobile,
    };

    const document = await this.documentService.duplicateDocument({
      ...duplicateDocumentInput, creatorId: userId, file, belongsTo: folderId,
    });

    const isDuplicateToPersonalFolder = (folderPermission.role as FolderRoleEnum) === FolderRoleEnum.OWNER;
    return {
      ...document as unknown as Document,
      statusCode: HttpStatus.OK,
      message: 'Duplicate document successfully',
      ...(!isDuplicateToPersonalFolder && {
        interceptRequest: {
          documentIds: [document._id],
          strategy: DocumentPaymentInterceptor.STRATEGY.AUTO_INCREMENT,
        },
      }),
    };
  }

  @ResolveField('totalDocument')
  getTotalDocument(@Parent() folder): Promise<number> {
    if (typeof folder.totalDocument === 'number') {
      return folder.totalDocument;
    }
    return this.documentService.countDocumentsByFolderId(folder._id as string);
  }

  @ResolveField('belongsTo')
  async getBelongsTo(
    @Parent() folder: IFolder & { belongsTo: FolderBelongsTo },
    @Context() { loaders }: { loaders: DataLoaderRegistry, req: IGqlRequest },
  ): Promise<FolderBelongsTo> {
    if (folder.belongsTo) {
      return folder.belongsTo;
    }
    return this.folderService.getBelongsToFromLoaders({ folderId: folder._id, loaders });
  }

  @ResolveField('breadcrumbs')
  async getBreadcrumbs(
    @Parent() folder: Folder,
    @Context() { loaders }: { loaders: DataLoaderRegistry, req: IGqlRequest },
  ): Promise<Folder[]> {
    if (folder.breadcrumbs) {
      return folder.breadcrumbs;
    }
    const path = folder.path ? folder.path.split(',').filter(Boolean) : [];
    const folders = await Promise.all(path.map((id) => loaders.folderLoader.load(id)));
    return folders.filter(Boolean).map((f) => ({ _id: f._id, name: f.name }));
  }

  @ResolveField('ownerName')
  async getOwnerName(
    @Parent() folder: Folder,
    @Context() { loaders }: { loaders: DataLoaderRegistry, req: IGqlRequest },
  ): Promise<string> {
    if (folder.ownerName) {
      return folder.ownerName;
    }
    const owner = await loaders.usersLoader.load(folder.ownerId);
    return owner?.name || 'Anonymous';
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getTotalFolders(
    @Context() context,
    @Args('input') input: GetTotalFoldersInput,
  ): Promise<GetTotalFoldersPayload> {
    const {
      targetType,
      refId,
    } = input;
    const { _id: userId } = context.req.user;

    const isAtPersonalWorkspace = refId === userId;
    if (!isAtPersonalWorkspace) {
      await this.folderService.checkOrgMembership({ targetType, refId, userId });
    }
    let matchConditions = {};
    switch (targetType) {
      case DestinationType.ORGANIZATION: {
        matchConditions = {
          refId,
          role: FolderRoleEnum.ORGANIZATION,
        };
        break;
      }
      case DestinationType.PERSONAL: {
        if (isAtPersonalWorkspace) {
          matchConditions = {
            refId,
            role: FolderRoleEnum.OWNER,
            workspace: { $exists: false },
          };
        } else {
          matchConditions = {
            refId: userId,
            role: FolderRoleEnum.OWNER,
            'workspace.refId': refId,
            'workspace.type': DocumentWorkspace.ORGANIZATION,
          };
        }
        break;
      }
      case DestinationType.ORGANIZATION_TEAM: {
        matchConditions = {
          refId,
          role: FolderRoleEnum.ORGANIZATION_TEAM,
        };
        break;
      }
      default:
        return {
          total: 0,
        };
    }
    const total = await this.folderService.countFolders(matchConditions);
    return { total };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @FolderPermissionGuard(...FOLDER_MANAGER_ROLES)
  @Mutation()
  async deleteMultipleFolder(
    @Context() context,
    @Args('input') input,
  ): Promise<string[]> {
    const { folderIds, isNotify } = input;
    await this.folderService.deleteMultiFolder({ actor: context.req.user, folderIds, isNotify });
    return [];
  }
}
