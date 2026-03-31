/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { isPlainObject, unescape, upperFirst } from 'lodash';

import { Utils } from 'Common/utils/Utils';

import { ITotalDailyNewResource } from 'Dashboard/interfaces/dashboard.interface';
import { DocumentOwnerTypeEnum, DocumentRoleEnum, DocumentWorkspace } from 'Document/document.enum';
import {
  AdminActionEvent,
  AdminEventNameType,
  DocumentEventNames,
  EventScopes,
  EventScopeType,
  NonDocumentEventNames,
  OrgActionEvent,
  PlanActionEvent,
  UserActionEvent,
  CommunityTemplateActionEvent,
  TemplateCategoryActionEvent,
} from 'Event/enums/event.enum';
import {
  ICreateEventInput, IElasticSearchResult, IEventBody, IEventDocument, IEventUser,
} from 'Event/interfaces/event.interface';
import { AdminEventType } from 'graphql.schema';
import { PaymentTypeEnums } from 'Payment/payment.enum';

export class ElasticsearchUtil {
  public static transformObjectKeys(data: any, transformMethod: (key: string) => string, shouldTransformId?: boolean): any {
    // Check if data is a plain object
    if (!isPlainObject(data)) return data;
    const originalObjectId = data._id;
    // Disable transform _id if shouldTransformId is a falsy value
    if (originalObjectId && !shouldTransformId) {
      delete data._id;
    }
    const transformedObject: Record<string, unknown> = Object.entries(data).reduce((prevObject, [key, value]) => {
      if (value instanceof Array) {
        value = value.map((element) => ElasticsearchUtil.transformObjectKeys(element, transformMethod, shouldTransformId));
      } else if (value && typeof value === 'object') {
        value = ElasticsearchUtil.transformObjectKeys(value, transformMethod, shouldTransformId);
      }
      const newKey = transformMethod(key);
      return {
        ...prevObject,
        [newKey]: value,
      };
    }, {});
    if (originalObjectId) {
      const transformedObjectIdKey = !shouldTransformId ? '_id' : 'id';
      transformedObject[transformedObjectIdKey] = originalObjectId;
    }
    return transformedObject;
  }

  public static convertToCamelCase(data: Record<string, unknown>, shouldTransformId?: boolean): any {
    return ElasticsearchUtil.transformObjectKeys(
      data,
      (key) => key.replace(/(_\w)/g, (k) => k[1].toUpperCase()),
      shouldTransformId,
    );
  }

  public static convertToSnakeCase(data: Record<string, unknown>): unknown {
    const result = ElasticsearchUtil.transformObjectKeys(
      data,
      (key) => key.replace(/[A-Z]/g, (k) => `_${k.toLowerCase()}`),
    );
    return result;
  }

  public static extractEventBody(eventResponse: IElasticSearchResult[]): Record<string, any>[] {
    return eventResponse.map((record) => {
      const eventRecord = ElasticsearchUtil.convertToCamelCase({
        _id: record._id,
        ...record._source,
      });
      return eventRecord;
    });
  }

  public static extractCommentEventList(data: any[]): IEventBody[] {
    return data.map((item) => {
      const eventResponse = item.deduplicated_event;
      return ElasticsearchUtil.extractEventBody(eventResponse.hits.hits)[0] as IEventBody;
    });
  }

  public static getMonthlyDerivativeRate(lastMonthTotal: number, currentMonthTotal: number, derivativeNumber: number): number {
    let derivativeRate: number;
    if (lastMonthTotal === 0) {
      derivativeRate = currentMonthTotal ? 1 : 0;
    } else {
      derivativeRate = derivativeNumber / lastMonthTotal;
    }
    return derivativeRate;
  }

  public static createInitialDocumentEventBody(
    eventData: ICreateEventInput,
  ): IEventBody {
    const {
      eventName,
      actor,
      target,
      document,
      documentComment,
      annotationData,
      nonLuminEmail,
      sourceAction,
      template,
    } = eventData;
    // Init required properties of event body
    const eventBody: IEventBody = {
      eventName,
      eventTime: new Date(),
      actor: <IEventUser>{
        _id: actor._id,
        name: actor.name,
        email: actor.email,
        avatarRemoteId: actor.avatarRemoteId,
      },
      document: <IEventDocument>{
        _id: document._id,
        name: document.name,
        s3RemoteId: document.remoteId,
      },
    };

    if (sourceAction) {
      eventBody.sourceAction = sourceAction;
    }
    let targetInfo: IEventUser;
    if (target) {
      targetInfo = {
        _id: target._id,
        name: target.name,
        email: target.email,
        avatarRemoteId: target.avatarRemoteId,
      };
    }
    if (nonLuminEmail) {
      targetInfo = { email: nonLuminEmail };
    }
    if (targetInfo) {
      eventBody.target = targetInfo;
    }
    // Add more event properties based on event name
    switch (eventName) {
      case DocumentEventNames.DOCUMENT_COMMENTED:
      case DocumentEventNames.COMMENT_REPLIED:
      case DocumentEventNames.COMMENT_MENTIONED: {
        eventBody.document.comment = {
          ...documentComment,
          content: unescape(documentComment.content),
        };
        break;
      }
      case DocumentEventNames.DOCUMENT_ANNOTATED:
      case DocumentEventNames.DOCUMENT_SIGNED:
        eventBody.document.annotation = annotationData;
        break;
      case DocumentEventNames.TEMPLATE_USED:
        eventBody.template = {
          luminDocumentformId: template._id,
          prismicId: template.prismicId,
          url: template.url,
          prismicCategories: template.categories,
          s3RemoteId: template.remoteId,
        };
        break;
      default:
        break;
    }
    return eventBody;
  }

  public static createInitialNonDocumentEventBody(eventData: ICreateEventInput): IEventBody {
    const {
      eventName,
      actor,
      target,
      nonLuminEmail,
      actorModification,
      transactionalEmail,
      sourceAction,
    } = eventData;
    // Init required properties of event body
    const eventBody: IEventBody = {
      eventName,
      eventTime: new Date(),
    };
    if (actor) {
      eventBody.actor = <IEventUser>{
        _id: actor._id,
        name: actor.name,
        email: actor.email,
        avatarRemoteId: actor.avatarRemoteId,
      };
    }
    if (sourceAction) {
      eventBody.sourceAction = sourceAction;
    }
    // Add more event properties based on event name
    switch (eventName) {
      case NonDocumentEventNames.TEAM_MEMBER_ADDED:
      case NonDocumentEventNames.TEAM_MEMBER_REMOVED:
      case NonDocumentEventNames.TEAM_MEMBER_ROLE_CHANGED:
      case NonDocumentEventNames.TEAM_OWNERSHIP_TRANSFERED:
      case NonDocumentEventNames.ORG_MEMBER_ADDED: {
        let targetInfo: IEventUser;
        if (target) {
          targetInfo = {
            _id: target._id,
            name: target.name,
            email: target.email,
            avatarRemoteId: target.avatarRemoteId,
          };
        } else {
          targetInfo = { email: nonLuminEmail };
        }
        eventBody.target = targetInfo;
        break;
      }
      case NonDocumentEventNames.TRANSACTIONAL_EMAIL_SENT: {
        if (target) {
          eventBody.target = {
            email: target.email,
            transactionalEmail,
          };
        }
        break;
      }
      case NonDocumentEventNames.PERSONAL_PLAN_CHANGED:
      case NonDocumentEventNames.PERSONAL_PLAN_RENEWED:
      case NonDocumentEventNames.PERSONAL_PLAN_CANCELED: {
        eventBody.actor.modification = actorModification;
        break;
      }
      default:
        break;
    }
    return eventBody;
  }

  static getStandardText(text: string) : string {
    return upperFirst(text.toLowerCase());
  }

  static getDocumentTypeText(event: IEventBody) : string {
    let type = DocumentOwnerTypeEnum.PERSONAL;
    if (event.team?._id) {
      type = DocumentOwnerTypeEnum.TEAM;
    }
    if (event.organization?._id) {
      type = DocumentOwnerTypeEnum.ORGANIZATION;
    }
    return ElasticsearchUtil.getStandardText(type);
  }

  static getDocumentScopeByRole(roleOfDocument: DocumentRoleEnum, workspace?: DocumentWorkspace): EventScopeType {
    if (roleOfDocument === DocumentRoleEnum.OWNER && workspace === DocumentWorkspace.ORGANIZATION) {
      return EventScopes.ORGANIZATION;
    }
    let documentScope: EventScopeType;
    switch (roleOfDocument) {
      case DocumentRoleEnum.OWNER:
      case DocumentRoleEnum.EDITOR:
      case DocumentRoleEnum.VIEWER:
      case DocumentRoleEnum.SPECTATOR:
        documentScope = EventScopes.PERSONAL;
        break;
      case DocumentRoleEnum.TEAM:
      case DocumentRoleEnum.ORGANIZATION_TEAM:
        documentScope = EventScopes.TEAM;
        break;
      case DocumentRoleEnum.ORGANIZATION:
        documentScope = EventScopes.ORGANIZATION;
        break;
      default:
        break;
    }
    return documentScope;
  }

  static mapDocumentOwnerTypeToScope(documentOwnerType: DocumentOwnerTypeEnum): EventScopeType {
    let documentScope: EventScopeType;
    switch (documentOwnerType) {
      case DocumentOwnerTypeEnum.PERSONAL:
        documentScope = EventScopes.PERSONAL;
        break;
      case DocumentOwnerTypeEnum.TEAM:
      case DocumentOwnerTypeEnum.ORGANIZATION_TEAM:
        documentScope = EventScopes.TEAM;
        break;
      case DocumentOwnerTypeEnum.ORGANIZATION:
        documentScope = EventScopes.ORGANIZATION;
        break;
      default:
        break;
    }
    return documentScope;
  }

  static mapPaymentTypeToScope(paymentType: PaymentTypeEnums): EventScopeType {
    const mappingObject = {
      [PaymentTypeEnums.INDIVIDUAL]: EventScopes.PERSONAL,
      [PaymentTypeEnums.TEAM]: EventScopes.TEAM,
      [PaymentTypeEnums.ORGANIZATION]: EventScopes.ORGANIZATION,
    };
    return mappingObject[paymentType];
  }

  static attachCurrentDateDataToDailyStat(data: ITotalDailyNewResource[]): void {
    const today = Utils.formatDate(new Date());
    const todayNewData = data.find((document) => (
      document.date === today
    ));
    if (!todayNewData) {
      data.push({
        date: today,
        total: 0,
      });
    }
  }

  static getAdminEventType(eventName: AdminEventNameType): AdminEventType {
    let type: AdminEventType;
    if (eventName in PlanActionEvent) {
      type = AdminEventType.PAYMENT;
    }
    if (eventName in OrgActionEvent) {
      type = AdminEventType.ORGANIZATION;
    }
    if (eventName in AdminActionEvent) {
      type = AdminEventType.ADMIN;
    }
    if (eventName in UserActionEvent) {
      type = AdminEventType.USER;
    }
    if (eventName in CommunityTemplateActionEvent) {
      type = AdminEventType.COMMUNITY_TEMPLATE;
    }
    if (eventName in TemplateCategoryActionEvent) {
      type = AdminEventType.TEMPLATE_CATEGORY;
    }
    return type;
  }

  static mapAdminEventTypeToNameList(type: AdminEventType): AdminEventNameType[] {
    const mappingObject = {
      [AdminEventType.PAYMENT]: PlanActionEvent,
      [AdminEventType.ORGANIZATION]: OrgActionEvent,
      [AdminEventType.ADMIN]: AdminActionEvent,
      [AdminEventType.USER]: UserActionEvent,
      [AdminEventType.COMMUNITY_TEMPLATE]: CommunityTemplateActionEvent,
      [AdminEventType.TEMPLATE_CATEGORY]: TemplateCategoryActionEvent,
    };
    return Object.keys(mappingObject[type]) as AdminEventNameType[];
  }
}
