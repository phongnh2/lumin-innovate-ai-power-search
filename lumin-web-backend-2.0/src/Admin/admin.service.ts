/* eslint-disable global-require */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import {
  uniqBy, remove, capitalize,
  pick,
  partition,
} from 'lodash';
import * as moment from 'moment';
import {
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionType,
  QueryOptions,
  Types,
} from 'mongoose';
import Stripe from 'stripe';

import {
  RequestOrganizationConcreteBuilder,
} from 'Common/builder/RequestAccessBuilder';
import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { ActionTypeEnum, SortStrategy } from 'Common/common.enum';
import { EmailType } from 'Common/common.interface';
import { CommonConstants } from 'Common/constants/CommonConstants';
import { EMAIL_TYPE, SUBJECT } from 'Common/constants/EmailConstant';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { NotiOrg } from 'Common/constants/NotificationConstants';
import { PLAN_TEXT, PLAN_TEXT_EVENT } from 'Common/constants/PaymentConstant';
import { SOCKET_MESSAGE, SOCKET_NAMESPACE } from 'Common/constants/SocketConstants';
import {
  SUBSCRIPTION_DELETE_ADMIN,
  SUBSCRIPTION_CONVERT_TO_CUSTOM_ORGANIZATION,
  SUBSCRIPTION_CONVERT_TO_MAIN_ORGANIZATION,
  SUBSCRIPTION_PAYMENT_UPDATE,
  SUBSCRIPTION_UPDATE_ORG,
  SUBSCRIPTION_UPDATE_ADMIN_PERMISSION,
  SUBSCRIPTION_CHANGE_ADMIN_ROLE,
} from 'Common/constants/SubscriptionConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { HttpErrorException } from 'Common/errors/HttpErrorException';
import { Utils } from 'Common/utils/Utils';
import { FileData } from 'Common/validator/FileValidator/file.validator.pipe';

import { AwsService } from 'Aws/aws.service';

import { CustomRuleLoader } from 'CustomRules/custom-rule.loader';
import { RestrictedActionError } from 'CustomRules/custom-rule.service';

import { UpgradeEnterpriseStatus } from 'Admin/admin.enum';
import { AdminPaymentService } from 'Admin/admin.payment.service';
import {
  CreatedAdmin, IAdmin, IEnterpriseInvoice, ICreateEnterpriseInvoice, IAdminModel, IEnterpriseInvoiceModel,
} from 'Admin/interfaces/admin.interface';
import { APP_USER_TYPE } from 'Auth/auth.enum';
import { AuthService } from 'Auth/auth.service';
import { BlacklistActionEnum } from 'Blacklist/blacklist.enum';
import { BlacklistService } from 'Blacklist/blacklist.service';
import { IBlacklist } from 'Blacklist/interfaces/blacklist.interface';
import { BrazeService } from 'Braze/braze.service';
import { TransactionExecutor } from 'Database/transactionExecutor';
import { DocumentIndexingStatusEnum, DocumentRoleEnum, DocumentWorkspace } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { EmailService } from 'Email/email.service';
import { EnvironmentService } from 'Environment/environment.service';
import { AdminEventBuilder } from 'Event/builders/AdminEventBuilder/admin.event.builder';
import { OrganizationEventBuilder } from 'Event/builders/OrgEventBuilder/organization.event.builder';
import { UserEventBuilder } from 'Event/builders/UserEventBuilder/user.event.builder';
import {
  AdminActionEvent, EventScopes, OrgActionEvent, PlanActionEvent, SourceActions, UserActionEvent,
} from 'Event/enums/event.enum';
import { AdminEventService } from 'Event/services/admin.event.service';
import { FolderService } from 'Folder/folder.service';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import {
  AdminSortOptions,
  AdminFilterOptions,
  AdminSetRole,
  AdminRole,
  CreatePaymentLinkInput,
  CreateOrgByAdminInput,
  CancelStrategy,
  InviteToOrganizationInput,
  UserDetailPayload,
  UpdateAdminProfileInput,
  AvatarAction,
  ChangeAdminPasswordInput,
  DomainVisibilitySetting,
  HubspotDeal,
  CreateDocStackPaymentLinkInput,
  Organization,
  PreviewUserDataPayload,
  ChangeUserEmailInput,
  MergeAccountOptions,
  ChangeEmailAbility,
  SubscriptionResponse,
} from 'graphql.schema';
import { HubspotWorkspaceService } from 'Hubspot/hubspot-workspace.service';
import { HubspotService } from 'Hubspot/hubspot.service';
import { KratosService } from 'Kratos/kratos.service';
import { LoggerService } from 'Logger/Logger.service';
import { LuminContractService } from 'LuminContract/luminContract.service';
import { MembershipService } from 'Membership/membership.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { NotificationService } from 'Notication/notification.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { IRequestAccess } from 'Organization/interfaces/request.access.interface';
import {
  ConvertOrganizationToEnum, OrganizationRoleEnums, AccessTypeOrganization,
} from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { DocStackUtils } from 'Organization/utils/docStackUtils';
import { OrganizationUtils } from 'Organization/utils/organization.utils';
import {
  CollectionMethod,
  PaymentPlanEnums,
  PaymentStatusEnums,
  PaymentIntervalEnums,
  PlanCancelReason,
  PaymentCurrencyEnums,
  UpgradeInvoicePlanEnums,
  PaymentPeriodEnums,
} from 'Payment/payment.enum';
import { PaymentService } from 'Payment/payment.service';
import planPoliciesHandler from 'Payment/Policy/planPoliciesHandler';
import { PaymentUtilsService } from 'Payment/utils/payment.utils';
import { ITeam } from 'Team/interfaces/team.interface';
import { TeamService } from 'Team/team.service';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';
import { UserTrackingService } from 'UserTracking/tracking.service';

@Injectable()
export class AdminService {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    @InjectModel('Admin') private readonly adminModel: Model<IAdminModel>,
    @InjectModel('EnterpriseUpgrade') private readonly enterpriseUpgradeModel: Model<IEnterpriseInvoiceModel>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => OrganizationTeamService))
    private readonly organizationTeamService: OrganizationTeamService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => EnvironmentService))
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    @Inject(forwardRef(() => TeamService))
    private readonly teamService: TeamService,
    @Inject(forwardRef(() => MembershipService))
    private readonly membershipService: MembershipService,
    @Inject(forwardRef(() => EventsGateway))
    private readonly messageGateway: EventsGateway,
    private readonly blacklistService: BlacklistService,
    private readonly userTrackingService: UserTrackingService,
    private readonly transaction: TransactionExecutor,
    private readonly awsService: AwsService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly eventService: AdminEventService,
    private readonly hubspotService: HubspotService,
    private readonly loggerService: LoggerService,
    @Inject(forwardRef(() => AdminPaymentService))
    private readonly adminPaymentService: AdminPaymentService,
    private readonly adminEventService: AdminEventService,
    private readonly brazeService: BrazeService,
    @Inject(forwardRef(() => FolderService))
    private readonly folderService: FolderService,
    private readonly kratosService: KratosService,
    private readonly notificationService: NotificationService,
    private readonly luminContractService: LuminContractService,
    private readonly customRuleLoader: CustomRuleLoader,
    private readonly paymentUtilsService: PaymentUtilsService,
    private readonly hubspotWorkspaceService: HubspotWorkspaceService,
  ) {}

  public async findById(
    id: string,
    projection?: ProjectionType<IAdmin>,
    options?: QueryOptions<IAdmin>,
  ): Promise<IAdmin> {
    const admin = await this.adminModel.findOne({ _id: id }, projection, options).exec();
    return admin
      ? {
        ...admin.toObject(),
        _id: admin._id.toHexString(),
        comparePassword: (candidatePassword) => admin.comparePassword(candidatePassword),
      }
      : null;
  }

  public async find(filter: FilterQuery<IAdmin>, projection?: ProjectionType<IAdmin>): Promise<IAdmin[]> {
    const admins = await this.adminModel.find(filter, projection).exec();
    return admins.map((admin) => ({ ...admin.toObject(), _id: admin._id.toHexString() }));
  }

  public async findByEmail(email: string, projection?: ProjectionType<IAdmin>): Promise<IAdmin> {
    const admin = await this.adminModel.findOne({ email: email.toLowerCase() }, projection).exec();
    return admin
      ? {
        ...admin.toObject(),
        _id: admin._id.toHexString(),
        comparePassword: (candidatePassword) => admin.comparePassword(candidatePassword),
      }
      : null;
  }

  public async create(admin: CreatedAdmin): Promise<IAdmin> {
    const createdAdmin = await this.adminModel.create(admin as any);
    return { ...createdAdmin.toObject(), _id: createdAdmin._id.toHexString() };
  }

  public async findOneAndDelete(adminId: string, options?: QueryOptions<IAdmin>): Promise<IAdmin> {
    const deletedAdmin = await this.adminModel.findOneAndDelete({ _id: adminId }, options).exec();
    return deletedAdmin ? { ...deletedAdmin.toObject(), _id: deletedAdmin._id.toHexString() } : null;
  }

  public sendEmailCreatePassword(admin: IAdmin): void {
    const { _id, email } = admin;
    const tokenData = {
      email,
      _id,
    };
    const token = this.jwtService.sign(tokenData, {
      expiresIn: Number(this.environmentService.getByKey(EnvConstants.CREATE_PASSWORD_TOKEN_EXPIRE_IN)),
    });
    this.emailService.sendEmail(
      EMAIL_TYPE.ADMIN_CREATE_PASSWORD,
      [email],
      { token, email },
    );
    this.redisService.setAdminCreatePasswordToken(email, token);
  }

  public async updatePropertiesById(id: string, updateFields: Record<string, unknown>): Promise<IAdmin> {
    const updatedAdmin = await this.adminModel.findOneAndUpdate(
      { _id: id },
      { $set: { ...updateFields } },
      { new: true },
    ).exec();
    return updatedAdmin ? { ...updatedAdmin.toObject(), _id: updatedAdmin._id.toHexString() } : null;
  }

  private sortOptionsMapping(sortOptions: AdminSortOptions): Record<string, SortStrategy> {
    return Object.entries(sortOptions).reduce((prevValue, [key, value]) => ({
      ...prevValue,
      [key]: SortStrategy[value],
    }), {});
  }

  public async getAdmins({
    actor,
    searchKey = '',
    limit,
    offset,
    sortOptions,
    filterOptions,
  }: {
    actor: Record<string, any>,
    searchKey?: string,
    limit: number,
    offset: number,
    sortOptions?: AdminSortOptions,
    filterOptions?: AdminFilterOptions,
  }): Promise<[IAdmin[], number]> {
    const matchCondition = [];
    const aggregatePipeline = [];
    const roleValueBranches: any[] = [
      {
        case: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          $eq: ['$_id', new Types.ObjectId(actor._id)],
        },
        then: 0,
      },
      {
        case: {
          $eq: ['$role', AdminRole.OWNER],
        },
        then: 1,
      },
      {
        case: {
          $eq: ['$role', AdminRole.SUPER_ADMIN],
        },
        then: 2,
      },
      {
        case: { $eq: ['$role', AdminRole.ADMIN] },
        then: 3,
      },
    ];

    if (searchKey.length) {
      const searchKeyRegex = Utils.transformToSearchRegex(searchKey);
      matchCondition.push({
        $or: [
          { name: { $regex: searchKeyRegex, $options: 'i' } },
          { email: { $regex: searchKeyRegex, $options: 'i' } },
        ],
      });
    }

    if (filterOptions) {
      Object.entries(filterOptions).forEach(([key, value]) => {
        matchCondition.push({ [key]: value });
      });
    }
    if (matchCondition.length) {
      aggregatePipeline.push({ $match: { $and: matchCondition } });
    }

    const projection = {
      _id: 1,
      name: 1,
      email: 1,
      role: 1,
      timezoneOffset: 1,
      createdAt: 1,
      avatarRemoteId: 1,
      status: 1,
      roleValue: {
        $switch: {
          branches: [...roleValueBranches],
          default: -1,
        },
      },
    };

    const sortCondition = sortOptions
      ? this.sortOptionsMapping(sortOptions)
      : {
        roleValue: 1,
        createdAt: -1,
      };
    const facetStage = {
      metadata: [{ $count: 'total' }],
      adminList: [
        { $sort: sortCondition },
        { $skip: offset },
        { $limit: limit },
      ],
    };

    aggregatePipeline.push(
      { $project: projection },
      { $facet: facetStage },
    );

    const [data] = await this.adminModel.aggregate(aggregatePipeline as PipelineStage[]);
    const totalAdmin = data.metadata[0]?.total || 0;
    return [data.adminList, totalAdmin];
  }

  public async checkHigherRoleActor(actorId: string, targetId: string, allowEqual?: boolean): Promise<boolean> {
    const [actor, target] = await Promise.all([
      this.findById(actorId),
      this.findById(targetId),
    ]);
    const compareRoleResult = Utils.compareAdminRoles(actor.role, target.role);
    return allowEqual
      ? compareRoleResult !== -1
      : compareRoleResult === 1;
  }

  public async inviteAdmin({
    actorId,
    email,
    role,
  }: {
    actorId: string,
    email: string,
    role: AdminSetRole,
  }): Promise<IAdmin> {
    const [existedAdmin, actor] = await Promise.all([
      this.findByEmail(email, { _id: 1 }),
      this.findById(actorId),
    ]);
    if (existedAdmin) {
      throw GraphErrorException.BadRequest('Email already exists', ErrorCode.Admin.EMAIL_ALREADY_EXISTS);
    }
    const compareRoleResult = Utils.compareAdminRoles(actor.role, role);
    if (compareRoleResult !== 1) {
      throw GraphErrorException.Forbidden('You can\'t create a new admin with this role');
    }
    const createdAdmin = await this.create({ email, role });

    const { name: actorName, email: actorEmail, avatarRemoteId } = actor;
    const eventData = new AdminEventBuilder()
      .setName(AdminActionEvent.ADMIN_ADDED)
      .setActor({
        _id: actorId,
        name: actorName,
        email: actorEmail,
        avatarRemoteId,
      })
      .setTarget({
        _id: createdAdmin._id,
        email,
      })
      .setScope([EventScopes.ADMIN])
      .build();
    this.eventService.createEvent(eventData);
    this.sendEmailCreatePassword(createdAdmin);
    return createdAdmin;
  }

  public async resendAdminInvitation({
    actorId,
    email,
  }: {
    actorId: string,
    email: string,
  }): Promise<IAdmin> {
    const [existedAdmin, actor] = await Promise.all([
      this.findByEmail(email),
      this.findById(actorId),
    ]);
    if (!existedAdmin) {
      throw GraphErrorException.BadRequest('Invited admin not found, please invite admin first');
    }
    const compareRoleResult = Utils.compareAdminRoles(actor.role, existedAdmin.role);
    if (compareRoleResult !== 1) {
      throw GraphErrorException.Forbidden('You can\'t create a new admin with this role');
    }
    this.sendEmailCreatePassword(existedAdmin);
    return existedAdmin;
  }

  public async setAdminRole(data: { actorId: string, targetId: string, role: AdminSetRole }): Promise<{admin: IAdmin, error?: GraphErrorException}> {
    const { actorId, targetId, role } = data;
    const [actor, target] = await Promise.all([
      this.findById(actorId),
      this.findById(targetId),
    ]);
    if (target.role === role as string) {
      return {
        admin: null,
        error: GraphErrorException.Conflict('Conflict role'),
      };
    }
    const updatedAdmin = await this.updatePropertiesById(targetId, { role });

    this.publishUpdateAdminPermission(targetId, updatedAdmin, SUBSCRIPTION_CHANGE_ADMIN_ROLE);

    const eventData = new AdminEventBuilder()
      .setName(AdminActionEvent.ADMIN_CHANGE_ROLE)
      .setActor({
        _id: actorId,
        name: actor.name,
        email: actor.email,
        avatarRemoteId: actor.avatarRemoteId,
      })
      .setTarget({
        _id: targetId,
        name: target.name,
        email: target.email,
        modification: {
          adminRole: role,
        },
      })
      .setScope([EventScopes.ADMIN])
      .build();

    this.eventService.createEvent(eventData);
    return {
      admin: updatedAdmin,
    };
  }

  public async deleteOrganizationImmediately(data: {orgId: string, adminId: string, addToBlacklist?: boolean}): Promise<void> {
    const { orgId, adminId, addToBlacklist } = data;
    const isOrganizationUpgradeEnterprise = await this.organizationService.isOrganizationUpgradeEnterprise(orgId);
    if (isOrganizationUpgradeEnterprise) {
      throw GraphErrorException.BadRequest('Can not delete organization');
    }
    const [admin, organization] = await Promise.all([
      this.findById(adminId),
      this.organizationService.updateOrganizationById(orgId, { deletedAt: new Date() }),
    ]);
    await this.organizationService.deleteOrganization({ orgId, addToBlacklist, actionType: ActionTypeEnum.ADMIN_DELETE_ORG });

    const { name, email, avatarRemoteId } = admin;
    const { name: orgName, domain } = organization;
    const eventActorInfo = {
      _id: adminId,
      name,
      email,
      avatarRemoteId,
    };
    const eventOrgInfo = {
      _id: orgId,
      name: orgName,
      domain,
    };
    const eventData = new OrganizationEventBuilder()
      .setName(OrgActionEvent.ORGANIZATION_DELETED)
      .setActor({ ...eventActorInfo })
      .setOrganization({ ...eventOrgInfo })
      .setScope([EventScopes.ADMIN])
      .build();
    this.eventService.createEvent(eventData)
      .then((response) => {
        if (addToBlacklist) {
          const triggeredEventData = new OrganizationEventBuilder()
            .setName(OrgActionEvent.ORGANIZATION_BLACKLISTED)
            .setActor(eventActorInfo)
            .setOrganization({ domain })
            .setScope([EventScopes.ADMIN])
            .setSourceAction(SourceActions.ORGANIZATION_DELETED)
            .setSourceEventId(response._id as string)
            .build();
          this.eventService.createEvent(triggeredEventData);
        }
      });
  }

  async findUpgradingInvoice(orgId: string | Types.ObjectId) : Promise<IEnterpriseInvoice> {
    const upgradingInvoice = await this.enterpriseUpgradeModel.findOne({
      orgId,
      status: UpgradeEnterpriseStatus.PENDING,
    }).exec();
    return upgradingInvoice ? { ...upgradingInvoice.toObject(), _id: upgradingInvoice._id.toHexString() } : null;
  }

  async findUpgradingInvoiceById(invoiceId: string): Promise<IEnterpriseInvoice> {
    const upgradingInvoice = await this.enterpriseUpgradeModel.findOne({ invoiceId }).exec();
    return upgradingInvoice ? { ...upgradingInvoice.toObject(), _id: upgradingInvoice._id.toHexString() } : null;
  }

  async findUpgradingInvoiceByOrgId(orgId: string): Promise<IEnterpriseInvoice> {
    const upgradingInvoice = await this.enterpriseUpgradeModel.findOne({ orgId }).exec();
    return upgradingInvoice ? { ...upgradingInvoice.toObject(), _id: upgradingInvoice._id.toHexString() } : null;
  }

  async updateInvoiceStatusByOrgId(orgId: string, status: UpgradeEnterpriseStatus): Promise<IEnterpriseInvoice> {
    const invoice = await this.enterpriseUpgradeModel.findOneAndUpdate({ orgId }, { status }).exec();
    return invoice ? { ...invoice.toObject(), _id: invoice._id.toHexString() } : null;
  }

  async upsertEnterpriseInvoice(enterpriseInvoice: ICreateEnterpriseInvoice): Promise<IEnterpriseInvoice> {
    const { orgId } = enterpriseInvoice;
    const upgradedEnterprise = await this.enterpriseUpgradeModel
      .findOneAndUpdate({ orgId }, { ...enterpriseInvoice, orgId: new Types.ObjectId(orgId) }, { upsert: true, new: true })
      .exec();
    return upgradedEnterprise ? { ...upgradedEnterprise.toObject(), _id: upgradedEnterprise._id.toHexString() } : null;
  }

  removeAllOrganizationInvoices(orgId: string): Promise<any> {
    return this.enterpriseUpgradeModel.deleteMany({ orgId }).exec();
  }

  async sendEmailAfterCharge(oldOrganization: IOrganization, newOrganization: IOrganization, invoice: Stripe.Invoice): Promise<void> {
    const {
      name: orgName, _id: orgId, avatarRemoteId: orgAvatar, payment: newPayment, domain, url,
    } = newOrganization;
    const saleEmail = this.environmentService.getByKey(EnvConstants.SALE_EMAIL);
    // send email to sale
    const saleEmailType: EmailType = EMAIL_TYPE.SALE_UPGRADE_PAYMENT_LINK_SUCCESSFULLY;
    const saleEmailData = {
      subject: SUBJECT[saleEmailType.description].replace('#{orgName}', orgName).replace('#{plan}', PLAN_TEXT_EVENT.ENTERPRISE),
      orgName,
      orgId,
      orgAvatar,
      domain,
      plan: PLAN_TEXT_EVENT.ENTERPRISE,
    };
    this.emailService.sendEmailHOF(saleEmailType, [saleEmail], saleEmailData);

    const { payment: oldPayment } = oldOrganization;

    let orgEmailType: EmailType = null;
    let orgEmailData: Record<string, unknown> = null;
    switch (oldPayment.type as PaymentPlanEnums) {
      case PaymentPlanEnums.BUSINESS:
      case PaymentPlanEnums.FREE:
        orgEmailType = EMAIL_TYPE.ORG_ENTERPRISE_STARTED;
        orgEmailData = {
          subject: SUBJECT[orgEmailType.description].replace('#{orgName}', orgName),
          orgName,
          orgAvatar,
          orgId,
        };
        break;
      case PaymentPlanEnums.ENTERPRISE:
        orgEmailType = EMAIL_TYPE.ORGANIZATION_UPGRADE_SUBSCRIPTION;
        orgEmailData = {
          subject: SUBJECT[orgEmailType.description].replace('#{orgName}', orgName),
          organization: newOrganization,
          orgName,
          isOneMember: newPayment.quantity === 1,
          oldSize: oldPayment.quantity,
          newSize: newPayment.quantity,
          oldPeriod: capitalize(oldPayment.period),
          newPeriod: capitalize(newPayment.period),
          updateEnterprise: true,
          domain: url,
          orgId,
        };
        break;
      default:
        break;
    }

    if (!(orgEmailType && orgEmailData)) {
      return;
    }

    const orgMembership = await this.organizationService.findMemberWithRoleInOrg(orgId, [
      OrganizationRoleEnums.ORGANIZATION_ADMIN,
      OrganizationRoleEnums.BILLING_MODERATOR,
    ], { userId: 1 });
    const managerIds: string[] = orgMembership.filter(Boolean).map(({ userId }) => userId.toHexString());

    const users = await this.userService.findUserByIds(managerIds);
    const emails = users.map(({ email }) => email);
    const attachments = await this.paymentService.getInvoiceEmailAttachment({ invoice });
    this.emailService.sendEmailHOF(orgEmailType, emails, orgEmailData, attachments);
  }

  public mailToSaleWhenPaymentLinkExpired(organization: IOrganization): void {
    const { _id: orgId, name: orgName, avatarRemoteId: orgAvatar } = organization;
    const emailType: EmailType = EMAIL_TYPE.SALE_UPGRADE_PAYMENT_LINK_EXPIRED;
    const planLabel: string = PLAN_TEXT_EVENT[organization.payment.type];
    const emailData = {
      subject: SUBJECT[emailType.description].replace('#{orgName}', orgName).replace('#{plan}', planLabel),
      orgName,
      orgId,
      orgAvatar,
      plan: planLabel,
    };
    const saleEmail = this.environmentService.getByKey(EnvConstants.SALE_EMAIL);
    this.emailService.sendEmailHOF(emailType, [saleEmail], emailData);
  }

  private async createSendingInvoiceSubscription(
    input: CreatePaymentLinkInput,
    customerId: string,
    stripeAccountId: string,
  ): Promise<IEnterpriseInvoice> {
    const {
      priceId, expireDays, quantity, orgId, couponCode,
    } = input;
    const subscription = await this.paymentService.createStripeSubscription({
      customer: customerId,
      items: [{
        price: priceId,
        quantity,
      }],
      collection_method: CollectionMethod.SEND_INVOICE,
      days_until_due: expireDays,
      coupon: couponCode,
    }, { stripeAccount: stripeAccountId });

    // update status to pending
    const enterpriseOrDocStackPlanInvoice = await this.upsertEnterpriseInvoice({
      orgId,
      invoiceId: subscription.latest_invoice,
      status: UpgradeEnterpriseStatus.PENDING,
      plan: UpgradeInvoicePlanEnums.ENTERPRISE,
    });

    if (enterpriseOrDocStackPlanInvoice) {
      const { invoiceId } = enterpriseOrDocStackPlanInvoice;
      await this.paymentService.updateInvoice(
        invoiceId,
        {
          statement_descriptor: this.paymentService.getStatementDescriptor(customerId),
        },
        { stripeAccount: stripeAccountId },
      );
      this.paymentService.finalizeInvoice({ invoiceId, options: { stripeAccount: stripeAccountId } }).then((invoice) => {
        const { amount_due: amountDue } = invoice;
        if (amountDue) {
          this.paymentService.sendInvoice(invoiceId, null, { stripeAccount: stripeAccountId }).catch((err) => {
            this.loggerService.error({
              error: err,
              context: 'createSendingInvoiceSubscription',
            });
          });
        }
      });
    }
    return enterpriseOrDocStackPlanInvoice;
  }

  private async createPaymentLinkForFreeOrg(input: CreatePaymentLinkInput): Promise<IEnterpriseInvoice> {
    const { billingEmail, orgId } = input;
    const { payment } = await this.organizationService.getOrgById(orgId);
    const stripeAccountId = this.paymentService.getStripeAccountId({ payment, isAdminCharge: true });
    // create customer and subscription
    const customer = await this.paymentService.createNewCustomer(
      billingEmail,
      orgId,
      stripeAccountId,
    );

    return this.createSendingInvoiceSubscription(input, customer.id as string, stripeAccountId);
  }

  private async createPaymentLinkForPremiumOrg(organization: IOrganization, input: CreatePaymentLinkInput, plan: Record<string, any>) {
    const {
      payment, _id, settings,
    } = organization;
    const { billingEmail: newBillingEmail } = input;
    // retrieve customer
    const { customerRemoteId } = payment;
    const stripeAccountId = this.paymentService.getStripeAccountId({ payment, isAdminCharge: true });
    // check currency
    const { currency: currentCurrency } = payment;
    const { currency: enterpriseCurrency } = plan;
    if ((enterpriseCurrency as string).toUpperCase() !== currentCurrency) {
      throw GraphErrorException.BadRequest(
        `Product currency must be similar to the current plan (${currentCurrency})`,
        ErrorCode.Payment.CURRENCY_NOT_MATCHED,
      );
    }
    if (settings.domainVisibility === DomainVisibilitySetting.VISIBLE_AUTO_APPROVE) {
      const managers = await this.organizationService.getOrganizationMemberByRole(_id, [
        OrganizationRoleEnums.ORGANIZATION_ADMIN,
        OrganizationRoleEnums.BILLING_MODERATOR,
      ]);
      const managerIds = managers.map((user) => user._id);
      await this.organizationService.disabledAutoApprove(_id, managerIds);
    }
    await this.paymentService.updateStripeCustomer(customerRemoteId, {
      email: newBillingEmail,
    }, { stripeAccount: stripeAccountId });
    return this.createSendingInvoiceSubscription(input, customerRemoteId, stripeAccountId);
  }

  async createPaymentLink(input: CreatePaymentLinkInput & { adminId: string }): Promise<void> {
    const {
      orgId, priceId, quantity, adminId,
    } = input;
    const organization = await this.organizationService.getOrgById(orgId);
    if (!organization) {
      throw GraphErrorException.NotFound('Organization not found');
    }
    this.validatePaymentLinkCreation(organization);

    const { name: orgName, domain, payment: { type: planType, period = '' } } = organization;
    const stripeAccountId = this.paymentService.getStripeAccountId({ payment: organization.payment, isAdminCharge: true });
    const [admin, totalMember, pendingInvoice] = await Promise.all([
      this.findById(adminId),
      this.organizationService.getTotalMemberInOrg(orgId),
      this.findUpgradingInvoice(orgId),
    ]);

    if (totalMember > quantity) {
      throw GraphErrorException.BadRequest('Total members are greater than invoice quantity', ErrorCode.Payment.INVOICE_QUANTITY_NOT_ENOUGH);
    }

    if (pendingInvoice) {
      throw GraphErrorException.BadRequest('Organization has pending enterprise invoice');
    }
    const plan: Record<string, any> = await this.paymentService.getPlan(priceId, stripeAccountId).catch(() => null);

    if (!plan) {
      throw GraphErrorException.BadRequest('Price is not existed');
    }
    if (!PaymentIntervalEnums[plan.interval.toUpperCase()]) {
      throw GraphErrorException.BadRequest(`Subscription interval must be one of [${Object.values(PaymentIntervalEnums).join(', ')}]`);
    }

    switch (planType) {
      case PaymentPlanEnums.FREE:
        await this.createPaymentLinkForFreeOrg(input);
        break;
      case PaymentPlanEnums.BUSINESS:
      case PaymentPlanEnums.ENTERPRISE:
        await this.createPaymentLinkForPremiumOrg(organization, input, plan);
        break;
      default:
        break;
    }
    const { name: adminName, email, avatarRemoteId } = admin;
    const eventData = new OrganizationEventBuilder()
      .setName(PlanActionEvent.ENTERPRISE_UPGRADE_CREATED)
      .setActor({
        _id: adminId,
        name: adminName,
        email,
        avatarRemoteId,
      })
      .setOrganization({
        _id: orgId,
        name: orgName,
        domain,
      })
      .setOrgPlan({
        previousPlan: `${planType} ${period}`,
        plan: PaymentPlanEnums.ENTERPRISE,
      })
      .setScope([EventScopes.ADMIN])
      .build();
    this.eventService.createEvent(eventData);
  }

  public async handleAdminInviteMemberToOrg({
    organization,
    member,
  }: {
    organization: IOrganization,
    member: InviteToOrganizationInput,
  }): Promise<IRequestAccess> {
    const { email, role } = member;
    const requester = new RequestOrganizationConcreteBuilder()
      .setActor(email)
      .setTarget(organization._id)
      .setEntity({
        role: OrganizationRoleEnums[role],
      })
      .setType(AccessTypeOrganization.INVITE_ORGANIZATION);
    return this.organizationService.createRequestAccess(requester.build());
  }

  public async createOrganizationByAdmin(
    input: CreateOrgByAdminInput,
    organizationAvatar: { fileBuffer: Buffer; mimetype: string; filename: string },
    saleAdminId: string,
  ): Promise<{
    organization: IOrganization,
    fullyAddedMembers: boolean,
  }> {
    const { adminEmail, members } = input;
    const orgAdmin = await this.userService.findUserByEmail(adminEmail);

    if (!orgAdmin) {
      throw GraphErrorException.NotFound('Organization admin is not found.');
    }

    if (orgAdmin.deletedAt) {
      throw GraphErrorException.BadRequest('Cannot create a circle with a deleting user.');
    }

    if (!orgAdmin.isVerified) {
      throw GraphErrorException.BadRequest('Cannot create a circle with an unverified user.');
    }

    const [saleAdmin, organization] = await Promise.all([
      this.findById(saleAdminId),
      this.organizationService.handleAdminCreateOrganization({
        creator: orgAdmin,
        input,
        organizationAvatar,
      }),
    ]);

    const { _id: orgId, name: orgName, domain } = organization;
    const {
      _id: adminId, name: adminName, email, avatarRemoteId,
    } = saleAdmin;
    const eventData = new OrganizationEventBuilder()
      .setName(OrgActionEvent.ORGANIZATION_CREATED)
      .setActor({
        _id: adminId,
        name: adminName,
        email,
        avatarRemoteId,
      })
      .setOrganization({
        _id: orgId,
        name: orgName,
        domain,
      })
      .setScope([EventScopes.ADMIN])
      .build();
    this.eventService.createEvent(eventData);

    const formatedMembers = uniqBy(members, 'email').filter(({ email: memberEmail }) => memberEmail !== orgAdmin.email);
    if (!formatedMembers.length) {
      // [Hubspot] create workspace record for organization
      this.hubspotWorkspaceService.createWorkspace({
        orgId,
        name: orgName,
        associations: [{
          contactEmail: orgAdmin.email,
          orgRole: OrganizationRoleEnums.ORGANIZATION_ADMIN,
        }],
      });
      return {
        organization,
        fullyAddedMembers: true,
      };
    }

    const actorInfo = {
      name: CommonConstants.LUMIN_ADMIN,
      email: this.environmentService.getByKey(EnvConstants.SALE_EMAIL),
    };

    let invitedEmails: string[] = [];
    const luminUsers = await this.userService.findUserByEmails(formatedMembers.map(({ email: inviteEmail }) => inviteEmail));
    const orAdminEmailDomain = Utils.getEmailDomain(orgAdmin.email);
    const [addMembers, inviteMembers] = formatedMembers.reduce((acc, currentValue) => {
      const { email: inviteEmail } = currentValue;
      const canAddMember = orAdminEmailDomain === Utils.getEmailDomain(inviteEmail)
            && !Utils.verifyDomain(inviteEmail)
            && luminUsers.find((user) => user.isVerified && user.email === inviteEmail);
      const idx = canAddMember ? 0 : 1;
      acc[idx].push(currentValue);
      return acc;
    }, [[], []] as InviteToOrganizationInput[][]);

    if (addMembers.length) {
      await Promise.all(
        addMembers.map(async (invite) => {
          await this.organizationService.addMemberToOrg({
            email: invite.email,
            organization,
            role: invite.role,
            options: {
              skipHubspotWorkspaceAssociation: true,
              skipWorkspaceSizeChangedEvent: true,
            },
          });
        }),
      );

      const autoApproveEmails = addMembers.map((invite) => invite.email);

      this.organizationService.sendMailToInvitedUser({
        actor: actorInfo,
        organization,
        emails: autoApproveEmails,
        isNeedApprove: false,
      });
      await this.organizationService.notifyInviteToOrgSameDomain({
        actor: orgAdmin,
        organization,
        receiverEmails: autoApproveEmails,
        actorType: APP_USER_TYPE.SALE_ADMIN,
      });

      invitedEmails = [...invitedEmails, ...autoApproveEmails];
    }

    if (inviteMembers.length) {
      const addedMembers = await Promise.all(inviteMembers.map(async (member) => this.handleAdminInviteMemberToOrg({
        organization,
        member,
      })));

      const addedEmails = addedMembers.map((item) => item.actor);
      const addedSameDomainEmails = Utils.getSameUnpopularDomainEmails(orAdminEmailDomain, addedEmails);
      const addedNotSameDomainEmails = addedEmails.filter((sameDomainEmail) => !addedSameDomainEmails.includes(sameDomainEmail));

      if (addedMembers.length) {
        this.organizationService.notifyInviteToOrg({
          actor: orgAdmin,
          organization,
          memberList: addedMembers,
          actorType: APP_USER_TYPE.SALE_ADMIN,
        });
        this.organizationService.sendMailToInvitedUser({
          actor: actorInfo,
          organization,
          emails: addedNotSameDomainEmails,
        });
        this.organizationService.sendMailToInvitedUser({
          actor: actorInfo,
          organization,
          emails: addedSameDomainEmails,
          isNeedApprove: false,
        });

        invitedEmails = [...invitedEmails, ...addedEmails];
      }
    }

    // [Hubspot] create HubSpot Workspace record and associate with members
    const hubspotAssociations = addMembers.map(({ email: addedEmail, role }) => ({
      contactEmail: addedEmail,
      orgRole: role.toLowerCase() as unknown as OrganizationRoleEnums,
    })).concat([{
      contactEmail: orgAdmin.email,
      orgRole: OrganizationRoleEnums.ORGANIZATION_ADMIN,
    }]);
    this.hubspotWorkspaceService.createWorkspace({
      orgId: organization._id,
      name: organization.name,
      associations: hubspotAssociations,
    });

    const fullyAddedMembers = formatedMembers.length === invitedEmails.length;

    return {
      organization,
      fullyAddedMembers,
    };
  }

  public async cancelOrganizationPlan(params: {
    organization: IOrganization,
    cancelStrategy: string,
    adminId: string,
  }): Promise<void> {
    const { organization, cancelStrategy, adminId } = params;
    const {
      _id: orgId,
      name: orgName,
      domain,
      payment: {
        status, subscriptionRemoteId, type: planType, period, subscriptionItems = [],
      },
    } = organization;
    const stripeAccountId = this.paymentService.getStripeAccountId({ payment: organization.payment });
    if (cancelStrategy === CancelStrategy.END_PERIOD && status === PaymentStatusEnums.CANCELED) {
      throw GraphErrorException.BadRequest('Organization has already cancelled');
    }
    await this.paymentService.cancelPlan(subscriptionRemoteId, cancelStrategy, stripeAccountId);
    const [admin, receiver] = await Promise.all([
      this.findById(adminId),
      this.organizationService.getOrganizationMemberByRole(
        orgId,
        [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
      ),
    ]);
    const receiverEmail = receiver.map((user) => user.email);
    const publishIds: string[] = receiver.map((user) => user._id);

    if (cancelStrategy === CancelStrategy.IMMEDIATELY) {
      this.organizationService.publishUpdateOrganization(
        publishIds,
        {
          orgId,
          organization,
          type: SUBSCRIPTION_PAYMENT_UPDATE,
        },
        SUBSCRIPTION_UPDATE_ORG,
      );
      this.messageGateway.server
        .to(`${SOCKET_NAMESPACE.ORG_ROOM}-${orgId}`)
        .emit(SOCKET_MESSAGE.ORG_PAYMENT_UPDATED, { memberIds: publishIds });
    } else {
      const [currentSub, totalMembers] = await Promise.all([
        this.paymentService.getStripeSubscriptionInfo({
          subscriptionId: subscriptionRemoteId,
          options: { stripeAccount: stripeAccountId },
        }),
        this.organizationService.getTotalMemberInOrg(orgId),
      ]);
      const dateEnd = moment.unix(currentSub.current_period_end).format('MMM DD, YYYY');
      this.emailService.sendEmailHOF(
        EMAIL_TYPE.CONFIRM_CANCEL_PLAN_ORGANIZATION,
        receiverEmail,
        {
          subject: SUBJECT[EMAIL_TYPE.CONFIRM_CANCEL_PLAN_ORGANIZATION.description].replace('#{orgName}', orgName),
          dateEnd,
          totalMembers,
          orgName,
          orgId,
          products: subscriptionItems.map((item) => ({ productName: item.productName })),
        },
      );
    }
    const updateSubscriptionItems = subscriptionItems.map((item) => ({
      ...item,
      paymentStatus: PaymentStatusEnums.CANCELED,
    }));
    await this.organizationService.updateOrganizationById(orgId, {
      'payment.status': PaymentStatusEnums.CANCELED,
      'payment.subscriptionItems': updateSubscriptionItems,
    });
    const { name: adminName, email, avatarRemoteId } = admin;
    const eventData = new OrganizationEventBuilder()
      .setName(PlanActionEvent.ORG_PLAN_CANCELED)
      .setActor({
        _id: adminId,
        name: adminName,
        email,
        avatarRemoteId,
      })
      .setOrganization({
        _id: orgId,
        name: orgName,
        domain,
      })
      .setOrgPlan({
        plan: `${planType} ${period}`,
        cancelPlanReason: PlanCancelReason.ADMIN_CANCELED,
      })
      .setScope([EventScopes.ADMIN])
      .build();
    this.eventService.createEvent(eventData);
  }

  async cancelUserPlan(params: {user: User, cancelStrategy: CancelStrategy, adminId: string }): Promise<void> {
    const { user, cancelStrategy, adminId } = params;
    const { subscriptionRemoteId, type: planType, period } = user.payment;
    const stripeAccountId = this.paymentService.getStripeAccountId({ payment: user.payment });
    const [admin] = await Promise.all([
      this.findById(adminId),
      this.paymentService.cancelPlan(subscriptionRemoteId, cancelStrategy, stripeAccountId),
    ]);
    if (cancelStrategy === CancelStrategy.END_PERIOD) {
      const currentSub = await this.paymentService.getStripeSubscriptionInfo({
        subscriptionId: subscriptionRemoteId,
        options: { stripeAccount: stripeAccountId },
      });
      const dateEnd = moment.unix(currentSub.current_period_end).format('DD MMM YYYY');
      await this.userService.updateUserProperty({ _id: user._id }, { 'payment.status': PaymentStatusEnums.CANCELED });
      this.emailService.sendEmailHOF(
        EMAIL_TYPE.CONFIRM_CANCEL_PLAN,
        [user.email],
        {
          subject: 'Your Lumin Professional subscription is set to end soon',
          dateEnd,
        },
      );
    }
    const eventData = new UserEventBuilder()
      .setName(PlanActionEvent.USER_PLAN_CANCELED)
      .setActor({
        _id: adminId,
        name: admin.name,
        email: admin.email,
        avatarRemoteId: admin.avatarRemoteId,
      })
      .setTarget({
        _id: user._id,
        name: user.name,
        avatarRemoteId: user.avatarRemoteId,
        email: user.email,
      })
      .setUserPlan({
        plan: `${planType} ${period}`,
        cancelPlanReason: PlanCancelReason.ADMIN_CANCELED,
      })
      .setScope([EventScopes.ADMIN])
      .build();
    this.eventService.createEvent(eventData);
  }

  async getUserDetail(userId: string): Promise<UserDetailPayload> {
    const { user: userObject, error } = await this.userService.getUserData(userId);

    if (error) {
      throw error;
    }

    // get total document
    const totalDocuments = await this.documentService.countOwnedDocuments(userId);

    const { payment } = userObject;
    const canUsePremiumFeature = await this.userService.isAvailableUsePremiumFeature(userObject);
    const changeEmailAbility = canUsePremiumFeature ? ChangeEmailAbility.ELIGIBLE : ChangeEmailAbility.PREMIUM_REQUIRED;

    if (payment.type === PaymentPlanEnums.FREE) {
      return {
        user: userObject,
        changeEmailAbility,
        totalOwnedDocuments: totalDocuments,
      };
    }

    const [upcommingInvoice, subscription] = await Promise.all([
      this.paymentService.getUpcommingInvoice(payment),
      payment.subscriptionRemoteId
        ? this.paymentService.getStripeSubscriptionInfo({
          subscriptionId: payment.subscriptionRemoteId,
          options: { stripeAccount: payment.stripeAccountId },
        })
        : { current_period_end: 0 },
    ]);

    return {
      user: userObject,
      totalOwnedDocuments: totalDocuments,
      upcommingInvoice,
      periodEnd: subscription.current_period_end,
      changeEmailAbility,
    };
  }

  public async stopTransferAdminProcess(organization: IOrganization, transferredEmail: string): Promise<void> {
    const { _id: orgId, ownerId } = organization;
    const [currentOwner, transferredOwner] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.userService.findUserById(ownerId),
      this.userService.findUserByEmail(transferredEmail),
    ]);
    const transferKey = `${RedisConstants.TRANSFER_ORG_ADMIN}:${orgId}`;
    this.redisService.deleteRedisByKey(transferKey);
    this.organizationService.notifyStopTransferOwner({
      organization,
      currentOwner,
      transferredOwner,
    });
  }

  public deleteOwnedOrgTeams(teams: ITeam[], user: User): Promise<void>[] {
    // Handle transfer team admin & delete teams
    return teams.map(async (team) => {
      const result = await this.organizationTeamService.transferAdminToActiveMember(team);
      if (!result) {
        const [members, organization] = await Promise.all([
          this.organizationTeamService.getOrgTeamMember({ teamId: team._id }, { userId: 1 }),
          this.organizationService.getOrgById(team.belongsTo as string),
        ]);
        await this.organizationTeamService.deleteOrgTeam({
          team,
          actor: user,
          membersInTeam: members,
          organization,
          actorType: APP_USER_TYPE.SALE_ADMIN,
        });
      }
    });
  }

  // Delete organization in sequence so we won't start many transaction at once
  public async deleteOwnedOrganizations(organizations: IOrganization[]) {
    // eslint-disable-next-line no-restricted-syntax
    for (const organization of organizations) {
      // eslint-disable-next-line no-await-in-loop
      const isTransfered = await this.organizationService.transferAdminToActiveMember(organization);
      if (!isTransfered) {
        // eslint-disable-next-line no-await-in-loop
        await this.organizationService.deleteOrganization({
          orgId: organization._id,
          addToBlacklist: false,
          actionType: ActionTypeEnum.ADMIN_DELETE_USER,
        });
      }
    }
  }

  public async deleteAllUserData(user: User, addToBlacklist: boolean): Promise<void> {
    const {
      _id: userId,
      name,
      email,
      avatarRemoteId,
      payment: { subscriptionRemoteId, type: plan, stripeAccountId },
    } = user;
    const context = { userId, fn: this.deleteAllUserData.name };
    await this.transaction.withTransaction<{ userId: string }>(async (session) => {
      if (addToBlacklist) {
        const existedBlacklist = await this.blacklistService.findOne(BlacklistActionEnum.CREATE_NEW_ACCOUNT, email);
        if (!existedBlacklist) {
          await this.blacklistService.createWithTransaction(
            BlacklistActionEnum.CREATE_NEW_ACCOUNT,
            email,
            session,
          );
        }
      }

      const promises = [];
      const ownedDocIds = [];
      const documents = await this.documentService.findDocumentByUserId(userId);
      // eslint-disable-next-line no-restricted-syntax
      for (const document of documents) {
        // eslint-disable-next-line no-await-in-loop
        const nonPersonalDocumentPermission = await this.documentService.getDocumentPermissionsByDocId(
          document._id,
          { role: { $in: [DocumentRoleEnum.ORGANIZATION_TEAM, DocumentRoleEnum.ORGANIZATION] } },
        );
        if (nonPersonalDocumentPermission.length) {
          // Update owner name of document
          promises.push(this.documentService.updateDocument(
            document._id,
            { ownerName: name },
            session,
          ));
        } else {
          ownedDocIds.push(document._id);
          promises.push(this.documentService.deleteDocument(document._id, session));
          this.documentService.deleteRemoteDocument(document);
          this.documentService.deleteRemoteThumbnail(document.thumbnail);
        }
      }
      promises.push(
        this.documentService.deleteDocumentPermissions({
          refId: userId,
        }, session),
        this.documentService.deleteDocumentPermissions({
          documentId: { $in: ownedDocIds },
        }, session),
        this.documentService.deleteRecentDocumentList({ userId, session }),
        this.documentService.deleteManyRequestAccess({ requesterId: userId }),
      );
      // Delete membership & request access
      promises.push(
        this.membershipService.deleteMany({ userId }, session),
        this.organizationService.deleteManyMemberOrganizationByUserId(userId, session),
        this.organizationService.delInviteOrgListByEmail(
          user.email,
          AccessTypeOrganization.REQUEST_ORGANIZATION,
          session,
        ),
        this.organizationService.removeRequestAccessDocumentNoti(userId),
        this.organizationService.removeRequestAccessOrgNoti(user._id),
      );
      promises.push(this.userService.deleteUser(userId, session));
      this.userService.deleteUserContact(user._id);
      await Promise.all(promises);
    }, context);

    const isFreeUser = plan === PaymentPlanEnums.FREE;
    if (!isFreeUser) {
      this.paymentService.cancelStripeSubscription(subscriptionRemoteId, null, { stripeAccount: stripeAccountId });
    }
    this.redisService.clearAllRefreshToken(userId);
    this.userTrackingService.deleteContactByEmail(email);
    this.userService.removeAvatarFromS3(avatarRemoteId);
  }

  public async deleteUserImmediately(data: {
    adminId?: string,
    userId: string,
    addToBlacklist: boolean,
  }): Promise<void> {
    const { adminId, userId, addToBlacklist } = data;
    this.userService.publishDeleteAccount({ userId });
    const [admin, user, orgList, ownedTeams] = await Promise.all([
      adminId && this.findById(adminId),
      this.userService.findUserById(userId, {}, true),
      this.organizationService.getOrgListByUser(userId),
      this.teamService.findTeamByOwner(userId, { belongsTo: { $exists: true } }),
    ]);

    const { email, name, identityId } = user;
    const promises = [];

    if (ownedTeams.length) {
      promises.push(...this.deleteOwnedOrgTeams(ownedTeams, user));
    }

    if (orgList.length) {
      const ownedOrgList = remove(orgList, (org) => userId === org.ownerId.toHexString());
      orgList.forEach(async (organization) => {
        const { _id: orgId } = organization;
        const transferKey = `${RedisConstants.TRANSFER_ORG_ADMIN}:${orgId}`;
        const transferredEmail = await this.redisService.getRedisValueWithKey(transferKey);
        if (transferredEmail === email) {
          this.stopTransferAdminProcess(organization, transferredEmail);
        }
      });
      await this.deleteOwnedOrganizations(ownedOrgList);
      const notOwnedOrgList = orgList.filter((org) => org.ownerId.toHexString() !== userId);
      notOwnedOrgList.forEach(async (organization) => {
        await this.luminContractService.deleteDataInWorkspace({
          organization: OrganizationUtils.convertToOrganizationProto(organization),
          userId,
          action: 'delete_account',
        });
      });
    }
    await Promise.all(promises);

    // Delete user data
    await Promise.all([
      this.deleteAllUserData(user, addToBlacklist),
      this.luminContractService.deleteAccount({
        userId,
      }),
    ]);
    if (identityId) {
      try {
        await this.authService.deleteIdentity(identityId);
        this.redisService.setIdentityDeletedRecently(identityId);
      } catch (err) {
        this.loggerService.error({
          ...this.loggerService.getCommonErrorAttributes(err),
          context: 'deleteUserImmediately-deleteIdentity',
          extraInfo: {
            userId,
            identityId,
            loginService: user.loginService,
          },
        });
      }
    } else {
      await this.authService.deleteIdentityByEmail(email);
    }

    const emailData = {
      name,
      subject: SUBJECT[EMAIL_TYPE.DELETE_USER_ACCOUNT.description],
    };
    this.emailService.sendEmail(EMAIL_TYPE.DELETE_USER_ACCOUNT, [email], emailData);
    this.messageGateway.server
      .to(`${SOCKET_NAMESPACE.USER_ROOM}-${user._id}`)
      .emit(SOCKET_MESSAGE.ADMIN_DELETE_USER);
    if (admin) {
      this.createDeleteUserEvent({ admin, user, addToBlacklist });
    }
    await this.brazeService.deleteAudiences([userId]);
  }

  async convertMainToCustomOrg(data: {
    mainOrg: IOrganization,
    saleAdminId?: string,
    shouldCreateEvent?: boolean,
  }): Promise<void> {
    const { mainOrg, saleAdminId, shouldCreateEvent } = data;
    const orgDomain = this.organizationService.createCustomOrgDomain();
    const [updatedOrganization, allMemberships] = await Promise.all([
      this.organizationService.updateOrganizationProperty(
        mainOrg._id,
        {
          url: orgDomain,
          domain: orgDomain,
          settings: {
            ...mainOrg.settings,
            domainVisibility: DomainVisibilitySetting.VISIBLE_NEED_APPROVE,
          },
        },
      ),
      this.organizationService.getMembersByOrgId(mainOrg._id),
    ]);

    const managerIds: string[] = allMemberships
      .filter(
        (member) => [
          OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR,
        ].includes(member.role as OrganizationRoleEnums),
      )
      .map(
        (member) => member.userId.toHexString(),
      );

    await this.organizationService.updateManyMemberships({ orgId: mainOrg._id, internal: false }, { internal: true });

    this.organizationService.notifyConvertOrganization(updatedOrganization, ConvertOrganizationToEnum.CUSTOM_ORGANIZATION, managerIds);

    this.organizationService.publishConvertOrganization({
      orgId: updatedOrganization._id,
      url: updatedOrganization.url,
      type: SUBSCRIPTION_CONVERT_TO_CUSTOM_ORGANIZATION,
    });

    this.organizationService.publishUpdateConvertedOrganization(updatedOrganization);
    if (shouldCreateEvent) {
      const saleAdmin = await this.findById(saleAdminId);
      this.createMainToCustomOrgConversionEvent({
        admin: saleAdmin,
        organization: updatedOrganization,
      });
    }
  }

  async convertCustomToMainOrg(data: {
    customOrg: IOrganization,
    existedMainOrg?: IOrganization,
    domain: string,
    saleAdmin: IAdmin,
  }): Promise<void> {
    const {
      customOrg, domain, saleAdmin, existedMainOrg,
    } = data;
    const { _id: orgId, name: orgName } = customOrg;
    const membersInfo = await this.organizationService.getMembersInfoByOrgId(orgId);

    const memberIdsDiffDomain = membersInfo.filter((memberInfo) => {
      const memberDomain = Utils.getEmailDomain(memberInfo.user.email as string);
      return memberDomain !== domain;
    }).map((member) => member.userId);

    const orgUrl = domain.replace(/\./gi, '-');
    const updatedOrganization = await this.organizationService.updateOrganizationProperty(
      orgId,
      {
        domain,
        url: orgUrl,
      },
    );
    const orgManagerIds: string[] = membersInfo
      .filter(
        (member) => [
          OrganizationRoleEnums.BILLING_MODERATOR,
          OrganizationRoleEnums.ORGANIZATION_ADMIN,
        ].includes(member.role as OrganizationRoleEnums),
      )
      .map((manager) => manager.userId.toHexString());
    await this.organizationService.updateManyMemberships({ orgId: customOrg._id, userId: { $in: memberIdsDiffDomain } }, { internal: false });
    this.organizationService.notifyConvertOrganization(updatedOrganization, ConvertOrganizationToEnum.MAIN_ORGANIZATION, orgManagerIds);
    this.organizationService.publishConvertOrganization({
      url: updatedOrganization.url,
      type: SUBSCRIPTION_CONVERT_TO_MAIN_ORGANIZATION,
      orgId: updatedOrganization._id,
    });
    this.organizationService.publishUpdateConvertedOrganization(updatedOrganization);

    const {
      _id: adminId, name: adminName, email, avatarRemoteId,
    } = saleAdmin;
    const eventData = new OrganizationEventBuilder()
      .setName(OrgActionEvent.CUSTOM_ORG_CONVERTED_TO_MAIN)
      .setActor({
        _id: adminId,
        name: adminName,
        email,
        avatarRemoteId,
      })
      .setOrganization({
        _id: orgId,
        name: orgName,
        domain,
      })
      .setScope([EventScopes.ADMIN])
      .build();
    this.eventService.createEvent(eventData)
      .then((response) => {
        if (existedMainOrg) {
          this.createMainToCustomOrgConversionEvent({
            admin: saleAdmin,
            organization: existedMainOrg,
            sourceAction: SourceActions.CUSTOM_ORG_CONVERTED_TO_MAIN,
            sourceEventId: response._id,
          });
        }
      });
  }

  createMainToCustomOrgConversionEvent(data: {
    admin: IAdmin,
    organization: IOrganization,
    sourceAction?: SourceActions,
    sourceEventId?: string,
  }): void {
    const {
      admin, organization, sourceAction, sourceEventId,
    } = data;
    const {
      _id: adminId, name: adminName, email, avatarRemoteId,
    } = admin;
    const { _id: orgId, name: orgName, domain } = organization;
    const eventData = new OrganizationEventBuilder()
      .setName(OrgActionEvent.MAIN_ORG_CONVERTED_TO_CUSTOM)
      .setActor({
        _id: adminId,
        name: adminName,
        email,
        avatarRemoteId,
      })
      .setOrganization({
        _id: orgId,
        name: orgName,
        domain,
      })
      .setScope([EventScopes.ADMIN]);
    if (sourceAction === SourceActions.CUSTOM_ORG_CONVERTED_TO_MAIN) {
      eventData.setSourceAction(sourceAction);
      eventData.setSourceEventId(sourceEventId);
    }
    this.eventService.createEvent(eventData.build());
  }

  private async checkAbilityToChangePassword(
    user: IAdmin,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string, code: string }> {
    const [isValidCurrentPassword, isSameAsOldPassword] = await Promise.all([
      user.comparePassword(currentPassword).catch(() => false),
      user.comparePassword(newPassword).catch(() => false),
    ]);

    if (!isValidCurrentPassword) {
      return {
        message: 'Current password is incorrect',
        code: null,
      };
    }

    if (isSameAsOldPassword) {
      return {
        message: 'New password must be different from the current password',
        code: null,
      };
    }
    return null;
  }

  async changeAdminPassword(adminId: string, input: ChangeAdminPasswordInput): Promise<IAdmin> {
    const { currentPassword, newPassword } = input;
    const adminUser = await this.findById(adminId, '+password');

    // check password
    const error = await this.checkAbilityToChangePassword(adminUser, currentPassword, newPassword);
    if (error) {
      throw GraphErrorException.BadRequest(error.message, error.code);
    }

    return this.authService.adminUpdatePassword({
      adminId,
      password: newPassword,
    });
  }

  async updateAdminProfile(
    adminId: string,
    input: UpdateAdminProfileInput,
    avatar: FileData,
  ): Promise<IAdmin> {
    const { name, avatarAction } = input;
    const adminUser = await this.findById(adminId);

    const { avatarRemoteId } = adminUser;
    let keyFile = avatarRemoteId;
    switch (avatarAction) {
      case AvatarAction.UPLOAD: {
        this.userService.removeAvatarFromS3(avatarRemoteId);
        keyFile = await this.awsService.uploadUserAvatar(avatar);
        break;
      }
      case AvatarAction.REMOVE: {
        this.userService.removeAvatarFromS3(avatarRemoteId);
        keyFile = null;
        break;
      }
      default:
        break;
    }

    return this.updatePropertiesById(adminId, {
      name,
      avatarRemoteId: keyFile,
    });
  }

  publishUpdateAdminPermission(userId: string, admin: IAdmin, type: string): void {
    this.pubSub.publish(`${SUBSCRIPTION_UPDATE_ADMIN_PERMISSION}.${userId}`, {
      [SUBSCRIPTION_UPDATE_ADMIN_PERMISSION]: {
        adminId: userId,
        admin,
        type,
      },
    });
  }

  async addOrgDomainToBlacklist(domain: string, adminId: string): Promise<IBlacklist> {
    const existedOrgDomain = await this.organizationService.getOrgByDomain(domain);
    if (existedOrgDomain) {
      throw GraphErrorException.BadRequest('This domain is being used.');
    }
    const existedBlacklist = await this.blacklistService.findOne(BlacklistActionEnum.CREATE_MAIN_ORGANIZATION, domain);
    if (existedBlacklist) {
      throw GraphErrorException.BadRequest('This domain is already added to blacklist.');
    }

    const { name: adminName, email, avatarRemoteId } = await this.findById(adminId);
    const eventData = new OrganizationEventBuilder()
      .setName(OrgActionEvent.ORGANIZATION_BLACKLISTED)
      .setActor({
        _id: adminId,
        name: adminName,
        email,
        avatarRemoteId,
      })
      .setOrganization({ domain })
      .setScope([EventScopes.ADMIN])
      .build();
    this.eventService.createEvent(eventData);

    return this.blacklistService.create(BlacklistActionEnum.CREATE_MAIN_ORGANIZATION, domain);
  }

  async removeOrgDomainFromBlacklist(domain: string, adminId: string): Promise<void> {
    const deletedDomain = await this.blacklistService.findOneAndDelete(BlacklistActionEnum.CREATE_MAIN_ORGANIZATION, domain);
    if (!deletedDomain) {
      throw GraphErrorException.BadRequest('Can not delete with this this domain');
    }

    const { name: adminName, email, avatarRemoteId } = await this.findById(adminId);
    const eventData = new OrganizationEventBuilder()
      .setName(OrgActionEvent.ORGANIZATION_WHITELISTED)
      .setActor({
        _id: adminId,
        name: adminName,
        email,
        avatarRemoteId,
      })
      .setOrganization({ domain })
      .setScope([EventScopes.ADMIN])
      .build();
    this.eventService.createEvent(eventData);
  }

  async addEmailToUserBlacklist(email: string, adminId: string): Promise<IBlacklist> {
    const [existedUser, admin] = await Promise.all([
      this.userService.findUserByEmail(email),
      this.findById(adminId),
    ]);
    if (existedUser) {
      throw GraphErrorException.BadRequest('This email is being used by Lumin User.');
    }
    const existedEmail = await this.blacklistService.findOne(BlacklistActionEnum.CREATE_NEW_ACCOUNT, email);
    if (existedEmail) {
      throw GraphErrorException.BadRequest('This email is already exist in black list');
    }

    this.organizationService.delInviteOrgListByEmail(email, AccessTypeOrganization.INVITE_ORGANIZATION);
    this.documentService.deleteDocumentNonLuminUser({ email });

    const { name: actorName, email: actorEmail, avatarRemoteId } = admin;
    const eventData = new UserEventBuilder()
      .setName(UserActionEvent.USER_BLACKLISTED)
      .setActor({
        _id: adminId,
        name: actorName,
        email: actorEmail,
        avatarRemoteId,
      })
      .setTarget({ email })
      .setScope([EventScopes.ADMIN])
      .build();
    this.eventService.createEvent(eventData);
    return this.blacklistService.create(BlacklistActionEnum.CREATE_NEW_ACCOUNT, email);
  }

  async removeEmailFromBlacklist(email: string, adminId: string): Promise<void> {
    const [deletedEmail, admin] = await Promise.all([
      this.blacklistService.findOneAndDelete(BlacklistActionEnum.CREATE_NEW_ACCOUNT, email),
      this.findById(adminId),
    ]);
    if (!deletedEmail) {
      throw GraphErrorException.BadRequest('Can not delete with this email');
    }

    const { name: actorName, email: actorEmail, avatarRemoteId } = admin;
    const eventData = new UserEventBuilder()
      .setName(UserActionEvent.USER_WHITELISTED)
      .setActor({
        _id: adminId,
        name: actorName,
        email: actorEmail,
        avatarRemoteId,
      })
      .setTarget({ email })
      .setScope([EventScopes.ADMIN])
      .build();
    this.eventService.createEvent(eventData);
  }

  createExpiredEnterpriseUpgradeEvent(organization: IOrganization): void {
    const { _id, name, domain } = organization;
    const eventData = new OrganizationEventBuilder()
      .setName(PlanActionEvent.ENTERPRISE_UPGRADE_EXPIRED)
      .setOrganization({
        _id,
        name,
        domain,
      })
      .setOrgPlan({ plan: PaymentPlanEnums.ENTERPRISE })
      .setScope([EventScopes.SYSTEM])
      .build();
    this.eventService.createEvent(eventData);
  }

  async removeAdmin(removedAdminId: string, actorId: string): Promise<IAdmin> {
    const [removedAdmin, actor] = await Promise.all([
      this.findOneAndDelete(removedAdminId),
      this.findById(actorId),
    ]);
    if (!removedAdmin) {
      throw GraphErrorException.BadRequest('Can not delete this admin');
    }

    const { name: actorName, email: actorEmail, avatarRemoteId } = actor;
    const { _id: targetId, name: targetName, email: targetEmail } = removedAdmin;
    const eventData = new AdminEventBuilder()
      .setName(AdminActionEvent.ADMIN_DELETED)
      .setActor({
        _id: actorId,
        name: actorName,
        email: actorEmail,
        avatarRemoteId,
      })
      .setTarget({
        _id: targetId,
        name: targetName,
        email: targetEmail,
      })
      .setScope([EventScopes.ADMIN])
      .build();

    this.eventService.createEvent(eventData);
    this.publishUpdateAdminPermission(removedAdminId, removedAdmin, SUBSCRIPTION_DELETE_ADMIN);

    return removedAdmin;
  }

  createDeleteUserEvent(data: { admin: IAdmin, user: User, addToBlacklist: boolean }): void {
    const { admin, user, addToBlacklist } = data;
    const {
      _id: actorId, name: actorName, email: actorEmail, avatarRemoteId,
    } = admin;
    const { _id: targetId, email: targetEmail } = user;

    const actorInfo = {
      _id: actorId,
      name: actorName,
      email: actorEmail,
      avatarRemoteId,
    };
    const targetInfo = {
      _id: targetId,
      email: targetEmail,
    };
    const eventData = new UserEventBuilder()
      .setName(UserActionEvent.USER_DELETED)
      .setActor({ ...actorInfo })
      .setTarget({ ...targetInfo })
      .setScope([EventScopes.ADMIN])
      .build();
    this.eventService.createEvent(eventData)
      .then((response) => {
        if (addToBlacklist) {
          const triggeredEventData = new UserEventBuilder()
            .setName(UserActionEvent.USER_BLACKLISTED)
            .setActor(actorInfo)
            .setTarget(targetInfo)
            .setScope([EventScopes.ADMIN])
            .setSourceAction(SourceActions.USER_DELETED)
            .setSourceEventId(response._id as string)
            .build();
          this.eventService.createEvent(triggeredEventData);
        }
      });
  }

  async getLatestDealByOrgId(orgId: string): Promise<HubspotDeal> {
    const { dealName, dealId } = await this.hubspotService.getLatestDealByOrgId(orgId);
    if (!dealId) {
      return {};
    }
    const portalId = await this.hubspotService.getHubspotPortalId();
    const hubspotDashboardUrl = this.environmentService.getByKey(EnvConstants.HUBSPOT_DASHBOARD_URL);
    return ({
      dealName,
      dealUrl: `${hubspotDashboardUrl}/contacts/${portalId}/deal/${dealId}`,
    });
  }

  private validatePaymentLinkCreation(organization: IOrganization): void {
    const { payment } = organization;
    const subscriptionItems = payment.subscriptionItems || [];
    if (this.paymentUtilsService.isIncludeSignSubscription({ subscriptionItems })) {
      throw GraphErrorException.BadRequest('Cannot create payment link for organization.');
    }
  }

  async createDocStackPaymentLink(input: CreateDocStackPaymentLinkInput, admin: IAdmin): Promise<void> {
    const {
      orgId, currency, plan, period, quantity,
    } = input;
    const organization = await this.organizationService.getOrgById(orgId);
    if (!organization) {
      throw GraphErrorException.NotFound('Organization not found');
    }

    const { payment: currentPayment, name: orgName, domain } = organization;
    this.validatePaymentLinkCreation(organization);

    const eventData = new OrganizationEventBuilder()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .setName(PlanActionEvent.DOCSTACK_PLAN_CREATED)
      .setActor({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        avatarRemoteId: admin.avatarRemoteId,
      })
      .setOrganization({
        _id: orgId,
        name: orgName,
        domain,
      })
      .setOrgPlan({
        plan,
        docStack: DocStackUtils.getEventDocStack({ plan, period: period as unknown as PaymentPeriodEnums, quantity }),
        period: period as unknown as PaymentPeriodEnums,
      })
      .setScope([EventScopes.ADMIN])
      .build();
    this.eventService.createEvent(eventData);

    switch (currentPayment.type as PaymentPlanEnums) {
      case PaymentPlanEnums.FREE:
        await this.adminPaymentService.createDocStackPaymentLinkForFreeOrg({
          organization, paymentLinkInfo: { ...input, currency: currency as unknown as PaymentCurrencyEnums },
        });
        break;
      case PaymentPlanEnums.BUSINESS:
      case PaymentPlanEnums.ORG_STARTER:
      case PaymentPlanEnums.ORG_PRO:
      case PaymentPlanEnums.ORG_BUSINESS:
        await this.adminPaymentService.updateSubscriptionPlanByPaymentLink({
          organization, paymentLinkInfo: { ...input, currency: currency as unknown as PaymentCurrencyEnums },
        });
        break;
      default:
        break;
    }
  }

  createExpiredDocStackUpgradeEvent(organization: IOrganization): void {
    const {
      _id, name, domain, payment: { type, period, quantity },
    } = organization;
    const eventData = new OrganizationEventBuilder()
      .setName(PlanActionEvent.DOCSTACK_PLAN_EXPIRED)
      .setOrganization({
        _id,
        name,
        domain,
      })
      .setOrgPlan({ plan: type, docStack: DocStackUtils.getEventDocStack({ plan: type, period: period as PaymentPeriodEnums, quantity }) })
      .setScope([EventScopes.SYSTEM])
      .build();
    this.eventService.createEvent(eventData);
  }

  async createUpgradeDocstackEventAndSendMail(orgId: string, invoice: Stripe.Invoice): Promise<void> {
    const organization = await this.organizationService.getOrgById(orgId);
    // Create paid doc stack event
    const {
      name, domain, payment, avatarRemoteId, reservePayment,
    } = organization;
    const eventData = new OrganizationEventBuilder()
      .setName(PlanActionEvent.DOCSTACK_PLAN_PAID)
      .setOrganization({
        _id: orgId,
        name,
        domain,
      })
      .setOrgPlan({ plan: payment.type })
      .setScope([EventScopes.SYSTEM])
      .build();
    this.adminEventService.createEvent(eventData);
    // Send Email to sale
    const saleEmail = this.environmentService.getByKey(EnvConstants.SALE_EMAIL);
    const saleEmailType: EmailType = EMAIL_TYPE.SALE_UPGRADE_PAYMENT_LINK_SUCCESSFULLY;
    const saleEmailData = {
      subject: SUBJECT[saleEmailType.description].replace('#{orgName}', name).replace('#{plan}', PLAN_TEXT_EVENT[payment.type] as string),
      orgName: name,
      orgId,
      orgAvatar: avatarRemoteId,
      domain,
      plan: PLAN_TEXT_EVENT[payment.type],
    };
    this.emailService.sendEmailHOF(saleEmailType, [saleEmail], saleEmailData);

    // Send Email to CA and BM
    const receiverEmail = (await this.organizationService.getOrganizationMemberByRole(
      orgId,
      [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
    )).map((user) => user.email);
    const isFreePlan = (reservePayment?.type as PaymentPlanEnums) === PaymentPlanEnums.FREE;
    if (!reservePayment || isFreePlan) {
      const docStack = planPoliciesHandler
        .from({ plan: payment.type, period: payment.period })
        .getDocStack(payment.quantity) as unknown;
      const attachments = await this.paymentService.getInvoiceEmailAttachment({ invoice });
      this.emailService.sendEmailHOF(
        EMAIL_TYPE.WELCOME_ORGANIZATION_NEW_PRICING,
        receiverEmail,
        {
          subject: SUBJECT[EMAIL_TYPE.WELCOME_ORGANIZATION_NEW_PRICING.description].replace('#{orgName}', name)
            .replace('#{plan}', PLAN_TEXT[payment.type] as string).replace('#{docStack}', docStack as string),
          orgName: name,
          domain,
          orgId,
          plan: PLAN_TEXT[payment.type],
          docStack,
        },
        attachments,
      );
      return;
    }
    this.paymentService.sendUpgradeDocstackEmail({
      organization, currentPayment: reservePayment, upcomingPayment: payment, invoice,
    });
  }

  createEventForOrgUpgradedByAdmin(organization: IOrganization, eventType: PlanActionEvent): void {
    const {
      _id, name, domain, payment,
    } = organization;
    const eventData = new OrganizationEventBuilder()
      .setName(eventType)
      .setOrganization({
        _id,
        name,
        domain,
      })
      .setOrgPlan({ plan: payment.type })
      .setScope([EventScopes.SYSTEM])
      .build();
    this.eventService.createEvent(eventData);
  }

  async removeAssociateDomain(
    { orgId, associateDomain, admin } : { orgId: string | Types.ObjectId, associateDomain: string, admin: IAdmin },
  ): Promise<Organization> {
    const organization = await this.organizationService.getOrgById(orgId);
    const updatedOrganization = await this.organizationService.removeAssociateDomain({ organization, associateDomain });

    const eventData = new OrganizationEventBuilder()
      .setName(OrgActionEvent.ASSOCIATED_DOMAIN_REMOVED)
      .setActor(admin)
      .setOrganization(organization)
      .setScope([EventScopes.ADMIN])
      .setMetadata({ associateDomain })
      .build();
    this.eventService.createEvent(eventData);
    return updatedOrganization;
  }

  async getUserPreviewDataForChangeEmail(email: string): Promise<PreviewUserDataPayload> {
    const existedBlacklist = await this.blacklistService.findOne(BlacklistActionEnum.CREATE_NEW_ACCOUNT, email);
    if (existedBlacklist) {
      throw GraphErrorException.NotAcceptable('This email is banned', ErrorCode.User.EMAIL_IS_BANNED);
    }
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw GraphErrorException.NotFound('User not found', ErrorCode.Common.NOT_FOUND);
    }
    const userId = user._id;
    const [joinedOrgs, joinedTeams] = await Promise.all([
      this.organizationService.getOrgListByUser(userId),
      this.organizationTeamService.getJoinedTeams({ userId }),
    ]);
    const memberships = await this.organizationService.getOrgMembershipByConditions({
      conditions: { userId, role: { $in: [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR] } },
    });
    const orgsToRetrieveSubscription = memberships.map((membership) => membership.orgId.toHexString());
    const subscriptions = [
      user.payment,
      ...joinedOrgs
        .filter((joinedOrg) => orgsToRetrieveSubscription.includes(joinedOrg._id))
        .map((org) => org.payment),
    ]
      .filter((payment) => payment.type !== PaymentPlanEnums.FREE)
      .map(async (payment) => {
        let upcomingInvoice: SubscriptionResponse;
        const paymentStatus = payment.status as PaymentStatusEnums;
        if ([PaymentStatusEnums.ACTIVE, PaymentStatusEnums.TRIALING].includes(paymentStatus)) {
          upcomingInvoice = await this.paymentService.getUpcommingInvoice(
            payment,
          );
        } else {
          const latestInvoice = await this.paymentService.getLatestInvoice(payment);
          upcomingInvoice = {
            amount: latestInvoice.amount_due,
          };
        }
        return {
          upcomingInvoice,
          payment,
        };
      });
    const signUser = await this.luminContractService.getSignUserPayment({ userId });
    return ({
      user,
      subscriptions: await Promise.all(subscriptions),
      joinedOrgs,
      joinedTeams,
      signSubscription: {
        type: signUser.payment?.type,
        period: signUser.payment?.period,
        currency: signUser.payment?.currency,
        quantity: signUser.payment?.quantity != null ? Number(signUser.payment?.quantity) : null,
      },
    });
  }

  private async validateEmailChange(
    currentEmail: string,
    newEmail: string,
  ): Promise<{ currentEmailUser: User, newEmailUser: User | null }> {
    if (currentEmail === newEmail) {
      throw GraphErrorException.BadRequest('Current email is identical to new email');
    }

    const existedBlacklist = await this.blacklistService.findAll(BlacklistActionEnum.CREATE_NEW_ACCOUNT, [currentEmail, newEmail]);
    if (existedBlacklist.length) {
      throw GraphErrorException.NotAcceptable('Invalid email(s)', ErrorCode.User.EMAIL_IS_BANNED);
    }

    const currentEmailUser = await this.userService.findUserByEmail(currentEmail);
    if (!currentEmailUser) {
      throw GraphErrorException.NotFound('Current user not found', ErrorCode.Common.NOT_FOUND);
    }

    const { allowToChange, message } = this.verifyEmailChangeDomainRules({ currentEmail, newEmail });

    if (!allowToChange) {
      throw GraphErrorException.BadRequest(message);
    }

    const allowToChangeEmailDomains = this.customRuleLoader.getAllowToChangeEmailDomains();
    const currentDomain = Utils.getEmailDomain(currentEmail);

    if (!allowToChangeEmailDomains.includes(currentDomain)) {
      // TODO: https://lumin.atlassian.net/browse/LP-10956
      const canUsePremiumFeature = await this.userService.isAvailableUsePremiumFeature(currentEmailUser);
      if (!canUsePremiumFeature) {
        throw GraphErrorException.BadRequest('Not allow to change email for free user');
      }
    }

    const newEmailUser = await this.userService.findUserByEmail(newEmail);

    return { currentEmailUser, newEmailUser };
  }

  async changeUserEmail(admin: IAdmin, input: ChangeUserEmailInput): Promise<void> {
    const {
      currentEmail, newEmail, mergeOption, mergeDestination,
    } = input;
    const { currentEmailUser, newEmailUser } = await this.validateEmailChange(currentEmail, newEmail);

    const loggerPayload = {
      currentEmailUser: pick(currentEmailUser, ['_id', 'identityId']),
      newEmailUser: pick(newEmailUser, ['_id', 'identityId']),
      mergeOption,
      mergeDestination,
    };
    this.loggerService.info({
      context: this.changeUserEmail.name,
      message: 'Start changing user email',
      extraInfo: loggerPayload,
    });
    await this.luminContractService.changeUserEmail(input);
    if ([MergeAccountOptions.REPLACE_EXISTING_EMAIL, MergeAccountOptions.MERGE_INTO_CURRENT_EMAIL].includes(mergeOption)) {
      const currentSessions = await this.kratosService.getValidSessionByIdentityId(newEmailUser.identityId);
      if (currentSessions.length) {
        const revokedSessionIds = currentSessions.map((session) => session.id);
        this.redisService.setRedisDataWithExpireTime({
          key: `${RedisConstants.INVALID_SESSION_ID}${newEmail}`,
          value: JSON.stringify(revokedSessionIds),
          expireTime: CommonConstants.INVALID_SESSION_EXPIRE,
        });
      }
    }
    switch (mergeOption) {
      case (MergeAccountOptions.REPLACE_EXISTING_EMAIL): {
        if (!newEmailUser) {
          throw GraphErrorException.BadRequest('User with new email not found');
        }
        await this.deleteUserImmediately({ adminId: admin._id, userId: newEmailUser._id, addToBlacklist: false });
        break;
      }
      case (MergeAccountOptions.REPLACE_NOT_EXISTING_EMAIL): {
        if (newEmailUser) {
          throw GraphErrorException.BadRequest('User with new email already exist');
        }
        break;
      }
      case (MergeAccountOptions.MERGE_INTO_CURRENT_EMAIL): {
        await this.mergeUserAccount({
          targetUser: currentEmailUser,
          sourceUser: newEmailUser,
          mergeDestination,
          adminId: admin._id,
        });
        break;
      }
      case (MergeAccountOptions.MERGE_INTO_NEW_EMAIL): {
        await this.mergeUserAccount({
          targetUser: newEmailUser,
          sourceUser: currentEmailUser,
          mergeDestination,
          adminId: admin._id,
        });
        break;
      }
      default:
        throw GraphErrorException.BadRequest('Invalid merge option');
    }
    const isMergeIntoNewEmail = mergeOption === MergeAccountOptions.MERGE_INTO_NEW_EMAIL;
    if (!isMergeIntoNewEmail) {
      this.loggerService.info({
        context: this.changeUserEmail.name,
        message: 'Start updating user email and identity email',
        extraInfo: loggerPayload,
      });
      await this.userService.updateUserPropertyById(currentEmailUser._id, { email: newEmail });
      if (currentEmailUser.identityId) {
        await this.authService.changeEmailOnKratos({ user: currentEmailUser, newEmail });
      }
    }

    try {
      await this.updateChangedUserResource({
        currentEmailUser, newEmail, newEmailUser, isMergeIntoNewEmail, mergeOption,
      });
    } catch (err) {
      this.loggerService.error({
        context: this.changeUserEmail.name,
        message: 'Error updating user resource',
        error: err,
        extraInfo: loggerPayload,
      });
    }

    this.userService.emitUserEmailChanged(
      mergeOption === MergeAccountOptions.MERGE_INTO_NEW_EMAIL ? newEmailUser : currentEmailUser,
      newEmail,
    );

    const userId = mergeOption === MergeAccountOptions.MERGE_INTO_NEW_EMAIL ? newEmailUser._id : currentEmailUser._id;
    const eventData = new UserEventBuilder()
      .setName(UserActionEvent.USER_EMAIL_CHANGED)
      .setActor(admin)
      .setTarget(currentEmailUser)
      .setMetadata({ emailChanged: { newEmail, userId } })
      .setScope([EventScopes.ADMIN])
      .build();

    this.eventService.createEvent(eventData);
  }

  /**
   * - Move personal documents & folders from source user to target destination
   * - Delete source user (End subscription of source user if any)
   */
  async mergeUserAccount({
    targetUser, sourceUser, mergeDestination, adminId,
  }: {
    targetUser: User; sourceUser: User, mergeDestination: string; adminId: string;
  }): Promise<void> {
    if (!targetUser || !sourceUser) {
      throw GraphErrorException.BadRequest('Target and source user not found');
    }
    const sourceUserId = sourceUser._id;
    const targetUserId = targetUser._id;

    let destinationOrg;
    const mergeToPersonalWorkspace = mergeDestination === targetUserId;
    if (mergeToPersonalWorkspace) {
      if (targetUser.metadata?.isMigratedPersonalDoc) {
        throw GraphErrorException.BadRequest('Target user does not have personal workspace');
      }
    } else {
      destinationOrg = await this.organizationService.getOrgById(mergeDestination);
      if (!destinationOrg) {
        throw GraphErrorException.BadRequest('Organization not found', ErrorCode.Org.ORGANIZATION_NOT_FOUND);
      }
      const orgMembership = await this.organizationService.getMembershipByOrgAndUser(mergeDestination, targetUserId);
      if (!orgMembership) {
        throw GraphErrorException.BadRequest('Org membership not found', ErrorCode.Org.MEMBERSHIP_NOT_FOUND);
      }
    }

    const filter = { refId: sourceUserId, role: DocumentRoleEnum.OWNER };
    const updatePayload = {
      refId: targetUserId,
      ...mergeToPersonalWorkspace
        ? { $unset: { workspace: 1 } }
        : {
          workspace: {
            refId: destinationOrg._id,
            type: DocumentWorkspace.ORGANIZATION,
          },
        },
    };

    this.loggerService.info({
      context: this.mergeUserAccount.name,
      message: 'Start transfer document and folder ownership',
      extraInfo: {
        sourceUserId,
        targetUserId,
        mergeDestination,
        mergeToPersonalWorkspace,
      },
    });

    await Promise.all([
      this.documentService.updateManyDocumentPermission(filter, updatePayload),
      this.folderService.updateManyFolderPermissions(filter, updatePayload),
      this.documentService.updateManyDocuments(
        { ownerId: sourceUserId },
        { ownerName: targetUser.name, ownerId: targetUserId },
      ),
    ]);

    try {
      await this.documentService.ensureUniqueThirdPartyDocument(targetUserId, mergeToPersonalWorkspace ? null : mergeDestination);
    } catch (error) {
      this.loggerService.error({
        context: this.mergeUserAccount.name,
        message: 'Error ensuring unique third party document',
        error,
        extraInfo: {
          sourceUserId,
          targetUserId,
        },
      });
    }

    return this.deleteUserImmediately({ adminId, userId: sourceUserId, addToBlacklist: false });
  }

  async updateChangedUserResource({
    currentEmailUser, newEmail, newEmailUser, isMergeIntoNewEmail, mergeOption,
  }: {
    currentEmailUser: User, newEmail: string, newEmailUser: User, isMergeIntoNewEmail: boolean, mergeOption: MergeAccountOptions,
  }) {
    const updateInviteNotifications = async (orgIds) => {
      await this.organizationService.updateRequestAccess({
        actor: currentEmailUser.email, target: { $in: orgIds },
      }, { actor: newEmail });
      // Update invite join notification + invitation
      const inviteJoinNotification = await this.notificationService.getNotificationsByConditions({
        actionType: NotiOrg.INVITE_JOIN,
        'entity.entityId': { $in: orgIds },
        'target.targetData.invitationList.email': currentEmailUser.email,
      });
      await Promise.all(inviteJoinNotification.map(async (notification) => {
        const { target: { targetData: { invitationList } } } = notification;
        const updatedInvitationList = invitationList.map((invitation) => {
          if (invitation.email === currentEmailUser.email) {
            return { ...invitation, email: newEmail };
          }
          return invitation;
        });
        await this.notificationService.updateNotification({ _id: notification._id }, {
          'target.targetData.invitationList': updatedInvitationList,
        });
      }));
      return inviteJoinNotification;
    };
    if (mergeOption === MergeAccountOptions.REPLACE_NOT_EXISTING_EMAIL) {
      const requestAccesses = await this.organizationService.getInviteOrgList({
        actor: currentEmailUser.email,
        type: [AccessTypeOrganization.INVITE_ORGANIZATION, AccessTypeOrganization.REQUEST_ORGANIZATION],
      });
      const [inviteRequests, requestJoinOrgs] = partition(
        requestAccesses,
        (request) => request.type === AccessTypeOrganization.INVITE_ORGANIZATION,
      );
      const requestOrgs = requestJoinOrgs.map((request) => request.target);
      const inviteOrgs = inviteRequests.map((request) => request.target);
      // Remove request organization
      await Promise.all(requestOrgs.map(async (orgId) => {
        await this.organizationService.removeRequestOrInviteOrg(currentEmailUser, orgId);
      }));
      // Update invite join notification + invitation
      await updateInviteNotifications(inviteOrgs);
    } else {
      // In case current email is a member of org and new email is invited member
      // we will delete all request access and notification relate with new email
      const requestAccessOfNewEmail = await this.organizationService.getInviteOrgList({
        actor: newEmailUser.email,
        type: [AccessTypeOrganization.INVITE_ORGANIZATION],
      });
      if (requestAccessOfNewEmail.length) {
        const inviteOrgIdsNewEmail = requestAccessOfNewEmail.map((request) => request.target);
        const [orgIdsWithPermissionOldEmail] = await this.groupOrgIdsByPermission(inviteOrgIdsNewEmail, currentEmailUser._id);
        await Promise.all(orgIdsWithPermissionOldEmail.map(async (orgId) => {
          const requestAccess = requestAccessOfNewEmail.find((request) => request.target === orgId);
          const organization = await this.organizationService.getOrgById(orgId);
          if (!organization) {
            return;
          }
          await this.organizationService.removeRequestAccessAndNotification({ requestAccess, organization });
        }));
      }
      const requestAccesses = await this.organizationService.getInviteOrgList({
        actor: currentEmailUser.email,
        type: [AccessTypeOrganization.INVITE_ORGANIZATION, AccessTypeOrganization.REQUEST_ORGANIZATION],
      });
      const [inviteRequests, requestJoinOrgs] = partition(
        requestAccesses,
        (request) => request.type === AccessTypeOrganization.INVITE_ORGANIZATION,
      );
      const invitedOrgs = inviteRequests.map((request) => request.target);
      const [orgIdsWithPermission, orgIdsWithoutPermission] = await this.groupOrgIdsByPermission(invitedOrgs, newEmailUser._id);

      // Remove request access and notification when user new email is belong of org
      await Promise.all(orgIdsWithPermission.map(async (orgId) => {
        const requestAccess = inviteRequests.find((request) => request.target === orgId);
        const organization = await this.organizationService.getOrgById(orgId);
        if (!organization) {
          return;
        }
        await this.organizationService.removeRequestAccessAndNotification({ requestAccess, organization });
      }));
      // Update request access and notification when user new email is not belong of org
      const inviteJoinNotification = await updateInviteNotifications(orgIdsWithoutPermission);
      if (isMergeIntoNewEmail) {
        await this.notificationService.updateNotificationsUser({
          notificationId: { $in: inviteJoinNotification.map((notification) => notification._id) },
        }, { userId: newEmailUser._id });
      }

      // Remove request organization
      const requestOrgs = requestJoinOrgs.map((request) => request.target);
      await Promise.all(requestOrgs.map(async (orgId) => {
        await this.organizationService.removeRequestOrInviteOrg(currentEmailUser, orgId);
      }));
    }
    await this.paymentService.updateStripeCustomerEmail(isMergeIntoNewEmail ? newEmailUser : currentEmailUser, newEmail);
  }

  async groupOrgIdsByPermission(orgIds: string[], userId: string): Promise<[string[], string[]]> {
    const orgMemberships = await this.organizationService.getOrgMembershipByConditions({
      conditions: { userId, orgId: { $in: orgIds } },
    });
    const orgIdsWithPermission = orgMemberships.map((membership) => membership.orgId.toHexString());
    return orgIds.reduce((prev, current) => {
      if (orgIdsWithPermission.includes(current)) {
        prev[0].push(current);
      } else {
        prev[1].push(current);
      }
      return prev;
    }, [[], []]);
  }

  verifyEmailChangeDomainRules({
    newEmail,
    currentEmail,
  }: {
    newEmail: string;
    currentEmail: string;
  }): { allowToChange: boolean; message?: string } {
    const { restrictedDomains } = this.customRuleLoader;
    const currentDomain = Utils.getEmailDomain(currentEmail);
    const newDomain = Utils.getEmailDomain(newEmail);

    if (
      !restrictedDomains.includes(currentDomain)
      && !restrictedDomains.includes(newDomain)
    ) {
      return { allowToChange: true };
    }

    const allowToChangeEmailDomains = this.customRuleLoader.getAllowToChangeEmailDomains();

    if (
      !allowToChangeEmailDomains.length
      || (!allowToChangeEmailDomains.includes(currentDomain)
        && !allowToChangeEmailDomains.includes(newDomain))
    ) {
      throw RestrictedActionError;
    }

    const isDifferentDomain = newDomain !== currentDomain;

    if (
      !allowToChangeEmailDomains.includes(newDomain)
      && isDifferentDomain
    ) {
      return {
        allowToChange: false,
        message: `New email of this user must end with ${currentDomain}`,
      };
    }

    if (
      (!allowToChangeEmailDomains.includes(currentDomain)
        || (allowToChangeEmailDomains.includes(currentDomain)
          && allowToChangeEmailDomains.includes(newDomain)))
      && isDifferentDomain
    ) {
      return {
        allowToChange: false,
        message: `New email ending with ${newDomain} can only be assigned to users in that domain`,
      };
    }

    return { allowToChange: true };
  }

  async recoverIndexingHistoricalDocuments({ orgId, userId, isPersonalDoc }: { orgId: string, userId: string, isPersonalDoc: boolean }) {
    if (isPersonalDoc) {
      const docPermissions = await this.documentService.getPersonalOrgDocumentPermissions(userId, orgId);
      if (!docPermissions.length) {
        throw HttpErrorException.NotFound('No document permissions found');
      }
      const docIds = docPermissions.map((permission) => permission.documentId);
      const results = await this.documentService.updateManyDocuments({
        _id: { $in: docIds },
        'metadata.indexingStatus': { $ne: DocumentIndexingStatusEnum.PENDING },
      }, {
        $set: {
          'metadata.indexingStatus': DocumentIndexingStatusEnum.PENDING,
        },
      });
      await this.userService.updateUserPropertyById(userId, {
        'metadata.hasProcessedIndexingDocuments': false,
      });
      return results;
    }
    const documentPermissions = await this.documentService.getDocumentPermissionByConditions(
      {
        $or: [
          {
            role: DocumentRoleEnum.OWNER,
            refId: userId,
            'workspace.refId': orgId,
          },
          {
            role: DocumentRoleEnum.ORGANIZATION,
            refId: orgId,
          },
        ],
      },
    );

    if (!documentPermissions.length) {
      throw HttpErrorException.NotFound('No document permissions found');
    }

    const results = await this.documentService.updateManyDocuments({
      _id: { $in: documentPermissions.map((permission) => permission.documentId) },
      'metadata.indexingStatus': { $ne: DocumentIndexingStatusEnum.PENDING },
    }, {
      $set: {
        'metadata.indexingStatus': DocumentIndexingStatusEnum.PENDING,
      },
    });

    await this.organizationService.updateOrganizationById(orgId, {
      $set: {
        'metadata.hasProcessedIndexingDocuments': false,
      },
    });
    await this.userService.updateUserPropertyById(userId, {
      'metadata.hasProcessedIndexingDocuments': false,
      'metadata.processedIndexingRecentDocuments': [],
    });
    return results;
  }

  async backfillDocstackStartDateField() {
    const organizations = await this.organizationService.findOrganization({
      'payment.type': PaymentPlanEnums.ORG_BUSINESS,
      docStackStartDate: { $exists: false },
    });
    if (!organizations.length) {
      throw HttpErrorException.NotFound('No organizations found');
    }
    this.loggerService.info({
      context: this.backfillDocstackStartDateField.name,
      message: 'Backfilling docstack start date field',
      extraInfo: {
        organizations: organizations.length,
      },
    });
    let totalUpdated = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const organization of organizations) {
      // eslint-disable-next-line no-await-in-loop
      const { payment } = organization;
      // eslint-disable-next-line no-await-in-loop
      const subscriptionInfo = await this.paymentService.getStripeSubscriptionInfo(
        {
          subscriptionId: payment.subscriptionRemoteId,
          options: {
            stripeAccount: payment.stripeAccountId,
          },
        },
      ).catch((error) => {
        this.loggerService.error({
          context: this.backfillDocstackStartDateField.name,
          message: 'Error getting stripe subscription info',
          error,
          extraInfo: {
            organizationId: organization._id,
          },
        });
        return null;
      });
      if (!subscriptionInfo) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const billingCycleAnchor = subscriptionInfo.billing_cycle_anchor;
      const docStackStartDate = new Date(billingCycleAnchor * 1000);
      this.loggerService.info({
        context: this.backfillDocstackStartDateField.name,
        message: 'Updating organization docstack start date',
        extraInfo: {
          organizationId: organization._id,
          docStackStartDate,
        },
      });
      // eslint-disable-next-line no-await-in-loop
      await this.organizationService.updateOrganizationById(organization._id, { $set: { docStackStartDate } });
      totalUpdated++;
    }
    this.loggerService.info({
      context: this.backfillDocstackStartDateField.name,
      message: 'Backfilling docstack start date field completed',
      extraInfo: {
        organizations: organizations.length,
        totalUpdated,
      },
    });
  }

  async syncHubspotWorkspace(orgId: string): Promise<void> {
    const organization = await this.organizationService.getOrgById(orgId);
    if (!organization) {
      throw GraphErrorException.NotFound('Organization not found', ErrorCode.Org.ORGANIZATION_NOT_FOUND);
    }

    const members = await this.organizationService.getMembersInfoForSync(orgId);

    await this.hubspotWorkspaceService.syncHubspotWorkspace({
      orgId,
      orgName: organization.name,
      members: members as Array<{ email: string; role: OrganizationRoleEnums }>,
    });
  }
}
