import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { FolderService } from '../folder.service';
import { FolderRoleEnum, FolderTypeEnum } from '../folder.enum';
import { DocumentRoleEnum, DocumentWorkspace } from '../../Document/document.enum';
import { GraphErrorException } from '../../Common/errors/GraphqlErrorException';
import { ErrorCode } from '../../Common/constants/ErrorCode';
import { DEFAULT_FOLDER_COLORS, MAX_DEPTH_LEVEL, MAX_NUBMER_FOLDER } from '../../Common/constants/FolderConstants';
import { IFolder, IFolderPermission } from '../interfaces/folder.interface';
import { LocationType, DestinationType } from '../../graphql.schema';
import { User } from '../../User/interfaces/user.interface';
import { IOrganization } from '../../Organization/interfaces/organization.interface';
import { ITeam } from '../../Team/interfaces/team.interface';
import { UserService } from '../../User/user.service';
import { OrganizationTeamService } from '../../Organization/organizationTeam.service';
import { OrganizationService } from '../../Organization/organization.service';
import { DocumentService } from '../../Document/document.service';
import { MembershipService } from '../../Membership/membership.service';
import { TeamService } from '../../Team/team.service';
import { EnvironmentService } from '../../Environment/environment.service';
import { LoggerService } from '../../Logger/Logger.service';
import {
  SUBSCRIPTION_CREATE_FOLDER,
  SUB_DELETE_FOLDER_EVENT,
  SUBSCRIPTION_UPDATE_FOLDER,
  SUB_UPDATE_FOLDER_INFO_EVENT,
  SUB_UPDATE_STARRED_FOLDER_EVENT,
  SUB_CREATE_FOLDER_EVENT,
  SUBSCRIPTION_FOLDER_EVENT,
} from '../../Common/constants/SubscriptionConstants';
import { NotiFolder, NotiOrg, NotiOrgTeam } from '../../Common/constants/NotificationConstants';

jest.mock('Common/factory/NotiFactory', () => ({
  notiFolderFactory: {
    create: jest.fn(),
  },
  notiOrgFactory: {
    create: jest.fn(),
  },
}));

jest.mock('Common/factory/NotiFirebaseFactory', () => ({
  notiFirebaseFolderFactory: {
    create: jest.fn(),
  },
  notiFirebaseOrganizationFactory: {
    create: jest.fn(),
  },
  notiFirebaseTeamFactory: {
    create: jest.fn(),
  },
}));

jest.mock('Common/template-methods/DocumentQuery/folder-document-query', () => ({
  FolderDocumentQuery: jest.fn(),
}));

jest.mock('Common/builder/DocumentFilterBuilder', () => ({
  FolderDocumentFilter: jest.fn(),
}));

jest.mock('Common/template-methods/DocumentPremiumMap', () => ({
  FolderDocumentPremiumMap: jest.fn(),
}));

jest.mock('Organization/utils/organization.resources.utils', () => ({
  OrganizationResourcesLookupUtils: jest.fn(),
}));

describe('FolderService', () => {
  let service: FolderService;
  let folderModel: any;
  let folderPermissionModel: any;
  let pubSub: any;
  let userService: any;
  let organizationTeamService: any;
  let organizationService: any;
  let documentService: any;
  let membershipService: any;
  let teamService: any;
  let environmentService: any;
  let loggerService: any;

  const mockFolderId = '507f1f77bcf86cd799439011';
  const mockUserId = '507f1f77bcf86cd799439012';
  const mockOrgId = '507f1f77bcf86cd799439013';
  const mockTeamId = '507f1f77bcf86cd799439014';

  const mockFolder: IFolder = {
    _id: mockFolderId,
    name: 'Test Folder',
    ownerId: mockUserId,
    color: '#f2385a',
    path: `,${mockFolderId},`,
    depth: 0,
    parentId: null as any,
    shareSetting: {},
    listUserStar: [] as any,
    createdAt: new Date().toISOString(),
  };

  const mockFolderPermission: IFolderPermission = {
    _id: '507f1f77bcf86cd799439015',
    refId: mockUserId,
    folderId: mockFolderId,
    role: FolderRoleEnum.OWNER,
    workspace: undefined as any,
  };

  const mockUser: User = {
    _id: mockUserId,
    name: 'Test User',
    email: 'test@test.com',
  } as User;

  const mockOrganization: IOrganization = {
    _id: mockOrgId,
    name: 'Test Organization',
  } as IOrganization;

  const mockTeam: ITeam = {
    _id: mockTeamId,
    name: 'Test Team',
    belongsTo: mockOrgId,
  } as ITeam;

  const mockFolderModelInstance = {
    _id: new Types.ObjectId(mockFolderId),
    toObject: jest.fn().mockReturnValue(mockFolder),
    toHexString: jest.fn().mockReturnValue(mockFolderId),
  };

  const mockFolderPermissionInstance = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439015'),
    toObject: jest.fn().mockReturnValue(mockFolderPermission),
    toHexString: jest.fn().mockReturnValue('507f1f77bcf86cd799439015'),
  };

  beforeEach(async () => {

    folderModel = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFolderModelInstance),
      }),
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockFolderModelInstance]),
      }),
      create: jest.fn().mockResolvedValue(mockFolderModelInstance),
      findOneAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFolderModelInstance),
      }),
      findOneAndDelete: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFolderModelInstance),
      }),
      deleteMany: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
        session: jest.fn().mockReturnThis(),
      }),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      aggregate: jest.fn().mockResolvedValue([]),
    };

    folderPermissionModel = {
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockFolderPermissionInstance]),
      }),
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFolderPermissionInstance),
      }),
      create: jest.fn().mockResolvedValue(mockFolderPermissionInstance),
      findOneAndDelete: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFolderPermissionInstance),
      }),
      deleteMany: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
        session: jest.fn().mockReturnThis(),
      }),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      countDocuments: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      }),
      aggregate: jest.fn().mockResolvedValue([]),
    };

    pubSub = {
      publish: jest.fn(),
    };

    userService = {
      findUserById: jest.fn().mockResolvedValue(mockUser),
      updateFolderColor: jest.fn().mockResolvedValue(mockUser),
    };

    organizationTeamService = {
      getOrgTeamById: jest.fn().mockResolvedValue(mockTeam),
      getOrgOfTeam: jest.fn().mockResolvedValue(mockOrganization),
    };

    organizationService = {
      getOrgById: jest.fn().mockResolvedValue(mockOrganization),
      getMembersByOrgId: jest.fn().mockResolvedValue([]),
      getFolderListByPermission: jest.fn().mockResolvedValue([]),
      publishNotiToAllOrgMember: jest.fn(),
      publishFirebaseNotiToAllOrgMember: jest.fn(),
      publishFirebaseNotiToAllTeamMember: jest.fn(),
      getMembershipByOrgAndUser: jest.fn().mockResolvedValue({}),
    };

    documentService = {
      findDocumentsByFolderId: jest.fn().mockResolvedValue([]),
      getDocumentPermission: jest.fn().mockResolvedValue([]),
      deleteDocumentsInPersonal: jest.fn().mockResolvedValue(undefined),
      publishEventDeleteDocumentToInternal: jest.fn(),
      getSharedIdsOfDocuments: jest.fn().mockResolvedValue([]),
      notifyDeleteDocumentToShared: jest.fn(),
      publishEventDeleteDocumentToExternal: jest.fn(),
      deleteManyOriginalDocument: jest.fn().mockResolvedValue(undefined),
    };

    membershipService = {
      publishNotiToAllTeamMember: jest.fn(),
    };

    teamService = {
      getAllMembersInTeam: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(mockTeam),
      findOneById: jest.fn().mockResolvedValue(mockTeam),
    };

    environmentService = {
      getByKey: jest.fn(),
    };

    loggerService = {
      error: jest.fn(),
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FolderService,
        { provide: 'PUB_SUB', useValue: pubSub },
        { provide: getModelToken('Folder'), useValue: folderModel },
        { provide: getModelToken('FolderPermission'), useValue: folderPermissionModel },
        { provide: UserService, useValue: userService },
        { provide: OrganizationTeamService, useValue: organizationTeamService },
        { provide: OrganizationService, useValue: organizationService },
        { provide: DocumentService, useValue: documentService },
        { provide: MembershipService, useValue: membershipService },
        { provide: TeamService, useValue: teamService },
        { provide: EnvironmentService, useValue: environmentService },
        { provide: LoggerService, useValue: loggerService },
      ],
    }).compile();

    service = module.get<FolderService>(FolderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('publishCreateFolderSubscription', () => {
    it('should publish subscription with parentId', async () => {
      const parentId = '507f1f77bcf86cd799439016';
      const payload = {
        folder: { ...mockFolder, parentId },
        clientId: mockUserId,
      };
      jest.spyOn(service, 'getBelongsTo').mockResolvedValue({
        folderId: mockFolderId,
        type: LocationType.PERSONAL,
        location: { _id: mockUserId, name: 'Test User' },
        workspaceId: null,
      });

      await service.publishCreateFolderSubscription(payload, SUBSCRIPTION_CREATE_FOLDER);

      expect(pubSub.publish).toHaveBeenCalledWith(
        `${SUBSCRIPTION_CREATE_FOLDER}.${mockUserId}.${parentId}`,
        expect.objectContaining({
          [SUBSCRIPTION_CREATE_FOLDER]: expect.objectContaining({
            folder: expect.objectContaining({ belongsTo: expect.anything() }),
          }),
        }),
      );
      expect(pubSub.publish).toHaveBeenCalledWith(
        `${SUBSCRIPTION_FOLDER_EVENT}.${mockUserId}`,
        expect.objectContaining({
          folderEventSubscription: expect.objectContaining({
            eventType: SUB_CREATE_FOLDER_EVENT,
          }),
        }),
      );
    });

    it('should publish subscription without parentId', async () => {
      const payload = {
        folder: { ...mockFolder, parentId: null },
        clientId: mockUserId,
      };
      jest.spyOn(service, 'getBelongsTo').mockResolvedValue({
        folderId: mockFolderId,
        type: LocationType.PERSONAL,
        location: { _id: mockUserId, name: 'Test User' },
        workspaceId: null,
      });

      await service.publishCreateFolderSubscription(payload, SUBSCRIPTION_CREATE_FOLDER);

      expect(pubSub.publish).toHaveBeenCalledWith(
        `${SUBSCRIPTION_CREATE_FOLDER}.${mockUserId}`,
        expect.anything(),
      );
    });
  });

  describe('findOneFolder', () => {
    it('should return folder when found', async () => {
      const result = await service.findOneFolder(mockFolderId);
      expect(result).toEqual(mockFolder);
      expect(folderModel.findOne).toHaveBeenCalledWith({ _id: mockFolderId }, undefined);
    });

    it('should return null when folder not found', async () => {
      folderModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOneFolder(mockFolderId);
      expect(result).toBeNull();
    });

    it('should return folder with projection', async () => {
      const projection = { name: 1 };
      await service.findOneFolder(mockFolderId, projection);
      expect(folderModel.findOne).toHaveBeenCalledWith({ _id: mockFolderId }, projection);
    });
  });

  describe('findFolderByIds', () => {
    it('should return folders by ids', async () => {
      const result = await service.findFolderByIds([mockFolderId]);
      expect(result).toEqual([mockFolder]);
      expect(folderModel.find).toHaveBeenCalledWith({ _id: { $in: [mockFolderId] } }, undefined);
    });

    it('should return folders with projection', async () => {
      const projection = { name: 1 };
      await service.findFolderByIds([mockFolderId], projection);
      expect(folderModel.find).toHaveBeenCalledWith({ _id: { $in: [mockFolderId] } }, projection);
    });
  });

  describe('findFoldersByConditions', () => {
    it('should return folders by conditions', async () => {
      const conditions = { name: 'Test' };
      folderModel.find.mockResolvedValue([mockFolderModelInstance]);
      const result = await service.findFoldersByConditions(conditions);
      expect(result).toEqual([mockFolder]);
      expect(folderModel.find).toHaveBeenCalledWith(conditions, undefined, undefined);
    });

    it('should return folders with projection and options', async () => {
      const conditions = { name: 'Test' };
      const projection = { name: 1 };
      const options = { sort: { createdAt: -1 } };
      folderModel.find.mockResolvedValue([mockFolderModelInstance]);
      await service.findFoldersByConditions(conditions, projection, options);
      expect(folderModel.find).toHaveBeenCalledWith(conditions, projection, options);
    });
  });

  describe('findOneAndUpdateFolder', () => {
    it('should update and return folder', async () => {
      const updateField = { name: 'Updated Folder' };
      const result = await service.findOneAndUpdateFolder(mockFolderId, updateField);
      expect(result).toEqual(mockFolder);
      expect(folderModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockFolderId },
        updateField,
        { new: true },
      );
    });

    it('should return null when folder not found', async () => {
      folderModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOneAndUpdateFolder(mockFolderId, { name: 'Updated' });
      expect(result).toBeNull();
    });
  });

  describe('createFolderDocument', () => {
    it('should create folder document', async () => {
      const folderData = {
        name: 'New Folder',
        ownerId: mockUserId,
        color: '#f2385a',
        path: ',',
        depth: 0,
      };
      const result = await service.createFolderDocument(folderData);
      expect(result).toEqual(mockFolder);
      expect(folderModel.create).toHaveBeenCalledWith({
        ...folderData,
        shareSetting: {},
      });
    });
  });

  describe('createFolderPermissionDocument', () => {
    it('should create folder permission document', async () => {
      const folderPermission = {
        refId: mockUserId,
        folderId: mockFolderId,
        role: FolderRoleEnum.OWNER,
      };
      const result = await service.createFolderPermissionDocument(folderPermission);
      expect(result).toEqual(mockFolderPermission);
      expect(folderPermissionModel.create).toHaveBeenCalled();
    });
  });

  describe('deleteById', () => {
    it('should delete folder by id', async () => {
      const result = await service.deleteById(mockFolderId);
      expect(result).toEqual(mockFolder);
      expect(folderModel.findOneAndDelete).toHaveBeenCalledWith({ _id: mockFolderId }, undefined);
    });

    it('should return null when folder not found', async () => {
      folderModel.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.deleteById(mockFolderId);
      expect(result).toBeNull();
    });
  });

  describe('findFolderDescendants', () => {
    it('should find folder descendants', async () => {
      jest.spyOn(service, 'findOneFolder').mockResolvedValue(mockFolder);
      jest.spyOn(service, 'getFolderPath').mockReturnValue(`,${mockFolderId},`);

      const result = await service.findFolderDescendants({ folderId: mockFolderId });
      expect(result).toEqual([mockFolder]);
      expect(folderModel.find).toHaveBeenCalledWith({
        path: { $regex: `^,${mockFolderId},` },
      });
      expect(folderModel.find().exec).toHaveBeenCalled();
    });
  });

  describe('deleteDescendantFolders', () => {
    it('should delete descendant folders', async () => {
      jest.spyOn(service, 'findFolderDescendants').mockResolvedValue([mockFolder]);
      const result = await service.deleteDescendantFolders({ folderId: mockFolderId });

      expect(result).toEqual([mockFolder]);
      expect(folderModel.deleteMany).toHaveBeenCalledWith({
        _id: { $in: [mockFolderId] },
      });
      expect(folderPermissionModel.deleteMany).toHaveBeenCalledWith({
        folderId: { $in: [mockFolderId] },
      });
    });
  });

  describe('deletePermissionsByFolderId', () => {
    it('should delete permissions by folder id', async () => {
      const result = await service.deletePermissionsByFolderId(mockFolderId);
      expect(result).toEqual(mockFolderPermission);
      expect(folderPermissionModel.findOneAndDelete).toHaveBeenCalledWith(
        { folderId: mockFolderId },
        undefined,
      );
    });

    it('should return null when permission not found', async () => {
      folderPermissionModel.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.deletePermissionsByFolderId(mockFolderId);
      expect(result).toBeNull();
    });
  });

  describe('deleteManyFolders', () => {
    it('should delete many folders', async () => {
      const conditions = { name: 'Test' };
      const result = await service.deleteManyFolders(conditions);
      expect(result).toEqual({ deletedCount: 1 });
      expect(folderModel.deleteMany).toHaveBeenCalledWith(conditions);
    });

    it('should delete many folders with session', async () => {
      const session = {} as any;
      const conditions = { name: 'Test' };
      await service.deleteManyFolders(conditions, session);
      expect(folderModel.deleteMany).toHaveBeenCalledWith(conditions);
    });
  });

  describe('deleteManyFolderPermissions', () => {
    it('should delete many folder permissions', async () => {
      const conditions = { folderId: mockFolderId };
      const result = await service.deleteManyFolderPermissions(conditions);
      expect(result).toEqual({ deletedCount: 1 });
      expect(folderPermissionModel.deleteMany).toHaveBeenCalledWith(conditions);
    });
  });

  describe('getFolderPermissions', () => {
    it('should get folder permissions', async () => {
      const conditions = { folderId: mockFolderId };
      const result = await service.getFolderPermissions(conditions);
      expect(result).toEqual([mockFolderPermission]);
      expect(folderPermissionModel.find).toHaveBeenCalledWith(conditions, undefined);
    });

    it('should get folder permissions with projection', async () => {
      const conditions = { folderId: mockFolderId };
      const projection = { role: 1 };
      await service.getFolderPermissions(conditions, projection);
      expect(folderPermissionModel.find).toHaveBeenCalledWith(conditions, projection);
    });
  });

  describe('findOneFolderPermission', () => {
    it('should find one folder permission with folderId', async () => {
      const condition = { refId: mockUserId };
      const result = await service.findOneFolderPermission(mockFolderId, condition);
      expect(result).toEqual(mockFolderPermission);
      expect(folderPermissionModel.findOne).toHaveBeenCalledWith(
        { ...condition, folderId: mockFolderId },
        undefined,
      );
    });

    it('should find one folder permission without folderId', async () => {
      const condition = { refId: mockUserId };
      const result = await service.findOneFolderPermission('', condition);
      expect(result).toEqual(mockFolderPermission);
      expect(folderPermissionModel.findOne).toHaveBeenCalledWith(condition, undefined);
    });

    it('should return null when permission not found', async () => {
      folderPermissionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOneFolderPermission(mockFolderId);
      expect(result).toBeNull();
    });
  });

  describe('aggregateFolderPermission', () => {
    it('should aggregate folder permissions', async () => {
      const conditions = [{ $match: { folderId: mockFolderId } }];
      const result = await service.aggregateFolderPermission(conditions);
      expect(result).toEqual([]);
      expect(folderPermissionModel.aggregate).toHaveBeenCalledWith(conditions);
    });
  });

  describe('getSubscriptionReceiversByFolderId', () => {
    it('should get subscription receivers for ORGANIZATION role', async () => {
      const orgMember = { userId: new Types.ObjectId('507f1f77bcf86cd799439017') };
      organizationService.getMembersByOrgId.mockResolvedValue([orgMember]);

      const orgPermissionInstance = {
        ...mockFolderPermissionInstance,
        role: FolderRoleEnum.ORGANIZATION,
        refId: mockOrgId,
        toObject: jest.fn().mockReturnValue({
          ...mockFolderPermission,
          role: FolderRoleEnum.ORGANIZATION,
          refId: mockOrgId,
        }),
      };

      folderPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([orgPermissionInstance]),
      });

      const result = await service.getSubscriptionReceiversByFolderId(mockFolderId);
      expect(result.orgReceiverIds).toContain('507f1f77bcf86cd799439017');
    });

    it('should get subscription receivers for ORGANIZATION_TEAM role', async () => {
      const teamMember = { userId: new Types.ObjectId('507f1f77bcf86cd799439018') };
      teamService.getAllMembersInTeam.mockResolvedValue([teamMember]);

      const teamPermissionInstance = {
        ...mockFolderPermissionInstance,
        role: FolderRoleEnum.ORGANIZATION_TEAM,
        refId: mockTeamId,
        toObject: jest.fn().mockReturnValue({
          ...mockFolderPermission,
          role: FolderRoleEnum.ORGANIZATION_TEAM,
          refId: mockTeamId,
        }),
      };

      folderPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([teamPermissionInstance]),
      });

      const result = await service.getSubscriptionReceiversByFolderId(mockFolderId);
      expect(result.teamReceiverIds).toContain('507f1f77bcf86cd799439018');
    });

    it('should get subscription receivers for individual role', async () => {
      const ownerPermissionInstance = {
        ...mockFolderPermissionInstance,
        role: FolderRoleEnum.OWNER,
        refId: new Types.ObjectId(mockUserId),
        toObject: jest.fn().mockReturnValue({
          ...mockFolderPermission,
          role: FolderRoleEnum.OWNER,
          refId: new Types.ObjectId(mockUserId),
        }),
      };

      folderPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([ownerPermissionInstance]),
      });

      const result = await service.getSubscriptionReceiversByFolderId(mockFolderId);
      expect(result.individualReceiverIds).toContain(mockUserId);
    });
  });

  describe('createFolder', () => {
    it('should create folder successfully', async () => {
      folderPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      jest.spyOn(service, 'findFolderPath').mockResolvedValue('');
      jest.spyOn(service, 'getFolderDepth').mockReturnValue(0);
      jest.spyOn(service, 'createFolderDocument').mockResolvedValue(mockFolder);
      jest.spyOn(service, 'createFolderPermissionDocument').mockResolvedValue(mockFolderPermission);
      jest.spyOn(service, 'addNewFolderColor').mockResolvedValue(mockUser);
      jest.spyOn(service, 'publishCreateFolderSubscription').mockResolvedValue(undefined);

      const input = {
        ownerId: mockUserId,
        name: 'New Folder',
        color: '#f2385a',
        parentId: null,
      };

      const result = await service.createFolder(input);
      expect(result).toEqual(mockFolder);
    });

    it('should throw error when folder limit reached', async () => {
      const mockPermissions = Array(MAX_NUBMER_FOLDER).fill(mockFolderPermissionInstance);
      folderPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPermissions),
      });

      const input = {
        ownerId: mockUserId,
        name: 'New Folder',
        color: '#f2385a',
      };

      await expect(service.createFolder(input)).rejects.toThrow(
        GraphErrorException.NotAcceptable('Number of folders reaches the limit'),
      );
    });

    it('should throw error when parent folder not found', async () => {
      folderPermissionModel.find
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue([]),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue([]),
        });

      const input = {
        ownerId: mockUserId,
        name: 'New Folder',
        color: '#f2385a',
        parentId: '507f1f77bcf86cd799439016',
      };

      await expect(service.createFolder(input)).rejects.toThrow(
        GraphErrorException.NotFound('Parent folder not found'),
      );
    });

    it('should throw error when depth limit reached', async () => {
      folderPermissionModel.find
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue([]),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue([mockFolderPermissionInstance]),
        });

      jest.spyOn(service, 'findFolderPath').mockResolvedValue(',parent1,parent2,');
      jest.spyOn(service, 'getFolderDepth').mockReturnValue(MAX_DEPTH_LEVEL + 1);

      const input = {
        ownerId: mockUserId,
        name: 'New Folder',
        color: '#f2385a',
        parentId: '507f1f77bcf86cd799439016',
      };

      await expect(service.createFolder(input)).rejects.toThrow(
        GraphErrorException.NotAcceptable('Folder depth reaches the limit'),
      );
    });

    it('should create folder with orgId', async () => {
      folderPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      jest.spyOn(service, 'findFolderPath').mockResolvedValue('');
      jest.spyOn(service, 'getFolderDepth').mockReturnValue(0);
      jest.spyOn(service, 'createFolderDocument').mockResolvedValue(mockFolder);
      jest.spyOn(service, 'createFolderPermissionDocument').mockResolvedValue(mockFolderPermission);
      jest.spyOn(service, 'addNewFolderColor').mockResolvedValue(mockUser);
      jest.spyOn(service, 'publishCreateFolderSubscription').mockResolvedValue(undefined);

      const input = {
        ownerId: mockUserId,
        name: 'New Folder',
        color: '#f2385a',
        orgId: mockOrgId,
      };

      await service.createFolder(input);
      expect(folderPermissionModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          workspace: expect.objectContaining({
            refId: expect.any(Types.ObjectId),
            type: DocumentWorkspace.ORGANIZATION,
          }),
        }),
        undefined,
      );
    });

    it('should create folder with parentId and orgId', async () => {
      folderPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockFolderPermissionInstance]),
      });

      jest.spyOn(service, 'findFolderPath').mockResolvedValue('');
      jest.spyOn(service, 'getFolderDepth').mockReturnValue(0);
      jest.spyOn(service, 'createFolderDocument').mockResolvedValue(mockFolder);
      jest.spyOn(service, 'createFolderPermissionDocument').mockResolvedValue(mockFolderPermission);
      jest.spyOn(service, 'addNewFolderColor').mockResolvedValue(mockUser);
      jest.spyOn(service, 'publishCreateFolderSubscription').mockResolvedValue(undefined);

      const input = {
        ownerId: mockUserId,
        name: 'New Folder',
        color: '#f2385a',
        parentId: '507f1f77bcf86cd799439016',
        orgId: mockOrgId,
      };

      await service.createFolder(input);
      expect(folderPermissionModel.find).toHaveBeenCalledTimes(2);
    });
  });

  describe('addNewFolderColor', () => {
    it('should return null for default color', async () => {
      const result = await service.addNewFolderColor(mockUserId, DEFAULT_FOLDER_COLORS[0]);
      expect(result).toBeNull();
      expect(userService.updateFolderColor).not.toHaveBeenCalled();
    });

    it('should update folder color for non-default color', async () => {
      const result = await service.addNewFolderColor(mockUserId, '#customcolor');
      expect(result).toEqual(mockUser);
      expect(userService.updateFolderColor).toHaveBeenCalledWith(mockUserId, '#customcolor');
    });
  });

  describe('findFolderPath', () => {
    it('should return path when folder found', async () => {
      const folderWithPath = { ...mockFolder, path: null };
      jest.spyOn(service, 'findOneFolder').mockResolvedValue(folderWithPath);
      const result = await service.findFolderPath(mockFolderId);
      expect(result).toBe(`,${mockFolderId},`);
    });

    it('should return empty string when folder not found', async () => {
      jest.spyOn(service, 'findOneFolder').mockResolvedValue(null);
      const result = await service.findFolderPath(mockFolderId);
      expect(result).toBe('');
    });

    it('should return path with existing path', async () => {
      const folderWithPath = { ...mockFolder, path: ',parent1,' };
      jest.spyOn(service, 'findOneFolder').mockResolvedValue(folderWithPath);
      const result = await service.findFolderPath(mockFolderId);
      expect(result).toBe(',parent1,507f1f77bcf86cd799439011,');
    });
  });

  describe('getFolderPath', () => {
    it('should return path with existing path', () => {
      const folderWithPath = { ...mockFolder, path: ',parent1,' };
      const result = service.getFolderPath({ folder: folderWithPath });
      expect(result).toBe(`,parent1,${mockFolderId},`);
    });

    it('should return path without existing path', () => {
      const folderWithoutPath = { ...mockFolder, path: null };
      const result = service.getFolderPath({ folder: folderWithoutPath });
      expect(result).toBe(`,${mockFolderId},`);
    });
  });

  describe('getFolderDepth', () => {
    it('should return 0 when path is null', () => {
      const result = service.getFolderDepth({ path: null });
      expect(result).toBe(0);
    });

    it('should return 0 when path is empty', () => {
      const result = service.getFolderDepth({ path: '' });
      expect(result).toBe(0);
    });

    it('should return correct depth for path', () => {
      const result = service.getFolderDepth({ path: ',id1,id2,id3,' });
      expect(result).toBe(3);
    });
  });

  describe('findFolderPermissionsByCondition', () => {
    it('should find folder permissions by condition', async () => {
      const conditions = { folderId: mockFolderId };
      const result = await service.findFolderPermissionsByCondition(conditions);
      expect(result).toEqual([mockFolderPermission]);
      expect(folderPermissionModel.find).toHaveBeenCalledWith(conditions, undefined);
    });

    it('should find folder permissions with projection', async () => {
      const conditions = { folderId: mockFolderId };
      const projection = { role: 1 };
      await service.findFolderPermissionsByCondition(conditions, projection);
      expect(folderPermissionModel.find).toHaveBeenCalledWith(conditions, projection);
    });
  });

  describe('getBreadCrumbs', () => {
    it('should return breadcrumbs', async () => {
      jest.spyOn(service, 'findOneFolder').mockResolvedValue(mockFolder);
      jest.spyOn(service, 'findFolderByIds').mockResolvedValue([mockFolder]);

      const result = await service.getBreadCrumbs(mockFolderId);
      expect(result).toEqual([{
        _id: mockFolderId,
        name: mockFolder.name,
        listUserStar: mockFolder.listUserStar,
      }]);
    });

    it('should return empty array when folder not found', async () => {
      jest.spyOn(service, 'findOneFolder').mockResolvedValue(null);

      const result = await service.getBreadCrumbs(mockFolderId);
      expect(result).toEqual([]);
    });

    it('should return breadcrumbs with path', async () => {
      const folderWithPath = {
        ...mockFolder,
        path: ',parent1,parent2,',
      };
      const parent1 = { ...mockFolder, _id: 'parent1', name: 'Parent 1' };
      const parent2 = { ...mockFolder, _id: 'parent2', name: 'Parent 2' };

      jest.spyOn(service, 'findOneFolder').mockResolvedValue(folderWithPath);
      jest.spyOn(service, 'findFolderByIds').mockResolvedValue([parent1, parent2, mockFolder]);

      const result = await service.getBreadCrumbs(mockFolderId);
      expect(result).toHaveLength(3);
    });
  });

  describe('getBelongsTo', () => {
    it('should return belongsTo for OWNER role', async () => {
      const ownerPermissionInstance = {
        ...mockFolderPermissionInstance,
        role: FolderRoleEnum.OWNER,
        toObject: jest.fn().mockReturnValue({
          ...mockFolderPermission,
          role: FolderRoleEnum.OWNER,
        }),
      };

      folderPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([ownerPermissionInstance]),
      });

      const result = await service.getBelongsTo(mockFolderId);
      expect(result).toEqual({
        folderId: mockFolderId,
        type: LocationType.PERSONAL,
        location: {
          _id: mockUserId,
          name: 'Test User',
        },
        workspaceId: undefined,
      });
    });

    it('should return belongsTo for ORGANIZATION role', async () => {
      const orgPermissionInstance = {
        ...mockFolderPermissionInstance,
        role: FolderRoleEnum.ORGANIZATION,
        refId: mockOrgId,
        toObject: jest.fn().mockReturnValue({
          ...mockFolderPermission,
          role: FolderRoleEnum.ORGANIZATION,
          refId: mockOrgId,
        }),
      };

      folderPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([orgPermissionInstance]),
      });

      const result = await service.getBelongsTo(mockFolderId);
      expect(result).toEqual({
        folderId: mockFolderId,
        type: LocationType.ORGANIZATION,
        location: {
          _id: mockOrgId,
          name: 'Test Organization',
        },
      });
    });

    it('should return belongsTo for ORGANIZATION_TEAM role', async () => {
      const teamPermissionInstance = {
        ...mockFolderPermissionInstance,
        role: FolderRoleEnum.ORGANIZATION_TEAM,
        refId: mockTeamId,
        toObject: jest.fn().mockReturnValue({
          ...mockFolderPermission,
          role: FolderRoleEnum.ORGANIZATION_TEAM,
          refId: mockTeamId,
        }),
      };

      folderPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([teamPermissionInstance]),
      });

      const result = await service.getBelongsTo(mockFolderId);
      expect(result).toEqual({
        folderId: mockFolderId,
        type: LocationType.ORGANIZATION_TEAM,
        location: {
          _id: mockTeamId,
          name: 'Test Team',
        },
      });
    });

    it('should return null when no permissions found', async () => {
      folderPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getBelongsTo(mockFolderId);
      expect(result).toBeNull();
    });
  });

  describe('getBelongsToByFolderPermission', () => {
    it('should return belongsTo for OWNER role', async () => {
      const permission = {
        ...mockFolderPermission,
        role: FolderRoleEnum.OWNER,
        workspace: { refId: mockOrgId },
      };

      const result = await service.getBelongsToByFolderPermission(permission as any);
      expect(result).toEqual({
        folderId: mockFolderId,
        type: LocationType.PERSONAL,
        location: {
          _id: mockUserId,
          name: 'Test User',
        },
        workspaceId: mockOrgId,
      });
    });

    it('should return belongsTo for ORGANIZATION role', async () => {
      const permission = {
        ...mockFolderPermission,
        role: FolderRoleEnum.ORGANIZATION,
        refId: mockOrgId,
      };

      const result = await service.getBelongsToByFolderPermission(permission);
      expect(result).toEqual({
        folderId: mockFolderId,
        type: LocationType.ORGANIZATION,
        location: {
          _id: mockOrgId,
          name: 'Test Organization',
        },
      });
    });

    it('should return belongsTo for ORGANIZATION_TEAM role', async () => {
      const permission = {
        ...mockFolderPermission,
        role: FolderRoleEnum.ORGANIZATION_TEAM,
        refId: mockTeamId,
      };

      const result = await service.getBelongsToByFolderPermission(permission);
      expect(result).toEqual({
        folderId: mockFolderId,
        type: LocationType.ORGANIZATION_TEAM,
        location: {
          _id: mockTeamId,
          name: 'Test Team',
        },
      });
    });

    it('should return null for default case', async () => {
      const permission = {
        ...mockFolderPermission,
        role: FolderRoleEnum.VIEWER,
      };

      const result = await service.getBelongsToByFolderPermission(permission);
      expect(result).toBeNull();
    });
  });

  describe('getBelongsToFromLoaders', () => {
    it('should return belongsTo for OWNER role from loaders', async () => {
      const loaders = {
        folderPermissionsLoader: {
          load: jest.fn().mockResolvedValue([{
            ...mockFolderPermission,
            role: FolderRoleEnum.OWNER,
            workspace: { refId: mockOrgId },
          }]),
        },
        usersLoader: {
          load: jest.fn().mockResolvedValue(mockUser),
        },
      };

      const result = await service.getBelongsToFromLoaders({
        folderId: mockFolderId,
        loaders: loaders as any,
      });

      expect(result).toEqual({
        type: LocationType.PERSONAL,
        location: {
          _id: mockUserId,
          name: 'Test User',
        },
        workspaceId: mockOrgId,
      });
    });

    it('should return belongsTo for ORGANIZATION role from loaders', async () => {
      const loaders = {
        folderPermissionsLoader: {
          load: jest.fn().mockResolvedValue([{
            ...mockFolderPermission,
            role: FolderRoleEnum.ORGANIZATION,
            refId: mockOrgId,
          }]),
        },
        organizationLoader: {
          load: jest.fn().mockResolvedValue(mockOrganization),
        },
      };

      const result = await service.getBelongsToFromLoaders({
        folderId: mockFolderId,
        loaders: loaders as any,
      });

      expect(result).toEqual({
        type: LocationType.ORGANIZATION,
        location: {
          _id: mockOrgId,
          name: 'Test Organization',
        },
      });
    });

    it('should return belongsTo for ORGANIZATION_TEAM role from loaders', async () => {
      const loaders = {
        folderPermissionsLoader: {
          load: jest.fn().mockResolvedValue([{
            ...mockFolderPermission,
            role: FolderRoleEnum.ORGANIZATION_TEAM,
            refId: mockTeamId,
          }]),
        },
        teamLoader: {
          load: jest.fn().mockResolvedValue(mockTeam),
        },
      };

      const result = await service.getBelongsToFromLoaders({
        folderId: mockFolderId,
        loaders: loaders as any,
      });

      expect(result).toEqual({
        type: LocationType.ORGANIZATION_TEAM,
        location: {
          _id: mockTeamId,
          name: 'Test Team',
        },
      });
    });

    it('should return null when no permissions found', async () => {
      const loaders = {
        folderPermissionsLoader: {
          load: jest.fn().mockResolvedValue([]),
        },
      };

      const result = await service.getBelongsToFromLoaders({
        folderId: mockFolderId,
        loaders: loaders as any,
      });

      expect(result).toBeNull();
    });

    it('should return null for default case', async () => {
      const loaders = {
        folderPermissionsLoader: {
          load: jest.fn().mockResolvedValue([{
            ...mockFolderPermission,
            role: FolderRoleEnum.VIEWER,
          }]),
        },
      };

      const result = await service.getBelongsToFromLoaders({
        folderId: mockFolderId,
        loaders: loaders as any,
      });

      expect(result).toBeNull();
    });
  });

  describe('getPersonalFolders', () => {
    it('should return personal folders', async () => {
      folderPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockFolderPermissionInstance]),
      });

      organizationService.getFolderListByPermission.mockResolvedValue([mockFolder]);

      const params = {
        userId: mockUserId,
        sortOptions: {},
        isStarredTab: false,
      };

      const result = await service.getPersonalFolders(params);
      expect(result).toEqual([mockFolder]);
    });

    it('should return empty array when no permissions', async () => {
      folderPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const params = {
        userId: mockUserId,
        sortOptions: {},
        isStarredTab: false,
      };

      const result = await service.getPersonalFolders(params);
      expect(result).toEqual([]);
    });
  });

  describe('getPersonalFolderTree', () => {
    it('should return personal folder tree', async () => {
      folderPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockFolderPermissionInstance]),
      });

      jest.spyOn(service, 'findFoldersByConditions').mockResolvedValue([mockFolder]);
      jest.spyOn(service, 'buildChildrenTree').mockReturnValue([]);

      const result = await service.getPersonalFolderTree({ userId: mockUserId });
      expect(result).toEqual({ children: [] });
    });

    it('should return empty children when no permissions', async () => {
      folderPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getPersonalFolderTree({ userId: mockUserId });
      expect(result).toEqual({ children: [] });
    });
  });

  describe('countFolders', () => {
    it('should count folders', async () => {
      folderPermissionModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const conditions = { refId: mockUserId };
      const result = await service.countFolders(conditions);
      expect(result).toBe(5);
      expect(folderPermissionModel.countDocuments).toHaveBeenCalledWith(conditions);
    });
  });

  describe('publishUpdateFolderSubscription', () => {
    it('should publish update folder subscription', () => {
      const data = {
        receiverList: [mockUserId],
        folder: mockFolder as any,
        subscriptionEvent: SUB_UPDATE_FOLDER_INFO_EVENT,
      };

      service.publishUpdateFolderSubscription(data);

      expect(pubSub.publish).toHaveBeenCalledWith(
        `${SUBSCRIPTION_UPDATE_FOLDER}.${mockUserId}`,
        expect.objectContaining({
          [SUBSCRIPTION_UPDATE_FOLDER]: expect.objectContaining({
            folder: mockFolder,
            userId: mockUserId,
            subscriptionEvent: SUB_UPDATE_FOLDER_INFO_EVENT,
          }),
        }),
      );
    });

    it('should publish with folders array', () => {
      const data = {
        receiverList: [mockUserId],
        folder: mockFolder as any,
        folders: [mockFolder] as any[],
        subscriptionEvent: SUB_UPDATE_FOLDER_INFO_EVENT,
        actorId: mockUserId,
      };

      service.publishUpdateFolderSubscription(data);

      expect(pubSub.publish).toHaveBeenCalledWith(
        `${SUBSCRIPTION_UPDATE_FOLDER}.${mockUserId}`,
        expect.objectContaining({
          [SUBSCRIPTION_UPDATE_FOLDER]: expect.objectContaining({
            folders: [mockFolder],
            actorId: mockUserId,
          }),
        }),
      );
    });
  });

  describe('publishDeleteFolderSubscription', () => {
    it('should publish delete folder subscription', () => {
      service.publishDeleteFolderSubscription(mockUserId, mockOrgId, 5);

      expect(pubSub.publish).toHaveBeenCalledWith(
        `${SUBSCRIPTION_FOLDER_EVENT}.${mockUserId}`,
        expect.objectContaining({
          folderEventSubscription: {
            workspaceId: mockOrgId,
            eventType: SUB_DELETE_FOLDER_EVENT,
            total: 5,
          },
        }),
      );
    });
  });

  describe('updateFolderInfo', () => {
    it('should update folder info', async () => {
      jest.spyOn(service, 'addNewFolderColor').mockResolvedValue(mockUser);
      jest.spyOn(service, 'findOneAndUpdateFolder').mockResolvedValue(mockFolder);
      jest.spyOn(service, 'getSubscriptionReceiversByFolderId').mockResolvedValue({
        allReceiverIds: [mockUserId],
        individualReceiverIds: [],
        teamReceiverIds: [],
        orgReceiverIds: [],
      });
      jest.spyOn(service, 'publishUpdateFolderSubscription').mockImplementation(() => { });

      const params = {
        userId: mockUserId,
        folderId: mockFolderId,
        updateProperties: { name: 'Updated Folder' },
      };

      const result = await service.updateFolderInfo(params);
      expect(result).toEqual(mockFolder);
    });

    it('should throw error when updateProperties is empty', async () => {
      const params = {
        userId: mockUserId,
        folderId: mockFolderId,
        updateProperties: {},
      };

      await expect(service.updateFolderInfo(params)).rejects.toThrow(
        GraphErrorException.NotAcceptable('Update Properties must not be empty'),
      );
    });

    it('should update folder color', async () => {
      jest.spyOn(service, 'addNewFolderColor').mockResolvedValue(mockUser);
      jest.spyOn(service, 'findOneAndUpdateFolder').mockResolvedValue(mockFolder);
      jest.spyOn(service, 'getSubscriptionReceiversByFolderId').mockResolvedValue({
        allReceiverIds: [mockUserId],
        individualReceiverIds: [],
        teamReceiverIds: [],
        orgReceiverIds: [],
      });
      jest.spyOn(service, 'publishUpdateFolderSubscription').mockImplementation(() => { });

      const params = {
        userId: mockUserId,
        folderId: mockFolderId,
        updateProperties: { color: '#newcolor' },
      };

      await service.updateFolderInfo(params);
      expect(service.addNewFolderColor).toHaveBeenCalledWith(mockUserId, '#newcolor');
    });
  });

  describe('starFolder', () => {
    it('should star folder', async () => {
      const folderWithoutStar = { ...mockFolder, listUserStar: [] };
      jest.spyOn(service, 'findOneFolder').mockResolvedValue(folderWithoutStar as any);
      jest.spyOn(service, 'findOneAndUpdateFolder').mockResolvedValue({
        ...mockFolder,
        listUserStar: [mockUserId],
      });
      jest.spyOn(service, 'publishUpdateFolderSubscription').mockImplementation(() => { });

      const result = await service.starFolder(mockUserId, mockFolderId);
      expect(result.listUserStar).toContain(mockUserId);
      expect(service.findOneAndUpdateFolder).toHaveBeenCalledWith(mockFolderId, {
        $push: { listUserStar: mockUserId },
      });
    });

    it('should unstar folder', async () => {
      const folderWithStar = { ...mockFolder, listUserStar: [mockUserId] };
      jest.spyOn(service, 'findOneFolder').mockResolvedValue(folderWithStar as any);
      jest.spyOn(service, 'findOneAndUpdateFolder').mockResolvedValue({
        ...mockFolder,
        listUserStar: [],
      } as any);
      jest.spyOn(service, 'publishUpdateFolderSubscription').mockImplementation(() => { });

      const result = await service.starFolder(mockUserId, mockFolderId);
      expect(result.listUserStar).not.toContain(mockUserId);
      expect(service.findOneAndUpdateFolder).toHaveBeenCalledWith(mockFolderId, {
        $pull: { listUserStar: mockUserId },
      });
    });

    it('should throw error when folder not found', async () => {
      jest.spyOn(service, 'findOneFolder').mockResolvedValue(null);

      await expect(service.starFolder(mockUserId, mockFolderId)).rejects.toThrow(
        GraphErrorException.NotFound('Folder not found'),
      );
    });
  });

  describe('sendNotiForDeleteFolder', () => {
    it('should send notification for ORGANIZATION folder', async () => {
      const notiFolderFactory = require('Common/factory/NotiFactory').notiFolderFactory;
      const notiFirebaseFolderFactory = require('Common/factory/NotiFirebaseFactory').notiFirebaseFolderFactory;

      notiFolderFactory.create.mockReturnValue({});
      notiFirebaseFolderFactory.create.mockReturnValue({
        notificationContent: {},
        notificationData: {},
      });

      const data = {
        type: FolderTypeEnum.ORGANIZATION,
        actorId: mockUserId,
        clientId: mockOrgId,
        folder: mockFolder,
      };

      await service.sendNotiForDeleteFolder(data);

      expect(organizationService.publishNotiToAllOrgMember).toHaveBeenCalled();
      expect(organizationService.publishFirebaseNotiToAllOrgMember).toHaveBeenCalled();
    });

    it('should return early when organization not found', async () => {
      organizationService.getOrgById.mockResolvedValue(null);

      const data = {
        type: FolderTypeEnum.ORGANIZATION,
        actorId: mockUserId,
        clientId: mockOrgId,
        folder: mockFolder,
      };

      await service.sendNotiForDeleteFolder(data);

      expect(organizationService.publishNotiToAllOrgMember).not.toHaveBeenCalled();
    });

    it('should send notification for ORGANIZATION_TEAM folder', async () => {
      const notiFolderFactory = require('Common/factory/NotiFactory').notiFolderFactory;
      const notiFirebaseFolderFactory = require('Common/factory/NotiFirebaseFactory').notiFirebaseFolderFactory;

      notiFolderFactory.create.mockReturnValue({});
      notiFirebaseFolderFactory.create.mockReturnValue({
        notificationContent: {},
        notificationData: {},
      });

      const data = {
        type: FolderTypeEnum.ORGANIZATION_TEAM,
        actorId: mockUserId,
        clientId: mockTeamId,
        folder: mockFolder,
      };

      await service.sendNotiForDeleteFolder(data);

      expect(membershipService.publishNotiToAllTeamMember).toHaveBeenCalled();
      expect(organizationService.publishFirebaseNotiToAllTeamMember).toHaveBeenCalled();
    });

    it('should return early when team not found', async () => {
      organizationTeamService.getOrgTeamById.mockResolvedValue(null);

      const data = {
        type: FolderTypeEnum.ORGANIZATION_TEAM,
        actorId: mockUserId,
        clientId: mockTeamId,
        folder: mockFolder,
      };

      await service.sendNotiForDeleteFolder(data);

      expect(membershipService.publishNotiToAllTeamMember).not.toHaveBeenCalled();
    });

    it('should not send notification for PERSONAL folder', async () => {
      const data = {
        type: FolderTypeEnum.PERSONAL,
        actorId: mockUserId,
        clientId: mockUserId,
        folder: mockFolder,
      };

      await service.sendNotiForDeleteFolder(data);

      expect(organizationService.publishNotiToAllOrgMember).not.toHaveBeenCalled();
      expect(membershipService.publishNotiToAllTeamMember).not.toHaveBeenCalled();
    });
  });

  describe('deleteAllDocumentsInFolder', () => {
    it('should delete documents for ORGANIZATION folder', async () => {
      const mockDocuments = [{ _id: 'doc1' }, { _id: 'doc2' }] as any[];
      documentService.findDocumentsByFolderId.mockResolvedValue(mockDocuments);
      organizationService.getMembersByOrgId.mockResolvedValue([
        { userId: new Types.ObjectId('507f1f77bcf86cd799439017') },
      ]);

      const data = {
        folderId: mockFolderId,
        clientId: mockOrgId,
        type: FolderTypeEnum.ORGANIZATION,
        actorId: mockUserId,
      };

      await service.deleteAllDocumentsInFolder(data);

      expect(documentService.publishEventDeleteDocumentToInternal).toHaveBeenCalled();
    });

    it('should delete documents for ORGANIZATION_TEAM folder', async () => {
      const mockDocuments = [{ _id: 'doc1' }] as any[];
      documentService.findDocumentsByFolderId.mockResolvedValue(mockDocuments);
      teamService.getAllMembersInTeam.mockResolvedValue([
        { userId: new Types.ObjectId('507f1f77bcf86cd799439017') },
      ]);

      const data = {
        folderId: mockFolderId,
        clientId: mockTeamId,
        type: FolderTypeEnum.ORGANIZATION_TEAM,
        actorId: mockUserId,
      };

      await service.deleteAllDocumentsInFolder(data);

      expect(documentService.publishEventDeleteDocumentToInternal).toHaveBeenCalled();
    });

    it('should delete documents for PERSONAL folder', async () => {
      const mockDocuments = [{ _id: 'doc1' }] as any[];
      documentService.findDocumentsByFolderId.mockResolvedValue(mockDocuments);
      documentService.getDocumentPermission.mockResolvedValue([]);

      const data = {
        folderId: mockFolderId,
        clientId: mockUserId,
        type: FolderTypeEnum.PERSONAL,
        actorId: mockUserId,
      };

      await service.deleteAllDocumentsInFolder(data);

      expect(documentService.deleteDocumentsInPersonal).toHaveBeenCalled();
    });

    it('should return early when no documents', async () => {
      documentService.findDocumentsByFolderId.mockResolvedValue([]);

      const data = {
        folderId: mockFolderId,
        clientId: mockOrgId,
        type: FolderTypeEnum.ORGANIZATION,
        actorId: mockUserId,
      };

      await service.deleteAllDocumentsInFolder(data);

      expect(documentService.publishEventDeleteDocumentToInternal).not.toHaveBeenCalled();
    });

    it('should handle external document permissions for org/team folders', async () => {
      const mockDocuments = [{ _id: 'doc1' }] as any[];
      documentService.findDocumentsByFolderId.mockResolvedValue(mockDocuments);
      organizationService.getMembersByOrgId.mockResolvedValue([
        { userId: new Types.ObjectId('507f1f77bcf86cd799439017') },
      ]);
      documentService.getSharedIdsOfDocuments.mockResolvedValue([
        { document: mockDocuments[0], userIds: ['user1', 'user2'] },
      ]);

      const data = {
        folderId: mockFolderId,
        clientId: mockOrgId,
        type: FolderTypeEnum.ORGANIZATION,
        actorId: mockUserId,
      };

      await service.deleteAllDocumentsInFolder(data);

      expect(documentService.notifyDeleteDocumentToShared).toHaveBeenCalled();
      expect(documentService.publishEventDeleteDocumentToExternal).toHaveBeenCalled();
      expect(documentService.deleteManyOriginalDocument).toHaveBeenCalled();
    });
  });

  describe('deleteFolder', () => {
    it('should delete folder successfully', async () => {
      jest.spyOn(service, 'getSubscriptionReceiversByFolderId').mockResolvedValue({
        allReceiverIds: [mockUserId],
        individualReceiverIds: [],
        teamReceiverIds: [],
        orgReceiverIds: [],
      });
      jest.spyOn(service, 'findOneFolderPermission').mockResolvedValue(mockFolderPermission);
      jest.spyOn(service, 'getBelongsTo').mockResolvedValue({
        folderId: mockFolderId,
        type: LocationType.PERSONAL,
        location: { _id: mockUserId, name: 'Test User' },
        workspaceId: null,
      });
      jest.spyOn(service, 'deleteDescendantFolders').mockResolvedValue([]);
      jest.spyOn(service, 'deleteById').mockResolvedValue(mockFolder);
      jest.spyOn(service, 'deletePermissionsByFolderId').mockResolvedValue(mockFolderPermission);
      jest.spyOn(service, 'deleteAllDocumentsInFolder').mockResolvedValue(undefined);
      jest.spyOn(service, 'sendNotiForDeleteFolder').mockResolvedValue(undefined);
      jest.spyOn(service, 'publishUpdateFolderSubscription').mockImplementation(() => { });
      jest.spyOn(service, 'publishDeleteFolderSubscription').mockImplementation(() => { });

      const result = await service.deleteFolder({
        actorId: mockUserId,
        folderId: mockFolderId,
      });

      expect(result).toEqual(mockFolder);
    });

    it('should send notification when isNotify is true', async () => {
      jest.spyOn(service, 'getSubscriptionReceiversByFolderId').mockResolvedValue({
        allReceiverIds: [mockUserId],
        individualReceiverIds: [],
        teamReceiverIds: [],
        orgReceiverIds: [],
      });
      const orgPermission = {
        ...mockFolderPermission,
        role: FolderRoleEnum.ORGANIZATION,
      };
      jest.spyOn(service, 'findOneFolderPermission').mockResolvedValue(orgPermission);
      jest.spyOn(service, 'getBelongsTo').mockResolvedValue({
        folderId: mockFolderId,
        type: LocationType.ORGANIZATION,
        location: { _id: mockOrgId, name: 'Test Org' },
        workspaceId: mockOrgId,
      });
      jest.spyOn(service, 'deleteDescendantFolders').mockResolvedValue([]);
      jest.spyOn(service, 'deleteById').mockResolvedValue(mockFolder);
      jest.spyOn(service, 'deletePermissionsByFolderId').mockResolvedValue(orgPermission);
      jest.spyOn(service, 'deleteAllDocumentsInFolder').mockResolvedValue(undefined);
      jest.spyOn(service, 'sendNotiForDeleteFolder').mockResolvedValue(undefined);
      jest.spyOn(service, 'publishUpdateFolderSubscription').mockImplementation(() => { });
      jest.spyOn(service, 'publishDeleteFolderSubscription').mockImplementation(() => { });

      await service.deleteFolder({
        actorId: mockUserId,
        folderId: mockFolderId,
        isNotify: true,
      });

      expect(service.sendNotiForDeleteFolder).toHaveBeenCalled();
    });

    it('should not send notification for ORGANIZATION role when isNotify is false', async () => {
      jest.spyOn(service, 'getSubscriptionReceiversByFolderId').mockResolvedValue({
        allReceiverIds: [mockUserId],
        individualReceiverIds: [],
        teamReceiverIds: [],
        orgReceiverIds: [],
      });
      const orgPermission = {
        ...mockFolderPermission,
        role: FolderRoleEnum.ORGANIZATION,
      };
      jest.spyOn(service, 'findOneFolderPermission').mockResolvedValue(orgPermission);
      jest.spyOn(service, 'getBelongsTo').mockResolvedValue({
        folderId: mockFolderId,
        type: LocationType.ORGANIZATION,
        location: { _id: mockOrgId, name: 'Test Org' },
        workspaceId: mockOrgId,
      });
      jest.spyOn(service, 'deleteDescendantFolders').mockResolvedValue([]);
      jest.spyOn(service, 'deleteById').mockResolvedValue(mockFolder);
      jest.spyOn(service, 'deletePermissionsByFolderId').mockResolvedValue(orgPermission);
      jest.spyOn(service, 'deleteAllDocumentsInFolder').mockResolvedValue(undefined);
      jest.spyOn(service, 'sendNotiForDeleteFolder').mockResolvedValue(undefined);
      jest.spyOn(service, 'publishUpdateFolderSubscription').mockImplementation(() => { });
      jest.spyOn(service, 'publishDeleteFolderSubscription').mockImplementation(() => { });

      await service.deleteFolder({
        actorId: mockUserId,
        folderId: mockFolderId,
        isNotify: false,
      });

      expect(service.sendNotiForDeleteFolder).not.toHaveBeenCalled();
    });
  });

  describe('getFoldersInOrgOrTeam', () => {
    it('should get folders in org or team', async () => {
      folderPermissionModel.aggregate.mockResolvedValue([mockFolder]);

      const result = await service.getFoldersInOrgOrTeam(mockOrgId);
      expect(result).toEqual([mockFolder]);
      expect(folderPermissionModel.aggregate).toHaveBeenCalled();
    });
  });

  describe('getDocuments', () => {
    it('should get documents in folder', async () => {
      jest.spyOn(service, 'findFolderPath').mockResolvedValue('');
      folderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const mockDocumentQuery = {
        of: jest.fn().mockReturnThis(),
        injectPremiumMap: jest.fn().mockReturnThis(),
        getDocuments: jest.fn().mockResolvedValue({ documents: [], cursor: null }),
      };

      const FolderDocumentQuery = require('Common/template-methods/DocumentQuery/folder-document-query').FolderDocumentQuery;
      FolderDocumentQuery.mockImplementation(() => mockDocumentQuery);

      const FolderDocumentFilter = require('Common/builder/DocumentFilterBuilder').FolderDocumentFilter;
      FolderDocumentFilter.mockImplementation(() => ({
        of: jest.fn().mockReturnThis(),
        addCursor: jest.fn().mockReturnThis(),
        addSearch: jest.fn().mockReturnThis(),
        addFilter: jest.fn().mockReturnThis(),
        addFolders: jest.fn().mockReturnThis(),
        build: jest.fn().mockResolvedValue({}),
      }));

      const FolderDocumentPremiumMap = require('Common/template-methods/DocumentPremiumMap').FolderDocumentPremiumMap;
      FolderDocumentPremiumMap.mockImplementation(() => ({
        atFolder: jest.fn().mockReturnThis(),
      }));

      const params = {
        user: mockUser,
        query: { cursor: null },
        filter: {
          ownedFilterCondition: {},
          lastModifiedFilterCondition: {},
        },
        folderId: mockFolderId,
      };

      const result = await service.getDocuments(params as any);
      expect(result).toEqual({ documents: [], cursor: null });
    });

    it('should include descendant folders when searchKey provided', async () => {
      jest.spyOn(service, 'findFolderPath').mockResolvedValue(`,${mockFolderId},`);
      const descendantFolder = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439019'),
        toHexString: jest.fn().mockReturnValue('507f1f77bcf86cd799439019'),
      };
      folderModel.find.mockResolvedValue([descendantFolder]);

      const mockDocumentQuery = {
        of: jest.fn().mockReturnThis(),
        injectPremiumMap: jest.fn().mockReturnThis(),
        getDocuments: jest.fn().mockResolvedValue({ documents: [], cursor: null }),
      };

      const FolderDocumentQuery = require('Common/template-methods/DocumentQuery/folder-document-query').FolderDocumentQuery;
      FolderDocumentQuery.mockImplementation(() => mockDocumentQuery);

      const FolderDocumentFilter = require('Common/builder/DocumentFilterBuilder').FolderDocumentFilter;
      FolderDocumentFilter.mockImplementation(() => ({
        of: jest.fn().mockReturnThis(),
        addCursor: jest.fn().mockReturnThis(),
        addSearch: jest.fn().mockReturnThis(),
        addFilter: jest.fn().mockReturnThis(),
        addFolders: jest.fn().mockReturnThis(),
        build: jest.fn().mockResolvedValue({}),
      }));

      const FolderDocumentPremiumMap = require('Common/template-methods/DocumentPremiumMap').FolderDocumentPremiumMap;
      FolderDocumentPremiumMap.mockImplementation(() => ({
        atFolder: jest.fn().mockReturnThis(),
      }));

      const params = {
        user: mockUser,
        query: { cursor: null, searchKey: 'test' },
        filter: {
          ownedFilterCondition: {},
          lastModifiedFilterCondition: {},
        },
        folderId: mockFolderId,
      };

      await service.getDocuments(params as any);
      expect(folderModel.find).toHaveBeenCalledWith({
        path: { $regex: `^,${mockFolderId},` },
      });
    });
  });

  describe('getFoldersInFolder', () => {
    it('should get folders in folder without searchKey', async () => {
      jest.spyOn(service, 'findFolderPath').mockResolvedValue('');
      jest.spyOn(service, 'getFolderDepth').mockReturnValue(0);
      jest.spyOn(service, 'getBelongsTo').mockResolvedValue({
        folderId: mockFolderId,
        type: LocationType.PERSONAL,
        location: { _id: mockUserId, name: 'Test User' },
        workspaceId: null,
      });
      jest.spyOn(service, 'findFoldersByConditions').mockResolvedValue([mockFolder]);

      const input = {
        folderId: mockFolderId,
        searchKey: null,
        sortOptions: null,
      };

      const result = await service.getFoldersInFolder(input);
      expect(result).toEqual([{
        ...mockFolder,
        belongsTo: expect.objectContaining({ folderId: mockFolderId }),
      }]);
    });

    it('should get folders in folder with searchKey', async () => {
      jest.spyOn(service, 'findFolderPath').mockResolvedValue(`,parent,`);
      jest.spyOn(service, 'getFolderDepth').mockReturnValue(1);
      jest.spyOn(service, 'getBelongsTo').mockResolvedValue({
        folderId: mockFolderId,
        type: LocationType.PERSONAL,
        location: { _id: mockUserId, name: 'Test User' },
        workspaceId: null,
      });
      jest.spyOn(service, 'findFoldersByConditions').mockResolvedValue([mockFolder]);

      const input = {
        folderId: mockFolderId,
        searchKey: 'test',
        sortOptions: { createdAt: 'DESC' },
      };

      await service.getFoldersInFolder(input as any);
      expect(service.findFoldersByConditions).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { $regex: `^,parent,` },
          depth: { $gte: 1 },
          name: expect.objectContaining({ $regex: expect.any(RegExp) }),
        }),
        null,
        expect.objectContaining({ sort: expect.anything() }),
      );
    });
  });

  describe('getFolderTree', () => {
    it('should get folder tree', async () => {
      jest.spyOn(service, 'findOneFolder').mockResolvedValue(mockFolder);
      jest.spyOn(service, 'getFolderPath').mockReturnValue(`,${mockFolderId},`);
      folderModel.find.mockResolvedValue([]);
      jest.spyOn(service, 'buildFolderTree').mockReturnValue(mockFolder as any);

      const result = await service.getFolderTree({ folderId: mockFolderId });
      expect(result).toEqual(mockFolder);
    });

    it('should throw error when folder not found', async () => {
      jest.spyOn(service, 'findOneFolder').mockResolvedValue(null);

      await expect(service.getFolderTree({ folderId: mockFolderId })).rejects.toThrow(
        GraphErrorException.NotFound('Folder not found'),
      );
    });
  });

  describe('buildFolderTree', () => {
    it('should build folder tree', () => {
      const parentFolder = { ...mockFolder, parentId: null };
      const childFolder = {
        ...mockFolder,
        _id: 'child1',
        parentId: mockFolderId,
      };
      const folders = [childFolder];

      const result = service.buildFolderTree({
        parentFolder,
        folders,
      });

      expect(result._id).toBe(mockFolderId);
      expect(result.folders).toHaveLength(1);
      expect(result.folders[0]._id).toBe('child1');
    });

    it('should build folder tree with multiple levels', () => {
      const parentFolder = { ...mockFolder, parentId: null };
      const child1 = {
        ...mockFolder,
        _id: 'child1',
        parentId: mockFolderId,
      };
      const child2 = {
        ...mockFolder,
        _id: 'child2',
        parentId: 'child1',
      };
      const folders = [child1, child2];

      const result = service.buildFolderTree({
        parentFolder,
        folders,
      });

      expect(result.folders).toHaveLength(1);
    });
  });

  describe('buildChildrenTree', () => {
    it('should return empty array when no folders', () => {
      const result = service.buildChildrenTree({ folders: [] });
      expect(result).toEqual([]);
    });

    it('should build children tree', () => {
      const folders = [
        { ...mockFolder, _id: 'root1', parentId: null },
        { ...mockFolder, _id: 'child1', parentId: 'root1' },
        { ...mockFolder, _id: 'root2', parentId: null },
      ];

      const result = service.buildChildrenTree({ folders });
      expect(result).toHaveLength(2);
      expect(result[0].children).toHaveLength(1);
    });
  });

  describe('getResourceByFolderPermission', () => {
    it('should return user for OWNER role', async () => {
      const permission = {
        ...mockFolderPermission,
        role: FolderRoleEnum.OWNER,
      };

      const result = await service.getResourceByFolderPermission(permission);
      expect(result).toEqual(mockUser);
    });

    it('should return organization for ORGANIZATION role', async () => {
      const permission = {
        ...mockFolderPermission,
        role: FolderRoleEnum.ORGANIZATION,
        refId: mockOrgId,
      };

      const result = await service.getResourceByFolderPermission(permission);
      expect(result).toEqual(mockOrganization);
    });

    it('should return organization for ORGANIZATION_TEAM role', async () => {
      const permission = {
        ...mockFolderPermission,
        role: FolderRoleEnum.ORGANIZATION_TEAM,
        refId: mockTeamId,
      };

      const result = await service.getResourceByFolderPermission(permission);
      expect(result).toEqual(mockOrganization);
    });

    it('should return null for default case', async () => {
      const permission = {
        ...mockFolderPermission,
        role: FolderRoleEnum.VIEWER,
      };

      const result = await service.getResourceByFolderPermission(permission);
      expect(result).toBeNull();
    });
  });

  describe('migrateFoldersToOrgPersonal', () => {
    it('should migrate folders to org personal', async () => {
      folderPermissionModel.updateMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 5 }),
      });

      const result = await service.migrateFoldersToOrgPersonal(mockUserId, mockOrgId);
      expect(result).toBe(5);
      expect(folderPermissionModel.updateMany).toHaveBeenCalled();
    });
  });

  describe('removeAllPersonalFolderInOrg', () => {
    it('should remove all personal folders in org', async () => {
      jest.spyOn(service, 'getTopLevelFolder').mockResolvedValue([mockFolder]);
      jest.spyOn(service, 'deleteFolder').mockResolvedValue(mockFolder);

      await service.removeAllPersonalFolderInOrg({
        user: mockUser,
        orgId: mockOrgId,
      });

      expect(service.deleteFolder).toHaveBeenCalled();
    });
  });

  describe('deleteAllFoldersInOrgWorkspace', () => {
    it('should delete all folders in org workspace', async () => {
      jest.spyOn(service, 'getFolderPermissions').mockResolvedValue([mockFolderPermission]);
      jest.spyOn(service, 'deleteManyFolders').mockResolvedValue({ deletedCount: 1 } as any);
      jest.spyOn(service, 'deleteManyFolderPermissions').mockResolvedValue({ deletedCount: 1 } as any);

      await service.deleteAllFoldersInOrgWorkspace({
        orgId: mockOrgId,
        orgTeams: [mockTeam],
      });

      expect(service.deleteManyFolders).toHaveBeenCalled();
      expect(service.deleteManyFolderPermissions).toHaveBeenCalled();
    });
  });

  describe('transferFolderOwner', () => {
    it('should return early when no folders found', async () => {
      folderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      await service.transferFolderOwner({
        actorId: mockUserId,
        targetId: 'newowner',
        refId: mockOrgId,
        workspace: DocumentRoleEnum.ORGANIZATION,
      });

      expect(folderModel.updateMany).not.toHaveBeenCalled();
    });

    it('should return early when no permissions found', async () => {
      folderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockFolder]),
      });
      jest.spyOn(service, 'getFolderPermissions').mockResolvedValue([]);

      await service.transferFolderOwner({
        actorId: mockUserId,
        targetId: 'newowner',
        refId: mockOrgId,
        workspace: DocumentRoleEnum.ORGANIZATION,
      });

      expect(folderModel.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('transferAllFoldersInTeamWorkspace', () => {
    it('should transfer all folders in team workspace', async () => {
      jest.spyOn(service, 'transferFolderOwner').mockResolvedValue(undefined);

      await service.transferAllFoldersInTeamWorkspace({
        actorId: mockUserId,
        teamId: mockTeamId,
        targetId: 'newowner',
      });

      expect(service.transferFolderOwner).toHaveBeenCalledWith({
        actorId: mockUserId,
        targetId: 'newowner',
        refId: mockTeamId,
        workspace: DocumentRoleEnum.ORGANIZATION_TEAM,
      });
    });
  });

  describe('transferAllFoldersInOrgWorkspace', () => {
    it('should transfer all folders in org workspace', async () => {
      jest.spyOn(service, 'transferFolderOwner').mockResolvedValue(undefined);

      await service.transferAllFoldersInOrgWorkspace({
        actorId: mockUserId,
        orgId: mockOrgId,
        targetId: 'newowner',
      });

      expect(service.transferFolderOwner).toHaveBeenCalledWith({
        actorId: mockUserId,
        targetId: 'newowner',
        refId: mockOrgId,
        workspace: DocumentRoleEnum.ORGANIZATION,
      });
    });
  });

  describe('updateManyFolderPermissions', () => {
    it('should update many folder permissions', async () => {
      const filter = { folderId: mockFolderId };
      const update = { role: FolderRoleEnum.VIEWER };
      folderPermissionModel.updateMany.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.updateManyFolderPermissions(filter, update);
      expect(result.modifiedCount).toBe(1);
      expect(folderPermissionModel.updateMany).toHaveBeenCalledWith(filter, update);
    });
  });

  describe('deleteFolderResource', () => {
    it('should delete folder resource', async () => {
      jest.spyOn(service, 'deleteDescendantFolders').mockResolvedValue([]);
      jest.spyOn(service, 'deleteById').mockResolvedValue(mockFolder);
      jest.spyOn(service, 'deletePermissionsByFolderId').mockResolvedValue(mockFolderPermission);
      jest.spyOn(service, 'deleteAllDocumentsInFolder').mockResolvedValue(undefined);

      const result = await service.deleteFolderResource(mockFolderId, mockUserId);

      expect(result).toEqual({
        folderPermission: mockFolderPermission,
        removedFolder: mockFolder,
        descendantFolders: [],
        totalDeletedFolders: 1,
      });
    });
  });

  describe('deleteMultiFolder', () => {
    it('should delete multiple folders', async () => {
      jest.spyOn(service, 'findOneFolderPermission').mockResolvedValue(mockFolderPermission);
      jest.spyOn(service, 'getBelongsTo').mockResolvedValue({
        folderId: mockFolderId,
        type: LocationType.PERSONAL,
        location: { _id: mockUserId, name: 'Test User' },
        workspaceId: null,
      });
      jest.spyOn(service, 'getSubscriptionReceiversByFolderId').mockResolvedValue({
        allReceiverIds: [mockUserId],
        individualReceiverIds: [],
        teamReceiverIds: [],
        orgReceiverIds: [],
      });
      jest.spyOn(service, 'deleteFolderResource').mockResolvedValue({
        folderPermission: mockFolderPermission,
        removedFolder: mockFolder,
        descendantFolders: [],
        totalDeletedFolders: 1,
      });
      jest.spyOn(service, 'publishDeleteFolderSubscription').mockImplementation(() => { });
      jest.spyOn(service, 'publishUpdateFolderSubscription').mockImplementation(() => { });

      await service.deleteMultiFolder({
        actor: mockUser,
        folderIds: [mockFolderId],
      });

      expect(service.deleteFolderResource).toHaveBeenCalled();
    });

    it('should send notification for ORGANIZATION folders', async () => {
      const orgPermission = {
        ...mockFolderPermission,
        role: FolderRoleEnum.ORGANIZATION,
        refId: mockOrgId,
      };
      jest.spyOn(service, 'findOneFolderPermission').mockResolvedValue(orgPermission);
      jest.spyOn(service, 'getBelongsTo').mockResolvedValue({
        folderId: mockFolderId,
        type: LocationType.ORGANIZATION,
        location: { _id: mockOrgId, name: 'Test Org' },
        workspaceId: mockOrgId,
      });
      jest.spyOn(service, 'getSubscriptionReceiversByFolderId').mockResolvedValue({
        allReceiverIds: [mockUserId],
        individualReceiverIds: [],
        teamReceiverIds: [],
        orgReceiverIds: [],
      });
      jest.spyOn(service, 'deleteFolderResource').mockResolvedValue({
        folderPermission: orgPermission,
        removedFolder: mockFolder,
        descendantFolders: [],
        totalDeletedFolders: 1,
      });
      jest.spyOn(service, 'publishDeleteFolderSubscription').mockImplementation(() => { });
      jest.spyOn(service, 'publishUpdateFolderSubscription').mockImplementation(() => { });
      jest.spyOn(service, 'notifyDeleteFoldersToMember').mockResolvedValue(undefined);

      await service.deleteMultiFolder({
        actor: mockUser,
        folderIds: [mockFolderId],
        isNotify: true,
      });

      expect(service.notifyDeleteFoldersToMember).toHaveBeenCalled();
    });

    it('should send notification for ORGANIZATION_TEAM folders', async () => {
      const teamPermission = {
        ...mockFolderPermission,
        role: FolderRoleEnum.ORGANIZATION_TEAM,
        refId: mockTeamId,
      };
      jest.spyOn(service, 'findOneFolderPermission').mockResolvedValue(teamPermission);
      jest.spyOn(service, 'getBelongsTo').mockResolvedValue({
        folderId: mockFolderId,
        type: LocationType.ORGANIZATION_TEAM,
        location: { _id: mockTeamId, name: 'Test Team' },
        workspaceId: mockOrgId,
      });
      jest.spyOn(service, 'getSubscriptionReceiversByFolderId').mockResolvedValue({
        allReceiverIds: [mockUserId],
        individualReceiverIds: [],
        teamReceiverIds: [],
        orgReceiverIds: [],
      });
      jest.spyOn(service, 'deleteFolderResource').mockResolvedValue({
        folderPermission: teamPermission,
        removedFolder: mockFolder,
        descendantFolders: [],
        totalDeletedFolders: 1,
      });
      jest.spyOn(service, 'publishDeleteFolderSubscription').mockImplementation(() => { });
      jest.spyOn(service, 'publishUpdateFolderSubscription').mockImplementation(() => { });
      jest.spyOn(service, 'notifyDeleteFoldersToMember').mockResolvedValue(undefined);

      await service.deleteMultiFolder({
        actor: mockUser,
        folderIds: [mockFolderId],
      });

      expect(service.notifyDeleteFoldersToMember).toHaveBeenCalled();
    });

    it('should not send notification for ORGANIZATION when isNotify is false', async () => {
      const orgPermission = {
        ...mockFolderPermission,
        role: FolderRoleEnum.ORGANIZATION,
        refId: mockOrgId,
      };
      jest.spyOn(service, 'findOneFolderPermission').mockResolvedValue(orgPermission);
      jest.spyOn(service, 'getBelongsTo').mockResolvedValue({
        folderId: mockFolderId,
        type: LocationType.ORGANIZATION,
        location: { _id: mockOrgId, name: 'Test Org' },
        workspaceId: mockOrgId,
      });
      jest.spyOn(service, 'getSubscriptionReceiversByFolderId').mockResolvedValue({
        allReceiverIds: [mockUserId],
        individualReceiverIds: [],
        teamReceiverIds: [],
        orgReceiverIds: [],
      });
      jest.spyOn(service, 'deleteFolderResource').mockResolvedValue({
        folderPermission: orgPermission,
        removedFolder: mockFolder,
        descendantFolders: [],
        totalDeletedFolders: 1,
      });
      jest.spyOn(service, 'publishDeleteFolderSubscription').mockImplementation(() => { });
      jest.spyOn(service, 'publishUpdateFolderSubscription').mockImplementation(() => { });
      jest.spyOn(service, 'notifyDeleteFoldersToMember').mockResolvedValue(undefined);

      await service.deleteMultiFolder({
        actor: mockUser,
        folderIds: [mockFolderId],
        isNotify: false,
      });

      expect(service.notifyDeleteFoldersToMember).not.toHaveBeenCalled();
    });
  });

  describe('notifyDeleteFoldersToMember', () => {
    it('should notify for ORGANIZATION', async () => {
      const notiOrgFactory = require('Common/factory/NotiFactory').notiOrgFactory;
      const notiFirebaseOrganizationFactory = require('Common/factory/NotiFirebaseFactory').notiFirebaseOrganizationFactory;

      notiOrgFactory.create.mockReturnValue({});
      notiFirebaseOrganizationFactory.create.mockReturnValue({
        notificationContent: {},
        notificationData: {},
      });

      await service.notifyDeleteFoldersToMember(
        FolderRoleEnum.ORGANIZATION,
        mockOrgId,
        { actor: { user: mockUser }, entity: { totalFolder: 1, folder: mockFolder } },
        [mockUserId],
      );

      expect(organizationService.publishNotiToAllOrgMember).toHaveBeenCalled();
      expect(organizationService.publishFirebaseNotiToAllOrgMember).toHaveBeenCalled();
    });

    it('should notify for ORGANIZATION_TEAM', async () => {
      const notiOrgFactory = require('Common/factory/NotiFactory').notiOrgFactory;
      const notiFirebaseTeamFactory = require('Common/factory/NotiFirebaseFactory').notiFirebaseTeamFactory;

      notiOrgFactory.create.mockReturnValue({});
      notiFirebaseTeamFactory.create.mockReturnValue({
        notificationContent: {},
        notificationData: {},
      });

      await service.notifyDeleteFoldersToMember(
        FolderRoleEnum.ORGANIZATION_TEAM,
        mockTeamId,
        { actor: { user: mockUser }, entity: { totalFolder: 1, folder: mockFolder } },
        [mockUserId],
      );

      expect(membershipService.publishNotiToAllTeamMember).toHaveBeenCalled();
      expect(organizationService.publishFirebaseNotiToAllTeamMember).toHaveBeenCalled();
    });
  });

  describe('getOrganizationFolder', () => {
    it('should get organization folder', async () => {
      const mockLookupUtils = {
        lookup: jest.fn().mockResolvedValue({
          results: [mockFolder],
          cursor: null,
          total: 1,
        }),
      };

      const OrganizationResourcesLookupUtils = require('Organization/utils/organization.resources.utils').OrganizationResourcesLookupUtils;
      OrganizationResourcesLookupUtils.mockImplementation(() => mockLookupUtils);

      const result = await service.getOrganizationFolder(
        mockUser,
        mockOrganization,
        [mockTeam],
        {},
      );

      expect(result).toEqual({
        results: [mockFolder],
        cursor: null,
        total: 1,
      });
    });
  });

  describe('checkOrgMembership', () => {
    it('should check org membership successfully', async () => {
      await service.checkOrgMembership({
        targetType: DestinationType.ORGANIZATION,
        refId: mockOrgId,
        userId: mockUserId,
      });

      expect(organizationService.getMembershipByOrgAndUser).toHaveBeenCalledWith(mockOrgId, mockUserId);
    });

    it('should check org membership for team', async () => {
      await service.checkOrgMembership({
        targetType: DestinationType.ORGANIZATION_TEAM,
        refId: mockTeamId,
        userId: mockUserId,
      });

      expect(organizationTeamService.getOrgOfTeam).toHaveBeenCalledWith(mockTeamId);
      expect(organizationService.getMembershipByOrgAndUser).toHaveBeenCalledWith(mockOrgId, mockUserId);
    });

    it('should throw error when no membership found', async () => {
      organizationService.getMembershipByOrgAndUser.mockResolvedValue(null);

      await expect(service.checkOrgMembership({
        targetType: DestinationType.ORGANIZATION,
        refId: mockOrgId,
        userId: mockUserId,
      })).rejects.toThrow(GraphErrorException.NotFound('You have no permission', ErrorCode.Common.NO_PERMISSION));
    });
  });
});
