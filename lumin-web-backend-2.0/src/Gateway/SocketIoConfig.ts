/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import 'moment-timezone';
import {
  UseGuards, forwardRef, Inject, UsePipes,
  UseInterceptors,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import * as eiows from 'eiows';
import { get, isUndefined } from 'lodash';
import * as moment from 'moment';
import { Server } from 'socket.io';
import { v4 } from 'uuid';

import { EMAIL_TYPE } from 'Common/constants/EmailConstant';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { FeatureFlagKeys } from 'Common/constants/FeatureFlags';
import { NotiComment } from 'Common/constants/NotificationConstants';
import {
  FormFieldChangedSource,
  PageManipulation,
  SOCKET_EMIT_TYPE,
  SOCKET_MESSAGE,
  SOCKET_NAMESPACE,
  SOCKET_ON,
} from 'Common/constants/SocketConstants';
import {
  SUBSCRIPTION_UPDATE_DOCUMENT_INFO,
  SUBSCRIPTION_DOCUMENT_INFO_NAME,
  SUBSCRIPTION_DOCUMENT_INFO_PRINCIPLE_LIST,
} from 'Common/constants/SubscriptionConstants';
import { AcceptancePermissions } from 'Common/decorators/permission.decorator';
import { HandleSocketErrors } from 'Common/decorators/ws-error-handler.decorator';
import { WsErrorException } from 'Common/errors/WsException';
import { WebSocketExceptionFilter } from 'Common/exceptions/ws.exception.filter';
import { notiFirebaseCommentFactory } from 'Common/factory/NotiFirebaseFactory';
import { HeapTracer } from 'Common/utils/HeapTracer';
import { Utils } from 'Common/utils/Utils';
import { WsValidationPipe } from 'Common/validator/ws.validator';

import { AuthService } from 'Auth/auth.service';
import {
  AnnotationAction, DocumentAnnotationTypeEnum, XfdfPageString, DocumentAnnotationSubTypeEnum,
} from 'Document/document.annotation.enum';
import {
  DocumentRoleEnum, DocumentStorageEnum,
} from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { DocumentOutlineService } from 'Document/documentOutline.service';
import { DocumentSyncService } from 'Document/documentSync.service';
import { DocumentSyncStatus } from 'Document/enums/document.sync.enum';
import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import { OrganizationDocumentRoles, OrgTeamDocumentRoles } from 'Document/enums/organization.roles.enum';
import { TeamRoles } from 'Document/enums/team.roles.enum';
import { DocumentPaymentInterceptor } from 'Document/interceptor/document.payment.interceptor';
import { IDocumentImage } from 'Document/interfaces/document.interface';
import { EmailService } from 'Email/email.service';
import { EnvironmentService } from 'Environment/environment.service';
import { DocumentEventNames } from 'Event/enums/event.enum';
import { ICreateEventInput } from 'Event/interfaces/event.interface';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { PersonalEventService } from 'Event/services/personal.event.service';
import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';
import { AnnotationChangedData } from 'Gateway/dtos/annotationChanged.dto';
import { FormFieldChangedData } from 'Gateway/dtos/formFieldChanged.dto';
import { WSAttachUserGuard } from 'Gateway/guards/ws.attachUser.guard';
import { WSGuestLevelGuard } from 'Gateway/guards/ws.guest.permission.guard';
import { WSMembershipPermissionGuard } from 'Gateway/guards/ws.membership.permission.guard';
import { WSOwnerPermissionGuard } from 'Gateway/guards/ws.owner.permission.guard';
import { WSPersonalLevelGuard } from 'Gateway/guards/ws.personal.permission.guard';
import {
  AnnotationData, DeleteTeamData, ISendManipulationChangedData, ISocket,
} from 'Gateway/Socket.interface';
import { Document, ManipulationDocumentInput, RatingModalStatus } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { MembershipService } from 'Membership/membership.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { NotificationService } from 'Notication/notification.service';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import { OrganizationService } from 'Organization/organization.service';
import { getActionSyncForNewPriceModel } from 'Payment/utils/newPriceModelUtil';
import { TeamService } from 'Team/team.service';
import { User } from 'User/interfaces/user.interface';
import { DocViewerInteractionType } from 'User/user.enum';
import { UserService } from 'User/user.service';
import { UserMetricService } from 'UserMetric/usermetric.service';

import { AutoSyncActionType, AutoSyncChangeType, MAX_ANNOTATION_SYNC_COUNT } from './constants/autoSync.constant';
import { WsStatus } from './constants/ws-status.constant';
import { CancelSyncSessionData } from './dtos/cancelSyncSession.dto';
import { ConnectionData, DisconnectionData } from './dtos/connection.dto';
import { DeleteCommentNotiData } from './dtos/deleteCommentNoti.dto';
import { OutlinesChangedData } from './dtos/outlinesChanged.dto';
import { GatewayService } from './Gateway.service';
import { SocketInitialize } from './SocketInitialize';
import { SocketMessage } from './SocketMessage';
import { SocketRoomGetter } from './SocketRoom';

@WebSocketGateway(4000, {
  origins: '*:*',
  transports: ['websocket'],
  pingInterval: 25000,
  pingTimeout: 20000,
  allowEIO3: true,
  maxHttpBufferSize: 1e8,
  wsEngine: eiows.Server,
  perMessageDeflate: true,
})
@UsePipes(WsValidationPipe)
@UseFilters(WebSocketExceptionFilter)
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  cryptoKey: string;

  totalConnection: number;

  constructor(
    private readonly documentSyncService: DocumentSyncService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => MembershipService))
    private readonly membershipService: MembershipService,
    private readonly jwtService: JwtService,
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => EventServiceFactory))
    private readonly eventService: EventServiceFactory,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    private readonly organizationDocStackService: OrganizationDocStackService,

    /* For A/B Testing */
    private readonly userMetricService: UserMetricService,
    @Inject(forwardRef(() => TeamService))
    private readonly teamService: TeamService,
    private readonly personalEventService: PersonalEventService,
    private readonly loggerService: LoggerService,
    /* End */

    private readonly documentOutlineService: DocumentOutlineService,
    private readonly featureFlagService: FeatureFlagService,
    @Inject(forwardRef(() => GatewayService))
    private readonly gatewayService: GatewayService,
  ) {
    this.cryptoKey = this.environmentService.getByKey(EnvConstants.ENCRYPT_KEY);
    this.totalConnection = 0;
  }

  @WebSocketServer() server: Server;

  // eslint-disable-next-line global-require
  v8 = require('v8');

  private logConnectionInfo(event) {
    const convert = (number) => (Math.round(number / 1024 / 1024 / 1024 * 100) / 100).toFixed(2);
    const stats = process.memoryUsage();
    this.loggerService.info({
      context: 'socket.io',
      extraInfo: {
        event,
        rss: convert(stats.rss),
        heapLimit: convert(this.v8.getHeapStatistics().heap_size_limit),
        heapUsed: convert(stats.heapUsed),
        external: convert(stats.external),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        currentConnection: this.server.engine.clientsCount,
        totalConnections: this.totalConnection,
      },
    });
  }

  private async clearSyncStatusAfterDisconnect(client: ISocket) {
    const { documentId, status } = client.syncStatus || {};
    if (status && documentId) {
      await this.documentSyncService.clearDocumentSyncStatus(documentId, client.id);

      const documentRoom = SocketRoomGetter.document(documentId);
      const activeSockets = await client.nsp.in(documentRoom).fetchSockets();
      const otherSockets = activeSockets.filter(({ id }) => id !== client.id);
      // Only emit sync status if there are OTHER users connected (more than just the disconnecting user)
      if (otherSockets.length > 0) {
        const document = await this.documentService.findOneById(documentId);
        const { isSyncing } = await this.documentSyncService.checkDocumentSyncStatus(documentId);
        this.documentSyncService.publishSyncStatusToAllSessions(client.id, {
          documentId,
          documentService: document.service as DocumentStorageEnum,
          remoteId: document.remoteId,
        }, {
          isSyncing,
        });
      }
    }
  }

  async handleDisconnect(socket: ISocket) {
    if (this.environmentService.isProduction) {
      this.totalConnection -= 1;
      this.logConnectionInfo('disconnect');
    }
    await this.clearSyncStatusAfterDisconnect(socket);
    if (!socket.data.document) {
      return;
    }
    const sockets = await socket.nsp.in(SocketRoomGetter.document(socket.data.document.id)).fetchSockets();
    const members = sockets.map(({ data }) => data.user);
    if (sockets.some(({ id }) => id !== socket.id)) {
      socket.to(SocketRoomGetter.document(socket.data.document.id)).emit('onlineMembers', { members });
    }
  }

  handleConnection() {
    if (this.environmentService.isProduction) {
      this.totalConnection += 1;
      this.logConnectionInfo('connect');
    }
  }

  @SubscribeMessage('connection_init')
  async connectionInit(socket, data) {
    const { authorization: token, forceNew } = data;
    if (!token) {
      socket.emit('authenticated');
      return;
    }
    try {
      const session = await this.authService.getSession(token);
      socket._lumin_identity = {
        identityId: session.identity.id,
        sessionId: session.id,
        email: session.identity.traits.email,
      };
      socket.emit('authenticated');
    } catch (e) {
      this.loggerService.error({
        message: `Error in connection init: ${e instanceof Error ? e.message : 'Unknown error'}`,
        error: e,
        context: 'socket-init-error',
      });
      if (e.code === 'ERR_JWT_EXPIRED' && !forceNew) {
        socket.emit('renewAuthorizationToken');
      }
    }
  }

  @WSGuestLevelGuard(
    OrganizationDocumentRoles.ALL,
    TeamRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @SubscribeMessage('connection')
  async onConnection(socket: ISocket, data: ConnectionData) {
    try {
      const document = await this.documentService.updateDocument(data.roomId, { lastAccess: Date.now() });
      const { isSyncing } = await this.documentSyncService.checkDocumentSyncStatus(data.roomId);
      const socketInitialize = new SocketInitialize();
      socketInitialize
        .createSocketInstance(socket)
        .prepareRoom(SocketRoomGetter.document(data.roomId))
        .join();

      if (document.service as DocumentStorageEnum === DocumentStorageEnum.GOOGLE) {
        socket.join(SocketRoomGetter.document(document.remoteId));
      }
      socket.data.user = {
        socketId: socket.id,
        isActive: true,
        ...data.user,
      };
      socket.data.document = {
        id: data.roomId,
        remoteId: document.remoteId,
      };
      const sockets = await socket.nsp.in(SocketRoomGetter.document(data.roomId)).fetchSockets();
      const members = sockets.map((s) => s.data.user);
      socket.emit('newComer', { isSyncing });
      socket.emit('onlineMembers', { members });
      if (sockets.some(({ id }) => id !== socket.id)) {
        socket.to(SocketRoomGetter.document(data.roomId)).emit('newComer', { isSyncing });
        socket.to(SocketRoomGetter.document(data.roomId)).emit('onlineMembers', { members });
      }
    } catch (error) {
      this.loggerService.error({
        error,
        ...this.loggerService.getCommonErrorAttributes(error),
        extraInfo: data,
        context: 'socket-connection',
      });
    }
  }

  @WSGuestLevelGuard(
    OrganizationDocumentRoles.ALL,
    TeamRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @SubscribeMessage('disconnection')
  async onLeaveEditor(socket: ISocket, data: DisconnectionData) {
    try {
      const sockets = await socket.nsp.in(SocketRoomGetter.document(data.roomId)).fetchSockets();
      const members = sockets.filter(({ id }) => id !== socket.id).map((s) => s.data.user);
      if (members.length > 0 && socket.data.document) {
        socket.to(SocketRoomGetter.document(socket.data.document.id)).emit('onlineMembers', { members });
      }
      socket.leave(`document-room-${data.remoteId}`);
      socket.leave(`document-room-${data.roomId}`);
      const regex = new RegExp(`^${SOCKET_NAMESPACE.OCR_ROOM}|${SOCKET_NAMESPACE.CONVERSION_ROOM}|${SOCKET_NAMESPACE.ORG_ROOM}`, 'g');
      const roomNeedToLeave = Array.from(socket.rooms).filter((room: string) => regex.test(room));
      roomNeedToLeave.forEach((room) => {
        socket.leave(room);
      });
      await this.clearSyncStatusAfterDisconnect(socket);
      delete socket.data.document;
    } catch (error) {
      this.loggerService.error({
        error,
        stack: error.stack,
        context: this.onLeaveEditor.name,
      });
    }
  }

  @UseGuards(WSGuestLevelGuard)
  @AcceptancePermissions(
    TeamRoles.ALL,
    IndividualRoles.ALL,
  )
  @SubscribeMessage('toggleAutoSync')
  async toggleAutoSync(socket: ISocket, data: {
    documentId: string;
    enableGoogleSync: boolean;
  }) {
    const { documentId, enableGoogleSync } = data;
    const { remoteId } = await this.documentService.getDocumentByDocumentId(documentId);
    this.documentService.updateDocument(documentId, { enableGoogleSync });
    socket.to(SocketRoomGetter.document(documentId)).emit(SOCKET_MESSAGE.GOOGLE_SYNC, {
      type: AutoSyncActionType.UPDATE_ENABLE_GOOGLE_SYNC,
      enableGoogleSync,
    });
    if (!enableGoogleSync) {
      return;
    }

    const totalAnnots = await this.documentService.countDocumentAnnotations(documentId);
    if (totalAnnots > MAX_ANNOTATION_SYNC_COUNT) {
      socket.to(SocketRoomGetter.document(remoteId)).emit(`${SOCKET_MESSAGE.UPDATED_TEXT_CONTENT}-${remoteId}`, {
        status: 'success',
        documentId,
        increaseVersion: true,
      });
      return;
    }

    const [annotations, fields, document] = await Promise.all([
      this.documentService.getAnnotationsOfDocument(documentId, { _id: 1 }),
      this.documentService.getFormFieldByDocumentId(documentId, { _id: 1 }),
      this.documentService.getDocumentByDocumentId(documentId),
    ]);
    this.loggerService.info({
      context: 'toggleAutoSync-getAnnotations',
      extraInfo: {
        documentId,
        totalAnnots: annotations.length,
      },
    });
    if (annotations.length > 0 || document.temporaryRemoteId || fields.length > 0) {
      socket.isSyncing = true;
      socket.emit(SOCKET_MESSAGE.GOOGLE_SYNC, {
        type: AutoSyncActionType.CHECK_SYNC_PERMISSION,
        allowSync: true,
        dataSync: { annotations, fields, action: `TOGGLE_AUTO_SYNC-${documentId}` },
      });
    }
  }

  @UseGuards(WSGuestLevelGuard)
  @AcceptancePermissions(
    TeamRoles.ALL,
    IndividualRoles.ALL,
  )
  @SubscribeMessage('requestAutoSync')
  async requestAutoSync(socket: ISocket, data: {
    remoteId: string;
    documentId: string;
    action: `${AutoSyncChangeType}:${string}`;
    forceSync?: boolean;
  }) {
    const {
      remoteId,
      documentId,
      action,
      forceSync = false,
    } = data;
    const { info: organization } = await this.documentService.getTargetOwnedDocumentInfo(documentId);
    const newPriceModelVariant = await this.featureFlagService.getFeatureValue<string>({
      user: {
        _id: socket.user._id,
        createdAt: socket.user.createdAt,
        email: socket.user.email,
      },
      organization,
      featureFlagKey: FeatureFlagKeys.NEW_PRICING_MODELS,
    });

    const actionCountDocStack = getActionSyncForNewPriceModel(newPriceModelVariant);
    const enabledTowardDocStack = actionCountDocStack.sync;

    const syncingSocket = await this.redisService.getRedisValueWithKey(`syncingSocket-${remoteId}`);
    const [actionType] = action.split(':');
    if (socket.id !== syncingSocket && !this.server.sockets.sockets[syncingSocket]) {
      socket.isSyncing = true;
      const emitData: {
        type: AutoSyncActionType,
        allowSync: boolean,
        dataSync: Record<string, unknown>
      } = {
        type: AutoSyncActionType.CHECK_SYNC_PERMISSION,
        allowSync: true,
        dataSync: { action, forceSync },
      };
      const canFinishDocument = await this.organizationDocStackService.validateCanFinishDocument(documentId);

      if (!canFinishDocument && enabledTowardDocStack && !socket.isRequestFromMobile) {
        this.documentService.updateDocument(documentId, { enableGoogleSync: false });
        socket.emit(SOCKET_MESSAGE.GOOGLE_SYNC, {
          type: AutoSyncActionType.UPDATE_ENABLE_GOOGLE_SYNC,
          enableGoogleSync: false,
          reason: 'hitDocStackLimit',
        });
        return;
      }
      const { manipulationStep } = await this.documentService.findOneById(documentId, {
        manipulationStep: 1,
      });
      if (manipulationStep) {
        const manipulationSteps = JSON.parse(manipulationStep);
        const lastStep = manipulationSteps[manipulationSteps.length - 1];
        if (lastStep) {
          emitData.dataSync.lastManipulationStepId = lastStep.id;
        }
      }
      if (actionType as AutoSyncChangeType === AutoSyncChangeType.ANNOTATION_CHANGE) {
        const totalAnnots = await this.documentService.countDocumentAnnotations(documentId);
        if (totalAnnots <= MAX_ANNOTATION_SYNC_COUNT && !forceSync) {
          const [annotations, fields] = await Promise.all([
            this.documentService.getAnnotationsOfDocument(documentId, { _id: 1 }),
            this.documentService.getFormFieldByDocumentId(documentId, { _id: 1 }),
          ]);
          emitData.dataSync.annotations = annotations;
          emitData.dataSync.fields = fields;
        } else {
          this.documentSyncService.publishSyncStatusToAllSessions(socket.id, {
            documentId,
            documentService: DocumentStorageEnum.GOOGLE,
            remoteId,
          }, {
            status: DocumentSyncStatus.SUCCESS,
            isSyncing: true,
            increaseVersion: forceSync,
          });
        }
        this.loggerService.info({
          context: 'requestAutoSync-getAnnotations',
          extraInfo: {
            documentId,
            totalAnnots,
          },
        });
      }
      socket.isSyncing = true;
      socket.emit(SOCKET_MESSAGE.GOOGLE_SYNC, emitData);
      /*
        2 hours is long enough for user to sync file because there is no file that user can sync for 2 hours.
        We will track time to sync file and decrease time to live of this key in future.
      */
      this.redisService.setRedisDataWithExpireTime({
        key: `syncingSocket-${remoteId}`,
        value: socket.id,
        expireTime: 3600 * 2,
      });
    } else {
      socket.emit(SOCKET_MESSAGE.GOOGLE_SYNC, {
        type: AutoSyncActionType.CHECK_SYNC_PERMISSION,
        allowSync: false,
        dataSync: { action },
      });
      // push socket to waiting list which not duplicated
      const waitingSockets: string[] = JSON.parse(await this.redisService.getRedisValueWithKey(`waitingSockets-${remoteId}`)) || [];
      if (!waitingSockets.includes(socket.id)) {
        waitingSockets.push(`${socket.id}:${action}`);
        this.redisService.setRedisDataWithExpireTime({
          key: `waitingSockets-${remoteId}`,
          value: JSON.stringify(waitingSockets),
          expireTime: 3600 * 2,
        });
      }
    }
  }

  @UseInterceptors(DocumentPaymentInterceptor)
  @UseGuards(WSGuestLevelGuard)
  @AcceptancePermissions(
    TeamRoles.ALL,
    IndividualRoles.ALL,
  )
  @SubscribeMessage(SocketMessage.RESPONSE_AUTO_SYNC)
  async responseAutoSync(socket: ISocket, data: {
    status: string,
    remoteId: string,
    documentId: string,
    increaseVersion: boolean,
    dataSync: {
      annotations?: { _id: string }[],
      fields?: { _id: string }[],
      forceSync?: boolean,
    },
  }) {
    const {
      status, remoteId, documentId, increaseVersion,
    } = data;
    const { info: organization } = await this.documentService.getTargetOwnedDocumentInfo(documentId);
    const newPriceModelVariant = await this.featureFlagService.getFeatureValue<string>({
      user: {
        _id: socket.user._id,
        createdAt: socket.user.createdAt,
        email: socket.user.email,
      },
      organization,
      featureFlagKey: FeatureFlagKeys.NEW_PRICING_MODELS,
    });

    const actionCountDocStack = getActionSyncForNewPriceModel(newPriceModelVariant);
    const enabledTowardDocStack = actionCountDocStack.sync;

    if (status === 'success' && 'dataSync' in data) {
      await this.gatewayService.handleResponseAutoSyncSuccess(socket, data);
    }
    if (socket?.isSyncing) {
      socket.isSyncing = false;
      this.redisService.deleteRedisByKey(`syncingSocket-${remoteId}`);
    }
    // get socket waiting which still connected from waiting list and emit isSycing false
    const waitingSockets: string[] = JSON.parse(await this.redisService.getRedisValueWithKey(`waitingSockets-${remoteId}`)) || [];
    let socketId: string;
    while (waitingSockets.length > 0) {
      socketId = waitingSockets.shift();
      if (this.server.sockets.sockets[socketId]) {
        this.server.to(socketId).emit(SOCKET_MESSAGE.GOOGLE_SYNC, {
          type: AutoSyncActionType.CHECK_SYNC_PERMISSION,
          allowSync: true,
        });
        break;
      }
    }
    await this.documentSyncService.clearDocumentSyncStatus(documentId, socket.id);
    const { isSyncing } = await this.documentSyncService.checkDocumentSyncStatus(documentId);
    this.documentSyncService.publishSyncStatusToAllSessions(socket.id, {
      documentId,
      documentService: DocumentStorageEnum.GOOGLE,
      remoteId,
    }, {
      isSyncing,
      increaseVersion,
    });
    this.redisService.setRedisDataWithExpireTime({
      key: `waitingSockets-${remoteId}`,
      value: JSON.stringify(waitingSockets),
      expireTime: 3600 * 2,
    });

    return {
      statusCode: HttpStatus.OK,
      ...(status === 'success' && enabledTowardDocStack && {
        interceptRequest: {
          documentIds: [documentId],
          strategy: DocumentPaymentInterceptor.STRATEGY.AUTO_INCREMENT,
          fromSyncDocument: true,
        },
      }),
    };
  }

  @WSGuestLevelGuard(
    TeamRoles.ALL,
    IndividualRoles.ALL,
    OrganizationDocumentRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @SubscribeMessage(SocketMessage.ANNOTATION_CHANGED)
  @HandleSocketErrors()
  async annotationChanged(@ConnectedSocket() socket: ISocket, @MessageBody() data: AnnotationChangedData) {
    const startTime = performance.now();
    // Fallback for the old version
    const parsedData = Array.isArray(data) ? data[0] : data;
    try {
      const {
        roomId: documentId,
        email,
        xfdf,
        annotationId,
        annotationType,
        comment,
        annotationAction,
        shouldCreateEvent = true,
        reorderType,
        imageRemoteId,
        annotationSubType,
        isInternal = false,
        pageIndex,
      } = parsedData;
      const { _id: userId } = socket.user || {};
      if (!userId) {
        throw WsErrorException.Unauthorized('User is unauthorized');
      }

      const documentInfo = await this.documentService.findOneById(documentId);
      const isHighLightComment = annotationSubType === DocumentAnnotationSubTypeEnum.HIGHLIGHT_COMMENT
        && [DocumentAnnotationTypeEnum.REMOVAL, DocumentAnnotationTypeEnum.HIGHLIGHT].includes(annotationType);
      const isCommentAnnotation = annotationType === DocumentAnnotationTypeEnum.COMMENT || isHighLightComment;
      const isStickyNoteAnnotation = annotationType === DocumentAnnotationTypeEnum.STICKY_NOTE;
      const isSpecialAnnot = annotationType === DocumentAnnotationTypeEnum.INDEX;
      const shareSettingPermission = get(documentInfo, 'shareSetting.permission', '').toLowerCase();
      const invalidUser = !userId || !Utils.validateEmail(email);
      if (invalidUser) {
        throw WsErrorException.Unauthorized('The user is not valid');
      }
      if (!isSpecialAnnot) {
        const canAddAnnotation = (role: DocumentRoleEnum) => [
          DocumentRoleEnum.EDITOR,
          DocumentRoleEnum.OWNER,
          DocumentRoleEnum.SHARER,
        ].includes(role);
        const checkPermission = (role: DocumentRoleEnum) => canAddAnnotation(role)
          || ((isCommentAnnotation || isStickyNoteAnnotation) && DocumentRoleEnum.VIEWER === role);
        const isSharedWithEveryone = documentInfo.shareSetting?.linkType === 'ANYONE';
        let role = '';
        const permission = await this.documentService.getOneDocumentPermission(userId, { documentId });
        role = get(permission, 'role', '').toLowerCase();
        if (!role && !documentInfo.isPersonal) {
          const workspacePermission = await this.documentService.getDocumentPermissionByGroupRole(
            documentId,
            [DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM],
          );
          if (workspacePermission) {
            role = await this.documentService.getMemberDocumentRole({
              documentPermission: workspacePermission,
              userId,
              document: documentInfo,
            });
          }
        }
        let hasNoPermission = !checkPermission(role as DocumentRoleEnum);
        if (isSharedWithEveryone) {
          hasNoPermission = hasNoPermission && !checkPermission(shareSettingPermission as DocumentRoleEnum);
        }
        if (hasNoPermission) {
          throw WsErrorException.Forbidden(
            `The user ${userId} does not have permission to update annotation to document ${documentId}`,
          );
        }
      }

      const {
        content, commentInteractionEvent, commentAuthor, mentionedEmails,
      } = comment || {};
      const lastModify = Date.now();
      const { dataXFDF, eventName } = this.documentService.getDataXfdfAndEventName(commentInteractionEvent, xfdf, annotationType);

      const annotationData: AnnotationData = {
        documentId,
        xfdf: dataXFDF,
        annotationId,
        annotationType, // need for mobile
        /**
         * @description Need to keep this field for backward compatibility
         */
        isDeleted: false,
        pageIndex,
      };

      if (reorderType) {
        const newOrder = await this.documentService.getNewAnnotationOrder({ annotationId, documentId, reorderType });
        annotationData.order = newOrder;
      }

      if (imageRemoteId) {
        await this.documentService.addDocumentImage({ remoteId: imageRemoteId, documentId } as IDocumentImage);
        annotationData.imageRemoteId = imageRemoteId;
      }

      if (annotationType === DocumentAnnotationTypeEnum.REMOVAL && !isInternal) {
        await this.documentService.deleteManyAnnotationOfDocument({ annotationId, documentId });
      } else {
        await this.documentService.addAnnotationToDocument(annotationData);
      }
      /* For A/B Testing */
      this.userMetricService.updateAnnotateCount({ userId });
      /* End */
      const onlineMembers = await socket.nsp
        .in(SocketRoomGetter.document(documentId))
        .fetchSockets();
      const otherOnlineMembers = onlineMembers.filter(({ id }) => id !== socket.id);
      if (otherOnlineMembers.length > 0) {
        socket.to(SocketRoomGetter.document(documentId)).emit('annotationChanged', { ...annotationData, lastModified: Date.now(), xfdf: dataXFDF });
      }
      const [document, userInfo, documentScope] = await Promise.all([
        this.documentService.updateDocument(documentId, { lastModify }),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.userService.findUserById(userId),
        this.documentService.getDocumentScope(documentId),
      ]);

      const googleModalStatus = get(userInfo, 'metadata.rating.googleModalStatus');

      const eventData: ICreateEventInput = {
        eventName,
        actor: userInfo,
        eventScope: documentScope,
        document: document as unknown as Document,
      };
      const documentComment = {
        _id: annotationId,
        content,
      };
      let target = null;
      if (commentAuthor) {
        target = await this.userService.findUserByEmail(commentAuthor);
      }

      if (shouldCreateEvent && eventName) {
        this.eventService.createEvent({
          ...eventData,
          target,
          documentComment,
          annotationData: {
            _id: annotationId,
            type: annotationType,
          },
        });
      }

      if (mentionedEmails?.length && document.isPersonal
        && (eventName === DocumentEventNames.DOCUMENT_COMMENTED
          || eventName === DocumentEventNames.COMMENT_REPLIED)) {
        Promise.all(mentionedEmails.map(async (taggedEmail) => {
          if (taggedEmail !== commentAuthor) {
            const targetInfo = await this.userService.findUserByEmail(taggedEmail);
            this.eventService.createEvent({
              ...eventData,
              eventName: DocumentEventNames.COMMENT_MENTIONED,
              target: targetInfo,
              documentComment,
            });
          }
        }));
      }

      if (annotationAction === AnnotationAction.ADD
        && (!googleModalStatus || googleModalStatus === RatingModalStatus.NEVER_INTERACT)) {
        await this.documentService.handleUpdateDocViewerInteraction(userId, DocViewerInteractionType.TOTAL_CREATED_ANNOTATION);
      }
      this.redisService.setLastChangedAnnotation(documentId);
      return {
        status: WsStatus.SUCCESS,
        data: {
          annotationId,
          action: annotationAction,
          pageIndex,
        },
      };
    } catch (error) {
      return {
        status: WsStatus.ERROR,
        error: error.getError() || 'An unexpected error occurred',
      };
    } finally {
      const endTime = performance.now();
      const durationMs = endTime - startTime;

      this.loggerService.info({
        context: 'socket.annotationChanged',
        message: `Annotation changed processing time: ${durationMs.toFixed(2)} ms`,
        extraInfo: {
          durationMs,
          metric: 'socket.annotation_changed.duration',
          metricType: 'timing',
          metricValue: durationMs,
          documentId: parsedData.roomId,
          annotationSize: parsedData.xfdf?.length,
        },
      });
    }
  }

  @WSGuestLevelGuard(
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.EDITOR,
    IndividualRoles.OWNER,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
  )
  @SubscribeMessage('formFieldChanged')
  async formFieldChanged(socket, data: FormFieldChangedData) {
    const {
      data: updatedData,
      fieldName,
      roomId,
      formFieldChangedSource,
    } = data;
    const { isDeleted, isInternal } = updatedData;
    if (isDeleted && !isInternal) {
      await this.documentService.deleteFormFieldFromDocumentByFieldName(roomId, fieldName);
    } else {
      await this.documentService.updateFormField(
        roomId,
        fieldName,
        updatedData,
      );
    }
    if (formFieldChangedSource === FormFieldChangedSource.MANIPULATION) {
      return;
    }

    const onlineMembers = await socket.nsp.in(SocketRoomGetter.document(roomId)).fetchSockets();
    const otherOnlineMembers = onlineMembers.filter(({ id }) => id !== socket.id);
    if (otherOnlineMembers.length > 0) {
      socket.to(SocketRoomGetter.document(roomId)).emit('formFieldChanged', { fieldName, updatedData });
    }
  }

  @WSGuestLevelGuard(
    OrganizationDocumentRoles.ALL,
    TeamRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @SubscribeMessage(SocketMessage.STATUS_SYNC_FILE_TO_S3)
  /**
   * @deprecated will be removed after mobile app update
   */
  async publishSyncFileToS3(socket: ISocket, data: {
    roomId: string;
    isSyncing: boolean;
    increaseVersion: boolean;
  }) {
    const { roomId: documentId, isSyncing, increaseVersion } = data;
    const documentInfo = await this.documentService.findOneById(documentId, {
      remoteId: 1,
    });
    const etag = await this.documentService.getDocumentETag(documentInfo?.remoteId);
    socket.to(SocketRoomGetter.document(documentId)).emit(SocketMessage.STATUS_SYNC_FILE_TO_S3, { isSyncing, increaseVersion, etag });
  }

  @WSGuestLevelGuard(
    OrganizationDocumentRoles.ALL,
    OrgTeamDocumentRoles.ALL,
    TeamRoles.ALL,
    IndividualRoles.ALL,
  )
  @SubscribeMessage('updateDocument')
  async updateDocument(socket, data: any) {
    const { type } = data;
    const documentId = data.roomId as string;
    switch (type) {
      case 'updateService': {
        const { service = '', remoteId = '' } = data.previousDocumentData || {};
        if (service === DocumentStorageEnum.GOOGLE && remoteId) {
          socket.leave(`document-room-${remoteId}`);
        }
      }
      // eslint-disable-next-line no-fallthrough
      case 'rename': {
        socket.join(`document-room-${documentId}`);
        const newDocument = await this.documentService.findOneById(documentId);
        const user = await this.userService.findUserById(newDocument.ownerId);
        const { allReceivers: receiveIds } = await this.documentService.getReceiverIdsFromDocumentId(documentId);
        const cloneDocument = JSON.parse(JSON.stringify(newDocument));
        cloneDocument.ownerName = user?.name || 'Anonymous';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        cloneDocument.isOverTimeLimit = await this.documentService.hasDocumentBeenLimited(cloneDocument);
        this.documentService.publishUpdateDocument(
          receiveIds,
          {
            document: cloneDocument,
            type: SUBSCRIPTION_DOCUMENT_INFO_NAME,
          },
          SUBSCRIPTION_UPDATE_DOCUMENT_INFO,
        );
        socket.to(SocketRoomGetter.document(documentId)).emit('updateDocument', { name: newDocument.name, service: newDocument.service, type });
        break;
      }
      case 'updateDocumentPrincipleList': {
        const newDocument = await this.documentService.findOneById(documentId);
        const cloneDocument = JSON.parse(JSON.stringify(newDocument));
        const { allReceivers: receiveIds } = await this.documentService.getReceiverIdsFromDocumentId(documentId);
        this.documentService.publishUpdateDocument(
          receiveIds,
          {
            document: cloneDocument,
            type: SUBSCRIPTION_DOCUMENT_INFO_PRINCIPLE_LIST,
          },
          SUBSCRIPTION_UPDATE_DOCUMENT_INFO,
        );
        const currentRoom = SocketRoomGetter.document(documentId);
        socket.join(currentRoom);
        const { data: { principles } } = data;
        socket.to(currentRoom).emit(`${SOCKET_MESSAGE.UPDATE_DOCUMENT_ACTION_PERMISSION_SETTINGS}-${documentId}`, { data: { principles } });
        break;
      }
      case 'star': {
        socket.join(`document-room-${documentId}`);
        socket.to(`document-room-${documentId}`).emit('updateDocument', { type: 'star' });
        break;
      }
      case 'size': {
        await this.documentService.updateDocument(documentId, { size: data.size });
        socket.to(SocketRoomGetter.document(documentId)).emit('updateDocument', { size: data.size, type });
        break;
      }
      default:
        break;
    }
  }

  @UseGuards(WSAttachUserGuard)
  @SubscribeMessage('clearAnnotationAndManipulationOfDocument')
  clearAnnotationAndManipulationOfDocument(socket, documentId: string) {
    Promise.all([
      this.documentService.clearAnnotationOfDocument({ documentId }),
      this.documentService.deleteFormFieldFromDocument(documentId),
      this.documentService.updateDocument(documentId, { manipulationStep: '', 'metadata.hasClearedAnnotAndManip': true }),
      this.documentOutlineService.clearOutlineOfDocument(documentId),
    ]).catch((err) => {
      this.loggerService.error({
        context: 'clearAnnotationAndManipulationOfDocument',
        error: err,
        stack: err.stack,
        message: err.message,
        extraInfo: {
          documentId,
        },
      });
    });
  }

  @WSGuestLevelGuard(
    TeamRoles.ALL,
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
  )
  @SubscribeMessage('sendManipulationChanged')
  async sendManipulationChanged(socket: ISocket, data: {
    type: PageManipulation;
    option: any;
    totalPages?: number;
    roomId: string;
    deletedAnnotIds?: string[];
    manipulationId?: string;
    shouldSaveOutlines?: boolean;
  }): Promise<{
    status: 'success' | 'failed';
    data?: {
      type: string;
      option: any;
      lastModify: number;
      id: string;
      shouldSaveOutlines?: boolean;
    };
  }> {
    const { _id: userId } = socket.user;
    const {
      type,
      option,
      totalPages,
      shouldSaveOutlines,
    } = data;
    if (
      (type === PageManipulation.RemovePage && !totalPages)
      || (type === PageManipulation.RotatePage && !Array.isArray(option.pageIndexes))
    ) {
      return {
        status: 'failed',
      };
    }
    const metadata = {
      totalPages,
      type,
      userId,
      roomId: data.roomId,
    };
    const tracer = new HeapTracer('sendManipulationChanged', this.loggerService);
    const mainTask = tracer.start('all', metadata);
    const document = await this.documentService.findOneById(data.roomId);
    let bookmarks = document.bookmarks ? document.bookmarks : '';

    const oldManipulationSteps = document.manipulationStep && JSON.parse(document.manipulationStep).length > 0
      ? JSON.parse(document.manipulationStep)
      : [];
    const manipulationId = data.manipulationId || v4();
    const newManipulationSteps = [...oldManipulationSteps, { type, option, id: manipulationId }];
    const lastModify = Date.now();
    const updatedData: Record<string, unknown> = { lastModify, manipulationStep: JSON.stringify(newManipulationSteps) };
    await this.documentService.upsertDocument(data.roomId, updatedData);

    if (type === PageManipulation.MergePage) {
      const manipulationData: ManipulationDocumentInput = {
        documentId: data.roomId,
        refId: userId,
        type,
        option,
        id: manipulationId,
      };
      await this.documentService.updateDocument(data.roomId, {
        'metadata.hasMerged': true,
      });
      if (option.isSaveLimit) {
        this.documentService.addManipulationToDocument(manipulationData);
      }
    }

    if (type === PageManipulation.RemovePage) {
      await this.documentService.deleteAnnotationsOnPage(data.deletedAnnotIds);
    }

    if (type !== PageManipulation.RotatePage && type !== PageManipulation.CropPage) {
      const mapObjTask = tracer.start('mapObj');
      const mapObjAnnot = this.documentService.getPagesNeedUpdateAnnot(data);
      const mapObjBookmark = this.documentService.getPagesNeedUpdate(data, XfdfPageString.BOOKMARK);
      const mapObjDest = this.documentService.getPagesNeedUpdate(data, XfdfPageString.HYPERLINK);
      mapObjTask.submit();

      const re = new RegExp(Object.keys(mapObjAnnot).join('|'), 'g');
      const reDest = new RegExp(Object.keys(mapObjDest).join('|'), 'g');
      if (Object.keys(mapObjAnnot).length) {
        const getAnnotTask = tracer.start('getAnnot');
        const totalAnnots = await this.documentService.countDocumentAnnotations(document._id);
        if (totalAnnots > MAX_ANNOTATION_SYNC_COUNT) {
          socket.to(SocketRoomGetter.document(document._id)).emit(`${SOCKET_MESSAGE.UPDATED_TEXT_CONTENT}-${document._id}`, {
            isForceUpdate: true,
          });
        } else {
          const documentAnnotations = await this.documentService.getAnnotationsOfDocument(document._id);
          // eslint-disable-next-line no-restricted-syntax
          for (const annotation of documentAnnotations) {
            annotation.xfdf = annotation.xfdf
              .replace(re, (matched) => mapObjAnnot[matched])
              .replace(reDest, (matched) => mapObjDest[matched]);
            // eslint-disable-next-line no-await-in-loop
            await this.documentService.addAnnotationToDocument(annotation, { upsert: false });
          }
        }
        getAnnotTask.submit();
      }
      const updateBookmarkTask = tracer.start('updateBookmarkTask');
      if (type === PageManipulation.RemovePage) {
        bookmarks = this.documentService.eraseBookmark(option, bookmarks);
      }
      const reBookmark = new RegExp(Object.keys(mapObjBookmark).join('|'), 'gi');
      if (Object.keys(mapObjBookmark).length) {
        bookmarks = bookmarks.replace(reBookmark, (matched) => mapObjBookmark[matched]);
        await this.documentService.updateDocument(data.roomId, { bookmarks });
      }
      updateBookmarkTask.submit();
    }

    // We need to check if shouldSaveOutlines is undefined to support backward compatibility in case user browser's application is not up to date
    if (isUndefined(shouldSaveOutlines) || shouldSaveOutlines) {
      await this.documentOutlineService.updateOnManipulationChange(data as ISendManipulationChangedData, document);
    }
    const manipulationPayload = {
      type,
      option,
      lastModify,
      id: manipulationId,
      shouldSaveOutlines,
    };
    socket
      .to(SocketRoomGetter.document(data.roomId))
      .emit('manipulationChanged', manipulationPayload);

    Promise.all([
      this.userService.findUserById(userId),
      this.documentService.getDocumentScope(data.roomId),
    ]).then(([userInfo, documentScope]) => {
      this.eventService.createEvent({
        eventName: DocumentEventNames.DOCUMENT_MANIPULATED,
        actor: userInfo,
        eventScope: documentScope,
        document: document as unknown as Document,
      });
    }).catch(() => { /** DO NOTHING */ });

    mainTask.submit();

    return {
      status: 'success',
      data: manipulationPayload,
    };
  }

  @WSGuestLevelGuard(
    TeamRoles.ALL,
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
  )
  @SubscribeMessage('sendDeletedPage')
  sendDeletedPage(socket, data: any) {
    socket.join(`document-room-${data.roomId}`);
    const { pageDeleted, undoSignal } = data;
    socket.to(`document-room-${data.roomId}`).emit('deletedPageUpdated', { pageDeleted, undoSignal });
  }

  @UseGuards(WSAttachUserGuard)
  @SubscribeMessage('sendEmailCommentDoc')
  async sendEmailCommentDoc(socket, data: any) {
    const {
      commenter, comment, documentId,
    } = data;
    const [, commenterInfo, document] = await Promise.all([
      this.userService.findUserById(socket.user._id),
      this.userService.findUserById(commenter.id),
      this.documentService.findOneById(documentId),
    ]);
    const ownerDocument = await this.userService.findUserById(document.ownerId);
    if (ownerDocument) {
      const currentDate = new Date();
      const convertDate = moment(currentDate.toISOString()).utcOffset(ownerDocument.timezoneOffset - currentDate.getTimezoneOffset(), true);
      const notification = {
        actor: {
          actorId: commenter.name === 'Anonymous' ? null : commenter.id,
          type: 'user',
          actorName: commenter.name === 'Anonymous' ? 'Someone' : commenter.name,
          avatarRemoteId: commenterInfo.avatarRemoteId,
        },
        actionType: NotiComment.CREATE,
        notificationType: 'CommentNotification',
        entity: {
          entityId: documentId,
          type: 'document',
          entityName: document.name,
        },
      };
      this.notificationService.createUsersNotifications(notification, [document.ownerId]);
      const desktopPath = `/viewer/${documentId}`;
      this.emailService.sendEmailHOF(EMAIL_TYPE.COMMENT_EMAIL, [ownerDocument.email], {
        name: ownerDocument.name,
        commenterName: commenter.name,
        documentId,
        documentName: document.name,
        comments: [{
          userName: commenter.name,
          time: convertDate.utc(),
          comment: comment.replace(/@\[([^\]]+)\]/g, '$1'),
        }],
        subject: `${commenter.name} added a comment to your document ${document.name}`,
        documentDeeplink: this.emailService.generateDeeplinkForEmail('/email-document-comment', desktopPath),
      });

      // send out-app noti for mobile
      const { notificationContent, notificationData } = notiFirebaseCommentFactory.create(NotiComment.CREATE, {
        document,
        annotationTypeShowed: 'comment',
        actor: commenter,
      });
      this.notificationService.publishFirebaseNotifications([document.ownerId.toHexString()], notificationContent, notificationData);
    }
  }

  @UseGuards(WSAttachUserGuard)
  @SubscribeMessage('sendEmailReplyComment')
  async sendEmailReplyComment(socket, data: any) {
    const {
      commenter,
      documentId,
      ownerComment,
      commenterEmails,
      annotation,
      replyContent,
    } = data;
    const commenterId: string = commenter.id;
    const uniqueEmails: string[] = [...new Set(commenterEmails)] as string[];
    const commenterListPromise: Promise<User>[] = uniqueEmails.map((email) => this.userService.findUserByEmail(email));
    const [
      commenterInfo,
      document,
      ownerCommentDoc,
      commenterList,
    ] = await Promise.all([
      this.userService.findUserById(commenterId),
      this.documentService.findOneById(documentId),
      this.userService.findUserByEmail(ownerComment),
      Promise.all(commenterListPromise),
    ]);
    if (ownerCommentDoc && commenter._id !== ownerCommentDoc._id) {
      this.userService.updateContactList(commenter.id, [ownerCommentDoc._id]);
    }
    const commenterIds = commenterList.filter(Boolean).map((user) => user._id);
    const filteredCommeterIds = await this.documentService.filterCommentersHavePermission(commenterIds, documentId);
    const isReplyToOwnComment = commenterInfo.email === ownerCommentDoc?.email;

    if (ownerCommentDoc && !isReplyToOwnComment) {
      const currentDate = new Date();
      const convertDate = moment(currentDate.toISOString()).utcOffset(ownerCommentDoc.timezoneOffset - currentDate.getTimezoneOffset(), true);
      const commentEmailList = new Set(annotation.comments.map((comment) => comment.email));
      const commentUserList = await this.userService.findUserByEmails([...commentEmailList] as string[]);
      const allPermissionUsersIds = await this.documentService.getUserIdsHavePermission(documentId);
      const allPermissionUsers = await this.userService.findUserByIds(allPermissionUsersIds, { name: 1, email: 1 });
      // eslint-disable-next-line prefer-regex-literals
      const findEmailRegex = new RegExp(/@[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/, 'gi');
      const replaceEmailToName = (email) => {
        const mentionedUser = allPermissionUsers.find((user) => user.email === email.substring(1));
        if (mentionedUser) {
          return `<b style="color:#F2385A">@${mentionedUser.name}</b>`;
        }
        return email;
      };
      const replyComments = annotation.comments.map((comment) => ({
        userName: commentUserList.find((user) => user.email === comment.email)?.name || comment.email,
        time: moment(comment.time).utcOffset(ownerCommentDoc.timezoneOffset, true),
        comment: comment?.content ? comment.content.replace(/@\[([^\]]+)\]/g, '<span>$1</span>').replace(findEmailRegex, replaceEmailToName) : '',
      }));

      replyComments.push({
        userName: commenter.name,
        time: convertDate.utc(),
        comment: replyContent.replace(/@\[([^\]]+)\]/g, '<span>$1</span>').replace(findEmailRegex, replaceEmailToName),
      });

      const desktopPath = `/viewer/${documentId}`;
      this.emailService.sendEmailHOF(EMAIL_TYPE.REPLY_COMMENT, [ownerCommentDoc.email], {
        name: ownerCommentDoc.name,
        commenterName: commenter.name,
        documentId,
        documentName: document.name,
        comments: replyComments,
        time: convertDate.utc(),
        subject: `${commenter.name} replied to your comment on ${document.name}`,
        documentDeeplink: this.emailService.generateDeeplinkForEmail('/email-document-reply', desktopPath),
      });
    }

    if (filteredCommeterIds.length > 0) {
      const notifications = {
        actor: {
          actorId: commenterId,
          type: 'user',
          actorName: commenter.name,
          avatarRemoteId: commenterInfo.avatarRemoteId,
        },
        actionType: NotiComment.REPLY,
        notificationType: 'CommentNotification',
        entity: {
          entityId: documentId,
          type: 'document',
          entityName: document.name,
        },
        target: {
          targetId: ownerCommentDoc?._id,
          type: 'user',
          targetName: ownerCommentDoc?.name || 'Anonymous',
        },
      };
      this.notificationService.createUsersNotifications(notifications, filteredCommeterIds);

      // send out-app noti for mobile
      const { notificationContent, notificationData, notificationContentForTargetUser } = notiFirebaseCommentFactory.create(NotiComment.REPLY, {
        document,
        actor: commenter,
        annotationTypeShowed: 'comment',
      });
      this.notificationService.publishFirebaseNotifications(
        [ownerCommentDoc?._id],
        notificationContent,
        notificationData,
      );

      this.notificationService.publishFirebaseNotifications(
        filteredCommeterIds.filter((cId) => cId !== ownerCommentDoc?._id),
        notificationContentForTargetUser,
        notificationData,
      );
    }
  }

  @UseGuards(WSAttachUserGuard)
  @SubscribeMessage('sendMentionEmail')
  async sendMentionEmail(socket, data: any) {
    const {
      commenter, comment, documentId, taggedUsers: taggedEmails = [],
    } = data;
    const commnterInfo = await this.userService.findUserById(commenter.id);
    const document = await this.documentService.findOneById(documentId);
    const ownerDocument = await this.userService.findUserById(document.ownerId);
    const currentDate = new Date();
    const convertDate = moment(currentDate.toISOString()).utcOffset(ownerDocument.timezoneOffset - currentDate.getTimezoneOffset(), true);
    const mentionData = {
      userName: commenter.name,
      time: convertDate.utc(),
      comment: Utils.breakNonLuminUrls(comment.replace(/@\[([^\]]+)\]/g, '<span>$1</span>')),
    };

    if (taggedEmails.length > 0) {
      const notification = {
        actor: {
          actorId: commenter.id,
          type: 'user',
          avatarRemoteId: commnterInfo.avatarRemoteId,
          actorName: commenter.name,
        },
        actionType: NotiComment.MENTION,
        notificationType: 'CommentNotification',
        entity: {
          entityId: documentId,
          type: 'document',
          entityName: document.name,
        },
      };
      const taggedUsers = await this.userService.findUserByEmails(taggedEmails);

      const listUserId = taggedUsers.map((user) => user._id);
      await this.userService.updateContactList(commnterInfo._id, listUserId);
      const receiveIds = [];
      const documentPermissions = await this.documentService.getDocumentPermissionsByDocId(documentId);

      // send out-app noti for mobile
      const { notificationContent, notificationData } = notiFirebaseCommentFactory.create(NotiComment.MENTION, {
        document,
        annotationTypeShowed: 'comment',
        actor: commenter,
      });
      this.notificationService.publishFirebaseNotifications(listUserId, notificationContent, notificationData);

      /* org/team permission */
      const ownerPermission = documentPermissions.find((doc) => [
        DocumentRoleEnum.TEAM,
        DocumentRoleEnum.ORGANIZATION_TEAM,
        DocumentRoleEnum.ORGANIZATION,
      ].includes(doc.role as DocumentRoleEnum));

      if (ownerPermission) {
        const listMemberReceiveNoti = [];
        switch (ownerPermission.role) {
          case DocumentRoleEnum.ORGANIZATION: {
            const orgId = ownerPermission.refId;
            const orgMembers = await this.organizationService.getOrgMembershipByConditions({
              conditions: {
                orgId,
                userId: {
                  $in: listUserId,
                },
              },
              projection: { userId: 1 },
            });
            listMemberReceiveNoti.push(...orgMembers);
            break;
          }
          case DocumentRoleEnum.TEAM:
          case DocumentRoleEnum.ORGANIZATION_TEAM: {
            const teamId = ownerPermission.refId;
            const memberTeamIds = await this.membershipService.find(
              {
                teamId,
                userId: {
                  $in: listUserId,
                },
              },
              {},
              { userId: 1 },
            );
            listMemberReceiveNoti.push(...memberTeamIds);
            break;
          }
          default:
            break;
        }
        receiveIds.push(...listMemberReceiveNoti.map(({ userId }) => userId));
      }

      /* personal document */
      listUserId.forEach((userId) => {
        const userHasPermission = documentPermissions.find((doc) => doc.refId.toString() === userId.toString());
        if (userHasPermission) {
          receiveIds.push(userId);
        }
      });

      this.notificationService.createUsersNotifications(notification, receiveIds);
      const taggedUsersData = taggedUsers.map((user) => [user.email, user.name] as [string, string]);
      const taggedUserFormat = Object.fromEntries(taggedUsersData);
      const desktopPath = `/viewer/${documentId}`;
      taggedEmails.forEach((email) => {
        this.emailService.sendEmailHOF(EMAIL_TYPE.MENTION_EMAIL, [email], {
          name: taggedUserFormat[email],
          commenterName: commenter.name,
          documentId,
          documentName: document.name,
          time: convertDate.utc(),
          subject: `${commenter.name} mentioned you in the document ${document.name}`,
          comments: [mentionData],
          documentDeeplink: this.emailService.generateDeeplinkForEmail('/email-document-mention', desktopPath),
        }).catch((error) => {
          this.loggerService.error({
            error,
            context: 'sendMentionEmail',
          });
        });
      });
    }
  }

  @UseGuards(WSAttachUserGuard)
  @SubscribeMessage('deleteCommentNoti')
  deleteCommentNoti(socket, data: DeleteCommentNotiData[]) {
    if (!data?.length) {
      return;
    }
    data.forEach(async (subData) => {
      const { ownerCommentEmail, documentId, actorId } = subData;
      if (!ownerCommentEmail) {
        return;
      }
      const actor = await this.userService.findUserById(actorId, {
        _id: 1,
        avatarRemoteId: 1,
        name: 1,
      });
      const ownerComentInfo = await this.userService.findUserByEmail(ownerCommentEmail);
      const document = await this.documentService.findOneById(documentId);
      const receiveIds = [ownerComentInfo._id];
      const notification = {
        actor: {
          actorId: actor._id,
          type: 'user',
          avatarRemoteId: actor.avatarRemoteId,
          actorName: actor.name,
        },
        actionType: NotiComment.DELETE,
        notificationType: 'CommentNotification',
        entity: {
          entityId: documentId,
          type: 'document',
          entityName: document.name,
        },
      };
      await this.notificationService.createUsersNotifications(notification, receiveIds);

      // send out-app noti for mobile
      const { notificationContent, notificationData } = notiFirebaseCommentFactory.create(NotiComment.DELETE, {
        document,
        annotationTypeShowed: 'comment',
        actor,
      });
      this.notificationService.publishFirebaseNotifications(receiveIds, notificationContent, notificationData);
    });
  }

  @WSGuestLevelGuard(
    TeamRoles.OWNER,
    TeamRoles.ADMIN,
    IndividualRoles.OWNER,
    IndividualRoles.SHARER,
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.SHARER,
    OrgTeamDocumentRoles.SHARER,
  )
  @SubscribeMessage('sharePermission')
  updateUserPermission(socket, data: any) {
    const {
      type, totalSharedList = 0, linkType, id: userId, documentId, role, emails,
    } = data;

    const currentRoom = `document-room-${documentId}`;

    socket.join(currentRoom);
    switch (type) {
      case 'ADD':
        socket.nsp.in(currentRoom).emit(
          `addToShareList-${documentId}`,
          { emails, role, totalSharedList },
        );
        break;
      case 'UPDATE':
        if (role !== 'OWNER') {
          socket.nsp.in(currentRoom).emit(
            `updatePermission-${documentId}`,
            { userId, role },
          );
        }
        break;
      case 'DELETE':
        socket.nsp.in(currentRoom).emit(
          `removeFromShareList-${documentId}`,
          { userId, linkType, totalSharedList },
        );
        break;
      default:
        break;
    }
  }

  @UseGuards(WSAttachUserGuard)
  @SubscribeMessage('removeDocument')
  removeDocument(socket, data: any) {
    socket.join(`document-room-${data.documentId}`);
    socket.to(`document-room-${data.documentId}`).emit(`removeDocument-${data.documentId}`, { userId: data.userId, type: data.type });
  }

  @SubscribeMessage('startMergingDocument')
  startMergingDocument(@ConnectedSocket() socket: ISocket, @MessageBody() data: {
    userId: string;
    documentId: string;
  }) {
    const { userId, documentId } = data;
    socket.to(SocketRoomGetter.document(documentId)).emit(`startMergingDocument-${documentId}`, { userId });
  }

  @SubscribeMessage('mergedDocument')
  mergedDocument(@ConnectedSocket() socket: ISocket, @MessageBody() data: {
    userId: string;
    documentId: string;
    totalPages: number;
  }) {
    const { userId, documentId, totalPages } = data;
    socket.to(SocketRoomGetter.document(documentId)).emit(`mergedDocument-${documentId}`, { userId, totalPages });
  }

  @WSGuestLevelGuard(
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
  )
  @SubscribeMessage('cancelSyncSession')
  cancelSyncSession(socket, data: CancelSyncSessionData) {
    const { documentId } = data;
    this.documentSyncService.clearDocumentSyncStatus(documentId, socket.id);
  }

  @WSGuestLevelGuard(
    TeamRoles.ALL,
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
  )
  @SubscribeMessage(SocketMessage.UPDATED_TEXT_CONTENT)
  async updatedTextContent(
    @MessageBody()
      data: {
        documentId: string;
        isAppliedOCR?: boolean;
        status?: DocumentSyncStatus;
        increaseVersion?: boolean;
      },
    @ConnectedSocket() socket: ISocket,
  ): Promise<void> {
    const {
      documentId, isAppliedOCR = false, status, increaseVersion = false,
    } = data;

    if (status === DocumentSyncStatus.FAILED) {
      await this.documentSyncService.removePreparedSyncStatus(documentId, socket.id);
    }

    const document = await this.documentService.findOneById(documentId, { service: 1, remoteId: 1, metadata: 1 });

    if (!document) {
      throw WsErrorException.NotFound(`Document ${documentId} not found`);
    }
    let documentETag: string = '';
    if (document.service === DocumentStorageEnum.S3) {
      documentETag = await this.documentService.getDocumentETag(document.remoteId);
    }

    if ([DocumentSyncStatus.PREPARING, DocumentSyncStatus.SYNCING].includes(status)) {
      /**
       * Store the sync status in the socket object to clear it when the user disconnects
       */
      socket.syncStatus = {
        status,
        documentId,
      };
      await this.documentSyncService.pushSyncStatusToQueue(documentId, socket.id, { status, etag: documentETag });
    }

    const { isSyncing } = await this.documentSyncService.checkDocumentSyncStatus(documentId);

    this.documentSyncService.publishSyncStatusToAllSessions(socket.id, {
      documentId,
      documentService: document.service as DocumentStorageEnum,
      remoteId: document.remoteId,
    }, {
      isSyncing, status, increaseVersion, etag: documentETag,
    });

    if (isAppliedOCR) {
      if (!document.metadata?.hasAppliedOCR) {
        await this.documentService.updateDocument(documentId, { 'metadata.hasAppliedOCR': true });
      }
    }
  }

  @UseGuards(WSAttachUserGuard)
  @SubscribeMessage('deleteTeam')
  async deleteTeam(socket, data: DeleteTeamData) {
    const {
      team, type, documents, members, targetOrgId, targetOrgUrl,
    } = data;
    const actorInfo = await this.userService.findUserById(socket.user._id, { name: 1 });
    documents.forEach((documentId) => {
      socket.join(`document-room-${documentId}`);
      socket.to(`document-room-${documentId}`).emit(`removeDocument-${documentId}`, { type: SOCKET_EMIT_TYPE.DELETE });
      socket.to(`document-room-${documentId}`).emit('deleteTeam', { type, members });
    });
    members.forEach((memberId) => {
      socket.join(`user-room-${memberId}`);
      socket.to(`user-room-${memberId}`).emit('updateTeam', {
        teamId: team._id,
        type,
        targetOrgId,
        targetOrgUrl,
        actorName: actorInfo.name,
        actorId: socket.user._id,
        teamName: team.name,
      });
      socket.leave(`user-room-${memberId}`);
    });
  }

  @UseGuards(WSAttachUserGuard)
  @SubscribeMessage('removeTeamMember')
  async removeTeamMember(socket, data: any) {
    const documentPermission = await this.documentService.getDocumentPermission(data.teamId, {});
    const documentPermissionFormat = documentPermission.map((permission) => permission.documentId);
    const [documents, actorInfo, team] = await Promise.all([
      this.documentService.findDocumentsByIds(documentPermissionFormat),
      this.userService.findUserById(socket.user._id, { name: 1 }),
      this.teamService.findOneById(data.teamId),
    ]);
    documents.forEach((document) => {
      socket.join(`document-room-${document._id}`);
      socket.to(`document-room-${document._id}`).emit('removeTeamMember', { userId: data.userId });
    });
    socket.join(`user-room-${data.userId}`);
    socket.to(`user-room-${data.userId}`).emit('updateTeam', {
      ...data,
      actorName: actorInfo.name,
      teamName: team.name,
    });
  }

  @UseGuards(WSAttachUserGuard)
  @SubscribeMessage('removeOrgMember')
  async removeOrgMember(socket, data: any) {
    const documentPermission = await this.documentService.getDocumentPermission(data.orgId, {});
    if (documentPermission.length > 500) {
      this.loggerService.info({
        context: 'removeOrgMember-countDocuments',
        extraInfo: {
          orgId: data.orgId,
          count: documentPermission.length,
        },
      });
    }
    const orgInfo = await this.organizationService.getOrgById(data.orgId, { name: 1 });
    const actorInfo = await this.userService.findUserById(socket.user._id, { name: 1 });
    const documentPermissionFormat = documentPermission.map((permission) => permission.documentId);
    const documents = await this.documentService.findDocumentsByIds(documentPermissionFormat);
    documents.forEach((document) => {
      socket.join(`document-room-${document._id}`);
      socket.to(`document-room-${document._id}`).emit('removeOrgMember', {
        actorName: actorInfo.name, orgName: orgInfo.name, userId: data.userId, userType: data.userType,
      });
    });
  }

  @WSPersonalLevelGuard(
    TeamRoles.OWNER,
    TeamRoles.ADMIN,
    TeamRoles.MODERATOR,
    IndividualRoles.OWNER,
    IndividualRoles.SHARER,
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.SHARER,
  )
  @SubscribeMessage('changeShareSetting')
  turnOffShareLink(socket, data: any) {
    const { invited, role } = data;
    socket.join(`document-room-${data.documentId}`);
    socket.nsp.in(`document-room-${data.documentId}`).emit('changeShareSetting', { invited, role });
  }

  @UseGuards(WSMembershipPermissionGuard)
  @UseGuards(WSAttachUserGuard)
  @AcceptancePermissions(TeamRoles.OWNER, TeamRoles.ADMIN)
  @SubscribeMessage('changeTeamRole')
  async changeTeamRole(socket, data: any) {
    const documentPermission = await this.documentService.getDocumentPermission(data.teamId, {});
    if (documentPermission.length > 500) {
      this.loggerService.info({
        context: 'changeTeamRole-countDocuments',
        extraInfo: {
          teamId: data.teamId,
          count: documentPermission.length,
        },
      });
    }
    const documentPermissionFormat = documentPermission.map((permission) => permission.documentId);
    const documents = await this.documentService.findDocumentsByIds(documentPermissionFormat);
    documents.forEach((document) => {
      socket.join(`document-room-${document._id}`);
      socket.to(`document-room-${document._id}`).emit('changeTeamRole', { userId: data.userId, role: data.role });
    });
  }

  @UseGuards(WSOwnerPermissionGuard)
  @UseGuards(WSAttachUserGuard)
  @SubscribeMessage('addNewSignature')
  async addNewSignature(socket, data: any) {
    const {
      _id: userId, signedUrl, isMobile, encodeSignature, signatureId,
    } = data;

    const { user, decodedData, errorCode = '' } = await this.userService.addNewSignature({
      userId,
      isMobile,
      encodeSignature,
    });
    const { signatureRemoteId: remoteId } = decodedData;
    const emitData = {
      user,
      newSignature: {},
      errorCode: '',
    };

    if (errorCode !== ErrorCode.User.EXCEEDED_LIMIT_CREATE_SIGNATURE) {
      Object.assign(emitData, {
        newSignature: {
          remoteId,
          signedUrl,
          id: signatureId,
        },
      });
    } else {
      Object.assign(emitData, {
        errorCode: ErrorCode.User.EXCEEDED_LIMIT_CREATE_SIGNATURE,
      });
    }
    const roomId = SocketRoomGetter.user(userId);
    socket.to(roomId).emit(`addNewSignature-${userId}`, emitData);
    return {
      newSignature: emitData.newSignature,
    };
  }

  @UseGuards(WSAttachUserGuard)
  @SubscribeMessage('idleUser')
  async addIdleUser(socket: ISocket, data: {
    user: {
      isActive: boolean;
    };
    documentId: string;
  }) {
    const { user, documentId } = data;
    if (socket.data.user && user) {
      socket.data.user.isActive = user.isActive;
    }
    socket.join(SocketRoomGetter.document(documentId));
    socket.join(SocketRoomGetter.document(documentId));
    const sockets = await socket.nsp.in(SocketRoomGetter.document(documentId)).fetchSockets();
    const updateMembers = sockets.map((socketInstance) => socketInstance.data.user);
    if (sockets.some(({ id }) => id !== socket.id)) {
      socket.to(SocketRoomGetter.document(documentId)).emit('onlineMembers', { members: updateMembers });
    }
  }

  @UseGuards(WSOwnerPermissionGuard)
  @UseGuards(WSAttachUserGuard)
  @SubscribeMessage('addUserToRoom')
  async addUserToRoom(socket, data) {
    const user = await this.userService.findUserById(data.userId);
    if (user) {
      socket.join(`user-room-${data.userId}`);
      socket.join(`user-room-${socket.user.sessionId}`);
      socket.join(`user-room-${user.emailDomain}`);
    }
  }

  @UseGuards(WSAttachUserGuard)
  @SubscribeMessage('joinRoom')
  joinRoom(socket) {
    if (socket.user) {
      socket.join(`user-room-${socket.user._id}`);
      socket.join(`user-room-${socket.user.sessionId}`);
    }
    if (socket.anonymousUserId) {
      socket.join(`user-room-${socket.anonymousUserId}`);
    }
  }

  @UseGuards(WSAttachUserGuard)
  @SubscribeMessage('enableGoogleSignInSuccess')
  enableGoogleSignInSuccess(socket) {
    if (socket.user) {
      socket.join(`${SOCKET_NAMESPACE.USER_ROOM}-${socket.user._id}`);
      socket.to(`${SOCKET_NAMESPACE.USER_ROOM}-${socket.user._id}`).emit(SOCKET_MESSAGE.ENABLE_GOOGLE_SIGN_IN_SUCCESS);
    }
  }

  @WSGuestLevelGuard(
    OrganizationDocumentRoles.ALL,
    TeamRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @SubscribeMessage(SOCKET_ON.JOIN_TO_ORG_ROOM)
  async joinToOrgRoom(socket, data) {
    const [documentPermission] = await this.documentService.getDocumentPermissionsByDocId(data.documentId, { role: 'organization' });
    if (documentPermission) {
      socket.join(`${SOCKET_NAMESPACE.ORG_ROOM}-${documentPermission.refId}`);
    }
  }

  @UseGuards(WSOwnerPermissionGuard)
  @UseGuards(WSAttachUserGuard)
  @SubscribeMessage('forceLogout')
  forceLogout(socket, data) {
    socket.join(`user-room-${data.userId}`);
    socket.to(`user-room-${data.userId}`).emit('forceLogout', data.userId);
  }

  @SubscribeMessage('resetPassword')
  resetPassword(socket, data) {
    const user = this.jwtService.verify(data.token);
    socket.join(`user-room-${user._id}`);
    socket.to(`user-room-${user._id}`).emit('forceLogout', user._id);
  }

  @UseGuards(WSAttachUserGuard)
  @SubscribeMessage('conversion')
  conversion(socket, data) {
    const { fileName } = data;
    socket.join(`conversion-${fileName}`);
  }

  @WSGuestLevelGuard(
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.OWNER,
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
  )
  @SubscribeMessage('ocr')
  handleOCR(socket, data) {
    const { fileName } = data;
    socket.join(`ocr-${fileName}`);
  }

  @WSGuestLevelGuard(
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.OWNER,
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
  )
  @SubscribeMessage('cancelOcr')
  handleCancelOCR(socket: ISocket, data: { fileName: string }) {
    const { fileName } = data;
    socket.leave(`ocr-${fileName}`);
  }

  @SubscribeMessage('userSignIn')
  userSignIn(socket) {
    socket.to(`user-room-${socket.anonymousUserId}`).emit(SOCKET_MESSAGE.FORCE_RELOAD);
  }

  @WSGuestLevelGuard(
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.OWNER,
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
  )
  @SubscribeMessage('outlinesChanged')
  async outlinesChanged(socket, data: OutlinesChangedData) {
    const { roomId: documentId, data: input } = data;
    try {
      const document = await this.documentOutlineService.getDocumentByDocumentId(documentId, { 'metadata.hasOutlines': 1 });
      if (!document.metadata?.hasOutlines) {
        return;
      }

      const outlinesChangedData = await this.documentOutlineService.updateDocumentOutlines(documentId, input);
      const onlineMembers = await socket.nsp.in(SocketRoomGetter.document(documentId)).fetchSockets();
      const otherOnlineMembers = onlineMembers.filter(({ id }) => id !== socket.id);
      if (otherOnlineMembers.length > 0) {
        socket.to(SocketRoomGetter.document(documentId)).emit(SOCKET_MESSAGE.OUTLINES_UPDATED, outlinesChangedData);
      }
    } catch (error) {
      this.loggerService.error({
        error,
        context: this.outlinesChanged.name,
      });
    }
  }

  @WSGuestLevelGuard(
    OrganizationDocumentRoles.OWNER,
    OrganizationDocumentRoles.EDITOR,
    OrganizationDocumentRoles.SHARER,
    IndividualRoles.OWNER,
    IndividualRoles.EDITOR,
    IndividualRoles.SHARER,
    OrgTeamDocumentRoles.OWNER,
    OrgTeamDocumentRoles.EDITOR,
    OrgTeamDocumentRoles.SHARER,
  )
  @SubscribeMessage('restoreDocument')
  async restoreDocument(socket, { _id: documentId }: {_id: string }) {
    const { _id: userId } = socket.user;
    const document = await this.documentService.findOneById(documentId);
    this.documentService.sendRestoreDocNotiToMembers({ userId, document, isRestoreOriginal: false });
    if (!document?.remoteId) {
      this.loggerService.debug('Document has no remoteId', {
        context: this.restoreDocument.name,
        extraInfo: {
          documentId,
        },
      });
      return;
    }
    this.documentSyncService.publishSyncStatusToAllSessions(socket.id, {
      documentId: document._id,
      documentService: document.service as DocumentStorageEnum,
      remoteId: document.remoteId,
    }, { increaseVersion: true, isSyncing: false, status: DocumentSyncStatus.SUCCESS });
  }
}
