import * as mongoose from 'mongoose';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { PaymentSchema, ReservePaymentSchema } from 'Common/schemas/payment.schema';

import { AvatarSuggestionSource, DomainVisibilitySetting } from 'graphql.schema';
import {
  OrganizationOtherSettingEnums,
  OrganizationPasswordStrengthEnums,
  TemplateWorkspaceEnum,
  InviteUsersSettingEnum,
  OrganizationPromotionEnum,
} from 'Organization/organization.enum';
import { PaymentPlanEnums } from 'Payment/payment.enum';

const SettingSchema = new mongoose.Schema({
  googleSignIn: {
    type: Boolean,
    default: false,
  },
  passwordStrength: {
    type: String,
    enum: OrganizationPasswordStrengthEnums,
    default: OrganizationPasswordStrengthEnums.SIMPLE,
  },
  templateWorkspace: {
    type: String,
    enum: TemplateWorkspaceEnum,
    default: TemplateWorkspaceEnum.ORGANIZATION,
  },
  domainVisibility: {
    type: String,
    enum: DomainVisibilitySetting,
    default: DomainVisibilitySetting.INVITE_ONLY,
  },
  autoUpgrade: {
    type: Boolean,
    default: false,
  },
  other: {
    guestInvite: {
      type: String,
      default: OrganizationOtherSettingEnums.ANYONE,
    },
  },
  inviteUsersSetting: {
    type: String,
    enum: InviteUsersSettingEnum,
    default: InviteUsersSettingEnum.ADMIN_BILLING_CAN_INVITE,
  },
}, { _id: false });

const MetadataSchema = new mongoose.Schema({
  firstUserJoinedManually: {
    type: Boolean,
    default: false,
  },
  firstMemberInviteCollaborator: {
    type: Boolean,
    default: false,
  },
  hasProcessedIndexingDocuments: {
    type: Boolean,
    default: false,
  },
  avatarSuggestion: {
    source: {
      type: String,
      enum: AvatarSuggestionSource,
    },
    suggestionAvatarRemoteId: {
      type: String,
      default: null,
    },
    suggestedAt: {
      type: Date,
    },
  },
  promotions: {
    type: [String],
    enum: OrganizationPromotionEnum,
    default: [],
  },
  promotionsClaimed: {
    type: [String],
    enum: OrganizationPromotionEnum,
    default: [],
  },
  promotionsOffered: {
    type: [String],
    enum: OrganizationPromotionEnum,
    default: [],
  },
}, { _id: false });

const SsoSchema = new mongoose.Schema({
  createdBy: mongoose.Schema.Types.ObjectId,
  ssoOrganizationId: String,
  samlSsoConnectionId: String,
  scimSsoClientId: {
    type: String,
    required: false,
  },
}, { _id: false });

const OrganizationSchema = new mongoose.Schema({
  name: String,
  ownerId: mongoose.Schema.Types.ObjectId,
  payment: {
    type: PaymentSchema,
    default: {
      type: PaymentPlanEnums.FREE,
    },
  },
  reservePayment: ReservePaymentSchema,
  metadata: {
    type: MetadataSchema,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  avatarRemoteId: {
    type: String,
    default: '',
  },
  billingEmail: String,
  url: {
    type: String,
    unique: true,
  },
  domain: {
    type: String,
    unique: true,
  },
  associateDomains: {
    type: [String],
    default: [],
    validate: [(val) => val.length <= 10, ErrorCode.Org.LIMIT_ASSOCIATE_DOMAIN],
  },
  settings: SettingSchema,
  unallowedAutoJoin: {
    type: [String],
    default: [],
  },
  creationType: {
    type: String,
    default: null,
  },
  deletedAt: Date,
  isMigratedFromTeam: Boolean,
  // This field have to be updated when payment of organization was updated
  docStackStartDate: {
    type: Date,
    default: Date.now,
  },
  purpose: {
    type: String,
    default: '',
  },
  premiumSeats: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  hashedIpAddresses: {
    type: [String],
  },
  sso: {
    type: SsoSchema,
    required: false,
  },
});

OrganizationSchema.index({ ownerId: 1 });
OrganizationSchema.index({ url: 1 });
OrganizationSchema.index({ name: 'text' });
OrganizationSchema.index({ createdAt: -1 });
OrganizationSchema.index({ 'payment.type': 1, createdAt: -1 });
OrganizationSchema.index({ associateDomains: 1, 'settings.domainVisibility': 1 });
OrganizationSchema.index({ domain: 1, 'settings.domainVisibility': 1 });
OrganizationSchema.index({ creationType: 1, createdAt: -1 });
OrganizationSchema.index({ isMigratedFromTeam: 1, createdAt: -1 }, { partialFilterExpression: { isMigratedFromTeam: true } });
OrganizationSchema.index({ domain: 1, associateDomains: 1 });
OrganizationSchema.index({ associateDomains: 1, 'payment.type': 1 });
OrganizationSchema.index({ 'sso.scimSsoClientId': 1 });
export default OrganizationSchema;
