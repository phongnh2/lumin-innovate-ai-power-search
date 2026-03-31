import { PERIOD } from 'constants/plan';
import { PaymentPlans, PaymentStatus } from 'constants/plan.enum';

import {
  IOrganization,
  JoinOrganizationStatus,
  SuggestedOrganization,
} from 'interfaces/organization/organization.interface';
import { OrganizationList } from 'interfaces/redux/organization.redux.interface';

const organizationName = 'Test Organization';

const mockOrganization = {
  _id: 'test-org-id',
  name: organizationName,
  createdAt: new Date(),
  avatarRemoteId: 'test-avatar-id',
  ownerId: 'test-owner',
  payment: {
    customerRemoteId: 'test-customer',
    subscriptionRemoteId: 'test-subscription-id',
    planRemoteId: 'test-plan',
    type: PaymentPlans.ORG_PRO,
    period: PERIOD.MONTHLY,
    status: PaymentStatus.TRIALING,
    quantity: 1,
    currency: 'USD',
    stripeAccountId: 'test-stripe-id',
    trialInfo: {
      highestTrial: 'PRO',
      endTrial: new Date(),
      canStartTrial: true,
      canUseStarterTrial: true,
      canUseProTrial: true,
      canUseBusinessTrial: true,
    },
  },
  billingEmail: 'test@example.com',
  url: 'test-org',
  domain: 'test.com',
  associateDomains: [],
  settings: {
    googleSignIn: false,
    autoApprove: false,
    passwordStrength: 'SIMPLE',
    templateWorkspace: 'PERSONAL',
    domainVisibility: 'INVITE_ONLY',
    inviteUsersSetting: 'ALL',
    autoUpgrade: false,
    other: {
      guestInvite: 'ALL',
      hideMember: false,
    },
  },
  convertFromTeam: false,
  creationType: 'MANUAL',
  unallowedAutoJoin: [],
  deletedAt: new Date(),
  isMigratedFromTeam: false,
  reachUploadDocLimit: false,
  userRole: 'OWNER',
  docStackStorage: {
    totalUsed: 0,
    totalStack: 0,
  },
  disableNearlyHitDocStack: false,
  hasPendingInvoice: false,
  teams: [],
  members: [],
} as IOrganization;

const mockSuggestedOrganization = {
  _id: 'test-suggested-org-id',
  name: 'Test Organization',
  avatarRemoteId: 'test-avatar-id',
  status: JoinOrganizationStatus.CAN_JOIN,

  // Optional org-level metadata (keep if your interface expects it)
  metadata: {
    isHiddenSuggestedOrganization: false,
  },

  billingEmail: 'suggested@example.com',
  url: 'test-suggested-org',
  domain: 'test-suggested.com',
  associateDomains: [],

  settings: {
    googleSignIn: false,
    autoApprove: false,
    passwordStrength: 'SIMPLE',
    templateWorkspace: 'PERSONAL',
    domainVisibility: 'INVITE_ONLY',
    inviteUsersSetting: 'ALL',
    autoUpgrade: false,
    other: {
      guestInvite: 'ALL',
      hideMember: false,
    },
  },

  convertFromTeam: false,
  creationType: 'MANUAL',
  unallowedAutoJoin: [],
  isMigratedFromTeam: false,

  owner: {
    _id: 'test-owner-id',
    name: 'Test Owner',
    email: 'owner@example.com',
    payment: {
      customerRemoteId: 'test-customer-id',
      subscriptionRemoteId: 'test-sub-id',
      planRemoteId: 'test-plan-id',
      type: PaymentPlans.ORG_PRO,
      period: PERIOD.MONTHLY,
      status: PaymentStatus.TRIALING,
      quantity: 1,
      currency: 'USD',
      stripeAccountId: 'test-stripe-id',
      trialInfo: {
        highestTrial: 'PRO',
        endTrial: new Date(),
        canStartTrial: true,
        canUseStarterTrial: true,
        canUseProTrial: true,
        canUseBusinessTrial: true,
      },
    },
    isOneDriveFilePickerWhitelisted: false,
    avatarRemoteId: 'test-owner-avatar',
    lastAccessedOrgUrl: 'test-org-url',
    setting: {
      defaultWorkspace: 'test-workspace',
    },

    // Expanded owner metadata
    metadata: {
      hasInformedMyDocumentUpload: false,
      docSummarizationConsentGranted: false,
      formFieldDetectionConsentGranted: false,
      introduceNewLayout: false,
      isHiddenSuggestedOrganization: false,
      hasShownEditInAgreementGenModal: false,
      hasShownSharePrompt: false,
      hasClosedQuickSearchGuideline: false,
      acceptedTermsOfUseVersion: '1.0.0',
      isFirstTimeRedactFromFLP: true,
      isFirstTimeSetPasswordFromFLP: true,
    },

    clientId: 'test-client-id',
    lastLogin: new Date(),
    deletedAt: new Date(),
    createdAt: new Date(),
    loginService: 'email',
    signatures: ['test-signature'],
    isOneDriveAddInsWhitelisted: false,
  },

  ownerId: 'test-owner-id',

  payment: {
    customerRemoteId: 'test-customer-id',
    subscriptionRemoteId: 'test-sub-id',
    planRemoteId: 'test-plan-id',
    type: PaymentPlans.ORG_PRO,
    period: PERIOD.MONTHLY,
    status: PaymentStatus.TRIALING,
    quantity: 1,
    currency: 'USD',
    stripeAccountId: 'test-stripe-id',
    trialInfo: {
      highestTrial: 'PRO',
      endTrial: new Date(),
      canStartTrial: true,
      canUseStarterTrial: true,
      canUseProTrial: true,
      canUseBusinessTrial: true,
    },
  },

  members: [],
  totalMember: 1,

  createdAt: new Date(),
  deletedAt: new Date(),
} as SuggestedOrganization;

const mockOrganizationList: OrganizationList = {
  loading: false,
  data: [
    {
      organization: {
        _id: 'test-org-id',
        name: organizationName,
        createdAt: new Date('2024-01-01'),
        avatarRemoteId: 'avatar-123',
        ownerId: 'owner-123',
        url: 'test-org',
        domain: 'test.com',
        associateDomains: ['test.com'],
        userRole: 'admin',
        // Add minimal required fields, omit optional ones for simplicity
      } as IOrganization,
      role: 'admin',
    },
    {
      organization: {
        _id: 'test-org-id-2',
        name: 'Another Organization',
        createdAt: new Date('2024-02-01'),
        avatarRemoteId: 'avatar-456',
        ownerId: 'owner-456',
        url: 'another-org',
        domain: 'another.com',
        associateDomains: ['another.com'],
        userRole: 'member',
      } as IOrganization,
      role: 'member',
    },
  ],
};

const mockSuggestedOrganizations: SuggestedOrganization[] = [
  {
    _id: 'org_0001',
    name: 'Acme Labs',
    avatarRemoteId: 'avatar_abc123',
    status: JoinOrganizationStatus.CAN_JOIN,
    totalMember: 12,
    createdAt: new Date('2024-11-15T10:00:00Z'),
    members: [],
  },
  {
    _id: 'org_0002',
    name: 'Globex Research',
    avatarRemoteId: 'avatar_def456',
    status: JoinOrganizationStatus.CAN_REQUEST,
    totalMember: 48,
    createdAt: new Date('2024-10-01T08:30:00Z'),
    members: [],
  },
  {
    _id: 'org_0003',
    name: 'Initech',
    avatarRemoteId: 'avatar_ghi789',
    status: JoinOrganizationStatus.PENDING_INVITE,
    totalMember: 7,
    createdAt: new Date('2025-01-05T14:45:00Z'),
    members: [],
  },
  {
    _id: 'org_0004',
    name: 'Umbrella Analytics',
    avatarRemoteId: 'avatar_jkl012',
    // @ts-expect-error: intentional test — status not part of JoinOrganizationStatus
    status: 'UNKNOWN',
    totalMember: 23,
    createdAt: new Date('2024-12-20T09:15:00Z'),
    members: [],
  },
  {
    _id: 'org_0005',
    name: 'Apex Robotics',
    avatarRemoteId: 'avatar_mno345',
    status: JoinOrganizationStatus.CAN_JOIN,
    totalMember: 31,
    createdAt: new Date('2024-09-10T12:00:00Z'),
    members: [],
  },
  {
    _id: 'org_0006',
    name: 'Pioneer Biotech',
    avatarRemoteId: 'avatar_pqr678',
    status: JoinOrganizationStatus.CAN_REQUEST,
    totalMember: 5,
    createdAt: new Date('2025-02-11T16:20:00Z'),
    members: [],
  },
  {
    _id: 'org_0007',
    name: 'Nova Dynamics',
    avatarRemoteId: 'avatar_stu901',
    status: JoinOrganizationStatus.PENDING_INVITE,
    totalMember: 64,
    createdAt: new Date('2024-08-25T07:05:00Z'),
    members: [],
  },
];

export { mockOrganization, mockSuggestedOrganization, mockOrganizationList, mockSuggestedOrganizations };
