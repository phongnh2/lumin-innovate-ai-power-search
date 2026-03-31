import {
  HttpStatus, Inject, UseGuards, UseInterceptors,
} from '@nestjs/common';
import {
  Resolver, Query, Mutation, Args, Context, Subscription,
} from '@nestjs/graphql';
// eslint-disable-next-line import/extensions
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { get } from 'lodash';
import { Types } from 'mongoose';
import Stripe from 'stripe';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { SUBSCRIPTION_UPDATE_ADMIN_PERMISSION } from 'Common/constants/SubscriptionConstants';
import { LIMIT_GET_USERS } from 'Common/constants/UserConstants';
import { CustomRuleValidator } from 'Common/decorators/customRule.decorator';
import { AcceptancePermissions } from 'Common/decorators/permission.decorator';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { UpgradingInvoicePayment } from 'Common/guards/upgrading-invoice-payment.guard';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';
import { Utils } from 'Common/utils/Utils';
import { AvatarFilePipe } from 'Common/validator/FileValidator/avatar.validator.pipe';
import { DocumentFilePipe } from 'Common/validator/FileValidator/document.validator.pipe';
import { FileData } from 'Common/validator/FileValidator/file.validator.pipe';
import { TemplateFilePipe } from 'Common/validator/FileValidator/template.validator.pipe';

import { CustomRuleAction } from 'CustomRules/custom-rule.enum';
import { CustomRulesInterceptor } from 'CustomRules/custom.rules.interceptor';

import { AdminOperationRule } from 'Admin/admin.enum';
import { AdminService } from 'Admin/admin.service';
import { AdminOperationGuard } from 'Admin/guards/admin.operation.guard';
import { AdminRoleGuard } from 'Admin/guards/admin.role.guard';
import { AdminAuthGuard } from 'Auth/guards/admin.auth.guard';
import { BlacklistActionEnum } from 'Blacklist/blacklist.enum';
import { BlacklistService } from 'Blacklist/blacklist.service';
import { IBlacklist } from 'Blacklist/interfaces/blacklist.interface';
import { CommunityTemplateService } from 'CommunityTemplate/communityTemplate.service';
import {
  GetAdminListInput,
  GetUserListInput,
  AdminsConnection,
  UserConnection,
  CreateAdminInput,
  AdminPayload,
  AdminRole,
  SetAdminRoleInput,
  CreatePaymentLinkInput,
  BasicResponse,
  OrganizationDetail,
  InvoiceStatus,
  GetOrganizationsInput,
  OrganizationConnection,
  CreateOrgByAdminInput,
  CreateOrganizationPayload,
  UserBlacklistConnection,
  GetBlacklistInput,
  OrganizationBlacklistConnection,
  AddEmailToUserBlacklistPayload,
  AddDomainToOrgBlacklistPayload,
  UserDetailPayload,
  Organization,
  UpdateAdminProfileInput,
  UpdateAdminPayload,
  ChangeAdminPasswordInput,
  UpdateAdminPermissionPayload,
  GetMemberInput,
  OrganizationMemberConnection,
  PreviewUpcomingInvoiceInput,
  PreviewUpcomingInvoicePayload,
  CancelPlanByAdminInput,
  CancelPlanTarget,
  RemoveAssociateDomainInput,
  CommunityTemplate,
  GetCommunityTemplatesInput,
  GetCommunityTemplatePayload,
  EditCommunityTemplateInput,
  AdminUploadTemplateInput,
  GetTemplateCategoryInput,
  GetTemplateCategoryPayload,
  TemplateCategory,
  EditTemplateCategoryInput,
  UserEdge,
  PreviewPaymentLinkInvoiceInput,
  PreviewPaymentLinkInvoicePayload,
  CreateDocStackPaymentLinkInput,
  GetCouponValueInput,
  CouponValueResponse,
  FindUserByAdminPayload,
  CommonPaymentInput,
  CustomerInfoResponse,
  Currency,
  ChangeUserEmailInput,
  PreviewUserDataPayload,
  VerifyEmailChangeDomainRulesData,
  VerifyEmailChangeDomainRulesInput,
} from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { OrganizationService } from 'Organization/organization.service';
import { PaymentCurrencyEnums, PaymentPlanEnums, PaymentPeriodEnums } from 'Payment/payment.enum';
import { PaymentService } from 'Payment/payment.service';
import { PaymentScriptService } from 'Payment/paymentScript.service';
import { UserService } from 'User/user.service';

import { IAdmin } from './interfaces/admin.interface';

@Resolver()
@UseGuards(AdminAuthGuard)
@UseInterceptors(SanitizeInputInterceptor)
export class AdminResolver {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    private readonly adminService: AdminService,
    private readonly organizationService: OrganizationService,
    private readonly paymentService: PaymentService,
    private readonly userService: UserService,
    private readonly blacklistService: BlacklistService,
    private readonly communityTemplateService: CommunityTemplateService,
    private readonly loggerService: LoggerService,
    private readonly paymentScriptService: PaymentScriptService,
  ) {}

  @Subscription(SUBSCRIPTION_UPDATE_ADMIN_PERMISSION)
  updateAdminPermission(@Context() context): UpdateAdminPermissionPayload {
    const { user } = context.req;
    return this.pubSub.asyncIterator(`${SUBSCRIPTION_UPDATE_ADMIN_PERMISSION}.${user._id}`);
  }

  @Query()
  async getAdminList(
    @Context() context,
    @Args('input') input: GetAdminListInput,
  ): Promise<AdminsConnection> {
    const { user } = context.req;
    const [adminList, total] = await this.adminService.getAdmins({
      ...input,
      actor: user,
    });
    const edges = adminList.map((admin) => ({
      node: { ...admin, _id: admin._id },
    }));
    return {
      edges,
      total,
    };
  }

  @Query()
  async getUserList(
    @Args('input') input: GetUserListInput,
  ): Promise<UserConnection> {
    const { offset } = input;
    if (offset > LIMIT_GET_USERS) {
      throw GraphErrorException.NotAcceptable('Offset exceeded get users limit ');
    }
    const [userList, total] = await this.userService.getUsers({
      ...input,
    });
    const edges = userList.map((user) => ({
      node: user,
    }));
    return {
      edges: edges as UserEdge[],
      total,
    };
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  async createAdmin(
    @Context() context,
    @Args('input') input: CreateAdminInput,
  ): Promise<AdminPayload> {
    const { user: { _id: actorId } } = context.req;
    const { email, role } = input;
    const createdAdmin = await this.adminService.inviteAdmin({ actorId, email, role });
    return {
      admin: createdAdmin,
    };
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  async resendAdminInvitation(
    @Context() context,
    @Args('email') email: string,
  ): Promise<AdminPayload> {
    const { user: { _id: actorId } } = context.req;
    const invitedAdmin = await this.adminService.resendAdminInvitation({ actorId, email });
    return {
      admin: invitedAdmin,
    };
  }

  @AdminOperationGuard(AdminOperationRule.HIGHER_ROLE_REQUIRED)
  @Mutation()
  async deleteAdmin(
    @Args('adminId') adminId: string,
    @Context() context,
  ): Promise<string> {
    const { _id: actorId } = context.req.user;
    const deletedAdmin = await this.adminService.removeAdmin(adminId, actorId as unknown as string);
    return deletedAdmin._id;
  }

  @AdminOperationGuard(AdminOperationRule.HIGHER_ROLE_REQUIRED)
  @Mutation()
  async setAdminRole(
    @Context() context,
    @Args('input') input: SetAdminRoleInput,
  ): Promise<AdminPayload> {
    const { user: { _id: actorId } } = context.req;
    const { adminId, role } = input;
    const { admin, error } = await this.adminService.setAdminRole({
      actorId,
      targetId: adminId,
      role,
    });
    if (error) {
      throw error;
    }
    if (!admin) {
      throw GraphErrorException.BadRequest('Cannot set role for this admin');
    }
    return {
      admin,
    };
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  async deleteOrganization(
    @Args('orgId') orgId: string,
    @Args('addToBlacklist') addToBlacklist: boolean,
    @Context() context,
  ): Promise<BasicResponse> {
    const { _id } = context.req.user;
    await this.adminService.deleteOrganizationImmediately({ orgId, adminId: _id, addToBlacklist });
    return {
      message: 'Delete successfully',
      statusCode: 200,
    };
  }

  @Query('getOrganizations')
  async getOrganizations(@Args('input') input: GetOrganizationsInput): Promise<OrganizationConnection> {
    const {
      searchQuery, limit, offset, sortOptions, filterOptions,
    } = input;
    const [organizationList, total] = await this.organizationService.getAllOrganizations({
      searchQuery, limit, offset, sortOptions, filterOptions,
    });
    const edges = organizationList.map((org) => ({
      organization: org,
    })) as any;

    return {
      total,
      edges,
      pageInfo: {
        limit,
        offset,
        hasNextPage: limit * (offset + 1) < total,
      },
    };
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  async createPaymentLink(
    @Args('input') input: CreatePaymentLinkInput,
    @Context() context,
  ) : Promise<BasicResponse> {
    const { _id } = context.req.user;
    await this.adminService.createPaymentLink({ ...input, adminId: _id });
    return {
      message: 'OK',
      statusCode: HttpStatus.OK,
    };
  }

  @Query()
  async getOrganizationDetail(
    @Args('orgId') orgId: string,
  ): Promise<OrganizationDetail> {
    const [organization, upgradingInvoice] = await Promise.all([
      this.organizationService.getOrgById(orgId),
      this.adminService.findUpgradingInvoiceByOrgId(orgId),
    ]);
    if (!organization) {
      throw GraphErrorException.NotFound('Organization not found');
    }

    const { payment } = organization;
    const stripeAccountId = this.paymentService.getStripeAccountId({ payment });
    const [upcommingInvoice, currentSub] = await Promise.all([
      this.paymentService.getUpcommingInvoice(payment),
      payment.subscriptionRemoteId
        ? this.paymentService.getStripeSubscriptionInfo({
          subscriptionId: payment.subscriptionRemoteId,
          options: { stripeAccount: stripeAccountId },
        })
        : { current_period_end: 0 } as Stripe.Subscription,
    ]);

    let invoicePaymentLink: string = '';
    const status = upgradingInvoice?.status || '';
    const latestHubspotDeal = await this.adminService.getLatestDealByOrgId(orgId);

    if (upgradingInvoice?.invoiceId) {
      try {
        const invoice = await this.paymentService.getInvoice({
          invoiceId: upgradingInvoice.invoiceId,
          options: { stripeAccount: stripeAccountId },
        });
        invoicePaymentLink = get(invoice, 'hosted_invoice_url');
      } catch (err) {
        this.loggerService.error({
          context: 'Retrieve Stripe invoice',
          ...this.loggerService.getCommonErrorAttributes(err),
        });
      }
    }

    return {
      invoiceStatus: InvoiceStatus[status.toLowerCase()],
      organization,
      upcommingInvoice,
      periodEnd: currentSub.current_period_end,
      currency: currentSub.currency?.toUpperCase() as Currency,
      latestHubspotDeal,
      invoicePaymentLink,
    };
  }

  @Mutation()
  async addEmailToUserBlacklist(
    @Args('email') email: string,
    @Context() context,
  ): Promise<AddEmailToUserBlacklistPayload> {
    const { _id } = context.req.user;
    const addedEmail = await this.adminService.addEmailToUserBlacklist(email, _id as string);
    return {
      email: addedEmail.value,
      statusCode: HttpStatus.OK,
      message: 'Added',
    };
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @CustomRuleValidator(CustomRuleAction.CREATE_ORGANIZATION_BY_ADMIN)
  @Mutation()
  async createOrganizationByAdmin(
    @Context() context,
    @Args('organization') input: CreateOrgByAdminInput,
    @Args({ name: 'file', type: () => GraphQLUpload }, AvatarFilePipe())
      organizationAvatar: { fileBuffer: Buffer; mimetype: string; filename: string },
  ): Promise<CreateOrganizationPayload> {
    const { _id } = context.req.user;

    const { organization, fullyAddedMembers } = await this.adminService.createOrganizationByAdmin(input, organizationAvatar, _id as string);

    if (!fullyAddedMembers) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Some members can't be added!",
        organizations: [organization],
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Create organization successfully!',
      organizations: [organization],
    };
  }

  @Query()
  @UseInterceptors(CustomRulesInterceptor)
  async findUserByAdmin(
    @Args('email') email: string,
  ): Promise<FindUserByAdminPayload> {
    const user = await this.userService.findUserByEmail(email);
    return {
      user,
    };
  }

  @Query()
  findUserInBlacklist(
    @Args('email') email: string,
  ): Promise<IBlacklist> {
    return this.blacklistService.findOne(BlacklistActionEnum.CREATE_NEW_ACCOUNT, email);
  }

  @Query()
  async getUserBlacklist(
    @Args('input') input: GetBlacklistInput,
  ): Promise<UserBlacklistConnection> {
    const {
      searchKey, limit, offset, sortOptions,
    } = input;
    const [userBlacklist, totalUserBlacklist] = await this.blacklistService.getAllBlackList(BlacklistActionEnum.CREATE_NEW_ACCOUNT, {
      searchKey, limit, offset, sortOptions,
    });
    const edges = userBlacklist.map((item) => ({
      node: {
        _id: item._id,
        email: item.value,
        createdAt: item.createdAt,
      },
    }));
    return {
      edges,
      total: totalUserBlacklist,
    };
  }

  @Mutation()
  async removeUserBlacklist(
    @Args('email') email: string,
    @Context() context,
  ): Promise<BasicResponse> {
    const { _id } = context.req.user;
    await this.adminService.removeEmailFromBlacklist(email, _id as string);
    return {
      statusCode: HttpStatus.OK,
      message: 'Remove successfully',
    };
  }

  @Query()
  async getOrganizationBlacklist(
    @Args('input') input: GetBlacklistInput,
  ): Promise<OrganizationBlacklistConnection> {
    const {
      searchKey, limit, offset, sortOptions,
    } = input;
    const [orgBlacklist, totalOrgBlacklist] = await this.blacklistService.getAllBlackList(BlacklistActionEnum.CREATE_MAIN_ORGANIZATION, {
      searchKey, limit, offset, sortOptions,
    });
    const edges = orgBlacklist.map((item) => ({
      node: {
        _id: item._id,
        domain: item.value,
        createdAt: item.createdAt,
      },
    }));
    return {
      edges,
      total: totalOrgBlacklist,
    };
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  async removeOrgBlacklist(
    @Args('domain') domain: string,
    @Context() context,
  ): Promise<BasicResponse> {
    const { _id } = context.req.user;
    await this.adminService.removeOrgDomainFromBlacklist(domain, _id as string);
    return {
      statusCode: HttpStatus.OK,
      message: 'Remove successfully',
    };
  }

  @UseGuards(AdminRoleGuard)
  @AcceptancePermissions(AdminRole.SUPER_ADMIN)
  @Mutation()
  async addDomainToOrgBlacklist(
    @Args('domain') domain: string,
    @Context() context,
  ): Promise<AddDomainToOrgBlacklistPayload> {
    const { _id } = context.req.user;
    const addedDomain = await this.adminService.addOrgDomainToBlacklist(domain, _id as string);
    return {
      domain: addedDomain.value,
      statusCode: HttpStatus.OK,
      message: 'Added',
    };
  }

  @UseGuards(UpgradingInvoicePayment)
  @Mutation()
  async cancelPlanByAdmin(
    @Args('input') input: CancelPlanByAdminInput,
    @Context() context,
  ): Promise<BasicResponse> {
    const { _id } = context.req.user;
    const { targetId, targetType, cancelStrategy } = input;
    switch (targetType) {
      case CancelPlanTarget.ORGANIZATION: {
        const admin = await this.adminService.findById(_id as string);
        if (admin.role === AdminRole.MODERATOR) {
          throw GraphErrorException.NotAcceptable("You don't have permission");
        }
        const organization = await this.organizationService.getOrgById(targetId);
        if (organization.payment.type === PaymentPlanEnums.FREE) {
          throw GraphErrorException.BadRequest('Can not cancel free organization');
        }
        if (organization.payment.subscriptionItems.length >= 2) {
          throw GraphErrorException.BadRequest('It\'s unable to cancel a Workspace.');
        }
        await this.adminService.cancelOrganizationPlan({ organization, cancelStrategy, adminId: _id });
        break;
      }
      case CancelPlanTarget.PERSONAL: {
        const user = await this.userService.findUserById(targetId);
        if (!user) {
          throw GraphErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
        }
        if (user.payment.type === PaymentPlanEnums.FREE) {
          throw GraphErrorException.BadRequest('Can not cancel free user');
        }
        await this.adminService.cancelUserPlan({ user, cancelStrategy, adminId: _id });
        break;
      }
      default: break;
    }

    return {
      message: 'Cancel organization plan success',
      statusCode: 200,
    };
  }

  @Query()
  @UseInterceptors(CustomRulesInterceptor)
  async getUserDetail(
    @Args('userId') userId: string,
  ): Promise<UserDetailPayload> {
    return this.adminService.getUserDetail(userId);
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  async deleteUser(
    @Args('userId') userId: string,
    @Args('addToBlacklist') addToBlacklist: boolean,
    @Context() context,
  ): Promise<string> {
    const { _id } = context.req.user;
    await this.adminService.deleteUserImmediately({ adminId: _id, userId, addToBlacklist });
    return userId;
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  async convertToMainOrganization(
    @Args('orgId') orgId: string,
    @Context() context,
  ): Promise<BasicResponse> {
    const { _id: adminId } = context.req.user;
    const [saleAdmin, customOrg] = await Promise.all([
      this.adminService.findById(adminId as string),
      this.organizationService.getOrgById(orgId),
    ]);
    const owner = await this.userService.findUserById(customOrg.ownerId as string);
    const ownerDomain: string = Utils.getEmailDomain(owner.email);

    const canCreateMainOrganization = await this.organizationService.canCreateMainOrganization(owner.email);
    if (!canCreateMainOrganization) {
      throw GraphErrorException.Forbidden('Can not convert to main organization', ErrorCode.Org.DOMAIN_IS_NOT_ILLEGAL);
    }
    const existedMainOrg = await this.organizationService.getOrgByDomain(ownerDomain);
    if (existedMainOrg) {
      await this.adminService.convertMainToCustomOrg({ mainOrg: existedMainOrg });
    }
    await this.adminService.convertCustomToMainOrg({
      customOrg,
      domain: ownerDomain,
      saleAdmin,
      existedMainOrg,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Convert custom to main organization successfully',
    };
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  async convertToCustomOrganization(
    @Args('orgId') orgId: string,
    @Context() context,
  ): Promise<BasicResponse> {
    const { _id: saleAdminId } = context.req.user;
    const mainOrg = await this.organizationService.getOrgById(orgId);

    await this.adminService.convertMainToCustomOrg({ mainOrg, saleAdminId, shouldCreateEvent: true });

    return {
      statusCode: HttpStatus.OK,
      message: 'Organization has been converted',
    };
  }

  @Query()
  async getOrgByDomainAdmin(
    @Args('domain') domain: string,
  ): Promise<Organization> {
    return this.organizationService.getOrgByDomain(domain);
  }

  @Mutation()
  async updateAdminProfile(
    @Context() context,
    @Args('input') input: UpdateAdminProfileInput,
    @Args({ name: 'file', type: () => GraphQLUpload }, AvatarFilePipe()) avatar: FileData,
  ): Promise<UpdateAdminPayload> {
    const { _id } = context.req.user;
    const updatedAdmin = await this.adminService.updateAdminProfile(_id as string, input, avatar);
    return {
      admin: updatedAdmin,
      statusCode: HttpStatus.OK,
      message: 'Updated admin profile.',
    };
  }

  @Mutation()
  async changeAdminPassword(
    @Context() context,
    @Args('input') input: ChangeAdminPasswordInput,
  ): Promise<UpdateAdminPayload> {
    const { _id } = context.req.user;
    const updatedAdmin = await this.adminService.changeAdminPassword(_id as string, input);
    return {
      admin: updatedAdmin,
      statusCode: HttpStatus.OK,
      message: 'Updated admin profile.',
    };
  }

  @Query()
  async getOrganizationMembers(
    @Args('input') input: GetMemberInput,
  ): Promise<OrganizationMemberConnection> {
    return this.organizationService.getMembers(input);
  }

  @Query()
  previewUpcomingInvoice(
    @Args('input') input: PreviewUpcomingInvoiceInput,
  ): Promise<PreviewUpcomingInvoicePayload> {
    return this.paymentService.previewUpcomingInvoice(input);
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  async removeAssociateDomainByAdmin(
    @Context() context,
    @Args('input') input: RemoveAssociateDomainInput,
  ): Promise<Organization> {
    const admin = context.req.user;
    const { orgId, associateDomain } = input;
    return this.adminService.removeAssociateDomain({ orgId, associateDomain, admin });
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Query()
  async getTemplateDetail(
    @Args('templateId') templateId: string,
  ): Promise<CommunityTemplate> {
    const { template, error } = await this.communityTemplateService.getTemplateDetail({
      _id: new Types.ObjectId(templateId),
    });
    if (error) {
      throw error;
    }
    return template;
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Query()
  async getCommunityTemplates(
    @Args('input') input: GetCommunityTemplatesInput,
  ): Promise<GetCommunityTemplatePayload> {
    const {
      templates,
      total,
    } = await this.communityTemplateService.getCommunityTemplates(input);
    return {
      templates,
      total,
    };
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  async editTemplateDetail(
    @Context() context,
    @Args('input') input: EditCommunityTemplateInput,
    @Args({ name: 'thumbnails', type: () => GraphQLUpload }, DocumentFilePipe()) thumbnails: FileData[],
  ): Promise<CommunityTemplate> {
    const { _id } = context.req.user;
    const { templateId } = input;
    const { template, error } = await this.communityTemplateService.editTemplateDetail({
      editorId: _id,
      templateId,
      draft: input.draft,
      thumbnails: thumbnails || [],
    });
    if (error) {
      throw error;
    }
    return template;
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  deleteCommunityTemplate(
    @Args('templateId') templateId: string,
    @Context() context,
  ): Promise<CommunityTemplate> {
    const { _id: adminId } = context.req.user;
    return this.communityTemplateService.deleteTemplate({ templateId, adminId });
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  async unpublishCommunityTemplate(
    @Args('templateId') templateId: string,
    @Context() context,
  ): Promise<CommunityTemplate> {
    const { _id } = context.req.user;
    const { error, template } = await this.communityTemplateService.unpublishCommunityTemplate({
      actorId: _id,
      templateId,
    });
    if (error) {
      throw error;
    }
    return template;
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  async publishCommunityTemplate(
    @Args('templateId') templateId: string,
    @Context() context,
  ): Promise<CommunityTemplate> {
    const { _id } = context.req.user;
    const { error, template } = await this.communityTemplateService.publishCommunityTemplate({
      publisherId: _id,
      templateId,
    });
    if (error) {
      throw error;
    }
    return template;
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  async adminUploadTemplate(
    @Context() context,
    @Args('input') input: AdminUploadTemplateInput,
    @Args({ name: 'template', type: () => GraphQLUpload }, TemplateFilePipe()) template: FileData,
    @Args({ name: 'thumbnails', type: () => GraphQLUpload }, DocumentFilePipe()) thumbnails: FileData[],
  ): Promise<BasicResponse> {
    const { _id: userId } = context.req.user;
    const { error } = await this.communityTemplateService.adminUploadTemplate({
      uploaderId: userId,
      input,
      templateFile: template,
      thumbnailFiles: thumbnails,
    });

    if (error) {
      throw error;
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Template created',
    };
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Query()
  getCategoryTemplatesByAdmin(
    @Args('input') input: GetTemplateCategoryInput,
  ): Promise<GetTemplateCategoryPayload> {
    return this.communityTemplateService.getCategoriesByAdmin(input);
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Query()
  async getTemplateCategoryDetail(
    @Args('categoryId') categoryId: string,
  ): Promise<TemplateCategory> {
    const { error, category } = await this.communityTemplateService.getTemplateCategoryDetail(categoryId);
    if (error) {
      throw error;
    }
    return category;
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  async createTemplateCategory(
    @Context() context,
    @Args('name') name: string,
  ): Promise<TemplateCategory> {
    const { _id: adminId } = context.req.user;
    const categoryData = {
      name,
      creator: adminId,
      lastEditor: adminId,
    };
    const { error, category } = await this.communityTemplateService.createTemplateCategory(categoryData);
    if (error) {
      throw error;
    }
    return category;
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  async editTemplateCategory(
    @Args('input') input: EditTemplateCategoryInput,
    @Context() context,
  ): Promise<TemplateCategory> {
    const { _id: adminId } = context.req.user;
    const { name, categoryId } = input;
    const { error, category } = await this.communityTemplateService.editTemplateCategory({ name, categoryId, adminId });
    if (error) {
      throw error;
    }
    return category;
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  async deleteTemplateCategory(
    @Args('categoryId') categoryId: string,
    @Context() context,
  ): Promise<BasicResponse> {
    const { _id: adminId } = context.req.user;
    const { error, numberTemplateBonded } = await this.communityTemplateService.countTemplatesByCategoryId(categoryId);
    if (error) {
      throw error;
    }
    if (numberTemplateBonded) {
      throw GraphErrorException.NotAcceptable('Category is being used in other templates.', ErrorCode.TemplateCategory.HAS_TEMPLATE_BONDED);
    }
    await this.communityTemplateService.deleteTemplateCategory({ categoryId, adminId });
    return {
      message: 'Category has been deleted',
      statusCode: HttpStatus.OK,
    };
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Query()
  async previewPaymentLinkInvoice(@Args('input') input: PreviewPaymentLinkInvoiceInput): Promise<PreviewPaymentLinkInvoicePayload> {
    const {
      orgId, period, plan, couponCode, quantity, currency,
    } = input;
    const organization = await this.organizationService.getOrgById(orgId);
    if (!organization) {
      throw GraphErrorException.NotFound('Organization not found', ErrorCode.Org.ORGANIZATION_NOT_FOUND);
    }
    let payload: PreviewPaymentLinkInvoicePayload;
    if (couponCode) {
      const { error: validateCouponError } = await this.paymentService.validateAndGetCouponValue({
        plan: plan as any,
        period,
        currency,
        couponCode,
        orgId,
        isAdminCharge: true,
      });
      if (validateCouponError) {
        throw validateCouponError;
      }
    }
    try {
      payload = await this.paymentService.previewPaymentLinkSubscriptionInvoice({
        currentPayment: organization.payment,
        orgId,
        upcomingPayment: {
          type: plan,
          period: period as unknown as PaymentPeriodEnums,
          couponCode,
          currency: currency as unknown as PaymentCurrencyEnums,
          quantity,
          customerRemoteId: organization.payment?.customerRemoteId,
        },
      });
    } catch (error) {
      if (error.raw?.code === 'resource_missing' && error.raw?.param === 'coupon') {
        throw GraphErrorException.BadRequest('Invalid coupon code', ErrorCode.Payment.INVALID_COUPON_CODE);
      }
      throw GraphErrorException.InternalServerError('Cannot preview payment link');
    }
    return payload;
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @UseGuards(UpgradingInvoicePayment)
  @Mutation()
  async createDocStackPaymentLink(
    @Args('input') input: CreateDocStackPaymentLinkInput,
    @Context() context,
  ) : Promise<BasicResponse> {
    const { _id: adminId } = context.req.user;
    const admin = await this.adminService.findById(adminId as string);
    await this.adminService.createDocStackPaymentLink(input, admin);
    return {
      message: 'OK',
      statusCode: HttpStatus.OK,
    };
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Query('getCouponValueForAdmin')
  async getCouponValueForAdmin(@Args('input') input: GetCouponValueInput): Promise<CouponValueResponse> {
    const {
      plan, period, currency, couponCode, orgId,
    } = input;
    const { coupon, error } = await this.paymentService.validateAndGetCouponValue({
      plan, period, currency, couponCode, orgId, isAdminCharge: true,
    });
    if (error) {
      throw error;
    }
    return coupon;
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Query()
  async getCustomerInfo(@Args('input') input: CommonPaymentInput): Promise<CustomerInfoResponse> {
    const { clientId } = input;
    const { type } = input;
    const organization = await this.organizationService.getOrgById(clientId);
    if (!organization) {
      throw GraphErrorException.NotFound('Organization not found', ErrorCode.Org.ORGANIZATION_NOT_FOUND);
    }
    const { payment } = organization;
    if (!payment.customerRemoteId) {
      return null;
    }
    return this.paymentService.getCustomerInfo(organization, type);
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @CustomRuleValidator(CustomRuleAction.CHANGE_USER_EMAIL)
  @Mutation()
  async changeUserEmail(
    @Args('input') input: ChangeUserEmailInput,
    @Context() context,
  ) {
    const admin = context.req.user as IAdmin;
    return this.adminService.changeUserEmail(admin, input);
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Query()
  previewUserDataForChangeEmail(
    @Args('email') email: string,
  ): Promise<PreviewUserDataPayload> {
    return this.adminService.getUserPreviewDataForChangeEmail(email);
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  migrateOrgBusinessToNewPrice(): BasicResponse {
    this.paymentScriptService.migrateOrgBusinessToNewPrice();
    return {
      message: 'Migrate org business to new price successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  migrateLegacyBusinessToNewBusiness(
    @Args({ name: 'orgIds', type: () => [String], nullable: true }) orgIds?: string[],
  ): BasicResponse {
    this.paymentScriptService.migrateLegacyBusinessToNewBusiness(orgIds);
    return {
      statusCode: HttpStatus.OK,
      message: 'Legacy business migration completed successfully',
    };
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Mutation()
  createOldBusinessPlan(
    @Args('email') email: string,
    @Args('priceId') priceId: string,
    @Args('isTrial') isTrial: boolean,
  ): BasicResponse {
    this.paymentScriptService.createListOldBusinessPlan({
      email,
      priceId,
      isTrial,
    });
    return {
      message: 'Create old business plan successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @AdminRoleGuard(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Query()
  verifyEmailChangeDomainRules(
    @Args('input') input: VerifyEmailChangeDomainRulesInput,
  ): VerifyEmailChangeDomainRulesData {
    const { currentEmail, newEmail } = input;
    return this.adminService.verifyEmailChangeDomainRules({ currentEmail, newEmail });
  }

  @Mutation()
  async syncHubspotWorkspace(
    @Args('orgId') orgId: string,
  ): Promise<BasicResponse> {
    await this.adminService.syncHubspotWorkspace(orgId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Organization information has been synchronized into Hubspot workspace',
    };
  }
}
