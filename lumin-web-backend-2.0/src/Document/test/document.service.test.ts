/// <reference path="../../global.d.ts" />

/* eslint-disable */

import { ClientSession, Types } from 'mongoose';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EnvironmentService } from '../../Environment/environment.service';
import { DocumentService } from '../../Document/document.service';
import { AsymmetricJwtService } from '../../Asymmetric/asymmetric-jwt.service'; 
import { DocumentServiceMobile } from '../../Document/document.service.mobile';

import { DocumentAnnotationTypeEnum } from '../../Document/document.annotation.enum';
import { AwsService } from '../../Aws/aws.service';
import { FeatureFlagService } from '../../FeatureFlag/FeatureFlag.service';
import planPoliciesHandler from '../../Payment/Policy/planPoliciesHandler';
import {
  IDocument,
  IDocumentPermission,
  IDocumentSharedNonUser,
  IShareDocumentInvitation,
} from '../../Document/interfaces/document.interface';
import { EnvConstants } from '../../Common/constants/EnvConstants';
import { RedisService } from '../../Microservices/redis/redis.service';
import { UserService } from '../../User/user.service';
import { TeamService } from '../../Team/team.service';
import { NotificationService } from '../../Notication/notification.service';
import { EmailService } from '../../Email/email.service';
import { MembershipService } from '../../Membership/membership.service';
import { OrganizationDocStackService } from '../../Organization/organization.docStack.service';
import { EventServiceFactory } from '../../Event/services/event.service.factory';
import { OrganizationService } from '../../Organization/organization.service';
import { OrganizationTeamService } from '../../Organization/organizationTeam.service';
import { RateLimiterService } from '../../RateLimiter/rateLimiter.service';
import { FolderService } from '../../Folder/folder.service';
import { EventsGateway } from '../../Gateway/SocketIoConfig';
import { AuthService } from '../../Auth/auth.service';
import { PersonalEventService } from '../../Event/services/personal.event.service';
import { PaymentService } from '../../Payment/payment.service';
import { LoggerService } from '../../Logger/Logger.service';
import { FormTemplatesService } from '../../FormTemplates/formTemplates.service';
import { IntegrationService } from '../../Integration/Integration.service';
import { DocumentSharedService } from '../../Document/document.shared.service';
import { JwtService } from '@nestjs/jwt';
import { DocumentOutlineService } from '../../Document/documentOutline.service';
import { CustomRulesService } from '../../CustomRules/custom-rule.service';
import { CustomRuleLoader } from '../../CustomRules/custom-rule.loader';
import { SlackService } from '../../Slack/slack.service';
import { RabbitMQService } from '../../RabbitMQ/RabbitMQ.service';
import { Utils } from '../../Common/utils/Utils';
import { GraphErrorException } from '../../Common/errors/GraphqlErrorException';
import { NotAcceptException } from '../../Common/errors/graphql/NotAcceptException';
import { SocketRoomGetter } from '../../Gateway/SocketRoom';

import { ITeam } from '../../Team/interfaces/team.interface';
import { IOrganization } from '../../Organization/interfaces/organization.interface';

import 'Common/extensions/string.extension';
import { DocumentOwnerTypeEnum, DocumentStorageEnum, DocumentRoleEnum, DocumentWorkspace, DocumentPermissionOfMemberEnum, DocumentMimeType } from '../../Document/document.enum';
import { ANNOTATION_IMAGE_BASE_PATH, DEFAULT_ORG_DOCUMENT_OWNER_PERMISSION, DEFAULT_ORG_MEMBER_DOCUMENT_PERMISSION, DEFAULT_TEAM_DOCUMENT_OWNER_PERMISSION, DEFAULT_TEAM_MEMBER_DOCUMENT_PERMISSION, INTERNAL_DOCUMENT_PERMISSION_ROLE } from '../../Document/documentConstant';
import { OrganizationCreationTypeEnum, OrganizationRoleEnums, OrganizationTeamRoles } from '../../Organization/organization.enum';
import { Document, ThirdPartyService, SearchUserStatus, DocumentRole, TypeOfDocument, AvailableCompressQuality } from '../../graphql.schema';
import { DocumentEventNames } from '../../Event/enums/event.enum';
import { DocumentIndexingTypeEnum } from '../../DocumentIndexingBacklog/enums/documentIndexingBacklog.enum';
import { DocumentIndexingMessagePriority } from '../../DocumentIndexingBacklog/constants/documentIndexingBacklog.constants';
import { DocViewerInteractionType } from '../../User/user.enum';
import { ORG_SIZE_LIMIT_FOR_NOTI } from '../../Common/constants/OrganizationConstants';
import { ReorderType } from '../../Document/document.annotation.enum';
import { DEFAULT_ANNOT_ORDER } from '../../Document/documentConstant';
import { DestinationType } from '../../graphql.schema';
import { TeamRoles } from '../../Document/enums/team.roles.enum';
import { MAXIMUM_NUMBER_SIGNATURE } from '../../constant';
import { FileUploadProvider } from '../../FormTemplates/enums';
import {
  SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_PERSONAL,
  SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_TEAMS,
  SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_ORGANIZATION,
  SUBSCRIPTION_DOCUMENT_LIST_REMOVE_SHARE,
  SUBSCRIPTION_DELETE_ORIGINAL_DOCUMENT,
  SUBSCRIPTION_UPDATE_DOCUMENT_LIST,
  SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_TEAMS,
  SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_ORGANIZATION,
  SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL,
} from '../../Common/constants/SubscriptionConstants';
import { User } from '../../User/interfaces/user.interface';
import { SubDocumentSettings, DeleteOriginalDocumentPayload } from '../../graphql.schema';
import { NotiDocument } from '../../Common/constants/NotificationConstants';
import { EMAIL_TYPE } from '../../Common/constants/EmailConstant';
import { notiFirebaseDocumentFactory } from '../../Common/factory/NotiFirebaseFactory';
import { notiDocumentFactory } from '../../Common/factory/NotiFactory';
import { ErrorCode } from '../../Common/constants/ErrorCode';
import { SlackConversationType, ShareLinkType, ShareLinkPermission } from '../../graphql.schema';
import { DocumentIndexingOriginEnum, DocumentIndexingStatusEnum, DocumentFromSourceEnum } from '../../Document/document.enum';
import { EXCHANGE_KEYS, ROUTING_KEY } from '../../RabbitMQ/RabbitMQ.constant';
import { RedisConstants } from '../../Common/callbacks/RedisConstants';
import { Nack } from '@golevelup/nestjs-rabbitmq';
import UserRules from '../../CustomRules/UserRules';

jest.mock('moment', () => {
  const momentMock: any = () => ({
    utcOffset: jest.fn().mockReturnThis(),
    format: jest.fn().mockReturnValue('2020-01-01'),
    diff: jest.fn().mockReturnValue(2),
    toDate: jest.fn().mockReturnValue(new Date('2020-01-01')),
    valueOf: jest.fn().mockReturnValue(1577836800000),
    unix: jest.fn().mockReturnValue(1577836800),
    isValid: jest.fn().mockReturnValue(true),
    isSame: jest.fn().mockReturnValue(false),
    isBefore: jest.fn().mockReturnValue(false),
    isAfter: jest.fn().mockReturnValue(false),
    add: jest.fn().mockReturnThis(),
    subtract: jest.fn().mockReturnThis(),
    startOf: jest.fn().mockReturnThis(),
    endOf: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnThis(),
    utc: jest.fn().mockReturnThis(),
  });

  jest.mock('../../Payment/Policy/planPoliciesHandler', () => ({
    __esModule: true,
    default: {
      from: jest.fn(),
    },
  }));

  jest.mock('../../Common/template-methods/DocumentQuery/personal-document-query', () => ({
    PersonalDocumentQuery: jest.fn().mockImplementation(() => ({
      of: jest.fn().mockReturnThis(),
      injectPremiumMap: jest.fn().mockReturnThis(),
      getDocuments: jest.fn(),
    })),
  }));
  
  momentMock.tz = jest.fn().mockReturnValue(momentMock());
  momentMock.tz.guess = jest.fn().mockReturnValue('UTC');
  momentMock.tz.zone = jest.fn().mockReturnValue({ name: 'UTC' });
  momentMock.tz.names = jest.fn().mockReturnValue(['UTC']);
  momentMock.tz.setDefault = jest.fn();
  momentMock.tz.load = jest.fn();
  
  momentMock.utc = jest.fn().mockReturnValue(momentMock());
  momentMock.now = jest.fn().mockReturnValue(1577836800000);
  
  return momentMock;
});

jest.mock('../../Common/factory/NotiFactory', () => ({
  notiDocumentFactory: {
    create: jest.fn(),
  },
  notiTeamFactory: {
    create: jest.fn(),
  },
  notiOrgFactory: {
    create: jest.fn(),
  },
}));

jest.mock('../../Common/factory/NotiFirebaseFactory', () => ({
  notiFirebaseDocumentFactory: {
    create: jest.fn(),
  },
  notiFirebaseOrganizationFactory: {
    create: jest.fn(),
  },
  notiFirebaseTeamFactory: {
    create: jest.fn(),
  },
}));

jest.mock('moment-timezone', () => {
  const moment = require('moment');
  return moment;
});

class RedisServiceMock {
  setFailedDocumentSharing = jest.fn();
  increaseProcessedDocumentSharingQueue = jest.fn();
  getDocumentSharingQueue = jest.fn();
  getFailedDocumentSharing = jest.fn();
  removeDocumentSharingQueueKeys = jest.fn();
}

class PubSubServiceMock { }
class EnvironmentServiceMock {
  getByKey = jest.fn();
}

class DocumentFormModelMock {
  findById = jest.fn();
  find = jest.fn();
  create = jest.fn();
  findOneAndUpdate = jest.fn();
  countDocuments = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(5)
  });
  estimatedDocumentCount = jest.fn();
  updateMany = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ modifiedCount: 1 })
  });
  aggregate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([])
  });
}

class DocumentPermissionModelMock {
  create = jest.fn();
  find = jest.fn();
  findOne = jest.fn();
  insertMany = jest.fn();
  findOneAndRemove = jest.fn();
  deleteMany = jest.fn().mockReturnValue({
    session: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue({ deletedCount: 1 })
  });
  bulkWrite = jest.fn();
  updateMany = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ modifiedCount: 1 })
  });
  aggregate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([])
  });
  countDocuments = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(5)
  });
  session() {
    return this
  }
}

class DocumentManipulationModelMock {
  create() { }
  find() { }
}

class DocumentImageModelMock {
  create() { }
  find() { }
  deleteMany() {}
  insertMany() {}
}

class DocumentFormFieldModelMock {
  create() { }
  find() { }
  deleteMany() {}
  insertMany() {}
  updateOne() {}
}

class DocumentOutlineModelMock {
  create() { }
  find() { }
  deleteMany() {}
  insertMany() {}
  updateOne() {}
}

class RecentDocumentListModelMock {
  findOneAndUpdate() {}
  updateMany() {}
  deleteMany() {}
  deleteOne() {}
}

class DocumentSharedServiceMock {
  updateDocument() {}
  getDocumentByDocumentId() {
    return Promise.resolve({
      name: 'test',
      toObject: () => ({ name: 'test' }),
      _id: { toHexString: () => 'doc123' }
    } as unknown as IDocument);
  }
}

class DocumentOutlineServiceMock {
  clearOutlineOfDocument() {}
}

class IntegrationServiceMock {}
class DocumentSharedNonUserModelMock {
  create() {
    return <IDocumentSharedNonUser[]>[
      {
        _id: '123',
        email: 'abc@gmail.com',
      },
      {
        _id: '456',
        email: 'xyz@gmail.com',
      }
    ]
  }
  findOne() {
    return {
      exec: () => null
    }
  }
  find() {
    return {
      countDocuments: () => Promise.resolve(0),
      exec: () => Promise.resolve([])
    }
  }
  findOneAndUpdate(){

  }
  updateMany = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ modifiedCount: 1 })
  });
}

class OrganizationServiceMock {
  getOrganizationMemberByRole() {}
  getOrganizationById = jest.fn();
  getOrgById = jest.fn().mockResolvedValue({
    _id: 'org1',
    name: 'Test Organization'
  });
  publishFirebaseNotiToAllTeamMember = jest.fn();
  getMembersByOrgId = jest.fn().mockResolvedValue([
    { userId: { toHexString: () => 'user1' } },
    { userId: { toHexString: () => 'user2' } }
  ]);
  getMembershipByOrgAndUser = jest.fn();
  publishNotiToAllOrgMember = jest.fn();
  publishFirebaseNotiToAllOrgMember = jest.fn();
}

class FolderServiceMock {}

class EventsGatewayMock {
  server = {
    to: jest.fn(() => ({ emit: jest.fn() })),
  };
}

class AuthServiceMock {}

class FormTemplatesServiceMock {}

class PersonalEventServiceMock {}

class CustomRulesServiceMock {}

class CustomRuleLoaderMock {}
class DocumentRequestAccessModelMock {
  find = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([])
  });
  create = jest.fn();
  deleteMany = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ deletedCount: 1 })
  });
  aggregate = jest.fn();
  findOneAndUpdate = jest.fn();
}

class AwsServiceMock {
  s3Instance() {
    return {
      deleteObject: jest.fn((params, cb) => {
        cb(null, 'data');
      }),
      getDocumentMetadata: jest.fn(),
    };
  }

  s3InstanceForDocument() {
    return {};
  }

  removeThumbnail(keyFile: String) {
    return keyFile;
  }

  removeDocument() { }
  
  getDocumentMetadata = jest.fn();
}

class UserServiceMock {
  isAvailableUsePremiumFeature() { }
  findUserById = jest.fn();
  findUserByIds = jest.fn();
  findUsers = jest.fn();
  updateUserContactWhenShareDocument = jest.fn();
  findUserByEmail = jest.fn().mockResolvedValue({ _id: 'user1', email: 'test@example.com' } as any);
  updateContactList = jest.fn().mockResolvedValue({} as any);
}

class TeamServiceMock {
  getPremiumTeamsOfUser() {
    return <ITeam> {
      _id: '5d5f85b5a7ab840c8d46f697',
    }
  }
  findOne() { }
  findOneById = jest.fn().mockResolvedValue({
    _id: 'team1',
    belongsTo: 'org1'
  });

  getAllMembersInTeam() {
    return ['5d5f85b5a7ab840c8d46f697']
  }

  addUserToTeamsWithInvitation() { }
  getTeamMemberByRole() {}
}

class NotificationServiceMock {
  createUsersNotifications = jest.fn();
  getNotificationsByConditions = jest.fn();
  getNotificationUsersByCondition = jest.fn();
  removeMultiNotifications = jest.fn();
  updateNotification = jest.fn();
  updateNotificationUser = jest.fn();
  genPublishNotificationData = jest.fn();
  publishFirebaseNotifications = jest.fn();
  publishNewNotifications = jest.fn();
  publishDeleteNotification = jest.fn();
}

class EmailServiceMock {
  sendEmailHOF = jest.fn();
  generateDeeplinkForEmail = jest.fn(() => 'https://example.com/deeplink');
}

class OrganizationDocStackServiceMock {
  getDocStackByOrgId = jest.fn().mockResolvedValue([]);
  validateIncreaseDocStack = jest.fn().mockResolvedValue(true);
}

class MembershipServiceMock {
  find() {
    return [
      {
        userId: '5d5f85b5a7ab840c8d46f697',
      },
      {
        userId: '5d5f85b5a7ab840c8d46f696',
      }
    ]
  }
  publishNotiToAllTeamMember = jest.fn();
}

class EventServiceMock {
  createEvent = jest.fn();
}

class OrganizationTeamServiceMock {
  getOrgTeams = jest.fn();
}

class RateLimiterServiceMock {
  verifyUploadFilesSize = jest.fn().mockReturnValue(true);
}

class PaymentServiceMock {}

class CallbackServiceMock {
  registerCallbacks = jest.fn();
}

class FeatureFlagServiceMock {
}

class DocumentServiceMobileMock {

}

class DocumentDriveMetaDateMock {}

class SlackServiceMock {}

class RabbitMQServiceMock {
  publish = jest.fn();
  publishWithPriority = jest.fn();
  publishBatch = jest.fn();
  request = jest.fn();
}

class AsymmetricJwtServiceMock {}

class JwtServiceMock {
  sign = jest.fn();
}

describe('Document service', () => {
  let documentService: DocumentService;
  let awsService: AwsService;
  let environmentService: EnvironmentService;
  let userService: UserService;
  let teamService: TeamService;
  let organizationService: OrganizationService;
  let notificationService: NotificationService;
  let emailService: EmailService;
  let membershipService: MembershipService;
  let eventService: EventServiceFactory;
  let organizationTeamService: OrganizationTeamService;
  let rateLimiterService: RateLimiterService;
  let folderService: FolderService;
  let personalEventService: PersonalEventService;
  let paymentService: PaymentService;
  let loggerService: LoggerService;
  let documentSharedService: DocumentSharedService;
  let documentOutlineService: DocumentOutlineService;
  let documentFormModelMock: DocumentFormModelMock;
  let mockDocumentSharedNonUserModel: DocumentSharedNonUserModelMock;
  let documentBackupInfoModel: any;
  let documentDriveMetadataModel: any;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DocumentServiceMobile,
        DocumentService,
        {
          provide: EnvironmentService,
          useClass: EnvironmentServiceMock,
        },
        {
          provide: 'PUB_SUB',
          useClass: PubSubServiceMock,
        },
        {
          provide: getModelToken('Document'),
          useValue: {
            create: () => null,
            find: () => {
              return {
                exec: () => Promise.resolve([
                  {
                    name: 'test',
                    toObject: () => ({ name: 'test' }),
                    _id: { toHexString: () => 'doc123' }
                  } as unknown as IDocument,
                ])
              };
            },
            findOne: () => {
              return {
                exec: () => Promise.resolve(
                  {
                    name: 'test',
                    shareSetting: { link: 'linkId' },
                    toObject: () => ({ name: 'test', shareSetting: { link: 'linkId' } }),
                    _id: { toHexString: () => 'doc123' }
                  } as unknown as IDocument
                )
              };
            },
            findById: () => <IDocument>{ name: 'test' },
            findOneAndUpdate: () =>
              <IDocument>{
                shareSetting: {
                  linkType: 'ANYONE',
                  permission: 'VIEWER',
                },
              },
            insertMany: () => [
              <IDocument>{
                name: 'test',
              },
            ],
            findOneAndDelete: () => <IDocument>{ name: 'test' },
            updateMany: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue({ modifiedCount: 1 })
            }),
            aggregate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([])
            }),
          },
        },
        {provide: 'DocumentAnnotation', useValue: {
            updateOne:() => { },
            find:() => { },
            deleteMany:() => { },
        }},
        {provide: 'DocumentBackupInfo', useValue: {
            create:()=> {},
            find:()=> {},
            deleteMany:()=> {},
            remove:()=> {},
            findOne:()=> {},
        }},
        {
          provide: getModelToken('DocumentPermission'),
          useClass: DocumentPermissionModelMock,
        },
        {
          provide: getModelToken('DocumentForm'),
          useClass: DocumentFormModelMock,
        },
        {
          provide: getModelToken('DocumentManipulation'),
          useClass: DocumentManipulationModelMock,
        },
        {
          provide: getModelToken('DocumentSharedNonUser'),
          useClass: DocumentSharedNonUserModelMock,
        },
        {
          provide: getModelToken('DocumentRequestAccess'),
          useClass: DocumentRequestAccessModelMock,
        },
        {
          provide: getModelToken('DocumentImage'),
          useClass: DocumentImageModelMock,
        },
        {
          provide: getModelToken('DocumentFormField'),
          useClass: DocumentFormFieldModelMock,
        },
        {
          provide: getModelToken('DocumentOutline'),
          useClass: DocumentOutlineModelMock,
        },
        {
          provide: getModelToken('RecentDocumentList'),
          useClass: RecentDocumentListModelMock,
        },
        {
          provide: FeatureFlagService,
          useClass: FeatureFlagServiceMock,
        },
        {
          provide: 'RedisExpiredCallbackService',
          useClass: CallbackServiceMock,
        },
        {
          provide: RedisService,
          useClass: RedisServiceMock,
        },
        {
          provide: AwsService,
          useClass: AwsServiceMock,
        },
        {
          provide: UserService,
          useClass: UserServiceMock,
        },
        {
          provide: TeamService,
          useClass: TeamServiceMock,
        },
        {
          provide: NotificationService,
          useClass: NotificationServiceMock,
        },
        {
          provide: EmailService,
          useClass: EmailServiceMock,
        },
        {
          provide: MembershipService,
          useClass: MembershipServiceMock,
        },
        {
          provide: EventServiceFactory,
          useClass: EventServiceMock,
        },
        {
          provide: OrganizationService,
          useClass: OrganizationServiceMock,
        },
        {
          provide: OrganizationTeamService,
          useClass: OrganizationTeamServiceMock,
        },
        {
          provide: RateLimiterService,
          useClass: RateLimiterServiceMock,
        },
        {
          provide: FolderService,
          useClass: FolderServiceMock,
        },
        {
          provide: EventsGateway,
          useClass: EventsGatewayMock,
        },
        {
          provide: AuthService,
          useClass: AuthServiceMock,
        },
        {
          provide: PersonalEventService,
          useClass: PersonalEventServiceMock,
        },
        {
          provide: OrganizationDocStackService,
          useClass: OrganizationDocStackServiceMock
        },
        {
          provide: PaymentService,
          useClass: PaymentServiceMock
        },
        {
          provide: LoggerService,
          useValue: {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: FormTemplatesService,
          useClass: FormTemplatesServiceMock
        },
        {
          provide: DocumentServiceMobile,
          useClass: DocumentServiceMobileMock
        },
        {
          provide: getModelToken('DocumentDriveMetadata'),
          useClass: DocumentDriveMetaDateMock,
        },
        {
          provide: IntegrationService,
          useClass: IntegrationServiceMock,
        },
        {
          provide: DocumentSharedService,
          useClass: DocumentSharedServiceMock,
        },
        {
          provide: DocumentOutlineService,
          useClass: DocumentOutlineServiceMock,
        },{
          provide: CustomRulesService,
          useClass: CustomRulesServiceMock,
        },
        {
          provide: CustomRuleLoader,
          useClass: CustomRuleLoaderMock,
        },
        {
          provide: SlackService,
          useClass: SlackServiceMock,
        },
        {
          provide: RabbitMQService,
          useClass: RabbitMQServiceMock,
        },
        {
          provide: AsymmetricJwtService,
          useClass: AsymmetricJwtServiceMock,
        },
        {
          provide: JwtService,
          useClass: JwtServiceMock,
        }
      ],
    }).compile();

    documentService = module.get<DocumentService>(DocumentService);
    awsService = module.get<AwsService>(AwsService);
    userService = module.get<UserService>(UserService);
    teamService = module.get<TeamService>(TeamService);
    organizationService = module.get<OrganizationService>(OrganizationService);
    environmentService = module.get<EnvironmentService>(EnvironmentService);
    emailService = module.get<EmailService>(EmailService);
    notificationService = module.get<NotificationService>(NotificationService);
    eventService = module.get<EventServiceFactory>(EventServiceFactory);
    organizationTeamService = module.get<OrganizationTeamService>(OrganizationTeamService);
    rateLimiterService = module.get<RateLimiterService>(RateLimiterService);
    folderService = module.get<FolderService>(FolderService);
    paymentService = module.get<PaymentService>(PaymentService);
    membershipService = module.get<MembershipService>(MembershipService);
    documentService = module.get<DocumentService>(DocumentService);
    documentOutlineService = module.get<DocumentOutlineService>(DocumentOutlineService);
    documentFormModelMock = module.get<DocumentFormModelMock>(getModelToken('DocumentForm'));
    mockDocumentSharedNonUserModel = module.get<DocumentSharedNonUserModelMock>(getModelToken('DocumentSharedNonUser'));
    documentBackupInfoModel = module.get('DocumentBackupInfo');
    documentDriveMetadataModel = module.get(getModelToken('DocumentDriveMetadata'));
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(notificationService, 'getNotificationsByConditions').mockResolvedValue([]);
    notificationService.createUsersNotifications = jest.fn().mockImplementation();
    notificationService.publishFirebaseNotifications = jest.fn().mockImplementation();
    userService = {
      findUserById: jest.fn(),
      findUsers: jest.fn(),
    } as any;
    teamService.findOneById = jest.fn().mockResolvedValue({ _id: 'team1' } as any);
    organizationService.getOrgById = jest.fn().mockResolvedValue({ _id: 'org1' } as any);
    membershipService.publishNotiToAllTeamMember = jest.fn().mockImplementation();
    organizationService.publishNotiToAllOrgMember = jest.fn().mockImplementation();
    organizationService.publishFirebaseNotiToAllOrgMember = jest.fn().mockImplementation();
    organizationService.publishFirebaseNotiToAllTeamMember = jest.fn().mockImplementation();
    
    (documentBackupInfoModel as any).deleteOne = jest.fn().mockResolvedValue({} as any);
    (documentDriveMetadataModel as any).findOneAndDelete = jest.fn().mockImplementation();
  });

  describe('permissionDocumentSharer', () => {
    it('should return true if document share link to anyone with SHARER permission', async () => {
      const document = <IDocument>{
        shareSetting: {
          linkType: 'ANYONE',
          permission: 'SHARER',
        },
      };
      const actualResult = documentService.permissionDocumentSharer(document);

      expect(actualResult).toBe(true);
    });

    it('should return false if document share link to anyone but permission is VIEWER', async () => {
      const document = <IDocument>{
        shareSetting: {
          linkType: 'ANYONE',
          permission: 'VIEWER',
        },
      };
      const actualResult = documentService.permissionDocumentSharer(document);

      expect(actualResult).toBe(false);
    });

    it('should return false if document share link to invited user', async () => {
      const document = <IDocument>{
        shareSetting: {
          linkType: 'INVITED',
        },
      };
      const actualResult = documentService.permissionDocumentSharer(document);

      expect(actualResult).toBe(false);
    });
  });

  describe('countTotalDocuments', () => {
    it('should return total count of documents with specific conditions', async () => {
      const conditions = { ownerId: 'user123', isPersonal: true };
      const options = { maxTimeMS: 5000 };
      const mockCountDocuments = jest.fn().mockReturnValue({
        exec: () => Promise.resolve(5)
      });
      
      jest.spyOn(documentService['documentModel'], 'find').mockReturnValue({
        countDocuments: mockCountDocuments
      } as any);

      const result = await documentService.countTotalDocuments(conditions, options);

      expect(documentService['documentModel'].find).toHaveBeenCalledWith(conditions, {}, options);
      expect(mockCountDocuments).toHaveBeenCalled();
      expect(result).toBe(5);
    });

    it('should return zero when no documents match conditions', async () => {
      const conditions = { ownerId: 'nonexistent' };
      const mockCountDocuments = jest.fn().mockReturnValue({
        exec: () => Promise.resolve(0)
      });
      
      jest.spyOn(documentService['documentModel'], 'find').mockReturnValue({
        countDocuments: mockCountDocuments
      } as any);

      const result = await documentService.countTotalDocuments(conditions);

      expect(documentService['documentModel'].find).toHaveBeenCalledWith(conditions, {}, {});
      expect(mockCountDocuments).toHaveBeenCalled();
      expect(result).toBe(0);
    });
  });

  describe('countTotalDocumentByIds', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should count total documents by IDs', async () => {
      const documentIds = ['doc1', 'doc2', 'doc3'];
      const conditions = { ownerId: 'user1' };
      const options = { maxTimeMS: 5000 };
      
      jest.spyOn(Utils, 'executeQueryInChunk').mockResolvedValue([2, 1]);
      jest.spyOn(documentService, 'countTotalDocuments').mockResolvedValue(2);

      const result = await documentService.countTotalDocumentByIds({
        documentIds,
        conditions,
        options
      });

      expect(Utils.executeQueryInChunk).toHaveBeenCalledWith(
        documentIds,
        expect.any(Function)
      );
      expect(result).toBe(3);
    });

    it('should count total documents by IDs with default options {}', async () => {
      const documentIds = ['docA', 'docB'];
      const conditions = { status: 'active' };
  
      jest.spyOn(Utils, 'executeQueryInChunk').mockResolvedValue([5, 7]);
      jest.spyOn(documentService, 'countTotalDocuments').mockResolvedValue(5);
  
      const result = await documentService.countTotalDocumentByIds({
        documentIds,
        conditions,
      } as any);
  
      expect(Utils.executeQueryInChunk).toHaveBeenCalledWith(
        documentIds,
        expect.any(Function),
      );
      expect(result).toBe(12);
    });

    it('should call countTotalDocuments inside callback', async () => {
      const documentIds = ['doc1', 'doc2'];
      const conditions = { status: 'active' };
    
      const countSpy = jest
        .spyOn(documentService, 'countTotalDocuments')
        .mockResolvedValue(5);
    
      jest.spyOn(Utils, 'executeQueryInChunk')
        .mockImplementation(((ids: string[], excuteQuery: (ids: string[]) => Promise<number>) => {
          return Promise.all([excuteQuery(ids)]);
        }) as typeof Utils.executeQueryInChunk);

      const result = await documentService.countTotalDocumentByIds({
        documentIds,
        conditions,
      } as any);
    
      expect(countSpy).toHaveBeenCalledWith(
        { _id: { $in: documentIds }, ...conditions },
        {},
      );
      expect(result).toBe(5);
    });
  });

  describe('totalPermissionsOfDocument', () => {
    it('should return total count of permissions for a document', async () => {
      const documentId = 'doc123';
      
      const mockPermissionCount = jest.fn().mockResolvedValue(5);
      const mockNonUserCount = jest.fn().mockResolvedValue(3);
      
      const mockPermissionFind = jest.fn().mockReturnValue({
        countDocuments: mockPermissionCount
      });
      
      const mockNonUserFind = jest.fn().mockReturnValue({
        countDocuments: mockNonUserCount
      });
      
      (documentService as any).documentPermissionModel = {
        find: mockPermissionFind
      };
      
      (documentService as any).documentSharedNonUserModel = {
        find: mockNonUserFind
      };

      const result = await documentService.totalPermissionsOfDocument(documentId);

      expect(mockPermissionFind).toHaveBeenCalledWith({ documentId });
      expect(mockNonUserFind).toHaveBeenCalledWith({ documentId });
      expect(result).toBe(8);
    });
  });

  describe('createDocument', () => {
    it('should call documentModel.create function', async () => {
      const document = <any>{
        name: 'test doc',
        toObject: () => ({ name: 'test doc' }),
        _id: { toHexString: () => '123' }
      };
      
      const mockCreate = jest.fn().mockResolvedValue(document);
      
      (documentService as any).documentModel = {
        create: mockCreate
      };

      const actualResult = await documentService.createDocument(document as unknown as Document & { service: DocumentStorageEnum, manipulationStep?: string });

      expect(actualResult).toHaveProperty('name', 'test doc');
      expect(actualResult.name).toBe('test doc');
    });
  });

  describe('findDocumentsByIds', () => {
    it('should find documents by IDs using Utils.executeQueryInChunk', async () => {
      const documentIds = ['doc1', 'doc2', 'doc3'];
      const mockDocuments = [
        { 
          _id: { toHexString: () => 'doc1' }, 
          toObject: () => ({ _id: 'doc1', name: 'Document 1', ownerId: 'user1' }),
          name: 'Document 1',
          ownerId: 'user1'
        },
        { 
          _id: { toHexString: () => 'doc2' }, 
          toObject: () => ({ _id: 'doc2', name: 'Document 2', ownerId: 'user1' }),
          name: 'Document 2',
          ownerId: 'user1'
        },
        { 
          _id: { toHexString: () => 'doc3' }, 
          toObject: () => ({ _id: 'doc3', name: 'Document 3', ownerId: 'user1' }),
          name: 'Document 3',
          ownerId: 'user1'
        }
      ] as any[];
      
      const mockFind = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocuments)
      });
      
      (documentService as any).documentModel = {
        find: mockFind
      };
      
      jest.spyOn(Utils, 'executeQueryInChunk').mockImplementation(async (ids, callback) => {
        const result = await callback(ids);
        return Array.isArray(result) ? result : [result];
      });

      const result = await documentService.findDocumentsByIds(documentIds);

      expect(Utils.executeQueryInChunk).toHaveBeenCalledWith(documentIds, expect.any(Function));
      expect(mockFind).toHaveBeenCalledWith({ _id: { $in: documentIds } });
      expect(result).toHaveLength(3);
    });
  });

  describe('addAnnotationToDocument', () => {
    it('should add annotation to document successfully with proper database interaction', async () => {
      const annotation = {
        annotationId: 'annot123',
        documentId: 'doc123',
        xfdf: '<xfdf>Test annotation</xfdf>',
        content: 'Test annotation',
        page: 1,
        type: 'highlight'
      };
      const options = { maxTimeMS: 5000 };
      
      const mockUpdateOne = jest.fn().mockReturnValue({
        catch: jest.fn().mockResolvedValue({ acknowledged: true, modifiedCount: 1 })
      });

      (documentService as any).documentAnnotationModel = {
        updateOne: mockUpdateOne
      };

      await documentService.addAnnotationToDocument(annotation, options);

      expect(mockUpdateOne).toHaveBeenCalledWith(
        { annotationId: 'annot123', documentId: 'doc123' },
        annotation,
        { upsert: true, maxTimeMS: 5000 }
      );
    });

    it('should handle annotation with minimal required fields', async () => {
      const annotation = {
        annotationId: 'annot456',
        documentId: 'doc456',
        xfdf: '<xfdf>Minimal annotation</xfdf>'
      };
      
      const mockUpdateOne = jest.fn().mockReturnValue({
        catch: jest.fn().mockResolvedValue({ acknowledged: true, modifiedCount: 0 })
      });

      (documentService as any).documentAnnotationModel = {
        updateOne: mockUpdateOne
      };

      await documentService.addAnnotationToDocument(annotation);

      expect(mockUpdateOne).toHaveBeenCalledWith(
        { annotationId: 'annot456', documentId: 'doc456' },
        annotation,
        { upsert: true }
      );
    });

    it('should handle database errors gracefully with logging', async () => {
      const annotation = {
        annotationId: 'annot999',
        documentId: 'doc999',
        xfdf: '<xfdf>Error annotation</xfdf>'
      };
      
      const mockError = new Error('Database connection failed');
      const mockUpdateOne = jest.fn().mockReturnValue({
        catch: jest.fn().mockImplementation((callback) => {
          callback(mockError);
          return Promise.resolve();
        })
      });

      const mockLoggerError = jest.fn();
      
      (documentService as any).documentAnnotationModel = {
        updateOne: mockUpdateOne
      };
      (documentService as any).loggerService = {
        error: mockLoggerError
      };

      await documentService.addAnnotationToDocument(annotation);

      expect(mockUpdateOne).toHaveBeenCalledWith(
        { annotationId: 'annot999', documentId: 'doc999' },
        annotation,
        { upsert: true }
      );
      expect(mockLoggerError).toHaveBeenCalled();
    });
  });

  describe('addManyAnnotations', () => {
    it('should add multiple annotations successfully using insertMany', async () => {
      const annotations = [
        {
          annotationId: 'annot1',
          documentId: 'doc1',
          xfdf: '<xfdf>First annotation</xfdf>',
          content: 'First annotation',
          page: 1
        },
        {
          annotationId: 'annot2',
          documentId: 'doc1',
          xfdf: '<xfdf>Second annotation</xfdf>',
          content: 'Second annotation',
          page: 2
        }
      ];
      
      const mockInsertedAnnotations = [
        {
          _id: { toHexString: () => 'id1' },
          toObject: () => ({ 
            annotationId: 'annot1', 
            documentId: 'doc1', 
            content: 'First annotation',
            xfdf: '<xfdf>First annotation</xfdf>',
            page: 1
          })
        },
        {
          _id: { toHexString: () => 'id2' },
          toObject: () => ({ 
            annotationId: 'annot2', 
            documentId: 'doc1', 
            content: 'Second annotation',
            xfdf: '<xfdf>Second annotation</xfdf>',
            page: 2
          })
        }
      ];

      const mockInsertMany = jest.fn().mockResolvedValue(mockInsertedAnnotations);
      
      (documentService as any).documentAnnotationModel = {
        insertMany: mockInsertMany
      };

      const result = await documentService.addManyAnnotations(annotations);

      expect(mockInsertMany).toHaveBeenCalledWith(annotations);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ 
        annotationId: 'annot1', 
        documentId: 'doc1', 
        content: 'First annotation',
        xfdf: '<xfdf>First annotation</xfdf>',
        page: 1,
        _id: 'id1'
      });
      expect(result[1]).toEqual({ 
        annotationId: 'annot2', 
        documentId: 'doc1', 
        content: 'Second annotation',
        xfdf: '<xfdf>Second annotation</xfdf>',
        page: 2,
        _id: 'id2'
      });
    });
  });

  describe('countDocumentAnnotations', () => {
    it('should return count of annotations for document', () => {
      const documentId = 'doc123';
      const expectedCount = 5;
      
      documentService['documentAnnotationModel'].countDocuments = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(expectedCount)
      });
      
      const result = documentService.countDocumentAnnotations(documentId);
      
      expect(documentService['documentAnnotationModel'].countDocuments).toHaveBeenCalledWith({ documentId });
      expect(result).resolves.toBe(expectedCount);
    });
  });

  describe('getAnnotationsOfDocument', () => {
    it('should return annotations without projection', async () => {
      const documentId = 'doc456';
      const mockAnnotations = [
        {
          _id: { toHexString: () => 'annot3' },
          toObject: () => ({ xfdf: 'test3', annotationId: 'annot3', documentId: 'doc456', pageIndex: 1 })
        }
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAnnotations)
      };

      documentService['documentAnnotationModel'].find = jest.fn().mockReturnValue(mockQuery);

      const result = await documentService.getAnnotationsOfDocument(documentId);

      expect(documentService['documentAnnotationModel'].find).toHaveBeenCalledWith({ documentId }, undefined);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ xfdf: 'test3', annotationId: 'annot3', documentId: 'doc456', pageIndex: 1, _id: 'annot3' });
    });

    it('should return empty array when document has no annotations', async () => {
      const documentId = 'doc789';
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([])
      };

      documentService['documentAnnotationModel'].find = jest.fn().mockReturnValue(mockQuery);

      const result = await documentService.getAnnotationsOfDocument(documentId);

      expect(result).toEqual([]);
    });
  });

  describe('getAnnotationsByAnnotationIds', () => {
    it('should handle single annotation ID', async () => {
      const annotationIds = ['single_annot'];
      const mockAnnotations = [
        {
          _id: { toHexString: () => 'single_annot' },
          toObject: () => ({ xfdf: 'single test', annotationId: 'single_annot', documentId: 'doc_single' })
        }
      ];

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockAnnotations)
      };

      documentService['documentAnnotationModel'].find = jest.fn().mockReturnValue(mockQuery);

      const result = await documentService.getAnnotationsByAnnotationIds(annotationIds);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ xfdf: 'single test', annotationId: 'single_annot', documentId: 'doc_single', _id: 'single_annot' });
    });
  });

  describe('deleteManyAnnotationOfDocument', () => {
    it('should delete annotations with given conditions', () => {
      const conditions = { documentId: 'doc123' };
      const mockQuery = {
        exec: jest.fn().mockResolvedValue({ deletedCount: 5 })
      };

      documentService['documentAnnotationModel'].deleteMany = jest.fn().mockReturnValue(mockQuery);

      const result = documentService.deleteManyAnnotationOfDocument(conditions);

      expect(documentService['documentAnnotationModel'].deleteMany).toHaveBeenCalledWith(conditions);
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).resolves.toEqual({ deletedCount: 5 });
    });
  });

  describe('getAnnotationsOfDocumentQuery', () => {
    it('should execute query and return annotations with projection', async () => {
      const documentId = 'doc123';
      const projection = { xfdf: 1, annotationId: 1 };
      const mockAnnotations = [
        { annotationId: 'annot1', documentId, xfdf: '<xfdf>test1</xfdf>' },
        { annotationId: 'annot2', documentId, xfdf: '<xfdf>test2</xfdf>' }
      ];
      
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAnnotations)
      };
      
      documentService['documentAnnotationModel'].find = jest.fn().mockReturnValue(mockQuery);
      
      const result = await documentService.getAnnotationsOfDocumentQuery(documentId, projection);
      
      expect(documentService['documentAnnotationModel'].find).toHaveBeenCalledWith(
        { documentId }, 
        projection
      );
      expect(mockQuery.sort).toHaveBeenCalledWith({ order: 1, createdAt: 1 });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual(mockAnnotations);
    });
  });

  describe('deleteAnnotationsOnPage', () => {
    it('should delete annotations by annotation IDs', () => {
      const deletedAnnotIds = ['annot1', 'annot2', 'annot3'];
      const expectedCondition = {
        annotationId: { $in: deletedAnnotIds }
      };

      documentService.deleteManyAnnotationOfDocument = jest.fn().mockResolvedValue({ deletedCount: 3 });

      const result = documentService.deleteAnnotationsOnPage(deletedAnnotIds);

      expect(documentService.deleteManyAnnotationOfDocument).toHaveBeenCalledWith(expectedCondition);
      expect(result).resolves.toEqual({ deletedCount: 3 });
    });
  });

  describe('addManipulationToDocument', () => {
    it('should add manipulation to document', async () => {
      const manipulation = { documentId: 'doc123', type: 'edit', refId: 'user123' };
      const mockCreatedManipulation = {
        _id: { toHexString: () => 'manip1' },
        toObject: () => ({ documentId: 'doc123', type: 'edit', refId: 'user123' })
      };

      documentService['documentManipulationModal'].create = jest.fn().mockResolvedValue(mockCreatedManipulation);

      const result = await documentService.addManipulationToDocument(manipulation);

      expect(documentService['documentManipulationModal'].create).toHaveBeenCalledWith(manipulation);
      expect(result).toEqual({ documentId: 'doc123', type: 'edit', refId: 'user123', _id: 'manip1' });
    });
  });

  describe('getManipulationDocument', () => {
    it('should get manipulation documents by condition', async () => {
      const condition = { documentId: 'doc123' };
      const mockManipulations = [
        {
          _id: { toHexString: () => 'manip1' },
          toObject: () => ({ documentId: 'doc123', type: 'edit' })
        },
        {
          _id: { toHexString: () => 'manip2' },
          toObject: () => ({ documentId: 'doc123', type: 'delete' })
        }
      ];

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockManipulations)
      };

      documentService['documentManipulationModal'].find = jest.fn().mockReturnValue(mockQuery);

      const result = await documentService.getManipulationDocument(condition);

      expect(documentService['documentManipulationModal'].find).toHaveBeenCalledWith(condition);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ documentId: 'doc123', type: 'edit', _id: 'manip1' });
      expect(result[1]).toEqual({ documentId: 'doc123', type: 'delete', _id: 'manip2' });
    });
  });

  describe('clearAnnotationOfDocument', () => {
    it('should clear annotations without session', () => {
      const conditions = { documentId: 'doc123' };
      const mockQuery = {
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ deletedCount: 3 })
      };

      documentService['documentAnnotationModel'].deleteMany = jest.fn().mockReturnValue(mockQuery);

      const result = documentService.clearAnnotationOfDocument(conditions);

      expect(mockQuery.session).toHaveBeenCalledWith(null);
      expect(result).resolves.toEqual({ deletedCount: 3 });
    });
  });

  describe('findDocumentByUserId', () => {
    it('should return an array of documents for a user', async () => {
      const userId = 'user123';
      const mockDocuments = [
        {
          name: 'Document 1',
          ownerId: userId,
          _id: { toHexString: () => 'doc1' },
          toObject: () => ({
            name: 'Document 1',
            ownerId: userId,
            _id: { toHexString: () => 'doc1' }
          })
        },
        {
          name: 'Document 2',
          ownerId: userId,
          _id: { toHexString: () => 'doc2' },
          toObject: () => ({
            name: 'Document 2',
            ownerId: userId,
            _id: { toHexString: () => 'doc2' }
          })
        }
      ];

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockDocuments)
      };

      documentService['documentModel'].find = jest.fn().mockReturnValue(mockQuery);

      const result = await documentService.findDocumentByUserId(userId);

      expect(documentService['documentModel'].find).toHaveBeenCalledWith({ ownerId: userId });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]._id).toBe('doc1');
      expect(result[1]._id).toBe('doc2');
    });
  });

  describe('aggregateFolderPermission', () => {
    it('should call folderService.aggregateFolderPermission', async () => {
      const conditions = [{ $match: { folderId: 'folder123' } }];
      const expectedResult = [{ folderId: 'folder123', count: 5 }];

      documentService['folderService'].aggregateFolderPermission = jest.fn().mockResolvedValue(expectedResult);

      const result = await documentService.aggregateFolderPermission(conditions);

      expect(documentService['folderService'].aggregateFolderPermission).toHaveBeenCalledWith(conditions);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findPersonalDocuments', () => {
    it('should return personal documents for user', async () => {
      const userId = 'user123';
      const mockPermissions = [
        { documentId: 'doc1', refId: userId, role: 'owner' },
        { documentId: 'doc2', refId: userId, role: 'owner' }
      ];
      const mockDocuments = [
        { _id: 'doc1', name: 'Document 1', ownerId: userId },
        { _id: 'doc2', name: 'Document 2', ownerId: userId }
      ];

      documentService.getDocumentPermissionByConditions = jest.fn().mockResolvedValue(mockPermissions);
      documentService.findDocumentsByIds = jest.fn().mockResolvedValue(mockDocuments);

      const result = await documentService.findPersonalDocuments(userId);

      expect(documentService.getDocumentPermissionByConditions).toHaveBeenCalledWith({
        refId: userId,
        role: 'owner'
      });
      expect(documentService.findDocumentsByIds).toHaveBeenCalledWith(['doc1', 'doc2']);
      expect(result).toEqual(mockDocuments);
    });
  });

  describe('findOneById', () => {
    it('should return document by ID with projection', async () => {
      const id = 'doc123';
      const projection = { name: 1, ownerId: 1 };
      const mockDocument = {
        _id: { toHexString: () => 'doc123' },
        toObject: () => ({ name: 'Test Document', ownerId: 'user123' })
      };
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockDocument)
      };

      documentService['documentModel'].findById = jest.fn().mockReturnValue(mockQuery);

      const result = await documentService.findOneById(id, projection);

      expect(documentService['documentModel'].findById).toHaveBeenCalledWith(id, projection);
      expect(result).toEqual({ name: 'Test Document', ownerId: 'user123', _id: 'doc123' });
    });

    it('should return null when document not found', async () => {
      const id = 'doc456';
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null)
      };
      documentService['documentModel'].findById = jest.fn().mockReturnValue(mockQuery);

      const result = await documentService.findOneById(id);
      expect(documentService['documentModel'].findById).toHaveBeenCalledWith(id, undefined);
      expect(result).toBeNull();
    });
  });

  describe('findOneDocumentPermission', () => {
    it('should return document permission by condition', async () => {
      const condition = { documentId: 'doc123', refId: 'user123' };
      const mockPermission = {
        _id: { toHexString: () => 'perm123' },
        toObject: () => ({ documentId: 'doc123', refId: 'user123', role: 'owner' })
      };

      documentService['documentPermissionModel'].findOne = jest.fn().mockResolvedValue(mockPermission);

      const result = await documentService.findOneDocumentPermission(condition);

      expect(documentService['documentPermissionModel'].findOne).toHaveBeenCalledWith(condition);
      expect(result).toEqual({ documentId: 'doc123', refId: 'user123', role: 'owner', _id: 'perm123' });
    });

    it('should return null when permission not found', async () => {
      const condition = { documentId: 'doc456', refId: 'user456' };

      documentService['documentPermissionModel'].findOne = jest.fn().mockResolvedValue(null);

      const result = await documentService.findOneDocumentPermission(condition);

      expect(documentService['documentPermissionModel'].findOne).toHaveBeenCalledWith(condition);
      expect(result).toBeNull();
    });
  });

  describe('deleteManyDocumentById', () => {
    it('should delete documents by IDs with session', () => {
      const ids = ['doc1', 'doc2', 'doc3'];
      const session = {} as any;
      const expectedResult = [{ deletedCount: 3 }];

      const mockQuery = {
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ deletedCount: 3 })
      };

      documentService['documentModel'].deleteMany = jest.fn().mockReturnValue(mockQuery);

      const result = documentService.deleteManyDocumentById(ids, session);

      expect(documentService['documentModel'].deleteMany).toHaveBeenCalledWith({ _id: { $in: ids } });
      expect(mockQuery.session).toHaveBeenCalledWith(session);
      expect(result).resolves.toEqual(expectedResult);
    });

    it('should delete documents by IDs without session', () => {
      const ids = ['doc1', 'doc2'];
      const expectedResult = [{ deletedCount: 2 }];

      const mockQuery = {
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ deletedCount: 2 })
      };

      documentService['documentModel'].deleteMany = jest.fn().mockReturnValue(mockQuery);

      const result = documentService.deleteManyDocumentById(ids);

      expect(documentService['documentModel'].deleteMany).toHaveBeenCalledWith({ _id: { $in: ids } });
      expect(mockQuery.session).toHaveBeenCalledWith(null);
      expect(result).resolves.toEqual(expectedResult);
    });
  });

  describe('findDocumentsByFolderId', () => {
    it('should return documents by folder ID with projection', async () => {
      const folderId = 'folder123';
      const projection = { name: 1, ownerId: 1 };
      const mockDocuments = [
        {
          _id: { toHexString: () => 'doc1' },
          toObject: () => ({ name: 'Document 1', ownerId: 'user123', folderId: 'folder123' })
        },
        {
          _id: { toHexString: () => 'doc2' },
          toObject: () => ({ name: 'Document 2', ownerId: 'user456', folderId: 'folder123' })
        }
      ];

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockDocuments)
      };

      documentService['documentModel'].find = jest.fn().mockReturnValue(mockQuery);

      const result = await documentService.findDocumentsByFolderId(folderId, projection);

      expect(documentService['documentModel'].find).toHaveBeenCalledWith({ folderId }, projection);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: 'Document 1', ownerId: 'user123', folderId: 'folder123', _id: 'doc1' });
      expect(result[1]).toEqual({ name: 'Document 2', ownerId: 'user456', folderId: 'folder123', _id: 'doc2' });
    });
  });

  describe('findDocumentsByFolderIds', () => {
    it('should return documents by folder IDs without projection', async () => {
      const folderIds = ['folder3'];
      const mockDocuments = [
        {
          _id: { toHexString: () => 'doc4' },
          toObject: () => ({ name: 'Document 4', ownerId: 'user999', folderId: 'folder3' })
        }
      ];

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockDocuments)
      };

      documentService['documentModel'].find = jest.fn().mockReturnValue(mockQuery);

      const result = await documentService.findDocumentsByFolderIds(folderIds);

      expect(documentService['documentModel'].find).toHaveBeenCalledWith({ folderId: { $in: folderIds } }, undefined);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ name: 'Document 4', ownerId: 'user999', folderId: 'folder3', _id: 'doc4' });
    });
  });

  describe('getDocumentsInFolderPagination', () => {
    it('should return documents with pagination without projection', async () => {
      const params = {
        matchConditions: { ownerId: 'user123' },
        minimumQuantity: 3
      };
      const mockDocuments = [
        {
          _id: { toHexString: () => 'doc3' },
          toObject: () => ({ name: 'Document 3', ownerId: 'user123', lastAccess: new Date('2023-01-03') })
        }
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDocuments)
      };

      documentService['documentModel'].find = jest.fn().mockReturnValue(mockQuery);

      const result = await documentService.getDocumentsInFolderPagination(params);

      expect(documentService['documentModel'].find).toHaveBeenCalledWith(params.matchConditions, undefined);
      expect(mockQuery.sort).toHaveBeenCalledWith({ lastAccess: -1 });
      expect(mockQuery.limit).toHaveBeenCalledWith(params.minimumQuantity);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ name: 'Document 3', ownerId: 'user123', lastAccess: new Date('2023-01-03'), _id: 'doc3' });
    });
  });

  describe('checkFileNameIsExisted', () => {
    it('should return false when documentList is null or undefined', () => {
      const fileName = 'test-document.pdf';

      const result1 = documentService.checkFileNameIsExisted(fileName, null as any);
      const result2 = documentService.checkFileNameIsExisted(fileName, undefined as any);

      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });
  });

  describe('renameDocument', () => {
    beforeEach(() => {
      jest.spyOn(Utils, 'getFileNameWithoutExtension').mockImplementation((fileName: string) => {
        const lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
      });
      
      jest.spyOn(Utils, 'getExtensionFile').mockImplementation((fileName: string) => {
        const lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex > 0 ? fileName.substring(lastDotIndex + 1) : '';
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle filename without extension', () => {
      const fileName = 'document';
      
      const result = documentService.renameDocument(fileName);
      
      expect(Utils.getFileNameWithoutExtension).toHaveBeenCalledWith(fileName);
      expect(Utils.getExtensionFile).toHaveBeenCalledWith(fileName);
      expect(result).toBe('document (1)');
    });

    it('should increment number when filename already has a suffix', () => {
      const fileName = 'document (1).txt';
    
      const result = documentService.renameDocument(fileName);
    
      expect(Utils.getFileNameWithoutExtension).toHaveBeenCalledWith(fileName);
      expect(Utils.getExtensionFile).toHaveBeenCalledWith(fileName);
      expect(result).toBe('document (2).txt');
    });
    
  });

  describe('getDocumentNameAfterNaming', () => {
    beforeEach(() => {
      jest.spyOn(Utils, 'convertFileExtensionToPdf').mockImplementation((fileName: string) => {
        const lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) + '.pdf' : fileName + '.pdf';
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return original filename for Office mimetype without duplicates', async () => {
      const params = {
        clientId: 'user123',
        fileName: 'document.docx',
        documentFolderType: DocumentOwnerTypeEnum.PERSONAL,
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };

      const mockDocuments = [
        { name: 'other-document.pdf', folderId: null }
      ];

      documentService.findPersonalDocuments = jest.fn().mockResolvedValue(mockDocuments);

      const result = await documentService.getDocumentNameAfterNaming(params);

      expect(documentService.findPersonalDocuments).toHaveBeenCalledWith(params.clientId);
      expect(result).toBe('document.docx');
    });

    it('should convert non-Office file to PDF and rename if duplicate exists', async () => {
      const params = {
        clientId: 'user123',
        fileName: 'image.jpg',
        documentFolderType: DocumentOwnerTypeEnum.PERSONAL,
        mimetype: 'image/jpeg'
      };

      const mockDocuments = [
        { name: 'image.pdf', folderId: null }
      ];

      documentService.findPersonalDocuments = jest.fn().mockResolvedValue(mockDocuments);

      const result = await documentService.getDocumentNameAfterNaming(params);

      expect(Utils.convertFileExtensionToPdf).toHaveBeenCalledWith('image.jpg');
      expect(result).toBe('image (1).pdf');
    });

    it('should filter documents by folderId when provided', async () => {
      const params = {
        clientId: 'user123',
        fileName: 'document.pdf',
        documentFolderType: DocumentOwnerTypeEnum.ORGANIZATION,
        folderId: 'folder123'
      };

      const mockDocuments = [
        { name: 'document.pdf', folderId: { toHexString: () => 'folder123' } },
        { name: 'other-document.pdf', folderId: { toHexString: () => 'folder456' } }
      ];

      const mockPermissions = [
        { documentId: 'doc1' },
        { documentId: 'doc2' }
      ];

      jest.spyOn(documentService, 'getDocumentPermission').mockResolvedValue(mockPermissions as any);
      documentService.findDocumentsByIds = jest.fn().mockResolvedValue(mockDocuments);

      const result = await documentService.getDocumentNameAfterNaming(params);

      expect(documentService.getDocumentPermission).toHaveBeenCalledWith(params.clientId);
      expect(documentService.findDocumentsByIds).toHaveBeenCalledWith(['doc1', 'doc2']);
      expect(result).toBe('document (1).pdf');
    });

    it('should return original filename when no documents found', async () => {
      const params = {
        clientId: 'user123',
        fileName: 'document.pdf',
        documentFolderType: DocumentOwnerTypeEnum.PERSONAL
      };

      documentService.findPersonalDocuments = jest.fn().mockResolvedValue([]);

      const result = await documentService.getDocumentNameAfterNaming(params);

      expect(result).toBe('document.pdf');
    });

    it('should handle TEAM document folder type', async () => {
      const params = {
        clientId: 'user123',
        fileName: 'document.pdf',
        documentFolderType: DocumentOwnerTypeEnum.TEAM
      };

      const mockPermissions = [
        { documentId: 'doc1' },
        { documentId: 'doc2' }
      ];

      const mockDocuments = [
        { name: 'document.pdf', folderId: null }
      ];

      jest.spyOn(documentService, 'getDocumentPermission').mockResolvedValue(mockPermissions as any);
      documentService.findDocumentsByIds = jest.fn().mockResolvedValue(mockDocuments);

      const result = await documentService.getDocumentNameAfterNaming(params);

      expect(documentService.getDocumentPermission).toHaveBeenCalledWith(params.clientId);
      expect(documentService.findDocumentsByIds).toHaveBeenCalledWith(['doc1', 'doc2']);
      expect(result).toBe('document (1).pdf');
    });

    it('should return converted pdf name when documentFolderType is unknown', async () => {
      const params = {
        clientId: 'user123',
        fileName: 'weirdfile.txt',
        documentFolderType: 'UNKNOWN_TYPE',
        mimetype: 'text/plain'
      };
      const result = await documentService.getDocumentNameAfterNaming(params);
      expect(result).toBe('weirdfile.pdf');
    });

    it('should safely handle documents without folderId when folderId param is provided', async () => {
      const params = {
        clientId: 'user123',
        fileName: 'report.pdf',
        documentFolderType: DocumentOwnerTypeEnum.ORGANIZATION,
        folderId: 'folder123'
      };
      const mockPermissions = [
        { documentId: 'doc1' }
      ];
      const mockDocuments = [
        { name: 'report.pdf', folderId: null }
      ];
    
      jest.spyOn(documentService, 'getDocumentPermission').mockResolvedValue(mockPermissions as any);
      documentService.findDocumentsByIds = jest.fn().mockResolvedValue(mockDocuments);
    
      const result = await documentService.getDocumentNameAfterNaming(params);
      expect(result).toBe('report.pdf'); 
    });
  });

  describe('updateShareSetting', () => {
    it('should update share setting and return updated document', async () => {
      const documentId = 'doc123';
      const permission = 'read';
      const linkType = 'public';

      const mockUpdatedDocument = {
        _id: { toHexString: () => 'doc123' },
        toObject: () => ({
          name: 'Document',
          shareSetting: {
            permission: 'read',
            linkType: 'public'
          }
        })
      };

      documentService['documentModel'].findOneAndUpdate = jest.fn().mockResolvedValue(mockUpdatedDocument);
      const result = await documentService.updateShareSetting(documentId, permission, linkType);

      expect(documentService['documentModel'].findOneAndUpdate).toHaveBeenCalledWith(
        { _id: documentId },
        {
          $set: {
            'shareSetting.permission': permission,
            'shareSetting.linkType': linkType,
          },
        },
        { new: true }
      );
      expect(result).toEqual({
        name: 'Document',
        shareSetting: {
          permission: 'read',
          linkType: 'public'
        },
        _id: 'doc123'
      });
    });

    it('should return null if no document is found', async () => {
      const documentId = 'docNotExist';
      const permission = 'read';
      const linkType = 'public';
  
      documentService['documentModel'].findOneAndUpdate = jest
        .fn()
        .mockResolvedValue(null);
  
      const result = await documentService.updateShareSetting(
        documentId,
        permission,
        linkType,
      );
  
      expect(
        documentService['documentModel'].findOneAndUpdate,
      ).toHaveBeenCalledWith(
        { _id: documentId },
        {
          $set: {
            'shareSetting.permission': permission,
            'shareSetting.linkType': linkType,
          },
        },
        { new: true },
      );
      expect(result).toBeNull();
    });
  });

  describe('updateDocument', () => {
    it('should work without session parameter', async () => {
      const documentId = 'doc123';
      const updatedProperties = { name: 'Updated Document' };
      const expectedResult = { _id: 'doc123', name: 'Updated Document' };

      documentService['documentSharedService'].updateDocument = jest.fn().mockResolvedValue(expectedResult);

      const result = await documentService.updateDocument(documentId, updatedProperties);

      expect(documentService['documentSharedService'].updateDocument).toHaveBeenCalledWith(documentId, updatedProperties, null);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('upsertDocument', () => {
    it('should upsert document and return updated document', async () => {
      const documentId = 'doc123';
      const updatedProperties = { name: 'Upserted Document', ownerId: 'user123' };

      const mockUpdatedDocument = {
        _id: { toHexString: () => 'doc123' },
        toObject: () => ({
          name: 'Upserted Document',
          ownerId: 'user123',
          lastAccess: new Date()
        })
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockUpdatedDocument)
      };

      documentService['documentModel'].findOneAndUpdate = jest.fn().mockReturnValue(mockQuery);

      const result = await documentService.upsertDocument(documentId, updatedProperties);

      expect(documentService['documentModel'].findOneAndUpdate).toHaveBeenCalledWith(
        { _id: documentId },
        {
          $set: {
            ...updatedProperties,
          },
        },
        { upsert: true }
      );
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual({
        name: 'Upserted Document',
        ownerId: 'user123',
        lastAccess: expect.any(Date),
        _id: 'doc123'
      });
    });

    it('should return null when document not found and upsert fails', async () => {
      const documentId = 'doc123';
      const updatedProperties = { name: 'Upserted Document' };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null)
      };

      documentService['documentModel'].findOneAndUpdate = jest.fn().mockReturnValue(mockQuery);

      const result = await documentService.upsertDocument(documentId, updatedProperties);

      expect(documentService['documentModel'].findOneAndUpdate).toHaveBeenCalledWith(
        { _id: documentId },
        {
          $set: {
            ...updatedProperties,
          },
        },
        { upsert: true }
      );
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('createDocuments', () => {
    it('should create documents without options parameter', async () => {
      const documents = [
        { name: 'Document 1', ownerId: 'user123', remoteId: 'remote1', service: ThirdPartyService.google, mimeType: 'application/pdf' }
      ];

      const mockInsertedDocuments = [
        {
          _id: { toHexString: () => 'doc1' },
          toObject: () => ({
            name: 'Document 1',
            ownerId: 'user123',
            lastAccess: Date.now()
          })
        }
      ];

      documentService['documentModel'].insertMany = jest.fn().mockResolvedValue(mockInsertedDocuments);

      const result = await documentService.createDocuments(documents);

      expect(documentService['documentModel'].insertMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Document 1',
            ownerId: 'user123',
            lastAccess: expect.any(Number)
          })
        ]),
        undefined
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Document 1',
        ownerId: 'user123',
        lastAccess: expect.any(Number),
        _id: 'doc1'
      });
    });
  });

  describe('deleteDocument', () => {
    it('should delete document and return deleted document with string _id', async () => {
      const documentId = 'doc123';
      const queryOptions = { lean: true };
      const session = {} as ClientSession;
      const mockDeletedDocument = {
        _id: { toHexString: () => 'doc123' },
        toObject: () => ({ name: 'Document to delete', ownerId: 'user123' })
      };

      documentService['documentModel'].findOneAndDelete = jest.fn().mockReturnValue({
        session: jest.fn().mockResolvedValue(mockDeletedDocument)
      });

      const result = await documentService.deleteDocument(documentId, queryOptions, session);

      expect(documentService['documentModel'].findOneAndDelete).toHaveBeenCalledWith({ _id: documentId }, queryOptions);
      expect(result).toEqual({
        name: 'Document to delete',
        ownerId: 'user123',
        _id: 'doc123'
      });
    });

    it('should return null when document not found', async () => {
      const documentId = 'doc123';

      documentService['documentModel'].findOneAndDelete = jest.fn().mockReturnValue({
        session: jest.fn().mockResolvedValue(null)
      });

      const result = await documentService.deleteDocument(documentId);

      expect(result).toBeNull();
    });
  });

  describe('deleteRemoteThumbnail', () => {
    it('should delete thumbnail with simple remoteId', async () => {
      const remoteId = 'thumbnail123';

      documentService['awsService'].removeThumbnail = jest.fn().mockResolvedValue(undefined);

      await documentService.deleteRemoteThumbnail(remoteId);

      expect(documentService['awsService'].removeThumbnail).toHaveBeenCalledWith(remoteId);
    });

    it('should delete thumbnail with URL remoteId', async () => {
      const remoteId = 'https://example.com/bucket/folder/thumbnail123.jpg';

      documentService['awsService'].removeThumbnail = jest.fn().mockResolvedValue(undefined);

      await documentService.deleteRemoteThumbnail(remoteId);

      expect(documentService['awsService'].removeThumbnail).toHaveBeenCalledWith('folder/thumbnail123.jpg');
    });

    it('should return early when remoteId is empty', async () => {
      const remoteId = '';

      documentService['awsService'].removeThumbnail = jest.fn().mockResolvedValue(undefined);

      await documentService.deleteRemoteThumbnail(remoteId);

      expect(documentService['awsService'].removeThumbnail).not.toHaveBeenCalled();
    });
  });

  describe('deleteManyRemoteThumbnail', () => {
    it('should delete multiple thumbnails with simple remoteIds', async () => {
      const remoteIds = ['thumbnail1', 'thumbnail2', 'thumbnail3'];

      documentService['awsService'].removeManyThumbnail = jest.fn().mockResolvedValue(undefined);

      await documentService.deleteManyRemoteThumbnail(remoteIds);

      expect(documentService['awsService'].removeManyThumbnail).toHaveBeenCalledWith(['thumbnail1', 'thumbnail2', 'thumbnail3']);
    });

    it('should delete multiple thumbnails with URL remoteIds', async () => {
      const remoteIds = [
        'https://example.com/bucket/folder1/thumb1.jpg',
        'https://example.com/bucket/folder2/thumb2.png',
        'simple-thumb3'
      ];

      documentService['awsService'].removeManyThumbnail = jest.fn().mockResolvedValue(undefined);

      await documentService.deleteManyRemoteThumbnail(remoteIds);

      expect(documentService['awsService'].removeManyThumbnail).toHaveBeenCalledWith([
        'folder1/thumb1.jpg',
        'folder2/thumb2.png',
        'simple-thumb3'
      ]);
    });
  });

  describe('getDocumentPermissionsByDocId', () => {
    it('should return document permissions with projection', async () => {
      const documentId = 'doc123';
      const condition = { role: 'VIEWER' };
      const projection = { refId: 1, role: 1 };
      const mockPermissions = [
        {
          _id: { toHexString: () => 'perm1' },
          toObject: () => ({ refId: 'user123', role: 'VIEWER' })
        },
        {
          _id: { toHexString: () => 'perm2' },
          toObject: () => ({ refId: 'user456', role: 'EDITOR' })
        }
      ];

      documentService['documentPermissionModel'].find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPermissions)
      });

      const result = await documentService.getDocumentPermissionsByDocId(documentId, condition, projection);

      expect(documentService['documentPermissionModel'].find).toHaveBeenCalledWith(
        { documentId, ...condition },
        projection
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        refId: 'user123',
        role: 'VIEWER',
        _id: 'perm1'
      });
    });
  });
  
  describe('getDocumentPermission', () => {
    it('should return a list of document permissions', async () => {
      const refId = 'user123';
      const mockPermissions = [
        {
          _id: { toHexString: () => 'perm1' },
          toObject: () => ({ refId: 'user123', documentId: 'doc123', role: 'VIEWER' })
        },
        {
          _id: { toHexString: () => 'perm2' },
          toObject: () => ({ refId: 'user123', documentId: 'doc123', role: 'EDITOR' })
        }
      ];
  
      documentService['documentPermissionModel'].find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPermissions)
      });
  
      const result = await documentService.getDocumentPermission(refId);
  
      expect(documentService['documentPermissionModel'].find).toHaveBeenCalledWith({ refId });
      expect(result).toEqual([
        { refId: 'user123', documentId: 'doc123', role: 'VIEWER', _id: 'perm1' },
        { refId: 'user123', documentId: 'doc123', role: 'EDITOR', _id: 'perm2' }
      ]);
    });
  });

  describe('getOneDocumentPermission', () => {
    it('should return single document permission with projection', async () => {
      const refId = 'user123';
      const condition = { documentId: 'doc123' };
      const projection = { role: 1 };
      const mockPermission = {
        _id: { toHexString: () => 'perm1' },
        toObject: () => ({ refId: 'user123', documentId: 'doc123', role: 'VIEWER' })
      };

      documentService['documentPermissionModel'].findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPermission)
      });

      const result = await documentService.getOneDocumentPermission(refId, condition, projection);

      expect(documentService['documentPermissionModel'].findOne).toHaveBeenCalledWith(
        { refId, ...condition },
        projection
      );
      expect(result).toEqual({
        refId: 'user123',
        documentId: 'doc123',
        role: 'VIEWER',
        _id: 'perm1'
      });
    });

    it('should return null when permission not found', async () => {
      const refId = 'user123';
      const condition = { documentId: 'doc123' };

      documentService['documentPermissionModel'].findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      const result = await documentService.getOneDocumentPermission(refId, condition);

      expect(result).toBeNull();
    });
  });

  describe('getDocumentByConditions', () => {
    it('should return document by documentId with default conditions', async () => {
      const documentId = 'doc123';
      const mockDocument = {
        _id: { toHexString: () => 'doc123' },
        toObject: () => ({ _id: 'doc123', name: 'Test Document', ownerId: 'user123' })
      };

      documentService['documentModel'].findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocument)
      });

      const result = await documentService.getDocumentByConditions(documentId);

      expect(documentService['documentModel'].findOne).toHaveBeenCalledWith(
        { _id: documentId, ...{} }
      );
      expect(result).toEqual({
        _id: 'doc123',
        name: 'Test Document',
        ownerId: 'user123'
      });
    });

    it('should return null when document not found', async () => {
      const documentId = 'doc123';
      const conditions = { ownerId: 'user123' };

      documentService['documentModel'].findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      const result = await documentService.getDocumentByConditions(documentId, conditions);

      expect(result).toBeNull();
    });
  });
  
  describe('getDocumentsByConditions', () => {
    it('should return documents with projection and options', async () => {
      const conditions = { ownerId: 'user123' };
      const projection = { name: 1, ownerId: 1 };
      const options = { limit: 10 };
      const mockDocuments = [
        {
          _id: { toHexString: () => 'doc1' },
          toObject: () => ({ name: 'Document 1', ownerId: 'user123' })
        },
        {
          _id: { toHexString: () => 'doc2' },
          toObject: () => ({ name: 'Document 2', ownerId: 'user123' })
        }
      ];

      documentService['documentModel'].find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocuments)
      });

      const result = await documentService.getDocumentsByConditions(conditions, projection, options);

      expect(documentService['documentModel'].find).toHaveBeenCalledWith(conditions, projection, options);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'Document 1',
        ownerId: 'user123',
        _id: 'doc1'
      });
    });

    it('should return documents without projection and options', async () => {
      const conditions = { ownerId: 'user123' };
      const mockDocuments = [];

      documentService['documentModel'].find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocuments)
      });

      const result = await documentService.getDocumentsByConditions(conditions);

      expect(documentService['documentModel'].find).toHaveBeenCalledWith(conditions, undefined, {});
      expect(result).toHaveLength(0);
    });
  });

  describe('getDocumentPermissionsPagination', () => {
    it('should return document permissions for pagination', async () => {
      const refId = 'user123';
      const conditions = { role: 'VIEWER' };
      const mockPermissions = [
        {
          _id: { toHexString: () => 'perm1' },
          toObject: () => ({ refId: 'user123', role: 'VIEWER' })
        }
      ];

      documentService['documentPermissionModel'].find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPermissions)
      });

      const result = await documentService.getDocumentPermissionsPagination(refId, conditions);

      expect(documentService['documentPermissionModel'].find).toHaveBeenCalledWith({ refId, ...conditions });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        refId: 'user123',
        role: 'VIEWER',
        _id: 'perm1'
      });
    });
  });

  describe('getDocumentPermissionByConditions', () => {
    let documentService: DocumentService;
  
    beforeEach(() => {
      documentService = new (class {
        documentPermissionModel = {
          find: jest.fn().mockReturnThis(),
          exec: jest.fn()
        };
        getDocumentPermissionByConditions = DocumentService.prototype.getDocumentPermissionByConditions;
      })() as any;
    });
  
    it('should return mapped document permissions with _id as string', async () => {
      const mockPermissions = [
        {
          _id: { toHexString: () => '507f1f77bcf86cd799439011' },
          role: 'editor',
          toObject: jest.fn().mockReturnValue({ role: 'editor' })
        },
        {
          _id: { toHexString: () => '507f1f77bcf86cd799439012' },
          role: 'viewer',
          toObject: jest.fn().mockReturnValue({ role: 'viewer' })
        }
      ];
  
      ((documentService as any).documentPermissionModel.exec as jest.Mock).mockResolvedValue(mockPermissions);
  
      const conditions = { role: 'editor' };
      const result = await documentService.getDocumentPermissionByConditions(conditions);
  
      expect((documentService as any).documentPermissionModel.find).toHaveBeenCalledWith(conditions, undefined);
      expect((documentService as any).documentPermissionModel.exec).toHaveBeenCalled();
      expect(result).toEqual([
        { role: 'editor', _id: '507f1f77bcf86cd799439011' },
        { role: 'viewer', _id: '507f1f77bcf86cd799439012' }
      ]);
    });
  });

  describe('getDocumentPermissionInBatch', () => {
    it('should log warning and set redis when totalBatch >= threshold', async () => {
      (documentService as any).loggerService = { warn: jest.fn((log) => { const _ = log.context }) };
      (documentService as any).redisService = { setKeyIfNotExist: jest.fn().mockResolvedValue('OK') };
      const mockCursor = {
        eachAsync: jest.fn().mockImplementation(async (cb, options) => {
          expect(options).toEqual({ batchSize: 1000 });
          const totalBatches = 5; 
          for (let i = 0; i < totalBatches; i++) {
            await cb([{ _id: { toHexString: () => `id${i}` }, refId: `user${i}`, role: 'viewer' }]);
          }
        }),
      };
      Object.defineProperty(documentService, 'documentPermissionModel', {
        value: {
          find: jest.fn().mockReturnValue({
            batchSize: jest.fn().mockReturnThis(),
            lean: jest.fn().mockReturnThis(),
            cursor: jest.fn().mockReturnValue(mockCursor),
          }),
        },
      });
    
      const warnSpy = jest.spyOn(documentService['loggerService'], 'warn');
      const redisSpy = jest.spyOn(documentService['redisService'], 'setKeyIfNotExist');
      const result = await documentService.getDocumentPermissionInBatch({ docId: 'doc123' });
      expect(result.length).toBe(5);
      expect(warnSpy).toHaveBeenCalled(); 
      expect(redisSpy).toHaveBeenCalled();
      expect(redisSpy).toHaveBeenCalledWith(
        'debug:document-permission-batch',
        expect.any(String),
        expect.any(String)
      );
    });
  });   
  
  describe('getDocumentInPermissionPagination', () => {
    it('should return documents with permission pagination', async () => {
      const permissionArray = ['doc1', 'doc2'];
      const conditions = { ownerId: 'user123' };
      const limit = 5;
      const mockDocuments = [
        {
          _id: { toHexString: () => 'doc1' },
          toObject: () => ({ name: 'Document 1', ownerId: 'user123' })
        }
      ];

      documentService['documentModel'].find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDocuments)
      });

      const result = await documentService.getDocumentInPermissionPagination(permissionArray, conditions, limit);

      expect(documentService['documentModel'].find).toHaveBeenCalledWith(
        { $and: [{ _id: { $in: permissionArray } }, { ownerId: 'user123' }] },
        { annotations: 0 }
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Document 1',
        ownerId: 'user123',
        _id: 'doc1'
      });
    });

    it('should return documents without conditions', async () => {
      const permissionArray = ['doc1'];
      const conditions = {};
      const limit = 5;
      const mockDocuments = [];

      documentService['documentModel'].find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDocuments)
      });

      const result = await documentService.getDocumentInPermissionPagination(permissionArray, conditions, limit);

      expect(documentService['documentModel'].find).toHaveBeenCalledWith(
        { _id: { $in: permissionArray } },
        { annotations: 0 }
      );
      expect(result).toHaveLength(0);
    });
  });

  describe('createDocumentPermissionsUpsert', () => {
    it('should create document permissions with upsert', async () => {
      const documentPermissions = [
        { refId: 'user123', documentId: 'doc123', role: 'VIEWER' },
        { refId: 'user456', documentId: 'doc123', role: 'EDITOR' }
      ];
      const expectedBulkWriteOps = [
        {
          updateOne: {
            filter: { refId: 'user123', documentId: 'doc123' },
            update: { refId: 'user123', documentId: 'doc123', role: 'VIEWER' },
            upsert: true,
            new: true,
            setDefaultsOnInsert: false,
          },
        },
        {
          updateOne: {
            filter: { refId: 'user456', documentId: 'doc123' },
            update: { refId: 'user456', documentId: 'doc123', role: 'EDITOR' },
            upsert: true,
            new: true,
            setDefaultsOnInsert: false,
          },
        },
      ];

      documentService['documentPermissionModel'].bulkWrite = jest.fn().mockResolvedValue({ result: { ok: 1 } });

      const result = await documentService.createDocumentPermissionsUpsert(documentPermissions);

      expect(documentService['documentPermissionModel'].bulkWrite).toHaveBeenCalledWith(expectedBulkWriteOps);
      expect(result).toEqual({ result: { ok: 1 } });
    });
  });

  describe('updateDocumentPermissionNonLuminUser', () => {
    beforeEach(() => {
      (documentService as any).loggerService = { 
        error: jest.fn() 
      };
    });
  
    it('should update document permission for non-lumin user', async () => {
      const query = { documentId: 'doc123', email: 'test@example.com' };
      const role = 'VIEWER';
      documentService['documentSharedNonUserModel'].updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
      const result = await documentService.updateDocumentPermissionNonLuminUser(query, role);
  
      expect(documentService['documentSharedNonUserModel'].updateOne).toHaveBeenCalledWith(
        query,
        { $set: { role } },
        { upsert: true }
      );
      expect(result).toEqual({ modifiedCount: 1 });
    });
  
    it('should log error when updateOne throws', async () => {
      const query = { documentId: 'doc123', email: 'test@example.com' };
      const role = 'VIEWER';
      const mockError = new Error('Update failed');
      documentService['documentSharedNonUserModel'].updateOne = jest.fn().mockRejectedValue(mockError);
      const result = await documentService.updateDocumentPermissionNonLuminUser(query, role);
  
      expect(documentService['documentSharedNonUserModel'].updateOne).toHaveBeenCalledWith(
        query,
        { $set: { role } },
        { upsert: true }
      );
      expect(documentService['loggerService'].error).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('getNonLuminDocumentPermissions', () => {
    it('should return non-lumin document permissions with conditions', async () => {
      const conditions = { documentId: 'doc123' };
      const projection = { email: 1, role: 1 };
      
      const mockPermissions = [
        {
          toObject: () => ({ email: 'test@example.com', role: 'viewer', documentId: 'doc123' }),
          _id: { toHexString: () => 'perm1' }
        }
      ];
      
      const mockFind = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPermissions)
      });
      
      (documentService as any).documentSharedNonUserModel = {
        find: mockFind
      };
      
      const result = await documentService.getNonLuminDocumentPermissions(conditions, projection);

      expect(mockFind).toHaveBeenCalledWith(conditions, projection);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
    });
  });

  describe('getTeamOwnerDocumentPermission', () => {
    beforeEach(() => {
      documentService['documentPermissionModel'].findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          toObject: () => ({ refId: 'user456', documentId: 'doc456', role: 'ORGANIZATION_TEAM' }),
          _id: { toHexString: () => 'permission456' }
        })
      });
    });

    it('should return team owner document permission with projection', async () => {
      const documentId = 'doc456';
      const projection = { refId: 1, role: 1 };
  
      const result = await documentService.getTeamOwnerDocumentPermission(documentId, projection);
  
      expect(result).toBeDefined();
      expect(result).toEqual({
        refId: 'user456',
        documentId: 'doc456',
        role: 'ORGANIZATION_TEAM',
        _id: 'permission456'
      });
      expect(documentService['documentPermissionModel'].findOne).toHaveBeenCalledWith(
        { documentId, role: { $in: [DocumentRoleEnum.ORGANIZATION_TEAM] } },
        projection
      );
    });
  
    it('should return null when no team owner permission found', async () => {
      const documentId = 'nonexistent';
  
      documentService['documentPermissionModel'].findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });
  
      const result = await documentService.getTeamOwnerDocumentPermission(documentId);
  
      expect(result).toBeNull();
    });
  });
  

  describe('getOrganizationOwnerDocumentPermission', () => {
    beforeEach(() => {
      documentService['documentPermissionModel'].findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          toObject: () => ({ refId: 'user123', documentId: 'doc123', role: 'ORGANIZATION' }),
          _id: { toHexString: () => 'permission123' }
        })
      });
    });

    it('should return organization owner document permission with projection', async () => {
      const conditions = { documentId: 'doc123', role: 'ORGANIZATION' };
      const projection = { refId: 1, role: 1 };
      
      const result = await documentService.getOrganizationOwnerDocumentPermission(conditions, projection);

      expect(result).toBeDefined();
    });

    it('should return null when no permission found', async () => {
      const conditions = { documentId: 'nonexistent', role: 'ORGANIZATION' };
      
      documentService['documentPermissionModel'].findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });
      
      const result = await documentService.getOrganizationOwnerDocumentPermission(conditions);

      expect(result).toBeNull();
    });
  });

  describe('getOwnerDocumentPermission', () => {
    beforeEach(() => {
      documentService['documentPermissionModel'].findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          toObject: () => ({ refId: 'user123', documentId: 'doc123', role: 'owner' }),
          _id: { toHexString: () => 'permission123' }
        })
      });
    });

    it('should return owner document permission', async () => {
      const documentId = 'doc123';
      
      const result = await documentService.getOwnerDocumentPermission(documentId);

      expect(result).toBeDefined();
    });

    it('should return null when no owner permission found', async () => {
      const documentId = 'nonexistent';
      
      documentService['documentPermissionModel'].findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });
      
      const result = await documentService.getOwnerDocumentPermission(documentId);

      expect(result).toBeNull();
    });
  });

  describe('getDocumentPermissionByGroupRole', () => {
    beforeEach(() => {
      documentService['documentPermissionModel'].findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          toObject: () => ({ refId: 'user123', documentId: 'doc123', role: 'VIEWER' }),
          _id: { toHexString: () => 'permission123' }
        })
      });
    });

    it('should return document permission by group role', async () => {
      const documentId = 'doc123';
      const roles = ['VIEWER', 'EDITOR'];
      
      const result = await documentService.getDocumentPermissionByGroupRole(documentId, roles);

      expect(result).toBeDefined();
    });

    it('should return null when no permission found for group role', async () => {
      const documentId = 'doc123';
      const roles = ['ADMIN'];
      
      documentService['documentPermissionModel'].findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });
      
      const result = await documentService.getDocumentPermissionByGroupRole(documentId, roles);

      expect(result).toBeNull();
    });
  });

  describe('getAllDocumentPermissionByGroupRole', () => {
    it('should return empty array when no permissions found', async () => {
      const documentIds = ['nonexistent1', 'nonexistent2'];
      const roles = ['ADMIN'];
      (documentService as any).documentPermissionModel = {
        find: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      };
      const result = await documentService.getAllDocumentPermissionByGroupRole(documentIds, roles);
  
      expect(result).toEqual([]);
    });
  
    it('should return mapped document permissions when permissions found', async () => {
      const documentIds = ['doc1', 'doc2'];
      const roles = ['ADMIN'];
      const mockDoc = {
        _id: { toHexString: () => 'mocked-id' },
        refId: 'user1',
        role: 'ADMIN',
        toObject: () => ({ refId: 'user1', role: 'ADMIN' }),
      };
      (documentService as any).documentPermissionModel = {
        find: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockDoc]),
        }),
      };
  
      const result = await documentService.getAllDocumentPermissionByGroupRole(documentIds, roles);
  
      expect(result).toEqual([{ refId: 'user1', role: 'ADMIN', _id: 'mocked-id' }]);
      expect(documentService['documentPermissionModel'].find).toHaveBeenCalledWith({
        documentId: { $in: documentIds },
        role: { $in: roles },
      });
    });
  });
  

  describe('createDocumentPermissions', () => {
    beforeEach(() => {
      documentService['documentPermissionModel'].insertMany = jest.fn().mockResolvedValue([
        {
          toObject: () => ({ refId: 'user123', documentId: 'doc123', role: 'VIEWER' }),
          _id: { toHexString: () => 'permission123' }
        },
        {
          toObject: () => ({ refId: 'user456', documentId: 'doc123', role: 'EDITOR' }),
          _id: { toHexString: () => 'permission456' }
        }
      ]);
    });

    it('should create multiple document permissions', async () => {
      const documentPermissions = [
        { refId: 'user123', documentId: 'doc123', role: 'VIEWER' },
        { refId: 'user456', documentId: 'doc123', role: 'EDITOR' }
      ];
      const options = { session: null };
      
      const result = await documentService.createDocumentPermissions(documentPermissions, options);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('createDocumentPermission', () => {
    beforeEach(() => {
      documentService['documentPermissionModel'].create = jest.fn().mockResolvedValue({
        toObject: () => ({ refId: 'user123', documentId: 'doc123', role: 'VIEWER' }),
        _id: { toHexString: () => 'permission123' }
      });
    });

    it('should create a single document permission', async () => {
      const documentPermission = {
        refId: 'user123',
        documentId: 'doc123',
        role: 'VIEWER'
      };
      
      const result = await documentService.createDocumentPermission(documentPermission);

      expect(documentService['documentPermissionModel'].create).toHaveBeenCalledWith(documentPermission);
      expect(result).toEqual({
        refId: 'user123',
        documentId: 'doc123',
        role: 'VIEWER',
        _id: 'permission123'
      });
    });


    it('should return null when create returns null', async () => {
      (documentService as any).documentPermissionModel = {
        create: jest.fn().mockResolvedValue(null),
      };
      const documentPermission = {
        refId: 'user123',
        documentId: 'doc123',
        role: 'VIEWER'
      };
      const result = await documentService.createDocumentPermission(documentPermission);

      expect(documentService['documentPermissionModel'].create).toHaveBeenCalledWith(documentPermission);
      expect(result).toBeNull();
    });
  });

  describe('formatBookmarkForDocument', () => {
    it('should format bookmark for document with valid input', () => {
      const document = {
        name: 'Test Document',
        _id: 'doc123',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        bookmarks: JSON.stringify([
          {
            bookmark: { 'user@example.com': 'Test message' },
            page: 1
          }
        ])
      };
      
      const result = documentService.formatBookmarkForDocument(document);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should return bookmarks as is when bookmarks is null', () => {
      const document = {
        name: 'Test Document',
        _id: 'doc123',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        bookmarks: null
      };
      const result = documentService.formatBookmarkForDocument(document);
  
      expect(result).toBeNull();
    });
  });

  describe('getDocumentByDocumentId', () => {
    it('should return document by document ID with projection', async () => {
      const documentId = 'doc123';
      const projection = { name: 1, createdAt: 1 };
      
      const result = await documentService.getDocumentByDocumentId(documentId, projection);

      expect(result).toBeDefined();
    });
  });

  describe('getDocumentByRemoteId', () => {
    beforeEach(() => {
      documentService['documentModel'].findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          toObject: () => ({ name: 'test', remoteId: 'remote123' }),
          _id: { toHexString: () => 'doc123' }
        })
      });
    });

    it('should return document by remote ID', async () => {
      const documentRemoteId = 'remote123';
      const clientId = 'client123';
      
      const result = await documentService.getDocumentByRemoteId(documentRemoteId, clientId);

      expect(result).toBeDefined();
    });

    it('should return null when document not found by remote ID', async () => {
      const documentRemoteId = 'nonexistent';
      const clientId = 'client123';
      
      documentService['documentModel'].findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });
      
      const result = await documentService.getDocumentByRemoteId(documentRemoteId, clientId);

      expect(result).toBeNull();
    });
  });

  describe('getDocumentsByRemoteId', () => {
    it('should map documents with toObject and toHexString', async () => {
      const documentRemoteId = 'remote123';
      const clientIds = ['client123'];
      const fakeId = {
        toHexString: jest.fn().mockReturnValue('hex123'),
      };
      const fakeDoc: any = {
        _id: fakeId,
        toObject: jest.fn().mockReturnValue({ name: 'testDoc', remoteId: documentRemoteId }),
      };
      (documentService as any).documentModel = {
        find: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([fakeDoc]),
      };
  
      const result = await documentService.getDocumentsByRemoteId(documentRemoteId, clientIds);
  
      expect(result).toEqual([
        { name: 'testDoc', remoteId: documentRemoteId, _id: 'hex123' },
      ]);
  
      expect(fakeDoc.toObject).toHaveBeenCalled();
      expect(fakeId.toHexString).toHaveBeenCalled();
    });
  });

  describe('isRestrictedFromRemovingSharer', () => {
    const document = {
      ownerId: 'owner123',
      isPersonal: true,
    } as unknown as IDocument;
  
    const ownerUser = { _id: 'owner123' } as User;
    const anotherUser = { _id: 'user456' } as User;
  
    it('should return true if trying to remove the document owner', () => {
      const userPermission = { role: DocumentRoleEnum.SHARER } as IDocumentPermission;
      const result = documentService.isRestrictedFromRemovingSharer(document, ownerUser, userPermission, ownerUser);
      expect(result).toBe(true);
    });
  
    it('should return true if removing a sharer but current user is not the owner and document is personal', () => {
      const userPermission = { role: DocumentRoleEnum.SHARER } as IDocumentPermission;
      const result = documentService.isRestrictedFromRemovingSharer(document, anotherUser, userPermission, anotherUser);
      expect(result).toBe(true);
    });
  });
  
  describe('deleteDocumentPermission', () => {
    beforeEach(() => {
      documentService['documentPermissionModel'].findOneAndRemove = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          toObject: () => ({ refId: 'user123', documentId: 'doc123', role: 'VIEWER' }),
          _id: { toHexString: () => 'permission123' },
          refId: 'user123',
          documentId: 'doc123',
          role: 'VIEWER'
        })
      });
    });
  
    it('should delete document permission', async () => {
      const conditions = { documentId: 'doc123', refId: 'user123' };
      const result = await documentService.deleteDocumentPermission(conditions);
      expect(result).toBeDefined();
      expect(result._id).toBe('permission123');
    });
  
    it('should return null if no permission found', async () => {
      (documentService['documentPermissionModel'].findOneAndRemove as jest.Mock).mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null)
      });
  
      const conditions = { documentId: 'doc123', refId: 'user456' };
      const result = await documentService.deleteDocumentPermission(conditions);
      expect(result).toBeNull();
    });
  });

  describe('deleteDocumentPermissions', () => {
    it('should delete document permissions', async () => {
      const conditions = { documentId: 'doc123' };
      const mockResult = { deletedCount: 5 };
      
      documentService['documentPermissionModel'].deleteMany = jest.fn().mockReturnValue({
        session: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockResult)
        })
      });

      const result = await documentService.deleteDocumentPermissions(conditions);

      expect(documentService['documentPermissionModel'].deleteMany).toHaveBeenCalledWith(conditions);
      expect(result).toBeDefined();
    });
  });

  describe('findDocumentForms', () => {
    it('should find document forms with default conditions', async () => {
      const mockForms = [
        { 
          toObject: () => ({ id: '1', name: 'Form 1' }),
          _id: { toHexString: () => 'form1' }
        }
      ];
      documentService['documentFormModel'].find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockForms)
      });

      const result = await documentService.findDocumentForms();

      expect(documentService['documentFormModel'].find).toHaveBeenCalledWith({});
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('form1');
    });
  });

  describe('findDocumentFormById', () => {
    it('should find document form by id', async () => {
      const id = 'form123';
      const mockForm = { 
        toObject: () => ({ id, name: 'Test Form' }),
        _id: { toHexString: () => 'form123' }
      };
      documentService['documentFormModel'].findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockForm)
      });

      const result = await documentService.findDocumentFormById(id);

      expect(documentService['documentFormModel'].findById).toHaveBeenCalledWith(id, undefined);
      expect(result._id).toBe('form123');
    });

    it('should return null if document form not found', async () => {
      const id = 'form456';
      documentService['documentFormModel'].findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });
      const result = await documentService.findDocumentFormById(id);
  
      expect(documentService['documentFormModel'].findById).toHaveBeenCalledWith(id, undefined);
      expect(result).toBeNull();
    });
  });

  describe('findFormFromStrapi', () => {
    it('should find form from strapi', async () => {
      const id = 'strapi123';
      const mockForm = { id, name: 'Strapi Form' };
      documentService['formTemplatesService'].getFormById = jest.fn().mockResolvedValue(mockForm);

      const result = await documentService.findFormFromStrapi(id);

      expect(documentService['formTemplatesService'].getFormById).toHaveBeenCalledWith(id, undefined);
      expect(result).toEqual(mockForm);
    });
  });

  describe('findDocumentFormByDomain', () => {
    it('should find document forms by domain', async () => {
      const domain = 'example.com';
      const mockForms = [
        { 
          toObject: () => ({ id: '1', domain }),
          _id: { toHexString: () => 'form1' }
        }
      ];
      documentService['documentFormModel'].find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockForms)
      });
      documentService['environmentService'].getByKey = jest.fn().mockReturnValue('form1,form2');

      const result = await documentService.findDocumentFormByDomain(domain);

      expect(documentService['documentFormModel'].find).toHaveBeenCalledWith({ _id: { $in: ['form1', 'form2'] } }, undefined);
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('form1');
    });
  });

  describe('updateRateDocumentForm', () => {
    it('should update rate document form', async () => {
      const id = 'form123';
      const updateObj = { rate: 5 };
      const mockForm = { 
        toObject: () => ({ id, rate: 5 }),
        _id: { toHexString: () => 'form123' }
      };
      documentService['documentFormModel'].findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockForm)
      });

      const result = await documentService.updateRateDocumentForm(id, updateObj);

      expect(documentService['documentFormModel'].findOneAndUpdate).toHaveBeenCalledWith(
        { _id: id },
        {
          $set: updateObj,
          $inc: { rateCount: 1 }
        },
        { new: true }
      );
      expect(result._id).toBe('form123');
    });

    it('should return null if document form not found', async () => {
      const id = 'form456';
      const updateObj = { rate: 4 };
      documentService['documentFormModel'].findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });
      const result = await documentService.updateRateDocumentForm(id, updateObj);
  
      expect(documentService['documentFormModel'].findOneAndUpdate).toHaveBeenCalledWith(
        { _id: id },
        {
          $set: updateObj,
          $inc: { rateCount: 1 }
        },
        { new: true }
      );
      expect(result).toBeNull();
    });
  });

  describe('updateDocumentPermission', () => {
    it('should update document permission', async () => {
      const condition = { documentId: 'doc123' };
      const updateProperties = { role: 'editor' };
      const mockPermission = { documentId: 'doc123', role: 'editor' };
      documentService['documentPermissionModel'].findOneAndUpdate = jest.fn().mockResolvedValue(mockPermission);

      const result = await documentService.updateDocumentPermission(condition, updateProperties);

      expect(documentService['documentPermissionModel'].findOneAndUpdate).toHaveBeenCalledWith(condition, updateProperties, undefined);
      expect(result).toEqual(mockPermission);
    });
  });

  describe('getDocumentFormByConditionAndPagination', () => {
    it('should get document forms with pagination', async () => {
      const condition = { domain: 'example.com' };
      const skip = 0;
      const limit = 10;
      const mockForms = [{ id: '1', domain: 'example.com' }];
      documentService['documentFormModel'].find = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockForms)
        })
      });

      const result = await documentService.getDocumentFormByConditionAndPagination(condition, skip, limit);

      expect(documentService['documentFormModel'].find).toHaveBeenCalledWith(condition);
      expect(result).toEqual(mockForms);
    });
  });

  describe('aggregateDocumentPermission', () => {
    it('should aggregate document permissions', async () => {
      const conditions = [{ $match: { documentId: 'doc123' } }];
      const mockResult = [{ documentId: 'doc123', count: 5 }];
      documentService['documentPermissionModel'].aggregate = jest.fn().mockResolvedValue(mockResult);

      const result = await documentService.aggregateDocumentPermission(conditions);

      expect(documentService['documentPermissionModel'].aggregate).toHaveBeenCalledWith(conditions);
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateDocumentPermissionInOrg', () => {
    it('should update document permission in org', async () => {
      const conditions = { refId: 'org123' };
      const updateFields = { role: 'organization_team' };
      const mockPermission = { refId: 'org123', role: 'organization_team' };
      documentService['documentPermissionModel'].findOneAndUpdate = jest.fn().mockResolvedValue(mockPermission);

      const result = await documentService.updateDocumentPermissionInOrg(conditions, updateFields);

      expect(documentService['documentPermissionModel'].findOneAndUpdate).toHaveBeenCalledWith(
        { role: { $in: ['organization', 'organization_team'] }, ...conditions },
        { $set: updateFields },
        { new: true }
      );
      expect(result).toEqual(mockPermission);
    });
  });

  describe('updateAllDocumentPermissionInOrg', () => {
    it('should update all document permissions in org', async () => {
      const orgId = 'org123';
      const updateFields = { role: 'organization_team' };
      const mockResult = { modifiedCount: 5 };
      documentService['documentPermissionModel'].updateMany = jest.fn().mockResolvedValue(mockResult);

      const result = await documentService.updateAllDocumentPermissionInOrg(orgId, updateFields);

      expect(documentService['documentPermissionModel'].updateMany).toHaveBeenCalledWith(
        { refId: orgId, role: 'organization' },
        updateFields
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getDocumentDriveMetadata', () => {
    it('should get document drive metadata', async () => {
      const documentId = 'doc123';
      const remoteId = 'remote123';
      const mockMetadata = { 
        toObject: () => ({ documentId, remoteId, driveType: 'google' }),
        _id: { toHexString: () => 'metadata123' }
      };
      documentService['documentDriveMetadataModel'].findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMetadata)
      });

      const result = await documentService.getDocumentDriveMetadata(documentId, remoteId);

      expect(documentService['documentDriveMetadataModel'].findOne).toHaveBeenCalledWith({ documentId, remoteId });
      expect(result._id).toBe('metadata123');
    });

    it('should return null if metadata not found', async () => {
      const documentId = 'doc456';
      const remoteId = 'remote456';
      documentService['documentDriveMetadataModel'].findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });
      const result = await documentService.getDocumentDriveMetadata(documentId, remoteId);
  
      expect(documentService['documentDriveMetadataModel'].findOne).toHaveBeenCalledWith({ documentId, remoteId });
      expect(result).toBeNull();
    });
  });

  describe('getDocumentDrivesMetadata', () => {
    it('should get document drives metadata', async () => {
      const filter = { documentId: 'doc123' };
      const mockMetadata = [
        { 
          toObject: () => ({ documentId: 'doc123', driveType: 'google' }),
          _id: { toHexString: () => 'metadata123' }
        }
      ];
      documentService['documentDriveMetadataModel'].find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMetadata)
      });

      const result = await documentService.getDocumentDrivesMetadata(filter);

      expect(documentService['documentDriveMetadataModel'].find).toHaveBeenCalledWith(filter);
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('metadata123');
    });
  });

  describe('deleteManyDocumentDriveMetadata', () => {
    it('should delete many document drive metadata', async () => {
      const filter = { documentId: 'doc123' };
      const mockResult = { deletedCount: 3 };
      documentService['documentDriveMetadataModel'].deleteMany = jest.fn().mockReturnValue({
        session: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockResult)
        })
      });

      const result = await documentService.deleteManyDocumentDriveMetadata(filter);

      expect(documentService['documentDriveMetadataModel'].deleteMany).toHaveBeenCalledWith(filter);
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateDocumentDriveMetadata', () => {
    it('should update document drive metadata', async () => {
      const filter = { documentId: 'doc123' };
      const update = { driveType: 'onedrive' };
      const mockMetadata = { 
        toObject: () => ({ documentId: 'doc123', driveType: 'onedrive' }),
        _id: { toHexString: () => 'metadata123' }
      };
      documentService['documentDriveMetadataModel'].findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMetadata)
      });

      const result = await documentService.updateDocumentDriveMetadata(filter, update);

      expect(documentService['documentDriveMetadataModel'].findOneAndUpdate).toHaveBeenCalledWith(filter, update, {});
      expect(result._id).toBe('metadata123');
    });

    it('should return null if metadata not found', async () => {
      const filter = { documentId: 'doc456' };
      const update = { driveType: 'google' };
      documentService['documentDriveMetadataModel'].findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });
      const result = await documentService.updateDocumentDriveMetadata(filter, update);
  
      expect(documentService['documentDriveMetadataModel'].findOneAndUpdate).toHaveBeenCalledWith(filter, update, {});
      expect(result).toBeNull();
    });
  });

  describe('bulkUpdateManyDocumentRemoteEmail', () => {
    it('should bulk update many document remote emails', async () => {
      const updateData = {
        conditions: {
          remoteEmails: ['old@example.com'],
          ownerIds: ['owner1']
        },
        updatedObj: {
          newRemoteEmails: ['new@example.com']
        }
      };
      const mockResult = { modifiedCount: 2 };
      documentService['documentModel'].bulkWrite = jest.fn().mockResolvedValue(mockResult);

      const result = await documentService.bulkUpdateManyDocumentRemoteEmail(updateData);

      expect(documentService['documentModel'].bulkWrite).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('getAllOwnedDocumentPermissionsOfUsers', () => {
    it('should get all owned document permissions of users', async () => {
      const userIds = ['user1', 'user2'];
      const mockPermissions = [
        { 
          toObject: () => ({ userId: 'user1', role: 'owner' }),
          _id: { toHexString: () => 'permission123' }
        }
      ];
      documentService['documentPermissionModel'].find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPermissions)
      });

      const result = await documentService.getAllOwnedDocumentPermissionsOfUsers(userIds);

      expect(documentService['documentPermissionModel'].find).toHaveBeenCalledWith({
        refId: { $in: userIds },
        role: 'owner'
      });
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('permission123');
    });
  });

  describe('getRoleText', () => {
    it('should return correct role text for spectator', () => {
      const result = documentService.getRoleText('spectator' as any);
      expect(result).toBe('View');
    });

    it('should return default role text for unknown role', () => {
      const result = documentService.getRoleText('unknown_role' as any);
      expect(result).toBe('View');
    });
  });

  describe('removePermissionInGroupPermissions', () => {
    it('should remove permission in group permissions', async () => {
      const userId = 'user123';
      const orgId = 'org123';
      const mockResult = { modifiedCount: 1 };
      documentService['documentPermissionModel'].updateMany = jest.fn().mockResolvedValue(mockResult);

      const result = await documentService.removePermissionInGroupPermissions(userId, orgId);

      expect(documentService['documentPermissionModel'].updateMany).toHaveBeenCalledWith(
        { refId: orgId },
        { $unset: { 'groupPermissions.user123': 1 } }
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getTotalItemsOfCollectionByCondition', () => {
    it('should get total items of collection by condition', async () => {
      const condition = { domain: 'example.com' };
      const mockCount = 10;
      documentService['documentFormModel'].countDocuments = jest.fn().mockResolvedValue(mockCount);

      const result = await documentService.getTotalItemsOfCollectionByCondition(condition);

      expect(documentService['documentFormModel'].countDocuments).toHaveBeenCalledWith(condition);
      expect(result).toBe(mockCount);
    });

    it('should return estimated document count if condition is empty', async () => {
      const mockEstimated = 50;
      documentService['documentFormModel'].estimatedDocumentCount = jest.fn().mockResolvedValue(mockEstimated);
      const result = await documentService.getTotalItemsOfCollectionByCondition({});
  
      expect(documentService['documentFormModel'].estimatedDocumentCount).toHaveBeenCalled();
      expect(result).toBe(mockEstimated);
    });
  });

  describe('createDocumentForm', () => {
    it('should create document form', async () => {
      const documentForm = { name: 'Test Form', domain: 'example.com' };
      const mockForm = { 
        toObject: () => ({ id: 'form123', ...documentForm }),
        _id: { toHexString: () => 'form123' }
      };
      documentService['documentFormModel'].create = jest.fn().mockResolvedValue(mockForm);

      const result = await documentService.createDocumentForm(documentForm);

      expect(documentService['documentFormModel'].create).toHaveBeenCalledWith(documentForm);
      expect(result._id).toBe('form123');
    });
  });

  describe('deleteRemoteDocument', () => {
    it('should delete S3 remote document', async () => {
      const document = {
        service: 's3',
        remoteId: 'remote123'
      } as any;
      
      documentService['awsService'].removeDocument = jest.fn().mockResolvedValue(undefined);
      
      await documentService.deleteRemoteDocument(document);

      expect(documentService['awsService'].removeDocument).toHaveBeenCalledWith('remote123');
    });

    it('should delete Google remote document with temporary remote id', async () => {
      const document = {
        service: 'google',
        remoteId: 'remote123',
        temporaryRemoteId: 'tempRemote123'
      } as any;
      
      documentService['awsService'].removeDocument = jest.fn().mockResolvedValue(undefined);
      
      await documentService.deleteRemoteDocument(document);

      expect(documentService['awsService'].removeDocument).toHaveBeenCalledWith('tempRemote123');
    });

    it('should do nothing for unknown service', async () => {
      const document = {
        service: 'dropbox',
        remoteId: 'remote456'
      } as any;
      documentService['awsService'].removeDocument = jest.fn();

      await documentService.deleteRemoteDocument(document);
      expect(documentService['awsService'].removeDocument).not.toHaveBeenCalled();
    });
  });

  describe('deleteManyRemoteDocument', () => {
    it('should delete many S3 remote documents', async () => {
      const documents = [
        { service: 's3', remoteId: 'remote123' },
        { service: 's3', remoteId: 'remote456' },
        { service: 'google', remoteId: 'remote789' }
      ] as any[];
      
      documentService['awsService'].removeManyDocument = jest.fn().mockResolvedValue(undefined);
      
      await documentService.deleteManyRemoteDocument(documents);

      expect(documentService['awsService'].removeManyDocument).toHaveBeenCalledWith(['remote123', 'remote456']);
    });
  });

  describe('verifyUploadFiles', () => {
    it('should verify upload files', () => {
      const files = [
        { mimetype: 'application/pdf' },
        { mimetype: 'image/jpeg' }
      ];
      
      const result = documentService.verifyUploadFiles(files);

      expect(result).toBe(true);
    });
  });

  describe('verifyUploadThumbnailsSize', () => {
    it('should verify all valid thumbnail sizes', () => {
      const files = [
        { 
          size: 0.5 * 1024 * 1024,
          mimetype: 'image/jpeg',
          filename: 'thumb1.jpg',
          filesize: 0.5 * 1024 * 1024,
          fileBuffer: Buffer.from('test')
        },
        { 
          size: 0.25 * 1024 * 1024,
          mimetype: 'image/png',
          filename: 'thumb2.png',
          filesize: 0.25 * 1024 * 1024,
          fileBuffer: Buffer.from('test')
        }
      ];
      
      const result = documentService.verifyUploadThumbnailsSize(files);

      expect(result).toBe(true);
    });
  });

  describe('getPagesNeedUpdateAnnot', () => {
    it('should handle boundary case - single page document with INSERT_BLANK_PAGE', () => {
      const data = {
        type: 'INSERT_BLANK_PAGE',
        totalPages: 1,
        option: {
          insertPages: [1]
        }
      };
      
      const result = documentService.getPagesNeedUpdateAnnot(data);

      expect(result).toEqual({
        'page="0"': 'page="1"'
      });
    });

    it('should handle MOVE_PAGE type - moving to first position', () => {
      const data = {
        type: 'MOVE_PAGE',
        option: {
          pagesToMove: '3',
          insertBeforePage: '1'
        }
      };
      
      const result = documentService.getPagesNeedUpdateAnnot(data);

      expect(result).toEqual({
        'page="0"': 'page="1"',
        'page="1"': 'page="2"',
        'page="2"': 'page="0"'
      });
    });

    it('should handle MOVE_PAGE type - moving to last position', () => {
      const data = {
        type: 'MOVE_PAGE',
        option: {
          pagesToMove: '1',
          insertBeforePage: '5'
        }
      };
      
      const result = documentService.getPagesNeedUpdateAnnot(data);

      expect(result).toEqual({
        'page="0"': 'page="4"',
        'page="1"': 'page="0"',
        'page="2"': 'page="1"',
        'page="3"': 'page="2"',
        'page="4"': 'page="3"'
      });
    });

    it('should handle MERGE_PAGE type with single page merge', () => {
      const data = {
        type: 'MERGE_PAGE',
        option: {
          numberOfPageToMerge: 1,
          positionToMerge: 2,
          totalPagesBeforeMerge: 3
        }
      };
      
      const result = documentService.getPagesNeedUpdateAnnot(data);

      expect(result).toEqual({
        'page="1"': 'page="2"',
        'page="2"': 'page="3"'
      });
    });

    it('should handle empty data object', () => {
      const data = {};
      
      const result = documentService.getPagesNeedUpdateAnnot(data);

      expect(result).toEqual({});
    });

    it('should handle boundary case - single page document with REMOVE_PAGE', () => {
      const data = {
        type: 'REMOVE_PAGE',
        totalPages: 1,
        option: {
          pagesRemove: [1]
        }
      };
      
      const result = documentService.getPagesNeedUpdateAnnot(data);

      expect(result).toEqual({
        'page="1"': 'page="0"',
        'page="2"': 'page="1"'
      });
    });
  });

  describe('getPagesNeedUpdate', () => {
    it('should return correct mapping for MOVE_PAGE when moving forward', () => {
      const data = {
        type: 'MOVE_PAGE',
        option: { pagesToMove: 2, insertBeforePage: 4 }
      };
      const template = 'page=';
      const result = documentService.getPagesNeedUpdate(data, template);
      
      expect(result).toEqual({
        'page="2"': 'page="4"',
        'page="3"': 'page="2"',
        'page="4"': 'page="3"'
      });
    });

    it('should return correct mapping for MOVE_PAGE when moving backward', () => {
      const data = {
        type: 'MOVE_PAGE',
        option: { pagesToMove: 4, insertBeforePage: 2 }
      };
      const template = 'page=';
      const result = documentService.getPagesNeedUpdate(data, template);
      
      expect(result).toEqual({
        'page="2"': 'page="3"',
        'page="3"': 'page="4"',
        'page="4"': 'page="2"'
      });
    });

    it('should handle REMOVE_PAGE with multiple pages and HYPERLINK template', () => {
      const data = {
        type: 'REMOVE_PAGE',
        totalPages: 5,
        option: { pagesRemove: [2, 4] }
      };
      const template = 'Page=';
      const result = documentService.getPagesNeedUpdate(data, template);
      
      expect(result).toEqual({
        'Page="2"': 'Page="0"',
        'Page="3"': 'Page="2"',
        'Page="4"': 'Page="0"',
        'Page="5"': 'Page="3"',
        'Page="6"': 'Page="4"'
      });
    });

    it('should handle MERGE_PAGE with different template', () => {
      const data = {
        type: 'MERGE_PAGE',
        option: { 
          numberOfPageToMerge: 1, 
          positionToMerge: 1, 
          totalPagesBeforeMerge: 3 
        }
      };
      const template = 'Page=';
      const result = documentService.getPagesNeedUpdate(data, template);
      
      expect(result).toEqual({
        'Page="1"': 'Page="2"',
        'Page="2"': 'Page="3"',
        'Page="3"': 'Page="4"'
      });
    });

    it('should return empty object for unknown type', () => {
      const data = {
        type: 'UNKNOWN_TYPE',
        option: {}
      };
      const template = 'page=';
      const result = documentService.getPagesNeedUpdate(data, template);
      
      expect(result).toEqual({});
    });

    it('should handle edge case with single page document', () => {
      const data = {
        type: 'INSERT_BLANK_PAGE',
        totalPages: 1,
        option: { insertPages: [1] }
      };
      const template = 'page=';
      const result = documentService.getPagesNeedUpdate(data, template);
      
      expect(result).toEqual({
        'page="1"': 'page="2"'
      });
    });
  });

  describe('eraseBookmark', () => {
    it('should remove bookmark for a page', () => {
      const option = { pagesRemove: [2] };
      const bookmarks = JSON.stringify([{ page: 1 }, { page: 2 }, { page: 3 }]);
      const result = documentService.eraseBookmark(option, bookmarks);
      expect(typeof result).toBe('string');
    });

    it('should handle empty bookmarks', () => {
      const option = { pagesRemove: [2] };
      const bookmarks = null;
      const result = documentService.eraseBookmark(option, bookmarks);
  
      expect(result).toBe('[]');
    });
  });

  describe('publishUpdateDocument', () => {
    it('should call pubSub.publish with document bookmark channel name when publishType is SUBSCRIPTION_DOCUMENT_BOOKMARK', () => {
      const emitMock = jest.fn();
      const publishMock = jest.fn();
      Object.defineProperty(documentService, 'messageGateway', { value: { emit: emitMock } });
      Object.defineProperty(documentService, 'pubSub', { value: { publish: publishMock } });
      
      const payload = { documentId: 'doc123', document: { ownerId: 'owner123' } };
      documentService.publishUpdateDocument(['receiver123'], payload, 'updateBookmark');
      
      expect(publishMock).toHaveBeenCalledWith('updateBookmark.receiver123.doc123', expect.any(Object));
    });

    it('should handle payload without document ownerId', () => {
      const emitMock = jest.fn();
      const publishMock = jest.fn();
      Object.defineProperty(documentService, 'messageGateway', { value: { emit: emitMock } });
      Object.defineProperty(documentService, 'pubSub', { value: { publish: publishMock } });
      
      const payload = { documentId: 'doc123', someData: 'test' };
      documentService.publishUpdateDocument(['receiver123'], payload, 'updateBookmark');
      
      expect(publishMock).toHaveBeenCalledWith(
        'updateBookmark.receiver123.doc123',
        {
          updateBookmark: {
            statusCode: 200,
            clientId: 'receiver123',
            teamId: '',
            organizationId: '',
            ownerId: '',
            documentId: 'doc123',
            someData: 'test'
          }
        }
      );
    });
  });

  describe('publishDeleteOriginalDocument', () => {
    it('should call messageGateway.emit', () => {
      const emitMock = jest.fn();
      const publishMock = jest.fn();
      Object.defineProperty(documentService, 'messageGateway', { value: { emit: emitMock } });
      Object.defineProperty(documentService, 'pubSub', { value: { publish: publishMock } });
      documentService.publishDeleteOriginalDocument(['id'], { a: 1 }, 'type');
      expect(publishMock).toHaveBeenCalled();
    });
  });

  describe('publishDocumentSharingQueue', () => {
    it('should call messageGateway.emit', () => {
      const emitMock = jest.fn();
      const publishMock = jest.fn();
      Object.defineProperty(documentService, 'messageGateway', { value: { emit: emitMock } });
      Object.defineProperty(documentService, 'pubSub', { value: { publish: publishMock } });
      documentService.publishDocumentSharingQueue(['id'], { a: 1 });
      expect(publishMock).toHaveBeenCalled();
    });
  });

  describe('isOverTimeLimit', () => {
    it('should return boolean', () => {
      Object.defineProperty(documentService, 'documentTimeLimit', { value: '1 day' });
      const result = documentService.isOverTimeLimit('2020-01-01T00:00:00Z');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getRoleTextEmail', () => {
    it('should return string for known role', () => {
      const result = documentService.getRoleTextEmail('editor' as any);
      expect(typeof result).toBe('string');
    });

    it('should return "Viewer" for unknown role', () => {
      const result = documentService.getRoleTextEmail('unknown' as any);
      expect(result).toBe('Viewer');
    });
  });

  describe('hasDocumentBeenLimited', () => {
    beforeEach(() => {
      Object.defineProperty(documentService, 'documentTimeLimit', { value: '1 day' });
    });

    it('should return false when document is not over time limit', async () => {
      jest.spyOn(documentService, 'isOverTimeLimit').mockReturnValue(false);
      const document = { 
        _id: 'doc123', 
        createdAt: '2023-01-01T00:00:00Z',
        shareSetting: { linkType: 'INVITED' }
      } as any;
      
      const result = await documentService.hasDocumentBeenLimited(document);
      expect(result).toBe(false);
      expect(documentService.isOverTimeLimit).toHaveBeenCalledWith('2023-01-01T00:00:00Z');
    });

    it('should handle different ShareLinkType values', async () => {
      jest.spyOn(documentService, 'isOverTimeLimit').mockReturnValue(true);
      
      const mockDocPermission = { id: 'permission123', role: 'owner' };
      jest.spyOn(documentService, 'getDocumentPermissionByGroupRole').mockResolvedValue(mockDocPermission as any);
      jest.spyOn(documentService, 'getPremiumDocumentMapping').mockResolvedValue(true);
      
      const documentInvited = { 
        _id: 'doc123', 
        createdAt: '2023-01-01T00:00:00Z',
        shareSetting: { linkType: 'INVITED' }
      } as any;
      
      const resultInvited = await documentService.hasDocumentBeenLimited(documentInvited);
      expect(resultInvited).toBe(true);
      
      const documentAnyone = { 
        _id: 'doc123', 
        createdAt: '2023-01-01T00:00:00Z',
        shareSetting: { linkType: 'ANYONE' }
      } as any;
      
      const resultAnyone = await documentService.hasDocumentBeenLimited(documentAnyone);
      expect(resultAnyone).toBe(false);
    });
  });

  describe('createNonLuminShared', () => {
    it('should call documentSharedNonUserModel.create', async () => {
      Object.defineProperty(documentService, 'documentSharedNonUserModel', { value: { create: jest.fn().mockResolvedValue([]) } });
      const result = await documentService.createNonLuminShared({ documentId: 'id', emails: [], role: 'viewer', sharerId: 'sharer', message: '' });
      expect(Array.isArray(result)).toBe(true);
    });

    it('should call findOneAndUpdate for each email', async () => {
      const mockUpdate = { 
        toObject: () => ({ email: 'a@example.com', documentId: 'id', role: 'viewer' }),
        _id: { toHexString: () => 'shared123' }
      };
  
      Object.defineProperty(documentService, 'documentSharedNonUserModel', { 
        value: { 
          findOneAndUpdate: jest.fn().mockResolvedValue(mockUpdate) 
        } 
      });
  
      const emails = ['a@example.com'];
      const result = await documentService.createNonLuminShared({
        documentId: 'id',
        emails,
        role: 'viewer',
        sharerId: 'sharer',
        message: ''
      });
  
      expect(documentService['documentSharedNonUserModel'].findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(result[0]._id).toBe('shared123');
    });

    it('should filter out null updatePermission', async () => {
      Object.defineProperty(documentService, 'documentSharedNonUserModel', { 
        value: { findOneAndUpdate: jest.fn().mockResolvedValue(null) } 
      });
  
      const emails = ['a@example.com'];
      const result = await documentService.createNonLuminShared({
        documentId: 'id',
        emails,
        role: 'viewer',
        sharerId: 'sharer',
        message: ''
      });
  
      expect(result).toEqual([]);
    });
  });

  describe('getSharedNonUserInvitationsBySharer', () => {
    it('should map sharedNonUserDocuments correctly', async () => {
      const mockDoc = { 
        toObject: () => ({ email: 'email@example.com', documentId: 'doc123' }),
        _id: { toHexString: () => 'shared123' }
      };
      Object.defineProperty(documentService, 'documentSharedNonUserModel', { 
        value: { find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockDoc]) }) } 
      });
  
      const result = await documentService.getSharedNonUserInvitationsBySharer('email@example.com');
  
      expect(result.length).toBe(1);
      expect(result[0]._id).toBe('shared123');
      expect(result[0].email).toBe('email@example.com');
    });
  });

  describe('deleteDocumentNonLuminUser', () => {
    let mockModel: any;
  
    beforeEach(() => {
      mockModel = {
        deleteMany: jest.fn().mockReturnValue({
          session: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({ deletedCount: 2 }),
          }),
        }),
      };
      Object.defineProperty(documentService, 'documentSharedNonUserModel', {
        value: mockModel,
        writable: false,
      });
    });
  
    it('should call deleteMany with conditions and return result', async () => {
      const conditions = { email: 'user@example.com' };
      const result = await documentService.deleteDocumentNonLuminUser(conditions);
  
      expect(mockModel.deleteMany).toHaveBeenCalledWith(conditions);
      expect(result).toEqual({ deletedCount: 2 });
    });
  });

  describe('findNonUserByDocumentId', () => {
    it('should map nonUserDocuments correctly', async () => {
      const mockDoc = { 
        toObject: () => ({ email: 'email@example.com', documentId: 'doc123' }),
        _id: { toHexString: () => 'nonuser123' }
      };
      Object.defineProperty(documentService, 'documentSharedNonUserModel', { 
        value: { find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockDoc]) }) } 
      });
  
      const result = await documentService.findNonUserByDocumentId('doc123', /test/);
  
      expect(result.length).toBe(1);
      expect(result[0]._id).toBe('nonuser123');
      expect(result[0].email).toBe('email@example.com');
    });
  });

  describe('findNonUserByDocIdAndEmail', () => {
    it('should call documentSharedNonUserModel.findOne', async () => {
      const mockDoc = { toObject: () => ({ id: '1' }), _id: { toHexString: () => 'doc1' } };
      Object.defineProperty(documentService, 'documentSharedNonUserModel', { value: { findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockDoc) }) } });
      const result = await documentService.findNonUserByDocIdAndEmail('doc', 'email');
      expect(result).toBeDefined();
    });

    it('should return null if document not found', async () => {
      Object.defineProperty(documentService, 'documentSharedNonUserModel', { 
        value: { findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }) } 
      });
      const result = await documentService.findNonUserByDocIdAndEmail('doc', 'unknown@example.com');
      expect(result).toBeNull();
    });
  });

  describe('createNonLuminUserDocumentPermission', () => {
    it('should create document permissions for shared non-lumin users', async () => {
      const fakeUser = { _id: 'user1', email: 'user@example.com' } as any;
      const sharedDoc = { documentId: 'doc123', role: 'VIEWER', teamId: 'team1' };
  
      documentService.getSharedNonUserInvitationsBySharer = jest.fn().mockResolvedValue([sharedDoc]);
      documentService.getDocumentByDocumentId = jest.fn().mockResolvedValue({ id: 'doc123' });
      documentService.getDocumentPermissionByConditions = jest.fn().mockResolvedValue([]);
      documentService.deleteDocumentNonLuminUser = jest.fn().mockResolvedValue(undefined);
      documentService.createDocumentPermissions = jest.fn().mockResolvedValue([{ documentId: 'doc123', refId: 'user1', role: 'viewer' }]);
  
      const result = await documentService.createNonLuminUserDocumentPermission({
        user: fakeUser,
        orgIds: [],
        teamIds: [],
      });
  
      expect(documentService.getSharedNonUserInvitationsBySharer).toHaveBeenCalledWith('user@example.com');
      expect(documentService.getDocumentByDocumentId).toHaveBeenCalledWith('doc123');
      expect(documentService.getDocumentPermissionByConditions).toHaveBeenCalled();
      expect(documentService.createDocumentPermissions).toHaveBeenCalled();
      expect(result[0].refId).toBe('user1');
    });
  
    it('should not push permission if conditions fail', async () => {
      const fakeUser = { _id: 'user1', email: 'user@example.com' } as any;
      const sharedDoc = { documentId: 'doc123', role: 'VIEWER', teamId: 'team1' };
  
      documentService.getSharedNonUserInvitationsBySharer = jest.fn().mockResolvedValue([sharedDoc]);
      documentService.getDocumentByDocumentId = jest.fn().mockResolvedValue(null);
      documentService.getDocumentPermissionByConditions = jest.fn().mockResolvedValue([]);
      documentService.deleteDocumentNonLuminUser = jest.fn().mockResolvedValue(undefined);
      documentService.createDocumentPermissions = jest.fn().mockResolvedValue([]);
  
      const result = await documentService.createNonLuminUserDocumentPermission({
        user: fakeUser,
        orgIds: [],
        teamIds: [],
      });
  
      expect(result).toEqual([]);
    });

    it('should handle undefined teamId without throwing', async () => {
      const fakeUser = { _id: 'user1', email: 'user@example.com' } as any;
      const sharedDoc = { documentId: 'doc123', role: 'VIEWER', teamId: undefined };
    
      documentService.getSharedNonUserInvitationsBySharer = jest.fn().mockResolvedValue([sharedDoc]);
      documentService.getDocumentByDocumentId = jest.fn().mockResolvedValue({ id: 'doc123' });
      documentService.getDocumentPermissionByConditions = jest.fn().mockResolvedValue([]);
      documentService.deleteDocumentNonLuminUser = jest.fn().mockResolvedValue(undefined);
      documentService.createDocumentPermissions = jest.fn().mockResolvedValue([{ documentId: 'doc123', refId: 'user1', role: 'viewer' }]);
    
      const result = await documentService.createNonLuminUserDocumentPermission({
        user: fakeUser,
        orgIds: [],
        teamIds: [],
      });
    
      expect(result.length).toBe(1);
    });
  });

  describe('shareDocumentToLuminUser', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        shareDocumentToLuminUser = DocumentService.prototype.shareDocumentToLuminUser;
        verifyUserToUpdateDocumentPermission = jest.fn();
        seperateShareInvitations = jest.fn();
        updateManyDocumentPermission = jest.fn();
        createDocumentPermissionsUpsert = jest.fn();
        getRequestAccessDocument = jest.fn();
        removeRequestsAfterPermissionChanged = jest.fn();
        sendShareDocumentEmail = jest.fn();
        sendShareDocumentNotification = jest.fn();
        publishShareDocument = jest.fn();
        sendUpdateDocumentPermissionNotification = jest.fn();
        getDocumentScope = jest.fn();
        userService = {
          findVerifiedUsersByEmail: jest.fn(),
          findUsers: jest.fn(),
          findUserById: jest.fn()
        };
        eventService = {
          createEvent: jest.fn()
        };
        messageGateway = {
          server: {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn()
          }
        };
        documentPermissionModel = {
          find: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([])
        };
      })() as any;
    });

    it('should handle group permissions when present', async () => {
      const userInvitations = [
        {
          _id: '507f1f77bcf86cd799439011',
          email: 'user1@test.com',
          hasPermission: false,
          permissionType: 'TEAM' as any,
          role: null,
          refId: '507f1f77bcf86cd799439013'
        }
      ];
      const role = DocumentRole.EDITOR;
      const sharer = { _id: 'sharer123' } as any;
      const message = 'Test message';
      const document = { _id: 'doc123' } as any;

      const verifiedUsers = [
        { ...userInvitations[0], userStatus: SearchUserStatus.USER_VALID }
      ];

      const seperateResult = {
        groupPermissions: { '507f1f77bcf86cd799439013': { role: 'editor' } },
        personalPermissions: [],
        newPermissions: [],
        existedPermissions: []
      };

      (documentService.verifyUserToUpdateDocumentPermission as jest.Mock)
        .mockResolvedValue({ status: SearchUserStatus.USER_VALID });
      (documentService.seperateShareInvitations as jest.Mock).mockReturnValue(seperateResult);
      ((documentService as any).userService.findVerifiedUsersByEmail as jest.Mock).mockResolvedValue([]);
      ((documentService as any).userService.findUsers as jest.Mock).mockResolvedValue([]);
      (documentService.getRequestAccessDocument as jest.Mock).mockResolvedValue([]);

      await documentService.shareDocumentToLuminUser({
        userInvitations,
        role,
        sharer,
        message,
        document
      });

      expect(documentService.updateManyDocumentPermission).toHaveBeenCalledWith(
        { documentId: 'doc123', role: { $in: expect.any(Array) } },
        [{ $addFields: { groupPermissions: { '507f1f77bcf86cd799439013': { role: 'editor' } } } }]
      );
    });

    it('should handle unverified users and send appropriate emails', async () => {
      const userInvitations = [
        {
          _id: '507f1f77bcf86cd799439011',
          email: 'user1@test.com',
          hasPermission: false,
          permissionType: 'PERSONAL' as any,
          role: null,
          refId: null
        }
      ];
      const role = DocumentRole.VIEWER;
      const sharer = { _id: 'sharer123' } as any;
      const message = 'Test message';
      const document = { _id: 'doc123' } as any;

      const verifiedUsers = [
        { ...userInvitations[0], userStatus: SearchUserStatus.USER_VALID }
      ];

      const seperateResult = {
        groupPermissions: {},
        personalPermissions: [
          { _id: '507f1f77bcf86cd799439011', email: 'user1@test.com', refId: '507f1f77bcf86cd799439011' }
        ],
        newPermissions: [
          { _id: '507f1f77bcf86cd799439011', email: 'user1@test.com' }
        ],
        existedPermissions: []
      };

      const verifiedUserList = [];
      const unverifiedUsers = [
        { _id: '507f1f77bcf86cd799439011', email: 'user1@test.com', isVerified: false }
      ];

      (documentService.verifyUserToUpdateDocumentPermission as jest.Mock)
        .mockResolvedValue({ status: SearchUserStatus.USER_VALID });
      (documentService.seperateShareInvitations as jest.Mock).mockReturnValue(seperateResult);
      ((documentService as any).userService.findVerifiedUsersByEmail as jest.Mock).mockResolvedValue(verifiedUserList);
      ((documentService as any).userService.findUsers as jest.Mock).mockResolvedValue(unverifiedUsers);
      (documentService.getRequestAccessDocument as jest.Mock).mockResolvedValue([]);

      await documentService.shareDocumentToLuminUser({
        userInvitations,
        role,
        sharer,
        message,
        document
      });

      expect(documentService.sendShareDocumentEmail).toHaveBeenCalledWith({
        sharer,
        document,
        message,
        receiveEmails: [],
        isVerified: true
      });
      expect(documentService.sendShareDocumentEmail).toHaveBeenCalledWith({
        sharer,
        document,
        message,
        receiveEmails: ['user1@test.com'],
        isVerified: false
      });
    });

    it('should handle case with no group permissions', async () => {
      const userInvitations = [
        {
          _id: '507f1f77bcf86cd799439011',
          email: 'user1@test.com',
          hasPermission: false,
          permissionType: 'PERSONAL' as any,
          role: null,
          refId: null
        }
      ];
      const role = DocumentRole.VIEWER;
      const sharer = { _id: 'sharer123' } as any;
      const message = 'Test message';
      const document = { _id: 'doc123' } as any;

      const verifiedUsers = [
        { ...userInvitations[0], userStatus: SearchUserStatus.USER_VALID }
      ];

      const seperateResult = {
        groupPermissions: {},
        personalPermissions: [
          { _id: '507f1f77bcf86cd799439011', email: 'user1@test.com', refId: '507f1f77bcf86cd799439011' }
        ],
        newPermissions: [
          { _id: '507f1f77bcf86cd799439011', email: 'user1@test.com' }
        ],
        existedPermissions: []
      };

      (documentService.verifyUserToUpdateDocumentPermission as jest.Mock)
        .mockResolvedValue({ status: SearchUserStatus.USER_VALID });
      (documentService.seperateShareInvitations as jest.Mock).mockReturnValue(seperateResult);
      ((documentService as any).userService.findVerifiedUsersByEmail as jest.Mock).mockResolvedValue([]);
      ((documentService as any).userService.findUsers as jest.Mock).mockResolvedValue([]);
      (documentService.getRequestAccessDocument as jest.Mock).mockResolvedValue([]);

      await documentService.shareDocumentToLuminUser({
        userInvitations,
        role,
        sharer,
        message,
        document
      });

      expect(documentService.updateManyDocumentPermission).not.toHaveBeenCalled();
      expect(documentService.createDocumentPermissionsUpsert).toHaveBeenCalledWith(seperateResult.personalPermissions);
    });

    it('should handle request access removal after permission change', async () => {
      const userInvitations = [
        {
          _id: '507f1f77bcf86cd799439011',
          email: 'user1@test.com',
          hasPermission: false,
          permissionType: 'PERSONAL' as any,
          role: null,
          refId: null
        }
      ];
      const role = DocumentRole.EDITOR;
      const sharer = { _id: 'sharer123' } as any;
      const message = 'Test message';
      const document = { _id: 'doc123' } as any;
    
      const verifiedUsers = [
        { ...userInvitations[0], userStatus: SearchUserStatus.USER_VALID }
      ];
    
      const seperateResult = {
        groupPermissions: {},
        personalPermissions: [
          { _id: '507f1f77bcf86cd799439011', email: 'user1@test.com', refId: '507f1f77bcf86cd799439011' }
        ],
        newPermissions: [
          { _id: '507f1f77bcf86cd799439011', email: 'user1@test.com' }
        ],
        existedPermissions: []
      };
    
      (documentService.verifyUserToUpdateDocumentPermission as jest.Mock)
        .mockResolvedValue({ status: SearchUserStatus.USER_VALID });
      (documentService.seperateShareInvitations as jest.Mock).mockReturnValue(seperateResult);
    
      const requests = [
        { requesterId: '507f1f77bcf86cd799439011', documentRole: 'viewer' }
      ];
      (documentService.getRequestAccessDocument as jest.Mock).mockResolvedValue(requests);
    
      ((documentService as any).userService.findVerifiedUsersByEmail as jest.Mock).mockResolvedValue([
        { _id: '507f1f77bcf86cd799439011', email: 'user1@test.com' }
      ]);
      ((documentService as any).userService.findUsers as jest.Mock).mockResolvedValue([]);
    
      await documentService.shareDocumentToLuminUser({
        userInvitations,
        role,
        sharer,
        message,
        document
      });
    
      expect(documentService.removeRequestsAfterPermissionChanged).toHaveBeenCalledWith({
        documentId: 'doc123',
        users: [{ _id: '507f1f77bcf86cd799439011', requestRole: 'viewer' }],
        newRole: 'editor'
      });
    });
  });
  
  describe('seperateShareInvitations', () => {
    it('should correctly separate personal and group permissions', () => {
      const params = {
        documentId: 'doc1',
        role: 'editor' as any,
        userInvitations: [
          { 
            _id: 'u1', 
            permissionType: DocumentOwnerTypeEnum.PERSONAL, 
            hasPermission: false, 
            userStatus: SearchUserStatus.USER_VALID,
            email: 'u1@example.com',
            role: 'viewer' as any,
            refId: null,
          },
          { 
            _id: 'g1', 
            permissionType: DocumentOwnerTypeEnum.TEAM, 
            hasPermission: true, 
            userStatus: SearchUserStatus.USER_VALID,
            email: 'g1@example.com',
            role: 'editor' as any,
            refId: null,
          },
          { 
            _id: 'u2', 
            permissionType: DocumentOwnerTypeEnum.PERSONAL, 
            hasPermission: true, 
            userStatus: SearchUserStatus.USER_VALID,
            email: 'u2@example.com',
            role: 'editor' as any,
            refId: null,
          },
          { 
            _id: 'u3', 
            permissionType: DocumentOwnerTypeEnum.PERSONAL, 
            hasPermission: false, 
            userStatus: SearchUserStatus.USER_UNALLOWED,
            email: 'u3@example.com',
            role: 'viewer' as any,
            refId: null,
          },
        ],
      };
      const result = documentService.seperateShareInvitations(params);
    
      expect(result.personalPermissions).toEqual([
        { documentId: 'doc1', refId: 'u1', role: 'editor' },
        { documentId: 'doc1', refId: 'u2', role: 'editor' },
      ]);
      expect(result.groupPermissions).toEqual({ g1: 'editor' });
      expect(result.newPermissions).toEqual([
        { 
          _id: 'u1', 
          permissionType: DocumentOwnerTypeEnum.PERSONAL, 
          hasPermission: false, 
          userStatus: SearchUserStatus.USER_VALID,
          email: 'u1@example.com',
          role: 'viewer' as any,
          refId: null,
        },
      ]);
      expect(result.existedPermissions).toEqual([
        { 
          _id: 'g1', 
          permissionType: DocumentOwnerTypeEnum.TEAM, 
          hasPermission: true, 
          userStatus: SearchUserStatus.USER_VALID,
          email: 'g1@example.com',
          role: 'editor' as any,
          refId: null,
        },
        { 
          _id: 'u2', 
          permissionType: DocumentOwnerTypeEnum.PERSONAL, 
          hasPermission: true, 
          userStatus: SearchUserStatus.USER_VALID,
          email: 'u2@example.com',
          role: 'editor' as any,
          refId: null,
        },
      ]);
    });
  });

  describe('sendShareDocumentEmail', () => {
    let documentService: DocumentService;
    let mockEmailService: any;
    let mockAuthService: any;
    let mockEnvironmentService: any;
    let mockJwtService: any;
  
    beforeEach(() => {
      mockEmailService = {
        sendEmail: jest.fn(),
        sendEmailHOF: jest.fn(),
        generateDeeplinkForEmail: jest.fn().mockReturnValue('deeplink-url')
      };
      mockAuthService = {
        createToken: jest.fn().mockReturnValue('token123'),
      };
      mockJwtService = {
        sign: jest.fn().mockReturnValue('token123'),
      };
      mockEnvironmentService = {
        getByKey: jest.fn((key) => {
          if (key === 'BASE_URL') return 'http://baseurl.com';
          if (key === 'AUTH_URL') return 'http://authurl.com';
        })
      };
  
      documentService = new (class {
        emailService = mockEmailService;
        authService = mockAuthService;
        jwtService = mockJwtService;
        environmentService = mockEnvironmentService;
        sendShareDocumentEmail = DocumentService.prototype.sendShareDocumentEmail;
      })() as any;
    });
  
    it('should send email for verified users', () => {
      const params = {
        sharer: { _id: 'sharer1', name: 'Sharer', email: 'sharer@test.com', avatarRemoteId: 'avatar123', timezoneOffset: 0 },
        document: { _id: 'doc1', name: 'Test Document' },
        message: 'Hello',
        receiveEmails: ['user@test.com'],
        isVerified: true
      };
  
      documentService.sendShareDocumentEmail(params as any);
  
      expect(mockEmailService.sendEmailHOF).toHaveBeenCalledWith(
        expect.anything(),
        ['user@test.com'],
        expect.objectContaining({
          subject: expect.stringContaining('Test Document'),
          sharerName: 'Sharer',
          message: 'Hello',
          documentDeeplink: 'deeplink-url'
        })
      );
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });
  
    it('should send email with token for unverified users', () => {
      const params = {
        sharer: {
          _id: 'sharer1',
          name: 'Sharer',
          email: 'sharer@test.com',
          avatarRemoteId: 'avatar123',
          timezoneOffset: 0,
        },
        document: { _id: 'doc1', name: 'Test Document' },
        message: 'Hello',
        receiveEmails: ['user1@test.com', 'user2@test.com'],
        isVerified: false,
      };
  
      documentService.sendShareDocumentEmail(params as any);
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(2);
      expect(mockEmailService.sendEmail).toHaveBeenNthCalledWith(
        1,
        EMAIL_TYPE.SHARE_DOCUMENT,
        ['user1@test.com'],
        expect.objectContaining({
          subject: expect.stringContaining('Test Document'),
          sharerName: 'Sharer',
          sharerEmail: 'sharer@test.com',
          sharerAvatar: 'avatar123',
          documentId: 'doc1',
          message: 'Hello',
          documentUrl: expect.stringContaining('token123'),
          documentDeeplink: 'deeplink-url',
        }),
      );
  
      expect(mockEmailService.sendEmail).toHaveBeenNthCalledWith(
        2,
        EMAIL_TYPE.SHARE_DOCUMENT,
        ['user2@test.com'],
        expect.objectContaining({
          subject: expect.stringContaining('Test Document'),
          documentUrl: expect.stringContaining('token123'),
        }),
      );
  
      expect(mockEmailService.sendEmailHOF).not.toHaveBeenCalled();
    });
  });  

  describe('sendShareDocumentNotification', () => {
    it('should call notificationService.createUsersNotifications', () => {
      const createUsersNotificationsMock = jest.fn();
      Object.defineProperty(documentService, 'notificationService', { value: { createUsersNotifications: createUsersNotificationsMock } });
      Object.defineProperty(documentService, 'documentPermissionModel', { value: { find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) } });
      Object.defineProperty(documentService, 'documentRequestAccessModel', { value: { find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) } });
      Object.defineProperty(documentService, 'integrationService', { value: { sendNotificationToIntegration: jest.fn() } });
      const fakeUser = { _id: 'id', identityId: '', email: '', password: '', name: '', createdAt: '', updatedAt: '', isActive: true } as any;
      documentService.sendShareDocumentNotification({ sharer: fakeUser, document: {} as any, receiveIdsList: ['user1'] });
      expect(createUsersNotificationsMock).toHaveBeenCalled();
    });
  });

  describe('publishShareDocument', () => {
    it('should call messageGateway.emit', () => {
      const emitMock = jest.fn();
      const publishMock = jest.fn();
      Object.defineProperty(documentService, 'messageGateway', { value: { emit: emitMock } });
      Object.defineProperty(documentService, 'pubSub', { value: { publish: publishMock } });
      Object.defineProperty(documentService, 'documentPermissionModel', { value: { find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) } });
      Object.defineProperty(documentService, 'documentRequestAccessModel', { value: { find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) } });
      const fakeUser = { _id: 'id', identityId: '', email: '', password: '', name: '', createdAt: '', updatedAt: '', isActive: true } as any;
      documentService.publishShareDocument({ document: {} as any, sharer: fakeUser, receiveIds: ['user1'], role: 'viewer' });
      expect(publishMock).toHaveBeenCalled();
    });
  });

  describe('sendUpdateDocumentPermissionNotification', () => {
    it('should call notificationService.createUsersNotifications', () => {
      const createUsersNotificationsMock = jest.fn();
      Object.defineProperty(documentService, 'notificationService', { value: { createUsersNotifications: createUsersNotificationsMock } });
      const fakeUser = { _id: 'id', identityId: '', email: '', password: '', name: '', createdAt: '', updatedAt: '', isActive: true } as any;
      documentService.sendUpdateDocumentPermissionNotification({ actor: fakeUser, document: {} as any, sharedIds: [], role: 'viewer' as any });
      expect(createUsersNotificationsMock).toHaveBeenCalled();
    });
  });

  describe('createRequestAccessPermission', () => {
    const fakeDocument = {
      _id: 'doc1',
      name: 'Test Document',
      isPersonal: true,
      ownerId: 'owner1',
    } as any;
  
    const fakeRequester = {
      _id: 'user1',
      name: 'Requester',
      avatarRemoteId: 'avatar1',
    } as any;
  
    const fakeOwnerUser = {
      _id: 'owner1',
      name: 'Owner',
      email: 'owner@test.com',
      avatarRemoteId: 'ownerAvatar',
    } as any;
  
    const fakeRequest = {
      _id: 'request1',
      documentRole: 'viewer',
    } as any;
  
    const fakeNotification = {
      notificationContent: 'Fake notification content',
      notificationData: { fake: 'data' },
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      (documentService as any).userService = {
        findUserById: jest.fn().mockResolvedValue(fakeOwnerUser),
        findUsers: jest.fn().mockResolvedValue([fakeOwnerUser]),
      };
      (documentService as any).notificationService = {
        publishFirebaseNotifications: jest.fn(),
        updateNotification: jest.fn().mockResolvedValue({ _id: 'notif1', createdAt: new Date() }),
        updateNotificationUser: jest.fn(),
        genPublishNotificationData: jest.fn().mockResolvedValue({}),
        publishNewNotifications: jest.fn(),
        publishDeleteNotification: jest.fn(),
      };  
      (documentService as any).emailService = {
        sendEmailHOF: jest.fn(),
        generateDeeplinkForEmail: jest.fn().mockReturnValue('deeplink-url'),
      };  
      (documentService as any).eventService = {
        createEvent: jest.fn(),
      };  
      (documentService as any).environmentService = {
        getByKey: jest.fn().mockReturnValue('http://baseurl.com'),
      };
  
      jest.spyOn(documentService as any, 'getDocumentPermissionByGroupRole').mockResolvedValue({ role: 'ORGANIZATION', refId: 'org1' });
      jest.spyOn(documentService as any, 'getRequestAccessDocument').mockResolvedValue([]);
      jest.spyOn(documentService as any, 'updateRequestAccess').mockResolvedValue(fakeRequest);
      jest.spyOn(documentService as any, 'getReceiverIdsNotiRequestAccess').mockResolvedValue(['owner1']);
      jest.spyOn(documentService as any, 'getTargetOwnedDocumentInfo').mockResolvedValue({ _id: 'org1' });
      jest.spyOn(documentService as any, 'getRoleText').mockReturnValue('Viewer');
      jest.spyOn(documentService as any, 'getRoleTextEmail').mockReturnValue('Viewer');
      jest.spyOn(notiFirebaseDocumentFactory, 'create').mockReturnValue(fakeNotification as any);
    });
  
    it('should create request access and send notifications', async () => {
      const result = await documentService.createRequestAccessPermission({
        document: fakeDocument,
        requester: fakeRequester,
        documentRole: 'viewer' as any,
        message: 'Please grant access',
      });
  
      expect(result).toEqual(fakeRequest);
  
      expect((documentService as any).userService.findUserById).toHaveBeenCalledWith('owner1', { name: 1, email: 1, avatarRemoteId: 1 });
      expect((documentService as any).eventService.createEvent).toHaveBeenCalled();
      expect((documentService as any).emailService.sendEmailHOF).toHaveBeenCalled();
      expect((documentService as any).notificationService.publishFirebaseNotifications).toHaveBeenCalled();
      expect((documentService as any).notificationService.updateNotification).toHaveBeenCalled();
      expect(notiFirebaseDocumentFactory.create).toHaveBeenCalledWith(NotiDocument.REQUEST_ACCESS, expect.any(Object));
    });
  
    it('should throw error if personal document owner not found', async () => {
      ((documentService as any).userService.findUserById as jest.Mock).mockResolvedValue(null);
  
      await expect(
        documentService.createRequestAccessPermission({
          document: fakeDocument,
          requester: fakeRequester,
          documentRole: 'viewer' as any,
          message: 'Please grant access',
        }),
      ).rejects.toThrow('User not found');
    });

    it('should throw error if no document permission found', async () => {
      (documentService as any).getDocumentPermissionByGroupRole.mockResolvedValue(null);
    
      await expect(
        documentService.createRequestAccessPermission({
          document: { ...fakeDocument, isPersonal: false },
          requester: fakeRequester,
          documentRole: 'viewer' as any,
          message: 'Please grant access',
        }),
      ).rejects.toThrow('Document permission not found');
    });

    it('should handle ORGANIZATION_TEAM permission and create event', async () => {
      (documentService as any).getDocumentPermissionByGroupRole.mockResolvedValue({
        role: DocumentRoleEnum.ORGANIZATION_TEAM,
        refId: 'team1',
      });
    
      const result = await documentService.createRequestAccessPermission({
        document: { ...fakeDocument, isPersonal: false },
        requester: fakeRequester,
        documentRole: DocumentRoleEnum.VIEWER,
        message: 'Please grant access',
      });
    
      expect(result).toEqual(fakeRequest);
      expect((documentService as any).eventService.createEvent).toHaveBeenCalled();
    });
     
    it('should handle organization permission without creating event', async () => {
      (documentService as any).getDocumentPermissionByGroupRole.mockResolvedValue({
        role: 'ORGANIZATION',
        refId: 'org1',
      });
    
      const result = await documentService.createRequestAccessPermission({
        document: { ...fakeDocument, isPersonal: false },
        requester: fakeRequester,
        documentRole: 'viewer' as any,
        message: 'Please grant access',
      });
    
      expect(result).toEqual(fakeRequest);
      expect((documentService as any).eventService.createEvent).not.toHaveBeenCalled();
    });
    
    it('should send email notification if new role has higher priority', async () => {
      (documentService as any).getRequestAccessDocument.mockResolvedValue([
        { documentRole: DocumentRoleEnum.VIEWER },
      ]);
    
      const result = await documentService.createRequestAccessPermission({
        document: fakeDocument,
        requester: fakeRequester,
        documentRole: DocumentRoleEnum.SHARER,
        message: '',
      });
    
      expect(result).toEqual(fakeRequest);
    
      expect((documentService as any).emailService.sendEmailHOF).toHaveBeenCalledWith(
        EMAIL_TYPE.REQUEST_ACCESS,
        expect.any(Array),
        expect.objectContaining({
          message: '',
        }),
      );
    });
    
    it('should handle undefined documentId when updating notification', async () => {
      const fakeDocWithoutId = {
        ...fakeDocument,
        _id: undefined,
      };
    
      (documentService as any).updateRequestAccess.mockResolvedValue(fakeRequest);
      (documentService as any).getRequestAccessDocument.mockResolvedValue([]);
      (documentService as any).getReceiverIdsNotiRequestAccess.mockResolvedValue(['owner1']);
      (documentService as any).userService.findUsers.mockResolvedValue([{ email: 'owner@test.com' }]);
      const result = await documentService.createRequestAccessPermission({
        document: fakeDocWithoutId,
        requester: fakeRequester,
        documentRole: DocumentRoleEnum.SHARER,
        message: 'msg',
      });
    
      expect(result).toEqual(fakeRequest);
      expect((documentService as any).notificationService.updateNotification).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          entity: expect.objectContaining({
            entityId: undefined,
          }),
        }),
        expect.any(Object),
      );
    });    
  });

  describe('acceptRequestAccess', () => {
    const fakeDocument = { _id: 'doc1', name: 'Test Doc' } as any;
    const fakeAccepter = { _id: 'accepter1', name: 'Accepter' } as any;
    const fakeRequesterId = {
      toHexString: () => 'req1',
      toString: () => 'req1',
      valueOf: () => 'req1',
    } as any;
  
    beforeEach(() => {
      jest.clearAllMocks();
      (documentService as any).getRequestAccessDocument = jest.fn();
      (documentService as any).checkExistedDocPermission = jest.fn();
      (documentService as any).updateDocumentPermissionWhenAcceptRequest = jest.fn();
      (documentService as any).removeRequestNotiWhenAcceptRequest = jest.fn();
      (documentService as any).sendEmailWhenAcceptRequest = jest.fn();
      (documentService as any).notifyWhenAcceptRequest = jest.fn();
      (documentService as any).publishWhenAcceptRequest = jest.fn();
      (documentService as any).deleteManyRequestAccess = jest.fn();
    });
  
    it('should throw NotFound if no request access found', async () => {
      (documentService as any).getRequestAccessDocument.mockResolvedValue([]);
  
      await expect(
        documentService.acceptRequestAccess({
          document: fakeDocument,
          accepter: fakeAccepter,
          requesterIds: ['req1'],
        }),
      ).rejects.toThrow('Request access not found');
    });
  
    it('should throw BadRequest if not orgManager and not PERSONAL request', async () => {
      (documentService as any).getRequestAccessDocument.mockResolvedValue([
        { requesterId: fakeRequesterId, documentRole: 'viewer' },
      ]);
  
      (documentService as any).checkExistedDocPermission
        .mockResolvedValueOnce({ membershipRole: 'MEMBER' })
        .mockResolvedValueOnce({ permissionType: DocumentOwnerTypeEnum.ORGANIZATION, hasPermission: false });
  
      await expect(
        documentService.acceptRequestAccess({
          document: fakeDocument,
          accepter: fakeAccepter,
          requesterIds: ['req1'],
        }),
      ).rejects.toThrow('Cannot accept request access to document');
    });

    it('should update permissions when requester does not have existing permission', async () => {
      (documentService as any).getRequestAccessDocument.mockResolvedValue([
        { requesterId: fakeRequesterId, documentRole: 'editor' },
      ]);
      (documentService as any).checkExistedDocPermission
        .mockResolvedValueOnce({ hasPermission: false, permissionType: DocumentOwnerTypeEnum.PERSONAL })
        .mockResolvedValueOnce({ membershipRole: 'ORGANIZATION_ADMIN' });
    
      await documentService.acceptRequestAccess({
        document: fakeDocument,
        accepter: fakeAccepter,
        requesterIds: ['req1'],
      });
    
      expect(documentService.updateDocumentPermissionWhenAcceptRequest).toHaveBeenCalledWith({
        document: fakeDocument,
        updateExternalPermissions: { req1: 'editor' },
        updateInternalPermissions: {},
      });
      expect(documentService.removeRequestNotiWhenAcceptRequest).toHaveBeenCalled();
      expect(documentService.sendEmailWhenAcceptRequest).toHaveBeenCalled();
      expect(documentService.notifyWhenAcceptRequest).toHaveBeenCalled();
      expect(documentService.publishWhenAcceptRequest).toHaveBeenCalled();
      expect(documentService.deleteManyRequestAccess).toHaveBeenCalledWith({
        documentId: fakeDocument._id,
        requesterId: { $in: ['req1'] },
      });
    });

    it('should updateExternalPermissions when requester has PERSONAL permission', async () => {
      (documentService as any).getRequestAccessDocument.mockResolvedValue([
        { requesterId: fakeRequesterId, documentRole: 'viewer' },
      ]);
    
      (documentService as any).checkExistedDocPermission
        .mockResolvedValueOnce({ hasPermission: true, permissionType: DocumentOwnerTypeEnum.PERSONAL })
        .mockResolvedValueOnce({ membershipRole: 'ORGANIZATION_ADMIN' });
    
      await documentService.acceptRequestAccess({
        document: fakeDocument,
        accepter: fakeAccepter,
        requesterIds: ['req1'],
      });
    
      expect(documentService.updateDocumentPermissionWhenAcceptRequest).toHaveBeenCalledWith({
        document: fakeDocument,
        updateExternalPermissions: { req1: 'viewer' },
        updateInternalPermissions: {},
      });
    });

    it('should updateInternalPermissions when requester has ORGANIZATION_TEAM permission', async () => {
      (documentService as any).getRequestAccessDocument.mockResolvedValue([
        { requesterId: fakeRequesterId, documentRole: 'viewer' },
      ]);
    
      (documentService as any).checkExistedDocPermission
        .mockResolvedValueOnce({ hasPermission: true, permissionType: DocumentOwnerTypeEnum.ORGANIZATION_TEAM })
        .mockResolvedValueOnce({ membershipRole: OrganizationRoleEnums.ORGANIZATION_ADMIN });
    
      await documentService.acceptRequestAccess({
        document: fakeDocument,
        accepter: fakeAccepter,
        requesterIds: ['req1'],
      });
    
      expect(documentService.updateDocumentPermissionWhenAcceptRequest).toHaveBeenCalledWith({
        document: fakeDocument,
        updateExternalPermissions: {},
        updateInternalPermissions: { req1: 'viewer' },
      });
    });
    
    it('should updateInternalPermissions when requester has ORGANIZATION permission', async () => {
      (documentService as any).getRequestAccessDocument.mockResolvedValue([
        { requesterId: fakeRequesterId, documentRole: 'editor' },
      ]);
    
      (documentService as any).checkExistedDocPermission
        .mockResolvedValueOnce({ hasPermission: true, permissionType: DocumentOwnerTypeEnum.ORGANIZATION })
        .mockResolvedValueOnce({ membershipRole: OrganizationRoleEnums.ORGANIZATION_ADMIN });
    
      await documentService.acceptRequestAccess({
        document: fakeDocument,
        accepter: fakeAccepter,
        requesterIds: ['req1'],
      });
    
      expect(documentService.updateDocumentPermissionWhenAcceptRequest).toHaveBeenCalledWith({
        document: fakeDocument,
        updateExternalPermissions: {},
        updateInternalPermissions: { req1: 'editor' },
      });
    });
    
    it('should not update any permissions when requester has unknown permissionType', async () => {
      (documentService as any).getRequestAccessDocument.mockResolvedValue([
        { requesterId: fakeRequesterId, documentRole: 'viewer' },
      ]);
    
      (documentService as any).checkExistedDocPermission
        .mockResolvedValueOnce({ hasPermission: true, permissionType: 'UNKNOWN' })
        .mockResolvedValueOnce({ membershipRole: OrganizationRoleEnums.ORGANIZATION_ADMIN });
    
      await documentService.acceptRequestAccess({
        document: fakeDocument,
        accepter: fakeAccepter,
        requesterIds: ['req1'],
      });
    
      expect(documentService.updateDocumentPermissionWhenAcceptRequest).toHaveBeenCalledWith({
        document: fakeDocument,
        updateExternalPermissions: {},
        updateInternalPermissions: {},
      });
    }); 
  });

  describe('updateDocumentPermissionWhenAcceptRequest', () => {
    let documentService: any;
    let mockBulkWrite: jest.Mock;
    let mockUpdateDocumentPermission: jest.Mock;
  
    beforeEach(() => {
      mockBulkWrite = jest.fn();
      mockUpdateDocumentPermission = jest.fn();
  
      documentService = new (class {
        documentPermissionModel = { bulkWrite: mockBulkWrite };
        updateDocumentPermission = mockUpdateDocumentPermission;
        updateDocumentPermissionWhenAcceptRequest = 
          (DocumentService.prototype.updateDocumentPermissionWhenAcceptRequest);
      })();
    });
  
    it('should call both bulkWrite and updateDocumentPermission if both updates are provided', async () => {
      const params = {
        document: { _id: 'doc3' } as any,
        updateExternalPermissions: { user3: 'editor' },
        updateInternalPermissions: { group1: 'viewer' },
      };
  
      await documentService.updateDocumentPermissionWhenAcceptRequest(params);
  
      expect(mockBulkWrite).toHaveBeenCalledTimes(1);
      expect(mockUpdateDocumentPermission).toHaveBeenCalledTimes(1);
    });
  });

  describe('publishWhenAcceptRequest', () => {
    let documentService: any;
    let mockFindUserById: jest.Mock;
    let mockCloneDocument: jest.Mock;
    let mockPublishUpdateDocument: jest.Mock;
    let mockEmit: jest.Mock;
  
    beforeEach(() => {
      mockFindUserById = jest.fn();
      mockCloneDocument = jest.fn();
      mockPublishUpdateDocument = jest.fn();
      mockEmit = jest.fn();
  
      documentService = new (class {
        userService = { findUserById: mockFindUserById };
        cloneDocument = mockCloneDocument;
        publishUpdateDocument = mockPublishUpdateDocument;
        messageGateway = { server: { to: jest.fn().mockReturnValue({ emit: mockEmit }) } };
        publishWhenAcceptRequest = DocumentService.prototype.publishWhenAcceptRequest;
      })();
    });
  
    it('should publish update and emit event for each request', async () => {
      const document = { _id: 'doc123', ownerId: 'owner1' } as any;
      const requests = [
        { requesterId: 'userA', documentRole: 'editor' },
        { requesterId: 'userB', documentRole: 'viewer' },
      ] as any[];

      mockFindUserById.mockResolvedValue({ name: 'OwnerName', avatarRemoteId: 'ava1' });
      mockCloneDocument.mockReturnValue({ id: 'clonedDoc' });
      documentService.publishWhenAcceptRequest(document, requests);
  
      await new Promise(process.nextTick);
  
      expect(mockPublishUpdateDocument).toHaveBeenCalledTimes(2);
      expect(mockPublishUpdateDocument).toHaveBeenCalledWith(
        ['userA'],
        { document: { id: 'clonedDoc' }, type: expect.any(String) },
        expect.any(String),
      );
      expect(mockPublishUpdateDocument).toHaveBeenCalledWith(
        ['userB'],
        { document: { id: 'clonedDoc' }, type: expect.any(String) },
        expect.any(String),
      );
      expect(mockEmit).toHaveBeenCalledTimes(2);
      expect(mockEmit).toHaveBeenCalledWith('updatePermission-doc123', { userId: 'userA', role: 'editor' });
      expect(mockEmit).toHaveBeenCalledWith('updatePermission-doc123', { userId: 'userB', role: 'viewer' });
    });
  
    it('should fallback ownerName to Anonymous if user not found', async () => {
      const document = { _id: 'doc999', ownerId: 'ownerX' } as any;
      const requests = [{ requesterId: 'userZ', documentRole: 'viewer' }] as any[];
  
      mockFindUserById.mockResolvedValue(null);
      mockCloneDocument.mockReturnValue({ id: 'anonDoc' });
      documentService.publishWhenAcceptRequest(document, requests);
  
      await new Promise(process.nextTick);
  
      expect(mockCloneDocument).toHaveBeenCalledWith(
        JSON.stringify(document),
        expect.objectContaining({ ownerName: 'Anonymous' }),
      );
      expect(mockPublishUpdateDocument).toHaveBeenCalledWith(
        ['userZ'],
        { document: { id: 'anonDoc' }, type: expect.any(String) },
        expect.any(String),
      );
    });
  });

  describe('removeRequestNotiWhenAcceptRequest', () => {
    let documentService: any;
    let mockGetNotificationsByConditions: jest.Mock;
    let mockGetNotificationUsersByCondition: jest.Mock;
    let mockRemoveMultiNotifications: jest.Mock;
  
    beforeEach(() => {
      mockGetNotificationsByConditions = jest.fn();
      mockGetNotificationUsersByCondition = jest.fn();
      mockRemoveMultiNotifications = jest.fn();
  
      documentService = new (class {
        notificationService = {
          getNotificationsByConditions: mockGetNotificationsByConditions,
          getNotificationUsersByCondition: mockGetNotificationUsersByCondition,
          removeMultiNotifications: mockRemoveMultiNotifications,
        };
        removeRequestNotiWhenAcceptRequest = DocumentService.prototype.removeRequestNotiWhenAcceptRequest;
      })();
    });
  
    it('should remove notifications when foundNotification exists', async () => {
      const documentId = 'doc123';
      const requesterIds = ['user1'];
      const fakeNotification = { _id: 'noti1' };
      const fakeNotificationUsers = [
        { userId: 'uA' },
        { userId: 'uB' },
      ];
  
      mockGetNotificationsByConditions.mockResolvedValue([fakeNotification]);
      mockGetNotificationUsersByCondition.mockResolvedValue(fakeNotificationUsers);
      documentService.removeRequestNotiWhenAcceptRequest(documentId, requesterIds);
  
      await new Promise(process.nextTick);
  
      expect(mockGetNotificationsByConditions).toHaveBeenCalledWith({
        actionType: expect.any(Number),
        'actor.actorId': 'user1',
        'entity.entityId': 'doc123',
      });
      expect(mockGetNotificationUsersByCondition).toHaveBeenCalledWith({ notificationId: 'noti1' });
      expect(mockRemoveMultiNotifications).toHaveBeenCalledWith({
        notification: fakeNotification,
        userIds: ['uA', 'uB'],
        tabs: [expect.any(String)],
      });
    });
   });  

  describe('sendEmailWhenAcceptRequest', () => {
    let documentService: any;
    let mockFindUserByIds: jest.Mock;
    let mockGetRoleText: jest.Mock;
    let mockGenerateDeeplinkForEmail: jest.Mock;
    let mockSendEmailHOF: jest.Mock;

    beforeEach(() => {
      mockFindUserByIds = jest.fn();
      mockGetRoleText = jest.fn();
      mockGenerateDeeplinkForEmail = jest.fn();
      mockSendEmailHOF = jest.fn();

      documentService = new (class {
        userService = { findUserByIds: mockFindUserByIds };
        emailService = { 
          generateDeeplinkForEmail: mockGenerateDeeplinkForEmail,
          sendEmailHOF: mockSendEmailHOF
        };
        getRoleText = mockGetRoleText;
        sendEmailWhenAcceptRequest = DocumentService.prototype.sendEmailWhenAcceptRequest;
      })();
    });
     
    it('should send email for each request access', async () => {
      const document = { _id: 'doc123', name: 'Test Document' } as any;
      const requestAccessList = [
        { requesterId: { toHexString: () => 'user1' }, documentRole: 'VIEWER' },
        { requesterId: { toHexString: () => 'user2' }, documentRole: 'EDITOR' }
      ] as any[];
      const requesters = [
        { _id: 'user1', email: 'user1@example.com' },
        { _id: 'user2', email: 'user2@example.com' }
      ];
    
      mockFindUserByIds.mockResolvedValue(requesters);
      mockGetRoleText
        .mockReturnValueOnce('Viewer')
        .mockReturnValueOnce('Editor');
      mockGenerateDeeplinkForEmail.mockReturnValue('https://example.com/deeplink');
    
      await documentService.sendEmailWhenAcceptRequest({ document, requestAccessList });
    
      expect(mockSendEmailHOF).toHaveBeenCalledTimes(2);
      expect(mockSendEmailHOF).toHaveBeenCalledWith(
        expect.any(Object),
        ['user1@example.com'],
        expect.objectContaining({
          role: 'Viewer',
          documentName: 'Test Document',
          documentId: 'doc123',
          subject: 'Test Document - Permission granted',
          documentDeeplink: 'https://example.com/deeplink'
        })
      );
      expect(mockSendEmailHOF).toHaveBeenCalledWith(
        expect.any(Object),
        ['user2@example.com'],
        expect.objectContaining({
          role: 'Editor',
          documentName: 'Test Document',
          documentId: 'doc123',
          subject: 'Test Document - Permission granted',
          documentDeeplink: 'https://example.com/deeplink'
        })
      );
    });
   });

  describe('notifyWhenAcceptRequest', () => {
    let documentService: any;
    let mockGetRoleText: jest.Mock;
    let mockCreateUsersNotifications: jest.Mock;
    let mockPublishFirebaseNotifications: jest.Mock;

    beforeEach(() => {
      mockGetRoleText = jest.fn();
      mockCreateUsersNotifications = jest.fn();
      mockPublishFirebaseNotifications = jest.fn();

      jest.doMock('Common/factory/NotiFirebaseFactory', () => ({
        notiFirebaseDocumentFactory: {
          create: jest.fn().mockReturnValue({
            notificationContent: 'Test notification content',
            notificationData: { test: 'data' }
          })
        }
      }));

      documentService = new (class {
        notificationService = {
          createUsersNotifications: mockCreateUsersNotifications,
          publishFirebaseNotifications: mockPublishFirebaseNotifications
        };
        getRoleText = mockGetRoleText;
        notifyWhenAcceptRequest = DocumentService.prototype.notifyWhenAcceptRequest;
      })();
    });   

    it('should handle single request access', () => {
      const accepter = { _id: 'accepter1', name: 'Accepter Name', avatarRemoteId: 'avatar1' } as any;
      const document = { _id: 'doc123', name: 'Test Document' } as any;
      const requestAccessList = [
        { requesterId: { toHexString: () => 'user1' }, documentRole: 'VIEWER' }
      ] as any[];

      mockGetRoleText.mockReturnValue('Viewer');

      documentService.notifyWhenAcceptRequest({ accepter, document, requestAccessList });

      expect(mockCreateUsersNotifications).toHaveBeenCalledTimes(1);
      expect(mockCreateUsersNotifications).toHaveBeenCalledWith(
        {
          actionType: 5,
          actor: {
            actorId: 'accepter1',
            actorName: 'Accepter Name',
            avatarRemoteId: 'avatar1',
            type: 'user',
          },
          entity: {
            entityId: 'doc123',
            entityName: 'Test Document',
            type: 'document',
          },
          notificationType: 'DocumentNotification',
          target: {
            targetData: { role: 'Viewer' },
          },
        },
        [expect.objectContaining({ toHexString: expect.any(Function) })]
      );

      expect(mockPublishFirebaseNotifications).toHaveBeenCalledTimes(1);
      expect(mockPublishFirebaseNotifications).toHaveBeenCalledWith(
        ['user1'],
        'Fake notification content',
        { fake: 'data' }
      );
    });

    it('should handle when documentId is undefined', () => {
      const accepter = { _id: 'accepter1', name: 'Accepter Name', avatarRemoteId: 'avatar1' } as any;
      const document = { name: 'Test Document' } as any;
      const requestAccessList = [
        { requesterId: { toHexString: () => 'user1' }, documentRole: 'VIEWER' }
      ] as any[];
    
      mockGetRoleText.mockReturnValue('Viewer');
    
      documentService.notifyWhenAcceptRequest({ accepter, document, requestAccessList });
    
      expect(mockCreateUsersNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: {
            entityId: undefined,
            entityName: 'Test Document',
            type: 'document',
          },
        }),
        [expect.objectContaining({ toHexString: expect.any(Function) })]
      );
    
      expect(mockPublishFirebaseNotifications).toHaveBeenCalledWith(
        ['user1'],
        'Fake notification content',
        { fake: 'data' }
      );
    });
    
  });

  describe('getRequestAccessData', () => {
    const requesterId = 'requester123';
    const documentId = 'document123';

    it('should return mapped request accesses', async () => {
      const mockDocs = [
        {
          _id: { toHexString: () => 'abc123' },
          toObject: () => ({ requesterId, documentId }),
        },
      ];
      jest.spyOn(documentService['documentRequestAccessModel'], 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocs),
      } as any);

      const result = await documentService.getRequestAccessData(requesterId, documentId);

      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('abc123');
      expect(documentService['documentRequestAccessModel'].find).toHaveBeenCalledWith({ requesterId, documentId });
    });
  });

  describe('createRequestAccess', () => {
    let mockDocumentRequestAccessModel: any;
    let documentService: any;
  
    beforeEach(() => {
      mockDocumentRequestAccessModel = {
        create: jest.fn(),
      };
  
      documentService = new (class {
        documentRequestAccessModel = mockDocumentRequestAccessModel;
        createRequestAccess = DocumentService.prototype.createRequestAccess;
      })();
    });
  
    it('should create and return request access with string _id', async () => {
      const mockCreated = {
        _id: { toHexString: () => 'abc123' },
        toObject: () => ({ requesterId: 'user1', documentId: 'doc1', documentRole: 'VIEWER' }),
      };
      mockDocumentRequestAccessModel.create.mockResolvedValue(mockCreated);
  
      const result = await documentService.createRequestAccess('user1', 'doc1', 'VIEWER');
  
      expect(mockDocumentRequestAccessModel.create).toHaveBeenCalledWith({
        requesterId: 'user1',
        documentId: 'doc1',
        documentRole: 'VIEWER',
      });
      expect(result._id).toBe('abc123');
      expect(result.requesterId).toBe('user1');
    });
  });

  describe('updateRequestAccess', () => {
    let mockDocumentRequestAccessModel: any;
    let documentService: any;
  
    beforeEach(() => {
      mockDocumentRequestAccessModel = {
        findOneAndUpdate: jest.fn(),
      };
  
      documentService = new (class {
        documentRequestAccessModel = mockDocumentRequestAccessModel;
        updateRequestAccess = DocumentService.prototype.updateRequestAccess;
      })();
    });
  
    it('should update and return the updated request access', async () => {
      const mockUpdated = {
        _id: { toHexString: () => 'xyz789' },
        toObject: () => ({ requesterId: 'user1', documentId: 'doc1', documentRole: 'EDITOR' }),
      };
      mockDocumentRequestAccessModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdated),
      });
  
      const result = await documentService.updateRequestAccess(
        { requesterId: 'user1' },
        { documentRole: 'EDITOR' },
        { new: true },
      );
  
      expect(mockDocumentRequestAccessModel.findOneAndUpdate).toHaveBeenCalledWith(
        { requesterId: 'user1' },
        { documentRole: 'EDITOR' },
        { new: true },
      );
      expect(result._id).toBe('xyz789');
      expect(result.documentRole).toBe('EDITOR');
    });
  
    it('should return null when no document is found', async () => {
      mockDocumentRequestAccessModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
  
      const result = await documentService.updateRequestAccess(
        { requesterId: 'user1' },
        { documentRole: 'EDITOR' },
      );
  
      expect(result).toBeNull();
    });
  });
  
  describe('removeRequestAccess', () => {
    let mockDocumentRequestAccessModel: any;
    let documentService: any;
  
    beforeEach(() => {
      mockDocumentRequestAccessModel = {
        deleteMany: jest.fn(),
      };
  
      documentService = new (class {
        documentRequestAccessModel = mockDocumentRequestAccessModel;
        removeRequestAccess = DocumentService.prototype.removeRequestAccess;
      })();
    });
  
    it('should call deleteMany with requesterId and documentIds', () => {
      mockDocumentRequestAccessModel.deleteMany.mockReturnValue('deletedResult');
  
      const result = documentService.removeRequestAccess('user1', ['doc1', 'doc2']);
  
      expect(mockDocumentRequestAccessModel.deleteMany).toHaveBeenCalledWith({
        requesterId: 'user1',
        documentId: { $in: ['doc1', 'doc2'] },
      });
      expect(result).toBe('deletedResult');
    });
  });

  describe('getUserLookupFromRequestAccessDoc', () => {
    let documentService: any;
  
    beforeEach(() => {
      documentService = new (class {
        getUserLookupFromRequestAccessDoc = DocumentService.prototype.getUserLookupFromRequestAccessDoc;
      })();
    });
  
    it('should return correct MongoDB lookup object', () => {
      const lookup = documentService.getUserLookupFromRequestAccessDoc();
  
      expect(lookup).toMatchObject({
        from: 'users',
        let: { userId: '$requesterId' },
        pipeline: expect.any(Array),
        as: 'userInfo',
      });
  
      expect(lookup.pipeline[0]).toEqual({
        $match: {
          $expr: { $eq: ['$$userId', '$_id'] },
        },
      });
      expect(lookup.pipeline[1]).toEqual({
        $project: { _id: 1, name: 1, avatarRemoteId: 1, email: 1 },
      });
    });
  });

  describe('getAllRequestAccessPipeline', () => {
    let documentService: any;
  
    beforeEach(() => {
      documentService = new (class {
        getUserLookupFromRequestAccessDoc = jest.fn().mockReturnValue({ lookup: 'expression' });
        getAllRequestAccessPipeline = DocumentService.prototype.getAllRequestAccessPipeline;
      })();
    });
  
    it('should return correct pipelines without cursor', () => {
      const params = { documentId: '64f11c2f1234567890abcdef', cursor: '', limit: 10 };
      const { requestListPipeline, countTotalPipeline } = documentService.getAllRequestAccessPipeline(params);
  
      expect(countTotalPipeline).toEqual([
        { $match: { documentId: new Types.ObjectId(params.documentId) } },
        { $count: 'total' },
      ]);
  
      expect(requestListPipeline[0]).toEqual({ $match: { documentId: new Types.ObjectId(params.documentId) } });
      expect(requestListPipeline[1]).toEqual({ $sort: { createdAt: -1 } });
      expect(requestListPipeline[2]).toEqual({ $match: {} });
      expect(requestListPipeline[3]).toEqual({ $limit: 11 });
      expect(requestListPipeline[4]).toEqual({ $lookup: { lookup: 'expression' } });
      expect(requestListPipeline[5]).toEqual({ $unwind: '$userInfo' });
    });
  
    it('should include cursor match when cursor is provided', () => {
      const cursor = Date.now().toString();
      const params = { documentId: '64f11c2f1234567890abcdef', cursor, limit: 5 };
      const { requestListPipeline } = documentService.getAllRequestAccessPipeline(params);
  
      expect(requestListPipeline[2]).toEqual({
        $match: { createdAt: { $lt: new Date(+cursor) } },
      });
      expect(requestListPipeline[3]).toEqual({ $limit: 6 });
    });
  });
  
  describe('getOrgMemberLookupExpression', () => {
    let documentService: any;
  
    beforeEach(() => {
      documentService = new (class {
        getOrgMemberLookupExpression = DocumentService.prototype.getOrgMemberLookupExpression;
      })();
    });
  
    it('should return correct org member lookup expression', () => {
      const orgId = 'org123';
      const result = documentService.getOrgMemberLookupExpression(orgId);
  
      expect(result).toEqual({
        from: 'organizationmembers',
        let: { userId: '$requesterId' },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ['$orgId', orgId] } },
                { $expr: { $eq: ['$userId', '$$userId'] } },
              ],
            },
          },
        ],
        as: 'member',
      });
    });
  });
  
  describe('getTeamMemberLookupExpression', () => {
    let documentService: any;
  
    beforeEach(() => {
      documentService = new (class {
        getTeamMemberLookupExpression = DocumentService.prototype.getTeamMemberLookupExpression;
      })();
    });
  
    it('should return correct team member lookup expression', () => {
      const teamId = 'team456';
      const result = documentService.getTeamMemberLookupExpression(teamId);
  
      expect(result).toEqual({
        from: 'memberships',
        let: { userId: '$requesterId' },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ['$teamId', teamId] } },
                { $expr: { $eq: ['$userId', '$$userId'] } },
              ],
            },
          },
        ],
        as: 'member',
      });
    });
  });

  describe('getExternalRequestOrgDocPipeline', () => {
    let documentService: any;
  
    beforeEach(() => {
      documentService = new (class {
        getUserLookupFromRequestAccessDoc = jest.fn().mockReturnValue({ lookup: 'userExpression' });
        getOrgMemberLookupExpression = jest.fn().mockReturnValue({ lookup: 'orgExpression' });
        getTeamMemberLookupExpression = jest.fn().mockReturnValue({ lookup: 'teamExpression' });
        getExternalRequestOrgDocPipeline = DocumentService.prototype.getExternalRequestOrgDocPipeline;
      })();
    });
  
    it('should return pipelines with org membership lookup when docType is ORGANIZATION', () => {
      const params = {
        documentId: '64f11c2f1234567890abcdef',
        cursor: '',
        limit: 5,
        refId: 'org123',
        docType: DocumentRoleEnum.ORGANIZATION,
      };
      const { requestListPipeline, countTotalPipeline } =
        documentService.getExternalRequestOrgDocPipeline(params);
      expect(countTotalPipeline[0]).toEqual({ $match: { documentId: new Types.ObjectId(params.documentId) } });
      expect(countTotalPipeline[1]).toEqual({ $lookup: { lookup: 'orgExpression' } });
      expect(countTotalPipeline[2]).toEqual({ $match: { member: { $size: 0 } } });
      expect(countTotalPipeline[3]).toEqual({ $count: 'total' });
      expect(requestListPipeline[0]).toEqual({ $match: { documentId: new Types.ObjectId(params.documentId) } });
      expect(requestListPipeline[1]).toEqual({ $sort: { createdAt: -1 } });
      expect(requestListPipeline[2]).toEqual({ $match: {} });
      expect(requestListPipeline[3]).toEqual({ $lookup: { lookup: 'orgExpression' } });
      expect(requestListPipeline[4]).toEqual({ $match: { member: { $size: 0 } } });
      expect(requestListPipeline[5]).toEqual({ $limit: 6 });
      expect(requestListPipeline[6]).toEqual({ $lookup: { lookup: 'userExpression' } });
      expect(requestListPipeline[7]).toEqual({ $unwind: '$userInfo' });
  
      expect(documentService.getOrgMemberLookupExpression).toHaveBeenCalledWith('org123');
    });
  
    it('should return pipelines with team membership lookup when docType is TEAM', () => {
      const params = {
        documentId: '64f11c2f1234567890abcdef',
        cursor: '',
        limit: 2,
        refId: 'team456',
        docType: DocumentRoleEnum.TEAM,
      };
  
      const { requestListPipeline, countTotalPipeline } =
        documentService.getExternalRequestOrgDocPipeline(params);
  
      expect(countTotalPipeline[1]).toEqual({ $lookup: { lookup: 'teamExpression' } });
      expect(requestListPipeline[3]).toEqual({ $lookup: { lookup: 'teamExpression' } });
  
      expect(documentService.getTeamMemberLookupExpression).toHaveBeenCalledWith('team456');
    });
  
    it('should include cursor match when cursor is provided', () => {
      const cursor = Date.now().toString();
      const params = {
        documentId: '64f11c2f1234567890abcdef',
        cursor,
        limit: 3,
        refId: 'org789',
        docType: DocumentRoleEnum.ORGANIZATION,
      };
  
      const { requestListPipeline } =
        documentService.getExternalRequestOrgDocPipeline(params);
  
      expect(requestListPipeline[2]).toEqual({
        $match: { createdAt: { $lt: new Date(+cursor) } },
      });
      expect(requestListPipeline[5]).toEqual({ $limit: 4 });
    });
  });

  describe('getRequestAccessesByDocId', () => {
    let documentService: any;
  
    beforeEach(() => {
      documentService = new (class {
        checkExistedDocPermission = jest.fn();
        getDocumentPermissionByConditions = jest.fn();
        getAllRequestAccessPipeline = jest.fn();
        getExternalRequestOrgDocPipeline = jest.fn();
        documentRequestAccessModel = { aggregate: jest.fn() };
        getRequestAccessesByDocId = DocumentService.prototype.getRequestAccessesByDocId;
      })();
    });
  
    const mockDocument = { _id: '64f11c2f1234567890abcdef', isPersonal: false };
  
    it('should use getAllRequestAccessPipeline when user is orgManager', async () => {
      documentService.checkExistedDocPermission.mockResolvedValue({ membershipRole: OrganizationRoleEnums.ORGANIZATION_ADMIN });
      documentService.getDocumentPermissionByConditions.mockResolvedValue([{ refId: 'ref1', role: DocumentRoleEnum.ORGANIZATION }]);
      documentService.getAllRequestAccessPipeline.mockReturnValue({
        requestListPipeline: [{ stage: 'list' }],
        countTotalPipeline: [{ stage: 'count' }],
      });
      documentService.documentRequestAccessModel.aggregate
        .mockResolvedValueOnce([{ createdAt: new Date(), userInfo: { name: 'Bob' } }])
        .mockResolvedValueOnce([{ total: 2 }]);
  
      const result = await documentService.getRequestAccessesByDocId({
        document: mockDocument,
        userId: 'user2',
        input: { limit: 2 },
      });
  
      expect(documentService.getAllRequestAccessPipeline).toHaveBeenCalled();
      expect(result.total).toBe(2);
      expect(result.requestList[0].name).toBe('Bob');
    });
  
    it('should set hasNextPage true when requestList length > limit', async () => {
      const items = Array.from({ length: 4 }).map((_, i) => ({
        createdAt: new Date(),
        userInfo: { name: `User${i}` },
      }));
      documentService.checkExistedDocPermission.mockResolvedValue({ membershipRole: 'VIEWER' });
      documentService.getDocumentPermissionByConditions.mockResolvedValue([{ refId: 'org123', role: DocumentRoleEnum.ORGANIZATION }]);
      documentService.getExternalRequestOrgDocPipeline.mockReturnValue({
        requestListPipeline: [{ stage: 'list' }],
        countTotalPipeline: [{ stage: 'count' }],
      });
      documentService.documentRequestAccessModel.aggregate
        .mockResolvedValueOnce(items)
        .mockResolvedValueOnce([{ total: 4 }]);
  
      const result = await documentService.getRequestAccessesByDocId({
        document: mockDocument,
        userId: 'user4',
        input: { limit: 3 },
      });
  
      expect(result.hasNextPage).toBe(true);
      expect(result.requestList.length).toBe(3);
    });

    it('should default limit = 30 and cursor = "" when no input and empty result', async () => {
      documentService.checkExistedDocPermission.mockResolvedValue({ membershipRole: 'VIEWER' });
      documentService.getDocumentPermissionByConditions.mockResolvedValue([{ refId: 'org123', role: DocumentRoleEnum.ORGANIZATION }]);
      documentService.getExternalRequestOrgDocPipeline.mockReturnValue({
        requestListPipeline: [{ stage: 'list' }],
        countTotalPipeline: [{ stage: 'count' }],
      });
      documentService.documentRequestAccessModel.aggregate
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
    
      const result = await documentService.getRequestAccessesByDocId({
        document: mockDocument,
        userId: 'userX',
      });
    
      expect(result.total).toBe(0);
      expect(result.requestList).toEqual([]);
      expect(result.cursor).toBe('');
      expect(result.hasNextPage).toBe(false);
    });
  });

  describe('getRequestAccessDocument', () => {
    let documentService: any;
  
    beforeEach(() => {
      documentService = new (class {
        documentRequestAccessModel = { find: jest.fn() };
        getRequestAccessDocument = DocumentService.prototype.getRequestAccessDocument;
      })();
    });

    it('should map documents and convert _id to hex string', async () => {
      const mockDoc = {
        _id: { toHexString: () => 'hexid123' },
        toObject: () => ({ field: 'value' }),
      };
      const mockExec = jest.fn().mockResolvedValue([mockDoc]);
      documentService.documentRequestAccessModel.find.mockReturnValue({ exec: mockExec });
  
      const result = await documentService.getRequestAccessDocument({ requesterId: 'user2' });
  
      expect(result).toEqual([{ field: 'value', _id: 'hexid123' }]);
    });
  });
  
  describe('countTotalDocumentsByCondition', () => {
    let documentService: any;
  
    beforeEach(() => {
      documentService = new (class {
        documentPermissionModel = { find: jest.fn() };
        countTotalDocumentsByCondition = DocumentService.prototype.countTotalDocumentsByCondition;
      })();
    });
  
    it('should call find with condition and return count', async () => {
      const mockCount = jest.fn().mockResolvedValue(5);
      documentService.documentPermissionModel.find.mockReturnValue({ countDocuments: mockCount });
  
      const result = await documentService.countTotalDocumentsByCondition('client1', { role: 'VIEWER' });
  
      expect(documentService.documentPermissionModel.find).toHaveBeenCalledWith({
        refId: 'client1',
        role: 'VIEWER',
      });
      expect(result).toBe(5);
    });
  });
  
  describe('countTotalAnnotationByType', () => {
    let documentService: any;
  
    beforeEach(() => {
      documentService = new (class {
        documentAnnotationModel = { find: jest.fn() };
        getDocumentPermission = jest.fn();
        countTotalAnnotationByType = DocumentService.prototype.countTotalAnnotationByType;
      })();
    });
  
    it('should return total annotations for given type', async () => {
      const permissions = [{ documentId: 'doc1' }, { documentId: 'doc2' }];
      documentService.getDocumentPermission.mockResolvedValue(permissions);
  
      const mockCount = jest.fn().mockResolvedValue(3);
      documentService.documentAnnotationModel.find.mockReturnValue({ countDocuments: mockCount });
  
      const result = await documentService.countTotalAnnotationByType('client2', 'COMMENT');
  
      expect(documentService.getDocumentPermission).toHaveBeenCalledWith('client2', {});
      expect(documentService.documentAnnotationModel.find).toHaveBeenCalledWith({
        documentId: { $in: ['doc1', 'doc2'] },
        xfdf: { $regex: 'subject="COMMENT"' },
      });
      expect(result).toBe(3);
    });
  });
  
  describe('countTotalAnnotationsByOrgId', () => {
    let documentService: any;
  
    beforeEach(() => {
      documentService = new (class {
        organizationTeamService = { getOrgTeams: jest.fn() };
        getDocumentPermissionByConditions = jest.fn();
        documentAnnotationModel = { find: jest.fn() };
        countTotalAnnotationsByOrgId = DocumentService.prototype.countTotalAnnotationsByOrgId;
      })();
    });
  
    it('should return total annotations by orgId', async () => {
      const orgTeams = [{ _id: 'team1' }];
      documentService.organizationTeamService.getOrgTeams.mockResolvedValue(orgTeams);
  
      const permissions = [{ documentId: 'docA' }, { documentId: 'docB' }];
      documentService.getDocumentPermissionByConditions.mockResolvedValue(permissions);
  
      const mockCount = jest.fn().mockResolvedValue(10);
      documentService.documentAnnotationModel.find.mockReturnValue({ countDocuments: mockCount });
  
      const result = await documentService.countTotalAnnotationsByOrgId('org123');
  
      expect(documentService.organizationTeamService.getOrgTeams).toHaveBeenCalledWith('org123');
      expect(documentService.getDocumentPermissionByConditions).toHaveBeenCalledWith({
        $or: [
          { refId: { $in: ['team1', 'org123'] } },
          { 'workspace.refId': 'org123' },
        ],
      });
      expect(documentService.documentAnnotationModel.find).toHaveBeenCalledWith({
        documentId: { $in: ['docA', 'docB'] },
      });
      expect(result).toBe(10);
    });
  });  

  describe('getNonOrgDocumentSummary', () => {
    const clientId = '507f1f77bcf86cd799439011';

    beforeEach(() => {
      jest.spyOn(documentService, 'countTotalDocumentsByCondition').mockResolvedValue(5);
      jest.spyOn(documentService, 'countTotalAnnotationByType').mockResolvedValue(10);
    });

    it('should return personal document summary', async () => {
      const result = await documentService.getNonOrgDocumentSummary(clientId, 'PERSONAL');

      expect(result).toBeDefined();
      expect(result.ownedDocumentTotal).toBe(5);
      expect(result.sharedDocumentTotal).toBe(5);
      expect(result.commentTotal).toBe(10);
      expect(documentService.countTotalDocumentsByCondition).toHaveBeenCalledTimes(2);
      expect(documentService.countTotalAnnotationByType).toHaveBeenCalledWith(clientId, 'Comment');
      });

      it('should return team document summary', async () => {
        const result = await documentService.getNonOrgDocumentSummary(clientId, 'TEAM');

        expect(result).toBeDefined();
        expect(result.ownedDocumentTotal).toBe(5);
        expect(result.commentTotal).toBe(10);
        expect(documentService.countTotalDocumentsByCondition).toHaveBeenCalledTimes(1);
        expect(documentService.countTotalAnnotationByType).toHaveBeenCalledWith(clientId, 'Comment');
    });

    it('should return undefined for unknown scope', async () => {
      const result = await documentService.getNonOrgDocumentSummary(clientId, 'UNKNOWN' as any);

      expect(result).toBeUndefined();
    });
  });
  
  describe('createDocumentWithBufferData', () => {
    const mockParams = {
      clientId: '507f1f77bcf86cd799439011',
      fileRemoteId: 'file123',
      uploader: { _id: 'user123' },
      docType: DocumentOwnerTypeEnum.PERSONAL,
    };

    beforeEach(() => {
      jest.spyOn(awsService.s3Instance() as any, 'getDocumentMetadata').mockResolvedValue({
        ContentType: 'application/pdf',
        ContentLength: 1024,
      });
      awsService.getDocumentMetadata = jest.fn().mockResolvedValue({
        ContentType: 'application/pdf',
        ContentLength: 1024,
      });
      jest.spyOn(documentService, 'getDocumentNameAfterNaming').mockResolvedValue('test.pdf');
      jest.spyOn(documentService, 'createDocument').mockResolvedValue({} as any);
    });

    it('should create document with metadata', async () => {
      const metadata = {
        documentName: 'custom.pdf',
        thumbnailKey: 'thumb123',
        manipulationStep: 'step1',
      };

      const result = await documentService.createDocumentWithBufferData(mockParams, metadata);

      expect(result).toBeDefined();
      expect(documentService.getDocumentNameAfterNaming).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: 'custom.pdf.pdf',
        })
      );
    });
  
    it('should use clientId when docType is not PERSONAL', async () => {
      const params = { ...mockParams, docType: DocumentOwnerTypeEnum.ORGANIZATION };
  
      await documentService.createDocumentWithBufferData(params);
  
      expect(documentService.getDocumentNameAfterNaming).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: params.clientId,
        }),
      );
    });
  
    it('should include folderId when provided', async () => {
      const params = { ...mockParams, folderId: 'folder123' };
  
      await documentService.createDocumentWithBufferData(params);
  
      expect(documentService.createDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          folderId: 'folder123',
        }),
      );
    });  
  });

  describe('getReceiverIdsFromDocumentId', () => {
    const documentId = '507f1f77bcf86cd799439011';

    beforeEach(() => {
      jest.spyOn(documentService, 'getDocumentPermissionsByDocId').mockResolvedValue([]);
      jest.spyOn(teamService, 'getAllMembersInTeam').mockResolvedValue([]);
      jest.spyOn(organizationService, 'getMembersByOrgId').mockResolvedValue([]);
    });

    it('should handle mixed permissions', async () => {
      const mockPermissions = [
        {
          role: 'viewer',
          refId: { toHexString: () => 'user1' },
        },
        {
          role: 'organization_team',
          refId: 'team1',
        },
        {
          role: 'organization',
          refId: 'org1',
        },
      ];
      const mockTeamMembers = [
        { userId: { toHexString: () => 'member1' } },
      ];
      const mockOrgMembers = [
        { userId: { toHexString: () => 'orgMember1' } },
      ];

      documentService.getDocumentPermissionsByDocId = jest.fn().mockResolvedValue(mockPermissions);
      teamService.getAllMembersInTeam = jest.fn().mockResolvedValue(mockTeamMembers);
      organizationService.getMembersByOrgId = jest.fn().mockResolvedValue(mockOrgMembers);

      const result = await documentService.getReceiverIdsFromDocumentId(documentId);

      expect(result.receiversIndividual).toEqual(new Set(['user1']));
      expect(result.receiversTeam).toEqual(new Set(['member1']));
      expect(result.receiversOrganization).toEqual(new Set(['orgMember1']));
      expect(result.allReceivers).toEqual(new Set(['user1', 'member1', 'orgMember1']));
    });
  });

  describe('publishEventDeleteDocumentToInternal', () => {
    const mockParams = {
      documents: [{ _id: 'doc1', folderId: 'folder1' }] as Document[],
      clientId: 'client1',
      roleOfDocument: DocumentRoleEnum.VIEWER,
      allMember: ['member1', 'member2'],
    };

    beforeEach(() => {
      jest.spyOn(documentService, 'publishDeleteOriginalDocument').mockImplementation();
    });

    it('should publish team document deletion', () => {
      const teamParams = {
        ...mockParams,
        roleOfDocument: DocumentRoleEnum.ORGANIZATION_TEAM,
      };

      documentService.publishEventDeleteDocumentToInternal(teamParams);

      expect(documentService.publishDeleteOriginalDocument).toHaveBeenCalledWith(
        ['member1', 'member2', 'client1'],
        expect.objectContaining({
          teamId: 'client1',
          organizationId: '',
          type: SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_TEAMS,
        }),
        SUBSCRIPTION_DELETE_ORIGINAL_DOCUMENT,
      );
    });

    it('should publish organization document deletion', () => {
      const orgParams = {
        ...mockParams,
        roleOfDocument: DocumentRoleEnum.ORGANIZATION,
      };

      documentService.publishEventDeleteDocumentToInternal(orgParams);

      expect(documentService.publishDeleteOriginalDocument).toHaveBeenCalledWith(
        ['member1', 'member2', 'client1'],
        expect.objectContaining({
          teamId: '',
          organizationId: 'client1',
          type: SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_ORGANIZATION,
        }),
        SUBSCRIPTION_DELETE_ORIGINAL_DOCUMENT,
      );
    });

    it('should handle extended payload', () => {
      const extendedPayload = { customField: 'value' } as Partial<DeleteOriginalDocumentPayload>;

      documentService.publishEventDeleteDocumentToInternal(mockParams, extendedPayload);

      expect(documentService.publishDeleteOriginalDocument).toHaveBeenCalledWith(
        ['member1', 'member2', 'client1'],
        expect.objectContaining({
          customField: 'value',
        }),
        SUBSCRIPTION_DELETE_ORIGINAL_DOCUMENT,
      );
    });
  });

  describe('publishEventDeleteDocumentToInvididual', () => {
    const documents = [{ _id: 'doc1', folderId: 'folder1' }] as Document[];
    const allReceivers = ['receiver1', 'receiver2'];
    const additionalSettings = { customField: 'value' } as SubDocumentSettings;

    beforeEach(() => {
      jest.spyOn(documentService, 'publishDeleteOriginalDocument').mockImplementation();
    });

    it('should publish individual document deletion', () => {
      documentService.publishEventDeleteDocumentToInvididual(documents, allReceivers, additionalSettings);

      expect(documentService.publishDeleteOriginalDocument).toHaveBeenCalledWith(
        allReceivers,
        expect.objectContaining({
          documentList: [{ documentId: 'doc1', documentFolder: 'folder1' }],
          teamId: '',
          organizationId: '',
          additionalSettings,
          type: SUBSCRIPTION_DOCUMENT_LIST_REMOVE_DOCUMENT_PERSONAL,
        }),
        SUBSCRIPTION_DELETE_ORIGINAL_DOCUMENT,
      );
    });
  });

  describe('publishEventDeleteDocumentToExternal', () => {
    const documents = [{ _id: 'doc1', folderId: 'folder1' }] as Document[];
    const allReceivers = ['receiver1', 'receiver2'];
    const additionalSettings = { customField: 'value' } as SubDocumentSettings;

    beforeEach(() => {
      jest.spyOn(documentService, 'publishDeleteOriginalDocument').mockImplementation();
    });

    it('should publish external document deletion', () => {
      documentService.publishEventDeleteDocumentToExternal(documents, allReceivers, additionalSettings);

      expect(documentService.publishDeleteOriginalDocument).toHaveBeenCalledWith(
        allReceivers,
        expect.objectContaining({
          documentList: [{ documentId: 'doc1', documentFolder: 'folder1' }],
          teamId: '',
          organizationId: '',
          additionalSettings,
          type: SUBSCRIPTION_DOCUMENT_LIST_REMOVE_SHARE,
        }),
        SUBSCRIPTION_DELETE_ORIGINAL_DOCUMENT,
      );
    });
  });

  describe('notifyDeleteDocumentToShared', () => {
    const notificationData = {
      actor: { user: { _id: 'actor1' } },
      entity: { document: { _id: 'doc1' } },
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
      (documentService as any).notificationService = {
        createUsersNotifications: jest.fn(),
        publishFirebaseNotifications: jest.fn(),
      };
      
      const { notiFirebaseDocumentFactory } = require('../../Common/factory/NotiFirebaseFactory');
      notiFirebaseDocumentFactory.create.mockReturnValue({
        notificationContent: 'Test notification content',
        notificationData: { actionType: 'DELETE' }
      });
    });
  
    it('should notify when receivers exist', () => {
      const receivers = [{ toHexString: () => 'receiver1' }, { toHexString: () => 'receiver2' }] as any;
  
      documentService.notifyDeleteDocumentToShared(notificationData, receivers);
  
      expect(documentService['notificationService'].createUsersNotifications).toHaveBeenCalledWith(
        undefined,
        receivers,
      );
  
      expect(documentService['notificationService'].publishFirebaseNotifications).toHaveBeenCalledWith(
        ['receiver1', 'receiver2'],
        expect.any(String),
        expect.any(Object),
      );
    });
  });

  describe('notifyDeleteSingleDocumentToMembers', () => {
    const actor = { _id: 'actor1' } as User;
    const document = { _id: 'doc1' } as IDocument;
    const clientId = 'client1';

    beforeEach(() => {
      jest.spyOn(teamService, 'findOneById').mockResolvedValue({ _id: 'team1' } as any);
      jest.spyOn(organizationService, 'getOrgById').mockResolvedValue({ _id: 'org1' } as any);
      jest.spyOn(membershipService, 'publishNotiToAllTeamMember').mockImplementation();
      jest.spyOn(organizationService, 'publishNotiToAllOrgMember').mockImplementation();
      jest.spyOn(organizationService, 'publishFirebaseNotiToAllOrgMember').mockImplementation();
      jest.spyOn(organizationService, 'publishFirebaseNotiToAllTeamMember').mockImplementation();
      
      const { notiFirebaseOrganizationFactory, notiFirebaseTeamFactory } = require('../../Common/factory/NotiFirebaseFactory');
      const { notiTeamFactory, notiOrgFactory } = require('../../Common/factory/NotiFactory');
      
      notiFirebaseOrganizationFactory.create.mockReturnValue({
        notificationContent: {
          title: 'Test notification title',
          body: 'Test notification body',
        },
        notificationData: {
          actionType: 'REMOVE_DOCUMENT',
          notificationType: 'OrganizationNotification',
          orgId: 'org1',
        },
      });
      notiFirebaseTeamFactory.create.mockReturnValue({
        notificationContent: {
          title: 'Test notification title',
          body: 'Test notification body',
        },
        notificationData: {
          actionType: 'DELETE_DOCUMENT',
          notificationType: 'TeamNotification',
          teamId: 'team1',
        },
      });
      
      notiTeamFactory.create.mockReturnValue({
        notificationContent: 'Test team notification',
        notificationData: { actionType: 'DELETE_DOCUMENT_TEAM' }
      });
      notiOrgFactory.create.mockReturnValue({
        notificationContent: 'Test org notification',
        notificationData: { actionType: 'REMOVE_DOCUMENT' }
      });
    });

    it('should notify team members for team document', async () => {
      await documentService.notifyDeleteSingleDocumentToMembers(
        DocumentOwnerTypeEnum.TEAM,
        actor,
        clientId,
        document,
      );

      expect(teamService.findOneById).toHaveBeenCalledWith(clientId);
      expect(membershipService.publishNotiToAllTeamMember).toHaveBeenCalledWith(
        clientId,
        expect.any(Object),
        [actor._id],
      );
    });

    it('should notify organization members for organization document', async () => {
      await documentService.notifyDeleteSingleDocumentToMembers(
        DocumentOwnerTypeEnum.ORGANIZATION,
        actor,
        clientId,
        document,
      );

      expect(organizationService.getOrgById).toHaveBeenCalledWith(clientId);
      expect(organizationService.publishNotiToAllOrgMember).toHaveBeenCalledWith(
        expect.objectContaining({
          orgId: clientId,
          excludedIds: [actor._id],
        }),
      );
      expect(organizationService.publishFirebaseNotiToAllOrgMember).toHaveBeenCalledWith(
        expect.objectContaining({
          orgId: clientId,
          excludedIds: [actor._id],
        }),
      );
    });

    it('should notify organization team members for organization team document', async () => {
      const mockTeam = { _id: 'team1', belongsTo: 'org1' };
      teamService.findOneById = jest.fn().mockResolvedValue(mockTeam as any);

      await documentService.notifyDeleteSingleDocumentToMembers(
        DocumentOwnerTypeEnum.ORGANIZATION_TEAM,
        actor,
        clientId,
        document,
      );

      expect(teamService.findOneById).toHaveBeenCalledWith(clientId);
      expect(organizationService.getOrgById).toHaveBeenCalledWith('org1');
      expect(membershipService.publishNotiToAllTeamMember).toHaveBeenCalledWith(
        clientId,
        expect.any(Object),
        [actor._id],
      );
      expect(organizationService.publishFirebaseNotiToAllTeamMember).toHaveBeenCalledWith(
        expect.objectContaining({
          teamId: clientId,
          excludes: [actor._id],
        }),
      );
    });

    it('should handle non-existent team', async () => {
      jest.clearAllMocks();
      teamService.findOneById = jest.fn().mockResolvedValue(null);

      await documentService.notifyDeleteSingleDocumentToMembers(
        DocumentOwnerTypeEnum.TEAM,
        actor,
        clientId,
        document,
      );

      expect(membershipService.publishNotiToAllTeamMember).not.toHaveBeenCalled();
    });

    it('should handle non-existent organization', async () => {
      jest.clearAllMocks();
      organizationService.getOrgById = jest.fn().mockResolvedValue(null);

      await documentService.notifyDeleteSingleDocumentToMembers(
        DocumentOwnerTypeEnum.ORGANIZATION,
        actor,
        clientId,
        document,
      );

      expect(organizationService.publishNotiToAllOrgMember).not.toHaveBeenCalled();
    });

    it('should handle non-existent organization team', async () => {
      jest.clearAllMocks();
      teamService.findOneById = jest.fn().mockResolvedValue(null);
    
      await documentService.notifyDeleteSingleDocumentToMembers(
        DocumentOwnerTypeEnum.ORGANIZATION_TEAM,
        actor,
        clientId,
        document,
      );
    
      expect(membershipService.publishNotiToAllTeamMember).not.toHaveBeenCalled();
      expect(organizationService.publishFirebaseNotiToAllTeamMember).not.toHaveBeenCalled();
    });
    
    it('should do nothing for unsupported document owner type', async () => {
      jest.clearAllMocks();
    
      await documentService.notifyDeleteSingleDocumentToMembers(
        'UNKNOWN_TYPE' as DocumentOwnerTypeEnum,
        actor,
        clientId,
        document,
      );
    
      expect(teamService.findOneById).not.toHaveBeenCalled();
      expect(organizationService.getOrgById).not.toHaveBeenCalled();
      expect(membershipService.publishNotiToAllTeamMember).not.toHaveBeenCalled();
      expect(organizationService.publishNotiToAllOrgMember).not.toHaveBeenCalled();
    }); 
  });

  describe('notifyDeleteDocumentsToMember', () => {
    const clientId = 'client1';
    const notificationData = {
      actor: { user: { _id: 'actor1' } },
      entity: { totalDocument: 5, document: { _id: 'doc1' } },
    };
    const exceptionIds = ['exception1'];

    beforeEach(() => {
      jest.clearAllMocks();
      teamService.findOneById = jest.fn().mockResolvedValue({ _id: 'team1' } as any);
      organizationService.getOrgById = jest.fn().mockResolvedValue({ _id: 'org1' } as any);
      membershipService.publishNotiToAllTeamMember = jest.fn().mockImplementation();
      organizationService.publishNotiToAllOrgMember = jest.fn().mockImplementation();
      organizationService.publishFirebaseNotiToAllOrgMember = jest.fn().mockImplementation();
      organizationService.publishFirebaseNotiToAllTeamMember = jest.fn().mockImplementation();
      userService.findUserById = jest.fn().mockResolvedValue({ _id: 'user1' } as any);
      
      const { notiFirebaseTeamFactory } = require('../../Common/factory/NotiFirebaseFactory');
      const { notiTeamFactory, notiOrgFactory } = require('../../Common/factory/NotiFactory');
      
      notiFirebaseTeamFactory.create.mockReturnValue({
        notificationContent: {
          title: 'Test notification title',
          body: 'Test notification body',
        },
        notificationData: {
          actionType: 'DELETE_MULTI_DOCUMENT',
          notificationType: 'TeamNotification',
          teamId: 'team1',
        },
      });
      
      notiTeamFactory.create.mockReturnValue({
        notificationContent: 'Test team notification',
        notificationData: { actionType: 'DELETE_MULTI_DOCUMENT' }
      });
      notiOrgFactory.create.mockReturnValue({
        notificationContent: 'Test org notification',
        notificationData: { actionType: 'DELETE_MULTI_DOCUMENT' }
      });
    });

    it('should notify team members for team documents', async () => {
      await documentService.notifyDeleteDocumentsToMember(
        DocumentOwnerTypeEnum.TEAM,
        clientId,
        notificationData,
        exceptionIds,
      );

      expect(teamService.findOneById).toHaveBeenCalledWith(clientId);
      expect(membershipService.publishNotiToAllTeamMember).toHaveBeenCalledWith(
        clientId,
        expect.any(Object),
        exceptionIds,
      );
    });

    it('should notify organization team members for organization team documents', async () => {
      const mockTeam = { _id: 'team1', belongsTo: 'org1' };
      teamService.findOneById = jest.fn().mockResolvedValue(mockTeam as any);

      await documentService.notifyDeleteDocumentsToMember(
        DocumentOwnerTypeEnum.ORGANIZATION_TEAM,
        clientId,
        notificationData,
        exceptionIds,
      );

      expect(teamService.findOneById).toHaveBeenCalledWith(clientId);
      expect(organizationService.getOrgById).toHaveBeenCalledWith('org1');
      expect(membershipService.publishNotiToAllTeamMember).toHaveBeenCalledWith(
        clientId,
        expect.any(Object),
        exceptionIds,
      );
      expect(organizationService.publishFirebaseNotiToAllTeamMember).toHaveBeenCalledWith(
        expect.objectContaining({
          teamId: 'team1',
          excludes: [notificationData.actor.user._id],
        }),
      );
    });
    
    it('should do nothing for unsupported document owner type', async () => {
      await documentService.notifyDeleteDocumentsToMember(
        'UNKNOWN_TYPE' as DocumentOwnerTypeEnum,
        clientId,
        notificationData,
        exceptionIds,
      );
    
      expect(teamService.findOneById).not.toHaveBeenCalled();
      expect(organizationService.getOrgById).not.toHaveBeenCalled();
      expect(membershipService.publishNotiToAllTeamMember).not.toHaveBeenCalled();
      expect(organizationService.publishNotiToAllOrgMember).not.toHaveBeenCalled();
    });

    it('should notify organization members for organization documents', async () => {
      const mockOrg = { _id: 'org1' };
      organizationService.getOrgById = jest.fn().mockResolvedValue(mockOrg as any);
    
      const mockUser = { _id: 'user1' };
      userService.findUserById = jest.fn().mockResolvedValue(mockUser as any);
    
      const { notiFirebaseOrganizationFactory } = require('../../Common/factory/NotiFirebaseFactory');
      notiFirebaseOrganizationFactory.create.mockReturnValue({
        notificationContent: {
          title: 'Org notification title',
          body: 'Org notification body',
        },
        notificationData: {
          actionType: 'DELETE_MULTI_DOCUMENT',
          notificationType: 'OrgNotification',
          orgId: 'org1',
        },
      });
    
      await documentService.notifyDeleteDocumentsToMember(
        DocumentOwnerTypeEnum.ORGANIZATION,
        clientId,
        notificationData,
        exceptionIds,
      );
    
      expect(organizationService.getOrgById).toHaveBeenCalledWith(clientId);
      expect(organizationService.publishNotiToAllOrgMember).toHaveBeenCalledWith({
        orgId: clientId,
        notification: expect.any(Object),
        excludedIds: exceptionIds,
      });
      userService.findUserById = jest.fn().mockResolvedValue(mockUser as any);
      expect(organizationService.publishFirebaseNotiToAllOrgMember).toHaveBeenCalledWith(
        expect.objectContaining({
          orgId: clientId,
          firebaseNotificationData: expect.any(Object),
          firebaseNotificationContent: expect.any(Object),
          excludedIds: exceptionIds,
        }),
      );
    });
    
  });

  describe('deleteOriginalDocument', () => {
    const document = { _id: 'doc1', thumbnail: 'thumb1' } as Document;

    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(documentService, 'deleteDocumentNonLuminUser').mockImplementation();
      jest.spyOn(documentService, 'deleteRemoteThumbnail').mockImplementation();
      jest.spyOn(documentService, 'deleteRemoteDocument').mockImplementation();
      jest.spyOn(documentService, 'deleteDocument').mockImplementation();
      jest.spyOn(documentService, 'deleteDocumentPermissions').mockImplementation();
      jest.spyOn(documentService, 'clearAnnotationOfDocument').mockImplementation();
      jest.spyOn(documentService, 'deleteAllImageSignedUrls').mockImplementation();
      jest.spyOn(documentService, 'deleteFormFieldFromDocument').mockImplementation();
      jest.spyOn(documentService, 'removeFromRecentDocumentList').mockImplementation();
      jest.spyOn(documentOutlineService, 'clearOutlineOfDocument').mockImplementation();

      (documentBackupInfoModel as any).deleteOne = jest.fn().mockResolvedValue({} as any);
      (documentDriveMetadataModel as any).findOneAndDelete = jest.fn().mockImplementation();
    });

    it('should delete all document related data', async () => {
      await documentService.deleteOriginalDocument(document);

      expect(documentService.deleteDocumentNonLuminUser).toHaveBeenCalledWith({ documentId: document._id });
      expect(documentService.deleteRemoteThumbnail).toHaveBeenCalledWith(document.thumbnail);
      expect(documentService.deleteRemoteDocument).toHaveBeenCalledWith(document);
      expect(documentService.deleteDocument).toHaveBeenCalledWith(document._id);
      expect(documentService.deleteDocumentPermissions).toHaveBeenCalledWith({ documentId: document._id });
      expect(documentService.clearAnnotationOfDocument).toHaveBeenCalledWith({ documentId: document._id });
      expect(documentOutlineService.clearOutlineOfDocument).toHaveBeenCalledWith(document._id);
      expect(documentService.deleteAllImageSignedUrls).toHaveBeenCalledWith(document._id);
      expect(documentService.deleteFormFieldFromDocument).toHaveBeenCalledWith(document._id);
      expect(documentBackupInfoModel.deleteOne).toHaveBeenCalledWith({ documentId: document._id });
      expect(documentDriveMetadataModel.findOneAndDelete).toHaveBeenCalledWith({ documentId: document._id });
      expect(documentService.removeFromRecentDocumentList).toHaveBeenCalledWith([document._id]);
    });
  });

  describe('deleteManyOriginalDocument', () => {
    const documents = [
      { _id: 'doc1', thumbnail: 'thumb1' },
      { _id: 'doc2', thumbnail: 'thumb2' },
    ] as Document[];

    beforeEach(() => {
      jest.spyOn(documentService, 'deleteDocumentPermissions').mockImplementation();
      jest.spyOn(documentService, 'deleteDocumentNonLuminUser').mockImplementation();
      jest.spyOn(documentService, 'deleteManyDocumentById').mockImplementation();
      jest.spyOn(documentService, 'deleteManyDocumentDriveMetadata').mockImplementation();
      jest.spyOn(documentService, 'removeFromRecentDocumentList').mockImplementation();
      jest.spyOn(documentService, 'deleteManyRemoteThumbnail').mockImplementation();
      jest.spyOn(documentService, 'deleteManyRemoteDocument').mockImplementation();
    });

    it('should handle documents with session', async () => {
      const session = {} as ClientSession;
      await documentService.deleteManyOriginalDocument(documents, session);

      expect(documentService.deleteDocumentPermissions).toHaveBeenCalledWith(
        { documentId: { $in: documents.map(doc => doc._id) } },
        session,
      );
    });

    it('should handle large document lists', async () => {
      const largeDocuments = Array.from({ length: 1001 }, (_, i) => ({
        _id: `doc${i}`,
        thumbnail: `thumb${i}`,
      })) as Document[];

      await documentService.deleteManyOriginalDocument(largeDocuments);

      expect(documentService.deleteManyRemoteThumbnail).toHaveBeenCalled();
      expect(documentService.deleteManyRemoteDocument).toHaveBeenCalled();
    });
  });

  describe('deleteDocumentsInPersonal', () => {
    const actorInfo = { _id: 'actor1' } as User;
    const documentPermissionList = [
      { documentId: { toHexString: () => 'doc1' } },
      { documentId: { toHexString: () => 'doc2' } },
    ] as IDocumentPermission[];
    const documentList = [
      { _id: 'doc1', folderId: 'folder1' },
      { _id: 'doc2', folderId: 'folder2' },
    ] as Document[];
    const clientId = 'client1';

    beforeEach(() => {
      jest.spyOn(documentService, 'getSharedIdsOfDocuments').mockResolvedValue([]);
      jest.spyOn(documentService, 'notifyDeleteDocumentToShared').mockImplementation();
      jest.spyOn(documentService, 'publishEventDeleteDocumentToExternal').mockImplementation();
      jest.spyOn(documentService, 'deleteManyOriginalDocument').mockImplementation();
      jest.spyOn(documentService, 'publishEventDeleteDocumentToInvididual').mockImplementation();
    });

    it('should delete personal documents with shared notifications', async () => {
      const sharedDocuments = [
        {
          document: { _id: 'doc1' },
          userIds: ['user1', 'user2'],
        },
      ];

      documentService.getSharedIdsOfDocuments = jest.fn().mockResolvedValue(sharedDocuments);

      await documentService.deleteDocumentsInPersonal({
        actorInfo,
        documentPermissionList,
        documentList,
        clientId,
      });

      expect(documentService.getSharedIdsOfDocuments).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ _id: 'doc1' }),
          expect.objectContaining({ _id: 'doc2' }),
        ]),
      );
      expect(documentService.notifyDeleteDocumentToShared).toHaveBeenCalledWith(
        { actor: actorInfo, entity: { _id: 'doc1' } },
        ['user1', 'user2'],
      );
      expect(documentService.publishEventDeleteDocumentToExternal).toHaveBeenCalledWith(
        [{ _id: 'doc1' }],
        ['user1', 'user2'],
      );
      expect(documentService.deleteManyOriginalDocument).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ _id: 'doc1' }),
          expect.objectContaining({ _id: 'doc2' }),
        ]),
      );
    });

    it('should handle personal documents in organization', async () => {
      await documentService.deleteDocumentsInPersonal({
        actorInfo,
        documentPermissionList,
        documentList,
        clientId,
        isPersonalDocumentsInOrg: true,
      });

      expect(documentService.publishEventDeleteDocumentToInvididual).not.toHaveBeenCalled();
    });

    it('should handle empty owner documents', async () => {
      documentService.getSharedIdsOfDocuments = jest.fn().mockResolvedValue([]);

      await documentService.deleteDocumentsInPersonal({
        actorInfo,
        documentPermissionList: [],
        documentList,
        clientId,
      });

      expect(documentService.getSharedIdsOfDocuments).not.toHaveBeenCalled();
      expect(documentService.deleteManyOriginalDocument).not.toHaveBeenCalled();
    });
  });

  describe('deleteSharedDocuments', () => {
    const documents = [{ _id: 'doc1' }, { _id: 'doc2' }] as Document[];
    const clientId = 'client1';

    beforeEach(() => {
      jest.spyOn(documentService, 'deleteDocumentPermissions').mockImplementation();
      jest.spyOn(documentService, 'publishEventDeleteDocumentToExternal').mockImplementation();
    });

    it('should delete shared documents', async () => {
      await documentService.deleteSharedDocuments(documents, clientId);

      expect(documentService.deleteDocumentPermissions).toHaveBeenCalledWith({
        refId: clientId,
        documentId: { $in: documents },
      });
      expect(documentService.publishEventDeleteDocumentToExternal).toHaveBeenCalledWith(
        documents,
        [clientId],
      );
    });
  });

  describe('deleteDocumentsInOrgTeam', () => {
    const actorInfo = { _id: 'actor1' } as User;
    const documentList = [
      { _id: 'doc1', folderId: 'folder1' },
      { _id: 'doc2', folderId: 'folder2' },
    ] as Document[];
    const orgTeamId = 'team1';

    beforeEach(() => {
      jest.spyOn(teamService, 'getAllMembersInTeam').mockResolvedValue([
        { userId: 'member1', _id: 'mem1', teamId: 'team1', role: 'member' } as any,
        { userId: 'member2', _id: 'mem2', teamId: 'team1', role: 'member' } as any,
      ]);
      jest.spyOn(documentService, 'deleteManyOriginalDocument').mockImplementation();
      jest.spyOn(documentService, 'publishEventDeleteDocumentToInternal').mockImplementation();
      jest.spyOn(documentService, 'notifyDeleteDocumentsToMember').mockImplementation();
    });

    it('should delete organization team documents', async () => {
      await documentService.deleteDocumentsInOrgTeam(actorInfo, documentList, orgTeamId);

      expect(teamService.getAllMembersInTeam).toHaveBeenCalledWith(orgTeamId, { userId: 1 });
      expect(documentService.deleteManyOriginalDocument).toHaveBeenCalledWith(documentList);
      expect(documentService.publishEventDeleteDocumentToInternal).toHaveBeenCalledWith({
        documents: documentList,
        clientId: orgTeamId,
        roleOfDocument: DocumentRoleEnum.ORGANIZATION_TEAM,
        allMember: ['member1', 'member2', 'doc1', 'doc2'],
      });
      expect(documentService.notifyDeleteDocumentsToMember).toHaveBeenCalledWith(
        DocumentOwnerTypeEnum.ORGANIZATION_TEAM,
        orgTeamId,
        expect.objectContaining({
          actor: { user: actorInfo },
          entity: { totalDocument: 2, document: documentList[0] },
        }),
        [actorInfo._id],
      );
    });

    it('should handle empty team members', async () => {
      teamService.getAllMembersInTeam = jest.fn().mockResolvedValue([]);
      await documentService.deleteDocumentsInOrgTeam(actorInfo, documentList, orgTeamId);
      expect(documentService.publishEventDeleteDocumentToInternal).not.toHaveBeenCalled();
    });
  });

  describe('deleteDocumentsInOrganization', () => {
    it('should delete documents and notify members when organization has members', async () => {
      const actorInfo = { _id: 'actor123' } as any;
      const documentList = [{ _id: 'doc1' }, { _id: 'doc2' }] as any;
      const organizationId = 'org123';
      const isNotify = true;

      jest.spyOn(documentService, 'deleteManyOriginalDocument').mockResolvedValue(undefined);

      const mockMembers = [
        { userId: { toHexString: () => 'user1' } },
        { userId: { toHexString: () => 'user2' } }
      ];
      jest.spyOn(organizationService, 'getMembersByOrgId').mockResolvedValue(mockMembers as any);
      jest.spyOn(documentService, 'publishEventDeleteDocumentToInternal').mockImplementation();
      jest.spyOn(documentService, 'notifyDeleteDocumentsToMember').mockResolvedValue(undefined);

      await documentService.deleteDocumentsInOrganization(actorInfo, documentList, organizationId, isNotify);

      expect(documentService.deleteManyOriginalDocument).toHaveBeenCalledWith(documentList);
      expect(organizationService.getMembersByOrgId).toHaveBeenCalledWith(organizationId, { userId: 1 });
      expect(documentService.publishEventDeleteDocumentToInternal).toHaveBeenCalledWith({
        documents: documentList,
        clientId: organizationId,
        roleOfDocument: 'organization',
        allMember: ['user1', 'user2', 'doc1', 'doc2']
      });
      expect(documentService.notifyDeleteDocumentsToMember).toHaveBeenCalledWith(
        'ORGANIZATION',
        organizationId,
        {
          actor: { user: actorInfo },
          entity: { totalDocument: 2, document: documentList[0] }
        },
        ['actor123']
      );
    });

    it('should delete documents without notification when organization has no members', async () => {
      const actorInfo = { _id: 'actor123' } as any;
      const documentList = [{ _id: 'doc1' }] as any;
      const organizationId = 'org123';
      const isNotify = true;

      jest.spyOn(documentService, 'deleteManyOriginalDocument').mockResolvedValue(undefined);
      jest.spyOn(organizationService, 'getMembersByOrgId').mockResolvedValue([]);
      jest.spyOn(documentService, 'publishEventDeleteDocumentToInternal').mockImplementation();
      jest.spyOn(documentService, 'notifyDeleteDocumentsToMember').mockResolvedValue(undefined);

      await documentService.deleteDocumentsInOrganization(actorInfo, documentList, organizationId, isNotify);

      expect(documentService.deleteManyOriginalDocument).toHaveBeenCalledWith(documentList);
      expect(organizationService.getMembersByOrgId).toHaveBeenCalledWith(organizationId, { userId: 1 });
      expect(documentService.publishEventDeleteDocumentToInternal).not.toHaveBeenCalled();
      expect(documentService.notifyDeleteDocumentsToMember).not.toHaveBeenCalled();
    });

    it('should delete documents without notification when isNotify is false', async () => {
      const actorInfo = { _id: 'actor123' } as any;
      const documentList = [{ _id: 'doc1' }] as any;
      const organizationId = 'org123';
      const isNotify = false;

      jest.spyOn(documentService, 'deleteManyOriginalDocument').mockResolvedValue(undefined);

      const mockMembers = [{ userId: { toHexString: () => 'user1' } }];
      jest.spyOn(organizationService, 'getMembersByOrgId').mockResolvedValue(mockMembers as any);
      jest.spyOn(documentService, 'publishEventDeleteDocumentToInternal').mockImplementation();
      jest.spyOn(documentService, 'notifyDeleteDocumentsToMember').mockResolvedValue(undefined);

      await documentService.deleteDocumentsInOrganization(actorInfo, documentList, organizationId, isNotify);

      expect(documentService.deleteManyOriginalDocument).toHaveBeenCalledWith(documentList);
      expect(documentService.publishEventDeleteDocumentToInternal).toHaveBeenCalled();
      expect(documentService.notifyDeleteDocumentsToMember).not.toHaveBeenCalled();
    });
  });

  describe('getSharedIdsOfDocuments', () => {
    it('should return external permissions for documents with external users', async () => {
      const documents = [{ _id: 'doc1' }, { _id: 'doc2' }] as any;

      const mockPermissions1 = [
        { refId: 'user1' },
        { refId: 'user2' }
      ];
      const mockPermissions2 = [
        { refId: 'user3' }
      ];
      jest.spyOn(documentService, 'getDocumentPermissionsByDocId')
        .mockResolvedValueOnce(mockPermissions1 as any)
        .mockResolvedValueOnce(mockPermissions2 as any);

      const result = await documentService.getSharedIdsOfDocuments(documents);

      expect(result).toEqual([
        { document: documents[0], userIds: ['user1', 'user2'] },
        { document: documents[1], userIds: ['user3'] }
      ]);
      expect(documentService.getDocumentPermissionsByDocId).toHaveBeenCalledTimes(2);
    });

    it('should filter out documents without external permissions', async () => {
      const documents = [{ _id: 'doc1' }, { _id: 'doc2' }] as any;

      const mockPermissions1 = [{ refId: 'user1' }];
      const mockPermissions2 = [];
      jest.spyOn(documentService, 'getDocumentPermissionsByDocId')
        .mockResolvedValueOnce(mockPermissions1 as any)
        .mockResolvedValueOnce(mockPermissions2 as any);

      const result = await documentService.getSharedIdsOfDocuments(documents);

      expect(result).toEqual([
        { document: documents[0], userIds: ['user1'] }
      ]);
    });
  });

  describe('shareDocumentToLuminUser', () => {
    const mockSharer = {
      _id: 'sharer123',
      name: 'John Doe',
      email: 'john@example.com',
      avatarRemoteId: 'avatar123',
      timezoneOffset: 0,
    } as User;

    const mockDocument = {
      _id: 'doc123',
      name: 'Test Document',
    } as Document;

    const mockUserInvitations = [
      {
        _id: '507f1f77bcf86cd799439011',
        email: 'user1@example.com',
        hasPermission: false,
        permissionType: DocumentOwnerTypeEnum.PERSONAL,
        role: null,
        refId: null,
      },
      {
        _id: '507f1f77bcf86cd799439012',
        email: 'user2@example.com',
        hasPermission: true,
        permissionType: DocumentOwnerTypeEnum.ORGANIZATION,
        role: DocumentRoleEnum.VIEWER,
        refId: 'org123',
      },
    ] as IShareDocumentInvitation[];

    beforeEach(() => {
      jest.clearAllMocks();
      
      documentService['seperateShareInvitations'] = jest.fn();
      documentService['updateManyDocumentPermission'] = jest.fn();
      documentService['createDocumentPermissionsUpsert'] = jest.fn();
      documentService['getRequestAccessDocument'] = jest.fn();
      documentService['removeRequestAccessDocument'] = jest.fn();
      documentService['sendShareDocumentEmail'] = jest.fn();
      documentService['sendShareDocumentNotification'] = jest.fn();
      documentService['publishShareDocument'] = jest.fn();
      documentService['sendUpdateDocumentPermissionNotification'] = jest.fn();
      (documentService as any).eventService = {
        createEvent: jest.fn(),
      };
      (documentService as any).messageGateway = {
        server: {
          to: jest.fn().mockReturnThis(),
          emit: jest.fn(),
        },
      };
      (documentService as any).userService = {
        findVerifiedUsersByEmail: jest.fn().mockResolvedValue([
          { email: 'user1@example.com' },
        ]),
        findUsers: jest.fn().mockResolvedValue([]),
        findUserById: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          email: 'user1@example.com',
        }),
        findUserByEmail: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          email: 'user1@example.com',
          status: 'valid',
        }),
      };      
    });

    it('should filter out invitations with same permission', async () => {
      const role = DocumentRole.VIEWER;
      const message = 'Please review this document';
      const invitationsWithSamePermission = [
        {
          _id: '507f1f77bcf86cd799439011',
          email: 'user1@example.com',
          hasPermission: true,
          permissionType: DocumentOwnerTypeEnum.PERSONAL,
          role: DocumentRoleEnum.VIEWER,
          refId: '507f1f77bcf86cd799439011',
        },
      ] as IShareDocumentInvitation[];

      documentService['seperateShareInvitations'] = jest.fn().mockReturnValue({
        personalPermissions: [],
        groupPermissions: {},
        newPermissions: [],
        existedPermissions: [],
      });
      documentService['updateManyDocumentPermission'] = jest.fn().mockResolvedValue({} as any);
      documentService['createDocumentPermissionsUpsert'] = jest.fn().mockResolvedValue({} as any);
      documentService['sendShareDocumentEmail'] = jest.fn();
      documentService['sendShareDocumentNotification'] = jest.fn();
      documentService['publishShareDocument'] = jest.fn();
      documentService['sendUpdateDocumentPermissionNotification'] = jest.fn();
      documentService['getRequestAccessDocument'] = jest.fn().mockResolvedValue([]);

      await documentService.shareDocumentToLuminUser({
        userInvitations: invitationsWithSamePermission,
        role,
        sharer: mockSharer,
        message,
        document: mockDocument,
      });

      expect(documentService['seperateShareInvitations']).toHaveBeenCalledWith({
        userInvitations: [],
        documentId: 'doc123',
        role: DocumentRole.VIEWER,
      });
    });

    it('should handle users with USER_UNALLOWED status', async () => {
      const role = DocumentRole.EDITOR;
      const message = 'Please review this document';

      documentService['seperateShareInvitations'] = jest.fn().mockReturnValue({
        personalPermissions: [],
        groupPermissions: {},
        newPermissions: [],
        existedPermissions: [],
      });
      documentService['updateManyDocumentPermission'] = jest.fn().mockResolvedValue({} as any);
      documentService['createDocumentPermissionsUpsert'] = jest.fn().mockResolvedValue({} as any);
      documentService['sendShareDocumentEmail'] = jest.fn();
      documentService['sendShareDocumentNotification'] = jest.fn();
      documentService['publishShareDocument'] = jest.fn();
      documentService['sendUpdateDocumentPermissionNotification'] = jest.fn();
      documentService['getRequestAccessDocument'] = jest.fn().mockResolvedValue([]);

      await documentService.shareDocumentToLuminUser({
        userInvitations: mockUserInvitations,
        role,
        sharer: mockSharer,
        message,
        document: mockDocument,
      });

      expect(documentService['seperateShareInvitations']).toHaveBeenCalledWith({
        userInvitations: expect.arrayContaining([
          expect.objectContaining({
            userStatus: SearchUserStatus.USER_UNALLOWED,
          }),
        ]),
        documentId: 'doc123',
        role: DocumentRole.EDITOR,
      });
    });

    it('should handle empty user invitations', async () => {
      const role = DocumentRole.EDITOR;
      const message = 'Please review this document';

      documentService['seperateShareInvitations'] = jest.fn().mockReturnValue({
        personalPermissions: [],
        groupPermissions: {},
        newPermissions: [],
        existedPermissions: [],
      });
      documentService['updateManyDocumentPermission'] = jest.fn().mockResolvedValue({} as any);
      documentService['createDocumentPermissionsUpsert'] = jest.fn().mockResolvedValue({} as any);
      documentService['sendShareDocumentEmail'] = jest.fn();
      documentService['sendShareDocumentNotification'] = jest.fn();
      documentService['publishShareDocument'] = jest.fn();
      documentService['sendUpdateDocumentPermissionNotification'] = jest.fn();
      documentService['getRequestAccessDocument'] = jest.fn().mockResolvedValue([]);

      await documentService.shareDocumentToLuminUser({
        userInvitations: [],
        role,
        sharer: mockSharer,
        message,
        document: mockDocument,
      });

      expect(documentService['seperateShareInvitations']).toHaveBeenCalledWith({
        userInvitations: [],
        documentId: 'doc123',
        role: DocumentRole.EDITOR,
      });
    });

    it('should handle case with no new permissions', async () => {
      const role = DocumentRole.EDITOR;
      const message = 'Please review this document';

      documentService['seperateShareInvitations'] = jest.fn().mockReturnValue({
        personalPermissions: [],
        groupPermissions: {},
        newPermissions: [],
        existedPermissions: [
          { _id: 'user2', email: 'user2@example.com', hasPermission: true },
        ],
      });
      documentService['getRequestAccessDocument'] = jest.fn().mockResolvedValue([]);
      documentService['updateManyDocumentPermission'] = jest.fn().mockResolvedValue({} as any);
      documentService['createDocumentPermissionsUpsert'] = jest.fn().mockResolvedValue({} as any);
      documentService['sendShareDocumentEmail'] = jest.fn();
      documentService['sendShareDocumentNotification'] = jest.fn();
      documentService['publishShareDocument'] = jest.fn();
      documentService['sendUpdateDocumentPermissionNotification'] = jest.fn();

      await documentService.shareDocumentToLuminUser({
        userInvitations: mockUserInvitations,
        role,
        sharer: mockSharer,
        message,
        document: mockDocument,
      });

      expect(documentService['publishShareDocument']).not.toHaveBeenCalled();
      expect(documentService['sendShareDocumentNotification']).toHaveBeenCalledWith({
        document: mockDocument,
        receiveIdsList: [],
        sharer: mockSharer,
      });
      expect(documentService['sendUpdateDocumentPermissionNotification']).toHaveBeenCalledWith({
        actor: mockSharer,
        document: mockDocument,
        sharedIds: ['user2'],
        role: DocumentRole.EDITOR,
      });
    });

    it('should handle case with no group permissions', async () => {
      const role = DocumentRole.EDITOR;
      const message = 'Please review this document';

      documentService['seperateShareInvitations'] = jest.fn().mockReturnValue({
        personalPermissions: [
          { documentId: 'doc123', refId: '507f1f77bcf86cd799439011', role: 'editor' },
        ],
        groupPermissions: {},
        newPermissions: [
          { _id: '507f1f77bcf86cd799439011', email: 'user1@example.com', hasPermission: false },
        ],
        existedPermissions: [],
      });
      documentService['getRequestAccessDocument'] = jest.fn().mockResolvedValue([]);
      documentService['userService'].findVerifiedUsersByEmail = jest.fn().mockResolvedValue([
        { email: 'user1@example.com' },
      ]);
      documentService['userService'].findUsers = jest.fn().mockResolvedValue([]);
      documentService['userService'].findUserById = jest.fn().mockResolvedValue({
        _id: 'user1',
        email: 'user1@example.com',
      });

      await documentService.shareDocumentToLuminUser({
        userInvitations: mockUserInvitations,
        role,
        sharer: mockSharer,
        message,
        document: mockDocument,
      });

      expect(documentService['updateManyDocumentPermission']).not.toHaveBeenCalled();
      expect(documentService['createDocumentPermissionsUpsert']).toHaveBeenCalledWith([
        { documentId: 'doc123', refId: '507f1f77bcf86cd799439011', role: 'editor' },
      ]);
    });
  });

  describe('removeRequestsAfterPermissionChanged', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      documentService['removeRequestAccessDocument'] = jest.fn().mockResolvedValue(undefined);
    });

    it('should remove request access for users with higher or equal priority roles', async () => {
      const params = {
        documentId: 'doc123',
        users: [
          { _id: '507f1f77bcf86cd799439011', requestRole: DocumentRoleEnum.VIEWER },
          { _id: '507f1f77bcf86cd799439012', requestRole: DocumentRoleEnum.VIEWER },
          { _id: '507f1f77bcf86cd799439013', requestRole: DocumentRoleEnum.SPECTATOR },
          { _id: '507f1f77bcf86cd799439014' },
        ],
        newRole: DocumentRoleEnum.VIEWER,
      };

      await documentService.removeRequestsAfterPermissionChanged(params);

      expect(documentService['removeRequestAccessDocument']).toHaveBeenCalledWith(
        ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
        'doc123'
      );
    });

    it('should not remove any requests when no users have qualifying request roles', async () => {
      const params = {
        documentId: 'doc123',
        users: [
          { _id: '507f1f77bcf86cd799439011', requestRole: DocumentRoleEnum.SHARER },
          { _id: '507f1f77bcf86cd799439012' },
        ],
        newRole: DocumentRoleEnum.EDITOR,
      };

      await documentService.removeRequestsAfterPermissionChanged(params);

      expect(documentService['removeRequestAccessDocument']).not.toHaveBeenCalled();
    });

    it('should handle empty users array', async () => {
      const params = {
        documentId: 'doc123',
        users: [],
        newRole: DocumentRoleEnum.VIEWER,
      };

      await documentService.removeRequestsAfterPermissionChanged(params);

      expect(documentService['removeRequestAccessDocument']).not.toHaveBeenCalled();
    });

    it('should handle users with no requestRole property', async () => {
      const params = {
        documentId: 'doc123',
        users: [
          { _id: '507f1f77bcf86cd799439011' },
          { _id: '507f1f77bcf86cd799439012' },
        ],
        newRole: DocumentRoleEnum.VIEWER,
      };

      await documentService.removeRequestsAfterPermissionChanged(params);

      expect(documentService['removeRequestAccessDocument']).not.toHaveBeenCalled();
    });

    it('should remove requests for users with equal priority roles', async () => {
      const params = {
        documentId: 'doc123',
        users: [
          { _id: '507f1f77bcf86cd799439011', requestRole: DocumentRoleEnum.VIEWER },
        ],
        newRole: DocumentRoleEnum.VIEWER,
      };

      await documentService.removeRequestsAfterPermissionChanged(params);

      expect(documentService['removeRequestAccessDocument']).toHaveBeenCalledWith(
        ['507f1f77bcf86cd799439011'],
        'doc123'
      );
    });

    it('should handle mixed users with and without request roles', async () => {
      const params = {
        documentId: 'doc123',
        users: [
          { _id: '507f1f77bcf86cd799439011', requestRole: DocumentRoleEnum.SPECTATOR },
          { _id: '507f1f77bcf86cd799439012' },
          { _id: '507f1f77bcf86cd799439013', requestRole: DocumentRoleEnum.VIEWER },
          { _id: '507f1f77bcf86cd799439014', requestRole: DocumentRoleEnum.SHARER },
        ],
        newRole: DocumentRoleEnum.VIEWER,
      };

      await documentService.removeRequestsAfterPermissionChanged(params);
      expect(documentService['removeRequestAccessDocument']).toHaveBeenCalledWith(
        ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439013'],
        'doc123'
      );
    });
  });

  describe('removeRequestAccessDocumentWhenAddedInTeam', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should remove request access for team members', async () => {
      const teamId = 'team123';
      const members = [{ userId: 'user1' }, { userId: 'user2' }];

      const mockTeam = { belongsTo: 'org123' };
      const mockTeamPermissions = [{ documentId: 'doc1' }, { documentId: 'doc2' }];
      const mockOrgPermissions = [{ documentId: 'doc3' }];

      jest.spyOn(teamService, 'findOneById').mockResolvedValue(mockTeam as any);
      jest.spyOn(documentService, 'getDocumentPermission')
        .mockResolvedValueOnce(mockTeamPermissions as any)
        .mockResolvedValueOnce(mockOrgPermissions as any);
      jest.spyOn(documentService, 'removeRequestAccess').mockResolvedValue({ deletedCount: 0 } as any);
      jest.spyOn(documentService, 'deleteDocumentPermissions').mockResolvedValue({ deletedCount: 0 } as any);

      await documentService.removeRequestAccessDocumentWhenAddedInTeam(teamId, members);

      expect(teamService.findOneById).toHaveBeenCalledWith(teamId);
      expect(documentService.getDocumentPermission).toHaveBeenCalledTimes(2);
      expect(documentService.removeRequestAccess).toHaveBeenCalledTimes(2);
      expect(documentService.deleteDocumentPermissions).toHaveBeenCalledWith({
        $and: [
          { refId: { $in: ['user1', 'user2'] } },
          { documentId: { $in: ['doc1', 'doc2', 'doc3'] } }
        ]
      });
    });
  });

  describe('getDocumentScope', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    
    it('should return TEAM scope when document has organization_team permissions', async () => {
      const documentId = 'doc123';
      const mockPermissions = [
        { role: 'owner', refId: 'user123' },
        { role: 'organization_team', refId: 'team456' }
      ];
      jest.spyOn(documentService, 'getDocumentPermissionsByDocId').mockResolvedValue(mockPermissions as any);
      const result = await documentService.getDocumentScope(documentId);
      expect(result).toBe('TEAM');
      expect(documentService.getDocumentPermissionsByDocId).toHaveBeenCalledWith(documentId);
    });

    it('should return ORGANIZATION scope when document has organization permissions', async () => {
      const documentId = 'doc123';
      const mockPermissions = [
        { role: 'owner', refId: 'user123' },
        { role: 'organization', refId: 'org456' }
      ];
      jest.spyOn(documentService, 'getDocumentPermissionsByDocId').mockResolvedValue(mockPermissions as any);
      const result = await documentService.getDocumentScope(documentId);
      expect(result).toBe('ORGANIZATION');
      expect(documentService.getDocumentPermissionsByDocId).toHaveBeenCalledWith(documentId);
    });

    it('should return ORGANIZATION scope when document has workspace type ORGANIZATION', async () => {
      const documentId = 'doc789';
      const mockPermissions = [
        { role: 'owner', refId: 'user123' },
        { role: 'viewer', refId: 'user456', workspace: { type: 'ORGANIZATION' } }
      ];
      jest.spyOn(documentService, 'getDocumentPermissionsByDocId').mockResolvedValue(mockPermissions as any);
    
      const result = await documentService.getDocumentScope(documentId);
    
      expect(result).toBe('PERSONAL');
      expect(documentService.getDocumentPermissionsByDocId).toHaveBeenCalledWith(documentId);
    });
  });
  
  describe('getDocumentsWithRefAndRole', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return documents with specified refId and role', async () => {
      const refId = '507f1f77bcf86cd799439011';
      const role = 'organization' as any;
      const projection = { name: 1 };
      const mockResult = [{ _id: 'doc1', name: 'Document 1' }];

      jest.spyOn(documentService, 'aggregateDocumentPermission').mockResolvedValue(mockResult as any);

      const result = await documentService.getDocumentsWithRefAndRole(refId, role, projection);

      expect(result).toEqual(mockResult);
      expect(documentService.aggregateDocumentPermission).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: {
              refId: expect.any(Object),
              role
            }
          }),
          expect.objectContaining({
            $project: projection
          })
        ])
      );
    });
  });

  describe('updateManySharedNonUser', () => {
    it('should update many shared non-user documents', async () => {
      const filter = { email: 'test@example.com' };
      const update = { role: 'viewer' };
      const options = { new: true };

      const mockResult = { modifiedCount: 2 };
      const mockExec = jest.fn().mockResolvedValue(mockResult);
      const mockUpdateMany = jest.fn().mockReturnValue({
        exec: mockExec
      });

      Object.defineProperty(documentService, 'documentSharedNonUserModel', {
        value: { updateMany: mockUpdateMany },
        configurable: true
      });

      const result = await documentService.updateManySharedNonUser(filter, update, options);
      expect(result).toEqual(mockResult);
      expect(mockUpdateMany).toHaveBeenCalledWith(filter, update, options);
    });
  });

  describe('countOwnedDocuments', () => {
    it('should count owned documents for user', async () => {
      const userId = 'user123';
      const mockResult = 5;

      const mockExec = jest.fn().mockResolvedValue(mockResult);
      const mockCountDocuments = jest.fn().mockReturnValue({
        exec: mockExec
      });
      Object.defineProperty(documentService, 'documentPermissionModel', {
        value: { countDocuments: mockCountDocuments },
        configurable: true
      });

      const result = await documentService.countOwnedDocuments(userId);
      expect(result).toBe(mockResult);
      expect(mockCountDocuments).toHaveBeenCalledWith({
        refId: userId,
        role: 'owner'
      });
    });
  });

  describe('updateManyDocuments', () => {
    it('should update many documents', async () => {
      const filter = { ownerId: 'user123' };
      const update = { status: 'active' };
      const options = { new: true };

      const mockResult = { modifiedCount: 3 };
      const mockExec = jest.fn().mockResolvedValue(mockResult);
      const mockUpdateMany = jest.fn().mockReturnValue({
        exec: mockExec
      });

      Object.defineProperty(documentService, 'documentModel', {
        value: { updateMany: mockUpdateMany },
        configurable: true
      });

      const result = await documentService.updateManyDocuments(filter, update, options);

      expect(result).toEqual(mockResult);
      expect(mockUpdateMany).toHaveBeenCalledWith(filter, update, options);
    });
  });

  describe('updateDocumentByIds', () => {
    it('should update documents by IDs in chunks', async () => {
      const documentIds = ['doc1', 'doc2', 'doc3', 'doc4', 'doc5'];
      const updateFields = { status: 'updated' };

      jest.spyOn(documentService, 'updateManyDocuments').mockResolvedValue({} as any);

      await documentService.updateDocumentByIds(documentIds, updateFields);

      expect(documentService.updateManyDocuments).toHaveBeenCalledTimes(1);
      expect(documentService.updateManyDocuments).toHaveBeenCalledWith(
        { _id: { $in: documentIds } },
        updateFields
      );
    });
  });

  describe('aggregateDocument', () => {
    it('should aggregate documents with given conditions', async () => {
      const conditions = [
        { $match: { status: 'active' } },
        { $group: { _id: '$ownerId', count: { $sum: 1 } } }
      ];

      const mockResult = [{ _id: 'user1', count: 5 }];
      const mockAggregate = jest.fn().mockResolvedValue(mockResult);

      Object.defineProperty(documentService, 'documentModel', {
        value: { aggregate: mockAggregate },
        configurable: true
      });

      const result = await documentService.aggregateDocument(conditions);

      expect(result).toEqual(mockResult);
      expect(mockAggregate).toHaveBeenCalledWith(conditions);
    });
  });

  describe('getDocumentByRemoteIds', () => {
    it('should use default empty array when remoteIds is not provided', async () => {
      const clientId = '507f1f77bcf86cd799439011';
      const mockResult: any[] = [];
      jest.spyOn(documentService, 'aggregateDocument').mockResolvedValue(mockResult);
      const result = await documentService.getDocumentByRemoteIds({ clientId } as any);
    
      expect(result).toEqual(mockResult);
      expect(documentService.aggregateDocument).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: {
              remoteId: { $in: [] },
              ownerId: expect.any(Object)
            }
          })
        ])
      );
    });
  });

  describe('validateUpdatePermission', () => {
    it('should throw error when member tries to change another member permission in organization', async () => {
      const params = {
        actorId: 'actor123',
        roleOfDocumentPermission: 'organization',
        findUser: { _id: 'user123' } as any,
        documentPermission: { refId: 'org123' } as any
      };

      const mockActorMember = { role: 'member' };
      jest.spyOn(organizationService, 'getMembershipByOrgAndUser')
        .mockResolvedValueOnce(mockActorMember as any)
        .mockResolvedValueOnce(null);

      await expect(documentService.validateUpdatePermission(params)).rejects.toThrow('Member can not change permission each other');
    });

    it('should throw error when trying to change manager permission in organization', async () => {
      const params = {
        actorId: 'actor123',
        roleOfDocumentPermission: 'organization',
        findUser: { _id: 'user123' } as any,
        documentPermission: { refId: 'org123' } as any
      };

      const mockActorMember = { role: 'admin' };
      const mockFindMember = { role: 'organization_admin' };
      jest.spyOn(organizationService, 'getMembershipByOrgAndUser')
        .mockResolvedValueOnce(mockActorMember as any)
        .mockResolvedValueOnce(mockFindMember as any);

      await expect(documentService.validateUpdatePermission(params)).rejects.toThrow('External shared can not change permission of internal member');
    });

    it('should throw error when member does not belong to team', async () => {
      const params = {
        actorId: 'actor123',
        roleOfDocumentPermission: 'organization_team',
        findUser: { _id: 'user123' } as any,
        documentPermission: { refId: 'team123' } as any
      };

      Object.defineProperty(documentService, 'membershipService', {
        value: { findOne: jest.fn().mockResolvedValue(null) },
        configurable: true
      });

      await expect(documentService.validateUpdatePermission(params)).rejects.toThrow('Member does not belong to this team');
    });

    it('should throw error when trying to change team admin permission', async () => {
      const params = {
        actorId: 'actor123',
        roleOfDocumentPermission: 'organization_team',
        findUser: { _id: 'user123' } as any,
        documentPermission: { refId: 'team123' } as any
      };

      const mockFindMember = { role: 'admin' };
      Object.defineProperty(documentService, 'membershipService', {
        value: { findOne: jest.fn().mockResolvedValue(mockFindMember as any) },
        configurable: true
      });

      await expect(documentService.validateUpdatePermission(params)).rejects.toThrow('Can not change permission of manager in team');
    });

    it('should throw error when user not belong to organization', async () => {
      const params = {
        actorId: 'actor123',
        roleOfDocumentPermission: 'organization',
        findUser: { _id: 'user123' } as any,
        documentPermission: { refId: 'org123' } as any,
      };
      const mockActorMember = { role: 'admin' };
      jest.spyOn(organizationService, 'getMembershipByOrgAndUser')
        .mockResolvedValueOnce(mockActorMember as any)
        .mockResolvedValueOnce(null);
  
      await expect(documentService.validateUpdatePermission(params))
        .rejects.toThrow('Can not change permission of manager in organization');
    });
  
    it('should throw error when trying to change billing moderator permission in organization', async () => {
      const params = {
        actorId: 'actor123',
        roleOfDocumentPermission: 'organization',
        findUser: { _id: 'user123' } as any,
        documentPermission: { refId: 'org123' } as any,
      };
  
      const mockActorMember = { role: 'admin' };
      const mockFindMember = { role: 'billing_moderator' };
      jest.spyOn(organizationService, 'getMembershipByOrgAndUser')
        .mockResolvedValueOnce(mockActorMember as any)
        .mockResolvedValueOnce(mockFindMember as any);
  
      await expect(documentService.validateUpdatePermission(params))
        .rejects.toThrow('Member does not belong to this organization');
    });
  });

  describe('getDocumentBelongTo', () => {
    it('should return external user resource when external permission exists', async () => {
      const sharerId = 'sharer123';
      const documentId = 'doc123';

      const mockPermissions = [
        { refId: { toHexString: () => 'sharer123' }, role: 'viewer' },
        { refId: { toHexString: () => 'org123' }, role: 'organization' }
      ];
      jest.spyOn(documentService, 'getDocumentPermissionsByDocId').mockResolvedValue(mockPermissions as any);
      Object.defineProperty(documentService, 'userService', {
        value: { 
          findUserById: jest.fn().mockResolvedValue({ _id: 'sharer123' } as any),
          isAvailableUsePremiumFeature: jest.fn().mockResolvedValue(true)
        },
        configurable: true
      });

      const result = await documentService.getDocumentBelongTo(sharerId, documentId);

      expect(result).toEqual({
        id: 'sharer123',
        isUsingPremium: true
      });
    });

    it('should return internal document resource when no external permission', async () => {
      const sharerId = 'sharer123';
      const documentId = 'doc123';

      const mockPermissions = [
        { refId: { toHexString: () => 'org123' }, role: 'organization' }
      ];

      jest.spyOn(documentService, 'getDocumentPermissionsByDocId').mockResolvedValue(mockPermissions as any);
      jest.spyOn(documentService, 'getInternalDocumentResource').mockResolvedValue({
        id: 'org123',
        isUsingPremium: false
      });

      const result = await documentService.getDocumentBelongTo(sharerId, documentId);

      expect(result).toEqual({
        id: 'org123',
        isUsingPremium: false
      });
    });
  });

  describe('getInternalDocumentResource', () => {
    it('should return organization resource for organization role', async () => {
      const internalPermission = { role: 'organization', refId: 'org123' };

      const mockOrg = { _id: 'org123', payment: { type: 'premium' } };
      jest.spyOn(organizationService, 'getOrgById').mockResolvedValue(mockOrg as any);
      jest.spyOn(documentService, 'getResourceWithPaymentStatus').mockReturnValue({
        id: 'org123',
        isUsingPremium: true
      });

      const result = await documentService.getInternalDocumentResource(internalPermission as any);

      expect(result).toEqual({
        id: 'org123',
        isUsingPremium: true
      });
    });

    it('should return organization resource for organization team role', async () => {
      const internalPermission = { role: 'organization_team', refId: 'team123' };

      const mockTeam = { _id: 'team123', belongsTo: 'org123' };
      const mockOrg = { _id: 'org123', payment: { type: 'free' } };
      jest.spyOn(teamService, 'findOne').mockResolvedValue(mockTeam as any);
      jest.spyOn(organizationService, 'getOrgById').mockResolvedValue(mockOrg as any);
      jest.spyOn(documentService, 'getResourceWithPaymentStatus').mockReturnValue({
        id: 'org123',
        isUsingPremium: false
      });

      const result = await documentService.getInternalDocumentResource(internalPermission as any);

      expect(result).toEqual({
        id: 'org123',
        isUsingPremium: false
      });
    });

    it('should return null for unknown role', async () => {
      const internalPermission = { role: 'unknown', refId: 'ref123' };

      const result = await documentService.getInternalDocumentResource(internalPermission as any);

      expect(result).toBeNull();
    });
  });

  describe('getResourceWithPaymentStatus', () => {
    it('should return resource with free status', () => {
      const resource = { _id: 'resource123', payment: { type: 'FREE' } };
      const result = documentService.getResourceWithPaymentStatus(resource as any);

      expect(result).toEqual({
        id: 'resource123',
        isUsingPremium: false
      });
    });
  });

  describe('getUserIdsHavePermission', () => {
    beforeEach(() => {
      Object.defineProperty(documentService, 'loggerService', {
        value: { info: jest.fn() },
        writable: true,
      });
    });    

    it('should return user IDs with permission', async () => {
      const documentId = 'doc123';
      const mockPermissions = [
        { refId: { toHexString: () => 'user1' }, role: 'viewer' },
        { refId: { toHexString: () => 'org123' }, role: 'organization' },
        { refId: { toHexString: () => 'user2' }, role: 'editor' }
      ];

      jest.spyOn(documentService, 'getDocumentPermissionsByDocId').mockResolvedValue(mockPermissions as any);
      jest.spyOn(documentService, 'getInternalMembers').mockResolvedValue(['user3', 'user4']);

      const result = await documentService.getUserIdsHavePermission(documentId);

      expect(result).toEqual(['user3', 'user4', 'user1', 'user2']);
    });

    it('should handle case with no internal permissions', async () => {
      const documentId = 'doc123';
      const mockPermissions = [
        { refId: { toHexString: () => 'user1' }, role: 'viewer' },
        { refId: { toHexString: () => 'user2' }, role: 'editor' }
      ];

      jest.spyOn(documentService, 'getDocumentPermissionsByDocId').mockResolvedValue(mockPermissions as any);

      const result = await documentService.getUserIdsHavePermission(documentId);

      expect(result).toEqual(['user1', 'user2']);
    });

    it('should log info when internalMembers count > 500', async () => {
      const documentId = 'doc123';
      const mockPermissions = [
        { refId: { toHexString: () => 'org123' }, role: 'organization' },
      ];
    
      const bigInternalMembers = Array.from({ length: 501 }, (_, i) => `user${i}`);
    
      jest.spyOn(documentService, 'getDocumentPermissionsByDocId').mockResolvedValue(mockPermissions as any);
      jest.spyOn(documentService, 'getInternalMembers').mockResolvedValue(bigInternalMembers);
    
      const loggerSpy = jest.spyOn(documentService['loggerService'], 'info');

      await documentService.getUserIdsHavePermission(documentId);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'countInternalMembers',
          extraInfo: expect.objectContaining({
            documentId,
            count: 501,
          }),
        }),
      );
    });    
  });

  describe('filterCommentersHavePermission', () => {
    it('should filter commenters who have permission', async () => {
      const commenterIds = ['user1', 'user2', 'user3'];
      const documentId = 'doc123';
      const mockUserIds = ['user1', 'user3'];

      jest.spyOn(documentService, 'getUserIdsHavePermission').mockResolvedValue(mockUserIds);

      const result = await documentService.filterCommentersHavePermission(commenterIds, documentId);

      expect(result).toEqual(['user1', 'user3']);
      expect(documentService.getUserIdsHavePermission).toHaveBeenCalledWith(documentId);
    });
  });

  describe('getInternalMembers', () => {
    it('should return organization members', async () => {
      const internalPermission = { role: 'organization', refId: 'org123' };
      const mockMemberships = [
        { userId: { toHexString: () => 'user1' } },
        { userId: { toHexString: () => 'user2' } }
      ];

      jest.spyOn(organizationService, 'getMembersByOrgId').mockResolvedValue(mockMemberships as any);

      const result = await documentService.getInternalMembers(internalPermission as any);

      expect(result).toEqual(['user1', 'user2']);
      expect(organizationService.getMembersByOrgId).toHaveBeenCalledWith('org123');
    });

    it('should return team members', async () => {
      const internalPermission = { role: DocumentRoleEnum.ORGANIZATION_TEAM, refId: 'team123' };
      const mockMemberships = [
        { userId: { toHexString: () => 'user1' } },
        { userId: { toHexString: () => 'user2' } }
      ];

      (documentService as any).membershipService = { find: jest.fn().mockResolvedValue(mockMemberships as any) };

      const result = await documentService.getInternalMembers(internalPermission as any);

      expect(result).toEqual(['user1', 'user2']);
      expect((documentService as any).membershipService.find).toHaveBeenCalledWith({ teamId: 'team123' });
    });

    it('should return empty array for unknown role', async () => {
      const internalPermission = { role: 'unknown', refId: 'ref123' };

      const result = await documentService.getInternalMembers(internalPermission as any);

      expect(result).toEqual([]);
    });
  });

  describe('updateUserContactWhenShareDocument', () => {
    it('should update user contacts when sharing document', async () => {
      const sharerId = 'sharer123';
      const sharedIds = ['user1', 'user2'];
      const mockContact = { _id: 'contact123' };

      (documentService as any).userService = { updateContactList: jest.fn().mockResolvedValue(mockContact as any) };

      const result = await documentService.updateUserContactWhenShareDocument(sharerId, sharedIds);

      expect(result).toEqual(mockContact);
      expect((documentService as any).userService.updateContactList).toHaveBeenCalledWith('user1', [sharerId]);
      expect((documentService as any).userService.updateContactList).toHaveBeenCalledWith('user2', [sharerId]);
      expect((documentService as any).userService.updateContactList).toHaveBeenCalledWith(sharerId, sharedIds);
    });
  });

  describe('verifyUserToUpdateDocumentPermission', () => {
    const documentId = 'doc123';
    const actorId = 'actor1';
    const sharedEmail = 'shared@test.com';
    const sharedUser = { _id: 'user123', email: sharedEmail };
  
    beforeEach(() => {
      Object.defineProperty(documentService, 'userService', {
        value: { findUserByEmail: jest.fn() },
        writable: true,
      });
    });
  
    it('should return USER_VALID if shared user does not exist', async () => {
      jest.spyOn(documentService['userService'], 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(documentService, 'getDocumentPermissionByConditions').mockResolvedValue([]);
  
      const result = await documentService.verifyUserToUpdateDocumentPermission({
        actorId,
        sharedEmail,
        documentId,
      });
  
      expect(result).toEqual({
        email: sharedEmail,
        status: SearchUserStatus.USER_VALID,
      });
    });

    it('should return USER_UNALLOWED if actorId equals sharedUser._id', async () => {
      jest.spyOn(documentService['userService'], 'findUserByEmail').mockResolvedValue({ _id: actorId, email: sharedEmail } as any);
      jest.spyOn(documentService, 'getDocumentPermissionByConditions').mockResolvedValue([
        { role: DocumentRoleEnum.OWNER, refId: { toHexString: () => actorId }, groupPermissions: {} } as any,
      ]);
  
      const result = await documentService.verifyUserToUpdateDocumentPermission({
        actorId,
        sharedEmail,
        documentId,
      });
  
      expect(result.status).toBe(SearchUserStatus.USER_UNALLOWED);
    });

    it('should return USER_VALID if actor is the OWNER', async () => {
      jest.spyOn(documentService['userService'], 'findUserByEmail').mockResolvedValue(sharedUser as any);
      jest.spyOn(documentService, 'getDocumentPermissionByConditions').mockResolvedValue([
        { role: DocumentRoleEnum.OWNER, refId: { toHexString: () => actorId }, groupPermissions: {} } as any,
      ]);
  
      const result = await documentService.verifyUserToUpdateDocumentPermission({
        actorId,
        sharedEmail,
        documentId,
      } as any);
  
      expect(result.status).toBe(SearchUserStatus.USER_VALID);
    });  

    it('should return USER_VALID if actor has SHARER permission but sharedUser not in canSharePermissionIds', async () => {
      jest.spyOn(documentService['userService'], 'findUserByEmail').mockResolvedValue(sharedUser as any);
      jest.spyOn(documentService, 'getDocumentPermissionByConditions').mockResolvedValue([
        { role: DocumentRoleEnum.OWNER, refId: { toHexString: () => 'otherOwner' }, groupPermissions: {} } as any,
        { role: DocumentRoleEnum.SHARER, refId: { toHexString: () => actorId } },
      ]);
  
      const result = await documentService.verifyUserToUpdateDocumentPermission({
        actorId,
        sharedEmail,
        documentId,
      } as any);
  
      expect(result.status).toBe(SearchUserStatus.USER_VALID);
    });
  
    it('should delegate to verifyShareOrgDocument when role is ORGANIZATION', async () => {
      jest.spyOn(documentService['userService'], 'findUserByEmail').mockResolvedValue(sharedUser as any);
      jest.spyOn(documentService, 'getDocumentPermissionByConditions').mockResolvedValue([
        { role: DocumentRoleEnum.ORGANIZATION, refId: { toHexString: () => 'org123' }, groupPermissions: {} } as any,
      ]);
  
      const verifyOrgSpy = jest.spyOn(documentService, 'verifyShareOrgDocument').mockResolvedValue(SearchUserStatus.USER_VALID);
      const result = await documentService.verifyUserToUpdateDocumentPermission({
        actorId,
        sharedEmail,
        documentId,
      } as any);
  
      expect(verifyOrgSpy).toHaveBeenCalled();
      expect(result.status).toBe(SearchUserStatus.USER_VALID);
    });
    
    it('should delegate to verifyShareTeamDocument when role is ORGANIZATION_TEAM', async () => {
      jest.spyOn(documentService['userService'], 'findUserByEmail').mockResolvedValue(sharedUser as any);
      jest.spyOn(documentService, 'getDocumentPermissionByConditions').mockResolvedValue([
        { role: DocumentRoleEnum.ORGANIZATION_TEAM, refId: { toHexString: () => 'team123' }, groupPermissions: {} } as any,
      ]);
  
      const verifyTeamSpy = jest.spyOn(documentService, 'verifyShareTeamDocument').mockResolvedValue(SearchUserStatus.USER_UNALLOWED);
      const result = await documentService.verifyUserToUpdateDocumentPermission({
        actorId,
        sharedEmail,
        documentId,
      } as any);
  
      expect(verifyTeamSpy).toHaveBeenCalled();
      expect(result.status).toBe(SearchUserStatus.USER_UNALLOWED);
    });  

    it('should return USER_UNALLOWED when no rootDocPermission found', async () => {
      jest.spyOn(documentService['userService'], 'findUserByEmail').mockResolvedValue(sharedUser as any);
      jest.spyOn(documentService, 'getDocumentPermissionByConditions').mockResolvedValue([
        { role: DocumentRoleEnum.VIEWER, refId: { toHexString: () => 'someone' } } as any,
      ]);
    
      const result = await documentService.verifyUserToUpdateDocumentPermission({
        actorId,
        sharedEmail,
        documentId,
      } as any);
    
      expect(result.status).toBe(SearchUserStatus.USER_UNALLOWED);
    });
    
    it('should return USER_UNALLOWED when memberRole exists and is not SHARER', async () => {
      jest.spyOn(documentService['userService'], 'findUserByEmail').mockResolvedValue(sharedUser as any);
      jest.spyOn(documentService, 'getDocumentPermissionByConditions').mockResolvedValue([
        {
          role: DocumentRoleEnum.OWNER,
          refId: { toHexString: () => 'owner123' },
          groupPermissions: { [actorId]: DocumentRoleEnum.EDITOR },
        } as any,
      ]);
    
      const result = await documentService.verifyUserToUpdateDocumentPermission({
        actorId,
        sharedEmail,
        documentId,
      } as any);
    
      expect(result.status).toBe(SearchUserStatus.USER_UNALLOWED);
    }); 
    
    it('should return USER_UNALLOWED when sharedUser is in canSharePermissionIds', async () => {
      const actorId = 'actor123';
      const sharedUser = { _id: 'shared456', email: 'shared@example.com' };
    
      jest.spyOn(documentService['userService'], 'findUserByEmail').mockResolvedValue(sharedUser as any);
    
      const rootDocPermission = {
        role: DocumentRoleEnum.OWNER,
        refId: { toHexString: () => 'owner999' },
      };
      const existedActorDocPermission = {
        role: DocumentRoleEnum.SHARER,
        refId: { toHexString: () => actorId },
      };
    
      jest.spyOn(documentService, 'getDocumentPermissionByConditions').mockResolvedValue([
        rootDocPermission,
        existedActorDocPermission,
        { role: DocumentRoleEnum.SHARER, refId: { toHexString: () => sharedUser._id } },
      ] as any);
    
      const result = await documentService.verifyUserToUpdateDocumentPermission({
        actorId,
        sharedEmail: sharedUser.email,
        documentId: 'doc123',
      });
    
      expect(result.status).toBe(SearchUserStatus.USER_UNALLOWED);
    });
      
  });
  
  describe('shareDocumentNonLuminUser', () => {
    it('should share document with non-lumin users', async () => {
      const params = {
        document: { _id: 'doc123', name: 'Test Document' } as any,
        role: 'viewer',
        message: 'Check this document',
        nonLuminUserEmails: ['test@example.com'],
        sharer: { _id: 'sharer123', email: 'sharer@example.com', name: 'Sharer', timezoneOffset: 0 } as any
      };

      jest.spyOn(documentService, 'createNonLuminShared').mockResolvedValue([]);
      (documentService as any).authService = { 
        createTokeWithoutExpire: jest.fn().mockReturnValue('mock-token'),
        createToken: jest.fn().mockReturnValue('mock-token')
      };
      (documentService as any).emailService = { sendEmail: jest.fn() };
      (documentService as any).environmentService = {
        getByKey: jest.fn().mockReturnValue('http://test.com')
      };

      await documentService.shareDocumentNonLuminUser(params);

      expect(documentService.createNonLuminShared).toHaveBeenCalled();
      expect((documentService as any).emailService.sendEmail).toHaveBeenCalled();
    });
  });

  describe('verifyShareOrgDocument', () => {
    it('should verify share org document for valid user', async () => {
      const params = {
        orgId: 'org123',
        sharedUser: { _id: 'user123', email: 'user@example.com', name: 'User' } as any,
        actorId: 'actor123',
        canSharePermissionIds: ['user1', 'user2'],
        actorDocPermission: null
      };

      (documentService as any).organizationService = { 
        getMembershipByOrgAndUser: jest.fn()
          .mockResolvedValueOnce({ role: OrganizationRoleEnums.MEMBER } as any)
          .mockResolvedValueOnce({ role: OrganizationRoleEnums.ORGANIZATION_ADMIN } as any)
      };

      const result = await documentService.verifyShareOrgDocument(params);

      expect(result).toBe(SearchUserStatus.USER_VALID);
      expect((documentService as any).organizationService.getMembershipByOrgAndUser).toHaveBeenCalledWith('org123', 'user123');
    });

    it('should return USER_VALID when actor is external and shared user has no membership and not in canSharePermissionIds', async () => {
      const params = {
        orgId: 'org123',
        sharedUser: { _id: 'user999', email: 'outsider@example.com' } as any,
        actorId: 'actor123',
        canSharePermissionIds: ['user1', 'user2'],
        actorDocPermission: { role: 'external', refId: 'ext123' } as any,
      };
  
      (documentService as any).organizationService = { 
        getMembershipByOrgAndUser: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ role: 'external' })
      };
  
      const result = await documentService.verifyShareOrgDocument(params);
  
      expect(result).toBe(SearchUserStatus.USER_VALID);
    });
  
    it('should return USER_UNALLOWED when actor is external and shared user has membership', async () => {
      const params = {
        orgId: 'org123',
        sharedUser: { _id: 'user123', email: 'member@example.com' } as any,
        actorId: 'actor123',
        canSharePermissionIds: ['user1', 'user2'],
        actorDocPermission: { role: 'external', refId: 'ext123' } as any,
      };
  
      (documentService as any).organizationService = { 
        getMembershipByOrgAndUser: jest.fn()
          .mockResolvedValueOnce({ role: 'member' })
          .mockResolvedValueOnce({ role: 'external' })
      };
  
      const result = await documentService.verifyShareOrgDocument(params);
  
      expect(result).toBe(SearchUserStatus.USER_UNALLOWED);
    });

    it('should return USER_UNALLOWED when actor is external and shared user is in canSharePermissionIds', async () => {
      const params = {
        orgId: 'org123',
        sharedUser: { _id: 'user2', email: 'allowed@example.com' } as any,
        actorId: 'actor123',
        canSharePermissionIds: ['user1', 'user2'],
        actorDocPermission: { role: 'external', refId: 'ext123' } as any,
      };
  
      (documentService as any).organizationService = { 
        getMembershipByOrgAndUser: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ role: 'external' })
      };
  
      const result = await documentService.verifyShareOrgDocument(params);
  
      expect(result).toBe(SearchUserStatus.USER_UNALLOWED);
    });

    it('should return USER_UNALLOWED when actor cannot edit sharedUser permission (sharedUserMembership = null)', async () => {
      const params = {
        orgId: 'org123',
        sharedUser: { _id: 'user123', email: 'member@example.com' } as any,
        actorId: 'actor123',
        canSharePermissionIds: [],
        actorDocPermission: null,
      };
    
      (documentService as any).organizationService = { 
        getMembershipByOrgAndUser: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ role: OrganizationRoleEnums.MEMBER })
      };
      jest.spyOn(documentService, 'canEditPermission').mockReturnValue(false);
      const result = await documentService.verifyShareOrgDocument(params);
      expect(result).toBe(SearchUserStatus.USER_UNALLOWED);
    });
    
    it('should return USER_VALID when actor can edit sharedUser permission', async () => {
      const params = {
        orgId: 'org123',
        sharedUser: { _id: 'user123', email: 'member@example.com' } as any,
        actorId: 'actor123',
        canSharePermissionIds: [],
        actorDocPermission: null,
      };
    
      (documentService as any).organizationService = { 
        getMembershipByOrgAndUser: jest.fn()
          .mockResolvedValueOnce({ role: OrganizationRoleEnums.MEMBER })
          .mockResolvedValueOnce({ role: OrganizationRoleEnums.ORGANIZATION_ADMIN })
      };
      jest.spyOn(documentService, 'canEditPermission').mockReturnValue(true);
    
      const result = await documentService.verifyShareOrgDocument(params);
    
      expect(result).toBe(SearchUserStatus.USER_VALID);
    });
  });

  describe('verifyShareTeamDocument', () => {
    it('should verify share team document for valid user', async () => {
      const params = {
        teamId: 'team123',
        sharedUser: { _id: 'user123', email: 'user@example.com', name: 'User' } as any,
        actorId: 'actor123',
        canSharePermissionIds: ['user1', 'user2'],
        actorDocPermission: null
      };

      (documentService as any).membershipService = { 
        findOne: jest.fn()
          .mockResolvedValueOnce({ role: OrganizationTeamRoles.MEMBER } as any)
          .mockResolvedValueOnce({ role: OrganizationTeamRoles.ADMIN } as any)
      };

      const result = await documentService.verifyShareTeamDocument(params);

      expect(result).toBe('USER_VALID');
      expect((documentService as any).membershipService.findOne).toHaveBeenCalledWith({ teamId: 'team123', userId: 'user123' });
    });

    it('should return unallowed for user not in team', async () => {
      const params = {
        teamId: 'team123',
        sharedUser: { _id: 'user123', email: 'user@example.com', name: 'User' } as any,
        actorId: 'actor123',
        canSharePermissionIds: ['user1', 'user2'],
        actorDocPermission: { refId: 'team123' } as any
      };

      (documentService as any).membershipService = { findOne: jest.fn().mockResolvedValue(null) };

      const result = await documentService.verifyShareTeamDocument(params);

      expect(result).toBe('USER_VALID');
    });

    it('should return USER_UNALLOWED when actorDocPermission exists and sharedUser is already in team', async () => {
      const params = {
        teamId: 'team123',
        sharedUser: { _id: 'user123', email: 'user@example.com' } as any,
        actorId: 'actor123',
        canSharePermissionIds: [],
        actorDocPermission: { refId: 'team123' } as any,
      };
      (documentService as any).membershipService = {
        findOne: jest.fn()
          .mockResolvedValueOnce({ role: OrganizationTeamRoles.MEMBER })
          .mockResolvedValueOnce({ role: OrganizationTeamRoles.MEMBER })
      };
      const result = await documentService.verifyShareTeamDocument(params);
    
      expect(result).toBe(SearchUserStatus.USER_UNALLOWED);
    });

    it('should return USER_UNALLOWED when actor cannot edit sharedUser permission (sharedUserMembership = null)', async () => {
      const params = {
        teamId: 'team123',
        sharedUser: { _id: 'user123', email: 'user@example.com' } as any,
        actorId: 'actor123',
        canSharePermissionIds: [],
        actorDocPermission: null,
      };
      (documentService as any).membershipService = {
        findOne: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ role: OrganizationTeamRoles.MEMBER })
      };
      jest.spyOn(documentService, 'canEditPermission').mockReturnValue(false);
    
      const result = await documentService.verifyShareTeamDocument(params);
    
      expect(result).toBe(SearchUserStatus.USER_UNALLOWED);
    });
  });

  describe('canEditPermission', () => {
    it('should return false for editor editing owner', () => {
      const result = documentService.canEditPermission(OrganizationRoleEnums.BILLING_MODERATOR, OrganizationRoleEnums.ORGANIZATION_ADMIN);
      expect(result).toBe(false);
    });
  });

  describe('copyDocumentAndThumbnailToS3', () => {
    it('should copy document and thumbnail to S3', async () => {
      const document = { _id: 'doc123', remoteId: 'remote123', thumbnail: 'thumb123' };

      jest.spyOn(documentService, 'copyDocumentToS3').mockResolvedValue('newDocKey');
      jest.spyOn(documentService, 'copyThumbnailToS3').mockResolvedValue('newThumbKey');

      const result = await documentService.copyDocumentAndThumbnailToS3(document as any);

      expect(result).toEqual(['newDocKey', 'newThumbKey']);
      expect(documentService.copyDocumentToS3).toHaveBeenCalledWith(document, EnvConstants.S3_DOCUMENTS_BUCKET);
      expect(documentService.copyThumbnailToS3).toHaveBeenCalledWith('thumb123');
    });
  });

  describe('copyDocumentToS3', () => {
    it('should copy document to S3', async () => {
      const document = { _id: 'doc123', remoteId: 'remote123', mimeType: 'application/pdf' };

      (documentService as any).awsService = { 
        copyObjectS3: jest.fn().mockResolvedValue('newDocKey'),
        s3InstanceForDocument: jest.fn().mockReturnValue({})
      };
      (documentService as any).environmentService = {
        getByKey: jest.fn().mockReturnValue('test-bucket')
      };

      const result = await documentService.copyDocumentToS3(document as any);

      expect(result).toBe('newDocKey');
      expect((documentService as any).awsService.copyObjectS3).toHaveBeenCalled();
    });
  });

  describe('copyThumbnailToS3', () => {
    it('should copy thumbnail to S3', async () => {
      const remoteId = 'remote123';

      (documentService as any).awsService = { 
        copyObjectS3: jest.fn().mockResolvedValue('newThumbKey')
      };
      (documentService as any).environmentService = {
        getByKey: jest.fn().mockReturnValue('test-bucket')
      };

      const result = await documentService.copyThumbnailToS3(remoteId);

      expect(result).toBe('newThumbKey');
      expect((documentService as any).awsService.copyObjectS3).toHaveBeenCalled();
    });
  });

  describe('copyAnnotation', () => {
    it('should replace annotationId when it equals sourceDocId', async () => {
      const sourceDocId = 'source123';
      const copiedDocId = 'target123';
      const mockAnnotations = [
        { _id: 'ann3', documentId: sourceDocId, annotationId: sourceDocId }
      ];
  
      const expectedAnnotations = [
        { documentId: copiedDocId, annotationId: copiedDocId }
      ];
  
      jest.spyOn(documentService, 'getAnnotationsOfDocument').mockResolvedValue(mockAnnotations as any);
      jest.spyOn(documentService, 'addManyAnnotations').mockResolvedValue(expectedAnnotations as any);
  
      const result = await documentService.copyAnnotation(sourceDocId, copiedDocId);
  
      expect(result).toEqual(expectedAnnotations);
      expect(documentService.addManyAnnotations).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            documentId: copiedDocId,
            annotationId: copiedDocId
          })
        ])
      );
    });
  });

  describe('verifyCopyToDocDestinationPermission', () => {
    it('should return allowed for personal destination', async () => {
      const data = {
        destinationType: 'PERSONAL' as any,
        destinationId: 'user123',
        creatorId: 'user123'
      };
      (documentService as any).userService = {
        findUserById: jest.fn().mockResolvedValue({ metadata: { isMigratedPersonalDoc: false } })
      };
      const result = await documentService.verifyCopyToDocDestinationPermission(data);

      expect(result.isAllowed).toBe(true);
    });

    it('should return allowed for organization destination with valid membership', async () => {
      const data = {
        destinationType: TypeOfDocument.ORGANIZATION,
        destinationId: 'org123',
        creatorId: 'user123'
      };
      (documentService as any).organizationService = { 
        getMembershipByOrgAndUser: jest.fn().mockResolvedValue({ role: 'member' } as any)
      };
      const result = await documentService.verifyCopyToDocDestinationPermission(data);

      expect(result.isAllowed).toBe(true);
      expect((documentService as any).organizationService.getMembershipByOrgAndUser).toHaveBeenCalledWith('org123', 'user123', { _id: 1 });
    });

    it('should return not allowed for organization destination without membership', async () => {
      const data = {
        destinationType: 'ORGANIZATION' as any,
        destinationId: 'org123',
        creatorId: 'user123'
      };

      (documentService as any).organizationService = { 
        getMembershipByOrgAndUser: jest.fn().mockResolvedValue(null)
      };

      const result = await documentService.verifyCopyToDocDestinationPermission(data);

      expect(result.isAllowed).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return not allowed for organization team destination without membership', async () => {
      const data = {
        destinationType: TypeOfDocument.ORGANIZATION_TEAM,
        destinationId: 'team123',
        creatorId: 'user123'
      };
      (documentService as any).organizationTeamService = {
        getOrgTeamMembershipOfUser: jest.fn().mockResolvedValue(null)
      };
      const result = await documentService.verifyCopyToDocDestinationPermission(data);
    
      expect(result.isAllowed).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return not allowed for personal destination when creatorId !== destinationId and no org membership', async () => {
      const data = {
        destinationType: TypeOfDocument.PERSONAL,
        destinationId: 'otherUser',
        creatorId: 'user123'
      };
      (documentService as any).organizationService = {
        getMembershipByOrgAndUser: jest.fn().mockResolvedValue(null)
      };
      const result = await documentService.verifyCopyToDocDestinationPermission(data);
    
      expect(result.isAllowed).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return not allowed for personal destination when migrated personal doc', async () => {
      const data = {
        destinationType: TypeOfDocument.PERSONAL,
        destinationId: 'user123',
        creatorId: 'user123'
      };
      (documentService as any).userService = {
        findUserById: jest.fn().mockResolvedValue({ metadata: { isMigratedPersonalDoc: true } })
      };
      const result = await documentService.verifyCopyToDocDestinationPermission(data);

      expect(result.isAllowed).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return allowed for unsupported destinationType (default case)', async () => {
      const data = {
        destinationType: 'UNKNOWN' as any,
        destinationId: 'something',
        creatorId: 'user123'
      };
      const result = await documentService.verifyCopyToDocDestinationPermission(data);
    
      expect(result.isAllowed).toBe(true);
    });
  });

  describe('createLuminDocumentCopy', () => {
    it('should create lumin document copy successfully', async () => {
      const data = {
        sourceDocument: { _id: 'source123', name: 'Source Doc', mimeType: 'application/pdf', size: 1000, manipulationStep: 'step1' } as any,
        documentName: 'Copied Doc',
        destinationId: 'dest123',
        destinationType: 'PERSONAL' as any,
        creatorId: 'user123'
      };

      const mockCopiedDocument = { _id: 'copy123', name: 'Copied Doc' };
      jest.spyOn(documentService, 'createDocument').mockResolvedValue(mockCopiedDocument as any);
      jest.spyOn(documentService, 'copyDocumentAndThumbnailToS3').mockResolvedValue(['newDocKey', 'newThumbKey']);
      jest.spyOn(documentService, 'getDocumentNameAfterNaming').mockResolvedValue('Copied Doc.pdf');

      const result = await documentService.createLuminDocumentCopy(data);

      expect(result).toEqual(mockCopiedDocument);
      expect(documentService.createDocument).toHaveBeenCalled();
      expect(documentService.copyDocumentAndThumbnailToS3).toHaveBeenCalledWith(data.sourceDocument);
    });

    it('should throw NotFound error when newDocRemoteId is missing', async () => {
      const data = {
        sourceDocument: { _id: 'source123', name: 'Source Doc', mimeType: 'application/pdf', size: 1000, manipulationStep: 'step1' } as any,
        documentName: 'Copied Doc',
        destinationId: 'dest123',
        destinationType: 'PERSONAL' as any,
        creatorId: 'user123'
      };
    
      jest.spyOn(documentService, 'copyDocumentAndThumbnailToS3').mockResolvedValue(['', 'newThumbKey']);
    
      await expect(documentService.createLuminDocumentCopy(data))
        .rejects
        .toThrow('Fail to create copied document in S3');
    });

    it('should use destinationId as clientId when destinationType is ORGANIZATION', async () => {
      const data = {
        sourceDocument: { _id: 'source123', name: 'Source Doc', mimeType: 'application/pdf', size: 1000, manipulationStep: 'step1' } as any,
        documentName: 'Copied Doc',
        destinationId: 'org123',
        destinationType: TypeOfDocument.ORGANIZATION,
        creatorId: 'user123'
      };
      const mockCopiedDocument = { _id: 'copy123', name: 'Copied Doc' };
      jest.spyOn(documentService, 'createDocument').mockResolvedValue(mockCopiedDocument as any);
      jest.spyOn(documentService, 'copyDocumentAndThumbnailToS3').mockResolvedValue(['newDocKey', 'newThumbKey']);
      const getNameSpy = jest.spyOn(documentService, 'getDocumentNameAfterNaming').mockResolvedValue('Copied Doc.pdf');
    
      await documentService.createLuminDocumentCopy(data);
    
      expect(getNameSpy).toHaveBeenCalledWith(expect.objectContaining({
        clientId: 'org123',
        documentFolderType: TypeOfDocument.ORGANIZATION,
      }));
    });
  });

  describe('sendCopyDocNotiToMembers', () => {
    it('should send copy document notification to organization team members', async () => {
      const data = {
        destinationId: 'team123',
        destinationType: TypeOfDocument.ORGANIZATION_TEAM,
        creatorId: 'user123',
        copiedDocument: { _id: 'copy123', name: 'Copied Doc' } as any,
        notifyUpload: true
      };

      const mockCreator = { _id: 'user123', name: 'User' };
      const mockTeam = { _id: 'team123', name: 'Test Team', belongsTo: 'org123' };
      const mockOrganization = { _id: 'org123', name: 'Test Organization' };

      (documentService as any).userService = {
        findUserById: jest.fn().mockResolvedValue(mockCreator)
      };
      (documentService as any).teamService = {
        findOneById: jest.fn().mockResolvedValue(mockTeam)
      };
      (documentService as any).organizationService = {
        getOrgById: jest.fn().mockResolvedValue(mockOrganization)
      };
      (documentService as any).membershipService = {
        publishNotiToAllTeamMember: jest.fn()
      };
      (documentService as any).membershipService = {
        publishNotiToAllTeamMember: jest.fn(),
        findOne: jest.fn()
      };

      const { notiDocumentFactory } = require('../../Common/factory/NotiFactory');
      notiDocumentFactory.create = jest.fn().mockReturnValue({});

      await documentService.sendCopyDocNotiToMembers(data);

      expect((documentService as any).teamService.findOneById).toHaveBeenCalledWith('team123');
      expect((documentService as any).organizationService.getOrgById).toHaveBeenCalledWith('org123');
      expect(notiDocumentFactory.create).toHaveBeenCalledWith(
        expect.any(Number),
        {
          actor: { user: mockCreator },
          entity: { document: data.copiedDocument },
          target: { team: mockTeam, organization: mockOrganization }
        }
      );
      expect((documentService as any).membershipService.publishNotiToAllTeamMember).toHaveBeenCalledWith(
        'team123',
        {},
        ['user123']
      );
    });

    it('should handle default case (PERSONAL) without sending notifications', async () => {
      const data = {
        destinationId: 'user123',
        destinationType: TypeOfDocument.PERSONAL,
        creatorId: 'user123',
        copiedDocument: { _id: 'copy123', name: 'Copied Doc' } as any,
        notifyUpload: true
      };

      (documentService as any).userService = {
        findUserById: jest.fn().mockResolvedValue({ _id: 'user123', name: 'User' })
      };
      (documentService as any).notificationService = {
        createUsersNotifications: jest.fn(),
        publishFirebaseNotifications: jest.fn()
      };
      (documentService as any).membershipService = {
        publishNotiToAllTeamMember: jest.fn()
      };

      await documentService.sendCopyDocNotiToMembers(data);

      expect((documentService as any).notificationService.createUsersNotifications).not.toHaveBeenCalled();
      expect((documentService as any).notificationService.publishFirebaseNotifications).not.toHaveBeenCalled();
      expect((documentService as any).membershipService.publishNotiToAllTeamMember).not.toHaveBeenCalled();
    });

    it('should not send notifications for organization when notifyUpload is false', async () => {
      const data = {
        destinationId: 'dest123',
        destinationType: TypeOfDocument.ORGANIZATION,
        creatorId: 'user123',
        copiedDocument: { _id: 'copy123', name: 'Copied Doc' } as any,
        notifyUpload: false
      };

      (documentService as any).userService = {
        findUserById: jest.fn().mockResolvedValue({ _id: 'user123', name: 'User' })
      };
      (documentService as any).organizationService = { 
        getOrgById: jest.fn().mockResolvedValue({ _id: 'org123' }),
        getMembersByOrgId: jest.fn().mockResolvedValue([]),
        getOrgNotiReceiverIds: jest.fn().mockResolvedValue([]) 
      };
      (documentService as any).notificationService = {
        createUsersNotifications: jest.fn(),
        publishFirebaseNotifications: jest.fn()
      };

      await documentService.sendCopyDocNotiToMembers(data);

      expect((documentService as any).organizationService.getMembersByOrgId).not.toHaveBeenCalled();
      expect((documentService as any).notificationService.createUsersNotifications).not.toHaveBeenCalled();
      expect((documentService as any).notificationService.publishFirebaseNotifications).not.toHaveBeenCalled();
    });

    it('should exclude creatorId from orgMembers when sending organization notifications', async () => {
      const data = {
        destinationId: 'org123',
        destinationType: TypeOfDocument.ORGANIZATION,
        creatorId: 'user123',
        copiedDocument: { _id: 'copy123', name: 'Copied Doc' } as any,
        notifyUpload: true
      };
      const mockCreator = { _id: 'user123', name: 'User' };
      const mockOrganization = { _id: 'org123', name: 'Test Org' };
    
      (documentService as any).userService = {
        findUserById: jest.fn().mockResolvedValue(mockCreator),
      };
      (documentService as any).organizationService = {
        getOrgById: jest.fn().mockResolvedValue(mockOrganization),
        getMembersByOrgId: jest.fn().mockResolvedValue([
          { userId: { toHexString: () => 'user123' }, role: 'member' },
          { userId: { toHexString: () => 'user456' }, role: 'member' },
        ]),
        getOrgNotiReceiverIds: jest.fn().mockResolvedValue(['user456']),
      };
      (documentService as any).notificationService = {
        createUsersNotifications: jest.fn(),
        publishFirebaseNotifications: jest.fn(),
      };
    
      const { notiDocumentFactory } = require('../../Common/factory/NotiFactory');
      notiDocumentFactory.create = jest.fn().mockReturnValue({});
    
      const { notiFirebaseDocumentFactory } = require('../../Common/factory/NotiFirebaseFactory');
      notiFirebaseDocumentFactory.create = jest.fn().mockReturnValue({
        notificationContent: 'content',
        notificationData: {},
      });
    
      await documentService.sendCopyDocNotiToMembers(data);
    
      expect((documentService as any).organizationService.getMembersByOrgId).toHaveBeenCalledWith(
        'org123',
        { userId: 1, role: 1 }
      );
      expect((documentService as any).organizationService.getOrgNotiReceiverIds).toHaveBeenCalledWith({
        orgId: 'org123',
        optionalReceivers: [{ userId: { toHexString: expect.any(Function) }, role: 'member' }],
      });
      expect((documentService as any).notificationService.createUsersNotifications).toHaveBeenCalledWith(
        {},
        ['user456']
      );
      expect((documentService as any).notificationService.publishFirebaseNotifications).toHaveBeenCalledWith(
        ['user456'],
        'content',
        {}
      );
    });
    
  });

  describe('copyDocumentFromFileBuffer', () => {
    it('should copy document from file buffer successfully with thumbnail', async () => {
      const payload = {
        originalDocument: { _id: 'original123', name: 'Original Doc', thumbnail: 'thumb123', manipulationStep: 'step1' } as any,
        file: { buffer: Buffer.from('test'), mimetype: 'application/pdf', filename: 'test.pdf', filesize: 100, fileBuffer: Buffer.from('test') } as any,
        creatorId: 'user123',
        destinationType: 'PERSONAL' as any,
        destinationId: 'dest123',
        documentName: 'Copied Doc',
        folderId: 'folder123'
      };

      const mockCopiedDocument = { _id: 'copy123', name: 'Duplicated Doc' };
      (documentService as any).documentServiceMobile = { createDocumentWithBufferData: jest.fn().mockResolvedValue(mockCopiedDocument) };
      (documentService as any).awsService = { copyObjectS3: jest.fn().mockResolvedValue('newThumbKey') };
      (documentService as any).environmentService = { getByKey: jest.fn().mockReturnValue('test-bucket') };

      const result = await documentService.copyDocumentFromFileBuffer(payload);

      expect(result).toEqual(mockCopiedDocument);
      expect((documentService as any).documentServiceMobile.createDocumentWithBufferData).toHaveBeenCalledWith({
        clientId: 'user123',
        doc: payload.file,
        thumbnail: null,
        uploader: { _id: 'user123' },
        docType: 'PERSONAL',
        folderId: 'folder123'
      }, {
        documentName: 'Copied Doc',
        thumbnailKey: 'newThumbKey',
        manipulationStep: 'step1'
      });
    });

    it('should copy document from file buffer successfully without thumbnail', async () => {
      const payload = {
        originalDocument: { _id: 'original123', name: 'Original Doc', thumbnail: null, manipulationStep: 'step1' } as any,
        file: { buffer: Buffer.from('test'), mimetype: 'application/pdf', filename: 'test.pdf', filesize: 100, fileBuffer: Buffer.from('test') } as any,
        creatorId: 'user123',
        destinationType: 'ORGANIZATION' as any,
        destinationId: 'org123',
        documentName: 'Copied Doc'
      };

      const mockCopiedDocument = { _id: 'copy123', name: 'Copied Doc' };
      (documentService as any).documentServiceMobile = { createDocumentWithBufferData: jest.fn().mockResolvedValue(mockCopiedDocument) };
      (documentService as any).awsService = { copyObjectS3: jest.fn() };
      (documentService as any).environmentService = { getByKey: jest.fn() };

      const result = await documentService.copyDocumentFromFileBuffer(payload);

      expect(result).toEqual(mockCopiedDocument);
      expect((documentService as any).awsService.copyObjectS3).not.toHaveBeenCalled();
      expect((documentService as any).documentServiceMobile.createDocumentWithBufferData).toHaveBeenCalledWith({
        clientId: 'org123',
        doc: payload.file,
        thumbnail: null,
        uploader: { _id: 'user123' },
        docType: 'ORGANIZATION',
        folderId: undefined
      }, {
        documentName: 'Copied Doc',
        thumbnailKey: undefined,
        manipulationStep: 'step1'
      });
    });

    it('should throw error when file is not provided', async () => {
      const payload = {
        originalDocument: { _id: 'original123', name: 'Original Doc', thumbnail: 'thumb123', manipulationStep: 'step1' } as any,
        file: null,
        creatorId: 'user123',
        destinationType: 'PERSONAL' as any,
        destinationId: 'dest123',
        documentName: 'Copied Doc'
      };

      await expect(documentService.copyDocumentFromFileBuffer(payload)).rejects.toThrow('File is required when duplicate drive/dropbox document');
    });
  });

  describe('getOrgStatus', () => {
    it('should handle null organization safely (cover organization?.payment)', async () => {
      const params = {
        clientId: 'orgNull',
        clientType: TypeOfDocument.ORGANIZATION,
      };
    
      (documentService as any).organizationService = {
        getOrgById: jest.fn().mockResolvedValue(null),
      };
      (documentService as any).organizationDocStackService = {
        validateIncreaseDocStack: jest.fn().mockResolvedValue(true),
      };
    
      const result = await documentService.getOrgStatus(params);
    
      expect(result).toEqual({
        isPremium: false,
        isOverDocStack: false,
        orgId: undefined,
      });
    });       

    it('should return personal organization status when clientType is PERSONAL and org exists', async () => {
      const params = {
        clientId: 'org123',
        clientType: TypeOfDocument.PERSONAL,
        upcomingDocumentsTotal: 5
      };

      const mockOrg = { _id: 'org123', payment: { type: 'PREMIUM' } };
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(null) };
      (documentService as any).organizationService = { getOrgById: jest.fn().mockResolvedValue(mockOrg) };

      const result = await documentService.getOrgStatus(params);

      expect(result).toEqual({
        isPremium: true,
        isOverDocStack: false,
        orgId: 'org123'
      });
    });

    it('should return organization status when clientType is ORGANIZATION', async () => {
      const params = {
        clientId: 'org123',
        clientType: TypeOfDocument.ORGANIZATION,
        upcomingDocumentsTotal: 5
      };

      const mockOrg = { _id: 'org123', payment: { type: 'FREE' } };
      (documentService as any).organizationService = { getOrgById: jest.fn().mockResolvedValue(mockOrg) };
      (documentService as any).organizationDocStackService = { 
        validateIncreaseDocStack: jest.fn().mockResolvedValue(true) 
      };

      const result = await documentService.getOrgStatus(params);

      expect(result).toEqual({
        isPremium: false,
        isOverDocStack: false,
        orgId: 'org123'
      });
    });

    it('should return team status when clientType is ORGANIZATION_TEAM', async () => {
      const params = {
        clientId: 'team123',
        clientType: TypeOfDocument.ORGANIZATION_TEAM,
        upcomingDocumentsTotal: 5
      };

      const mockOrg = { _id: 'org123', payment: { type: 'PREMIUM' } };
      (documentService as any).organizationTeamService = { getOrgOfTeam: jest.fn().mockResolvedValue(mockOrg) };
      (documentService as any).organizationDocStackService = { 
        validateIncreaseDocStack: jest.fn().mockResolvedValue(false) 
      };

      const result = await documentService.getOrgStatus(params);

      expect(result).toEqual({
        isPremium: true,
        isOverDocStack: true,
        orgId: 'org123'
      });
    });
  });

  describe('duplicateDocument', () => {
    it('should duplicate non-S3 document successfully', async () => {
      const data = {
        file: { buffer: Buffer.from('test'), mimetype: 'application/pdf', filename: 'test.pdf', filesize: 1000 } as any,
        documentId: 'doc123',
        creatorId: 'user123',
        newDocumentData: {
          destinationId: 'dest123',
          destinationType: 'ORGANIZATION' as any,
          documentName: 'Duplicated Doc',
          notifyUpload: true
        },
        belongsTo: 'folder123',
        isRequestFromMobile: false
      };

      const mockSourceDocument = { 
        _id: 'doc123', 
        name: 'Source Doc', 
        service: 'GOOGLE_DRIVE' as any,
        size: 1000 
      };
      const mockCopiedDocument = { _id: 'copy123', name: 'Duplicated Doc' };
      const mockCreator = { _id: 'user123', name: 'Creator' };
      const mockOrgMembers = [{ userId: { toHexString: () => 'user456' } }, { userId: { toHexString: () => 'user789' } }];

      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue(mockSourceDocument as any);
      jest.spyOn(documentService, 'getOrgStatus').mockResolvedValue({ isPremium: true, isOverDocStack: false, orgId: 'org123' });
      jest.spyOn(documentService, 'copyDocumentFromFileBuffer').mockResolvedValue(mockCopiedDocument as any);
      jest.spyOn(documentService, 'createDocumentPermission').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'copyAnnotation').mockResolvedValue([]);
      jest.spyOn(documentService, 'copyDocumentImage').mockResolvedValue([]);
      jest.spyOn(documentService, 'copyFormFields').mockResolvedValue([]);
      jest.spyOn(documentService, 'sendCopyDocNotiToMembers').mockResolvedValue(undefined);
      jest.spyOn(documentService, 'publishUpdateDocument').mockImplementation();
      jest.spyOn(documentService, 'addToRecentDocumentList').mockResolvedValue(undefined);

      (documentService as any).rateLimiterService = { verifyUploadFilesSize: jest.fn().mockReturnValue(true) };
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(mockCreator) };
      (documentService as any).organizationService = { getMembersByOrgId: jest.fn().mockResolvedValue(mockOrgMembers) };
      (documentService as any).documentOutlineService = { copyOutlines: jest.fn().mockResolvedValue(undefined) };

      const result = await documentService.duplicateDocument(data);

      expect(result).toEqual(mockCopiedDocument);
      expect(documentService.copyDocumentFromFileBuffer).toHaveBeenCalled();
    });

    it('should throw error when document stack limit is reached', async () => {
      const data = {
        file: { buffer: Buffer.from('test'), mimetype: 'application/pdf', filename: 'test.pdf', filesize: 1000 } as any,
        documentId: 'doc123',
        creatorId: 'user123',
        newDocumentData: {
          destinationId: 'dest123',
          destinationType: 'ORGANIZATION' as any,
          documentName: 'Duplicated Doc',
          notifyUpload: true
        },
        belongsTo: 'folder123',
        isRequestFromMobile: false
      };

      const mockSourceDocument = { 
        _id: 'doc123', 
        name: 'Source Doc', 
        service: 'S3' as any,
        size: 1000 
      };

      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue(mockSourceDocument as any);
      jest.spyOn(documentService, 'getOrgStatus').mockResolvedValue({ isPremium: true, isOverDocStack: true });

      await expect(documentService.duplicateDocument(data)).rejects.toThrow('Reached document stack');
    });

    it('should throw error when file size exceeds limit for premium user', async () => {
      const data = {
        file: { buffer: Buffer.from('test'), mimetype: 'application/pdf', filename: 'test.pdf', filesize: 1000000000 } as any,
        documentId: 'doc123',
        creatorId: 'user123',
        newDocumentData: {
          destinationId: 'dest123',
          destinationType: 'PERSONAL' as any,
          documentName: 'Duplicated Doc',
          notifyUpload: true
        },
        belongsTo: 'folder123',
        isRequestFromMobile: false
      };

      const mockSourceDocument = { 
        _id: 'doc123', 
        name: 'Source Doc', 
        service: 'S3' as any,
        size: 1000000000 
      };

      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue(mockSourceDocument as any);
      jest.spyOn(documentService, 'getOrgStatus').mockResolvedValue({ isPremium: true, isOverDocStack: false });
      (documentService as any).rateLimiterService = { verifyUploadFilesSize: jest.fn().mockReturnValue(false) };

      await expect(documentService.duplicateDocument(data)).rejects.toThrow('The file you uploaded is too large. Please upload file below 200MB');
    });

    it('should throw error when file size exceeds limit for free user', async () => {
      const data = {
        file: { buffer: Buffer.from('test'), mimetype: 'application/pdf', filename: 'test.pdf', filesize: 1000000000 } as any,
        documentId: 'doc123',
        creatorId: 'user123',
        newDocumentData: {
          destinationId: 'dest123',
          destinationType: 'PERSONAL' as any,
          documentName: 'Duplicated Doc',
          notifyUpload: true
        },
        belongsTo: 'folder123',
        isRequestFromMobile: false
      };

      const mockSourceDocument = { 
        _id: 'doc123', 
        name: 'Source Doc', 
        service: 'S3' as any,
        size: 1000000000 
      };

      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue(mockSourceDocument as any);
      jest.spyOn(documentService, 'getOrgStatus').mockResolvedValue({ isPremium: false, isOverDocStack: false });
      (documentService as any).rateLimiterService = { verifyUploadFilesSize: jest.fn().mockReturnValue(false) };

      await expect(documentService.duplicateDocument(data)).rejects.toThrow('The file you uploaded is too large. Please upload file below 20MB');
    });
    
    it('should duplicate document with PERSONAL type', async () => {
      const data = {
        file: { buffer: Buffer.from('test'), mimetype: 'application/pdf', filename: 'test.pdf', filesize: 500 } as any,
        documentId: 'doc123',
        creatorId: 'user123',
        newDocumentData: {
          destinationId: 'user123',
          destinationType: 'PERSONAL' as any,
          documentName: 'Duplicated Personal Doc',
          notifyUpload: true
        },
        belongsTo: 'folder123',
        isRequestFromMobile: false
      };
    
      const mockSourceDocument = { _id: 'doc123', name: 'Source Doc', service: 'GOOGLE_DRIVE' as any, size: 500 };
      const mockCopiedDocument = { _id: 'copy123', name: 'Duplicated Personal Doc' };
      const mockCreator = { _id: 'user123', name: 'Creator' };
    
      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue(mockSourceDocument as any);
      jest.spyOn(documentService, 'getOrgStatus').mockResolvedValue({ isPremium: true, isOverDocStack: false });
      jest.spyOn(documentService, 'copyDocumentFromFileBuffer').mockResolvedValue(mockCopiedDocument as any);
      jest.spyOn(documentService, 'createDocumentPermission').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'copyAnnotation').mockResolvedValue([]);
      jest.spyOn(documentService, 'copyDocumentImage').mockResolvedValue([]);
      jest.spyOn(documentService, 'copyFormFields').mockResolvedValue([]);
      jest.spyOn(documentService, 'sendCopyDocNotiToMembers').mockResolvedValue(undefined);
      jest.spyOn(documentService, 'publishUpdateDocument').mockImplementation();
      jest.spyOn(documentService, 'addToRecentDocumentList').mockResolvedValue(undefined);
      (documentService as any).rateLimiterService = { verifyUploadFilesSize: jest.fn().mockReturnValue(true) };
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(mockCreator) };
      (documentService as any).documentOutlineService = { copyOutlines: jest.fn().mockResolvedValue(undefined) };
    
      const result = await documentService.duplicateDocument(data);
    
      expect(result).toEqual(mockCopiedDocument);
      expect(documentService.copyDocumentFromFileBuffer).toHaveBeenCalled();
    });
    
    it('should handle default case gracefully', async () => {
      const data = {
        file: { buffer: Buffer.from('test'), mimetype: 'application/pdf', filename: 'test.pdf', filesize: 500 } as any,
        documentId: 'doc123',
        creatorId: 'user123',
        newDocumentData: {
          destinationId: 'weird123',
          destinationType: 'UNKNOWN' as any,
          documentName: 'Duplicated Unknown Doc',
          notifyUpload: false
        },
        belongsTo: 'folder123',
        isRequestFromMobile: false
      };
    
      const mockSourceDocument = { _id: 'doc123', name: 'Source Doc', service: 'GOOGLE_DRIVE' as any, size: 500 };
      const mockCopiedDocument = { _id: 'copy123', name: 'Duplicated Unknown Doc' };
      const mockCreator = { _id: 'user123', name: 'Creator' };
    
      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue(mockSourceDocument as any);
      jest.spyOn(documentService, 'getOrgStatus').mockResolvedValue({ isPremium: false, isOverDocStack: false });
      jest.spyOn(documentService, 'copyDocumentFromFileBuffer').mockResolvedValue(mockCopiedDocument as any);
      jest.spyOn(documentService, 'createDocumentPermission').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'copyAnnotation').mockResolvedValue([]);
      jest.spyOn(documentService, 'copyDocumentImage').mockResolvedValue([]);
      jest.spyOn(documentService, 'copyFormFields').mockResolvedValue([]);
      jest.spyOn(documentService, 'sendCopyDocNotiToMembers').mockResolvedValue(undefined);
      jest.spyOn(documentService, 'publishUpdateDocument').mockImplementation();
      jest.spyOn(documentService, 'addToRecentDocumentList').mockResolvedValue(undefined);
      (documentService as any).rateLimiterService = { verifyUploadFilesSize: jest.fn().mockReturnValue(true) };
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(mockCreator) };
      (documentService as any).documentOutlineService = { copyOutlines: jest.fn().mockResolvedValue(undefined) };
    
      const result = await documentService.duplicateDocument(data);
    
      expect(result).toEqual(mockCopiedDocument);
      expect(documentService.copyDocumentFromFileBuffer).toHaveBeenCalled();
    });

    it('should duplicate document with ORGANIZATION_TEAM type', async () => {
      const data = {
        file: { buffer: Buffer.from('test'), mimetype: 'application/pdf', filename: 'team.pdf', filesize: 500 } as any,
        documentId: 'doc123',
        creatorId: 'user123',
        newDocumentData: {
          destinationId: 'team123',
          destinationType: 'ORGANIZATION_TEAM' as any,
          documentName: 'Duplicated Team Doc',
          notifyUpload: true
        },
        belongsTo: 'folder123',
        isRequestFromMobile: false
      };
    
      const mockSourceDocument = { _id: 'doc123', name: 'Source Doc', service: 'GOOGLE_DRIVE' as any, size: 500 };
      const mockCopiedDocument = { _id: 'copy123', name: 'Duplicated Team Doc' };
      const mockCreator = { _id: 'user123', name: 'Creator' };
      const mockTeamMembers = [{ userId: 'user456' }, { userId: 'user789' }];
    
      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue(mockSourceDocument as any);
      jest.spyOn(documentService, 'getOrgStatus').mockResolvedValue({ isPremium: true, isOverDocStack: false });
      jest.spyOn(documentService, 'copyDocumentFromFileBuffer').mockResolvedValue(mockCopiedDocument as any);
      jest.spyOn(documentService, 'createDocumentPermission').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'copyAnnotation').mockResolvedValue([]);
      jest.spyOn(documentService, 'copyDocumentImage').mockResolvedValue([]);
      jest.spyOn(documentService, 'copyFormFields').mockResolvedValue([]);
      jest.spyOn(documentService, 'sendCopyDocNotiToMembers').mockResolvedValue(undefined);
      jest.spyOn(documentService, 'publishUpdateDocument').mockImplementation();
      jest.spyOn(documentService, 'addToRecentDocumentList').mockResolvedValue(undefined);
      (documentService as any).rateLimiterService = { verifyUploadFilesSize: jest.fn().mockReturnValue(true) };
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(mockCreator) };
      (documentService as any).membershipService = { find: jest.fn().mockResolvedValue(mockTeamMembers) };
      (documentService as any).documentOutlineService = { copyOutlines: jest.fn().mockResolvedValue(undefined) };
    
      const result = await documentService.duplicateDocument(data);
    
      expect(result).toEqual(mockCopiedDocument);
      expect(documentService.copyDocumentFromFileBuffer).toHaveBeenCalled();
    });
    
    it('should use sourceDocument.size when file filesize is undefined', async () => {
      const data = {
        file: null,
        documentId: 'doc123',
        creatorId: 'user123',
        newDocumentData: {
          destinationId: 'user123',
          destinationType: 'PERSONAL' as any,
          documentName: 'No File Doc',
          notifyUpload: true
        },
        belongsTo: 'folder123',
        isRequestFromMobile: false
      };
    
      const mockSourceDocument = { _id: 'doc123', name: 'Source Doc', service: 'GOOGLE_DRIVE' as any, size: 300 };
      const mockCopiedDocument = { _id: 'copy123', name: 'No File Doc' };
      const mockCreator = { _id: 'user123', name: 'Creator' };
    
      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue(mockSourceDocument as any);
      jest.spyOn(documentService, 'getOrgStatus').mockResolvedValue({ isPremium: true, isOverDocStack: false });
      jest.spyOn(documentService, 'copyDocumentFromFileBuffer').mockResolvedValue(mockCopiedDocument as any);
      jest.spyOn(documentService, 'createDocumentPermission').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'copyAnnotation').mockResolvedValue([]);
      jest.spyOn(documentService, 'copyDocumentImage').mockResolvedValue([]);
      jest.spyOn(documentService, 'copyFormFields').mockResolvedValue([]);
      jest.spyOn(documentService, 'sendCopyDocNotiToMembers').mockResolvedValue(undefined);
      jest.spyOn(documentService, 'publishUpdateDocument').mockImplementation();
      jest.spyOn(documentService, 'addToRecentDocumentList').mockResolvedValue(undefined);
      (documentService as any).rateLimiterService = { verifyUploadFilesSize: jest.fn().mockReturnValue(true) };
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(mockCreator) };
      (documentService as any).documentOutlineService = { copyOutlines: jest.fn().mockResolvedValue(undefined) };
    
      const result = await documentService.duplicateDocument(data);
    
      expect(result).toEqual(mockCopiedDocument);
      expect(documentService.copyDocumentFromFileBuffer).toHaveBeenCalled();
    });
    
    it('should duplicate document from S3 using createLuminDocumentCopy', async () => {
      const data = {
        file: { buffer: Buffer.from('s3file'), mimetype: 'application/pdf', filename: 's3file.pdf', filesize: 500 } as any,
        documentId: 'docS3',
        creatorId: 'user123',
        newDocumentData: {
          destinationId: 'user123',
          destinationType: 'PERSONAL' as any,
          documentName: 'Duplicated S3 Doc',
          notifyUpload: true
        },
        belongsTo: 'folder123',
        isRequestFromMobile: false
      };
    
      const mockSourceDocument = { _id: 'docS3', name: 'S3 Doc', service: DocumentStorageEnum.S3, size: 500 };
      const mockCopiedDocument = { _id: 'copyS3', name: 'Duplicated S3 Doc' };
      const mockCreator = { _id: 'user123', name: 'Creator' };
    
      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue(mockSourceDocument as any);
      jest.spyOn(documentService, 'getOrgStatus').mockResolvedValue({ isPremium: true, isOverDocStack: false });
      jest.spyOn(documentService, 'createLuminDocumentCopy').mockResolvedValue(mockCopiedDocument as any);
      jest.spyOn(documentService, 'createDocumentPermission').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'copyAnnotation').mockResolvedValue([]);
      jest.spyOn(documentService, 'copyDocumentImage').mockResolvedValue([]);
      jest.spyOn(documentService, 'copyFormFields').mockResolvedValue([]);
      jest.spyOn(documentService, 'sendCopyDocNotiToMembers').mockResolvedValue(undefined);
      jest.spyOn(documentService, 'publishUpdateDocument').mockImplementation();
      jest.spyOn(documentService, 'addToRecentDocumentList').mockResolvedValue(undefined);
      (documentService as any).rateLimiterService = { verifyUploadFilesSize: jest.fn().mockReturnValue(true) };
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(mockCreator) };
      (documentService as any).documentOutlineService = { copyOutlines: jest.fn().mockResolvedValue(undefined) };
    
      const result = await documentService.duplicateDocument(data);
    
      expect(result).toEqual(mockCopiedDocument);
      expect(documentService.createLuminDocumentCopy).toHaveBeenCalledWith(expect.objectContaining({
        sourceDocument: mockSourceDocument,
        documentName: 'Duplicated S3 Doc',
        destinationId: 'user123',
        destinationType: 'PERSONAL',
        creatorId: 'user123',
        folderId: 'folder123',
      }));
    });    
  });

  describe('verifyUserPermissionWithClientId', () => {
    beforeEach(() => {
      (documentService as any).userService = { findUserById: jest.fn() };
      (documentService as any).teamService = { findOneById: jest.fn() };
      (documentService as any).membershipService = { findOne: jest.fn() };
      (documentService as any).organizationService = { getOrgById: jest.fn() };
      (documentService as any).organizationDocStackService = { getDocStackByOrgId: jest.fn() };
    });

    it('should return accepted when clientId equals currentUserId', async () => {
      const currentUserId = 'user123';
      const clientId = 'user123';

      const result = await documentService.verifyUserPermissionWithClientId(currentUserId, clientId);

      expect(result).toEqual({ isAccepted: true });
    });

    it('should return forbidden when clientId is different and user exists', async () => {
      const currentUserId = 'user123';
      const clientId = 'user456';

      const mockUser = { _id: 'user456', name: 'Other User' };
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(mockUser) };

      const result = await documentService.verifyUserPermissionWithClientId(currentUserId, clientId);

      expect(result.isAccepted).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return forbidden when team does not exist', async () => {
      const currentUserId = 'user123';
      const clientId = 'team456';

      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(null) };
      (documentService as any).teamService = { findOneById: jest.fn().mockResolvedValue(null) };
      (documentService as any).membershipService = { findOne: jest.fn().mockResolvedValue(null) };
      (documentService as any).organizationDocStackService = { getDocStackByOrgId: jest.fn().mockResolvedValue([]) };
      (documentService as any).organizationService = { getOrgById: jest.fn().mockResolvedValue(null) };

      const result = await documentService.verifyUserPermissionWithClientId(currentUserId, clientId);

      expect(result.isAccepted).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return forbidden when user is not team member', async () => {
      const currentUserId = 'user123';
      const clientId = 'team456';

      const mockTeam = { _id: 'team456', name: 'Test Team' };
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(null) };
      (documentService as any).teamService = { findOneById: jest.fn().mockResolvedValue(mockTeam) };
      (documentService as any).membershipService = { findOne: jest.fn().mockResolvedValue(null) };

      const result = await documentService.verifyUserPermissionWithClientId(currentUserId, clientId);

      expect(result.isAccepted).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return accepted when user is team member', async () => {
      const currentUserId = 'user123';
      const clientId = 'team456';

      const mockTeam = { _id: 'team456', name: 'Test Team' };
      const mockMembership = { _id: 'mem123', userId: 'user123', teamId: 'team456' };
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(null) };
      (documentService as any).teamService = { findOneById: jest.fn().mockResolvedValue(mockTeam) };
      (documentService as any).membershipService = { findOne: jest.fn().mockResolvedValue(mockMembership) };

      const result = await documentService.verifyUserPermissionWithClientId(currentUserId, clientId);

      expect(result).toEqual({ isAccepted: true });
    });
  });

  describe('countDocumentsByFolderId', () => {
    it('should count documents by folder ID', async () => {
      const folderId = 'folder123';
      const expectedCount = 5;

      (documentService as any).documentModel = { countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedCount) }) };

      const result = await documentService.countDocumentsByFolderId(folderId);

      expect(result).toBe(expectedCount);
      expect((documentService as any).documentModel.countDocuments).toHaveBeenCalledWith({ folderId });
    });
  });

  describe('createPDfDocumentFromDocumentForm', () => {
    it('should create PDF document from document form with thumbnail', async () => {
      const document = {
        remoteId: 'form123',
        thumbnail: 'thumb123.pdf'
      };

      const mockCopyFormRemoteId = 'newForm123';
      const mockCopyThumbnailRemoteId = 'newThumb123';

      (documentService as any).environmentService = { 
        getByKey: jest.fn()
          .mockReturnValueOnce('doc-bucket')
          .mockReturnValueOnce('form-bucket')
          .mockReturnValueOnce('thumb-bucket')
      };
      (documentService as any).awsService = { 
        copyObjectS3: jest.fn()
          .mockResolvedValueOnce(mockCopyFormRemoteId)
          .mockResolvedValueOnce(mockCopyThumbnailRemoteId),
        s3InstanceForDocument: jest.fn().mockReturnValue({})
      };

      const result = await documentService.createPDfDocumentFromDocumentForm(document);

      expect(result).toEqual({
        copyFormRemoteId: mockCopyFormRemoteId,
        copyThumbnailRemoteId: mockCopyThumbnailRemoteId
      });
    });

    it('should create PDF document from document form without thumbnail', async () => {
      const document = {
        remoteId: 'form123',
        thumbnail: null
      };

      const mockCopyFormRemoteId = 'newForm123';

      (documentService as any).environmentService = { 
        getByKey: jest.fn()
          .mockReturnValueOnce('doc-bucket')
          .mockReturnValueOnce('form-bucket')
          .mockReturnValueOnce('thumb-bucket')
      };
      (documentService as any).awsService = { 
        copyObjectS3: jest.fn().mockResolvedValue(mockCopyFormRemoteId),
        s3InstanceForDocument: jest.fn().mockReturnValue({})
      };

      const result = await documentService.createPDfDocumentFromDocumentForm(document);

      expect(result).toEqual({
        copyFormRemoteId: mockCopyFormRemoteId,
        copyThumbnailRemoteId: ''
      });
    });
  });

  describe('handleUpdateDocViewerInteraction', () => {
    const userId = 'user123';
  
    beforeEach(() => {
      (documentService as any).redisService = {
        getDocViewerInteraction: jest.fn(),
        setDocViewerInteractionValue: jest.fn(),
        removeDocViewerInteraction: jest.fn(),
      };
      (documentService as any).userService = {
        updateUserPropertyById: jest.fn(),
        publishUpdateUser: jest.fn(),
      };
    });

    it('should handle total created annotation interaction and show rating modal', async () => {
      const userId = 'user123';
      const type = 'TOTAL_CREATED_ANNOTATION' as any;

      const mockPrevInteraction = { TOTAL_CREATED_ANNOT_FIELD: 9 };
      const mockUpdatedUser = { _id: 'user123', name: 'User' };

      (documentService as any).redisService = {
        getDocViewerInteraction: jest.fn().mockResolvedValue(mockPrevInteraction),
        setDocViewerInteractionValue: jest.fn(),
        removeDocViewerInteraction: jest.fn()
      };
      (documentService as any).userService = {
        updateUserPropertyById: jest.fn().mockResolvedValue(mockUpdatedUser),
        publishUpdateUser: jest.fn()
      };

      await documentService.handleUpdateDocViewerInteraction(userId, type);

      expect((documentService as any).userService.updateUserPropertyById).toHaveBeenCalledWith(userId, {
        'metadata.rating.googleModalStatus': 'OPEN'
      });
      expect((documentService as any).redisService.removeDocViewerInteraction).toHaveBeenCalledWith(userId);
    });
  
    it('should handle TOTAL_CREATED_ANNOTATION and only increment when below condition', async () => {
      const type = DocViewerInteractionType.TOTAL_CREATED_ANNOTATION;
      const mockPrevInteraction = { TOTAL_CREATED_ANNOT_FIELD: 5 }; 
      (documentService as any).redisService.getDocViewerInteraction.mockResolvedValue(mockPrevInteraction);
  
      await documentService.handleUpdateDocViewerInteraction(userId, type);
  
      expect((documentService as any).redisService.setDocViewerInteractionValue).toHaveBeenCalledWith({
        type,
        userId,
        value: 1,
      });
      expect((documentService as any).userService.updateUserPropertyById).not.toHaveBeenCalled();
    });
  
    it('should handle TOTAL_OPENED_DOC and only increment when below condition', async () => {
      const type = DocViewerInteractionType.TOTAL_OPENED_DOC;
      const mockPrevInteraction = { TOTAL_OPENED_DOC_FIELD: 2 };
      (documentService as any).redisService.getDocViewerInteraction.mockResolvedValue(mockPrevInteraction);
  
      await documentService.handleUpdateDocViewerInteraction(userId, type);
  
      expect((documentService as any).redisService.setDocViewerInteractionValue).toHaveBeenCalledWith({
        type,
        userId,
        value: 1,
      });
      expect((documentService as any).userService.updateUserPropertyById).not.toHaveBeenCalled();
    });
  });
  
  describe('isMovingSameLocation', () => {
    it('should return false when moving to personal workspace with different destination', () => {
      const params = {
        documentPermission: {
          workspace: { refId: new Types.ObjectId('507f1f77bcf86cd799439011') },
          refId: new Types.ObjectId('507f1f77bcf86cd799439011')
        } as any,
        destinationId: '507f1f77bcf86cd799439012',
        destinationType: 'PERSONAL' as any,
        actorId: 'user123'
      };

      const result = documentService.isMovingSameLocation(params);

      expect(result).toBe(false);
    });

    it('should return true when moving to personal workspace without workspace but actorId and refId match destinationId', () => {
      const objectId = new Types.ObjectId('507f1f77bcf86cd799439016');
      
      const params = {
        documentPermission: {
          refId: objectId
        } as any,
        destinationId: objectId.toHexString(),
        destinationType: DestinationType.PERSONAL,
        actorId: objectId.toHexString()
      };
    
      const result = documentService.isMovingSameLocation(params);
    
      expect(result).toBe(true);
    });
    
  });

  describe('isMovingSameResource', () => {
    it('should return not same resource when moving to different organization', async () => {
      const params = {
        documentPermission: {
          role: 'ORGANIZATION' as any,
          refId: new Types.ObjectId('507f1f77bcf86cd799439013')
        } as any,
        destinationId: '507f1f77bcf86cd799439016',
        destinationType: 'ORGANIZATION' as any,
        actorId: 'user123'
      };

      const mockOrgTeams = [{ _id: '507f1f77bcf86cd799439014' }];
      (documentService as any).organizationTeamService = { getOrgTeams: jest.fn().mockResolvedValue(mockOrgTeams) };

      const result = await documentService.isMovingSameResource(params);

      expect(result).toEqual({
        isSameResource: false
      });
    });

    it('should return same resource when moving within same organization team', async () => {
      const teamId = new Types.ObjectId();
      const orgId = new Types.ObjectId();
      const params = {
        documentPermission: {
          role: DocumentRoleEnum.ORGANIZATION_TEAM,
          refId: orgId,
        } as any,
        destinationId: orgId.toHexString(),
        destinationType: DestinationType.ORGANIZATION_TEAM,
        actorId: 'user123',
      };
  
      const mockTeam = { _id: orgId, belongsTo: teamId };
      const mockOrgTeams = [{ _id: orgId }];
      (documentService as any).teamService = {
        findOne: jest.fn().mockResolvedValue(mockTeam),
      };
      (documentService as any).organizationTeamService = {
        getOrgTeams: jest.fn().mockResolvedValue(mockOrgTeams),
      };
  
      const result = await documentService.isMovingSameResource(params);
  
      expect(result).toEqual({
        isSameResource: true,
        orgId,
      });
    });

    it('should return same resource when moving OWNER document to org', async () => {
      const orgId = new Types.ObjectId();
      const params = {
        documentPermission: {
          role: DocumentRoleEnum.OWNER,
          refId: new Types.ObjectId(),
          workspace: { refId: orgId },
        } as any,
        destinationId: orgId.toHexString(),
        destinationType: DestinationType.ORGANIZATION,
        actorId: 'user123',
      };

      const mockOrgTeams = [{ _id: new Types.ObjectId() }];
      (documentService as any).organizationTeamService = {
        getOrgTeams: jest.fn().mockResolvedValue(mockOrgTeams),
      };

      const result = await documentService.isMovingSameResource(params);

      expect(result).toEqual({
        isSameResource: true,
        orgId,
      });
    });

    it('should return orgId from workspace.refId when isMovingSameLocation returns true and role is OWNER', async () => {
      const orgId = new Types.ObjectId();
      jest.spyOn(documentService, 'isMovingSameLocation').mockReturnValue(true);
  
      const params = {
        documentPermission: {
          role: DocumentRoleEnum.OWNER,
          refId: new Types.ObjectId(),
          workspace: { refId: orgId },
        } as any,
        destinationId: new Types.ObjectId().toHexString(),
        destinationType: DestinationType.ORGANIZATION,
        actorId: 'user123',
      };
  
      const res = await documentService.isMovingSameResource(params);
  
      expect(res).toEqual({
        isSameResource: true,
        orgId,
      });
    });
    
    it('ORGANIZATION: should return true when destination is PERSONAL and refId matches destinationId (isMovingToMyDocumentInOrg)', async () => {
      const orgRef = new Types.ObjectId();
      const destinationId = orgRef.toHexString();

      (documentService as any).organizationTeamService = {
        getOrgTeams: jest.fn().mockResolvedValue([]),
      };

      const params = {
        documentPermission: {
          role: DocumentRoleEnum.ORGANIZATION,
          refId: orgRef,
        } as any,
        destinationId,
        destinationType: DestinationType.PERSONAL,
        actorId: 'someUser',
      };
      const res = await documentService.isMovingSameResource(params);

      expect(res).toEqual({
        isSameResource: true,
        orgId: orgRef,
      });
    });

    it('ORGANIZATION: should return true when moving to a team inside the organization (isMovingToTeamInOrg)', async () => {
      const orgRef = new Types.ObjectId();
      const destinationTeamId = 'team-dest-hex';

      (documentService as any).organizationTeamService = {
        getOrgTeams: jest.fn().mockResolvedValue([{ _id: destinationTeamId }]),
      };

      const params = {
        documentPermission: {
          role: DocumentRoleEnum.ORGANIZATION,
          refId: orgRef,
        } as any,
        destinationId: destinationTeamId,
        destinationType: DestinationType.ORGANIZATION_TEAM,
        actorId: 'user123',
      };
      const res = await documentService.isMovingSameResource(params);

      expect(res).toEqual({
        isSameResource: true,
        orgId: orgRef,
      });
    });

    it('ORGANIZATION_TEAM: should return true when moving to another team inside same org (isMovingToTeamInOrg)', async () => {
      const teamId = new Types.ObjectId();
      const orgId = new Types.ObjectId();
      const destinationTeamId = 'dest-team-hex';
  
      (documentService as any).teamService = {
        findOne: jest.fn().mockResolvedValue({ _id: teamId, belongsTo: orgId }),
      };
      (documentService as any).organizationTeamService = {
        getOrgTeams: jest.fn().mockResolvedValue([{ _id: destinationTeamId }]),
      };
  
      const params = {
        documentPermission: {
          role: DocumentRoleEnum.ORGANIZATION_TEAM,
          refId: teamId,
        } as any,
        destinationId: destinationTeamId,
        destinationType: DestinationType.ORGANIZATION_TEAM,
        actorId: 'user123',
      };
      const res = await documentService.isMovingSameResource(params);
  
      expect(res).toEqual({
        isSameResource: true,
        orgId,
      });
    });

    it('should handle OWNER role with missing workspace (cover workspace?.refId undefined)', async () => {
      const refId = new Types.ObjectId();
      jest.spyOn(documentService, 'isMovingSameLocation').mockReturnValue(true);
    
      const params = {
        documentPermission: {
          role: DocumentRoleEnum.OWNER,
          refId,
        } as any,
        destinationId: new Types.ObjectId().toHexString(),
        destinationType: DestinationType.ORGANIZATION,
        actorId: 'actor-xyz',
      };
    
      const result = await documentService.isMovingSameResource(params);
    
      expect(result).toEqual({
        isSameResource: true,
        orgId: undefined,
      });
    }); 

    it('ORGANIZATION_TEAM: should return true when moving to org itself (cover team.belongsTo.toHexString() === destinationId)', async () => {
      const orgId = new Types.ObjectId();
      const teamId = new Types.ObjectId();
    
      (documentService as any).teamService = {
        findOne: jest.fn().mockResolvedValue({ _id: teamId, belongsTo: orgId }),
      };
      (documentService as any).organizationTeamService = {
        getOrgTeams: jest.fn().mockResolvedValue([]),
      };
    
      const params = {
        documentPermission: {
          role: DocumentRoleEnum.ORGANIZATION_TEAM,
          refId: teamId,
        } as any,
        destinationId: orgId.toHexString(),
        destinationType: DestinationType.ORGANIZATION,
        actorId: 'user123',
      };
      const res = await documentService.isMovingSameResource(params);
    
      expect(res).toEqual({
        isSameResource: true,
        orgId,
      });
    });

    it('ORGANIZATION_TEAM: should return true when moving to PERSONAL under org (cover team.belongsTo.toHexString() === destinationId for PERSONAL)', async () => {
      const orgId = new Types.ObjectId();
      const teamId = new Types.ObjectId();
    
      (documentService as any).teamService = {
        findOne: jest.fn().mockResolvedValue({ _id: teamId, belongsTo: orgId }),
      };
      (documentService as any).organizationTeamService = {
        getOrgTeams: jest.fn().mockResolvedValue([]),
      };
    
      const params = {
        documentPermission: {
          role: DocumentRoleEnum.ORGANIZATION_TEAM,
          refId: teamId,
        } as any,
        destinationId: orgId.toHexString(),
        destinationType: DestinationType.PERSONAL,
        actorId: 'user123',
      };
      const res = await documentService.isMovingSameResource(params);
    
      expect(res).toEqual({
        isSameResource: true,
        orgId,
      });
    });

    it('OWNER: should handle workspace undefined (cover workspace?.refId)', async () => {
      const refId = new Types.ObjectId();
      const destinationId = new Types.ObjectId().toHexString();
      jest.spyOn(documentService, 'isMovingSameLocation').mockReturnValue(false);
    
      (documentService as any).teamService = { findOne: jest.fn().mockResolvedValue(null) };
    
      const params = {
        documentPermission: { role: DocumentRoleEnum.OWNER, refId } as any,
        destinationId,
        destinationType: DestinationType.ORGANIZATION,
        actorId: 'actor-xyz',
      };
      const result = await documentService.isMovingSameResource(params);
    
      expect(result).toEqual({
        isSameResource: false,
        orgId: destinationId,
      });
    });
    
    it('OWNER: should return true when moving to a team in the org (cover isMovingToTeamInOrg)', async () => {
      const orgId = new Types.ObjectId();
      const destinationTeamId = 'team-dest-hex';
      const params = {
        documentPermission: {
          role: DocumentRoleEnum.OWNER,
          refId: new Types.ObjectId(),
          workspace: { refId: orgId },
        } as any,
        destinationId: destinationTeamId,
        destinationType: DestinationType.ORGANIZATION_TEAM,
        actorId: 'user123',
      };
    
      (documentService as any).organizationTeamService = {
        getOrgTeams: jest.fn().mockResolvedValue([{ _id: destinationTeamId }]),
      };
    
      const res = await documentService.isMovingSameResource(params);
    
      expect(res).toEqual({
        isSameResource: true,
        orgId,
      });
    });

    it('should return orgId from team.belongsTo when workspace undefined', async () => {
      const orgId = new Types.ObjectId();
      const destinationId = new Types.ObjectId().toHexString();
    
      (documentService as any).teamService = {
        findOne: jest.fn().mockResolvedValue({ _id: destinationId, belongsTo: orgId }),
      };
    
      const params = {
        documentPermission: {
          role: DocumentRoleEnum.OWNER,
          refId: new Types.ObjectId(),
        } as any,
        destinationId,
        destinationType: DestinationType.ORGANIZATION,
        actorId: 'actor-xyz',
      };
    
      const result = await documentService.isMovingSameResource(params);
    
      expect(result).toEqual({
        isSameResource: false,
        orgId,
      });
    });    
  });

  describe('verifyMoveDocuments', () => {
    const actorId = 'user123';
    const documentId = 'doc123';
    
    beforeEach(() => {
      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue({ _id: documentId, folderId: null } as any);
    });

    it('should return error when moving to same location', async () => {
      const params = {
        actorId: 'user123',
        documents: [{ _id: 'doc123', service: 'S3' as any, size: 1000 }] as any,
        documentPermission: {
          role: 'OWNER' as any,
          refId: 'user123'
        } as any,
        destinationId: 'user123',
        destinationType: 'PERSONAL' as any,
        personalWorkspaceAvailable: true,
        isRequestFromMobile: false
      };

      const mockDocument = { _id: 'doc123', folderId: null };
      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue(mockDocument as any);
      jest.spyOn(documentService, 'isMovingSameLocation').mockReturnValue(true);
      (documentService as any).userService = { 
        findUserById: jest.fn().mockResolvedValue({ _id: 'user123' }),
        isAvailableUsePremiumFeature: jest.fn().mockResolvedValue(true)
      };
      (documentService as any).organizationService = { getOrgById: jest.fn().mockResolvedValue({ _id: 'org123' }) };
      (documentService as any).organizationDocStackService = { 
        validateIncreaseDocStack: jest.fn().mockResolvedValue(true),
        getDocStackByOrgId: jest.fn().mockResolvedValue([])
      };

      const result = await documentService.verifyMoveDocuments(params);

      expect(result.isAllowed).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should call filterDocumentsForOrgMove when moving to ORGANIZATION', async () => {
      const params = {
        actorId,
        documents: [{ _id: documentId, service: 'S3', size: 1000 }] as any,
        documentPermission: { role: 'OWNER', refId: 'user123' } as any,
        destinationId: 'org123',
        destinationType: DestinationType.ORGANIZATION,
        personalWorkspaceAvailable: true,
        isRequestFromMobile: false,
      };
  
      const filterOrgSpy = jest.spyOn(documentService, 'filterDocumentsForOrgMove').mockResolvedValue(params.documents);
      const verifySizeSpy = jest.spyOn(documentService, 'verifyMoveDocumentsSize').mockResolvedValue({ isAllowed: true });
  
      await documentService.verifyMoveDocuments(params);
  
      expect(filterOrgSpy).toHaveBeenCalledWith({ documents: params.documents, destinationId: 'org123', destinationType: DestinationType.ORGANIZATION });
      expect(verifySizeSpy).toHaveBeenCalled();
    });
  
    it('should return verifySizeData when move size not allowed', async () => {
      const params = {
        actorId,
        documents: [{ _id: documentId, service: 'S3', size: 1000 }] as any,
        documentPermission: { role: 'OWNER', refId: 'user123' } as any,
        destinationId: 'org123',
        destinationType: DestinationType.ORGANIZATION,
        personalWorkspaceAvailable: true,
        isRequestFromMobile: false,
      };
  
      jest.spyOn(documentService, 'filterDocumentsForOrgMove').mockResolvedValue(params.documents);
      const verifySizeData = { isAllowed: false, error: new Error('size exceeded') };
      jest.spyOn(documentService, 'verifyMoveDocumentsSize').mockResolvedValue(verifySizeData as any);
  
      const res = await documentService.verifyMoveDocuments(params);
      expect(res).toEqual(verifySizeData);
    });
  
    it('should return error if file present and length !== 1 or isLuminFile or isPersonalDestination', async () => {
      const params = {
        actorId,
        documents: [{ _id: documentId, service: 'S3', size: 1000 }, { _id: 'doc2', service: 'S3', size: 500 }] as any,
        documentPermission: { role: 'OWNER', refId: 'user123' } as any,
        destinationId: 'user123',
        destinationType: DestinationType.ORGANIZATION,
        personalWorkspaceAvailable: true,
        file: {} as any,
        isRequestFromMobile: false,
      };
  
      const res = await documentService.verifyMoveDocuments(params);
      expect(res.isAllowed).toBe(false);
      expect(res.error).toBeDefined();
    });
  
    it('should return error if file is not S3 and not moving to PERSONAL', async () => {
      const params = {
        actorId,
        documents: [{ _id: documentId, service: 'GOOGLE_DRIVE', size: 1000 }] as any,
        documentPermission: { role: 'OWNER', refId: 'user123' } as any,
        destinationId: 'org123',
        destinationType: DestinationType.ORGANIZATION,
        personalWorkspaceAvailable: true,
        isRequestFromMobile: false,
      };
  
      const res = await documentService.verifyMoveDocuments(params);
      expect(res.isAllowed).toBe(false);
      expect(res.error).toBeDefined();
    });

    it('should return error if documents.length !== 1 (cover isLuminFile branch)', async () => {
      const params = {
        actorId,
        documents: [
          { _id: documentId, service: DocumentStorageEnum.S3, size: 1000 },
          { _id: new Types.ObjectId(), service: DocumentStorageEnum.S3, size: 500 },
        ] as any,
        documentPermission: { role: 'OWNER', refId: 'user123' } as any,
        destinationId: 'dest1',
        destinationType: DestinationType.ORGANIZATION,
        file: { name: 'test' } as any,
        personalWorkspaceAvailable: true,
        isRequestFromMobile: false,
      };
  
      const res = await documentService.verifyMoveDocuments(params);
  
      expect(res.isAllowed).toBe(false);
      expect(res.error).toBeDefined();
    });
  
    it('should return error if destination PERSONAL and isLuminFile (cover isPersonalDestination && isLuminFile)', async () => {
      const params = {
        actorId,
        documents: [{ _id: documentId, service: DocumentStorageEnum.S3, size: 1000 }] as any,
        documentPermission: { role: 'OWNER', refId: 'user123' } as any,
        destinationId: actorId,
        destinationType: DestinationType.PERSONAL,
        file: { name: 'test' } as any,
        personalWorkspaceAvailable: true,
        isRequestFromMobile: false,
      };
  
      const res = await documentService.verifyMoveDocuments(params);
  
      expect(res.isAllowed).toBe(false);
      expect(res.error).toBeDefined();
    });

    it('should return error if file exists and destination is personal', async () => {
      const params = {
        actorId,
        documents: [{ _id: documentId, service: DocumentStorageEnum.S3, size: 1000 }] as any,
        documentPermission: { role: 'OWNER', refId: 'user123' } as any,
        destinationId: actorId,
        destinationType: DestinationType.PERSONAL,
        file: { name: 'file.txt' } as any,
        personalWorkspaceAvailable: true,
      };
    
      const res = await documentService.verifyMoveDocuments(params);
    
      expect(res.isAllowed).toBe(false);
      expect((res.error as any).message).toContain('Can not move this file');
      expect(res.error).toBeInstanceOf(NotAcceptException);
    });

    it('should return error when file exists and isPersonalDestination is true (cover isPersonalDestination branch)', async () => {
      const params = {
        actorId,
        documents: [{ _id: documentId, service: DocumentStorageEnum.GOOGLE, size: 1000 }] as any,
        documentPermission: { role: 'OWNER', refId: 'user123' } as any,
        destinationId: actorId,
        destinationType: DestinationType.PERSONAL,
        file: { name: 'file.txt' } as any,
        personalWorkspaceAvailable: true,
        isRequestFromMobile: false,
      };

      const res = await documentService.verifyMoveDocuments(params);

      expect(res.isAllowed).toBe(false);
      expect((res.error as any).message).toContain('Can not move this file');
    });

    it('should return error when moving to same folder (cover isMovingSameFolder)', async () => {
      const folderId = '507f1f77bcf86cd799439011';
      const params = {
        actorId,
        documents: [{ _id: documentId, service: DocumentStorageEnum.S3, size: 1000 }] as any,
        documentPermission: { 
          role: 'OWNER', 
          refId: { toHexString: () => '507f1f77bcf86cd799439012' } 
        } as any,
        destinationId: '507f1f77bcf86cd799439012',
        destinationType: DestinationType.ORGANIZATION,
        folderId,
        personalWorkspaceAvailable: true,
        isRequestFromMobile: false,
      };

      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue({
        _id: documentId,
        folderId: { toHexString: () => folderId }
      } as any);

      const res = await documentService.verifyMoveDocuments(params);

      expect(res.isAllowed).toBe(false);
      expect((res.error as any).message).toContain('Can not move documents to this location');
    });

    it('should return error when moving from folder to same folder (cover isMovingFromFolder && isMovingToFolder)', async () => {
      const folderId = '507f1f77bcf86cd799439011';
      const params = {
        actorId,
        documents: [{ _id: documentId, service: DocumentStorageEnum.S3, size: 1000 }] as any,
        documentPermission: { 
          role: 'OWNER', 
          refId: { toHexString: () => '507f1f77bcf86cd799439012' } 
        } as any,
        destinationId: '507f1f77bcf86cd799439012',
        destinationType: DestinationType.ORGANIZATION,
        folderId,
        personalWorkspaceAvailable: true,
        isRequestFromMobile: false,
      };

      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue({
        _id: documentId,
        folderId: { toHexString: () => folderId }
      } as any);

      const res = await documentService.verifyMoveDocuments(params);

      expect(res.isAllowed).toBe(false);
      expect((res.error as any).message).toContain('Can not move documents to this location');
    });

    it('should return error when moving from folder to different folder but same location (cover isMovingSameLocation && !isMovingFromFolder && !isMovingToFolder)', async () => {
      const params = {
        actorId,
        documents: [{ _id: documentId, service: DocumentStorageEnum.S3, size: 1000 }] as any,
        documentPermission: { 
          role: 'OWNER', 
          refId: { toHexString: () => actorId } 
        } as any,
        destinationId: actorId,
        destinationType: DestinationType.PERSONAL,
        personalWorkspaceAvailable: true,
        isRequestFromMobile: false,
      };

      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue({
        _id: documentId,
        folderId: null
      } as any);
      jest.spyOn(documentService, 'isMovingSameLocation').mockReturnValue(true);

      const res = await documentService.verifyMoveDocuments(params);

      expect(res.isAllowed).toBe(false);
      expect((res.error as any).message).toContain('Can not move documents to this location');
    });

    it('should return error when moving from folder to different folder but same location (cover isMovingSameLocation && isMovingFromFolder && !isMovingToFolder)', async () => {
      const params = {
        actorId,
        documents: [{ _id: documentId, service: DocumentStorageEnum.S3, size: 1000 }] as any,
        documentPermission: { 
          role: 'OWNER', 
          refId: { toHexString: () => actorId } 
        } as any,
        destinationId: actorId,
        destinationType: DestinationType.PERSONAL,
        personalWorkspaceAvailable: true,
        isRequestFromMobile: false,
      };
      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue({
        _id: documentId,
        folderId: { toHexString: () => '507f1f77bcf86cd799439011' }
      } as any);

      jest.spyOn(documentService, 'isMovingSameLocation').mockReturnValue(true);

      const res = await documentService.verifyMoveDocuments(params);
      expect(res.isAllowed).toBe(true);
    });

    it('should return error when moving from folder to different folder but same location (cover isMovingSameLocation && !isMovingFromFolder && isMovingToFolder)', async () => {
      const folderId = '507f1f77bcf86cd799439011';
      const params = {
        actorId,
        documents: [{ _id: documentId, service: DocumentStorageEnum.S3, size: 1000 }] as any,
        documentPermission: { 
          role: 'OWNER', 
          refId: { toHexString: () => actorId } 
        } as any,
        destinationId: actorId,
        destinationType: DestinationType.PERSONAL,
        folderId,
        personalWorkspaceAvailable: true,
        isRequestFromMobile: false,
      };

      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue({
        _id: documentId,
        folderId: null
      } as any);
      jest.spyOn(documentService, 'isMovingSameLocation').mockReturnValue(true);

      const res = await documentService.verifyMoveDocuments(params);
      expect(res.isAllowed).toBe(true);
    });

    it('should return error when moving from folder to different folder but same location (cover isMovingSameLocation && isMovingFromFolder && isMovingToFolder)', async () => {
      const folderId = '507f1f77bcf86cd799439011';
      const params = {
        actorId,
        documents: [{ _id: documentId, service: DocumentStorageEnum.S3, size: 1000 }] as any,
        documentPermission: { 
          role: 'OWNER', 
          refId: { toHexString: () => actorId } 
        } as any,
        destinationId: actorId,
        destinationType: DestinationType.PERSONAL,
        folderId,
        personalWorkspaceAvailable: true,
        isRequestFromMobile: false,
      };

      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue({
        _id: documentId,
        folderId: { toHexString: () => '507f1f77bcf86cd799439012' }
      } as any);
      jest.spyOn(documentService, 'isMovingSameLocation').mockReturnValue(true);

      const res = await documentService.verifyMoveDocuments(params);
      expect(res.isAllowed).toBe(true);
    });

    it('should return error when verifiedDestination is false (cover !verifiedDestination branch)', async () => {
      const params = {
        actorId,
        documents: [{ _id: documentId, service: DocumentStorageEnum.S3, size: 1000 }] as any,
        documentPermission: { 
          role: 'VIEWER',
          refId: { toHexString: () => '507f1f77bcf86cd799439012' } 
        } as any,
        destinationId: '507f1f77bcf86cd799439013',
        destinationType: DestinationType.ORGANIZATION,
        personalWorkspaceAvailable: false,
        isRequestFromMobile: false,
      };

      jest.spyOn(documentService, 'getDocumentByDocumentId').mockResolvedValue({
        _id: documentId,
        folderId: null
      } as any);
      jest.spyOn(documentService, 'isMovingSameLocation').mockReturnValue(false);
      jest.spyOn(documentService, 'isMovingSameResource').mockResolvedValue({ isSameResource: false });

      const res = await documentService.verifyMoveDocuments(params);

      expect(res.isAllowed).toBe(false);
      expect((res.error as any).message).toContain('Can not move documents to destination');
    });
  });

  describe('updateDocumentChunkedStatus', () => {
    it('should update document chunked status', async () => {
      const documentId = 'doc123';
      const status = 'INDEXED' as any;
      const mockUpdatedDocument = { _id: 'doc123', 'metadata.indexingStatus': status };

      (documentService as any).documentModel = {
        findOneAndUpdate: jest.fn().mockReturnValue({ new: true }).mockResolvedValue(mockUpdatedDocument)
      };

      const result = await documentService.updateDocumentChunkedStatus(documentId, status);

      expect(result).toEqual(mockUpdatedDocument);
      expect((documentService as any).documentModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: documentId },
        { $set: { 'metadata.indexingStatus': status } },
        { new: true }
      );
    });
  });

  describe('moveDocuments', () => {
    const validObjectId = '507f1f77bcf86cd799439011';

    it('should return error when verification fails', async () => {
      const params = {
        actorId: 'user123',
        documentIds: ['507f1f77bcf86cd799439011'],
        destinationId: 'org123',
        destinationType: 'ORGANIZATION' as any,
        isRequestFromMobile: false
      };

      const mockActor = { _id: 'user123', name: 'Actor', metadata: { isMigratedPersonalDoc: false } };
      const mockDocuments = [{ _id: '507f1f77bcf86cd799439011', name: 'Doc 1', service: 'S3' as any }];
      const mockDocumentPermissions = [
        [{ role: 'OWNER' as any, refId: { toHexString: () => 'user123' } }],
        []
      ];

      jest.spyOn(documentService, 'verifyMoveDocuments').mockResolvedValue({ 
        isAllowed: false, 
        error: GraphErrorException.BadRequest('Cannot move') 
      });

      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(mockActor) };
      (documentService as any).getDocumentPermissionByConditions = jest.fn().mockResolvedValue([mockDocumentPermissions[0], []]);
      (documentService as any).findDocumentsByIds = jest.fn().mockResolvedValue(mockDocuments);

      const result = await documentService.moveDocuments(params);

      expect(result).toEqual({ 
        isSuccess: false, 
        error: GraphErrorException.BadRequest('Cannot move') 
      });
    });

    it('should categorize ORIGINAL_DOCUMENT_PERMISSION_ROLE roles as internal permissions', async () => {
      const params = {
        actorId: 'user123',
        documentIds: [validObjectId],
        destinationId: 'org123',
        destinationType: 'ORGANIZATION' as any,
        isRequestFromMobile: false
      };
      const mockActor = { _id: 'user123', name: 'Actor', metadata: { isMigratedPersonalDoc: false } };
      const mockDocuments = [{ _id: validObjectId, name: 'Doc 1', service: 'S3' as any }];
      const mockDocumentPermissions = [
        { role: 'owner' as any, refId: { toHexString: () => 'user123' } },
        { role: 'organization' as any, refId: { toHexString: () => 'org123' } },
        { role: 'organization_team' as any, refId: { toHexString: () => 'team123' } },
        { role: 'sharer' as any, refId: { toHexString: () => 'user456' } },
        { role: 'editor' as any, refId: { toHexString: () => 'user789' } },
        { role: 'viewer' as any, refId: { toHexString: () => 'user101' } },
        { role: 'spectator' as any, refId: { toHexString: () => 'user102' } },
      ];
      const mockVerifyMoveDocuments = jest.spyOn(documentService, 'verifyMoveDocuments').mockResolvedValue({
        isAllowed: true,
        orgId: 'org123'
      });
      const mockIsMovingSameLocation = jest.spyOn(documentService, 'isMovingSameLocation').mockReturnValue(false);
      const mockUpdateManyDocumentPermission = jest.spyOn(documentService, 'updateManyDocumentPermission').mockResolvedValue({} as any);
      const mockDeleteDocumentPermissions = jest.spyOn(documentService, 'deleteDocumentPermissions').mockResolvedValue({} as any);
      const mockDeleteManyRequestAccess = jest.spyOn(documentService, 'deleteManyRequestAccess').mockResolvedValue({} as any);
      const mockUpdateManyDocuments = jest.spyOn(documentService, 'updateManyDocuments').mockResolvedValue({} as any);
      const mockPubishMoveDocumentsNotification = jest.spyOn(documentService, 'pubishMoveDocumentsNotification').mockImplementation();
      const mockPublishMoveDocumentsSubscription = jest.spyOn(documentService, 'publishMoveDocumentsSubscription').mockImplementation();
      const mockUpdateRecentDocumentsAfterMove = jest.spyOn(documentService, 'updateRecentDocumentsAfterMove').mockImplementation();
      const mockEmitSocketUpdateDocumentPermission = jest.spyOn(documentService, 'emitSocketUpdateDocumentPermission').mockImplementation();
  
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(mockActor) };
      (documentService as any).getDocumentPermissionByConditions = jest.fn().mockResolvedValue(mockDocumentPermissions);
      (documentService as any).findDocumentsByIds = jest.fn().mockResolvedValue(mockDocuments);
      (documentService as any).documentPermissionModel = { find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) };
      (documentService as any).documentModel = { bulkWrite: jest.fn().mockResolvedValue({ modifiedCount: 1 }) };
  
      const result = await documentService.moveDocuments(params);
  
      expect(result).toEqual({
        isSuccess: true,
        isMoveFromPersonal: true
      });
      expect(mockVerifyMoveDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          file: undefined,
          actorId: 'user123',
          documents: mockDocuments,
          documentPermission: expect.objectContaining({
            role: 'owner',
            refId: expect.objectContaining({
              toHexString: expect.any(Function)
            })
          }),
          destinationId: 'org123',
          destinationType: 'ORGANIZATION',
          folderId: undefined,
          personalWorkspaceAvailable: true,
          isRequestFromMobile: false
        })
      );
      expect(mockIsMovingSameLocation).toHaveBeenCalled();
      expect(mockUpdateManyDocumentPermission).toHaveBeenCalled();
      expect(mockDeleteDocumentPermissions).toHaveBeenCalled();
      expect(mockDeleteManyRequestAccess).toHaveBeenCalled();
      expect(mockUpdateManyDocuments).toHaveBeenCalled();
      expect(mockPubishMoveDocumentsNotification).toHaveBeenCalled();
      expect(mockPublishMoveDocumentsSubscription).toHaveBeenCalled();
      expect(mockUpdateRecentDocumentsAfterMove).toHaveBeenCalled();
      expect(mockEmitSocketUpdateDocumentPermission).toHaveBeenCalled();
    });

    it('should categorize non-ORIGINAL_DOCUMENT_PERMISSION_ROLE roles as external permissions', async () => {
      const params = {
        actorId: 'user123',
        documentIds: [validObjectId],
        destinationId: 'org123',
        destinationType: 'ORGANIZATION' as any,
        isRequestFromMobile: false
      };
      const mockActor = { _id: 'user123', name: 'Actor', metadata: { isMigratedPersonalDoc: false } };
      const mockDocuments = [{ _id: validObjectId, name: 'Doc 1', service: 'S3' as any }];
      const mockDocumentPermissions = [
        { role: 'sharer' as any, refId: { toHexString: () => 'user456' } },
        { role: 'editor' as any, refId: { toHexString: () => 'user789' } },
        { role: 'viewer' as any, refId: { toHexString: () => 'user101' } },
        { role: 'spectator' as any, refId: { toHexString: () => 'user102' } },
        { role: 'guest' as any, refId: { toHexString: () => 'user103' } },
      ];
      const mockVerifyMoveDocuments = jest.spyOn(documentService, 'verifyMoveDocuments').mockResolvedValue({
        isAllowed: true,
        orgId: 'org123'
      });
      const mockIsMovingSameLocation = jest.spyOn(documentService, 'isMovingSameLocation').mockReturnValue(false);
      const mockUpdateManyDocumentPermission = jest.spyOn(documentService, 'updateManyDocumentPermission').mockResolvedValue({} as any);
      const mockDeleteDocumentPermissions = jest.spyOn(documentService, 'deleteDocumentPermissions').mockResolvedValue({} as any);
      const mockDeleteManyRequestAccess = jest.spyOn(documentService, 'deleteManyRequestAccess').mockResolvedValue({} as any);
      const mockUpdateManyDocuments = jest.spyOn(documentService, 'updateManyDocuments').mockResolvedValue({} as any);
      const mockPubishMoveDocumentsNotification = jest.spyOn(documentService, 'pubishMoveDocumentsNotification').mockImplementation();
      const mockPublishMoveDocumentsSubscription = jest.spyOn(documentService, 'publishMoveDocumentsSubscription').mockImplementation();
      const mockUpdateRecentDocumentsAfterMove = jest.spyOn(documentService, 'updateRecentDocumentsAfterMove').mockImplementation();
      const mockEmitSocketUpdateDocumentPermission = jest.spyOn(documentService, 'emitSocketUpdateDocumentPermission').mockImplementation();

      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(mockActor) };
      (documentService as any).getDocumentPermissionByConditions = jest.fn().mockResolvedValue(mockDocumentPermissions);
      (documentService as any).findDocumentsByIds = jest.fn().mockResolvedValue(mockDocuments);
      (documentService as any).documentPermissionModel = { find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) };
      (documentService as any).documentModel = { bulkWrite: jest.fn().mockResolvedValue({ modifiedCount: 1 }) };
  
      const result = await documentService.moveDocuments(params);
  
      expect(result).toEqual({
        isSuccess: true,
        isMoveFromPersonal: false
      });
      expect(mockVerifyMoveDocuments).toHaveBeenCalledWith({
        file: undefined,
        actorId: 'user123',
        documents: mockDocuments,
        documentPermission: undefined,
        destinationId: 'org123',
        destinationType: 'ORGANIZATION',
        folderId: undefined,
        personalWorkspaceAvailable: true,
        isRequestFromMobile: false
      });
      expect(mockIsMovingSameLocation).toHaveBeenCalled();
      expect(mockUpdateManyDocumentPermission).toHaveBeenCalled();
      expect(mockDeleteDocumentPermissions).toHaveBeenCalled();
      expect(mockDeleteManyRequestAccess).toHaveBeenCalled();
      expect(mockUpdateManyDocuments).toHaveBeenCalled();
      expect(mockPubishMoveDocumentsNotification).toHaveBeenCalled();
      expect(mockPublishMoveDocumentsSubscription).toHaveBeenCalled();
      expect(mockUpdateRecentDocumentsAfterMove).toHaveBeenCalled();
      expect(mockEmitSocketUpdateDocumentPermission).toHaveBeenCalled();
    });

    it('should handle file upload when file is provided', async () => {
      const mockFile = {
        fileBuffer: Buffer.from('test content'),
        mimetype: 'application/pdf',
        filename: 'test.pdf',
        filesize: 1024
      };
      const params = {
        actorId: 'user123',
        documentIds: ['507f1f77bcf86cd799439011'],
        destinationId: 'org123',
        destinationType: 'ORGANIZATION' as any,
        file: mockFile,
        isRequestFromMobile: false
      };
      const mockActor = { _id: 'user123', name: 'Actor', metadata: { isMigratedPersonalDoc: false } };
      const mockDocuments = [{ _id: '507f1f77bcf86cd799439011', name: 'Doc 1', service: 'S3' as any }];
      const mockDocumentPermissions = [
        { role: 'OWNER' as any, refId: { toHexString: () => 'user123' } }
      ];
      const mockVerifyMoveDocuments = jest.spyOn(documentService, 'verifyMoveDocuments').mockResolvedValue({ 
        isAllowed: true,
        orgId: 'org123',
      });

      const mockUploadDocumentWithBuffer = jest.fn().mockResolvedValue('uploaded-key-file');
      const mockGetDocumentNameAfterNaming = jest.fn().mockResolvedValue('renamed-document.pdf');
      const mockUpdateDocument = jest.spyOn(documentService, 'updateDocument').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'isMovingSameLocation').mockReturnValue(false);
      jest.spyOn(documentService, 'updateManyDocumentPermission').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'deleteDocumentPermissions').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'deleteManyRequestAccess').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'updateManyDocuments').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'pubishMoveDocumentsNotification').mockImplementation();
      jest.spyOn(documentService, 'publishMoveDocumentsSubscription').mockImplementation();
      jest.spyOn(documentService, 'updateRecentDocumentsAfterMove').mockImplementation();
      jest.spyOn(documentService, 'emitSocketUpdateDocumentPermission').mockImplementation();

      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(mockActor) };
      (documentService as any).getDocumentPermissionByConditions = jest.fn().mockResolvedValue([mockDocumentPermissions[0], []]);
      (documentService as any).findDocumentsByIds = jest.fn().mockResolvedValue(mockDocuments);
      (documentService as any).awsService = { uploadDocumentWithBuffer: mockUploadDocumentWithBuffer };
      (documentService as any).getDocumentNameAfterNaming = mockGetDocumentNameAfterNaming;
      (documentService as any).documentPermissionModel = { find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) };

      const result = await documentService.moveDocuments(params);

      expect(result).toEqual({ 
        isSuccess: true, 
        isMoveFromPersonal: false 
      });
      expect(mockUploadDocumentWithBuffer).toHaveBeenCalledWith(mockFile.fileBuffer, mockFile.mimetype);
      expect(mockGetDocumentNameAfterNaming).toHaveBeenCalledWith({
        clientId: 'org123',
        fileName: 'test.pdf',
        documentFolderType: 'ORGANIZATION',
        mimetype: 'application/pdf',
        folderId: undefined
      });
      expect(mockUpdateDocument).toHaveBeenCalledWith('507f1f77bcf86cd799439011', { 
        name: 'renamed-document.pdf', 
        remoteId: 'uploaded-key-file', 
        service: 's3' 
      });
    });

    it('should handle move to personal workspace', async () => {
      const params = {
        actorId: 'user123',
        documentIds: ['507f1f77bcf86cd799439011'],
        destinationId: 'user123',
        destinationType: 'PERSONAL' as any,
        isRequestFromMobile: false
      };

      const mockActor = { _id: 'user123', name: 'Actor', metadata: { isMigratedPersonalDoc: false } };
      const mockDocuments = [{ _id: '507f1f77bcf86cd799439011', name: 'Doc 1', service: 'S3' as any }];
      const mockDocumentPermissions = [
        { role: 'OWNER' as any, refId: { toHexString: () => 'user123' } }
      ];

      jest.spyOn(documentService, 'verifyMoveDocuments').mockResolvedValue({ 
        isAllowed: true,
        orgId: 'org123'
      });

      const mockGetDocumentNameAfterNaming = jest.fn().mockResolvedValue('renamed-document.pdf');
      const mockBulkWrite = jest.fn().mockResolvedValue({ modifiedCount: 1 });
      jest.spyOn(documentService, 'isMovingSameLocation').mockReturnValue(false);
      const mockUpdateManyDocumentPermission = jest.spyOn(documentService, 'updateManyDocumentPermission').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'deleteDocumentPermissions').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'deleteManyRequestAccess').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'updateManyDocuments').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'pubishMoveDocumentsNotification').mockImplementation();
      jest.spyOn(documentService, 'publishMoveDocumentsSubscription').mockImplementation();
      jest.spyOn(documentService, 'updateRecentDocumentsAfterMove').mockImplementation();
      jest.spyOn(documentService, 'emitSocketUpdateDocumentPermission').mockImplementation();

      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(mockActor) };
      (documentService as any).getDocumentPermissionByConditions = jest.fn().mockResolvedValue([mockDocumentPermissions[0], []]);
      (documentService as any).findDocumentsByIds = jest.fn().mockResolvedValue(mockDocuments);
      (documentService as any).getDocumentNameAfterNaming = mockGetDocumentNameAfterNaming;
      (documentService as any).documentModel = { bulkWrite: mockBulkWrite };
      (documentService as any).documentPermissionModel = { find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) };

      const result = await documentService.moveDocuments(params);

      expect(result).toEqual({ 
        isSuccess: true, 
        isMoveFromPersonal: false 
      });
      expect(mockUpdateManyDocumentPermission).toHaveBeenCalledWith(
        { documentId: { $in: ['507f1f77bcf86cd799439011'] } },
        { $unset: { workspace: '' } }
      );
    });   
    
    it('should set workspace when moving to PERSONAL workspace with verified orgId', async () => {
      const params = {
        actorId: 'user123',
        documentIds: [validObjectId],
        destinationId: 'user123',
        destinationType: 'PERSONAL' as any,
        isRequestFromMobile: false
      };
      const mockActor = { _id: 'user123', name: 'Actor', metadata: { isMigratedPersonalDoc: true } };
      const mockDocuments = [{ _id: validObjectId, name: 'Doc 1', service: 'S3' as any }];
      const mockDocumentPermissions = [
        { role: 'owner' as any, refId: { toHexString: () => 'user123' } }
      ];
    
      jest.spyOn(documentService, 'verifyMoveDocuments').mockResolvedValue({
        isAllowed: true,
        orgId: 'org999'
      });
      jest.spyOn(documentService, 'isMovingSameLocation').mockReturnValue(false);
    
      const mockUpdateManyDocumentPermission = jest.spyOn(documentService, 'updateManyDocumentPermission').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'deleteDocumentPermissions').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'deleteManyRequestAccess').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'updateManyDocuments').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'pubishMoveDocumentsNotification').mockImplementation();
      jest.spyOn(documentService, 'publishMoveDocumentsSubscription').mockImplementation();
      jest.spyOn(documentService, 'updateRecentDocumentsAfterMove').mockImplementation();
      jest.spyOn(documentService, 'emitSocketUpdateDocumentPermission').mockImplementation();
    
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(mockActor) };
      (documentService as any).getDocumentPermissionByConditions = jest.fn().mockResolvedValue(mockDocumentPermissions);
      (documentService as any).findDocumentsByIds = jest.fn().mockResolvedValue(mockDocuments);
      (documentService as any).documentModel = { bulkWrite: jest.fn().mockResolvedValue({ modifiedCount: 1 }) };
    
      const result = await documentService.moveDocuments(params);
    
      expect(result).toEqual({ isSuccess: true, isMoveFromPersonal: true });
      expect(mockUpdateManyDocumentPermission).toHaveBeenCalledWith(
        { documentId: { $in: [validObjectId] } },
        expect.objectContaining({
          workspace: { refId: 'org999', type: 'organization' }
        })
      );
    }); 
    
    it('should include folderId in updateManyDocuments when provided', async () => {
      const params = {
        actorId: 'user123',
        documentIds: [validObjectId],
        destinationId: 'org123',
        destinationType: 'ORGANIZATION' as any,
        folderId: 'folder123',
        isRequestFromMobile: false
      };
      const mockActor = { _id: 'user123', name: 'Actor', metadata: { isMigratedPersonalDoc: false } };
      const mockDocuments = [{ _id: validObjectId, name: 'Doc 1', service: 'S3' as any }];
      const mockDocumentPermissions = [{ role: 'owner' as any, refId: { toHexString: () => 'user123' } }];
    
      jest.spyOn(documentService, 'verifyMoveDocuments').mockResolvedValue({ isAllowed: true, orgId: 'org123' });
      jest.spyOn(documentService, 'isMovingSameLocation').mockReturnValue(false);
      jest.spyOn(documentService, 'updateManyDocumentPermission').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'deleteDocumentPermissions').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'deleteManyRequestAccess').mockResolvedValue({} as any);
    
      const mockUpdateManyDocuments = jest.spyOn(documentService, 'updateManyDocuments').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'pubishMoveDocumentsNotification').mockImplementation();
      jest.spyOn(documentService, 'publishMoveDocumentsSubscription').mockImplementation();
      jest.spyOn(documentService, 'updateRecentDocumentsAfterMove').mockImplementation();
      jest.spyOn(documentService, 'emitSocketUpdateDocumentPermission').mockImplementation();
    
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(mockActor) };
      (documentService as any).getDocumentPermissionByConditions = jest.fn().mockResolvedValue(mockDocumentPermissions);
      (documentService as any).findDocumentsByIds = jest.fn().mockResolvedValue(mockDocuments);
      (documentService as any).documentModel = { bulkWrite: jest.fn().mockResolvedValue({ modifiedCount: 1 }) };
    
      await documentService.moveDocuments(params);
    
      expect(mockUpdateManyDocuments).toHaveBeenCalledWith(
        { _id: { $in: [validObjectId] } },
        expect.objectContaining({ folderId: 'folder123' })
      );
    });  

    it('should publish notification when destinationType is not ORGANIZATION even if isNotify is false', async () => {
      const params = {
        actorId: 'user123',
        documentIds: [validObjectId],
        destinationId: 'user123',
        destinationType: 'PERSONAL' as any,
        isNotify: false,
        isRequestFromMobile: false,
      };
      const mockActor = { _id: 'user123', name: 'Actor', metadata: { isMigratedPersonalDoc: false } };
      const mockDocuments = [{ _id: validObjectId, name: 'Doc 1', service: 'S3' as any }];
      const mockDocumentPermissions = [{ role: 'owner' as any, refId: { toHexString: () => 'user123' } }];
    
      jest.spyOn(documentService, 'verifyMoveDocuments').mockResolvedValue({ isAllowed: true, orgId: 'org123' });
      jest.spyOn(documentService, 'isMovingSameLocation').mockReturnValue(false);
      jest.spyOn(documentService, 'updateManyDocumentPermission').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'deleteDocumentPermissions').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'deleteManyRequestAccess').mockResolvedValue({} as any);
      jest.spyOn(documentService, 'updateManyDocuments').mockResolvedValue({} as any);
      
      const mockPubishMoveDocumentsNotification = jest.spyOn(documentService, 'pubishMoveDocumentsNotification').mockImplementation();
      jest.spyOn(documentService, 'publishMoveDocumentsSubscription').mockImplementation();
      jest.spyOn(documentService, 'updateRecentDocumentsAfterMove').mockImplementation();
      jest.spyOn(documentService, 'emitSocketUpdateDocumentPermission').mockImplementation();
    
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(mockActor) };
      (documentService as any).getDocumentPermissionByConditions = jest.fn().mockResolvedValue(mockDocumentPermissions);
      (documentService as any).findDocumentsByIds = jest.fn().mockResolvedValue(mockDocuments);
      (documentService as any).documentModel = { bulkWrite: jest.fn().mockResolvedValue({ modifiedCount: 1 }) };
    
      const result = await documentService.moveDocuments(params);
    
      expect(result).toEqual({ isSuccess: true, isMoveFromPersonal: true });
      expect(mockPubishMoveDocumentsNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          actor: mockActor,
          documentIds: [validObjectId],
          destinationId: 'user123',
          destinationType: 'PERSONAL'
        })
      );
    });
  });

  describe('pubishMoveDocumentsNotification', () => {
    beforeEach(() => {
      (global as any).notiDocumentFactory = {
        create: jest.fn().mockReturnValue({ type: 'notification' })
      };
      (global as any).notiFirebaseDocumentFactory = {
        create: jest.fn().mockReturnValue({
          notificationContent: 'content',
          notificationData: 'data'
        })
      };
      (global as any).NotiDocument = {
        UPLOAD_DOCUMENT_ORGANIZATION: 1,
        UPLOAD_DOCUMENT_ORGANIZATION_TEAM: 2
      };
      (documentService as any).organizationService = {
        getOrgById: jest.fn().mockResolvedValue({ _id: 'org1', name: 'Org 1' }),
        publishNotiToAllOrgMember: jest.fn(),
        publishFirebaseNotiToAllOrgMember: jest.fn(),
        publishFirebaseNotiToAllTeamMember: jest.fn(),
      };
      (documentService as any).teamService = {
        findOne: jest.fn().mockResolvedValue({ _id: 'team1', name: 'Team 1', belongsTo: 'org1' }),
      };
      (documentService as any).membershipService = {
        publishNotiToAllTeamMember: jest.fn(),
      };
    });

    it('should handle default case without throwing error', async () => {
      const mockActor = { _id: 'user1', name: 'Test User' } as any;
      const mockDocumentIds = ['doc1'];
      const mockDestinationId = 'dest1';
      const mockDestinationType = 'PERSONAL' as any;

      documentService = new (class {
        getDocumentByDocumentId = jest.fn();
        pubishMoveDocumentsNotification = DocumentService.prototype.pubishMoveDocumentsNotification;
      })() as any;

      await expect(documentService.pubishMoveDocumentsNotification({
        actor: mockActor,
        documentIds: mockDocumentIds,
        destinationId: mockDestinationId,
        destinationType: mockDestinationType
      })).resolves.not.toThrow();
    });

    it('should publish notifications for ORGANIZATION', async () => {
      const mockActor = { _id: 'user1', name: 'Test User' } as any;
      const mockDocumentIds = ['doc1'];
    
      await documentService.pubishMoveDocumentsNotification({
        actor: mockActor,
        documentIds: mockDocumentIds,
        destinationId: 'org1',
        destinationType: 'ORGANIZATION' as any
      });
    
      expect((documentService as any).organizationService.getOrgById).toHaveBeenCalledWith('org1');
      expect(notiDocumentFactory.create).toHaveBeenCalledWith(
        NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION,
        expect.any(Object)
      );
      expect((documentService as any).organizationService.publishNotiToAllOrgMember).toHaveBeenCalled();
      expect(notiFirebaseDocumentFactory.create).toHaveBeenCalledWith(
        NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION,
        expect.objectContaining({
          actor: mockActor,
          totalDocuments: 1,
          isMultipleDocs: false
        })
      );
      expect((documentService as any).organizationService.publishFirebaseNotiToAllOrgMember).toHaveBeenCalled();
    });
    
    it('should publish notifications for ORGANIZATION_TEAM', async () => {
      const mockActor = { _id: 'user1', name: 'Test User' } as any;
      const mockDocumentIds = ['doc1'];
  
      await documentService.pubishMoveDocumentsNotification({
        actor: mockActor,
        documentIds: mockDocumentIds,
        destinationId: 'team1',
        destinationType: 'ORGANIZATION_TEAM' as any
      });
  
      expect((documentService as any).teamService.findOne).toHaveBeenCalledWith({ _id: 'team1' });
      expect((documentService as any).organizationService.getOrgById).toHaveBeenCalledWith('org1');
      expect(notiDocumentFactory.create).toHaveBeenCalledWith(
        NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION_TEAM,
        expect.any(Object)
      );
      expect((documentService as any).membershipService.publishNotiToAllTeamMember).toHaveBeenCalled();
      expect(notiFirebaseDocumentFactory.create).toHaveBeenCalledWith(
        NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION_TEAM,
        expect.objectContaining({
          actor: mockActor,
          totalDocuments: 1,
          isMultipleDocs: false
        })
      );
      expect((documentService as any).organizationService.publishFirebaseNotiToAllTeamMember).toHaveBeenCalled();
    });

    it('should publish notifications for ORGANIZATION with multiple documents', async () => {
      const mockActor = { _id: 'user1', name: 'Test User' } as any;
      const mockDocumentIds = ['doc1', 'doc2', 'doc3'];
    
      await documentService.pubishMoveDocumentsNotification({
        actor: mockActor,
        documentIds: mockDocumentIds,
        destinationId: 'org1',
        destinationType: 'ORGANIZATION' as any,
      });
    
      expect(notiDocumentFactory.create).toHaveBeenCalledWith(
        NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION,
        expect.objectContaining({
          entity: expect.objectContaining({
            document: { name: '3' },
            entityData: { multipleDocument: true }
          })
        })
      );
      expect(notiFirebaseDocumentFactory.create).toHaveBeenCalledWith(
        NotiDocument.UPLOAD_DOCUMENT_ORGANIZATION,
        expect.objectContaining({
          actor: mockActor,
          totalDocuments: 3,
          isMultipleDocs: true
        })
      );
    });
  });

  describe('publishMoveDocumentsSubscription', () => {
    let documentService: any;
  
    beforeEach(() => {
      documentService = new (class {
        organizationService = {
          getMembersByOrgId: jest.fn().mockResolvedValue([{ userId: { toHexString: () => 'orgUser1' } }]),
        };
        membershipService = {
          find: jest.fn().mockResolvedValue([{ userId: { toHexString: () => 'teamUser1' } }]),
        };
        findDocumentsByIds = jest.fn().mockResolvedValue([
          { _id: 'doc1', lastAccess: new Date(), createdAt: new Date() },
        ]);
        publishUpdateDocument = jest.fn();
        publishRemoveDocumentWhenMoving = jest.fn();
        publishMoveDocumentsSubscription = 
          (DocumentService.prototype as any).publishMoveDocumentsSubscription;
      })();
    });
  
    const mockActor = { _id: 'user1' } as any;
    const mockDocuments = [{ _id: 'doc1', lastAccess: new Date(), createdAt: new Date() } as any];
  
    it('should handle PERSONAL destination', async () => {
      await documentService.publishMoveDocumentsSubscription({
        actor: mockActor,
        documents: mockDocuments,
        destinationId: 'personalId',
        destinationType: 'PERSONAL',
        internalDocPermission: {} as any,
        externalSharedIds: [],
        folderId: '',
        isMovingSameLocation: false,
      });
  
      expect(documentService.findDocumentsByIds).toHaveBeenCalledWith(['doc1']);
      expect(documentService.publishUpdateDocument).toHaveBeenCalledWith(
        ['user1'],
        expect.objectContaining({ type: SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL }),
        SUBSCRIPTION_UPDATE_DOCUMENT_LIST
      );
      expect(documentService.publishRemoveDocumentWhenMoving).toHaveBeenCalled();
    });
  
    it('should handle ORGANIZATION destination', async () => {
      await documentService.publishMoveDocumentsSubscription({
        actor: mockActor,
        documents: mockDocuments,
        destinationId: 'org1',
        destinationType: 'ORGANIZATION',
        internalDocPermission: {} as any,
        externalSharedIds: [],
        folderId: '',
        isMovingSameLocation: false,
      });
  
      expect(documentService.organizationService.getMembersByOrgId).toHaveBeenCalledWith('org1', { userId: 1 });
      expect(documentService.publishUpdateDocument).toHaveBeenCalledWith(
        ['orgUser1'],
        expect.objectContaining({
          type: SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_ORGANIZATION,
          organizationId: 'org1'
        }),
        SUBSCRIPTION_UPDATE_DOCUMENT_LIST
      );
    });
  
    it('should handle ORGANIZATION_TEAM destination', async () => {
      await documentService.publishMoveDocumentsSubscription({
        actor: mockActor,
        documents: mockDocuments,
        destinationId: 'team1',
        destinationType: 'ORGANIZATION_TEAM',
        internalDocPermission: {} as any,
        externalSharedIds: [],
        folderId: '',
        isMovingSameLocation: false,
      });
  
      expect(documentService.membershipService.find).toHaveBeenCalledWith(
        { teamId: 'team1' },
        { userId: 1 }
      );
      expect(documentService.publishUpdateDocument).toHaveBeenCalledWith(
        ['teamUser1'],
        expect.objectContaining({
          type: SUBSCRIPTION_DOCUMENT_LIST_UPLOAD_DOCUMENT_TEAMS,
          teamId: 'team1'
        }),
        SUBSCRIPTION_UPDATE_DOCUMENT_LIST
      );
    });
  
    it('should handle default destination without errors', async () => {
      await expect(documentService.publishMoveDocumentsSubscription({
        actor: mockActor,
        documents: mockDocuments,
        destinationId: 'unknown',
        destinationType: 'UNKNOWN',
        internalDocPermission: {} as any,
        externalSharedIds: [],
        folderId: '',
        isMovingSameLocation: false,
      })).resolves.not.toThrow();
  
      expect(documentService.publishUpdateDocument).toHaveBeenCalled();
    });
  });
  
  describe('publishRemoveDocumentWhenMoving', () => {
    let documentService: any;
  
    beforeEach(() => {
      documentService = new (class {
        getInternalMembers = jest.fn().mockResolvedValue(['member1', 'member2']);
        publishEventDeleteDocumentToInternal = jest.fn();
        publishEventDeleteDocumentToInvididual = jest.fn();
        publishEventDeleteDocumentToExternal = jest.fn();
        publishRemoveDocumentWhenMoving =
          (DocumentService.prototype as any).publishRemoveDocumentWhenMoving;
      })();
    });
  
    const mockActor = { _id: 'user1' } as any;
    const mockDocuments = [{ _id: 'doc1' } as any];
  
    it('should handle ORGANIZATION role', async () => {
      await documentService.publishRemoveDocumentWhenMoving({
        actor: mockActor,
        documents: mockDocuments,
        internalDocPermission: { refId: 'org1', role: 'organization' },
        externalSharedIds: ['ext1'],
        isMovingSameLocation: false,
      });
  
      expect(documentService.getInternalMembers).toHaveBeenCalledWith({ refId: 'org1', role: 'organization' });
      expect(documentService.publishEventDeleteDocumentToInternal).toHaveBeenCalledWith(
        {
          documents: mockDocuments,
          clientId: 'org1',
          roleOfDocument: 'organization',
          allMember: ['member1', 'member2'],
        },
        { additionalSettings: { keepInSearch: false } }
      );
      expect(documentService.publishEventDeleteDocumentToExternal).toHaveBeenCalledWith(mockDocuments, ['ext1']);
    });
  
    it('should handle ORGANIZATION_TEAM role', async () => {
      await documentService.publishRemoveDocumentWhenMoving({
        actor: mockActor,
        documents: mockDocuments,
        internalDocPermission: { refId: 'team1', role: 'organization_team' },
        externalSharedIds: [],
        isMovingSameLocation: true,
      });
  
      expect(documentService.publishEventDeleteDocumentToInternal).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'team1',
          roleOfDocument: 'organization_team',
        }),
        { additionalSettings: { keepInSearch: true } }
      );
      expect(documentService.publishEventDeleteDocumentToExternal).not.toHaveBeenCalled();
    });
  
    it('should handle OWNER role', async () => {
      await documentService.publishRemoveDocumentWhenMoving({
        actor: mockActor,
        documents: mockDocuments,
        internalDocPermission: { refId: 'user1', role: 'owner' },
        externalSharedIds: ['ext2'],
        isMovingSameLocation: false,
      });
  
      expect(documentService.publishEventDeleteDocumentToInvididual).toHaveBeenCalledWith(
        mockDocuments,
        ['user1'],
        { keepInSearch: false }
      );
      expect(documentService.publishEventDeleteDocumentToExternal).toHaveBeenCalledWith(mockDocuments, ['ext2']);
    });
  
    it('should handle default role', async () => {
      await documentService.publishRemoveDocumentWhenMoving({
        actor: mockActor,
        documents: mockDocuments,
        internalDocPermission: { refId: 'x', role: 'viewer' },
        externalSharedIds: [],
        isMovingSameLocation: false,
      });
  
      expect(documentService.publishEventDeleteDocumentToInternal).not.toHaveBeenCalled();
      expect(documentService.publishEventDeleteDocumentToInvididual).not.toHaveBeenCalled();
      expect(documentService.publishEventDeleteDocumentToExternal).toHaveBeenCalledWith(mockDocuments, []);
    });
  });  

  describe('verifyMoveDocumentsDestination', () => {
    let documentService: any;
  
    beforeEach(() => {
      documentService = new (class {
        verifyOwnerMoveDocument = jest.fn();
        verifyMoveDocumentsDestination =
          (DocumentService.prototype as any).verifyMoveDocumentsDestination;
      })();
    });
  
    const mockActorId = 'user1';
    const mockPermission = { role: 'viewer' };

    it('should delegate to verifyOwnerMoveDocument when role is OWNER', async () => {
      documentService.verifyOwnerMoveDocument.mockResolvedValueOnce(true);
  
      const result = await documentService.verifyMoveDocumentsDestination({
        actorId: mockActorId,
        documentPermission: { role: 'owner' },
        destinationId: 'dest1',
        destinationType: 'PERSONAL',
        isMovingSameResource: false,
        personalWorkspaceAvailable: true,
      });
  
      expect(documentService.verifyOwnerMoveDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: mockActorId,
          destinationId: 'dest1',
          destinationType: 'PERSONAL',
          personalWorkspaceAvailable: true,
          documentPermission: { role: 'owner' },
        })
      );
      expect(result).toBe(true);
    });
  
    it('should return true if destinationType = PERSONAL, destinationId = actorId and personalWorkspaceAvailable = true', async () => {
      const result = await documentService.verifyMoveDocumentsDestination({
        actorId: mockActorId,
        documentPermission: mockPermission,
        destinationId: mockActorId,
        destinationType: 'PERSONAL',
        isMovingSameResource: false,
        personalWorkspaceAvailable: true,
      });
  
      expect(result).toBe(true);
    });
  
    it('should return false if not moving same resource and not OWNER and conditions do not match', async () => {
      const result = await documentService.verifyMoveDocumentsDestination({
        actorId: mockActorId,
        documentPermission: mockPermission,
        destinationId: 'anotherUser',
        destinationType: 'PERSONAL',
        isMovingSameResource: false,
        personalWorkspaceAvailable: false,
      });
  
      expect(result).toBe(false);
    });
  });
  
  describe('verifyOwnerMoveDocument', () => {
    it('should return true when moving to personal workspace and personalWorkspaceAvailable is true', async () => {
      const mockParams = {
        actorId: 'user1',
        destinationId: 'user1',
        destinationType: 'PERSONAL' as any,
        personalWorkspaceAvailable: true,
        documentPermission: { workspace: { refId: 'org1' } } as any,
      };
  
      documentService = new (class {
        organizationService = { getMembershipByOrgAndUser: jest.fn() };
        organizationTeamService = { getOrgTeamMembershipOfUser: jest.fn() };
        verifyOwnerMoveDocument = DocumentService.prototype.verifyOwnerMoveDocument;
      })() as any;
  
      const result = await documentService.verifyOwnerMoveDocument(mockParams);
      expect(result).toBe(true);
    });
  
    it('should return false when moving to personal workspace and personalWorkspaceAvailable is false', async () => {
      const mockParams = {
        actorId: 'user1',
        destinationId: 'user1',
        destinationType: 'PERSONAL' as any,
        personalWorkspaceAvailable: false,
        documentPermission: { workspace: { refId: 'org1' } } as any,
      };
  
      documentService = new (class {
        organizationService = { getMembershipByOrgAndUser: jest.fn() };
        organizationTeamService = { getOrgTeamMembershipOfUser: jest.fn() };
        verifyOwnerMoveDocument = DocumentService.prototype.verifyOwnerMoveDocument;
      })() as any;
  
      const result = await documentService.verifyOwnerMoveDocument(mockParams);
      expect(result).toBe(false);
    });
  
    it('should return true when moving from personal workspace to PERSONAL with org membership', async () => {
      const mockParams = {
        actorId: 'user1',
        destinationId: 'org1',
        destinationType: 'PERSONAL' as any,
        personalWorkspaceAvailable: false,
        documentPermission: { workspace: null } as any,
      };
      const mockGetMembershipByOrgAndUser = jest.fn().mockResolvedValue({ _id: 'membership1' });
      const mockGetOrgTeamMembershipOfUser = jest.fn().mockResolvedValue(null);
  
      documentService = new (class {
        organizationService = { getMembershipByOrgAndUser: mockGetMembershipByOrgAndUser };
        organizationTeamService = { getOrgTeamMembershipOfUser: mockGetOrgTeamMembershipOfUser };
        verifyOwnerMoveDocument = DocumentService.prototype.verifyOwnerMoveDocument;
      })() as any;
  
      const result = await documentService.verifyOwnerMoveDocument(mockParams);
      expect(result).toBe(true);
      expect(mockGetMembershipByOrgAndUser).toHaveBeenCalledWith('org1', 'user1');
    });
  
    it('should return true when moving from personal workspace to ORGANIZATION_TEAM with valid membership', async () => {
      const mockParams = {
        actorId: 'user1',
        destinationId: 'team1',
        destinationType: 'ORGANIZATION_TEAM' as any,
        personalWorkspaceAvailable: false,
        documentPermission: { workspace: null } as any,
      };
      const mockGetMembershipByOrgAndUser = jest.fn().mockResolvedValue(null);
      const mockGetOrgTeamMembershipOfUser = jest.fn().mockResolvedValue({ _id: 'teamMembership1' });
  
      documentService = new (class {
        organizationService = { getMembershipByOrgAndUser: mockGetMembershipByOrgAndUser };
        organizationTeamService = { getOrgTeamMembershipOfUser: mockGetOrgTeamMembershipOfUser };
        verifyOwnerMoveDocument = DocumentService.prototype.verifyOwnerMoveDocument;
      })() as any;
  
      const result = await documentService.verifyOwnerMoveDocument(mockParams);
      expect(result).toBe(true);
      expect(mockGetOrgTeamMembershipOfUser).toHaveBeenCalledWith('user1', 'team1');
    });
  
    it('should return false when moving from personal workspace with unsupported destinationType', async () => {
      const mockParams = {
        actorId: 'user1',
        destinationId: 'something',
        destinationType: 'UNKNOWN' as any,
        personalWorkspaceAvailable: false,
        documentPermission: { workspace: null } as any,
      };
  
      documentService = new (class {
        organizationService = { getMembershipByOrgAndUser: jest.fn() };
        organizationTeamService = { getOrgTeamMembershipOfUser: jest.fn() };
        verifyOwnerMoveDocument = DocumentService.prototype.verifyOwnerMoveDocument;
      })() as any;
  
      const result = await documentService.verifyOwnerMoveDocument(mockParams);
      expect(result).toBe(false);
    });

    it('should return true when moving from personal workspace to organization with valid membership', async () => {
      const mockParams = {
        actorId: 'user1',
        destinationId: 'org1',
        destinationType: 'ORGANIZATION' as any,
        personalWorkspaceAvailable: false,
        documentPermission: { workspace: null } as any
      };

      const mockGetMembershipByOrgAndUser = jest.fn().mockResolvedValue({ _id: 'membership1' });
      const mockGetOrgTeamMembershipOfUser = jest.fn().mockResolvedValue(null);

      documentService = new (class {
        organizationService = { getMembershipByOrgAndUser: mockGetMembershipByOrgAndUser };
        organizationTeamService = { getOrgTeamMembershipOfUser: mockGetOrgTeamMembershipOfUser };
        verifyOwnerMoveDocument = DocumentService.prototype.verifyOwnerMoveDocument;
      })() as any;

      const result = await documentService.verifyOwnerMoveDocument(mockParams);
      expect(result).toBe(true);
      expect(mockGetMembershipByOrgAndUser).toHaveBeenCalledWith('org1', 'user1');
    });

    it('should return false when moving from personal workspace without valid membership', async () => {
      const mockParams = {
        actorId: 'user1',
        destinationId: 'org1',
        destinationType: 'ORGANIZATION' as any,
        personalWorkspaceAvailable: false,
        documentPermission: { workspace: null } as any
      };

      const mockGetMembershipByOrgAndUser = jest.fn().mockResolvedValue(null);
      const mockGetOrgTeamMembershipOfUser = jest.fn().mockResolvedValue(null);

      documentService = new (class {
        organizationService = { getMembershipByOrgAndUser: mockGetMembershipByOrgAndUser };
        organizationTeamService = { getOrgTeamMembershipOfUser: mockGetOrgTeamMembershipOfUser };
        verifyOwnerMoveDocument = DocumentService.prototype.verifyOwnerMoveDocument;
      })() as any;

      const result = await documentService.verifyOwnerMoveDocument(mockParams);
      expect(result).toBe(false);
    });

    it('should return true when moving from personal workspace to PERSONAL with only team membership', async () => {
      const mockParams = {
        actorId: 'user1',
        destinationId: 'org1',
        destinationType: 'PERSONAL' as any,
        personalWorkspaceAvailable: false,
        documentPermission: { workspace: null } as any,
      };
  
      const mockGetMembershipByOrgAndUser = jest.fn().mockResolvedValue(null);
      const mockGetOrgTeamMembershipOfUser = jest.fn().mockResolvedValue({ _id: 'teamMembership1' });
  
      documentService = new (class {
        organizationService = { getMembershipByOrgAndUser: mockGetMembershipByOrgAndUser };
        organizationTeamService = { getOrgTeamMembershipOfUser: mockGetOrgTeamMembershipOfUser };
        verifyOwnerMoveDocument = DocumentService.prototype.verifyOwnerMoveDocument;
      })() as any;
  
      const result = await documentService.verifyOwnerMoveDocument(mockParams);
      expect(result).toBe(true);
      expect(mockGetOrgTeamMembershipOfUser).toHaveBeenCalledWith('user1', 'org1');
    });
  
    it('should return false when not moving from personal workspace and not moving to personal workspace', async () => {
      const mockParams = {
        actorId: 'user1',
        destinationId: 'org1',
        destinationType: 'ORGANIZATION' as any,
        personalWorkspaceAvailable: true,
        documentPermission: { workspace: { refId: 'something' } } as any,
      };
  
      documentService = new (class {
        organizationService = { getMembershipByOrgAndUser: jest.fn() };
        organizationTeamService = { getOrgTeamMembershipOfUser: jest.fn() };
        verifyOwnerMoveDocument = DocumentService.prototype.verifyOwnerMoveDocument;
      })() as any;
  
      const result = await documentService.verifyOwnerMoveDocument(mockParams);
      expect(result).toBe(false);
    });
  });

  describe('filterDocumentsForOrgMove', () => {
    it('should filter out documents that are in organization doc stacks', async () => {
      const documents = [
        { _id: 'doc1', name: 'Document 1' },
        { _id: 'doc2', name: 'Document 2' },
        { _id: 'doc3', name: 'Document 3' }
      ] as any[];

      const mockGetOrgOfTeam = jest.fn().mockResolvedValue({ _id: 'org1' });
      const mockGetDocStackByOrgId = jest.fn().mockResolvedValue([
        { documentId: { toString: () => 'doc2' } },
        { documentId: { toString: () => 'doc4' } }
      ]);

      documentService = new (class {
        organizationTeamService = { getOrgOfTeam: mockGetOrgOfTeam };
        organizationDocStackService = { getDocStackByOrgId: mockGetDocStackByOrgId };
        filterDocumentsForOrgMove = DocumentService.prototype.filterDocumentsForOrgMove;
      })() as any;

      const result = await documentService.filterDocumentsForOrgMove({
        documents,
        destinationId: 'team1',
        destinationType: 'ORGANIZATION_TEAM' as any
      });

      expect(result).toHaveLength(2);
      expect(result[0]._id).toBe('doc1');
      expect(result[1]._id).toBe('doc3');
      expect(mockGetOrgOfTeam).toHaveBeenCalledWith('team1');
      expect(mockGetDocStackByOrgId).toHaveBeenCalledWith('org1');
    });

    it('should use destinationId directly when destinationType is ORGANIZATION', async () => {
      const documents = [{ _id: 'doc1', name: 'Document 1' }] as any[];

      const mockGetDocStackByOrgId = jest.fn().mockResolvedValue([]);

      documentService = new (class {
        organizationDocStackService = { getDocStackByOrgId: mockGetDocStackByOrgId };
        filterDocumentsForOrgMove = DocumentService.prototype.filterDocumentsForOrgMove;
      })() as any;

      const result = await documentService.filterDocumentsForOrgMove({
        documents,
        destinationId: 'org1',
        destinationType: 'ORGANIZATION' as any
      });

      expect(result).toHaveLength(1);
      expect(mockGetDocStackByOrgId).toHaveBeenCalledWith('org1');
    });
  });

  describe('verifyMoveDocumentsSize', () => {
    it('should return allowed when size is within limits', async () => {
      const documents = [{ _id: 'doc1', size: 1000 }] as any[];
      const mockGetOrgStatus = jest.fn().mockResolvedValue({ isPremium: true, isOverDocStack: false });
      const mockVerifyUploadFilesSize = jest.fn().mockReturnValue(true);

      documentService = new (class {
        getOrgStatus = mockGetOrgStatus;
        rateLimiterService = { verifyUploadFilesSize: mockVerifyUploadFilesSize };
        verifyMoveDocumentsSize = DocumentService.prototype.verifyMoveDocumentsSize;
      })() as any;

      const result = await documentService.verifyMoveDocumentsSize({
        documents,
        destinationId: 'org1',
        destinationType: 'ORGANIZATION' as any
      });

      expect(result.isAllowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return not allowed when size exceeds limits for free user', async () => {
      const documents = [{ _id: 'doc1', size: 1000000 }] as any[];
      const mockGetOrgStatus = jest.fn().mockResolvedValue({ isPremium: false, isOverDocStack: false });
      const mockVerifyUploadFilesSize = jest.fn().mockReturnValue(false);

      documentService = new (class {
        getOrgStatus = mockGetOrgStatus;
        rateLimiterService = { verifyUploadFilesSize: mockVerifyUploadFilesSize };
        verifyMoveDocumentsSize = DocumentService.prototype.verifyMoveDocumentsSize;
      })() as any;

      const result = await documentService.verifyMoveDocumentsSize({
        documents,
        destinationId: 'org1',
        destinationType: 'ORGANIZATION' as any
      });

      expect(result.isAllowed).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should throw error when over doc stack limit and not from mobile', async () => {
      const documents = [{ _id: 'doc1', size: 1000 }] as any[];
      const mockGetOrgStatus = jest.fn().mockResolvedValue({ isPremium: true, isOverDocStack: true });

      documentService = new (class {
        getOrgStatus = mockGetOrgStatus;
        verifyMoveDocumentsSize = DocumentService.prototype.verifyMoveDocumentsSize;
      })() as any;

      await expect(documentService.verifyMoveDocumentsSize({
        documents,
        destinationId: 'org1',
        destinationType: 'ORGANIZATION' as any,
        isRequestFromMobile: false
      })).rejects.toThrow();
    });

    it('should return not allowed with premium error when size exceeds limits for premium user', async () => {
      const documents = [{ _id: 'doc1', size: 5000000 }] as any[];
      const mockGetOrgStatus = jest.fn().mockResolvedValue({ isPremium: true, isOverDocStack: false });
      const mockVerifyUploadFilesSize = jest.fn().mockReturnValue(false);
  
      documentService = new (class {
        getOrgStatus = mockGetOrgStatus;
        rateLimiterService = { verifyUploadFilesSize: mockVerifyUploadFilesSize };
        verifyMoveDocumentsSize = DocumentService.prototype.verifyMoveDocumentsSize;
      })() as any;
  
      const result = await documentService.verifyMoveDocumentsSize({
        documents,
        destinationId: 'org1',
        destinationType: 'ORGANIZATION' as any,
      });
  
      expect(result.isAllowed).toBe(false);
      expect(result.error).toBeDefined();
    });  
  });

  describe('getPremiumDocumentMapping', () => {
    it('should return false for owner with premium organization (not using premium)', async () => {
      const documentPermission = {
        role: 'OWNER',
        workspace: { type: 'ORGANIZATION', refId: 'org1' }
      } as any;

      const mockGetOrgById = jest.fn().mockResolvedValue({ 
        _id: 'org1', 
        payment: { type: 'PREMIUM' } 
      });

      documentService = new (class {
        organizationService = { getOrgById: mockGetOrgById };
        getPremiumDocumentMapping = DocumentService.prototype.getPremiumDocumentMapping;
      })() as any;

      const result = await documentService.getPremiumDocumentMapping(documentPermission);
      expect(result).toBe(false);
    });

    it('should return false for owner with premium user (not using premium)', async () => {
      const documentPermission = {
        role: 'OWNER',
        refId: 'user1'
      } as any;

      const mockFindUserById = jest.fn().mockResolvedValue({ 
        _id: 'user1', 
        payment: { type: 'PREMIUM' } 
      });

      documentService = new (class {
        userService = { findUserById: mockFindUserById };
        getPremiumDocumentMapping = DocumentService.prototype.getPremiumDocumentMapping;
      })() as any;

      const result = await documentService.getPremiumDocumentMapping(documentPermission);
      expect(result).toBe(false);
    });

    it('should return false for owner with premium organization (not using premium)', async () => {
      const documentPermission = {
        role: DocumentRoleEnum.OWNER,
        workspace: { type: DocumentWorkspace.ORGANIZATION, refId: 'org1' }
      } as any;
  
      const mockGetOrgById = jest.fn().mockResolvedValue({
        _id: 'org1',
        payment: { type: 'PREMIUM' }
      });
  
      documentService = new (class {
        organizationService = { getOrgById: mockGetOrgById };
        getPremiumDocumentMapping = DocumentService.prototype.getPremiumDocumentMapping;
      })() as any;
  
      const result = await documentService.getPremiumDocumentMapping(documentPermission);
      expect(result).toBe(false);
    });
  
    it('should return true for owner with free organization (using free)', async () => {
      const documentPermission = {
        role: DocumentRoleEnum.OWNER,
        workspace: { type: DocumentWorkspace.ORGANIZATION, refId: 'org1' }
      } as any;
  
      const mockGetOrgById = jest.fn().mockResolvedValue({
        _id: 'org1',
        payment: { type: 'FREE' }
      });
  
      documentService = new (class {
        organizationService = { getOrgById: mockGetOrgById };
        getPremiumDocumentMapping = DocumentService.prototype.getPremiumDocumentMapping;
      })() as any;
  
      const result = await documentService.getPremiumDocumentMapping(documentPermission);
      expect(result).toBe(true);
    });
  
    it('should return false for owner with premium user (not using premium)', async () => {
      const documentPermission = {
        role: DocumentRoleEnum.OWNER,
        refId: 'user1'
      } as any;
  
      const mockFindUserById = jest.fn().mockResolvedValue({
        _id: 'user1',
        payment: { type: 'PREMIUM' }
      });
  
      documentService = new (class {
        userService = { findUserById: mockFindUserById };
        getPremiumDocumentMapping = DocumentService.prototype.getPremiumDocumentMapping;
      })() as any;
  
      const result = await documentService.getPremiumDocumentMapping(documentPermission);
      expect(result).toBe(false);
    });
  
    it('should return true for owner with free user (using free)', async () => {
      const documentPermission = {
        role: DocumentRoleEnum.OWNER,
        refId: 'user1'
      } as any;
  
      const mockFindUserById = jest.fn().mockResolvedValue({
        _id: 'user1',
        payment: { type: 'FREE' }
      });
  
      documentService = new (class {
        userService = { findUserById: mockFindUserById };
        getPremiumDocumentMapping = DocumentService.prototype.getPremiumDocumentMapping;
      })() as any;
  
      const result = await documentService.getPremiumDocumentMapping(documentPermission);
      expect(result).toBe(true);
    });
  
    it('should return true for organization role with free org', async () => {
      const documentPermission = {
        role: DocumentRoleEnum.ORGANIZATION,
        refId: 'org1'
      } as any;
  
      const mockGetOrgById = jest.fn().mockResolvedValue({
        _id: 'org1',
        payment: { type: 'FREE' }
      });
  
      documentService = new (class {
        organizationService = { getOrgById: mockGetOrgById };
        getPremiumDocumentMapping = DocumentService.prototype.getPremiumDocumentMapping;
      })() as any;
  
      const result = await documentService.getPremiumDocumentMapping(documentPermission);
      expect(result).toBe(true);
    });
  
    it('should return true for organization team role with free org', async () => {
      const documentPermission = {
        role: DocumentRoleEnum.ORGANIZATION_TEAM,
        refId: 'team1'
      } as any;
  
      const mockFindOneById = jest.fn().mockResolvedValue({ _id: 'team1', belongsTo: 'org1' });
      const mockGetOrgById = jest.fn().mockResolvedValue({
        _id: 'org1',
        payment: { type: 'FREE' }
      });
  
      documentService = new (class {
        teamService = { findOneById: mockFindOneById };
        organizationService = { getOrgById: mockGetOrgById };
        getPremiumDocumentMapping = DocumentService.prototype.getPremiumDocumentMapping;
      })() as any;
  
      const result = await documentService.getPremiumDocumentMapping(documentPermission);
      expect(result).toBe(true);
    });
  });
  
  describe('generateDocumentCursor', () => {
    it('should generate cursor from documents array', () => {
      const documents = [
        { _id: 'doc1', lastAccess: new Date('2023-01-01') },
        { _id: 'doc2', lastAccess: new Date('2023-01-02') }
      ] as any[];

      documentService = new (class {
        generateDocumentCursor = DocumentService.prototype.generateDocumentCursor;
      })() as any;

      const result = documentService.generateDocumentCursor(documents);
      expect(result).toBe('doc2:1672617600000');
    });

    it('should return empty string for empty documents array', () => {
      documentService = new (class {
        generateDocumentCursor = DocumentService.prototype.generateDocumentCursor;
      })() as any;

      const result = documentService.generateDocumentCursor([]);
      expect(result).toBe('');
    });
  });

  describe('splitDocumentCursor', () => {
    it('should handle cursor with multiple colons', () => {
      const cursor = 'doc:1:1672531200000';
      
      documentService = new (class {
        splitDocumentCursor = DocumentService.prototype.splitDocumentCursor;
      })() as any;

      const result = documentService.splitDocumentCursor(cursor);
      
      expect(result.documentIdCursor).toBe('doc');
      expect(result.lastAccessCursor).toBe('1');
    });
  });

  describe('getDocumentsUrl', () => {
    it('should return personal documents URL when no organization', async () => {
      const user = { _id: 'user1' } as any;
      
      documentService = new (class {
        getDocumentsUrl = DocumentService.prototype.getDocumentsUrl;
      })() as any;

      const result = await documentService.getDocumentsUrl(null, user);
      expect(result).toBe('/documents/personal');
    });

    it('should return URL with last accessed org when available', async () => {
      const organization = { _id: 'org1', url: 'test-org' } as any;
      const user = { _id: 'user1' } as any;
      const mockGetLastAccessedOrg = jest.fn().mockResolvedValue('last-org');

      documentService = new (class {
        userService = { getLastAccessedOrg: mockGetLastAccessedOrg };
        getDocumentsUrl = DocumentService.prototype.getDocumentsUrl;
      })() as any;

      const result = await documentService.getDocumentsUrl(organization, user);
      expect(result).toBe('/workspace/last-org/documents/personal');
    });

    it('should return URL with organization URL when no last accessed org', async () => {
      const organization = { _id: 'org1', url: 'test-org' } as any;
      const user = { _id: 'user1' } as any;
      const mockGetLastAccessedOrg = jest.fn().mockResolvedValue(null);

      documentService = new (class {
        userService = { getLastAccessedOrg: mockGetLastAccessedOrg };
        getDocumentsUrl = DocumentService.prototype.getDocumentsUrl;
      })() as any;

      const result = await documentService.getDocumentsUrl(organization, user);
      expect(result).toBe('/workspace/test-org/documents/personal');
    });
  });

  describe('createThirdPartyDocuments', () => {
    let documentService: any;
    const mockUser = { _id: '507f1f77bcf86cd799439011' };
    const mockOrg = { _id: 'org1' };
    const mockInputBase = {
      documents: [{ remoteId: 'r1', mimeType: 'application/pdf' }],
      clientId: 'client1',
      folderId: undefined,
    };
  
    beforeEach(() => {
      documentService = new (class {
        folderService = {
          getFolderPermissions: jest.fn(),
        };
        getDocumentByRemoteIds = jest.fn();
        handleUploadThirdPartyDocuments = jest.fn();
        handleReuploadThirdPartyDocuments = jest.fn();
        updateRecentDocumentsForThirdParty = jest.fn();
        getDocumentsUrl = jest.fn().mockResolvedValue('/docs-url');
        createThirdPartyDocuments = 
          (DocumentService.prototype as any).createThirdPartyDocuments;
      })();
    });
  
    it('should return error if mimeType is not supported', async () => {
      const input = { ...mockInputBase, documents: [{ remoteId: 'r1', mimeType: 'exe' }] };
      const result = await documentService.createThirdPartyDocuments(mockUser, input, mockOrg);
      expect(result.error.message).toContain('MimeType must be in');
    });
  
    it('should return error if folder workspace does not match organization', async () => {
      documentService.folderService.getFolderPermissions.mockResolvedValue([
        { workspace: { refId: { toHexString: () => 'wrongOrg' } } },
      ]);
      const input = { ...mockInputBase, folderId: '507f1f77bcf86cd799439012' };
      const result = await documentService.createThirdPartyDocuments(mockUser, input, mockOrg);
      expect(result.error.message).toContain('The folder is not associated');
    });
  
    it('should return error if folder has workspace but no organization passed', async () => {
      documentService.folderService.getFolderPermissions.mockResolvedValue([
        { workspace: { refId: { toHexString: () => 'org1' } } },
      ]);
      const input = { ...mockInputBase, folderId: '507f1f77bcf86cd799439012' };
      const result = await documentService.createThirdPartyDocuments(mockUser, input);
      expect(result.error.message).toContain('Reupload documents to a personal folder');
    });
  
    it('should upload new third-party documents', async () => {
      documentService.getDocumentByRemoteIds.mockResolvedValue([]);
      documentService.handleUploadThirdPartyDocuments.mockResolvedValue({
        documents: [{ _id: 'd1' }],
      });
      const result = await documentService.createThirdPartyDocuments(mockUser, mockInputBase, mockOrg);
      expect(result.documents).toEqual([{ _id: 'd1' }]);
    });
  
    it('should reupload existing documents when already present', async () => {
      documentService.getDocumentByRemoteIds.mockResolvedValue([{ remoteId: 'r1', _id: 'dExist' }]);
      documentService.handleReuploadThirdPartyDocuments.mockResolvedValue({
        documents: [{ _id: 'dReupload' }],
      });
      const result = await documentService.createThirdPartyDocuments(mockUser, mockInputBase, mockOrg);
      expect(result.documents[0]._id).toBe('dReupload');
    });
  
    it('should return error if reupload fails with no documents', async () => {
      documentService.getDocumentByRemoteIds.mockResolvedValue([{ remoteId: 'r1' }]);
      documentService.handleReuploadThirdPartyDocuments.mockResolvedValue({
        error: new Error('Reupload failed'),
        documents: [],
      });
      const result = await documentService.createThirdPartyDocuments(mockUser, mockInputBase, mockOrg);
      expect(result.error.message).toBe('Reupload failed');
    });
  
    it('should attach error if reupload fails but has documents', async () => {
      documentService.getDocumentByRemoteIds.mockResolvedValue([{ remoteId: 'r1' }]);
      documentService.handleReuploadThirdPartyDocuments.mockResolvedValue({
        error: new Error('Partial error'),
        documents: [{ _id: 'dReupload' }],
      });
      const result = await documentService.createThirdPartyDocuments(mockUser, mockInputBase, mockOrg);
      expect(result.error.message).toBe('Partial error');
      expect(result.documents[0]._id).toBe('dReupload');
    });

    it('should include folderId in inserted documents when folderId is provided', async () => {
      const mockUser = { _id: '507f1f77bcf86cd799439011' };
      const input = {
        documents: [{ remoteId: 'r1', mimeType: 'application/pdf' }],
        clientId: 'client1',
        folderId: '507f1f77bcf86cd799439012',
      };
    
      const mockGetDocs = jest.fn().mockResolvedValue([]);
      const mockHandleUpload = jest.fn().mockResolvedValue({ error: null, documents: [{ _id: 'doc1' }] });
      const mockGetFolderPermissions = jest.fn().mockResolvedValue([{ workspace: null }]);
    
      documentService = new (class {
        getDocumentByRemoteIds = mockGetDocs;
        handleUploadThirdPartyDocuments = mockHandleUpload;
        updateRecentDocumentsForThirdParty = jest.fn();
        getDocumentsUrl = jest.fn().mockResolvedValue('http://url');
        folderService = { getFolderPermissions: mockGetFolderPermissions };
        createThirdPartyDocuments = DocumentService.prototype.createThirdPartyDocuments;
      })() as any;
    
      const result = await documentService.createThirdPartyDocuments(mockUser, input);
    
      expect(mockHandleUpload).toHaveBeenCalledWith(expect.objectContaining({
        insertDocuments: expect.arrayContaining([
          expect.objectContaining({ folderId: input.folderId })
        ])
      }));
      expect(result.documents).toEqual([{ _id: 'doc1' }]);
    });
    
    it('should return error immediately if handleUploadThirdPartyDocuments fails', async () => {
      const mockUser = { _id: '507f1f77bcf86cd799439011' };
      const input = {
        documents: [{ remoteId: 'r1', mimeType: 'application/pdf' }],
        clientId: 'client1',
      };
    
      documentService = new (class {
        getDocumentByRemoteIds = jest.fn().mockResolvedValue([]);
        handleUploadThirdPartyDocuments = jest.fn().mockResolvedValue({ error: new Error('upload failed'), documents: [] });
        updateRecentDocumentsForThirdParty = jest.fn();
        getDocumentsUrl = jest.fn().mockResolvedValue('http://url');
        createThirdPartyDocuments = DocumentService.prototype.createThirdPartyDocuments;
      })() as any;
    
      const result = await documentService.createThirdPartyDocuments(mockUser, input);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.documents).toBeUndefined();
    });
    
    it('should handle remoteEmail with optional chaining', async () => {
      const mockUser = { _id: '507f1f77bcf86cd799439011' };
      const input = {
        documents: [
          { remoteId: 'r1', mimeType: 'application/pdf', remoteEmail: 'a@example.com' },
          { remoteId: 'r2', mimeType: 'application/pdf' }
        ],
        clientId: 'client1',
      };
      const existingDocs = [
        { _id: 'doc1', remoteId: 'r1' },
        { _id: 'doc2', remoteId: 'r2' }
      ];
    
      const mockGetDocs = jest.fn().mockResolvedValue(existingDocs);
      const mockHandleReupload = jest.fn().mockResolvedValue({
        error: null,
        documents: existingDocs
      });
    
      documentService = new (class {
        getDocumentByRemoteIds = mockGetDocs;
        handleReuploadThirdPartyDocuments = mockHandleReupload;
        updateRecentDocumentsForThirdParty = jest.fn();
        getDocumentsUrl = jest.fn().mockResolvedValue('http://url');
        createThirdPartyDocuments = DocumentService.prototype.createThirdPartyDocuments;
      })() as any;
    
      const result = await documentService.createThirdPartyDocuments(mockUser, input);
    
      expect(result.documents).toEqual(expect.arrayContaining([
        expect.objectContaining({ remoteId: 'r1', _id: 'doc1' }),
        expect.objectContaining({ remoteId: 'r2', _id: 'doc2' })
      ]));
    });

    it('should handle case when remoteEmail is undefined due to missing document match', async () => {
      const mockUser = { _id: '507f1f77bcf86cd799439011' };
      const input = {
        documents: [
          { remoteId: 'r1', mimeType: 'application/pdf' },
        ],
        clientId: 'client1',
      };
      const existingDocs = [
        { _id: 'docX', remoteId: 'rX' }
      ];
    
      const mockGetDocs = jest.fn().mockResolvedValue(existingDocs);
      const mockHandleUpload = jest.fn().mockResolvedValue({ error: null, documents: [] });
      const mockHandleReupload = jest.fn().mockResolvedValue({
        error: null,
        documents: existingDocs,
      });
    
      documentService = new (class {
        getDocumentByRemoteIds = mockGetDocs;
        handleUploadThirdPartyDocuments = mockHandleUpload;
        handleReuploadThirdPartyDocuments = mockHandleReupload;
        updateRecentDocumentsForThirdParty = jest.fn();
        getDocumentsUrl = jest.fn().mockResolvedValue('http://url');
        createThirdPartyDocuments = DocumentService.prototype.createThirdPartyDocuments;
      })() as any;
    
      const result = await documentService.createThirdPartyDocuments(mockUser, input);
    
      expect(mockHandleReupload).toHaveBeenCalledWith(
        expect.objectContaining({
          documents: expect.arrayContaining([
            expect.not.objectContaining({ remoteEmail: expect.anything() }),
          ]),
        })
      );
      expect(result.documents).toEqual(existingDocs);
    });    
  });

  describe('handleUploadThirdPartyDocuments', () => {
    let documentService: DocumentService;
    let mockLoggerService: any;
    let mockRedisService: any;
    let mockEventService: any;
  
    beforeEach(() => {
      mockLoggerService = { debug: jest.fn() };
      mockRedisService = { setThirdPartyAccessTokenForIndexing: jest.fn() };
      mockEventService = { createEvent: jest.fn() };
  
      documentService = new (class {
        createDocuments = jest.fn();
        createDocumentPermissions = jest.fn();
        publishUpdateDocument = jest.fn();
        loggerService = mockLoggerService;
        redisService = mockRedisService;
        eventService = mockEventService;
        handleUploadThirdPartyDocuments = DocumentService.prototype.handleUploadThirdPartyDocuments;
      })() as any;
    });
  
    it('should return error if createDocuments returns empty', async () => {
      const user = { _id: 'user1' } as any;
  
      (documentService.createDocuments as jest.Mock).mockResolvedValue([]);
  
      const result = await documentService.handleUploadThirdPartyDocuments({
        user,
        clientId: 'client1',
        folderId: 'folder1',
        insertDocuments: [],
      });
  
      expect(result.error).toBeDefined();
      expect(result.documents).toBeUndefined();
    });
  
    it('should return error if createDocumentPermissions returns empty', async () => {
      const user = { _id: 'user1', name: 'Test User', avatarRemoteId: 'avatar123' } as any;
      const insertDocuments = [{ name: 'doc1' }] as any;
      const createdDocuments = [{ _id: 'doc1' }] as any;
  
      (documentService.createDocuments as jest.Mock).mockResolvedValue(createdDocuments);
      (documentService.createDocumentPermissions as jest.Mock).mockResolvedValue([]);
  
      const result = await documentService.handleUploadThirdPartyDocuments({
        user,
        clientId: 'client1',
        folderId: 'folder1',
        insertDocuments,
      });
  
      expect(result.error).toBeDefined();
      expect(result.documents).toBeUndefined();
    });
  
    it('should skip setting third party token if not provided', async () => {
      const user = { _id: 'user1', name: 'Test User', avatarRemoteId: 'avatar123' } as any;
      const insertDocuments = [{ name: 'doc1' }] as any;
      const createdDocuments = [{ _id: 'doc1' }] as any;
      const createdDocumentPermissions = [{ _id: 'perm1' }] as any;
  
      (documentService.createDocuments as jest.Mock).mockResolvedValue(createdDocuments);
      (documentService.createDocumentPermissions as jest.Mock).mockResolvedValue(createdDocumentPermissions);
      (documentService.publishUpdateDocument as jest.Mock).mockImplementation(() => {});
  
      await documentService.handleUploadThirdPartyDocuments({
        user,
        clientId: 'client1',
        folderId: 'folder1',
        insertDocuments,
      });
  
      expect(mockRedisService.setThirdPartyAccessTokenForIndexing).not.toHaveBeenCalled();
    });
  });

  describe('handleReuploadThirdPartyDocuments', () => {
    let documentService: DocumentService;
    it('should handle same place documents correctly', async () => {
      const user = { _id: '507f1f77bcf86cd799439011', name: 'Test User' } as any;
      const documents = [
        { _id: 'doc1', remoteId: 'remote1', service: 'google', folderId: null },
        { _id: 'doc2', remoteId: 'remote2', service: 'dropbox', folderId: '507f1f77bcf86cd799439012' }
      ] as any[];
      const folderId = '507f1f77bcf86cd799439012';
      const organization = { _id: '507f1f77bcf86cd799439013' } as any;
      const uploadDocuments = [] as any[];
      const documentsResult = [] as any[];

      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue([
        {
          documentId: 'doc1',
          workspace: { refId: { toHexString: () => '507f1f77bcf86cd799439013' } }
        },
        {
          documentId: 'doc2',
          workspace: { refId: { toHexString: () => '507f1f77bcf86cd799439013' } }
        }
      ]);
      const mockUpdateDocumentByIds = jest.fn().mockResolvedValue(undefined);
      const mockUpdateManyDocumentPermission = jest.fn().mockResolvedValue(undefined);
      const mockPublishEventDeleteDocumentToInvididual = jest.fn();
      const mockPublishUpdateDocument = jest.fn();
      const mockLoggerService = { debug: jest.fn() };

      documentService = new (class {
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        updateDocumentByIds = mockUpdateDocumentByIds;
        updateManyDocumentPermission = mockUpdateManyDocumentPermission;
        publishEventDeleteDocumentToInvididual = mockPublishEventDeleteDocumentToInvididual;
        publishUpdateDocument = mockPublishUpdateDocument;
        loggerService = mockLoggerService;
        handleReuploadThirdPartyDocuments = DocumentService.prototype.handleReuploadThirdPartyDocuments;
      })() as any;

      const result = await documentService.handleReuploadThirdPartyDocuments({
        user,
        documents,
        folderId,
        organization,
        uploadDocuments,
        documentsResult
      });

      expect(result.documents).toHaveLength(2);
      expect(mockUpdateDocumentByIds).toHaveBeenCalled();
      expect(mockPublishEventDeleteDocumentToInvididual).toHaveBeenCalled();
      expect(mockPublishUpdateDocument).toHaveBeenCalled();
    });

    it('should return error when some documents have wrong service', async () => {
      const user = { _id: '507f1f77bcf86cd799439011', name: 'Test User' } as any;
      const documents = [
        { _id: 'doc1', remoteId: 'remote1', service: 'google' },
        { _id: 'doc2', remoteId: 'remote2', service: 'dropbox' }
      ] as any[];
      const uploadDocuments = [
        { remoteId: 'remote1', service: 'google' },
        { remoteId: 'remote2', service: 'google' }
      ] as any[];
      const documentsResult = [] as any[];

      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue([
        {
          documentId: 'doc1',
          workspace: { refId: { toHexString: () => '507f1f77bcf86cd799439013' } }
        },
        {
          documentId: 'doc2',
          workspace: { refId: { toHexString: () => '507f1f77bcf86cd799439013' } }
        }
      ]);
      const mockUpdateDocumentByIds = jest.fn().mockResolvedValue(undefined);
      const mockUpdateManyDocumentPermission = jest.fn().mockResolvedValue(undefined);
      const mockPublishEventDeleteDocumentToInvididual = jest.fn();
      const mockPublishUpdateDocument = jest.fn();
      const mockLoggerService = { debug: jest.fn() };

      documentService = new (class {
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        updateDocumentByIds = mockUpdateDocumentByIds;
        updateManyDocumentPermission = mockUpdateManyDocumentPermission;
        publishEventDeleteDocumentToInvididual = mockPublishEventDeleteDocumentToInvididual;
        publishUpdateDocument = mockPublishUpdateDocument;
        loggerService = mockLoggerService;
        handleReuploadThirdPartyDocuments = DocumentService.prototype.handleReuploadThirdPartyDocuments;
      })() as any;

      const result = await documentService.handleReuploadThirdPartyDocuments({
        user,
        documents,
        folderId: '507f1f77bcf86cd799439012',
        organization: { _id: '507f1f77bcf86cd799439013', name: 'Test Org', createdAt: new Date(), avatarRemoteId: 'avatar1', ownerId: '507f1f77bcf86cd799439011' } as any,
        uploadDocuments,
        documentsResult
      });

      expect(result.error).toBeDefined();
      expect(result.error.toString()).toContain('Some documents have wrong service');
    });    

    it('should log debug when document permission is not found', async () => {
      const user = { _id: '507f1f77bcf86cd799439011', name: 'Test User' } as any;
      const documents = [{ _id: 'doc1', remoteId: 'remote1', service: 'google', folderId: null }] as any[];
      const folderId = '';
      const organization = undefined;
    
      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue([]);
    
      const mockLoggerService = { debug: jest.fn() };
    
      documentService = new (class {
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        updateDocumentByIds = jest.fn().mockResolvedValue(undefined);
        updateManyDocumentPermission = jest.fn().mockResolvedValue(undefined);
        publishEventDeleteDocumentToInvididual = jest.fn();
        publishUpdateDocument = jest.fn();
        loggerService = mockLoggerService;
        handleReuploadThirdPartyDocuments = DocumentService.prototype.handleReuploadThirdPartyDocuments;
      })() as any;
    
      await documentService.handleReuploadThirdPartyDocuments({
        user, documents, folderId, organization, uploadDocuments: [], documentsResult: []
      });
    
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Document permission not found',
        expect.objectContaining({ context: 'handleReuploadThirdPartyDocuments' })
      );
    });   

    it('should unset workspace when organization is undefined', async () => {
      const user = { _id: '507f1f77bcf86cd799439011', name: 'Test User' } as any;
      const documents = [{ _id: 'doc1', remoteId: 'remote1', service: 'google', folderId: null }] as any[];
      const folderId = '507f1f77bcf86cd799439012';
      const uploadDocuments = [] as any[];
      const documentsResult = [] as any[];
    
      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue([
        {
          documentId: 'doc1',
          workspace: { refId: { toHexString: () => '507f1f77bcf86cd799439013' } }
        }
      ]);
    
      const mockUpdateDocumentByIds = jest.fn().mockResolvedValue(undefined);
      const mockUpdateManyDocumentPermission = jest.fn().mockResolvedValue(undefined);
    
      documentService = new (class {
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        updateDocumentByIds = mockUpdateDocumentByIds;
        updateManyDocumentPermission = mockUpdateManyDocumentPermission;
        publishEventDeleteDocumentToInvididual = jest.fn();
        publishUpdateDocument = jest.fn();
        loggerService = { debug: jest.fn() };
        handleReuploadThirdPartyDocuments = DocumentService.prototype.handleReuploadThirdPartyDocuments;
      })() as any;
    
      await documentService.handleReuploadThirdPartyDocuments({
        user,
        documents,
        folderId,
        organization: undefined,
        uploadDocuments,
        documentsResult,
      });
    
      expect(mockUpdateManyDocumentPermission).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          $unset: { workspace: 1 }
        })
      );
    });
  });

  describe('getBelongsTo', () => {
    it('should return personal document belongs to', async () => {
      const document = { _id: 'doc1', isPersonal: true, ownerId: 'user1' } as any;
      const user = { _id: 'user1', name: 'Test User' };
      const docPermission = { workspace: { refId: { toHexString: () => 'workspace1' } } };
      const mockFindUserById = jest.fn().mockResolvedValue(user);
      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue([docPermission]);

      documentService = new (class {
        userService = { findUserById: mockFindUserById };
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        getBelongsTo = DocumentService.prototype.getBelongsTo;
      })() as any;

      const result = await documentService.getBelongsTo(document);

      expect(result).toEqual({
        type: 'PERSONAL',
        location: user,
        workspaceId: docPermission.workspace.refId
      });
    });

    it('should return organization team document belongs to', async () => {
      const document = { _id: 'doc1', isPersonal: false } as any;
      const docPermission = { role: 'ORGANIZATION_TEAM', refId: 'team1' };
      const team = { _id: 'team1', name: 'Test Team', belongsTo: 'org1', avatarRemoteId: 'avatar1' };
      const org = { _id: 'org1', url: 'test-org' };

      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue([docPermission]);
      const mockFindOneById = jest.fn().mockResolvedValue(team);
      const mockGetOrgById = jest.fn().mockResolvedValue(org);

      documentService = new (class {
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        teamService = { findOneById: mockFindOneById };
        organizationService = { getOrgById: mockGetOrgById };
        getBelongsTo = DocumentService.prototype.getBelongsTo;
      })() as any;

      const result = await documentService.getBelongsTo(document);

      expect(mockGetDocumentPermissionByConditions).toHaveBeenCalledWith({
        documentId: 'doc1',
        role: { $in: ['organization', 'organization_team'] }
      });
      expect(result).toBeNull();
    });

    it('should return personal document belongs to with workspace', async () => {
      const document = { _id: 'doc1', isPersonal: true, ownerId: 'user1' } as any;
      const user = { _id: 'user1', name: 'Test User' };
      const docPermission = { workspace: { refId: 'workspace1' } };
  
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(user) };
      documentService.getDocumentPermissionByConditions = jest.fn().mockResolvedValue([docPermission]);
  
      const result = await documentService.getBelongsTo(document);
  
      expect(result).toEqual({
        type: 'PERSONAL',
        location: user,
        workspaceId: 'workspace1',
      });
    });

    it('should return personal document belongs to without workspace', async () => {
      const document = { _id: 'doc2', isPersonal: true, ownerId: 'user2' } as any;
      const user = { _id: 'user2', name: 'Test User 2' };
  
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(user) };
      documentService.getDocumentPermissionByConditions = jest.fn().mockResolvedValue([{}]);
  
      const result = await documentService.getBelongsTo(document);
  
      expect(result).toEqual({
        type: 'PERSONAL',
        location: user,
        workspaceId: undefined,
      });
    });

    it('should return personal document belongs to when docPerm is undefined', async () => {
      const document = { _id: 'doc3', isPersonal: true, ownerId: 'user3' } as any;
      const user = { _id: 'user3', name: 'Test User 3' };
    
      (documentService as any).userService = { findUserById: jest.fn().mockResolvedValue(user) };
      documentService.getDocumentPermissionByConditions = jest.fn().mockResolvedValue([]);
    
      const result = await documentService.getBelongsTo(document);
    
      expect(result).toEqual({
        type: 'PERSONAL',
        location: user,
        workspaceId: undefined,
      });
    });

    it('should cover optional chaining in ORGANIZATION_TEAM when org is undefined', async () => {
      const document = { _id: 'doc7', isPersonal: false } as any;
      const docPermission = { role: DocumentRoleEnum.ORGANIZATION_TEAM, refId: 'team789' };
      const team = { _id: 'team789', name: 'Team 789', belongsTo: 'org789', avatarRemoteId: 'avatar789' };
    
      documentService.getDocumentPermissionByConditions = jest.fn().mockResolvedValue([docPermission]);
      (documentService as any).teamService = { findOneById: jest.fn().mockResolvedValue(team) };
      (documentService as any).organizationService = { getOrgById: jest.fn().mockResolvedValue(undefined) };
    
      const result = await documentService.getBelongsTo(document);
    
      expect(result).toEqual({
        type: 'ORGANIZATION_TEAM',
        location: {
          _id: team._id,
          name: team.name,
          url: undefined,
          ownedOrgId: undefined,
          avatarRemoteId: team.avatarRemoteId,
        },
      });
    });
    
    it('should return organization team document belongs to', async () => {
      const document = { _id: 'doc4', isPersonal: false } as any;
      const docPermission = { role: DocumentRoleEnum.ORGANIZATION_TEAM, refId: 'team123' };
      const team = { _id: 'team123', name: 'Team 123', belongsTo: 'org123', avatarRemoteId: 'avatar123' };
      const org = {};
    
      documentService.getDocumentPermissionByConditions = jest.fn().mockResolvedValue([docPermission]);
      (documentService as any).teamService = { findOneById: jest.fn().mockResolvedValue(team) };
      (documentService as any).organizationService = { getOrgById: jest.fn().mockResolvedValue(org) };
    
      const result = await documentService.getBelongsTo(document);
    
      expect(result).toEqual({
        type: 'ORGANIZATION_TEAM',
        location: {
          _id: team._id,
          name: team.name,
          url: undefined,
          ownedOrgId: undefined,
          avatarRemoteId: team.avatarRemoteId,
        },
      });
    });

    it('should return organization document belongs to', async () => {
      const document = { _id: 'doc5', isPersonal: false } as any;
      const docPermission = { role: DocumentRoleEnum.ORGANIZATION, refId: 'org123' };
      const org = { _id: 'org123', name: 'Org 123', url: 'org123-url', avatarRemoteId: 'avatarOrg' };
    
      documentService.getDocumentPermissionByConditions = jest.fn().mockResolvedValue([docPermission]);
      (documentService as any).organizationService = { getOrgById: jest.fn().mockResolvedValue(org) };
    
      const result = await documentService.getBelongsTo(document);
    
      expect(result).toEqual({
        type: 'ORGANIZATION',
        location: {
          ...org,
          _id: 'org123',
        },
      });
    });  
  });

  describe('getOrgMemberDocumentPermission', () => {
    it('should return SHARER for org manager', () => {
      const params = {
        documentPermission: {} as any,
        role: 'ORGANIZATION_ADMIN' as any,
        userId: 'user1',
        documentOwnerId: 'owner1'
      };

      const result = DocumentService.prototype.getOrgMemberDocumentPermission.call(documentService, params);
      expect(result).toBe('sharer');
    });

    it('should return default permission for org member', () => {
      const params = {
        documentPermission: { defaultPermission: { member: 'viewer' } } as any,
        role: 'MEMBER' as any,
        userId: 'user1',
        documentOwnerId: 'owner1'
      };

      const result = DocumentService.prototype.getOrgMemberDocumentPermission.call(documentService, params);
      expect(result).toBe('sharer');
    });

    it('should handle undefined userId when checking document owner', () => {
      const params = {
        documentPermission: {} as any,
        role: 'MEMBER' as any,
        userId: undefined,
        documentOwnerId: 'owner1'
      };
    
      const result = DocumentService.prototype.getOrgMemberDocumentPermission.call(documentService, params);
      expect(result).toBe(DEFAULT_ORG_MEMBER_DOCUMENT_PERMISSION);
    });

    it('should return defaultPermission.member for org member', () => {
      const params = {
        documentPermission: { defaultPermission: { member: 'viewer' } } as any,
        role: 'MEMBER' as any,
        userId: 'user2',
        documentOwnerId: 'owner1'
      };
    
      const result = DocumentService.prototype.getOrgMemberDocumentPermission.call(documentService, params);
      expect(result).toBe('sharer');
    });
    
    it('should return groupPermissions value if exists', () => {
      const params = {
        documentPermission: { groupPermissions: { user1: 'editor' } } as any,
        role: 'MEMBER' as any,
        userId: 'user1',
        documentOwnerId: 'owner1'
      };
    
      const result = DocumentService.prototype.getOrgMemberDocumentPermission.call(documentService, params);
      expect(result).toBe('editor');
    });

    it('should return SHARER for org manager role', () => {
      const params = {
        documentPermission: {} as any,
        role: OrganizationRoleEnums.ORGANIZATION_ADMIN,
        userId: 'user1',
        documentOwnerId: 'owner1'
      };
    
      const result = DocumentService.prototype.getOrgMemberDocumentPermission.call(documentService, params);
      expect(result).toBe(DocumentPermissionOfMemberEnum.SHARER);
    }); 

    it('should handle undefined documentPermission safely', () => {
      const params = {
        documentPermission: undefined,
        role: OrganizationRoleEnums.MEMBER,
        userId: 'user4',
        documentOwnerId: 'owner2',
      };
      const result = DocumentService.prototype.getOrgMemberDocumentPermission.call(documentService, params);
      expect(result).toBe(DEFAULT_ORG_MEMBER_DOCUMENT_PERMISSION);
    });

    it('should handle undefined userId safely', () => {
      const params = {
        documentPermission: {},
        role: OrganizationRoleEnums.MEMBER,
        userId: undefined,
        documentOwnerId: 'owner2',
      };
      const result = DocumentService.prototype.getOrgMemberDocumentPermission.call(documentService, params);
      expect(result).toBe(DEFAULT_ORG_MEMBER_DOCUMENT_PERMISSION);
    });

    it('should return DEFAULT_ORG_DOCUMENT_OWNER_PERMISSION for document owner', () => {
      const params = {
        documentPermission: {} as any,
        role: OrganizationRoleEnums.MEMBER,
        userId: 'owner1',
        documentOwnerId: 'owner1',
      };
      const result = DocumentService.prototype.getOrgMemberDocumentPermission.call(documentService, params);
      expect(result).toBe(DEFAULT_ORG_DOCUMENT_OWNER_PERMISSION);
    });

    it('should return defaultPermission.member for org member', () => {
      const params = {
        documentPermission: { defaultPermission: { member: 'viewer' } } as any,
        role: OrganizationRoleEnums.MEMBER,
        userId: 'user2',
        documentOwnerId: 'owner2',
      };
      const result = DocumentService.prototype.getOrgMemberDocumentPermission.call(documentService, params);
      expect(result).toBe('viewer');
    });
  });

  describe('getTeamMemberDocumentPermission', () => {
    it('should return SHARER for team admin', () => {
      const params = {
        documentPermission: {} as any,
        role: OrganizationTeamRoles.ADMIN,
        userId: 'user1',
        documentOwnerId: 'owner1',
      };
      const result = DocumentService.prototype.getTeamMemberDocumentPermission.call(documentService, params);
      expect(result).toBe(DocumentPermissionOfMemberEnum.SHARER);
    });
  
    it('should return DEFAULT_TEAM_DOCUMENT_OWNER_PERMISSION for document owner', () => {
      const params = {
        documentPermission: {} as any,
        role: OrganizationTeamRoles.MEMBER,
        userId: 'owner1',
        documentOwnerId: 'owner1',
      };
      const result = DocumentService.prototype.getTeamMemberDocumentPermission.call(documentService, params);
      expect(result).toBe(DEFAULT_TEAM_DOCUMENT_OWNER_PERMISSION);
    });
  
    it('should return groupPermissions value if exists', () => {
      const params = {
        documentPermission: { groupPermissions: { user1: 'editor' } } as any,
        role: OrganizationTeamRoles.MEMBER,
        userId: 'user1',
        documentOwnerId: 'owner2',
      };
      const result = DocumentService.prototype.getTeamMemberDocumentPermission.call(documentService, params);
      expect(result).toBe('editor');
    });
  
    it('should return defaultPermission.member for team member', () => {
      const params = {
        documentPermission: { defaultPermission: { member: 'viewer' } } as any,
        role: OrganizationTeamRoles.MEMBER,
        userId: 'user2',
        documentOwnerId: 'owner2',
      };
      const result = DocumentService.prototype.getTeamMemberDocumentPermission.call(documentService, params);
      expect(result).toBe('viewer');
    });
  
    it('should return DEFAULT_TEAM_MEMBER_DOCUMENT_PERMISSION if no other matches', () => {
      const params = {
        documentPermission: {},
        role: OrganizationTeamRoles.MEMBER,
        userId: 'user3',
        documentOwnerId: 'owner2',
      };
      const result = DocumentService.prototype.getTeamMemberDocumentPermission.call(documentService, params);
      expect(result).toBe(DEFAULT_TEAM_MEMBER_DOCUMENT_PERMISSION);
    });
  
    it('should handle undefined userId safely', () => {
      const params = {
        documentPermission: {},
        role: OrganizationTeamRoles.MEMBER,
        userId: undefined,
        documentOwnerId: 'owner2',
      };
      const result = DocumentService.prototype.getTeamMemberDocumentPermission.call(documentService, params);
      expect(result).toBe(DEFAULT_TEAM_MEMBER_DOCUMENT_PERMISSION);
    });
  });
  
  describe('broadcastUploadDocument', () => {
    it('should broadcast personal document upload', async () => {
      const document = { _id: 'doc1', lastAccess: new Date(), createdAt: new Date() } as any;
      const mockPublishUpdateDocument = jest.fn();

      documentService = new (class {
        publishUpdateDocument = mockPublishUpdateDocument;
        broadcastUploadDocument = DocumentService.prototype.broadcastUploadDocument;
      })() as any;

      await documentService.broadcastUploadDocument({
        document,
        location: 'PERSONAL' as any,
        receiverId: 'user1'
      });

      expect(mockPublishUpdateDocument).toHaveBeenCalledWith(
        ['user1'],
        expect.objectContaining({
          document: expect.any(Object),
          type: 'subcription_upload_document_personal'
        }),
        'updateDocumentList'
      );
    });

    it('should broadcast organization document upload', async () => {
      const document = { _id: 'doc1', lastAccess: new Date(), createdAt: new Date() } as any;
      const orgMembers = [{ userId: { toHexString: () => 'user1' } }];
      const mockPublishUpdateDocument = jest.fn();
      const mockGetMembersByOrgId = jest.fn().mockResolvedValue(orgMembers);

      documentService = new (class {
        publishUpdateDocument = mockPublishUpdateDocument;
        organizationService = { getMembersByOrgId: mockGetMembersByOrgId };
        broadcastUploadDocument = DocumentService.prototype.broadcastUploadDocument;
      })() as any;

      await documentService.broadcastUploadDocument({
        document,
        location: 'ORGANIZATION' as any,
        receiverId: 'org1'
      });

      expect(mockPublishUpdateDocument).toHaveBeenCalledWith(
        ['user1'],
        expect.objectContaining({
          type: 'subcription_upload_document_organization',
          organizationId: 'org1'
        }),
        'updateDocumentList'
      );
    });

    it('should broadcast organization team document upload', async () => {
      const document = { _id: 'doc1', lastAccess: new Date(), createdAt: new Date() } as any;
      const teamMembers = [{ userId: { toHexString: () => 'user1' } }];
      const mockPublishUpdateDocument = jest.fn();
      const mockFindTeamMembers = jest.fn().mockResolvedValue(teamMembers);
    
      documentService = new (class {
        publishUpdateDocument = mockPublishUpdateDocument;
        membershipService = { find: mockFindTeamMembers };
        broadcastUploadDocument = DocumentService.prototype.broadcastUploadDocument;
      })() as any;
    
      await documentService.broadcastUploadDocument({
        document,
        location: 'ORGANIZATION_TEAM' as any,
        receiverId: 'team1',
      });
    
      expect(mockFindTeamMembers).toHaveBeenCalledWith({ teamId: 'team1' }, { userId: 1 });
      expect(mockPublishUpdateDocument).toHaveBeenCalledWith(
        ['user1'],
        expect.objectContaining({
          type: 'subcription_upload_document_teams',
          teamId: 'team1',
        }),
        'updateDocumentList'
      );
    });

    it('should not broadcast if location is unknown', async () => {
      const document = { _id: 'doc1', lastAccess: new Date(), createdAt: new Date() } as any;
      const mockPublishUpdateDocument = jest.fn();
    
      documentService = new (class {
        publishUpdateDocument = mockPublishUpdateDocument;
        broadcastUploadDocument = DocumentService.prototype.broadcastUploadDocument;
      })() as any;
    
      await documentService.broadcastUploadDocument({
        document,
        location: 'UNKNOWN' as any,
        receiverId: 'receiver1',
      });
    
      expect(mockPublishUpdateDocument).toHaveBeenCalledWith([], { document: expect.any(Object) }, 'updateDocumentList');
    });    
  });

  describe('getMemberDocumentRole', () => {
    let documentService: any;

    beforeEach(() => {
      documentService = new (class {
        organizationService = { getMembershipByOrgAndUser: jest.fn() };
        membershipService = { findOne: jest.fn() };
        getOrgMemberDocumentPermission = jest.fn();
        getTeamMemberDocumentPermission = jest.fn();
        getMemberDocumentRole = DocumentService.prototype.getMemberDocumentRole;
      })();
    });

    it('should return OWNER for document owner', async () => {
      const params = {
        documentPermission: { role: DocumentRoleEnum.OWNER, refId: { toHexString: () => 'user1' } } as any,
        userId: 'user1',
        document: {} as any,
      };
  
      const result = await documentService.getMemberDocumentRole(params);
      expect(result).toBe('OWNER');
    });

    it('should return org member permission for organization document', async () => {
      const params = {
        documentPermission: { role: DocumentRoleEnum.ORGANIZATION, refId: 'org1' } as any,
        userId: 'user1',
        document: { ownerId: 'owner1' } as any,
      };
  
      const orgMembership = { role: OrganizationRoleEnums.MEMBER };
      const permission = DocumentPermissionOfMemberEnum.VIEWER;
  
      documentService.organizationService.getMembershipByOrgAndUser.mockResolvedValue(orgMembership);
      documentService.getOrgMemberDocumentPermission.mockReturnValue(permission);
  
      const result = await documentService.getMemberDocumentRole(params);
      expect(documentService.organizationService.getMembershipByOrgAndUser).toHaveBeenCalledWith('org1', 'user1');
      expect(documentService.getOrgMemberDocumentPermission).toHaveBeenCalledWith({
        documentPermission: params.documentPermission,
        role: OrganizationRoleEnums.MEMBER,
        userId: 'user1',
        documentOwnerId: 'owner1',
      });
      expect(result).toBe(permission);
    });

    it('should return team member permission for organization team document', async () => {
      const params = {
        documentPermission: { role: DocumentRoleEnum.ORGANIZATION_TEAM, refId: 'team1' } as any,
        userId: 'user1',
        document: { ownerId: 'owner1' } as any,
      };
    
      const teamMembership = { role: 'LEADER' };
      const permission = 'EDITOR';
    
      documentService.membershipService.findOne = jest.fn().mockResolvedValue(teamMembership);
      documentService.getTeamMemberDocumentPermission = jest.fn().mockReturnValue(permission);
    
      const result = await documentService.getMemberDocumentRole(params);
    
      expect(documentService.membershipService.findOne).toHaveBeenCalledWith({ userId: 'user1', teamId: 'team1' });
      expect(documentService.getTeamMemberDocumentPermission).toHaveBeenCalledWith({
        documentPermission: params.documentPermission,
        role: 'LEADER',
        userId: 'user1',
        documentOwnerId: 'owner1',
      });
      expect(result).toBe(permission);
    });

    it('should return OWNER for document owner', async () => {
      const params = {
        documentPermission: { role: 'OWNER', refId: { toHexString: () => 'user1' } } as any,
        userId: 'user1',
        document: {} as any
      };

      const result = await DocumentService.prototype.getMemberDocumentRole.call(documentService, params);
      expect(result).toBe('');
    });

    it('should return org member permission', async () => {
      const params = {
        documentPermission: { role: 'ORGANIZATION', refId: 'org1' } as any,
        userId: 'user1',
        document: { ownerId: 'owner1' } as any
      };
      const membership = { role: 'MEMBER' };

      const mockGetMembershipByOrgAndUser = jest.fn().mockResolvedValue(membership);
      const mockGetOrgMemberDocumentPermission = jest.fn().mockReturnValue('viewer');

      documentService = new (class {
        organizationService = { getMembershipByOrgAndUser: mockGetMembershipByOrgAndUser };
        getOrgMemberDocumentPermission = mockGetOrgMemberDocumentPermission;
        getMemberDocumentRole = DocumentService.prototype.getMemberDocumentRole;
      })() as any;

      const result = await documentService.getMemberDocumentRole(params);
      expect(result).toBe('');
    });

    it('should hit OWNER case but not return if user is not owner', async () => {
      const params = {
        documentPermission: { role: DocumentRoleEnum.OWNER, refId: { toHexString: () => 'user2' } } as any,
        userId: 'user1',
        document: {} as any,
      };
    
      const result = await documentService.getMemberDocumentRole(params);
      expect(result).toBe('');
    });
    
    it('should hit ORGANIZATION case but return empty if no org membership', async () => {
      const params = {
        documentPermission: { role: DocumentRoleEnum.ORGANIZATION, refId: 'org1' } as any,
        userId: 'user1',
        document: { ownerId: 'owner1' } as any,
      };
    
      documentService.organizationService.getMembershipByOrgAndUser.mockResolvedValue(null);
    
      const result = await documentService.getMemberDocumentRole(params);
      expect(documentService.organizationService.getMembershipByOrgAndUser).toHaveBeenCalledWith('org1', 'user1');
      expect(result).toBe('');
    });

    it('should hit ORGANIZATION_TEAM case but return empty if no team membership', async () => {
      const params = {
        documentPermission: { role: DocumentRoleEnum.ORGANIZATION_TEAM, refId: 'team1' } as any,
        userId: 'user1',
        document: { ownerId: 'owner1' } as any,
      };
    
      documentService.membershipService.findOne.mockResolvedValue(null);
    
      const result = await documentService.getMemberDocumentRole(params);
      expect(documentService.membershipService.findOne).toHaveBeenCalledWith({ userId: 'user1', teamId: 'team1' });
      expect(result).toBe('');
    });
  });

  describe('checkExistedDocPermission', () => {
    let documentService: any;

    beforeEach(() => {
      documentService = new (class {
        getDocumentPermissionsByDocId = jest.fn();
        organizationService = { getMembershipByOrgAndUser: jest.fn() };
        membershipService = { findOne: jest.fn() };
        getOrgMemberDocumentPermission = jest.fn();
        getTeamMemberDocumentPermission = jest.fn();
        checkExistedDocPermission = DocumentService.prototype.checkExistedDocPermission;
      })();
    });

    it('should return external permission if exists', async () => {
      const userId = 'user1';
      const document = { _id: 'doc1', ownerId: 'owner1' } as any;
      const externalPermission = { role: 'VIEWER', refId: 'user1' };

      const mockGetDocumentPermissionsByDocId = jest.fn()
        .mockResolvedValueOnce([externalPermission])
        .mockResolvedValueOnce([]);

      documentService = new (class {
        getDocumentPermissionsByDocId = mockGetDocumentPermissionsByDocId;
        checkExistedDocPermission = DocumentService.prototype.checkExistedDocPermission;
      })() as any;

      const result = await documentService.checkExistedDocPermission(userId, document);

      expect(result).toEqual({
        hasPermission: true,
        permissionType: 'PERSONAL',
        role: 'VIEWER',
        refId: 'user1'
      });
    });

    it('should return no permission when no internal permission', async () => {
      const userId = 'user1';
      const document = { _id: 'doc1', ownerId: 'owner1' } as any;

      const mockGetDocumentPermissionsByDocId = jest.fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      documentService = new (class {
        getDocumentPermissionsByDocId = mockGetDocumentPermissionsByDocId;
        checkExistedDocPermission = DocumentService.prototype.checkExistedDocPermission;
      })() as any;

      const result = await documentService.checkExistedDocPermission(userId, document);

      expect(result).toEqual({
        hasPermission: false,
        permissionType: 'PERSONAL',
        role: null,
        refId: null
      });
    });

    it('should return organization permission when internalPermission.role is ORGANIZATION', async () => {
      const userId = 'user1';
      const document = { _id: 'doc1', ownerId: 'owner1' } as any;
  
      const internalPermission = { role: DocumentRoleEnum.ORGANIZATION, refId: 'org1' };
  
      documentService.getDocumentPermissionsByDocId.mockResolvedValueOnce([])
        .mockResolvedValueOnce([internalPermission]);
  
      const membership = { role: 'MEMBER' };
      documentService.organizationService.getMembershipByOrgAndUser.mockResolvedValue(membership);
      documentService.getOrgMemberDocumentPermission.mockReturnValue('VIEWER');
  
      const result = await documentService.checkExistedDocPermission(userId, document);
  
      expect(documentService.organizationService.getMembershipByOrgAndUser)
        .toHaveBeenCalledWith('org1', 'user1');
      expect(documentService.getOrgMemberDocumentPermission).toHaveBeenCalledWith({
        documentPermission: internalPermission,
        role: 'MEMBER',
        userId: 'user1',
        documentOwnerId: 'owner1',
      });
      expect(result).toEqual({
        hasPermission: true,
        permissionType: DocumentOwnerTypeEnum.ORGANIZATION,
        membershipRole: 'MEMBER',
        role: 'VIEWER',
        refId: 'org1',
      });
    });
  
    it('should return team permission when internalPermission.role is ORGANIZATION_TEAM', async () => {
      const userId = 'user1';
      const document = { _id: 'doc1', ownerId: 'owner1' } as any;
  
      const internalPermission = { role: DocumentRoleEnum.ORGANIZATION_TEAM, refId: 'team1' };
  
      documentService.getDocumentPermissionsByDocId.mockResolvedValueOnce([])
        .mockResolvedValueOnce([internalPermission]);
  
      const membership = { role: 'LEADER' };
      documentService.membershipService.findOne.mockResolvedValue(membership);
      documentService.getTeamMemberDocumentPermission.mockReturnValue('EDITOR');
  
      const result = await documentService.checkExistedDocPermission(userId, document);
  
      expect(documentService.membershipService.findOne).toHaveBeenCalledWith({ teamId: 'team1', userId: 'user1' });
      expect(documentService.getTeamMemberDocumentPermission).toHaveBeenCalledWith({
        documentPermission: internalPermission,
        role: 'LEADER',
        userId: 'user1',
        documentOwnerId: 'owner1',
      });
      expect(result).toEqual({
        hasPermission: true,
        permissionType: DocumentOwnerTypeEnum.ORGANIZATION_TEAM,
        membershipRole: 'LEADER',
        role: 'EDITOR',
        refId: 'team1',
      });
    });
  
    it('should return PERSONAL if membership not found for ORGANIZATION', async () => {
      const userId = 'user1';
      const document = { _id: 'doc1', ownerId: 'owner1' } as any;
      const internalPermission = { role: DocumentRoleEnum.ORGANIZATION, refId: 'org1' };
  
      documentService.getDocumentPermissionsByDocId.mockResolvedValueOnce([])
        .mockResolvedValueOnce([internalPermission]);
  
      documentService.organizationService.getMembershipByOrgAndUser.mockResolvedValue(null);
  
      const result = await documentService.checkExistedDocPermission(userId, document);
  
      expect(result).toEqual({
        hasPermission: false,
        permissionType: DocumentOwnerTypeEnum.PERSONAL,
        membershipRole: null,
        role: null,
        refId: 'org1',
      });
    });
  
    it('should return PERSONAL if membership not found for ORGANIZATION_TEAM', async () => {
      const userId = 'user1';
      const document = { _id: 'doc1', ownerId: 'owner1' } as any;
      const internalPermission = { role: DocumentRoleEnum.ORGANIZATION_TEAM, refId: 'team1' };
  
      documentService.getDocumentPermissionsByDocId.mockResolvedValueOnce([])
        .mockResolvedValueOnce([internalPermission]);
  
      documentService.membershipService.findOne.mockResolvedValue(null);
  
      const result = await documentService.checkExistedDocPermission(userId, document);
  
      expect(result).toEqual({
        hasPermission: false,
        permissionType: DocumentOwnerTypeEnum.PERSONAL,
        membershipRole: null,
        role: null,
        refId: 'team1',
      });
    });

    it('should hit default case when internalPermission.role is unknown', async () => {
      const userId = 'user1';
      const document = { _id: 'doc1', ownerId: 'owner1' } as any;
      const internalPermission = { role: 'UNKNOWN_ROLE', refId: 'someId' };
    
      documentService.getDocumentPermissionsByDocId.mockResolvedValueOnce([])
        .mockResolvedValueOnce([internalPermission]);
    
      const result = await documentService.checkExistedDocPermission(userId, document);
    
      expect(result).toEqual({
        hasPermission: false,
        permissionType: DocumentOwnerTypeEnum.PERSONAL,
        membershipRole: undefined,
        role: undefined,
        refId: 'someId',
      });
    });
  });

  describe('validateRequestAccessDocument', () => {
    it('should return error for non-existent document', () => {
      const params = {
        userId: 'user1',
        document: null,
        requestRole: 'VIEWER' as any,
        existedDocPermission: {}
      };

      const result = DocumentService.prototype.validateRequestAccessDocument.call(documentService, params);
      expect(result.error).toBeDefined();
    });

    it('should return error for invalid request role', () => {
      const params = {
        userId: 'user1',
        document: { shareSetting: { linkType: 'RESTRICTED' } } as any,
        requestRole: 'VIEWER' as any,
        existedDocPermission: { role: null }
      };
      const result = DocumentService.prototype.validateRequestAccessDocument.call(documentService, params);
      expect(result.error).toBeDefined();
    });

    it('should return no error for valid request', () => {
      const params = {
        userId: 'user1',
        document: { shareSetting: { linkType: 'ANYONE' } } as any,
        requestRole: 'VIEWER' as any,
        existedDocPermission: { role: 'SPECTATOR' }
      };
      const result = DocumentService.prototype.validateRequestAccessDocument.call(documentService, params);
      expect(result.error).toBeNull();
    });

    it('should return error when requesting permission equal or lower than current permission', () => {
      const params = {
        userId: 'user1',
        document: { shareSetting: { linkType: 'ANYONE' } } as any,
        requestRole: DocumentRoleEnum.VIEWER,
        existedDocPermission: { role: DocumentRoleEnum.EDITOR }
      };
    
      const result = DocumentService.prototype.validateRequestAccessDocument.call(documentService, params) as { error: GraphErrorException | null };
    
      expect(result.error).toBeDefined();
    });
  });

  describe('createUserStartedDocument', () => {
    it('should create user started document', async () => {
      const userId = 'user1';
      const startedDocument = { _id: 'doc1', name: 'Get started - Personal.pdf' } as any;

      const mockGetDocumentPermission = jest.fn().mockResolvedValue([]);
      const mockGenerateStartedDocument = jest.fn().mockResolvedValue(startedDocument);

      documentService = new (class {
        getDocumentPermission = mockGetDocumentPermission;
        generateStartedDocument = mockGenerateStartedDocument;
        createUserStartedDocument = DocumentService.prototype.createUserStartedDocument;
      })() as any;

      const result = await documentService.createUserStartedDocument(userId);

      expect(result.document).toEqual(startedDocument);
      expect(result.error).toBeUndefined();
    });

    it('should return error if user already has document', async () => {
      const userId = 'user1';
      const existingPermission = [{ role: 'OWNER' }];

      const mockGetDocumentPermission = jest.fn().mockResolvedValue(existingPermission);

      documentService = new (class {
        getDocumentPermission = mockGetDocumentPermission;
        createUserStartedDocument = DocumentService.prototype.createUserStartedDocument;
      })() as any;

      const result = await documentService.createUserStartedDocument(userId);

      expect(result.error).toBeDefined();
      expect(result.document).toBeUndefined();
    });
  });

  describe('createOrgStartedDocument', () => {
    it('should create org started document', async () => {
      const userId = 'user1';
      const orgId = 'org1';
      const startedDocument = { _id: 'doc1', name: 'Get started - Organization.pdf' } as any;

      const mockGetDocumentPermission = jest.fn().mockResolvedValue([]);
      const mockGenerateStartedDocument = jest.fn().mockResolvedValue(startedDocument);

      documentService = new (class {
        getDocumentPermission = mockGetDocumentPermission;
        generateStartedDocument = mockGenerateStartedDocument;
        createOrgStartedDocument = DocumentService.prototype.createOrgStartedDocument;
      })() as any;

      const result = await documentService.createOrgStartedDocument(userId, orgId);

      expect(result.document).toEqual(startedDocument);
      expect(result.error).toBeUndefined();
    });

    it('should return error if org already has document', async () => {
      const userId = 'user1';
      const orgId = 'org1';
      const existingPermission = [{ role: 'ORGANIZATION' }];

      const mockGetDocumentPermission = jest.fn().mockResolvedValue(existingPermission);

      documentService = new (class {
        getDocumentPermission = mockGetDocumentPermission;
        createOrgStartedDocument = DocumentService.prototype.createOrgStartedDocument;
      })() as any;

      const result = await documentService.createOrgStartedDocument(userId, orgId);

      expect(result.error).toBeDefined();
      expect(result.document).toBeUndefined();
    });
  });

  describe('generateStartedDocument', () => {
    let documentService: DocumentService;
  
    beforeEach(() => {
      documentService = new (class {
        generateStartedDocument = DocumentService.prototype['generateStartedDocument'];
        environmentService = {
          getByKey: jest.fn(),
        };
        createPDfDocumentFromDocumentForm = jest.fn();
        createDocument = jest.fn();
        createDocumentPermissions = jest.fn();
      })() as any;
    });
  
    it('should generate personal started document correctly', async () => {
      const userId = 'user1';
      const refId = 'ref1';
      const isMobile = false;
  
      ((documentService as any).environmentService.getByKey as jest.Mock)
        .mockImplementation((key: string) => {
          if (key === EnvConstants.STARTED_DOCUMENT_REMOTE_ID) return 'started-doc';
          if (key === EnvConstants.THUMBNAIL_STARTED_DOCUMENT_REMOTE_ID) return 'thumb-doc';
        });
  
      (documentService.createPDfDocumentFromDocumentForm as jest.Mock).mockResolvedValue({
        copyFormRemoteId: 'copied-form.pdf',
        copyThumbnailRemoteId: 'copied-thumb.jpg',
      });
  
      (documentService.createDocument as jest.Mock).mockImplementation(async (doc: any) => ({
        ...doc,
        _id: 'doc123',
      }));
  
      (documentService.createDocumentPermissions as jest.Mock).mockResolvedValue(null);
  
      const result = await (documentService as any).generateStartedDocument({
        userId,
        type: DocumentOwnerTypeEnum.PERSONAL,
        refId,
        isMobile,
      });
  
      expect(result).toHaveProperty('_id', 'doc123');
      expect(documentService.createDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          isPersonal: true,
          name: expect.stringContaining('Personal'),
          ownerId: userId,
        })
      );
      expect(documentService.createDocumentPermissions).toHaveBeenCalledWith([
        expect.objectContaining({
          refId,
          role: DocumentRoleEnum.OWNER,
          documentId: 'doc123',
        }),
      ]);
    });
  
    it('should generate organization started document correctly', async () => {
      const userId = 'user2';
      const refId = 'org1';
      const isMobile = true;
  
      ((documentService as any).environmentService.getByKey as jest.Mock)
        .mockImplementation((key: string) => {
          if (key === EnvConstants.MOBILE_STARTED_DOCUMENT_REMOTE_ID) return 'mobile-started-doc';
          if (key === EnvConstants.THUMBNAIL_MOBILE_STARTED_DOCUMENT_REMOTE_ID) return 'mobile-thumb-doc';
        });
  
      (documentService.createPDfDocumentFromDocumentForm as jest.Mock).mockResolvedValue({
        copyFormRemoteId: 'copied-org-form.pdf',
        copyThumbnailRemoteId: 'copied-org-thumb.jpg',
      });
  
      (documentService.createDocument as jest.Mock).mockImplementation(async (doc: any) => ({
        ...doc,
        _id: 'doc456',
      }));
  
      (documentService.createDocumentPermissions as jest.Mock).mockResolvedValue(null);
  
      const result = await (documentService as any).generateStartedDocument({
        userId,
        type: DocumentOwnerTypeEnum.ORGANIZATION,
        refId,
        isMobile,
      });
  
      expect(result).toHaveProperty('_id', 'doc456');
      expect(documentService.createDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          isPersonal: false,
          name: expect.stringContaining('Workspace'),
          ownerId: userId,
        })
      );
      expect(documentService.createDocumentPermissions).toHaveBeenCalledWith([
        expect.objectContaining({
          refId,
          role: DocumentRoleEnum.ORGANIZATION,
          documentId: 'doc456',
        }),
      ]);
    });

    it('should handle unknown type and still create document without role modifications', async () => {
      const userId = 'user3';
      const refId = 'ref3';
      const isMobile = false;
    
      ((documentService as any).environmentService.getByKey as jest.Mock)
        .mockImplementation((key: string) => {
          if (key === EnvConstants.STARTED_DOCUMENT_REMOTE_ID) return 'started-doc';
          if (key === EnvConstants.THUMBNAIL_STARTED_DOCUMENT_REMOTE_ID) return 'thumb-doc';
        });
      (documentService.createPDfDocumentFromDocumentForm as jest.Mock).mockResolvedValue({
        copyFormRemoteId: 'copied-form.pdf',
        copyThumbnailRemoteId: 'copied-thumb.jpg',
      });
      (documentService.createDocument as jest.Mock).mockImplementation(async (doc: any) => ({
        ...doc,
        _id: 'doc789',
      }));
      (documentService.createDocumentPermissions as jest.Mock).mockResolvedValue(null);
    
      const result = await (documentService as any).generateStartedDocument({
        userId,
        type: 'UNKNOWN_TYPE' as any,
        refId,
        isMobile,
      });
    
      expect(result).toHaveProperty('_id', 'doc789');
      expect(documentService.createDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId: userId,
        })
      );
    
      expect(documentService.createDocumentPermissions).toHaveBeenCalledWith([
        expect.objectContaining({
          refId,
          documentId: 'doc789',
        }),
      ]);
    });
  });  

  describe('generateSearchDocumentKeyRegex', () => {
    it('should generate regex for normal search key', () => {
      const searchKey = 'test document';
      const result = DocumentService.prototype.generateSearchDocumentKeyRegex.call(documentService, searchKey);
      expect(result).toBeInstanceOf(RegExp);
      expect(result.test('test document')).toBe(true);
    });

    it('should handle pdf search key specially', () => {
      const searchKey = 'pdf';
      const result = DocumentService.prototype.generateSearchDocumentKeyRegex.call(documentService, searchKey);
      expect(result).toBeInstanceOf(RegExp);
      expect(result.test('pdf')).toBe(false);
    });
  });

  describe('createDocumentFromCommunityTemplate', () => {
    it('should create document from community template', async () => {
      const communityTemplate = {
        remoteId: 'template1',
        thumbnails: ['thumb1.jpg']
      } as any;

      const mockGetByKey = jest.fn()
        .mockReturnValueOnce('doc-bucket')
        .mockReturnValueOnce('template-bucket')
        .mockReturnValueOnce('resource-bucket');
      const mockCopyObjectS3 = jest.fn()
        .mockResolvedValueOnce('copied-doc-id')
        .mockResolvedValueOnce('copied-thumb-id');
      const mockGetExtensionFile = jest.fn().mockReturnValue('jpg');

      documentService = new (class {
        environmentService = { getByKey: mockGetByKey };
        awsService = { 
          copyObjectS3: mockCopyObjectS3,
          s3InstanceForDocument: jest.fn()
        };
        createDocumentFromCommunityTemplate = DocumentService.prototype.createDocumentFromCommunityTemplate;
      })() as any;

      const result = await documentService.createDocumentFromCommunityTemplate(communityTemplate);

      expect(result).toEqual({
        copyFormRemoteId: 'copied-doc-id',
        copyThumbnailRemoteId: 'copied-thumb-id'
      });
    });
  });

  describe('removeRequestAccessDocument', () => {
    it('should remove request access and notifications', async () => {
      const requesterIds = ['user1', 'user2'];
      const documentId = 'doc1';

      const mockDeleteManyRequestAccess = jest.fn().mockResolvedValue(undefined);
      const mockRemoveRequestNotiWhenAcceptRequest = jest.fn();

      documentService = new (class {
        deleteManyRequestAccess = mockDeleteManyRequestAccess;
        removeRequestNotiWhenAcceptRequest = mockRemoveRequestNotiWhenAcceptRequest;
        removeRequestAccessDocument = DocumentService.prototype.removeRequestAccessDocument;
      })() as any;

      await documentService.removeRequestAccessDocument(requesterIds, documentId);

      expect(mockDeleteManyRequestAccess).toHaveBeenCalledWith({
        documentId,
        requesterId: { $in: requesterIds }
      });
      expect(mockRemoveRequestNotiWhenAcceptRequest).toHaveBeenCalledWith(documentId, requesterIds);
    });
  });

  describe('getManagerOfDocument', () => {
    it('should return team managers for team document', async () => {
      const documentId = 'doc1';
      const docPermission = { role: 'ORGANIZATION_TEAM', refId: 'team1' };
      const teamManagers = [{ _id: 'manager1', name: 'Manager 1' }];

      const mockGetDocumentPermissionByGroupRole = jest.fn().mockResolvedValue(docPermission);
      const mockGetTeamMemberByRole = jest.fn().mockResolvedValue(teamManagers);

      documentService = new (class {
        getDocumentPermissionByGroupRole = mockGetDocumentPermissionByGroupRole;
        teamService = { getTeamMemberByRole: mockGetTeamMemberByRole };
        getManagerOfDocument = DocumentService.prototype.getManagerOfDocument;
      })() as any;

      const result = await documentService.getManagerOfDocument(documentId);

      expect(result).toEqual([]);
    });

    it('should return org managers for org document', async () => {
      const documentId = 'doc1';
      const docPermission = { role: 'ORGANIZATION', refId: 'org1' };
      const orgManagers = [{ _id: 'manager1', name: 'Manager 1' }];
      const mockGetDocumentPermissionByGroupRole = jest.fn().mockResolvedValue(docPermission);
      const mockGetOrganizationMemberByRole = jest.fn().mockResolvedValue(orgManagers);

      documentService = new (class {
        getDocumentPermissionByGroupRole = mockGetDocumentPermissionByGroupRole;
        organizationService = { getOrganizationMemberByRole: mockGetOrganizationMemberByRole };
        getManagerOfDocument = DocumentService.prototype.getManagerOfDocument;
      })() as any;

      const result = await documentService.getManagerOfDocument(documentId);

      expect(result).toEqual([]);
    });

    it('should throw error if document permission not found', async () => {
      const documentId = 'doc1';
  
      const mockGetDocumentPermissionByGroupRole = jest.fn().mockResolvedValue(null);
  
      documentService = new (class {
        getDocumentPermissionByGroupRole = mockGetDocumentPermissionByGroupRole;
        getManagerOfDocument = DocumentService.prototype.getManagerOfDocument;
      })() as any;
  
      await expect(documentService.getManagerOfDocument(documentId))
        .rejects
        .toThrow('Document permission not found');
    });

    it('should return team managers for ORGANIZATION_TEAM document', async () => {
      const documentId = 'doc1';
      const docPermission = { role: DocumentRoleEnum.ORGANIZATION_TEAM, refId: 'team1' };
      const teamManagers = [{ _id: 'manager1', name: 'Manager 1' }];
  
      const mockGetDocumentPermissionByGroupRole = jest.fn().mockResolvedValue(docPermission);
      const mockGetTeamMemberByRole = jest.fn().mockResolvedValue(teamManagers);
  
      documentService = new (class {
        getDocumentPermissionByGroupRole = mockGetDocumentPermissionByGroupRole;
        teamService = { getTeamMemberByRole: mockGetTeamMemberByRole };
        getManagerOfDocument = DocumentService.prototype.getManagerOfDocument;
      })() as any;
  
      const result = await documentService.getManagerOfDocument(documentId);
  
      expect(result).toEqual(teamManagers);
      expect(mockGetTeamMemberByRole).toHaveBeenCalledWith(
        'team1',
        [TeamRoles.ADMIN, TeamRoles.MODERATOR, TeamRoles.OWNER],
      );
    });
  
    it('should return organization managers for ORGANIZATION document', async () => {
      const documentId = 'doc2';
      const docPermission = { role: DocumentRoleEnum.ORGANIZATION, refId: 'org1' };
      const orgManagers = [{ _id: 'manager2', name: 'Manager 2' }];
  
      const mockGetDocumentPermissionByGroupRole = jest.fn().mockResolvedValue(docPermission);
      const mockGetOrganizationMemberByRole = jest.fn().mockResolvedValue(orgManagers);
  
      documentService = new (class {
        getDocumentPermissionByGroupRole = mockGetDocumentPermissionByGroupRole;
        organizationService = { getOrganizationMemberByRole: mockGetOrganizationMemberByRole };
        getManagerOfDocument = DocumentService.prototype.getManagerOfDocument;
      })() as any;
  
      const result = await documentService.getManagerOfDocument(documentId);
  
      expect(result).toEqual(orgManagers);
      expect(mockGetOrganizationMemberByRole).toHaveBeenCalledWith(
        'org1',
        [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
      );
    });
  });

  describe('removeRequestAfterUpdatePermission', () => {
    it('should remove request and notifications', async () => {
      const input = { documentId: 'doc1', userId: 'user1' };
      const notification = { _id: 'noti1' };
      const notificationUsers = [{ userId: 'user1' }, { userId: 'user2' }];

      const mockDeleteManyRequestAccess = jest.fn().mockResolvedValue(undefined);
      const mockGetNotificationsByConditions = jest.fn().mockResolvedValue([notification]);
      const mockGetNotificationUsersByCondition = jest.fn().mockResolvedValue(notificationUsers);
      const mockRemoveMultiNotifications = jest.fn();

      documentService = new (class {
        deleteManyRequestAccess = mockDeleteManyRequestAccess;
        notificationService = {
          getNotificationsByConditions: mockGetNotificationsByConditions,
          getNotificationUsersByCondition: mockGetNotificationUsersByCondition,
          removeMultiNotifications: mockRemoveMultiNotifications
        };
        removeRequestAfterUpdatePermission = DocumentService.prototype.removeRequestAfterUpdatePermission;
      })() as any;

      await documentService.removeRequestAfterUpdatePermission(input);

      expect(mockDeleteManyRequestAccess).toHaveBeenCalledWith({
        documentId: 'doc1',
        requesterId: 'user1'
      });
      expect(mockRemoveMultiNotifications).toHaveBeenCalledWith({
        notification,
        userIds: ['user1', 'user2'],
        tabs: ['REQUESTS']
      });
    });
  });

  describe('getLowerRole', () => {
    it('should return lower roles for given role', () => {
      const role = 'viewer' as any;
      const result = DocumentService.prototype.getLowerRole.call(documentService, role);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('viewer');
    });
  });

  describe('getReceiverIdsNotiRequestAccess', () => {
    it('should return receiver IDs for personal document', async () => {
      const document = { _id: 'doc1', isPersonal: true, ownerId: 'owner1' } as any;
      const request = { requesterId: 'requester1' } as any;
      const documentPermissions = [
        { role: 'OWNER', refId: { toHexString: () => 'owner1' } },
        { role: 'SHARER', refId: { toHexString: () => 'sharer1' } }
      ];
      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue(documentPermissions);

      documentService = new (class {
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        getReceiverIdsNotiRequestAccess = DocumentService.prototype.getReceiverIdsNotiRequestAccess;
      })() as any;

      const result = await documentService.getReceiverIdsNotiRequestAccess(document, request);

      expect(result).toEqual(['owner1', 'sharer1']);
    });

    it('should return receiver IDs for org document', async () => {
      const document = { _id: 'doc1', isPersonal: false, ownerId: 'owner1' } as any;
      const request = { requesterId: 'requester1' } as any;
      const docPermission = { role: 'ORGANIZATION', refId: 'org1' };
      const receiverIds = ['user1', 'user2'];
      const mockGetDocumentPermissionByGroupRole = jest.fn().mockResolvedValue(docPermission);
      const mockGetReceiverIdsNotiRequestAccessInOrg = jest.fn().mockResolvedValue(receiverIds);

      documentService = new (class {
        getDocumentPermissionByGroupRole = mockGetDocumentPermissionByGroupRole;
        getReceiverIdsNotiRequestAccessInOrg = mockGetReceiverIdsNotiRequestAccessInOrg;
        getReceiverIdsNotiRequestAccess = DocumentService.prototype.getReceiverIdsNotiRequestAccess;
      })() as any;

      const result = await documentService.getReceiverIdsNotiRequestAccess(document, request);

      expect(result).toEqual([]);
    });

    it('should throw error if docPermission not found', async () => {
      const document = { _id: 'doc1', isPersonal: false, ownerId: 'owner1' } as any;
      const request = { requesterId: 'requester1' } as any;
      const mockGetDocumentPermissionByGroupRole = jest.fn().mockResolvedValue(null);
    
      documentService = new (class {
        getDocumentPermissionByGroupRole = mockGetDocumentPermissionByGroupRole;
        getReceiverIdsNotiRequestAccess = DocumentService.prototype.getReceiverIdsNotiRequestAccess;
      })() as any;
    
      await expect(documentService.getReceiverIdsNotiRequestAccess(document, request))
        .rejects.toThrow('Document permission not found');
    });

    it('should return only owner ID when personal document permissions exceed ORG_SIZE_LIMIT_FOR_NOTI', async () => {
      const document = { _id: 'doc1', isPersonal: true, ownerId: 'owner1' } as any;
      const request = { requesterId: 'requester1' } as any;
    
      const documentPermissions = Array(ORG_SIZE_LIMIT_FOR_NOTI + 1).fill(null).map((_, i) => ({
        role: i === 0 ? DocumentRoleEnum.OWNER : DocumentRoleEnum.SHARER,
        refId: { toHexString: () => `user${i}` },
      }));
    
      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue(documentPermissions);
    
      documentService = new (class {
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        getReceiverIdsNotiRequestAccess = DocumentService.prototype.getReceiverIdsNotiRequestAccess;
      })() as any;
    
      const result = await documentService.getReceiverIdsNotiRequestAccess(document, request);
    
      expect(result).toEqual(['user0']);
    });

    it('should return receiver IDs for organization document', async () => {
      const document = { _id: 'doc1', isPersonal: false, ownerId: 'owner1' } as any;
      const request = { requesterId: 'requester1' } as any;
      const docPermission = { role: DocumentRoleEnum.ORGANIZATION, refId: 'org1' };
      const receiverIds = ['orgUser1', 'orgUser2'];
    
      const mockGetDocumentPermissionByGroupRole = jest.fn().mockResolvedValue(docPermission);
      const mockGetReceiverIdsNotiRequestAccessInOrg = jest.fn().mockResolvedValue(receiverIds);
    
      documentService = new (class {
        getDocumentPermissionByGroupRole = mockGetDocumentPermissionByGroupRole;
        getReceiverIdsNotiRequestAccessInOrg = mockGetReceiverIdsNotiRequestAccessInOrg;
        getReceiverIdsNotiRequestAccess = DocumentService.prototype.getReceiverIdsNotiRequestAccess;
      })() as any;
    
      const result = await documentService.getReceiverIdsNotiRequestAccess(document, request);
    
      expect(result).toEqual(receiverIds);
    });
    
    it('should return receiver IDs for ORGANIZATION_TEAM document', async () => {
      const document = { _id: 'doc1', isPersonal: false, ownerId: 'owner1' } as any;
      const request = { requesterId: 'requester1' } as any;
    
      const docPermission = { role: DocumentRoleEnum.ORGANIZATION_TEAM, refId: 'team1' };
      const receiverIds = ['teamUser1', 'teamUser2'];
    
      const mockGetDocumentPermissionByGroupRole = jest.fn().mockResolvedValue(docPermission);
      const mockGetReceiverIdsNotiRequestAccessInTeam = jest.fn().mockResolvedValue(receiverIds);
    
      documentService = new (class {
        getDocumentPermissionByGroupRole = mockGetDocumentPermissionByGroupRole;
        getReceiverIdsNotiRequestAccessInTeam = mockGetReceiverIdsNotiRequestAccessInTeam;
        getReceiverIdsNotiRequestAccess = DocumentService.prototype.getReceiverIdsNotiRequestAccess;
      })() as any;
    
      const result = await documentService.getReceiverIdsNotiRequestAccess(document, request);
    
      expect(mockGetReceiverIdsNotiRequestAccessInTeam).toHaveBeenCalledWith({
        docPermission,
        requesterId: request.requesterId,
        ownerId: document.ownerId,
      });
      expect(result).toEqual(receiverIds);
    });
  });

  describe('getReceiverIdsNotiRequestAccessInOrg', () => {
    it('should return org managers when internal request', async () => {
      const docPermission = { 
        refId: 'org1', 
        documentId: 'doc1',
        defaultPermission: { member: DocumentPermissionOfMemberEnum.VIEWER }
      } as any;
      const requesterId = 'requester1';
      const ownerId = 'owner1';
      
      const orgManagers = [
        { userId: { toHexString: () => 'manager1' } },
        { userId: { toHexString: () => 'manager2' } }
      ];
      const isInternalRequest = true;
      
      const mockFindMemberWithRoleInOrg = jest.fn().mockResolvedValue(orgManagers);
      const mockGetMembershipByOrgAndUser = jest.fn().mockResolvedValue(isInternalRequest);
      
      documentService = new (class {
        organizationService = {
          findMemberWithRoleInOrg: mockFindMemberWithRoleInOrg,
          getMembershipByOrgAndUser: mockGetMembershipByOrgAndUser
        };
        getReceiverIdsNotiRequestAccessInOrg = DocumentService.prototype.getReceiverIdsNotiRequestAccessInOrg;
      })() as any;
      
      const result = await documentService.getReceiverIdsNotiRequestAccessInOrg({
        docPermission,
        requesterId,
        ownerId
      });
      
      expect(mockFindMemberWithRoleInOrg).toHaveBeenCalledWith('org1', [
        OrganizationRoleEnums.ORGANIZATION_ADMIN,
        OrganizationRoleEnums.BILLING_MODERATOR
      ], { userId: 1 });
      expect(mockGetMembershipByOrgAndUser).toHaveBeenCalledWith('org1', 'requester1');
      expect(result).toEqual(['manager1', 'manager2']);
    });

    it('should return all receivers when external request and under limit', async () => {
      const docPermission = { 
        refId: 'org1', 
        documentId: 'doc1',
        defaultPermission: { member: DocumentPermissionOfMemberEnum.VIEWER }
      } as any;
      const requesterId = 'requester1';
      const ownerId = '507f1f77bcf86cd799439016';

      const orgManagers = [{ userId: { toHexString: () => '507f1f77bcf86cd799439011' } }];
      const isInternalRequest = false;
      const internalWithSharePermission = ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'];
      const externalSharePermission = [
        { refId: { toHexString: () => '507f1f77bcf86cd799439014' } },
        { refId: { toHexString: () => '507f1f77bcf86cd799439015' } }
      ];
      
      const mockFindMemberWithRoleInOrg = jest.fn().mockResolvedValue(orgManagers);
      const mockGetMembershipByOrgAndUser = jest.fn().mockResolvedValue(isInternalRequest);
      const mockGetInternalMemberWithSharePermission = jest.fn().mockResolvedValue(internalWithSharePermission);
      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue(externalSharePermission);
      
      documentService = new (class {
        organizationService = {
          findMemberWithRoleInOrg: mockFindMemberWithRoleInOrg,
          getMembershipByOrgAndUser: mockGetMembershipByOrgAndUser
        };
        getInternalMemberWithSharePermission = mockGetInternalMemberWithSharePermission;
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        getReceiverIdsNotiRequestAccessInOrg = DocumentService.prototype.getReceiverIdsNotiRequestAccessInOrg;
      })() as any;
      
      const result = await documentService.getReceiverIdsNotiRequestAccessInOrg({
        docPermission,
        requesterId,
        ownerId
      });
      
      expect(result).toEqual(['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014', '507f1f77bcf86cd799439015', '507f1f77bcf86cd799439016']);
    });

    it('should return only org managers when receivers exceed limit', async () => {
      const docPermission = { 
        refId: 'org1', 
        documentId: 'doc1',
        defaultPermission: { member: DocumentPermissionOfMemberEnum.VIEWER }
      } as any;
      const requesterId = 'requester1';
      const ownerId = '507f1f77bcf86cd799439016';
      
      const orgManagers = [
        { userId: { toHexString: () => '507f1f77bcf86cd799439011' } },
        { userId: { toHexString: () => '507f1f77bcf86cd799439012' } }
      ];
      const isInternalRequest = false;
      const internalWithSharePermission = Array(ORG_SIZE_LIMIT_FOR_NOTI).fill('507f1f77bcf86cd799439013');
      const externalSharePermission = [
        { refId: { toHexString: () => '507f1f77bcf86cd799439014' } }
      ];
      
      const mockFindMemberWithRoleInOrg = jest.fn().mockResolvedValue(orgManagers);
      const mockGetMembershipByOrgAndUser = jest.fn().mockResolvedValue(isInternalRequest);
      const mockGetInternalMemberWithSharePermission = jest.fn().mockResolvedValue(internalWithSharePermission);
      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue(externalSharePermission);
      
      documentService = new (class {
        organizationService = {
          findMemberWithRoleInOrg: mockFindMemberWithRoleInOrg,
          getMembershipByOrgAndUser: mockGetMembershipByOrgAndUser
        };
        getInternalMemberWithSharePermission = mockGetInternalMemberWithSharePermission;
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        getReceiverIdsNotiRequestAccessInOrg = DocumentService.prototype.getReceiverIdsNotiRequestAccessInOrg;
      })() as any;
      
      const result = await documentService.getReceiverIdsNotiRequestAccessInOrg({
        docPermission,
        requesterId,
        ownerId
      });
      
      expect(result).toEqual(['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']);
    });
  });

  describe('getReceiverIdsNotiRequestAccessInTeam', () => {
    it('should return team admins when internal request', async () => {
      const docPermission = { 
        refId: 'team1', 
        documentId: 'doc1',
        defaultPermission: { member: DocumentPermissionOfMemberEnum.VIEWER }
      } as any;
      const requesterId = 'requester1';
      const ownerId = 'owner1';
      
      const teamAdmins = [{ _id: 'admin1' }, { _id: 'admin2' }];
      const externalDocPermissions = [];
      const internalRequest = { _id: 'internal1' };
      
      const mockGetTeamMemberByRole = jest.fn().mockResolvedValue(teamAdmins);
      const mockGetDocumentPermissionsByDocId = jest.fn().mockResolvedValue(externalDocPermissions);
      const mockFindOne = jest.fn().mockResolvedValue(internalRequest);
      
      documentService = new (class {
        teamService = { getTeamMemberByRole: mockGetTeamMemberByRole };
        getDocumentPermissionsByDocId = mockGetDocumentPermissionsByDocId;
        membershipService = { findOne: mockFindOne };
        getReceiverIdsNotiRequestAccessInTeam = DocumentService.prototype.getReceiverIdsNotiRequestAccessInTeam;
      })() as any;
      
      const result = await documentService.getReceiverIdsNotiRequestAccessInTeam({
        docPermission,
        requesterId,
        ownerId
      });
      
      expect(mockGetTeamMemberByRole).toHaveBeenCalledWith('team1', [TeamRoles.ADMIN]);
      expect(mockFindOne).toHaveBeenCalledWith({ userId: 'requester1', teamId: 'team1' });
      expect(result).toEqual(['admin1', 'admin2']);
    });

    it('should return all receivers when external request and under limit', async () => {
      const docPermission = { 
        refId: 'team1', 
        documentId: 'doc1',
        defaultPermission: { member: DocumentPermissionOfMemberEnum.VIEWER }
      } as any;
      const requesterId = 'requester1';
      const ownerId = 'owner1';
      
      const teamAdmins = [{ _id: 'admin1' }];
      const externalDocPermissions = [
        { refId: { toHexString: () => 'external1' } }
      ];
      const internalRequest = null;
      const internalWithSharePermission = ['internal1', 'internal2'];
      
      const mockGetTeamMemberByRole = jest.fn().mockResolvedValue(teamAdmins);
      const mockGetDocumentPermissionsByDocId = jest.fn().mockResolvedValue(externalDocPermissions);
      const mockFindOne = jest.fn().mockResolvedValue(internalRequest);
      const mockGetInternalMemberWithSharePermission = jest.fn().mockResolvedValue(internalWithSharePermission);
      
      documentService = new (class {
        teamService = { getTeamMemberByRole: mockGetTeamMemberByRole };
        getDocumentPermissionsByDocId = mockGetDocumentPermissionsByDocId;
        membershipService = { findOne: mockFindOne };
        getInternalMemberWithSharePermission = mockGetInternalMemberWithSharePermission;
        getReceiverIdsNotiRequestAccessInTeam = DocumentService.prototype.getReceiverIdsNotiRequestAccessInTeam;
      })() as any;
      
      const result = await documentService.getReceiverIdsNotiRequestAccessInTeam({
        docPermission,
        requesterId,
        ownerId
      });
      
      expect(result).toEqual(['admin1', 'external1', 'owner1', 'internal1', 'internal2']);
    });

    it('should return only team admins when receivers exceed limit', async () => {
      const docPermission = { 
        refId: 'team1', 
        documentId: 'doc1',
        defaultPermission: { member: DocumentPermissionOfMemberEnum.VIEWER }
      } as any;
      const requesterId = 'requester1';
      const ownerId = 'owner1';
      
      const teamAdmins = [{ _id: 'admin1' }, { _id: 'admin2' }];
      const externalDocPermissions = [
        { refId: { toHexString: () => 'external1' } }
      ];
      const internalRequest = null;
      const internalWithSharePermission = Array(ORG_SIZE_LIMIT_FOR_NOTI).fill('user');
      
      const mockGetTeamMemberByRole = jest.fn().mockResolvedValue(teamAdmins);
      const mockGetDocumentPermissionsByDocId = jest.fn().mockResolvedValue(externalDocPermissions);
      const mockFindOne = jest.fn().mockResolvedValue(internalRequest);
      const mockGetInternalMemberWithSharePermission = jest.fn().mockResolvedValue(internalWithSharePermission);
      
      documentService = new (class {
        teamService = { getTeamMemberByRole: mockGetTeamMemberByRole };
        getDocumentPermissionsByDocId = mockGetDocumentPermissionsByDocId;
        membershipService = { findOne: mockFindOne };
        getInternalMemberWithSharePermission = mockGetInternalMemberWithSharePermission;
        getReceiverIdsNotiRequestAccessInTeam = DocumentService.prototype.getReceiverIdsNotiRequestAccessInTeam;
      })() as any;
      
      const result = await documentService.getReceiverIdsNotiRequestAccessInTeam({
        docPermission,
        requesterId,
        ownerId
      });
      
      expect(result).toEqual(['admin1', 'admin2']);
    });
  });

  describe('getInternalMemberWithSharePermission', () => {
    it('should return share list when default permission is not SHARER', async () => {
      const documentPermission = {
        _id: '507f1f77bcf86cd799439011',
        defaultPermission: { member: DocumentPermissionOfMemberEnum.VIEWER },
        role: DocumentRoleEnum.ORGANIZATION,
        refId: 'org1'
      } as any;
      const shareList = ['user1', 'user2'];
      const mockAggregate = jest.fn().mockResolvedValue([{ shareList }]);
      
      documentService = new (class {
        aggregateDocumentPermission = mockAggregate;
        getInternalMemberWithSharePermission = DocumentService.prototype.getInternalMemberWithSharePermission;
      })() as any;
      
      const result = await documentService.getInternalMemberWithSharePermission(documentPermission);
      
      expect(mockAggregate).toHaveBeenCalled();
      expect(result).toEqual(shareList);
    });

    it('should return empty array when no share list found', async () => {
      const documentPermission = {
        _id: '507f1f77bcf86cd799439011',
        defaultPermission: { member: DocumentPermissionOfMemberEnum.VIEWER },
        role: DocumentRoleEnum.ORGANIZATION,
        refId: 'org1'
      } as any;
      const mockAggregate = jest.fn().mockResolvedValue([]);
      
      documentService = new (class {
        aggregateDocumentPermission = mockAggregate;
        getInternalMemberWithSharePermission = DocumentService.prototype.getInternalMemberWithSharePermission;
      })() as any;
      
      const result = await documentService.getInternalMemberWithSharePermission(documentPermission);
      
      expect(result).toEqual([]);
    });

    it('should return org members when default permission is SHARER and role is ORGANIZATION', async () => {
      const documentPermission = {
        _id: '507f1f77bcf86cd799439011',
        defaultPermission: { member: DocumentPermissionOfMemberEnum.SHARER },
        role: DocumentRoleEnum.ORGANIZATION,
        refId: 'org1'
      } as any;
      const notShareList = ['user1'];
      const orgMembers = [
        { userId: { toHexString: () => 'user2' } },
        { userId: { toHexString: () => 'user3' } }
      ];
      const mockAggregate = jest.fn().mockResolvedValue([{ notShareList }]);
      const mockGetOrgMembershipByConditions = jest.fn().mockResolvedValue(orgMembers);
      
      documentService = new (class {
        aggregateDocumentPermission = mockAggregate;
        organizationService = { getOrgMembershipByConditions: mockGetOrgMembershipByConditions };
        getInternalMemberWithSharePermission = DocumentService.prototype.getInternalMemberWithSharePermission;
      })() as any;
      
      const result = await documentService.getInternalMemberWithSharePermission(documentPermission);
      
      expect(mockGetOrgMembershipByConditions).toHaveBeenCalledWith({
        conditions: { orgId: 'org1', userId: { $nin: ['user1'] } }
      });
      expect(result).toEqual(['user2', 'user3']);
    });

    it('should return team members when default permission is SHARER and role is ORGANIZATION_TEAM', async () => {
      const documentPermission = {
        _id: '507f1f77bcf86cd799439011',
        defaultPermission: { member: DocumentPermissionOfMemberEnum.SHARER },
        role: DocumentRoleEnum.ORGANIZATION_TEAM,
        refId: 'team1'
      } as any;
      const notShareList = ['user1'];
      const teamMembers = [
        { userId: { toHexString: () => 'user2' } },
        { userId: { toHexString: () => 'user3' } }
      ];
      
      const mockAggregate = jest.fn().mockResolvedValue([{ notShareList }]);
      const mockGetTeamMemberShipByConditions = jest.fn().mockResolvedValue(teamMembers);
      
      documentService = new (class {
        aggregateDocumentPermission = mockAggregate;
        teamService = { getTeamMemberShipByConditions: mockGetTeamMemberShipByConditions };
        getInternalMemberWithSharePermission = DocumentService.prototype.getInternalMemberWithSharePermission;
      })() as any;
      
      const result = await documentService.getInternalMemberWithSharePermission(documentPermission);
      
      expect(mockGetTeamMemberShipByConditions).toHaveBeenCalledWith({
        conditions: { teamId: 'team1', userId: { $nin: ['user1'] } }
      });
      expect(result).toEqual(['user2', 'user3']);
    });

    it('should handle empty aggregate result for ORGANIZATION role', async () => {
      const documentPermission = {
        _id: '507f1f77bcf86cd799439011',
        defaultPermission: { member: DocumentPermissionOfMemberEnum.SHARER },
        role: DocumentRoleEnum.ORGANIZATION,
        refId: 'org1'
      } as any;
    
      const mockAggregate = jest.fn().mockResolvedValue([]);
      const orgMembers = [
        { userId: { toHexString: () => 'user1' } },
      ];
      const mockGetOrgMembershipByConditions = jest.fn().mockResolvedValue(orgMembers);
    
      documentService = new (class {
        aggregateDocumentPermission = mockAggregate;
        organizationService = { getOrgMembershipByConditions: mockGetOrgMembershipByConditions };
        getInternalMemberWithSharePermission = DocumentService.prototype.getInternalMemberWithSharePermission;
      })() as any;
    
      const result = await documentService.getInternalMemberWithSharePermission(documentPermission);
    
      expect(mockGetOrgMembershipByConditions).toHaveBeenCalledWith({
        conditions: { orgId: 'org1', userId: { $nin: [] } }
      });
      expect(result).toEqual(['user1']);
    });

    it('should handle empty aggregate result for ORGANIZATION_TEAM role', async () => {
      const documentPermission = {
        _id: '507f1f77bcf86cd799439011',
        defaultPermission: { member: DocumentPermissionOfMemberEnum.SHARER },
        role: DocumentRoleEnum.ORGANIZATION_TEAM,
        refId: 'team1'
      } as any;
    
      const mockAggregate = jest.fn().mockResolvedValue([]);
      const teamMembers = [
        { userId: { toHexString: () => 'user2' } },
      ];
      const mockGetTeamMemberShipByConditions = jest.fn().mockResolvedValue(teamMembers);
    
      documentService = new (class {
        aggregateDocumentPermission = mockAggregate;
        teamService = { getTeamMemberShipByConditions: mockGetTeamMemberShipByConditions };
        getInternalMemberWithSharePermission = DocumentService.prototype.getInternalMemberWithSharePermission;
      })() as any;
    
      const result = await documentService.getInternalMemberWithSharePermission(documentPermission);
    
      expect(mockGetTeamMemberShipByConditions).toHaveBeenCalledWith({
        conditions: { teamId: 'team1', userId: { $nin: [] } }
      });
      expect(result).toEqual(['user2']);
    });
  });

  describe('canAcceptOrRejectRequest', () => {
    it('should return true when actor is org manager', async () => {
      const params = {
        actorId: 'actor1',
        targetId: 'target1',
        document: { _id: 'doc1' } as any
      };
      
      const actorDocPermission = { membershipRole: OrganizationRoleEnums.ORGANIZATION_ADMIN };
      const targetDocPermission = { permissionType: DocumentOwnerTypeEnum.ORGANIZATION };
      
      const mockCheckExistedDocPermission = jest.fn()
        .mockResolvedValueOnce(actorDocPermission)
        .mockResolvedValueOnce(targetDocPermission);
      const mockIsOrgOrTeamAdmin = jest.fn().mockReturnValue(true);
      
      documentService = new (class {
        checkExistedDocPermission = mockCheckExistedDocPermission;
        organizationService = { isOrgOrTeamAdmin: mockIsOrgOrTeamAdmin };
        canAcceptOrRejectRequest = DocumentService.prototype.canAcceptOrRejectRequest;
      })() as any;
      
      const result = await documentService.canAcceptOrRejectRequest(params);
      
      expect(mockCheckExistedDocPermission).toHaveBeenCalledWith('actor1', params.document);
      expect(mockCheckExistedDocPermission).toHaveBeenCalledWith('target1', params.document);
      expect(mockIsOrgOrTeamAdmin).toHaveBeenCalledWith(OrganizationRoleEnums.ORGANIZATION_ADMIN);
      expect(result).toBe(true);
    });

    it('should return true when target document is personal', async () => {
      const params = {
        actorId: 'actor1',
        targetId: 'target1',
        document: { _id: 'doc1' } as any
      };
      
      const actorDocPermission = { membershipRole: OrganizationRoleEnums.MEMBER };
      const targetDocPermission = { permissionType: DocumentOwnerTypeEnum.PERSONAL };
      
      const mockCheckExistedDocPermission = jest.fn()
        .mockResolvedValueOnce(actorDocPermission)
        .mockResolvedValueOnce(targetDocPermission);
      const mockIsOrgOrTeamAdmin = jest.fn().mockReturnValue(false);
      
      documentService = new (class {
        checkExistedDocPermission = mockCheckExistedDocPermission;
        organizationService = { isOrgOrTeamAdmin: mockIsOrgOrTeamAdmin };
        canAcceptOrRejectRequest = DocumentService.prototype.canAcceptOrRejectRequest;
      })() as any;
      
      const result = await documentService.canAcceptOrRejectRequest(params);
      
      expect(result).toBe(true);
    });

    it('should return false when actor is not manager and target is not personal', async () => {
      const params = {
        actorId: 'actor1',
        targetId: 'target1',
        document: { _id: 'doc1' } as any
      };
      
      const actorDocPermission = { membershipRole: OrganizationRoleEnums.MEMBER };
      const targetDocPermission = { permissionType: DocumentOwnerTypeEnum.ORGANIZATION };
      
      const mockCheckExistedDocPermission = jest.fn()
        .mockResolvedValueOnce(actorDocPermission)
        .mockResolvedValueOnce(targetDocPermission);
      const mockIsOrgOrTeamAdmin = jest.fn().mockReturnValue(false);
      
      documentService = new (class {
        checkExistedDocPermission = mockCheckExistedDocPermission;
        organizationService = { isOrgOrTeamAdmin: mockIsOrgOrTeamAdmin };
        canAcceptOrRejectRequest = DocumentService.prototype.canAcceptOrRejectRequest;
      })() as any;
      
      const result = await documentService.canAcceptOrRejectRequest(params);
      
      expect(result).toBe(false);
    });
  });

  describe('removeRequestsAfterPermissionChanged', () => {
    it('should remove requests when new role has higher priority', async () => {
      const params = {
        documentId: 'doc1',
        users: [
          { _id: 'user1', requestRole: DocumentRoleEnum.VIEWER },
          { _id: 'user2', requestRole: DocumentRoleEnum.SHARER }
        ],
        newRole: DocumentRoleEnum.VIEWER
      };
      
      const mockRemoveRequestAccessDocument = jest.fn();
      
      documentService = new (class {
        removeRequestAccessDocument = mockRemoveRequestAccessDocument;
        removeRequestsAfterPermissionChanged = DocumentService.prototype.removeRequestsAfterPermissionChanged;
      })() as any;
      
      await documentService.removeRequestsAfterPermissionChanged(params);
      
      expect(mockRemoveRequestAccessDocument).toHaveBeenCalledWith(['user1'], 'doc1');
    });

    it('should not remove requests when new role has lower priority', async () => {
      const params = {
        documentId: 'doc1',
        users: [
          { _id: 'user1', requestRole: DocumentRoleEnum.VIEWER },
          { _id: 'user2', requestRole: DocumentRoleEnum.EDITOR }
        ],
        newRole: DocumentRoleEnum.SHARER
      };
      
      const mockRemoveRequestAccessDocument = jest.fn();
      
      documentService = new (class {
        removeRequestAccessDocument = mockRemoveRequestAccessDocument;
        removeRequestsAfterPermissionChanged = DocumentService.prototype.removeRequestsAfterPermissionChanged;
      })() as any;
      
      await documentService.removeRequestsAfterPermissionChanged(params);
      
      expect(mockRemoveRequestAccessDocument).toHaveBeenCalledWith(['user1', 'user2'], 'doc1');
    });

    it('should not remove requests when no users have request roles', async () => {
      const params = {
        documentId: 'doc1',
        users: [
          { _id: 'user1' },
          { _id: 'user2' }
        ],
        newRole: DocumentRoleEnum.VIEWER
      };
      
      const mockRemoveRequestAccessDocument = jest.fn();
      
      documentService = new (class {
        removeRequestAccessDocument = mockRemoveRequestAccessDocument;
        removeRequestsAfterPermissionChanged = DocumentService.prototype.removeRequestsAfterPermissionChanged;
      })() as any;
      
      await documentService.removeRequestsAfterPermissionChanged(params);
      
      expect(mockRemoveRequestAccessDocument).not.toHaveBeenCalled();
    });
  });

  describe('getNewAnnotationOrder', () => {
    it('should return default order when annotation count is less than 2', async () => {
      const params = {
        annotationId: 'annot1',
        documentId: 'doc1',
        reorderType: ReorderType.FRONT
      };
      
      const mockCountDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(1)
      });
      
      documentService = new (class {
        documentAnnotationModel = { countDocuments: mockCountDocuments };
        getNewAnnotationOrder = DocumentService.prototype.getNewAnnotationOrder;
      })() as any;
      
      const result = await documentService.getNewAnnotationOrder(params);
      
      expect(result).toBe(DEFAULT_ANNOT_ORDER);
    });

    it('should return new order when moving to front', async () => {
      const params = {
        annotationId: 'annot1',
        documentId: 'doc1',
        reorderType: ReorderType.FRONT
      };
      
      const mockCountDocuments = jest.fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(5) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(1) });
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([{ order: 3 }])
          })
        })
      });
      const mockFindOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ order: 2 })
      });
      
      documentService = new (class {
        documentAnnotationModel = { 
          countDocuments: mockCountDocuments,
          find: mockFind,
          findOne: mockFindOne
        };
        getNewAnnotationOrder = DocumentService.prototype.getNewAnnotationOrder;
      })() as any;
      
      const result = await documentService.getNewAnnotationOrder(params);
      
      expect(result).toBe(4);
    });

    it('should return new order when moving to back', async () => {
      const params = {
        annotationId: 'annot1',
        documentId: 'doc1',
        reorderType: ReorderType.BACK
      };
      
      const mockCountDocuments = jest.fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(5) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(1) });
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([{ order: 3 }])
          })
        })
      });
      const mockFindOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ order: 2 })
      });
      
      documentService = new (class {
        documentAnnotationModel = { 
          countDocuments: mockCountDocuments,
          find: mockFind,
          findOne: mockFindOne
        };
        getNewAnnotationOrder = DocumentService.prototype.getNewAnnotationOrder;
      })() as any;
      
      const result = await documentService.getNewAnnotationOrder(params);
      
      expect(result).toBe(2);
    });

    it('should return newOrder when currentAnnotation is undefined', async () => {
      const params = {
        annotationId: 'annot1',
        documentId: 'doc1',
        reorderType: ReorderType.FRONT
      };
      const mockCountDocuments = jest.fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(5) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(1) });
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([{ order: 3 }])
          })
        })
      });
    
      const mockFindOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined)
      });
    
      documentService = new (class {
        documentAnnotationModel = { 
          countDocuments: mockCountDocuments,
          find: mockFind,
          findOne: mockFindOne
        };
        getNewAnnotationOrder = DocumentService.prototype.getNewAnnotationOrder;
      })() as any;
    
      const result = await documentService.getNewAnnotationOrder(params);
    
      expect(result).toBe(4);
    });
    
    it('should return same order when isUniqueOrder is true and currentAnnotation.order equals order', async () => {
      const params = {
        annotationId: 'annot1',
        documentId: 'doc1',
        reorderType: ReorderType.FRONT
      };
      const mockCountDocuments = jest.fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(5) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(1) });
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([{ order: 3 }])
          })
        })
      });
    
      const mockFindOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ order: 3 })
      });
    
      documentService = new (class {
        documentAnnotationModel = { 
          countDocuments: mockCountDocuments,
          find: mockFind,
          findOne: mockFindOne
        };
        getNewAnnotationOrder = DocumentService.prototype.getNewAnnotationOrder;
      })() as any;
    
      const result = await documentService.getNewAnnotationOrder(params);
    
      expect(result).toBe(3);
    });  
  });

  describe('migrateDocumentsToOrgPersonal', () => {
    it('should migrate documents and return modified count', async () => {
      const userId = 'user1';
      const orgId = 'org1';
      
      const mockUpdateMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 5 })
      });
      
      documentService = new (class {
        documentPermissionModel = { updateMany: mockUpdateMany };
        migrateDocumentsToOrgPersonal = DocumentService.prototype.migrateDocumentsToOrgPersonal;
      })() as any;
      
      const result = await documentService.migrateDocumentsToOrgPersonal(userId, orgId);
      
      expect(mockUpdateMany).toHaveBeenCalledWith(
        {
          refId: userId,
          role: DocumentRoleEnum.OWNER,
          workspace: { $exists: false }
        },
        {
          workspace: {
            refId: orgId,
            type: DocumentWorkspace.ORGANIZATION
          }
        },
        { returnDocument: 'after' }
      );
      expect(result).toBe(5);
    });
  });

  describe('getDocumentsPersonalWorkspace', () => {
    let documentService: DocumentService;
    let userService: any;
    let folderService: any;
    let environmentService: any;
    let mockQueryManager: any;

    beforeEach(() => {
      userService = {
        findUserById: jest.fn(),
      };
      folderService = {
        findFolderById: jest.fn(),
      };
      environmentService = {
        getByKey: jest.fn(),
      };
      
      mockQueryManager = {
        of: jest.fn().mockReturnThis(),
        injectPremiumMap: jest.fn().mockReturnThis(),
        getDocuments: jest.fn(),
      };
      mockQueryManager.getDocuments.mockClear();
      
      documentService = new (class {
        getDocumentsPersonalWorkspace = DocumentService.prototype.getDocumentsPersonalWorkspace;
        userService = userService;
        folderService = folderService;
        environmentService = environmentService;
        splitDocumentCursor = jest.fn().mockReturnValue({
          lastAccessCursor: Date.now(),
          documentIdCursor: 'docId123',
        });
        getDocumentPermissionInBatch = jest.fn().mockResolvedValue([]);
        generateSearchDocumentKeyRegex = jest.fn().mockReturnValue(/test/i);
        getDocumentInPermissionPagination = jest.fn().mockResolvedValue([
          [
            { _id: 'doc1', name: 'Document 1', ownerId: { toHexString: () => 'user1' }, folderId: 'folder1' },
            { _id: 'doc2', name: 'Document 2', ownerId: { toHexString: () => 'user2' }, folderId: 'folder2' },
          ],
          2
        ]);
        countTotalDocumentByIds = jest.fn().mockResolvedValue(0);
      })() as any;
    });

    it('should get documents for personal workspace with default parameters', async () => {
      const user = { _id: '507f1f77bcf86cd799439011', name: 'Test User' } as any;
      const params = {
        user,
        query: {},
        filter: {
          ownedFilterCondition: 'ALL',
          lastModifiedFilterCondition: 'ALL',
        },
        tab: 'MY_DOCUMENT',
      };

      const mockResult = {
        documents: [
          { _id: 'doc1', name: 'Document 1', ownerId: { toHexString: () => 'user1' }, folderId: 'folder1' },
          { _id: 'doc2', name: 'Document 2', ownerId: { toHexString: () => 'user2' }, folderId: 'folder2' },
        ],
        hasNextPage: false,
        cursor: '',
        total: 2,
      };

      const result = await documentService.getDocumentsPersonalWorkspace(params as any);

      expect(result).toBe(undefined);
    });

    it ('should get {} when query is empty', async () => {
      const user = { _id: '507f1f77bcf86cd799439011', name: 'Test User' } as any;
      const params = {
        user,
        filter: {
          ownedFilterCondition: 'ALL',
          lastModifiedFilterCondition: 'ALL',
        },
        tab: 'MY_DOCUMENT',
      };
      const result = await documentService.getDocumentsPersonalWorkspace(params as any);

      expect(result).toBe(undefined);
    });
  });
  
  describe('getPersonalPaymentInfo', () => {
    it('should return user payment when no workspace', async () => {
      const documentId = 'doc1';
      const ownerId = 'owner1';
      
      const docPerm = { workspace: null };
      const user = { payment: { type: 'free' } };
      
      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue([docPerm]);
      const mockFindUserById = jest.fn().mockResolvedValue(user);
      
      documentService = new (class {
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        userService = { findUserById: mockFindUserById };
        getPersonalPaymentInfo = DocumentService.prototype.getPersonalPaymentInfo;
      })() as any;
      
      const result = await documentService.getPersonalPaymentInfo(documentId, ownerId);
      
      expect(mockGetDocumentPermissionByConditions).toHaveBeenCalledWith({
        documentId,
        role: DocumentRoleEnum.OWNER
      });
      expect(mockFindUserById).toHaveBeenCalledWith(ownerId, { _id: 1, payment: 1 });
      expect(result).toEqual({ type: 'free' });
    });

    it('should return org payment when workspace exists', async () => {
      const documentId = 'doc1';
      const ownerId = 'owner1';
      const docPerm = { workspace: { refId: 'org1' } };
      const org = { payment: { type: 'premium' } };
      
      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue([docPerm]);
      const mockGetOrgById = jest.fn().mockResolvedValue(org);
      
      documentService = new (class {
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        organizationService = { getOrgById: mockGetOrgById };
        getPersonalPaymentInfo = DocumentService.prototype.getPersonalPaymentInfo;
      })() as any;
      
      const result = await documentService.getPersonalPaymentInfo(documentId, ownerId);
      
      expect(mockGetOrgById).toHaveBeenCalledWith('org1', { _id: 1, payment: 1 });
      expect(result).toEqual({ type: 'premium' });
    });
  });

  describe('getOrganizationPaymentInfo', () => {
    it('should return team org payment for ORGANIZATION_TEAM role', async () => {
      const documentId = 'doc1';
      const organizationDocumentPermission = {
        role: DocumentRoleEnum.ORGANIZATION_TEAM,
        refId: 'team1'
      };
      const team = { belongsTo: 'org1' };
      const org = { payment: { type: 'premium' } };
      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue([organizationDocumentPermission]);
      const mockFindOneById = jest.fn().mockResolvedValue(team);
      const mockGetOrgById = jest.fn().mockResolvedValue(org);
      
      documentService = new (class {
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        teamService = { findOneById: mockFindOneById };
        organizationService = { getOrgById: mockGetOrgById };
        getOrganizationPaymentInfo = DocumentService.prototype.getOrganizationPaymentInfo;
      })() as any;
      
      const result = await documentService.getOrganizationPaymentInfo(documentId);
      
      expect(mockFindOneById).toHaveBeenCalledWith('team1', { _id: 1, belongsTo: 1 });
      expect(mockGetOrgById).toHaveBeenCalledWith('org1', { _id: 1, payment: 1 });
      expect(result).toEqual({ type: 'premium' });
    });

    it('should return org payment for ORGANIZATION role', async () => {
      const documentId = 'doc1';
      const organizationDocumentPermission = {
        role: DocumentRoleEnum.ORGANIZATION,
        refId: 'org1'
      };
      const org = { payment: { type: 'premium' } };
      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue([organizationDocumentPermission]);
      const mockGetOrgById = jest.fn().mockResolvedValue(org);
      
      documentService = new (class {
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        organizationService = { getOrgById: mockGetOrgById };
        getOrganizationPaymentInfo = DocumentService.prototype.getOrganizationPaymentInfo;
      })() as any;
      
      const result = await documentService.getOrganizationPaymentInfo(documentId);
      
      expect(mockGetOrgById).toHaveBeenCalledWith('org1', { _id: 1, payment: 1 });
      expect(result).toEqual({ type: 'premium' });
    });

    it('should return empty object for unknown role', async () => {
      const documentId = 'doc1';
      const organizationDocumentPermission = {
        role: DocumentRoleEnum.OWNER,
        refId: 'user1'
      };
      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue([organizationDocumentPermission]);
      
      documentService = new (class {
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        getOrganizationPaymentInfo = DocumentService.prototype.getOrganizationPaymentInfo;
      })() as any;
      
      const result = await documentService.getOrganizationPaymentInfo(documentId);
      
      expect(result).toEqual({});
    });
  });

  describe('getPaymentInfoOfDocument', () => {
    it('should return personal payment info for personal document', async () => {
      const document = { isPersonal: true, _id: 'doc1', ownerId: 'owner1' } as any;
      const payment = { type: 'free' };
      const mockGetPersonalPaymentInfo = jest.fn().mockResolvedValue(payment);
      
      documentService = new (class {
        getPersonalPaymentInfo = mockGetPersonalPaymentInfo;
        getPaymentInfoOfDocument = DocumentService.prototype.getPaymentInfoOfDocument;
      })() as any;
      
      const result = await documentService.getPaymentInfoOfDocument(document);
      
      expect(mockGetPersonalPaymentInfo).toHaveBeenCalledWith('doc1', 'owner1');
      expect(result).toEqual(payment);
    });

    it('should return organization payment info for non-personal document', async () => {
      const document = { isPersonal: false, _id: 'doc1', ownerId: 'owner1' } as any;
      const payment = { type: 'premium' };
      const mockGetOrganizationPaymentInfo = jest.fn().mockResolvedValue(payment);
      
      documentService = new (class {
        getOrganizationPaymentInfo = mockGetOrganizationPaymentInfo;
        getPaymentInfoOfDocument = DocumentService.prototype.getPaymentInfoOfDocument;
      })() as any;
      
      const result = await documentService.getPaymentInfoOfDocument(document);
      
      expect(mockGetOrganizationPaymentInfo).toHaveBeenCalledWith('doc1');
      expect(result).toEqual(payment);
    });
  });

  describe('isSharedDocument', () => {
    it('should return true for personal shared document', async () => {
      const userId = 'user1';
      const document = { _id: 'doc1', isPersonal: true, shareSetting: {} } as any;
      const mockIsPersonalSharedDocument = jest.fn().mockResolvedValue(true);

      documentService = new (class {
        isPersonalSharedDocument = mockIsPersonalSharedDocument;
        isSharedDocument = DocumentService.prototype.isSharedDocument;
      })() as any;

      const result = await documentService.isSharedDocument({ userId, document });

      expect(mockIsPersonalSharedDocument).toHaveBeenCalledWith(userId, document);
      expect(result).toBe(true);
    });

    it('should return result from organization shared document check', async () => {
      const userId = 'user1';
      const document = { _id: 'doc1', isPersonal: false, shareSetting: {} } as any;
      const mockIsOrganizationSharedDocument = jest.fn().mockResolvedValue(false);

      documentService = new (class {
        isOrganizationSharedDocument = mockIsOrganizationSharedDocument;
        isSharedDocument = DocumentService.prototype.isSharedDocument;
      })() as any;

      const result = await documentService.isSharedDocument({ userId, document });

      expect(mockIsOrganizationSharedDocument).toHaveBeenCalledWith(userId, document);
      expect(result).toBe(false);
    });
  });

  describe('getPremiumToolInfo', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    
      (planPoliciesHandler.from as jest.Mock).mockImplementation(({ plan }) => {
        return {
          getAllPlanRules: jest.fn().mockReturnValue(
            plan === 'premium' ? { maxSize: 10000 } : { maxSize: 2000 }
          ),
        };
      });
    });
    
    it('should return premium tool info for shared document', async () => {
      const document = { _id: 'doc1', ownerId: 'owner1', isPersonal: true, size: 1000, service: 's3', mimeType: 'pdf', shareSetting: {} } as any;
      const userId = 'user1';
      const mockIsSharedDocument = jest.fn().mockResolvedValue(true);
      const mockGetPremiumToolInfoAvailableForUser = jest.fn().mockResolvedValue({ maxSize: 5000 });

      documentService = new (class {
        isSharedDocument = mockIsSharedDocument;
        getPremiumToolInfoAvailableForUser = mockGetPremiumToolInfoAvailableForUser;
        getPremiumToolInfo = DocumentService.prototype.getPremiumToolInfo;
      })() as any;

      const result = await documentService.getPremiumToolInfo({ document, userId });

      expect(mockIsSharedDocument).toHaveBeenCalledWith({ userId, document });
      expect(mockGetPremiumToolInfoAvailableForUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ maxSize: 5000 });
    });

    it('should return premium tool info based on payment for non-shared document', async () => {
      const document = { _id: 'doc1', ownerId: 'owner1', isPersonal: true, size: 1000, service: 's3', mimeType: 'pdf', shareSetting: {} } as any;
      const userId = 'user1';
      const mockIsSharedDocument = jest.fn().mockResolvedValue(false);
      const mockGetPaymentInfoOfDocument = jest.fn().mockResolvedValue({ type: 'premium', planRemoteId: 'plan1', period: 'monthly' });
      const mockGetMaximumNumberSignature = jest.fn().mockResolvedValue(5);
      const mockPlanPoliciesHandler = {
        from: jest.fn().mockReturnValue({
          getAllPlanRules: jest.fn().mockReturnValue({ maxSize: 10000 })
        })
      };
      (global as any).planPoliciesHandler = mockPlanPoliciesHandler;
    
      documentService = new (class {
        isSharedDocument = mockIsSharedDocument;
        getPaymentInfoOfDocument = mockGetPaymentInfoOfDocument;
        paymentService = { getPriceVersion: jest.fn().mockReturnValue('v1') };
        userService = { getMaximumNumberSignature: mockGetMaximumNumberSignature };
        asymmetricJwtService = { sign: jest.fn().mockResolvedValue('signed-token') };
        getPremiumToolInfo = DocumentService.prototype.getPremiumToolInfo;
      })() as any;
    
      const result = await documentService.getPremiumToolInfo({ document, userId });
    
      expect(mockIsSharedDocument).toHaveBeenCalledWith({ userId, document });
      expect(mockGetPaymentInfoOfDocument).toHaveBeenCalledWith(document);
      expect(result).toEqual({
        maxSize: 10000,
        priceVersion: 'v1',
        maximumNumberSignature: 5,
        signedResponse: 'signed-token',
      });
    });
    

    it('should return premium tool info with FREE_PLAN when no userId', async () => {
      const document = { 
        _id: 'doc1',
        ownerId: 'owner1',
        isPersonal: true,
        size: 1000,
        service: 's3',
        mimeType: 'pdf',
        shareSetting: {}
      } as any;
    
      const mockIsSharedDocument = jest.fn().mockResolvedValue(false);
      const mockGetPaymentInfoOfDocument = jest.fn().mockResolvedValue({ 
        type: 'basic', 
        planRemoteId: 'plan-free', 
        period: 'monthly' 
      });
      const mockPlanPoliciesHandler = {
        from: jest.fn().mockReturnValue({
          getAllPlanRules: jest.fn().mockReturnValue({ maxSize: 2000 })
        })
      };
      (global as any).planPoliciesHandler = mockPlanPoliciesHandler;
    
      documentService = new (class {
        isSharedDocument = mockIsSharedDocument;
        getPaymentInfoOfDocument = mockGetPaymentInfoOfDocument;
        paymentService = { getPriceVersion: jest.fn().mockReturnValue('vFree') };
        userService = { getMaximumNumberSignature: jest.fn() };
        getPremiumToolInfo = DocumentService.prototype.getPremiumToolInfo;
        asymmetricJwtService = { sign: jest.fn().mockResolvedValue('signed-free-token') };
      })() as any;
    
      const result = await documentService.getPremiumToolInfo({ document, userId: undefined as any });
    
      expect(mockIsSharedDocument).toHaveBeenCalledWith({ userId: undefined, document });
      expect(mockGetPaymentInfoOfDocument).toHaveBeenCalledWith(document);
      expect(result).toEqual({
        maxSize: 2000,
        priceVersion: 'vFree',
        maximumNumberSignature: MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN,
        signedResponse: 'signed-free-token',
      });
    });
  });
    
  describe('getPremiumToolInfoAvailableForUser', () => {
    let documentService: DocumentService;
    let mockUserService: any;
    let mockOrganizationService: any;

    beforeEach(() => {
      mockUserService = {
        findUserById: jest.fn(),
      };
      mockOrganizationService = {
        getOrgListByUser: jest.fn(),
      };
      const mockAsymmetricJwtService = {
        sign: jest.fn().mockResolvedValue('signed-token'),
      };
      documentService = new (class {
        userService = mockUserService;
        organizationService = mockOrganizationService;
        asymmetricJwtService = mockAsymmetricJwtService;
        getPremiumToolInfoAvailableForUser = DocumentService.prototype.getPremiumToolInfoAvailableForUser;
      })() as any;
      
      jest.clearAllMocks();

      (planPoliciesHandler.from as jest.Mock).mockImplementation(({ plan }) => {
        return {
          getAllPlanRules: () => ({ someRule: plan === 'pro' ? 2 : 1 }),
          getNumberSignature: () => (plan === 'pro' ? 50 : 10),
          getCompressPdfSizeLimitInMB: () => (plan === 'pro' ? 200 : 50),
          getDocumentSummarizationPermission: () => ({
            enabled: plan === 'pro',
            maxPages: plan === 'pro' ? 100 : 10,
          }),
          getAIChatbotDailyLimit: () => (plan === 'pro' ? 30 : 5),
        };
      });
    });

    it('should return merged premium tools info with max values', async () => {
      const userId = 'user1';
      mockUserService.findUserById.mockResolvedValue({
        _id: userId,
        payment: { type: 'basic', period: 'month' },
      });
      mockOrganizationService.getOrgListByUser.mockResolvedValue([
        { _id: 'org1', payment: { type: 'pro', period: 'year' } },
      ]);

      const result = await documentService.getPremiumToolInfoAvailableForUser(userId);

      expect(result).toHaveProperty('maximumNumberSignature', 50);
      expect(result.aiChatbot.daily).toBe(30);
      expect(result.compressPdf.fileSizeLimitInMB).toBe(200);
      expect(result.compressPdf.availableCompressQuality).toEqual([
        AvailableCompressQuality.STANDARD,
        AvailableCompressQuality.MAXIMUM,
      ]);
      expect(result.documentSummarization.enabled).toBe(true);
      expect(result.documentSummarization.maxPages).toBe(100);
    });

    it('should work with only user payment when no orgs', async () => {
      const userId = 'user2';
      mockUserService.findUserById.mockResolvedValue({
        _id: userId,
        payment: { type: 'basic', period: 'month' },
      });
      mockOrganizationService.getOrgListByUser.mockResolvedValue([]);

      const result = await documentService.getPremiumToolInfoAvailableForUser(userId);

      expect(result.maximumNumberSignature).toBe(10);
      expect(result.aiChatbot.daily).toBe(5);
      expect(result.compressPdf.fileSizeLimitInMB).toBe(50);
      expect(result.compressPdf.availableCompressQuality).toEqual([
        AvailableCompressQuality.STANDARD,
        AvailableCompressQuality.MAXIMUM,
      ]);
      expect(result.documentSummarization.enabled).toBe(false);
      expect(result.documentSummarization.maxPages).toBe(10);
    });

    it('should return only STANDARD quality when fileSizeLimit is small', async () => {
      (planPoliciesHandler.from as jest.Mock).mockImplementation(({ plan }) => {
        return {
          getAllPlanRules: () => ({}),
          getNumberSignature: () => 1,
          getCompressPdfSizeLimitInMB: () => 10,
          getDocumentSummarizationPermission: () => ({ enabled: false, maxPages: 5 }),
          getAIChatbotDailyLimit: () => 1,
        };
      });
    
      const userId = 'user4';
      mockUserService.findUserById.mockResolvedValue({
        _id: userId,
        payment: { type: 'basic', period: 'month' },
      });
      mockOrganizationService.getOrgListByUser.mockResolvedValue([]);
    
      const result = await documentService.getPremiumToolInfoAvailableForUser(userId);
    
      expect(result.compressPdf.availableCompressQuality).toEqual([
        AvailableCompressQuality.STANDARD,
      ]);
    });

    it('should merge documentSummarization.enabled correctly when one org has enabled=true', async () => {
      const userId = 'user5';
      mockUserService.findUserById.mockResolvedValue({
        _id: userId,
        payment: { type: 'basic', period: 'month' },
      });
      mockOrganizationService.getOrgListByUser.mockResolvedValue([
        { _id: 'org1', payment: { type: 'pro', period: 'year' } },
      ]);
    
      const result = await documentService.getPremiumToolInfoAvailableForUser(userId);
    
      expect(result.documentSummarization.enabled).toBe(true);
    });
    
    it('should merge plan rules by taking the higher value', async () => {
      (planPoliciesHandler.from as jest.Mock).mockImplementation(({ plan }) => {
        return {
          getAllPlanRules: () => ({ someRule: plan === 'pro' ? 3 : 1 }),
          getNumberSignature: () => (plan === 'pro' ? 20 : 5),
          getCompressPdfSizeLimitInMB: () => (plan === 'pro' ? 100 : 10),
          getDocumentSummarizationPermission: () => ({ enabled: false, maxPages: 1 }),
          getAIChatbotDailyLimit: () => (plan === 'pro' ? 10 : 1),
        };
      });
    
      const userId = 'user6';
      mockUserService.findUserById.mockResolvedValue({
        _id: userId,
        payment: { type: 'basic', period: 'month' },
      });
      mockOrganizationService.getOrgListByUser.mockResolvedValue([
        { _id: 'org1', payment: { type: 'pro', period: 'year' } }, 
      ]);
    
      const result = await documentService.getPremiumToolInfoAvailableForUser(userId);
      expect((result as any).someRule).toBe(3);
    });

    it('should merge rules correctly (cover both dest > other and other branch)', async () => {
      const userId = 'user4';
      mockUserService.findUserById.mockResolvedValue({
        _id: userId,
        payment: { type: 'basic', period: 'month' },
      });
      mockOrganizationService.getOrgListByUser.mockResolvedValue([
        { _id: 'org1', payment: { type: 'pro', period: 'year' } },
        { _id: 'org2', payment: { type: 'enterprise', period: 'year' } },
      ]);
    
      (planPoliciesHandler.from as jest.Mock).mockImplementation(({ plan }) => {
        if (plan === 'basic') {
          return {
            getAllPlanRules: () => ({ mergeValue: 1 }),
            getNumberSignature: () => 5,
            getCompressPdfSizeLimitInMB: () => 10,
            getDocumentSummarizationPermission: () => ({ enabled: false, maxPages: 5 }),
            getAIChatbotDailyLimit: () => 1,
          };
        }
        if (plan === 'pro') {
          return {
            getAllPlanRules: () => ({ mergeValue: 5 }),
            getNumberSignature: () => 20,
            getCompressPdfSizeLimitInMB: () => 100,
            getDocumentSummarizationPermission: () => ({ enabled: true, maxPages: 50 }),
            getAIChatbotDailyLimit: () => 10,
          };
        }
        return {
          getAllPlanRules: () => ({ mergeValue: 10 }),
          getNumberSignature: () => 30,
          getCompressPdfSizeLimitInMB: () => 200,
          getDocumentSummarizationPermission: () => ({ enabled: true, maxPages: 100 }),
          getAIChatbotDailyLimit: () => 20,
        };
      });
    
      const result = await documentService.getPremiumToolInfoAvailableForUser(userId);
    
      expect((result as any).mergeValue).toBe(10);
      expect((result as any).compressPdf.availableCompressQuality).toContain(AvailableCompressQuality.MAXIMUM);
    });
    
  });

  describe('getDataXfdfAndEventName', () => {
    it('should return sanitized data for comment annotation', () => {
      const commentInteractionEvent = DocumentEventNames.DOCUMENT_COMMENTED;
      const xfdf = '<content>Test comment</content>';
      const annotationType = DocumentAnnotationTypeEnum.COMMENT;

      (global as any).DOMPurify = {
        sanitize: jest.fn().mockImplementation((input) => `<content>Sanitized comment</content>`)
      };

      documentService = new (class {
        getDataXfdfAndEventName = DocumentService.prototype.getDataXfdfAndEventName;
      })() as any;

      const result = documentService.getDataXfdfAndEventName(commentInteractionEvent, xfdf, annotationType);

      expect(result.dataXFDF).toBe('<content>Test comment</content>');
      expect(result.eventName).toBe(commentInteractionEvent);
    });

    it('should return sanitized data for free text annotation', () => {
      const commentInteractionEvent = DocumentEventNames.DOCUMENT_ANNOTATED;
      const xfdf = '<span>Free text</span>';
      const annotationType = DocumentAnnotationTypeEnum.FREE_TEXT;

      (global as any).DOMPurify = {
        sanitize: jest.fn().mockImplementation((input) => `<span>Sanitized text</span>`)
      };

      documentService = new (class {
        getDataXfdfAndEventName = DocumentService.prototype.getDataXfdfAndEventName;
      })() as any;

      const result = documentService.getDataXfdfAndEventName(commentInteractionEvent, xfdf, annotationType);

      expect(result.dataXFDF).toBe('<span>Free text</span>');
      expect(result.eventName).toBe('DOCUMENT_ANNOTATED');
    });

    it('should return signature event for signature annotation', () => {
      const commentInteractionEvent = DocumentEventNames.DOCUMENT_ANNOTATED;
      const xfdf = 'signature data';
      const annotationType = DocumentAnnotationTypeEnum.SIGNATURE;

      documentService = new (class {
        getDataXfdfAndEventName = DocumentService.prototype.getDataXfdfAndEventName;
      })() as any;

      const result = documentService.getDataXfdfAndEventName(commentInteractionEvent, xfdf, annotationType);

      expect(result.dataXFDF).toBe(xfdf);
      expect(result.eventName).toBe(DocumentEventNames.DOCUMENT_SIGNED);
    });

    it('should return default event and data when annotation type is unknown', () => {
      const commentInteractionEvent = DocumentEventNames.DOCUMENT_ANNOTATED;
      const xfdf = '<unknown>Data</unknown>';
      const annotationType = 'UNKNOWN' as any;
    
      documentService = new (class {
        getDataXfdfAndEventName = DocumentService.prototype.getDataXfdfAndEventName;
      })() as any;
    
      const result = documentService.getDataXfdfAndEventName(commentInteractionEvent, xfdf, annotationType);
    
      expect(result.dataXFDF).toBe(xfdf);
      expect(result.eventName).toBe(DocumentEventNames.DOCUMENT_ANNOTATED);
    });
  });

  describe('getTargetOwnedDocumentInfo', () => {
    let documentService: DocumentService;
    let mockOrganizationService: any;
    let mockTeamService: any;
  
    beforeEach(() => {
      mockOrganizationService = {
        getOrgById: jest.fn(),
      };
      mockTeamService = {
        findOneById: jest.fn(),
      };
  
      documentService = new (class {
        organizationService = mockOrganizationService;
        teamService = mockTeamService;
        getDocumentPermissionByGroupRole = jest.fn();
        getTargetOwnedDocumentInfo = DocumentService.prototype.getTargetOwnedDocumentInfo;
      })() as any;
    });
  
    it('should return null if no docPermission', async () => {
      (documentService.getDocumentPermissionByGroupRole as jest.Mock).mockResolvedValue(null);
  
      const result = await documentService.getTargetOwnedDocumentInfo('doc1');
      expect(result).toBeNull();
    });
  
    it('should handle OWNER role and fetch org by workspace.refId', async () => {
      (documentService.getDocumentPermissionByGroupRole as jest.Mock).mockResolvedValue({
        role: DocumentRoleEnum.OWNER,
        workspace: { refId: 'org123' },
      });
      mockOrganizationService.getOrgById.mockResolvedValue({ _id: 'org123', domain: 'example.com', associateDomains: ['a.com'] });
  
      const result = await documentService.getTargetOwnedDocumentInfo('doc1');
  
      expect(mockOrganizationService.getOrgById).toHaveBeenCalledWith('org123', expect.any(Object));
      expect(result._id).toBe('org123');
      expect(result.domain).toBe('example.com');
      expect(result.associateDomains).toEqual(['a.com']);
    });
  
    it('should handle ORGANIZATION role and fetch org by refId', async () => {
      (documentService.getDocumentPermissionByGroupRole as jest.Mock).mockResolvedValue({
        role: DocumentRoleEnum.ORGANIZATION,
        refId: 'org456',
      });
      mockOrganizationService.getOrgById.mockResolvedValue({ _id: 'org456', domain: 'org.com', associateDomains: [] });
  
      const result = await documentService.getTargetOwnedDocumentInfo('doc2');
  
      expect(mockOrganizationService.getOrgById).toHaveBeenCalledWith('org456', expect.any(Object));
      expect(result._id).toBe('org456');
      expect(result.domain).toBe('org.com');
    });
  
    it('should handle ORGANIZATION_TEAM role and fetch org by team.belongsTo', async () => {
      (documentService.getDocumentPermissionByGroupRole as jest.Mock).mockResolvedValue({
        role: DocumentRoleEnum.ORGANIZATION_TEAM,
        refId: 'team789',
      });
      mockTeamService.findOneById.mockResolvedValue({ belongsTo: 'org999' });
      mockOrganizationService.getOrgById.mockResolvedValue({ _id: 'org999', domain: 'teamorg.com', associateDomains: ['x.com'] });
  
      const result = await documentService.getTargetOwnedDocumentInfo('doc3');
  
      expect(mockTeamService.findOneById).toHaveBeenCalledWith('team789', { belongsTo: 1 });
      expect(mockOrganizationService.getOrgById).toHaveBeenCalledWith('org999', expect.any(Object));
      expect(result._id).toBe('org999');
      expect(result.domain).toBe('teamorg.com');
      expect(result.associateDomains).toEqual(['x.com']);
    });

    it('should handle OWNER role without workspace.refId (org stays undefined)', async () => {
      (documentService.getDocumentPermissionByGroupRole as jest.Mock).mockResolvedValue({
        role: DocumentRoleEnum.OWNER,
        workspace: undefined,
      });
    
      const result = await documentService.getTargetOwnedDocumentInfo('doc4');
    
      expect(result._id).toBeUndefined();
      expect(result.info).toBeUndefined();
      expect(result.domain).toBeUndefined();
      expect(result.associateDomains).toBeUndefined();
    });
    
    it('should handle default case when role is unknown', async () => {
      (documentService.getDocumentPermissionByGroupRole as jest.Mock).mockResolvedValue({
        role: 'UNKNOWN_ROLE',
      });
    
      const result = await documentService.getTargetOwnedDocumentInfo('doc5');
    
      expect(result._id).toBeUndefined();
      expect(result.info).toBeUndefined();
      expect(result.domain).toBeUndefined();
      expect(result.associateDomains).toBeUndefined();
    });
    
  });
  
  describe('trackCreateFormEvents', () => {
    let documentService: DocumentService;
    let mockUserService: any;
    let mockPersonalEventService: any;
  
    beforeEach(() => {
      mockUserService = {
        findUserById: jest.fn(),
      };
      mockPersonalEventService = {
        createUserUseDocumentEvent: jest.fn(),
      };
      documentService = new (class {
        userService = mockUserService;
        personalEventService = mockPersonalEventService;
        trackCreateFormEvents = DocumentService.prototype.trackCreateFormEvents;
      })() as any;
    });
  
    it('should track create form events correctly', async () => {
      const mockUser = { _id: 'user1', name: 'Test User' };
      const mockDocument = { _id: 'doc1', title: 'My Doc' } as any;
      const mockSourceForm = { _id: 'form1' } as any;
  
      mockUserService.findUserById.mockResolvedValue(mockUser);
  
      await documentService.trackCreateFormEvents({
        userId: 'user1',
        document: mockDocument,
        sourceForm: mockSourceForm,
        prismicFormData: { remoteId: 'remote1', formPath: '/test/path' },
      });
  
      expect(mockUserService.findUserById).toHaveBeenCalledWith('user1');
  
      expect(mockPersonalEventService.createUserUseDocumentEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: 'DOCUMENT_USED',
          eventScope: 'PERSONAL',
          actor: mockUser,
          document: mockDocument,
        }),
      );
    });
  });
  
  describe('removeAllPersonalDocInOrg', () => {
    beforeEach(() => {
      documentService = new (class {
        getDocumentPermissionByConditions = jest.fn();
        findDocumentsByIds = jest.fn();
        deleteDocumentsInPersonal = jest.fn();
        removeAllPersonalDocInOrg = DocumentService.prototype.removeAllPersonalDocInOrg;
      })() as any;
    });
  
    it('should remove all personal documents in an organization', async () => {
      const mockUser = { _id: 'user1', name: 'Test User' } as any;
      const mockPermissions = [
        { documentId: 'doc1', role: 'OWNER', workspace: { refId: 'org1' } },
        { documentId: 'doc2', role: 'OWNER', workspace: { refId: 'org1' } },
      ] as any;
      const mockDocuments = [
        { _id: 'doc1', title: 'Doc 1' },
        { _id: 'doc2', title: 'Doc 2' },
      ];
  
      (documentService.getDocumentPermissionByConditions as jest.Mock).mockResolvedValue(mockPermissions);
      (documentService.findDocumentsByIds as jest.Mock).mockResolvedValue(mockDocuments);
  
      await documentService.removeAllPersonalDocInOrg(mockUser, 'org1');
  
      expect(documentService.getDocumentPermissionByConditions).toHaveBeenCalledWith({
        refId: mockUser._id,
        role: 'owner',
        'workspace.refId': 'org1',
      });
      expect(documentService.findDocumentsByIds).toHaveBeenCalledWith(['doc1', 'doc2']);
      expect(documentService.deleteDocumentsInPersonal).toHaveBeenCalledWith({
        actorInfo: mockUser,
        documentPermissionList: mockPermissions,
        documentList: mockDocuments,
        clientId: mockUser._id,
        isPersonalDocumentsInOrg: true,
      });
    });
  });

  describe('getDocumentLimitMapping', () => {
    let documentService: DocumentService;
  
    beforeEach(() => {
      documentService = new (class {
        getDocumentPermissionByConditions = jest.fn();
        getPremiumDocumentMapping = jest.fn();
        getDocumentLimitMapping = DocumentService.prototype.getDocumentLimitMapping;
      })() as any;
    });
  
    it('should return mapping with documents not limited', async () => {
      const mockDocuments = [
        { _id: 'doc1' },
        { _id: 'doc2' },
      ] as any;
  
      const mockPermissions = [
        { documentId: 'doc1', role: 'OWNER' },
        { documentId: 'doc2', role: 'EDITOR' },
      ] as any;
  
      (documentService.getDocumentPermissionByConditions as jest.Mock).mockResolvedValue(mockPermissions);
      (documentService.getPremiumDocumentMapping as jest.Mock)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
  
      const result = await documentService.getDocumentLimitMapping(mockDocuments);
  
      expect(documentService.getDocumentPermissionByConditions).toHaveBeenCalledWith({
        documentId: { $in: ['doc1', 'doc2'] },
        role: { $in: expect.any(Array) },
      });
  
      expect(documentService.getPremiumDocumentMapping).toHaveBeenCalledTimes(2);
  
      expect(result).toEqual({
        doc1: true,
        doc2: false,
      });
    });
  });  

  describe('checkThirdPartyStorage', () => {
    let documentService: any;
  
    beforeEach(() => {
      documentService = new (class {
        aggregateDocument = jest.fn();
        folderService = { findFolderByIds: jest.fn() };
        organizationService = { findOrganization: jest.fn() };
        checkThirdPartyStorage = DocumentService.prototype.checkThirdPartyStorage;
      })();
    });
  
    it('should return mapped documents with folder and organization', async () => {
      const user = { _id: new Types.ObjectId() };
      const mockDocs = [{
        _id: new Types.ObjectId(),
        remoteId: 'r1',
        service: 'GDRIVE',
        folderId: new Types.ObjectId('64b8f9f65f1b2c001f9e1234'),
        workspaceId: new Types.ObjectId('64b8f9f65f1b2c001f9e5678'),
      }];
  
      documentService.aggregateDocument.mockResolvedValue(mockDocs);
      documentService.folderService.findFolderByIds.mockResolvedValue([
        { _id: mockDocs[0].folderId.toHexString(), name: 'Folder A' },
      ]);
      documentService.organizationService.findOrganization.mockResolvedValue([
        { _id: mockDocs[0].workspaceId.toHexString(), name: 'Org A', url: 'org-a.com' },
      ]);
  
      const result = await documentService.checkThirdPartyStorage(user, ['r1']);
  
      expect(documentService.aggregateDocument).toHaveBeenCalled();
      expect(documentService.folderService.findFolderByIds).toHaveBeenCalledWith(
        [mockDocs[0].folderId.toHexString()],
        { _id: 1, name: 1 },
      );
      expect(documentService.organizationService.findOrganization).toHaveBeenCalled();
  
      expect(result).toEqual([
        {
          remoteId: 'r1',
          folder: { _id: mockDocs[0].folderId.toHexString(), name: 'Folder A' },
          organization: { _id: mockDocs[0].workspaceId.toHexString(), name: 'Org A', url: 'org-a.com' },
        },
      ]);
    });
  
    it('should return empty array when no documents found', async () => {
      (documentService.aggregateDocument as jest.Mock).mockResolvedValue([]);
      const result = await documentService.checkThirdPartyStorage({ _id: new Types.ObjectId() }, []);
      expect(result).toEqual([]);
    });
  });  

  describe('isPersonalSharedDocument', () => {
    it('should return true for non-owner role', async () => {
      const userId = 'user1';
      const document = { _id: 'doc1' } as any;
      const permission = { role: DocumentRoleEnum.VIEWER };

      const mockGetOneDocumentPermission = jest.fn().mockResolvedValue(permission);

      documentService = new (class {
        getOneDocumentPermission = mockGetOneDocumentPermission;
        isPersonalSharedDocument = DocumentService.prototype.isPersonalSharedDocument;
      })() as any;

      const result = await documentService.isPersonalSharedDocument(userId, document);

      expect(mockGetOneDocumentPermission).toHaveBeenCalledWith(userId, { documentId: 'doc1' });
      expect(result).toBe(true);
    });
  });

  describe('isOrganizationSharedDocument', () => {
    it('should return true for shared by link', async () => {
      const userId = 'user1';
      const document = { _id: 'doc1', shareSetting: { linkType: 'ANYONE' } } as any;

      documentService = new (class {
        getOneDocumentPermission = jest.fn().mockResolvedValue(null);
        getDocumentPermissionByConditions = jest.fn().mockResolvedValue([{ role: DocumentRoleEnum.ORGANIZATION, refId: 'org1' }]);
        organizationService = { 
          getMembershipByOrgAndUser: jest.fn().mockResolvedValue(false),
          getOrgById: jest.fn().mockResolvedValue({ _id: 'org1' })
        };
        isOrganizationSharedDocument = DocumentService.prototype.isOrganizationSharedDocument;
      })() as any;

      const result = await documentService.isOrganizationSharedDocument(userId, document);

      expect(result).toBe(true);
    });

    it('should return true for personal permission and not shared by link', async () => {
      const userId = 'user1';
      const document = { _id: 'doc1', shareSetting: { linkType: 'RESTRICTED' } } as any;
      const personalPermission = { role: DocumentRoleEnum.VIEWER };

      const mockGetOneDocumentPermission = jest.fn().mockResolvedValue(personalPermission);
      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue([]);

      documentService = new (class {
        getOneDocumentPermission = mockGetOneDocumentPermission;
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        isOrganizationSharedDocument = DocumentService.prototype.isOrganizationSharedDocument;
      })() as any;

      const result = await documentService.isOrganizationSharedDocument(userId, document);

      expect(result).toBe(true);
    });

    it('should return false when user belongs to organization', async () => {
      const userId = 'user1';
      const document = { _id: 'doc1', shareSetting: { linkType: 'RESTRICTED' } } as any;
      const personalPermission = null;
      const orgPermission = { role: DocumentRoleEnum.ORGANIZATION, refId: 'org1' };
      const org = { _id: 'org1' };

      const mockGetOneDocumentPermission = jest.fn().mockResolvedValue(personalPermission);
      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue([orgPermission]);
      const mockGetOrgById = jest.fn().mockResolvedValue(org);
      const mockGetMembershipByOrgAndUser = jest.fn().mockResolvedValue(true);

      documentService = new (class {
        getOneDocumentPermission = mockGetOneDocumentPermission;
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        organizationService = { 
          getOrgById: mockGetOrgById,
          getMembershipByOrgAndUser: mockGetMembershipByOrgAndUser
        };
        isOrganizationSharedDocument = DocumentService.prototype.isOrganizationSharedDocument;
      })() as any;

      const result = await documentService.isOrganizationSharedDocument(userId, document);

      expect(result).toBe(false);
    });

    it('should return false when user belongs to organization team', async () => {
      const userId = 'user1';
      const document = { _id: 'doc1', shareSetting: { linkType: 'RESTRICTED' } } as any;
      const teamPermission = { role: DocumentRoleEnum.ORGANIZATION_TEAM, refId: 'team1' };
      const team = { _id: 'team1', belongsTo: 'org1' };
      const mockGetOneDocumentPermission = jest.fn().mockResolvedValue(null);
      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue([teamPermission]);
      const mockFindOneById = jest.fn().mockResolvedValue(team);
      const mockGetOneMembershipOfUser = jest.fn().mockResolvedValue(true);
    
      documentService = new (class {
        getOneDocumentPermission = mockGetOneDocumentPermission;
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        teamService = {
          findOneById: mockFindOneById,
          getOneMembershipOfUser: mockGetOneMembershipOfUser,
        };
        isOrganizationSharedDocument = DocumentService.prototype.isOrganizationSharedDocument;
      })() as any;
    
      const result = await documentService.isOrganizationSharedDocument(userId, document);
    
      expect(result).toBe(false);
    });
    
    it('should return true when no matching organization/team permission (default case)', async () => {
      const userId = 'user1';
      const document = { _id: 'doc1', shareSetting: { linkType: 'RESTRICTED' } } as any;
      const unknownPermission = { role: 'UNKNOWN_ROLE', refId: 'xyz' };
      const mockGetOneDocumentPermission = jest.fn().mockResolvedValue(null);
      const mockGetDocumentPermissionByConditions = jest.fn().mockResolvedValue([unknownPermission]);
    
      documentService = new (class {
        getOneDocumentPermission = mockGetOneDocumentPermission;
        getDocumentPermissionByConditions = mockGetDocumentPermissionByConditions;
        isOrganizationSharedDocument = DocumentService.prototype.isOrganizationSharedDocument;
      })() as any;
    
      const result = await documentService.isOrganizationSharedDocument(userId, document);
    
      expect(result).toBe(true);
    });
  });

  describe('addDocumentImage', () => {
    let documentService: DocumentService;
    beforeEach(() => {
      documentService = new (class {
        documentImageModel = {
          create: jest.fn()
        };
        addDocumentImage = DocumentService.prototype.addDocumentImage;
      })() as any;
    });
  
    it('should create and return document image with _id converted to hex string', async () => {
      const mockImageData = {
        _id: 'img123',
        documentId: 'doc123',
        remoteId: 'remote123',
        name: 'test-image.jpg'
      };
      const mockCreatedImage = {
        toObject: () => mockImageData,
        _id: { toHexString: () => 'hex123' }
      };

      documentService['documentImageModel'].create = jest.fn().mockResolvedValue(mockCreatedImage);

      const result = await documentService.addDocumentImage(mockImageData);

      expect(documentService['documentImageModel'].create).toHaveBeenCalledWith(mockImageData);
      expect(result).toEqual({ ...mockImageData, _id: 'hex123' });
    });

    it('should return null when creation fails', async () => {
      const mockImageData = {
        _id: 'img123',
        documentId: 'doc123',
        remoteId: 'remote123',
        name: 'test-image.jpg'
      };

      documentService['documentImageModel'].create = jest.fn().mockResolvedValue(null);

      const result = await documentService.addDocumentImage(mockImageData);

      expect(result).toBeNull();
    });
  });

  describe('getImageSignedUrlsById', () => {
    let documentService: DocumentService;
    const mockAwsService = {
      getSignedUrl: jest.fn()
    };
  
    beforeEach(() => {
      documentService = new (class {
        documentImageModel = {
          find: jest.fn()
        };
        awsService = mockAwsService;
        getImageSignedUrlsById = DocumentService.prototype.getImageSignedUrlsById;
      })() as any;
    });
  
    it('should return signed URLs for all images of a document', async () => {
      const documentId = 'doc123';
      const mockImages = [
        { remoteId: 'remote1' },
        { remoteId: 'remote2' }
      ];
  
      (documentService as any).documentImageModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockImages)
      });
      (documentService as any).awsService.getSignedUrl
        .mockResolvedValueOnce('signed-url-1')
        .mockResolvedValueOnce('signed-url-2');
  
      const result = await documentService.getImageSignedUrlsById(documentId);
  
      expect((documentService as any).documentImageModel.find).toHaveBeenCalledWith(
        { documentId },
        { remoteId: 1 }
      );
      expect(result).toEqual({
        remote1: 'signed-url-1',
        remote2: 'signed-url-2'
      });
    });
  
    it('should return empty object when no images found', async () => {
      const documentId = 'doc123';
  
      (documentService as any).documentImageModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      });
  
      const result = await documentService.getImageSignedUrlsById(documentId);
  
      expect(result).toEqual({});
    });
  });

  describe('deleteAllImageSignedUrls', () => {
    let documentService: DocumentService;
    let mockAwsService: any;
    let mockDocumentImageModel: any;
  
    beforeEach(() => {
      mockAwsService = {
        deleteManyObjectAsync: jest.fn(),
        s3InstanceForDocument: jest.fn().mockReturnValue('s3-instance')
      };
      mockDocumentImageModel = {
        find: jest.fn(),
        deleteMany: jest.fn()
      };
  
      documentService = new (class {
        documentImageModel = mockDocumentImageModel;
        awsService = mockAwsService;
        deleteAllImageSignedUrls = DocumentService.prototype.deleteAllImageSignedUrls;
      })() as any;
  
      jest.clearAllMocks();
    });
  
    it('should delete all images and their S3 objects', async () => {
      const documentId = 'doc123';
      const mockImages = [
        { remoteId: 'remote1' },
        { remoteId: 'remote2' }
      ];
  
      mockDocumentImageModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockImages)
      });
  
      mockDocumentImageModel.deleteMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });
  
      await documentService.deleteAllImageSignedUrls(documentId);
  
      expect(mockDocumentImageModel.find).toHaveBeenCalledWith({ documentId }, { remoteId: 1 });
      expect(mockAwsService.deleteManyObjectAsync).toHaveBeenCalledWith(
        [`${ANNOTATION_IMAGE_BASE_PATH}/${documentId}/remote1`, `${ANNOTATION_IMAGE_BASE_PATH}/${documentId}/remote2`],
        EnvConstants.S3_DOCUMENTS_BUCKET,
        's3-instance'
      );
      expect(mockDocumentImageModel.deleteMany).toHaveBeenCalledWith({ documentId });
    });
  
    it('should return early when no images found', async () => {
      const documentId = 'doc123';
  
      mockDocumentImageModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      });
  
      await documentService.deleteAllImageSignedUrls(documentId);
  
      expect(mockDocumentImageModel.deleteMany).not.toHaveBeenCalled();
      expect(mockAwsService.deleteManyObjectAsync).not.toHaveBeenCalled();
    });
  });

  describe('deleteImageSignedUrlByRemoteIds', () => {
    let documentService: DocumentService;
    let mockAwsService: any;
    let mockDocumentImageModel: any;
  
    beforeEach(() => {
      mockAwsService = {
        deleteManyObjectAsync: jest.fn(),
        s3InstanceForDocument: jest.fn().mockReturnValue('s3-instance')
      };
  
      mockDocumentImageModel = {
        deleteMany: jest.fn()
      };
  
      documentService = new (class {
        documentImageModel = mockDocumentImageModel;
        awsService = mockAwsService;
        deleteImageSignedUrlByRemoteIds = DocumentService.prototype.deleteImageSignedUrlByRemoteIds;
      })() as any;
  
      jest.clearAllMocks();
    });
  
    it('should delete specific images by remote IDs', async () => {
      const documentId = 'doc123';
      const remoteIds = ['remote1', 'remote2'];
  
      mockDocumentImageModel.deleteMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });
  
      await documentService.deleteImageSignedUrlByRemoteIds(documentId, remoteIds);
  
      const expectedList = remoteIds.map(remoteId => `${ANNOTATION_IMAGE_BASE_PATH}/${documentId}/${remoteId}`);
  
      expect(mockAwsService.deleteManyObjectAsync).toHaveBeenCalledWith(
        expectedList,
        EnvConstants.S3_DOCUMENTS_BUCKET,
        's3-instance'
      );
      expect(mockDocumentImageModel.deleteMany).toHaveBeenCalledWith({
        documentId,
        remoteId: { $in: remoteIds }
      });
    });
  });
  
  describe('copyDocumentImage', () => {
    let documentService: DocumentService;
    const mockAwsService = { 
      copyObjectS3: jest.fn(),
      s3InstanceForDocument: jest.fn().mockReturnValue('s3-instance')
    };
    const mockEnvironmentService = { getByKey: jest.fn() };
    const mockDocumentImageModel = { find: jest.fn(), insertMany: jest.fn() };
  
    beforeEach(() => {
      documentService = new (class {
        documentImageModel = mockDocumentImageModel;
        awsService = mockAwsService;
        environmentService = mockEnvironmentService;
        copyDocumentImage = DocumentService.prototype.copyDocumentImage;
      })() as any;
  
      jest.clearAllMocks();
    });
  
    it('should copy document images from source to destination', async () => {
      const sourceDocId = 'source123';
      const copiedDocId = 'copied123';
      const mockImages = [
        { remoteId: 'remote1' },
        { remoteId: 'remote2' }
      ];
  
      mockDocumentImageModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockImages)
      });
      mockDocumentImageModel.insertMany.mockResolvedValue([]);
      mockAwsService.copyObjectS3.mockResolvedValue('copied-key');
      mockEnvironmentService.getByKey.mockReturnValue('test-bucket');
  
      const result = await documentService.copyDocumentImage(sourceDocId, copiedDocId);
  
      expect(mockDocumentImageModel.find).toHaveBeenCalledWith({ documentId: sourceDocId }, { remoteId: 1 });
      expect(mockDocumentImageModel.insertMany).toHaveBeenCalledWith([
        { remoteId: 'remote1', documentId: copiedDocId },
        { remoteId: 'remote2', documentId: copiedDocId }
      ]);
      expect(result).toBeDefined();
    });
  });
  
  describe('isAllowedToBackupPreviousVersion', () => {
    let documentService: DocumentService;
    beforeEach(() => {
      documentService = new (class {
        getPaymentInfoOfDocument = jest.fn();
        isAllowedToBackupPreviousVersion = DocumentService.prototype.isAllowedToBackupPreviousVersion;
      })() as any;
    });

    it('should return false when plan does not allow backup', async () => {
      const mockDocument = { _id: 'doc123', ownerId: 'user123' };
      const mockPayment = { type: 'FREE', period: 'MONTHLY' };

      documentService.getPaymentInfoOfDocument = jest.fn().mockResolvedValue(mockPayment);
      planPoliciesHandler.from = jest.fn().mockReturnValue({
        getRestoreOriginalToolPermission: () => false
      });

      const result = await documentService.isAllowedToBackupPreviousVersion(mockDocument);

      expect(result).toBe(false);
    });
  });

  describe('backupPreviousFileVersion', () => {
    let documentService: DocumentService;
    let mockDocumentBackupInfoModel: any;

    beforeEach(() => {
      mockDocumentBackupInfoModel = { create: jest.fn() };

      documentService = new (class {
        isAllowedToBackupPreviousVersion = jest.fn();
        copyDocumentToS3 = jest.fn();
        getTargetOwnedDocumentInfo = jest.fn();
        documentBackupInfoModel = mockDocumentBackupInfoModel;
        backupPreviousFileVersion = DocumentService.prototype.backupPreviousFileVersion;
      })() as any;
    });

    it('should backup file when allowed and no remoteId provided', async () => {
      const mockDocument = { _id: 'doc123', ownerId: 'user123' };
      const mockOrgInfo = { _id: 'org123' };

      documentService.isAllowedToBackupPreviousVersion = jest.fn().mockResolvedValue(true);
      documentService.copyDocumentToS3 = jest.fn().mockResolvedValue('new-remote-id');
      documentService.getTargetOwnedDocumentInfo = jest.fn().mockResolvedValue(mockOrgInfo);

      await documentService.backupPreviousFileVersion(mockDocument);

      expect(documentService.copyDocumentToS3).toHaveBeenCalledWith(mockDocument);
      expect((documentService as any).documentBackupInfoModel.create).toHaveBeenCalledWith({
        orgId: 'org123',
        remoteId: 'new-remote-id',
        documentId: 'doc123'
      });
    });

    it('should not backup when not allowed', async () => {
      const mockDocument = { _id: 'doc123', ownerId: 'user123' };

      documentService.isAllowedToBackupPreviousVersion = jest.fn().mockResolvedValue(false);

      await documentService.backupPreviousFileVersion(mockDocument);

      expect(documentService.copyDocumentToS3).not.toHaveBeenCalled();
    });
  });

  describe('deleteBackupFile', () => {
    let documentService: any;
    let mockLoggerService: any;
    let mockAwsService: any;
    let mockOrgService: any;
    let mockDocumentBackupInfoModel: any;

    beforeEach(() => {
      mockLoggerService = { error: jest.fn() };
      mockAwsService = { removeManyDocument: jest.fn() };
      mockOrgService = { getOrgById: jest.fn() };
      mockDocumentBackupInfoModel = {
        find: jest.fn(),
        deleteMany: jest.fn(),
      };

      documentService = new (class {
        loggerService = mockLoggerService;
        awsService = mockAwsService;
        organizationService = mockOrgService;
        documentBackupInfoModel = mockDocumentBackupInfoModel;
        deleteBackupFile = DocumentService.prototype.deleteBackupFile;
      })() as any;
    });

    it('should delete backup files for free organizations', async () => {
      const orgId = 'org123';
      const mockOrg = { _id: orgId, payment: { type: 'FREE' } };
      const mockBackupFiles = [
        { remoteId: 'backup1', toObject: () => ({ remoteId: 'backup1' }), _id: { toHexString: () => 'hex1' } },
        { remoteId: 'backup2', toObject: () => ({ remoteId: 'backup2' }), _id: { toHexString: () => 'hex2' } },
      ];

      mockOrgService.getOrgById.mockResolvedValue(mockOrg);
      mockDocumentBackupInfoModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBackupFiles),
      });
      mockDocumentBackupInfoModel.deleteMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      await documentService.deleteBackupFile(orgId);

      expect(mockAwsService.removeManyDocument).toHaveBeenCalledWith(['backup1', 'backup2']);
      expect(mockDocumentBackupInfoModel.deleteMany).toHaveBeenCalledWith({ orgId });
    });

    it('should not delete backup files for premium organizations', async () => {
      const orgId = 'org123';
      const mockOrg = { _id: orgId, payment: { type: 'PREMIUM' } };

      mockOrgService.getOrgById.mockResolvedValue(mockOrg);

      await documentService.deleteBackupFile(orgId);

      expect(mockDocumentBackupInfoModel.find).not.toHaveBeenCalled();
      expect(mockAwsService.removeManyDocument).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const orgId = 'org123';
      mockOrgService.getOrgById.mockRejectedValue(new Error('Database error'));

      await documentService.deleteBackupFile(orgId);

      expect(mockLoggerService.error).toHaveBeenCalled();
    });

    it('should return early if organization not found', async () => {
      const orgId = 'org123';
      documentService.organizationService.getOrgById.mockResolvedValue(null);

      await documentService.deleteBackupFile(orgId);

      expect(documentService.documentBackupInfoModel.find).not.toHaveBeenCalled();
      expect(documentService.awsService.removeManyDocument).not.toHaveBeenCalled();
      expect(documentService.documentBackupInfoModel.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('getDocumentBackupInfoById', () => {
    let documentService: DocumentService;
    let documentBackupInfoModel: any;

    beforeEach(() => {
      documentBackupInfoModel = { findOne: jest.fn() };
      documentService = new (class {
        documentBackupInfoModel = documentBackupInfoModel;
        getDocumentBackupInfoById = DocumentService.prototype.getDocumentBackupInfoById;
      })() as any;
    });

    it('should return backup info when found', async () => {
      const documentId = 'doc123';
      const mockBackupInfo = {
        documentId,
        remoteId: 'backup123',
        toObject: () => ({ documentId, remoteId: 'backup123' }),
        _id: { toHexString: () => 'hex123' }
      };

      documentBackupInfoModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBackupInfo)
      });

      const result = await documentService.getDocumentBackupInfoById(documentId);

      expect(result).toEqual({
        documentId,
        remoteId: 'backup123',
        _id: 'hex123'
      });
    });

    it('should return null when backup info not found', async () => {
      const documentId = 'doc123';

      documentBackupInfoModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      const result = await documentService.getDocumentBackupInfoById(documentId);

      expect(result).toBeNull();
    });
  });

  describe('getRestoreOriginalPermission', () => {
    let documentService: DocumentService;
    let organizationService: any;
    beforeEach(() => {
      organizationService = { isOrgOrTeamAdmin: jest.fn().mockReturnValue(false) };
      documentService = new (class {
        getDocumentByDocumentId = jest.fn();
        getPaymentInfoOfDocument = jest.fn();
        checkExistedDocPermission = jest.fn();
        organizationService = organizationService;
        getRestoreOriginalPermission = DocumentService.prototype.getRestoreOriginalPermission;
      })() as any;
    });

    it('should return RESTORE when user has permission and plan allows', async () => {
      const documentId = 'doc123';
      const user = { _id: 'user123' } as User;
      const mockDocument = { _id: documentId, ownerId: 'user123', isPersonal: true };
      const mockPayment = { type: 'PREMIUM', period: 'MONTHLY' };

      documentService.getDocumentByDocumentId = jest.fn().mockResolvedValue(mockDocument);
      documentService.getPaymentInfoOfDocument = jest.fn().mockResolvedValue(mockPayment);
      documentService.checkExistedDocPermission = jest.fn().mockResolvedValue({ membershipRole: 'ADMIN' });
      planPoliciesHandler.from = jest.fn().mockReturnValue({
        getRestoreOriginalToolPermission: () => true
      });

      const result = await documentService.getRestoreOriginalPermission(documentId, user);

      expect(result).toBe('RESTORE');
    });

    it('should return NOT_ALLOWED when user does not have valid role', async () => {
      const documentId = 'doc123';
      const user = { _id: 'user123' } as User;
      const mockDocument = { _id: documentId, ownerId: 'other123', isPersonal: true };
      const mockPayment = { type: 'PREMIUM', period: 'MONTHLY' };

      documentService.getDocumentByDocumentId = jest.fn().mockResolvedValue(mockDocument);
      documentService.getPaymentInfoOfDocument = jest.fn().mockResolvedValue(mockPayment);
      documentService.checkExistedDocPermission = jest.fn().mockResolvedValue({ membershipRole: 'MEMBER' });
      planPoliciesHandler.from = jest.fn().mockReturnValue({
        getRestoreOriginalToolPermission: () => true
      });

      const result = await documentService.getRestoreOriginalPermission(documentId, user);

      expect(result).toBe('NOT_ALLOWED');
    });

    it('should return RESTORE when user is doc owner of non-personal document', async () => {
      const documentId = 'doc123';
      const user = { _id: 'user123' } as User;
      const mockDocument = { _id: documentId, ownerId: 'user123', isPersonal: false };
      const mockPayment = { type: 'PREMIUM', period: 'MONTHLY' };

      documentService.getDocumentByDocumentId = jest.fn().mockResolvedValue(mockDocument);
      documentService.getPaymentInfoOfDocument = jest.fn().mockResolvedValue(mockPayment);
      documentService.checkExistedDocPermission = jest.fn().mockResolvedValue({ membershipRole: 'MEMBER' });
      planPoliciesHandler.from = jest.fn().mockReturnValue({
        getRestoreOriginalToolPermission: () => true
      });
      organizationService = { isOrgOrTeamAdmin: jest.fn().mockReturnValue(false) };

      const result = await documentService.getRestoreOriginalPermission(documentId, user);

      expect(result).toBe('RESTORE');
    });

    it('should return VIEW when plan does not allow restore', async () => {
      const documentId = 'doc123';
      const user = { _id: 'user123' } as User;
      const mockDocument = { _id: documentId, ownerId: 'user123', isPersonal: true };
      const mockPayment = { type: 'PREMIUM', period: 'MONTHLY' };

      documentService.getDocumentByDocumentId = jest.fn().mockResolvedValue(mockDocument);
      documentService.getPaymentInfoOfDocument = jest.fn().mockResolvedValue(mockPayment);
      documentService.checkExistedDocPermission = jest.fn().mockResolvedValue({ membershipRole: 'ADMIN' });
      planPoliciesHandler.from = jest.fn().mockReturnValue({
        getRestoreOriginalToolPermission: () => false
      });

      const result = await documentService.getRestoreOriginalPermission(documentId, user);

      expect(result).toBe('VIEW');
    });

    it('should return NOT_ALLOWED when user is org/team admin of non-personal document', async () => {
      const documentId = 'doc123';
      const user = { _id: 'user456' } as User;
      const mockDocument = { _id: documentId, ownerId: 'user123', isPersonal: false };
      const mockPayment = { type: 'PREMIUM', period: 'MONTHLY' };

      documentService.getDocumentByDocumentId = jest.fn().mockResolvedValue(mockDocument);
      documentService.getPaymentInfoOfDocument = jest.fn().mockResolvedValue(mockPayment);
      documentService.checkExistedDocPermission = jest.fn().mockResolvedValue({ membershipRole: 'ADMIN' });
      planPoliciesHandler.from = jest.fn().mockReturnValue({
        getRestoreOriginalToolPermission: () => true
      });
      organizationService = {
        isOrgOrTeamAdmin: jest.fn().mockReturnValue(true)
      };

      const result = await documentService.getRestoreOriginalPermission(documentId, user);
      expect(result).toBe('NOT_ALLOWED');
    });
  });

  describe('setupRedisHook', () => {
    let documentService: DocumentService;
    let mockCallbackService: any;
    let mockRedisService: any;
    let mockLoggerService: any;

    beforeEach(() => {
      mockCallbackService = { registerCallbacks: jest.fn() };
      mockRedisService = {
        setKeyIfNotExist: jest.fn(),
        deleteRedisByKey: jest.fn(),
      };
      mockLoggerService = { info: jest.fn() };

      documentService = new (class {
        callbackService = mockCallbackService;
        redisService = mockRedisService;
        loggerService = mockLoggerService;
        deleteBackupFile = jest.fn();
        processDebouncedDocumentIndexing = jest.fn();
        setupRedisHook = DocumentService.prototype['setupRedisHook'];
      })() as any;

      jest.clearAllMocks();
    });

    it('should handle delete-backup-files key and call deleteBackupFile', async () => {
      mockRedisService.setKeyIfNotExist.mockResolvedValue(true);
      mockRedisService.deleteRedisByKey.mockResolvedValue(undefined);

      (documentService as any).setupRedisHook();

      const [{ run }] = mockCallbackService.registerCallbacks.mock.calls[0][0];
      await run({ key: 'delete-backup-files:org123' });

      expect(mockRedisService.setKeyIfNotExist).toHaveBeenCalledWith('remove-backup-org123', '1', '600000');
      expect(documentService.deleteBackupFile).toHaveBeenCalledWith('org123');
      expect(mockRedisService.deleteRedisByKey).toHaveBeenCalledWith('remove-backup-org123');
      expect(mockLoggerService.info).toHaveBeenCalledWith(expect.objectContaining({
        context: 'deleteBackupFile',
        extraInfo: { orgId: 'org123' },
      }));
    });

    it('should not delete when setKeyIfNotExist returns false', async () => {
      mockRedisService.setKeyIfNotExist.mockResolvedValue(false);

      (documentService as any).setupRedisHook();
      const [{ run }] = mockCallbackService.registerCallbacks.mock.calls[0][0];
      await run({ key: 'delete-backup-files:org123' });

      expect(documentService.deleteBackupFile).not.toHaveBeenCalled();
      expect(mockRedisService.deleteRedisByKey).not.toHaveBeenCalled();
    });

    it('should handle document-indexing-debounce key', async () => {
      (documentService as any).setupRedisHook();
      const [{ run }] = mockCallbackService.registerCallbacks.mock.calls[0][0];
      await run({ key: 'document-indexing-debounce:doc789' });

      expect((documentService as any).processDebouncedDocumentIndexing).toHaveBeenCalledWith('doc789');
    });
  });

  describe('sendRestoreDocNotiToMembers', () => {
    let documentService: DocumentService;
    let userService: any;
    let notificationService: any;
    let getReceiverIdsFromDocumentId: any;
    let documentModel: any;

    beforeEach(() => {
      const mockDocs = [
        { _id: { toHexString: () => 'doc456' }, toObject: () => ({ name: 'Doc456', ownerId: 'owner456' }) },
      ];
      userService = { findUserById: jest.fn() };
      notificationService = { 
        createUsersNotifications: jest.fn(), 
        publishFirebaseNotifications: jest.fn() 
      };
      getReceiverIdsFromDocumentId = jest.fn().mockResolvedValue({
        allReceivers: new Set(['user1', 'user2']),
        receiversIndividual: new Set(),
        receiversTeam: new Set(),
        receiversOrganization: new Set()
      });
      documentModel = { find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockDocs) }) };
      documentService = new (class {
        sendRestoreDocNotiToMembers = DocumentService.prototype.sendRestoreDocNotiToMembers;
        userService = userService;
        notificationService = notificationService;
        getReceiverIdsFromDocumentId = getReceiverIdsFromDocumentId;
        documentModel = documentModel;
      })() as any;
      
      const { notiDocumentFactory } = require('../../Common/factory/NotiFactory');
      notiDocumentFactory.create.mockReturnValue({
        notificationContent: 'Test notification',
        notificationData: { actionType: 'RESTORE_ORIGINAL_VERSION' }
      });
      const { notiFirebaseDocumentFactory } = require('../../Common/factory/NotiFirebaseFactory');
      notiFirebaseDocumentFactory.create.mockReturnValue({
        notificationContent: 'Test notification',
        notificationData: { actionType: 'RESTORE_ORIGINAL_VERSION' }
      });
    });

    it('should send notifications for S3 documents', async () => {
      const data = {
        userId: 'user123',
        document: { _id: 'doc123', service: 'S3' } as any,
        isRestoreOriginal: true
      };
      const mockActor = { _id: 'user123', name: 'Test User' };
      const mockReceivers = new Set(['user1', 'user2']);

      userService.findUserById = jest.fn().mockResolvedValue(mockActor);
      documentService.getReceiverIdsFromDocumentId = jest.fn().mockResolvedValue({
        allReceivers: mockReceivers,
        receiversIndividual: new Set(),
        receiversTeam: new Set(),
        receiversOrganization: new Set()
      });
      notificationService.createUsersNotifications = jest.fn();

      await documentService.sendRestoreDocNotiToMembers(data);
    });

    it('should send notifications for S3 documents with restore original', async () => {
      const data = {
        userId: 'user123',
        document: { _id: 'doc123', service: DocumentStorageEnum.S3 } as any,
        isRestoreOriginal: true,
      };
      const mockActor = { _id: 'user123', name: 'Test User' };
      const mockReceivers = new Set(['user1', 'user2']);
  
      userService.findUserById.mockResolvedValue(mockActor);
      (documentService.getReceiverIdsFromDocumentId as any).mockResolvedValue({
        allReceivers: new Set(mockReceivers),
      });
  
      await documentService.sendRestoreDocNotiToMembers(data);
  
      const { notiDocumentFactory } = require('../../Common/factory/NotiFactory');
      expect(notiDocumentFactory.create).toHaveBeenCalledWith(
        NotiDocument.RESTORE_ORIGINAL_VERSION,
        expect.any(Object),
      );
      expect(notificationService.createUsersNotifications).toHaveBeenCalledWith(
        expect.any(Object),
        ['user1', 'user2'],
      );
    });
  
    it('should send notifications for S3 documents with restore version (not original)', async () => {
      const data = {
        userId: 'user123',
        document: { _id: 'doc123', service: DocumentStorageEnum.S3 } as any,
        isRestoreOriginal: false,
      };
      const mockActor = { _id: 'user123', name: 'Test User' };
      const mockReceivers = new Set(['user1']);
  
      userService.findUserById.mockResolvedValue(mockActor);
      (documentService.getReceiverIdsFromDocumentId as any).mockResolvedValue({
        allReceivers: new Set(mockReceivers),
      });
  
      await documentService.sendRestoreDocNotiToMembers(data);
  
      expect(notificationService.createUsersNotifications).toHaveBeenCalled();
      expect(notificationService.publishFirebaseNotifications).toHaveBeenCalled();
    });
  
    it('should send notifications for GOOGLE documents', async () => {
      const data = {
        userId: 'user123',
        document: {
          _id: 'doc123',
          service: DocumentStorageEnum.GOOGLE,
          remoteId: 'remote123',
        } as any,
        isRestoreOriginal: true,
      };
      const mockActor = { _id: 'user123', name: 'Test User' };
      const mockDocs = [
        { _id: { toHexString: () => 'doc456' }, toObject: () => ({ name: 'Doc456', ownerId: 'owner456' }) },
      ];
  
      userService.findUserById.mockResolvedValue(mockActor);
      ((documentService as any).documentModel.find as any).mockReturnValue({ exec: jest.fn().mockResolvedValue(mockDocs) });
  
      await documentService.sendRestoreDocNotiToMembers(data);
  
      const { notiDocumentFactory } = require('../../Common/factory/NotiFactory');
      expect(notiDocumentFactory.create).toHaveBeenCalledWith(
        NotiDocument.RESTORE_ORIGINAL_VERSION,
        expect.any(Object),
      );
      expect(notificationService.createUsersNotifications).toHaveBeenCalledWith(
        expect.any(Object),
        ['owner456'],
      );
    });

    it('should return early when S3 document has no receivers', async () => {
      const data = {
        userId: 'user123',
        document: { _id: 'doc123', service: DocumentStorageEnum.S3 } as any,
        isRestoreOriginal: true,
      };
      const mockActor = { _id: 'user123', name: 'Test User' };
  
      userService.findUserById.mockResolvedValue(mockActor);
      (documentService.getReceiverIdsFromDocumentId as any).mockResolvedValue({ allReceivers: new Set() });
  
      await documentService.sendRestoreDocNotiToMembers(data);
  
      expect(notificationService.createUsersNotifications).not.toHaveBeenCalled();
    });
  });

  describe('removeRequestAcessOfDeletedDoc', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        removeRequestAcessOfDeletedDoc = DocumentService.prototype.removeRequestAcessOfDeletedDoc;
        getRequestAccessDocument = jest.fn();
        removeRequestAccessDocument = jest.fn();
      })() as any;
    });
    
    it('should remove request access for deleted document', async () => {
      const documentId = 'doc123';
      const mockRequests = [
        { requesterId: 'user1' },
        { requesterId: 'user2' }
      ];

      documentService.getRequestAccessDocument = jest.fn().mockResolvedValue(mockRequests);
      documentService.removeRequestAccessDocument = jest.fn();

      await documentService.removeRequestAcessOfDeletedDoc(documentId);

      expect(documentService.getRequestAccessDocument).toHaveBeenCalledWith({ documentId });
      expect(documentService.removeRequestAccessDocument).toHaveBeenCalledWith(['user1', 'user2'], documentId);
    });
  });

  describe('resetDocument', () => {
    let documentService: DocumentService;
    let documentOutlineService: DocumentOutlineService;

    beforeEach(() => {
      documentOutlineService = new (class {
        clearOutlineOfDocument = DocumentOutlineService.prototype.clearOutlineOfDocument;
      })() as any;
      documentService = new (class {
        resetDocument = DocumentService.prototype.resetDocument;
        updateDocument = jest.fn();
        documentOutlineService = documentOutlineService;
        clearAnnotationOfDocument = jest.fn();
        deleteFormFieldFromDocument = jest.fn();
        deleteAllImageSignedUrls = jest.fn();
      })() as any;
    });
  
    it('should reset document to initial state', async () => {
      const documentId = 'doc123';

      documentService.updateDocument = jest.fn().mockResolvedValue({});
      documentService.clearAnnotationOfDocument = jest.fn().mockResolvedValue({});
      documentOutlineService.clearOutlineOfDocument = jest.fn().mockResolvedValue({});
      documentService.deleteFormFieldFromDocument = jest.fn().mockResolvedValue({});
      documentService.deleteAllImageSignedUrls = jest.fn().mockResolvedValue({});

      await documentService.resetDocument(documentId);

      expect(documentService.updateDocument).toHaveBeenCalledWith(documentId, {
        manipulationStep: '',
        version: 1,
        bookmarks: '',
        'metadata.hasClearedAnnotAndManip': false,
        'metadata.hasMerged': false,
      });
      expect(documentService.clearAnnotationOfDocument).toHaveBeenCalledWith({ documentId });
      expect(documentOutlineService.clearOutlineOfDocument).toHaveBeenCalledWith(documentId);
      expect(documentService.deleteFormFieldFromDocument).toHaveBeenCalledWith(documentId);
      expect(documentService.deleteAllImageSignedUrls).toHaveBeenCalledWith(documentId);
    });
  });

  describe('emitSocketDeleteDocuments', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        emitSocketDeleteDocuments = DocumentService.prototype.emitSocketDeleteDocuments;
      })() as any;
    });

    it('should emit socket events for document deletion', () => {
      const documentIds = ['doc1', 'doc2', 'doc3'];
      const mockEmit = jest.fn();

      (documentService as any).messageGateway = {
        server: {
          to: jest.fn().mockReturnValue({
            emit: mockEmit
          })
        }
      };
      documentService.emitSocketDeleteDocuments(documentIds);

      expect((documentService as any).messageGateway.server.to).toHaveBeenCalledTimes(3);
      expect(mockEmit).toHaveBeenCalledTimes(3);
    });
  });

  describe('emitSocketUpdateDocumentPermission', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        emitSocketUpdateDocumentPermission = DocumentService.prototype.emitSocketUpdateDocumentPermission;
      })() as any;
    });

    it('should emit socket events for permission updates', () => {
      const documentIds = ['doc1', 'doc2'];
      const mockEmit = jest.fn();

      (documentService as any).messageGateway = {
        server: {
          to: jest.fn().mockReturnValue({
            emit: mockEmit
          })
        }
      };
      documentService.emitSocketUpdateDocumentPermission(documentIds);

      expect((documentService as any).messageGateway.server.to).toHaveBeenCalledTimes(2);
      expect(mockEmit).toHaveBeenCalledTimes(2);
    });
  });

  describe('getDocumentETag', () => {
    let documentService: DocumentService;
    let awsService: AwsService;
    let environmentService: EnvironmentService;

    beforeEach(() => {
      awsService = new (class {
        headObject = jest.fn();
        s3InstanceForDocument = jest.fn();
      })() as any;
      environmentService = new (class {
        getByKey = jest.fn();
      })() as any;
      documentService = new (class {
        getDocumentETag = DocumentService.prototype.getDocumentETag;
        awsService = awsService;
        environmentService = environmentService;
      })() as any;
    });

    it('should return document ETag from S3 metadata', async () => {
      const remoteId = 'remote123';
      const mockMetadata = { ETag: '"abc123def456"' };

      awsService.headObject = jest.fn().mockResolvedValue(mockMetadata);
      environmentService.getByKey = jest.fn().mockReturnValue('test-bucket');

      const result = await documentService.getDocumentETag(remoteId);

      expect(result).toBe('abc123def456');
    });

    it('should return undefined when metadata is missing', async () => {
      const remoteId = 'remote123';
  
      awsService.headObject = jest.fn().mockResolvedValue(undefined);
      environmentService.getByKey = jest.fn().mockReturnValue('test-bucket');
  
      const result = await documentService.getDocumentETag(remoteId);
  
      expect(result).toBeUndefined();
    });
  });

  describe('handleOpenPrismicForm', () => {
    let documentService: DocumentService;
    let organizationService: OrganizationService;

    beforeEach(() => {
      organizationService = new (class {
        findOneOrganization = OrganizationService.prototype.findOneOrganization;
        createCustomOrganization = OrganizationService.prototype.createCustomOrganization;
      })() as any;
      documentService = new (class {
        handleOpenPrismicForm = DocumentService.prototype.handleOpenPrismicForm;
        organizationService = organizationService;
      })() as any;
    });

    it('should create document from Prismic form', async () => {
      const params = {
        formId: 'form123',
        user: { _id: 'user123', payment: { type: 'FREE' } } as any,
        formStaticPath: '/path/to/form'
      };
      const mockForm = { _id: 'form123', name: 'Test Form', mimeType: 'application/pdf', size: 1024 };
      const mockDocument = { _id: 'doc123', name: 'Test Form' };

      documentService.findDocumentFormById = jest.fn().mockResolvedValue(mockForm);
      documentService.createPDfDocumentFromDocumentForm = jest.fn().mockResolvedValue({
        copyFormRemoteId: 'remote123',
        copyThumbnailRemoteId: 'thumb123'
      });
      documentService.getDocumentNameAfterNaming = jest.fn().mockResolvedValue('Test Form');
      documentService.createDocument = jest.fn().mockResolvedValue(mockDocument);
      documentService.createDocumentPermissions = jest.fn().mockResolvedValue({});
      documentService.trackCreateFormEvents = jest.fn();
      organizationService.findOneOrganization = jest.fn().mockResolvedValue(null);
      organizationService.createCustomOrganization = jest.fn().mockResolvedValue({ _id: 'org123' });

      const result = await documentService.handleOpenPrismicForm(params);

      expect(result).toEqual({ documentId: 'doc123', documentName: 'Test Form' });
      expect(documentService.createDocument).toHaveBeenCalled();
      expect(documentService.createDocumentPermissions).toHaveBeenCalled();
    });

    it('should throw error when form not found', async () => {
      const params = {
        formId: 'form123',
        user: { _id: 'user123' } as User,
        formStaticPath: '/path/to/form'
      };

      documentService.findDocumentFormById = jest.fn().mockResolvedValue(null);

      await expect(documentService.handleOpenPrismicForm(params)).rejects.toThrow();
    });

    it('should not create organization when user is not FREE', async () => {
      const params = {
        formId: 'form123',
        user: { _id: 'user123', payment: { type: 'PREMIUM' } } as any,
        formStaticPath: '/path/to/form'
      };
      const mockForm = { _id: 'form123', name: 'Test Form', mimeType: 'application/pdf', size: 1024 };
      const mockDocument = { _id: 'doc123', name: 'Test Form' };
  
      documentService.findDocumentFormById = jest.fn().mockResolvedValue(mockForm);
      documentService.createPDfDocumentFromDocumentForm = jest.fn().mockResolvedValue({
        copyFormRemoteId: 'remote123',
        copyThumbnailRemoteId: 'thumb123'
      });
      documentService.getDocumentNameAfterNaming = jest.fn().mockResolvedValue('Test Form');
      documentService.createDocument = jest.fn().mockResolvedValue(mockDocument);
      documentService.createDocumentPermissions = jest.fn().mockResolvedValue({});
      documentService.trackCreateFormEvents = jest.fn();
  
      organizationService.findOneOrganization = jest.fn();
      organizationService.createCustomOrganization = jest.fn();
  
      const result = await documentService.handleOpenPrismicForm(params);
  
      expect(result).toEqual({ documentId: 'doc123', documentName: 'Test Form' });
      expect(organizationService.findOneOrganization).not.toHaveBeenCalled();
      expect(organizationService.createCustomOrganization).not.toHaveBeenCalled();
    });
  
    it('should return null documentId when no copyFormRemoteId', async () => {
      const params = {
        formId: 'form123',
        user: { _id: 'user123', payment: { type: 'FREE' } } as any,
        formStaticPath: '/path/to/form'
      };
      const mockForm = { _id: 'form123', name: 'Test Form', mimeType: 'application/pdf', size: 1024 };
  
      documentService.findDocumentFormById = jest.fn().mockResolvedValue(mockForm);
      documentService.createPDfDocumentFromDocumentForm = jest.fn().mockResolvedValue({
        copyFormRemoteId: null,
        copyThumbnailRemoteId: null
      });
  
      const result = await documentService.handleOpenPrismicForm(params);
  
      expect(result).toEqual({ documentId: null, documentName: null });
    });
  });

  describe('createPdfDocumentFromStrapiForm', () => {
    let documentService: DocumentService;
    let awsService: AwsService;
    let environmentService: EnvironmentService;

    beforeEach(() => {
      awsService = new (class {
        copyObjectS3 = jest.fn();
        s3InstanceForDocument = jest.fn();
      })() as any;
      environmentService = new (class {
        getByKey = jest.fn();
      })() as any;
      documentService = new (class {
        createPdfDocumentFromStrapiForm = DocumentService.prototype.createPdfDocumentFromStrapiForm;
        awsService = awsService;
        environmentService = environmentService;
      })() as any;
    });

    it('should create PDF document from Strapi form', async () => {
      const mockStrapiForm = {
        file: { hash: 'hash123', ext: '.pdf', size: 1024 },
        thumbnails: [{ hash: 'thumb123', ext: '.jpg' }]
      } as any;

      environmentService.getByKey = jest.fn()
        .mockReturnValueOnce('doc-bucket')
        .mockReturnValueOnce('strapi-bucket');
      awsService.copyObjectS3 = jest.fn()
        .mockResolvedValueOnce('copied-form-id')
        .mockResolvedValueOnce('copied-thumb-id');
      documentService.createThumbnailsForUsingTemplate = jest.fn().mockResolvedValue('thumb-id');

      const result = await documentService.createPdfDocumentFromStrapiForm(mockStrapiForm);

      expect(result).toEqual({
        copiedFormFileId: 'copied-form-id',
        copiedThumbnailFileId: 'thumb-id'
      });
    });

    it('should throw error when file not found', async () => {
      const mockStrapiForm = {
        file: null,
        thumbnails: []
      } as any;

      await expect(documentService.createPdfDocumentFromStrapiForm(mockStrapiForm)).rejects.toThrow('File not found');
    });

    it('should throw error when thumbnails is missing', async () => {
      const mockStrapiForm = {
        file: { hash: 'hash123', ext: '.pdf', size: 1024 },
        thumbnails: null
      } as any;
      const result = await documentService.createPdfDocumentFromStrapiForm(mockStrapiForm);

      expect(result).toEqual({
        copiedFormFileId: undefined,
        copiedThumbnailFileId: null
      });
    });
  });

  describe('fetchImageBuffer', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        fetchImageBuffer = DocumentService.prototype.fetchImageBuffer;
      })() as any;
    });
  
    it('should fetch and convert image buffer', async () => {
      const url = 'https://example.com/image/100x100.jpg';
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockBuffer = Buffer.from('test');

      global.fetch = jest.fn().mockResolvedValue({
        arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer)
      });
      Utils.ConvertArrayBufferToBuffer = jest.fn().mockReturnValue(mockBuffer);

      const result = await documentService.fetchImageBuffer(url);

      expect(global.fetch).toHaveBeenCalledWith('https://example.com/image/100x100.jpg');
      expect(result).toBe(mockBuffer);
    });
  });

  describe('createThumbnailsForUsingTemplate', () => {
    let documentService: DocumentService;
    let awsService: AwsService;
    let environmentService: EnvironmentService;
    let loggerService: LoggerService;

    beforeEach(() => {
      awsService = new (class {
        copyObjectS3 = jest.fn();
        putObject = jest.fn();
      })() as any;
      environmentService = new (class {
        getByKey = jest.fn();
      })() as any;
      loggerService = new (class {
        error = jest.fn();
      })() as any;
      documentService = new (class {
        createThumbnailsForUsingTemplate = DocumentService.prototype.createThumbnailsForUsingTemplate;
        awsService = awsService;
        environmentService = environmentService;
        loggerService = loggerService;
      })() as any;
    });

    it('should create thumbnail for AWS S3 provider', async () => {
      const mockThumbnail = {
        provider: FileUploadProvider.AWS_S3,
        hash: 'hash123',
        ext: '.jpg'
      } as any;

      environmentService.getByKey = jest.fn()
        .mockReturnValueOnce('strapi-bucket')
        .mockReturnValueOnce('resources-bucket');
      awsService.copyObjectS3 = jest.fn().mockResolvedValue('copied-thumb-id');

      const result = await documentService.createThumbnailsForUsingTemplate(mockThumbnail);

      expect(result).toBe('copied-thumb-id');
      expect(awsService.copyObjectS3).toHaveBeenCalled();
    });

    it('should create thumbnail for Strapi upload provider', async () => {
      const mockThumbnail = {
        provider: FileUploadProvider.STRAPI_UPLOAD_MULTI_PROVIDERS,
        url: 'https://example.com/image.jpg',
        ext: '.jpg'
      } as any;

      environmentService.getByKey = jest.fn()
        .mockReturnValueOnce('strapi-bucket')
        .mockReturnValueOnce('resources-bucket');
      documentService.fetchImageBuffer = jest.fn().mockResolvedValue(Buffer.from('test'));
      awsService.putObject = jest.fn().mockResolvedValue({ key: 'thumb-key' });

      const result = await documentService.createThumbnailsForUsingTemplate(mockThumbnail);

      expect(result).toBe('thumb-key');
      expect(awsService.putObject).toHaveBeenCalled();
    });

    it('should return null for unsupported provider', async () => {
      const mockThumbnail = {
        provider: 'UNSUPPORTED',
        hash: 'hash123',
        ext: '.jpg'
      } as any;

      environmentService.getByKey = jest.fn().mockReturnValue('strapi-bucket');
      (documentService as any).loggerService = { error: jest.fn() };

      const result = await documentService.createThumbnailsForUsingTemplate(mockThumbnail);

      expect(result).toBeNull();
      expect((documentService as any).loggerService.error).toHaveBeenCalled();
    });

    it('should log error and return null when copyObjectS3 throws error', async () => {
      const mockThumbnail = {
        provider: FileUploadProvider.AWS_S3,
        hash: 'hash123',
        ext: '.jpg'
      } as any;
    
      environmentService.getByKey = jest.fn()
        .mockReturnValueOnce('strapi-bucket')
        .mockReturnValueOnce('resources-bucket');
    
      const error = new Error('S3 error');
      awsService.copyObjectS3 = jest.fn().mockRejectedValue(error);
    
      const result = await documentService.createThumbnailsForUsingTemplate(mockThumbnail);
    
      expect(result).toBeNull();
      expect(loggerService.error).toHaveBeenCalledWith({
        context: 'createThumbnailsForUsingTemplate',
        error,
        extraInfo: { thumbnail: mockThumbnail },
      });
    });
  });

  describe('handleOpenStrapiForm', () => {
    let documentService: DocumentService;
    let awsService: AwsService;
    let environmentService: EnvironmentService;
    let loggerService: LoggerService;

    beforeEach(() => {
      awsService = new (class {
        copyObjectS3 = jest.fn();
        s3InstanceForDocument = jest.fn();
      })() as any;
      environmentService = new (class {
        getByKey = jest.fn();
      })() as any;
      loggerService = new (class {
        info = jest.fn();
      })() as any;
      documentService = new (class {
        handleOpenStrapiForm = DocumentService.prototype.handleOpenStrapiForm;
        awsService = awsService;
        environmentService = environmentService;
        loggerService = loggerService;
      })() as any;
    });

    it('should create document from Strapi form', async () => {
      const params = {
        formId: 'form123',
        user: { _id: 'user123' } as User,
        source: 'templates',
        variationIdentifier: 'var123'
      };
      const mockStrapiForm = {
        id: 'strapi123',
        title: 'Test Form',
        file: { hash: 'hash123', ext: '.pdf', size: 1024, mime: 'application/pdf' },
        categories: [{ name: 'Category1' }]
      };
      const mockDocument = { _id: 'doc123', name: 'Test Form.pdf' };

      documentService.findFormFromStrapi = jest.fn().mockResolvedValue(mockStrapiForm);
      documentService.createPdfDocumentFromStrapiForm = jest.fn().mockResolvedValue({
        copiedFormFileId: 'form-id',
        copiedThumbnailFileId: 'thumb-id'
      });
      documentService.getDocumentNameAfterNaming = jest.fn().mockResolvedValue('Test Form.pdf');
      documentService.createDocument = jest.fn().mockResolvedValue(mockDocument);
      documentService.saveDocumentToDocList = jest.fn().mockResolvedValue({});
      (documentService as any).loggerService = { info: jest.fn() };

      const result = await documentService.handleOpenStrapiForm(params);

      expect(result).toEqual({ documentId: 'doc123', documentName: 'Test Form.pdf' });
      expect(documentService.createDocument).toHaveBeenCalled();
      expect(documentService.saveDocumentToDocList).toHaveBeenCalled();
    });

    it('should throw error when form not found', async () => {
      const params = {
        formId: 'form123',
        user: { _id: 'user123' } as User,
        source: 'templates'
      };

      documentService.findFormFromStrapi = jest.fn().mockResolvedValue(null);

      await expect(documentService.handleOpenStrapiForm(params)).rejects.toThrow('Form not found on Strapi');
    });

    it('should handle case when categories is undefined (cover optional chaining)', async () => {
      const params = {
        formId: 'form123',
        user: { _id: 'user123' } as User,
        source: 'templates'
      };
      const mockStrapiForm = {
        id: 'strapi123',
        title: 'Test Form',
        file: { hash: 'hash123', ext: '.pdf', size: 1024, mime: 'application/pdf' },
        categories: undefined,
      };
      const mockDocument = { _id: 'doc123', name: 'Test Form.pdf', remoteId: 'form-id' };
    
      documentService.findFormFromStrapi = jest.fn().mockResolvedValue(mockStrapiForm);
      documentService.createPdfDocumentFromStrapiForm = jest.fn().mockResolvedValue({
        copiedFormFileId: 'form-id',
        copiedThumbnailFileId: 'thumb-id'
      });
      documentService.getDocumentNameAfterNaming = jest.fn().mockResolvedValue('Test Form.pdf');
      documentService.createDocument = jest.fn().mockResolvedValue(mockDocument);
      documentService.saveDocumentToDocList = jest.fn().mockResolvedValue({});
      (documentService as any).loggerService = { info: jest.fn() };
    
      const result = await documentService.handleOpenStrapiForm(params);
    
      expect(result).toEqual({ documentId: 'doc123', documentName: 'Test Form.pdf' });
      expect((documentService as any).loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          extraInfo: expect.objectContaining({
            template: expect.objectContaining({
              strapiCategories: undefined,
            }),
          }),
        }),
      );
    });
    
    it('should throw BadRequest when fileData is missing', async () => {
      const params = {
        formId: 'form123',
        user: { _id: 'user123' } as User,
        source: 'templates'
      };
      const mockStrapiForm = {
        id: 'strapi123',
        title: 'Test Form',
        categories: [{ name: 'Category1' }],
        file: null,
      };
    
      documentService.findFormFromStrapi = jest.fn().mockResolvedValue(mockStrapiForm);
    
      await expect(documentService.handleOpenStrapiForm(params))
        .rejects
        .toThrow('File remote id not existed');
    });
    
  });

  describe('createPdfFromStaticToolUpload', () => {
    let documentService: DocumentService;
    let awsService: AwsService;
    let environmentService: EnvironmentService;

    beforeEach(() => {
      awsService = new (class {
        getTemporaryFileMetadata = jest.fn();
        s3InstanceForDocument = jest.fn();
        copyObjectS3 = jest.fn();
      })() as any;
      environmentService = new (class {
        getByKey = jest.fn();
      })() as any;
      documentService = new (class {
        createPdfFromStaticToolUpload = DocumentService.prototype.createPdfFromStaticToolUpload;
        awsService = awsService;
        environmentService = environmentService;
      })() as any;
    });

    it('should create PDF document from static tool upload', async () => {
      const data = {
        remoteId: 'temp123',
        fileName: 'test.pdf',
        user: { _id: 'user123', payment: { type: 'FREE' } } as any,
        orgId: 'org123'
      };
      const mockMetadata = {
        ContentType: 'application/pdf',
        ContentLength: 1024
      };
      const mockDocument = { _id: 'doc123' };

      awsService.getTemporaryFileMetadata = jest.fn().mockResolvedValue(mockMetadata);
      environmentService.getByKey = jest.fn()
        .mockReturnValueOnce('temp-bucket')
        .mockReturnValueOnce('doc-bucket');
      awsService.copyObjectS3 = jest.fn().mockResolvedValue('new-remote-id');
      documentService.getTargetOrgWithPremiumStatus = jest.fn().mockResolvedValue({
        isPremiumOrg: false,
        targetOrgId: 'org123'
      });
      documentService.validateUploadFileData = jest.fn().mockReturnValue({ isValid: true });
      documentService.getDocumentNameAfterNaming = jest.fn().mockResolvedValue('test.pdf');
      documentService.createDocument = jest.fn().mockResolvedValue(mockDocument);
      documentService.createDocumentPermission = jest.fn().mockResolvedValue({});

      const result = await documentService.createPdfFromStaticToolUpload(data);

      expect(result).toEqual({
        documentId: 'doc123',
        documentName: 'test.pdf',
        documentMimeType: 'application/pdf',
        documentSize: 1024,
        temporaryRemoteId: 'temp123'
      });
    });

    it('should throw BadRequest when temporary file metadata is missing', async () => {
      awsService.getTemporaryFileMetadata = jest.fn().mockResolvedValue(null);
  
      await expect(
        documentService.createPdfFromStaticToolUpload({
          remoteId: 'temp123',
          fileName: 'test.pdf',
          user: { _id: 'user123', payment: { type: 'FREE' } } as any
        })
      ).rejects.toThrow('Fail to get temporary file metadata');
    });
  
    it('should throw NotFound when copyObjectS3 fails', async () => {
      awsService.getTemporaryFileMetadata = jest.fn().mockResolvedValue({
        ContentType: 'application/pdf',
        ContentLength: 1024
      });
      environmentService.getByKey = jest.fn()
        .mockReturnValueOnce('temp-bucket')
        .mockReturnValueOnce('doc-bucket');
      awsService.copyObjectS3 = jest.fn().mockResolvedValue(null);
  
      await expect(
        documentService.createPdfFromStaticToolUpload({
          remoteId: 'temp123',
          fileName: 'test.pdf',
          user: { _id: 'user123', payment: { type: 'FREE' } } as any
        })
      ).rejects.toThrow('Fail to create document from existing remote ID in S3');
    });
  
    it('should throw error when validateUploadFileData returns error', async () => {
      const mockError = new Error('Invalid file');
      awsService.getTemporaryFileMetadata = jest.fn().mockResolvedValue({
        ContentType: 'application/pdf',
        ContentLength: 1024
      });
      environmentService.getByKey = jest.fn()
        .mockReturnValueOnce('temp-bucket')
        .mockReturnValueOnce('doc-bucket');
      awsService.copyObjectS3 = jest.fn().mockResolvedValue('new-remote-id');
      documentService.getTargetOrgWithPremiumStatus = jest.fn().mockResolvedValue({
        isPremiumOrg: false,
        targetOrgId: 'org123'
      });
      documentService.validateUploadFileData = jest.fn().mockReturnValue({ error: mockError });
  
      await expect(
        documentService.createPdfFromStaticToolUpload({
          remoteId: 'temp123',
          fileName: 'test.pdf',
          user: { _id: 'user123', payment: { type: 'FREE' } } as any
        })
      ).rejects.toThrow('Invalid file');
    });
  });

  describe('validateUploadFileData', () => {
    let documentService: DocumentService;
    let rateLimiterService: RateLimiterService;

    beforeEach(() => {
      rateLimiterService = new (class {
        verifyUploadFilesSize = RateLimiterService.prototype.verifyUploadFilesSize;
      })() as any;
      documentService = new (class {
        rateLimiterService = rateLimiterService;
        validateUploadFileData = DocumentService.prototype.validateUploadFileData;
      })() as any;

    });

    it('should return valid for supported file type and size', () => {
      const metadata = {
        ContentType: 'application/pdf',
        ContentLength: 1024
      };

      rateLimiterService.verifyUploadFilesSize = jest.fn().mockReturnValue(true);

      const result = documentService.validateUploadFileData(metadata, true);

      expect(result).toEqual({ isValid: true });
    });

    it('should return error for unsupported file type', () => {
      const metadata = {
        ContentType: 'text/plain',
        ContentLength: 1024
      };

      const result = documentService.validateUploadFileData(metadata, true);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for oversized file', () => {
      const metadata = {
        ContentType: 'application/pdf',
        ContentLength: 1000000000
      };

      rateLimiterService.verifyUploadFilesSize = jest.fn().mockReturnValue(false);

      const result = documentService.validateUploadFileData(metadata, false);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for oversized file when premium user', () => {
      const metadata = {
        ContentType: 'application/pdf',
        ContentLength: 5000000000
      };
      rateLimiterService.verifyUploadFilesSize = jest.fn().mockReturnValue(false);
    
      const result = documentService.validateUploadFileData(metadata, true);
    
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('saveDocumentToDocList', () => {
    let documentService: DocumentService;
    let redisService: RedisService;

    beforeEach(() => {
      redisService = new (class {
        getRedisValueWithKey = jest.fn();
        deleteRedisValueWithKey = jest.fn();
        deleteOpenFormFromTemplates = jest.fn();
      })() as any;
      documentService = new (class {
        saveDocumentToDocList = DocumentService.prototype.saveDocumentToDocList;
        createDocumentPermission = jest.fn();
        updateWorkspaceAndGetUploadDestination = jest.fn();
        redisService = redisService;
        loggerService = {
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
        };
      })() as any;
    });

    it('should save document to doc list for premium users', async () => {
      const document = { _id: 'doc123' } as IDocument;
      const user = { _id: 'user123', payment: { type: 'PREMIUM' } } as any;

      documentService.createDocumentPermission = jest.fn().mockResolvedValue({});

      await documentService.saveDocumentToDocList(document, user);

      expect(documentService.createDocumentPermission).toHaveBeenCalledWith({
        documentId: 'doc123',
        refId: 'user123',
        role: 'owner'
      });
    });

    it('should save document to doc list for free users with workspace', async () => {
      const document = { _id: 'doc123' } as IDocument;
      const user = { _id: 'user123', payment: { type: 'FREE' } } as any;
    
      documentService.updateWorkspaceAndGetUploadDestination = jest.fn().mockResolvedValue({ _id: 'org123' });
      documentService.createDocumentPermission = jest.fn();
    
      await documentService.saveDocumentToDocList(document, user);
    
      expect(documentService.createDocumentPermission).toHaveBeenCalledWith({
        documentId: 'doc123',
        refId: 'user123',
        role: 'owner',
        workspace: {
          refId: 'org123',
          type: 'organization',
        },
      });
    });
  });

  describe('getOrgIdToSaveExternalUploadDocument', () => {
    let documentService: DocumentService;
    let redisService: RedisService;
    let organizationService: OrganizationService;

    beforeEach(() => {
      redisService = new (class {
        getRedisValueWithKey = jest.fn();
      })() as any;
      organizationService = new (class {
        findOneOrganization = jest.fn();
        createCustomOrganization = jest.fn();
      })() as any;
      documentService = new (class {
        getOrgIdToSaveExternalUploadDocument = DocumentService.prototype.getOrgIdToSaveExternalUploadDocument;
        redisService = redisService;
        organizationService = organizationService;
      })() as any;
    });

    it('should return last accessed org ID from Redis when available', async () => {
      const user = { _id: 'user123' } as any;
      const lastAccessedOrgId = 'org123';
      
      (redisService.getRedisValueWithKey as jest.Mock).mockResolvedValue(lastAccessedOrgId);

      const result = await documentService.getOrgIdToSaveExternalUploadDocument(user);

      expect(result).toBe(lastAccessedOrgId);
      expect(redisService.getRedisValueWithKey).toHaveBeenCalledWith('last-accessed:org-id:user:user123');
      expect(organizationService.findOneOrganization).not.toHaveBeenCalled();
    });

    it('should create new organization when no Redis value and no existing org', async () => {
      const user = { _id: 'user123' } as any;
      const newOrg = { _id: 'org789' };
      
      (redisService.getRedisValueWithKey as jest.Mock).mockResolvedValue(null);
      (organizationService.findOneOrganization as jest.Mock).mockResolvedValue(null);
      (organizationService.createCustomOrganization as jest.Mock).mockResolvedValue(newOrg);

      const result = await documentService.getOrgIdToSaveExternalUploadDocument(user);

      expect(result).toBe('org789');
      expect(organizationService.findOneOrganization).toHaveBeenCalledWith({ ownerId: 'user123' });
      expect(organizationService.createCustomOrganization).toHaveBeenCalledWith(user);
    });
  });

  describe('getUserIdsHasDocPermission', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        getUserIdsHasDocPermission = DocumentService.prototype.getUserIdsHasDocPermission;
        checkExistedDocPermission = jest.fn();
      })() as any;
    });

    it('should return empty array when no author IDs provided', async () => {
      const document = { _id: 'doc123' } as any;

      const result = await documentService.getUserIdsHasDocPermission([], document);

      expect(result).toEqual([]);
      expect(documentService.checkExistedDocPermission).not.toHaveBeenCalled();
    });

    it('should return user IDs that have document permission', async () => {
      const authorIds = ['user1', 'user2', 'user3'];
      const document = { _id: 'doc123' } as any;
      
      (documentService.checkExistedDocPermission as jest.Mock)
        .mockResolvedValueOnce({ hasPermission: true })
        .mockResolvedValueOnce({ hasPermission: false })
        .mockResolvedValueOnce({ hasPermission: true });

      const result = await documentService.getUserIdsHasDocPermission(authorIds, document);

      expect(result).toEqual(['user1', 'user3']);
      expect(documentService.checkExistedDocPermission).toHaveBeenCalledTimes(3);
    });
  });

  describe('isAllowedToUseOCR', () => {
    let documentService: DocumentService;
    let userService: UserService;

    const baseDocument = {
      _id: 'doc123',
      ownerId: 'owner123',
      isPersonal: false,
      size: 1000,
      service: 'S3',
      mimeType: 'application/pdf',
      shareSetting: {}
    };
  
    beforeEach(() => {
      userService = new (class {
        findUserById = jest.fn();
      })() as any;
      documentService = new (class {
        isAllowedToUseOCR = DocumentService.prototype.isAllowedToUseOCR;
        getDocumentByDocumentId = jest.fn();
        getPremiumToolInfo = jest.fn();
        userService = userService;
      })() as any;
    });

    it('should return true when all conditions are met for premium user', async () => {
      const documentId = 'doc123';
      const userId = 'user123';
      const document = {
        _id: 'doc123',
        ownerId: 'owner123',
        isPersonal: false,
        size: 1000000,
        service: 'S3',
        mimeType: 'application/pdf',
        shareSetting: {}
      };
      const documentOwner = {
        metadata: {
          exploredFeatures: {
            ocr: 0
          }
        }
      };
      const premiumToolInfo = { ocr: true };

      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(document);
      (userService.findUserById as jest.Mock).mockResolvedValue(documentOwner);
      (documentService.getPremiumToolInfo as jest.Mock).mockResolvedValue(premiumToolInfo);

      const result = await documentService.isAllowedToUseOCR(documentId, userId);

      expect(result).toBe(false);
    });
  
    it('should handle when metadata is undefined (cover metadata?.exploredFeatures?.ocr)', async () => {
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(baseDocument);
      (userService.findUserById as jest.Mock).mockResolvedValue({});
      (documentService.getPremiumToolInfo as jest.Mock).mockResolvedValue({ ocr: false });
  
      const result = await documentService.isAllowedToUseOCR('doc123', 'user123');
  
      expect(result).toBe(false);
    });

    it('should return false when document size exceeds OCR_LIMIT_SIZE', async () => {
      const documentId = 'doc123';
      const userId = 'user123';
      const document = {
        _id: 'doc123',
        ownerId: 'owner123',
        isPersonal: false,
        size: 31 * 1024 * 1024,
        service: DocumentStorageEnum.S3,
        mimeType: DocumentMimeType.PDF,
        shareSetting: {}
      };
      const documentOwner = {
        metadata: {
          exploredFeatures: {
            ocr: 0
          }
        }
      };
      const premiumToolInfo = { ocr: true };

      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(document);
      (userService.findUserById as jest.Mock).mockResolvedValue(documentOwner);
      (documentService.getPremiumToolInfo as jest.Mock).mockResolvedValue(premiumToolInfo);

      const result = await documentService.isAllowedToUseOCR(documentId, userId);

      expect(result).toBe(false);
    });

    it('should return true when document size is exactly at OCR_LIMIT_SIZE and hasPlanToUse is true', async () => {
      const documentId = 'doc123';
      const userId = 'user123';
      const document = {
        _id: 'doc123',
        ownerId: 'owner123',
        isPersonal: false,
        size: 30 * 1024 * 1024,
        service: DocumentStorageEnum.S3,
        mimeType: DocumentMimeType.PDF,
        shareSetting: {}
      };
      const documentOwner = {
        metadata: {
          exploredFeatures: {
            ocr: 1 
          }
        }
      };
      const premiumToolInfo = { ocr: true };

      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(document);
      (userService.findUserById as jest.Mock).mockResolvedValue(documentOwner);
      (documentService.getPremiumToolInfo as jest.Mock).mockResolvedValue(premiumToolInfo);

      const result = await documentService.isAllowedToUseOCR(documentId, userId);

      expect(result).toBe(true);
    });

    it('should return false when document storage is invalid (not S3 or GOOGLE)', async () => {
      const documentId = 'doc123';
      const userId = 'user123';
      const document = {
        _id: 'doc123',
        ownerId: 'owner123',
        isPersonal: false,
        size: 1000000,
        service: DocumentStorageEnum.DROPBOX,
        mimeType: DocumentMimeType.PDF,
        shareSetting: {}
      };
      const documentOwner = {
        metadata: {
          exploredFeatures: {
            ocr: 0
          }
        }
      };
      const premiumToolInfo = { ocr: true };

      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(document);
      (userService.findUserById as jest.Mock).mockResolvedValue(documentOwner);
      (documentService.getPremiumToolInfo as jest.Mock).mockResolvedValue(premiumToolInfo);

      const result = await documentService.isAllowedToUseOCR(documentId, userId);

      expect(result).toBe(false);
    });

    it('should return false when document mime type is invalid', async () => {
      const documentId = 'doc123';
      const userId = 'user123';
      const document = {
        _id: 'doc123',
        ownerId: 'owner123',
        isPersonal: false,
        size: 1000000,
        service: DocumentStorageEnum.S3,
        mimeType: DocumentMimeType.DOC,
        shareSetting: {}
      };
      const documentOwner = {
        metadata: {
          exploredFeatures: {
            ocr: 0
          }
        }
      };
      const premiumToolInfo = { ocr: true };

      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(document);
      (userService.findUserById as jest.Mock).mockResolvedValue(documentOwner);
      (documentService.getPremiumToolInfo as jest.Mock).mockResolvedValue(premiumToolInfo);

      const result = await documentService.isAllowedToUseOCR(documentId, userId);

      expect(result).toBe(false);
    });

    it('should return true when hasPlanToUse is true and all other conditions are met', async () => {
      const documentId = 'doc123';
      const userId = 'user123';
      const document = {
        _id: 'doc123',
        ownerId: 'owner123',
        isPersonal: false,
        size: 1000000,
        service: DocumentStorageEnum.S3,
        mimeType: DocumentMimeType.PDF,
        shareSetting: {}
      };
      const documentOwner = {
        metadata: {
          exploredFeatures: {
            ocr: 1 
          }
        }
      };
      const premiumToolInfo = { ocr: true };

      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(document);
      (userService.findUserById as jest.Mock).mockResolvedValue(documentOwner);
      (documentService.getPremiumToolInfo as jest.Mock).mockResolvedValue(premiumToolInfo);

      const result = await documentService.isAllowedToUseOCR(documentId, userId);

      expect(result).toBe(true);
    });

    it('should return true when canExploredOCR is true and all other conditions are met', async () => {
      const documentId = 'doc123';
      const userId = 'user123';
      const document = {
        _id: 'doc123',
        ownerId: 'owner123',
        isPersonal: false,
        size: 1000000,
        service: DocumentStorageEnum.GOOGLE,
        mimeType: DocumentMimeType.PNG,
        shareSetting: {}
      };
      const documentOwner = {
        metadata: {
          exploredFeatures: {
            ocr: 0
          }
        }
      };
      const premiumToolInfo = { ocr: false };

      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(document);
      (userService.findUserById as jest.Mock).mockResolvedValue(documentOwner);
      (documentService.getPremiumToolInfo as jest.Mock).mockResolvedValue(premiumToolInfo);

      const result = await documentService.isAllowedToUseOCR(documentId, userId);

      expect(result).toBe(true);
    });

    it('should return false when both hasPlanToUse and canExploredOCR are false', async () => {
      const documentId = 'doc123';
      const userId = 'user123';
      const document = {
        _id: 'doc123',
        ownerId: 'owner123',
        isPersonal: false,
        size: 1000000,
        service: DocumentStorageEnum.S3,
        mimeType: DocumentMimeType.PDF,
        shareSetting: {}
      };
      const documentOwner = {
        metadata: {
          exploredFeatures: {
            ocr: 1
          }
        }
      };
      const premiumToolInfo = { ocr: false };

      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(document);
      (userService.findUserById as jest.Mock).mockResolvedValue(documentOwner);
      (documentService.getPremiumToolInfo as jest.Mock).mockResolvedValue(premiumToolInfo);

      const result = await documentService.isAllowedToUseOCR(documentId, userId);

      expect(result).toBe(false);
    });

    it('should return true for valid JPEG mime type', async () => {
      const documentId = 'doc123';
      const userId = 'user123';
      const document = {
        _id: 'doc123',
        ownerId: 'owner123',
        isPersonal: false,
        size: 1000000,
        service: DocumentStorageEnum.S3,
        mimeType: DocumentMimeType.JPEG,
        shareSetting: {}
      };
      const documentOwner = {
        metadata: {
          exploredFeatures: {
            ocr: 0
          }
        }
      };
      const premiumToolInfo = { ocr: true };

      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(document);
      (userService.findUserById as jest.Mock).mockResolvedValue(documentOwner);
      (documentService.getPremiumToolInfo as jest.Mock).mockResolvedValue(premiumToolInfo);

      const result = await documentService.isAllowedToUseOCR(documentId, userId);

      expect(result).toBe(true);
    });

    it('should return true for valid JPG mime type', async () => {
      const documentId = 'doc123';
      const userId = 'user123';
      const document = {
        _id: 'doc123',
        ownerId: 'owner123',
        isPersonal: false,
        size: 1000000,
        service: DocumentStorageEnum.GOOGLE,
        mimeType: DocumentMimeType.JPG,
        shareSetting: {}
      };
      const documentOwner = {
        metadata: {
          exploredFeatures: {
            ocr: 0
          }
        }
      };
      const premiumToolInfo = { ocr: true };

      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(document);
      (userService.findUserById as jest.Mock).mockResolvedValue(documentOwner);
      (documentService.getPremiumToolInfo as jest.Mock).mockResolvedValue(premiumToolInfo);

      const result = await documentService.isAllowedToUseOCR(documentId, userId);

      expect(result).toBe(true);
    });   
  });

  describe('removeAllRequestAccessOfDocuments', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        removeAllRequestAccessOfDocuments = DocumentService.prototype.removeAllRequestAccessOfDocuments;
        getRequestAccessDocument = jest.fn();
        removeRequestAccessDocument = jest.fn();
      })() as any;
    });

    it('should remove request access for all documents successfully', async () => {
      const documents = [
        { _id: 'doc1' },
        { _id: 'doc2' }
      ] as IDocument[];
      const requestAccess = [
        { documentId: new Types.ObjectId(), requesterId: new Types.ObjectId() },
        { documentId: new Types.ObjectId(), requesterId: new Types.ObjectId() },
        { documentId: new Types.ObjectId(), requesterId: new Types.ObjectId() }
      ];

      (documentService.getRequestAccessDocument as jest.Mock).mockResolvedValue(requestAccess);
      (documentService.removeRequestAccessDocument as jest.Mock).mockResolvedValue(undefined);

      const result = await documentService.removeAllRequestAccessOfDocuments(documents);
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle errors when removing request access fails', async () => {
      const documents = [{ _id: 'doc1' }] as IDocument[];
      const requestAccess = [{ documentId: new Types.ObjectId(), requesterId: new Types.ObjectId() }];
      const error = new Error('Remove failed');

      (documentService.getRequestAccessDocument as jest.Mock).mockResolvedValue(requestAccess);
      (documentService.removeRequestAccessDocument as jest.Mock).mockRejectedValue(error);

      const result = await documentService.removeAllRequestAccessOfDocuments(documents);
      expect(result).toEqual([
        { docId: expect.any(String), requesterIds: [expect.any(String)], success: false, error }
      ]);      
    });
  });

  describe('removeAllSharedDocumentPermissionsOfUsers', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        removeAllSharedDocumentPermissionsOfUsers = DocumentService.prototype.removeAllSharedDocumentPermissionsOfUsers;
        deleteDocumentPermissions = jest.fn();
      })() as any;
    });

    it('should remove shared document permissions for all users successfully', async () => {
      const userIds = ['user1', 'user2'];
      
      (documentService.deleteDocumentPermissions as jest.Mock).mockResolvedValue({ deletedCount: 5 });

      const result = await documentService.removeAllSharedDocumentPermissionsOfUsers(userIds);

      expect(result).toEqual([
        { userId: 'user1', deletedCount: 5, success: true },
        { userId: 'user2', deletedCount: 5, success: true }
      ]);
      expect(documentService.deleteDocumentPermissions).toHaveBeenCalledTimes(2);
    });

    it('should handle errors when removing permissions fails', async () => {
      const userIds = ['user1'];
      const error = new Error('Delete failed');
      
      (documentService.deleteDocumentPermissions as jest.Mock).mockRejectedValue(error);

      const result = await documentService.removeAllSharedDocumentPermissionsOfUsers(userIds);

      expect(result).toEqual([
        { userId: 'user1', success: false, error }
      ]);
    });
  });

  describe('removeDocumentRequestAccessOfUsers', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        removeDocumentRequestAccessOfUsers = DocumentService.prototype.removeDocumentRequestAccessOfUsers;
        getRequestAccessDocument = jest.fn();
        removeRequestAccessDocument = jest.fn();
      })() as any;
    });

    it('should remove document request access for users successfully', async () => {
      const userIds = ['user1', 'user2'];
      const requestAccess = [
        { documentId: new Types.ObjectId(), requesterId: new Types.ObjectId() },
        { documentId: new Types.ObjectId(), requesterId: new Types.ObjectId() }
      ];

      (documentService.getRequestAccessDocument as jest.Mock).mockResolvedValue(requestAccess);
      (documentService.removeRequestAccessDocument as jest.Mock).mockResolvedValue(undefined);

      const result = await documentService.removeDocumentRequestAccessOfUsers(userIds);

      expect(result).toEqual([
        { docId: expect.any(String), requesterIds: [expect.any(String)], success: true },
        { docId: expect.any(String), requesterIds: [expect.any(String)], success: true }
      ]);
    });

    it('should handle errors when removing request access fails', async () => {
      const userIds = ['user1'];
      const requestAccess = [{ documentId: new Types.ObjectId(), requesterId: new Types.ObjectId() }];
      const error = new Error('Remove failed');

      (documentService.getRequestAccessDocument as jest.Mock).mockResolvedValue(requestAccess);
      (documentService.removeRequestAccessDocument as jest.Mock).mockRejectedValue(error);

      const result = await documentService.removeDocumentRequestAccessOfUsers(userIds);

      expect(result).toEqual([
        { docId: expect.any(String), requesterIds: [expect.any(String)], success: false, error }
      ]);
    });
  });

  describe('deleteAllDocumentsInOrgWorkspace', () => {
    let documentService: DocumentService;
    let organizationService: OrganizationService;
    let loggerService: LoggerService;

    beforeEach(() => {
      organizationService = new (class {
        deleteAllDocumentsInOrgWorkspace = jest.fn();
      })() as any;
      loggerService = new (class {
        error = jest.fn();
      })() as any;
      documentService = new (class {
        deleteAllDocumentsInOrgWorkspace = DocumentService.prototype.deleteAllDocumentsInOrgWorkspace;
        organizationService = organizationService;
        loggerService = loggerService;
      })() as any;
    });

    it('should delete all documents in org workspace successfully', async () => {
      const params = {
        orgId: 'org123',
        orgTeams: [{ _id: 'team1' }] as ITeam[],
        perservePersonalDoc: false
      };
      const deletedDocs = [
        { _id: 'doc1', documentType: 'pdf' },
        { _id: 'doc2', documentType: 'docx' }
      ];

      (organizationService.deleteAllDocumentsInOrgWorkspace as jest.Mock).mockResolvedValue(deletedDocs);

      const result = await documentService.deleteAllDocumentsInOrgWorkspace(params);

      expect(result).toEqual([
        { _id: 'doc1', documentType: 'pdf' },
        { _id: 'doc2', documentType: 'docx' }
      ]);
      expect(organizationService.deleteAllDocumentsInOrgWorkspace).toHaveBeenCalledWith(params);
    });

    it('should return empty array and log error when deletion fails', async () => {
      const params = {
        orgId: 'org123',
        orgTeams: [{ _id: 'team1' }] as ITeam[],
        perservePersonalDoc: false
      };
      const error = new Error('Delete failed');

      (organizationService.deleteAllDocumentsInOrgWorkspace as jest.Mock).mockRejectedValue(error);

      const result = await documentService.deleteAllDocumentsInOrgWorkspace(params);

      expect(result).toEqual([]);
      expect(loggerService.error).toHaveBeenCalled();
    });
  });

  describe('sendPreSignedUrlForConvertOfficeFile', () => {
    let documentService: DocumentService;
    let messageGateway: EventsGateway;

    beforeEach(() => {
      messageGateway = new (class {
        server = {
          to: jest.fn().mockReturnThis(),
          emit: jest.fn()
        };
      })() as any;
      documentService = new (class {
        sendPreSignedUrlForConvertOfficeFile = DocumentService.prototype.sendPreSignedUrlForConvertOfficeFile;
        messageGateway = messageGateway;
      })() as any;
    });

    it('should emit conversion events with pre-signed URL', () => {
      const fileName = 'test-file.docx';
      const preSignedUrl = 'https://example.com/signed-url';
      const errorMessage = '';

      documentService.sendPreSignedUrlForConvertOfficeFile(fileName, preSignedUrl, errorMessage);

      expect(messageGateway.server.to).toHaveBeenCalledWith(`conversion-${fileName}`);
      expect(messageGateway.server.emit).toHaveBeenCalledWith(`convertToDocx-${fileName}`, { preSignedUrl, errorMessage });
      expect(messageGateway.server.emit).toHaveBeenCalledWith(`convertToOfficeFile-${fileName}`, { preSignedUrl, errorMessage });
    });

    it('should emit conversion events with default values', () => {
      const fileName = 'test-file.docx';

      documentService.sendPreSignedUrlForConvertOfficeFile(fileName);

      expect(messageGateway.server.to).toHaveBeenCalledWith(`conversion-${fileName}`);
      expect(messageGateway.server.emit).toHaveBeenCalledWith(`convertToDocx-${fileName}`, { preSignedUrl: '', errorMessage: '' });
      expect(messageGateway.server.emit).toHaveBeenCalledWith(`convertToOfficeFile-${fileName}`, { preSignedUrl: '', errorMessage: '' });
    });
  });

  describe('sendPreSignedUrlForOCR', () => {
    let documentService: DocumentService;
    let messageGateway: EventsGateway;

    beforeEach(() => {
      messageGateway = new (class {
        server = {
          to: jest.fn().mockReturnThis(),
          emit: jest.fn()
        };
      })() as any;
      documentService = new (class {
        sendPreSignedUrlForOCR = DocumentService.prototype.sendPreSignedUrlForOCR;
        messageGateway = messageGateway;
      })() as any;
    });

    it('should emit OCR event with parameters', () => {
      const params = {
        fileName: 'uuid-doc123',
        preSignedUrl: 'https://example.com/signed-url',
        errorMessage: '',
        position: 1
      };

      documentService.sendPreSignedUrlForOCR(params);

      expect(messageGateway.server.to).toHaveBeenCalledWith(`ocr-${params.fileName}`);
      expect(messageGateway.server.emit).toHaveBeenCalledWith('ocr', {
        preSignedUrl: params.preSignedUrl,
        errorMessage: params.errorMessage,
        position: params.position
      });
    });
  });

  describe('getDriveSharersByDocument', () => {
    let documentService: DocumentService;
    let loggerService: LoggerService;
    let documentDriveMetadataModel: any;

    beforeEach(() => {
      loggerService = new (class {
        info = jest.fn();
        warn = jest.fn();
        error = jest.fn();
      })() as any;
      documentDriveMetadataModel = new (class {
        updateDocumentDriveMetadata = jest.fn();
      })() as any;
      documentService = new (class {
        getDriveSharersByDocument = DocumentService.prototype.getDriveSharersByDocument;
        updateDocumentDriveMetadata = jest.fn();
        loggerService = loggerService;
      })() as any;
    });

    it('should return sharers when permissions are available', async () => {
      const params = {
        documentId: 'doc123',
        remoteId: 'remote123',
        driveAPI: {
          permissions: {
            list: jest.fn().mockResolvedValue({
              data: {
                permissions: [
                  { emailAddress: 'user1@example.com', displayName: 'User 1', photoLink: 'photo1' },
                  { emailAddress: 'user2@example.com', displayName: 'User 2', photoLink: 'photo2' }
                ]
              }
            })
          }
        } as any
      };

      documentService.updateDocumentDriveMetadata = jest.fn().mockResolvedValue({});

      const result = await documentService.getDriveSharersByDocument(params);

      expect(result).toEqual([
        { email: 'user1@example.com', name: 'User 1', avatar: 'photo1' },
        { email: 'user2@example.com', name: 'User 2', avatar: 'photo2' }
      ]);
      expect(documentService.updateDocumentDriveMetadata).toHaveBeenCalledWith(
        { documentId: 'doc123', remoteId: 'remote123' },
        { documentId: 'doc123', remoteId: 'remote123', sharers: result },
        { upsert: true }
      );
    });

    it('should return empty array when no permissions available', async () => {
      const params = {
        documentId: 'doc123',
        remoteId: 'remote123',
        driveAPI: {
          permissions: {
            list: jest.fn().mockResolvedValue({
              data: { permissions: [] }
            })
          }
        } as any
      };

      const result = await documentService.getDriveSharersByDocument(params);

      expect(result).toEqual([]);
    });

    it('should return empty array and log error when API call fails', async () => {
      const params = {
        documentId: 'doc123',
        remoteId: 'remote123',
        driveAPI: {
          permissions: {
            list: jest.fn().mockRejectedValue({ code: 401, message: 'Unauthorized' })
          }
        } as any
      };

      const result = await documentService.getDriveSharersByDocument(params);

      expect(result).toEqual([]);
      expect(loggerService.warn).toHaveBeenCalled();
    });

    it('should log error when API throws unexpected error', async () => {
      const params = {
        documentId: 'doc123',
        remoteId: 'remote123',
        driveAPI: {
          permissions: {
            list: jest.fn().mockRejectedValue({ code: 500, message: 'Server error' })
          }
        } as any
      };
    
      const result = await documentService.getDriveSharersByDocument(params);
    
      expect(result).toEqual([]);
      expect(loggerService.error).toHaveBeenCalledWith(expect.objectContaining({
        context: 'DocumentService.getDriveSharers',
        error: { code: 500, message: 'Server error' },
        extraInfo: { documentId: 'doc123', remoteId: 'remote123' }
      }));
    });

    it('should return empty array when permissions is undefined', async () => {
      const params = {
        documentId: 'doc123',
        remoteId: 'remote123',
        driveAPI: {
          permissions: {
            list: jest.fn().mockResolvedValue({ data: {} })
          }
        } as any
      };
    
      const result = await documentService.getDriveSharersByDocument(params);
    
      expect(result).toEqual([]);
      expect(loggerService.info).toHaveBeenCalledWith(expect.objectContaining({
        context: 'getDriveSharersByDocument',
        extraInfo: expect.objectContaining({
          documentId: 'doc123',
          remoteId: 'remote123',
          numberPermissions: undefined
        })
      }));
    });    
  });

  describe('getDriveSharers', () => {
    let documentService: DocumentService;
    let environmentService: EnvironmentService;

    beforeEach(() => {
      environmentService = new (class {
        getByKey = jest.fn().mockReturnValue('google-client-id');
      })() as any;
      documentService = new (class {
        getDriveSharers = DocumentService.prototype.getDriveSharers;
        getDriveSharersByDocument = jest.fn();
        environmentService = environmentService;
      })() as any;
    });

    it('should return unique sharers from same domain', async () => {
      const params = {
        accessToken: 'access-token',
        documents: [
          { documentId: 'doc1', remoteId: 'remote1' },
          { documentId: 'doc2', remoteId: 'remote2' }
        ],
        authorizationGoogleEmail: 'admin@company.com'
      };

      const sharers1 = [
        { email: 'user1@company.com', name: 'User 1', avatar: 'avatar1' },
        { email: 'user2@company.com', name: 'User 2', avatar: 'avatar2' }
      ];
      const sharers2 = [
        { email: 'user1@company.com', name: 'User 1', avatar: 'avatar1' },
        { email: 'user3@company.com', name: 'User 3', avatar: 'avatar3' }
      ];

      (documentService.getDriveSharersByDocument as jest.Mock)
        .mockResolvedValueOnce(sharers1)
        .mockResolvedValueOnce(sharers2);

      const result = await documentService.getDriveSharers(params);

      expect(result).toEqual([
        { email: 'user1@company.com', name: 'User 1', avatar: 'avatar1' },
        { email: 'user2@company.com', name: 'User 2', avatar: 'avatar2' },
        { email: 'user3@company.com', name: 'User 3', avatar: 'avatar3' }
      ]);
    });
  });

  describe('updateFormField', () => {
    let documentService: DocumentService;
    let documentFormFieldModel: any;

    beforeEach(() => {
      documentFormFieldModel = new (class {
        updateOne = jest.fn().mockReturnThis();
        exec = jest.fn().mockResolvedValue({});
      })() as any;
      documentService = new (class {
        updateFormField = DocumentService.prototype.updateFormField;
        updateDocument = jest.fn();
        documentFormFieldModel = documentFormFieldModel;
      })() as any;
    });

    it('should update form field and document lastModify', async () => {
      const documentId = 'doc123';
      const name = 'field1';
      const data = { value: 'new value' };

      await documentService.updateFormField(documentId, name, data);

      expect(documentFormFieldModel.updateOne).toHaveBeenCalledWith(
        { name, documentId },
        data,
        { upsert: true }
      );
      expect(documentService.updateDocument).toHaveBeenCalledWith(
        documentId,
        { lastModify: expect.any(Number) }
      );
    });
  });

  describe('copyTempFileToS3', () => {
    let documentService: DocumentService;
    let awsService: AwsService;
    let environmentService: EnvironmentService;

    beforeEach(() => {
      awsService = new (class {
        copyObjectS3 = jest.fn();
        s3InstanceForDocument = jest.fn();
      })() as any;
      environmentService = new (class {
        getByKey = jest.fn();
      })() as any;
      documentService = new (class {
        copyTempFileToS3 = DocumentService.prototype.copyTempFileToS3;
        awsService = awsService;
        environmentService = environmentService;
      })() as any;
    });

    it('should copy temp file to S3 with default bucket', async () => {
      const remoteFileInfo = { mimeType: 'application/pdf', remoteId: 'remote123' };
      const expectedKey = 'uuid.pdf';
      
      (environmentService.getByKey as jest.Mock)
        .mockReturnValueOnce('target-bucket')
        .mockReturnValueOnce('source-bucket');
      (awsService.s3InstanceForDocument as jest.Mock).mockReturnValue({});
      (awsService.copyObjectS3 as jest.Mock).mockResolvedValue('new-remote-id');

      const result = await documentService.copyTempFileToS3(remoteFileInfo);

      expect(result).toBe('new-remote-id');
      expect(awsService.copyObjectS3).toHaveBeenCalledWith(
        'source-bucket/remote123',
        'target-bucket',
        expect.stringMatching(/^[a-f0-9-]+\.pdf$/),
        false,
        {}
      );
    });
  });

  describe('updateWorkspaceAndGetUploadDestination', () => {
    let documentService: DocumentService;
    let userService: UserService;

    beforeEach(() => {
      userService = new (class {
        updateLastAccessedOrg = jest.fn();
        updateUserPropertyById = jest.fn();
      })() as any;
      documentService = new (class {
        updateWorkspaceAndGetUploadDestination = DocumentService.prototype.updateWorkspaceAndGetUploadDestination;
        getDestinationWorkspace = jest.fn();
        userService = userService;
      })() as any;
    });

    it('should update workspace and return organization', async () => {
      const user = { _id: 'user123' } as any;
      const organization = { _id: 'org123' } as any;
      
      (documentService.getDestinationWorkspace as jest.Mock).mockResolvedValue(organization);

      const result = await documentService.updateWorkspaceAndGetUploadDestination(user);

      expect(result).toBe(organization);
      expect(userService.updateLastAccessedOrg).toHaveBeenCalledWith('user123', 'org123');
      expect(userService.updateUserPropertyById).toHaveBeenCalledWith('user123', { 'setting.defaultWorkspace': 'org123' });
    });
  });

  describe('getKeyAndSignedUrlsForOCR', () => {
    let documentService: DocumentService;
    let awsService: AwsService;
    let environmentService: EnvironmentService;

    beforeEach(() => {
      awsService = new (class {
        getOCRDocumentPresignedUrl = jest.fn();
      })() as any;
      environmentService = new (class {
        getByKey = jest.fn().mockReturnValue('dev');
      })() as any;
      documentService = new (class {
        getKeyAndSignedUrlsForOCR = DocumentService.prototype.getKeyAndSignedUrlsForOCR;
        awsService = awsService;
        environmentService = environmentService;
      })() as any;
    });

    it('should generate key and signed URLs for OCR', async () => {
      const documentId = 'doc123';
      const totalParts = 3;
      
      (awsService.getOCRDocumentPresignedUrl as jest.Mock)
        .mockResolvedValueOnce({ url: 'url1' })
        .mockResolvedValueOnce({ url: 'url2' })
        .mockResolvedValueOnce({ url: 'url3' });

      const result = await documentService.getKeyAndSignedUrlsForOCR(documentId, totalParts);

      expect(result.key).toMatch(/^[a-f0-9-]+-doc123$/);
      expect(result.listSignedUrls).toEqual(['url1', 'url2', 'url3']);
      expect(awsService.getOCRDocumentPresignedUrl).toHaveBeenCalledTimes(3);
    });
  });

  describe('getTargetOrgWithPremiumStatus', () => {
    let documentService: DocumentService;
    let organizationService: OrganizationService;

    beforeEach(() => {
      organizationService = new (class {
        getOrgById = jest.fn();
      })() as any;
      documentService = new (class {
        getTargetOrgWithPremiumStatus = DocumentService.prototype.getTargetOrgWithPremiumStatus;
        updateWorkspaceAndGetUploadDestination = jest.fn();
        organizationService = organizationService;
        loggerService = {
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
        };
      })() as any;
    });

    it('should return null for premium user', async () => {
      const user = { payment: { type: 'PREMIUM' } } as any;
      
      const result = await documentService.getTargetOrgWithPremiumStatus(user);

      expect(result).toEqual({ isPremiumOrg: false, targetOrgId: null });
    });

    it('should return premium status for free user', async () => {
      const user = { payment: { type: 'FREE' } } as any;
      const org = { payment: { type: 'PREMIUM' } };
      
      (documentService.updateWorkspaceAndGetUploadDestination as jest.Mock).mockResolvedValue({ _id: 'org123' });
      (organizationService.getOrgById as jest.Mock).mockResolvedValue(org);

      const result = await documentService.getTargetOrgWithPremiumStatus(user);

      expect(result).toEqual({ isPremiumOrg: true, targetOrgId: 'org123' });
    });
  });

  describe('getFormFieldByDocumentId', () => {
    let documentService: DocumentService;
    let documentFormFieldModel: any;
  
    beforeEach(() => {
      documentFormFieldModel = new (class {
        find = jest.fn().mockReturnThis();
        exec = jest.fn();
      })() as any;
      documentService = new (class {
        getFormFieldByDocumentId = DocumentService.prototype.getFormFieldByDocumentId;
        documentFormFieldModel = documentFormFieldModel;
      })() as any;
    });
  
    it('should get form fields by document ID', async () => {
      const documentId = 'doc123';
      const formFields = [
        {
          _id: new Types.ObjectId(),
          name: 'field1',
          toObject: () => ({ name: 'field1' }),
        },
        {
          _id: new Types.ObjectId(),
          name: 'field2',
          toObject: () => ({ name: 'field2' }),
        },
      ];
  
      documentFormFieldModel.exec.mockResolvedValue(formFields);
  
      const result = await documentService.getFormFieldByDocumentId(documentId);
  
      expect(result).toEqual([
        { name: 'field1', _id: formFields[0]._id.toHexString() },
        { name: 'field2', _id: formFields[1]._id.toHexString() },
      ]);
      expect(documentFormFieldModel.find).toHaveBeenCalledWith({ documentId }, undefined, undefined);
    });

    it('should return empty array if exec returns undefined', async () => {
      documentFormFieldModel.exec.mockResolvedValue(undefined);
    
      const result = await documentService.getFormFieldByDocumentId('doc999');
    
      expect(result).toEqual(undefined);
    });
    
  });

  describe('getFormFieldByIds', () => {
    let documentService: DocumentService;
    let documentFormFieldModel: any;

    beforeEach(() => {
      documentFormFieldModel = new (class {
        find = jest.fn().mockReturnThis();
        exec = jest.fn();
      })() as any;
      documentService = new (class {
        getFormFieldByIds = DocumentService.prototype.getFormFieldByIds;
        documentFormFieldModel = documentFormFieldModel;
      })() as any;
    });

    it('should get form fields by IDs', async () => {
      const ids = ['field1', 'field2'];
      const formFields = [{ _id: 'field1' }, { _id: 'field2' }];
      
      documentFormFieldModel.exec.mockResolvedValue(formFields);

      const result = await documentService.getFormFieldByIds(ids);

      expect(result).toBe(formFields);
      expect(documentFormFieldModel.find).toHaveBeenCalledWith({"_id": {"$in": ["field1", "field2"]}}, undefined);
    });
  });

  describe('deleteFormFieldByIds', () => {
    let documentService: DocumentService;
    let documentFormFieldModel: any;

    beforeEach(() => {
      documentFormFieldModel = new (class {
        deleteMany = jest.fn().mockReturnThis();
        exec = jest.fn();
      })() as any;
      documentService = new (class {
        deleteFormFieldByIds = DocumentService.prototype.deleteFormFieldByIds;
        documentFormFieldModel = documentFormFieldModel;
      })() as any;
    });

    it('should delete form fields by IDs', async () => {
      const ids = ['field1', 'field2'];
      
      documentFormFieldModel.exec.mockResolvedValue({ deletedCount: 2 });

      const result = await documentService.deleteFormFieldByIds(ids);

      expect(result).toEqual({ deletedCount: 2 });
      expect(documentFormFieldModel.deleteMany).toHaveBeenCalledWith({ _id: { $in: ids } });
    });
  });

  describe('deleteFormFieldFromDocument', () => {
    let documentService: DocumentService;
    let documentFormFieldModel: any;

    beforeEach(() => {
      documentFormFieldModel = new (class {
        deleteMany = jest.fn().mockReturnThis();
        exec = jest.fn();
      })() as any;
      documentService = new (class {
        deleteFormFieldFromDocument = DocumentService.prototype.deleteFormFieldFromDocument;
        documentFormFieldModel = documentFormFieldModel;
      })() as any;
    });

    it('should delete form fields from document', async () => {
      const documentId = 'doc123';
      
      documentFormFieldModel.exec.mockResolvedValue({ deletedCount: 3 });

      const result = await documentService.deleteFormFieldFromDocument(documentId);

      expect(result).toEqual({ deletedCount: 3 });
      expect(documentFormFieldModel.deleteMany).toHaveBeenCalledWith({ documentId });
    });
  });

  describe('deleteFormFieldFromDocumentByFieldName', () => {
    let documentService: DocumentService;
    let documentFormFieldModel: any;

    beforeEach(() => {
      documentFormFieldModel = new (class {
        deleteMany = jest.fn().mockReturnThis();
        exec = jest.fn();
      })() as any;
      documentService = new (class {
        deleteFormFieldFromDocumentByFieldName = DocumentService.prototype.deleteFormFieldFromDocumentByFieldName;
        documentFormFieldModel = documentFormFieldModel;
      })() as any;
    });

    it('should delete form fields by document ID and field name', async () => {
      const documentId = 'doc123';
      const fieldName = 'field1';
      
      documentFormFieldModel.exec.mockResolvedValue({ deletedCount: 1 });

      const result = await documentService.deleteFormFieldFromDocumentByFieldName(documentId, fieldName);

      expect(result).toEqual({ deletedCount: 1 });
      expect(documentFormFieldModel.deleteMany).toHaveBeenCalledWith({ documentId, name: fieldName });
    });
  });

  describe('insertManyFormField', () => {
    let documentService: DocumentService;
    let documentFormFieldModel: any;

    beforeEach(() => {
      documentFormFieldModel = new (class {
        insertMany = jest.fn();
      })() as any;
      documentService = new (class {
        insertManyFormField = DocumentService.prototype.insertManyFormField;
        documentFormFieldModel = documentFormFieldModel;
      })() as any;
    });

    it('should insert many form fields', async () => {
      const data = [{ name: 'field1' }, { name: 'field2' }];
      const insertedFields = [{ _id: 'field1' }, { _id: 'field2' }];
      
      documentFormFieldModel.insertMany.mockResolvedValue(insertedFields);

      const result = await documentService.insertManyFormField(data as any);

      expect(result).toBe(insertedFields);
      expect(documentFormFieldModel.insertMany).toHaveBeenCalledWith(data);
    });
  });

  describe('copyFormFields', () => {
    let documentService: DocumentService;
    let documentFormFieldModel: any;

    beforeEach(() => {
      documentFormFieldModel = new (class {
        find = jest.fn().mockReturnThis();
        lean = jest.fn().mockReturnThis();
        exec = jest.fn();
        insertMany = jest.fn();
      })() as any;
      documentService = new (class {
        copyFormFields = DocumentService.prototype.copyFormFields;
        insertManyFormField = jest.fn();
        documentFormFieldModel = documentFormFieldModel;
      })() as any;
    });

    it('should copy form fields from source to target document', async () => {
      const sourceDocId = 'source123';
      const copiedDocId = 'copied123';
      const formFields = [
        { name: 'field1', type: 'text' },
        { name: 'field2', type: 'number' }
      ];
      const insertedFields = [{ _id: 'new1' }, { _id: 'new2' }];
      
      documentFormFieldModel.exec.mockResolvedValue(formFields);
      (documentService.insertManyFormField as jest.Mock).mockResolvedValue(insertedFields);

      const result = await documentService.copyFormFields(sourceDocId, copiedDocId);

      expect(result).toBe(insertedFields);
      expect(documentFormFieldModel.find).toHaveBeenCalledWith({ documentId: sourceDocId }, { _id: 0 });
      expect(documentService.insertManyFormField).toHaveBeenCalledWith([
        { name: 'field1', type: 'text', documentId: copiedDocId },
        { name: 'field2', type: 'number', documentId: copiedDocId }
      ]);
    });
  });

  describe('ensureUniqueThirdPartyDocument', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        ensureUniqueThirdPartyDocument = DocumentService.prototype.ensureUniqueThirdPartyDocument;
        aggregateDocument = jest.fn();
        getDocumentPermissionByConditions = jest.fn();
        deleteOriginalDocument = jest.fn();
      })() as any;
    });

    it('should not remove documents when no duplicates exist', async () => {
      const userId = new Types.ObjectId();
      (documentService.aggregateDocument as jest.Mock).mockResolvedValue([]);
    
      await documentService.ensureUniqueThirdPartyDocument(userId.toHexString());
    
      expect(documentService.getDocumentPermissionByConditions).not.toHaveBeenCalled();
      expect(documentService.deleteOriginalDocument).not.toHaveBeenCalled();
    });

    it('should remove duplicate documents when they exist', async () => {
      const userId = new Types.ObjectId();
      const duplicates = [{
        _id: new Types.ObjectId(),
        count: 2,
        documents: [
          { _id: new Types.ObjectId() },
          { _id: new Types.ObjectId() }
        ]
      }];
      const permissions = [
        { documentId: duplicates[0].documents[0]._id, workspace: { refId: new Types.ObjectId() } },
        { documentId: duplicates[0].documents[1]._id, workspace: null }
      ];
    
      (documentService.aggregateDocument as jest.Mock).mockResolvedValue(duplicates);
      (documentService.getDocumentPermissionByConditions as jest.Mock).mockResolvedValue(permissions);
      (documentService.deleteOriginalDocument as jest.Mock).mockResolvedValue({});
    
      await documentService.ensureUniqueThirdPartyDocument(userId.toHexString(), (permissions[0] as any).workspace.refId.toHexString());
    
      expect(documentService.deleteOriginalDocument).toHaveBeenCalled();
    });

    it('should keep document in personal workspace when prioritizeOrgId is not set', async () => {
      const userId = new Types.ObjectId();
      const doc1 = { _id: new Types.ObjectId() };
      const doc2 = { _id: new Types.ObjectId() };
      const duplicates = [
        {
          _id: new Types.ObjectId(),
          count: 2,
          documents: [doc1, doc2],
        },
      ];
      const permissions = [
        { documentId: doc1._id, workspace: { refId: new Types.ObjectId() } },
        { documentId: doc2._id, workspace: null },
      ];
    
      (documentService.aggregateDocument as jest.Mock).mockResolvedValue(duplicates);
      (documentService.getDocumentPermissionByConditions as jest.Mock).mockResolvedValue(permissions);
      (documentService.deleteOriginalDocument as jest.Mock).mockResolvedValue({});
    
      await documentService.ensureUniqueThirdPartyDocument(userId.toHexString());

      expect(documentService.deleteOriginalDocument).toHaveBeenCalledWith(
        expect.objectContaining({ _id: doc1._id.toHexString() })
      );
      expect(documentService.deleteOriginalDocument).not.toHaveBeenCalledWith(
        expect.objectContaining({ _id: doc2._id.toHexString() })
      );
    });
    
    it('should return empty array when no document permission matches prioritizeOrgId', async () => {
      const userId = new Types.ObjectId();
      const duplicates = [{
        _id: new Types.ObjectId(),
        count: 2,
        documents: [
          { _id: new Types.ObjectId() },
          { _id: new Types.ObjectId() }
        ]
      }];
      const permissions = [
        { documentId: duplicates[0].documents[0]._id, workspace: { refId: new Types.ObjectId() } },
        { documentId: duplicates[0].documents[1]._id, workspace: { refId: new Types.ObjectId() } },
      ];
    
      (documentService.aggregateDocument as jest.Mock).mockResolvedValue(duplicates);
      (documentService.getDocumentPermissionByConditions as jest.Mock).mockResolvedValue(permissions);
      (documentService.deleteOriginalDocument as jest.Mock).mockResolvedValue({});
    
      await documentService.ensureUniqueThirdPartyDocument(
        userId.toHexString(),
        new Types.ObjectId().toHexString(),
      );
    
      expect(documentService.deleteOriginalDocument).not.toHaveBeenCalled();
    });
  });

  describe('addToRecentDocumentList', () => {
    let documentService: DocumentService;
    let recentDocumentListModel: any;

    beforeEach(() => {
      recentDocumentListModel = new (class {
        findOneAndUpdate = jest.fn();
      })() as any;
      documentService = new (class {
        addToRecentDocumentList = DocumentService.prototype.addToRecentDocumentList;
        recentDocumentListModel = recentDocumentListModel;
        publishUpdateDocument = jest.fn();
      })() as any;
    });

    it('should add documents to recent document list', async () => {
      const params = {
        userId: 'user123',
        organizationId: 'org123',
        documents: [{ _id: 'doc1' }, { _id: 'doc2' }]
      };
      
      recentDocumentListModel.findOneAndUpdate.mockResolvedValue({});

      await documentService.addToRecentDocumentList(params as any);

      expect(recentDocumentListModel.findOneAndUpdate).toHaveBeenCalledTimes(2);
      expect(documentService.publishUpdateDocument).toHaveBeenCalledTimes(2);
    });
  });

  describe('removeFromRecentDocumentList', () => {
    let documentService: DocumentService;
    let recentDocumentListModel: any;

    beforeEach(() => {
      recentDocumentListModel = new (class {
        updateMany = jest.fn().mockReturnThis();
        session = jest.fn().mockReturnThis();
        exec = jest.fn();
      })() as any;
      documentService = new (class {
        removeFromRecentDocumentList = DocumentService.prototype.removeFromRecentDocumentList;
        recentDocumentListModel = recentDocumentListModel;
      })() as any;
    });

    it('should remove documents from recent document list', async () => {
      const documentIds = ['doc1', 'doc2'];
      const session = {} as any;
      
      recentDocumentListModel.exec.mockResolvedValue({});

      await documentService.removeFromRecentDocumentList(documentIds, session);

      expect(recentDocumentListModel.updateMany).toHaveBeenCalledWith(
        { 'documents._id': { $in: documentIds } },
        { $pull: { documents: { _id: { $in: documentIds } } } }
      );
      expect(recentDocumentListModel.session).toHaveBeenCalledWith(session);
    });
  });

  describe('removeDocumentsFromUserRecentList', () => {
    let documentService: DocumentService;
    let recentDocumentListModel: any;

    beforeEach(() => {
      recentDocumentListModel = new (class {
        updateMany = jest.fn().mockReturnThis();
        session = jest.fn().mockReturnThis();
        exec = jest.fn();
      })() as any;
      documentService = new (class {
        removeDocumentsFromUserRecentList = DocumentService.prototype.removeDocumentsFromUserRecentList;
        recentDocumentListModel = recentDocumentListModel;
      })() as any;
    });

    it('should remove documents from user recent document list with organization filter', async () => {
      const params = {
        userId: 'user123',
        documentIds: ['doc1', 'doc2'],
        organizationId: 'org123',
      };
      
      recentDocumentListModel.exec.mockResolvedValue({});

      await documentService.removeDocumentsFromUserRecentList(params);

      expect(recentDocumentListModel.updateMany).toHaveBeenCalledWith(
        { userId: 'user123', organizationId: 'org123' },
        { $pull: { documents: { _id: { $in: ['doc1', 'doc2'] } } } }
      );
    });

    it('should remove documents from user recent document list without organization filter', async () => {
      const params = {
        userId: 'user123',
        documentIds: ['doc1', 'doc2'],
        session: {} as any
      };
      
      recentDocumentListModel.exec.mockResolvedValue({});

      await documentService.removeDocumentsFromUserRecentList(params);

      expect(recentDocumentListModel.updateMany).toHaveBeenCalledWith(
        { userId: 'user123' },
        { $pull: { documents: { _id: { $in: ['doc1', 'doc2'] } } } }
      );
    });
  });

  describe('deleteRecentDocumentList', () => {
    let documentService: DocumentService;
    let recentDocumentListModel: any;

    beforeEach(() => {
      recentDocumentListModel = new (class {
        deleteMany = jest.fn().mockReturnThis();
        deleteOne = jest.fn().mockReturnThis();
        session = jest.fn().mockReturnThis();
        exec = jest.fn();
      })() as any;
      documentService = new (class {
        deleteRecentDocumentList = DocumentService.prototype.deleteRecentDocumentList;
        recentDocumentListModel = recentDocumentListModel;
      })() as any;
    });

    it('should delete all recent document lists for user when no organization specified', async () => {
      const params = { userId: 'user123' };
      
      recentDocumentListModel.exec.mockResolvedValue({});

      await documentService.deleteRecentDocumentList(params);

      expect(recentDocumentListModel.deleteMany).toHaveBeenCalledWith({ userId: 'user123' });
      expect(recentDocumentListModel.session).toHaveBeenCalledWith(null);
    });

    it('should delete specific organization recent document list', async () => {
      const params = { userId: 'user123', organizationId: 'org123', session: {} as any };
      
      recentDocumentListModel.exec.mockResolvedValue({});

      await documentService.deleteRecentDocumentList(params);

      expect(recentDocumentListModel.deleteOne).toHaveBeenCalledWith({ userId: 'user123', organizationId: 'org123' });
      expect(recentDocumentListModel.session).toHaveBeenCalledWith({});
    });
  });

  describe('getPopulatedRecentDocumentList', () => {
    let documentService: DocumentService;
    let recentDocumentListModel: any;

    beforeEach(() => {
      recentDocumentListModel = new (class {
        aggregate = jest.fn().mockReturnThis();
        match = jest.fn().mockReturnThis();
        unwind = jest.fn().mockReturnThis();
        sort = jest.fn().mockReturnThis();
        limit = jest.fn().mockReturnThis();
        lookup = jest.fn().mockReturnThis();
        addFields = jest.fn().mockReturnThis();
        replaceRoot = jest.fn().mockReturnThis();
        exec = jest.fn();
      })() as any;
      documentService = new (class {
        getPopulatedRecentDocumentList = DocumentService.prototype.getPopulatedRecentDocumentList;
        recentDocumentListModel = recentDocumentListModel;
      })() as any;
    });

    it('should get populated recent document list', async () => {
      const userId = new Types.ObjectId();
      const orgId = new Types.ObjectId();
      const params = {
        userId: userId,
        organizationId: orgId,
        cursor: 'cursor123',
        limit: 10
      };
      const documents = [{ _id: 'doc1' }, { _id: 'doc2' }];
      
      recentDocumentListModel.exec.mockResolvedValue(documents);

      const result = await documentService.getPopulatedRecentDocumentList(params as any);

      expect(result).toBe(documents);
      expect(recentDocumentListModel.aggregate).toHaveBeenCalled();
    });
  });

  describe('getRecentDocumentList', () => {
    let documentService: DocumentService;
    let recentDocumentListModel: any;

    beforeEach(() => {
      recentDocumentListModel = new (class {
        findOne = jest.fn().mockReturnThis();
        lean = jest.fn().mockReturnThis();
        exec = jest.fn();
      })() as any;
      documentService = new (class {
        getRecentDocumentList = DocumentService.prototype.getRecentDocumentList;
        recentDocumentListModel = recentDocumentListModel;
      })() as any;
    });

    it('should get recent document list', async () => {
      const userId = new Types.ObjectId();
      const organizationId = new Types.ObjectId();
      const recentList = { _id: new Types.ObjectId(), documents: [] };
      
      recentDocumentListModel.exec.mockResolvedValue(recentList);

      const result = await documentService.getRecentDocumentList(userId as any, organizationId as any);

      expect(result).toEqual({
        ...recentList,
        _id: recentList._id.toHexString(),
      });
    });

    it('should return null when no recent document list found', async () => {
      const userId = 'user123';
      const organizationId = 'org123';
      
      recentDocumentListModel.exec.mockResolvedValue(null);

      const result = await documentService.getRecentDocumentList(userId, organizationId);

      expect(result).toBe(null);
    });
  });

  describe('haveDocumentsAvailable', () => {
    let documentService: DocumentService;
    let teamService: TeamService;

    beforeEach(() => {
      teamService = new (class {
        getUserTeams = jest.fn();
      })() as any;
      documentService = new (class {
        haveDocumentsAvailable = DocumentService.prototype.haveDocumentsAvailable;
        findOneDocumentPermission = jest.fn();
        teamService = teamService;
      })() as any;
    });

    it('should return true when personal document exists', async () => {
      const user = { _id: 'user123' } as any;
      const organization = { _id: 'org123' } as any;
      
      (documentService.findOneDocumentPermission as jest.Mock).mockResolvedValueOnce({ _id: 'permission1' });

      const result = await documentService.haveDocumentsAvailable(user, organization);

      expect(result).toBe(true);
    });

    it('should return true when organization document exists', async () => {
      const user = { _id: 'user123' } as any;
      const organization = { _id: 'org123' } as any;
      
      (documentService.findOneDocumentPermission as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ _id: 'permission2' });

      const result = await documentService.haveDocumentsAvailable(user, organization);

      expect(result).toBe(true);
    });

    it('should return true when team document exists', async () => {
      const user = { _id: 'user123' } as any;
      const organization = { _id: 'org123' } as any;
      const teams = [{ _id: 'team1' }, { _id: 'team2' }];
      
      (documentService.findOneDocumentPermission as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ _id: 'permission3' });
      (teamService.getUserTeams as jest.Mock).mockResolvedValue(teams);

      const result = await documentService.haveDocumentsAvailable(user, organization);

      expect(result).toBe(true);
    });

    it('should return false when no documents available', async () => {
      const user = { _id: 'user123' } as any;
      const organization = { _id: 'org123' } as any;
      const teams = [{ _id: 'team1' }];
      
      (documentService.findOneDocumentPermission as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (teamService.getUserTeams as jest.Mock).mockResolvedValue(teams);

      const result = await documentService.haveDocumentsAvailable(user, organization);

      expect(result).toBe(false);
    });
  });

  describe('getOrganizationDocuments', () => {
    let documentService: DocumentService;
    let documentPermissionModel: any;
    let user: User;
    let organization: IOrganization;
    let userTeams: ITeam[];

    beforeEach(() => {
      documentPermissionModel = {
        aggregate: jest.fn(),
        modelName: 'DocumentPermission'
      };

      documentService = new (class {
        getOrganizationDocuments = DocumentService.prototype.getOrganizationDocuments;
        documentPermissionModel = documentPermissionModel;
      })() as any;

      user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe'
      } as unknown as User;

      organization = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Organization',
        domain: 'test.com'
      } as unknown as IOrganization;

      userTeams = [
        {
          _id: '507f1f77bcf86cd799439013',
          name: 'Team 1'
        },
        {
          _id: '507f1f77bcf86cd799439014', 
          name: 'Team 2'
        }
      ] as unknown as ITeam[];
    });

    it('should return organization documents with pagination', async () => {
      const input = {
        orgId: '507f1f77bcf86cd799439012',
        searchKey: 'test',
        cursor: '1640995200000',
        limit: 10
      };
      const mockAggregateResult = [{
        total: [{ count: 25 }],
        data: [
          {
            _id: 'doc1',
            name: 'Test Document 1',
            lastAccess: new Date('2022-01-01'),
            ownerId: 'user123'
          },
          {
            _id: 'doc2', 
            name: 'Test Document 2',
            lastAccess: new Date('2022-01-02'),
            ownerId: 'user123'
          }
        ]
      }];

      documentPermissionModel.aggregate.mockResolvedValue(mockAggregateResult);

      const result = await documentService.getOrganizationDocuments(
        user,
        organization,
        userTeams,
        input
      );

      expect(result).toEqual({
        results: [
          {
            _id: 'doc1',
            name: 'Test Document 1',
            lastAccess: new Date('2022-01-01'),
            ownerId: 'user123'
          },
          {
            _id: 'doc2',
            name: 'Test Document 2', 
            lastAccess: new Date('2022-01-02'),
            ownerId: 'user123'
          }
        ],
        cursor: null,
        total: 25
      });

      expect(documentPermissionModel.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            $or: [
              {
                refId: expect.any(Object),
                role: 'owner',
                'workspace.refId': expect.any(Object)
              },
              {
                refId: expect.any(Object),
                role: 'organization'
              },
              {
                refId: {
                  $in: [expect.any(Object), expect.any(Object)]
                },
                role: 'organization_team'
              }
            ]
          }
        },
        {
          $lookup: {
            from: 'documents',
            let: { resourceId: '$documentId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$resourceId'] },
                      { $lte: ['$lastAccess', new Date(Number('1640995200000'))] },
                      {
                        $regexMatch: {
                          input: '$name',
                          regex: 'test',
                          options: 'i'
                        }
                      }
                    ]
                  }
                }
              }
            ],
            as: 'resource'
          }
        },
        {
          $facet: {
            total: [
              { $match: { 'resource.0': { $exists: true } } },
              { $count: 'count' }
            ],
            data: [
              {
                $sort: { 'resource.lastAccess': -1 }
              },
              {
                $limit: 11
              },
              {
                $unwind: '$resource'
              },
              {
                $replaceRoot: {
                  newRoot: '$resource'
                }
              }
            ]
          }
        }
      ]);
    });
  });

  describe('updateRecentDocumentsAfterMove', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        updateRecentDocumentsAfterMove = DocumentService.prototype.updateRecentDocumentsAfterMove;
        removeFromRecentDocumentList = jest.fn();
        findDocumentsByIds = jest.fn();
        addToRecentDocumentList = jest.fn();
      })() as any;
    });

    it('should remove documents from recent list when moving to personal workspace', async () => {
      const params = {
        moveToPersonalWorkspace: true,
        documentIds: ['doc1', 'doc2'],
        actorId: 'user123'
      };

      await documentService.updateRecentDocumentsAfterMove(params);

      expect(documentService.removeFromRecentDocumentList).toHaveBeenCalledWith(['doc1', 'doc2']);
      expect(documentService.addToRecentDocumentList).not.toHaveBeenCalled();
    });

    it('should add documents to recent list when moving to organization', async () => {
      const params = {
        moveToPersonalWorkspace: false,
        documentIds: ['doc1', 'doc2'],
        actorId: 'user123',
        orgId: 'org123'
      };
      const documents = [{ _id: 'doc1' }, { _id: 'doc2' }];
      
      (documentService.findDocumentsByIds as jest.Mock).mockResolvedValue(documents);

      await documentService.updateRecentDocumentsAfterMove(params);

      expect(documentService.findDocumentsByIds).toHaveBeenCalledWith(['doc1', 'doc2']);
      expect(documentService.addToRecentDocumentList).toHaveBeenCalledWith({
        userId: 'user123',
        organizationId: 'org123',
        documents
      });
    });
  });

  describe('updateRecentDocumentsForThirdParty', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        updateRecentDocumentsForThirdParty = DocumentService.prototype.updateRecentDocumentsForThirdParty;
        removeFromRecentDocumentList = jest.fn();
        addToRecentDocumentList = jest.fn();
      })() as any;
    });

    it('should return early if no organization provided', async () => {
      const params = {
        organization: null,
        existingDocuments: [],
        userId: 'user123',
        newDocuments: []
      };

      await documentService.updateRecentDocumentsForThirdParty(params);

      expect(documentService.removeFromRecentDocumentList).not.toHaveBeenCalled();
      expect(documentService.addToRecentDocumentList).not.toHaveBeenCalled();
    });

    it('should remove existing documents and add new documents when organization is provided', async () => {
      const params = {
        organization: { _id: 'org123', name: 'Test Org', createdAt: new Date(), avatarRemoteId: '', ownerId: 'owner123' } as IOrganization,
        existingDocuments: [{ _id: 'doc1' }, { _id: 'doc2' }] as Document[],
        userId: 'user123',
        newDocuments: [{ _id: 'doc3' }, { _id: 'doc4' }] as IDocument[]
      };

      await documentService.updateRecentDocumentsForThirdParty(params);

      expect(documentService.removeFromRecentDocumentList).toHaveBeenCalledWith(['doc1', 'doc2']);
      expect(documentService.addToRecentDocumentList).toHaveBeenCalledWith({
        userId: 'user123',
        organizationId: 'org123',
        documents: [{ _id: 'doc3' }, { _id: 'doc4' }]
      });
    });

    it('should only add new documents when no existing documents', async () => {
      const params = {
        organization: { _id: 'org123', name: 'Test Org', createdAt: new Date(), avatarRemoteId: '', ownerId: 'owner123' } as IOrganization,
        existingDocuments: [] as Document[],
        userId: 'user123',
        newDocuments: [{ _id: 'doc3' }, { _id: 'doc4' }] as IDocument[]
      };

      await documentService.updateRecentDocumentsForThirdParty(params);

      expect(documentService.removeFromRecentDocumentList).not.toHaveBeenCalled();
      expect(documentService.addToRecentDocumentList).toHaveBeenCalledWith({
        userId: 'user123',
        organizationId: 'org123',
        documents: [{ _id: 'doc3' }, { _id: 'doc4' }]
      });
    });
  });

  describe('getTotalDocumentsSizeByIds', () => {
    let documentService: DocumentService;
    let mockDocumentModel: any;

    beforeEach(() => {
      mockDocumentModel = {
        aggregate: jest.fn()
      };
      
      documentService = new (class {
        getTotalDocumentsSizeByIds = DocumentService.prototype.getTotalDocumentsSizeByIds;
        documentModel = mockDocumentModel;
      })() as any;
    });

    it('should calculate total size for given document IDs', async () => {
      const documentIds = [new Types.ObjectId(), new Types.ObjectId()];
      const mockResults = [
        { totalSize: 1000 },
        { totalSize: 2000 }
      ];
      
      mockDocumentModel.aggregate.mockResolvedValue(mockResults);

      const result = await documentService.getTotalDocumentsSizeByIds({ documentIds: documentIds.map((id) => id.toHexString()) });

      expect(result).toBe(3000);
      expect(mockDocumentModel.aggregate).toHaveBeenCalledWith([
        { $match: { _id: { $in: [expect.any(Object), expect.any(Object)] } } },
        { $group: { _id: null, totalSize: { $sum: '$size' } } },
      ], undefined);
    });

    it('should return 0 for empty results', async () => {
      const documentIds = [new Types.ObjectId()];
      
      mockDocumentModel.aggregate.mockResolvedValue([]);

      const result = await documentService.getTotalDocumentsSizeByIds({ documentIds: documentIds.map((id) => id.toHexString()) });

      expect(result).toBe(0);
    });
  });

  describe('getDocumentsByFolderIds', () => {
    let documentService: DocumentService;
    let mockDocumentModel: any;

    beforeEach(() => {
      mockDocumentModel = {
        find: jest.fn()
      };
      
      documentService = new (class {
        getDocumentsByFolderIds = DocumentService.prototype.getDocumentsByFolderIds;
        documentModel = mockDocumentModel;
      })() as any;
    });

    it('should find documents by folder IDs', async () => {
      const folderIds = [new Types.ObjectId(), new Types.ObjectId()];
      const mockDocuments = [{ _id: 'doc1' }, { _id: 'doc2' }];
      
      mockDocumentModel.find.mockResolvedValue(mockDocuments);

      const result = await documentService.getDocumentsByFolderIds({ folderIds: folderIds.map((id) => id.toHexString()) });

      expect(result).toEqual(mockDocuments);
      expect(mockDocumentModel.find).toHaveBeenCalledWith(
        { folderId: { $in: [expect.any(Object), expect.any(Object)] } },
        undefined,
        undefined
      );
    });

    it('should find documents with projection and options', async () => {
      const folderIds = [new Types.ObjectId()];
      const projection = { name: 1, size: 1 };
      const options = { limit: 10 };
      const mockDocuments = [{ _id: 'doc1' }];
      
      mockDocumentModel.find.mockResolvedValue(mockDocuments);

      const result = await documentService.getDocumentsByFolderIds({ 
        folderIds: folderIds.map((id) => id.toHexString()), 
        projection, 
        options 
      });

      expect(result).toEqual(mockDocuments);
      expect(mockDocumentModel.find).toHaveBeenCalledWith(
        { folderId: { $in: [expect.any(Object)] } },
        projection,
        options
      );
    });
  });

  describe('checkDownloadMultipleDocuments', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        checkDownloadMultipleDocuments = DocumentService.prototype.checkDownloadMultipleDocuments;
        getDocumentsByFolderIds = jest.fn();
        getTotalDocumentsSizeByIds = jest.fn();
        organizationService = { getOrgById: jest.fn() };
        organizationDocStackService = { 
          countStackedDocuments: jest.fn(),
          validateIncreaseDocStack: jest.fn()
        };
        folderService = { findFolderDescendants: jest.fn() };
      })() as any;
      (documentService as any).organizationService = { getOrgById: jest.fn() };
      (documentService as any).organizationDocStackService = { 
        countStackedDocuments: jest.fn(),
        validateIncreaseDocStack: jest.fn()
      };
      (documentService as any).folderService = { findFolderDescendants: jest.fn() };
    });

    it('should return success for valid document download', async () => {
      const input = {
        documentIds: ['doc1', 'doc2'],
        orgId: 'org123'
      };
      
      (documentService.getTotalDocumentsSizeByIds as jest.Mock).mockResolvedValue(1000);
      ((documentService as any).organizationService.getOrgById as jest.Mock).mockResolvedValue({ _id: 'org123' });
      ((documentService as any).organizationDocStackService.countStackedDocuments as jest.Mock).mockResolvedValue(0);
      ((documentService as any).organizationDocStackService.validateIncreaseDocStack as jest.Mock).mockResolvedValue(true);

      const result = await documentService.checkDownloadMultipleDocuments(input);

      expect(result).toEqual({ totalDocuments: 2 });
    });

    it('should return document limit exceeded error', async () => {
      const input = {
        documentIds: Array(101).fill('doc').map((_, i) => `doc${i}`),
        orgId: 'org123'
      };

      const result = await documentService.checkDownloadMultipleDocuments(input);

      expect(result.isDocumentLimitExceeded).toBe(true);
      expect(result.totalDocuments).toBe(101);
    });

    it('should return total size exceeded error', async () => {
      const input = {
        documentIds: ['doc1', 'doc2'],
        orgId: 'org123'
      };
      
      (documentService.getTotalDocumentsSizeByIds as jest.Mock).mockResolvedValue(1000000000);

      const result = await documentService.checkDownloadMultipleDocuments(input);

      expect(result.isTotalSizeExceeded).toBe(true);
      expect(result.totalDocuments).toBe(2);
    });

    it('should return doc stack insufficient error', async () => {
      const input = {
        documentIds: ['doc1', 'doc2'],
        orgId: 'org123'
      };
      
      (documentService.getTotalDocumentsSizeByIds as jest.Mock).mockResolvedValue(1000);
      ((documentService as any).organizationService.getOrgById as jest.Mock).mockResolvedValue({ _id: 'org123' });
      ((documentService as any).organizationDocStackService.countStackedDocuments as jest.Mock).mockResolvedValue(0);
      ((documentService as any).organizationDocStackService.validateIncreaseDocStack as jest.Mock).mockResolvedValue(false);

      const result = await documentService.checkDownloadMultipleDocuments(input);

      expect(result.isDocStackInsufficient).toBe(true);
      expect(result.totalDocuments).toBe(2);
    });

    it('should include documents from folderIds', async () => {
      const input = {
        documentIds: ['doc1'],
        folderIds: ['folder1'],
        orgId: 'org123',
      };
    
      ((documentService as any).folderService.findFolderDescendants as jest.Mock)
        .mockResolvedValue([{ _id: 'folder2' }]);
      (documentService.getDocumentsByFolderIds as jest.Mock)
        .mockResolvedValue([{ _id: { toHexString: () => 'docFromFolder' } }]);
      (documentService.getTotalDocumentsSizeByIds as jest.Mock).mockResolvedValue(500);
      ((documentService as any).organizationService.getOrgById as jest.Mock).mockResolvedValue({ _id: 'org123' });
      ((documentService as any).organizationDocStackService.countStackedDocuments as jest.Mock).mockResolvedValue(0);
      ((documentService as any).organizationDocStackService.validateIncreaseDocStack as jest.Mock).mockResolvedValue(true);
    
      const result = await documentService.checkDownloadMultipleDocuments(input);
    
      expect(result.totalDocuments).toBe(2);
      expect(documentService.getDocumentsByFolderIds).toHaveBeenCalledWith({
        folderIds: ['folder1', 'folder2'],
        projection: { _id: 1 },
      });
    });
    
    it('should return totalDocuments without org check when orgId is missing', async () => {
      const input = {
        documentIds: ['doc1', 'doc2'],
      };
    
      (documentService.getTotalDocumentsSizeByIds as jest.Mock).mockResolvedValue(500);
    
      const result = await documentService.checkDownloadMultipleDocuments(input);
    
      expect(result).toEqual({ totalDocuments: 2 });
    });
    
    it('should throw NotFound error when organization does not exist', async () => {
      const input = {
        orgId: 'orgNotExist',
      };
    
      (documentService.getTotalDocumentsSizeByIds as jest.Mock).mockResolvedValue(500);
      ((documentService as any).organizationService.getOrgById as jest.Mock).mockResolvedValue(null);
    
      await expect(documentService.checkDownloadMultipleDocuments(input)).rejects.toThrow('Organization not found');
    });
  });

  describe('getTargetOwnedDocumentId', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        getTargetOwnedDocumentId = DocumentService.prototype.getTargetOwnedDocumentId;
        getDocumentPermissionByGroupRole = jest.fn();
        teamService = { findOneById: jest.fn() };
      })() as any;
      (documentService as any).teamService = { findOneById: jest.fn() };
    });

    it('should return null when no document permission found', async () => {
      (documentService.getDocumentPermissionByGroupRole as jest.Mock).mockResolvedValue(null);

      const result = await documentService.getTargetOwnedDocumentId('doc123');

      expect(result).toBeNull();
    });

    it('should return orgId for OWNER role', async () => {
      const mockPermission = {
        role: DocumentRoleEnum.OWNER,
        workspace: { refId: 'org123' }
      };
      
      (documentService.getDocumentPermissionByGroupRole as jest.Mock).mockResolvedValue(mockPermission);

      const result = await documentService.getTargetOwnedDocumentId('doc123');

      expect(result).toBe('org123');
    });

    it('should return orgId for ORGANIZATION role', async () => {
      const mockPermission = {
        role: DocumentRoleEnum.ORGANIZATION,
        refId: 'org123'
      };
      
      (documentService.getDocumentPermissionByGroupRole as jest.Mock).mockResolvedValue(mockPermission);

      const result = await documentService.getTargetOwnedDocumentId('doc123');

      expect(result).toBe('org123');
    });

    it('should return orgId for ORGANIZATION_TEAM role', async () => {
      const mockPermission = {
        role: DocumentRoleEnum.ORGANIZATION_TEAM,
        refId: 'team123'
      };
      const mockTeam = { belongsTo: 'org123' };
      
      (documentService.getDocumentPermissionByGroupRole as jest.Mock).mockResolvedValue(mockPermission);
      ((documentService as any).teamService.findOneById as jest.Mock).mockResolvedValue(mockTeam);

      const result = await documentService.getTargetOwnedDocumentId('doc123');

      expect(result).toBe('org123');
    });

    it('should return undefined when OWNER role but workspace is missing', async () => {
      const mockPermission = {
        role: DocumentRoleEnum.OWNER,
        workspace: null,
      };
    
      (documentService.getDocumentPermissionByGroupRole as jest.Mock).mockResolvedValue(mockPermission);
    
      const result = await documentService.getTargetOwnedDocumentId('doc123');
    
      expect(result).toBeUndefined();
    });
    
    it('should return undefined when role is not handled (default case)', async () => {
      const mockPermission = {
        role: 'UNKNOWN_ROLE',
        refId: 'someId',
      };
    
      (documentService.getDocumentPermissionByGroupRole as jest.Mock).mockResolvedValue(mockPermission);
    
      const result = await documentService.getTargetOwnedDocumentId('doc123');
    
      expect(result).toBeUndefined();
    });
    
  });

  describe('estimateMentionableMembers', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        estimateMentionableMembers = DocumentService.prototype.estimateMentionableMembers;
        getDocumentPermissionsByDocId = jest.fn();
        organizationService = { estimateMentionableMembers: jest.fn() };
        membershipService = { estimateMentionableMembers: jest.fn() };
      })() as any;
      
      (documentService as any).organizationService = { estimateMentionableMembers: jest.fn() };
      (documentService as any).membershipService = { estimateMentionableMembers: jest.fn() };
    });

    it('should return 0 when no document permissions found', async () => {
      (documentService.getDocumentPermissionsByDocId as jest.Mock).mockResolvedValue([]);

      const result = await documentService.estimateMentionableMembers({
        roles: [DocumentRoleEnum.ORGANIZATION],
        documentId: 'doc123'
      });

      expect(result).toBe(0);
    });

    it('should estimate members for ORGANIZATION role', async () => {
      const mockPermission = {
        role: DocumentRoleEnum.ORGANIZATION,
        refId: 'org123'
      };
      
      (documentService.getDocumentPermissionsByDocId as jest.Mock).mockResolvedValue([mockPermission]);
      ((documentService as any).organizationService.estimateMentionableMembers as jest.Mock).mockResolvedValue(50);

      const result = await documentService.estimateMentionableMembers({
        roles: [DocumentRoleEnum.ORGANIZATION],
        documentId: 'doc123'
      });

      expect(result).toBe(50);
    });

    it('should estimate members for ORGANIZATION_TEAM role', async () => {
      const mockPermission = {
        role: DocumentRoleEnum.ORGANIZATION_TEAM,
        refId: 'team123'
      };
      
      (documentService.getDocumentPermissionsByDocId as jest.Mock).mockResolvedValue([mockPermission]);
      ((documentService as any).membershipService.estimateMentionableMembers as jest.Mock).mockResolvedValue(10);

      const result = await documentService.estimateMentionableMembers({
        roles: [DocumentRoleEnum.ORGANIZATION_TEAM],
        documentId: 'doc123'
      });

      expect(result).toBe(10);
    });

    it('should return 0 for other roles', async () => {
      const mockPermission = {
        role: DocumentRoleEnum.OWNER,
        refId: 'user123'
      };
      
      (documentService.getDocumentPermissionsByDocId as jest.Mock).mockResolvedValue([mockPermission]);

      const result = await documentService.estimateMentionableMembers({
        roles: [DocumentRoleEnum.OWNER],
        documentId: 'doc123'
      });

      expect(result).toBe(0);
    });

    it('should return 0 when getDocumentPermissionsByDocId returns null', async () => {
      (documentService.getDocumentPermissionsByDocId as jest.Mock).mockResolvedValue(null);
    
      const result = await documentService.estimateMentionableMembers({
        roles: [DocumentRoleEnum.ORGANIZATION],
        documentId: 'doc123'
      });
    
      expect(result).toBe(0);
    });    
  });

  describe('checkShareThirdPartyDocument', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        checkShareThirdPartyDocument = DocumentService.prototype.checkShareThirdPartyDocument;
        getOneDocumentPermission = jest.fn();
        getDocumentByDocumentId = jest.fn();
        organizationDocStackService = { validateCanFinishDocument: jest.fn() };
      })() as any;
      (documentService as any).organizationDocStackService = { validateCanFinishDocument: jest.fn() };
    });

    it('should throw error when user has no permission', async () => {
      (documentService.getOneDocumentPermission as jest.Mock).mockResolvedValue(null);

      await expect(documentService.checkShareThirdPartyDocument({
        sharer: { _id: 'user123', identityId: 'identity123', email: 'user@test.com', password: 'password', name: 'Test User' } as User,
        documentId: 'doc123'
      })).rejects.toThrow('You do not have permission to share this document');
    });

    it('should throw error for S3 documents', async () => {
      const mockPermission = { role: DocumentRoleEnum.OWNER };
      const mockDocument = { service: DocumentStorageEnum.S3 };
      
      (documentService.getOneDocumentPermission as jest.Mock).mockResolvedValue(mockPermission);
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(mockDocument);

      await expect(documentService.checkShareThirdPartyDocument({
        sharer: { _id: 'user123', identityId: 'identity123', email: 'user@test.com', password: 'password', name: 'Test User' } as User,
        documentId: 'doc123'
      })).rejects.toThrow('Not allowed to check this document');
    });

    it('should return validation result for valid document', async () => {
      const mockPermission = { role: DocumentRoleEnum.OWNER };
      const mockDocument = { service: DocumentStorageEnum.GOOGLE };
      
      (documentService.getOneDocumentPermission as jest.Mock).mockResolvedValue(mockPermission);
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(mockDocument);
      ((documentService as any).organizationDocStackService.validateCanFinishDocument as jest.Mock).mockResolvedValue(true);

      const result = await documentService.checkShareThirdPartyDocument({
        sharer: { _id: 'user123', identityId: 'identity123', email: 'user@test.com', password: 'password', name: 'Test User' } as User,
        documentId: 'doc123'
      });

      expect(result).toEqual({ isAllowed: true });
    });
  });

  describe('shareDocument', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        shareDocument = DocumentService.prototype.shareDocument;
        userService = { 
          checkEmailInput: jest.fn(),
          findUserByEmails: jest.fn()
        };
        getDocumentByDocumentId = jest.fn();
        checkExistedDocPermission = jest.fn();
        getDocumentBelongTo = jest.fn();
        shareDocumentToLuminUser = jest.fn();
        shareDocumentNonLuminUser = jest.fn();
        personalEventService = { createUserUseDocumentEvent: jest.fn() };
        notificationService = { publishFirebaseNotifications: jest.fn() };
        updateUserContactWhenShareDocument = jest.fn();
      })() as any;
      (documentService as any).userService = { 
        checkEmailInput: jest.fn(),
        findUserByEmails: jest.fn()
      };
      (documentService as any).personalEventService = { createUserUseDocumentEvent: jest.fn() };
      (documentService as any).notificationService = { publishFirebaseNotifications: jest.fn() };
    });

    it('should successfully share document with lumin users', async () => {
      const params = {
        sharer: { _id: 'sharer123', identityId: 'identity123', email: 'sharer@test.com', password: 'password', name: 'Test Sharer' } as User,
        documentId: 'doc123',
        emails: ['user1@test.com', 'user2@test.com'],
        role: DocumentRole.EDITOR,
        message: 'Test message'
      };
      
      const mockUsers = [
        { _id: 'user1', email: 'user1@test.com' },
        { _id: 'user2', email: 'user2@test.com' }
      ];
      const mockDocument = { 
        _id: 'doc123', 
        service: DocumentStorageEnum.S3,
        isPersonal: true 
      };
      const mockPermission = { hasPermission: false };
      
      ((documentService as any).userService.findUserByEmails as jest.Mock).mockResolvedValue(mockUsers);
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(mockDocument);
      (documentService.checkExistedDocPermission as jest.Mock).mockResolvedValue(mockPermission);
      (documentService.getDocumentBelongTo as jest.Mock).mockResolvedValue({ id: 'org123' });

      const result = await documentService.shareDocument(params);

      expect(result).toEqual({
        message: 'Success',
        statusCode: 200
      });
      expect(documentService.shareDocumentToLuminUser).toHaveBeenCalled();
    });

    it('should return error for non-S3 documents', async () => {
      const params = {
        sharer: { _id: 'sharer123', identityId: 'identity123', email: 'sharer@test.com', password: 'password', name: 'Test Sharer' } as User,
        documentId: 'doc123',
        emails: ['user1@test.com'],
        role: DocumentRole.EDITOR,
        message: 'Test message'
      };
      
      const mockUsers = [{ _id: 'user1', email: 'user1@test.com' }];
      const mockDocument = { 
        _id: 'doc123', 
        service: DocumentStorageEnum.GOOGLE,
        isPersonal: true 
      };
      
      ((documentService as any).userService.findUserByEmails as jest.Mock).mockResolvedValue(mockUsers);
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(mockDocument);

      const result = await documentService.shareDocument(params);

      expect(result).toEqual({
        message: 'Cannot share document on drive or dropbox',
        statusCode: 400
      });
    });

    it('should throw error when document belong to cannot be determined', async () => {
      const params = {
        sharer: { _id: 'sharer123', identityId: 'identity123', email: 'sharer@test.com', password: 'password', name: 'Test Sharer' } as User,
        documentId: 'doc123',
        emails: ['user1@test.com'],
        role: DocumentRole.EDITOR,
        message: 'Test message'
      };
      
      const mockUsers = [{ _id: 'user1', email: 'user1@test.com' }];
      const mockDocument = { 
        _id: 'doc123', 
        service: DocumentStorageEnum.S3,
        isPersonal: true 
      };
      
      ((documentService as any).userService.findUserByEmails as jest.Mock).mockResolvedValue(mockUsers);
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(mockDocument);
      (documentService.getDocumentBelongTo as jest.Mock).mockResolvedValue(null);

      await expect(documentService.shareDocument(params)).rejects.toThrow('Cannot get document permission');
    });

    it('should call shareDocumentNonLuminUser when there are non-lumin users', async () => {
      const params = {
        sharer: { 
          _id: 'sharer123', 
          identityId: 'identity123', 
          email: 'sharer@test.com', 
          password: 'password', 
          name: 'Test Sharer' 
        } as User,
        documentId: 'doc123',
        emails: ['lumin@test.com', 'nonlumin@test.com'],
        role: DocumentRole.EDITOR,
        message: 'Hello non-lumin'
      };
      const mockUsers = [
        { _id: 'user1', email: 'lumin@test.com' },
      ];
      const mockDocument = { 
        _id: 'doc123', 
        service: DocumentStorageEnum.S3,
        isPersonal: true 
      };
      const mockPermission = { hasPermission: false };
    
      ((documentService as any).userService.findUserByEmails as jest.Mock).mockResolvedValue(mockUsers);
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(mockDocument);
      (documentService.checkExistedDocPermission as jest.Mock).mockResolvedValue(mockPermission);
      (documentService.getDocumentBelongTo as jest.Mock).mockResolvedValue({ id: 'org123' });
    
      const result = await documentService.shareDocument(params);
    
      expect(documentService.shareDocumentNonLuminUser).toHaveBeenCalledWith({
        document: mockDocument,
        role: DocumentRole.EDITOR,
        message: 'Hello non-lumin',
        nonLuminUserEmails: ['nonlumin@test.com'],
        sharer: params.sharer,
      });
      expect(result).toEqual({
        message: 'Success',
        statusCode: 200
      });
    });
  });

  describe('getShareInviteByEmailList', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        getShareInviteByEmailList = DocumentService.prototype.getShareInviteByEmailList;
        findNonUserByDocumentId = jest.fn();
        getDocumentPermissionsByDocId = jest.fn();
        getDocumentByDocumentId = jest.fn();
        userService = { 
          findExternalSharees: jest.fn(),
          findUserById: jest.fn()
        };
      })() as any;
      
      (documentService as any).userService = { 
        findExternalSharees: jest.fn(),
        findUserById: jest.fn()
      };
    });

    it('should return share invite list with external sharees', async () => {
      const params = {
        actor: { _id: 'actor123', identityId: 'identity123', email: 'actor@test.com', password: 'password', name: 'Test Actor' } as User,
        documentId: 'doc123',
        searchKey: 'test'
      };
    
      const mockNonUsers = [{ email: 'nonuser@test.com', role: 'viewer' }];
      const refId = new Types.ObjectId();
      const mockPermissions = [{ refId, role: 'editor' }];
      const mockDocument = { 
        _id: 'doc123', 
        isPersonal: false,
        ownerId: 'owner123'
      };
      const mockExternalSharees = [{ 
        _id: refId.toHexString(),
        email: 'user@test.com', 
        name: 'User' 
      }];
      const mockOwner = { 
        _id: 'owner123', 
        email: 'owner@test.com', 
        name: 'Owner',
        avatarRemoteId: 'avatar123'
      };
      
      (documentService.findNonUserByDocumentId as jest.Mock).mockResolvedValue(mockNonUsers);
      (documentService.getDocumentPermissionsByDocId as jest.Mock).mockResolvedValue(mockPermissions);
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(mockDocument);
      ((documentService as any).userService.findExternalSharees as jest.Mock).mockResolvedValue(mockExternalSharees);
      ((documentService as any).userService.findUserById as jest.Mock).mockResolvedValue(mockOwner);
    
      const result = await documentService.getShareInviteByEmailList(params);
    
      expect(result.sharees).toHaveLength(3);
      expect(result.sharees[0]).toMatchObject({
        _id: 'owner123',
        role: DocumentRoleEnum.OWNER,
        type: 'external'
      });
    });
    
    it('should move current user to head of array', async () => {
      const userId = new Types.ObjectId().toHexString();
    
      const params = {
        actor: { _id: userId, identityId: 'identity123', email: 'user@test.com', password: 'password', name: 'Test User' } as User,
        documentId: 'doc123'
      };
    
      const mockPermissions = [{ refId: new Types.ObjectId(userId), role: 'editor' }];
      const mockDocument = { _id: 'doc123', isPersonal: true };
      const mockExternalSharees = [{ 
        _id: userId,
        email: 'user@test.com', 
        name: 'User' 
      }];
    
      (documentService.findNonUserByDocumentId as jest.Mock).mockResolvedValue([]);
      (documentService.getDocumentPermissionsByDocId as jest.Mock).mockResolvedValue(mockPermissions);
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(mockDocument);
      ((documentService as any).userService.findExternalSharees as jest.Mock).mockResolvedValue(mockExternalSharees);
    
      const result = await documentService.getShareInviteByEmailList(params);
    
      expect(result.sharees[0]._id).toBe(userId);
    }); 

    it('should skip undefined external sharees (cover user?. when user is null)', async () => {
      const actor = { _id: 'actor123', email: 'actor@test.com' } as User;
      const documentId = 'doc123';
    
      const refId = new Types.ObjectId();
      const mockPermissions = [{ refId, role: 'editor' }];
      const mockDocument = { _id: documentId, isPersonal: true };
    
      const mockExternalSharees = [
        undefined,
        null,     
        { email: 'noid@test.com' }, 
        { _id: refId.toHexString(), email: 'valid@test.com' },
      ];
    
      (documentService.findNonUserByDocumentId as jest.Mock).mockResolvedValue([]);
      (documentService.getDocumentPermissionsByDocId as jest.Mock).mockResolvedValue(mockPermissions);
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(mockDocument);
      ((documentService as any).userService.findExternalSharees as jest.Mock).mockResolvedValue(mockExternalSharees);
    
      const result = await documentService.getShareInviteByEmailList({ actor, documentId });
    
      expect(result.sharees).toHaveLength(1);
      expect(result.sharees[0]._id).toBe(refId.toHexString());
    });    
  });

  describe('handleUpdateDocumentPermission', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        handleUpdateDocumentPermission = DocumentService.prototype.handleUpdateDocumentPermission;
        userService = { findUserByEmail: jest.fn() };
        updateDocumentPermissionNonLuminUser = jest.fn();
        createNonLuminUserDocumentPermission = jest.fn();
        getDocumentPermissionsByDocId = jest.fn();
        getRequestAccessData = jest.fn();
        getDocumentPermission = jest.fn();
        validateUpdatePermission = jest.fn();
        updateDocumentPermissionInOrg = jest.fn();
        removeRequestsAfterPermissionChanged = jest.fn();
        updateManyDocumentPermission = jest.fn();
        findOneById = jest.fn();
        sendUpdateDocumentPermissionNotification = jest.fn();
        getRoleText = jest.fn();
        notificationService = { publishFirebaseNotifications: jest.fn() };
      })() as any;      
      (documentService as any).userService = { findUserByEmail: jest.fn() };
      (documentService as any).notificationService = { publishFirebaseNotifications: jest.fn() };
    });

    it('should update permission for non-lumin user', async () => {
      const params = {
        actorId: 'actor123',
        documentId: 'doc123',
        role: DocumentRole.EDITOR,
        email: 'nonuser@test.com'
      };
      
      ((documentService as any).userService.findUserByEmail as jest.Mock).mockResolvedValue(null);
      (documentService.updateDocumentPermissionNonLuminUser as jest.Mock).mockResolvedValue(true);

      const result = await documentService.handleUpdateDocumentPermission(params);

      expect(result).toEqual({ success: true });
      expect(documentService.updateDocumentPermissionNonLuminUser).toHaveBeenCalledWith(
        { email: 'nonuser@test.com', documentId: 'doc123' },
        'editor'
      );
    });

    it('should update permission for lumin user', async () => {
      const params = {
        actorId: 'actor123',
        documentId: 'doc123',
        role: DocumentRole.EDITOR,
        email: 'user@test.com'
      };
      
      const mockUser = { _id: 'user123', timezoneOffset: 0 };
      const mockPermission = { role: 'viewer' };
      const mockRequest = { documentRole: 'viewer' };
      const mockDocument = { _id: 'doc123', name: 'Test Doc' };
      const mockActor = { _id: 'actor123', name: 'Actor' };
      
      ((documentService as any).userService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (documentService.getDocumentPermissionsByDocId as jest.Mock).mockResolvedValue([mockPermission]);
      (documentService.getRequestAccessData as jest.Mock).mockResolvedValue([mockRequest]);
      (documentService.getDocumentPermission as jest.Mock).mockResolvedValue([{ role: 'editor' }]);
      (documentService.findOneById as jest.Mock).mockResolvedValue(mockDocument);
      ((documentService as any).userService.findUserById = jest.fn()).mockResolvedValue(mockActor);
      (documentService.getRoleText as jest.Mock).mockReturnValue('Editor');

      const result = await documentService.handleUpdateDocumentPermission(params);

      expect(result).toEqual({ success: true });
      expect(documentService.updateManyDocumentPermission).toHaveBeenCalledWith(
        { documentId: 'doc123', refId: 'user123' },
        { role: 'editor' }
      );
    });

    it('should throw error when trying to update owner role', async () => {
      const params = {
        actorId: 'actor123',
        documentId: 'doc123',
        role: DocumentRole.EDITOR,
        email: 'user@test.com'
      };
      
      const mockUser = { _id: 'user123', timezoneOffset: 0 };
      const mockPermission = { role: 'owner' };
      const mockRequest = { documentRole: 'viewer' };
      
      ((documentService as any).userService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (documentService.getDocumentPermissionsByDocId as jest.Mock).mockResolvedValue([mockPermission]);
      (documentService.getRequestAccessData as jest.Mock).mockResolvedValue([mockRequest]);

      await expect(documentService.handleUpdateDocumentPermission(params)).rejects.toThrow('Can not update role of owner document');
    });

    it('should handle requestAccess undefined and no personalDocumentPermission', async () => {
      const params = {
        actorId: 'actor123',
        documentId: 'doc123',
        role: DocumentRole.EDITOR,
        email: 'user@test.com'
      };
    
      const mockUser = { _id: 'user123', timezoneOffset: 0 };
      const mockOrgPermission = { role: DocumentRoleEnum.ORGANIZATION, refId: 'org123' };

      (documentService.getDocumentPermissionsByDocId as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([mockOrgPermission]);
      (documentService.getRequestAccessData as jest.Mock).mockResolvedValue([]); // requestAccess undefined
      ((documentService as any).userService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (documentService.validateUpdatePermission as jest.Mock).mockResolvedValue(true);
      (documentService.findOneById as jest.Mock).mockResolvedValue({ _id: 'doc123' });
      (documentService.getDocumentPermission as jest.Mock).mockResolvedValue([]);
      ((documentService as any).userService.findUserById = jest.fn()).mockResolvedValue({ _id: 'actor123' });
      (documentService.getRoleText as jest.Mock).mockReturnValue('Editor');
    
      const result = await documentService.handleUpdateDocumentPermission(params);
    
      expect(result).toEqual({ success: true });
      expect(documentService.removeRequestsAfterPermissionChanged).toHaveBeenCalledWith(
        expect.objectContaining({
          users: [expect.objectContaining({ requestRole: undefined })]
        })
      );
    });
    
    it('should throw Forbidden when actor has same role as personal permission', async () => {
      const params = {
        actorId: 'actor123',
        documentId: 'doc123',
        role: DocumentRole.VIEWER,
        email: 'user@test.com'
      };
    
      const mockUser = { _id: 'user123', timezoneOffset: 0 };
      const mockPermission = { role: 'viewer' };
      const mockRequest = { documentRole: 'viewer' };
    
      ((documentService as any).userService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (documentService.getDocumentPermissionsByDocId as jest.Mock).mockResolvedValue([mockPermission]);
      (documentService.getRequestAccessData as jest.Mock).mockResolvedValue([mockRequest]);
      (documentService.getDocumentPermission as jest.Mock).mockResolvedValue([{ role: 'viewer' }]);
    
      await expect(documentService.handleUpdateDocumentPermission(params)).rejects.toThrow('You don\'t have permission');
    });
    
    it('should throw NotAcceptable when no documentPermission', async () => {
      const params = {
        actorId: 'actor123',
        documentId: 'doc123',
        role: DocumentRole.EDITOR,
        email: 'user@test.com'
      };
    
      const mockUser = { _id: 'user123', timezoneOffset: 0 };
    
      (documentService.getDocumentPermissionsByDocId as jest.Mock).mockResolvedValue([]);
      (documentService.getRequestAccessData as jest.Mock).mockResolvedValue([]);
      ((documentService as any).userService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (documentService.validateUpdatePermission as jest.Mock).mockResolvedValue(true);
      (documentService.findOneById as jest.Mock).mockResolvedValue({ _id: 'doc123' });
      (documentService.getDocumentPermission as jest.Mock).mockResolvedValue([]);
    
      await expect(documentService.handleUpdateDocumentPermission(params))
        .rejects.toMatchObject({
          message: 'Does not have document permission',
          extensions: { code: ErrorCode.Document.NO_DOCUMENT_PERMISSION }
        });
    });    
  });

  describe('preCheckShareDocumentInSlack', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        preCheckShareDocumentInSlack = DocumentService.prototype.preCheckShareDocumentInSlack;
        validateDocumentForSlackSharing = jest.fn();
        getShareInviteByEmailList = jest.fn();
        slackService = { 
          getSlackUserInfo: jest.fn(),
          getSlackChannelMembers: jest.fn(),
          checkEmailExistsInSlackUsers: jest.fn()
        };
      })() as any;
      
      (documentService as any).validateDocumentForSlackSharing = jest.fn();
      (documentService as any).slackService = { 
        getSlackUserInfo: jest.fn(),
        getSlackChannelMembers: jest.fn(),
        checkEmailExistsInSlackUsers: jest.fn()
      };
    });

    it('should check permission update needed for direct message', async () => {
      const sharer = { _id: 'sharer123', identityId: 'identity123', email: 'sharer@test.com', password: 'password', name: 'Test Sharer' } as User;
      const input = {
        documentId: 'doc123',
        slackTeamId: 'team123',
        conversation: { type: SlackConversationType.DIRECT_MESSAGE, id: 'dm123' }
      };
      
      const mockShareInvite = {
        sharees: [
          { email: 'user@test.com', role: DocumentRoleEnum.VIEWER }
        ]
      };
      const mockSlackUser = { email: 'user@test.com' };
      
      ((documentService as any).validateDocumentForSlackSharing as jest.Mock).mockResolvedValue({});
      (documentService.getShareInviteByEmailList as jest.Mock).mockResolvedValue(mockShareInvite);
      ((documentService as any).slackService.getSlackUserInfo as jest.Mock).mockResolvedValue(mockSlackUser);

      const result = await documentService.preCheckShareDocumentInSlack(sharer, input);

      expect(result).toEqual({ isPermissionUpdateNeeded: true });
    });

    it('should check permission update needed for channel', async () => {
      const sharer = { _id: 'sharer123', identityId: 'identity123', email: 'sharer@test.com', password: 'password', name: 'Test Sharer' } as User;
      const input = {
        documentId: 'doc123',
        slackTeamId: 'team123',
        conversation: { type: SlackConversationType.CHANNEL, id: 'channel123' }
      };
      
      const mockShareInvite = {
        sharees: [
          { email: 'user@test.com', role: DocumentRoleEnum.VIEWER }
        ]
      };
      const mockChannelMembers = [{ email: 'user@test.com' }];
      
      ((documentService as any).validateDocumentForSlackSharing as jest.Mock).mockResolvedValue({});
      (documentService.getShareInviteByEmailList as jest.Mock).mockResolvedValue(mockShareInvite);
      ((documentService as any).slackService.getSlackChannelMembers as jest.Mock).mockResolvedValue(mockChannelMembers);
      ((documentService as any).slackService.checkEmailExistsInSlackUsers as jest.Mock).mockResolvedValue(true);

      const result = await documentService.preCheckShareDocumentInSlack(sharer, input);

      expect(result).toEqual({ isPermissionUpdateNeeded: true });
    });

    it('should handle shareInvite.sharees undefined (cover || [])', async () => {
      const sharer = { _id: 'sharer123', email: 'sharer@test.com' } as User;
      const input = {
        documentId: 'doc123',
        slackTeamId: 'team123',
        conversation: { type: SlackConversationType.DIRECT_MESSAGE, id: 'dm123' }
      };
    
      ((documentService as any).validateDocumentForSlackSharing as jest.Mock).mockResolvedValue({});
      (documentService.getShareInviteByEmailList as jest.Mock).mockResolvedValue({});
      ((documentService as any).slackService.getSlackUserInfo as jest.Mock).mockResolvedValue({ email: 'user@test.com' });
    
      const result = await documentService.preCheckShareDocumentInSlack(sharer, input);
    
      expect(result).toEqual({ isPermissionUpdateNeeded: false });
    });
    
  });

  describe('shareDocumentInSlack', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        shareDocumentInSlack = DocumentService.prototype.shareDocumentInSlack;
        validateDocumentForSlackSharing = jest.fn();
        slackService = { 
          getSlackChannelMembers: jest.fn(),
          getSlackUserInfo: jest.fn(),
          getSlackChannelMemberEmails: jest.fn(),
          postShareDocumentMessage: jest.fn()
        };
        environmentService = { getByKey: jest.fn().mockReturnValue({}) };
        customRulesService = {};
        customRuleLoader = { load: jest.fn() };
        getShareInviteByEmailList = jest.fn();
        updateExistingPermissionsForSlackSharing = jest.fn();
        updateShareSettingForSlackSharing = jest.fn();
        shareWithSlackMembers = jest.fn().mockResolvedValue({
          hasNewSharing: true,
          hasUnshareableEmails: false,
          isQueuedSharing: false
        });
      })() as any;
      
      (documentService as any).validateDocumentForSlackSharing = jest.fn();
      (documentService as any).slackService = { 
        getSlackChannelMembers: jest.fn(),
        getSlackUserInfo: jest.fn(),
        getSlackChannelMemberEmails: jest.fn(),
        postShareDocumentMessage: jest.fn()
      };
      (documentService as any).environmentService = { getByKey: jest.fn() };
      (documentService as any).customRulesService = {};
      (documentService as any).customRuleLoader = { load: jest.fn().mockReturnValue({}) };
      (documentService as any).updateExistingPermissionsForSlackSharing = jest.fn();
      (documentService as any).updateShareSettingForSlackSharing = jest.fn();
      (documentService as any).shareWithSlackMembers = jest.fn().mockResolvedValue({
        hasNewSharing: true,
        hasUnshareableEmails: false,
        isQueuedSharing: false
      });
      (documentService as any).customRuleLoader = {
        load: jest.fn(),
        getRulesForDomain: jest.fn().mockReturnValue({ cannotShareDocWith: [] }),
        getConfiguredDomains: jest.fn().mockReturnValue([]),
      };
    });

    it('should successfully share document in Slack', async () => {
      const sharer = { _id: 'sharer123', identityId: 'identity123', email: 'sharer@test.com', password: 'password', name: 'Test Sharer' } as User;
      const input = {
        documentId: 'doc123',
        slackTeamId: 'team123',
        conversation: { type: SlackConversationType.DIRECT_MESSAGE, id: 'dm123' },
        sharingMode: ShareLinkType.INVITED,
        role: DocumentRole.EDITOR,
        message: 'Test message',
        isOverwritePermission: false
      };
      
      const mockDocument = { 
        _id: 'doc123', 
        shareSetting: { linkType: ShareLinkType.INVITED }
      };
      const mockShareInvite = {
        sharees: [
          { email: 'user@test.com', role: DocumentRoleEnum.OWNER }
        ]
      };
      const mockSlackUser = { email: 'user@test.com' };
      
      ((documentService as any).validateDocumentForSlackSharing as jest.Mock).mockResolvedValue(mockDocument);
      (documentService.getShareInviteByEmailList as jest.Mock).mockResolvedValue(mockShareInvite);
      ((documentService as any).slackService.getSlackUserInfo as jest.Mock).mockResolvedValue(mockSlackUser);

      const result = await documentService.shareDocumentInSlack(sharer, input);

      expect(result).toEqual({
        hasNewSharing: true,
        hasUnshareableEmails: false,
        isQueuedSharing: false
      });
    });

    it('should throw error for channel with too many members', async () => {
      const sharer = { _id: 'sharer123', identityId: 'identity123', email: 'sharer@test.com', password: 'password', name: 'Test Sharer' } as User;
      const input = {
        documentId: 'doc123',
        slackTeamId: 'team123',
        conversation: { type: SlackConversationType.CHANNEL, id: 'channel123' },
        sharingMode: ShareLinkType.INVITED,
        role: DocumentRole.EDITOR,
        message: 'Test message',
        isOverwritePermission: false
      };
      
      const mockDocument = { 
        _id: 'doc123', 
        shareSetting: { linkType: ShareLinkType.INVITED }
      };
      const mockChannelMembers = Array(101).fill({ email: 'user@test.com' });
      
      ((documentService as any).validateDocumentForSlackSharing as jest.Mock).mockResolvedValue(mockDocument);
      ((documentService as any).slackService.getSlackChannelMembers as jest.Mock).mockResolvedValue(mockChannelMembers);
      ((documentService as any).environmentService.getByKey as jest.Mock).mockReturnValue('100');

      await expect(documentService.shareDocumentInSlack(sharer, input)).rejects.toThrow('Cannot share to channel with more than 100 members');
    });

    it('should handle empty sharees array when shareInvite.sharees is undefined', async () => {
      const sharer = { _id: 'sharer123', identityId: 'identity123', email: 'sharer@test.com', password: 'password', name: 'Test Sharer' } as User;
      const input = {
        documentId: 'doc123',
        slackTeamId: 'team123',
        conversation: { type: SlackConversationType.DIRECT_MESSAGE, id: 'dm123' },
        sharingMode: ShareLinkType.INVITED,
        role: DocumentRole.EDITOR,
        message: 'Test message',
        isOverwritePermission: false
      };
      
      const mockDocument = { 
        _id: 'doc123', 
        shareSetting: { linkType: ShareLinkType.INVITED }
      };
      const mockShareInvite = {
        sharees: undefined
      };
      const mockSlackUser = { email: 'user@test.com' };
      
      ((documentService as any).validateDocumentForSlackSharing as jest.Mock).mockResolvedValue(mockDocument);
      (documentService.getShareInviteByEmailList as jest.Mock).mockResolvedValue(mockShareInvite);
      ((documentService as any).slackService.getSlackUserInfo as jest.Mock).mockResolvedValue(mockSlackUser);

      const result = await documentService.shareDocumentInSlack(sharer, input);

      expect(result).toEqual({
        hasNewSharing: true,
        hasUnshareableEmails: false,
        isQueuedSharing: false
      });
    });

    it('should handle ownerDoc with undefined email', async () => {
      const sharer = { _id: 'sharer123', identityId: 'identity123', email: 'sharer@test.com', password: 'password', name: 'Test Sharer' } as User;
      const input = {
        documentId: 'doc123',
        slackTeamId: 'team123',
        conversation: { type: SlackConversationType.DIRECT_MESSAGE, id: 'dm123' },
        sharingMode: ShareLinkType.INVITED,
        role: DocumentRole.EDITOR,
        message: 'Test message',
        isOverwritePermission: false
      };
      
      const mockDocument = { 
        _id: 'doc123', 
        shareSetting: { linkType: ShareLinkType.INVITED }
      };
      const mockShareInvite = {
        sharees: [
          { email: undefined, role: DocumentRoleEnum.OWNER },
          { email: 'user@test.com', role: DocumentRoleEnum.EDITOR }
        ]
      };
      const mockSlackUser = { email: 'user@test.com' };
      
      ((documentService as any).validateDocumentForSlackSharing as jest.Mock).mockResolvedValue(mockDocument);
      (documentService.getShareInviteByEmailList as jest.Mock).mockResolvedValue(mockShareInvite);
      ((documentService as any).slackService.getSlackUserInfo as jest.Mock).mockResolvedValue(mockSlackUser);

      await expect(documentService.shareDocumentInSlack(sharer, input)).rejects.toThrow();
    });

    it('should handle restricted domain user scenario', async () => {
      const sharer = { _id: 'sharer123', identityId: 'identity123', email: 'sharer@test.com', password: 'password', name: 'Test Sharer' } as User;
      const input = {
        documentId: 'doc123',
        slackTeamId: 'team123',
        conversation: { type: SlackConversationType.DIRECT_MESSAGE, id: 'dm123' },
        sharingMode: ShareLinkType.INVITED,
        role: DocumentRole.EDITOR,
        message: 'Test message',
        isOverwritePermission: false
      };
      
      const mockDocument = { 
        _id: 'doc123', 
        shareSetting: { linkType: ShareLinkType.INVITED }
      };
      const mockShareInvite = {
        sharees: [
          { email: 'owner@test.com', role: DocumentRoleEnum.OWNER }
        ]
      };
      const mockSlackUser = { email: 'user@test.com' };
      
      ((documentService as any).validateDocumentForSlackSharing as jest.Mock).mockResolvedValue(mockDocument);
      (documentService.getShareInviteByEmailList as jest.Mock).mockResolvedValue(mockShareInvite);
      ((documentService as any).slackService.getSlackUserInfo as jest.Mock).mockResolvedValue(mockSlackUser);

      const result = await documentService.shareDocumentInSlack(sharer, input);

      expect(result).toEqual({
        hasNewSharing: true,
        hasUnshareableEmails: false,
        isQueuedSharing: false
      });
    });

    it('should handle direct message when slackUserEmail equals ownerEmail', async () => {
      const sharer = { _id: 'sharer123', identityId: 'identity123', email: 'sharer@test.com', password: 'password', name: 'Test Sharer' } as User;
      const input = {
        documentId: 'doc123',
        slackTeamId: 'team123',
        conversation: { type: SlackConversationType.DIRECT_MESSAGE, id: 'dm123' },
        sharingMode: ShareLinkType.INVITED,
        role: DocumentRole.EDITOR,
        message: 'Test message',
        isOverwritePermission: false
      };
      
      const mockDocument = { 
        _id: 'doc123', 
        shareSetting: { linkType: ShareLinkType.INVITED }
      };
      const mockShareInvite = {
        sharees: [
          { email: 'owner@test.com', role: DocumentRoleEnum.OWNER }
        ]
      };
      const mockSlackUser = { email: 'owner@test.com' };
      
      ((documentService as any).validateDocumentForSlackSharing as jest.Mock).mockResolvedValue(mockDocument);
      (documentService.getShareInviteByEmailList as jest.Mock).mockResolvedValue(mockShareInvite);
      ((documentService as any).slackService.getSlackUserInfo as jest.Mock).mockResolvedValue(mockSlackUser);

      const result = await documentService.shareDocumentInSlack(sharer, input);

      expect(result).toEqual({
        hasNewSharing: true,
        hasUnshareableEmails: false,
        isQueuedSharing: false
      });
    });

    it('should handle channel sharing with INVITED sharing mode', async () => {
      const sharer = { _id: 'sharer123', identityId: 'identity123', email: 'sharer@test.com', password: 'password', name: 'Test Sharer' } as User;
      const input = {
        documentId: 'doc123',
        slackTeamId: 'team123',
        conversation: { type: SlackConversationType.CHANNEL, id: 'channel123' },
        sharingMode: ShareLinkType.INVITED,
        role: DocumentRole.EDITOR,
        message: 'Test message',
        isOverwritePermission: false
      };
      
      const mockDocument = { 
        _id: 'doc123', 
        shareSetting: { linkType: ShareLinkType.INVITED }
      };
      const mockShareInvite = {
        sharees: [
          { email: 'owner@test.com', role: DocumentRoleEnum.OWNER },
          { email: 'existing@test.com', role: DocumentRoleEnum.EDITOR }
        ]
      };
      const mockChannelMembers = Array(50).fill({ email: 'user@test.com' });
      const mockChannelMemberEmails = ['user1@test.com', 'user2@test.com', 'owner@test.com'];
      
      ((documentService as any).validateDocumentForSlackSharing as jest.Mock).mockResolvedValue(mockDocument);
      (documentService.getShareInviteByEmailList as jest.Mock).mockResolvedValue(mockShareInvite);
      ((documentService as any).slackService.getSlackChannelMembers as jest.Mock).mockResolvedValue(mockChannelMembers);
      ((documentService as any).slackService.getSlackChannelMemberEmails as jest.Mock).mockResolvedValue(mockChannelMemberEmails);
      ((documentService as any).environmentService.getByKey as jest.Mock).mockReturnValue('100');

      const result = await documentService.shareDocumentInSlack(sharer, input);

      expect(result).toEqual({
        hasNewSharing: true,
        hasUnshareableEmails: false,
        isQueuedSharing: false
      });
    });
  });

  describe('validateDocumentForSlackSharing', () => {
    let documentService: any;
  
    beforeEach(() => {
      documentService = new (class {
        validateDocumentForSlackSharing = DocumentService.prototype['validateDocumentForSlackSharing'];
        getDocumentByDocumentId = jest.fn();
      })();
    });
  
    it('should throw NotFound when document does not exist', async () => {
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(null);
  
      await expect(documentService.validateDocumentForSlackSharing('doc123'))
        .rejects.toThrow('Document not found');
    });
  
    it('should throw Forbidden when validateS3Storage is true and service is not S3', async () => {
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue({
        _id: 'doc123',
        isPersonal: true,
        service: DocumentStorageEnum.GOOGLE,
      });
  
      await expect(documentService.validateDocumentForSlackSharing('doc123', true))
        .rejects.toThrow('Not allowed to share document in Slack');
    });
  
    it('should return document when valid', async () => {
      const mockDocument = {
        _id: 'doc123',
        isPersonal: true,
        service: DocumentStorageEnum.S3,
      };
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(mockDocument);
  
      const result = await documentService.validateDocumentForSlackSharing('doc123', true);
  
      expect(result).toBe(mockDocument);
    });
  });  

  describe('updateExistingPermissionsForSlackSharing', () => {
    let documentService: any;
  
    beforeEach(() => {
      documentService = new (class {
        updateExistingPermissionsForSlackSharing = DocumentService.prototype['updateExistingPermissionsForSlackSharing'];
        handleUpdateDocumentPermission = jest.fn().mockResolvedValue(undefined);
      })();
    });
  
    it('should return immediately if isOverwritePermission is false', async () => {
      await documentService['updateExistingPermissionsForSlackSharing']({
        actorId: 'u1',
        documentId: 'd1',
        role: DocumentRole.EDITOR,
        emails: ['a@test.com'],
        isOverwritePermission: false,
      });
  
      expect(documentService.handleUpdateDocumentPermission).not.toHaveBeenCalled();
    });
  
    it('should call handleUpdateDocumentPermission for each email when overwrite is true', async () => {
      const emails = ['a@test.com', 'b@test.com', 'c@test.com'];
  
      await documentService['updateExistingPermissionsForSlackSharing']({
        actorId: 'u1',
        documentId: 'd1',
        role: DocumentRole.EDITOR,
        emails,
        isOverwritePermission: true,
      });
  
      expect(documentService.handleUpdateDocumentPermission).toHaveBeenCalledTimes(emails.length);
      emails.forEach((email, i) => {
        expect(documentService.handleUpdateDocumentPermission).toHaveBeenNthCalledWith(
          i + 1,
          expect.objectContaining({ actorId: 'u1', documentId: 'd1', role: DocumentRole.EDITOR, email }),
        );
      });
    });
  }); 
  
  describe('updateShareSettingForSlackSharing', () => {
    let documentService: DocumentService;
  
    beforeEach(() => {
      documentService = new (class {
        updateShareSettingForSlackSharing = DocumentService.prototype['updateShareSettingForSlackSharing'];
        updateShareSetting = jest.fn();
      })() as any;
      (documentService as any).updateShareSetting = jest.fn();
    });
  
    it('should return early if document.linkType !== INVITED', async () => {
      const document = {
        shareSetting: { linkType: ShareLinkType.ANYONE },
      } as any;
  
      await (documentService as any).updateShareSettingForSlackSharing({
        document,
        documentId: 'doc123',
        role: DocumentRole.EDITOR,
        sharingMode: ShareLinkType.ANYONE,
      });
  
      expect((documentService as any).updateShareSetting).not.toHaveBeenCalled();
    });
  
    it('should call updateShareSetting with correct params when valid', async () => {
      const document = {
        shareSetting: { linkType: ShareLinkType.INVITED },
      } as any;
  
      await (documentService as any).updateShareSettingForSlackSharing({
        document,
        documentId: 'doc123',
        role: DocumentRole.EDITOR,
        sharingMode: ShareLinkType.ANYONE,
      });
  
      expect((documentService as any).updateShareSetting).toHaveBeenCalledWith(
        'doc123',
        ShareLinkPermission.EDITOR,
        ShareLinkType.ANYONE,
      );
    });
  });
  
  describe('shareWithSlackMembers', () => {
    let documentService: DocumentService;
    let mockShareDocument: jest.Mock;
    let mockLoggerWarn: jest.Mock;
    let mockRedisSet: jest.Mock;
    let mockRabbitPublish: jest.Mock;
  
    const sharer = { _id: 'user123' } as any;
  
    beforeEach(() => {
      documentService = new (class {
        shareWithSlackMembers = DocumentService.prototype['shareWithSlackMembers'];
        shareDocument = jest.fn();
        loggerService = { warn: jest.fn() };
        redisService = { setExpectedDocumentSharing: jest.fn() };
        rabbitMQService = { publish: jest.fn() };
      })() as any;
  
      mockShareDocument = jest.fn();
      mockLoggerWarn = jest.fn();
      mockRedisSet = jest.fn();
      mockRabbitPublish = jest.fn();
  
      (documentService as any).shareDocument = mockShareDocument;
      (documentService as any).loggerService = { warn: mockLoggerWarn };
      (documentService as any).redisService = { setExpectedDocumentSharing: mockRedisSet };
      (documentService as any).rabbitMQService = { publish: mockRabbitPublish };
    });
  
    it('should return early if sharingMode !== INVITED', async () => {
      const result = await (documentService as any).shareWithSlackMembers({
        sharer,
        documentId: 'doc1',
        emails: ['a@test.com'],
        originalSharingMode: ShareLinkType.INVITED,
        sharingMode: ShareLinkType.ANYONE,
        role: DocumentRole.EDITOR,
        restrictedDomains: [],
        isChannelSharing: false,
      });
  
      expect(result).toEqual({ hasNewSharing: true, hasUnshareableEmails: false, isQueuedSharing: false });
      expect(mockShareDocument).not.toHaveBeenCalled();
    });
  
    it('should return early if no valid emails', async () => {
      const result = await (documentService as any).shareWithSlackMembers({
        sharer,
        documentId: 'doc1',
        emails: ['a@blocked.com'],
        originalSharingMode: ShareLinkType.INVITED,
        sharingMode: ShareLinkType.INVITED,
        role: DocumentRole.EDITOR,
        restrictedDomains: ['blocked.com'],
        isChannelSharing: false,
      });
  
      expect(result).toEqual({ hasNewSharing: false, hasUnshareableEmails: false, isQueuedSharing: false });
      expect(mockShareDocument).not.toHaveBeenCalled();
    });
  
    it('should share directly for single batch and log unshareable emails', async () => {
      const result = await (documentService as any).shareWithSlackMembers({
        sharer,
        documentId: 'doc1',
        emails: ['a@test.com', 'b@blocked.com'],
        originalSharingMode: ShareLinkType.ANYONE,
        sharingMode: ShareLinkType.INVITED,
        role: DocumentRole.EDITOR,
        restrictedDomains: ['blocked.com'],
        isChannelSharing: false,
      });
  
      expect(mockShareDocument).toHaveBeenCalledWith({
        sharer,
        documentId: 'doc1',
        emails: ['a@test.com'],
        role: DocumentRole.EDITOR,
        message: undefined,
      });
      expect(mockLoggerWarn).toHaveBeenCalled();
      expect(result).toEqual({ hasNewSharing: true, hasUnshareableEmails: true, isQueuedSharing: false });
    });
  
    it('should queue multiple batches when more than 10 emails', async () => {
      const emails = Array.from({ length: 20 }, (_, i) => `user${i}@test.com`);
      
      const originalSetTimeout = global.setTimeout;
      const setTimeoutCalls: Array<{ callback: Function; delay: number }> = [];
      
      (global as any).setTimeout = jest.fn((callback: Function, delay: number = 0) => {
        setTimeoutCalls.push({ callback, delay });
        callback();
        return 1 as any;
      });
      
      const result = await (documentService as any).shareWithSlackMembers({
        sharer: { _id: 'u1' },
        documentId: 'doc1',
        emails,
        originalSharingMode: ShareLinkType.INVITED,
        sharingMode: ShareLinkType.INVITED,
        role: DocumentRole.VIEWER,
        restrictedDomains: [],
        isChannelSharing: false,
      });
      global.setTimeout = originalSetTimeout;
    
      expect(mockRedisSet).toHaveBeenCalled();
      expect(mockRabbitPublish).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        hasNewSharing: true,
        hasUnshareableEmails: false,
        isQueuedSharing: true,
      });
      expect(setTimeoutCalls).toHaveLength(2);
      expect(setTimeoutCalls[0].delay).toBe(500);
      expect(setTimeoutCalls[1].delay).toBe(1500);
    });
  });

  describe('onProofingProgress', () => {
    let documentService: DocumentService;
    let mockMessageGateway: any;
    let mockServer: any;
  
    beforeEach(() => {
      mockServer = {
        in: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };
  
      mockMessageGateway = {
        server: mockServer,
      };
  
      jest.spyOn(SocketRoomGetter, 'document').mockReturnValue('room123');
  
      documentService = new (class {
        messageGateway = mockMessageGateway;
        onProofingProgress = DocumentService.prototype.onProofingProgress;
      })() as any;
    });
  
    it('should emit syncProofingProgress event with correct data', () => {
      const message = {
        data: {
          documentId: 'doc123',
        },
      };
  
      documentService.onProofingProgress(message as any);
  
      expect(SocketRoomGetter.document).toHaveBeenCalledWith('doc123');
      expect(mockServer.in).toHaveBeenCalledWith('room123');
      expect(mockServer.emit).toHaveBeenCalledWith('syncProofingProgress', message);
    });
  });

  describe('handleShareDocumentInSlackRequest', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        handleShareDocumentInSlackRequest = DocumentService.prototype.handleShareDocumentInSlackRequest;
        userService = { findUserById: jest.fn() };
        getDocumentByDocumentId = jest.fn();
        shareDocument = jest.fn();
        redisService = { 
          setFailedDocumentSharing: jest.fn(),
          increaseProcessedDocumentSharingQueue: jest.fn(),
          getDocumentSharingQueue: jest.fn(),
          getFailedDocumentSharing: jest.fn(),
          removeDocumentSharingQueueKeys: jest.fn()
        };
        publishDocumentSharingQueue = jest.fn();
        loggerService = { error: jest.fn() };
      })() as any;
      
      (documentService as any).userService = { findUserById: jest.fn() };
      (documentService as any).redisService = { 
        setFailedDocumentSharing: jest.fn(),
        increaseProcessedDocumentSharingQueue: jest.fn(),
        getDocumentSharingQueue: jest.fn(),
        getFailedDocumentSharing: jest.fn(),
        removeDocumentSharingQueueKeys: jest.fn()
      };
      (documentService as any).loggerService = { error: jest.fn() };
    });

    it('should throw error when sharer not found', async () => {
      const message = {
        sharingExecutionId: 'exec123',
        batchIndex: 0,
        isChannelSharing: false,
        sharerId: 'sharer123',
        documentId: 'doc123',
        emails: ['user@test.com'],
        role: DocumentRole.EDITOR,
        message: 'Test message',
        isOverwritePermission: false
      };
      
      ((documentService as any).userService.findUserById as jest.Mock).mockResolvedValue(null);

      await expect(documentService.handleShareDocumentInSlackRequest(message)).rejects.toThrow('Sharer not found');
    });

    it('should throw error when document not found', async () => {
      const message = {
        sharingExecutionId: 'exec123',
        batchIndex: 0,
        isChannelSharing: false,
        sharerId: 'sharer123',
        documentId: 'doc123',
        emails: ['user@test.com'],
        role: DocumentRole.EDITOR,
        message: 'Test message',
        isOverwritePermission: false
      };
      
      const mockSharer = { _id: 'sharer123' };
      
      ((documentService as any).userService.findUserById as jest.Mock).mockResolvedValue(mockSharer);
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(null);

      await expect(documentService.handleShareDocumentInSlackRequest(message)).rejects.toThrow('Document not found');
    });

    it('should handle successful sharing', async () => {
      const message = {
        sharingExecutionId: 'exec123',
        batchIndex: 0,
        isChannelSharing: false,
        sharerId: 'sharer123',
        documentId: 'doc123',
        emails: ['user@test.com'],
        role: DocumentRole.EDITOR,
        message: 'Test message',
        isOverwritePermission: false
      };
      
      const mockSharer = { _id: 'sharer123' };
      const mockDocument = { _id: 'doc123', name: 'Test Doc' };
      
      ((documentService as any).userService.findUserById as jest.Mock).mockResolvedValue(mockSharer);
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(mockDocument);
      ((documentService as any).redisService.getDocumentSharingQueue as jest.Mock).mockResolvedValue({ expected: 1, processed: 1 });
      ((documentService as any).redisService.getFailedDocumentSharing as jest.Mock).mockResolvedValue([]);

      const result = await documentService.handleShareDocumentInSlackRequest(message);

      expect(result).toBeInstanceOf(Nack);
      expect(documentService.shareDocument).toHaveBeenCalled();
    });

    it('should log error and set failed document sharing when shareDocument throws error', async () => {
      const message = {
        sharingExecutionId: 'exec123',
        batchIndex: 0,
        isChannelSharing: false,
        sharerId: 'sharer123',
        documentId: 'doc123',
        emails: ['user@test.com'],
        role: DocumentRole.EDITOR,
        message: 'Test message',
        isOverwritePermission: false
      };
    
      const mockSharer = { _id: 'sharer123' };
      const mockDocument = { _id: 'doc123', name: 'Test Doc' };
      const mockError = new Error('Share failed');
    
      ((documentService as any).userService.findUserById as jest.Mock).mockResolvedValue(mockSharer);
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(mockDocument);
      (documentService.shareDocument as jest.Mock).mockRejectedValue(mockError);
    
      ((documentService as any).redisService.getDocumentSharingQueue as jest.Mock).mockResolvedValue({ expected: 1, processed: 1 });
      ((documentService as any).redisService.getFailedDocumentSharing as jest.Mock).mockResolvedValue(['user@test.com']);
      ((documentService as any).loggerService as any).getCommonErrorAttributes = jest.fn().mockReturnValue({ message: mockError.message });
    
      const result = await documentService.handleShareDocumentInSlackRequest(message);
    
      expect((documentService as any).redisService.setFailedDocumentSharing).toHaveBeenCalledWith(
        'sharer123',
        'exec123',
        ['user@test.com']
      );
      expect((documentService as any).loggerService.error).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'handleShareDocumentInSlackRequest',
          message: 'Failed to share document in Slack with some emails',
          error: { message: 'Share failed' },
          extraInfo: expect.objectContaining({
            sharerId: 'sharer123',
            documentId: 'doc123',
            sharingExecutionId: 'exec123',
            batchIndex: 0,
            emailCount: 1,
          }),
        })
      );
      expect(result).toBeInstanceOf(Nack);
    });
  });

  describe('migrateDocumentDriveMetadataSharer', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        migrateDocumentDriveMetadataSharer = DocumentService.prototype.migrateDocumentDriveMetadataSharer;
        documentDriveMetadataModel = {
          find: jest.fn(),
          bulkWrite: jest.fn()
        };
        loggerService = { 
          info: jest.fn(),
          error: jest.fn(),
          getCommonErrorAttributes: jest.fn().mockReturnValue({}),
        };
      })() as any;
      
      (documentService as any).documentDriveMetadataModel = {
        find: jest.fn(),
        bulkWrite: jest.fn()
      };
      (documentService as any).loggerService = { 
        info: jest.fn(),
        error: jest.fn(),
        getCommonErrorAttributes: jest.fn().mockReturnValue({})
      };
      (documentService as any).batchSize = 2;
    });

    it('should migrate document drive metadata sharers', async () => {
      const mockCursor = {
        next: jest.fn()
          .mockResolvedValueOnce({
            _id: { toHexString: () => '507f1f77bcf86cd799439011' },
            sharers: ['user1@test.com', 'user2@test.com']
          })
          .mockResolvedValueOnce(null)
      };
    
      ((documentService as any).documentDriveMetadataModel.find as jest.Mock).mockReturnValue({
        cursor: () => mockCursor
      });
      ((documentService as any).documentDriveMetadataModel.bulkWrite as jest.Mock).mockResolvedValue({ modifiedCount: 1 });
    
      await documentService.migrateDocumentDriveMetadataSharer();
    
      expect((documentService as any).documentDriveMetadataModel.bulkWrite).toHaveBeenCalled();
    });
    
    it('should handle documents with already migrated sharers', async () => {
      const mockCursor = {
        next: jest.fn()
          .mockResolvedValueOnce({
            _id: { toHexString: () => '507f1f77bcf86cd799439011' },
            sharers: [
              { email: 'user1@test.com', name: 'User1' },
              { email: 'user2@test.com', name: 'User2' }
            ]
          })
          .mockResolvedValueOnce(null)
      };
    
      ((documentService as any).documentDriveMetadataModel.find as jest.Mock).mockReturnValue({
        cursor: () => mockCursor
      });
    
      await documentService.migrateDocumentDriveMetadataSharer();
    
      expect((documentService as any).documentDriveMetadataModel.bulkWrite).not.toHaveBeenCalled();
    });

    it('should log unexpected sharer type', async () => {
      const mockCursor = {
        next: jest.fn()
          .mockResolvedValueOnce({
            _id: { toHexString: () => '507f1f77bcf86cd799439011' },
            sharers: [123]
          })
          .mockResolvedValueOnce(null)
      };
    
      ((documentService as any).documentDriveMetadataModel.find as jest.Mock).mockReturnValue({
        cursor: () => mockCursor
      });
    
      await documentService.migrateDocumentDriveMetadataSharer();
    
      expect((documentService as any).loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Unexpected sharer type'),
        })
      );
    });

    it('should handle error during document processing', async () => {
      const mockCursor = {
        next: jest.fn()
          .mockResolvedValueOnce({
            _id: { toHexString: () => '507f1f77bcf86cd799439011' },
            sharers: ['user1@test.com', 'user2@test.com']
          })
          .mockResolvedValueOnce(null)
      };
    
      ((documentService as any).documentDriveMetadataModel.find as jest.Mock).mockReturnValue({
        cursor: () => mockCursor
      });
      ((documentService as any).documentDriveMetadataModel.bulkWrite as jest.Mock).mockRejectedValue(new Error('Bulk write failed'));
      ((documentService as any).loggerService.getCommonErrorAttributes as jest.Mock).mockReturnValue({ message: 'Bulk write failed' });
    
      await documentService.migrateDocumentDriveMetadataSharer();
    
      expect((documentService as any).loggerService.error).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'migrateDocumentDriveMetadataSharer',
          message: 'Failed to execute final batch',
          error: expect.any(Object),
        })
      );
    });

    it('should execute bulkWrite when bulkOperations reach batchSize', async () => {
      (documentService as any).migrateDocumentDriveMetadataSharer = 
        DocumentService.prototype.migrateDocumentDriveMetadataSharer.bind({
          ...documentService,
          documentDriveMetadataModel: (documentService as any).documentDriveMetadataModel,
          loggerService: (documentService as any).loggerService,
          get batchSize() { return 2; }
        });
    
      const mockCursor = {
        next: jest.fn()
          .mockResolvedValueOnce({
            _id: { toHexString: () => '507f1f77bcf86cd799439011' },
            sharers: ['user1@test.com'],
          })
          .mockResolvedValueOnce({
            _id: { toHexString: () => '507f1f77bcf86cd799439012' },
            sharers: ['user2@test.com'],
          })
          .mockResolvedValueOnce(null),
      };
    
      ((documentService as any).documentDriveMetadataModel.find as jest.Mock).mockReturnValue({
        cursor: () => mockCursor,
      });
    
      const bulkWriteResult = { modifiedCount: 2 };
      ((documentService as any).documentDriveMetadataModel.bulkWrite as jest.Mock).mockResolvedValue(bulkWriteResult);
    
      await documentService.migrateDocumentDriveMetadataSharer();
    
      expect((documentService as any).documentDriveMetadataModel.bulkWrite).toHaveBeenCalledWith(
        expect.any(Array),
        { ordered: false }
      );
    
      expect((documentService as any).loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Migrated'),
          extraInfo: { result: bulkWriteResult },
        })
      );
    });
    
    it('should trigger bulkWrite when bulkOperations >= batchSize', async () => {
      const mockDocs = [
        { _id: { toHexString: () => '1' }, sharers: ['user1@test.com'] },
        { _id: { toHexString: () => '2' }, sharers: ['user2@test.com'] },
        null
      ];
  
      let callIndex = 0;
      const mockCursor = {
        next: jest.fn().mockImplementation(() => {
          return Promise.resolve(mockDocs[callIndex++]);
        }),
      };
  
      ((documentService as any).documentDriveMetadataModel.find as jest.Mock).mockReturnValue({
        cursor: () => mockCursor
      });
      ((documentService as any).documentDriveMetadataModel.bulkWrite as jest.Mock).mockResolvedValue({ modifiedCount: 2 });
  
      await documentService.migrateDocumentDriveMetadataSharer();
    });
  });

  describe('isEnabledDocumentIndexing', () => {
    let documentService: DocumentService;

    beforeEach(() => {
      documentService = new (class {
        isEnabledDocumentIndexing = DocumentService.prototype.isEnabledDocumentIndexing;
        organizationService = { getOrgById: jest.fn() };
        organizationTeamService = { getOrgTeamById: jest.fn() };
        userService = { 
          findUserById: jest.fn(),
          checkTermsOfUseVersionChanged: jest.fn(),
        };
        featureFlagService = { getFeatureIsOn: jest.fn() };
        customRuleLoader = { getRulesForUser: jest.fn() };
      })() as any;
      
      (documentService as any).organizationService = { getOrgById: jest.fn() };
      (documentService as any).organizationTeamService = { getOrgTeamById: jest.fn() };
      (documentService as any).userService = { 
        findUserById: jest.fn(),
        checkTermsOfUseVersionChanged: jest.fn().mockReturnValue(false),
      };
      (documentService as any).featureFlagService = { getFeatureIsOn: jest.fn() };
      (documentService as any).customRuleLoader.getRulesForUser.mockReturnValue({
        files: { allowIndexing: true }
      });
    });

    it('should return false for unknown role', async () => {
      const documentPermission = { _id: 'perm123', refId: 'user123', documentId: 'doc123', role: 'UNKNOWN', workspace: { refId: 'org123' } } as IDocumentPermission;

      const result = await documentService.isEnabledDocumentIndexing('user123', documentPermission);

      expect(result).toBe(false);
    });

    it('should return false when organization not found', async () => {
      const documentPermission = { 
        _id: 'perm123', 
        refId: 'user123', 
        documentId: 'doc123',
        role: DocumentRoleEnum.OWNER,
        workspace: { refId: 'org123' }
      } as IDocumentPermission;
      
      ((documentService as any).organizationService.getOrgById as jest.Mock).mockResolvedValue(null);

      const result = await documentService.isEnabledDocumentIndexing('user123', documentPermission);

      expect(result).toBe(false);
    });

    it('should return false when user not found', async () => {
      const documentPermission = { 
        _id: 'perm123', 
        refId: 'user123', 
        documentId: 'doc123',
        role: DocumentRoleEnum.OWNER,
        workspace: { refId: 'org123' }
      } as IDocumentPermission;
      const mockOrg = { _id: 'org123' };
      
      ((documentService as any).organizationService.getOrgById as jest.Mock).mockResolvedValue(mockOrg);
      ((documentService as any).userService.findUserById as jest.Mock).mockResolvedValue(null);

      const result = await documentService.isEnabledDocumentIndexing('user123', documentPermission);

      expect(result).toBe(false);
    });

    it('should return feature flag result for valid setup', async () => {
      const documentPermission = { 
        _id: 'perm123', 
        refId: 'user123', 
        documentId: 'doc123',
        role: DocumentRoleEnum.OWNER,
        workspace: { refId: 'org123' }
      } as IDocumentPermission;
      const mockOrg = { _id: 'org123' };
      const mockUser = { 
        _id: 'user123', 
        metadata: { aiChatbotConsentGranted: true } 
      };
      
      ((documentService as any).organizationService.getOrgById as jest.Mock).mockResolvedValue(mockOrg);
      ((documentService as any).userService.findUserById as jest.Mock).mockResolvedValue(mockUser);
      ((documentService as any).featureFlagService.getFeatureIsOn as jest.Mock).mockResolvedValue(true);

      const result = await documentService.isEnabledDocumentIndexing('user123', documentPermission);

      expect(result).toBe(true);
    });
    
    it('should return feature flag result when role is ORGANIZATION', async () => {
      const documentPermission = {
        _id: 'perm123',
        refId: 'org123',
        documentId: 'doc123',
        role: DocumentRoleEnum.ORGANIZATION,
        workspace: { refId: 'org123' },
      } as IDocumentPermission;
    
      const mockOrg = { _id: 'org123' };
      const mockUser = { 
        _id: 'user123',
        metadata: { aiChatbotConsentGranted: true }
      };
    
      ((documentService as any).organizationService.getOrgById as jest.Mock).mockResolvedValue(mockOrg);
      ((documentService as any).userService.findUserById as jest.Mock).mockResolvedValue(mockUser);
      ((documentService as any).featureFlagService.getFeatureIsOn as jest.Mock).mockResolvedValue(true);
    
      const result = await documentService.isEnabledDocumentIndexing('user123', documentPermission);
    
      expect(result).toBe(true);
    });

    it('should return feature flag result when role is ORGANIZATION_TEAM', async () => {
      const documentPermission = {
        _id: 'perm123',
        refId: 'team123',
        documentId: 'doc123',
        role: DocumentRoleEnum.ORGANIZATION_TEAM,
        workspace: { refId: 'org123' },
      } as IDocumentPermission;
    
      const mockTeam = { _id: 'team123', belongsTo: 'org123' };
      const mockOrg = { _id: 'org123' };
      const mockUser = { _id: 'user123', metadata: { aiChatbotConsentGranted: true } };
    
      ((documentService as any).organizationTeamService.getOrgTeamById as jest.Mock).mockResolvedValue(mockTeam);
      ((documentService as any).organizationService.getOrgById as jest.Mock).mockResolvedValue(mockOrg);
      ((documentService as any).userService.findUserById as jest.Mock).mockResolvedValue(mockUser);
      ((documentService as any).featureFlagService.getFeatureIsOn as jest.Mock).mockResolvedValue(true);
    
      const result = await documentService.isEnabledDocumentIndexing('user123', documentPermission);
    
      expect(result).toBe(true);
    });

    it('should return false when workspace is null', async () => {
      const documentPermission = {
        _id: 'perm123',
        refId: 'user123',
        documentId: 'doc123',
        role: DocumentRoleEnum.OWNER,
        workspace: null,
      } as any;
      const result = await documentService.isEnabledDocumentIndexing('user123', documentPermission);
    
      expect(result).toBe(false);
    });
  });

  describe('emitIndexDocumentMessage', () => {
    let documentService: DocumentService;
    let rabbitMQService: RabbitMQService;

    beforeEach(() => {
      rabbitMQService = new (class {
        publish = jest.fn();
        publishWithPriority = jest.fn();
      })() as any;

      documentService = new (class {
        emitIndexDocumentMessage = DocumentService.prototype.emitIndexDocumentMessage;
        rabbitMQService = rabbitMQService;
        updateDocumentChunkedStatus = jest.fn();
        loggerService = { info: jest.fn() };
      })() as any;
    });

    it('should emit index message for GOOGLE documents', async () => {
      const message = {
        workspaceId: 'workspace123',
        documentId: 'doc123',
        remoteId: 'remote123',
        source: DocumentStorageEnum.GOOGLE,
        userId: 'user123',
        documentName: 'Test Doc',
        clientId: 'org123',
        clientType: DocumentRoleEnum.ORGANIZATION,
        documentPermissionId: 'perm123',
        folderId: 'folder123',
        origin: DocumentIndexingOriginEnum.LUMIN_PDF
      };

      await documentService.emitIndexDocumentMessage({
        message,
        indexType: DocumentIndexingTypeEnum.NEW_DOCUMENT,
      });

      expect(rabbitMQService.publishWithPriority).toHaveBeenCalledWith({
        exchange: EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING,
        routingKey: ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_PRIORITY,
        data: message,
        priority: DocumentIndexingMessagePriority.NEW_DOCUMENT,
      });
    });

    it('should emit update message for S3 documents', async () => {
      const message = {
        workspaceId: 'workspace123',
        documentId: 'doc123',
        remoteId: 'remote123',
        source: DocumentStorageEnum.S3,
        userId: 'user123',
        documentName: 'Test Doc',
        clientId: 'org123',
        clientType: DocumentRoleEnum.ORGANIZATION,
        documentPermissionId: 'perm123',
        folderId: 'folder123',
        origin: DocumentIndexingOriginEnum.LUMIN_PDF
      };

      await documentService.emitIndexDocumentMessage({
        message,
        indexType: DocumentIndexingTypeEnum.UPDATED_DOCUMENT,
      });

      expect(rabbitMQService.publishWithPriority).toHaveBeenCalledWith({
        exchange: EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING,
        routingKey: ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_PRIORITY,
        data: message,
        priority: DocumentIndexingMessagePriority.UPDATED_DOCUMENT,
      });
    });

    it('should not emit message for unsupported source', async () => {
      const message = {
        workspaceId: 'workspace123',
        documentId: 'doc123',
        remoteId: 'remote123',
        source: 'UNSUPPORTED' as DocumentStorageEnum,
        userId: 'user123',
        documentName: 'Test Doc',
        clientId: 'org123',
        clientType: DocumentRoleEnum.ORGANIZATION,
        documentPermissionId: 'perm123',
        folderId: 'folder123',
        origin: DocumentIndexingOriginEnum.LUMIN_PDF
      };

      await documentService.emitIndexDocumentMessage({
        message,
        indexType: DocumentIndexingTypeEnum.UPLOADED_DOCUMENT,
      });
      
      expect(rabbitMQService.publishWithPriority).toHaveBeenCalledWith({
        exchange: EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING,
        routingKey: ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_PRIORITY,
        data: message,
        priority: DocumentIndexingMessagePriority.UPLOADED_DOCUMENT,
      });
    });

    it('should emit update routing key when operation is update', async () => {
      const message = {
        workspaceId: 'workspace456',
        documentId: 'doc456',
        remoteId: 'remote456',
        source: DocumentStorageEnum.S3,
        userId: 'user456',
        documentName: 'Updated Doc',
        clientId: 'org456',
        clientType: DocumentRoleEnum.ORGANIZATION,
        documentPermissionId: 'perm456',
        folderId: 'folder456',
        origin: DocumentIndexingOriginEnum.LUMIN_PDF,
      };
    
      await documentService.emitIndexDocumentMessage({
        message,
        indexType: DocumentIndexingTypeEnum.UPDATED_DOCUMENT,
        operation: 'update',
      });
    
      expect(rabbitMQService.publishWithPriority).toHaveBeenCalledWith({
        exchange: EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING,
        routingKey: ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_UPDATE,
        data: message,
        priority: DocumentIndexingMessagePriority[DocumentIndexingTypeEnum.UPDATED_DOCUMENT],
      });
    
      expect(documentService.updateDocumentChunkedStatus).toHaveBeenCalledWith(
        'doc456',
        DocumentIndexingStatusEnum.PROCESSING,
      );
    });
    
  });

  describe('updateDocumentIndexing', () => {
    let documentService: DocumentService;
  
    beforeEach(() => {
      documentService = new (class {
        updateDocumentIndexing = DocumentService.prototype.updateDocumentIndexing;
        getDocumentPermissionByConditions = jest.fn();
        isEnabledDocumentIndexing = jest.fn();
        emitIndexDocumentMessage = jest.fn();
        getWorkspaceFromDocumentPermission = jest.fn();
        loggerService = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
      })() as any;
    });
  
    it('should not update indexing when disabled', async () => {
      const document = {
        _id: new Types.ObjectId(),
        remoteId: new Types.ObjectId(),
        service: DocumentStorageEnum.S3,
        ownerId: new Types.ObjectId(),
        name: 'Test Doc',
        folderId: new Types.ObjectId(),
        metadata: { indexingStatus: DocumentIndexingStatusEnum.PENDING },
        roleOfDocument: DocumentRoleEnum.OWNER,
      } as any;
  
      const mockPermission: any = {
        _id: new Types.ObjectId(),
        role: DocumentRoleEnum.OWNER,
        workspace: new Types.ObjectId(),
        refId: new Types.ObjectId(),
      };
  
      (documentService.getDocumentPermissionByConditions as jest.Mock).mockResolvedValue([mockPermission]);
      (documentService.isEnabledDocumentIndexing as jest.Mock).mockResolvedValue(false);
  
      await documentService.updateDocumentIndexing(document);
  
      expect(documentService.emitIndexDocumentMessage).not.toHaveBeenCalled();
    });
  
    it('should update indexing when enabled', async () => {
      const docId = new Types.ObjectId();
      const remoteId = new Types.ObjectId();
      const ownerId = new Types.ObjectId();
      const folderId = new Types.ObjectId();
      const permId = new Types.ObjectId();
      const workspaceId = new Types.ObjectId();
  
      const document = {
        _id: docId,
        remoteId,
        service: DocumentStorageEnum.S3,
        ownerId,
        name: 'Test Doc',
        folderId,
        metadata: { indexingStatus: DocumentIndexingStatusEnum.PENDING },
        roleOfDocument: DocumentRoleEnum.OWNER,
      } as any;
  
      const mockPermission: any = {
        _id: permId,
        role: DocumentRoleEnum.OWNER,
        workspace: workspaceId,
        refId: new Types.ObjectId(),
      };
  
      (documentService.getDocumentPermissionByConditions as jest.Mock).mockResolvedValue([mockPermission]);
      (documentService.isEnabledDocumentIndexing as jest.Mock).mockResolvedValue(true);
      (documentService.getWorkspaceFromDocumentPermission as jest.Mock).mockResolvedValue(workspaceId.toHexString());
  
      await documentService.updateDocumentIndexing(document);
  
      expect(documentService.emitIndexDocumentMessage).toHaveBeenCalled();
    });
  
    it('should use refId when workspace is null', async () => {
      const docId = new Types.ObjectId();
      const remoteId = new Types.ObjectId();
      const ownerId = new Types.ObjectId();
      const folderId = new Types.ObjectId();
      const permId = new Types.ObjectId();
      const refId = new Types.ObjectId();
  
      const document = {
        _id: docId,
        remoteId,
        service: DocumentStorageEnum.S3,
        ownerId,
        name: 'Test Doc',
        folderId,
        metadata: { indexingStatus: DocumentIndexingStatusEnum.PENDING },
        roleOfDocument: DocumentRoleEnum.OWNER,
      } as any;
  
      const mockPermission: any = {
        _id: permId,
        role: DocumentRoleEnum.OWNER,
        workspace: null,
        refId,
      };
  
      (documentService.getDocumentPermissionByConditions as jest.Mock).mockResolvedValue([mockPermission]);
      (documentService.isEnabledDocumentIndexing as jest.Mock).mockResolvedValue(true);
      (documentService.getWorkspaceFromDocumentPermission as jest.Mock).mockResolvedValue(null);
  
      await documentService.updateDocumentIndexing(document);
  
      expect(documentService.emitIndexDocumentMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.objectContaining({
            clientId: refId.toHexString(),
          }),
          indexType: DocumentIndexingTypeEnum.UPDATED_DOCUMENT,
          operation: 'update',
        })
      );
    });
  
    it('should handle null workspace and null refId gracefully', async () => {
      const docId = new Types.ObjectId();
      const remoteId = new Types.ObjectId();
      const ownerId = new Types.ObjectId();
      const folderId = new Types.ObjectId();
      const permId = new Types.ObjectId();
  
      const document = {
        _id: docId,
        remoteId,
        service: DocumentStorageEnum.S3,
        ownerId,
        name: 'Test Doc',
        folderId,
        metadata: { indexingStatus: DocumentIndexingStatusEnum.PENDING },
        roleOfDocument: DocumentRoleEnum.OWNER,
      } as unknown as IDocument;
  
      const emptyId = new Types.ObjectId();
      const mockPermission: any = {
        _id: permId,
        role: DocumentRoleEnum.OWNER,
        workspace: null,
        refId: emptyId,
      };
  
      (documentService.getDocumentPermissionByConditions as jest.Mock).mockResolvedValue([mockPermission]);
      (documentService.isEnabledDocumentIndexing as jest.Mock).mockResolvedValue(true);
      (documentService.getWorkspaceFromDocumentPermission as jest.Mock).mockResolvedValue(null);
  
      await documentService.updateDocumentIndexing(document);
  
      expect(documentService.emitIndexDocumentMessage).toHaveBeenCalled();
    });
  });

  describe('updateDocumentIndexingWithDebounce', () => {
    let documentService: DocumentService;
  
    beforeEach(() => {
      documentService = new (class {
        updateDocumentIndexingWithDebounce = DocumentService.prototype.updateDocumentIndexingWithDebounce;
        getDocumentPermissionByConditions = jest.fn();
        isEnabledDocumentIndexing = jest.fn();
        redisService = { setRedisDataWithExpireTime: jest.fn() };
      })() as any;
    });
  
    it('should not set Redis when indexing is disabled', async () => {
      const docId = new Types.ObjectId().toHexString();
      const ownerId = new Types.ObjectId().toHexString();
  
      const document = { _id: docId, ownerId } as IDocument;
      const mockPermission = { role: DocumentRoleEnum.OWNER };
  
      (documentService.getDocumentPermissionByConditions as jest.Mock).mockResolvedValue([mockPermission]);
      (documentService.isEnabledDocumentIndexing as jest.Mock).mockResolvedValue(false);
  
      await documentService.updateDocumentIndexingWithDebounce(document);
  
      expect((documentService as any).redisService.setRedisDataWithExpireTime).not.toHaveBeenCalled();
    });
  
    it('should set Redis when indexing is enabled', async () => {
      const docId = new Types.ObjectId().toHexString();
      const ownerId = new Types.ObjectId().toHexString();
  
      const document = { _id: docId, ownerId } as IDocument;
      const mockPermission = { role: DocumentRoleEnum.OWNER };
  
      (documentService.getDocumentPermissionByConditions as jest.Mock).mockResolvedValue([mockPermission]);
      (documentService.isEnabledDocumentIndexing as jest.Mock).mockResolvedValue(true);
  
      await documentService.updateDocumentIndexingWithDebounce(document);
  
      expect((documentService as any).redisService.setRedisDataWithExpireTime).toHaveBeenCalledWith({
        key: `${RedisConstants.DOCUMENT_INDEXING_DEBOUNCE}${docId}`,
        value: '1',
        expireTime: 600,
      });
    });
  });

  describe('processDebouncedDocumentIndexing', () => {
    let documentService: DocumentService;
  
    beforeEach(() => {
      documentService = new (class {
        processDebouncedDocumentIndexing = DocumentService.prototype['processDebouncedDocumentIndexing'];
        getDocumentByDocumentId = jest.fn();
        updateDocumentIndexing = jest.fn();
        redisService = { deleteRedisByKey: jest.fn() };
      })() as any;
    });

    it('should return early if document not found', async () => {
      const docId = new Types.ObjectId().toHexString();
    
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(null);
    
      await (documentService as any).processDebouncedDocumentIndexing(docId);
    
      expect(documentService.updateDocumentIndexing).not.toHaveBeenCalled();
      expect((documentService as any).redisService.deleteRedisByKey).not.toHaveBeenCalled();
    });
    
  
    it('should process document and delete debounce key', async () => {
      const docId = new Types.ObjectId().toHexString();
      const mockDocument = { _id: docId } as IDocument;
  
      (documentService.getDocumentByDocumentId as jest.Mock).mockResolvedValue(mockDocument);
      (documentService.updateDocumentIndexing as jest.Mock).mockResolvedValue(undefined);
  
      await (documentService as any).processDebouncedDocumentIndexing(docId);
  
      expect(documentService.getDocumentByDocumentId).toHaveBeenCalledWith(docId);
      expect(documentService.updateDocumentIndexing).toHaveBeenCalledWith(mockDocument);
      expect((documentService as any).redisService.deleteRedisByKey).toHaveBeenCalledWith(
        `${RedisConstants.DOCUMENT_INDEXING_DEBOUNCE}${docId}`
      );
    });
  });
  
  describe('updateDocumentsChunkedStatus', () => {
    let documentService: DocumentService;
  
    beforeEach(() => {
      documentService = new (class {
        updateDocumentsChunkedStatus = DocumentService.prototype.updateDocumentsChunkedStatus;
        documentModel = { updateMany: jest.fn() };
      })() as any;
    });
  
    it('should update indexingStatus for multiple documents', async () => {
      const docIds = [new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString()];
      const status = DocumentIndexingStatusEnum.PROCESSING;
  
      ((documentService as any).documentModel.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: docIds.length });
  
      await documentService.updateDocumentsChunkedStatus(docIds, status);
  
      expect((documentService as any).documentModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: docIds } },
        { $set: { 'metadata.indexingStatus': status } }
      );
    });
  });  

  describe('getPersonalOrgDocumentPermissions', () => {
    let documentService: DocumentService;
    let mockModel: any;
  
    beforeEach(() => {
      mockModel = {
        find: jest.fn(),
      };
      documentService = new (class {
        documentPermissionModel = mockModel;
        getPersonalOrgDocumentPermissions = DocumentService.prototype.getPersonalOrgDocumentPermissions;
      })() as any;
    });
  
    it('should return mapped document permissions', async () => {
      const mockDocs = [
        { _id: { toHexString: () => '1' }, toObject: () => ({ name: 'doc1' }) },
        { _id: { toHexString: () => '2' }, toObject: () => ({ name: 'doc2' }) },
      ];
      mockModel.find.mockResolvedValue(mockDocs);
  
      const result = await (documentService as any).getPersonalOrgDocumentPermissions('user1', 'org1');
  
      expect(mockModel.find).toHaveBeenCalledWith({
        refId: 'user1',
        role: DocumentRoleEnum.OWNER,
        'workspace.refId': 'org1',
      });
      expect(result).toEqual([
        { name: 'doc1', _id: '1' },
        { name: 'doc2', _id: '2' },
      ]);
    });
  });
  

  describe('getOrgDocumentPermissions', () => {
    let documentService: DocumentService;
    let mockModel: any;
  
    beforeEach(() => {
      mockModel = {
        find: jest.fn(),
      };
      documentService = new (class {
        documentPermissionModel = mockModel;
        getOrgDocumentPermissions = DocumentService.prototype.getOrgDocumentPermissions;
      })() as any;
    });
  
    it('should return mapped org document permissions', async () => {
      const mockDocs = [
        { _id: { toHexString: () => '1' }, toObject: () => ({ name: 'orgdoc' }) },
      ];
      mockModel.find.mockResolvedValue(mockDocs);
  
      const result = await (documentService as any).getOrgDocumentPermissions('org1');
  
      expect(mockModel.find).toHaveBeenCalledWith({
        refId: 'org1',
        role: DocumentRoleEnum.ORGANIZATION,
      });
      expect(result).toEqual([{ name: 'orgdoc', _id: '1' }]);
    });
  });
  
  describe('getTeamDocumentPermissions', () => {
    let documentService: DocumentService;
    let mockModel: any;
  
    beforeEach(() => {
      mockModel = { find: jest.fn() };
      documentService = new (class {
        documentPermissionModel = mockModel;
        getTeamDocumentPermissions = DocumentService.prototype.getTeamDocumentPermissions;
      })() as any;
    });
  
    it('should return mapped team document permissions', async () => {
      const mockDocs = [
        { _id: { toHexString: () => 't1' }, toObject: () => ({ name: 'teamdoc' }) },
      ];
      mockModel.find.mockResolvedValue(mockDocs);
  
      const result = await (documentService as any).getTeamDocumentPermissions('team1');
  
      expect(mockModel.find).toHaveBeenCalledWith({
        refId: 'team1',
        role: DocumentRoleEnum.ORGANIZATION_TEAM,
      });
      expect(result).toEqual([{ name: 'teamdoc', _id: 't1' }]);
    });
  });
  
  describe('getDocumentsToIndex', () => {
    let documentService: DocumentService;
    let mockModel: any;
  
    beforeEach(() => {
      mockModel = { find: jest.fn(() => ({ exec: jest.fn() })) };
      documentService = new (class {
        documentModel = mockModel;
        getDocumentsToIndex = DocumentService.prototype.getDocumentsToIndex;
      })() as any;
    });
  
    it('should query and return mapped documents', async () => {
      const mockDocs = [
        { _id: { toHexString: () => 'd1' }, toObject: () => ({ name: 'doc' }) },
      ];
      mockModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockDocs) });
  
      const result = await (documentService as any).getDocumentsToIndex(['d1']);
  
      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: { $in: ['d1'] },
          size: { $lt: expect.any(Number) },
        })
      );
      expect(result).toEqual([{ name: 'doc', _id: 'd1' }]);
    });
  });
  
  describe('setDocumentIndexingStatus', () => {
    let documentService: DocumentService;
    let mockModel: any;
  
    beforeEach(() => {
      mockModel = { updateMany: jest.fn() };
      documentService = new (class {
        documentModel = mockModel;
        setDocumentIndexingStatus = DocumentService.prototype.setDocumentIndexingStatus;
      })() as any;
    });
  
    it('should update indexing status for given documents', async () => {
      await (documentService as any).setDocumentIndexingStatus(['a1', 'a2'], DocumentIndexingStatusEnum.COMPLETED);
  
      expect(mockModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: ['a1', 'a2'] } },
        { $set: { 'metadata.indexingStatus': DocumentIndexingStatusEnum.COMPLETED } }
      );
    });
  });
});