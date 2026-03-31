/* eslint-disable */
import { Test } from '@nestjs/testing';
import { JwtService } from "@nestjs/jwt";

import { ITeam } from 'Team/interfaces/team.interface';
import { TeamService } from 'Team/team.service';
import { IMembership } from 'Team/interfaces/membership.interface';
import { EnvironmentService } from 'Environment/environment.service';
import { AwsService } from 'Aws/aws.service';
import { UserService } from 'User/user.service';
import { MembershipService } from 'Membership/membership.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from 'User/interfaces/user.interface';
import { DocumentService } from 'Document/document.service';
import { OrganizationService } from 'Organization/organization.service';
import { IDocumentPermission, IDocument } from 'Document/interfaces/document.interface';
import { UserTrackingService } from 'UserTracking/tracking.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { Types } from 'mongoose';
import { TeamRoles } from 'Document/enums/team.roles.enum';
import { DocumentRoleEnum } from 'Document/document.enum';

class AwsServiceMock {
  s3Instance() {
    return {
      deleteObject: jest.fn((params, cb) => {
        cb(null, 'data');
      }),
      putObject: jest.fn((params, cb) => {
        cb(null, 'data');
      }),
    };
  }
  removeFileFromBucket(keyFile) {
    return true;
  }
}

class PubSubServiceMock {}

class EnvironmentServiceMock {
  getByKey(key) {
    return 'http://localhost:4000';
  }
}

class UserServiceMock {
  findUserById() {
    return null;
  }

  getShareUsers() {

  }
}


class MembershipServiceMock {
  getMembers() {
    return [
      {
        userId: '5d5f85b5a7ab840c8d46f697',
      },
      {
        userId: '5d5f85b5a7ab840c8d46f698',
      },
    ];
  }
}

class RedisServiceMock {

}

class JwtServiceMock {

}

class TeamModelMock {
  create(user) {
    return null;
  }
  updateOne() {
    return null;
  }
  findOne() {
    return null;
  }
  findOneAndUpdate() {
    return null;
  }
  countDocuments() {
    return null;
  }
  findById() {
    return null;
  }
  find(){
    return null;
  }
}

class MembershipModelMock {
  updateOne() {
    return null;
  }
  deleteOne() {
    return null;
  }
  find() {
    return [<IMembership>{ _id: 'membership' }];
  }
  findOneAndUpdate() {
    return <IMembership>{ _id: 'membership' };
  }
}

class RequestAccessModelMock {
  find() {
    return [{ entity: {role: {}}, target: {}}]
  }
}

class DocumentServiceMock {
  getDocumentPermission() {

  }

  deleteDocument() {

  }

  deleteDocumentPermissions() {

  }

  publishUpdateDocument() {

  }

  cloneDocument() {

  }

  getDocumentByDocumentId() {

  }
}

class OrganizationServiceMock {
}

class UserTrackingServiceMock {
  updateTeamContact() {}
}

describe('Team Service', () => {
  let userService: UserService;
  let teamService: TeamService;
  let awsService: AwsService;
  let membershipService: MembershipService;
  let documentService: DocumentService;
  let organizationService: OrganizationService;
  let userTrackingService: UserTrackingService;

  beforeAll(async () => {
    const AwsServiceProvider = {
      provide: AwsService,
      useClass: AwsServiceMock,
    };
    const EnvironmentServiceProvider = {
      provide: EnvironmentService,
      useClass: EnvironmentServiceMock,
    };

    const UserServiceProvider = {
      provide: UserService,
      useClass: UserServiceMock,
    };

    const MembershipServiceProvider = {
      provide: MembershipService,
      useClass: MembershipServiceMock,
    };

    const PubSubServiceProvider = {
      provide: 'PUB_SUB',
      useClass: PubSubServiceMock,
    };
    const DocumentServiceProvider = {
      provide: DocumentService,
      useClass: DocumentServiceMock,
    };

    const OrganizationServiceProvider = {
      provide: OrganizationService,
      useClass: OrganizationServiceMock,
    };

    const UserTrackingServiceProvider = {
      provide: UserTrackingService,
      useClass: UserTrackingServiceMock,
    }


    const TeamModelProvider = {
      provide: 'Team',
      useValue: {
        create: () => null,
        findOne: () => <ITeam>{ _id: '12233' },
        updateOne: () => <ITeam>{ _id: '12233' },
        findOneAndUpdate: () => <ITeam>{ _id: '12233' },
        remove: ({ id }) => null,
        find: () => <ITeam[]>[{_id: '123'}],
      },
    };

    const MembershipModelProvider = {
      provide: getModelToken('Membership'),
      useClass: MembershipModelMock,
    };

    const RequestAccessModelProvider = {
      provide: getModelToken('RequestAccess'),
      useClass: RequestAccessModelMock,
    };

    const RedisServiceProvider = {
      provide: RedisService,
      useClass: RedisServiceMock,
    }

    const JwtServiceProvider = {
      provide: JwtService,
      useClass: JwtServiceMock,
    }

    // const TeamModelProvider = {
    //   provide: getModelToken('Team'),
    //   useClass: TeamModelMock,
    // };

    const module = await Test.createTestingModule({
      providers: [
        TeamService,
        UserServiceProvider,
        AwsServiceProvider,
        EnvironmentServiceProvider,
        TeamModelProvider,
        MembershipModelProvider,
        MembershipServiceProvider,
        PubSubServiceProvider,
        DocumentServiceProvider,
        OrganizationServiceProvider,
        UserTrackingServiceProvider,
        RedisServiceProvider,
        JwtServiceProvider,
        RequestAccessModelProvider,
      ],
    }).compile();

    awsService = module.get<AwsService>(AwsService);
    teamService = module.get<TeamService>(TeamService);
    userService = module.get<UserService>(UserService);
    membershipService = module.get<MembershipService>(MembershipService);
    documentService = module.get<DocumentService>(DocumentService);
    organizationService = module.get<OrganizationService>(OrganizationService);
    userTrackingService = module.get<UserTrackingService>(UserTrackingService)
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('removeAvatarFromS3', () => {
    it('should should call AWS S3 service to delete object', async () => {
      const mockRemoveFromBucket = jest
        .spyOn(awsService, 'removeFileFromBucket')
        .mockImplementationOnce((remoteId) => Promise.resolve());

      await teamService.removeAvatarFromS3('5d5f85b5a7ab840c8d46f697');

      expect(mockRemoveFromBucket).toBeCalled();
    });

    it('should not call AWS S3 service if remoteID is nulll', async () => {
      const mockRemoveFromBucket = jest
        .spyOn(awsService, 'removeFileFromBucket')
        .mockImplementationOnce((remoteId) => Promise.resolve());

      await teamService.removeAvatarFromS3(null);

      expect(mockRemoveFromBucket).toHaveBeenCalledTimes(0);
    });
  });

  describe('findOne', () => {
    it('', async () => {
      const team = {
        exec: () => null,
      } as any;
      const mockFindOne = jest.spyOn(teamService['teamModel'], 'findOne').mockImplementation(() => team);
      const condition = {
        _id: '123123',
      };
      await teamService.findOne(condition);

      expect(mockFindOne).toBeCalled();
      expect(mockFindOne).toBeCalledWith(condition);
      mockFindOne.mockClear();
    });
  });

  describe('findTeamByOwner', () => {
    it('should return a Team by given ownerID', async () => {
      const mockFindOne = jest.spyOn(teamService['teamModel'], 'find').mockImplementation(() => [] as any);

      await teamService.findTeamByOwner('ownerid');

      expect(mockFindOne).toBeCalled();
    });
  });

  describe('findTeamByCustomerId', () => {
    it('should return a team by ginve customerId', async () => {
      const team = {
        exec: () => null,
      } as any;
      const mockFindOne = jest.spyOn(teamService['teamModel'], 'findOne').mockImplementation(() => team);

      await teamService.findTeamByCustomerId('customerId');

      expect(mockFindOne).toBeCalled();
    });
  });

  describe('getAdminEmails', () => {
    it('should return an array of admin email', async () => {
      const user = <User>{
        email: 'email',
      };
      const mockMemberShipFind = jest.spyOn(
        teamService['membershipModel'],
        'find',
      );
      const mockUserFindOneById = jest
        .spyOn(teamService['userService'], 'findUserById')
        .mockImplementation(() => Promise.resolve(user));

      const emails = await teamService.getAdminEmails('teamdId');

      expect(mockMemberShipFind).toBeCalledTimes(1);
      expect(mockUserFindOneById).toBeCalled();
    });
  });

  describe('getMembersFromTeam', () => {
    it('should return member in team', async () => {
      const iTeam = <ITeam>{
        _id: '123',
      };
      const members = await teamService.getMembersFromTeam(iTeam);

      expect(members).toEqual([
        '5d5f85b5a7ab840c8d46f697',
        '5d5f85b5a7ab840c8d46f698',
      ]);
    });
  });
  
  describe('removeAllDocumentsByTeamId', () => {
    it('should return true', async () => {
      const spyGetDocumentPermission = jest
        .spyOn(documentService, 'getDocumentPermission')
        .mockResolvedValue([
          <IDocumentPermission>{
            _id: '123123123',
            refId: '12312321312',
            documentId: '12312312312',
            role: 'team',
          },
        ]);
      const spyGetDocument = jest
        .spyOn(documentService, 'getDocumentByDocumentId')
        .mockResolvedValue(<IDocument>{});
      const spyCloneDocument = jest
        .spyOn(documentService, 'cloneDocument')
        .mockResolvedValue(<IDocument>{});
      const spyDeleteDocument = jest
        .spyOn(documentService, 'deleteDocument')
        .mockResolvedValue(<IDocument>{});
      const spyDeleteDocumentPermissions = jest
        .spyOn(documentService, 'deleteDocument')
        .mockResolvedValue(<IDocument>{});
      const spyPublishDocument = jest
        .spyOn(documentService, 'publishUpdateDocument');
      const spyFindUserById = jest
        .spyOn(userService, 'findUserById').mockResolvedValue(<User>{
          name: 'nhuttm',
          avatarRemoteId: 'hihi',
        });
      const spyGetShareUsers = jest
      .spyOn(userService, 'getShareUsers').mockResolvedValue(new Set());

      const res = await teamService.removeAllDocumentsByTeamId('123123', [], DocumentRoleEnum.TEAM);
      expect(res).toStrictEqual(["12312312312"]);
      spyFindUserById.mockClear();
      spyGetDocument.mockClear();
      spyCloneDocument.mockClear();
      spyGetDocumentPermission.mockClear();
      spyDeleteDocument.mockClear();
      spyDeleteDocumentPermissions.mockClear();
      spyPublishDocument.mockClear();
      spyGetShareUsers.mockClear();
    });
  });

  describe('getTeamMemberByRole', () => {
    it('should return members of team', async () => {
      const memberships = <IMembership[]>[
        {
          _id: '5f744deb453ca335645a87b2',
          userId: '5f744deb453ca335645a87b2',
          teamId: new Types.ObjectId('5f744deb453ca335645a87b2'),
          role: TeamRoles.ADMIN
        }
      ]

      teamService['membershipModel'].find = jest
        .fn()
        .mockImplementation(() => Promise.resolve(memberships));

      const findMemberships = jest.spyOn(teamService['membershipModel'], 'find');

      const member = <User>{
        _id: '5f744deb453ca335645a87b2'
      }

      const findUserById = jest
        .spyOn(userService, 'findUserById')
        .mockImplementation(() => Promise.resolve(member))

      const result = await teamService.getTeamMemberByRole('83905823082303');
      expect(findMemberships).toBeCalled();
      expect(findUserById).toBeCalledTimes(1);
      expect(result).toEqual([member]);
    })
  })
  it('should return null if exec got error', async () => {
    teamService['membershipModel'].find = jest
      .fn()
      .mockImplementation(() => Promise.reject('Got error when find membership'));

    const actualResult = await teamService.getTeamMemberByRole('987375037250')
    expect(actualResult).toBeNull();
  })
});
