
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum AdminRole {
    OWNER = "OWNER",
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    MODERATOR = "MODERATOR"
}

export enum AdminStatus {
    ACTIVE = "ACTIVE",
    PENDING = "PENDING"
}

export enum UserStatus {
    DELETE = "DELETE",
    UNVERIFIED = "UNVERIFIED"
}

export enum AdminSetRole {
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN",
    MODERATOR = "MODERATOR"
}

export enum InvoiceStatus {
    none = "none",
    pending = "pending",
    expired = "expired"
}

export enum OrganizationType {
    automatic = "automatic",
    manual = "manual"
}

export enum OrganizationTypeFilter {
    automatic = "automatic",
    manual = "manual",
    converted = "converted"
}

export enum OrganizationPlan {
    FREE = "FREE",
    BUSINESS = "BUSINESS",
    ENTERPRISE = "ENTERPRISE",
    ORG_STARTER = "ORG_STARTER",
    ORG_PRO = "ORG_PRO",
    ORG_BUSINESS = "ORG_BUSINESS"
}

export enum AvatarAction {
    UPLOAD = "UPLOAD",
    REMOVE = "REMOVE"
}

export enum CancelPlanTarget {
    ORGANIZATION = "ORGANIZATION",
    PERSONAL = "PERSONAL"
}

export enum OrganizationSearchField {
    NAME = "NAME",
    DOMAIN = "DOMAIN",
    ASSOCIATED_DOMAIN = "ASSOCIATED_DOMAIN",
    ADMIN_EMAIL = "ADMIN_EMAIL",
    ORGANIZATION_ID = "ORGANIZATION_ID"
}

export enum UserSearchField {
    NAME = "NAME",
    EMAIL = "EMAIL",
    EMAIL_DOMAIN = "EMAIL_DOMAIN"
}

export enum CommunityTemplateFilterStatus {
    LIVE = "LIVE",
    UNPUBLISH = "UNPUBLISH"
}

export enum SearchUserByAdminStatus {
    USER_RESTRICTED = "USER_RESTRICTED"
}

export enum CommunityTemplateSearchField {
    NAME = "NAME"
}

export enum MergeAccountOptions {
    REPLACE_EXISTING_EMAIL = "REPLACE_EXISTING_EMAIL",
    REPLACE_NOT_EXISTING_EMAIL = "REPLACE_NOT_EXISTING_EMAIL",
    MERGE_INTO_CURRENT_EMAIL = "MERGE_INTO_CURRENT_EMAIL",
    MERGE_INTO_NEW_EMAIL = "MERGE_INTO_NEW_EMAIL"
}

export enum ChangeEmailAbility {
    ELIGIBLE = "ELIGIBLE",
    DOMAIN_RESTRICTED = "DOMAIN_RESTRICTED",
    PREMIUM_REQUIRED = "PREMIUM_REQUIRED"
}

export enum InviteType {
    ORGANIZATION = "ORGANIZATION"
}

export enum AuthenType {
    CIRCLE_FREE = "CIRCLE_FREE",
    CIRCLE_BUSINESS = "CIRCLE_BUSINESS",
    INDIVIDUAL_PROFESSIONAL = "INDIVIDUAL_PROFESSIONAL",
    TEMPLATES_OPEN = "TEMPLATES_OPEN",
    NORMAL = "NORMAL"
}

export enum LoginService {
    GOOGLE = "GOOGLE",
    DROPBOX = "DROPBOX",
    APPLE = "APPLE",
    EMAIL_PASSWORD = "EMAIL_PASSWORD",
    MICROSOFT = "MICROSOFT",
    XERO = "XERO",
    SAML_SSO = "SAML_SSO"
}

export enum SortStrategy {
    ASC = "ASC",
    DESC = "DESC"
}

export enum CommunityTemplateState {
    DRAFT = "DRAFT",
    UNPUBLISH = "UNPUBLISH",
    LIVE = "LIVE"
}

export enum CommunityTemplateType {
    SYSTEM = "SYSTEM",
    USER = "USER"
}

export enum FormFieldDetection {
    signature = "signature",
    text_box = "text_box",
    check_box = "check_box",
    radio_box = "radio_box"
}

export enum FormFieldDetectionTrigger {
    automatic = "automatic",
    user_initiated = "user_initiated"
}

export enum DocumentSummarizationVote {
    UPVOTED = "UPVOTED",
    DOWNVOTED = "DOWNVOTED"
}

export enum DocumentSummarizationStatus {
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}

export enum SummarizationAvailability {
    EXISTING = "EXISTING",
    NONE = "NONE"
}

export enum senderDocumentType {
    TEAM = "TEAM",
    INDIVIDUAL = "INDIVIDUAL"
}

export enum DocumentRole {
    EDITOR = "EDITOR",
    VIEWER = "VIEWER",
    SHARER = "SHARER",
    SPECTATOR = "SPECTATOR"
}

export enum ShareLinkPermission {
    VIEWER = "VIEWER",
    EDITOR = "EDITOR",
    SPECTATOR = "SPECTATOR"
}

export enum ShareLinkType {
    ANYONE = "ANYONE",
    INVITED = "INVITED"
}

export enum OwnedFilterCondition {
    BY_ANYONE = "BY_ANYONE",
    BY_ME = "BY_ME",
    NOT_BY_ME = "NOT_BY_ME"
}

export enum LastModifiedFilterCondition {
    MODIFIED_BY_ME = "MODIFIED_BY_ME",
    MODIFIED_BY_ANYONE = "MODIFIED_BY_ANYONE"
}

export enum TypeOfDocument {
    TEAM = "TEAM",
    ORGANIZATION = "ORGANIZATION",
    PERSONAL = "PERSONAL",
    ORGANIZATION_TEAM = "ORGANIZATION_TEAM"
}

export enum DestinationType {
    PERSONAL = "PERSONAL",
    ORGANIZATION = "ORGANIZATION",
    ORGANIZATION_TEAM = "ORGANIZATION_TEAM"
}

export enum LocationType {
    PERSONAL = "PERSONAL",
    ORGANIZATION = "ORGANIZATION",
    ORGANIZATION_TEAM = "ORGANIZATION_TEAM",
    FOLDER = "FOLDER"
}

export enum DocumentTab {
    MY_DOCUMENT = "MY_DOCUMENT",
    SHARED_WITH_ME = "SHARED_WITH_ME",
    ORGANIZATION = "ORGANIZATION",
    STARRED = "STARRED",
    RECENT = "RECENT",
    TRENDING = "TRENDING",
    ACCESSIBLE = "ACCESSIBLE"
}

export enum RestoreOriginalPermission {
    NOT_ALLOWED = "NOT_ALLOWED",
    VIEW = "VIEW",
    RESTORE = "RESTORE"
}

export enum DocumentFromSourceEnum {
    USER_UPLOAD = "USER_UPLOAD",
    LUMIN_TEMPLATES_LIBRARY = "LUMIN_TEMPLATES_LIBRARY"
}

export enum AvailableCompressQuality {
    STANDARD = "STANDARD",
    MAXIMUM = "MAXIMUM"
}

export enum DocumentKindEnum {
    TEMPLATE = "TEMPLATE"
}

export enum ThirdPartyService {
    google = "google",
    dropbox = "dropbox",
    onedrive = "onedrive"
}

export enum SlackConversationType {
    CHANNEL = "CHANNEL",
    DIRECT_MESSAGE = "DIRECT_MESSAGE"
}

export enum DocumentTemplateSourceTypeEnum {
    PDF = "PDF",
    LUMIN = "LUMIN"
}

export enum EventScope {
    PERSONAL = "PERSONAL",
    TEAM = "TEAM",
    ORGANIZATION = "ORGANIZATION",
    ADMIN = "ADMIN",
    SYSTEM = "SYSTEM"
}

export enum AdminEventType {
    PAYMENT = "PAYMENT",
    ORGANIZATION = "ORGANIZATION",
    ADMIN = "ADMIN",
    USER = "USER",
    COMMUNITY_TEMPLATE = "COMMUNITY_TEMPLATE",
    TEMPLATE_CATEGORY = "TEMPLATE_CATEGORY"
}

export enum SatisfiedCategory {
    VeryDissatisfied = "VeryDissatisfied",
    Dissatisfied = "Dissatisfied",
    Neutral = "Neutral",
    Satisfied = "Satisfied",
    VerySatisfied = "VerySatisfied"
}

export enum ReasonTag {
    UnreliableStorage = "UnreliableStorage",
    ConfusingUX = "ConfusingUX",
    NoDemand = "NoDemand",
    SpecificFeedback = "SpecificFeedback"
}

export enum FolderChildType {
    FOLDER = "FOLDER",
    DOCUMENT = "DOCUMENT"
}

export enum InviteTeamRole {
    admin = "admin",
    moderator = "moderator",
    member = "member"
}

export enum NotificationTab {
    GENERAL = "GENERAL",
    INVITES = "INVITES",
    REQUESTS = "REQUESTS"
}

export enum NotificationProduct {
    LUMIN_PDF = "LUMIN_PDF",
    LUMIN_SIGN = "LUMIN_SIGN"
}

export enum OrganizationRole {
    ALL = "ALL",
    ORGANIZATION_ADMIN = "ORGANIZATION_ADMIN",
    BILLING_MODERATOR = "BILLING_MODERATOR",
    MEMBER = "MEMBER",
    TEAM_ADMIN = "TEAM_ADMIN"
}

export enum OrganizationRoleInvite {
    BILLING_MODERATOR = "BILLING_MODERATOR",
    MEMBER = "MEMBER"
}

export enum WorkspaceTemplate {
    ORGANIZATION = "ORGANIZATION",
    PERSONAL = "PERSONAL"
}

export enum TeamTemplateWorkspace {
    ORGANIZATION_TEAM = "ORGANIZATION_TEAM",
    PERSONAL = "PERSONAL"
}

export enum TypeRequestOrganization {
    ORGANIZATION = "ORGANIZATION",
    INVITE_ORGANIZATION = "INVITE_ORGANIZATION"
}

export enum MemberTypeOrganization {
    MEMBER = "MEMBER",
    GUEST = "GUEST",
    PENDING = "PENDING",
    REQUEST = "REQUEST"
}

export enum DocumentType {
    ORGANIZATION = "ORGANIZATION",
    ORGANIZATION_TEAM = "ORGANIZATION_TEAM"
}

export enum OrganizationDomainType {
    POPULAR_DOMAIN = "POPULAR_DOMAIN",
    BLACKLIST_DOMAIN = "BLACKLIST_DOMAIN",
    EXISTED_DOMAIN = "EXISTED_DOMAIN",
    ASSCOCIATE_DOMAIN = "ASSCOCIATE_DOMAIN"
}

export enum DomainVisibilitySetting {
    INVITE_ONLY = "INVITE_ONLY",
    VISIBLE_AUTO_APPROVE = "VISIBLE_AUTO_APPROVE",
    VISIBLE_NEED_APPROVE = "VISIBLE_NEED_APPROVE"
}

export enum JoinOrganizationStatus {
    CAN_JOIN = "CAN_JOIN",
    CAN_REQUEST = "CAN_REQUEST",
    PENDING_INVITE = "PENDING_INVITE",
    REQUESTED = "REQUESTED"
}

export enum RejectType {
    NORMAL = "NORMAL",
    FOREVER = "FOREVER"
}

export enum OrganizationTemplateTabs {
    ORGANIZATION = "ORGANIZATION",
    ORGANIZATION_ALL = "ORGANIZATION_ALL",
    ORGANIZATION_PERSONAL = "ORGANIZATION_PERSONAL"
}

export enum CreateOrganizationSubscriptionPlans {
    ORG_STARTER = "ORG_STARTER",
    ORG_PRO = "ORG_PRO",
    ORG_BUSINESS = "ORG_BUSINESS"
}

export enum UpgradeOrganizationSubscriptionPlans {
    BUSINESS = "BUSINESS",
    ORG_STARTER = "ORG_STARTER",
    ORG_PRO = "ORG_PRO",
    ORG_BUSINESS = "ORG_BUSINESS"
}

export enum OrganizationPurpose {
    PERSONAL = "PERSONAL",
    WORK = "WORK",
    EDUCATION = "EDUCATION"
}

export enum InviteUsersSetting {
    ANYONE_CAN_INVITE = "ANYONE_CAN_INVITE",
    ADMIN_BILLING_CAN_INVITE = "ADMIN_BILLING_CAN_INVITE"
}

export enum AvatarSuggestionSource {
    external_logo = "external_logo"
}

export enum UpdateSignWsPaymentActions {
    ASSIGN_SEAT = "ASSIGN_SEAT",
    UNASSIGN_SEAT = "UNASSIGN_SEAT",
    REACTIVATE_SUBSCRIPTION = "REACTIVATE_SUBSCRIPTION",
    RENEW_SUCCESS_SUBSCRIPTION = "RENEW_SUCCESS_SUBSCRIPTION",
    CANCELED_SUBSCRIPTION = "CANCELED_SUBSCRIPTION",
    REJECT_SIGN_SEAT_REQUEST = "REJECT_SIGN_SEAT_REQUEST"
}

export enum ExtraTrialDaysOrganizationAction {
    INVITE_MEMBER = "INVITE_MEMBER"
}

export enum RetrieveOrganizationSetupIntentType {
    SUTTON_BANK_REROUTING = "SUTTON_BANK_REROUTING"
}

export enum PromptInviteBannerType {
    PENDING_REQUEST = "PENDING_REQUEST",
    GOOGLE_CONTACT = "GOOGLE_CONTACT",
    INVITE_MEMBER = "INVITE_MEMBER"
}

export enum PaymentType {
    INDIVIDUAL = "INDIVIDUAL",
    TEAM = "TEAM",
    ORGANIZATION = "ORGANIZATION"
}

export enum CustomerCreationMethod {
    PAYMENT_METHOD = "PAYMENT_METHOD",
    SOURCE_TOKEN = "SOURCE_TOKEN"
}

export enum FreeTrialIssuer {
    PAYMENT_METHOD = "PAYMENT_METHOD",
    SOURCE = "SOURCE"
}

export enum PaymentPlanSubscription {
    PROFESSIONAL = "PROFESSIONAL",
    PERSONAL = "PERSONAL",
    BUSINESS = "BUSINESS",
    ENTERPRISE = "ENTERPRISE",
    ORG_STARTER = "ORG_STARTER",
    ORG_PRO = "ORG_PRO",
    ORG_BUSINESS = "ORG_BUSINESS"
}

export enum UnifySubscriptionProduct {
    PDF = "PDF",
    SIGN = "SIGN"
}

export enum UnifySubscriptionPlan {
    ORG_STARTER = "ORG_STARTER",
    ORG_PRO = "ORG_PRO",
    ORG_BUSINESS = "ORG_BUSINESS",
    ORG_SIGN_PRO = "ORG_SIGN_PRO"
}

export enum DocStackPlan {
    ORG_STARTER = "ORG_STARTER",
    ORG_PRO = "ORG_PRO",
    ORG_BUSINESS = "ORG_BUSINESS"
}

export enum PaymentTypeSubscription {
    INDIVIDUAL = "INDIVIDUAL",
    ORGANIZATION = "ORGANIZATION"
}

export enum PaymentPeriod {
    MONTHLY = "MONTHLY",
    ANNUAL = "ANNUAL"
}

export enum Currency {
    USD = "USD",
    NZD = "NZD",
    CAD = "CAD",
    EUR = "EUR"
}

export enum CancelStrategy {
    IMMEDIATELY = "IMMEDIATELY",
    END_PERIOD = "END_PERIOD"
}

export enum BillingWarningType {
    SUBSCRIPTION_REMAINING_DATE = "SUBSCRIPTION_REMAINING_DATE",
    CANCELED_SUBSCRIPTION = "CANCELED_SUBSCRIPTION",
    RENEW_ATTEMPT = "RENEW_ATTEMPT",
    UNPAID_SUBSCRIPTION = "UNPAID_SUBSCRIPTION",
    TIME_SENSITIVE_COUPON = "TIME_SENSITIVE_COUPON"
}

export enum CloseBillingBannerType {
    SUBSCRIPTION_REMAINING_DATE = "SUBSCRIPTION_REMAINING_DATE",
    CANCELED_SUBSCRIPTION = "CANCELED_SUBSCRIPTION"
}

export enum PriceVersion {
    V1 = "V1",
    V2 = "V2",
    V3 = "V3"
}

export enum CardWallet {
    APPLE_PAY = "APPLE_PAY",
    GOOGLE_PAY = "GOOGLE_PAY"
}

export enum OldPlans {
    BUSINESS = "BUSINESS",
    PROFESSIONAL = "PROFESSIONAL",
    PERSONAL = "PERSONAL",
    FREE_TRIAL_30 = "FREE_TRIAL_30"
}

export enum PaymentMethodType {
    CARD = "CARD",
    LINK = "LINK",
    CASHAPP = "CASHAPP"
}

export enum TemplateOwnerType {
    PERSONAL = "PERSONAL",
    ORGANIZATION = "ORGANIZATION",
    ORGANIZATION_TEAM = "ORGANIZATION_TEAM",
    ORGANIZATION_PERSONAL = "ORGANIZATION_PERSONAL"
}

export enum CounterType {
    VIEW = "VIEW",
    DOWNLOAD = "DOWNLOAD"
}

export enum PresignedTargetType {
    User = "User",
    Organization = "Organization",
    Team = "Team"
}

export enum UploadDocFrom {
    EditPdf = "EditPdf"
}

export enum EntitySearchType {
    DOCUMENT = "DOCUMENT",
    ORGANIZATION = "ORGANIZATION",
    ORGANIZATION_TEAM = "ORGANIZATION_TEAM",
    ORGANIZATION_CREATION = "ORGANIZATION_CREATION",
    ORGANIZATION_TEAM_CREATION = "ORGANIZATION_TEAM_CREATION",
    ORGANIZATION_GRANT_BILLING = "ORGANIZATION_GRANT_BILLING"
}

export enum RatingModalStatus {
    NEVER_INTERACT = "NEVER_INTERACT",
    OPEN = "OPEN",
    HIDE = "HIDE"
}

export enum UserMetadataEnums {
    hasShownTourGuide = "hasShownTourGuide",
    hasShownAutoSyncModal = "hasShownAutoSyncModal",
    hasShownEditFileOfflinePopover = "hasShownEditFileOfflinePopover",
    hasShownContentEditPopover = "hasShownContentEditPopover",
    hasShownAutoSyncDefault = "hasShownAutoSyncDefault",
    introduceNewLayout = "introduceNewLayout",
    isHiddenSuggestedOrganization = "isHiddenSuggestedOrganization",
    isUsingNewLayout = "isUsingNewLayout",
    isUsingNewInAppLayout = "isUsingNewInAppLayout",
    introduceNewInAppLayout = "introduceNewInAppLayout",
    hasShowOnboardingFlowFromOpenGoogle = "hasShowOnboardingFlowFromOpenGoogle",
    isAgreementTourGuideVisible = "isAgreementTourGuideVisible",
    hasShownEditInAgreementGenModal = "hasShownEditInAgreementGenModal",
    hasShownSharePrompt = "hasShownSharePrompt",
    hasClosedQuickSearchGuideline = "hasClosedQuickSearchGuideline"
}

export enum ExploredFeatureKeys {
    EDIT_PDF = "EDIT_PDF",
    FORM_BUILDER = "FORM_BUILDER",
    SPLIT_PDF = "SPLIT_PDF",
    OCR = "OCR",
    SUMMARIZATION = "SUMMARIZATION",
    PROTECT_PDF = "PROTECT_PDF",
    REDACT_PDF = "REDACT_PDF"
}

export enum GuideType {
    ORGANIZATION_FEATURE = "ORGANIZATION_FEATURE"
}

export enum SearchUserStatus {
    USER_ADDED = "USER_ADDED",
    USER_VALID = "USER_VALID",
    USER_NOT_BELONG_TO_ORG = "USER_NOT_BELONG_TO_ORG",
    USER_DELETING = "USER_DELETING",
    USER_UNALLOWED = "USER_UNALLOWED",
    USER_EXTERNAL_ORG = "USER_EXTERNAL_ORG",
    USER_RESTRICTED = "USER_RESTRICTED"
}

export enum GetGoogleContactsContext {
    ONBOARDING_FLOW = "ONBOARDING_FLOW",
    INVITE_ORG_MEMBER = "INVITE_ORG_MEMBER"
}

export enum UserAnnotationType {
    RUBBER_STAMP = "RUBBER_STAMP"
}

export enum WidgetType {
    DOWNLOAD_PWA = "DOWNLOAD_PWA",
    DOWNLOAD_MOBILE_APP = "DOWNLOAD_MOBILE_APP",
    REDACTION = "REDACTION",
    UPGRADE_PROFESSIONAL = "UPGRADE_PROFESSIONAL",
    EDIT_PDF = "EDIT_PDF",
    RESTORE_ORIGINAL = "RESTORE_ORIGINAL",
    TEMPLATES = "TEMPLATES"
}

export class GetAdminListInput {
    searchKey?: Nullable<string>;
    limit: number;
    offset: number;
    sortOptions?: Nullable<AdminSortOptions>;
    filterOptions?: Nullable<AdminFilterOptions>;
}

export class BlacklistSortOptions {
    createdAt?: Nullable<SortStrategy>;
}

export class GetBlacklistInput {
    searchKey?: Nullable<string>;
    limit: number;
    offset: number;
    sortOptions?: Nullable<BlacklistSortOptions>;
}

export class AdminSortOptions {
    createdAt?: Nullable<SortStrategy>;
}

export class AdminFilterOptions {
    role?: Nullable<AdminRole>;
    status?: Nullable<AdminStatus>;
}

export class GetUserListInput {
    searchQuery?: Nullable<UserSearchQuery>;
    limit: number;
    offset: number;
    sortOptions?: Nullable<UserSortOptions>;
    filterOptions?: Nullable<UserFilterOptions>;
}

export class UserSearchQuery {
    key?: Nullable<string>;
    field: UserSearchField;
}

export class UserSortOptions {
    createdAt?: Nullable<SortStrategy>;
}

export class UserFilterOptions {
    status?: Nullable<UserStatus>;
}

export class CreateAdminInput {
    email: string;
    role: AdminSetRole;
}

export class SetAdminRoleInput {
    adminId: string;
    role: AdminSetRole;
}

export class FilterOptions {
    type?: Nullable<OrganizationTypeFilter>;
    plan?: Nullable<OrganizationPlan>;
    status?: Nullable<InvoiceStatus>;
}

export class OrganizationSortOptions {
    createdAt?: Nullable<SortStrategy>;
}

export class GetOrganizationsInput {
    searchQuery?: Nullable<OrganizationSearchQuery>;
    limit: number;
    offset: number;
    sortOptions?: Nullable<OrganizationSortOptions>;
    filterOptions?: Nullable<FilterOptions>;
}

export class OrganizationSearchQuery {
    key?: Nullable<string>;
    field: OrganizationSearchField;
}

export class CreatePaymentLinkInput {
    orgId: string;
    priceId: string;
    quantity: number;
    billingEmail: string;
    expireDays: number;
    couponCode?: Nullable<string>;
}

export class PreviewUpcomingInvoiceInput {
    priceId: string;
    quantity: number;
    couponCode?: Nullable<string>;
    stripeAccountId?: Nullable<string>;
}

export class CreateOrgByAdminInput {
    name: string;
    adminEmail: string;
    type?: Nullable<OrganizationType>;
    members?: Nullable<Nullable<InviteToOrganizationInput>[]>;
    settings: OrganizationSettingInput;
    purpose: OrganizationPurpose;
}

export class UpdateAdminProfileInput {
    name: string;
    avatarAction?: Nullable<AvatarAction>;
}

export class ChangeAdminPasswordInput {
    currentPassword: string;
    newPassword: string;
}

export class CancelPlanByAdminInput {
    targetId: string;
    targetType: CancelPlanTarget;
    cancelStrategy: CancelStrategy;
}

export class RemoveAssociateDomainInput {
    orgId: string;
    associateDomain: string;
}

export class GetCommunityTemplatesInput {
    searchQuery?: Nullable<CommunityTemplateSearchQuery>;
    limit: number;
    offset: number;
    sortOptions?: Nullable<CommunityTemplateSortOptions>;
    type: CommunityTemplateType;
    filterOptions?: Nullable<CommunityTemplateFilterOptions>;
}

export class CommunityTemplateSearchQuery {
    value?: Nullable<string>;
    field: CommunityTemplateSearchField;
}

export class CommunityTemplateSortOptions {
    lastUpdate?: Nullable<SortStrategy>;
    status?: Nullable<SortStrategy>;
}

export class CommunityTemplateFilterOptions {
    status?: Nullable<CommunityTemplateFilterStatus>;
    hasDraft?: Nullable<boolean>;
    categoryId?: Nullable<string>;
}

export class PreviewPaymentLinkInvoiceInput {
    orgId: string;
    period: PaymentPeriod;
    plan: DocStackPlan;
    couponCode?: Nullable<string>;
    quantity: number;
    currency: Currency;
}

export class CreateDocStackPaymentLinkInput {
    orgId: string;
    period: PaymentPeriod;
    plan: DocStackPlan;
    couponCode?: Nullable<string>;
    quantity: number;
    billingEmail: string;
    expireDays: number;
    currency: Currency;
}

export class ChangeUserEmailInput {
    currentEmail: string;
    newEmail: string;
    mergeOption: MergeAccountOptions;
    mergeDestination?: Nullable<string>;
}

export class VerifyEmailChangeDomainRulesInput {
    currentEmail: string;
    newEmail: string;
}

export class RedirectData {
    authType?: Nullable<AuthenType>;
    plan?: Nullable<PaymentPlanSubscription>;
    period?: Nullable<PaymentPeriod>;
    promotionCode?: Nullable<string>;
    isTrial?: Nullable<boolean>;
}

export class SignUpInput {
    email: string;
    password: string;
    name: string;
    landingPageToken?: Nullable<string>;
    sharingToken?: Nullable<string>;
    invitationType?: Nullable<InviteType>;
    redirectData?: Nullable<RedirectData>;
    loginService?: Nullable<LoginService>;
    origin?: Nullable<string>;
    browserLanguageCode?: Nullable<string>;
    openTemplateData?: Nullable<OpenTemplateData>;
}

export class OpenTemplateData {
    templateId: number;
    source?: Nullable<string>;
}

export class SignUpInvitationInput {
    password: string;
    name: string;
    invitationToken?: Nullable<string>;
    invitationType?: Nullable<InviteType>;
    loginService?: Nullable<LoginService>;
    browserLanguageCode?: Nullable<string>;
}

export class SignInByGoogleInput {
    idToken: string;
    timezoneOffset: number;
    platform?: Nullable<string>;
    context?: Nullable<AuthenType>;
    invitationToken?: Nullable<string>;
    browserLanguageCode?: Nullable<string>;
}

export class SignInByGoogleInputV2 {
    code?: Nullable<string>;
    accessToken?: Nullable<string>;
    timezoneOffset: number;
    platform?: Nullable<string>;
    context?: Nullable<AuthenType>;
    browserLanguageCode?: Nullable<string>;
}

export class AdminCreatePasswordInput {
    token: string;
    name: string;
    password: string;
}

export class SignInByDropboxInput {
    code: string;
    timezoneOffset: number;
    context?: Nullable<AuthenType>;
    invitationToken?: Nullable<string>;
    browserLanguageCode?: Nullable<string>;
}

export class SignInByAppleInput {
    idToken: string;
    nonce: string;
    name?: Nullable<string>;
    timezoneOffset: number;
}

export class SignOutInput {
    token: string;
    refreshToken: string;
    type?: Nullable<string>;
}

export class VerifyEmailInput {
    token: string;
}

export class ResendVerifyEmailInput {
    email: string;
}

export class ForgotPasswordInput {
    email: string;
    responseKey?: Nullable<string>;
    origin?: Nullable<string>;
}

export class ResetPasswordInput {
    token: string;
    password: string;
    stayLoggedIn: boolean;
}

export class SignInInput {
    email: string;
    password: string;
    timezoneOffset: number;
}

export class VerifyTokenInput {
    timezoneOffset?: Nullable<number>;
    invitationToken?: Nullable<string>;
}

export class CheckResetPasswordInput {
    token: string;
    refreshToken?: Nullable<string>;
}

export class DraftTemplateInput {
    name?: Nullable<string>;
    url?: Nullable<string>;
    deleteThumbnailIds?: Nullable<string[]>;
    description?: Nullable<string>;
    categories?: Nullable<string[]>;
    metaTitle?: Nullable<string>;
    metaDescription?: Nullable<string>;
    metaKeywords?: Nullable<string[]>;
}

export class PublishedTemplateFilterOptions {
    categoryId?: Nullable<string>;
    categorySlug?: Nullable<string>;
}

export class GetPublishedTemplatesInput {
    searchQuery?: Nullable<CommunityTemplateSearchQuery>;
    limit: number;
    offset: number;
    sortOptions?: Nullable<CommunityTemplateSortOptions>;
    filterOptions?: Nullable<PublishedTemplateFilterOptions>;
}

export class TemplateCategorySortOptions {
    updatedAt?: Nullable<SortStrategy>;
    numberTemplateBonded?: Nullable<SortStrategy>;
}

export class GetTemplateCategoryInput {
    searchQuery?: Nullable<CommunityTemplateSearchQuery>;
    limit: number;
    offset: number;
    sortOptions?: Nullable<TemplateCategorySortOptions>;
}

export class EditCommunityTemplateInput {
    templateId: string;
    draft: DraftTemplateInput;
}

export class AdminUploadTemplateInput {
    name: string;
    url: string;
    description: string;
    categories?: Nullable<string[]>;
    metaTitle?: Nullable<string>;
    metaDescription?: Nullable<string>;
    metaKeywords?: Nullable<string[]>;
}

export class EditTemplateCategoryInput {
    name: string;
    categoryId: string;
}

export class CreateDeviceTrackingInput {
    deviceId: string;
    userId?: Nullable<string>;
    platform: string;
    deviceModel: string;
    apiLevel: number;
    isRooted: boolean;
}

export class UpdateDocumentActionPermissionSettingsInput {
    documentId: string;
    principles: string[];
}

export class ProcessDocumentForChatbotInput {
    documentId: string;
    requestNewPutObjectUrl?: Nullable<boolean>;
}

export class GetPresignedUrlForAttachedFilesInput {
    documentId: string;
    attachedFileId?: Nullable<string>;
}

export class SaveAttachedFilesMetadataInput {
    chatSessionId: string;
    s3RemoteId: string;
    etag: string;
    totalPages: number;
}

export class CheckAttachedFilesMetadataInput {
    chatSessionId: string;
    etag: string;
}

export class CompressOptionsInput {
    compressLevel: string;
    isDownSample: boolean;
    dpiImage: number;
    isEmbedFont: boolean;
    isSubsetFont: boolean;
    removeAnnotation: boolean;
    removeDocInfo: boolean;
    documentPassword?: Nullable<string>;
}

export class GetCompressDocumentPresignedUrlInput {
    sessionId: string;
    documentId: string;
    compressOptions?: Nullable<CompressOptionsInput>;
}

export class CreatePresignedFormFieldDetectionUrlInput {
    documentId: string;
    fieldType?: Nullable<FormFieldDetection>;
    triggerAction?: Nullable<FormFieldDetectionTrigger>;
    pages?: Nullable<number[]>;
}

export class BatchCreatePresignedFormFieldDetectionUrlInput {
    documentId: string;
    fieldType?: Nullable<FormFieldDetection>;
    pages: number[][];
}

export class BoundingRectanglePayload {
    x1?: Nullable<number>;
    y1?: Nullable<number>;
    x2?: Nullable<number>;
    y2?: Nullable<number>;
}

export class DetectedFormFieldInput {
    boundingRectangle: BoundingRectanglePayload;
    fieldType: FormFieldDetection;
    fieldId: string;
    pageNumber: number;
    score?: Nullable<number>;
}

export class PredictionFieldDataInput {
    appliedFormFields: DetectedFormFieldInput[];
    predictions: DetectedFormFieldInput[];
    sessionId: string;
}

export class ProcessAppliedFormFieldsInput {
    documentId: string;
    predictionFieldDataList: PredictionFieldDataInput[];
}

export class RegenerateSummarizationInput {
    text: string;
}

export class GetDocSummarizationOptions {
    regenerate: RegenerateSummarizationInput;
}

export class UpdateDocSummarizationInput {
    vote?: Nullable<DocumentSummarizationVote>;
}

export class UpdateDocumentTemplateListInput {
    clientId: string;
}

export class DeleteDocumentTemplateInput {
    documentId: string;
    clientId: string;
}

export class CreateDocumentFromDocumentTemplateInput {
    documentId: string;
    destinationId: string;
}

export class ShareSettingInput {
    link?: Nullable<string>;
    permission?: Nullable<ShareLinkPermission>;
    linkType?: Nullable<ShareLinkType>;
}

export class DocumentInput {
    name: string;
    ownerId?: Nullable<string>;
    remoteId: string;
    remoteEmail?: Nullable<string>;
    size?: Nullable<number>;
    isPersonal?: Nullable<boolean>;
    service: ThirdPartyService;
    mimeType: string;
    lastAccess?: Nullable<Date>;
    thumbnail?: Nullable<string>;
    lastModifiedBy?: Nullable<string>;
    externalStorageAttributes?: Nullable<Object>;
}

export class DeleteDocumentInput {
    documentId?: Nullable<string>;
    clientId: string;
    isNotify?: Nullable<boolean>;
}

export class CreateDocumentsInput {
    documents: Nullable<DocumentInput>[];
    clientId: string;
    folderId?: Nullable<string>;
}

export class GetMembersByDocumentIdInput {
    minQuantity: number;
    documentId: string;
    cursor?: Nullable<string>;
}

export class ChangeDocumentPermissionInput {
    documentId: string;
    clientId: string;
}

export class ChangeDocumentPermissionInputPersonal {
    documentId: string;
    clientId: string;
    notificationId?: Nullable<string>;
}

export class DocumentRequestAccessInput {
    documentId: string;
    cursor?: Nullable<string>;
    limit?: Nullable<number>;
}

export class RenameDocumentInput {
    documentId: string;
    newDocumentName: string;
}

export class UpdateDocumentListInput {
    clientId: string;
    folderId?: Nullable<string>;
}

export class UpdateDocumentInfoInput {
    clientId: string;
    folderId?: Nullable<string>;
}

export class UpdateDocumentBookmarkInput {
    clientId: string;
    documentId: string;
}

export class BookmarkInput {
    page: number;
    message: string;
}

export class UpdateBookmarksInput {
    documentId: string;
    bookmarks: Nullable<BookmarkInput>[];
}

export class UpdateThumbnailInput {
    documentId: string;
    thumbnail: string;
    clientId: string;
}

export class ManipulationDocumentInput {
    documentId: string;
    refId: string;
    type?: Nullable<string>;
    option?: Nullable<Object>;
    createdAt?: Nullable<Date>;
    id?: Nullable<string>;
}

export class CreateDocumentPermissionInput {
    shareUserList: Nullable<ShareUser>[];
    removeShareUserList: Nullable<string>[];
    documentId: string;
    clientId?: Nullable<string>;
    sharerName: string;
    sharerAvatar: string;
    documentName: string;
}

export class UpdateDocumentPermissionInput {
    documentId: string;
    role: DocumentRole;
    email: string;
}

export class RemoveDocumentPermissionInput {
    documentId: string;
    email: string;
}

export class ShareUser {
    documentId: string;
    role: DocumentRole;
    shareClientId: string;
    email: string;
    isNew?: Nullable<boolean>;
}

export class DocumentFilterInput {
    ownedFilterCondition?: Nullable<OwnedFilterCondition>;
    lastModifiedFilterCondition?: Nullable<LastModifiedFilterCondition>;
}

export class DocumentQueryInput {
    cursor?: Nullable<string>;
    searchKey?: Nullable<string>;
    minimumQuantity: number;
}

export class GetPersonalWorkspaceDocumentsInput {
    query: DocumentQueryInput;
    filter: DocumentFilterInput;
    tab: DocumentTab;
}

export class GetOrganizationDocumentsInput {
    orgId: string;
    query: DocumentQueryInput;
    filter: DocumentFilterInput;
    tab: DocumentTab;
}

export class GetOrganizationTeamDocumentsInput {
    teamId: string;
    query: DocumentQueryInput;
    filter: DocumentFilterInput;
    tab?: Nullable<DocumentTab>;
}

export class GetDocumentFormInput {
    category?: Nullable<string>;
    pageNumber?: Nullable<number>;
}

export class MentionListInput {
    documentId: string;
    searchKey?: Nullable<string>;
    excludeUserIds?: Nullable<Nullable<string>[]>;
}

export class PresignedUrlForImageInput {
    documentId: string;
    mimeType?: Nullable<string>;
}

export class PresignedUrlForMultiImagesInput {
    documentId: string;
    listMimeTypes: string[];
}

export class ShareDocumentInput {
    emails: Nullable<string>[];
    message?: Nullable<string>;
    documentId: string;
    role: DocumentRole;
}

export class UpdateShareSettingInput {
    linkType: ShareLinkType;
    permission: ShareLinkPermission;
    documentId: string;
}

export class StarDocumentInput {
    _id: string;
    clientId: string;
    documentId: string;
}

export class CreatePDFFormInput {
    _id: string;
    formStaticPath: string;
    source?: Nullable<string>;
    variationIdentifier?: Nullable<string>;
}

export class CreatePdfFromStaticToolUploadInput {
    encodedUploadData: string;
    orgId?: Nullable<string>;
}

export class RequestAccessDocumentInput {
    documentId: string;
    documentRole: DocumentRole;
    message?: Nullable<string>;
}

export class UpdateRequestAccessInput {
    documentId: string;
    requesterIds: string[];
}

export class DeleteMultipleDocumentInput {
    documentIds: Nullable<string>[];
    clientId: string;
    isNotify?: Nullable<boolean>;
}

export class CopiedDocumentInput {
    destinationId: string;
    destinationType: TypeOfDocument;
    documentName: string;
    notifyUpload?: Nullable<boolean>;
}

export class DuplicateDocumentInput {
    documentId: string;
    newDocumentData: CopiedDocumentInput;
}

export class DuplicateDocumentToFolderInput {
    documentId: string;
    folderId: string;
    documentName: string;
    notifyUpload?: Nullable<boolean>;
}

export class MoveDocumentsInput {
    documentIds: Nullable<string>[];
    destinationId: string;
    destinationType: DestinationType;
    isNotify?: Nullable<boolean>;
    documentName?: Nullable<string>;
}

export class MoveDocumentsToFolderInput {
    documentIds: Nullable<string>[];
    folderId: string;
    isNotify?: Nullable<boolean>;
    documentName?: Nullable<string>;
}

export class TemplateInput {
    name: string;
    description?: Nullable<string>;
}

export class CreateTemplateBaseOnDocumentInput {
    documentId: string;
    destinationId: string;
    destinationType: DestinationType;
    templateData: TemplateInput;
    isNotify?: Nullable<boolean>;
    isRemoveThumbnail?: Nullable<boolean>;
}

export class GetDocumentOutlinesInput {
    documentId: string;
}

export class ImportOutlineInput {
    name: string;
    parentId?: Nullable<string>;
    pathId: string;
    level?: Nullable<number>;
    pageNumber?: Nullable<number>;
    verticalOffset?: Nullable<number>;
    horizontalOffset?: Nullable<number>;
    hasChildren?: Nullable<boolean>;
}

export class ImportDocumentOutlinesInput {
    documentId: string;
    outlineChunk: Nullable<ImportOutlineInput>[];
    totalOutlines: number;
    isInsertMultiple?: Nullable<boolean>;
}

export class BulkUpdateDocumentPermissionInput {
    documentId: string;
    role: DocumentRole;
}

export class DeleteSharedDocumentsInput {
    documentIds: Nullable<string>[];
}

export class CreateDocumentBackupInfoInput {
    encodedUploadData: string;
    documentId: string;
}

export class DeleteDocumentImagesInput {
    remoteIds: Nullable<string>[];
    documentId: string;
}

export class CheckDownloadMultipleDocumentsInput {
    orgId?: Nullable<string>;
    documentIds?: Nullable<string[]>;
    folderIds?: Nullable<string[]>;
}

export class UpdateStackedDocumentsInput {
    documentIds: string[];
}

export class SlackConversation {
    id: string;
    type: SlackConversationType;
    isPrivate?: Nullable<boolean>;
}

export class ShareDocumentInSlackInput {
    documentId: string;
    slackTeamId: string;
    conversation: SlackConversation;
    role: DocumentRole;
    sharingMode: ShareLinkType;
    message?: Nullable<string>;
    isOverwritePermission?: Nullable<boolean>;
}

export class PreCheckShareDocumentInSlackInput {
    documentId: string;
    slackTeamId: string;
    conversation: SlackConversation;
}

export class CheckShareThirdPartyDocumentInput {
    documentId: string;
}

export class GetOrganizationDocumentTemplatesInput {
    orgId: string;
    query: DocumentQueryInput;
    tab: DocumentTab;
}

export class GetOrganizationTeamDocumentTemplatesInput {
    teamId: string;
    query: DocumentQueryInput;
    tab?: Nullable<DocumentTab>;
}

export class GetDocumentVersionListInput {
    documentId: string;
}

export class GetBackupAnnotationPresignedUrlInput {
    documentId: string;
}

export class GetVersionPresignedUrlInput {
    _id: string;
}

export class DateRangeFilter {
    startDate?: Nullable<Date>;
    endDate?: Nullable<Date>;
}

export class TargetFilter {
    orgId?: Nullable<string>;
    adminId?: Nullable<string>;
    userId?: Nullable<string>;
}

export class EventFilterOptions {
    createdDateRange?: Nullable<DateRangeFilter>;
    type?: Nullable<AdminEventType>;
    target?: Nullable<TargetFilter>;
    actorId?: Nullable<string>;
    isSystem?: Nullable<boolean>;
}

export class EventSortOptions {
    createdAt?: Nullable<SortStrategy>;
}

export class GetAdminEventsInput {
    filterOptions?: Nullable<EventFilterOptions>;
    sortOptions?: Nullable<EventSortOptions>;
    offset?: Nullable<number>;
    limit?: Nullable<number>;
}

export class CreateShareDocFeedbackInput {
    satisfiedCategory?: Nullable<SatisfiedCategory>;
    reasonTag?: Nullable<ReasonTag>;
    specificFeedback?: Nullable<string>;
}

export class CreateFormDetectionFeedbackInput {
    score: number;
    content?: Nullable<string>;
}

export class CreateMobileFeedbackInput {
    title: string;
    content: string;
    imageURLs?: Nullable<Nullable<string>[]>;
}

export class CreateFolderInput {
    name: string;
    color: string;
    parentId?: Nullable<string>;
}

export class GetFolderListInput {
    sortOptions?: Nullable<FolderSortOptions>;
    parentId?: Nullable<string>;
    isStarredTab?: Nullable<boolean>;
    searchKey?: Nullable<string>;
}

export class FolderSortOptions {
    name?: Nullable<SortStrategy>;
    createdAt?: Nullable<SortStrategy>;
}

export class CreateFolderSubscriptionInput {
    clientId: string;
    parentId?: Nullable<string>;
    isStarredTab?: Nullable<boolean>;
}

export class UpdateFolderSubscriptionInput {
    userId: string;
    folderId?: Nullable<string>;
    parentId?: Nullable<string>;
}

export class FolderEventSubscriptionInput {
    clientId: string;
}

export class EditFolderInput {
    folderId: string;
    updateProperties: UpdateFolderInfoProperties;
}

export class UpdateFolderInfoProperties {
    color?: Nullable<string>;
    name?: Nullable<string>;
}

export class GetDocumentsInFolderInput {
    folderId: string;
    query: DocumentQueryInput;
    filter: DocumentFilterInput;
}

export class FolderQueryInput {
    searchKey?: Nullable<string>;
}

export class GetFoldersInFolderInput {
    folderId: string;
    searchKey?: Nullable<string>;
    sortOptions?: Nullable<FolderSortOptions>;
}

export class GetTotalFoldersInput {
    refId: string;
    targetType: DestinationType;
}

export class DeleteMultipleFolderInput {
    folderIds: Nullable<string>[];
    isNotify?: Nullable<boolean>;
    clientId: string;
}

export class GetFolderTreeInput {
    folderId: string;
}

export class GetPDFFormTemplateInput {
    templateId: string;
}

export class MembershipInput {
    userId?: Nullable<string>;
    userEmail?: Nullable<string>;
    teamId?: Nullable<string>;
    role?: Nullable<InviteTeamRole>;
}

export class PendingInviteSortOptions {
    email?: Nullable<SortStrategy>;
}

export class ReadNotificationsInput {
    notificationIds?: Nullable<Nullable<string>[]>;
}

export class NewNotificationInput {
    userId?: Nullable<string>;
}

export class DeleteNotificationInput {
    userId?: Nullable<string>;
}

export class GetNotificationsInput {
    tab: NotificationTab;
    cursor?: Nullable<string>;
}

export class PaginationOption {
    nameSort?: Nullable<SortStrategy>;
    emailSort?: Nullable<SortStrategy>;
    joinSort?: Nullable<SortStrategy>;
    lastActivitySort?: Nullable<SortStrategy>;
    roleSort?: Nullable<OrganizationRole>;
}

export class GetRequesterInput {
    orgId: string;
    limit: number;
    offset: number;
    option?: Nullable<PaginationRequesterOption>;
    searchKey?: Nullable<string>;
}

export class PaginationRequesterOption {
    nameSort?: Nullable<SortStrategy>;
    requestDateSort?: Nullable<SortStrategy>;
}

export class GetMemberInput {
    orgId: string;
    limit: number;
    offset: number;
    option?: Nullable<PaginationOption>;
    searchKey?: Nullable<string>;
}

export class OrganizationOtherSettingsInput {
    guestInvite?: Nullable<string>;
}

export class InviteToOrganizationInput {
    email: string;
    role?: Nullable<OrganizationRoleInvite>;
}

export class PendingUserOrganizationInput {
    orgId: string;
    limit: number;
    offset: number;
    option?: Nullable<PaginationPendingTabOption>;
    searchKey?: Nullable<string>;
}

export class PaginationPendingTabOption {
    emailSort?: Nullable<SortStrategy>;
}

export class OrganizationProfileInput {
    name: string;
}

export class MemberRole {
    email: string;
    role: OrganizationRole;
}

export class SetOrganizationMembersRoleInput {
    orgId: string;
    members: MemberRole[];
}

export class AddMemberOrgTeamInput {
    luminUsers?: Nullable<Nullable<MembershipInput>[]>;
}

export class TransferTeamAdminInput {
    teamId: string;
    targetUserId: string;
}

export class TransferTeamsOwnershipInput {
    teams?: Nullable<TransferTeamAdminInput[]>;
    orgId: string;
    adminId: string;
}

export class CreateOrganizationFolderInput {
    name: string;
    color: string;
    orgId: string;
    parentId?: Nullable<string>;
    isNotify?: Nullable<boolean>;
}

export class CreateOrganizationTeamFolderInput {
    name: string;
    color: string;
    teamId: string;
    parentId?: Nullable<string>;
}

export class AddAssociateDomainInput {
    orgId: string;
    associateDomain: string;
}

export class EditAssociateDomainInput {
    orgId: string;
    newAssociateDomain: string;
    oldAssociateDomain: string;
}

export class CreateOrganizationSubscriptionInput {
    tokenId?: Nullable<string>;
    plan: CreateOrganizationSubscriptionPlans;
    period: PaymentPeriod;
    currency: Currency;
    couponCode?: Nullable<string>;
    quantity: number;
    stripeAccountId?: Nullable<string>;
    isBlockedPrepaidCardOnTrial?: Nullable<boolean>;
}

export class CreateUnifySubscriptionItem {
    productName: UnifySubscriptionProduct;
    planName: UnifySubscriptionPlan;
    quantity: number;
}

export class CreateUnifySubscriptionInput {
    paymentMethod?: Nullable<string>;
    couponCode?: Nullable<string>;
    stripeAccountId?: Nullable<string>;
    period: PaymentPeriod;
    currency: Currency;
    subscriptionItems: Nullable<CreateUnifySubscriptionItem>[];
    isBlockedPrepaidCardOnTrial?: Nullable<boolean>;
}

export class UpgradeOrganizationSubscriptionInput {
    plan: UpgradeOrganizationSubscriptionPlans;
    period: PaymentPeriod;
    quantity: number;
    sourceId?: Nullable<string>;
    couponCode?: Nullable<string>;
    isBlockedPrepaidCardOnTrial?: Nullable<boolean>;
}

export class PreviewUpcomingDocStackInvoiceInput {
    orgId: string;
    plan: DocStackPlan;
    period: PaymentPeriod;
    currency: Currency;
    startTrial?: Nullable<boolean>;
    couponCode?: Nullable<string>;
    stripeAccountId?: Nullable<string>;
}

export class PreviewUpcomingSubscriptionInvoiceInput {
    orgId: string;
    period: PaymentPeriod;
    currency: Currency;
    couponCode?: Nullable<string>;
    stripeAccountId?: Nullable<string>;
    startTrial?: Nullable<boolean>;
    subscriptionItems: CreateUnifySubscriptionItem[];
}

export class UploadDocumentToOrgInput {
    orgId: string;
    encodedUploadData: string;
    documentName: string;
    isNotify?: Nullable<boolean>;
    folderId?: Nullable<string>;
}

export class UploadDocumentToTeamInput {
    teamId: string;
    encodedUploadData: string;
    documentName: string;
    folderId?: Nullable<string>;
}

export class CreateOrganizationDocumentFormInput {
    formId: string;
    orgId: string;
}

export class CreateOrganizationInput {
    name: string;
    members?: Nullable<Nullable<InviteToOrganizationInput>[]>;
    settings?: Nullable<OrganizationSettingInput>;
    purpose?: Nullable<OrganizationPurpose>;
}

export class OrganizationSettingInput {
    domainVisibility?: Nullable<DomainVisibilitySetting>;
}

export class GetOrganizationFoldersInput {
    orgId: string;
    sortOptions?: Nullable<FolderSortOptions>;
    parentId?: Nullable<string>;
    isStarredTab?: Nullable<boolean>;
    searchKey?: Nullable<string>;
}

export class UpdateOrgTemplateWorkspaceInput {
    orgId: string;
    workspaceTemplate?: Nullable<WorkspaceTemplate>;
}

export class GetOrganizationTeamFoldersInput {
    teamId: string;
    sortOptions?: Nullable<FolderSortOptions>;
    parentId?: Nullable<string>;
    isStarredTab?: Nullable<boolean>;
    searchKey?: Nullable<string>;
}

export class GetRepresentativeMembersInput {
    orgId: string;
    teamId?: Nullable<string>;
}

export class RejectInvitationInput {
    orgId?: Nullable<string>;
    rejectType?: Nullable<RejectType>;
    invitationId: string;
    notificationId: string;
}

export class UploadPersonalDocumentInput {
    orgId: string;
    folderId?: Nullable<string>;
    documentId?: Nullable<string>;
}

export class UploadPersonalDocumentInputV2 {
    orgId: string;
    folderId?: Nullable<string>;
    documentId?: Nullable<string>;
    encodedUploadData: string;
    fileName?: Nullable<string>;
}

export class UploadThirdPartyDocumentsInput {
    orgId: string;
    folderId?: Nullable<string>;
    documents: DocumentInput[];
}

export class GetOrganizationResourcesInput {
    orgId: string;
    searchKey?: Nullable<string>;
    cursor?: Nullable<string>;
    limit?: Nullable<number>;
}

export class GetOrganizationFolderTreeInput {
    orgId: string;
    teamIds?: Nullable<string[]>;
}

export class RequestSignSeatInput {
    orgId: string;
    requestMessage?: Nullable<string>;
}

export class GetOrganizationTeamFolderTreeInput {
    teamId: string;
}

export class RetrieveOrganizationSetupIntentV2Input {
    orgId: string;
    reCaptchaTokenV3: string;
    type?: Nullable<RetrieveOrganizationSetupIntentType>;
    reCaptchaAction: string;
}

export class GetGoogleUsersNotInCircleInput {
    orgId: string;
    googleAuthorizationEmail: string;
    shareEmails: string[];
}

export class ExtraTrialDaysOrganizationInput {
    orgId: string;
    days: number;
    action: ExtraTrialDaysOrganizationAction;
}

export class GetPromptInviteUsersBannerInput {
    orgId: string;
    accessToken?: Nullable<string>;
    forceUpdate?: Nullable<boolean>;
    googleAuthorizationEmail?: Nullable<string>;
}

export class GetSuggestedUserToInviteInput {
    orgId: string;
    accessToken?: Nullable<string>;
    forceUpdate?: Nullable<boolean>;
    googleAuthorizationEmail?: Nullable<string>;
}

export class AssignSignSeatsInput {
    orgId: string;
    userIds: string[];
    isPublishUpdateSignWorkspacePayment?: Nullable<boolean>;
}

export class UnassignSignSeatsInput {
    orgId: string;
    userIds: string[];
}

export class RejectSignSeatRequestsInput {
    orgId: string;
    userIds: string[];
}

export class OrganizationInviteLinkInput {
    orgId: string;
    role?: Nullable<OrganizationRoleInvite>;
}

export class SamlSsoConfigurationInput {
    orgId: string;
    domains: string[];
    rawIdpMetadataXml: string;
}

export class ReactivateUnifySubscriptionSubItems {
    productName: UnifySubscriptionProduct;
}

export class ReactivateUnifySubscriptionInput {
    orgId: string;
    subscriptionItems: ReactivateUnifySubscriptionSubItems[];
}

export class GetUsersInvitableToOrgInput {
    orgId: string;
    userEmails: string[];
}

export class GetFoldersAvailabilityInput {
    orgId: string;
}

export class UploadPersonalDocumentTemplateInput {
    orgId: string;
    encodedUploadData: string;
    fileName?: Nullable<string>;
}

export class UploadDocumentTemplateToOrgInput {
    orgId: string;
    encodedUploadData: string;
    fileName: string;
}

export class UploadDocumentTemplateToTeamInput {
    teamId: string;
    encodedUploadData: string;
    fileName: string;
}

export class GetNextPaymentInfoInput {
    plan: PaymentPlanSubscription;
    period: PaymentPeriod;
    currency: Currency;
    clientId?: Nullable<string>;
    stripeAccountId?: Nullable<string>;
}

export class GetNextSubscriptionInfoSubItem {
    productName: UnifySubscriptionProduct;
    planName: UnifySubscriptionPlan;
}

export class GetNextSubscriptionInfoInput {
    period: PaymentPeriod;
    currency: Currency;
    clientId?: Nullable<string>;
    stripeAccountId?: Nullable<string>;
    subscriptionItems: GetNextSubscriptionInfoSubItem[];
}

export class SubscriptionInput {
    tokenId?: Nullable<string>;
    plan: PaymentPlanSubscription;
    period: PaymentPeriod;
    quantity: number;
    currency: Currency;
    couponCode?: Nullable<string>;
}

export class GetCouponValueInput {
    plan: PaymentPlanSubscription;
    period: PaymentPeriod;
    couponCode: string;
    currency: Currency;
    orgId?: Nullable<string>;
    stripeAccountId?: Nullable<string>;
}

export class GetSubscriptionCouponItems {
    planName: UnifySubscriptionPlan;
}

export class GetSubscriptionCouponInput {
    period: PaymentPeriod;
    couponCode: string;
    currency: Currency;
    orgId?: Nullable<string>;
    stripeAccountId?: Nullable<string>;
    subscriptionItems: GetSubscriptionCouponItems[];
}

export class SubscriptionTrialInput {
    issuedId?: Nullable<string>;
    issuer?: Nullable<CustomerCreationMethod>;
    period: PaymentPeriod;
    currency: Currency;
    plan: CreateOrganizationSubscriptionPlans;
    orgId: string;
    stripeAccountId?: Nullable<string>;
    isBlockedPrepaidCardOnTrial?: Nullable<boolean>;
}

export class CreateFreeTrialUnifySubscriptionInput {
    paymentMethod?: Nullable<string>;
    period: PaymentPeriod;
    currency: Currency;
    orgId: string;
    stripeAccountId?: Nullable<string>;
    isBlockedPrepaidCardOnTrial?: Nullable<boolean>;
    subscriptionItems: CreateUnifySubscriptionItem[];
}

export class UpgradeSubscriptionInput {
    plan: PaymentPlanSubscription;
    period: PaymentPeriod;
    currency: Currency;
    quantity?: Nullable<number>;
    sourceId?: Nullable<string>;
    couponCode?: Nullable<string>;
}

export class UpgradeUnifySubscriptionInput {
    paymentMethod?: Nullable<string>;
    period: PaymentPeriod;
    currency: Currency;
    isBlockedPrepaidCardOnTrial?: Nullable<boolean>;
    couponCode?: Nullable<string>;
    subscriptionItems: CreateUnifySubscriptionItem[];
}

export class CancelSubscriptionInput {
    clientId: string;
    type: PaymentType;
}

export class CancelUnifySubscriptionInputItem {
    productName: UnifySubscriptionProduct;
}

export class CancelUnifySubscriptionInput {
    clientId: string;
    type?: Nullable<PaymentType>;
    subscriptionItems?: Nullable<CancelUnifySubscriptionInputItem[]>;
}

export class GetCardInput {
    clientId: string;
    plan: PaymentPlanSubscription;
    type: PaymentType;
}

export class GetRemainingInput {
    clientId: string;
    plan: PaymentPlanSubscription;
    type: PaymentType;
    period: PaymentPeriod;
    currency: Currency;
    quantity: number;
    couponCode?: Nullable<string>;
}

export class CommonPaymentInput {
    clientId: string;
    type: PaymentType;
    plan?: Nullable<PaymentPlanSubscription>;
}

export class InvoicesInput {
    clientId: string;
    type: PaymentType;
}

export class GetBillingEmailInput {
    clientId: string;
    type: PaymentType;
}

export class GetBillingCycleOfPlanInput {
    plan: PaymentPlanSubscription;
    period: PaymentPeriod;
    currency: Currency;
    quantity: number;
    couponCode?: Nullable<string>;
    stripeAccountId?: Nullable<string>;
}

export class GetSubscriptionBillingCycleInput {
    period: PaymentPeriod;
    currency: Currency;
    couponCode?: Nullable<string>;
    stripeAccountId?: Nullable<string>;
    subscriptionItems: CreateUnifySubscriptionItem[];
}

export class CardInfo {
    number: string;
    expireMonth: number;
    expireYear: number;
    cvc: string;
}

export class UpdatePaymentMethodInput {
    paymentMethodId: string;
    clientId: string;
    plan?: Nullable<PaymentPlanSubscription>;
    type: PaymentType;
    email: string;
}

export class RetrieveSetupIntentV3Input {
    reCaptchaTokenV3: string;
    reCaptchaAction: string;
}

export class GetBelongsToOptions {
    detail?: Nullable<boolean>;
}

export class MembershipSortInput {
    roleValue?: Nullable<SortStrategy>;
    isOwner?: Nullable<SortStrategy>;
    _id?: Nullable<SortStrategy>;
    email?: Nullable<SortStrategy>;
    name?: Nullable<SortStrategy>;
}

export class QueryOptionsInput {
    sort?: Nullable<MembershipSortInput>;
    offset?: Nullable<number>;
    limit?: Nullable<number>;
    cursor?: Nullable<string>;
}

export class TeamInput {
    name?: Nullable<string>;
    avatarRemoteId?: Nullable<string>;
    ownerId?: Nullable<string>;
}

export class UpdateTeamsInput {
    clientId: string;
}

export class UpdateTeamSettingsInput {
    templateWorkspace?: Nullable<TeamTemplateWorkspace>;
}

export class GetTemplatesInput {
    searchKey?: Nullable<string>;
    limit: number;
    offset: number;
}

export class UploadPersonalTemplateInput {
    name: string;
    description: string;
}

export class UploadTeamTemplateInput {
    name: string;
    description: string;
    teamId: string;
}

export class UploadOrganizationTemplateInput {
    name: string;
    description: string;
    orgId: string;
    isNotify?: Nullable<boolean>;
}

export class UpdateTemplateCounterInput {
    templateId: string;
    type: CounterType;
    number: number;
}

export class DeleteTemplateInput {
    templateId: string;
    isNotify?: Nullable<boolean>;
}

export class EditTemplateInput {
    templateId: string;
    name: string;
    description: string;
    isRemoveThumbnail?: Nullable<boolean>;
}

export class GetPresignedUrlForUploadDocInput {
    documentMimeType: string;
    thumbnailMimeType?: Nullable<string>;
    documentKey?: Nullable<string>;
    thumbnailKey?: Nullable<string>;
    documentId?: Nullable<string>;
    uploadDocFrom?: Nullable<UploadDocFrom>;
}

export class GetPresignedUrlForLuminSignIntegrationInput {
    documentMimeType: string;
    documentKey?: Nullable<string>;
}

export class GetPresignedUrlForUploadThumbnailInput {
    thumbnailMimeType: string;
    thumbnailKey?: Nullable<string>;
}

export class UserQueryInput {
    notUserId?: Nullable<string>;
    searchText?: Nullable<string>;
}

export class ChangePasswordInput {
    refreshToken: string;
    currentPassword: string;
    newPassword: string;
}

export class EditUserInput {
    name?: Nullable<string>;
    avatarRemoteId?: Nullable<string>;
}

export class UpdateSettingInput {
    marketingEmail: boolean;
    subscriptionEmail: boolean;
    otherEmail: boolean;
    featureUpdateEmail: boolean;
    dataCollection: boolean;
    documentEmail: DocumentEmailInput;
    organizationEmail: OrganizationEmailInput;
}

export class IncreaseExploredFeatureUsageInput {
    key: ExploredFeatureKeys;
}

export class DocumentEmailInput {
    shareDocument: boolean;
    commentDocument: boolean;
    replyCommentDocument: boolean;
    mentionCommentDocument: boolean;
    requestAccessDocument: boolean;
}

export class OrganizationEmailInput {
    inviteToOrganization: boolean;
    inviteToOrganizationTeam: boolean;
}

export class UnsubscribeEmailMarketingInput {
    token: string;
}

export class ConfirmUpdatingAnnotInput {
    documentId: string;
    remoteId?: Nullable<string>;
    authorEmails?: Nullable<Nullable<string>[]>;
    action?: Nullable<string>;
}

export class HubspotPropertiesInput {
    key: string;
    value: string;
}

export class UserMetadataInput {
    key: UserMetadataEnums;
    value: boolean;
}

export class FindUserInput {
    searchKey?: Nullable<string>;
    targetType: EntitySearchType;
    targetId?: Nullable<string>;
    excludeUserIds?: Nullable<Nullable<string>[]>;
}

export class FindLocationInput {
    searchKey: string;
    orgId?: Nullable<string>;
    context: LocationType;
    cursor?: Nullable<string>;
}

export class MobileFeedbackModalStatusInput {
    status: RatingModalStatus;
    isRateLater?: Nullable<boolean>;
}

export class GetSignedUrlSignaturesInput {
    limit: number;
    offset: number;
}

export class UpdateSignaturePositionInput {
    signatureRemoteId: string;
    toPosition: number;
}

export class RatedAppInput {
    ratedScore: number;
}

export class GetGoogleContactInput {
    action?: Nullable<GetGoogleContactsContext>;
    orgId?: Nullable<string>;
    googleAuthorizationEmail: string;
}

export class AcceptNewTermsOfUseInput {
    orgId: string;
    teamId?: Nullable<string>;
}

export class GetUserAnnotationInput {
    skip: number;
    limit: number;
    type: UserAnnotationType;
}

export class AnnotationPropertyInput {
    bold?: Nullable<boolean>;
    italic?: Nullable<boolean>;
    strikeout?: Nullable<boolean>;
    underline?: Nullable<boolean>;
    title: string;
    subtitle?: Nullable<string>;
    font?: Nullable<string>;
    color?: Nullable<string>;
    textColor?: Nullable<string>;
    timeFormat?: Nullable<string>;
    dateFormat?: Nullable<string>;
    author?: Nullable<string>;
}

export class CreateUserAnnotationInput {
    type: UserAnnotationType;
    property: AnnotationPropertyInput;
}

export class UpdateUserAnnotationPositionInput {
    sourceId: string;
    destinationId: string;
}

export class WidgetIdsInput {
    widgetIds: Nullable<string>[];
}

export class DismissWidgetNotificationsInput {
    notificationId: string;
}

export class EditWidgetNotificationInput {
    userId: string;
}

export interface DocumentVersionBase {
    documentId?: Nullable<string>;
    versionId?: Nullable<string>;
    _id?: Nullable<string>;
}

export class OrganizationConnection {
    edges?: Nullable<Nullable<OrganizationEdge>[]>;
    total?: Nullable<number>;
    pageInfo?: Nullable<PageInfo>;
}

export class OrganizationEdge {
    organization?: Nullable<Organization>;
}

export class OrganizationDetail {
    invoiceStatus?: Nullable<InvoiceStatus>;
    organization?: Nullable<Organization>;
    upcommingInvoice?: Nullable<SubscriptionResponse>;
    periodEnd?: Nullable<number>;
    currency?: Nullable<Currency>;
    latestHubspotDeal?: Nullable<HubspotDeal>;
    invoicePaymentLink?: Nullable<string>;
}

export class Admin {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    email?: Nullable<string>;
    role?: Nullable<AdminRole>;
    timezoneOffset?: Nullable<number>;
    createdAt?: Nullable<Date>;
    avatarRemoteId?: Nullable<string>;
    status?: Nullable<AdminStatus>;
}

export class UserBlacklist {
    _id?: Nullable<string>;
    email?: Nullable<string>;
    createdAt?: Nullable<Date>;
}

export class AdminPayload {
    admin?: Nullable<Admin>;
}

export class AdminsConnection {
    edges: Nullable<AdminsEdge>[];
    total: number;
}

export class UserConnection {
    edges: Nullable<UserEdge>[];
    total: number;
}

export class UserEdge {
    node: User;
}

export class AdminsEdge {
    node: Admin;
}

export class UserBlacklistConnection {
    edges: Nullable<UserBlacklistEdge>[];
    total: number;
}

export class UserBlacklistEdge {
    node?: Nullable<UserBlacklist>;
}

export class OrganizationBlacklistConnection {
    edges: Nullable<OrganizationBlacklistEdge>[];
    total: number;
}

export class OrganizationBlacklistEdge {
    node?: Nullable<OrganizationBlacklist>;
}

export class OrganizationBlacklist {
    _id: string;
    domain: string;
    createdAt: Date;
}

export class AddEmailToUserBlacklistPayload {
    statusCode?: Nullable<number>;
    message?: Nullable<string>;
    email?: Nullable<string>;
}

export class AddDomainToOrgBlacklistPayload {
    statusCode?: Nullable<number>;
    message?: Nullable<string>;
    domain?: Nullable<string>;
}

export class UserDetailPayload {
    user?: Nullable<User>;
    upcommingInvoice?: Nullable<SubscriptionResponse>;
    periodEnd?: Nullable<number>;
    totalOwnedDocuments?: Nullable<number>;
    changeEmailAbility?: Nullable<ChangeEmailAbility>;
}

export class UpdateAdminPayload {
    statusCode?: Nullable<number>;
    message?: Nullable<string>;
    admin?: Nullable<Admin>;
}

export class UpdateAdminPermissionPayload {
    type?: Nullable<string>;
    admin?: Nullable<Admin>;
}

export class PreviewUpcomingInvoicePayload {
    discount?: Nullable<number>;
    total?: Nullable<number>;
    subtotal?: Nullable<number>;
    nextBillingCycle?: Nullable<Date>;
    currency?: Nullable<Currency>;
    period?: Nullable<PaymentPeriod>;
}

export class FindUserByAdminPayload {
    user?: Nullable<User>;
    status?: Nullable<SearchUserByAdminStatus>;
}

export class PreviewPaymentLinkInvoicePayload {
    plan?: Nullable<DocStackPlan>;
    period?: Nullable<PaymentPeriod>;
    docstack?: Nullable<number>;
    discount?: Nullable<number>;
    nextBillingCycle?: Nullable<string>;
    nextBillingPrice?: Nullable<number>;
    total?: Nullable<number>;
    amountDue?: Nullable<number>;
    currency?: Nullable<Currency>;
    remaining?: Nullable<number>;
}

export class HubspotDeal {
    dealName?: Nullable<string>;
    dealUrl?: Nullable<string>;
}

export class PaymentSubscription {
    payment: Payment;
    upcomingInvoice?: Nullable<SubscriptionResponse>;
}

export class PreviewUserDataPayload {
    user?: Nullable<User>;
    subscriptions?: Nullable<Nullable<PaymentSubscription>[]>;
    joinedOrgs?: Nullable<Nullable<Organization>[]>;
    joinedTeams?: Nullable<Nullable<Team>[]>;
    signSubscription?: Nullable<Payment>;
}

export class VerifyEmailChangeDomainRulesData {
    allowToChange: boolean;
    message?: Nullable<string>;
}

export abstract class IQuery {
    abstract getAdminList(input: GetAdminListInput): Nullable<AdminsConnection> | Promise<Nullable<AdminsConnection>>;

    abstract getUserList(input: GetUserListInput): Nullable<UserConnection> | Promise<Nullable<UserConnection>>;

    abstract getOrganizations(input: GetOrganizationsInput): Nullable<OrganizationConnection> | Promise<Nullable<OrganizationConnection>>;

    abstract getOrganizationDetail(orgId: string): Nullable<OrganizationDetail> | Promise<Nullable<OrganizationDetail>>;

    abstract findUserByAdmin(email: string): Nullable<FindUserByAdminPayload> | Promise<Nullable<FindUserByAdminPayload>>;

    abstract findUserInBlacklist(email: string): Nullable<UserBlacklist> | Promise<Nullable<UserBlacklist>>;

    abstract getUserBlacklist(input: GetBlacklistInput): Nullable<UserBlacklistConnection> | Promise<Nullable<UserBlacklistConnection>>;

    abstract getOrganizationBlacklist(input?: Nullable<GetBlacklistInput>): Nullable<OrganizationBlacklistConnection> | Promise<Nullable<OrganizationBlacklistConnection>>;

    abstract getUserDetail(userId: string): Nullable<UserDetailPayload> | Promise<Nullable<UserDetailPayload>>;

    abstract getOrgByDomainAdmin(domain: string): Nullable<Organization> | Promise<Nullable<Organization>>;

    abstract getOrganizationMembers(input: GetMemberInput): Nullable<OrganizationMemberConnection> | Promise<Nullable<OrganizationMemberConnection>>;

    abstract previewUpcomingInvoice(input: PreviewUpcomingInvoiceInput): Nullable<PreviewUpcomingInvoicePayload> | Promise<Nullable<PreviewUpcomingInvoicePayload>>;

    abstract getTemplateDetail(templateId: string): Nullable<CommunityTemplate> | Promise<Nullable<CommunityTemplate>>;

    abstract getCommunityTemplates(input: GetCommunityTemplatesInput): Nullable<GetCommunityTemplatePayload> | Promise<Nullable<GetCommunityTemplatePayload>>;

    abstract getCategoryTemplatesByAdmin(input: GetTemplateCategoryInput): Nullable<GetTemplateCategoryPayload> | Promise<Nullable<GetTemplateCategoryPayload>>;

    abstract getTemplateCategoryDetail(categoryId: string): Nullable<TemplateCategory> | Promise<Nullable<TemplateCategory>>;

    abstract previewPaymentLinkInvoice(input?: Nullable<PreviewPaymentLinkInvoiceInput>): Nullable<PreviewPaymentLinkInvoicePayload> | Promise<Nullable<PreviewPaymentLinkInvoicePayload>>;

    abstract getCouponValueForAdmin(input: GetCouponValueInput): Nullable<CouponValueResponse> | Promise<Nullable<CouponValueResponse>>;

    abstract getCustomerInfo(input: CommonPaymentInput): Nullable<CustomerInfoResponse> | Promise<Nullable<CustomerInfoResponse>>;

    abstract previewUserDataForChangeEmail(email: string): Nullable<PreviewUserDataPayload> | Promise<Nullable<PreviewUserDataPayload>>;

    abstract verifyEmailChangeDomainRules(input: VerifyEmailChangeDomainRulesInput): Nullable<VerifyEmailChangeDomainRulesData> | Promise<Nullable<VerifyEmailChangeDomainRulesData>>;

    abstract signIn(email: string, password: string, timezoneOffset: number, browserLanguageCode?: Nullable<string>): Nullable<SignInPayload> | Promise<Nullable<SignInPayload>>;

    abstract inviteOrgVerification(token: string): Nullable<InviteOrgVerificationPayload> | Promise<Nullable<InviteOrgVerificationPayload>>;

    abstract verifyToken(input?: Nullable<VerifyTokenInput>): Nullable<VerifyTokenPayload> | Promise<Nullable<VerifyTokenPayload>>;

    abstract checkResetPasswordUrl(input?: Nullable<CheckResetPasswordInput>): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract verifyPassword(password: string): Nullable<VerifyPasswordPayload> | Promise<Nullable<VerifyPasswordPayload>>;

    abstract checkLoginExternal(): Nullable<CheckLoginExternalPayload> | Promise<Nullable<CheckLoginExternalPayload>>;

    abstract getLandingPageToken(landingPageType: string): Nullable<GetLandingPageTokenPayload> | Promise<Nullable<GetLandingPageTokenPayload>>;

    abstract verifySharingDocumentToken(sharingToken: string): Nullable<VerifySharingDocPayload> | Promise<Nullable<VerifySharingDocPayload>>;

    abstract adminSignIn(input: SignInInput): Nullable<AdminSignInPayload> | Promise<Nullable<AdminSignInPayload>>;

    abstract adminVerifyToken(): Nullable<AdminVerifyTokenPayload> | Promise<Nullable<AdminVerifyTokenPayload>>;

    abstract exchangeGoogleToken(code: string): Nullable<ExchangeGoogleTokenPayload> | Promise<Nullable<ExchangeGoogleTokenPayload>>;

    abstract getGoogleAccessToken(): Nullable<GoogleToken> | Promise<Nullable<GoogleToken>>;

    abstract getMe(timezoneOffset?: Nullable<number>, invitationToken?: Nullable<string>, skipOnboardingFlow?: Nullable<boolean>, isEnabledNewLayout?: Nullable<boolean>): Nullable<VerifyTokenPayload> | Promise<Nullable<VerifyTokenPayload>>;

    abstract signinWithLumin(code: string, redirectUri?: Nullable<string>, timezoneOffset?: Nullable<number>, codeVerifier?: Nullable<string>): Nullable<SigninWithLuminPayload> | Promise<Nullable<SigninWithLuminPayload>>;

    abstract verifyNewUserInvitationToken(token: string): Nullable<VerifyInvitationTokenPayload> | Promise<Nullable<VerifyInvitationTokenPayload>>;

    abstract healthCheck(): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract validateIPWhitelist(email?: Nullable<string>): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract getCredentialsFromOpenGoogle(credentialId: string): Nullable<CredentialsFromOpenGooglePayload> | Promise<Nullable<CredentialsFromOpenGooglePayload>>;

    abstract getTemplateCategories(): Nullable<Nullable<TemplateCategory>[]> | Promise<Nullable<Nullable<TemplateCategory>[]>>;

    abstract getPublishedTemplates(input: GetPublishedTemplatesInput): Nullable<GetCommunityTemplatePayload> | Promise<Nullable<GetCommunityTemplatePayload>>;

    abstract getPublishedTemplateByUrl(url: string): Nullable<CommunityTemplate> | Promise<Nullable<CommunityTemplate>>;

    abstract getPersonalDocumentSummary(): Nullable<GetDocumentSummaryPayload> | Promise<Nullable<GetDocumentSummaryPayload>>;

    abstract getTeamDocumentSummary(teamId: string): Nullable<GetDocumentSummaryPayload> | Promise<Nullable<GetDocumentSummaryPayload>>;

    abstract processDocumentForChatbot(input: ProcessDocumentForChatbotInput): Nullable<ProcessDocumentForChatbotPayload> | Promise<Nullable<ProcessDocumentForChatbotPayload>>;

    abstract getPresignedUrlForAttachedFiles(input: GetPresignedUrlForAttachedFilesInput): Nullable<GetPresignedUrlForAttachedFilesPayload> | Promise<Nullable<GetPresignedUrlForAttachedFilesPayload>>;

    abstract checkAttachedFilesMetadata(input: CheckAttachedFilesMetadataInput): CheckAttachedFilesMetadataPayload | Promise<CheckAttachedFilesMetadataPayload>;

    abstract getCompressDocumentPresignedUrl(input: GetCompressDocumentPresignedUrlInput): Nullable<ISignedUrl> | Promise<Nullable<ISignedUrl>>;

    abstract createPresignedFormFieldDetectionUrl(input: CreatePresignedFormFieldDetectionUrlInput): Nullable<CreatePresignedFormFieldDetectionUrlPayload> | Promise<Nullable<CreatePresignedFormFieldDetectionUrlPayload>>;

    abstract getFormFieldDetectionUsage(): Nullable<GetFormFieldDetectionUsagePayload> | Promise<Nullable<GetFormFieldDetectionUsagePayload>>;

    abstract processAppliedFormFields(input: ProcessAppliedFormFieldsInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract batchCreatePresignedFormFieldDetectionUrl(inputs: BatchCreatePresignedFormFieldDetectionUrlInput): BatchCreatePresignedFormFieldDetectionUrlPayload[] | Promise<BatchCreatePresignedFormFieldDetectionUrlPayload[]>;

    abstract getDocumentSummarization(documentId: string, options?: Nullable<GetDocSummarizationOptions>): Nullable<DocumentSummarization> | Promise<Nullable<DocumentSummarization>>;

    abstract documentTemplate(documentId: string): DocumentTemplate | Promise<DocumentTemplate>;

    abstract getDocumentById(documentId: string): Nullable<Document> | Promise<Nullable<Document>>;

    abstract getDocuments(input: GetPersonalWorkspaceDocumentsInput): Nullable<GetDocumentPayload> | Promise<Nullable<GetDocumentPayload>>;

    abstract document(documentId: string, usePwa?: Nullable<boolean>): Nullable<Document> | Promise<Nullable<Document>>;

    abstract getDocumentByRemoteId(documentRemoteId: string, clientId?: Nullable<string>): Nullable<GetDocumentByRemoteIdPayload> | Promise<Nullable<GetDocumentByRemoteIdPayload>>;

    abstract getFormList(input?: Nullable<GetDocumentFormInput>): Nullable<GetFormListPayload> | Promise<Nullable<GetFormListPayload>>;

    abstract getRequestAccessDocsList(input: DocumentRequestAccessInput): Nullable<RequestAccessDocsListPayload> | Promise<Nullable<RequestAccessDocsListPayload>>;

    abstract getPDFInfo(documentId: string): Nullable<PDFInfoPayload> | Promise<Nullable<PDFInfoPayload>>;

    abstract getShareInviteByEmailList(documentId: string, searchKey?: Nullable<string>): Nullable<GetShareInviteByEmailListPayload> | Promise<Nullable<GetShareInviteByEmailListPayload>>;

    abstract getMentionList(input: MentionListInput): Nullable<GetMentionListPayload> | Promise<Nullable<GetMentionListPayload>>;

    abstract getMembersByDocumentId(input: GetMembersByDocumentIdInput): Nullable<MemberWithCursorPaginationPayload> | Promise<Nullable<MemberWithCursorPaginationPayload>>;

    abstract getManipulationDocument(input?: Nullable<ManipulationDocumentInput>): Nullable<Nullable<ManipulationDocumentPayload>[]> | Promise<Nullable<Nullable<ManipulationDocumentPayload>[]>>;

    abstract getSharedDocuments(input: DocumentQueryInput): Nullable<GetDocumentPayload> | Promise<Nullable<GetDocumentPayload>>;

    abstract downloadDocument(documentId: string): Nullable<Document> | Promise<Nullable<Document>>;

    abstract getRequestAccessDocById(documentId: string, requesterId: string): Nullable<UserPermission> | Promise<Nullable<UserPermission>>;

    abstract getDocStackInfo(documentId: string): Nullable<GetDocStackInfoPayload> | Promise<Nullable<GetDocStackInfoPayload>>;

    abstract checkThirdPartyStorage(remoteIds: string[]): Nullable<Nullable<CheckThirdPartyStoragePayload>[]> | Promise<Nullable<Nullable<CheckThirdPartyStoragePayload>[]>>;

    abstract getAnnotations(documentId: string): Nullable<Nullable<Annotations>[]> | Promise<Nullable<Nullable<Annotations>[]>>;

    abstract getPremiumToolInfoAvailableForUser(): Nullable<PremiumToolsInfo> | Promise<Nullable<PremiumToolsInfo>>;

    abstract getDocumentOriginalFileUrl(documentId: string): Nullable<string> | Promise<Nullable<string>>;

    abstract getPresignedUrlForDocumentOriginalVersion(input: GetPresignedUrlForUploadDocInput): Nullable<GetPresignedUrlForUploadDocPayload> | Promise<Nullable<GetPresignedUrlForUploadDocPayload>>;

    abstract getPresignedUrlForDocumentImage(input: PresignedUrlForImageInput): Nullable<PresignedUrlForImagePayload> | Promise<Nullable<PresignedUrlForImagePayload>>;

    abstract getCreatedSignaturePresignedUrl(fileType: string): Nullable<PresignedUrlForSignaturePayload> | Promise<Nullable<PresignedUrlForSignaturePayload>>;

    abstract getPresignedUrlForTemporaryDrive(documentId: string): Nullable<GetPresignedUrlForTemporaryDocumentPayload> | Promise<Nullable<GetPresignedUrlForTemporaryDocumentPayload>>;

    abstract getSignedUrlForOCR(documentId: string, totalParts: number): Nullable<GetPresignedUrlForOcrPayload> | Promise<Nullable<GetPresignedUrlForOcrPayload>>;

    abstract getTemporaryDocumentPresignedUrl(documentId: string, key: string, convertType?: Nullable<string>): Nullable<GetPresignedUrlForTemporaryDocumentPayload> | Promise<Nullable<GetPresignedUrlForTemporaryDocumentPayload>>;

    abstract getPresignedUrlForMultipleDocumentImages(input: PresignedUrlForMultiImagesInput): Nullable<Nullable<PresignedUrlForImagePayload>[]> | Promise<Nullable<Nullable<PresignedUrlForImagePayload>[]>>;

    abstract refreshDocumentImageSignedUrls(documentId: string): Nullable<Object> | Promise<Nullable<Object>>;

    abstract getSignedUrlForAnnotations(documentId: string): Nullable<string> | Promise<Nullable<string>>;

    abstract getFormField(documentId: string): Nullable<Nullable<FormField>[]> | Promise<Nullable<Nullable<FormField>[]>>;

    abstract getDocumentOutlines(input: GetDocumentOutlinesInput): Nullable<Nullable<GetDocumentOutlinesPayload>[]> | Promise<Nullable<Nullable<GetDocumentOutlinesPayload>[]>>;

    abstract checkDownloadMultipleDocuments(input: CheckDownloadMultipleDocumentsInput): Nullable<CheckDownloadMultipleDocumentsPayload> | Promise<Nullable<CheckDownloadMultipleDocumentsPayload>>;

    abstract preCheckShareDocumentInSlack(input: PreCheckShareDocumentInSlackInput): Nullable<PreCheckShareDocumentInSlackResponse> | Promise<Nullable<PreCheckShareDocumentInSlackResponse>>;

    abstract getSignedUrlForExternalPdfByEncodeData(encodeData: string): Nullable<GetSignedUrlForExternalPdfByEncodeDataPayload> | Promise<Nullable<GetSignedUrlForExternalPdfByEncodeDataPayload>>;

    abstract checkShareThirdPartyDocument(input: CheckShareThirdPartyDocumentInput): Nullable<CheckShareThirdPartyDocumentPayload> | Promise<Nullable<CheckShareThirdPartyDocumentPayload>>;

    abstract getDocumentVersionList(input: GetDocumentVersionListInput): Nullable<GetVersionListPayload> | Promise<Nullable<GetVersionListPayload>>;

    abstract getBackupAnnotationPresignedUrl(input: GetBackupAnnotationPresignedUrlInput): Nullable<ISignedUrl> | Promise<Nullable<ISignedUrl>>;

    abstract getVersionPresignedUrl(input: GetVersionPresignedUrlInput): Nullable<GetVersionPresignedUrlPayload> | Promise<Nullable<GetVersionPresignedUrlPayload>>;

    abstract getEventsByUserId(limit?: Nullable<number>): Nullable<Nullable<Event>[]> | Promise<Nullable<Nullable<Event>[]>>;

    abstract getEventsByTeamId(teamId: string, limit?: Nullable<number>): Nullable<Nullable<Event>[]> | Promise<Nullable<Nullable<Event>[]>>;

    abstract getAdminEvents(input: GetAdminEventsInput): Nullable<AdminEventsConnection> | Promise<Nullable<AdminEventsConnection>>;

    abstract getPersonalFolders(input: GetFolderListInput): Nullable<Nullable<Folder>[]> | Promise<Nullable<Nullable<Folder>[]>>;

    abstract getFolderDetail(folderId: string): Nullable<Folder> | Promise<Nullable<Folder>>;

    abstract getDocumentsInFolder(input: GetDocumentsInFolderInput): Nullable<GetDocumentPayload> | Promise<Nullable<GetDocumentPayload>>;

    abstract getTotalFolders(input: GetTotalFoldersInput): Nullable<GetTotalFoldersPayload> | Promise<Nullable<GetTotalFoldersPayload>>;

    abstract getFoldersInFolder(input?: Nullable<GetFoldersInFolderInput>): Nullable<Nullable<Folder>[]> | Promise<Nullable<Nullable<Folder>[]>>;

    abstract getFolderTree(folderId: string): Nullable<Folder> | Promise<Nullable<Folder>>;

    abstract getPersonalFolderTree(): Nullable<GetPersonalFolderTreePayload> | Promise<Nullable<GetPersonalFolderTreePayload>>;

    abstract getPDFFormTemplate(input: GetPDFFormTemplateInput): Nullable<GetPDFFormTemplatePayload> | Promise<Nullable<GetPDFFormTemplatePayload>>;

    abstract membership(clientId: string, teamId: string, userId: string): Nullable<Membership> | Promise<Nullable<Membership>>;

    abstract memberships(clientId: string, input?: Nullable<MembershipInput>, options?: Nullable<QueryOptionsInput>, userInput?: Nullable<UserQueryInput>): Nullable<Nullable<Membership>[]> | Promise<Nullable<Nullable<Membership>[]>>;

    abstract membershipsCount(clientId: string, input?: Nullable<MembershipInput>, userInput?: Nullable<UserQueryInput>): Nullable<number> | Promise<Nullable<number>>;

    abstract notifications(input?: Nullable<GetNotificationsInput>, cursor?: Nullable<string>): Nullable<NotificationPayload> | Promise<Nullable<NotificationPayload>>;

    abstract getNotificationById(notificationId: string): Nullable<Notification> | Promise<Nullable<Notification>>;

    abstract orgsOfUser(): Nullable<Nullable<OrganizationWithRole>[]> | Promise<Nullable<Nullable<OrganizationWithRole>[]>>;

    abstract checkMainOrgCreationAbility(): Nullable<CheckMainOrgCreationAbilityPayload> | Promise<Nullable<CheckMainOrgCreationAbilityPayload>>;

    abstract getMainOrganizationCanJoin(): Nullable<OrganizationCanJoinPayload> | Promise<Nullable<OrganizationCanJoinPayload>>;

    abstract getMainOrganizationCanRequest(): Nullable<OrganizationRequestingPayload> | Promise<Nullable<OrganizationRequestingPayload>>;

    abstract getTeamsOfTeamAdmin(orgId: string, userId: string): Nullable<Nullable<Team>[]> | Promise<Nullable<Nullable<Team>[]>>;

    abstract getMembersOfTeam(teamId: string): Nullable<Nullable<Membership>[]> | Promise<Nullable<Nullable<Membership>[]>>;

    abstract getOrganizationInsight(orgId: string): Nullable<GetOrganizationInsightPayload> | Promise<Nullable<GetOrganizationInsightPayload>>;

    abstract getOrganizationPrice(orgId: string): Nullable<GetOrganizationPricePayload> | Promise<Nullable<GetOrganizationPricePayload>>;

    abstract previewUpcomingDocStackInvoice(input: PreviewUpcomingDocStackInvoiceInput): Nullable<PreviewDocStackInvoicePayload> | Promise<Nullable<PreviewDocStackInvoicePayload>>;

    abstract previewUpcomingSubscriptionInvoice(input: PreviewUpcomingSubscriptionInvoiceInput): Nullable<PreviewUpcomingSubscriptionInvoicePayload> | Promise<Nullable<PreviewUpcomingSubscriptionInvoicePayload>>;

    abstract getGoogleUsersNotInCircle(input: GetGoogleUsersNotInCircleInput): Nullable<Nullable<FindUserPayload>[]> | Promise<Nullable<Nullable<FindUserPayload>[]>>;

    abstract getPromptInviteUsersBanner(input: GetPromptInviteUsersBannerInput): Nullable<PromptInviteBannerPayload> | Promise<Nullable<PromptInviteBannerPayload>>;

    abstract getListRequestJoinOrganization(input: GetRequesterInput): Nullable<OrganizationRequesterConnection> | Promise<Nullable<OrganizationRequesterConnection>>;

    abstract getListPendingUserOrganization(input: PendingUserOrganizationInput): Nullable<OrganizationPendingConnection> | Promise<Nullable<OrganizationPendingConnection>>;

    abstract getSuggestedUsersToInvite(input: GetSuggestedUserToInviteInput): Nullable<GetSuggestedUserToInvitePayload> | Promise<Nullable<GetSuggestedUserToInvitePayload>>;

    abstract getSamlSsoConfiguration(orgId: string): Nullable<SamlSsoConfiguration> | Promise<Nullable<SamlSsoConfiguration>>;

    abstract getScimSsoConfiguration(orgId: string): Nullable<ScimSsoConfiguration> | Promise<Nullable<ScimSsoConfiguration>>;

    abstract getOrganizationByUrl(url: string): Nullable<GetOrganizationPayload> | Promise<Nullable<GetOrganizationPayload>>;

    abstract getOrganizationById(orgId: string): Nullable<GetOrganizationPayload> | Promise<Nullable<GetOrganizationPayload>>;

    abstract getOrgTeams(orgId: string): Nullable<GetOrgTeamsPayload> | Promise<Nullable<GetOrgTeamsPayload>>;

    abstract getMemberOfOrganization(input: GetMemberInput, internal?: Nullable<boolean>): Nullable<OrganizationMemberConnection> | Promise<Nullable<OrganizationMemberConnection>>;

    abstract getTotalMembers(orgId: string): Nullable<OrganizationTotalCount> | Promise<Nullable<OrganizationTotalCount>>;

    abstract getUserRoleInOrg(orgId: string): Nullable<GetUserRoleInOrgPayload> | Promise<Nullable<GetUserRoleInOrgPayload>>;

    abstract getOrganizationDocuments(input: GetOrganizationDocumentsInput): Nullable<GetDocumentPayload> | Promise<Nullable<GetDocumentPayload>>;

    abstract checkOrganizationTransfering(orgId: string): Nullable<boolean> | Promise<Nullable<boolean>>;

    abstract getRecentNewOrgMembers(orgId: string, limit?: Nullable<number>): Nullable<Nullable<OrganizationMember>[]> | Promise<Nullable<Nullable<OrganizationMember>[]>>;

    abstract getPersonalFoldersInOrg(input: GetOrganizationFoldersInput): Nullable<Nullable<Folder>[]> | Promise<Nullable<Nullable<Folder>[]>>;

    abstract getOrganizationFolders(input: GetOrganizationFoldersInput): Nullable<Nullable<Folder>[]> | Promise<Nullable<Nullable<Folder>[]>>;

    abstract getOrganizationTeamFolders(input: GetOrganizationTeamFoldersInput): Nullable<Nullable<Folder>[]> | Promise<Nullable<Nullable<Folder>[]>>;

    abstract getOrganizationTeamDocuments(input: GetOrganizationTeamDocumentsInput): Nullable<GetDocumentPayload> | Promise<Nullable<GetDocumentPayload>>;

    abstract getOrganizationTemplates(orgId: string, tab: OrganizationTemplateTabs, pagingOption: GetTemplatesInput): Nullable<GetTemplatesPayload> | Promise<Nullable<GetTemplatesPayload>>;

    abstract getTeamTemplates(teamId: string, pagingOption: GetTemplatesInput): Nullable<GetTemplatesPayload> | Promise<Nullable<GetTemplatesPayload>>;

    abstract getRepresentativeMembers(input: GetRepresentativeMembersInput): Nullable<GetRepresentativeMembersPayload> | Promise<Nullable<GetRepresentativeMembersPayload>>;

    abstract getUsersInvitableToOrg(input: GetUsersInvitableToOrgInput): Nullable<Nullable<string>[]> | Promise<Nullable<Nullable<string>[]>>;

    abstract checkOrganizationDocStack(orgId: string): Nullable<CheckOrganizationDocStackPayload> | Promise<Nullable<CheckOrganizationDocStackPayload>>;

    abstract getOrganizationResources(input: GetOrganizationResourcesInput): Nullable<GetOrganizationResourcesPayload> | Promise<Nullable<GetOrganizationResourcesPayload>>;

    abstract getOrganizationInviteLink(orgId: string): Nullable<OrganizationInviteLink> | Promise<Nullable<OrganizationInviteLink>>;

    abstract getOrganizationWithJoinStatus(orgId: string): Nullable<SuggestedPremiumOrganization> | Promise<Nullable<SuggestedPremiumOrganization>>;

    abstract getOrganizationFolderTree(input: GetOrganizationFolderTreeInput): Nullable<GetOrganizationFolderTreePayload> | Promise<Nullable<GetOrganizationFolderTreePayload>>;

    abstract getOrganizationTeamsFolderTree(input: GetOrganizationFolderTreeInput): Nullable<GetOrganizationTeamsFolderTreePayload> | Promise<Nullable<GetOrganizationTeamsFolderTreePayload>>;

    abstract getPersonalFolderTreeInOrg(input: GetOrganizationFolderTreeInput): Nullable<GetOrganizationFolderTreePayload> | Promise<Nullable<GetOrganizationFolderTreePayload>>;

    abstract getFoldersAvailability(input: GetFoldersAvailabilityInput): Nullable<GetFoldersAvailabilityPayload> | Promise<Nullable<GetFoldersAvailabilityPayload>>;

    abstract getOrganizationDocumentTemplates(input: GetOrganizationDocumentTemplatesInput): Nullable<GetDocumentTemplatesPayload> | Promise<Nullable<GetDocumentTemplatesPayload>>;

    abstract getOrganizationTeamDocumentTemplates(input: GetOrganizationTeamDocumentTemplatesInput): Nullable<GetDocumentTemplatesPayload> | Promise<Nullable<GetDocumentTemplatesPayload>>;

    abstract upcomingInvoice(input: CommonPaymentInput): Nullable<SubscriptionResponse> | Promise<Nullable<SubscriptionResponse>>;

    abstract invoices(input: InvoicesInput): Nullable<Nullable<Invoice>[]> | Promise<Nullable<Nullable<Invoice>[]>>;

    abstract subscription(input?: Nullable<CommonPaymentInput>): Nullable<SubscriptionResponse> | Promise<Nullable<SubscriptionResponse>>;

    abstract getUnifySubscription(input?: Nullable<CommonPaymentInput>): Nullable<GetUnifySubscriptionPayload> | Promise<Nullable<GetUnifySubscriptionPayload>>;

    abstract customerInfo(input: CommonPaymentInput): Nullable<CustomerInfoResponse> | Promise<Nullable<CustomerInfoResponse>>;

    abstract couponValue(input: GetCouponValueInput): Nullable<CouponValueResponse> | Promise<Nullable<CouponValueResponse>>;

    abstract getBillingEmail(input: GetBillingEmailInput): Nullable<string> | Promise<Nullable<string>>;

    abstract getSubscriptionCoupon(input: GetSubscriptionCouponInput): Nullable<CouponValueResponse> | Promise<Nullable<CouponValueResponse>>;

    abstract getRemainingPlan(input?: Nullable<GetRemainingInput>): Nullable<RemainingPlan> | Promise<Nullable<RemainingPlan>>;

    abstract getBillingCycleOfPlan(input: GetBillingCycleOfPlanInput): Nullable<PreviewDocStackInvoicePayload> | Promise<Nullable<PreviewDocStackInvoicePayload>>;

    abstract getSubscriptionBillingCycle(input: GetSubscriptionBillingCycleInput): Nullable<PreviewUpcomingSubscriptionInvoicePayload> | Promise<Nullable<PreviewUpcomingSubscriptionInvoicePayload>>;

    abstract getBillingWarning(clientId: string): Nullable<BillingWarningPayload> | Promise<Nullable<BillingWarningPayload>>;

    abstract getNextPaymentInfo(input: GetNextPaymentInfoInput): Nullable<GetNextPaymentInfoPayload> | Promise<Nullable<GetNextPaymentInfoPayload>>;

    abstract getNextSubscriptionInfo(input: GetNextSubscriptionInfoInput): GetNextSubscriptionInfoPayload[] | Promise<GetNextSubscriptionInfoPayload[]>;

    abstract getPaymentMethod(clientId: string): Nullable<PaymentMethodResponse> | Promise<Nullable<PaymentMethodResponse>>;

    abstract initSlackOAuth(): Nullable<InitSlackOAuthResponse> | Promise<Nullable<InitSlackOAuthResponse>>;

    abstract getSlackTeams(): Nullable<Nullable<SlackTeam>[]> | Promise<Nullable<Nullable<SlackTeam>[]>>;

    abstract getSlackChannels(teamId: string): Nullable<Nullable<SlackChannel>[]> | Promise<Nullable<Nullable<SlackChannel>[]>>;

    abstract getSlackRecipients(teamId: string): Nullable<Nullable<SlackRecipient>[]> | Promise<Nullable<Nullable<SlackRecipient>[]>>;

    abstract countSlackChannelMembers(teamId: string, channelId: string): Nullable<number> | Promise<Nullable<number>>;

    abstract teamsOfUser(clientId: string): Nullable<Nullable<Team>[]> | Promise<Nullable<Nullable<Team>[]>>;

    abstract team(teamId: string): Nullable<Team> | Promise<Nullable<Team>>;

    abstract getPersonalTemplates(pagingOption: GetTemplatesInput): Nullable<GetTemplatesPayload> | Promise<Nullable<GetTemplatesPayload>>;

    abstract getTemplateById(templateId: string, increaseView?: Nullable<boolean>): Nullable<Template> | Promise<Nullable<Template>>;

    abstract checkReachDailyTemplateUploadLimit(uploaderId: string, refId: string): Nullable<boolean> | Promise<Nullable<boolean>>;

    abstract getPresignedUrlForUploadDoc(input: GetPresignedUrlForUploadDocInput): Nullable<GetPresignedUrlForUploadDocPayload> | Promise<Nullable<GetPresignedUrlForUploadDocPayload>>;

    abstract getPresignedUrlForLuminSignIntegration(input: GetPresignedUrlForLuminSignIntegrationInput): Nullable<GetPresignedUrlForLuminSignIntegrationPayload> | Promise<Nullable<GetPresignedUrlForLuminSignIntegrationPayload>>;

    abstract getPresignedUrlForUploadThumbnail(input: GetPresignedUrlForUploadThumbnailInput): Nullable<GetPresignedUrlForUploadThumbnailPayload> | Promise<Nullable<GetPresignedUrlForUploadThumbnailPayload>>;

    abstract findUser(input?: Nullable<FindUserInput>): Nullable<Nullable<FindUserPayload>[]> | Promise<Nullable<Nullable<FindUserPayload>[]>>;

    abstract getCurrentUser(): Nullable<User> | Promise<Nullable<User>>;

    abstract getGoogleContacts(accessToken: string, input?: Nullable<GetGoogleContactInput>): Nullable<Nullable<FindUserPayload>[]> | Promise<Nullable<Nullable<FindUserPayload>[]>>;

    abstract getUsersSameDomain(): Nullable<Nullable<FindUserPayload>[]> | Promise<Nullable<Nullable<FindUserPayload>[]>>;

    abstract getSuggestedOrgListOfUser(): Nullable<Nullable<SuggestedOrganizationList>[]> | Promise<Nullable<Nullable<SuggestedOrganizationList>[]>>;

    abstract getUserCurrency(): Nullable<GetUserLocationPayload> | Promise<Nullable<GetUserLocationPayload>>;

    abstract findAvailableLocation(input: FindLocationInput): Nullable<FindLocationPayload> | Promise<Nullable<FindLocationPayload>>;

    abstract getUserSignatureSignedUrls(): Nullable<Nullable<Signature>[]> | Promise<Nullable<Nullable<Signature>[]>>;

    abstract getUserSignatureSignedUrlsInRange(input: GetSignedUrlSignaturesInput): Nullable<GetSignedUrlSignaturesPayload> | Promise<Nullable<GetSignedUrlSignaturesPayload>>;

    abstract getSuggestedPremiumOrgListOfUser(): Nullable<Nullable<SuggestedPremiumOrganization>[]> | Promise<Nullable<Nullable<SuggestedPremiumOrganization>[]>>;

    abstract getOnedriveToken(): Nullable<OneDriveTokenResponse> | Promise<Nullable<OneDriveTokenResponse>>;

    abstract getUserAnnotations(input: GetUserAnnotationInput): Nullable<GetUserAnnotationResponse> | Promise<Nullable<GetUserAnnotationResponse>>;

    abstract widgetNotifications(): Nullable<WidgetNotificationPayload> | Promise<Nullable<WidgetNotificationPayload>>;
}

export abstract class IMutation {
    abstract createAdmin(input: CreateAdminInput): Nullable<AdminPayload> | Promise<Nullable<AdminPayload>>;

    abstract deleteAdmin(adminId: string): Nullable<string> | Promise<Nullable<string>>;

    abstract setAdminRole(input: SetAdminRoleInput): Nullable<AdminPayload> | Promise<Nullable<AdminPayload>>;

    abstract resendAdminInvitation(email: string): Nullable<AdminPayload> | Promise<Nullable<AdminPayload>>;

    abstract deleteOrganization(orgId: string, addToBlacklist?: Nullable<boolean>): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createPaymentLink(input: CreatePaymentLinkInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createOrganizationByAdmin(organization: CreateOrgByAdminInput, file?: Nullable<Upload>): Nullable<CreateOrganizationPayload> | Promise<Nullable<CreateOrganizationPayload>>;

    abstract addEmailToUserBlacklist(email: string): Nullable<AddEmailToUserBlacklistPayload> | Promise<Nullable<AddEmailToUserBlacklistPayload>>;

    abstract removeUserBlacklist(email: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract removeOrgBlacklist(domain: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract addDomainToOrgBlacklist(domain: string): Nullable<AddDomainToOrgBlacklistPayload> | Promise<Nullable<AddDomainToOrgBlacklistPayload>>;

    abstract cancelPlanByAdmin(input?: Nullable<CancelPlanByAdminInput>): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract deleteUser(userId: string, addToBlacklist?: Nullable<boolean>): Nullable<string> | Promise<Nullable<string>>;

    abstract convertToMainOrganization(orgId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract convertToCustomOrganization(orgId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract updateAdminProfile(input: UpdateAdminProfileInput, file?: Nullable<Upload>): Nullable<UpdateAdminPayload> | Promise<Nullable<UpdateAdminPayload>>;

    abstract changeAdminPassword(input: ChangeAdminPasswordInput): Nullable<UpdateAdminPayload> | Promise<Nullable<UpdateAdminPayload>>;

    abstract removeAssociateDomainByAdmin(input: RemoveAssociateDomainInput): Nullable<Organization> | Promise<Nullable<Organization>>;

    abstract editTemplateDetail(input: EditCommunityTemplateInput, thumbnails?: Nullable<Upload[]>): Nullable<CommunityTemplate> | Promise<Nullable<CommunityTemplate>>;

    abstract deleteCommunityTemplate(templateId: string): Nullable<CommunityTemplate> | Promise<Nullable<CommunityTemplate>>;

    abstract unpublishCommunityTemplate(templateId: string): Nullable<CommunityTemplate> | Promise<Nullable<CommunityTemplate>>;

    abstract publishCommunityTemplate(templateId: string): Nullable<CommunityTemplate> | Promise<Nullable<CommunityTemplate>>;

    abstract adminUploadTemplate(input: AdminUploadTemplateInput, template: Upload, thumbnails?: Nullable<Upload[]>): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createTemplateCategory(name: string): Nullable<TemplateCategory> | Promise<Nullable<TemplateCategory>>;

    abstract editTemplateCategory(input: EditTemplateCategoryInput): Nullable<TemplateCategory> | Promise<Nullable<TemplateCategory>>;

    abstract deleteTemplateCategory(categoryId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createDocStackPaymentLink(input?: Nullable<CreateDocStackPaymentLinkInput>): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract changeUserEmail(input: ChangeUserEmailInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract migrateOrgBusinessToNewPrice(): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createOldBusinessPlan(email: string, priceId: string, isTrial: boolean): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract migrateLegacyBusinessToNewBusiness(orgIds?: Nullable<string[]>): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract syncHubspotWorkspace(orgId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract signUp(input: SignUpInput): Nullable<SignUpPayload> | Promise<Nullable<SignUpPayload>>;

    abstract signUpWithInvite(input: SignUpInvitationInput): Nullable<SignUpPayload> | Promise<Nullable<SignUpPayload>>;

    abstract signInByGoogle(input: SignInByGoogleInput): Nullable<SignInThirdPartyPayload> | Promise<Nullable<SignInThirdPartyPayload>>;

    abstract signInByDropbox(input: SignInByDropboxInput): Nullable<SignInThirdPartyPayload> | Promise<Nullable<SignInThirdPartyPayload>>;

    abstract signInByApple(input: SignInByAppleInput): Nullable<SignInThirdPartyPayload> | Promise<Nullable<SignInThirdPartyPayload>>;

    abstract signOut(input: SignOutInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract verifyEmail(input: VerifyEmailInput): Nullable<VerifyEmailPayload> | Promise<Nullable<VerifyEmailPayload>>;

    abstract resendVerifyEmail(input: ResendVerifyEmailInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract resetPassword(input: ResetPasswordInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract forceLogout(stayLoggedIn: boolean): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract updateUserType(landingPageToken?: Nullable<string>): Nullable<UpdateUserTypePayload> | Promise<Nullable<UpdateUserTypePayload>>;

    abstract adminForgotPassword(input: ForgotPasswordInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract adminResetPassword(input: ResetPasswordInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract adminSignOut(): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract adminCreatePassword(input: AdminCreatePasswordInput): Nullable<AdminPayload> | Promise<Nullable<AdminPayload>>;

    abstract signInByGoogleV2(input: SignInByGoogleInputV2): Nullable<SignInThirdPartyPayloadV2> | Promise<Nullable<SignInThirdPartyPayloadV2>>;

    abstract createDeviceTracking(input: CreateDeviceTrackingInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract updateDocumentActionPermissionSettings(input: UpdateDocumentActionPermissionSettingsInput): Nullable<DocumentCapabilities> | Promise<Nullable<DocumentCapabilities>>;

    abstract saveAttachedFilesMetadata(input: SaveAttachedFilesMetadataInput): Nullable<BasicResponseData> | Promise<Nullable<BasicResponseData>>;

    abstract updateDocumentSummarization(documentId: string, input: UpdateDocSummarizationInput): Nullable<DocumentSummarization> | Promise<Nullable<DocumentSummarization>>;

    abstract deleteDocumentTemplate(input: DeleteDocumentTemplateInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createDocumentFromDocumentTemplate(input: CreateDocumentFromDocumentTemplateInput): Nullable<Document> | Promise<Nullable<Document>>;

    abstract createDocuments(input: CreateDocumentsInput): Nullable<CreateDocumentsPayload> | Promise<Nullable<CreateDocumentsPayload>>;

    abstract deleteDocument(input: DeleteDocumentInput): Nullable<DeleteDocumentPayload> | Promise<Nullable<DeleteDocumentPayload>>;

    abstract renameDocument(input: RenameDocumentInput): Nullable<BasicResponseData> | Promise<Nullable<BasicResponseData>>;

    abstract updateThumbnail(input: UpdateThumbnailInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createDocumentPermission(input: CreateDocumentPermissionInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract updateDocumentPermission(input: UpdateDocumentPermissionInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract removeDocumentPermission(input: RemoveDocumentPermissionInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract shareDocument(input: ShareDocumentInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract updateBookmarks(input: UpdateBookmarksInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract updateShareSetting(input: UpdateShareSettingInput): Nullable<ShareSetting> | Promise<Nullable<ShareSetting>>;

    abstract starDocument(input: StarDocumentInput): Nullable<StarDocumentPayload> | Promise<Nullable<StarDocumentPayload>>;

    abstract updateMimeType(documentId: string): Nullable<BasicResponseData> | Promise<Nullable<BasicResponseData>>;

    abstract createPDFForm(input: CreatePDFFormInput): Nullable<CreatePDFFormPayload> | Promise<Nullable<CreatePDFFormPayload>>;

    abstract createPdfFromStaticToolUpload(input: CreatePdfFromStaticToolUploadInput): Nullable<CreatePdfFromStaticToolUploadPayload> | Promise<Nullable<CreatePdfFromStaticToolUploadPayload>>;

    abstract requestAccessDocument(input: RequestAccessDocumentInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract acceptRequestAccessDocument(input: UpdateRequestAccessInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract rejectRequestAccessDocument(input: UpdateRequestAccessInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract openDocument(documentId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract deleteMultipleDocument(input?: Nullable<DeleteMultipleDocumentInput>): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract deleteSharedDocuments(input?: Nullable<DeleteSharedDocumentsInput>): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract duplicateDocument(input: DuplicateDocumentInput, file?: Nullable<Upload>): Nullable<Document> | Promise<Nullable<Document>>;

    abstract moveDocuments(input: MoveDocumentsInput, file?: Nullable<Upload>): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract moveDocumentsToFolder(input: MoveDocumentsToFolderInput, file?: Nullable<Upload>): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createTemplateBaseOnDocument(input: CreateTemplateBaseOnDocumentInput, files?: Nullable<Nullable<Upload>[]>): Nullable<Template> | Promise<Nullable<Template>>;

    abstract bulkUpdateDocumentInvitedList(input: BulkUpdateDocumentPermissionInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract bulkUpdateDocumentMemberList(input: BulkUpdateDocumentPermissionInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createUserStartedDocument(isMobile?: Nullable<boolean>): Nullable<Document> | Promise<Nullable<Document>>;

    abstract trackingUserUseDocument(documentId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract countDocStackUsage(documentId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract restoreOriginalVersion(documentId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createDocumentBackupInfoForDocument(input: CreateDocumentBackupInfoInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract deleteDocumentImages(input: DeleteDocumentImagesInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createTemporaryContentForDrive(input: CreateDocumentBackupInfoInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract deleteTemporaryContentForDrive(documentId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract importDocumentOutlines(input: ImportDocumentOutlinesInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract updateStackedDocuments(input: UpdateStackedDocumentsInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract shareDocumentInSlack(input: ShareDocumentInSlackInput): Nullable<ShareDocumentInSlackResponse> | Promise<Nullable<ShareDocumentInSlackResponse>>;

    abstract updateDocumentMimeTypeToPdf(documentId: string, remoteId: string): Nullable<BasicResponseData> | Promise<Nullable<BasicResponseData>>;

    abstract deletePersonalEvents(): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createShareDocFeedback(input: CreateShareDocFeedbackInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createFormDetectionFeedback(input: CreateFormDetectionFeedbackInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createMobileFeedback(input: CreateMobileFeedbackInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createFolder(input: CreateFolderInput): Nullable<Folder> | Promise<Nullable<Folder>>;

    abstract editFolderInfo(input: EditFolderInput): Nullable<Folder> | Promise<Nullable<Folder>>;

    abstract addFolderColor(color: string): Nullable<Nullable<string>[]> | Promise<Nullable<Nullable<string>[]>>;

    abstract starFolder(folderId: string): Nullable<Folder> | Promise<Nullable<Folder>>;

    abstract deleteFolder(folderId: string, isNotify?: Nullable<boolean>): Nullable<string> | Promise<Nullable<string>>;

    abstract duplicateDocumentToFolder(input: DuplicateDocumentToFolderInput, file?: Nullable<Upload>): Nullable<Document> | Promise<Nullable<Document>>;

    abstract deleteMultipleFolder(input: DeleteMultipleFolderInput): Nullable<Nullable<string>[]> | Promise<Nullable<Nullable<string>[]>>;

    abstract readNotifications(input: ReadNotificationsInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract readAllNotifications(): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createOrganization(organization: CreateOrganizationInput, file?: Nullable<Upload>, disableEmail?: Nullable<boolean>): Nullable<CreateOrganizationPayload> | Promise<Nullable<CreateOrganizationPayload>>;

    abstract requestJoinOrganization(): Nullable<RequestJoinOrganizationPayload> | Promise<Nullable<RequestJoinOrganizationPayload>>;

    abstract joinOrganization(orgId: string): Nullable<JoinOrganizationPayload> | Promise<Nullable<JoinOrganizationPayload>>;

    abstract transferListTeamOwnership(input: TransferTeamsOwnershipInput): Nullable<TransferTeamsOwnershipPayload> | Promise<Nullable<TransferTeamsOwnershipPayload>>;

    abstract rejectJoinedOrgInvitation(input: RejectInvitationInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract acceptInvitationOrganization(orgId: string): Nullable<AcceptInvitationPayload> | Promise<Nullable<AcceptInvitationPayload>>;

    abstract sendRequestJoinOrg(orgId: string): Nullable<RequestJoinOrganizationPayload> | Promise<Nullable<RequestJoinOrganizationPayload>>;

    abstract requestSignSeat(input: RequestSignSeatInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract deleteMemberInOrganization(orgId: string, userId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract deletePendingInvite(orgId: string, email: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract changeAvatarOrganization(orgId: string, file: Upload): Nullable<ChangeOrganizationAvatarPayload> | Promise<Nullable<ChangeOrganizationAvatarPayload>>;

    abstract setAvatarOrganizationSuggestion(orgId: string): Nullable<ChangeOrganizationAvatarPayload> | Promise<Nullable<ChangeOrganizationAvatarPayload>>;

    abstract setAvatarFromSuggestion(orgId: string): Nullable<ChangeOrganizationAvatarPayload> | Promise<Nullable<ChangeOrganizationAvatarPayload>>;

    abstract changeProfileOrganization(orgId: string, profile: OrganizationProfileInput): Nullable<OrganizationProfilePayload> | Promise<Nullable<OrganizationProfilePayload>>;

    abstract removeAvatarOrganization(orgId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract setOrganizationMembersRole(input: SetOrganizationMembersRoleInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract rejectRequestingAccessOrganization(orgId: string, userId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract acceptRequestingAccessOrganization(orgId: string, userId: string): Nullable<BasicResponseData> | Promise<Nullable<BasicResponseData>>;

    abstract inviteOrgTeamMember(teamId: string, members: AddMemberOrgTeamInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract editOrgTeamInfo(teamId: string, team: TeamInput, file?: Nullable<Upload>): Nullable<Team> | Promise<Nullable<Team>>;

    abstract transferTeamOwnership(teamId: string, userId: string): Nullable<Team> | Promise<Nullable<Team>>;

    abstract removeOrgTeamMember(teamId: string, userId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract deleteOrgTeam(teamId: string): Nullable<DeleteTeamPayload> | Promise<Nullable<DeleteTeamPayload>>;

    abstract exportDomainData(orgId: string): Nullable<ExportDomainPayload> | Promise<Nullable<ExportDomainPayload>>;

    abstract updateGoogleSignInSecurity(orgId: string, isActive: boolean): Nullable<Organization> | Promise<Nullable<Organization>>;

    abstract scheduleDeleteOrganization(orgId: string): Nullable<DeleteOrganizationPayload> | Promise<Nullable<DeleteOrganizationPayload>>;

    abstract createSubscriptionInOrganization(orgId: string, subcriptionInput: CreateOrganizationSubscriptionInput): Nullable<ChargeResponse> | Promise<Nullable<ChargeResponse>>;

    abstract createUnifySubscriptionInOrganization(orgId: string, subscriptionInput: CreateUnifySubscriptionInput): Nullable<ChargeResponse> | Promise<Nullable<ChargeResponse>>;

    abstract upgradeOrganizationSubcription(orgId: string, upgradeSubcriptionInput: UpgradeOrganizationSubscriptionInput): Nullable<ChargeResponse> | Promise<Nullable<ChargeResponse>>;

    abstract upgradeUnifySubscriptionInOrganization(orgId: string, subscriptionInput: UpgradeUnifySubscriptionInput): Nullable<ChargeResponse> | Promise<Nullable<ChargeResponse>>;

    abstract reactiveOrganization(orgId: string): Nullable<ReactiveOrganizationPayload> | Promise<Nullable<ReactiveOrganizationPayload>>;

    abstract reactiveOrganizationSubscription(orgId: string): Nullable<PaymentResponse> | Promise<Nullable<PaymentResponse>>;

    abstract reactivateUnifyOrganizationSubscription(input: ReactivateUnifySubscriptionInput): Nullable<PaymentResponse> | Promise<Nullable<PaymentResponse>>;

    abstract forceResetOrgMemberPassword(orgId: string): Nullable<ForceResetPasswordPayload> | Promise<Nullable<ForceResetPasswordPayload>>;

    abstract createOrganizationFolder(input: CreateOrganizationFolderInput): Nullable<Folder> | Promise<Nullable<Folder>>;

    abstract createOrganizationTeamFolder(input: CreateOrganizationTeamFolderInput): Nullable<Folder> | Promise<Nullable<Folder>>;

    abstract updateOrgTemplateWorkspace(input?: Nullable<UpdateOrgTemplateWorkspaceInput>): Nullable<Organization> | Promise<Nullable<Organization>>;

    abstract updateTeamSettings(teamId: string, settings: UpdateTeamSettingsInput): Nullable<Team> | Promise<Nullable<Team>>;

    abstract addAssociateDomain(input: AddAssociateDomainInput): Nullable<Organization> | Promise<Nullable<Organization>>;

    abstract editAssociateDomain(input: EditAssociateDomainInput): Nullable<Organization> | Promise<Nullable<Organization>>;

    abstract removeAssociateDomain(input: RemoveAssociateDomainInput): Nullable<Organization> | Promise<Nullable<Organization>>;

    abstract createOrgStartedDocument(orgId: string, isMobile?: Nullable<boolean>): Nullable<Document> | Promise<Nullable<Document>>;

    abstract updateDomainVisibilitySetting(orgId: string, visibilitySetting: DomainVisibilitySetting): Nullable<OrganizationSettings> | Promise<Nullable<OrganizationSettings>>;

    abstract resendOrganizationInvitation(orgId: string, invitationId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract removeOrganizationInvitation(orgId: string, invitationId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createFreeTrialSubscription(input: SubscriptionTrialInput): Nullable<PaymentResponse> | Promise<Nullable<PaymentResponse>>;

    abstract createFreeTrialUnifySubscription(input: CreateFreeTrialUnifySubscriptionInput): Nullable<PaymentResponse> | Promise<Nullable<PaymentResponse>>;

    abstract cancelOrganizationFreeTrial(orgId: string): Nullable<PaymentResponse> | Promise<Nullable<PaymentResponse>>;

    abstract changeAutoUpgradeSetting(orgId: string, enabled: boolean): Nullable<OrganizationSettings> | Promise<Nullable<OrganizationSettings>>;

    abstract removeOrganizationPaymentMethod(orgId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract retrieveOrganizationSetupIntent(orgId: string, reCaptchaTokenV3: string, type?: Nullable<RetrieveOrganizationSetupIntentType>): Nullable<RetrieveOrganizationSetupIntentResponse> | Promise<Nullable<RetrieveOrganizationSetupIntentResponse>>;

    abstract deactivateOrganizationSetupIntent(orgId: string, stripeAccountId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract extraTrialDaysOrganization(input: ExtraTrialDaysOrganizationInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract updateInviteUsersSetting(orgId: string, inviteUsersSetting: InviteUsersSetting): Nullable<OrganizationSettings> | Promise<Nullable<OrganizationSettings>>;

    abstract createOrganizationInviteLink(input?: Nullable<OrganizationInviteLinkInput>): Nullable<OrganizationInviteLink> | Promise<Nullable<OrganizationInviteLink>>;

    abstract regenerateOrganizationInviteLink(input?: Nullable<OrganizationInviteLinkInput>): Nullable<OrganizationInviteLink> | Promise<Nullable<OrganizationInviteLink>>;

    abstract deleteOrganizationInviteLink(orgId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract upsertSamlSsoConfiguration(input?: Nullable<SamlSsoConfigurationInput>): Nullable<SamlSsoConfiguration> | Promise<Nullable<SamlSsoConfiguration>>;

    abstract deleteSamlSsoConfiguration(orgId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract enableScimSsoProvision(orgId: string): Nullable<ScimSsoConfiguration> | Promise<Nullable<ScimSsoConfiguration>>;

    abstract disableScimSsoProvision(orgId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract assignSignSeats(input?: Nullable<AssignSignSeatsInput>): Nullable<UpdateSignSeatsResponse> | Promise<Nullable<UpdateSignSeatsResponse>>;

    abstract unassignSignSeats(input?: Nullable<UnassignSignSeatsInput>): Nullable<UpdateSignSeatsResponse> | Promise<Nullable<UpdateSignSeatsResponse>>;

    abstract rejectSignSeatRequests(input: RejectSignSeatRequestsInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract retrieveOrganizationSetupIntentV2(input: RetrieveOrganizationSetupIntentV2Input): Nullable<RetrieveOrganizationSetupIntentResponse> | Promise<Nullable<RetrieveOrganizationSetupIntentResponse>>;

    abstract inviteMemberToOrganization(orgId: string, members?: Nullable<Nullable<InviteToOrganizationInput>[]>, extraTrial?: Nullable<boolean>): Nullable<InviteMemberToOrganizationPayload> | Promise<Nullable<InviteMemberToOrganizationPayload>>;

    abstract inviteMemberToOrganizationAddDocStack(orgId: string, members?: Nullable<Nullable<InviteToOrganizationInput>[]>, extraTrial?: Nullable<boolean>): Nullable<InviteMemberToOrganizationPayload> | Promise<Nullable<InviteMemberToOrganizationPayload>>;

    abstract confirmOrganizationAdminTransfer(token: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract leaveOrganization(orgId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract uploadDocumentToOrganization(orgId: string, files: Nullable<Upload>[], isNotify?: Nullable<boolean>, folderId?: Nullable<string>): Nullable<Document> | Promise<Nullable<Document>>;

    abstract uploadDocumentToOrganizationV2(input: UploadDocumentToOrgInput): Nullable<Document> | Promise<Nullable<Document>>;

    abstract uploadDocumentToOrgTeam(teamId: string, files: Nullable<Upload>[], folderId?: Nullable<string>): Nullable<Document> | Promise<Nullable<Document>>;

    abstract uploadDocumentToOrgTeamV2(input: UploadDocumentToTeamInput): Nullable<Document> | Promise<Nullable<Document>>;

    abstract leaveOrgTeam(teamId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createOrganizationTeam(orgId: string, team: TeamInput, members?: Nullable<AddMemberOrgTeamInput>, file?: Nullable<Upload>): Nullable<CreateOrganizationTeamPayload> | Promise<Nullable<CreateOrganizationTeamPayload>>;

    abstract uploadTeamTemplate(input: UploadTeamTemplateInput, files: Nullable<Upload>[]): Nullable<Template> | Promise<Nullable<Template>>;

    abstract uploadOrganizationTemplate(input: UploadOrganizationTemplateInput, files: Nullable<Upload>[]): Nullable<Template> | Promise<Nullable<Template>>;

    abstract uploadDocumentToPersonal(input: UploadPersonalDocumentInput, files: Nullable<Upload>[]): Nullable<Document> | Promise<Nullable<Document>>;

    abstract uploadDocumentToPersonalV2(input: UploadPersonalDocumentInputV2): Nullable<Document> | Promise<Nullable<Document>>;

    abstract uploadThirdPartyDocuments(input: UploadThirdPartyDocumentsInput): Nullable<Nullable<Document>[]> | Promise<Nullable<Nullable<Document>[]>>;

    abstract createPersonalFolderInOrg(input: CreateOrganizationFolderInput): Nullable<Folder> | Promise<Nullable<Folder>>;

    abstract hideInformMyDocumentModal(orgId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract uploadDocumentTemplateToPersonal(input: UploadPersonalDocumentTemplateInput): Nullable<DocumentTemplate> | Promise<Nullable<DocumentTemplate>>;

    abstract uploadDocumentTemplateToOrganization(input: UploadDocumentTemplateToOrgInput): Nullable<DocumentTemplate> | Promise<Nullable<DocumentTemplate>>;

    abstract uploadDocumentTemplateToOrgTeam(input: UploadDocumentTemplateToTeamInput): Nullable<DocumentTemplate> | Promise<Nullable<DocumentTemplate>>;

    abstract cancelSubscription(input: CancelSubscriptionInput): Nullable<PaymentResponse> | Promise<Nullable<PaymentResponse>>;

    abstract cancelUnifySubscription(input: CancelUnifySubscriptionInput): Nullable<PaymentResponse> | Promise<Nullable<PaymentResponse>>;

    abstract updatePaymentMethod(input: UpdatePaymentMethodInput): Nullable<UpdatePaymentMethodResponse> | Promise<Nullable<UpdatePaymentMethodResponse>>;

    abstract reactiveSubscription(): Nullable<PaymentResponse> | Promise<Nullable<PaymentResponse>>;

    abstract retryFailedSubscription(clientId: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract closeBillingBanner(clientId: string, bannerType: CloseBillingBannerType): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract retrieveSetupIntentV2(reCaptchaTokenV3?: Nullable<string>): Nullable<RetrieveSetupIntentResponse> | Promise<Nullable<RetrieveSetupIntentResponse>>;

    abstract retrieveTrialSetupIntent(reCaptchaTokenV3: string): Nullable<string> | Promise<Nullable<string>>;

    abstract deactivateSetupIntent(stripeAccountId?: Nullable<string>): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract deactivateTrialSetupIntent(): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract removePersonalPaymentMethod(): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract retrieveSetupIntentV3(input: RetrieveSetupIntentV3Input): Nullable<RetrieveSetupIntentResponse> | Promise<Nullable<RetrieveSetupIntentResponse>>;

    abstract revokeSlackConnection(teamId?: Nullable<string>): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract uploadPersonalTemplate(input: UploadPersonalTemplateInput, files: Nullable<Upload>[]): Nullable<Template> | Promise<Nullable<Template>>;

    abstract createDocumentFromTemplate(templateId: string, notify?: Nullable<boolean>): Nullable<Document> | Promise<Nullable<Document>>;

    abstract updateTemplateCounter(input: UpdateTemplateCounterInput): Nullable<Template> | Promise<Nullable<Template>>;

    abstract deleteTemplate(input: DeleteTemplateInput): Nullable<DeleteTemplatePayload> | Promise<Nullable<DeleteTemplatePayload>>;

    abstract editTemplate(input: EditTemplateInput, file?: Nullable<Upload>): Nullable<Template> | Promise<Nullable<Template>>;

    abstract editUser(input: EditUserInput): Nullable<User> | Promise<Nullable<User>>;

    abstract updateSetting(input: UpdateSettingInput): Nullable<User> | Promise<Nullable<User>>;

    abstract seenNewNotificationsTab(tab: NotificationTab): Nullable<User> | Promise<Nullable<User>>;

    abstract removeAvatar(): Nullable<User> | Promise<Nullable<User>>;

    abstract changePassword(input: ChangePasswordInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract unsubscribeEmailMarketing(input: UnsubscribeEmailMarketingInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract deleteAccount(): Nullable<User> | Promise<Nullable<User>>;

    abstract addNewSignature(xfdf: string): Nullable<User> | Promise<Nullable<User>>;

    abstract deleteSignatureByIndex(index: number): Nullable<User> | Promise<Nullable<User>>;

    abstract deleteSignatureByRemoteId(signatureRemoteId: string): Nullable<User> | Promise<Nullable<User>>;

    abstract updateUserMetadata(input: UserMetadataInput): Nullable<UpdateUserGuidePayload> | Promise<Nullable<UpdateUserGuidePayload>>;

    abstract saveAutoSyncTrial(): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract saveAbSignatureHubspot(): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract reactivateUser(): Nullable<User> | Promise<Nullable<User>>;

    abstract hideRatingModal(): Nullable<User> | Promise<Nullable<User>>;

    abstract seenNewVersion(): Nullable<User> | Promise<Nullable<User>>;

    abstract confirmUpdatingAnnotOfAnother(input?: Nullable<ConfirmUpdatingAnnotInput>): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract trackDownloadClickedEvent(): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract updateUserMobileFreeToolsBanner(): Nullable<User> | Promise<Nullable<User>>;

    abstract saveHubspotProperties(input: HubspotPropertiesInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract updateDefaultWorkspace(orgId: string): Nullable<User> | Promise<Nullable<User>>;

    abstract ratedApp(input?: Nullable<RatedAppInput>): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract updateMobileFeedbackModalStatus(input: MobileFeedbackModalStatusInput): Nullable<UserRating> | Promise<Nullable<UserRating>>;

    abstract updateSignaturePosition(input: UpdateSignaturePositionInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract increaseExploredFeatureUsage(input: IncreaseExploredFeatureUsageInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract verifyOrganizationInviteLink(inviteLinkId: string): Nullable<VerifyOrganizationInviteLinkPayload> | Promise<Nullable<VerifyOrganizationInviteLinkPayload>>;

    abstract acceptNewTermsOfUse(input?: Nullable<AcceptNewTermsOfUseInput>): Nullable<UpdateUserGuidePayload> | Promise<Nullable<UpdateUserGuidePayload>>;

    abstract createUserAnnotation(input: CreateUserAnnotationInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract removeUserAnnotation(id: string): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract updateUserAnnotationPosition(input: UpdateUserAnnotationPositionInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract dismissWidgetNotification(input: DismissWidgetNotificationsInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract previewWidgetNotification(input: WidgetIdsInput): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract previewAllWidgetNotifications(): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract dismissAllWidgetNotifications(): Nullable<BasicResponse> | Promise<Nullable<BasicResponse>>;

    abstract createWidgetNotification(widgetType: WidgetType): Nullable<BasicResponseData> | Promise<Nullable<BasicResponseData>>;
}

export abstract class ISubscription {
    abstract updateAdminPermission(): Nullable<UpdateAdminPermissionPayload> | Promise<Nullable<UpdateAdminPermissionPayload>>;

    abstract updateDocumentTemplateList(input: UpdateDocumentTemplateListInput): Nullable<UpdateDocumentTemplateListPayload> | Promise<Nullable<UpdateDocumentTemplateListPayload>>;

    abstract deleteDocumentTemplate(clientId: string): Nullable<DeleteDocumentTemplatePayload> | Promise<Nullable<DeleteDocumentTemplatePayload>>;

    abstract updateDocumentList(input: UpdateDocumentListInput): Nullable<UpdateDocumentListPayload> | Promise<Nullable<UpdateDocumentListPayload>>;

    abstract updateDocumentInfo(input: UpdateDocumentInfoInput): Nullable<UpdateDocumentInfoPayload> | Promise<Nullable<UpdateDocumentInfoPayload>>;

    abstract updateBookmark(input: UpdateDocumentBookmarkInput): Nullable<UpdateDocumentBookmarkPayload> | Promise<Nullable<UpdateDocumentBookmarkPayload>>;

    abstract deleteOriginalDocument(clientId: string): Nullable<DeleteOriginalDocumentPayload> | Promise<Nullable<DeleteOriginalDocumentPayload>>;

    abstract documentSharingQueue(clientId: string): Nullable<DocumentSharingQueuePayload> | Promise<Nullable<DocumentSharingQueuePayload>>;

    abstract createFolderSubscription(input: CreateFolderSubscriptionInput): Nullable<CreateFolderPayload> | Promise<Nullable<CreateFolderPayload>>;

    abstract updateFolderSubscription(input: UpdateFolderSubscriptionInput): Nullable<UpdateFolderPayload> | Promise<Nullable<UpdateFolderPayload>>;

    abstract folderEventSubscription(input: FolderEventSubscriptionInput): Nullable<FolderEventSubscriptionPayload> | Promise<Nullable<FolderEventSubscriptionPayload>>;

    abstract newNotification(input: NewNotificationInput): Nullable<Notification> | Promise<Nullable<Notification>>;

    abstract deleteNotification(input: DeleteNotificationInput): Nullable<DeleteNotificationPayload> | Promise<Nullable<DeleteNotificationPayload>>;

    abstract updateConvertedOrganization(orgIds: Nullable<string>[]): Nullable<Organization> | Promise<Nullable<Organization>>;

    abstract updateOrganization(orgId: string): Nullable<UpdateOrganizationPayload> | Promise<Nullable<UpdateOrganizationPayload>>;

    abstract removeOrgMember(orgId: string): Nullable<RemoveOrgMemberPayload> | Promise<Nullable<RemoveOrgMemberPayload>>;

    abstract updateOrgMemberRole(orgId: string): Nullable<UpdateOrgMemberRolePayload> | Promise<Nullable<UpdateOrgMemberRolePayload>>;

    abstract deleteOrganizationSub(orgId: string): Nullable<SubscriptionDeleteOrganizationPayload> | Promise<Nullable<SubscriptionDeleteOrganizationPayload>>;

    abstract convertOrganization(orgId: string): Nullable<SubscriptionConvertOrganizationPayload> | Promise<Nullable<SubscriptionConvertOrganizationPayload>>;

    abstract cancelOrganizationSubscription(orgId: string): Nullable<SubscriptionCancelTrialPayload> | Promise<Nullable<SubscriptionCancelTrialPayload>>;

    abstract changedDocumentStackSubscription(orgId: string): Nullable<SubscriptionChangedDocStackPayload> | Promise<Nullable<SubscriptionChangedDocStackPayload>>;

    abstract updateOrganizationInviteLink(orgId: string): Nullable<UpdateOrganizationInviteLinkPayload> | Promise<Nullable<UpdateOrganizationInviteLinkPayload>>;

    abstract updateContractStackSubscription(orgId: string): Nullable<SignDocStackStorage> | Promise<Nullable<SignDocStackStorage>>;

    abstract updateSignSeatSubscription(orgId: string): Nullable<UpdateSignSeatSubscriptionPayload> | Promise<Nullable<UpdateSignSeatSubscriptionPayload>>;

    abstract timeSensitiveCouponCreated(orgId: string): Nullable<TimeSensitiveCouponPayload> | Promise<Nullable<TimeSensitiveCouponPayload>>;

    abstract updateTeams(input: UpdateTeamsInput): Nullable<UpdateTeamsPayload> | Promise<Nullable<UpdateTeamsPayload>>;

    abstract deleteAccountSubscription(): Nullable<DeleteAccountSubscriptionPayload> | Promise<Nullable<DeleteAccountSubscriptionPayload>>;

    abstract updateUserSubscription(): Nullable<UpdateUserSubscriptionPayload> | Promise<Nullable<UpdateUserSubscriptionPayload>>;
}

export class SignUpPayload {
    message: string;
    statusCode: number;
    userId?: Nullable<string>;
}

export class SignInPayload {
    token: string;
    refreshToken: string;
    user?: Nullable<User>;
    origin?: Nullable<string>;
}

export class AdminSignInPayload {
    token: string;
    user: Admin;
}

export class SignInThirdPartyPayload {
    token: string;
    refreshToken: string;
    user?: Nullable<User>;
    isSignedUp: boolean;
    isMergedAccount?: Nullable<boolean>;
}

export class SignInThirdPartyPayloadV2 {
    token: string;
    refreshToken: string;
    user?: Nullable<User>;
    isSignedUp: boolean;
    oauth2Token?: Nullable<string>;
    idToken?: Nullable<string>;
    scope: string;
    isMergedAccount?: Nullable<boolean>;
}

export class SignOutPayload {
    message: string;
    statusCode: number;
}

export class VerifyEmailPayload {
    email?: Nullable<string>;
    message: string;
    statusCode: number;
}

export class ResendVerifyEmailPayload {
    message: string;
    statusCode: number;
}

export class ForgotPasswordPayload {
    name: string;
    token: string;
}

export class ResetPasswordPayload {
    message: string;
    statusCode: number;
}

export class VerifyTokenPayload {
    token?: Nullable<string>;
    user: User;
}

export class AdminVerifyTokenPayload {
    token?: Nullable<string>;
    user: Admin;
}

export class VerifyPasswordPayload {
    verified: boolean;
}

export class CheckLoginExternalPayload {
    external: boolean;
}

export class InviteOrgVerificationPayload {
    isLuminUser: boolean;
    email: string;
    orgUrl?: Nullable<string>;
    orgName?: Nullable<string>;
    isValidToken: boolean;
    notFinishedAuthenFlow?: Nullable<boolean>;
}

export class GetLandingPageTokenPayload {
    landingPageToken: string;
}

export class UpdateUserTypePayload {
    type: string;
    statusCode: number;
    message: string;
}

export class VerifySharingDocPayload {
    email: string;
    documentId: string;
    documentName: string;
    linkType: string;
    isSignedUp: boolean;
}

export class ExchangeGoogleTokenPayload {
    idToken: string;
    accessToken: string;
    scope: string;
}

export class GoogleToken {
    token: string;
    scope: string;
}

export class SigninWithLuminPayload {
    user: User;
    token: string;
    refreshToken: string;
    idToken: string;
}

export class VerifyInvitationMetadataPayload {
    orgId?: Nullable<string>;
    documentId?: Nullable<string>;
    orgUrl?: Nullable<string>;
    orgName?: Nullable<string>;
    invitationId?: Nullable<string>;
}

export class VerifyInvitationTokenPayload {
    type: string;
    email: string;
    status: string;
    newAuthProcessing?: Nullable<boolean>;
    metadata?: Nullable<VerifyInvitationMetadataPayload>;
}

export class CredentialsFromOpenGooglePayload {
    userId?: Nullable<string>;
    email?: Nullable<string>;
    token?: Nullable<string>;
    refreshToken?: Nullable<string>;
    googleAccessToken?: Nullable<string>;
}

export class BasicResponse {
    message: string;
    statusCode: number;
}

export class BasicResponseData {
    message: string;
    statusCode: number;
    data?: Nullable<Object>;
}

export class Payment {
    customerRemoteId?: Nullable<string>;
    subscriptionRemoteId?: Nullable<string>;
    planRemoteId?: Nullable<string>;
    type?: Nullable<string>;
    period?: Nullable<string>;
    status?: Nullable<string>;
    stripeSubscriptionStatus?: Nullable<string>;
    quantity?: Nullable<number>;
    currency?: Nullable<string>;
    remainingPlan?: Nullable<RemainingPlan>;
    productId?: Nullable<string>;
    priceVersion?: Nullable<PriceVersion>;
    trialInfo?: Nullable<TrialInfo>;
    stripeAccountId?: Nullable<string>;
    subscriptionItems?: Nullable<Nullable<SubscriptionItem>[]>;
}

export class Setting {
    marketingEmail?: Nullable<boolean>;
    subscriptionEmail?: Nullable<boolean>;
    otherEmail?: Nullable<boolean>;
    featureUpdateEmail?: Nullable<boolean>;
    dataCollection?: Nullable<boolean>;
    documentEmail?: Nullable<DocumentEmail>;
    organizationEmail?: Nullable<OrganizationEmail>;
    defaultWorkspace?: Nullable<string>;
}

export class DocumentEmail {
    shareDocument?: Nullable<boolean>;
    commentDocument?: Nullable<boolean>;
    replyCommentDocument?: Nullable<boolean>;
    mentionCommentDocument?: Nullable<boolean>;
    requestAccessDocument?: Nullable<boolean>;
}

export class OrganizationEmail {
    inviteToOrganization?: Nullable<boolean>;
    inviteToOrganizationTeam?: Nullable<boolean>;
}

export class TemplateCategory {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    slug?: Nullable<string>;
    creator?: Nullable<BasicUserInfo>;
    numberTemplateBonded?: Nullable<number>;
    lastEditorBy?: Nullable<BasicUserInfo>;
    createdAt?: Nullable<Date>;
    updatedAt?: Nullable<Date>;
}

export class RateCommunityTemplate {
    rateAvg?: Nullable<number>;
    rateCount?: Nullable<number>;
}

export class BasicUserInfo {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    email?: Nullable<string>;
}

export class DraftTemplate {
    name?: Nullable<string>;
    url?: Nullable<string>;
    thumbnails?: Nullable<Nullable<string>[]>;
    description?: Nullable<string>;
    categories?: Nullable<Nullable<TemplateCategory>[]>;
    metaTitle?: Nullable<string>;
    metaDescription?: Nullable<string>;
    metaKeywords?: Nullable<Nullable<string>[]>;
}

export class CommunityTemplate {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    url?: Nullable<string>;
    thumbnails?: Nullable<Nullable<string>[]>;
    description?: Nullable<string>;
    categories?: Nullable<Nullable<TemplateCategory>[]>;
    metaTitle?: Nullable<string>;
    metaDescription?: Nullable<string>;
    metaKeywords?: Nullable<Nullable<string>[]>;
    remoteId?: Nullable<string>;
    owner?: Nullable<BasicUserInfo>;
    lastModifier?: Nullable<BasicUserInfo>;
    publishDate?: Nullable<Date>;
    status?: Nullable<CommunityTemplateState>;
    type?: Nullable<CommunityTemplateType>;
    counter?: Nullable<TemplateCounter>;
    rateStar?: Nullable<RateCommunityTemplate>;
    lastUpdate?: Nullable<Date>;
    draftTemplate?: Nullable<DraftTemplate>;
    hasDraft?: Nullable<boolean>;
    relatedTemplates?: Nullable<Nullable<CommunityTemplate>[]>;
    createdAt?: Nullable<Date>;
}

export class GetTemplateCategoryPayload {
    categories?: Nullable<Nullable<TemplateCategory>[]>;
    total?: Nullable<number>;
}

export class GetCommunityTemplatePayload {
    templates?: Nullable<Nullable<CommunityTemplate>[]>;
    currentCategory?: Nullable<TemplateCategory>;
    total?: Nullable<number>;
}

export class DocumentSummary {
    ownedDocumentTotal?: Nullable<number>;
    sharedDocumentTotal?: Nullable<number>;
    commentTotal?: Nullable<number>;
}

export class OrgDocumentSummary {
    ownedDocumentTotal?: Nullable<number>;
    signatureTotal?: Nullable<number>;
    annotationTotal?: Nullable<number>;
}

export class TotalDailyNewResource {
    date?: Nullable<string>;
    total?: Nullable<number>;
}

export class DocumentStat {
    derivativeDocumentRate?: Nullable<number>;
    derivativeCommentRate?: Nullable<number>;
    derivativeSignatureRate?: Nullable<number>;
    derivativeAnnotationRate?: Nullable<number>;
    dailyNewDocuments?: Nullable<Nullable<TotalDailyNewResource>[]>;
    dailyNewComments?: Nullable<Nullable<TotalDailyNewResource>[]>;
    dailyNewSignatures?: Nullable<Nullable<TotalDailyNewResource>[]>;
    dailyNewAnnotations?: Nullable<Nullable<TotalDailyNewResource>[]>;
}

export class GetDocumentSummaryPayload {
    documentSummary?: Nullable<DocumentSummary>;
    documentStat?: Nullable<DocumentStat>;
}

export class NonDocumentStat {
    derivativeMemberRate?: Nullable<number>;
}

export class GetOrganizationInsightPayload {
    documentSummary?: Nullable<OrgDocumentSummary>;
    documentStat?: Nullable<DocumentStat>;
    nonDocumentStat?: Nullable<NonDocumentStat>;
    lastUpdated?: Nullable<string>;
}

export class DeviceTracking {
    deviceId?: Nullable<string>;
    userIds?: Nullable<Nullable<string>[]>;
    platform?: Nullable<string>;
    deviceModel?: Nullable<string>;
    apiLevel?: Nullable<number>;
    isRooted?: Nullable<boolean>;
}

export class ProcessDocumentForChatbotPayload {
    needToUpload?: Nullable<boolean>;
    putObjectUrl?: Nullable<string>;
}

export class GetPresignedUrlForAttachedFilesPayload {
    presignedUrl?: Nullable<string>;
}

export class CheckAttachedFilesMetadataPayload {
    etag: string;
    isExist: boolean;
}

export class CreatePresignedFormFieldDetectionUrlPayload {
    document?: Nullable<ISignedUrl>;
    blockTime?: Nullable<number>;
    presignedUrl?: Nullable<string>;
    sessionId?: Nullable<string>;
    usage?: Nullable<number>;
    priority?: Nullable<number>;
    isExceeded?: Nullable<boolean>;
}

export class BatchCreatePresignedFormFieldDetectionUrlPayload {
    document?: Nullable<ISignedUrl>;
    blockTime?: Nullable<number>;
    presignedUrl?: Nullable<string>;
    sessionId?: Nullable<string>;
    usage?: Nullable<number>;
    isExceeded?: Nullable<boolean>;
}

export class GetFormFieldDetectionUsagePayload {
    usage?: Nullable<number>;
    blockTime?: Nullable<number>;
}

export class DocumentSummarization {
    status?: Nullable<DocumentSummarizationStatus>;
    content?: Nullable<string>;
    vote?: Nullable<DocumentSummarizationVote>;
    availability?: Nullable<SummarizationAvailability>;
    documentVersion?: Nullable<number>;
}

export class UpdateDocumentTemplateListPayload {
    teamId?: Nullable<string>;
    organizationId?: Nullable<string>;
    clientId: string;
    document: DocumentTemplate;
    type: string;
    statusCode: number;
}

export class DeleteDocumentTemplatePayload {
    statusCode: number;
    teamId?: Nullable<string>;
    organizationId?: Nullable<string>;
    clientId: string;
    documentTemplateId: string;
    type: string;
}

export class DocumentStatus {
    isSyncing?: Nullable<boolean>;
}

export class LocationInfo {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    url?: Nullable<string>;
    ownedOrgId?: Nullable<string>;
    avatarRemoteId?: Nullable<string>;
}

export class BelongsTo {
    type?: Nullable<LocationType>;
    location?: Nullable<LocationInfo>;
    workspaceId?: Nullable<string>;
}

export class DocumentSummarizationPolicies {
    enabled?: Nullable<boolean>;
    maxPages?: Nullable<number>;
}

export class ExternalSyncPolicies {
    oneDrive?: Nullable<boolean>;
}

export class ActionCountDocStack {
    print?: Nullable<boolean>;
    download?: Nullable<boolean>;
    share?: Nullable<boolean>;
    sync?: Nullable<boolean>;
}

export class DocumentVersioningPolicies {
    quantity?: Nullable<number>;
    maximumSaveTime?: Nullable<number>;
    maximumSaveTimeUnit?: Nullable<string>;
}

export class CompressPdfPolicies {
    enabled?: Nullable<boolean>;
    fileSizeLimitInMB?: Nullable<number>;
    availableCompressQuality?: Nullable<AvailableCompressQuality[]>;
}

export class AiChatbotPolicies {
    daily?: Nullable<number>;
    attachedFilesSizeLimitInMB?: Nullable<number>;
}

export class PremiumToolsInfo {
    passwordProtection?: Nullable<boolean>;
    watermark?: Nullable<boolean>;
    formBuilder?: Nullable<boolean>;
    autoSync?: Nullable<boolean>;
    editPDFContent?: Nullable<boolean>;
    splitPage?: Nullable<boolean>;
    mergePage?: Nullable<boolean>;
    rotatePage?: Nullable<boolean>;
    deletePage?: Nullable<boolean>;
    movePage?: Nullable<boolean>;
    insertPage?: Nullable<boolean>;
    cropPage?: Nullable<boolean>;
    highlight?: Nullable<boolean>;
    freeHand?: Nullable<boolean>;
    freeText?: Nullable<boolean>;
    redaction?: Nullable<boolean>;
    shape?: Nullable<boolean>;
    stamp?: Nullable<boolean>;
    rubberStamp?: Nullable<boolean>;
    textTool?: Nullable<boolean>;
    comment?: Nullable<boolean>;
    eraser?: Nullable<boolean>;
    maximumNumberSignature?: Nullable<number>;
    priceVersion?: Nullable<PriceVersion>;
    restoreOriginal?: Nullable<boolean>;
    ocr?: Nullable<boolean>;
    maximumMergeSize?: Nullable<number>;
    dotStamp?: Nullable<boolean>;
    crossStamp?: Nullable<boolean>;
    tickStamp?: Nullable<boolean>;
    documentSummarization?: Nullable<DocumentSummarizationPolicies>;
    externalSync?: Nullable<ExternalSyncPolicies>;
    documentVersioning?: Nullable<DocumentVersioningPolicies>;
    compressPdf?: Nullable<CompressPdfPolicies>;
    aiChatbot?: Nullable<AiChatbotPolicies>;
    actionCountDocStack?: Nullable<ActionCountDocStack>;
    signedResponse?: Nullable<string>;
}

export class DocumentMetadata {
    hasAppliedOCR?: Nullable<boolean>;
    hasMerged?: Nullable<boolean>;
    hasOutlines?: Nullable<boolean>;
    hasClearedAnnotAndManip?: Nullable<boolean>;
}

export class FormField {
    name?: Nullable<string>;
    value?: Nullable<string>;
    xfdf?: Nullable<string>;
    isDeleted?: Nullable<boolean>;
    isInternal?: Nullable<boolean>;
    widgetId?: Nullable<string>;
    pageNumber?: Nullable<number>;
    createdAt?: Nullable<Date>;
    updatedAt?: Nullable<Date>;
}

export class GetDocumentOutlinesPayload {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    parentId?: Nullable<string>;
    pathId?: Nullable<string>;
    parentPath?: Nullable<string>;
    level?: Nullable<number>;
    lexicalRanking?: Nullable<string>;
    pageNumber?: Nullable<number>;
    verticalOffset?: Nullable<number>;
    horizontalOffset?: Nullable<number>;
    hasChildren?: Nullable<boolean>;
}

export class DocumentCapabilities {
    canEditDocumentActionPermission?: Nullable<boolean>;
    canExport?: Nullable<boolean>;
    canCopy?: Nullable<boolean>;
    canPrint?: Nullable<boolean>;
    canSaveAsTemplate?: Nullable<boolean>;
    canMerge?: Nullable<boolean>;
    canSendForSignatures?: Nullable<boolean>;
    canRequestSignatures?: Nullable<boolean>;
    canSaveACertifiedVersion?: Nullable<boolean>;
    principleList?: Nullable<Nullable<string>[]>;
}

export class Document {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    remoteId?: Nullable<string>;
    remoteEmail?: Nullable<string>;
    size?: Nullable<number>;
    service?: Nullable<string>;
    isPersonal?: Nullable<boolean>;
    mimeType?: Nullable<string>;
    annotations?: Nullable<string>;
    ownerId?: Nullable<string>;
    ownerAvatarRemoteId?: Nullable<string>;
    lastAccess?: Nullable<string>;
    lastModify?: Nullable<string>;
    createdAt?: Nullable<string>;
    downloadUrl?: Nullable<string>;
    manipulationStep?: Nullable<string>;
    thumbnail?: Nullable<string>;
    bookmarks?: Nullable<string>;
    listUserStar?: Nullable<Nullable<string>[]>;
    ownerOfTeamDocument?: Nullable<boolean>;
    enableGoogleSync?: Nullable<boolean>;
    signedUrl?: Nullable<string>;
    isShared?: Nullable<boolean>;
    folderId?: Nullable<string>;
    getAnnotationUrl?: Nullable<string>;
    etag?: Nullable<string>;
    lastChangedAnnotation?: Nullable<Date>;
    clientId?: Nullable<string>;
    roleOfDocument?: Nullable<string>;
    documentType?: Nullable<TypeOfDocument>;
    shareSetting?: Nullable<ShareSetting>;
    folderData?: Nullable<FolderPublicInfo>;
    isOverTimeLimit?: Nullable<boolean>;
    ownerName?: Nullable<string>;
    ownerEmail?: Nullable<string>;
    belongsTo?: Nullable<BelongsTo>;
    version?: Nullable<number>;
    premiumToolsInfo?: Nullable<PremiumToolsInfo>;
    backupInfo?: Nullable<BackupInfo>;
    imageSignedUrls?: Nullable<Object>;
    temporaryRemoteId?: Nullable<string>;
    lastModifiedBy?: Nullable<string>;
    metadata?: Nullable<DocumentMetadata>;
    externalStorageAttributes?: Nullable<Object>;
    sharedPermissionInfo?: Nullable<SharedPermissionInfo>;
    fromSource?: Nullable<DocumentFromSourceEnum>;
    thumbnailRemoteId?: Nullable<string>;
    openedAt?: Nullable<string>;
    status?: Nullable<DocumentStatus>;
    actionCountDocStack?: Nullable<ActionCountDocStack>;
    capabilities?: Nullable<DocumentCapabilities>;
    kind?: Nullable<DocumentKindEnum>;
}

export class DocumentForm {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    size?: Nullable<number>;
    thumbnail?: Nullable<string>;
    categories?: Nullable<Nullable<string>[]>;
}

export class Annotations {
    annotationId?: Nullable<string>;
    xfdf?: Nullable<string>;
    lastModified?: Nullable<Date>;
}

export class ShareSetting {
    link?: Nullable<string>;
    permission?: Nullable<ShareLinkPermission>;
    linkType?: Nullable<ShareLinkType>;
}

export class DeleteDocumentPayload {
    message: string;
    statusCode: number;
    type?: Nullable<string>;
}

export class GetDocumentPayload {
    documents?: Nullable<Nullable<Document>[]>;
    cursor: string;
    hasNextPage?: Nullable<boolean>;
    total?: Nullable<number>;
}

export class UserPermission {
    _id?: Nullable<string>;
    email?: Nullable<string>;
    name?: Nullable<string>;
    avatarRemoteId?: Nullable<string>;
    role: string;
    type?: Nullable<string>;
    teamName?: Nullable<string>;
}

export class RequestAccessDocsListPayload {
    requesters: Nullable<UserPermission>[];
    cursor: string;
    hasNextPage?: Nullable<boolean>;
    total: number;
}

export class CreatePDFFormPayload {
    documentId: string;
    documentName: string;
}

export class CreatePdfFromStaticToolUploadPayload {
    documentId: string;
    documentName: string;
    documentSize: number;
    documentMimeType: string;
    temporaryRemoteId: string;
}

export class GetFormListPayload {
    documents: Nullable<DocumentForm>[];
    totalPage?: Nullable<number>;
}

export class StarDocumentPayload {
    statusCode: number;
    message: string;
    document: Document;
}

export class CreateDocumentsPayload {
    message: string;
    statusCode: number;
    documents: Nullable<Document>[];
}

export class GetDocumentByRemoteIdPayload {
    haveDocument?: Nullable<boolean>;
    document?: Nullable<Document>;
    message?: Nullable<string>;
}

export class SubDocumentSettings {
    keepInSearch?: Nullable<boolean>;
}

export class UpdateDocumentListPayload {
    teamId?: Nullable<string>;
    organizationId?: Nullable<string>;
    clientId: string;
    document: Document;
    type: string;
    statusCode: number;
    additionalSettings?: Nullable<SubDocumentSettings>;
}

export class UpdateDocumentInfoPayload {
    clientId: string;
    document: Document;
    type: string;
    statusCode: number;
    ownerId: string;
}

export class BookmarkPayloadItem {
    message: string;
    email: string;
}

export class BookmarkPayload {
    bookmark?: Nullable<Nullable<BookmarkPayloadItem>[]>;
    page: number;
    message: string;
}

export class UpdateDocumentBookmarkPayload {
    message?: Nullable<string>;
    bookmarks: Nullable<BookmarkPayload>[];
}

export class PDFInfoPayload {
    organizationName?: Nullable<string>;
    teamName?: Nullable<string>;
    fileName: string;
    fileType: string;
    fileSize: number;
    creator: string;
    creationDate: string;
    modificationDate?: Nullable<string>;
    storage: string;
}

export class Message {
    id?: Nullable<string>;
    text: string;
}

export class DeletedOriginalDocumentInfo {
    documentId: string;
    documentFolder?: Nullable<string>;
}

export class DeleteOriginalDocumentPayload {
    statusCode: number;
    teamId?: Nullable<string>;
    organizationId?: Nullable<string>;
    clientId: string;
    documentList: Nullable<DeletedOriginalDocumentInfo>[];
    type: string;
    additionalSettings?: Nullable<SubDocumentSettings>;
}

export class GetShareInviteByEmailListPayload {
    sharees?: Nullable<Nullable<UserPermission>[]>;
}

export class MemberOrgMention {
    _id?: Nullable<string>;
    email?: Nullable<string>;
    name?: Nullable<string>;
    avatarRemoteId?: Nullable<string>;
}

export class GetMentionListPayload {
    mentionList?: Nullable<Nullable<MemberOrgMention>[]>;
}

export class MemberWithCursorPaginationPayload {
    members: Nullable<MemberPermission>[];
    organizationName: string;
    teamName?: Nullable<string>;
    hasNextPage: boolean;
    cursor?: Nullable<string>;
    total?: Nullable<number>;
    currentRole?: Nullable<OrganizationRole>;
    documentRole?: Nullable<DocumentRole>;
}

export class ManipulationDocumentPayload {
    documentId?: Nullable<string>;
    refId?: Nullable<string>;
    type?: Nullable<string>;
    option?: Nullable<Object>;
    createdAt?: Nullable<Date>;
}

export class GetDocStackInfoPayload {
    canFinishDocument?: Nullable<boolean>;
    totalUsed?: Nullable<number>;
    totalStack?: Nullable<number>;
}

export class CheckThirdPartyStoragePayload {
    organization?: Nullable<Organization>;
    folder?: Nullable<Folder>;
    remoteId: string;
    documentId?: Nullable<string>;
}

export class PresignedUrlForImagePayload {
    remoteId: string;
    getSignedUrl: string;
    putSignedUrl: string;
}

export class PresignedUrlForSignaturePayload {
    remoteId: string;
    getSignedUrl: string;
    putSignedUrl: string;
    encodeSignatureData: string;
}

export class BackupInfo {
    createdAt?: Nullable<string>;
    restoreOriginalPermission?: Nullable<RestoreOriginalPermission>;
}

export class GetPresignedUrlForTemporaryDocumentPayload {
    document?: Nullable<ISignedUrl>;
    encodedUploadData?: Nullable<string>;
}

export class GetSignedUrlPayload {
    signedUrl?: Nullable<string>;
}

export class SharedPermissionInfo {
    type?: Nullable<string>;
    total?: Nullable<number>;
    organizationName?: Nullable<string>;
    teamName?: Nullable<string>;
}

export class GetPresignedUrlForOcrPayload {
    key: string;
    listSignedUrls: string[];
}

export class CheckDownloadMultipleDocumentsPayload {
    isDocStackInsufficient?: Nullable<boolean>;
    isDocumentLimitExceeded?: Nullable<boolean>;
    isTotalSizeExceeded?: Nullable<boolean>;
    totalDocuments?: Nullable<number>;
}

export class PreCheckShareDocumentInSlackResponse {
    isPermissionUpdateNeeded: boolean;
}

export class ShareDocumentInSlackResponse {
    message: string;
    statusCode: number;
    hasUnshareableEmails: boolean;
    isQueuedSharing: boolean;
}

export class DocumentSharingQueuePayload {
    isChannelSharing: boolean;
    documentName: string;
    hasUnshareableEmails: boolean;
    isOverwritePermission?: Nullable<boolean>;
    documentId: string;
}

export class GetSignedUrlForExternalPdfByEncodeDataPayload {
    signedUrl?: Nullable<string>;
    documentName?: Nullable<string>;
    remoteId?: Nullable<string>;
    fileSize?: Nullable<number>;
}

export class CheckShareThirdPartyDocumentPayload {
    isAllowed: boolean;
}

export class DocumentTemplate {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    remoteId?: Nullable<string>;
    remoteEmail?: Nullable<string>;
    size?: Nullable<number>;
    service?: Nullable<string>;
    isPersonal?: Nullable<boolean>;
    mimeType?: Nullable<string>;
    annotations?: Nullable<string>;
    ownerId?: Nullable<string>;
    ownerAvatarRemoteId?: Nullable<string>;
    lastAccess?: Nullable<string>;
    lastModify?: Nullable<string>;
    createdAt?: Nullable<string>;
    downloadUrl?: Nullable<string>;
    manipulationStep?: Nullable<string>;
    thumbnail?: Nullable<string>;
    bookmarks?: Nullable<string>;
    listUserStar?: Nullable<Nullable<string>[]>;
    ownerOfTeamDocument?: Nullable<boolean>;
    enableGoogleSync?: Nullable<boolean>;
    signedUrl?: Nullable<string>;
    isShared?: Nullable<boolean>;
    folderId?: Nullable<string>;
    getAnnotationUrl?: Nullable<string>;
    etag?: Nullable<string>;
    lastChangedAnnotation?: Nullable<Date>;
    clientId?: Nullable<string>;
    roleOfDocument?: Nullable<string>;
    documentType?: Nullable<TypeOfDocument>;
    shareSetting?: Nullable<ShareSetting>;
    folderData?: Nullable<FolderPublicInfo>;
    isOverTimeLimit?: Nullable<boolean>;
    ownerName?: Nullable<string>;
    ownerEmail?: Nullable<string>;
    belongsTo?: Nullable<BelongsTo>;
    version?: Nullable<number>;
    premiumToolsInfo?: Nullable<PremiumToolsInfo>;
    backupInfo?: Nullable<BackupInfo>;
    imageSignedUrls?: Nullable<Object>;
    temporaryRemoteId?: Nullable<string>;
    lastModifiedBy?: Nullable<string>;
    metadata?: Nullable<DocumentMetadata>;
    externalStorageAttributes?: Nullable<Object>;
    sharedPermissionInfo?: Nullable<SharedPermissionInfo>;
    fromSource?: Nullable<DocumentFromSourceEnum>;
    thumbnailRemoteId?: Nullable<string>;
    openedAt?: Nullable<string>;
    status?: Nullable<DocumentStatus>;
    actionCountDocStack?: Nullable<ActionCountDocStack>;
    kind?: Nullable<DocumentKindEnum>;
    templateSourceType?: Nullable<DocumentTemplateSourceTypeEnum>;
}

export class GetDocumentTemplatesPayload {
    documents?: Nullable<Nullable<DocumentTemplate>[]>;
    cursor: string;
    hasNextPage?: Nullable<boolean>;
}

export class DocumentVersionModifiedOwner {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    avatar?: Nullable<string>;
}

export class DocumentVersionPayload implements DocumentVersionBase {
    documentId?: Nullable<string>;
    versionId?: Nullable<string>;
    annotationSignedUrl?: Nullable<string>;
    _id?: Nullable<string>;
    modifiedBy?: Nullable<DocumentVersionModifiedOwner>;
    createdAt?: Nullable<Date>;
}

export class GetVersionListPayload {
    data?: Nullable<Nullable<DocumentVersionPayload>[]>;
}

export class GetVersionPresignedUrlPayload {
    fileContentPresignedUrl?: Nullable<string>;
    annotationPresignedUrl?: Nullable<string>;
}

export class EventActorModification {
    plan?: Nullable<string>;
    planCharge?: Nullable<number>;
    adminRole?: Nullable<string>;
}

export class EventUser {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    email?: Nullable<string>;
    avatarRemoteId?: Nullable<string>;
    modification?: Nullable<EventActorModification>;
}

export class EventPaymentModification {
    plan?: Nullable<string>;
    period?: Nullable<string>;
    docStack?: Nullable<number>;
}

export class EventOrganization {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    domain?: Nullable<string>;
    planModification?: Nullable<EventPaymentModification>;
}

export class EventTeamModification {
    memberRole?: Nullable<string>;
    plan?: Nullable<string>;
    planCharge?: Nullable<number>;
}

export class EventTeam {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    modification?: Nullable<EventTeamModification>;
}

export class EventDocumentComment {
    _id?: Nullable<string>;
    content?: Nullable<string>;
}

export class EventDocument {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    comment?: Nullable<EventDocumentComment>;
}

export class EventCommunityTemplate {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    type?: Nullable<string>;
}

export class Event {
    _id?: Nullable<string>;
    eventName?: Nullable<string>;
    eventTime?: Nullable<Date>;
    actor?: Nullable<EventUser>;
    target?: Nullable<EventUser>;
    organization?: Nullable<EventOrganization>;
    team?: Nullable<EventTeam>;
    document?: Nullable<EventDocument>;
    actorEventScope?: Nullable<Nullable<EventScope>[]>;
    targetEventScope?: Nullable<Nullable<EventScope>[]>;
}

export class ChangeEmailEventMetadata {
    newEmail?: Nullable<string>;
    userId?: Nullable<string>;
}

export class AdminEventMetadata {
    affectedOrg?: Nullable<EventOrganization>;
    isBlacklisted?: Nullable<boolean>;
    associateDomain?: Nullable<string>;
    emailChanged?: Nullable<ChangeEmailEventMetadata>;
}

export class AdminEvent {
    _id?: Nullable<string>;
    eventName: string;
    eventTime: Date;
    actor?: Nullable<EventUser>;
    target?: Nullable<EventUser>;
    organization?: Nullable<EventOrganization>;
    communityTemplate?: Nullable<EventCommunityTemplate>;
    team?: Nullable<EventTeam>;
    document?: Nullable<EventDocument>;
    actorEventScope?: Nullable<Nullable<EventScope>[]>;
    targetEventScope?: Nullable<Nullable<EventScope>[]>;
    type?: Nullable<AdminEventType>;
    metadata?: Nullable<AdminEventMetadata>;
}

export class AdminEventsEdge {
    node: AdminEvent;
}

export class AdminEventsConnection {
    edges: Nullable<AdminEventsEdge>[];
    total: number;
}

export class Breadcrumb {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    listUserStar?: Nullable<Nullable<string>[]>;
}

export class FolderBelongsTo {
    type?: Nullable<LocationType>;
    location?: Nullable<LocationInfo>;
    workspaceId?: Nullable<string>;
}

export class Folder {
    _id?: Nullable<string>;
    ownerId?: Nullable<string>;
    name?: Nullable<string>;
    shareSetting?: Nullable<ShareSetting>;
    path?: Nullable<string>;
    depth?: Nullable<number>;
    parentId?: Nullable<string>;
    color?: Nullable<string>;
    createdAt?: Nullable<string>;
    listUserStar?: Nullable<Nullable<string>[]>;
    totalDocument?: Nullable<number>;
    belongsTo?: Nullable<FolderBelongsTo>;
    breadcrumbs?: Nullable<Nullable<Breadcrumb>[]>;
    ownerName?: Nullable<string>;
    folders?: Nullable<Nullable<Folder>[]>;
}

export class FolderPublicInfo {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    canOpen?: Nullable<boolean>;
    belongsTo?: Nullable<FolderBelongsTo>;
}

export class CreateFolderPayload {
    folder: Folder;
    clientId: string;
}

export class UpdateFolderPayload {
    folder: Folder;
    folders?: Nullable<Nullable<Folder>[]>;
    userId: string;
    actorId?: Nullable<string>;
    subscriptionEvent: string;
}

export class FolderEventSubscriptionPayload {
    workspaceId?: Nullable<string>;
    eventType?: Nullable<string>;
    total?: Nullable<number>;
}

export class GetTotalFoldersPayload {
    total?: Nullable<number>;
}

export class FolderChildrenTree {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    type?: Nullable<FolderChildType>;
    parentId?: Nullable<string>;
    createdAt?: Nullable<string>;
    children?: Nullable<Nullable<FolderChildrenTree>[]>;
}

export class GetPDFFormTemplatePayload {
    templateName?: Nullable<string>;
    name?: Nullable<string>;
    hash?: Nullable<string>;
    ext?: Nullable<string>;
    mime?: Nullable<string>;
    size?: Nullable<number>;
    provider?: Nullable<string>;
    url?: Nullable<string>;
}

export class Membership {
    role?: Nullable<string>;
    user?: Nullable<User>;
    isOwner?: Nullable<boolean>;
}

export class Notification {
    _id?: Nullable<string>;
    actor?: Nullable<Actor>;
    notificationType?: Nullable<string>;
    target?: Nullable<Target>;
    is_read?: Nullable<boolean>;
    actionType?: Nullable<number>;
    createdAt?: Nullable<Date>;
    entity?: Nullable<Entity>;
    tab?: Nullable<NotificationTab>;
    product?: Nullable<NotificationProduct>;
    metadata?: Nullable<Object>;
}

export class NotificationPayload {
    notifications?: Nullable<Nullable<Notification>[]>;
    cursor?: Nullable<string>;
    hasNextPage?: Nullable<boolean>;
}

export class Actor {
    id?: Nullable<string>;
    name?: Nullable<string>;
    type?: Nullable<string>;
    avatarRemoteId?: Nullable<string>;
    actorData?: Nullable<Object>;
}

export class Entity {
    id?: Nullable<string>;
    name?: Nullable<string>;
    type?: Nullable<string>;
    avatarRemoteId?: Nullable<string>;
    entityData?: Nullable<Object>;
}

export class Target {
    targetId?: Nullable<string>;
    type?: Nullable<string>;
    targetName?: Nullable<string>;
    targetData?: Nullable<Object>;
}

export class NewNotificationTabData {
    hasNewNoti?: Nullable<boolean>;
    unreadCount?: Nullable<number>;
}

export class NewNotificationsData {
    general?: Nullable<NewNotificationTabData>;
    invites?: Nullable<NewNotificationTabData>;
    requests?: Nullable<NewNotificationTabData>;
}

export class DeleteNotificationPayload {
    notificationId?: Nullable<string>;
    tab?: Nullable<NotificationTab>;
}

export class CurrentPlansAmount {
    productName?: Nullable<UnifySubscriptionProduct>;
    amount?: Nullable<number>;
}

export class DiscountProducts {
    productName?: Nullable<UnifySubscriptionProduct>;
    planApplied?: Nullable<Nullable<string>[]>;
}

export class PreviewDocStackInvoicePayload {
    amountDue?: Nullable<number>;
    remaining?: Nullable<number>;
    total?: Nullable<number>;
    currentPlansAmount?: Nullable<Nullable<CurrentPlansAmount>[]>;
    discount?: Nullable<number>;
    discountCode?: Nullable<string>;
    discountDuration?: Nullable<string>;
    nextBillingPrice?: Nullable<number>;
    previousBillingCycle?: Nullable<string>;
    nextBillingCycle?: Nullable<string>;
    quantity?: Nullable<number>;
    currency?: Nullable<Currency>;
    creditBalance?: Nullable<number>;
    discountDescription?: Nullable<string>;
    discountProducts?: Nullable<Nullable<DiscountProducts>[]>;
    isUpgradeDocStackAnnual?: Nullable<boolean>;
}

export class PreviewUpcomingSubscriptionInvoicePayload {
    amountDue?: Nullable<number>;
    remaining?: Nullable<number>;
    total?: Nullable<number>;
    currentPlansAmount?: Nullable<Nullable<CurrentPlansAmount>[]>;
    discount?: Nullable<number>;
    discountCode?: Nullable<string>;
    discountDuration?: Nullable<string>;
    nextBillingPrice?: Nullable<number>;
    previousBillingCycle?: Nullable<string>;
    nextBillingCycle?: Nullable<string>;
    currency?: Nullable<Currency>;
    creditBalance?: Nullable<number>;
    discountDescription?: Nullable<string>;
    discountProducts?: Nullable<Nullable<DiscountProducts>[]>;
    isUpgradePlanAnnual?: Nullable<boolean>;
    testClockFrozenTime?: Nullable<string>;
}

export class ChangeOrganizationAvatarPayload {
    avatarRemoteId?: Nullable<string>;
}

export class DocStack {
    totalUsed?: Nullable<number>;
    totalStack?: Nullable<number>;
}

export class SignDocStackStorage {
    isOverDocStack?: Nullable<boolean>;
    totalUsed?: Nullable<number>;
    totalStack?: Nullable<number>;
    templateLimit?: Nullable<number>;
}

export class Organization {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    createdAt?: Nullable<Date>;
    avatarRemoteId?: Nullable<string>;
    owner?: Nullable<User>;
    payment?: Nullable<Payment>;
    billingEmail?: Nullable<string>;
    url?: Nullable<string>;
    domain?: Nullable<string>;
    associateDomains?: Nullable<Nullable<string>[]>;
    settings?: Nullable<OrganizationSettings>;
    userRole?: Nullable<string>;
    creationType?: Nullable<string>;
    totalMember?: Nullable<number>;
    convertFromTeam?: Nullable<boolean>;
    teams?: Nullable<Nullable<Team>[]>;
    totalTeam?: Nullable<number>;
    members?: Nullable<Nullable<User>[]>;
    deletedAt?: Nullable<Date>;
    hasPendingInvoice?: Nullable<boolean>;
    isUpgradingToEnterprise?: Nullable<boolean>;
    resetPassword?: Nullable<ResetPasswordRequired>;
    folders?: Nullable<Nullable<Folder>[]>;
    reachUploadDocLimit?: Nullable<boolean>;
    isMainOrgOfUser?: Nullable<boolean>;
    totalActiveMember?: Nullable<number>;
    isDefault?: Nullable<boolean>;
    docStackStorage?: Nullable<DocStack>;
    purpose?: Nullable<OrganizationPurpose>;
    isLastActiveOrg?: Nullable<boolean>;
    userPermissions?: Nullable<UserPermissions>;
    isRestrictedBillingActions?: Nullable<boolean>;
    sso?: Nullable<OrganizationSso>;
    totalSignSeats?: Nullable<number>;
    availableSignSeats?: Nullable<number>;
    premiumSignSeats?: Nullable<number>;
    hashedIpAddresses?: Nullable<Nullable<string>[]>;
    signDocStackStorage?: Nullable<SignDocStackStorage>;
    premiumSeats?: Nullable<Nullable<string>[]>;
    isSignProSeat?: Nullable<boolean>;
    metadata?: Nullable<OrganizationMetadata>;
}

export class OrganizationMetadata {
    avatarSuggestion?: Nullable<OrganizationAvatarSuggestion>;
    firstUserJoinedManually?: Nullable<boolean>;
    firstMemberInviteCollaborator?: Nullable<boolean>;
    hasProcessedIndexingDocuments?: Nullable<boolean>;
    promotions?: Nullable<Nullable<string>[]>;
}

export class OrganizationAvatarSuggestion {
    source?: Nullable<AvatarSuggestionSource>;
    suggestionAvatarRemoteId?: Nullable<string>;
    suggestedAt?: Nullable<Date>;
}

export class UpdateSignSeatSubscriptionPayload {
    action?: Nullable<UpdateSignWsPaymentActions>;
}

export class ResetPasswordRequired {
    isRequired?: Nullable<boolean>;
    actorEmail?: Nullable<string>;
}

export class GetOrganizationPayload {
    orgData?: Nullable<Organization>;
    documentsAvailable?: Nullable<boolean>;
    actionCountDocStack?: Nullable<ActionCountDocStack>;
    message?: Nullable<string>;
    statusCode?: Nullable<number>;
    aiChatbotDailyLimit?: Nullable<number>;
}

export class GetOrgTeamsPayload {
    teams?: Nullable<Nullable<Team>[]>;
}

export class GetRepresentativeMembersPayload {
    representativeMembers?: Nullable<Nullable<User>[]>;
    message?: Nullable<string>;
    statusCode?: Nullable<number>;
}

export class OrganizationWithRole {
    organization?: Nullable<Organization>;
    role?: Nullable<string>;
}

export class OrganizationSettings {
    other?: Nullable<OrganizationOtherSettings>;
    googleSignIn?: Nullable<boolean>;
    passwordStrength?: Nullable<string>;
    templateWorkspace?: Nullable<string>;
    domainVisibility?: Nullable<string>;
    autoUpgrade?: Nullable<boolean>;
    autoApprove?: Nullable<boolean>;
    inviteUsersSetting?: Nullable<InviteUsersSetting>;
    samlSsoConfigurationId?: Nullable<string>;
    scimSsoClientId?: Nullable<string>;
}

export class UserPermissions {
    canUseMultipleMerge?: Nullable<boolean>;
}

export class OrganizationOtherSettings {
    guestInvite?: Nullable<string>;
    hideMember?: Nullable<boolean>;
}

export class PageInfo {
    hasNextPage?: Nullable<boolean>;
    offset?: Nullable<number>;
    limit?: Nullable<number>;
}

export class OrganizationMember {
    role?: Nullable<string>;
    lastActivity?: Nullable<Date>;
    joinDate?: Nullable<Date>;
    user: User;
}

export class OrganizationMemberEdge {
    node?: Nullable<OrganizationMember>;
    cursor?: Nullable<string>;
}

export class OrganizationRequesterEdge {
    node?: Nullable<OrganizationRequester>;
    cursor?: Nullable<string>;
}

export class OrganizationRequester {
    role?: Nullable<string>;
    requestDate?: Nullable<Date>;
    user?: Nullable<User>;
}

export class OrganizationRequesterConnection {
    totalRecord?: Nullable<number>;
    totalItem?: Nullable<number>;
    edges?: Nullable<Nullable<OrganizationRequesterEdge>[]>;
    pageInfo?: Nullable<PageInfo>;
}

export class OrganizationMemberConnection {
    totalRecord?: Nullable<number>;
    totalItem?: Nullable<number>;
    edges?: Nullable<Nullable<OrganizationMemberEdge>[]>;
    pageInfo?: Nullable<PageInfo>;
}

export class GetListRequestJoinOrganizationPayload {
    requesterList?: Nullable<Nullable<ListRequestJoinOrganization>[]>;
}

export class ListRequestJoinOrganization {
    avatar?: Nullable<string>;
    name?: Nullable<string>;
    email?: Nullable<string>;
    role?: Nullable<string>;
    requestDate?: Nullable<Date>;
}

export class OrganizationTotalCount {
    member?: Nullable<number>;
    guest?: Nullable<number>;
    pending?: Nullable<number>;
    request?: Nullable<number>;
}

export class GetUserRoleInOrgPayload {
    orgId?: Nullable<string>;
    userId?: Nullable<string>;
    role?: Nullable<string>;
}

export class CreateOrganizationDocumentFormPayload {
    documentId?: Nullable<string>;
}

export class OrganizationPendingConnection {
    totalRecord?: Nullable<number>;
    totalItem?: Nullable<number>;
    edges?: Nullable<Nullable<OrganizationPendingEdge>[]>;
    pageInfo?: Nullable<PageInfo>;
}

export class OrganizationPendingEdge {
    node?: Nullable<OrganizationPending>;
    cursor?: Nullable<string>;
}

export class OrganizationPending {
    _id?: Nullable<string>;
    role?: Nullable<string>;
    requestDate?: Nullable<Date>;
    email?: Nullable<string>;
    name?: Nullable<string>;
}

export class OrganizationInfo {
    members?: Nullable<Nullable<User>[]>;
    totalMember?: Nullable<number>;
}

export class OrganizationProfilePayload {
    data: Organization;
    message: string;
    statusCode: number;
}

export class UpdateOrganizationPayload {
    organization?: Nullable<Organization>;
    orgId?: Nullable<string>;
    type?: Nullable<string>;
}

export class UpdateOrganizationInviteLinkPayload {
    inviteLink?: Nullable<OrganizationInviteLink>;
    orgId?: Nullable<string>;
    actorId?: Nullable<string>;
}

export class RemoveOrgMemberPayload {
    organization?: Nullable<Organization>;
    actor?: Nullable<User>;
}

export class UpdateOrgMemberRolePayload {
    userId?: Nullable<string>;
    orgId?: Nullable<string>;
    type?: Nullable<string>;
    actorName?: Nullable<string>;
    role?: Nullable<string>;
}

export class SubscriptionDeleteOrganizationPayload {
    organization?: Nullable<Organization>;
}

export class MemberPermission {
    userId?: Nullable<string>;
    name?: Nullable<string>;
    avatarRemoteId?: Nullable<string>;
    email?: Nullable<string>;
    permission?: Nullable<DocumentRole>;
    role?: Nullable<OrganizationRole>;
}

export class GetOrganizationPricePayload {
    pricePerUnit?: Nullable<number>;
    interval?: Nullable<string>;
}

export class InviteMemberToOrganizationPayload {
    message: string;
    statusCode: number;
    organization: Organization;
    invitations?: Nullable<Nullable<OrganizationMemberInvitation>[]>;
    sameDomainEmails?: Nullable<Nullable<string>[]>;
    notSameDomainEmails?: Nullable<Nullable<string>[]>;
}

export class OrganizationMemberInvitation {
    memberEmail?: Nullable<string>;
    invitationId?: Nullable<string>;
}

export class ExportDomainPayload {
    url: string;
}

export class CreateOrganizationPayload {
    message?: Nullable<string>;
    statusCode?: Nullable<number>;
    organizations?: Nullable<Nullable<Organization>[]>;
    organization?: Nullable<Organization>;
    invitations?: Nullable<Nullable<OrganizationMemberInvitation>[]>;
}

export class CreateOrganizationTeamPayload {
    message?: Nullable<string>;
    statusCode?: Nullable<number>;
    organizationTeam?: Nullable<Team>;
}

export class DeleteOrganizationPayload {
    message?: Nullable<string>;
    statusCode?: Nullable<number>;
    organization?: Nullable<Organization>;
}

export class ReactiveOrganizationPayload {
    message?: Nullable<string>;
    statusCode?: Nullable<number>;
    organization?: Nullable<Organization>;
}

export class OrganizationCanJoinPayload {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    avatarRemoteId?: Nullable<string>;
    joinStatus?: Nullable<JoinOrganizationStatus>;
}

export class SubscriptionConvertOrganizationPayload {
    orgId?: Nullable<string>;
    type?: Nullable<string>;
    url?: Nullable<string>;
}

export class TransferTeamsOwnershipPayload {
    teamsFailed: Nullable<string>[];
}

export class ForceResetPasswordPayload {
    signOut: boolean;
}

export class CheckMainOrgCreationAbilityPayload {
    canCreate?: Nullable<boolean>;
    domainType?: Nullable<OrganizationDomainType>;
}

export class OrganizationBasicResponse {
    orgData?: Nullable<Organization>;
    message?: Nullable<string>;
    statusCode?: Nullable<number>;
}

export class RequestAccessEntity {
    role?: Nullable<string>;
    invitee?: Nullable<string>;
}

export class RequestAccessPayload {
    _id?: Nullable<string>;
    actor?: Nullable<string>;
    entity?: Nullable<RequestAccessEntity>;
    target?: Nullable<string>;
    createdAt?: Nullable<Date>;
    type?: Nullable<string>;
}

export class RequestJoinOrganizationPayload {
    orgData?: Nullable<Organization>;
    message?: Nullable<string>;
    statusCode?: Nullable<number>;
    requestData?: Nullable<RequestAccessPayload>;
    newOrg?: Nullable<Organization>;
}

export class JoinOrganizationPayload {
    organization?: Nullable<Organization>;
}

export class AcceptInvitationPayload {
    organization?: Nullable<Organization>;
}

export class SubscriptionCancelTrialPayload {
    organization?: Nullable<Organization>;
}

export class OrganizationRequestingPayload {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    avatarRemoteId?: Nullable<string>;
    isRequested?: Nullable<boolean>;
}

export class SubscriptionChangedDocStackPayload {
    orgId: string;
    docStackStorage: DocStack;
    payment?: Nullable<Payment>;
}

export class RetrieveOrganizationSetupIntentResponse {
    clientSecret: string;
    accountId: string;
}

export class GetOrganizationResourcesPayload {
    documents?: Nullable<Nullable<Document>[]>;
    folders?: Nullable<Nullable<Folder>[]>;
    cursor?: Nullable<string>;
    total?: Nullable<number>;
}

export class GetOrganizationFolderTreePayload {
    children?: Nullable<Nullable<FolderChildrenTree>[]>;
}

export class TeamFolderTree {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    children?: Nullable<Nullable<FolderChildrenTree>[]>;
}

export class GetOrganizationTeamsFolderTreePayload {
    teams?: Nullable<Nullable<TeamFolderTree>[]>;
}

export class GetPersonalFolderTreePayload {
    children?: Nullable<Nullable<FolderChildrenTree>[]>;
}

export class OrganizationSso {
    createdBy: string;
    ssoOrganizationId: string;
    samlSsoConnectionId: string;
    scimSsoClientId?: Nullable<string>;
}

export class PromptInviteBannerPayload {
    bannerType?: Nullable<PromptInviteBannerType>;
    inviteUsers?: Nullable<Nullable<FindUserPayload>[]>;
}

export class GetSuggestedUserToInvitePayload {
    suggestedUsers?: Nullable<Nullable<FindUserPayload>[]>;
}

export class OrganizationInviteLink {
    _id: string;
    inviteId: string;
    orgId: string;
    role: string;
    actorId: string;
    expiresAt: Date;
    createdAt: Date;
    isExpiringSoon?: Nullable<boolean>;
    isExpired?: Nullable<boolean>;
}

export class SamlSsoConfiguration {
    id: string;
    createdAt: Date;
    domains: string[];
    label: string;
    ascUrl: string;
    spEntityId: string;
    rawIdpMetadataXml: string;
}

export class ScimSsoConfiguration {
    id: string;
    label: string;
    authorizationHeaderSecret: string;
    mapperUrl: string;
    scimServerUrl: string;
}

export class UpdateSignSeatsResponse {
    message: string;
    statusCode: number;
    data: UpdateSignSeatsData;
}

export class UpdateSignSeatsData {
    availableSignSeats: number;
}

export class CheckOrganizationDocStackPayload {
    isOverDocStack?: Nullable<boolean>;
}

export class GetFoldersAvailabilityPayload {
    personal: boolean;
    organization: boolean;
    teams: string[];
}

export class Invoice {
    id?: Nullable<string>;
    created?: Nullable<Date>;
    total?: Nullable<number>;
    downloadLink?: Nullable<string>;
}

export class SubscriptionResponse {
    quantity?: Nullable<number>;
    amount?: Nullable<number>;
    nextInvoice?: Nullable<number>;
    billingInterval?: Nullable<string>;
    currency?: Nullable<string>;
    creditBalance?: Nullable<number>;
    payment?: Nullable<ChargeData>;
}

export class PaymentResponse {
    statusCode?: Nullable<number>;
    message?: Nullable<string>;
    data?: Nullable<Payment>;
    organization?: Nullable<Organization>;
}

export class SubscriptionItem {
    id?: Nullable<string>;
    planRemoteId?: Nullable<string>;
    period?: Nullable<string>;
    currency?: Nullable<string>;
    paymentType: string;
    paymentStatus?: Nullable<string>;
    quantity: number;
    productName: string;
}

export class ChargeData {
    subscriptionRemoteId?: Nullable<string>;
    customerRemoteId?: Nullable<string>;
    planRemoteId?: Nullable<string>;
    type?: Nullable<string>;
    period?: Nullable<PaymentPeriod>;
    status?: Nullable<string>;
    quantity?: Nullable<number>;
    currency?: Nullable<string>;
    productId?: Nullable<string>;
    priceVersion?: Nullable<PriceVersion>;
    stripeAccountId?: Nullable<string>;
    subscriptionItems?: Nullable<Nullable<SubscriptionItem>[]>;
}

export class ChargeResponse {
    statusCode?: Nullable<number>;
    message?: Nullable<string>;
    data?: Nullable<ChargeData>;
    organization?: Nullable<Organization>;
}

export class CustomerCreation {
    method: CustomerCreationMethod;
    value: string;
}

export class CouponValueResponse {
    type: string;
    value: number;
}

export class RenewAttemptMetaPayload {
    organization?: Nullable<Organization>;
}

export class RenewAttempt {
    attemptCount?: Nullable<number>;
    nextPaymentAttempt?: Nullable<string>;
    clientId?: Nullable<string>;
    paymentType?: Nullable<string>;
    declineCode?: Nullable<string>;
    cardLast4?: Nullable<string>;
}

export class RenewBillingWarningPayload {
    attempt?: Nullable<RenewAttempt>;
    metadata?: Nullable<RenewAttemptMetaPayload>;
}

export class SubCancelBillingWarningMetaPayload {
    organization?: Nullable<Organization>;
}

export class SubCancelBillingWarningPayload {
    remainingDay?: Nullable<number>;
    expireDate?: Nullable<string>;
    lastSubscriptionEndedAt?: Nullable<number>;
    metadata?: Nullable<SubCancelBillingWarningMetaPayload>;
}

export class TimeSensitiveCouponPayload {
    promotionCode: string;
    createdAt: Date;
}

export class BillingWarningPayload {
    renewPayload?: Nullable<RenewBillingWarningPayload>;
    subCancelPayload?: Nullable<SubCancelBillingWarningPayload>;
    timeSensitiveCouponPayload?: Nullable<TimeSensitiveCouponPayload>;
    warnings: Nullable<BillingWarningType>[];
}

export class GetNextPaymentInfoPayload {
    nextPlanRemoteId?: Nullable<string>;
    nextProductId?: Nullable<string>;
}

export class GetNextSubscriptionInfoPayload {
    nextPlanRemoteId?: Nullable<string>;
    nextProductId?: Nullable<string>;
}

export class RemainingPlan {
    currency?: Nullable<string>;
    remaining?: Nullable<number>;
    total?: Nullable<number>;
    nextBillingCycle?: Nullable<string>;
    nextBillingPrice?: Nullable<number>;
    amountDue?: Nullable<number>;
    quantity?: Nullable<number>;
    creditBalance?: Nullable<number>;
    discount?: Nullable<number>;
}

export class TrialInfo {
    highestTrial?: Nullable<CreateOrganizationSubscriptionPlans>;
    endTrial?: Nullable<Date>;
    canStartTrial?: Nullable<boolean>;
    canUseStarterTrial?: Nullable<boolean>;
    canUseProTrial?: Nullable<boolean>;
    canUseBusinessTrial?: Nullable<boolean>;
}

export class CustomerInfoResponse {
    email?: Nullable<string>;
    currency: Currency;
}

export class RetrieveSetupIntentResponse {
    clientSecret: string;
    accountId: string;
}

export class PaymentMethodCard {
    expMonth: number;
    expYear: number;
    last4: string;
    wallet?: Nullable<CardWallet>;
}

export class PaymentMethodCashapp {
    email: string;
}

export class PaymentMethodLink {
    email: string;
}

export class PaymentMethodResponse {
    type?: Nullable<PaymentMethodType>;
    card?: Nullable<PaymentMethodCard>;
    link?: Nullable<PaymentMethodLink>;
    cashapp?: Nullable<PaymentMethodCashapp>;
}

export class UpdatePaymentMethodResponse {
    statusCode?: Nullable<number>;
    message?: Nullable<string>;
    paymentMethod?: Nullable<PaymentMethodResponse>;
    billingEmail?: Nullable<string>;
}

export class GetUnifySubscriptionSubscriptionItem {
    id?: Nullable<string>;
    planRemoteId?: Nullable<string>;
    period?: Nullable<string>;
    currency?: Nullable<string>;
    paymentType: string;
    paymentStatus?: Nullable<string>;
    quantity: number;
    productName: string;
    amount: number;
}

export class GetUnifySubscriptionPayment {
    period?: Nullable<string>;
    status?: Nullable<string>;
    currency?: Nullable<string>;
    remainingPlan?: Nullable<RemainingPlan>;
    subscriptionItems: GetUnifySubscriptionSubscriptionItem[];
}

export class GetUnifySubscriptionPayloadSubInfo {
    payment: GetUnifySubscriptionPayment;
    creditBalance?: Nullable<number>;
    nextInvoice?: Nullable<number>;
    amount?: Nullable<number>;
    currency?: Nullable<string>;
}

export class GetUnifySubscriptionPayload {
    subscription: GetUnifySubscriptionPayloadSubInfo;
    upcomingInvoice?: Nullable<SubscriptionResponse>;
}

export class InitSlackOAuthResponse {
    contextJwt?: Nullable<string>;
    flowId?: Nullable<string>;
}

export class SlackTeam {
    id?: Nullable<string>;
    domain?: Nullable<string>;
    name?: Nullable<string>;
    avatar?: Nullable<string>;
}

export class SlackChannel {
    id?: Nullable<string>;
    name?: Nullable<string>;
    isPrivate?: Nullable<boolean>;
    totalMembers?: Nullable<number>;
}

export class SlackRecipient {
    id?: Nullable<string>;
    name?: Nullable<string>;
    avatarUrl?: Nullable<string>;
    email?: Nullable<string>;
    displayName?: Nullable<string>;
}

export class Team {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    avatarRemoteId?: Nullable<string>;
    members?: Nullable<Nullable<User>[]>;
    membersCount?: Nullable<number>;
    totalActiveMembers?: Nullable<number>;
    totalMembers?: Nullable<number>;
    roleOfUser?: Nullable<string>;
    belongsTo?: Nullable<BelongsToData>;
    createdAt?: Nullable<Date>;
    owner?: Nullable<User>;
    payment?: Nullable<Payment>;
    endTrial?: Nullable<Date>;
    folders?: Nullable<Nullable<Folder>[]>;
    settings?: Nullable<TeamSettings>;
}

export class TeamSettings {
    templateWorkspace?: Nullable<string>;
}

export class BelongsToData {
    targetId?: Nullable<string>;
    detail?: Nullable<Organization>;
    type?: Nullable<string>;
}

export class UpdateTeamsPayload {
    team: Team;
    type: string;
    statusCode: number;
    clientId: string;
}

export class DeleteTeamPayload {
    team?: Nullable<Team>;
    documents?: Nullable<Nullable<string>[]>;
    members?: Nullable<Nullable<string>[]>;
}

export class Template {
    _id: string;
    name?: Nullable<string>;
    size?: Nullable<number>;
    remoteId?: Nullable<string>;
    thumbnail?: Nullable<string>;
    ownerId?: Nullable<string>;
    description?: Nullable<string>;
    createdAt?: Nullable<Date>;
    counter?: Nullable<TemplateCounter>;
    ownerType?: Nullable<string>;
    signedUrl?: Nullable<string>;
    belongsTo?: Nullable<BelongsTo>;
    ownerName?: Nullable<string>;
    permissions?: Nullable<TemplatePermissions>;
}

export class TemplatePermissions {
    canEdit?: Nullable<boolean>;
    canDelete?: Nullable<boolean>;
}

export class TemplateLocation {
    _id?: Nullable<string>;
    name?: Nullable<string>;
}

export class TemplateCounter {
    view?: Nullable<number>;
    download?: Nullable<number>;
}

export class TemplateEdge {
    node?: Nullable<Template>;
    cursor?: Nullable<string>;
}

export class DeleteTemplatePayload {
    message: string;
    statusCode: number;
    type?: Nullable<string>;
}

export class GetTemplatesPayload {
    totalItem: number;
    edges: Nullable<TemplateEdge>[];
    pageInfo: PageInfo;
}

export class PresignedFields {
    key?: Nullable<string>;
    versionId?: Nullable<string>;
}

export class ISignedUrl {
    url?: Nullable<string>;
    fields?: Nullable<PresignedFields>;
}

export class GetPresignedUrlForUploadDocPayload {
    document?: Nullable<ISignedUrl>;
    thumbnail?: Nullable<ISignedUrl>;
    encodedUploadData?: Nullable<string>;
}

export class GetPresignedUrlForUploadThumbnailPayload {
    thumbnail?: Nullable<ISignedUrl>;
    encodedUploadData?: Nullable<string>;
}

export class GetPresignedUrlForLuminSignIntegrationPayload {
    document?: Nullable<ISignedUrl>;
}

export class ExploredFeatures {
    editPdf?: Nullable<number>;
    formBuilder?: Nullable<number>;
    splitPdf?: Nullable<number>;
    ocr?: Nullable<number>;
    summarization?: Nullable<number>;
    protectPdf?: Nullable<number>;
    redactPdf?: Nullable<number>;
}

export class Oauth2Token {
    accessToken?: Nullable<string>;
    scope?: Nullable<string>;
    email?: Nullable<string>;
    expireAt?: Nullable<string>;
}

export class Signature {
    remoteId?: Nullable<string>;
    presignedUrl?: Nullable<string>;
}

export class ToolUsage {
    usage?: Nullable<number>;
    blockTime?: Nullable<number>;
    isExceeded?: Nullable<boolean>;
}

export class ToolQuota {
    autoDetection?: Nullable<ToolUsage>;
    formFieldDetection?: Nullable<ToolUsage>;
}

export class User {
    _id?: Nullable<string>;
    email?: Nullable<string>;
    isNotify?: Nullable<boolean>;
    name?: Nullable<string>;
    avatarRemoteId?: Nullable<string>;
    roleInTeam?: Nullable<string>;
    payment?: Nullable<Payment>;
    setting?: Nullable<Setting>;
    addedInTeam?: Nullable<boolean>;
    lastLogin?: Nullable<Date>;
    billingEmail?: Nullable<string>;
    signatures?: Nullable<Nullable<string>[]>;
    createdAt?: Nullable<Date>;
    isUsingPassword?: Nullable<boolean>;
    endTrial?: Nullable<Date>;
    type?: Nullable<string>;
    metadata?: Nullable<UserMetadata>;
    deletedAt?: Nullable<Date>;
    lastAccessedOrgUrl?: Nullable<string>;
    isVerified?: Nullable<boolean>;
    lastAccess?: Nullable<Date>;
    loginService?: Nullable<LoginService>;
    timezoneOffset?: Nullable<number>;
    hasNewVersion?: Nullable<boolean>;
    reachUploadDocLimit?: Nullable<boolean>;
    notificationStatus?: Nullable<NewNotificationsData>;
    isPopularDomain?: Nullable<boolean>;
    hasJoinedOrg?: Nullable<boolean>;
    migratedOrgUrl?: Nullable<string>;
    identity?: Nullable<string>;
    redirectUrl?: Nullable<string>;
    oauth2Token?: Nullable<Oauth2Token>;
    emailDomain?: Nullable<string>;
    isOneDriveAddInsWhitelisted?: Nullable<boolean>;
    isOneDriveFilePickerWhitelisted?: Nullable<boolean>;
    toolQuota?: Nullable<ToolQuota>;
    isTermsOfUseVersionChanged?: Nullable<boolean>;
    isSignProSeat?: Nullable<boolean>;
    allTenantConfigurations?: Nullable<Nullable<TenantConfigurationWithDomain>[]>;
    isSeatRequest?: Nullable<boolean>;
    hashedIpAddress?: Nullable<string>;
}

export class UserMetadata {
    hasShownTourGuide?: Nullable<boolean>;
    hasShownBananaBanner?: Nullable<boolean>;
    hasShownAutoSyncModal?: Nullable<boolean>;
    hasShownMobileFreeToolsBanner?: Nullable<boolean>;
    rating?: Nullable<UserRating>;
    folderColors?: Nullable<Nullable<string>[]>;
    numberCreatedOrg?: Nullable<number>;
    hasInformedMyDocumentUpload?: Nullable<boolean>;
    ratedApp?: Nullable<boolean>;
    hasShownEditFileOfflinePopover?: Nullable<boolean>;
    hasShownContentEditPopover?: Nullable<boolean>;
    hasShownAutoSyncDefault?: Nullable<boolean>;
    introduceNewLayout?: Nullable<boolean>;
    isUsingNewLayout?: Nullable<boolean>;
    docSummarizationConsentGranted?: Nullable<boolean>;
    formFieldDetectionConsentGranted?: Nullable<boolean>;
    isHiddenSuggestedOrganization?: Nullable<boolean>;
    exploredFeatures?: Nullable<ExploredFeatures>;
    isUsingNewInAppLayout?: Nullable<boolean>;
    introduceNewInAppLayout?: Nullable<boolean>;
    hasShowOnboardingFlowFromOpenGoogle?: Nullable<boolean>;
    chatbotFreeRequests?: Nullable<number>;
    hasShownEditInAgreementGenModal?: Nullable<boolean>;
    hasShownSharePrompt?: Nullable<boolean>;
    hasClosedQuickSearchGuideline?: Nullable<boolean>;
    acceptedTermsOfUseVersion?: Nullable<string>;
    aiChatbotConsentGranted?: Nullable<boolean>;
}

export class UserRating {
    googleModalStatus?: Nullable<RatingModalStatus>;
    mobileFeedbackModalStatus?: Nullable<MobileFeedbackModalStatus>;
}

export class MemberUserInfo {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    avatarRemoteId?: Nullable<string>;
}

export class SuggestedOrganizationList {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    url?: Nullable<string>;
    createdAt?: Nullable<Date>;
    avatarRemoteId?: Nullable<string>;
    domain?: Nullable<string>;
    isMainOrgOfUser?: Nullable<boolean>;
    totalMember?: Nullable<number>;
    settings?: Nullable<OrganizationSettings>;
    status?: Nullable<JoinOrganizationStatus>;
    members?: Nullable<Nullable<MemberUserInfo>[]>;
    payment?: Nullable<Payment>;
    hashedIpAddresses?: Nullable<Nullable<string>[]>;
}

export class TeamStatusPayload {
    teamId: string;
    teamName: string;
    teamStatus: string;
}

export class TeamAndOrganizationOwnerPayload {
    teamOwner?: Nullable<Nullable<Team>[]>;
    organizationOwner?: Nullable<Nullable<Organization>[]>;
}

export class UpdateUserGuidePayload {
    user?: Nullable<User>;
    message: string;
    statusCode: number;
}

export class DeleteAccountSubscriptionPayload {
    user?: Nullable<User>;
    fromProvisioning?: Nullable<boolean>;
}

export class UpdateUserSubscriptionMetadata {
    migratedOrg?: Nullable<Organization>;
}

export class UpdateUserSubscriptionPayload {
    type: string;
    user: User;
    metadata?: Nullable<UpdateUserSubscriptionMetadata>;
}

export class GetUserLocationPayload {
    currency?: Nullable<string>;
}

export class FindUserPayload {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    remoteName?: Nullable<string>;
    email?: Nullable<string>;
    avatarRemoteId?: Nullable<string>;
    status?: Nullable<SearchUserStatus>;
    grantedPermission?: Nullable<boolean>;
}

export class MobileFeedbackModalStatus {
    status?: Nullable<RatingModalStatus>;
    nextModalAppearanceTime?: Nullable<string>;
}

export class FindLocationPath {
    name?: Nullable<string>;
    _id: string;
    path?: Nullable<FindLocationPath>;
}

export class FindLocationData {
    _id: string;
    name: string;
    avatarRemoteId?: Nullable<string>;
    path?: Nullable<FindLocationPath>;
}

export class FindLocationPayload {
    data: Nullable<FindLocationData>[];
    cursor: string;
    hasNextPage: boolean;
}

export class GetSignedUrlSignaturesPayload {
    signatures?: Nullable<Nullable<Signature>[]>;
    hasNext: boolean;
    offset: number;
    limit: number;
    total: number;
}

export class SuggestedPremiumOrganization {
    _id?: Nullable<string>;
    name?: Nullable<string>;
    url?: Nullable<string>;
    avatarRemoteId?: Nullable<string>;
    domainVisibility?: Nullable<string>;
    paymentStatus?: Nullable<string>;
    paymentType?: Nullable<PaymentPlanSubscription>;
    paymentPeriod?: Nullable<PaymentPeriod>;
    joinStatus?: Nullable<JoinOrganizationStatus>;
    members?: Nullable<Nullable<MemberUserInfo>[]>;
    totalMember?: Nullable<number>;
    owner?: Nullable<User>;
    createdAt?: Nullable<Date>;
}

export class OneDriveTokenResponse {
    accessToken?: Nullable<string>;
    email?: Nullable<string>;
    expiredAt?: Nullable<Date>;
    oid?: Nullable<string>;
}

export class VerifyOrganizationInviteLinkPayload {
    _id: string;
    orgId: string;
    role: string;
    isAlreadyMember: boolean;
    orgUrl: string;
    isExpired: boolean;
}

export class TenantConfiguration {
    organization?: Nullable<OrganizationTenantRules>;
    files?: Nullable<FileTenantRules>;
    collaboration?: Nullable<CollaborationTenantRules>;
    external?: Nullable<ExternalTenantRules>;
    ui?: Nullable<UITenantRules>;
    user?: Nullable<UserTenantRules>;
}

export class TenantConfigurationWithDomain {
    domain?: Nullable<string>;
    configuration?: Nullable<TenantConfiguration>;
}

export class OrganizationTenantRules {
    requireDomainMembership?: Nullable<boolean>;
    autoJoinDomainOrg?: Nullable<boolean>;
    membershipScope?: Nullable<string>;
    allowOrgCreation?: Nullable<boolean>;
    orgAccessScope?: Nullable<string>;
    domainOrgId?: Nullable<string>;
}

export class FileTenantRules {
    service?: Nullable<string>;
    scope?: Nullable<string>;
    allowIndexing?: Nullable<boolean>;
    templateManagementEnabled?: Nullable<boolean>;
}

export class CollaborationTenantRules {
    inviteScope?: Nullable<string>;
    searchScope?: Nullable<string>;
}

export class ExternalTenantRules {
    canSearch?: Nullable<boolean>;
    canInvite?: Nullable<boolean>;
    canShare?: Nullable<boolean>;
    canJoinOrg?: Nullable<boolean>;
    canRequestDocs?: Nullable<boolean>;
}

export class UITenantRules {
    hidePromptDriveUsersBanner?: Nullable<boolean>;
    hideAiChatbot?: Nullable<boolean>;
}

export class UserTenantRules {
    allowChangeEmail?: Nullable<boolean>;
}

export class RubberStampProperty {
    bold?: Nullable<boolean>;
    italic?: Nullable<boolean>;
    strikeout?: Nullable<boolean>;
    underline?: Nullable<boolean>;
    title?: Nullable<string>;
    subtitle?: Nullable<string>;
    font?: Nullable<string>;
    color?: Nullable<string>;
    textColor?: Nullable<string>;
    timeFormat?: Nullable<string>;
    dateFormat?: Nullable<string>;
    author?: Nullable<string>;
}

export class UserAnnotation {
    _id: string;
    weight: number;
    ownerId: string;
    type?: Nullable<UserAnnotationType>;
    property?: Nullable<RubberStampProperty>;
    createdAt?: Nullable<Date>;
    updatedAt?: Nullable<Date>;
}

export class GetUserAnnotationResponse {
    total?: Nullable<number>;
    data?: Nullable<Nullable<UserAnnotation>[]>;
}

export class WidgetNotification {
    _id: string;
    userId: string;
    type: string;
    createdAt?: Nullable<string>;
    isPreviewed: boolean;
    isRead: boolean;
    updateAt: string;
    isNewWidget: boolean;
}

export class WidgetNotificationPayload {
    widgetList?: Nullable<Nullable<WidgetNotification>[]>;
}

export type Object = any;
export type Long = any;
export type StringOrInt = number | string;
export type Upload = any;
type Nullable<T> = T | null;
