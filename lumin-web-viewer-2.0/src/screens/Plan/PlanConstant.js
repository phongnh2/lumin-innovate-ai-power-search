import { Plans } from 'constants/plan';

const UNLIMITED_EDITING_FEATURES = 'payment.unlimitedEditingFeatures';
const ORGANIZATION_INSIGHTS = 'payment.orgInsights';
const UNLIMIT_INVITE_MEMBER = 'payment.inviteUnlimitedMembers';
const EDIT_PDF_CONTENT = 'payment.editPDFContent';
const SPLIT_MERGE = 'payment.splitMergeUnlimitedDocuments';
const FILLABLE_FIELD = 'payment.addFillableFields';
const REDACTION = 'payment.redactUnlimitedDocuments';
const TEAM_MANAGEMENT = 'payment.createAndManageTeams';
const UNLIMITED_UPLOADS = 'payment.unlimitedUploads';
const UNLIMITED_ESIGNATURES = 'payment.unlimitedESignatures';
const DEDICATED_ACCOUNT_MANAGER = 'payment.dedicatedAccountManager';
const PREMIUM_MAIL_SUPPORT = 'payment.priorityEmailSupport';

const BUSINESS_FEATURES = [
  UNLIMITED_EDITING_FEATURES,
  TEAM_MANAGEMENT,
  UNLIMITED_UPLOADS,
  ORGANIZATION_INSIGHTS,
  UNLIMITED_ESIGNATURES,
  DEDICATED_ACCOUNT_MANAGER,
  PREMIUM_MAIL_SUPPORT,
];

const ORG_START_FEATURES = [UNLIMITED_EDITING_FEATURES, UNLIMIT_INVITE_MEMBER];

const ORG_PRO_FEATURES = [EDIT_PDF_CONTENT, SPLIT_MERGE, ORGANIZATION_INSIGHTS];

const ORG_BUSINESS_FEATURES = [FILLABLE_FIELD, EDIT_PDF_CONTENT, REDACTION, SPLIT_MERGE];

const FEATURES = {
  [Plans.BUSINESS]: BUSINESS_FEATURES,
  [Plans.ORG_STARTER]: ORG_START_FEATURES,
  [Plans.ORG_PRO]: ORG_PRO_FEATURES,
  [Plans.ORG_BUSINESS]: ORG_BUSINESS_FEATURES,
};

export { FEATURES };
