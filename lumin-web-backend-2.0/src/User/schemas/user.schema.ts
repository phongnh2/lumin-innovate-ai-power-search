import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as mongoose from 'mongoose';

import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { ExploredFeaturesSchema } from 'Common/schemas/ExploredFeaturesSchema.schema';
import { PaymentSchema } from 'Common/schemas/payment.schema';
import { RatingSchema } from 'Common/schemas/rating.schema';
import { SettingSchema } from 'Common/schemas/setting.schema';

import { RatingModalStatus } from 'graphql.schema';
import { PaymentPlanEnums } from 'Payment/payment.enum';
import { UserOrigin } from 'User/user.enum';

const NewNotificationsSchema = new mongoose.Schema({
  general: Date,
  invites: Date,
  requests: Date,
}, { _id: false });

const UserSchema = new mongoose.Schema({
  identityId: String,
  email: String,
  /**
   * @deprecated We no longer store user password
 */
  password: String,
  name: String,
  isNotify: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  avatarRemoteId: {
    type: String,
    default: '',
  },
  payment: {
    type: PaymentSchema,
    default: {
      type: PaymentPlanEnums.FREE,
    },
  },
  setting: {
    type: SettingSchema,
    default: {},
  },
  timezoneOffset: Number,
  deletedAt: Date,
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  oldId: String, // Id of user from Lumin v1 database,
  appleUserId: String, // Unique id from Apple for mapping to email.
  signatures: {
    type: [String],
    default: [],
  },
  /**
   * @deprecated We no longer store user password
 */
  recentPasswords: {
    type: [String],
    default: [],
  },
  endTrial: Date,
  type: {
    type: String,
    default: 'normal',
  },
  metadata: {
    hasProcessedIndexingDocuments: {
      type: Boolean,
      default: false,
    },
    processedIndexingRecentDocuments: {
      type: [String],
      default: [],
    },
    hasShownTourGuide: Boolean,
    hasShownBananaBanner: Boolean,
    hasShownAutoSyncModal: Boolean,
    hasInformedMyDocumentUpload: {
      type: Boolean,
      default: false,
    },
    isMigratedPersonalDoc: {
      type: Boolean,
      default: false,
    },
    hasShownMobileFreeToolsBanner: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: RatingSchema,
      default: {
        googleModalStatus: RatingModalStatus.NEVER_INTERACT,
        mobileFeedbackModalStatus: {
          status: RatingModalStatus.NEVER_INTERACT,
        },
      },
    },
    folderColors: {
      type: [String],
      default: [],
    },
    numberCreatedOrg: {
      type: Number,
      default: 0,
      max: 20,
    },
    ratedApp: {
      type: Boolean,
      default: false,
    },
    hasShownEditFileOfflinePopover: {
      type: Boolean,
      default: false,
    },
    hasShownContentEditPopover: {
      type: Boolean,
      default: false,
    },
    hasShownAutoSyncDefault: {
      type: Boolean,
      default: false,
    },
    highestOrgPlan: {
      highestLuminPlan: String,
      highestLuminPlanStatus: String,
      highestLuminOrgRole: String,
    },
    isSyncedMarketingEmailSetting: {
      type: Boolean,
      default: false,
    },
    beRemovedFromDeletedOrg: {
      type: Boolean,
      default: false,
    },
    introduceNewLayout: {
      type: Boolean,
      default: true,
    },
    docSummarizationConsentGranted: {
      type: Boolean,
      default: false,
    },
    isHiddenSuggestedOrganization: {
      type: Boolean,
      default: false,
    },
    /**
     * @deprecated
     */
    isUsingNewLayout: {
      type: Boolean,
      default: null,
    },
    openGoogleReferrer: {
      type: [String],
      default: [],
    },
    formFieldDetectionConsentGranted: {
      type: Boolean,
      default: false,
    },
    exploredFeatures: {
      type: ExploredFeaturesSchema,
      default: () => ({}),
    },
    isUsingNewInAppLayout: {
      type: Boolean,
      default: null,
    },
    introduceNewInAppLayout: {
      type: Boolean,
      default: true,
    },
    hasShowOnboardingFlowFromOpenGoogle: {
      type: Boolean,
      default: false,
    },
    isAgreementTourGuideVisible: {
      type: Boolean,
      default: true,
    },
    /**
     * @description Tracks the number of free chatbot requests used by the user across their lifetime.
     * This counter increments each time a user makes a chatbot request when they don't have a paid plan
     * or when interacting with shared documents. Used to enforce free usage limits.
     */
    chatbotFreeRequests: {
      type: Number,
      default: 0,
    },
    hasShownEditInAgreementGenModal: {
      type: Boolean,
      default: false,
    },
    hasShownSharePrompt: {
      type: Boolean,
      default: false,
    },
    hasSyncedEmailToBraze: {
      type: Boolean,
      default: false,
    },
    hasClosedQuickSearchGuideline: {
      type: Boolean,
      default: false,
    },
    hasSyncedOidcAvatar: {
      type: Boolean,
      default: false,
    },
    acceptedTermsOfUseVersion: {
      type: String,
      default: null,
    },
  },
  lastAccess: {
    type: Date,
    default: Date.now,
  },
  loginService: {
    type: String,
    default: '',
  },
  origin: {
    type: String,
    default: UserOrigin.LUMIN,
  },
  emailDomain: {
    type: String,
    default() {
      return this.email.split('@')[1];
    },
  },
  /** Version user for show modal new feature */
  version: {
    type: String,
    default: '0',
  },
  newNotifications: {
    type: NewNotificationsSchema,
    default: () => ({}),
  },
  googleRefreshToken: String, // stored on backend only, not return to client
  previousLoginService: {
    type: String,
    required: false,
  },
});

/**
 * @deprecated
 */
function comparePassword(candidatePassword: string): Promise<boolean> {
  const candidatePasswordsha256 = crypto
    .createHash('sha256')
    .update(candidatePassword)
    .digest('hex');
  return bcrypt
    .compare(`${candidatePasswordsha256}`, this.password as string)
    .catch(() => {
      throw GraphErrorException.BadRequest('Error validating password');
    });
}

UserSchema.methods.comparePassword = comparePassword;
UserSchema.index({ email: 1 });
UserSchema.index({ identityId: 1 }, { unique: true, sparse: true });
UserSchema.index({ oldId: 1 });
UserSchema.index({ appleUserId: 1 });
UserSchema.index({ name: 'text' });
UserSchema.index({ 'payment.customerRemoteId': 1 });
UserSchema.index({ deletedAt: -1, createdAt: -1 }, { partialFilterExpression: { deletedAt: { $type: 'date' } } });
UserSchema.index({ isVerified: -1, createdAt: -1 }, { partialFilterExpression: { isVerified: false } });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ emailDomain: 1, createdAt: -1 });
UserSchema.index({ 'payment.type': 1 });

export { UserSchema };
